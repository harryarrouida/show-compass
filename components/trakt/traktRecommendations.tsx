import { useState, useEffect } from "react";
import { RiRobot2Line } from "react-icons/ri";
import { IoChevronForwardOutline } from "react-icons/io5";
import { useTraktContext } from "@/context/traktContext";
import Groq from "groq-sdk";
import { search } from "@/services/content/sharedServices";
import MediaCard from "@/components/shared/mediaCard";
import { useHistory } from "@/context/historyContext";
import {
  generateTraktRecommendationsPrompt,
  generateWatchlistPrompt,
} from "@/constants/aiPrompts";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { RecommendationModal } from "@/components/recommendations/RecommendationModal";
import { getUserWatchlist } from "@/services/trakt/traktServices";
import PageLayout from "../layout/PageLayout";

// Main component for AI-powered movie/show recommendations based on Trakt.tv data
type MediaType = "movies" | "shows";

const TraktRecommendations = () => {
  // Core state management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [mediaType, setMediaType] = useState<MediaType>("movies");
  const [numRecommendations, setNumRecommendations] = useState<5 | 10>(5);
  const [recommendationsDetails, setRecommendationsDetails] = useState<any[]>(
    []
  );
  const [generateDisabled, setGenerateDisabled] = useState(false);

  // UI state management
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Watchlist related state
  const [fromWatchlist, setFromWatchlist] = useState<boolean>(false);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [seen, setSeen] = useState<string[]>([]);

  const {
    watchedMoviesCache,
    watchedShowsCache,
    getUserWatchedMovies,
    getUserWatchedShows,
  } = useTraktContext();
  const { saveToHistory: saveToHistoryContext } = useHistory();
  const { accessToken } = useTraktContext();

  useEffect(() => {
    setRecommendations([]);
    setRecommendationsDetails([]);
    setSelectedReason(null);
    setError(null);
  }, [mediaType]);

  // Helper function to clean AI responses and ensure valid JSON
  const cleanAndParseResponse = (response: string) => {
    try {
      // Extract JSON from markdown if present
      const jsonMatch = response.match(/```(?:json)?([\s\S]*?)```/);
      let cleanResponse = jsonMatch ? jsonMatch[1].trim() : response.trim();

      // Remove any non-JSON text
      cleanResponse = cleanResponse
        .replace(/^[^{]*/g, "")
        .replace(/[^}]*$/g, "");
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error("Failed to parse response:", error);
      throw new Error("Invalid response format");
    }
  };

  // Generates recommendations from user's watchlist
  const generatePromptFromWatchlist = async (
    type: MediaType,
    watchedContent: any[],
    watchlist: any[]
  ): Promise<string> => {
    if (!fromWatchlist || !accessToken) return "";

    let watchlistItems;
    try {
      watchlistItems = await getUserWatchlist(accessToken, type);
      setWatchlist(watchlistItems);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      throw new Error("Failed to fetch watchlist");
    }

    return generateWatchlistPrompt(
      watchedContent,
      watchlistItems,
      mediaType,
      numRecommendations
    );
  };

  // Main function to handle recommendation generation
  const handleRecommendations = async () => {
    if (generateDisabled) {
      setError("Please wait 5 minutes between generating recommendations");
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendations([]);
    setRecommendationsDetails([]);
    setGenerateDisabled(true);

    // Set 5 minute timeout
    setTimeout(() => {
      setGenerateDisabled(false);
    }, 5 * 60 * 1000);

    try {
      // Get watched content from cache or fetch new
      let watchedContent =
        mediaType === "movies"
          ? watchedMoviesCache.length > 0
            ? watchedMoviesCache
            : await getUserWatchedMovies()
          : watchedShowsCache.length > 0
          ? watchedShowsCache
          : await getUserWatchedShows();

      if (!watchedContent || watchedContent.length === 0) {
        throw new Error(`No watched ${mediaType} found in your history`);
      }

      const groq = new Groq({
        apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      const prompt = fromWatchlist
        ? await generatePromptFromWatchlist(
            mediaType,
            watchedContent,
            watchlist
          )
        : await generatePrompt(mediaType, watchedContent);

      if (!prompt) {
        throw new Error("Failed to generate prompt");
      }

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "you are a movie and tv show recommendation bot. you will be given a list of movies and tv shows that the user has watched. you will then generate a list of recommendations based on the user's watch history. you will then return a json object with a 'recommendations' array containing objects with 'title' and 'reason' properties. never include additional text or explanations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      });

      const response = completion.choices[0]?.message?.content || "";

      try {
        const parsed = cleanAndParseResponse(response);
        setRecommendations(parsed.recommendations);
        const recommendationsDetails = await Promise.all(
          parsed.recommendations.map(async (rec: any) => {
            const searchResults = await search(rec.title);
            if (!searchResults.length) {
              throw new Error(`Could not find media details for ${rec.title}`);
            }
            const mediaMatch = searchResults[0];
            return {
              ...rec,
              media: {
                ...mediaMatch,
                backdrop_path: mediaMatch.backdrop_path || "",
              },
            };
          })
        );
        setRecommendationsDetails(recommendationsDetails);
      } catch (error) {
        throw new Error("Failed to process recommendations");
      }
    } catch (error: any) {
      console.error("Error generating recommendations:", error);
      setError(error.message || "An unexpected error occurred while generating recommendations");
      setRecommendations([]);
      setRecommendationsDetails([]);
    } finally {
      setLoading(false);
    }
  };

  // Utility functions for UI interactions
  const getFilteredContent = () => {
    const content =
      mediaType === "movies" ? watchedMoviesCache : watchedShowsCache;
    if (!searchQuery) return [];
    return content.filter((item: any) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Save recommendation to user history
  const handleSaveToHistory = (recommendation: any) => {
    if (!recommendation.media) return;
    saveToHistoryContext(
      recommendation.media,
      mediaType === "movies" ? "movie" : "show",
      recommendation.reason,
      "Trakt Recommendations"
    );
  };

  // Mark recommendation as seen and close modal
  const handleSeen = (recommendation: any) => {
    setSeen((prevSeen) => [...prevSeen, recommendation.title]);
    setSelectedRecommendation(null);
  };

  const generatePrompt = async (type: MediaType, watchedContent: any[]) => {
    // Calculate viewing patterns and preferences
    const recentContent = await Promise.all(
      watchedContent.map(async (item) => {
        const searchResults = await search(item.title);
        const mediaMatch = searchResults[0];
        return {
          ...item,
          media: {
            title: mediaMatch.title,
            year: new Date(mediaMatch.release_date).getFullYear(),
            genres: mediaMatch.genres || [],
            rating: mediaMatch.vote_average,
            watched_at: item.watched_at,
            vote_average: mediaMatch.vote_average,
            overview: mediaMatch.overview,
            poster_path: mediaMatch.poster_path,
            backdrop_path: mediaMatch.backdrop_path,
          },
        };
      })
    );

    // Calculate viewing patterns from the cleaned data
    const genreCounts = recentContent.reduce((acc: any, item) => {
      item.media.genres?.forEach((genre: string) => {
        acc[genre] = (acc[genre] || 0) + 1;
      });
      return acc;
    }, {});

    const favoriteGenres = Object.entries(genreCounts)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre);

    const decadePreferences = recentContent.reduce((acc: any, item) => {
      const decade = Math.floor(item.media.year / 10) * 10;
      acc[decade] = (acc[decade] || 0) + 1;
      return acc;
    }, {});

    const ratingDistribution = recentContent.reduce((acc: any, item) => {
      if (item.media.vote_average) {
        const ratingKey =
          item.media.vote_average >= 8
            ? "high"
            : item.media.vote_average >= 6
            ? "medium"
            : "low";
        acc[ratingKey] = (acc[ratingKey] || 0) + 1;
      }
      return acc;
    }, {});

    // Sort by watch date for recent content
    const sortedContent = [...recentContent].sort(
      (a, b) =>
        new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime()
    );

    const watchedTitles = watchedContent.map((item) =>
      item.title.toLowerCase()
    );

    return generateTraktRecommendationsPrompt(
      sortedContent,
      watchedTitles,
      favoriteGenres,
      decadePreferences,
      ratingDistribution,
      seen,
      type,
      numRecommendations
    );
  };

  return (
    <div className="w-full mx-auto px-2 sm:px-6 lg:px-8 mt-4 sm:mt-8 mb-20">
      <div className="w-full bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/50 rounded-2xl p-4 sm:p-8 max-w-4xl mx-auto mb-8 sm:mb-12 shadow-xl">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Header Section */}
          <div className="flex items-center gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-zinc-800/50">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-violet-500/10 to-violet-500/5 rounded-xl border border-violet-500/10">
              <RiRobot2Line className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                AI-Powered Recommendations
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm mt-0.5 sm:mt-1">
                Discover your next favorite based on your unique taste
              </p>
            </div>
          </div>

          {/* Controls Section */}
          <div className="space-y-4 sm:space-y-6">
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
              Let our AI analyze your watch history to discover personalized
              recommendations based on themes, narrative styles, and artistic
              approaches.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as MediaType)}
                  className="w-full sm:w-auto bg-zinc-800/30 border border-zinc-700/50 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-zinc-200 
                            focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20
                            appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik02IDcuNEwwIDEuNEwxLjQgMEw2IDQuNkwxMC42IDBMMTIgMS40TDYgNy40WiIgZmlsbD0iIzcxNzE3MSIvPgo8L3N2Zz4K')]
                            bg-[length:12px_8px] bg-[right_16px_center] bg-no-repeat pr-12 transition-all lg:px-2 lg:gap-2"
                >
                  <option value="movies">Movies</option>
                  <option value="shows">TV Shows</option>
                </select>

                <select
                  value={numRecommendations}
                  onChange={(e) =>
                    setNumRecommendations(Number(e.target.value) as 5 | 10)
                  }
                  className="w-full sm:w-auto bg-zinc-800/30 border border-zinc-700/50 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-zinc-200 
                            focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20
                            appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik02IDcuNEwwIDEuNEwxLjQgMEw2IDQuNkwxMC42IDBMMTIgMS40TDYgNy40WiIgZmlsbD0iIzcxNzE3MSIvPgo8L3N2Zz4K')]
                            bg-[length:12px_8px] bg-[right_16px_center] bg-no-repeat pr-12 transition-all lg:px-2 lg:gap-2"
                >
                  <option value={5} defaultChecked>5 Recommendations</option>
                  <option value={10}>10 Recommendations</option>
                </select>

                <button
                  onClick={() => setFromWatchlist(!fromWatchlist)}
                  className={`w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm transition-all
                            ${
                              fromWatchlist
                                ? "bg-violet-500/10 text-violet-300 border border-violet-500/20"
                                : "bg-zinc-800/30 text-zinc-300 border border-zinc-700/50"
                            }`}
                >
                  {fromWatchlist ? "From Watchlist" : "General"}
                </button>
              </div>

              <button
                onClick={handleRecommendations}
                disabled={loading || generateDisabled}
                className="group flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 
                          bg-gradient-to-r from-violet-600 to-violet-500 
                          hover:from-violet-500 hover:to-violet-400
                          rounded-xl text-sm text-white font-medium transition-all duration-300
                          hover:shadow-lg hover:shadow-violet-500/25 
                          disabled:opacity-50 disabled:cursor-not-allowed
                          disabled:hover:shadow-none"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <RiRobot2Line className="w-4 h-4" />
                    <span>Generate</span>
                    <IoChevronForwardOutline className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Grid */}
      {recommendations.length > 0 && (
        <div className="space-y-4 sm:space-y-6 mx-2 sm:mx-4">
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 mx-auto">
            {recommendationsDetails.map((rec, index) => (
              <RecommendationCard
                key={index}
                recommendation={rec}
                onSelect={setSelectedRecommendation}
                onSave={handleSaveToHistory}
              />
            ))}
          </div>
        </div>
      )}

      {selectedRecommendation && (
        <RecommendationModal
          recommendation={selectedRecommendation}
          onClose={() => setSelectedRecommendation(null)}
          onSave={handleSaveToHistory}
        />
      )}
    </div>
  );
};

export default TraktRecommendations;
