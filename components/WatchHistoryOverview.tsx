import { IoTv, IoFilm, IoTime, IoCalendar } from "react-icons/io5";

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
    watchedShowsDetails 
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

    // Get the earliest watch date
    const allDates = [
        ...watchedMovies.map(m => new Date(m.last_watched_at)),
        ...watchedShows.map(s => new Date(s.last_watched_at))
    ];
    const earliestDate = new Date(Math.min(...allDates));
    const trackingSince = earliestDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long'
    });

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
                icon={<IoFilm className="w-5 h-5" />}
                title="Movies Watched"
                value={watchedMovies.length}
                subtitle={`${movieDays}d ${movieHours}h`}
            />
            <StatCard
                icon={<IoTv className="w-5 h-5" />}
                title="Shows Watched"
                value={watchedShows.length}
                subtitle={`${showDays}d ${showHours}h`}
            />
            <StatCard
                icon={<IoTime className="w-5 h-5" />}
                title="Total Watch Time"
                value={`${totalDays}d ${totalHours}h`}
            />
            <StatCard
                icon={<IoCalendar className="w-5 h-5" />}
                title="Tracking Since"
                value={trackingSince}
            />
        </div>
    );
};

const StatCard = ({ icon, title, value, subtitle }: { 
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
}) => (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-2">
            <div className="text-zinc-400">{icon}</div>
            <h3 className="text-zinc-400 text-sm">{title}</h3>
        </div>
        <p className="text-xl font-semibold">{value}</p>
        {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}
    </div>
);

export default WatchHistoryOverview;
