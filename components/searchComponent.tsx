'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MappedMovie, MappedShow } from '@/types/types';
import { searchMovies } from '@/services/content/movieServices';
import { searchShows } from '@/services/content/showServices';
import MediaCard from './shared/mediaCard';
import { CardSkeleton } from './shared/LoadingSkeleton';
import { IoClose } from 'react-icons/io5';

export default function SearchComponent() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<(MappedMovie | MappedShow)[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestions] = useState(['Arcane', 'Attack on Titan', 'Frieren']);

    useEffect(() => {
        const handleSearch = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Search both movies and shows
                const [movieResults, showResults] = await Promise.all([
                    searchMovies(query),
                    searchShows(query)
                ]);

                // Combine and sort results by popularity
                const combinedResults = [...movieResults, ...showResults]
                    .sort((a, b) => (b.popularity || 0 && b.vote_count || 0) - (a.popularity || 0 && a.vote_count || 0))
                    .slice(0, 8); // Limit to top 8 results

                setResults(combinedResults);
            } catch (err) {
                setError('Something went wrong. Please try again.');
                console.error('Search error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        const debounce = setTimeout(() => {
            handleSearch();
        }, 300);

        return () => clearTimeout(debounce);
    }, [query]);

    return (
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16">
            <div className="text-center mb-20">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 bg-gradient-to-r from-gray-100 via-gray-300 to-gray-100 bg-clip-text text-transparent animate-gradient tracking-tight">
                    Discover Your Next Favorite Story
                </h1>
                <p className="text-gray-300 text-base md:text-lg max-w-3xl mx-auto mb-14 leading-relaxed">
                    Discover personalized entertainment recommendations that match your interests. From critically acclaimed masterpieces to hidden gems, find your next great watch.
                </p>

                <div className="max-w-3xl mx-auto">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-gray-700/30 to-gray-900/30 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for a show..."
                                aria-label="Search for shows or movies"
                                className="w-full px-8 py-5 text-base md:text-lg rounded-full bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-0 transition-all duration-300 ease-in-out"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery('')}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                    aria-label="Clear search"
                                >
                                    <IoClose size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Results Section */}
                    {results.length > 0 && (
                        <div className="mt-10 mx-auto">
                            <div className="mx-auto grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {results.map((item) => (
                                    <MediaCard key={item.id} item={item} activeTab="" />
                                ))}
                            </div>
                            
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="mt-10">
                            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {[...Array(4)].map((_, index) => (
                                    // <div key={index} className="animate-pulse">
                                    //     <div className="aspect-[2/3] rounded-lg bg-zinc-900/50" />
                                    //     <div className="mt-5 space-y-3">
                                    //         <div className="h-5 bg-zinc-900/50 rounded w-3/4" />
                                    //         <div className="flex items-center space-x-4">
                                    //             <div className="h-6 bg-zinc-900/50 rounded-full w-20" />
                                    //             <div className="h-6 bg-zinc-900/50 rounded w-16" />
                                    //         </div>
                                    //     </div>
                                    // </div>
                                    <CardSkeleton key={index} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error and Empty States */}
                    {error && (
                        <div className="text-red-400 text-base text-center mt-10">
                            {error}
                        </div>
                    )}

                    {query.length >= 2 && !isLoading && results.length === 0 && !error && (
                        <div className="text-gray-500 text-base text-center mt-10">
                            No results found for "{query}"
                        </div>
                    )}

                    {/* Suggestions */}
                    {!results.length && !isLoading && (
                        <div className="mt-6 text-base text-zinc-400 text-center">
                            Try: {suggestions.map((suggestion, index) => (
                                <span key={suggestion}>
                                    <button
                                        onClick={() => setQuery(suggestion)}
                                        className="text-violet-400 hover:text-violet-300 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-violet-500/20 rounded px-2 transition-colors duration-300"
                                    >
                                        {suggestion}
                                    </button>
                                    {index < suggestions.length - 1 && ' • '}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}