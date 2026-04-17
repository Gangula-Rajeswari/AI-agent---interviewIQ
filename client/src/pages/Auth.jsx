import React, { useState } from "react";
import { BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import { ServerUrl } from "../App";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

function Auth({ isModel = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);


      const response = await signInWithPopup(auth, provider);

      const firebaseUser = response.user;

      const name = firebaseUser.displayName;
      const email = firebaseUser.email;

      const result = await axios.post(
        `${ServerUrl}/api/auth/google`,
        { name, email },
        { withCredentials: true }
      );

      console.log("LOGIN RESPONSE:", result.data);


      dispatch(setUserData(result.data.user));

      navigate("/");

    } catch (error) {
      console.log("LOGIN ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`
      w-full
      ${isModel
          ? "py-4"
          : "min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-6 py-20"
        }
    `}
    >
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className={`
          w-full
          ${isModel
            ? "max-w-md p-8 rounded-3xl"
            : "max-w-lg p-12 rounded-[32px]"
          }
          bg-white shadow-2xl border border-gray-200
        `}
      >
        {/* LOGO */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-black text-white p-2 rounded-lg">
            <BsRobot size={18} />
          </div>
          <h2 className="font-semibold text-lg">InterviewIQ.AI</h2>
        </div>

        {/* TITLE */}
        <h1 className="text-2xl md:text-3xl font-semibold text-center leading-snug mb-4">
          Continue with{" "}
          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2">
            <IoSparkles size={16} />
            AI Smart Interview
          </span>
        </h1>

        {/* DESCRIPTION */}
        <p className="text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8">
          Sign in to start AI-powered mock interviews, track your progress, and
          unlock detailed performance insights.
        </p>

        {/* GOOGLE BUTTON */}
        <motion.button
          onClick={handleGoogleAuth}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md hover:bg-gray-900 transition"
        >
          <FcGoogle size={20} />
          {loading ? "Signing in..." : "Continue with Google"}
        </motion.button>

        {/* FOOTER */}
        <p className="text-xs text-gray-400 text-center mt-6">
          Secure login powered by Google 🔐
        </p>
      </motion.div>
    </div>
  );
}

export default Auth;