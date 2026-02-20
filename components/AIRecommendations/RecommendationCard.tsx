import { IoStar } from "react-icons/io5";
import { AIRecommendation } from "@/types/types";
import OptimizedImage from "@/components/shared/handlers/optimizedImage";

interface RecommendationCardProps {
  recommendation: AIRecommendation;
  onSelect: (rec: AIRecommendation) => void;
  onSave: (rec: AIRecommendation) => void;
  index: number;
}

export function RecommendationCard({
  recommendation: rec,
  onSelect,
  index,
}: RecommendationCardProps) {
  return (
    <div
      onClick={() => onSelect(rec)}
      className="group relative cursor-pointer flex flex-col"
    >
      {/* Index badge */}
      <div className="absolute -left-1.5 -top-3 z-20 pointer-events-none">
        <span
          className="
            text-3xl sm:text-4xl font-black leading-none
            bg-gradient-to-br from-indigo-400 to-violet-500
            bg-clip-text text-transparent
            [text-shadow:none]
            drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]
            tracking-tight
          "
        >
          {index + 1}
        </span>
      </div>

      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900/70 shadow-lg ring-1 ring-white/5">
        <OptimizedImage
          src={rec.media?.poster_path || ""}
          alt={rec.title}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={index < 3}
          quality={75}
          sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 18vw"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating badge on hover */}
        {rec.media?.vote_average && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <IoStar className="w-3 h-3 text-amber-400" />
            <span className="text-xs font-bold text-white">
              {rec.media.vote_average.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Title and rating row */}
      <div className="mt-2 px-0.5 space-y-0.5">
        <h3 className="text-xs sm:text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors line-clamp-2 leading-snug">
          {rec.title}
        </h3>
        {rec.media?.vote_average && (
          <div className="flex items-center gap-1 text-zinc-500">
            <IoStar className="w-2.5 h-2.5 text-amber-500/70" />
            <span className="text-[10px] sm:text-xs">
              {rec.media.vote_average.toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
