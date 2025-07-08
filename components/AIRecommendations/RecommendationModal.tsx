import { IoStar, IoClose, IoBookmarkOutline } from "react-icons/io5";
import { AIRecommendation } from "@/types/types";
import OptimizedImage from "../shared/handlers/optimizedImage";
import Image from "next/image";

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
  return (
    <div className="fixed -top-10 min-h-screen inset-0 z-50 flex items-end md:items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full md:w-[800px] bg-zinc-900 rounded-t-2xl md:rounded-2xl max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] md:max-h-[90vh]">
        {/* Backdrop Image */}
        <div className="relative h-[200px] sm:h-[300px]">
          <OptimizedImage
            src={`${selectedRec.media?.backdrop_path}`}
            alt={selectedRec.title}
            sizes="(max-width: 768px) 100vw, 800px"
            priority={true}
            className="object-cover"
            loading="eager"
            quality={75}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/70 to-transparent" />
        </div>

        {/* Close Button */}
        <div className="absolute top-0 right-0 z-10 p-4">
          <button
            onClick={onClose}
            className="p-2 text-white hover:text-zinc-300 rounded-full bg-zinc-800/50"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-8 sm:p-8 relative">
          {/* Poster and Details Grid */}
          <div className="flex flex-col md:flex-row md:gap-8">
            {/* Poster and Save Button Column */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="relative w-[140px] h-[210px] md:w-[200px] md:h-[300px] rounded-lg overflow-hidden mx-auto md:mx-0 -mt-20 md:-mt-32">
                <OptimizedImage
                  src={`${selectedRec.media?.poster_path}`}
                  alt={selectedRec.title}
                  className="object-cover opacity-90"
                  priority={true}
                  loading="eager"
                  quality={75}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              </div>
              
              {/* Save Button - Desktop */}
              <div className="hidden md:block w-full">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave(selectedRec);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600/10 hover:bg-blue-500/20 rounded-xl transition-colors duration-300"
                >
                  <IoBookmarkOutline className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">
                    Save to History
                  </span>
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 space-y-4 mt-4 md:mt-0">
              <h2 className="text-xl md:text-3xl font-semibold text-white text-center md:text-left">
                {selectedRec.title}
              </h2>

              <div className="flex items-center justify-center md:justify-start gap-4 text-sm md:text-base text-zinc-300 flex-wrap">
                <span>{selectedRec.media?.release_date?.split("-")[0]}</span>
                {selectedRec.media?.vote_average ? (
                  <div className="flex items-center gap-1.5">
                    <IoStar className="text-amber-400 w-5 h-5" />
                    <span>{selectedRec.media.vote_average.toFixed(1)}</span>
                  </div>
                ) : null}
                {"number_of_seasons" in selectedRec.media && selectedRec.media.number_of_seasons !== undefined && (
                  <span>{selectedRec.media.number_of_seasons} Seasons</span>
                )}
                {"number_of_episodes" in selectedRec.media && selectedRec.media.number_of_episodes !== undefined && (
                  <span>{selectedRec.media.number_of_episodes} Episodes</span>
                )}
                {"runtime" in selectedRec.media && selectedRec.media.runtime !== undefined && (
                  <span>{selectedRec.media.runtime} min</span>
                )}
              </div>

              <p className="text-sm md:text-base text-zinc-300 leading-relaxed text-center md:text-left line-clamp-none">
                {selectedRec.reason}
              </p>
            </div>
          </div>

          {/* Save Button - Mobile */}
          <div className="p-4 bg-zinc-900 border-t border-border-primary md:hidden mt-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSave(selectedRec);
              }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600/20 hover:bg-blue-500 rounded-xl transition-colors duration-300"
            >
              <IoBookmarkOutline className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">
                Save to History
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}