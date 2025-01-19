import React from "react";
import Link from "next/link";
import { MappedMovie, MappedShow } from "@/types/types";
import { IoBookmarkOutline, IoStar } from "react-icons/io5";
import OptimizedImage from "./optimizedImage";

interface MediaCardProps {
  item: MappedMovie | MappedShow;
  activeTab: string;
  showSaveToHistory?: boolean;
  onSave?: () => void;
  isModal?: boolean;
}

export default function MediaCard({
  item,
  activeTab,
  showSaveToHistory = false,
  onSave,
  isModal = false,
}: MediaCardProps) {
  const isMovie = activeTab === "movies";
  const title = isMovie
    ? (item as MappedMovie).title
    : (item as MappedShow).title;
  const releaseDate = isMovie
    ? (item as MappedMovie).release_date
    : (item as MappedShow).release_date;
  const mediaType = isMovie ? "movie" : "show";
  // const posterUrl = item.poster_path
  //   ? `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${item.poster_path}`
  //   : "";
  const rating = item.vote_average.toFixed(1);
  // const year = releaseDate ? new Date(releaseDate).getFullYear() : "";

  return (
    <div
      className="relative w-[100px] md:w-[150px] lg:w-[180px] mb-10 cursor-pointer group"
      key={item.id}
    >
      <Link
        key={item.id}
        href={`/recommendation/${item.id}/${mediaType}`}
        className="mx-auto w-full md:w-full lg:w-full group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-lg"
      >
        <div className="group relative">
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
            <OptimizedImage
              src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${item.poster_path}`}
              alt={title}
              className="object-cover transform transition-transform duration-500 group-hover:scale-105"
              priority={item.id < 2 ? true : false}
              quality={75}
              loading="lazy"
              id={item.id}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          </div>

          <div className="mt-2 space-y-0.5 sm:space-y-1 flex justify-between items-center">
            <h3 className="text-xs sm:text-sm md:text-base lg:text-md font-medium text-zinc-300 line-clamp-1">
              {title}
            </h3>
            {rating && (
              <span className="flex items-center text-xs sm:text-sm md:text-base">
                <IoStar className="text-amber-400 mx-0.5 sm:mx-1 w-3 h-3 sm:w-4 sm:h-4" />
                {rating}
              </span>
            )}
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
          className="absolute top-2 right-4 p-2 bg-zinc-800/50 hover:bg-zinc-700/70 rounded-full transition-colors duration-300"
        >
          <IoBookmarkOutline className="w-5 h-5 text-zinc-300" />
        </button>
      )}
    </div>
  );
}
