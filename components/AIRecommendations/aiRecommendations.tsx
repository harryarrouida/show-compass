"use client";
import { AIRecommendation } from "@/types/types";
import { IoCheckmarkCircleOutline, IoClose } from "react-icons/io5";
import { RiSendPlaneFill } from "react-icons/ri";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { RecommendationModal } from "@/components/AIRecommendations/RecommendationModal";
import { RecommendationCard } from "@/components/AIRecommendations/RecommendationCard";
import SmallLoader from "@/components/shared/loaders/smallLoader";
import Card from "@/components/shared/ui/Card";
import CardSkeleton from "../shared/loaders/CardSkeleton";
import Link from "next/link";

interface AIRecommendationsProps {
  isAiLoading: boolean;
  aiRecommendations: AIRecommendation[] | string;
  saveToHistory: (recommendation: AIRecommendation) => void;
  alert: string | null;
  toggleChat: () => void;
  showChat: boolean;
  setPrompt: (prompt: string) => void;
  prompt: string;
  handleSubmitPrompt: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isPremiumUser: boolean; // NEW PROP
  onUpgrade?: () => void; // NEW PROP (optional)
}

export default function AIRecommendations({
  isAiLoading,
  aiRecommendations,
  saveToHistory,
  alert,
  toggleChat,
  showChat,
  setPrompt,
  prompt,
  handleSubmitPrompt,
  isPremiumUser,
  onUpgrade,
}: AIRecommendationsProps) {
  const pathname = usePathname();
  const [isDefaultRecs, setIsDefaultRecs] = useState(true);
  const [selectedRec, setSelectedRec] = useState<AIRecommendation | null>(null);

  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    setIsDefaultRecs(!pathname?.includes("recommendation"));
  }, [pathname]);

  // Floating button styles
  const floatingBtnClass = isPremiumUser
    ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg"
    : "bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-lg";

  const handleRefineClick = () => {
    if (isPremiumUser) {
      toggleChat();
      setShowUpgradePrompt(false); // Close upgrade prompt if open
    } else {
      setShowUpgradePrompt(true);
      // Optionally, close chat if it was somehow open for a free user
      if (showChat) {
        toggleChat();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-zinc-200">
          Similar Recommendations
        </h2>
      </div>

      {/* Recommendations Grid */}
      <div className="relative">
        {isAiLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <CardSkeleton key={index} index={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.isArray(aiRecommendations) &&
              aiRecommendations.map((rec, index) => (
                <RecommendationCard
                  key={index}
                  index={index}
                  recommendation={rec}
                  onSelect={setSelectedRec}
                  onSave={saveToHistory}
                />
              ))}
          </div>
        )}
      </div>

      {/* Floating Refine Button */}
      <button
        onClick={handleRefineClick}
        className={`fixed z-50 bottom-6 right-6 px-6 py-3 rounded-full flex items-center gap-2 text-sm font-semibold transition-all ${floatingBtnClass} ${showChat || showUpgradePrompt ? "ring-2 ring-blue-400" : ""}`}
        style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.18)" }}
      >
        <RiSendPlaneFill className="w-5 h-5" />
        {isPremiumUser ? "Refine Results" : "Upgrade to Refine"}
      </button>

      {/* Floating Chat Modal (only for premium users) */}
      {showChat && isPremiumUser && (
        <div className="fixed z-50 bottom-24 right-6 w-[90vw] max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-base font-semibold text-zinc-200">Refine Recommendations</span>
            <button onClick={toggleChat} className="text-zinc-400 hover:text-zinc-200">
              <IoClose className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmitPrompt} className="flex items-center gap-3">
            <div className="relative flex-grow">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                type="text"
                placeholder="What kind of recommendations are you looking for?"
                className="w-full px-4 py-4 rounded-xl bg-background-secondary text-zinc-200
                           border border-border-primary outline-none focus:border-border-primary
                           placeholder:text-zinc-500 text-sm transition-all"
                disabled={isAiLoading}
              />
              {prompt.length > 0 && !isAiLoading && (
                <button
                  type="button"
                  onClick={() => setPrompt("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 py-4 text-zinc-500 
                             hover:text-zinc-300 transition-colors"
                >
                  <IoClose className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              disabled={isAiLoading || !prompt.trim()}
              type="submit"
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all
                         ${
                           isAiLoading || !prompt.trim()
                             ? "bg-blue-500/20 text-blue-300/50 cursor-not-allowed"
                             : "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                         }`}
            >
              {isAiLoading ? (
                <div className="w-5 h-5 border-2 border-blue-300/50 border-t-transparent rounded-full animate-spin" />
              ) : (
                <RiSendPlaneFill className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      )}

      {/* Upgrade Prompt Modal (only for free users) */}
      {showUpgradePrompt && !isPremiumUser && (
        <div className="fixed z-50 bottom-24 right-6 w-[90vw] max-w-md bg-zinc-900 border border-purple-700 rounded-2xl shadow-2xl p-4 text-center">
          <div className="flex justify-between items-center mb-2">
            <span className="text-base font-semibold text-zinc-200">Unlock AI Refinements</span>
            <button onClick={() => setShowUpgradePrompt(false)} className="text-zinc-400 hover:text-zinc-200">
              <IoClose className="w-5 h-5" />
            </button>
          </div>
          <p className="text-zinc-300 text-sm mb-4">
            Upgrade to a premium account to unlock unlimited AI-powered recommendation refinements.
          </p>
          <Link
            href="/profile/upgrade"
            className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            onClick={() => {
              setShowUpgradePrompt(false);
              if (onUpgrade) onUpgrade();
            }}
          >
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Modal and Alert */}
      {selectedRec && (
        <RecommendationModal
          recommendation={selectedRec}
          onClose={() => setSelectedRec(null)}
          onSave={saveToHistory}
        />
      )}

      {alert && (
        <div
          className="fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2 
                     bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-400"
        >
          <IoCheckmarkCircleOutline className="w-4 h-4" />
          {alert}
        </div>
      )}
    </div>
  );
}