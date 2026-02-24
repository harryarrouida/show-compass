import { useState, useEffect } from "react";
import { RiRobot2Line } from "react-icons/ri";
import { IoChevronForwardOutline, IoFilterOutline } from "react-icons/io5";
import { IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";
import { useTraktContext } from "@/contexts/traktContext";
import Groq from "groq-sdk";
import { search } from "@/services/content/sharedServices";
import { useHistory } from "@/contexts/historyContext";
import {
  generateTraktRecommendationsPrompt,
  generateWatchlistPrompt,
  type TieredHistory,
} from "@/constants/aiPrompts";
import { RecommendationCard } from "@/components/AIRecommendations/RecommendationCard";
import { RecommendationModal } from "@/components/AIRecommendations/RecommendationModal";
import { getUserWatchlist } from "@/services/trakt/traktServices";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import Card from "@/components/shared/ui/Card";
import { useGenerations } from "@/contexts/GenerationsContext";
import CardSkeleton from "../shared/loaders/CardSkeleton";

// Main component for AI-powered movie/show recommendations based on Trakt.tv data
type MediaType = "movies" | "shows";

// Add new types
type LengthPreference = "short" | "medium" | "long";
type ShowStatus = "ongoing" | "completed" | "both";

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
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [pastRecommendations, setPastRecommendations] = useState<string[]>([]);

  // UI state management
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<any>(null);

  // Watchlist related state
  const [fromWatchlist, setFromWatchlist] = useState<boolean>(false);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [seen, setSeen] = useState<string[]>([]);

  const { generationsLeft, useGeneration: markGenerationUsed } =
    useGenerations();

  const {
    watchedMoviesCache,
    watchedShowsCache,
    getUserWatchedMovies,
    getUserWatchedShows,
  } = useTraktContext();
  const { saveToHistory: saveToHistoryContext } = useHistory();
  const { accessToken } = useTraktContext();

  const [animeOnly, setAnimeOnly] = useState(false);

  // Add new state for advanced filtering
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [lengthPreference, setLengthPreference] = useState<
    LengthPreference | ""
  >("");
  const [episodeCount, setEpisodeCount] = useState<{
    min?: number;
    max?: number;
  }>({});
  const [showStatus, setShowStatus] = useState<ShowStatus>("both");
  const [minimumRating, setMinimumRating] = useState<number>(0);

  const encryptValue = (value: string) => {
    return CryptoJS.AES.encrypt(
      value,
      process.env.NEXT_PUBLIC_COOKIE_SECRET || "immakeepitsimple"
    ).toString();
  };

  const decryptValue = (encrypted: string) => {
    try {
      const bytes = CryptoJS.AES.decrypt(
        encrypted,
        process.env.NEXT_PUBLIC_COOKIE_SECRET || "immakeepitsimple"
      );
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted || null;
    } catch (error) {
      console.error("Cookie decryption failed:", error);
      return null;
    }
  };

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    const encryptedTimeout = Cookies.get("recommendationTimeout");
    if (encryptedTimeout) {
      try {
        const timeoutEndStr = decryptValue(encryptedTimeout);
        if (!timeoutEndStr) return;
        const timeoutEnd = parseInt(timeoutEndStr);
        const now = Date.now();

        if (now < timeoutEnd) {
          setGenerateDisabled(true);
          setTimeRemaining(Math.ceil((timeoutEnd - now) / 1000));

          // Start countdown timer
          const timer = setInterval(() => {
            const currentTime = Date.now();
            if (currentTime >= timeoutEnd) {
              setGenerateDisabled(false);
              setTimeRemaining(0);
              Cookies.remove("recommendationTimeout");
              clearInterval(timer);
            } else {
              setTimeRemaining(Math.ceil((timeoutEnd - currentTime) / 1000));
            }
          }, 1000);

          return () => clearInterval(timer);
        } else {
          Cookies.remove("recommendationTimeout");
          setGenerateDisabled(false);
          setTimeRemaining(0);
        }
      } catch (error) {
        // Handle invalid/tampered cookie
        Cookies.remove("recommendationTimeout");
        setGenerateDisabled(false);
        setTimeRemaining(0);
      }
    }
  }, []);

  useEffect(() => {
    setRecommendations([]);
    setRecommendationsDetails([]);
    setPastRecommendations([]);
    setSelectedReason(null);
    setError(null);
  }, [mediaType, numRecommendations]);

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

  // ─── Tiered history analysis ──────────────────────────────────────────────
  // Strategy:
  //   Tier 1 (signature): fetch TMDB details for up to SIGNATURE_LIMIT titles
  //                       selected by a weighted random sample (to vary across
  //                       generations). Includes overview + rating for deep
  //                       atmospheric analysis.
  //   Tier 2 (breadth):   send ALL titles as a compact comma-separated list so
  //                       the AI understands the user's full taste breadth and
  //                       avoids recommending already-watched content.
  //
  // This replaces the old approach that fetched TMDB data for EVERY title
  // (expensive: O(n) API calls) with a fixed O(SIGNATURE_LIMIT) calls.
  const SIGNATURE_LIMIT = 25;

  const analyzeViewingPatterns = async (watchedContent: any[]) => {
    // All titles compact list for the AI (breadth signal + duplicate avoidance)
    const allTitles = watchedContent.map((item) => item.title);

    // Weighted random sample for signature titles:
    // shuffle and take the first SIGNATURE_LIMIT items so each generation
    // surfaces a different slice of the watch history (variety between runs)
    const shuffled = [...watchedContent].sort(() => Math.random() - 0.5);
    const sampleSet = shuffled.slice(0, SIGNATURE_LIMIT);

    // Fetch TMDB details only for the sample
    const signatureWithDetails = await Promise.all(
      sampleSet.map(async (item) => {
        try {
          const results = await search(item.title);
          const match = results[0];
          if (!match) return null;
          return {
            title: item.title,
            rating: match.vote_average ?? 0,
            overview: match.overview ?? "",
            year: match.release_date
              ? new Date(match.release_date).getFullYear()
              : null,
            genres: (match as any).genres ?? [],
            poster_path: match.poster_path,
            backdrop_path: match.backdrop_path,
          };
        } catch {
          return null;
        }
      })
    );

    const validSignature = signatureWithDetails.filter(
      (s): s is NonNullable<typeof s> => s !== null && s.overview.length > 10
    );

    // Build supporting stats from the signature set (good enough approximation)
    const genreCounts = validSignature.reduce((acc: Record<string, number>, item) => {
      item.genres.forEach((g: any) => {
        const name = typeof g === "string" ? g : g.name;
        if (name) acc[name] = (acc[name] || 0) + 1;
      });
      return acc;
    }, {});

    const favoriteGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([genre]) => genre);

    const decadePreferences = validSignature.reduce(
      (acc: Record<string, number>, item) => {
        if (item.year) {
          const decade = String(Math.floor(item.year / 10) * 10);
          acc[decade] = (acc[decade] || 0) + 1;
        }
        return acc;
      },
      {}
    );

    const ratingDistribution = validSignature.reduce(
      (acc: Record<string, number>, item) => {
        if (item.rating) {
          const key =
            item.rating >= 8 ? "high" : item.rating >= 6 ? "medium" : "low";
          acc[key] = (acc[key] || 0) + 1;
        }
        return acc;
      },
      {}
    );

    const tieredHistory: TieredHistory = {
      allTitles,
      signatureTitles: validSignature.map((s) => ({
        title: s.title,
        rating: s.rating,
        overview: s.overview,
      })),
    };

    return {
      tieredHistory,
      favoriteGenres,
      decadePreferences,
      ratingDistribution,
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

    const { tieredHistory, decadePreferences, ratingDistribution } =
      await analyzeViewingPatterns(watchedContent);

    const prompt = generateWatchlistPrompt(
      tieredHistory,
      ratingDistribution,
      decadePreferences,
      watchlistItems,
      mediaType,
      numRecommendations,
      animeOnly,
      lengthPreference || undefined,
      Object.keys(episodeCount).length > 0 ? episodeCount : undefined,
      showStatus !== "both" ? showStatus : undefined,
      minimumRating > 0 ? minimumRating : undefined,
      pastRecommendations
    );

    return prompt;
  };

  // Main function to handle recommendation generation
  const handleRecommendations = async () => {
    if (generateDisabled) {
      setError(
        `Please wait ${Math.ceil(timeRemaining / 60)} minutes and ${timeRemaining % 60
        } seconds before generating new recommendations`
      );
      return;
    }

    if (process.env.NODE_ENV === 'production' && generationsLeft <= 0) {
      setError("You have no generations left for today");
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendations([]);
    setRecommendationsDetails([]);

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

      // console.log(`Total ${mediaType} watched:`, watchedContent.length);

      if (!watchedContent || watchedContent.length === 0) {
        throw new Error(`No watched ${mediaType} found in your history`);
      }

      const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY;
      if (!apiKey) {
        throw new Error("Missing Groq API Key configuration");
      }

      const groq = new Groq({
        apiKey: apiKey,
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

      // console.log("Generated Prompt:", prompt);

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an expert cinematic taste analyst. Your job is to understand a viewer's emotional and atmospheric preferences from their watch history and find new content that will genuinely resonate with them.

CRITICAL RULES:
- Analyze the AGGREGATE pattern across the full history, not individual titles
- Weight SIGNATURE TITLES (those with overviews provided) more heavily — they best represent the user's taste
- Recommendations must NOT appear in the user's complete watch history
- Explanations must reference MOOD, ATMOSPHERE, PACING, and THEMES — not genres
- Provide VARIETY: diverse picks that all fit the taste profile
- Your responses MUST be valid JSON only`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.6,
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

        // Add newly generated titles to the "past recommendations" list to prevent repeats
        setPastRecommendations((prev) => [
          ...prev,
          ...validRecommendations.map((r) => r.title),
        ]);

        if (process.env.NODE_ENV === 'production') {
          // Only set timeout in production
          setGenerateDisabled(true);
          const timeoutEnd = Date.now() + 3 * 60 * 1000;
          const encryptedTimeout = encryptValue(timeoutEnd.toString());
          Cookies.set("recommendationTimeout", encryptedTimeout, {
            expires: 1 / 480,
          }); // expires in 3 minutes
          setTimeRemaining(180); // 3 minutes in seconds

          const timer = setInterval(() => {
            setTimeRemaining((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                setGenerateDisabled(false);
                Cookies.remove("recommendationTimeout");
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }

        markGenerationUsed();
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

  // Generate prompt — analyzeViewingPatterns already shuffles internally
  const generatePrompt = async (type: MediaType, watchedContent: any[]) => {
    const { tieredHistory, favoriteGenres, decadePreferences, ratingDistribution } =
      await analyzeViewingPatterns(watchedContent);

    const prompt = generateTraktRecommendationsPrompt(
      tieredHistory,
      favoriteGenres,
      decadePreferences,
      ratingDistribution,
      type,
      numRecommendations,
      animeOnly,
      lengthPreference || undefined,
      Object.keys(episodeCount).length > 0 ? episodeCount : undefined,
      showStatus !== "both" ? showStatus : undefined,
      minimumRating > 0 ? minimumRating : undefined,
      pastRecommendations
    );

    return prompt;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mt-4 sm:mt-8">
      <Card className="p-4 sm:p-8">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Header Section */}
          <div className="flex items-center gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-border-primary">
            <div className="p-2 sm:p-3 bg-background-tertiary rounded-xl border border-border-primary">
              <RiRobot2Line className="w-4 sm:w-5 h-4 sm:h-5 text-interactive-accent" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                AI-Powered Recommendations
              </h2>
              <p className="text-text-tertiary text-xs sm:text-sm mt-0.5 sm:mt-1">
                Discover your next favorite based on your unique taste
                {process.env.NODE_ENV === 'production' && <>( {generationsLeft} generations left)</>}
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

            {/* Mobile-first controls layout */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              {/* Primary controls stacked on mobile */}
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 flex-1">
                {/* Media Type & Number Selection */}
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

                {/* Filter Buttons */}
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

              {/* Generate Button - Full width on mobile */}
              <button
                onClick={handleRecommendations}
                disabled={loading || generateDisabled || (process.env.NODE_ENV === 'production' && generationsLeft <= 0)}
                className="w-full sm:w-auto group flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 
                          bg-interactive-button-primary hover:bg-interactive-button-primaryHover
                          rounded-xl text-sm text-white font-medium transition-all duration-300
                          shadow-lg shadow-interactive-button-primary/20
                          disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Analyzing...</span>
                  </>
                ) : generateDisabled ? (
                  <>
                    <RiRobot2Line className="w-4 h-4 transition-transform group-hover:rotate-12" />
                    <span>
                      Wait {Math.floor(timeRemaining / 60)}:
                      {(timeRemaining % 60).toString().padStart(2, "0")}
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
          {/* <div className="mt-4 border-t border-zinc-800/50 pt-4">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="w-full flex items-center justify-between text-zinc-300 text-sm hover:text-white transition-colors px-2"
            >
              <div className="flex items-center gap-2">
                <IoFilterOutline className="w-4 h-4" />
                Advanced Filters (still in development)
              </div>
              {showAdvancedFilters ? (
                <IoChevronUpOutline className="w-4 h-4" />
              ) : (
                <IoChevronDownOutline className="w-4 h-4" />
              )}
            </button>

            {showAdvancedFilters && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-zinc-400 text-sm">Length</label>
                  <select
                    value={lengthPreference}
                    onChange={(e) => setLengthPreference(e.target.value as LengthPreference | "")}
                    className="w-full bg-zinc-800/30 border border-zinc-700/50 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="">Any Length</option>
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="long">Long</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-zinc-400 text-sm">Episode Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={episodeCount.min || ""}
                      onChange={(e) => setEpisodeCount((prev) => ({
                        ...prev,
                        min: parseInt(e.target.value) || undefined,
                      }))}
                      className="w-1/2 bg-zinc-800/30 border border-zinc-700/50 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={episodeCount.max || ""}
                      onChange={(e) => setEpisodeCount((prev) => ({
                        ...prev,
                        max: parseInt(e.target.value) || undefined,
                      }))}
                      className="w-1/2 bg-zinc-800/30 border border-zinc-700/50 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-zinc-400 text-sm">Status</label>
                  <select
                    value={showStatus}
                    onChange={(e) => setShowStatus(e.target.value as ShowStatus)}
                    className="w-full bg-zinc-800/30 border border-zinc-700/50 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="both">Any Status</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-zinc-400 text-sm">Minimum Rating</label>
                  <input
                    type="number"
                    min="5"
                    max="9"
                    step="0.5"
                    value={minimumRating}
                    onChange={(e) => setMinimumRating(parseFloat(e.target.value))}
                    className="w-full bg-zinc-800/30 border border-zinc-700/50 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50"
                    placeholder="Any rating"
                  />
                </div>
              </div>
            )}
          </div> */}
        </div>
      </Card>

      {loading && (
        <div className="mt-4 sm:mt-8">
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: numRecommendations }).map((_, index) => (
              <CardSkeleton key={index} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      {recommendations.length > 0 && (
        <div className="mt-4 sm:mt-8">
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
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
