import { useState, useEffect } from "react";
import { RiRobot2Line } from "react-icons/ri";
import { IoChevronForwardOutline } from "react-icons/io5";
import { IoSearchOutline, IoSave, IoStar } from "react-icons/io5";
import { useTraktContext } from "@/context/traktContext";
import Groq from "groq-sdk";
import { search } from "@/services/content/sharedServices";
import MediaCard from "@/components/shared/mediaCard";
import { useHistory } from '@/context/historyContext';

type MediaType = 'movies' | 'shows';

const TraktRecommendations = () => {
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [mediaType, setMediaType] = useState<MediaType>('movies');
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [numRecommendations, setNumRecommendations] = useState<4 | 8>(4);
    const {
        watchedMoviesCache,
        watchedShowsCache,
        getUserWatchedMovies,
        getUserWatchedShows
    } = useTraktContext();
    const [recommendationsDetails, setRecommendationsDetails] = useState<any[]>([]);
    const { saveToHistory: saveToHistoryContext } = useHistory();

    useEffect(() => {
        setRecommendations([]);
        setRecommendationsDetails([]);
        setSelectedReason(null);
    }, [mediaType]);

    const generatePrompt = async (type: MediaType, watchedContent: any[]) => {
        // Calculate viewing patterns and preferences
        const recentContent = await Promise.all(watchedContent.map(async (item) => {
            const searchResults = await search(item.title);
            const mediaMatch = searchResults[0];
            return {
                ...item, media: {
                    title: mediaMatch.title,
                    year: new Date(mediaMatch.release_date).getFullYear(),
                    genres: mediaMatch.genres || [],
                    rating: mediaMatch.vote_average,
                    watched_at: item.watched_at,
                    vote_average: mediaMatch.vote_average,
                    overview: mediaMatch.overview, 
                    poster_path: mediaMatch.poster_path,
                    backdrop_path: mediaMatch.backdrop_path
                }
            };
        }));

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
                const ratingKey = item.media.vote_average >= 8 ? 'high' : item.media.vote_average >= 6 ? 'medium' : 'low';
                acc[ratingKey] = (acc[ratingKey] || 0) + 1;
            }
            return acc;
        }, {});

        // Sort by watch date for recent content
        const sortedContent = [...recentContent].sort((a, b) =>
            new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime()
        );

        const watchedTitles = watchedContent.map(item => item.title.toLowerCase());

        return `As a streaming-savvy film curator, analyze this viewer's detailed watch history:
        
                ${sortedContent.map(item =>
            `- ${item.media.title} (${item.media.year}) | Rating: ${item.media.vote_average?.toFixed(1)} | Themes: ${item.media.overview?.slice(0, 100)}...`
        ).join('\n')}

                Already Watched Titles (DO NOT RECOMMEND ANY OF THESE):
                ${watchedTitles.join(', ')}

                Viewing Profile:
                - Favorite Genres: ${favoriteGenres.join(', ')}
                - Era Preferences: ${Object.entries(decadePreferences)
                .map(([decade, count]) => `${decade}s: ${count} films`)
                .join(', ')}
                - Rating Distribution: 
                  * High-rated (8+): ${ratingDistribution.high || 0}
                  * Mid-rated (6-7.9): ${ratingDistribution.medium || 0}
                  * Lower-rated: ${ratingDistribution.low || 0}
                - Total ${type}: ${watchedContent.length}

                Based on this profile, recommend ${numRecommendations} ${type} that are currently available on major streaming platforms (Netflix, Amazon Prime, Disney+, HBO Max, or Hulu).

                Respond with ONLY a clean JSON object in this format:
                {
                    "recommendations": [
                        {
                            "title": "Title",
                            "reason": "First sentence should reference specific patterns from their watch history (genres, eras, or themes they enjoy). Second sentence should highlight unique qualities that make this film special.",
                            "streaming_platform": "Platform where the film is currently available"
                        }
                    ]
                }
                
                Rules:
                - STRICTLY AVOID recommending any titles from this list: ${watchedTitles.join(', ')}
                - Must be currently available on major streaming platforms (Netflix, Prime, Disney+, HBO Max, or Hulu)
                - Must have 7.5+ rating on major platforms
                - Each reason must be exactly two sentences
                - Focus on themes, style, and emotional resonance
                - Avoid obscure or hard-to-find titles
                - Consider pacing and tone variety
                - DON'T RECOMMEND ${type} that are already in their watch history
                - recommends should be different each time
                - reason should be a 2 sentences
                
                Remember: Return ONLY the JSON object with no additional text.`;
    };

    const handleRecommendations = async () => {
        setLoading(true);
        // Clear previous recommendations immediately when starting
        setRecommendations([]);
        setRecommendationsDetails([]);

        try {
            // Get watched content from cache or fetch if needed
            let watchedContent;
            if (mediaType === 'movies') {
                watchedContent = watchedMoviesCache.length > 0
                    ? watchedMoviesCache
                    : await getUserWatchedMovies();
            } else {
                watchedContent = watchedShowsCache.length > 0
                    ? watchedShowsCache
                    : await getUserWatchedShows();
            }

            if (!watchedContent || watchedContent.length === 0) {
                throw new Error(`No watched ${mediaType} found`);
            }

            const groq = new Groq({
                apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
                dangerouslyAllowBrowser: true
            });

            const prompt = await generatePrompt(mediaType, watchedContent);

            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a JSON-only response bot. Always respond with valid JSON matching the exact format requested. Never include additional text or explanations."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.2,
            });

            const response = completion.choices[0]?.message?.content || "";

            try {
                const cleanResponse = response.trim()
                    .replace(/```json/g, '')
                    .replace(/```/g, '')
                    .trim();

                const parsed = JSON.parse(cleanResponse);
                setRecommendations(parsed.recommendations);
                const recommendationsDetails = await Promise.all(parsed.recommendations.map(async (rec: any) => {
                    const searchResults = await search(rec.title);
                    const mediaMatch = searchResults[0];
                    return { ...rec, media: mediaMatch };
                }));
                setRecommendationsDetails(recommendationsDetails);
            } catch (error) {
                console.error('Failed to parse AI response:', error);
                setRecommendations([]);
            }
        } catch (error) {
            console.error('Error generating recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredContent = () => {
        const content = mediaType === 'movies' ? watchedMoviesCache : watchedShowsCache;
        if (!searchQuery) return [];
        return content.filter((item: any) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const handleSaveToHistory = (recommendation: any) => {
        if (!recommendation.media) return;

        saveToHistoryContext(
            recommendation.media,
            mediaType === 'movies' ? 'movie' : 'show',
            recommendation.reason,
            'Trakt Recommendations'
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mt-16 mb-20">
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-6 max-w-3xl mx-auto mb-16">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-zinc-800/50 rounded-lg">
                        <RiRobot2Line className="w-6 h-6 text-zinc-400" />
                    </div>
                    <div className="space-y-3 flex-1">
                        <h2 className="text-xl font-semibold text-white">AI-Powered Recommendations</h2>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Let our AI analyze your watch history to discover personalized recommendations
                            based on themes, narrative styles, and artistic approaches. Get fresh perspectives
                            on what to watch next, tailored to your unique taste.
                        </p>

                        <div className="flex items-center justify-between gap-4">
                            <div className="flex gap-4">
                                <select
                                    value={mediaType}
                                    onChange={(e) => setMediaType(e.target.value as MediaType)}
                                    className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-600
                                            appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik02IDcuNEwwIDEuNEwxLjQgMEw2IDQuNkwxMC42IDBMMTIgMS40TDYgNy40WiIgZmlsbD0iIzcxNzE3MSIvPgo8L3N2Zz4K')]
                                            bg-[length:12px_8px] bg-[right_16px_center] bg-no-repeat pr-12"
                                >
                                    <option value="movies">Movies</option>
                                    <option value="shows">TV Shows</option>
                                </select>

                                <select
                                    value={numRecommendations}
                                    onChange={(e) => setNumRecommendations(Number(e.target.value) as 4 | 8)}
                                    className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-600
                                            appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik02IDcuNEwwIDEuNEwxLjQgMEw2IDQuNkwxMC42IDBMMTIgMS40TDYgNy40WiIgZmlsbD0iIzcxNzE3MSIvPgo8L3N2Zz4K')]
                                            bg-[length:12px_8px] bg-[right_16px_center] bg-no-repeat pr-12"
                                >
                                    <option value={4}>4 Recommendations</option>
                                    <option value={8}>8 Recommendations</option>
                                </select>
                            </div>

                            <button
                                onClick={handleRecommendations}
                                disabled={loading}
                                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-zinc-700 to-zinc-800 
                                        rounded-full text-sm text-white transition-all duration-300
                                        hover:shadow-lg hover:shadow-zinc-800/25 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-zinc-400 border-t-transparent" />
                                        <span>Analyzing...</span>
                                    </>
                                ) : (
                                    <>
                                        <RiRobot2Line className="w-4 h-4" />
                                        <span>Generate Recommendations</span>
                                        <IoChevronForwardOutline className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                    </>
                                )}
                            </button>
                        </div>

                        {(mediaType === 'movies' && watchedMoviesCache.length > 0) || (mediaType === 'shows' && watchedShowsCache.length > 0) && (
                            <div className="mt-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {getFilteredContent().map((item: any, index: number) => (
                                        <MediaCard
                                            key={index}
                                            item={item}
                                            activeTab={mediaType}
                                            
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {recommendations.length > 0 && (
                <div className="space-y-8">
                    {/* <div className="flex justify-center">
                        <div className="inline-flex space-x-12 border-b border-zinc-800/50 backdrop-blur-sm">
                            <button
                                onClick={() => setMediaType('shows')}
                                className={`pb-4 px-3 text-base font-medium transition-all duration-300 relative ${
                                    mediaType === 'shows'
                                        ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-zinc-400 after:to-zinc-600'
                                        : 'text-zinc-500 hover:text-zinc-400'
                                }`}
                            >
                                Shows
                            </button>
                            <button
                                onClick={() => setMediaType('movies')}
                                className={`pb-4 px-3 text-base font-medium transition-all duration-300 relative ${
                                    mediaType === 'movies'
                                        ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-zinc-400 after:to-zinc-600'
                                        : 'text-zinc-500 hover:text-zinc-400'
                                }`}
                            >
                                Movies
                            </button>
                        </div>
                    </div> */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {recommendationsDetails.map((rec, index) => (
                            <div
                                key={index}
                                className="group relative overflow-hidden rounded-xl bg-zinc-900/80 border border-zinc-800/50 hover:bg-zinc-800/50 transition-all duration-300"
                            >
                                {/* Background Image with Gradient */}
                                <div className="absolute inset-0">
                                    <img 
                                        src={`https://image.tmdb.org/t/p/w1280${rec.media.backdrop_path}`}
                                        alt=""
                                        className="w-full h-full object-cover opacity-20"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/95 to-zinc-900/90" />
                                </div>

                                {/* Content */}
                                <div className="relative p-6">
                                    <button
                                        onClick={() => handleSaveToHistory(rec)}
                                        className="absolute top-4 right-4 p-2 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-full text-white transition-all duration-300"
                                    >
                                        <IoSave className="w-5 h-5" />
                                    </button>

                                    <div className="flex flex-col space-y-4">
                                        <div className="flex items-start space-x-4">
                                            <img 
                                                src={`https://image.tmdb.org/t/p/w500${rec.media.poster_path}`} 
                                                alt={rec.media.title} 
                                                className="w-24 h-36 object-cover rounded-lg shadow-lg"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-white truncate">
                                                    {rec.media.title}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-2 text-sm text-zinc-400">
                                                    <div className="flex items-center">
                                                        <IoStar className="text-amber-400 mr-1" />
                                                        {rec.media.vote_average?.toFixed(1)}
                                                    </div>
                                                    <span>•</span>
                                                    <span>{new Date(rec.media.release_date).getFullYear()}</span>
                                                </div>
                                                <p className="mt-3 text-sm text-zinc-300">
                                                    {rec.reason}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TraktRecommendations;