"use client"

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaCheckCircle, FaCrown } from 'react-icons/fa';
import Link from 'next/link';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push('/profile');
    }, 5000);

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
        <div className="mx-auto w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8">
          <FaCheckCircle className="text-green-500 text-5xl" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
        
        <div className="text-xl text-blue-400 font-semibold mb-6 flex items-center justify-center gap-2">
          <FaCrown className="text-yellow-400" />
          Premium Activated
        </div>

        <p className="text-text-secondary mb-8">
          Thank you for your purchase! Your account has been upgraded to premium.
          You now have access to all premium features.
        </p>

        <div className="flex flex-col gap-4">
          <Link 
            href="/profile" 
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          >
            Go to Profile
          </Link>
          
          <p className="text-text-secondary text-sm">
            Redirecting to profile in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
