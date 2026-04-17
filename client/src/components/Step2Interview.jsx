import React, { useState, useRef, useEffect } from 'react';
import maleVideo from "../assets/videos/male-ai.mp4";
import femaleVideo from "../assets/videos/female-ai.mp4";
import Timer from './Timer';
import { motion } from "framer-motion";
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import axios from "axios";
import { BsArrowRight } from 'react-icons/bs';

function Step2Interview({ interviewData, onFinish }) {

  const questions = interviewData?.questions || [];
  const userName = interviewData?.userName || "User";
  const interviewId = interviewData?.interviewId;

  const ServerUrl = "http://localhost:8000";

  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const recognitionRef = useRef(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isAIPlaying, setIsAIPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timeLeft, setTimeLeft] = useState(60);

  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");


  const videoRef = useRef(null);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    console.log("Step2 DATA:", interviewData);
    console.log("QUESTIONS:", questions);
  }, []);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      if (!voices.length) return;

      const female = voices.find(v =>
        v.name.toLowerCase().includes("zira") ||
        v.name.toLowerCase().includes("female")
      );

      const male = voices.find(v =>
        v.name.toLowerCase().includes("david") ||
        v.name.toLowerCase().includes("male")
      );

      if (female) {
        setSelectedVoice(female);
        setVoiceGender("female");
      } else if (male) {
        setSelectedVoice(male);
        setVoiceGender("male");
      } else {
        setSelectedVoice(voices[0]);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const utter = new SpeechSynthesisUtterance(text);
      utter.voice = selectedVoice;
      utter.rate = 0.95;

      utter.onstart = () => {
        setIsAIPlaying(true);
        stopMic();
        videoRef.current?.play();
      };

      utter.onend = () => {
        setIsAIPlaying(false);
        videoRef.current?.pause();
        if (videoRef.current) videoRef.current.currentTime = 0;

        setTimeout(() => {
          setSubtitle("");
          if (isMicOn) startMic();
          resolve();
        }, 300);
      };

      setSubtitle(text);
      window.speechSynthesis.speak(utter);
    });
  };

  
  useEffect(() => {
    if (!selectedVoice || questions.length === 0) return;

    const run = async () => {
      if (isIntroPhase) {
        await speakText(`Hi ${userName}, welcome to your AI interview.`);
        await speakText("Answer confidently. Let's begin.");
        setIsIntroPhase(false);
      } else if (currentQuestion) {
        await new Promise(r => setTimeout(r, 500));
        await speakText(currentQuestion.question);
      }
    };

    run();
  }, [selectedVoice, isIntroPhase, currentIndex, questions]);

  useEffect(() => {
    if (currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
      setAnswer("");
      setFeedback("");
    }
  }, [currentIndex, currentQuestion]);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (isIntroPhase || !currentQuestion || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isIntroPhase, currentQuestion, isSubmitting]);


  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const rec = new window.webkitSpeechRecognition();
    rec.continuous = true;
    rec.lang = "en-US";

    rec.onresult = (e) => {
      const text = e.results[e.results.length - 1][0].transcript;
      setAnswer(prev => prev + " " + text);
    };

    recognitionRef.current = rec;
  }, []);

  const startMic = () => {
    if (!isAIPlaying) {
      try { recognitionRef.current?.start(); } catch { }
    }
  };

  const stopMic = () => {
    try { recognitionRef.current?.stop(); } catch { }
  };

  const toggleMic = () => {
    if (isMicOn) stopMic();
    else startMic();

    setIsMicOn(!isMicOn);
  };


  const submitAnswer = async () => {
    if (isSubmitting || !currentQuestion) return;

    stopMic();
    setIsSubmitting(true);

    try {
      const res = await axios.post(
        ServerUrl + "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken: (currentQuestion.timeLimit || 60) - timeLeft,
        },
        { withCredentials: true }
      );

      setFeedback(res.data.feedback || "Good answer!");
      await speakText(res.data.feedback || "Good answer!");

    } catch (err) {
      console.log(" SUBMIT ERROR:", err.response?.data || err.message);
      setFeedback("Error submitting answer");
    }

    setIsSubmitting(false);

    if (currentIndex + 1 >= questions.length) {
      setTimeout(async () => {
        await finishInterview();
      }, 500);
      return;
    }
  };

  const handleNext = async () => {
    if (currentIndex + 1 >= questions.length) {
      await finishInterview();
      return;
    }
    await speakText("Next question");
    setCurrentIndex(prev => prev + 1);
  };


  const finishInterview = async () => {
    stopMic();

    try {
      const res = await axios.post(
        ServerUrl + "/api/interview/finish",
        { interviewId },
        { withCredentials: true }
      );

      console.log("🔥 FINAL RESULT:", res.data);
      onFinish(res.data);

    } catch (err) {
      console.log(" FINISH ERROR:", err.response?.data || err.message);
    }
  };

  
  useEffect(() => {
    if (isIntroPhase) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis.cancel();
    };
  }, []);


  if (!questions.length) {
    return <div className="text-center mt-20">Loading Interview...</div>;
  }


  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6'>

      <div className='w-full max-w-6xl min-h-[85vh] bg-white rounded-3xl shadow-2xl border flex flex-col lg:flex-row overflow-hidden'>

        {/* LEFT SIDE */}
        <div className='w-full lg:w-[35%] flex flex-col p-6 space-y-6 border-r'>

          <div className='rounded-2xl overflow-hidden shadow-lg'>
            <video
              src={videoSource}
              ref={videoRef}
              muted
              playsInline
              className='w-full h-auto object-cover'
            />
          </div>

          {subtitle && (
            <div className='bg-gray-50 border rounded-xl p-4 shadow-sm'>
              <p className='text-gray-700 text-sm text-center'>
                {subtitle}
              </p>
            </div>
          )}

          <div className='border rounded-2xl p-5 space-y-4 shadow-md'>

            <div className='flex justify-between text-sm'>
              <span className='text-gray-500'>Interview Status</span>
              <span className='text-emerald-600 font-semibold'>
                {isAIPlaying ? "AI Speaking" : "Listening"}
              </span>
            </div>

            <div className='h-px bg-gray-200'></div>

            <div className='flex justify-center'>
              <Timer
                timeLeft={timeLeft}
                totalTime={currentQuestion?.timeLimit || 60}
              />
            </div>

            <div className='h-px bg-gray-200'></div>

            <div className='flex justify-between text-center'>
              <div>
                <p className='text-xl font-bold text-emerald-600'>
                  {currentIndex + 1}
                </p>
                <p className='text-xs text-gray-400'>Current</p>
              </div>

              <div>
                <p className='text-xl font-bold text-emerald-600'>
                  {questions.length}
                </p>
                <p className='text-xs text-gray-400'>Total</p>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className='flex-1 flex flex-col p-6'>

          <h2 className='text-2xl font-bold text-emerald-600 mb-4'>
            AI Smart Interview
          </h2>

          {!isIntroPhase && (
            <div className='bg-gray-50 p-5 rounded-2xl border mb-4'>
              <p className='text-sm text-gray-400'>
                Question {currentIndex + 1} of {questions.length}
              </p>
              <p className='text-lg font-semibold'>
                {currentQuestion?.question}
              </p>
            </div>
          )}

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className='flex-1 bg-gray-100 p-5 rounded-2xl border outline-none resize-none'
            placeholder='Type your answer here...'
          />

          {!feedback ? (
            <div className='flex items-center gap-4 mt-4'>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleMic}
                className='w-12 h-12 bg-black text-white rounded-full flex items-center justify-center'
              >
                {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
              </motion.button>

              <motion.button
                onClick={submitAnswer}
                disabled={isSubmitting}
                className='flex-1 bg-emerald-600 text-white py-3 rounded-2xl font-semibold'
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </motion.button>

            </div>
          ) : (
            <div className='mt-6 bg-emerald-50 border p-5 rounded-2xl shadow-sm'>

              <p className='text-emerald-700 font-medium mb-4'>
                {feedback}
              </p>

              <button
                onClick={handleNext}
                className='w-full bg-emerald-600 text-white py-3 rounded-xl flex items-center justify-center gap-2'
              >
                Next Question <BsArrowRight />
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );

}

export default Step2Interview;