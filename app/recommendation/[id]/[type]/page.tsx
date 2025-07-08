"use client";
import { getShowDetails } from "@/services/content/showServices";
import { getMovieDetails } from "@/services/content/movieServices";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ShowDetails,
  MovieDetails,
  MappedMovie,
  MappedShow,
} from "@/types/types";
import Groq from "groq-sdk";
import MediaDetails from "@/components/AIRecommendations/mediaDetails";
import { AIRecommendation } from "@/types/types";

import { search } from "@/services/content/sharedServices";
import { useHistory } from "@/contexts/historyContext";
import Loading from "@/components/shared/loaders/loading";
import { IoClose } from "react-icons/io5";
import {
  RiRobot2Line,
  RiQuestionLine,
  RiHistoryLine,
  RiChat1Line,
} from "react-icons/ri";
import { BsChatDots } from "react-icons/bs";
import { useAuth } from "@/contexts/AuthContext";

export default function RecommendationPage() {
  const [details, setDetails] = useState<ShowDetails | MovieDetails | null>(
    null
  );
  const [aiRecommendations, setAiRecommendations] = useState<
    AIRecommendation[] | string
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { id, type } = useParams();
  const [showAllSeasons, setShowAllSeasons] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [prompt, setPrompt] = useState("");
  const { saveToHistory: saveToHistoryContext } = useHistory();
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const {currentUser, isPremium} = useAuth();
  
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisitedRecommendations");
    if (!hasVisited && initialLoadComplete) {
      setShowIntroModal(true);
      const timer = setTimeout(() => {
        setShowIntroModal(false);
        localStorage.setItem("hasVisitedRecommendations", "true");
      }, 60000);
      return () => clearTimeout(timer);
    }

    if (hasVisited) {
      setShowIntroModal(false);
    }

    const width = window.innerWidth;
    if (width < 768) {
      setIsMobile(true);
    }
  }, [initialLoadComplete]);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000); // Clear alert after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const closeIntroModal = () => {
    setShowIntroModal(false);
    localStorage.setItem("hasVisitedRecommendations", "true");
  };

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        let mediaDetails;
        if (type === "movie") {
          mediaDetails = await getMovieDetails(Number(id));
        } else if (type === "show") {
          mediaDetails = await getShowDetails(Number(id));
        }

        if (mediaDetails) {
          setDetails(mediaDetails);
          setIsLoading(false);
          setIsAiLoading(true);

          try {
            const response = await fetch(`/api/groq/based-rec`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                mediaDetails,
                type,
              }),
            });

            console.log(response);
            if (!response.ok) {
              throw new Error("Failed to fetch recommendations");
            }

            const parsed = await response.json();

            if (
              !parsed ||
              !parsed.recommendations ||
              !Array.isArray(parsed.recommendations)
            ) {
              throw new Error("Invalid response format");
            }

            const recommendationsWithMedia = await Promise.all(
              parsed.recommendations.map(async (rec: AIRecommendation) => {
                try {
                  const searchResults = await search(rec.title);
                  if (searchResults && searchResults.length > 0) {
                    const firstResult = searchResults[0];
                    const mediaDetails = await (type === 'movie' ? getMovieDetails(firstResult.id) : getShowDetails(firstResult.id));
                    return {
                      ...rec,
                      media: mediaDetails,
                    };
                  }
                  return rec;
                } catch (error) {
                  console.error(
                    `Error fetching details for ${rec.title}:`,
                    error
                  );
                  return rec;
                }
              })
            );

            const sortedRecommendations = recommendationsWithMedia
              .filter((rec) => rec.media)
              .sort((a, b) => {
                if (!a.media?.popularity) return 1;
                if (!b.media?.popularity) return -1;
                return b.media.popularity - a.media.popularity;
              });

            setAiRecommendations(sortedRecommendations);
          } catch (error) {
            console.error("Failed to parse AI response:", error);
            setAiRecommendations([]);
          }
        }
      } catch (error) {
        console.error("Error:", error);
        setAiRecommendations([]);
      } finally {
        setIsLoading(false);
        setIsAiLoading(false);
        setInitialLoadComplete(true);
      }
    };

    if (id && type) {
      fetchDetails();
    }
  }, [id, type]);

  const saveToHistory = (recommendation: AIRecommendation) => {
    if (!recommendation.media) return;

    saveToHistoryContext(
      recommendation.media as unknown as MappedMovie | MappedShow,
      type as "movie" | "show",
      recommendation.reason,
      details as ShowDetails | MovieDetails
    );
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    return !showChat;
  };

  const handleSubmitPrompt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isPremium) {
      setAlert("Please upgrade to a premium account to use this feature.");
      return;
    }

    setIsAiLoading(true);
    try {
      const userToken = currentUser ? await currentUser.getIdToken() : null;

      const response = await fetch(`/api/groq/refine-rec`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(userToken ? { Authorization: `Bearer ${userToken}` } : {}),
        },
        body: JSON.stringify({
          details,
          type,
          prompt,
        }),
      });
      console.log("AI response received:", response);
      if (!response.ok) {
        throw new Error("Failed to fetch refined recommendations");
      }
      const parsed = await response.json();

      try {
        if (
          !parsed ||
          !parsed.recommendations ||
          !Array.isArray(parsed.recommendations)
        ) {
          throw new Error("Invalid response format");
        }

        const recommendationsWithMedia = await Promise.all(
          parsed.recommendations.map(async (rec: AIRecommendation) => {
            try {
              const searchResults = await search(rec.title);
              if (searchResults && searchResults.length > 0) {
                const firstResult = searchResults[0];
                const mediaDetails = await (type === 'movie' ? getMovieDetails(firstResult.id) : getShowDetails(firstResult.id));
                return {
                  ...rec,
                  media: mediaDetails,
                };
              }
              return rec;
            } catch (error) {
              console.error(`Error fetching details for ${rec.title}:`, error);
              return rec;
            }
          })
        );

        const sortedRecommendations = recommendationsWithMedia
          .filter((rec) => rec.media)
          .sort((a, b) => {
            if (!a.media?.popularity) return 1;
            if (!b.media?.popularity) return -1;
            return b.media.popularity - a.media.popularity;
          });

        setAiRecommendations(sortedRecommendations);
        setPrompt("");
      } catch (error) {
        console.error("Failed to parse AI response:", error);
        setAiRecommendations([]);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setAiRecommendations([]);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!id || !type) {
    return <div>no id or type</div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-screen mt-4 sm:mt-10">
      {isLoading ? (
        <Loading text="Loading Recommendations..." />
      ) : (
        <>
          {details && (
            <>
              <MediaDetails
                details={details}
                showAllSeasons={showAllSeasons}
                setShowAllSeasons={setShowAllSeasons}
                aiRecommendations={aiRecommendations as AIRecommendation[]}
                isAiLoading={isAiLoading}
                saveToHistory={saveToHistory}
                alert={alert}
                toggleChat={toggleChat}
                showChat={showChat}
                setPrompt={setPrompt}
                prompt={prompt}
                handleSubmitPrompt={handleSubmitPrompt}
                isMobile={isMobile}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}