'use client';

import { useEffect, useState } from "react";
import { useTraktContext } from "@/context/traktContext";
import { IoTv, IoFilm, IoTime, IoCalendar } from "react-icons/io5";
import CardComponent from "@/components/shared/mediaCard";
import { getMovieDetails } from "@/services/content/movieServices";
import { getShowDetails } from "@/services/content/showServices";
import { search } from "@/services/content/sharedServices";
import Link from "next/link";
import WatchHistoryOverview from '@/components/WatchHistoryOverview';
const ITEMS_PER_PAGE = 20;

const Trakt = () => {
    const { handleToken, isAuthenticated, getUserWatchedMovies, getUserWatchedShows } = useTraktContext();
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'shows' | 'movies'>('shows');
    const [watchedMovies, setWatchedMovies] = useState<any[]>([]);
    const [watchedShows, setWatchedShows] = useState<any[]>([]);
    const [watchedMoviesDetails, setWatchedMoviesDetails] = useState<any[]>([]);
    const [watchedShowsDetails, setWatchedShowsDetails] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (isAuthenticated) {
            fetchWatchedData();
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            if (code) {
                handleToken(code);
            }
        }
    }, [isAuthenticated]);

    const fetchWatchedData = async () => {
        setIsLoading(true);
        try {
            const moviesWatchedData = await getUserWatchedMovies();
            const showsWatchedData = await getUserWatchedShows();
            setWatchedMovies(moviesWatchedData);
            setWatchedShows(showsWatchedData);

            // Wait for all movie details to resolve
            const movieDetails = await Promise.all(
                moviesWatchedData.map((movie: any) => getMovieDetails(movie.tmdbId))
            );
            
            // Wait for all show details to resolve
            const showDetails = await Promise.all(
                showsWatchedData.map((show: any) => getShowDetails(show.tmdbId))
            );
            
            setWatchedMoviesDetails(movieDetails);
            setWatchedShowsDetails(showDetails);

            console.log("watchedMoviesDetails", movieDetails);
            console.log("watchedShowsDetails", showDetails);
        } catch (error) {
            console.error('Error fetching watched data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate pagination
    const getCurrentItems = () => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return activeTab === 'movies' 
            ? watchedMoviesDetails.slice(startIndex, endIndex)
            : watchedShowsDetails.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(
        (activeTab === 'movies' ? watchedMoviesDetails.length : watchedShowsDetails.length) / ITEMS_PER_PAGE
    );

    if (!isAuthenticated) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">Connecting to Trakt...</h1>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto" />
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 max-w-6xl mx-auto min-h-screen mt-4 sm:mt-10">
            <h1 className="text-2xl font-bold mb-8">Watch History</h1>
            
            {/* Overview Stats */}
            <WatchHistoryOverview 
                watchedMovies={watchedMovies}
                watchedShows={watchedShows}
                watchedMoviesDetails={watchedMoviesDetails}
                watchedShowsDetails={watchedShowsDetails}
            />

            {/* Tabs */}
            <div className="flex items-center justify-end mb-8">
                <div className="flex space-x-4 border-b border-zinc-800">
                    <TabButton
                        active={activeTab === 'shows'}
                        onClick={() => {
                            setActiveTab('shows');
                            setCurrentPage(1);
                        }}
                    >
                        Shows ({watchedShowsDetails.length})
                    </TabButton>
                    <TabButton
                        active={activeTab === 'movies'}
                        onClick={() => {
                            setActiveTab('movies');
                            setCurrentPage(1);
                        }}
                    >
                        Movies ({watchedMoviesDetails.length})
                    </TabButton>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {getCurrentItems().map((item: any) => (
                    <Link 
                        href={`/recommendation/${item.id}/${activeTab === 'movies' ? 'movie' : 'show'}`} 
                        key={item.id}
                        className="group relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900/50 border border-zinc-800/50"
                    >
                        {item.poster_path ? (
                            <img
                                src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                                alt={activeTab === 'movies' ? item.title : item.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                <span className="text-zinc-400">No Image</span>
                            </div>
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                            <h3 className="text-sm font-semibold text-white line-clamp-2">
                                {activeTab === 'movies' ? item.title : item.name}
                            </h3>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-zinc-400">
                                    {new Date(activeTab === 'movies' ? item.release_date : item.first_air_date).getFullYear()}
                                </span>
                                <span className="text-xs text-yellow-400 flex items-center">
                                    ★ {item.vote_average.toFixed(1)}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-4">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-md bg-zinc-800/50 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700/50 transition-colors"
                    >
                        Previous
                    </button>
                    
                    <span className="text-zinc-400">
                        Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-md bg-zinc-800/50 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700/50 transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | number }) => (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-2">
            <div className="text-zinc-400">{icon}</div>
            <h3 className="text-zinc-400 text-sm">{title}</h3>
        </div>
        <p className="text-2xl font-bold">{value}</p>
    </div>
);

const TabButton = ({ children, active, onClick }: {
    children: React.ReactNode,
    active: boolean,
    onClick: () => void
}) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium transition-all relative
            ${active
                ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
    >
        {children}
    </button>
);

export default Trakt;
