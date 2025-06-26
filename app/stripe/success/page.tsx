"use client"

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaCheckCircle, FaCrown } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(5);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const { currentUser, refreshPremiumStatus } = useAuth();
  const [statusMessage, setStatusMessage] = useState('Finalizing your premium access...');

  useEffect(() => {
    // Check premium status after a delay to give the webhook time to process
    const checkStatus = async () => {
      try {
        // Wait a bit to allow webhook processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try to refresh premium status
        const isPremium = await refreshPremiumStatus();
        
        if (isPremium) {
          setStatusMessage('Premium status activated successfully!');
        } else {
          setStatusMessage('Payment received. Premium activation in progress...');
          
          // Try one more time after a longer delay
          setTimeout(async () => {
            const finalCheck = await refreshPremiumStatus();
            setIsCheckingStatus(false);
            
            if (!finalCheck) {
              console.log("Premium status not updated yet. It may take a few more moments.");
            }
          }, 3000);
        }
      } catch (error) {
        console.error("Error checking premium status:", error);
        setStatusMessage('Payment successful! Your premium status will be updated shortly.');
      }
    };

    if (currentUser) {
      checkStatus();
    }
    
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
  }, [router, currentUser, refreshPremiumStatus]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background-primary">
      <div className="w-full max-w-lg bg-gradient-to-br from-blue-900 to-background-secondary rounded-xl p-10 shadow-xl border border-border-primary text-center">
        <div className="mx-auto w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8">
          <FaCheckCircle className="text-green-500 text-5xl" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>

        <div className="text-xl text-blue-400 font-semibold mb-6 flex items-center justify-center gap-2">
          <FaCrown className="text-yellow-400" />
          Premium Activated
        </div>

        {isCheckingStatus && (
          <div className="text-text-secondary mb-4 p-3 bg-background-secondary rounded-lg">
            {statusMessage}
          </div>
        )}

        <p className="text-text-secondary mb-8">
          Thank you for your purchase! Your account has been upgraded to premium.
          You now have access to all premium features including unlimited recommendations,
          ad-free experience, and advanced filters.
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
