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
import {
  generateDefaultPrompt,
  generateCustomPrompt,
} from "@/constants/aiPrompts";
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
            const groq = new Groq({
              apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY!,
              dangerouslyAllowBrowser: true,
            });

            const completion = await groq.chat.completions.create({
              messages: [
                {
                  role: "system",
                  content: `You are a helpful assistant that provides recommendations. Your responses must be valid JSON with a 'recommendations' array containing objects with 'title' and 'reason' fields. The JSON must be complete and properly formatted. Example format:
                  {
                    "recommendations": [
                      {
                        "title": "Movie Title",
                        "reason": "Reason for recommendation"
                      }
                    ]
                  }`
                },
                {
                  role: "user",
                  content: generateDefaultPrompt(
                    mediaDetails as any,
                    type as string
                  ),
                },
              ],
              model: "mixtral-8x7b-32768",
              temperature: 0.2,
              max_tokens: 1000,
              response_format: { type: "json_object" },
            });

            const response = completion.choices[0]?.message?.content || "";
            const cleanResponse = response.trim();
            const parsed = JSON.parse(cleanResponse);

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
                    return {
                      ...rec,
                      media: {
                        ...searchResults[0],
                        type: type,
                      },
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
    setIsAiLoading(true);
    try {
      const groq = new Groq({
        apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
        dangerouslyAllowBrowser: true,
      });
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a JSON-only response bot. Always respond with valid JSON matching this exact format:
            {
              "recommendations": [
                {
                  "title": "Movie Title",
                  "reason": "Reason for recommendation"
                }
              ]
            }`
          },
          {
            role: "user",
            content: generateCustomPrompt(
              details as any,
              type as string,
              prompt,
              8
            ),
          },
        ],
        // model: "mixtral-8x7b-32768",
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        top_p: 0.1,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      });

      const response = completion.choices[0]?.message?.content || "";

      try {
        const cleanResponse = response.trim();
        const parsed = JSON.parse(cleanResponse);

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
                return {
                  ...rec,
                  media: {
                    ...searchResults[0],
                    type: type,
                  },
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

              {showIntroModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                  <div className="bg-zinc-900 rounded-xl p-6 max-w-md w-full relative border border-violet-500/20 mx-4 sm:mx-0">
                    <button
                      onClick={closeIntroModal}
                      className="absolute top-3 right-3 p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                    >
                      <IoClose size={20} />
                    </button>

                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <RiRobot2Line className="text-violet-400" />
                      <span className="text-sm sm:text-base text-zinc-300 uppercase">
                        Welcome to AI Recommendations!
                      </span>
                    </h2>

                    <div className="space-y-5">
                      <div className="flex items-start sm:items-center gap-3 text-zinc-300">
                        <RiQuestionLine className="text-violet-400 text-xl flex-shrink-0 mt-1 sm:mt-0" />
                        <p className="text-sm sm:text-base">
                          Get personalized recommendations based on your
                          selected movie or show
                        </p>
                      </div>

                      <div className="flex items-start sm:items-center gap-3 text-zinc-300">
                        <BsChatDots className="text-violet-400 text-xl flex-shrink-0 mt-1 sm:mt-0" />
                        <p className="text-sm sm:text-base">
                          Ask specific questions to refine recommendations to
                          your taste
                        </p>
                      </div>

                      <div className="flex items-start sm:items-center gap-3 text-zinc-300">
                        <RiHistoryLine className="text-violet-400 text-xl flex-shrink-0 mt-1 sm:mt-0" />
                        <p className="text-sm sm:text-base">
                          Save recommendations to your history for later (click
                          on a recommendation to open modal)
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={closeIntroModal}
                      className="mt-8 w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 px-4 rounded-xl transition-colors text-sm sm:text-base"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
