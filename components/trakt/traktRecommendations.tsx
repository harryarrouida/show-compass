import { useState, useEffect } from "react";
import { RiRobot2Line } from "react-icons/ri";
import { IoChevronForwardOutline } from "react-icons/io5";
import { useTraktContext } from "@/contexts/traktContext";
import Groq from "groq-sdk";
import { search } from "@/services/content/sharedServices";
import { useHistory } from "@/contexts/historyContext";
import {
  generateTraktRecommendationsPrompt,
  generateWatchlistPrompt,
} from "@/constants/aiPrompts";
import { RecommendationCard } from "@/components/AIRecommendations/RecommendationCard";
import { RecommendationModal } from "@/components/AIRecommendations/RecommendationModal";
import { getUserWatchlist } from "@/services/trakt/traktServices";

// Main component for AI-powered movie/show recommendations based on Trakt.tv data
type MediaType = "movies" | "shows";

const TraktRecommendations = () => {
  // Core state management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [mediaType, setMediaType] = useState<MediaType>("shows");
  const [numRecommendations, setNumRecommendations] = useState<5 | 10>(5);
  const [recommendationsDetails, setRecommendationsDetails] = useState<any[]>(
    []
  );
  const [generateDisabled, setGenerateDisabled] = useState(false);

  // UI state management
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<any>(null);

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

  const [animeOnly, setAnimeOnly] = useState(false);

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

  // Analyze viewing patterns and preferences
  const analyzeViewingPatterns = async (watchedContent: any[]) => {
    const recentContent = await Promise.all(
      watchedContent.map(async (item) => {
        const searchResults = await search(item.title);
        const mediaMatch = searchResults[0];
        return {
          ...item,
          media: {
            title: mediaMatch?.title,
            year: mediaMatch?.release_date
              ? new Date(mediaMatch.release_date).getFullYear()
              : null,
            genres: mediaMatch?.genres || [],
            rating: mediaMatch?.vote_average,
            vote_average: mediaMatch?.vote_average,
            overview: mediaMatch?.overview,
            poster_path: mediaMatch?.poster_path,
            backdrop_path: mediaMatch?.backdrop_path,
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
      .slice(0, 10)
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

    const watchedTitles = recentContent.map((item) => ({
      title: item.title.toLowerCase(),
      overview: item.media.overview || "",
    }));

    return {
      favoriteGenres,
      decadePreferences,
      ratingDistribution,
      watchedTitles,
      recentContent,
    };
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

    const {
      favoriteGenres,
      decadePreferences,
      ratingDistribution,
      watchedTitles,
    } = await analyzeViewingPatterns(watchedContent);

    const prompt = generateWatchlistPrompt(
      ratingDistribution,
      decadePreferences,
      favoriteGenres,
      watchedTitles as any,
      watchlistItems,
      mediaType,
      numRecommendations,
      animeOnly
    );

    console.log("Watchlist Prompt:", prompt);

    return prompt;
  };

  // Main function to handle recommendation generation
  const handleRecommendations = async () => {
    // TODO: add back in
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
    }, 3 * 60 * 1000);

    try {
      // Get watched content from cache or fetch new
      const watchedContent =
        mediaType === "movies"
          ? watchedMoviesCache.length > 0
            ? watchedMoviesCache
            : await getUserWatchedMovies()
          : watchedShowsCache.length > 0
          ? watchedShowsCache
          : await getUserWatchedShows();

      console.log(`Total ${mediaType} watched:`, watchedContent.length);

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

      console.log("Generated Prompt:", prompt);

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `
            You are a movie and TV show recommendation assistant. You will receive user input details and generate personalized recommendations. 
            - Your responses MUST only be in valid JSON format.
            `,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.3-70b-versatile", // Best model 
        // model: "mixtral-8x7b-32768", // alternative model
        temperature: 0.4, // Balanced creativity and relevance
        top_p: 0.7, // Ensures diversity in recommendations
        max_tokens: 4096, // Sufficient for 8-10 recommendations
        response_format: { type: "json_object" }, // Enforces JSON output
      });

      const response = completion.choices[0]?.message?.content || "";

      try {
        const parsed = cleanAndParseResponse(response);
        setRecommendations(parsed.recommendations);
        const recommendationsDetails = await Promise.all(
          parsed.recommendations.map(async (rec: any) => {
            try {
              const searchResults = await search(rec.title);
              if (!searchResults.length) {
                console.error(`No search results found for: ${rec.title}`);
                return null;
              }
              const mediaMatch = searchResults[0];
              return {
                ...rec,
                media: {
                  ...mediaMatch,
                  backdrop_path: mediaMatch.backdrop_path || "",
                },
              };
            } catch (searchError) {
              console.error(`Error searching for ${rec.title}:`, searchError);
              return null;
            }
          })
        );

        // Filter out null results and set recommendations
        const validRecommendations = recommendationsDetails.filter(
          (rec) => rec !== null
        );
        if (validRecommendations.length === 0) {
          throw new Error("No valid recommendations could be found");
        }
        setRecommendationsDetails(validRecommendations);
      } catch (error: any) {
        console.error("Recommendation processing error:", error);
        throw new Error(
          `Failed to process recommendations: ${error?.message as string}`
        );
      }
    } catch (error: any) {
      console.error("Error generating recommendations:", error);
      setError(
        error.message ||
          "An unexpected error occurred while generating recommendations"
      );
      setRecommendations([]);
      setRecommendationsDetails([]);
    } finally {
      setLoading(false);
    }
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

  const generatePrompt = async (type: MediaType, watchedContent: any[]) => {
    const {
      favoriteGenres,
      decadePreferences,
      ratingDistribution,
      watchedTitles,
    } = await analyzeViewingPatterns(watchedContent);

    const prompt = generateTraktRecommendationsPrompt(
      watchedTitles as any,
      favoriteGenres,
      decadePreferences,
      ratingDistribution,
      seen,
      type,
      numRecommendations,
      animeOnly
    );

    console.log("Generated Prompt:", prompt);

    return prompt;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mt-4 sm:mt-8">
      <div className="w-full bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/50 rounded-2xl p-4 sm:p-8 mx-auto">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Header Section */}
          <div className="flex items-center gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-zinc-800/50">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-violet-500/10 to-violet-500/5 rounded-xl border border-violet-500/10">
              <RiRobot2Line className="w-4 sm:w-5 h-4 sm:h-5 text-violet-400" />
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
                  <option value={5} defaultChecked>
                    5 Recommendations
                  </option>
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
                <button
                  onClick={() => setAnimeOnly(!animeOnly)}
                  className={`w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm transition-all
                            ${
                              animeOnly
                                ? "bg-violet-500/10 text-violet-300 border border-violet-500/20"
                                : "bg-zinc-800/30 text-zinc-300 border border-zinc-700/50 hover:bg-zinc-800/50 hover:border-zinc-600/50"
                            }`}
                >
                  {animeOnly ? "Anime Only" : `All ${mediaType}`}
                </button>
              </div>

              <button
                onClick={handleRecommendations}
                disabled={
                  loading
                  // || generateDisabled
                }
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
        <div className="mt-4 sm:mt-8">
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-6">
            {recommendationsDetails.map((rec, index) => (
              <RecommendationCard
                key={index}
                index={index}
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
