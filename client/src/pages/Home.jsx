
import React, { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AuthModel from "../components/AuthModel.jsx";

// icons
import {
  HiSparkles,
  HiOutlineClock,
  HiOutlineMicrophone,
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineUser,
} from "react-icons/hi";

// images
import evalImg from "../assets/ai-ans.png";
import hrImg from "../assets/HR.png";
import confidenceImg from "../assets/confi.png";
import creditImg from "../assets/credit.png";
import techImg from "../assets/tech.png";
import resumeImg from "../assets/resume.png";
import pdfImg from "../assets/pdf.png";
import analyticsImg from "../assets/history.png";

function Home() {
  const { userData } = useSelector((state) => state.user);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col">

      <Navbar />

      {/* HERO SECTION */}
      <div className="flex-1 px-6 py-20">
        <div className="max-w-6xl mx-auto">

          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 text-gray-600 text-sm px-5 py-2 rounded-full flex items-center gap-2 shadow-sm">
              <HiSparkles size={16} className="text-green-600" />
              AI Powered Smart Interview Platform
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-20">

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-semibold leading-tight max-w-4xl mx-auto"
            >
              Practice Interviews with{" "}
              <span className="bg-green-100 text-green-600 px-5 py-1 rounded-full">
                AI Intelligence
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 mt-6 max-w-2xl mx-auto text-lg"
            >
              Role-based mock interviews with smart follow-ups, voice interaction, and real-time evaluation.
            </motion.p>

            {/* Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mt-10">

              <button
                onClick={() => {
                  if (!userData) return setShowAuth(true);
                  navigate("/interview");
                }}
                className="bg-black text-white px-10 py-3 rounded-full hover:scale-105 transition"
              >
                Start Interview
              </button>

              <button
                onClick={() => {
                  if (!userData) return setShowAuth(true);
                  navigate("/history");
                }}
                className="border px-10 py-3 rounded-full hover:bg-gray-100 transition"
              >
                View History
              </button>

            </div>
          </div>

          {/* STEPS */}
          <div className="grid md:grid-cols-3 gap-8 mb-28">

            {[
              {
                icon: <HiOutlineUser size={26} />,
                step: "STEP 1",
                title: "Role Selection",
                desc: "AI adjusts difficulty based on role."
              },
              {
                icon: <HiOutlineMicrophone size={26} />,
                step: "STEP 2",
                title: "Voice Interview",
                desc: "Dynamic AI follow-up questions."
              },
              {
                icon: <HiOutlineClock size={26} />,
                step: "STEP 3",
                title: "Timer Mode",
                desc: "Real interview pressure simulation."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-3xl border p-8 shadow-sm text-center"
              >
                <div className="text-green-600 flex justify-center mb-2">
                  {item.icon}
                </div>
                <div className="text-xs text-green-600">
                  {item.step}
                </div>
                <h3 className="font-semibold mt-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {item.desc}
                </p>
              </motion.div>
            ))}

          </div>

          {/* FEATURES */}
          <div className="grid md:grid-cols-2 gap-8 mb-32">

            {[
              {
                image: evalImg,
                icon: <HiOutlineChartBar size={20} />,
                title: "AI Evaluation",
                desc: "Scores communication, accuracy, confidence."
              },
              {
                image: resumeImg,
                icon: <HiOutlineDocumentText size={20} />,
                title: "Resume Based Interview",
                desc: "Questions generated from resume."
              },
              {
                image: pdfImg,
                icon: <HiOutlineDocumentText size={20} />,
                title: "PDF Reports",
                desc: "Download performance report instantly."
              },
              {
                image: analyticsImg,
                icon: <HiOutlineChartBar size={20} />,
                title: "Analytics",
                desc: "Track your improvement over time."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03 }}
                className="bg-white p-6 rounded-3xl border shadow-sm"
              >
                <img
                  src={item.image}
                  className="rounded-xl mb-4 w-full h-48 object-cover"
                />

                <div className="flex items-center gap-2 text-green-600">
                  {item.icon}
                  <h3 className="font-semibold text-black">
                    {item.title}
                  </h3>
                </div>

                <p className="text-gray-500 text-sm mt-1">
                  {item.desc}
                </p>
              </motion.div>
            ))}

          </div>

        </div>
      </div>

      {/* AUTH MODAL */}
      {showAuth && (
        <AuthModel onClose={() => setShowAuth(false)} />
      )}

    </div>
  );
}

export default Home;

