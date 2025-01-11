'use client';

import { useState, useEffect } from 'react';
import { search } from '@/services/sharedServices';
import Link from 'next/link';
import { Movie, Show } from '@/types/types';

export default function SearchComponent() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Movie[] | Show[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestions] = useState(['Arcane', 'Attack on Titan', 'Monster']);

    useEffect(() => {
        const handleSearch = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const results = await search(query);
                const limitedResults = results.slice(0, 5);
                setResults(limitedResults);
            } catch (err) {
                setError('Something went wrong. Please try again.');
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
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 ">
            <div className="text-center mb-20">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 bg-gradient-to-r from-gray-100 via-gray-300 to-gray-100 bg-clip-text text-transparent animate-gradient tracking-tight">
                    Discover Your Next Favorite Story
                </h1>
                <p className="text-gray-300 text-base md:text-lg max-w-3xl mx-auto mb-14 leading-relaxed">
                    Find the perfect show or movie for any mood. From blockbuster hits to indie darlings, explore a world of entertainment tailored just for you.
                </p>

                <div className="max-w-2xl mx-auto">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-gray-700/30 to-gray-900/30 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for a show..."
                                aria-label="Search for shows or movies"
                                className="w-full px-8 py-5 text-base md:text-lg rounded-full bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700/50 transition-all duration-300"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery('')}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                    aria-label="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Results Section */}
                    {results.length > 0 && (
                        <div className="mt-10">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                                {results.map((item: Movie | Show) => (
                                    <Link
                                        href={`/recommendation/${item.id}/${item.type}`}
                                        key={item.id}
                                        className="group transform hover:scale-[1.02] transition-all duration-300"
                                    >
                                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-black/40">
                                            <img
                                                src={item.poster_path
                                                    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                                                    : '/placeholder-poster.png'
                                                }
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        </div>
                                        <div className="mt-5 space-y-3">
                                            <h3 className="text-gray-100 text-base font-medium line-clamp-1 group-hover:text-gray-300 transition-colors duration-300">
                                                {item.title}
                                            </h3>
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
                                                    <span className="text-amber-400/90 text-sm">★</span>
                                                    <span className="text-gray-300 text-sm ml-2 font-light">
                                                        {item.vote_average}
                                                    </span>
                                                </div>
                                                <span className="text-gray-500 text-sm font-light">
                                                    {new Date(item.release_date).getFullYear()}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="mt-10">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                                {[...Array(5)].map((_, index) => (
                                    <div key={index} className="animate-pulse">
                                        <div className="aspect-[2/3] rounded-xl bg-black/40" />
                                        <div className="mt-4 space-y-3">
                                            <div className="h-5 bg-black/40 rounded-lg w-3/4" />
                                            <div className="h-4 bg-black/40 rounded-lg w-1/2" />
                                        </div>
                                    </div>
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
                        <div className="mt-6 text-base text-gray-500 text-center">
                            Try: {suggestions.map((suggestion, index) => (
                                <span key={suggestion}>
                                    <button
                                        onClick={() => setQuery(suggestion)}
                                        className="text-gray-400 hover:text-gray-300 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-gray-700 rounded px-2 transition-colors duration-300"
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