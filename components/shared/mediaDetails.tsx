import Image from 'next/image';
import { ShowDetails, MovieDetails } from "@/types/types";
import AIRecommendations from '@/components/recommendations/aiRecommendations';
import { AIRecommendation } from '@/types/types';

interface MediaDetailsProps {
    details: ShowDetails | MovieDetails;
    showAllSeasons: boolean;
    setShowAllSeasons: (show: boolean) => void;
    aiRecommendations: AIRecommendation[];
    isAiLoading: boolean;
    saveToHistory: (recommendation: AIRecommendation) => void;
    alert: string | null;
    toggleChat: () => boolean;
    showChat: boolean;
    setPrompt: (prompt: string) => void;
    prompt: string;
    handleSubmitPrompt: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export default function MediaDetails({ details, showAllSeasons, setShowAllSeasons, aiRecommendations, isAiLoading, saveToHistory, alert, toggleChat, showChat, setPrompt, prompt, handleSubmitPrompt }: MediaDetailsProps) {
    return (
        <div className="flex flex-col md:grid md:grid-cols-[320px_1fr] gap-4 md:gap-8 mb-6 md:mb-12">
            {/* Left Column */}
            <div className="space-y-4 md:space-y-6 bg-zinc-900/50 rounded-lg border border-zinc-800/50 backdrop-blur p-4 w-full">
                {/* Poster with responsive sizing */}
                <div className="relative aspect-[2/3] w-[180px] md:w-[280px] mx-auto md:max-w-none rounded-lg overflow-hidden bg-zinc-900/40">
                    <Image
                        src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${details.poster_path}`}
                        alt={details.title}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 768px) 180px, 280px"
                    />
                </div>

                {/* Quick info section */}
                <div className="space-y-3 md:space-y-6 px-4 md:px-0">
                    {/* Rating & Year */}
                    <div className="flex items-center justify-center md:justify-start gap-3 text-sm md:text-base text-zinc-300">
                        <span className="text-amber-400">★</span>
                        <span>{details.vote_average?.toFixed(1)}</span>
                        <span className="text-zinc-500">•</span>
                        <span>
                            {details.type === 'movie'
                                ? new Date(details.release_date).getFullYear()
                                : new Date(details.first_air_date).getFullYear()}
                        </span>
                    </div>

                    {/* Runtime */}
                    {'runtime' in details && details.runtime && (
                        <div className="text-xs md:text-sm text-center md:text-left text-zinc-400">
                            {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                        </div>
                    )}

                    {/* Genres */}
                    {details.genres && (
                        <div className="overflow-x-auto scrollbar-hide -mx-4 md:mx-0 px-4 md:px-0">
                            <div className="flex flex-wrap md:flex-wrap gap-1.5 md:gap-2 min-w-min justify-center md:justify-start">
                                {details.genres.map((genre) => (
                                    <span
                                        key={genre.id}
                                        className="px-3 md:px-4 py-1 md:py-1.5 bg-zinc-800/70 hover:bg-zinc-700/70 rounded-full text-xs md:text-sm text-zinc-200 whitespace-nowrap"
                                    >
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Show Specific Details - Seasons */}
                    {'seasons' in details && details.seasons && (
                        <div className="space-y-3 md:space-y-4 hidden md:block">
                            <h3 className="text-sm font-medium text-zinc-300 text-center md:text-left">Seasons</h3>
                            <div className="space-y-2 md:space-y-3">
                                {details.seasons
                                    .slice(0, showAllSeasons ? undefined : 4)
                                    .map((season) => (
                                        <div
                                            key={season.id}
                                            className="bg-zinc-800/30 rounded-lg p-3 md:p-4 space-y-1.5 md:space-y-2"
                                        >
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs md:text-sm font-medium">{season.name}</span>
                                                {season.vote_average > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-amber-400/90 text-xs">★</span>
                                                        <span className="text-zinc-400 text-xs">
                                                            {season.vote_average.toFixed(1)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-[10px] md:text-xs text-zinc-500">
                                                {season.episode_count} Episodes • {new Date(season.air_date).getFullYear()}
                                            </div>
                                        </div>
                                    ))}
                                {details.seasons.length > 4 && (
                                    <button
                                        onClick={() => setShowAllSeasons(!showAllSeasons)}
                                        className="w-full text-center text-xs md:text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
                                    >
                                        {showAllSeasons ? 'Show Less' : `Show All ${details.seasons.length} Seasons`}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Languages */}
                    <div className="space-y-2 md:space-y-3">
                        <h3 className="text-xs md:text-sm font-medium text-zinc-300 text-center md:text-left">Languages</h3>
                        <div className="flex flex-wrap gap-1.5 md:gap-2 justify-center md:justify-start">
                            {details.spoken_languages?.map((lang) => (
                                <span
                                    key={lang.iso_639_1}
                                    className="text-[10px] md:text-xs text-zinc-400 bg-zinc-800/30 px-2 md:px-3 py-1 md:py-1.5 rounded-full"
                                >
                                    {lang.english_name}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Production Companies */}
                    {details.production_companies && details.production_companies.length > 0 && (
                        <div className="space-y-2 md:space-y-3 hidden md:block">
                            <h3 className="text-sm font-medium text-zinc-300 text-center md:text-left">Production</h3>
                            <div className="text-xs md:text-sm text-zinc-400 text-center md:text-left">
                                {details.production_companies.map(company => company.name).join(', ')}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 md:space-y-6 px-4 md:px-0">
                <div>
                    <h1 className="text-2xl md:text-4xl font-semibold text-white mb-3 md:mb-4 text-center md:text-left">{details.title}</h1>
                    <p className="text-base md:text-lg text-zinc-300 leading-relaxed text-center md:text-left bg-zinc-900/50 p-4 md:p-5 rounded-xl border border-zinc-800/50">{details.overview}</p>
                </div>
                
                <div className="mt-6 md:mt-8">
                    <AIRecommendations
                        isAiLoading={isAiLoading}
                        aiRecommendations={aiRecommendations}
                        saveToHistory={saveToHistory}
                        alert={alert}
                        toggleChat={toggleChat}
                        showChat={showChat}
                        setPrompt={setPrompt}
                        prompt={prompt}
                        handleSubmitPrompt={handleSubmitPrompt}
                    />
                </div>
            </div>
        </div>
    );
}