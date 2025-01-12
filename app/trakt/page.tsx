'use client';

import { useEffect, useState } from "react";
import { useTraktContext } from "@/context/traktContext";
import { IoLogOut } from "react-icons/io5";
import CardComponent from "@/components/shared/mediaCard";
import { getMovieDetails } from "@/services/content/movieServices";
import { getShowDetails } from "@/services/content/showServices";
import { search } from "@/services/content/sharedServices";
import Link from "next/link";
import WatchHistoryOverview from '@/components/trakt/WatchHistoryOverview';
import { useRouter } from 'next/navigation';
import TraktRecommendations from '@/components/trakt/traktRecommendations';

const ITEMS_PER_PAGE = 20;

const Trakt = () => {
    const { handleToken, isAuthenticated, getUserWatchedMovies, getUserWatchedShows, logout } = useTraktContext();
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'shows' | 'movies'>('shows');
    const [watchedMovies, setWatchedMovies] = useState<any[]>([]);
    const [watchedShows, setWatchedShows] = useState<any[]>([]);
    const [watchedMoviesDetails, setWatchedMoviesDetails] = useState<any[]>([]);
    const [watchedShowsDetails, setWatchedShowsDetails] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const router = useRouter();

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

    const handleLogout = () => {
        logout();
        router.push('/');
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
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 min-h-screen py-12">
            <div className="flex justify-between items-center mb-8 flex justify-center items-center">
                <h1 className="text-2xl font-bold">Watch History</h1>
                <button onClick={handleLogout} className="flex items-center hover:scale-105 transition-all duration-300">
                    <IoLogOut className="text-xl mr-2 text-red-500" />
                    <div className="text-red-500">Logout</div>
                </button>
            </div>

            {/* Overview Stats */}
            <WatchHistoryOverview
                watchedMovies={watchedMovies}
                watchedShows={watchedShows}
                watchedMoviesDetails={watchedMoviesDetails}
                watchedShowsDetails={watchedShowsDetails}
            />

            {/* Recommendations */}
            <TraktRecommendations />

            {/* Tabs */}
            <div className="flex justify-center mb-16">
                <div className="inline-flex space-x-12 border-b border-zinc-800/50 backdrop-blur-sm">
                    <button
                        onClick={() => {
                            setActiveTab('shows');
                            setCurrentPage(1);
                        }}
                        className={`pb-4 px-3 text-base font-medium transition-all duration-300 relative ${activeTab === 'shows'
                            ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-zinc-400 after:to-zinc-600'
                            : 'text-zinc-500 hover:text-zinc-400'
                            }`}
                    >
                        Shows ({watchedShowsDetails.length})
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('movies');
                            setCurrentPage(1);
                        }}
                        className={`pb-4 px-3 text-base font-medium transition-all duration-300 relative ${activeTab === 'movies'
                            ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-zinc-400 after:to-zinc-600'
                            : 'text-zinc-500 hover:text-zinc-400'
                            }`}
                    >
                        Movies ({watchedMoviesDetails.length})
                    </button>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {getCurrentItems().map((item: any) => (
                    <CardComponent key={item.id} item={item} activeTab={activeTab} />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-20 mb-16 flex justify-center">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="group relative px-8 py-3 bg-gradient-to-r from-zinc-700 to-zinc-800 
                                disabled:from-zinc-900 disabled:to-zinc-900 disabled:cursor-not-allowed
                                text-white text-sm rounded-full transition-all duration-300
                                hover:shadow-lg hover:shadow-zinc-800/25 mr-4"
                    >
                        Previous
                    </button>

                    <span className="text-zinc-400 flex items-center mx-4">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="group relative px-8 py-3 bg-gradient-to-r from-zinc-700 to-zinc-800 
                                disabled:from-zinc-900 disabled:to-zinc-900 disabled:cursor-not-allowed
                                text-white text-sm rounded-full transition-all duration-300
                                hover:shadow-lg hover:shadow-zinc-800/25"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Trakt;
