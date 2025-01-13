'use client';

import { useEffect, useState } from "react";
import { useTraktContext } from "@/context/traktContext";
import { IoLogOut } from "react-icons/io5";
import { getMovieDetails } from "@/services/content/movieServices";
import { getShowDetails } from "@/services/content/showServices";
import { useRouter } from 'next/navigation';
import WatchHistoryOverview from '@/components/WatchHistoryOverview';
import TraktRecommendations from '@/components/trakt/traktRecommendations';
import MediaCard from '@/components/shared/mediaCard';
import MediaCardContainer from "@/components/shared/MediaCardContainer";

const ITEMS_PER_PAGE = 20;

const Trakt = () => {
    const { handleToken, isAuthenticated, getUserWatchedMovies, getUserWatchedShows, logout, watchedMoviesCache, watchedShowsCache} = useTraktContext();
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'shows' | 'movies'>('shows');
    const [watchedMovies, setWatchedMovies] = useState<any[]>(watchedMoviesCache);
    const [watchedShows, setWatchedShows] = useState<any[]>(watchedShowsCache);
    const [watchedMoviesDetails, setWatchedMoviesDetails] = useState<any[]>([]);
    const [watchedShowsDetails, setWatchedShowsDetails] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [mediaCards, setMediaCards] = useState<any[]>([]);
    const [mappedMovies, setMappedMovies] = useState<any[]>([]);
    const [mappedShows, setMappedShows] = useState<any[]>([]);

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

    useEffect(() => {
        if (isAuthenticated) {
            fetchWatchedData();
        }
    }, [isAuthenticated]);

    const fetchWatchedData = async () => {
        setIsLoading(true);
        try {
            const moviesWatchedData = await getUserWatchedMovies();
            const showsWatchedData = await getUserWatchedShows();
            setWatchedMovies(moviesWatchedData);
            setWatchedShows(showsWatchedData);

            let movieDetails: any[] = [];
            let showDetails: any[] = [];

            // Wait for all movie details to resolve
            if (moviesWatchedData && moviesWatchedData.length > 0) {
                movieDetails = await Promise.all(
                    moviesWatchedData.map((movie: any) => getMovieDetails(movie.tmdbId))
                );
                setWatchedMoviesDetails(movieDetails);
            }

            // Wait for all show details to resolve
            if (showsWatchedData.length > 0) {
                showDetails = await Promise.all(
                    showsWatchedData.map((show: any) => getShowDetails(show.tmdbId))
                );
                setWatchedShowsDetails(showDetails);
            }

            const newMappedMovies = movieDetails.map((movie: any) => ({
                media: {
                    id: movie.id,
                    vote_average: movie.vote_average,
                    title: movie.title,
                    release_date: movie.release_date,
                    poster_path: movie.poster_path,
                    type: 'movie'
                }
            }));

            const newMappedShows = showDetails.map((show: any) => ({
                media: {
                    id: show.id,
                    vote_average: show.vote_average,
                    title: show.name,
                    release_date: show.first_air_date,
                    poster_path: show.poster_path,
                    type: 'show'
                }
            }));

            setMappedMovies(newMappedMovies);
            setMappedShows(newMappedShows);
            setMediaCards([...newMappedMovies, ...newMappedShows]);
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

    console.log("mediaCards", mediaCards);

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
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 min-h-screen py-12 space-y-16">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Watch History</h1>
                <button onClick={handleLogout} className="flex items-center hover:scale-105 transition-all duration-300">
                    <IoLogOut className="text-xl mr-2 text-red-500" />
                    <div className="text-red-500">Logout</div>
                </button>
            </div>

            <WatchHistoryOverview
                watchedMovies={watchedMovies}
                watchedShows={watchedShows}
                watchedMoviesDetails={watchedMoviesDetails}
                watchedShowsDetails={watchedShowsDetails}
            />

            <TraktRecommendations />

            <div className="flex justify-center">
                <div className="inline-flex space-x-12 border-b border-zinc-800/50 backdrop-blur-sm">
                    <button
                        onClick={() => {
                            setActiveTab('shows');
                            setCurrentPage(1);
                        }}
                        className={`pb-4 px-3 text-base font-medium transition-all duration-300 relative ${
                            activeTab === 'shows'
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
                        className={`pb-4 px-3 text-base font-medium transition-all duration-300 relative ${
                            activeTab === 'movies'
                                ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-zinc-400 after:to-zinc-600'
                                : 'text-zinc-500 hover:text-zinc-400'
                        }`}
                    >
                        Movies ({watchedMoviesDetails.length})
                    </button>
                </div>
            </div>

            {mediaCards.length > 0 && (
                // <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mx-12">
                //     {(activeTab === 'movies' ? mappedMovies : mappedShows).map((item: any) => (
                //         <MediaCard key={item.media.id} item={item.media} activeTab={activeTab} />
                //     ))}
                // </div>
                <MediaCardContainer
                    mediaCards={mediaCards}
                    activeTab={activeTab}
                />
            )}
        </div>
    );
};

export default Trakt;
