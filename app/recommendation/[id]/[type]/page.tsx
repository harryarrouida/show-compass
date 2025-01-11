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

                // Integrate Groq call directly here
                const groq = new Groq({
                    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
                    dangerouslyAllowBrowser: true
                });
                const prompt = `Based on this ${type}:
                    Title: "${mediaDetails.title}"
                    Description: "${mediaDetails.overview}"
                    
                    Recommend 3 ${type}s that would appeal to fans of this content.
                    Format your response exactly like this example:
                    {
                        "recommendations": [
                            {"title": "Movie Name 1", "reason": "Brief reason for recommendation"},
                            {"title": "Movie Name 2", "reason": "Brief reason for recommendation"},
                            {"title": "Movie Name 3", "reason": "Brief reason for recommendation"}
                        ]
                    }`;

                try {
                    const completion = await groq.chat.completions.create({
                        messages: [{ role: "user", content: prompt }],
                        model: "llama-3.3-70b-versatile",
                    });

                    const response = completion.choices[0]?.message?.content || "";
                    let recommendations: AIRecommendation[] = [];

                    try {
                        const parsed = await JSON.parse(response);
                        recommendations = parsed.recommendations;

                        // Fetch TMDB data for each recommendation
                        const recommendationsWithMedia = await Promise.all(
                            recommendations.map(async (rec) => {
                                try {
                                    const searchResults = await search(rec.title);
                                    // Take the first result that matches the media type
                                    const mediaMatch = searchResults[0];
                                    return { ...rec, media: mediaMatch };
                                } catch (error) {
                                    console.error(`Error fetching details for ${rec.title}:`, error);
                                    return rec;
                                }
                            })
                        );
                        setAiRecommendations(recommendationsWithMedia);
                    } catch (error) {
                        console.error('Failed to parse AI response:', error);
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
        <div className="p-8 max-w-6xl mx-auto min-h-screen">
            {isLoading ? (
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                </div>
            ) : (
                <>
                    {details && (
                        <div className="grid md:grid-cols-[300px_1fr] gap-12">
                            {/* Poster Section */}
                            <div>
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
                                <div className="mt-6 space-y-3 text-sm text-zinc-400">
                                    <div className="flex items-center gap-2">
                                        <span className="text-amber-400">★</span>
                                        <span>{details.vote_average?.toFixed(1)}</span>
                                        <span className="text-zinc-600">•</span>
                                        <span>
                                            {new Date(details.release_date || details.first_air_date).getFullYear()}
                                        </span>
                                    </div>
                                    {'runtime' in details && details.runtime && (
                                        <div>{Math.floor(details.runtime / 60)}h {details.runtime % 60}m</div>
                                    )}
                                    {'number_of_seasons' in details && (
                                        <div>{details.number_of_seasons} Seasons</div>
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
