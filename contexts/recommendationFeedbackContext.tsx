"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { TasteFeedback, MediaKind } from "@/lib/recommendation-engine";

type FeedbackContextValue = {
  feedback: TasteFeedback[];
  ready: boolean;
  mark: (id: number, type: MediaKind, sentiment: TasteFeedback["sentiment"]) => void;
  clear: (id: number, type: MediaKind) => void;
  sentimentFor: (id: number, type: MediaKind) => TasteFeedback["sentiment"] | null;
};

const STORAGE_KEY = "showcompass:taste-feedback:v1";
const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function RecommendationFeedbackProvider({ children }: { children: ReactNode }) {
  const [feedback, setFeedback] = useState<TasteFeedback[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(stored)) {
        setFeedback(stored.filter(item =>
          item && Number.isSafeInteger(item.id) && item.id > 0 &&
          (item.type === "movie" || item.type === "show") &&
          (item.sentiment === "interested" || item.sentiment === "not_interested")
        ).slice(-250));
      }
    } catch (error) {
      console.warn("Feedback storage could not be read:", error);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(feedback));
    } catch (error) {
      console.warn("Feedback storage could not be updated:", error);
    }
  }, [feedback, ready]);

  const mark = (id: number, type: MediaKind, sentiment: TasteFeedback["sentiment"]) => {
    if (!Number.isSafeInteger(id) || id <= 0) return;
    setFeedback(prev => [...prev.filter(item => !(item.id === id && item.type === type)), { id, type, sentiment }].slice(-250));
  };
  const clear = (id: number, type: MediaKind) => {
    setFeedback(prev => prev.filter(item => !(item.id === id && item.type === type)));
  };
  const sentimentFor = (id: number, type: MediaKind) =>
    feedback.find(item => item.id === id && item.type === type)?.sentiment || null;

  return (
    <FeedbackContext.Provider value={{ feedback, ready, mark, clear, sentimentFor }}>
      {children}
    </FeedbackContext.Provider>
  );
}

export function useRecommendationFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error("useRecommendationFeedback requires RecommendationFeedbackProvider");
  return context;
}
