'use client'
import { AIRecommendation } from "@/types/types";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MediaPosterCard } from "@/components/shared/MediaPosterCard";
import { RecommendationModal } from './RecommendationModal';

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

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mx-auto">
                {isAiLoading ? (
                    Array(10).fill(0).map((_, index) => (
                        <div key={index} className="animate-pulse bg-zinc-900/50 rounded-lg aspect-[2/3] w-[160px]">
                            <div className="h-full bg-zinc-800/50 rounded-lg"></div>
                        </div>
                    ))
                ) : (
                    Array.isArray(aiRecommendations) && aiRecommendations.map((rec, index) => (
                        <MediaPosterCard
                            key={index}
                            media={rec.media}
                            reason={rec.reason}
                            onSelect={(media) => setSelectedRec({ ...rec, media })}
                            onSave={saveToHistory}
                        />
                    ))
                )}
            </div>

            {selectedRec && (
                <RecommendationModal
                    recommendation={selectedRec}
                    onClose={() => setSelectedRec(null)}
                />
            )}

            {alert && (
                <div className="flex items-center gap-2 text-sm text-green-400 font-medium fixed bottom-12 right-12 bg-green-900/10 rounded-lg p-3">
                    <IoCheckmarkCircleOutline className="text-green-400 text-lg" />
                    {alert}
                </div>
            )}
        </div>
    );
} 