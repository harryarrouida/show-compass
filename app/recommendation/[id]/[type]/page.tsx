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
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-background to-background/80">
            {isLoading ? (
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary/20 border-t-primary"></div>
                </div>
            ) : (
                <>
                    {details && (
                        <div className="grid md:grid-cols-[350px_1fr] gap-12">
                            {/* Left Column - Enhanced styling */}
                            <div className="space-y-6">
                                <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
                                        alt={details.title}
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                </div>

                                {/* Enhanced info box */}
                                <div className="bg-white/5 p-5 rounded-xl space-y-3 backdrop-blur-sm ring-1 ring-white/10">
                                    <div className="flex items-center gap-2">
                                        <span className="text-yellow-400 text-xl">★</span>
                                        <span className="font-semibold text-lg">
                                            {details.vote_average?.toFixed(1)}/10
                                        </span>
                                        <span className="text-foreground/50 text-sm">
                                            ({details.vote_count} votes)
                                        </span>
                                    </div>

                                    {'release_date' in details && (
                                        <p className="text-foreground/80">
                                            Release Date: {new Date(details.release_date).toLocaleDateString()}
                                        </p>
                                    )}

                                    {'first_air_date' in details && (
                                        <p className="text-foreground/80">
                                            First Air Date: {new Date(details.first_air_date).toLocaleDateString()}
                                        </p>
                                    )}

                                    {'runtime' in details && details.runtime && (
                                        <p className="text-foreground/80">
                                            Runtime: {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                                        </p>
                                    )}

                                    {'number_of_seasons' in details && (
                                        <p className="text-foreground/80">
                                            Seasons: {details.number_of_seasons}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Enhanced typography and spacing */}
                            <div className="space-y-8">
                                <div>
                                    <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                                        {details.title}
                                    </h1>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {details.genres?.map((genre) => (
                                            <span
                                                key={genre.id}
                                                className="px-4 py-1.5 bg-white/5 rounded-full text-sm font-medium ring-1 ring-white/10 hover:bg-white/10 transition-colors"
                                            >
                                                {genre.name}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-lg leading-relaxed text-foreground/80">
                                        {details.overview}
                                    </p>
                                </div>

                                {/* AI Recommendations - Enhanced card */}
                                <div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm ring-1 ring-white/10">
                                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                                        <span className="text-white">AI Recommendations</span>
                                    </h2>
                                    {isAiLoading ? (
                                        <div className="flex items-center gap-3 text-foreground/60">
                                            <div className="animate-spin h-5 w-5 border-2 border-primary/60 rounded-full border-t-transparent"></div>
                                            <span>Generating recommendations...</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {aiRecommendations.map((rec, index) => (
                                                <div key={index} className="flex gap-4 items-start border-b border-white/10 pb-4">
                                                    {rec.media && (
                                                        <div className="relative w-32 h-48 flex-shrink-0 rounded-md overflow-hidden">
                                                            <Image
                                                                src={`https://image.tmdb.org/t/p/w500${rec.media.poster_path}`}
                                                                alt={rec.title}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-semibold mb-2">{rec.title}</h3>
                                                        <p className="text-foreground/80 text-sm leading-relaxed">{rec.reason}</p>
                                                        {rec.media && (
                                                            <div className="mt-2 flex items-center gap-2 text-sm text-foreground/60">
                                                                <span className="text-yellow-400">★</span>
                                                                <span>{rec.media.vote_average?.toFixed(1)}</span>
                                                                <span>•</span>
                                                                <span>
                                                                    {new Date(rec.media.first_air_date || rec.media.release_date).getFullYear()}
                                                                </span>
                                                            </div>
                                                        )}
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
