"use client";
import { getShowDetails } from "@/services/showServices";
import { getMovieDetails } from "@/services/movieServices";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { showDetails, movieDetails } from "@/types/types";
import Image from 'next/image';
import axios from "axios";

export default function RecommendationPage() {
    const [details, setDetails] = useState<showDetails | movieDetails | null>(null);
    const [aiRecommendations, setAiRecommendations] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const { id, type } = useParams();
    if (!id || !type) {
        return <div>no id or type</div>;
    }

    useEffect(() => {
        const fetchDetailsAndGetAIRecommendations = async () => {
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
                    
                    // Now fetch AI recommendations
                    setIsAiLoading(true);
                    const prompt = `Based on this ${type}:
                        Title: "${mediaDetails.title}"
                        Description: "${mediaDetails.overview}"
                        
                        Recommend 3 ${type}s that would appeal to fans of this content.
                        Be brief but specific about why each recommendation fits.
                        Format: Name - Brief reason`;
                    
                    const response = await axios.post('/api/ollama', {
                        prompt
                    });

                    const data = response.data;
                    setAiRecommendations(data.response);
                    console.log(data.response)
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
                setIsAiLoading(false);
            }
        };

        fetchDetailsAndGetAIRecommendations();
    }, [id, type]);

    return (
        <div className="p-6 max-w-6xl mx-auto bg-background text-foreground">
            {isLoading ? (
                <div className="flex justify-center items-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
                </div>
            ) : (
                <>
                    {details && (
                        <div className="grid md:grid-cols-[300px_1fr] gap-8">
                            {/* Left Column - Image and Quick Info */}
                            <div className="space-y-4">
                                <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-lg">
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
                                        alt={details.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                
                                <div className="bg-background/5 p-4 rounded-lg space-y-2 backdrop-blur-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-yellow-500">★</span>
                                        <span className="font-medium">
                                            {details.vote_average?.toFixed(1)}/10
                                        </span>
                                        <span className="text-foreground/60 text-sm">
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

                            {/* Right Column - Details and Recommendations */}
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-4xl font-bold mb-2">{details.title}</h1>
                                    {details.tagline && (
                                        <p className="text-xl text-foreground/60 italic mb-4">
                                            "{details.tagline}"
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {details.genres?.map((genre) => (
                                            <span 
                                                key={genre.id}
                                                className="px-3 py-1 bg-foreground/10 rounded-full text-sm bg-zinc-500/10"
                                            >
                                                {genre.name}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-lg leading-relaxed mb-6">
                                        {details.overview}
                                    </p>
                                </div>

                                {/* AI Recommendations Section */}
                                <div className="bg-background/5 p-6 rounded-lg backdrop-blur-sm">
                                    <h2 className="text-2xl font-semibold mb-4">
                                        AI Recommendations
                                    </h2>
                                    {isAiLoading ? (
                                        <div className="flex items-center gap-2 text-foreground/60">
                                            <div className="animate-spin h-5 w-5 border-2 border-foreground/60 rounded-full border-t-transparent"></div>
                                            <span>Generating recommendations...</span>
                                        </div>
                                    ) : (
                                        <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                                            {aiRecommendations}
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
