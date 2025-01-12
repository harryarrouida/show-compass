import { IoTv, IoFilm, IoTime } from "react-icons/io5";
import { SiTrakt } from "react-icons/si";
import { useTraktContext } from "@/context/traktContext";
interface WatchHistoryOverviewProps {
    watchedMovies: any[];
    watchedShows: any[];
    watchedMoviesDetails: any[];
    watchedShowsDetails: any[];
}

const WatchHistoryOverview = ({ 
    watchedMovies, 
    watchedShows, 
    watchedMoviesDetails, 
    watchedShowsDetails,
}: WatchHistoryOverviewProps) => {
    // Calculate movie watch time using actual runtime
    const movieMinutes = watchedMoviesDetails.reduce((acc, movie) => acc + (movie.runtime || 0), 0);
    const movieDays = Math.floor(movieMinutes / (24 * 60));
    const movieHours = Math.floor((movieMinutes % (24 * 60)) / 60);

    // Calculate show watch time using episode runtime and season count
    const showMinutes = watchedShowsDetails.reduce((acc, show) => {
        const episodeRuntime = show.episode_run_time?.[0] || 0;
        const seasonsCount = show.number_of_seasons || 0;
        const episodesPerSeason = show.number_of_episodes ? Math.ceil(show.number_of_episodes / seasonsCount) : 0;
        return acc + (episodeRuntime * episodesPerSeason * seasonsCount);
    }, 0);
    const showDays = Math.floor(showMinutes / (24 * 60));
    const showHours = Math.floor((showMinutes % (24 * 60)) / 60);

    // Calculate total time
    const totalMinutes = movieMinutes + showMinutes;
    const totalDays = Math.floor(totalMinutes / (24 * 60));
    const totalHours = Math.floor((totalMinutes % (24 * 60)) / 60);

    const { user } = useTraktContext();

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
                icon={<SiTrakt className="w-5 h-5 text-[#ED1C24]" />}
                title="Username"
                value={user?.username || ''}
                className="col-span-2 md:col-span-1"
            />
            <StatCard
                icon={<IoTv className="w-5 h-5" />}
                title="Series Watch Time"
                value={`${showDays}d ${showHours}h`}
                subtitle={`${watchedShows.length} shows`}
            />
            <StatCard
                icon={<IoFilm className="w-5 h-5" />}
                title="Movies Watch Time"
                value={`${movieDays}d ${movieHours}h`}
                subtitle={`${watchedMovies.length} movies`}
            />
            <StatCard
                icon={<IoTime className="w-5 h-5" />}
                title="Total Watch Time"
                value={`${totalDays}d ${totalHours}h`}
                subtitle="Combined time"
                className="bg-gradient-to-br from-zinc-900/50 to-zinc-800/50"
            />
        </div>
    );
};

const StatCard = ({ icon, title, value, subtitle, className = '' }: { 
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
    className?: string;
}) => (
    <div className={`bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-4 hover:border-zinc-700/50 transition-colors ${className}`}>
        <div className="flex items-center space-x-3 mb-2">
            <div className="text-zinc-400">{icon}</div>
            <h3 className="text-zinc-400 text-sm">{title}</h3>
        </div>
        <p className="text-xl font-semibold">{value}</p>
        {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}
    </div>
);

export default WatchHistoryOverview;
