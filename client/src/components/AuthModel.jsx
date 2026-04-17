import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FaTimes } from 'react-icons/fa'
import Auth from "../pages/Auth"; 

function AuthModel({ onClose }) {
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
  if (userData) {
    onClose?.();
  }
}, [userData]);

  return (
    <div
      onClick={onClose}
      className='fixed inset-0 z-[999] flex items-center justify-center bg-black/10 backdrop-blur-sm px-4'
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className='relative w-full max-w-md'
      >
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-800 hover:text-black'
        >
          <FaTimes size={18} />
        </button>

        <Auth isModel={true} />
      </div>
    </div>
  );
}

export default AuthModel; 

