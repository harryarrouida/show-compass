import { useState, useEffect } from "react";
import { RiRobot2Line } from "react-icons/ri";
import { IoChevronForwardOutline, IoFilterOutline } from "react-icons/io5";
import { IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";
import { useTraktContext } from "@/contexts/traktContext";
import { search } from "@/services/content/sharedServices";
import { useHistory } from "@/contexts/historyContext";
import {
  generateTraktRecommendationsPrompt,
  generateWatchlistPrompt,
} from "@/constants/aiPrompts";
import { RecommendationCard } from "@/components/AIRecommendations/RecommendationCard";
import { RecommendationModal } from "@/components/AIRecommendations/RecommendationModal";
import { getUserWatchlist } from "@/services/trakt/traktServices";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import Card from "@/components/shared/ui/Card";
import { useGenerations } from "@/contexts/GenerationsContext";
import CardSkeleton from "../shared/loaders/CardSkeleton";
import { useAuth } from "@/contexts/AuthContext";

// Types
type MediaType = "movies" | "shows";
type LengthPreference = "short" | "medium" | "long";

interface FilterOptions {
  lengthPreference?: LengthPreference;
  minimumRating?: number;
  excludeGenres?: string[];
  includeGenres?: string[];
  releaseYearRange?: {
    min?: number;
    max?: number;
  };
}

interface RecommendationState {
  recommendations: any[];
  recommendationsDetails: any[];
  selectedRecommendation: any | null;
  selectedReason: string | null;
}

interface UIState {
  loading: boolean;
  error: string | null;
  generateDisabled: boolean;
  timeRemaining: number;
  showAdvancedFilters: boolean;
}

const TraktRecommendations = () => {
  // Core state
  const [mediaType, setMediaType] = useState<MediaType>("shows");
  const [numRecommendations, setNumRecommendations] = useState<5 | 10>(5);
  const [fromWatchlist, setFromWatchlist] = useState(false);
  const [animeOnly, setAnimeOnly] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [seen, setSeen] = useState<string[]>([]);

  // Recommendation state
  const [recState, setRecState] = useState<RecommendationState>({
    recommendations: [],
    recommendationsDetails: [],
    selectedRecommendation: null,
    selectedReason: null,
  });

  // UI state
  const [uiState, setUIState] = useState<UIState>({
    loading: false,
    error: null,
    generateDisabled: false,
    timeRemaining: 0,
    showAdvancedFilters: false,
  });

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    lengthPreference: undefined,
    minimumRating: undefined,
    excludeGenres: [],
    includeGenres: [],
    releaseYearRange: {},
  });

  // Contexts
  const { currentUser, isPremium, getUserData } = useAuth();
  const { generationsLeft } = useGenerations();
  const {
    watchedMoviesCache,
    watchedShowsCache,
    getUserWatchedMovies,
    getUserWatchedShows,
    accessToken,
  } = useTraktContext();
  const { saveToHistory: saveToHistoryContext } = useHistory();

  // Encryption helpers
  const encryptValue = (value: string) => {
    return CryptoJS.AES.encrypt(
      value,
      process.env.COOKIE_SECRET || "immakeepitsimple"
    ).toString();
  };

  const decryptValue = (encrypted: string) => {
    const bytes = CryptoJS.AES.decrypt(
      encrypted,
      process.env.COOKIE_SECRET || "immakeepitsimple"
    );
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        const data = await getUserData();
        setUserData(data);
      }
    };
    loadUserData();
  }, [currentUser, getUserData]);

  // Handle cooldown timer
  useEffect(() => {
    const encryptedTimeout = Cookies.get("recommendationTimeout");
    if (encryptedTimeout) {
      try {
        const timeoutEndStr = decryptValue(encryptedTimeout);
        const timeoutEnd = parseInt(timeoutEndStr);
        const now = Date.now();

        if (now < timeoutEnd) {
          setUIState(prev => ({
            ...prev,
            generateDisabled: true,
            timeRemaining: Math.ceil((timeoutEnd - now) / 1000),
          }));

          const timer = setInterval(() => {
            const currentTime = Date.now();
            if (currentTime >= timeoutEnd) {
              setUIState(prev => ({
                ...prev,
                generateDisabled: false,
                timeRemaining: 0,
              }));
              Cookies.remove("recommendationTimeout");
              clearInterval(timer);
            } else {
              setUIState(prev => ({
                ...prev,
                timeRemaining: Math.ceil((timeoutEnd - currentTime) / 1000),
              }));
            }
          }, 1000);

          return () => clearInterval(timer);
        } else {
          Cookies.remove("recommendationTimeout");
        }
      } catch (error) {
        Cookies.remove("recommendationTimeout");
      }
    }
  }, []);

  // Reset recommendations when settings change
  useEffect(() => {
    setRecState({
      recommendations: [],
      recommendationsDetails: [],
      selectedRecommendation: null,
      selectedReason: null,
    });
    setUIState(prev => ({ ...prev, error: null }));
  }, [mediaType, numRecommendations]);

  // Helper functions
  const cleanAndParseResponse = (response: string) => {
    try {
      const jsonMatch = response.match(/```(?:json)?([\s\S]*?)```/);
      let cleanResponse = jsonMatch ? jsonMatch[1].trim() : response.trim();
      cleanResponse = cleanResponse.replace(/^[^{]*/g, "").replace(/[^}]*$/g, "");
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error("Failed to parse response:", error);
      throw new Error("Invalid response format");
    }
  };

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

  const generatePrompt = async (type: MediaType, watchedContent: any[]) => {
    const {
      favoriteGenres,
      decadePreferences,
      ratingDistribution,
      watchedTitles,
    } = await analyzeViewingPatterns(watchedContent);

    return generateTraktRecommendationsPrompt(
      watchedTitles as any,
      favoriteGenres,
      decadePreferences,
      ratingDistribution,
      seen,
      type,
      numRecommendations,
      animeOnly,
      filters
    );
  };

  const generatePromptFromWatchlist = async (
    type: MediaType,
    watchedContent: any[]
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

    return generateWatchlistPrompt(
      ratingDistribution,
      decadePreferences,
      favoriteGenres,
      watchedTitles as any,
      watchlistItems,
      mediaType,
      numRecommendations,
      animeOnly,
      filters
    );
  };

  const startCooldownTimer = (seconds: number) => {
    setUIState(prev => ({
      ...prev,
      generateDisabled: true,
      timeRemaining: seconds,
    }));

    const timer = setInterval(() => {
      setUIState(prev => {
        if (prev.timeRemaining <= 1) {
          clearInterval(timer);
          return { ...prev, generateDisabled: false, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return timer;
  };

  const handleRecommendations = async () => {
    if (!currentUser) {
      setUIState(prev => ({ ...prev, error: "Please log in to generate recommendations" }));
      return;
    }

    if (uiState.generateDisabled) {
      setUIState(prev => ({
        ...prev,
        error: `Please wait ${Math.ceil(uiState.timeRemaining / 60)} minutes and ${
          uiState.timeRemaining % 60
        } seconds before generating new recommendations`,
      }));
      return;
    }

    setUIState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    setRecState({
      recommendations: [],
      recommendationsDetails: [],
      selectedRecommendation: null,
      selectedReason: null,
    });

    try {
      const watchedContent =
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

      const prompt = fromWatchlist
        ? await generatePromptFromWatchlist(mediaType, watchedContent)
        : await generatePrompt(mediaType, watchedContent);

      if (!prompt) {
        throw new Error("Failed to generate prompt");
      }

      const token = await currentUser.getIdToken();

      const response = await fetch("/api/groq/trakt-rec", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          if (errorData.remainingTime) {
            startCooldownTimer(errorData.remainingTime);
          }
          throw new Error(errorData.error);
        }
        throw new Error(errorData.error || "Failed to fetch recommendations");
      }

      const data = await response.json();
      const parsed = cleanAndParseResponse(data.response);

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

      const validRecommendations = recommendationsDetails.filter(
        (rec) => rec !== null
      );

      if (validRecommendations.length === 0) {
        throw new Error("No valid recommendations could be found");
      }

      setRecState({
        recommendations: parsed.recommendations,
        recommendationsDetails: validRecommendations,
        selectedRecommendation: null,
        selectedReason: null,
      });

      if (data.cooldownSeconds) {
        startCooldownTimer(data.cooldownSeconds);
      }
    } catch (error: any) {
      console.error("Error generating recommendations:", error);
      setUIState(prev => ({
        ...prev,
        error: error.message || "An unexpected error occurred while generating recommendations",
      }));
      setRecState({
        recommendations: [],
        recommendationsDetails: [],
        selectedRecommendation: null,
        selectedReason: null,
      });
    } finally {
      setUIState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSaveToHistory = (recommendation: any) => {
    if (!recommendation.media) return;
    saveToHistoryContext(
      recommendation.media,
      mediaType === "movies" ? "movie" : "show",
      recommendation.reason,
      "Trakt Recommendations"
    );
  };

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mt-4 sm:mt-8">
      <Card className="p-4 sm:p-8">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Header Section */}
          <div className="flex items-center gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-zinc-800/50">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/10">
              <RiRobot2Line className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                AI-Powered Recommendations
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm mt-0.5 sm:mt-1">
                {!isPremium
                  ? "Free user - 5 recommendations per day"
                  : "Premium user - Unlimited recommendations"}
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

            {uiState.error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 text-sm">
                {uiState.error}
              </div>
            )}

            {/* Primary Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as MediaType)}
                    className="w-full sm:w-auto bg-zinc-800/30 border border-zinc-700/50 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-zinc-200 
                              focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20
                              appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik02IDcuNEwwIDEuNEwxLjQgMEw2IDQuNkwxMC42IDBMMTIgMS40TDYgNy40WiIgZmlsbD0iIzcxNzE3MSIvPgo8L3N2Zz4K')]
                              bg-[length:12px_8px] bg-[right_16px_center] bg-no-repeat pr-12 transition-all"
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
                              focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20
                              appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik02IDcuNEwwIDEuNEwxLjQgMEw2IDQuNkwxMC42IDBMMTIgMS40TDYgNy40WiIgZmlsbD0iIzcxNzE3MSIvPgo8L3N2Zz4K')]
                              bg-[length:12px_8px] bg-[right_16px_center] bg-no-repeat pr-12 transition-all"
                  >
                    <option value={5}>5 Recommendations</option>
                    <option value={10}>10 Recommendations</option>
                  </select>
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => setFromWatchlist(!fromWatchlist)}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm transition-all
                              ${fromWatchlist
                        ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                        : "bg-zinc-800/30 text-zinc-300 border border-zinc-700/50"
                      }`}
                  >
                    {fromWatchlist ? "From Watchlist" : "General"}
                  </button>
                  <button
                    onClick={() => setAnimeOnly(!animeOnly)}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm transition-all
                              ${animeOnly
                        ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                        : "bg-zinc-800/30 text-zinc-300 border border-zinc-700/50"
                      }`}
                  >
                    {animeOnly ? "Anime Only" : `All ${mediaType}`}
                  </button>
                </div>
              </div>

              <button
                onClick={handleRecommendations}
                disabled={uiState.loading || uiState.generateDisabled || generationsLeft <= 0}
                className="w-full sm:w-auto group flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 
                          bg-gradient-to-r from-blue-600 to-blue-500 
                          rounded-xl text-sm text-white font-medium transition-all duration-300
                          disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uiState.loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Analyzing...</span>
                  </>
                ) : uiState.generateDisabled ? (
                  <>
                    <RiRobot2Line className="w-4 h-4 transition-transform group-hover:rotate-12" />
                    <span>
                      Wait {Math.floor(uiState.timeRemaining / 60)}:
                      {(uiState.timeRemaining % 60).toString().padStart(2, "0")}
                    </span>
                  </>
                ) : (
                  <>
                    <RiRobot2Line className="w-4 h-4 transition-transform group-hover:rotate-12" />
                    <span>Generate</span>
                    <IoChevronForwardOutline className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Advanced Filters Section */}
          <div className="mt-4 border-t border-zinc-800/50 pt-4">
            <button
              onClick={() => setUIState(prev => ({ ...prev, showAdvancedFilters: !prev.showAdvancedFilters }))}
              className="w-full flex items-center justify-between text-zinc-300 text-sm hover:text-white transition-colors px-2"
            >
              <div className="flex items-center gap-2">
                <IoFilterOutline className="w-4 h-4" />
                Advanced Filters
              </div>
              {uiState.showAdvancedFilters ? (
                <IoChevronUpOutline className="w-4 h-4" />
              ) : (
                <IoChevronDownOutline className="w-4 h-4" />
              )}
            </button>

            {uiState.showAdvancedFilters && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-zinc-400 text-sm">Length Preference</label>
                  <select
                    value={filters.lengthPreference || ""}
                    onChange={(e) => updateFilter("lengthPreference", e.target.value || undefined)}
                    className="w-full bg-zinc-800/30 border border-zinc-700/50 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="">Any Length</option>
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="long">Long</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-zinc-400 text-sm">Minimum Rating</label>
                  <input
                    type="number"
                    min="5"
                    max="9"
                    step="0.5"
                    value={filters.minimumRating || ""}
                    onChange={(e) => updateFilter("minimumRating", e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full bg-zinc-800/30 border border-zinc-700/50 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50"
                    placeholder="Any rating"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-zinc-400 text-sm">Release Year Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1900"
                      max="2024"
                      value={filters.releaseYearRange?.min || ""}
                      onChange={(e) => updateFilter("releaseYearRange", {
                        ...filters.releaseYearRange,
                        min: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                      className="flex-1 bg-zinc-800/30 border border-zinc-700/50 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50"
                      placeholder="From"
                    />
                    <input
                      type="number"
                      min="1900"
                      max="2024"
                      value={filters.releaseYearRange?.max || ""}
                      onChange={(e) => updateFilter("releaseYearRange", {
                        ...filters.releaseYearRange,
                        max: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                      className="flex-1 bg-zinc-800/30 border border-zinc-700/50 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50"
                      placeholder="To"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-zinc-400 text-sm">Exclude Genres</label>
                  <input
                    type="text"
                    value={filters.excludeGenres?.join(", ") || ""}
                    onChange={(e) => updateFilter("excludeGenres", e.target.value.split(",").map(g => g.trim()).filter(g => g))}
                    className="w-full bg-zinc-800/30 border border-zinc-700/50 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50"
                    placeholder="Horror, Romance, ..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-zinc-400 text-sm">Include Genres</label>
                  <input
                    type="text"
                    value={filters.includeGenres?.join(", ") || ""}
                    onChange={(e) => updateFilter("includeGenres", e.target.value.split(",").map(g => g.trim()).filter(g => g))}
                    className="w-full bg-zinc-800/30 border border-zinc-700/50 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50"
                    placeholder="Sci-Fi, Thriller, ..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {uiState.loading && (
        <div className="mt-4 sm:mt-8">
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: numRecommendations }).map((_, index) => (
              <CardSkeleton key={index} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      {recState.recommendations.length > 0 && (
        <div className="mt-4 sm:mt-8">
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {recState.recommendationsDetails.map((rec, idx) => (
              <RecommendationCard
                key={idx}
                index={idx}
                recommendation={rec}
                onSelect={(r) =>
                  setRecState((prev) => ({
                    ...prev,
                    selectedRecommendation: r,
                  }))
                }
                onSave={handleSaveToHistory}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recommendation Modal */}
      {recState.selectedRecommendation && (
        <RecommendationModal
          recommendation={recState.selectedRecommendation}
          onClose={() =>
            setRecState((prev) => ({
              ...prev,
              selectedRecommendation: null,
            }))
          }
          onSave={handleSaveToHistory}
        />
      )}
    </div>
  );
};

export default TraktRecommendations;