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
        <div className="space-y-12 mx-4 sm:mx-16 mt-8 sm:mt-12">
            <div className="bg-gradient-to-br from-zinc-900/40 to-zinc-900/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-zinc-800/30 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
                    <div className="flex items-center space-x-3 px-4 sm:px-5 py-2 sm:py-2.5 bg-zinc-800/20 rounded-full border border-zinc-700/30 backdrop-blur-md w-full sm:w-auto">
                        <SiTrakt className="w-4 sm:w-5 h-4 sm:h-5 text-[#ED1C24]" />
                        <span className="text-base sm:text-lg font-medium bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                            {user?.username || ''}
                        </span>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className="flex items-center space-x-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-zinc-800/20 rounded-full border border-red-500/20 hover:bg-red-500/10 transition-all duration-300 group w-full sm:w-auto justify-center"
                    >
                        <IoLogOut className="w-4 sm:w-5 h-4 sm:h-5 text-red-400 group-hover:text-red-300 transition-colors" />
                        <span className="text-red-400 group-hover:text-red-300 transition-colors">Logout</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-zinc-800/10 border border-zinc-700/20 hover:border-zinc-700/40 transition-colors duration-300">
                        <div className="flex items-center space-x-3 text-zinc-400 mb-3 sm:mb-4">
                            <IoTv className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400" />
                            <span className="text-sm font-medium">Series Watch Time</span>
                        </div>
                        <p className="text-3xl sm:text-4xl font-light bg-gradient-to-r from-blue-300 to-blue-500 bg-clip-text text-transparent">
                            {`${showDays}d ${showHours}h`}
                        </p>
                        <p className="text-xs sm:text-sm text-zinc-500 mt-2">{`${watchedShows.length} shows watched`}</p>
                    </div>

                    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-zinc-800/10 border border-zinc-700/20 hover:border-zinc-700/40 transition-colors duration-300">
                        <div className="flex items-center space-x-3 text-zinc-400 mb-3 sm:mb-4">
                            <IoFilm className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400" />
                            <span className="text-sm font-medium">Movies Watch Time</span>
                        </div>
                        <p className="text-3xl sm:text-4xl font-light bg-gradient-to-r from-purple-300 to-purple-500 bg-clip-text text-transparent">
                            {`${movieDays}d ${movieHours}h`}
                        </p>
                        <p className="text-xs sm:text-sm text-zinc-500 mt-2">{`${watchedMovies.length} movies watched`}</p>
                    </div>

                    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-zinc-800/10 border border-zinc-700/20 hover:border-zinc-700/40 transition-colors duration-300">
                        <div className="flex items-center space-x-3 text-zinc-400 mb-3 sm:mb-4">
                            <IoTime className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-400" />
                            <span className="text-sm font-medium">Total Time Watched</span>
                        </div>
                        <p className="text-3xl sm:text-4xl font-light bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                            {`${totalDays}d ${totalHours}h`}
                        </p>
                        <p className="text-xs sm:text-sm text-zinc-500 mt-2">Combined watch time</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WatchHistoryOverview;
