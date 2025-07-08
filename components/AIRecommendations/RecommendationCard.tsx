import { IoStar } from "react-icons/io5";
import { AIRecommendation } from "@/types/types";
import Image from "next/image";
import OptimizedImage from "@/components/shared/handlers/optimizedImage";
import { useGenerations } from '@/contexts/GenerationsContext';

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
  const { generationsLeft } = useGenerations();
  
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
              bg-gradient-to-br from-blue-400 to-blue-400 bg-clip-text text-transparent
              [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)] tracking-tight"
            >
              {index + 1}
            </span>
          </div>

          <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900/50">
            <OptimizedImage
              src={rec.media?.poster_path || ""}
              alt={rec.title}
              className="object-cover"
              priority={rec.media?.id ? index < 2 : false}
              quality={75}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10" />
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
      
      {/* Optional: Add an indicator for remaining generations */}
      {/* <div className="absolute top-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded-full">
        {generationsLeft} left
      </div> */}
    </div>
  );
}