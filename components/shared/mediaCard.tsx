import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MappedMovie, MappedShow } from '@/types/types'
import { IoBookmarkOutline } from 'react-icons/io5'

interface MediaCardProps {
    item: MappedMovie | MappedShow;
    activeTab: string;
    showSaveToHistory?: boolean;
    onSave?: () => void;
}

export default function MediaCard({ item, activeTab, showSaveToHistory = false, onSave }: MediaCardProps) {
    const isMovie = activeTab === 'movies';
    const title = isMovie ? (item as MappedMovie).title : (item as MappedShow).title;
    const releaseDate = isMovie ? (item as MappedMovie).release_date : (item as MappedShow).release_date;
    const mediaType = isMovie ? 'movie' : 'show';

    return (
        <div className="relative">
            <Link
                href={`/recommendation/${item.id}/${mediaType}`}
                key={item.id}
                className="w-[180px] group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-lg"
            >
                <div className="relative h-[270px] w-full rounded-lg overflow-hidden bg-card-bg transition-all duration-300">
                    <Image
                        src={item.poster_path
                            ? `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${item.poster_path}`
                            : '/placeholder-poster.png'
                        }
                        alt={title}
                        fill
                        className="object-cover transform transition-all duration-500 group-hover:scale-[1.02]"
                        sizes="180px"
                        priority={false}
                    />
                    
                    {/* Subtle overlay on hover */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <div className="mt-4 space-y-2.5">
                    <h3 className="text-zinc-200 text-sm font-medium leading-snug line-clamp-1 group-hover:text-white transition-colors duration-300">
                        {title}
                    </h3>
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center bg-card-bg backdrop-blur-sm rounded-full px-2.5 py-1">
                            <span className="text-amber-400/90 text-xs">★</span>
                            <span className="text-zinc-300 text-xs ml-1.5 font-light">
                                {item.vote_average.toFixed(1)}
                            </span>
                        </div>
                        <span className="text-zinc-400 text-xs font-light">
                            {releaseDate ? new Date(releaseDate).getFullYear() : ''}
                        </span>
                    </div>
                </div>
            </Link>
            
            {showSaveToHistory && onSave && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSave();
                    }}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-300"
                >
                    <IoBookmarkOutline className="w-5 h-5 text-white" />
                </button>
            )}
        </div>
    )
}
