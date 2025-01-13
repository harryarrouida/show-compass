import { ShowDetails, MovieDetails } from "@/types/types";
import { IoStar } from "react-icons/io5";

interface MediaMetadataProps {
    details: ShowDetails | MovieDetails;
    showAllSeasons: boolean;
    setShowAllSeasons: (show: boolean) => void;
}

export default function MediaMetadata({ details, showAllSeasons, setShowAllSeasons }: MediaMetadataProps) {
    return (
        <>
            {/* Show Specific Details */}
            {'seasons' in details && details.seasons && (
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-zinc-300">Seasons</h3>
                    <div className="space-y-3">
                        {details.seasons.slice(0, showAllSeasons ? details.seasons.length : 4).map((season: any) =>
                            season.vote_average > 0 && season.vote_average !== null && (
                                <div
                                    key={season.id}
                                    className="bg-zinc-900/30 rounded-lg p-3 space-y-2"
                                >
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm font-medium">{season.name}</span>
                                        {season.vote_average !== 0 && (
                                            <div className="flex items-center gap-1">
                                                <IoStar className="text-amber-400 text-xs" />
                                                <span className="text-zinc-300 text-xs">
                                                    {season.vote_average.toFixed(1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-zinc-500">
                                        {season.episode_count} Episodes • {new Date(season.air_date).getFullYear()}
                                    </div>
                                </div>
                            )
                        )}
                        <span 
                            className="text-xs text-zinc-500 cursor-pointer hover:text-zinc-400" 
                            onClick={() => setShowAllSeasons(!showAllSeasons)}
                        >
                            {details.seasons.length - 4} more - show all
                        </span>
                    </div>
                </div>
            )}

            {/* Languages */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-300">Languages</h3>
                <div className="flex flex-wrap gap-2">
                    {details.spoken_languages?.map((lang: any) => (
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
                        {details.production_companies.map((company: any) => <div key={company.id} className="inline-block bg-zinc-800/50 px-2 py-1 rounded-full text-xs hover:bg-zinc-700/50 transition-colors duration-300 cursor-pointer">{company.name}</div>).join(', ')}
                    </div>
                </div>
            )}
        </>
    );
}