'use client';

import { useState, useEffect } from 'react';
import { search } from '@/services/sharedServices';
import Link from 'next/link';
import { Movie, Show } from '@/types/types';

export default function SearchComponent() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Movie[] | Show[]>([]);
    const [suggestions] = useState(['Arcane', 'Attack on Titan', 'Monster']);

    useEffect(() => {
        const handleSearch = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }

            const results = await search(query);
            const limitedResults = results.slice(0, 5);
            setResults(limitedResults);
        };

        const debounce = setTimeout(() => {
            handleSearch();
        }, 300);

        return () => clearTimeout(debounce);
    }, [query]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-16">
                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-200 bg-clip-text text-transparent animate-gradient">
                    Discover Your Next Favorite Story
                </h1>
                <p className="text-zinc-400 text-lg max-w-3xl mx-auto mb-12 leading-relaxed">
                    Find the perfect show or movie for any mood. From blockbuster hits to indie darlings, explore a world of entertainment tailored just for you.
                </p>

                <div className="max-w-2xl mx-auto">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-zinc-500/20 to-zinc-700/20 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search for a show..."
                            className="w-full px-6 py-4 text-lg rounded-full bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700/50 transition-all duration-300"
                        />
                    </div>
                    <div className="mt-4 text-sm text-zinc-500">
                        Try: {suggestions.map((suggestion, index) => (
                            <span key={suggestion}>
                                <button
                                    onClick={() => setQuery(suggestion)}
                                    className="text-zinc-400 hover:text-zinc-300 underline focus:outline-none transition-colors duration-200"
                                >
                                    {suggestion}
                                </button>
                                {index < suggestions.length - 1 && ', '}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {results.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                    {results.map((item: Movie | Show) => (
                        <Link
                            href={`/recommendation/${item.id}/${item.type}`}
                            key={item.id}
                            className="group transform hover:scale-105 transition-all duration-300"
                        >
                            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-900/40 shadow-lg shadow-black/50">
                                <img
                                    src={item.poster_path
                                        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                                        : '/placeholder-poster.png'
                                    }
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <h3 className="text-white text-sm font-medium truncate">
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center mt-2 space-x-3">
                                            <div className="flex items-center px-2 py-1 rounded-full bg-yellow-500/20 backdrop-blur-sm">
                                                <span className="text-yellow-400 text-xs">⭐</span>
                                                <span className="text-yellow-400 text-xs ml-1 font-medium">
                                                    {item.vote_average}
                                                </span>
                                            </div>
                                            <span className="text-gray-300 text-xs">
                                                {new Date(item.release_date).getFullYear()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}