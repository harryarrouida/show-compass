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
    <button
      type="button"
      onClick={() => onSelect(rec)}
      aria-haspopup="dialog"
      className="poster-control group"
    >
      <span className="poster-frame">
        <OptimizedImage
          src={rec.media?.poster_path || ""}
          alt=""
          className="object-cover transition-transform group-hover:scale-105"
          priority={index < 3}
          quality={75}
          sizes="(max-width: 380px) 50vw, (max-width: 768px) 33vw, 20vw"
        />
      </span>
      <span className="poster-title">{rec.title}</span>
      {rec.media && rec.media.vote_average > 0 && (
        <span className="poster-rating">
          <IoStar aria-hidden="true" className="size-3 text-amber-400" />
          <span className="sr-only">Rating</span>
          {rec.media.vote_average.toFixed(1)}
        </span>
      )}
    </button>
  );
}
