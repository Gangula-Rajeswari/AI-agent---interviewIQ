import React, { useState } from 'react';
import { motion } from "framer-motion";
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { ServerUrl } from '../App.jsx';
import {
    FaUserTie,
    FaFileUpload,
    FaMicrophoneAlt,
    FaChartLine
} from "react-icons/fa";
import { setUserData } from '../redux/userSlice.js';

function Step1SetUp({ onStart }) {
    const { userData } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [role, setRole] = useState("");
    const [experience, setExperience] = useState("");
    const [mode, setMode] = useState("Technical");
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [resumeText, setResumeText] = useState("");

    const [analysisDone, setAnalysisDone] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);



    // ANALYZE RESUME
    const handleUploadResume = async () => {
        if (!resumeFile) {
            alert("Please upload resume first");
            return;
        }

        if (analyzing) return;

        setAnalyzing(true);

        const formdata = new FormData();
        formdata.append("resume", resumeFile);

        try {
            const result = await axios.post(
                `${ServerUrl}/api/interview/resume`,
                formdata,
                { withCredentials: true }
            );

            setRole(result.data.role || "");
            setExperience(result.data.experience || "");
            setProjects(result.data.projects || []);
            setSkills(result.data.skills || []);
            setResumeText(result.data.resumeText || "");

            setAnalysisDone(true);

            console.log("FULL RESPONSE:", result);
            console.log("DATA:", result.data);
            console.log("EXTRACTED DATA:", result.data.data || result.data);
        } catch (error) {
            console.log("ERROR:", error.response?.data || error.message);
        } finally {
            setAnalyzing(false);
        }
    };
    const handleStart = async () => {
        setLoading(true);

        try {
            const payload = {
                role,
                experience,
                mode,
                resumeText,
                projects,
                skills
            };

            console.log("SENDING PAYLOAD:", payload);

            const result = await axios.post(
                `${ServerUrl}/api/interview/generate-questions`,
                payload,
                { withCredentials: true }
            );

            console.log("FULL RESPONSE:", result.data);

            // ✅ PRINT REQUIRED DATA
            console.log("USERNAME:", result.data.user?.name);
            console.log("INTERVIEW ID:", result.data.interviewId);
            console.log("CREDITS:", result.data.creditsLeft);
            console.log("QUESTIONS:", result.data.questions);

            // update redux credits
            if (userData) {
                dispatch(setUserData({
                    ...userData,
                    credits: result.data.creditsLeft
                }));
            }

            onStart({
                questions: result.data.questions,
                userName: result.data.user?.name || "User",
                interviewId: result.data.interviewId
            });

        } catch (error) {
            console.log("START ERROR:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='min-h-screen flex items-center justify-center bg-gray-100 px-4'
        >
            <div className='w-full max-w-6xl bg-white rounded-3xl shadow-xl grid md:grid-cols-2 overflow-hidden'>


                <div className='bg-green-50 p-12 flex flex-col justify-center'>
                    <h2 className='text-4xl font-bold mb-6'>
                        Start Your AI Interview
                    </h2>

                    <p className='text-gray-600 mb-10'>
                        Practice real interview scenarios powered by AI.
                    </p>

                    <div className='space-y-4'>
                        <div className='flex items-center gap-3'>
                            <FaUserTie className='text-green-600' />
                            <span>Choose Role & Experience</span>
                        </div>

                        <div className='flex items-center gap-3'>
                            <FaMicrophoneAlt className='text-green-600' />
                            <span>Voice Interview</span>
                        </div>

                        <div className='flex items-center gap-3'>
                            <FaChartLine className='text-green-600' />
                            <span>Performance Analytics</span>
                        </div>
                    </div>
                </div>


                <div className='p-12'>
                    <h2 className='text-2xl font-bold mb-6'>Interview Setup</h2>

                    <div className='space-y-5'>

                        <input
                            type='text'
                            placeholder='Enter role'
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className='w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none'
                        />

                        <input
                            type='text'
                            placeholder='Experience (e.g. 2 years)'
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            className='w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none'
                        />

                        <select
                            value={mode}
                            onChange={(e) => setMode(e.target.value)}
                            className='w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none'
                        >
                            <option value="Technical">Technical Interview</option>
                            <option value="HR">HR Interview</option>
                        </select>


                        {!analysisDone && (
                            <div
                                onClick={() => document.getElementById("resumeUpload").click()}
                                className='border-2 border-dashed p-6 rounded-xl text-center cursor-pointer hover:bg-green-50'
                            >
                                <FaFileUpload className='mx-auto text-3xl mb-2 text-green-600' />

                                <input
                                    type="file"
                                    accept="application/pdf"
                                    id="resumeUpload"
                                    className='hidden'
                                    onChange={(e) => setResumeFile(e.target.files[0])}
                                />

                                <p className='text-gray-600 font-medium'>
                                    {resumeFile ? resumeFile.name : "Upload Resume"}
                                </p>

                                {resumeFile && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation(); 
                                            handleUploadResume();
                                        }}
                                        className='mt-4 bg-black text-white px-4 py-2 rounded-lg'
                                    >
                                        {analyzing ? "Analyzing..." : "Analyze Resume"}
                                    </button>

                                )}
                            </div>
                        )}


                        {analysisDone && (
                            <div className="bg-gray-50 border rounded-xl p-5 space-y-4">

                                <h3 className="font-semibold">Resume Analysis Result</h3>

                                <div>
                                    <p className='font-medium'>Projects:</p>
                                    {projects.length > 0 ? (
                                        <ul className='list-disc ml-5'>
                                            {projects.map((p, i) => (
                                                <li key={i}>
                                                    {typeof p === "object" ? p.name : String(p)}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-400">No projects found</p>
                                    )}
                                </div>

                                <div>
                                    <p className='font-medium'>Skills:</p>
                                    {skills.length > 0 ? (
                                        <div className='flex flex-wrap gap-2'>
                                            {skills.map((s, i) => (
                                                <span
                                                    key={i}
                                                    className='bg-green-100 text-green-700 px-2 py-1 rounded'
                                                >
                                                    {typeof s === "object" ? s.name : String(s)}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-400">No skills found</p>
                                    )}
                                </div>

                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleStart}
                            disabled={!role || !experience}
                            className='w-full bg-green-600 text-white py-3 rounded-full disabled:bg-gray-400 hover:bg-green-700'
                        >
                            {loading ? "Starting..." : "Start Interview"}
                        </button>

                    </div>
                </div>

            </div>
        </motion.div>
    );
}

export default Step1SetUp;
