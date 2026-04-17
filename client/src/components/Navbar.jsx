import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from "framer-motion";
import { BsRobot, BsCoin } from 'react-icons/bs';
import { HiOutlineLogout } from 'react-icons/hi';
import { FaUserAstronaut } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { ServerUrl } from '../App';
import { setUserData } from '../redux/userSlice.js';
import AuthModel from './AuthModel.jsx';

function Navbar() {
  const { userData } = useSelector((state) => state.user);

  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const creditRef = useRef();
  const userRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (creditRef.current && !creditRef.current.contains(event.target)) {
        setShowCreditPopup(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // LOGOUT
  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + "/api/auth/logout", {
        withCredentials: true
      });

      dispatch(setUserData(null));
      setShowCreditPopup(false);
      setShowUserPopup(false);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='bg-[#f3f3f3] flex justify-center px-4 pt-6'>
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='w-full max-w-6xl bg-white rounded-[24px] shadow-sm border border-gray-200 px-8 py-4 flex justify-between items-center'
      >

        {/* LOGO */}
        <div className='flex items-center gap-3 cursor-pointer'>
          <div className='bg-black text-white p-2 rounded-lg'>
            <BsRobot size={18} />
          </div>
          <h1 className='font-semibold hidden md:block text-lg'>
            InterviewIQ.AI
          </h1>
        </div>

        <div className='flex items-center gap-6'>
          <div className='relative' ref={creditRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();

                if (!userData) return;

                setShowCreditPopup((prev) => !prev);
                setShowUserPopup(false);
              }}
              className='flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition'
            >
              <BsCoin size={18} />
              {userData?.credits ?? 0}
            </button>

            {showCreditPopup && (
              <div className='absolute right-0 mt-3 w-64 bg-white shadow-xl border rounded-lg p-4 z-50'>
                <button
                  onClick={() => navigate("/pricing")}
                  className='w-full bg-black text-white py-2 rounded-lg text-sm'
                >
                  Buy Credits
                </button>
              </div>
            )}
          </div>

         
          <div className='relative' ref={userRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();

                
                if (!userData) {
                  setShowAuth(true);
                  return;
                }

                setShowUserPopup((prev) => !prev);
                setShowCreditPopup(false);
              }}
              className='w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-semibold'
            >
              {userData?.name
                ? userData.name.charAt(0).toUpperCase()
                : <FaUserAstronaut size={16} />}
            </button>

            {showUserPopup && (
              <div className='absolute right-0 mt-3 w-48 bg-white shadow-xl border rounded-xl p-4 z-50'>
                <p className='font-medium mb-2'>
                  {userData?.name}
                </p>

                <button
                  onClick={() => navigate("/history")}
                  className='w-full text-left text-sm py-2 text-gray-600 hover:text-black'
                >
                  Interview History
                </button>

                <button
                  onClick={handleLogout}
                  className='w-full text-left text-sm py-2 flex items-center gap-2 text-red-500'
                >
                  <HiOutlineLogout size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </motion.div>
      {showAuth && (
        <AuthModel onClose={() => setShowAuth(false)} />
      )}
    </div>
  );
}

export default Navbar;