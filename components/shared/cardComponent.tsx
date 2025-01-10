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
            className="group flex flex-col"
        >
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-900/40 shadow-lg transition-transform duration-300 hover:scale-105">
                <Image
                    src={item.poster_path
                        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                        : '/placeholder-poster.png'
                    }
                    alt={activeTab === 'movies' ? (item as Movie).title : (item as Show).name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    priority={false}
                />
            </div>

            <div className="mt-3 space-y-1">
                <h3 className="text-white text-sm font-medium line-clamp-1 group-hover:text-blue-400 transition-colors">
                    {activeTab === 'movies' ? (item as Movie).title : (item as Show).name}
                </h3>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-gray-800/60 rounded-full px-2 py-0.5">
                        <span className="text-yellow-400 text-xs">⭐</span>
                        <span className="text-yellow-400 text-xs ml-1">
                            {item.vote_average.toFixed(1)}
                        </span>
                    </div>
                    <span className="text-gray-400 text-xs">
                        {new Date(activeTab === 'movies' ? (item as Movie).release_date : (item as Show).first_air_date).getFullYear()}
                    </span>
                </div>
            </div>
        </Link>
    )
}
