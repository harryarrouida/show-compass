import { IoTv, IoFilm, IoTime, IoLogOut } from "react-icons/io5";
import { SiTrakt } from "react-icons/si";
import { useTraktContext } from "@/context/traktContext";
import { useRouter } from 'next/navigation';

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

    const { user, logout } = useTraktContext();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <div className="space-y-8">
            <div className="bg-zinc-900/30 rounded-2xl p-6 border border-zinc-800/50">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3 px-4 py-2 bg-zinc-800/30 rounded-full">
                        <SiTrakt className="w-5 h-5 text-[#ED1C24]" />
                        <span className="text-lg font-medium">{user?.username || ''}</span>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className="flex items-center space-x-2 px-4 py-2 bg-zinc-800/30 rounded-full hover:bg-zinc-800/50 transition-all duration-300"
                    >
                        <IoLogOut className="w-5 h-5 text-red-500" />
                        <span className="text-red-500">Logout</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-3 text-zinc-400">
                            <IoTv className="w-5 h-5" />
                            <span className="text-sm">Series Watch Time</span>
                        </div>
                        <p className="text-3xl font-light">{`${showDays}d ${showHours}h`}</p>
                        <p className="text-sm text-zinc-500">{`${watchedShows.length} shows`}</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center space-x-3 text-zinc-400">
                            <IoFilm className="w-5 h-5" />
                            <span className="text-sm">Movies Watch Time</span>
                        </div>
                        <p className="text-3xl font-light">{`${movieDays}d ${movieHours}h`}</p>
                        <p className="text-sm text-zinc-500">{`${watchedMovies.length} movies`}</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center space-x-3 text-zinc-400">
                            <IoTime className="w-5 h-5" />
                            <span className="text-sm">Total Time Watched</span>
                        </div>
                        <p className="text-3xl font-light">{`${totalDays}d ${totalHours}h`}</p>
                        <p className="text-sm text-zinc-500">Combined watch time</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WatchHistoryOverview;
