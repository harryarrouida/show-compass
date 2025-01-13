"use client";

import { useState } from 'react';
import Image from 'next/image';
import { IoTrashOutline, IoStarOutline, IoStar } from 'react-icons/io5';
import Card from '@/components/shared/Card';
import { useHistory } from '@/context/historyContext';
import { MappedMovie, MappedShow } from '@/types/types';

interface HistoryItem {
    id: number;
    mediaType: 'movie' | 'show';
    timestamp: number;
    data: MappedMovie | MappedShow;
    reason: string;
    from: MappedMovie | MappedShow | string;
}

export default function HistoryPage() {
    const [showAll, setShowAll] = useState(false);
    const { history: historyContext, clearHistory } = useHistory();

    const displayHistory = showAll ? historyContext : historyContext.slice(0, 2);

    const toggleShowAll = () => {
        setShowAll(!showAll);
    }

    const getFromTitle = (from: MappedMovie | MappedShow | string) => {
        if (typeof from === 'string') return from;
        return from.title || from.name || 'Unknown';
    }

    const getFromPosterPath = (from: MappedMovie | MappedShow | string) => {
        if (typeof from === 'string') return null;
        return from.poster_path;
    }

    return (
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
            <h1 className="text-2xl font-semibold text-white mb-8">History</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayHistory.map((item) => (
                    <Card key={item.id}>
                        <div className="flex gap-4 p-4">
                            {item.data.poster_path && (
                                <div className="relative w-32 h-48 flex-shrink-0 rounded-lg overflow-hidden">
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${item.data.poster_path}`}
                                        alt={item.data.title || item.data.name || ''}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-white">{item.data.title}</h3>
                                <div className="flex items-center gap-2 mt-1 ">
                                    {item.data.release_date && (
                                        <span className="text-sm text-zinc-500">
                                            {new Date(item.data.release_date).getFullYear()}
                                        </span>
                                    )}
                                    {item.data.vote_average && (
                                        <span className="text-sm text-zinc-500 flex items-center">
                                            • {item.data.vote_average.toFixed(1)} <IoStar className="ml-1 text-yellow-500" />
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-zinc-400 mt-2 line-clamp-3">{item.reason}</p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 border-t border-zinc-800/50 bg-zinc-900/30">
                            {getFromPosterPath(item.from) && (
                                <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                                    <Image 
                                        src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${getFromPosterPath(item.from)}`}
                                        alt={getFromTitle(item.from)}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-zinc-500">Based on</p>
                                <h4 className="text-sm font-medium text-zinc-300">{getFromTitle(item.from)}</h4>
                                <p className="text-xs text-zinc-500 mt-1">
                                    Added {new Date(item.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {historyContext.length === 0 && (
                <Card className="p-8 text-center">
                    <p className="text-zinc-400">
                        No history found. Start exploring recommendations to build your history!
                    </p>
                </Card>
            )}

            {historyContext.length > 0 && (
                <div className="flex justify-center mt-8 space-x-4">
                    <button
                        onClick={toggleShowAll}
                        className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
                    >
                        {showAll ? 'Show Less' : 'Show All'}
                    </button>
                    <button
                        onClick={clearHistory}
                        className="flex items-center px-4 py-2 text-sm text-red-500 hover:text-red-400 transition-colors"
                    >
                        <IoTrashOutline className="w-4 h-4 mr-2" />
                        Clear History
                    </button>
                </div>
            )}
        </div>
    );
}
