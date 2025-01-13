'use client'
import Image from 'next/image';
import { AIRecommendation } from "@/types/types";
import { IoBookmarkOutline, IoStar, IoCheckmarkCircleOutline } from "react-icons/io5";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface AIRecommendationsProps {
    isAiLoading: boolean;
    aiRecommendations: AIRecommendation[] | string;
    saveToHistory: (recommendation: AIRecommendation) => void;
    alert: string | null;
    toggleChat: () => void;
    showChat: boolean;
    setPrompt: (prompt: string) => void;
    prompt: string;
    handleSubmitPrompt: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export default function AIRecommendations({ 
    isAiLoading, 
    aiRecommendations, 
    saveToHistory, 
    alert, 
    toggleChat, 
    showChat, 
    setPrompt, 
    prompt, 
    handleSubmitPrompt 
}: AIRecommendationsProps) {
    const pathname = usePathname();
    const [isDefaultRecs, setIsDefaultRecs] = useState(true);

    useEffect(() => {
        if (pathname?.includes('recommendation')) {
            setIsDefaultRecs(false);
        }
    }, [pathname]);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Similar Recommendations</h2>
                {!isDefaultRecs && (
                    <button 
                        onClick={toggleChat} 
                        className="text-zinc-400 text-sm font-light hover:text-zinc-300 transition-colors duration-300"
                    >
                        {showChat ? "Do you like these? Hide Chat" : "Don't Like These? Chat here"}
                    </button>
                )}
            </div>

            {showChat && !isDefaultRecs && (
                <form onSubmit={handleSubmitPrompt} className="flex items-center gap-3 text-zinc-300">
                    <input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        type="text"
                        placeholder="What kind of recommendations are you looking for?"
                        className="w-full p-3 rounded-md bg-zinc-900/50 text-zinc-300 border border-zinc-800 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 placeholder:text-zinc-600 transition-all duration-300"
                    />
                    <button
                        disabled={isAiLoading || !prompt.trim()}
                        type="submit"
                        className={`px-6 py-3 bg-primary rounded-md text-white transition-all duration-300 flex items-center gap-2
                            ${isAiLoading || !prompt.trim()
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-primary/80'}`}
                    >
                        {isAiLoading ? (
                            <>
                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                <span>Loading...</span>
                            </>
                        ) : (
                            <>
                                <IoCheckmarkCircleOutline className="w-5 h-5" />
                                <span>Ask</span>
                            </>
                        )}
                    </button>
                </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {isAiLoading ? (
                    Array(4).fill(0).map((_, index) => (
                        <div key={index} className="animate-pulse bg-zinc-900/50 rounded-lg h-[400px]">
                            <div className="h-[200px] bg-zinc-800/50 rounded-t-lg"></div>
                            <div className="p-4 space-y-4">
                                <div className="h-6 bg-zinc-800/50 rounded w-3/4"></div>
                                <div className="h-4 bg-zinc-800/50 rounded w-1/4"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-zinc-800/50 rounded"></div>
                                    <div className="h-4 bg-zinc-800/50 rounded"></div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    Array.isArray(aiRecommendations) && aiRecommendations.map((rec, index) => (
                        <div
                            key={index}
                            className="flex flex-col bg-zinc-900/50 rounded-lg hover:bg-zinc-800/50 transition-colors duration-300"
                        >
                            {rec.media?.poster_path && (
                                <div className="relative h-[150px] sm:h-[200px] w-full rounded-t-lg overflow-hidden">
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w500${rec.media.poster_path}`}
                                        alt={rec.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw"
                                    />
                                    <button
                                        onClick={() => saveToHistory(rec)}
                                        className="absolute top-2 left-2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-300"
                                    >
                                        <IoBookmarkOutline className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            )}
                            <div className="p-4 sm:p-5 flex-1">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <h3 className="text-lg sm:text-xl font-medium text-white truncate">
                                        {rec.title}
                                    </h3>
                                    {rec.media?.vote_average && (
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <IoStar className="text-amber-400 text-sm" />
                                            <span className="text-zinc-300 text-sm">
                                                {rec.media.vote_average.toFixed(1)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {rec.media?.release_date && (
                                    <div className="text-sm text-zinc-400 mb-4">
                                        {new Date(rec.media.release_date).getFullYear()}
                                    </div>
                                )}
                                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                                    {rec.reason}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {alert && (
                <div className="flex items-center gap-2 text-sm text-green-400 font-medium fixed bottom-12 right-12 bg-green-900/10 rounded-lg p-3">
                    <IoCheckmarkCircleOutline className="text-green-400 text-lg" />
                    {alert}
                </div>
            )}
        </div>
    );
} 