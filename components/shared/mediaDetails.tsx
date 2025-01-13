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
    console.log(details);
    return (
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8 md:gap-14 mb-16">
            {/* Left Column */}
            <div className="space-y-8">
                {/* Poster */}
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900/40">
                    <Image
                        src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${details.poster_path}`}
                        alt={details.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Show Details */}
                <div className="space-y-8">
                    {/* Rating & Year */}
                    <div className="flex items-center gap-3 text-base text-zinc-300">
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
                        <div className="text-sm text-zinc-400">
                            {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                        </div>
                    )}

                    {/* Genres */}
                    {details.genres && (
                        <div className="flex flex-wrap gap-2.5">
                            {details.genres.map((genre) => (
                                <span
                                    key={genre.id}
                                    className="px-4 py-1.5 bg-zinc-800/70 hover:bg-zinc-700/70 rounded-full text-sm text-zinc-200 transition-colors duration-300 cursor-pointer"
                                >
                                    {genre.name}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Show Specific Details - Seasons */}
                    {'seasons' in details && details.seasons && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-zinc-300">Seasons</h3>
                            <div className="space-y-3">
                                {details.seasons
                                    .slice(0, showAllSeasons ? undefined : 4)
                                    .map((season) => (
                                        <div
                                            key={season.id}
                                            className="bg-zinc-800/30 rounded-lg p-3 space-y-2"
                                        >
                                            <div className="flex justify-between items-start">
                                                <span className="text-sm font-medium">{season.name}</span>
                                                {season.vote_average > 0 && (
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
                                        </div>
                                    ))}
                                {details.seasons.length > 4 && (
                                    <button
                                        onClick={() => setShowAllSeasons(!showAllSeasons)}
                                        className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
                                    >
                                        {showAllSeasons ? 'Show Less' : `Show All ${details.seasons.length} Seasons`}
                                    </button>
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
                                    className="text-xs text-zinc-400 bg-zinc-800/30 px-2 py-1 rounded-full"
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

            {/* Right Column */}
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-6">{details.title}</h1>
                    <p className="text-zinc-300 text-lg leading-relaxed">{details.overview}</p>
                    <div className="mt-12">
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
                {/* {'seasons' in details && (
                    <ShowsEpRating show={details as any} episodeNumber={1} seasonNumber={1} />
                )} */}
            </div>
        </div>
    );
}