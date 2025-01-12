import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MappedMovie, MappedShow, Show } from '@/types/types'

interface CardComponentProps {
    item: MappedMovie | MappedShow;
    activeTab: string;
}

export default function CardComponent({ item, activeTab }: CardComponentProps) {
    return (
        <Link
            href={`/recommendation/${item.id}/${activeTab === 'movies' ? 'movie' : 'show'}`}
            key={item.id}
            className="w-full group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-lg"
        >
            <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-card-bg transition-all duration-500">
                <Image
                    src={item.poster_path
                        ? `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${item.poster_path}`
                        : '/placeholder-poster.png'
                    }
                    alt={activeTab === 'movies' ? (item as MappedMovie).title : (item as MappedShow).title}
                    fill
                    className="object-cover transform transition-all duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    priority={false}
                />
                
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <div className="mt-4 space-y-2.5">
                <h3 className="text-zinc-200 text-sm font-medium leading-snug line-clamp-1 group-hover:text-white transition-colors duration-300">
                    {activeTab === 'movies' ? (item as MappedMovie).title : (item as MappedShow).title}
                </h3>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center bg-card-bg backdrop-blur-sm rounded-full px-2.5 py-1">
                        <span className="text-amber-400/90 text-xs">★</span>
                        <span className="text-zinc-300 text-xs ml-1.5 font-light">
                            {item.vote_average.toFixed(1)}
                        </span>
                    </div>
                    <span className="text-zinc-400 text-xs font-light">
                        {new Date(activeTab === 'movies' ? (item as MappedMovie).release_date : (item as MappedShow).release_date).getFullYear()}
                    </span>
                </div>
            </div>
        </Link>
    )
}
