'use client';

import { useState, useEffect } from 'react';
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
        let active = true;
        const handleSearch = async () => {
            if (query.length < 2) {
                setResults([]);
                setIsLoading(false);
                setError(null);
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

                if (active) setResults(combinedResults);
            } catch (err) {
                if (active) {
                    setResults([]);
                    setError('Something went wrong. Please try again.');
                }
                console.error('Search error:', err);
            } finally {
                if (active) setIsLoading(false);
            }
        };

        const debounce = setTimeout(() => {
            handleSearch();
        }, 300);

        return () => {
            active = false;
            clearTimeout(debounce);
        };
    }, [query]);

    return (
        <div className="rounded-2xl border border-border-primary bg-background-secondary px-4 py-8 sm:px-8 sm:py-12">
            <div className="text-center">
                <h1 className="mb-3 text-3xl font-bold tracking-tight text-text-primary sm:text-5xl">Find your next watch</h1>
                <p className="mx-auto mb-6 max-w-xl text-base leading-relaxed text-text-secondary">
                    Search for a movie or show to get recommendations based on what you like.
                </p>

                <div className="mx-auto">
                    <div className="max-w-3xl mx-auto">
                        <div className="relative">
                            <input
                                type="search"
                                aria-label="Search movies and TV shows"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search movies and TV shows"
                                className="w-full px-4 pr-14 py-3 rounded-xl bg-background-primary [&::-webkit-search-cancel-button]:hidden border border-border-primary text-text-primary placeholder-text-tertiary focus:border-accent-primary transition-colors"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery('')}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 icon-action"
                                    aria-label="Clear search"
                                >
                                    <IoClose size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results Section */}
                    {results.length > 0 && !isLoading && (
                        <div className="mt-8">
                            <div className="poster-grid text-left">
                                {results.map((item) => (
                                    <MediaCard key={`${item.type}-${item.id}`} item={item} activeTab="" />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="mt-8" aria-busy="true" aria-label="Searching">
                            <div className="poster-grid text-left">
                                {[...Array(5)].map((_, index) => (
                                    <CardSkeleton key={index} index={index} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error and Empty States */}
                    {error && (
                        <div role="alert" className="text-red-400 text-base text-center mt-10">
                            {error}
                        </div>
                    )}

                    {query.length >= 2 && !isLoading && results.length === 0 && !error && (
                        <div role="status" className="text-text-secondary text-base text-center mt-6">
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
                                        className="text-accent-hover underline-offset-4 hover:underline rounded px-2 py-2 transition-colors"
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