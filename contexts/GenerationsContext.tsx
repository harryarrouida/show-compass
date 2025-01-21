"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';

interface GenerationsContextType {
  generationsLeft: number;
  useGeneration: () => boolean;
  resetGenerations: () => void;
}

const GenerationsContext = createContext<GenerationsContextType | undefined>(undefined);

const DAILY_LIMIT = 5;
const STORAGE_KEY = 'lastGenerationReset';
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'wellthisistoosimple';

const encrypt = (text: string) => {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

const decrypt = (ciphertext: string) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export function GenerationsProvider({ children }: { children: ReactNode }) {
  const [generationsLeft, setGenerationsLeft] = useState(DAILY_LIMIT);

  useEffect(() => {
    const encryptedLastReset = Cookies.get(STORAGE_KEY);
    const today = new Date().toDateString();
    
    if (!encryptedLastReset || decrypt(encryptedLastReset) !== today) {
      // Reset generations if it's a new day
      setGenerationsLeft(DAILY_LIMIT);
      Cookies.set(STORAGE_KEY, encrypt(today), { expires: 7 });
    } else {
      // Load saved generations left from cookies
      const encryptedGenerations = Cookies.get('generationsLeft');
      if (encryptedGenerations) {
        const decryptedGenerations = decrypt(encryptedGenerations);
        setGenerationsLeft(parseInt(decryptedGenerations));
      }
    }
  }, []);

  // Save generations left whenever it changes
  useEffect(() => {
    Cookies.set('generationsLeft', encrypt(generationsLeft.toString()), { expires: 7 });
  }, [generationsLeft]);

  const useGeneration = () => {
    if (generationsLeft > 0) {
      setGenerationsLeft(prev => prev - 1);
      return true;
    }
    return false;
  };

  const resetGenerations = () => {
    setGenerationsLeft(DAILY_LIMIT);
    const today = new Date().toDateString();
    Cookies.set(STORAGE_KEY, encrypt(today), { expires: 7 });
  };

  return (
    <GenerationsContext.Provider value={{ generationsLeft, useGeneration, resetGenerations }}>
      {children}
    </GenerationsContext.Provider>
  );
}

export function useGenerations() {
  const context = useContext(GenerationsContext);
  if (context === undefined) {
    throw new Error('useGenerations must be used within a GenerationsProvider');
  }
  return context;
}