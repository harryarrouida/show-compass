"use client";
import { AIRecommendation } from "@/types/types";
import { IoCheckmarkCircleOutline, IoClose } from "react-icons/io5";
import { RiSendPlaneFill, RiRobot2Line } from "react-icons/ri";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { RecommendationModal } from "@/components/AIRecommendations/RecommendationModal";
import { RecommendationCard } from "@/components/AIRecommendations/RecommendationCard";
import CardSkeleton from "../shared/loaders/CardSkeleton";
import { useRecommendationFeedback } from "@/contexts/recommendationFeedbackContext";

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
  const { feedback, mark } = useRecommendationFeedback();
  const [isDefaultRecs, setIsDefaultRecs] = useState(true);
  const [selectedRec, setSelectedRec] = useState<AIRecommendation | null>(null);

  useEffect(() => {
    setIsDefaultRecs(!pathname?.includes("recommendation"));
  }, [pathname]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="section-heading flex items-center gap-3">
          <span className="w-1 h-6 bg-accent-primary rounded-full" />
          <span className="flex items-center gap-2">
            <RiRobot2Line className="w-5 h-5 text-accent-primary" />
            AI Picks
          </span>
        </h2>
        {!isDefaultRecs && (
          <button
            onClick={toggleChat}
            className="text-xs sm:text-sm text-text-secondary hover:text-accent-hover transition-colors font-medium
                       px-3 py-1.5 rounded-lg border border-border-primary hover:border-border-hover
                       bg-background-secondary hover:bg-background-tertiary transition-all duration-200"
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
                bg-background-primary text-text-primary text-sm
                border border-border-primary
                outline-none focus:border-accent-primary
                placeholder:text-text-tertiary transition-all duration-200
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
          <div className="poster-grid pt-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <CardSkeleton key={i} index={i} />
            ))}
          </div>
        ) : (
          <div className="poster-grid pt-6">
            {Array.isArray(aiRecommendations) &&
              aiRecommendations.filter(rec => !feedback.some(item => item.id === rec.media?.id && item.type === rec.media?.type && item.sentiment === "not_interested")).map((rec, index) => (
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

      {!isAiLoading && !alert && Array.isArray(aiRecommendations) && aiRecommendations.length === 0 && (
        <div role="status" className="empty-state">
          <h3 className="font-semibold text-text-primary">No recommendations to display</h3>
          <p className="mt-2">Try another title or refine your preferences.</p>
        </div>
      )}

      <p className="text-xs text-text-tertiary">Open a recommendation to mark Interested or Not interested. Your preferences stay on this device.</p>

      {/* Modal */}
      {selectedRec && (
        <RecommendationModal
          recommendation={selectedRec}
          onClose={() => setSelectedRec(null)}
          onSave={saveToHistory}
          onFeedback={(sentiment) => { if (selectedRec.media) mark(selectedRec.media.id, selectedRec.media.type, sentiment); setSelectedRec(null); }}
        />
      )}
    </div>
  );
}
