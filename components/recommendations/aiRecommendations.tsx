import Image from 'next/image';
import { AIRecommendation } from "@/types/types";
import { IoBookmarkOutline, IoStar, IoCheckmarkCircleOutline } from "react-icons/io5";

interface AIRecommendationsProps {
    isAiLoading: boolean;
    aiRecommendations: AIRecommendation[] | string;
    saveToHistory: (recommendation: AIRecommendation) => void;
    alert: string | null;
}

export default function AIRecommendations({ isAiLoading, aiRecommendations, saveToHistory, alert }: AIRecommendationsProps) {
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-white">Similar Recommendations</h2>

            {isAiLoading ? (
                <div className="flex items-center gap-3 text-zinc-300">
                    <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span>Finding recommendations...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    {Array.isArray(aiRecommendations) && aiRecommendations.map((rec, index) => (
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
                                    <h3 className="text-lg sm:text-xl font-medium text-white truncate">{rec.title}</h3>
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
                                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">{rec.reason}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {alert && <div className="flex items-center gap-2 text-sm text-green-400 font-medium fixed bottom-12 right-12 bg-green-900/10 rounded-lg p-3">
                <IoCheckmarkCircleOutline className="text-green-400 text-lg" />
                {alert}
            </div>}
        </div>
    );
} 