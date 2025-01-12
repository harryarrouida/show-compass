"use client";
import { getShowDetails } from "@/services/content/showServices";
import { getMovieDetails } from "@/services/content/movieServices";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ShowDetails, MovieDetails } from "@/types/types";
import Groq from "groq-sdk";
import { searchMovies, searchShows } from "@/services/content/searchServices";
import MediaDetails from "@/components/shared/mediaDetails";
import { AIRecommendation } from "@/types/types";
import { generateDefaultPrompt, generateCustomPrompt } from '@/app/constants/aiPrompts';
import { search } from "@/services/content/sharedServices";

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


    useEffect(() => {
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
                    setDetails(mediaDetails as unknown as ShowDetails | MovieDetails);
                    setIsLoading(false);  // Show content while waiting for AI
                    setIsAiLoading(true); // Set AI loading state

                    console.log(mediaDetails);

                    // Integrate Groq call directly here
                    const groq = new Groq({
                        apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
                        dangerouslyAllowBrowser: true
                    });
                    const genres = mediaDetails.genres.map((genre: { name: string }) => genre.name).join(', ');
                    const defaultPrompt = generateDefaultPrompt(mediaDetails, type as string);


                    try {
                        const completion = await groq.chat.completions.create({
                            messages: [
                                {
                                    role: "system",
                                    content: "You are a JSON-only response bot. Always respond with valid JSON matching the exact format requested. Never include additional text or explanations."
                                },
                                {
                                    role: "user",
                                    content: defaultPrompt
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

        if (id && type) {
            fetchDetails();
        }
    }, [id, type]);

    if (!id || !type) {
        return <div>no id or type</div>;
    }

    const saveToHistory = (recommendation: AIRecommendation) => {
        const cardToSave = {
            title: recommendation.title,
            reason: recommendation.reason,
            media: recommendation.media,
            from: details?.title,
            poster_path: details?.poster_path,
            release_date: details?.release_date,
            genres: details?.genres,
            overview: details?.overview,
            vote_average: details?.vote_average,
            vote_count: details?.vote_count,
        }
        const history = localStorage.getItem('history');
        if (history) {
            const historyArray = JSON.parse(history);
            if (historyArray.some((item: any) => item.title === cardToSave.title)) {
                setAlert("Already in history");
                setTimeout(() => {
                    setAlert(null);
                }, 3000);
                return;
            }
            historyArray.push(cardToSave);
            localStorage.setItem('history', JSON.stringify(historyArray));
        } else {
            localStorage.setItem('history', JSON.stringify([cardToSave]));
        }
        setAlert("Saved to history");
        setTimeout(() => {
            setAlert(null);
        }, 3000);
    }

    const toggleChat = () => {
        setShowChat(!showChat);
        return !showChat;
    }
    const handleSubmitPrompt = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(prompt);
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
                model: "llama-3.3-70b-versatile",
                temperature: 0.2,
            });

            const response = completion.choices[0]?.message?.content || "";
            let recommendations: AIRecommendation[] = [];

            try {
                // Clean the response
                const cleanResponse = response
                    .trim()
                    .replace(/```json/g, '')
                    .replace(/```/g, '')
                    .trim();

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

                // Sort recommendations by popularity
                const sortedRecommendations = recommendationsWithMedia.sort((a, b) => {
                    if (!a.media?.popularity) return 1;
                    if (!b.media?.popularity) return -1;
                    return b.media.popularity - a.media.popularity;
                });
                console.log(sortedRecommendations);
                setAiRecommendations(sortedRecommendations);
                setPrompt(""); // Clear the prompt after successful submission
            } catch (error) {
                console.error('Failed to parse AI response:', error);
                console.log('Raw response:', response);
                setAiRecommendations("Error processing recommendations. Please try again.");
            }
        } catch (error) {
            console.error('AI Error:', error);
            setAiRecommendations("Error generating recommendations. Please try again later.");
        } finally {
            setIsAiLoading(false);
        }
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
