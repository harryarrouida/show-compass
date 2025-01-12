import { useState } from "react";
import { RiRobot2Line } from "react-icons/ri";
import { IoChevronForwardOutline } from "react-icons/io5";
import { useTraktContext } from "@/context/traktContext";
import Groq from "groq-sdk";
import { search } from "@/services/content/sharedServices";

type MediaType = 'movies' | 'shows';

const TraktRecommendations = () => {
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [mediaType, setMediaType] = useState<MediaType>('movies');
    const { watchedMovies, watchedShows } = useTraktContext();
    const [recommendationsDetails, setRecommendationsDetails] = useState<any[]>([]);

    const generatePrompt = (type: MediaType, watchedContent: any[]) => {
        const recentContent = watchedContent
            // .slice(0, 10) // Take last 10 watched items
            .map(item => ({
                title: item.movie?.title || item.show?.title,
                genre: item.movie?.genres.name || item.show?.genres.name,
                year: new Date(item.movie?.year || item.show?.year).getFullYear(),
            }));

        return `Based on these recently watched ${type}:
${recentContent.map(item => `- ${item.title} (${item.year})`).join('\n')}

Generate exactly 5 ${type} recommendations that capture similar themes, styles, or narratives.
Respond with ONLY a clean JSON object in this format:
{
    "recommendations": [
        {
            "title": "Title",
            "reason": "Two clear, concise sentences explaining specific thematic or stylistic connections to the user's watch history. Focus on narrative elements, themes, and artistic approach."
        }
    ]
}

Rules for recommendations:
- Each reason must be exactly two sentences
- Do not mention ratings, reviews, or popularity
- Focus on specific thematic or stylistic connections
- Include at least one title from the last 5 years
- Avoid direct plot summaries and franchise titles

Remember: Return ONLY the JSON object with no additional text or explanation.`;
    };

    const handleRecommendations = async () => {
        setLoading(true);
        try {
            const watchedContent = mediaType === 'movies' ? watchedMovies : watchedShows;

            if (!watchedContent || watchedContent.length === 0) {
                throw new Error(`No watched ${mediaType} found`);
            }

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
                        content: generatePrompt(mediaType, watchedContent)
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

    return (
        <div className="mt-16 mb-20">
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-6 max-w-3xl mx-auto">
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

                        <div className="flex items-center gap-4">
                            <select
                                value={mediaType}
                                onChange={(e) => setMediaType(e.target.value as MediaType)}
                                className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-600"
                            >
                                <option value="movies">Movies</option>
                                <option value="shows">TV Shows</option>
                            </select>

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
                                        <span>Generate Recommendations</span>
                                        <IoChevronForwardOutline className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {recommendations.length > 0 && (
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {recommendations.map((rec, index) => (
                        <div
                            key={index}
                            className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-6 hover:bg-zinc-800/50 transition-colors duration-300"
                        >
                            <h3 className="text-lg font-medium text-white mb-2">{rec.title}</h3>
                            <p className="text-sm text-zinc-300 leading-relaxed">{rec.reason}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TraktRecommendations;