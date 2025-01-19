'use client';

import React, { useState, useEffect } from 'react';
import { IoArrowUp } from 'react-icons/io5';

export const ScrollToTop = () => {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return show ? (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 p-3 bg-zinc-800/80 rounded-full
                 backdrop-blur-sm hover:bg-zinc-700/80 transition-all"
    >
      <IoArrowUp className="w-5 h-5" />
    </button>
  ) : null;
}; 