"use client";
import { getShowDetails } from "@/services/showServices";
import { getMovieDetails } from "@/services/movieServices";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { showDetails, movieDetails, Show, Movie } from "@/types/types";
import Image from 'next/image';
import axios from "axios";
import Groq from "groq-sdk";
import { search } from "@/services/sharedServices";

interface AIRecommendation {
    title: string;
    reason: string;
    media?: Show | Movie;
}

export default function RecommendationPage() {
    const [details, setDetails] = useState<showDetails | movieDetails | null>(null);
    const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[] | string>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const { id, type } = useParams();
    if (!id || !type) {
        return <div>no id or type</div>;
    }

    // fetch Details
    const fetchDetails = async () => {
        setIsLoading(true);
        try {
            // Fetch media details first
            let mediaDetails;
            if (type === "movie") {
                mediaDetails = await getMovieDetails(Number(id));
            } else if (type === "show") {
                mediaDetails = await getShowDetails(Number(id));
            }

            if (mediaDetails) {
                setDetails(mediaDetails as unknown as showDetails | movieDetails);
                setIsLoading(false);  // Show content while waiting for AI
                setIsAiLoading(true); // Set AI loading state

                console.log(mediaDetails);

                // Integrate Groq call directly here
                const groq = new Groq({
                    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
                    dangerouslyAllowBrowser: true
                });
                const genres = mediaDetails.genres.map(genre => genre.name).join(', ');
                const prompt = `Based on this ${type}:
                Title: "${mediaDetails.title}"
                Description: "${mediaDetails.overview}"
                Genres: ${genres}
                
                Generate exactly 4 recommendations in the following JSON format with no additional text or explanation:
                {
                    "recommendations": [
                        {
                            "title": "Title 1",
                            "reason": "Brief reason for recommendation"
                        },
                        {
                            "title": "Title 2",
                            "reason": "Brief reason for recommendation"
                        },
                        {
                            "title": "Title 3",
                            "reason": "Brief reason for recommendation"
                        },
                        {
                            "title": "Title 4",
                            "reason": "Brief reason for recommendation"
                        }
                    ]
                }
                
                Recommendations should:
                1. Include only well-known and critically acclaimed content.
                2. Provide a mix of recommendations that share thematic or stylistic elements with the provided content but avoid being too similar.
                3. Be appropriate to the genre, audience, and tone of the provided content.
                4. Avoid obscure or niche content unless it is highly regarded within its category.
                5. Include reasons that clearly connect the recommendation to the provided content. 
                
                For example, reasons can highlight shared themes, emotional tone, narrative complexity, or visual style.`;


                try {
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
                        temperature: 0.2, // Lower temperature for more consistent formatting
                    });

                    const response = completion.choices[0]?.message?.content || "";
                    let recommendations: AIRecommendation[] = [];

                    try {
                        // Clean the response
                        const cleanResponse = response
                            .trim()
                            .replace(/```json/g, '')  // Remove any markdown formatting
                            .replace(/```/g, '')      // Remove any markdown formatting
                            .trim();

                        console.log('Cleaned response:', cleanResponse); // For debugging

                        const parsed = JSON.parse(cleanResponse);

                        if (!parsed || !parsed.recommendations || !Array.isArray(parsed.recommendations)) {
                            throw new Error('Invalid response format');
                        }

                        recommendations = parsed.recommendations;

                        // Fetch TMDB data for each recommendation
                        const recommendationsWithMedia = await Promise.all(
                            recommendations.map(async (rec) => {
                                try {
                                    const searchResults = await search(rec.title);
                                    const mediaMatch = searchResults[0];
                                    return { ...rec, media: mediaMatch };
                                } catch (error) {
                                    console.error(`Error fetching details for ${rec.title}:`, error);
                                    return rec;
                                }
                            })
                        );

                        // Sort recommendations by rating (highest first)
                        const sortedRecommendations = recommendationsWithMedia.sort((a, b) => {
                            // If no media or no popularity, put at the end
                            if (!a.media?.popularity) return 1;
                            if (!b.media?.popularity) return -1;

                            return b.media.popularity - a.media.popularity;
                        });

                        setAiRecommendations(sortedRecommendations);
                    } catch (error) {
                        console.error('Failed to parse AI response:', error);
                        console.log('Raw response:', response);
                        setAiRecommendations([]);
                    }
                } catch (error) {
                    console.error('AI Error:', error);
                    setAiRecommendations("Error generating recommendations. Please try again later.");
                }
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
            setIsAiLoading(false);
        }
    };

    // fetch recs with ollama
    const fetchRecs = async () => {
        if (!details) return;

        const response = await axios.post('/api/ollama', {
            prompt: `Based on this ${type}:
                    Title: "${details.title}"
                    Description: "${details.overview}"
                    
                    Recommend 3 ${type}s that would appeal to fans of this content.
                    Be brief but specific about why each recommendation fits.
                    Format: Name - Brief reason`
        });
        setAiRecommendations(response.data);
    }

    useEffect(() => {
        fetchDetails();
    }, [id, type]);

    return (
        <div className="p-8 max-w-6xl mx-auto min-h-screen mt-10">
            {isLoading ? (
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                </div>
            ) : (
                <>
                    {details && (
                        <div className="grid md:grid-cols-[300px_1fr] gap-12">
                            {/* Poster Section */}
                            <div className="space-y-6">
                                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900/40">
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
                                        alt={details.title}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>

                                {/* Key Info */}
                                <div className="space-y-6">
                                    {/* Rating & Year */}
                                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                                        <span className="text-amber-400">★</span>
                                        <span>{details.vote_average?.toFixed(1)}</span>
                                        <span className="text-zinc-600">•</span>
                                        <span>
                                            {new Date(details.release_date || '').getFullYear()}
                                        </span>
                                        {details.status && (
                                            <>
                                                <span className="text-zinc-600">•</span>
                                                <span>{details.status}</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Runtime or Seasons */}
                                    {'runtime' in details && details.runtime && (
                                        <div className="text-sm text-zinc-400">
                                            {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                                        </div>
                                    )}

                                    {/* Show Specific Details */}
                                    {'seasons' in details && details.seasons && (
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium text-zinc-300">Seasons</h3>
                                            <div className="space-y-3">
                                                {details.seasons.map((season) =>
                                                    season.vote_average > 0 && season.vote_average !== null && (
                                                        <div
                                                            key={season.id}
                                                            className="bg-zinc-900/30 rounded-lg p-3 space-y-2"
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <span className="text-sm font-medium">{season.name}</span>
                                                                {season.vote_average !== 0 && (
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-amber-400/90 text-xs">★</span>
                                                                        <span className="text-zinc-400 text-xs">
                                                                            {season.vote_average.toFixed(1)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-zinc-500">
                                                                {season.episode_count} Episodes • {new Date(season.air_date).getFullYear()}
                                                            </div>
                                                            {/* {season.overview && (
                                                        <p className="text-xs text-zinc-400 line-clamp-2">
                                                            {season.overview}
                                                        </p>
                                                    )} */}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Languages */}
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium text-zinc-300">Languages</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {details.spoken_languages?.map((lang) => (
                                                <span
                                                    key={lang.iso_639_1}
                                                    className="text-xs text-zinc-400 bg-zinc-900/30 px-2 py-1 rounded-full"
                                                >
                                                    {lang.english_name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Production Companies */}
                                    {details.production_companies && details.production_companies.length > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium text-zinc-300">Production</h3>
                                            <div className="text-sm text-zinc-400">
                                                {details.production_companies.map(company => company.name).join(', ')}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="space-y-8">
                                <div>
                                    <h1 className="text-3xl font-medium mb-4">
                                        {details.title}
                                    </h1>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {details.genres?.map((genre) => (
                                            <span
                                                key={genre.id}
                                                className="px-3 py-1 bg-zinc-800/50 rounded-full text-sm text-zinc-400"
                                            >
                                                {genre.name}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-zinc-400 leading-relaxed">
                                        {details.overview}
                                    </p>
                                </div>

                                {/* AI Recommendations */}
                                <div className="space-y-6">
                                    <h2 className="text-xl font-medium">Similar Recommendations</h2>

                                    {isAiLoading ? (
                                        <div className="flex items-center gap-2 text-zinc-500">
                                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                                            <span>Finding recommendations...</span>
                                        </div>
                                    ) : (
                                        <div className="grid sm:grid-cols-2 gap-6">
                                            {Array.isArray(aiRecommendations) && aiRecommendations.map((rec, index) => (
                                                <div
                                                    key={index}
                                                    className="flex flex-col bg-zinc-900/30 rounded-lg hover:bg-zinc-900/50 transition-colors duration-300"
                                                >
                                                    {rec.media?.poster_path && (
                                                        <div className="relative h-[200px] w-full rounded-t-lg overflow-hidden">
                                                            <Image
                                                                src={`https://image.tmdb.org/t/p/w500${rec.media.poster_path}`}
                                                                alt={rec.title}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="p-4 flex-1">
                                                        <div className="flex items-start justify-between gap-2 mb-2">
                                                            <h3 className="text-lg font-medium truncate">{rec.title}</h3>
                                                            {rec.media?.vote_average && (
                                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                                    <span className="text-amber-400/90 text-xs">★</span>
                                                                    <span className="text-zinc-400 text-xs">
                                                                        {rec.media.vote_average.toFixed(1)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {rec.media?.release_date && (
                                                            <div className="text-xs text-zinc-500 mb-3">
                                                                {new Date(rec.media.release_date).getFullYear()}
                                                            </div>
                                                        )}
                                                        <p className="text-sm text-zinc-400 leading-relaxed">{rec.reason}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
