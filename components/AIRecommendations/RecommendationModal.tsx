import { IoStar, IoClose, IoBookmarkOutline, IoCalendarOutline, IoHeartOutline, IoThumbsDownOutline } from "react-icons/io5";
import type { AIRecommendation } from "@/types/types";
import type { TasteFeedback } from "@/lib/recommendation-engine";
import Dialog from "@/components/shared/ui/Dialog";
import OptimizedImage from "@/components/shared/handlers/optimizedImage";

interface RecommendationModalProps {
  recommendation: AIRecommendation;
  onClose: () => void;
  onSave: (recommendation: AIRecommendation) => void;
  onFeedback?: (sentiment: TasteFeedback["sentiment"]) => void;
}

export function RecommendationModal({ recommendation, onClose, onSave, onFeedback }: RecommendationModalProps) {
  const media = recommendation.media;
  const year = media?.release_date?.slice(0, 4);

  return (
    <Dialog title={recommendation.title} onClose={onClose}>
      <div className="relative h-40 overflow-hidden sm:h-64">
        {media?.backdrop_path ? (
          <OptimizedImage src={media.backdrop_path} alt="" className="object-cover" sizes="(max-width: 768px) 100vw, 800px" />
        ) : <div className="h-full bg-background-tertiary" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background-secondary via-background-secondary/40 to-transparent" />
      </div>

      <button type="button" onClick={onClose} className="icon-action absolute right-3 top-3 z-20" aria-label="Close recommendation">
        <IoClose aria-hidden="true" />
      </button>

      <div className="relative px-5 pb-7 sm:px-8">
        <div className="flex gap-5 sm:gap-7">
          <div className="relative -mt-14 hidden aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-xl border border-border-primary bg-background-tertiary shadow-lg sm:block">
            {media?.poster_path && <OptimizedImage src={media.poster_path} alt={recommendation.title} className="object-cover" sizes="112px" />}
          </div>
          <div className="min-w-0 flex-1 pt-3">
            <h2 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">{recommendation.title}</h2>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-text-secondary">
              {year && <span className="flex items-center gap-1.5"><IoCalendarOutline aria-hidden="true" />{year}</span>}
              {media?.vote_average !== undefined && media.vote_average > 0 && (
                <span className="flex items-center gap-1.5"><IoStar aria-hidden="true" className="text-amber-400" />{media.vote_average.toFixed(1)} TMDB</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-border-primary bg-background-primary p-5">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-accent-hover">Why this matches</h3>
          <p className="text-sm leading-relaxed text-text-primary sm:text-base">{recommendation.reason}</p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border-primary pt-5">
          <button type="button" onClick={() => { onSave(recommendation); onClose(); }}
            className="secondary-action flex-1 border-border-hover bg-accent-primary/15 text-accent-hover">
            <IoBookmarkOutline aria-hidden="true" /> Save
          </button>
          {onFeedback && media && (
            <>
              <button type="button" onClick={() => onFeedback("interested")} className="secondary-action flex-1">
                <IoHeartOutline aria-hidden="true" /> Interested
              </button>
              <button type="button" onClick={() => onFeedback("not_interested")} className="secondary-action flex-1 text-text-secondary">
                <IoThumbsDownOutline aria-hidden="true" /> Not interested
              </button>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
}
