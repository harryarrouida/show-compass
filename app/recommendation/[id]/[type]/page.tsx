"use client";
import { getShowDetails } from "@/services/showServices";
import { getMovieDetails } from "@/services/movieServices";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { showDetails, movieDetails, Show, Movie } from "@/types/types";
import Groq from "groq-sdk";
import { search } from "@/services/sharedServices";
import MediaDetails from "@/components/shared/mediaDetails";
import { AIRecommendation } from "@/types/types";

export default function RecommendationPage() {
    const [details, setDetails] = useState<showDetails | movieDetails | null>(null);
    const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[] | string>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const { id, type } = useParams();
    const [showAllSeasons, setShowAllSeasons] = useState(false);
    const [alert, setAlert] = useState<string | null>(null);

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
                    Release Year: ${new Date(mediaDetails.release_date).getFullYear()}
                    Average Rating: ${mediaDetails.vote_average}
                    
                    Generate exactly 4 recommendations in the following JSON format with no additional text or explanation:
                    {
                        "recommendations": [
                            {
                                "title": "Title 1",
                                "reason": "2 sentence reason explaining specific thematic or stylistic connections"
                            },
                            {
                                "title": "Title 2",
                                "reason": "2 sentence reason explaining specific thematic or stylistic connections"
                            }, 
                            {
                                "title": "Title 3",
                                "reason": "2 sentence reason explaining specific thematic or stylistic connections"
                            },
                            {
                                "title": "Title 4",
                                "reason": "2 sentence reason explaining specific thematic or stylistic connections"
                            }
                        ]
                    }
                    
                    Recommendations must follow these rules:
                    1. Focus on critically acclaimed ${type}s from any era (minimum 7/10 rating on IMDb or similar platforms)
                    2. Include at least one modern (last 5 years)
                    3. Match the tone, maturity level, and target audience of the original
                    4. Prioritize recommendations that share multiple elements:
                       - Similar themes or philosophical questions
                       - Comparable narrative structure or storytelling approach
                       - Matching emotional resonance or atmosphere
                       - Similar visual style or technical achievements
                    5. Avoid:
                       - Direct competitors or extremely similar plots
                       - Obscure titles unless they won major awards
                       - Sequels or entries in the same franchise
                    
                    Each reason must specifically reference elements from the original ${type} and explain how they connect to the recommendation.`;


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
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
}
