import Image from 'next/image';
import { IoBookmarkOutline, IoStar } from "react-icons/io5";
import { AIRecommendation } from "@/types/types";

interface RecommendationCardProps {
    recommendation: AIRecommendation;
    onSelect: (rec: AIRecommendation) => void;
    onSave: (rec: AIRecommendation) => void;
}

export function RecommendationCard({ recommendation: rec, onSelect, onSave }: RecommendationCardProps) {
    return (
        <div
            onClick={() => onSelect(rec)}
            className="cursor-pointer group w-[190px] mb-4"
        >
            <div className="w-full relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                {rec.media?.poster_path && (
                    <Image
                        src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${rec.media.poster_path}`}
                        alt={rec.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSave(rec);
                    }}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-300 opacity-0 group-hover:opacity-100"
                >
                    <IoBookmarkOutline className="w-5 h-5 text-white" />
                </button>
            </div>
            <div className="flex justify-between items-center">
                <h3 className="text-white font-medium truncate">{rec.title}</h3>
                <div className="flex items-center justify-between text-sm text-zinc-300">
                    {/* <span>{rec.media?.release_date?.split('-')[0]}</span> */}
                    {rec.media?.vote_average && (
                        <div className="flex items-center gap-1">
                            <IoStar className="text-amber-400" />
                            <span>{rec.media.vote_average.toFixed(1)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 