"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { IoTrashOutline } from 'react-icons/io5';
import Card from '@/components/shared/Card';

export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const historyData = localStorage.getItem('history');
        if (historyData) {
            setHistory(JSON.parse(historyData).slice(0, showAll ? 100 : 2));
        }
        setIsLoading(false);
    }, [showAll]);

    const clearHistory = () => {
        localStorage.removeItem('history');
        setHistory([]);
    }

    const toggleShowAll = () => {
        setShowAll(!showAll);
    }

    if (isLoading) {
        return <div className="p-4 sm:p-8 max-w-6xl mx-auto min-h-screen mt-4 sm:mt-10">
            <h1 className="text-2xl font-bold mb-4">History</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg overflow-hidden animate-pulse"></div>
            </div>
        </div>
    }

    return (
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
            <h1 className="text-2xl font-semibold text-white mb-8">History</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {history.map((item, index) => (
                    <Card key={index}>
                        <div className="flex gap-4 p-4">
                            {item.media?.poster_path && (
                                <div className="relative w-32 h-48 flex-shrink-0 rounded-lg overflow-hidden">
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${item.media.poster_path}`}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            
                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-white">{item.title}</h3>
                                <p className="text-sm text-zinc-400 mt-2 line-clamp-3">{item.reason}</p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 border-t border-zinc-800/50 bg-zinc-900/30">
                            <div className="relative w-16 h-24 flex-shrink-0">
                                {item.poster_path && (
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                                        alt={item.from}
                                        fill
                                        className="rounded object-cover"
                                    />
                                )}
                            </div>
                            
                            <div>
                                <p className="text-sm text-zinc-500">Based on</p>
                                <h4 className="text-sm font-medium text-zinc-300">{item.from}</h4>
                                {item.genres && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {item.genres.slice(0, 3).map((genre: any) => (
                                            <span 
                                                key={genre.id} 
                                                className="text-xs px-2 py-0.5 bg-zinc-800/50 text-zinc-400 rounded"
                                            >
                                                {genre.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {history.length === 0 && (
                <Card className="p-8 text-center">
                    <p className="text-zinc-400">
                        No history found. Start exploring recommendations to build your history!
                    </p>
                </Card>
            )}

            {history.length > 0 && (
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
