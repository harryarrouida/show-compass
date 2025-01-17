'use client';

import { useState, useEffect } from 'react';
import { MappedMovie, MappedShow } from '@/types/types';
import { searchMovies } from '@/services/content/movieServices';
import { searchShows } from '@/services/content/showServices';
import MediaCard from './shared/mediaCard';

export default function SearchComponent() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<(MappedMovie | MappedShow)[]>([]);
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
                    Find the perfect show or movie for any mood. From blockbuster hits to indie darlings, explore a world of entertainment tailored just for you.
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
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Results Section */}
                    {results.length > 0 && (
                        <div className="mt-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {results.map((item) => (
                                    // <Link
                                    //     href={`/recommendation/${item.id}/${item.type}`}
                                    //     key={item.id}
                                    //     className="w-full group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-lg"
                                    // >
                                    //     <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-zinc-900/50 transition-all duration-500">
                                    //         <Image
                                    //             src={item.poster_path
                                    //                 ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                                    //                 : '/placeholder-poster.png'
                                    //             }
                                    //             alt={item.title}
                                    //             fill
                                    //             className="object-cover transform transition-all duration-500 group-hover:scale-[1.02]"
                                    //             sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    //         />
                                    //         <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    //     </div>
                                    //     <div className="mt-5 space-y-3">
                                    //         <h3 className="text-start text-zinc-200 text-base font-medium leading-snug line-clamp-1 group-hover:text-white transition-colors duration-300">
                                    //             {item.title}
                                    //         </h3>
                                    //         <div className="flex items-center space-x-4">
                                    //             <div className="flex items-center bg-zinc-900/50 backdrop-blur-sm rounded-full px-3 py-1.5">
                                    //                 <span className="text-amber-400/90 text-sm">★</span>
                                    //                 <span className="text-zinc-300 text-sm ml-2 font-light">
                                    //                     {item.vote_average?.toFixed(1)}
                                    //                 </span>
                                    //             </div>
                                    //             <span className="text-zinc-400 text-sm font-light">
                                    //                 {item.release_date ? new Date(item.release_date).getFullYear() : ''}
                                    //             </span>
                                    //         </div>
                                    //     </div>
                                    // </Link>
                                    <MediaCard key={item.id} item={item} activeTab="" />
                                ))}
                            </div>
                            
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="mt-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {[...Array(4)].map((_, index) => (
                                    <div key={index} className="animate-pulse">
                                        <div className="aspect-[2/3] rounded-lg bg-zinc-900/50" />
                                        <div className="mt-5 space-y-3">
                                            <div className="h-5 bg-zinc-900/50 rounded w-3/4" />
                                            <div className="flex items-center space-x-4">
                                                <div className="h-6 bg-zinc-900/50 rounded-full w-20" />
                                                <div className="h-6 bg-zinc-900/50 rounded w-16" />
                                            </div>
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