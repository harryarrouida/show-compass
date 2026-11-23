"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { getShowDetails } from "@/services/content/showServices";
import { getMovieDetails } from "@/services/content/movieServices";
import { getAIRecommendations } from "@/app/actions/recommendations";
import { useHistory } from "@/contexts/historyContext";
import { useTraktContext } from "@/contexts/traktContext";
import { useRecommendationFeedback } from "@/contexts/recommendationFeedbackContext";
import type { RecommendationRequest, MediaKind } from "@/lib/recommendation-engine";
import type { AIRecommendation, MappedMovie, MappedShow, MovieDetails, ShowDetails } from "@/types/types";
import MediaDetails from "@/components/AIRecommendations/mediaDetails";
import Loading from "@/components/shared/loaders/loading";

export default function RecommendationPage() {
  const { id, type } = useParams();
  const mediaId = Number(id);
  const mediaType = type === "movie" || type === "show" ? type : null;
  const [details, setDetails] = useState<ShowDetails | MovieDetails | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);
  const [showAllSeasons, setShowAllSeasons] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const { history, saveToHistory } = useHistory();
  const { watchedMoviesCache, watchedShowsCache } = useTraktContext();
  const { feedback, ready } = useRecommendationFeedback();

  // Keep freshness of preference signals without regenerating on each saved item.
  const tasteRef = useRef({ history, feedback, watchedMoviesCache, watchedShowsCache });
  tasteRef.current = { history, feedback, watchedMoviesCache, watchedShowsCache };

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 768);
    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  const makeRequest = (selectedType: MediaKind, selectedId: number, customPrompt = ""): RecommendationRequest => {
    const taste = tasteRef.current;
    const watched = selectedType === "movie" ? taste.watchedMoviesCache : taste.watchedShowsCache;
    return {
      mode: "similar",
      type: selectedType,
      sourceId: selectedId,
      prompt: customPrompt,
      saved: taste.history.map(item => ({
        id: item.data.id,
        title: item.data.title,
        type: item.mediaType,
      })),
      watched: watched.map((item: { tmdbId: number; title: string }) => ({
        id: item.tmdbId,
        title: item.title,
        type: selectedType,
      })),
      feedback: taste.feedback,
    };
  };

  useEffect(() => {
    if (!ready) return;
    if (!mediaType || !Number.isSafeInteger(mediaId) || mediaId <= 0) {
      setAlert("Invalid movie or show link");
      setIsLoading(false);
      return;
    }

    let active = true;
    setDetails(null);
    setRecommendations([]);
    setAlert(null);
    setIsLoading(true);

    const load = async () => {
      try {
        const media = mediaType === "movie" ? await getMovieDetails(mediaId) : await getShowDetails(mediaId);
        if (!media) throw new Error("This title could not be found");
        if (!active) return;
        setDetails(media);
        setIsLoading(false);
        setIsAiLoading(true);

        const picks = await getAIRecommendations(makeRequest(mediaType, mediaId));
        if (active) setRecommendations(picks);
      } catch (error) {
        console.error("Recommendation loading failed:", error);
        if (active) setAlert(error instanceof Error ? error.message : "Unable to load recommendations");
      } finally {
        if (active) {
          setIsLoading(false);
          setIsAiLoading(false);
        }
      }
    };
    void load();
    return () => { active = false; };
  }, [mediaId, mediaType, ready]);

  const submitPrompt = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mediaType || !details || !prompt.trim() || isAiLoading) return;
    setIsAiLoading(true);
    setAlert(null);
    try {
      const picks = await getAIRecommendations(makeRequest(mediaType, details.id, prompt.trim()));
      setRecommendations(picks);
      setPrompt("");
    } catch (error) {
      console.error("Recommendation refinement failed:", error);
      setAlert(error instanceof Error ? error.message : "Unable to refine recommendations");
    } finally {
      setIsAiLoading(false);
    }
  };

  const saveRecommendation = (recommendation: AIRecommendation) => {
    if (!recommendation.media || !details) return;
    saveToHistory(
      recommendation.media as MappedMovie | MappedShow,
      recommendation.media.type,
      recommendation.reason,
      details
    );
  };

  if (isLoading) return <Loading text="Loading recommendations..." />;
  if (!details) {
    return <div role="alert" className="page-shell max-w-4xl text-center text-text-secondary">
      {alert || "This title isn't available."}
    </div>;
  }

  return (
    <div className="min-h-[70vh] w-full">
      <MediaDetails
        details={details}
        showAllSeasons={showAllSeasons}
        setShowAllSeasons={setShowAllSeasons}
        aiRecommendations={recommendations}
        isAiLoading={isAiLoading}
        saveToHistory={saveRecommendation}
        alert={alert}
        toggleChat={() => { setShowChat(value => !value); return !showChat; }}
        showChat={showChat}
        setPrompt={setPrompt}
        prompt={prompt}
        handleSubmitPrompt={submitPrompt}
        isMobile={isMobile}
      />
    </div>
  );
}
