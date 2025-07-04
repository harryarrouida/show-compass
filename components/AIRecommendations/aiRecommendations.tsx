"use client";
import { AIRecommendation } from "@/types/types";
import { IoCheckmarkCircleOutline, IoClose } from "react-icons/io5";
import { RiSendPlaneFill } from "react-icons/ri";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { RecommendationModal } from "@/components/AIRecommendations/RecommendationModal";
import { RecommendationCard } from "@/components/AIRecommendations/RecommendationCard";
import CardSkeleton from "../shared/loaders/CardSkeleton";
import { useAuth } from "@/contexts/AuthContext";

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
}: AIRecommendationsProps) {
  const pathname = usePathname();
  const [isDefaultRecs, setIsDefaultRecs] = useState(true);
  const [selectedRec, setSelectedRec] = useState<AIRecommendation | null>(null);

  useEffect(() => {
    setIsDefaultRecs(!pathname?.includes("recommendation"));
  }, [pathname]);

  const { currentUser, isPremium } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-zinc-200">
          Similar Recommendations
        </h2>
        {!isDefaultRecs &&
          (isPremium ? (
            <button
              onClick={toggleChat}
              className="text-sm text-zinc-400 hover:text-blue-400 transition-colors"
            >
              {showChat ? "Hide Chat" : "Refine Results"}
            </button>
          ) : (
            <span className="text-sm text-zinc-400">
              Free User: upgrade to refine results
            </span>
          ))}
      </div>

      {/* Chat Input Section */}
      {showChat && !isDefaultRecs && (
        // <Card className="p-3">
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
        // </Card>
      )}

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
