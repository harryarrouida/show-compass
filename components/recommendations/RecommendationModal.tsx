import Image from 'next/image';
import { IoStar, IoClose } from "react-icons/io5";
import { AIRecommendation } from "@/types/types";

interface RecommendationModalProps {
    recommendation: AIRecommendation;
    onClose: () => void;
}

export function RecommendationModal({ recommendation: selectedRec, onClose }: RecommendationModalProps) {
    return (
        <div className="fixed inset-0 -top-10 min-h-screen z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 backdrop-blur-lg" onClick={onClose} />
            <div className="relative bg-zinc-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-white hover:text-zinc-300 z-10"
                >
                    <IoClose className="w-6 h-6" />
                </button>
                
                <div className="relative aspect-video w-full">
                    <Image
                        src={`${process.env.NEXT_PUBLIC_TMDB_BACKDROP_URL}${selectedRec.media?.backdrop_path}`}
                        alt={selectedRec.title}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                </div>

                <div className="p-6 -mt-20 relative">
                    <div className="flex gap-6">
                        <div className="relative w-32 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                                src={`https://image.tmdb.org/t/p/w500${selectedRec.media?.poster_path}`}
                                alt={selectedRec.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold text-white">{selectedRec.title}</h2>
                            <div className="flex items-center gap-4 text-zinc-300">
                                <span>{selectedRec.media?.release_date?.split('-')[0]}</span>
                                {selectedRec.media?.vote_average && (
                                    <div className="flex items-center gap-1">
                                        <IoStar className="text-amber-400" />
                                        <span>{selectedRec.media.vote_average.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-zinc-300 leading-relaxed">{selectedRec.reason}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 