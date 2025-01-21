'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MappedMovie, MappedShow } from '@/types/types';
import { searchMovies } from '@/services/content/movieServices';
import { searchShows } from '@/services/content/showServices';
import MediaCard from '@/components/bigData/mediaCard';
import CardSkeleton from '@/components/shared/loaders/CardSkeleton';
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
                    .slice(0, 5); // Limit to top 5 results

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
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 pt-16">
            <div className="text-center mb-20">
                <h1 className="w-full text-4xl md:text-6xl lg:text-7xl font-bold mb-8 text-white tracking-tight">Discover Your Next Favorite Story</h1>
                <p className="text-zinc-300 text-base md:text-lg max-w-3xl mx-auto mb-14 leading-relaxed">
                    Discover personalized entertainment recommendations that match your interests. From critically acclaimed masterpieces to hidden gems, find your next great watch.
                </p>

                <div className="mx-auto">
                    <div className="max-w-3xl mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for a show..."
                                className="w-full px-8 py-5 rounded-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery('')}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                    aria-label="Clear search"
                                >
                                    <IoClose size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Results Section */}
                    {results.length > 0 && (
                        <div className="mt-20">
                            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                                {results.map((item) => (
                                    <MediaCard key={item.id} item={item} activeTab="" />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="mt-10">
                            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                                {[...Array(5)].map((_, index) => (
                                    <CardSkeleton key={index} index={index} />
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
                        <div className="text-zinc-500 text-base text-center mt-10">
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
                                        className="text-blue-400 underline-offset-2 hover:underline rounded px-2 transition-colors"
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