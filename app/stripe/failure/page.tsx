"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

export default function FailurePage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Auto-redirect after 10 seconds
    const timer = setTimeout(() => {
      router.push('/profile');
    }, 10000);

    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background-primary">
      <div className="w-full max-w-lg bg-background-secondary rounded-xl p-10 shadow-xl border border-border-primary text-center">
        <div className="mx-auto w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-8">
          <FaTimesCircle className="text-red-500 text-5xl" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">Payment Failed</h1>
        
        <p className="text-text-secondary mb-8">
          Your payment could not be processed. This could be due to insufficient funds, 
          card restrictions, or the payment was canceled. Please try again using a different 
          payment method or contact support if the issue persists.
        </p>

        <div className="flex flex-col gap-4">
          <Link 
            href="/profile" 
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FaArrowLeft />
            Return to Profile
          </Link>
          
          <p className="text-text-secondary text-sm">
            Redirecting to profile in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
