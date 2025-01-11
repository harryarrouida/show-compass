'use client';

import { useState, useEffect } from 'react';
import { getPopularShows, getTrendingShows } from '@/services/showServices';
import { getTrendingMovies } from '@/services/movieServices';
import { Show, Movie } from '@/types/types';
import CardComponent from './shared/mediaCard';

export default function DataGrid() {
    const [activeTab, setActiveTab] = useState('shows');
    const [shows, setShows] = useState<Show[]>([]);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const data = activeTab === 'movies' ? movies : shows;

    const fetchShows = async (pageNum: number) => {
        setIsLoading(true);
        try {
            const data = await getTrendingShows(pageNum);
            if (pageNum === 1) {
                setShows(data);
            } else {
                setShows(prevShows => [...prevShows, ...data]);
            }
        } catch (error) {
            console.error('Error fetching shows:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMovies = async (pageNum: number) => {
        setIsLoading(true);
        try {
            const data = await getTrendingMovies(pageNum);
            if (pageNum === 1) {
                setMovies(data);
            } else {
                setMovies(prevMovies => [...prevMovies, ...data]);
            }
        } catch (error) {
            console.error('Error fetching movies:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        if (activeTab === 'movies') {
            fetchMovies(1);
        } else {
            fetchShows(1);
        }
    }, [activeTab]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        if (activeTab === 'movies') {
            fetchMovies(nextPage);
        } else {
            fetchShows(nextPage);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="flex justify-center mb-16">
                <div className="inline-flex space-x-12 border-b border-zinc-800/50 backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab('shows')}
                        className={`pb-4 px-3 text-base font-medium transition-all duration-300 relative ${
                            activeTab === 'shows'
                                ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-zinc-400 after:to-zinc-600'
                                : 'text-zinc-500 hover:text-zinc-400'
                        }`}
                    >
                        Shows
                    </button>
                    <button
                        onClick={() => setActiveTab('movies')}
                        className={`pb-4 px-3 text-base font-medium transition-all duration-300 relative ${
                            activeTab === 'movies'
                                ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-zinc-400 after:to-zinc-600'
                                : 'text-zinc-500 hover:text-zinc-400'
                        }`}
                    >
                        Movies
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {data.map((item) => (
                    <CardComponent key={item.id} item={item} activeTab={activeTab} />
                ))}
            </div>

            <div className="mt-20 mb-16 flex justify-center">
                <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="group relative px-8 py-3 bg-gradient-to-r from-zinc-700 to-zinc-800 
                             disabled:from-zinc-900 disabled:to-zinc-900 disabled:cursor-not-allowed
                             text-white text-sm rounded-full transition-all duration-300
                             hover:shadow-lg hover:shadow-zinc-800/25"
                >
                    <div className="relative flex items-center space-x-2">
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-zinc-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-zinc-300">Loading...</span>
                            </>
                        ) : (
                            <span className="text-zinc-300">Load More</span>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
}
