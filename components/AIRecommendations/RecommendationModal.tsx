import { IoStar, IoClose, IoBookmarkOutline, IoCalendar, IoTime } from "react-icons/io5";
import { AIRecommendation } from "@/types/types";
import OptimizedImage from "../shared/handlers/optimizedImage";

interface RecommendationModalProps {
  recommendation: AIRecommendation;
  onClose: () => void;
  onSave: (rec: AIRecommendation) => void;
}

export function RecommendationModal({
  recommendation: selectedRec,
  onClose,
  onSave,
}: RecommendationModalProps) {
  const TMDB_BASE = process.env.NEXT_PUBLIC_TMDB_IMAGE_URL || "https://image.tmdb.org/t/p/w500";

  const backdropSrc = selectedRec.media?.backdrop_path
    ? `${TMDB_BASE}${selectedRec.media.backdrop_path}`
    : selectedRec.media?.poster_path
    ? `${TMDB_BASE}${selectedRec.media.poster_path}`
    : "";

  const posterSrc = selectedRec.media?.poster_path
    ? `${TMDB_BASE}${selectedRec.media.poster_path}`
    : "";

  const releaseYear = selectedRec.media?.release_date
    ? selectedRec.media.release_date.split("-")[0]
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="
          relative w-full md:w-[720px] lg:w-[800px]
          bg-zinc-900 border border-zinc-800/60
          rounded-t-2xl md:rounded-2xl
          max-h-[88vh] md:max-h-[85vh]
          overflow-y-auto
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
          shadow-2xl
        "
      >
        {/* Backdrop image */}
        <div className="relative h-[180px] sm:h-[260px] md:h-[300px] overflow-hidden rounded-t-2xl md:rounded-t-2xl">
          {backdropSrc ? (
            <>
              <OptimizedImage
                src={backdropSrc}
                alt={selectedRec.title}
                sizes="(max-width: 768px) 100vw, 800px"
                priority={true}
                className="object-cover"
                loading="eager"
                quality={80}
              />
              {/* Gradient from bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
              {/* Gradient from left (for poster safety) */}
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/60 via-transparent to-transparent md:hidden" />
            </>
          ) : (
            <div className="w-full h-full bg-zinc-800" />
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="
            absolute top-3 right-3 z-20
            p-2 rounded-full
            bg-zinc-900/80 backdrop-blur-sm
            text-zinc-400 hover:text-white
            border border-zinc-700/50
            transition-colors
          "
          aria-label="Close"
        >
          <IoClose className="w-5 h-5" />
        </button>

        {/* Content area */}
        <div className="px-5 pb-8 sm:px-8 sm:pb-10 relative">
          <div className="flex flex-col md:flex-row gap-5 md:gap-8">
            {/* Poster + save (desktop) */}
            <div className="flex flex-col items-center md:items-start gap-4 flex-shrink-0">
              <div
                className="
                  relative
                  w-[110px] h-[165px] sm:w-[140px] sm:h-[210px] md:w-[170px] md:h-[255px]
                  rounded-xl overflow-hidden
                  -mt-14 sm:-mt-20 md:-mt-28
                  mx-auto md:mx-0
                  shadow-[0_12px_40px_rgba(0,0,0,0.8)]
                  ring-1 ring-white/10
                "
              >
                <OptimizedImage
                  src={posterSrc}
                  alt={selectedRec.title}
                  className="object-cover"
                  priority={true}
                  loading="eager"
                  quality={80}
                  sizes="(max-width: 640px) 110px, (max-width: 768px) 140px, 170px"
                />
              </div>

              {/* Save — desktop */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSave(selectedRec);
                  onClose();
                }}
                className="
                  hidden md:flex items-center justify-center gap-2
                  w-full px-4 py-2.5 rounded-xl
                  bg-indigo-600/15 hover:bg-indigo-500/25
                  border border-indigo-500/20 hover:border-indigo-400/30
                  text-indigo-300 hover:text-indigo-200
                  text-sm font-medium
                  transition-all duration-200
                "
              >
                <IoBookmarkOutline className="w-4 h-4 flex-shrink-0" />
                Save to History
              </button>
            </div>

            {/* Text details */}
            <div className="flex-1 min-w-0 space-y-4 mt-2 md:mt-4">
              {/* Title */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                {selectedRec.title}
              </h2>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                {releaseYear && (
                  <div className="flex items-center gap-1.5">
                    <IoCalendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{releaseYear}</span>
                  </div>
                )}
                {selectedRec.media?.vote_average && (
                  <div className="flex items-center gap-1.5">
                    <IoStar className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-medium text-zinc-300">
                      {selectedRec.media.vote_average.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* AI Reason */}
              <div>
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
                  Why you'll like it
                </p>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  {selectedRec.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Save — mobile */}
          <div className="md:hidden mt-6 border-t border-zinc-800/50 pt-5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSave(selectedRec);
                onClose();
              }}
              className="
                w-full flex items-center justify-center gap-2
                px-5 py-3 rounded-xl
                bg-indigo-600/20 hover:bg-indigo-500/30
                border border-indigo-500/20
                text-indigo-300 hover:text-indigo-200
                text-sm font-medium
                transition-all duration-200
              "
            >
              <IoBookmarkOutline className="w-4 h-4" />
              Save to History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
