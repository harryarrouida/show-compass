"use client";
import { AIRecommendation } from "@/types/types";
import { IoCheckmarkCircleOutline, IoClose } from "react-icons/io5";
import { RiSendPlaneFill, RiRobot2Line } from "react-icons/ri";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { RecommendationModal } from "@/components/AIRecommendations/RecommendationModal";
import { RecommendationCard } from "@/components/AIRecommendations/RecommendationCard";
import CardSkeleton from "../shared/loaders/CardSkeleton";

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
          <span className="w-1 h-6 bg-indigo-500 rounded-full" />
          <span className="flex items-center gap-2">
            <RiRobot2Line className="w-5 h-5 text-indigo-400" />
            AI Picks
          </span>
        </h2>
        {!isDefaultRecs && (
          <button
            onClick={toggleChat}
            className="text-xs sm:text-sm text-zinc-400 hover:text-indigo-300 transition-colors font-medium
                       px-3 py-1.5 rounded-lg border border-zinc-800/60 hover:border-indigo-500/30
                       bg-zinc-900/50 hover:bg-indigo-500/10 transition-all duration-200"
          >
            {showChat ? "Hide Prompt" : "Refine Results"}
          </button>
        )}
      </div>

      {/* Chat / Refine Input */}
      {showChat && !isDefaultRecs && (
        <form onSubmit={handleSubmitPrompt} className="flex items-center gap-2.5">
          <div className="relative flex-grow">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              type="text"
              placeholder="e.g. more psychological, less gore, shorter series..."
              className="
                w-full px-4 py-3.5 rounded-xl
                bg-zinc-900/80 text-zinc-200 text-sm
                border border-zinc-700/50
                outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20
                placeholder:text-zinc-600 transition-all duration-200
              "
              disabled={isAiLoading}
            />
            {prompt.length > 0 && !isAiLoading && (
              <button
                type="button"
                onClick={() => setPrompt("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <IoClose className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            disabled={isAiLoading || !prompt.trim()}
            type="submit"
            className={`
              flex-shrink-0 p-3 rounded-xl transition-all duration-200
              ${
                isAiLoading || !prompt.trim()
                  ? "bg-indigo-500/10 text-indigo-400/40 cursor-not-allowed"
                  : "bg-indigo-600/20 text-indigo-300 hover:bg-indigo-500/30 hover:text-indigo-200 border border-indigo-500/20 hover:border-indigo-400/30"
              }
            `}
          >
            {isAiLoading ? (
              <div className="w-5 h-5 border-2 border-indigo-400/40 border-t-indigo-300 rounded-full animate-spin" />
            ) : (
              <RiSendPlaneFill className="w-5 h-5" />
            )}
          </button>
        </form>
      )}

      {/* Grid */}
      <div className="relative">
        {isAiLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 pt-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <CardSkeleton key={i} index={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 pt-6">
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

      {/* Modal */}
      {selectedRec && (
        <RecommendationModal
          recommendation={selectedRec}
          onClose={() => setSelectedRec(null)}
          onSave={saveToHistory}
        />
      )}

      {/* Toast-style alert */}
      {alert && (
        <div
          className="
            fixed bottom-6 right-4 sm:right-6 z-50
            flex items-center gap-2 px-4 py-2.5 rounded-xl
            bg-emerald-500/10 border border-emerald-500/20
            text-sm text-emerald-400
            shadow-lg backdrop-blur-sm
          "
        >
          <IoCheckmarkCircleOutline className="w-4 h-4 flex-shrink-0" />
          {alert}
        </div>
      )}
    </div>
  );
}
