import { IoStar } from "react-icons/io5";
import { AIRecommendation } from "@/types/types";
import Image from "next/image";
import OptimizedImage from "@/components/shared/optimizedImage";

interface RecommendationCardProps {
  recommendation: AIRecommendation;
  onSelect: (rec: AIRecommendation) => void;
  onSave: (rec: AIRecommendation) => void;
  index: number;
}

export function RecommendationCard({
  recommendation: rec,
  onSelect,
  onSave,
  index,
}: RecommendationCardProps) {
  return (
    <div
      onClick={() => onSelect(rec)}
      className="mt-10 mx-auto group relative w-[100px] md:w-[180px] lg:w-[180px] cursor-pointer"
    >
      <div className="mx-auto w-full flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-lg">
        <div className="relative">
          <div className="absolute -left-2 -top-4 md:-top-6 z-20">
            <span
              className="text-4xl sm:text-5xl md:text-5xl font-black opacity-90
              bg-gradient-to-br from-violet-400 to-violet-600 bg-clip-text text-transparent
              [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)] tracking-tight"
            >
              {index + 1}
            </span>
          </div>

          <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900/50">
            {/* <Image
              src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${rec.media?.poster_path}`}
              fill
              alt={rec.title}
              sizes="(max-width: 768px) 100px, 180px"
              className="object-cover"
              priority={index < 2}
              quality={75}
            /> */}
            <OptimizedImage
              src={rec.media?.poster_path || ''}
              alt={rec.title}
              className="object-cover"
              priority={rec.media?.id ? index < 2 : false}
              quality={75}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          </div>

          <div className="mt-2 space-y-1 flex justify-between items-center">
            <h3 className="text-xs sm:text-sm md:text-base lg:text-md font-medium line-clamp-1 text-left text-zinc-400">
              {rec.title}
            </h3>
            {rec.media?.vote_average && (
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <span className="flex items-center text-xs sm:text-sm md:text-base lg:text-md">
                  <IoStar className="text-amber-400 mr-1 text-xs sm:text-sm md:text-base lg:text-md" />
                  {rec.media.vote_average.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* <button
        onClick={(e) => {
          e.stopPropagation();
          onSave(rec);
        }}
        className="absolute z-10 top-2 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-300 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
        aria-label="Save recommendation"
      >
        <IoBookmarkOutline className="w-5 h-5 text-white" />
      </button> */}
    </div>
  );
}
