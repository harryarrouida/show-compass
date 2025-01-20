"use client";
import { AIRecommendation } from "@/types/types";
import { IoCheckmarkCircleOutline, IoClose } from "react-icons/io5";
import { RiSendPlaneFill } from "react-icons/ri";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { RecommendationModal } from "./RecommendationModal";
import { RecommendationCard } from "./RecommendationCard";
import Loading from "@/components/shared/loading";
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
    if (pathname?.includes("recommendation")) {
      setIsDefaultRecs(false);
    }
  }, [pathname]);

  return (
    <div className="space-y-6 border-t border-zinc-800 pt-4">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">
          Similar Recommendations
        </h2>
        {!isDefaultRecs && (
          <button
            onClick={toggleChat}
            className="text-zinc-400 text-sm font-light hover:text-violet-400 transition-colors duration-300"
          >
            {showChat
              ? "Do you like these? Hide Chat"
              : "Don't Like These? Chat here"}
          </button>
        )}
      </div>

      {showChat && !isDefaultRecs && (
        <form
          onSubmit={handleSubmitPrompt}
          className="mb-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="relative flex-grow">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              type="text"
              placeholder="What kind of recommendations are you looking for?"
              className="w-full p-3 sm:p-4 rounded-xl bg-zinc-900 text-zinc-100 border border-violet-500/20 
                                     focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 
                                     placeholder:text-zinc-500 transition-all duration-300 text-sm sm:text-base"
              disabled={isAiLoading}
            />
            {prompt.length > 0 && !isAiLoading && (
              <button
                type="button"
                onClick={() => setPrompt("")}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1 text-zinc-500 
                                         hover:text-zinc-300 transition-colors"
                aria-label="Clear input"
              >
                <IoClose size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            )}
          </div>
          <button
            disabled={isAiLoading || !prompt.trim()}
            type="submit"
            className={`px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-white font-medium transition-all duration-300 
                                  flex items-center justify-center gap-2 flex-shrink-0 text-sm sm:text-base 
                                  ${
                                    isAiLoading || !prompt.trim()
                                      ? "bg-violet-600/50 opacity-50 cursor-not-allowed"
                                      : "bg-violet-600 hover:bg-violet-700 active:scale-95"
                                  }`}
            aria-label={isAiLoading ? "Loading..." : "Send message"}
          >
            {isAiLoading ? (
              <>
                <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full" />
                <span className="sm:inline">Loading...</span>
              </>
            ) : (
              <>
                <RiSendPlaneFill className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Send</span>
              </>
            )}
          </button>
        </form>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4">
        {isAiLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full" />
            <p className="text-zinc-400 mt-4">Generating recommendations...</p>
          </div>
        ) : (
          Array.isArray(aiRecommendations) &&
          aiRecommendations.map((rec, index) => (
            <RecommendationCard
              key={index}
              index={index}
              recommendation={rec}
              onSelect={setSelectedRec}
              onSave={saveToHistory}
            />
          ))
        )}
      </div>

      {selectedRec && (
        <RecommendationModal
          recommendation={selectedRec}
          onClose={() => setSelectedRec(null)}
          onSave={saveToHistory}
        />
      )}

      {alert && (
        <div className="flex items-center gap-2 text-sm text-green-400 font-medium fixed bottom-4 right-4 sm:bottom-12 sm:right-12 bg-green-900/10 rounded-lg p-3 z-50">
          <IoCheckmarkCircleOutline className="text-green-400 text-lg" />
          {alert}
        </div>
      )}
    </div>
  );
}
