"use client";
import { getShowDetails } from "@/services/content/showServices";
import { getMovieDetails } from "@/services/content/movieServices";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ShowDetails, MovieDetails, MappedMovie, MappedShow } from "@/types/types";
import Groq from "groq-sdk";
import { searchMovies, searchShows } from "@/services/content/searchServices";
import MediaDetails from "@/components/shared/mediaDetails";
import { AIRecommendation } from "@/types/types";
import { generateDefaultPrompt, generateCustomPrompt } from '@/constants/aiPrompts';
import { search } from "@/services/content/sharedServices";
import { useHistory } from '@/context/historyContext';

export default function RecommendationPage() {
    const [details, setDetails] = useState<ShowDetails | MovieDetails | null>(null);
    const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[] | string>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const { id, type } = useParams();
    const [showAllSeasons, setShowAllSeasons] = useState(false);
    const [alert, setAlert] = useState<string | null>(null);
    const [showChat, setShowChat] = useState(false);
    const [prompt, setPrompt] = useState("");
    const { saveToHistory: saveToHistoryContext } = useHistory();

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

                    const groq = new Groq({
                        apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY!,
                        dangerouslyAllowBrowser: true
                    });

                    const completion = await groq.chat.completions.create({
                        messages: [
                            {
                                role: "system",
                                content: "You are a JSON-only response bot. Always respond with valid JSON matching the exact format requested. Never include additional text or explanations."
                            },
                            {
                                role: "user",
                                content: generateDefaultPrompt(mediaDetails, type as string)
                            }
                        ],
                        model: "llama3-8b-8192",
                        temperature: 0.2,
                        max_tokens: 1000,
                        response_format: { type: "json_object" }
                    });

                    const response = completion.choices[0]?.message?.content || "";
                    
                    try {
                        const cleanResponse = response.trim();
                        const parsed = JSON.parse(cleanResponse);

                        if (!parsed || !parsed.recommendations || !Array.isArray(parsed.recommendations)) {
                            throw new Error('Invalid response format');
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
                                                type: type
                                            }
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
                            .filter(rec => rec.media)
                            .sort((a, b) => {
                                if (!a.media?.popularity) return 1;
                                if (!b.media?.popularity) return -1;
                                return b.media.popularity - a.media.popularity;
                            });

                        setAiRecommendations(sortedRecommendations);
                    } catch (error) {
                        console.error('Failed to parse AI response:', error);
                        setAiRecommendations([]);
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                setAiRecommendations([]);
            } finally {
                setIsLoading(false);
                setIsAiLoading(false);
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
            type as 'movie' | 'show',
            recommendation.reason,
            details as ShowDetails | MovieDetails
        );
    }   

    const toggleChat = () => {
        setShowChat(!showChat);
        return !showChat;
    }

    const handleSubmitPrompt = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsAiLoading(true);
        try {
            const groq = new Groq({
                apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
                dangerouslyAllowBrowser: true
            });
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a JSON-only response bot. Always respond with valid JSON matching the exact format requested. Never include additional text or explanations."
                    },
                    {
                        role: "user",
                        content: generateCustomPrompt(details, type as string, prompt)
                    }
                ],
                model: "mixtral-8x7b-32768",
                temperature: 0.2,
                response_format: { type: "json_object" }
            });

            const response = completion.choices[0]?.message?.content || "";
            
            try {
                const cleanResponse = response.trim();
                const parsed = JSON.parse(cleanResponse);

                if (!parsed || !parsed.recommendations || !Array.isArray(parsed.recommendations)) {
                    throw new Error('Invalid response format');
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
                                        type: type
                                    }
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
                    .filter(rec => rec.media)
                    .sort((a, b) => {
                        if (!a.media?.popularity) return 1;
                        if (!b.media?.popularity) return -1;
                        return b.media.popularity - a.media.popularity;
                    });

                setAiRecommendations(sortedRecommendations);
                setPrompt("");
            } catch (error) {
                console.error('Failed to parse AI response:', error);
                setAiRecommendations([]);
            }
        } catch (error) {
            console.error('AI Error:', error);
            setAiRecommendations([]);
        } finally {
            setIsAiLoading(false);
        }
    }

    if (!id || !type) {
        return <div>no id or type</div>;
    }

    return (
        <div className="p-4 sm:p-8 max-w-6xl mx-auto min-h-screen mt-4 sm:mt-10">
            {isLoading ? (
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                </div>
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
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
}
