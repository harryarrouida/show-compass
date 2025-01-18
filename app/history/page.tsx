"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { IoTrashOutline, IoStarOutline, IoStar, IoAnalytics, IoClose } from 'react-icons/io5';
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
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
    const { history: historyContext, clearHistory, deleteFromHistory } = useHistory();

    const displayHistory = showAll ? historyContext : historyContext.slice(0, 10);

    const toggleShowAll = () => {
        setShowAll(!showAll);
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">History</h1>
                <button
                    onClick={clearHistory}
                    className="flex items-center justify-center px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-zinc-800/50 rounded-full transition-all sm:hidden"
                >
                    <IoTrashOutline className="w-4 h-4 mr-2" />
                    Clear All
                </button>
            </div>

            {historyContext.length === 0 ? (
                <Card className="p-6 sm:p-8 text-center bg-zinc-900/80 backdrop-blur">
                    <p className="text-zinc-300 text-base sm:text-lg">
                        No history found. Start exploring recommendations to build your history!
                    </p>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                        {displayHistory.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedItem(item as HistoryItem)}
                                className="mx-auto group relative w-[140px] md:w-[180px] lg:w-[200px] cursor-pointer"
                            >
                                <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${item.data.poster_path}`}
                                        alt={item.data.title || ''}
                                        fill
                                        className="object-cover transform transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 20vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0" />
                                </div>

                                <div className="mt-2 space-y-0.5 sm:space-y-1 flex justify-between items-center">
                                    <h3 className="text-xs sm:text-sm font-medium text-zinc-300 line-clamp-1">
                                        {item.data.title}
                                    </h3>
                                        {item.data.vote_average && (
                                            <span className="flex items-center">
                                                <IoStar className="text-amber-400 mx-0.5 sm:mx-1" size={10} />
                                                {item.data.vote_average.toFixed(1)}
                                            </span>
                                        )}
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteFromHistory(item.id);
                                    }}
                                    className="absolute z-10 top-1 sm:top-2 right-1 sm:right-2 p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-300 opacity-0 group-hover:opacity-100"
                                >
                                    <IoTrashOutline className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 mt-6 sm:mt-8">
                        <button
                            onClick={toggleShowAll}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-full transition-all"
                        >
                            {showAll ? 'Show Less' : 'Show All'}
                        </button>
                        <button
                            onClick={clearHistory}
                            className="hidden sm:flex w-full sm:w-auto items-center justify-center px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-zinc-800/50 rounded-full transition-all"
                        >
                            <IoTrashOutline className="w-4 h-4 mr-2" />
                            Clear History
                        </button>
                    </div>
                </>
            )}

            {selectedItem && (
                <div className="fixed -top-10 min-h-screen inset-0 z-50 flex items-end justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
                    
                    <div className="relative w-full bg-zinc-900 rounded-t-2xl max-h-[85vh] overflow-y-auto">
                        <div className="relative h-[200px] sm:h-[300px]">
                            <Image
                                src={`${process.env.NEXT_PUBLIC_TMDB_BACKDROP_URL}${selectedItem.data.backdrop_path}`}
                                alt={selectedItem.data.title}
                                fill
                                className="object-cover opacity-80"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/70 to-transparent" />
                        </div>

                        <div className="absolute top-0 right-0 z-10 p-4">
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="p-2 text-white hover:text-zinc-300 rounded-full bg-zinc-800/50"
                            >
                                <IoClose className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="px-4 pb-8 sm:p-6 relative">
                            <div className="flex flex-col sm:flex-row sm:gap-6">
                                <div className="relative w-[140px] h-[210px] sm:w-[180px] sm:h-[270px] rounded-lg overflow-hidden shadow-xl mx-auto sm:mx-0">
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${selectedItem.data.poster_path}`}
                                        alt={selectedItem.data.title}
                                        fill
                                        className="object-cover opacity-90"
                                        priority
                                    />
                                </div>

                                <div className="flex-1 min-w-0 space-y-3 mt-4 sm:mt-0">
                                    <h2 className="text-xl sm:text-2xl font-semibold text-white text-center sm:text-left">
                                        {selectedItem.data.title}
                                    </h2>
                                    
                                    <div className="flex items-center justify-center sm:justify-start gap-3 text-sm text-zinc-300">
                                        {selectedItem.data.release_date && (
                                            <span>{new Date(selectedItem.data.release_date).getFullYear()}</span>
                                        )}
                                        {selectedItem.data.vote_average && (
                                            <div className="flex items-center gap-1">
                                                <IoStar className="text-amber-400" />
                                                <span>{selectedItem.data.vote_average.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <p className="text-sm text-zinc-300 leading-relaxed text-center sm:text-left">
                                        {selectedItem.reason}
                                    </p>

                                    <div className="pt-3 sm:pt-4 border-t border-zinc-800">
                                        <p className="text-xs sm:text-sm text-zinc-400">Recommended from</p>
                                        <p className="text-sm sm:text-base text-zinc-300 mt-1">
                                            {typeof selectedItem.from === 'string' 
                                                ? selectedItem.from === 'trakt' 
                                                    ? 'Trakt Recommendation' 
                                                    : 'AI Recommendation'
                                                : selectedItem.from.title
                                            }
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-zinc-500 mt-2">
                                            Added {new Date(selectedItem.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-zinc-900 border-t border-zinc-800 sm:relative sm:border-0 sm:bg-transparent sm:mt-8">
                                <button
                                    onClick={() => {
                                        deleteFromHistory(selectedItem.id);
                                        setSelectedItem(null);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600/20 hover:bg-red-500 rounded-xl transition-colors duration-300 sm:max-w-xs sm:mx-auto"
                                >
                                    <IoTrashOutline className="w-5 h-5 text-white" />
                                    <span className="text-white text-sm font-medium">Remove from History</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
