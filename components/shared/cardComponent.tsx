import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Movie, Show } from '@/types/types'

interface CardComponentProps {
    item: Movie | Show;
    activeTab: string;
}

export default function CardComponent({ item, activeTab }: CardComponentProps) {
    return (
        <Link
            href={`/recommendation/${item.id}/${activeTab === 'movies' ? 'movie' : 'show'}`}
            key={item.id}
            className="group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-lg"
        >
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900/40 transition-all duration-500">
                <Image
                    src={item.poster_path
                        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                        : '/placeholder-poster.png'
                    }
                    alt={activeTab === 'movies' ? (item as Movie).title : (item as Show).name}
                    fill
                    className="object-cover transform transition-all duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    priority={false}
                />
                
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <div className="mt-4 space-y-2">
                <h3 className="text-zinc-100 text-sm font-medium line-clamp-1 group-hover:text-zinc-300 transition-colors duration-300">
                    {activeTab === 'movies' ? (item as Movie).title : (item as Show).name}
                </h3>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center bg-zinc-800/40 backdrop-blur-sm rounded-full px-2.5 py-1">
                        <span className="text-amber-400/90 text-xs">★</span>
                        <span className="text-zinc-300 text-xs ml-1.5 font-light">
                            {item.vote_average.toFixed(1)}
                        </span>
                    </div>
                    <span className="text-zinc-500 text-xs font-light">
                        {new Date(activeTab === 'movies' ? (item as Movie).release_date : (item as Show).first_air_date).getFullYear()}
                    </span>
                </div>
            </div>
        </Link>
    )
}
