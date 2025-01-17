import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MappedMovie, MappedShow } from '@/types/types'
import { IoBookmarkOutline, IoStar } from 'react-icons/io5'

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
    const posterUrl = item.poster_path
        ? `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${item.poster_path}`
        : '/placeholder-poster.png';
    const rating = item.vote_average.toFixed(1);
    const year = releaseDate ? new Date(releaseDate).getFullYear() : '';

    return (
        <div className="relative w-[180px] mb-10">
            <Link
                href={`/recommendation/${item.id}/${mediaType}`}
                key={item.id}
                className="w-[180px] group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-lg"
            >
                <div className="group relative">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                        <Image
                            src={posterUrl}
                            alt={title}
                            fill
                            className="object-cover transform transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0" />
                    </div>
                    
                    <div className="mt-4 space-y-2 transition-opacity duration-300">
                        <h3 className="text-lg font-medium line-clamp-1">{title}</h3>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <span className="flex items-center">
                                <IoStar className="text-amber-400 mr-1" />
                                {rating}
                            </span>
                            <span>•</span>
                            <span>{year}</span>
                        </div>
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
                    className="absolute top-2 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-300"
                >
                    <IoBookmarkOutline className="w-5 h-5 text-white" />
                </button>
            )}
        </div>
    )
}
