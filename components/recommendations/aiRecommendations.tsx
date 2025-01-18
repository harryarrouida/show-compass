'use client'
import { AIRecommendation } from "@/types/types";
import { IoCheckmarkCircleOutline, IoClose } from "react-icons/io5";
import { RiSendPlaneFill } from "react-icons/ri";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { RecommendationModal } from './RecommendationModal';
import { RecommendationCard } from "./RecommendationCard";
import CardSkeleton from "../shared/CardSkeleton";

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
    const [selectedRec, setSelectedRec] = useState<AIRecommendation | null>(null);

    useEffect(() => {
        if (pathname?.includes('recommendation')) {
            setIsDefaultRecs(false);
        }
    }, [pathname]);

    return (
        <div className="space-y-8 border-t border-zinc-800 pt-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                <h2 className="text-xl sm:text-2xl font-semibold text-white">Similar Recommendations</h2>
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
                <form onSubmit={handleSubmitPrompt} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="relative flex-grow">
                        <input
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            type="text"
                            placeholder="What kind of recommendations are you looking for?"
                            className="w-full p-4 sm:p-5 rounded-xl bg-zinc-900 text-zinc-100 border border-violet-500/20 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 placeholder:text-zinc-500 transition-all duration-300 text-sm sm:text-base"
                        />
                        {prompt.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setPrompt('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                <IoClose size={18} />
                            </button>
                        )}
                    </div>
                    <button
                        disabled={isAiLoading || !prompt.trim()}
                        type="submit"
                        className={`px-6 py-4 sm:py-5 bg-violet-600 rounded-xl text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 flex-shrink-0 text-sm sm:text-base shadow-lg shadow-violet-600/10
                            ${isAiLoading || !prompt.trim()
                                ? 'opacity-50 cursor-not-allowed bg-violet-600/50'
                                : 'hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-600/20 active:scale-95'}`}
                    >
                        {isAiLoading ? (
                            <>
                                <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                <span className="hidden sm:inline">Loading...</span>
                            </>
                        ) : (
                            <>
                                <RiSendPlaneFill className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">Send</span>
                            </>
                        )}
                    </button>
                </form>
            )}

            <div className="mx-auto grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4">
                {isAiLoading ? (
                    Array(6).fill(0).map((_, index) => (
                        <CardSkeleton key={index} index={index} />
                    ))
                ) : (
                    Array.isArray(aiRecommendations) && aiRecommendations.map((rec, index) => (
                        <RecommendationCard key={index} recommendation={rec} onSelect={setSelectedRec} onSave={saveToHistory} />
                    ))
                )}
            </div>

            {selectedRec && (
                <RecommendationModal
                    recommendation={selectedRec}
                    onClose={() => setSelectedRec(null)}
                    onSave={saveToHistory}
                />
            )}

            {alert && (
                <div className="flex items-center gap-2 text-sm text-green-400 font-medium fixed bottom-4 right-4 sm:bottom-12 sm:right-12 bg-green-900/10 rounded-lg p-3 z-50">
                    <IoCheckmarkCircleOutline className="text-green-400 text-lg" />
                    {alert}
                </div>
            )}
        </div>
    );
} 