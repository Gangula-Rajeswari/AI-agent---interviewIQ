import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";


export const analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Resume required" });
        }

        const filepath = req.file.path;

        const fileBuffer = await fs.promises.readFile(filepath);
        const uint8Array = new Uint8Array(fileBuffer);

        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

        let resumeText = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            resumeText += content.items.map(item => item.str).join(" ") + " ";
        }

        resumeText = resumeText.replace(/\s+/g, " ").trim();

        const messages = [
            {
                role: "system",
                content: `
Extract structured data from resume.
Return ONLY valid JSON:
{
  "role": "",
  "experience": "",
  "projects": [],
  "skills": []
}`
            },
            {
                role: "user",
                content: resumeText
            }
        ];

        const aiResponse = await askAi(messages);

        let parsed = {};

        try {
            const clean = aiResponse
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            parsed = JSON.parse(clean);
        } catch (err) {
            return res.status(500).json({
                message: "AI response parsing failed"
            });
        }

        fs.unlinkSync(filepath);

        return res.json({
            role: parsed.role || "",
            experience: parsed.experience || "",
            projects: parsed.projects || [],
            skills: parsed.skills || [],
            resumeText
        });

    } catch (error) {
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            message: error.message
        });
    }
};


export const generateQuestion = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Unauthorized user"
            });
        }

        let { role, experience, mode, resumeText, projects, skills } = req.body;

        role = role?.trim();
        experience = experience?.trim();
        mode = mode?.trim();

        if (!role || !experience || !mode) {
            return res.status(400).json({
                message: "Role, Experience and Mode required"
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.credits < 50) {
            return res.status(400).json({
                message: "Not enough credits"
            });
        }

        const projectText = Array.isArray(projects) ? projects.join(", ") : "None";
        const skillsText = Array.isArray(skills) ? skills.join(", ") : "None";
        const safeResume = resumeText?.trim() || "None";

        const prompt = `
Role: ${role}
Experience: ${experience}
Mode: ${mode}
Projects: ${projectText}
Skills: ${skillsText}
Resume: ${safeResume}
`;

        const messages = [
            {
                role: "system",
                content: `
Generate 5 interview questions.
- No numbering
- One line each
- Natural English
`
            },
            {
                role: "user",
                content: prompt
            }
        ];

        const aiResponse = await askAi(messages);

        if (!aiResponse || !aiResponse.trim()) {
            return res.status(500).json({
                message: "AI returned empty response"
            });
        }

        const questionsArray = aiResponse
            .split("\n")
            .map(q => q.trim())
            .filter(Boolean)
            .slice(0, 5);

        if (questionsArray.length === 0) {
            return res.status(500).json({
                message: "Failed to generate questions"
            });
        }

        user.credits -= 50;
        await user.save();

        const interview = await Interview.create({
            userId: user._id,
            role,
            experience,
            mode,
            resumeText: safeResume,
            questions: questionsArray.map((q, i) => ({
                question: q,
                difficulty: ["easy", "easy", "medium", "medium", "hard"][i],
                timeLimit: [60, 60, 90, 90, 120][i]
            }))
        });

        return res.json({
            interviewId: interview._id,
            creditsLeft: user.credits,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                credits: user.credits
            },

            questions: interview.questions
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

export const submitAnswer = async (req, res) => {
    try {
        const { interviewId, questionIndex, answer, timeTaken } = req.body;

        const interview = await Interview.findById(interviewId);

        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        if (!interview.questions[questionIndex]) {
            return res.status(400).json({
                message: "Invalid question index"
            });
        }

        const question = interview.questions[questionIndex];

        // ❌ Empty Answer
        if (!answer || answer.trim() === "") {
            question.answer = ""; // ✅ ADD THIS
            question.score = 0;
            question.feedback = "No answer submitted";

            await interview.save();

            return res.json({
                answer: "",
                confidence: 0,
                communication: 0,
                correctness: 0,
                score: 0,
                feedback: question.feedback
            });
        }


        if (timeTaken > question.timeLimit) {
            question.score = 0;
            question.feedback = "Time limit exceeded";
            question.answer = answer;

            await interview.save();

            return res.json({
                answer,
                confidence: 0,
                communication: 0,
                correctness: 0,
                score: 0,
                feedback: question.feedback
            });
        }

        const messages = [
            {
                role: "system",
                content: `
Return JSON:
{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short feedback"
}`
            },
            {
                role: "user",
                content: `Question: ${question.question}\nAnswer: ${answer}`
            }
        ];

        const aiResponse = await askAi(messages);

        let parsed = {};

        try {
            const clean = aiResponse
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            parsed = JSON.parse(clean);
        } catch (err) {
            return res.status(500).json({
                message: "AI response parsing failed"
            });
        }
        const rawScore = parsed.finalScore || 0;

        // 🔥 NORMALIZE SCORE (important)
        let normalizedScore = 0;

        if (rawScore > 25) {
            // AI returned 0–100 → convert to 0–25
            normalizedScore = (rawScore / 100) * 25;
        } else {
            // already in 0–25
            normalizedScore = rawScore;
        }

        Object.assign(question, {
            answer,
            confidence: parsed.confidence || 0,
            communication: parsed.communication || 0,
            correctness: parsed.correctness || 0,
            score: normalizedScore,   // ✅ FIXED
            feedback: parsed.feedback || ""
        });

        await interview.save();

        // ✅ RETURN FULL DATA
        return res.json({
            answer,
            confidence: parsed.confidence || 0,
            communication: parsed.communication || 0,
            correctness: parsed.correctness || 0,
            score: Math.min((normalizedScore / 25) * 10, 10) || 0,
            feedback: parsed.feedback || ""
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

export const finishInterview = async (req, res) => {
    try {
        const { interviewId } = req.body;

        const interview = await Interview.findById(interviewId);

        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        const total = interview.questions.length || 1;

        let score = 0, confidence = 0, communication = 0, correctness = 0;

        interview.questions.forEach(q => {
            score += q.score || 0;
            confidence += q.confidence || 0;
            communication += q.communication || 0;
            correctness += q.correctness || 0;
        });

        
        const finalScore = Math.min((score / total / 25) * 10, 10);

        // ✅ SAVE IMPORTANT DATA
        interview.finalScore = Number(finalScore.toFixed(1));
        interview.status = "completed";

        await interview.save();

        return res.json({
            finalScore: interview.finalScore,
            confidence: confidence / total,
            communication: communication / total,
            correctness: correctness / total,
            questionWiseScore: interview.questions
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getMyInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ userId: req.userId })
            .sort({ createdAt: -1 });

        const updated = interviews.map(interview => {

            const total = interview.questions.length || 1;

            let sum = 0;
            interview.questions.forEach(q => {
                let score = q.score || 0;

                // convert 0–25 → 0–10
                let converted = score <= 10 ? score : (score / 25) * 10;

                sum += converted;
            });

            const finalScore = sum / total;

            return {
                _id: interview._id,
                role: interview.role,
                experience: interview.experience,
                mode: interview.mode,
                createdAt: interview.createdAt,
                status: "completed", // ✅ force correct
                finalScore: Number(finalScore.toFixed(1))
            };
        });

        return res.status(200).json(updated);

    } catch (error) {
        return res.status(500).json({
            message: `failed to find currentUser Interview ${error}`
        });
    }
};
export const getInterviewReport = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        const totalQuestions = interview.questions.length || 1;

        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness = 0;

        interview.questions.forEach((q) => {
            totalConfidence += q.confidence || 0;
            totalCommunication += q.communication || 0;
            totalCorrectness += q.correctness || 0;
        });

        const avgConfidence = totalConfidence / totalQuestions;
        const avgCommunication = totalCommunication / totalQuestions;
        const avgCorrectness = totalCorrectness / totalQuestions;

        const finalScore =
            (avgConfidence + avgCommunication + avgCorrectness) / 3;

        return res.json({
            finalScore: Number(finalScore.toFixed(1)),
            confidence: Number(avgConfidence.toFixed(1)),
            communication: Number(avgCommunication.toFixed(1)),
            correctness: Number(avgCorrectness.toFixed(1)),
            questionWiseScore: interview.questions
        });

    } catch (error) {
        return res.status(500).json({
            message: `Failed to fetch report: ${error.message}`
        });
    }
};


