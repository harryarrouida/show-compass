'use client';

import { useState, useEffect } from 'react';
import { MappedShow, MappedMovie } from '@/types/types';
import MediaCard from '@/components/shared/mediaCard';

interface DataGridProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    shows: MappedShow[];
    setShows: (shows: MappedShow[]) => void;
    movies: MappedMovie[];
    setMovies: (movies: MappedMovie[]) => void;
    page: number;
    setPage: (page: number) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

export default function DataGrid({
    activeTab,
    setActiveTab,
    shows,
    setShows,
    movies,
    setMovies,
    page,
    setPage,
    isLoading,
    setIsLoading
}: DataGridProps) {
    const data = activeTab === 'movies' ? movies : shows;

    useEffect(() => {
        setPage(1);
    }, [activeTab, setPage]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center mb-6">
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

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-3 ">
                {data.map((item) => (
                    <MediaCard key={item.id} item={item} activeTab={activeTab} />
                ))}
            </div>

            <div className="mt-8 mb-6 flex justify-center">
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
