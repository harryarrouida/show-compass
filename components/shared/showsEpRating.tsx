import { Show, Episode } from "@/types/types";
import { getShowEpisodes } from "@/services/showServices";
import { useEffect, useState } from "react";

interface ShowsEpRatingProps {
    show: Show;
    episodeNumber: number;
    seasonNumber: number;
}

export default function ShowsEpRating({ show, episodeNumber, seasonNumber }: ShowsEpRatingProps) {
    const [episode, setEpisode] = useState<Episode | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEpisode = async () => {
            setIsLoading(true);
            try {
                const data: Episode[] = await getShowEpisodes(show.id, seasonNumber, episodeNumber);
                setEpisode(data[0]);
                setError(null);
            } catch (error) {
                console.error(error);
                setError("Error fetching episode ratings");
            } finally {
                setIsLoading(false);
            }
        };

        fetchEpisode();
    }, [show.id, seasonNumber, episodeNumber]);

    if (isLoading) {
        return (
            <div className="animate-pulse">
                <div className="h-24 bg-zinc-800/50 rounded-lg"></div>
            </div>
        );
    }

    if (error || !episode) {
        return <div className="text-zinc-500 text-sm">Rating not available</div>;
    }

    return (
        <div className="bg-card-bg rounded-lg p-4 space-y-3">
            <h4 className="text-zinc-200 font-medium">{episode.name}</h4>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <span className="text-amber-400">★</span>
                    <span className="text-zinc-300">{episode.vote_average.toFixed(1)}</span>
                </div>
                <span className="text-zinc-500 text-sm">
                    {episode.vote_count} votes
                </span>
            </div>
            {episode.still_path && (
                <img
                    src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                    alt={episode.name}
                    className="w-full h-auto rounded-md"
                />
            )}
            <p className="text-zinc-400 text-sm line-clamp-2">{episode.overview}</p>
        </div>
    );
}