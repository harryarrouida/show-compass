"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { IoTrashOutline, IoStarOutline, IoStar, IoAnalytics } from 'react-icons/io5';
import { RiRobot2Line } from "react-icons/ri";
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
    const { history: historyContext, clearHistory, deleteFromHistory } = useHistory();

    const displayHistory = showAll ? historyContext : historyContext.slice(0, 2);

    const toggleShowAll = () => {
        setShowAll(!showAll);
    }

    const getFromTitle = (from: MappedMovie | MappedShow | string) => {
        if (typeof from === 'string') {
            if (from === 'trakt') {
                return 'Trakt Recommendation';
            }
            if (from === 'Unknown') {
                return 'AI Recommendation';
            }
        }
        return (from as MappedMovie).title || (from as MappedShow).title || 'Unknown';
    }

    const getFromPosterPath = (from: MappedMovie | MappedShow | string) => {
        if (typeof from === 'string') {
            if (from === 'trakt') {
                return <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden shadow-md bg-zinc-800 flex items-center justify-center">
                    <IoAnalytics className="w-8 h-8 text-blue-400" />
                </div>;
            }
            if (from === 'Unknown') {
                return <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden shadow-md bg-zinc-800 flex items-center justify-center">
                    <IoAnalytics className="w-8 h-8 text-blue-400" />
                </div>;
            }
        }
        return (from as MappedMovie).poster_path || (from as MappedShow).poster_path;
    }

    const handleDelete = (id: number) => {
        deleteFromHistory(id);
    }

    return (
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
            <h1 className="text-3xl font-bold text-white mb-8">History</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayHistory.map((item) => {
                    return (
                        <Card key={item.id} className="bg-zinc-900/80 backdrop-blur">
                            <div className="flex gap-4 p-6">
                                {item.data.poster_path && (
                                    <div className="relative w-32 h-48 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${item.data.poster_path}`}
                                            alt={item.data.title || ''}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}

                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-white">{item.data.title}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        {item.data.release_date && (
                                            <span className="text-sm text-zinc-400">
                                                {new Date(item.data.release_date).getFullYear()}
                                            </span>
                                        )}
                                        {item.data.vote_average && (
                                            <span className="text-sm text-zinc-400 flex items-center">
                                                • {item.data.vote_average.toFixed(1)}
                                                <IoStar
                                                    style={{ color: '#FACC15' }}
                                                    className="ml-1 !text-yellow-400"
                                                    size={16}
                                                />
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-zinc-300 mt-3 line-clamp-3">{item.reason}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 border-t border-zinc-700/50 bg-zinc-800/50">
                                {typeof item.from === 'string' ? (
                                    <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden shadow-md bg-zinc-800 flex items-center justify-center">
                                        <RiRobot2Line className="w-8 h-8 text-blue-400" />
                                    </div>
                                ) : (
                                    <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${item.from.poster_path}`}
                                            alt={item.from.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-zinc-400">Based on</p>
                                    <h4 className="text-sm font-semibold text-zinc-200 mt-1">
                                        {typeof item.from === 'string' ? 'AI Recommendation' : item.from.title}
                                    </h4>
                                    <p className="text-xs text-zinc-400 mt-1">
                                        Added {new Date(item.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="self-start p-2 hover:bg-zinc-700/50 rounded-full transition-colors"
                                >
                                    <IoTrashOutline className="w-5 h-5 text-red-400 hover:text-red-300" />
                                </button>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {historyContext.length === 0 && (
                <Card className="p-8 text-center bg-zinc-900/80 backdrop-blur">
                    <p className="text-zinc-300 text-lg">
                        No history found. Start exploring recommendations to build your history!
                    </p>
                </Card>
            )}

            {historyContext.length > 0 && (
                <div className="flex justify-center mt-8 space-x-6">
                    <button
                        onClick={toggleShowAll}
                        className="px-6 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-full transition-all"
                    >
                        {showAll ? 'Show Less' : 'Show All'}
                    </button>
                    <button
                        onClick={clearHistory}
                        className="flex items-center px-6 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-zinc-800/50 rounded-full transition-all"
                    >
                        <IoTrashOutline className="w-4 h-4 mr-2" />
                        Clear History
                    </button>
                </div>
            )}
        </div>
    );
}
