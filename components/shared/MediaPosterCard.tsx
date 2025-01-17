import Image from 'next/image';
import { IoBookmarkOutline, IoStar } from "react-icons/io5";

interface MediaPosterCardProps {
    media: {
        id: number;
        title: string;
        poster_path: string;
        vote_average?: number;
        release_date?: string;
        type?: 'movie' | 'show';
    };
    reason?: string;
    onSelect?: (media: any) => void;
    onSave?: (media: any) => void;
    className?: string;
}

export function MediaPosterCard({ media, reason, onSelect, onSave, className = "" }: MediaPosterCardProps) {
    return (
        <div
            onClick={() => onSelect?.(media)}
            className={`relative w-[160px] ${className} ${onSelect ? 'cursor-pointer' : ''}`}
        >
            <div className="w-full group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-lg">
                <div className="group relative">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                        {media.poster_path && (
                            <Image
                                src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${media.poster_path}`}
                                alt={media.title}
                                fill
                                className="object-cover transform transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0" />
                    </div>

                    <div className="mt-4 space-y-2">
                        <h3 className="text-lg font-medium line-clamp-1">{media.title}</h3>
                        {media.vote_average && (
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <span className="flex items-center">
                                    <IoStar className="text-amber-400 mr-1" />
                                    {media.vote_average.toFixed(1)}
                                </span>
                                {media.release_date && (
                                    <>
                                        <span>•</span>
                                        <span>{new Date(media.release_date).getFullYear()}</span>
                                    </>
                                )}
                            </div>
                        )}
                        {reason && (
                            <p className="text-sm text-zinc-400 line-clamp-2">{reason}</p>
                        )}
                    </div>
                </div>
            </div>

            {onSave && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSave(media);
                    }}
                    className="absolute top-2 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-300 opacity-0 group-hover:opacity-100"
                >
                    <IoBookmarkOutline className="w-5 h-5 text-white" />
                </button>
            )}
        </div>
    );
} 