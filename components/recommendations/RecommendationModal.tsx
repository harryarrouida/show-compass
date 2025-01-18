import Image from "next/image";
import { IoStar, IoClose, IoTime, IoBookmarkOutline } from "react-icons/io5";
import { AIRecommendation } from "@/types/types";

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
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative w-full bg-zinc-900 rounded-t-2xl max-h-[85vh] overflow-y-auto sm:rounded-lg sm:max-w-3xl sm:m-4">
        {/* Backdrop Image */}
        <div className="relative h-[200px] sm:h-[300px]">
          <Image
            src={`${process.env.NEXT_PUBLIC_TMDB_BACKDROP_URL}${selectedRec.media?.backdrop_path}`}
            alt={selectedRec.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
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
        <div className="px-4 pb-8 sm:p-6 -mt-32 relative">
          {/* Poster and Details Grid */}
          <div className="flex flex-col sm:flex-row sm:gap-6">
            {/* Poster */}
            <div className="relative w-[140px] h-[210px] sm:w-[180px] sm:h-[270px] rounded-lg overflow-hidden shadow-xl mx-auto sm:mx-0">
              <Image
                src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${selectedRec.media?.poster_path}`}
                alt={selectedRec.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 space-y-3 mt-4 sm:mt-0">
              <h2 className="text-xl sm:text-2xl font-semibold text-white text-center sm:text-left">
                {selectedRec.title}
              </h2>
              
              <div className="flex items-center justify-center sm:justify-start gap-3 text-sm text-zinc-300">
                <span>{selectedRec.media?.release_date?.split("-")[0]}</span>
                {selectedRec.media?.vote_average && (
                  <div className="flex items-center gap-1">
                    <IoStar className="text-amber-400" />
                    <span>{selectedRec.media.vote_average.toFixed(1)}</span>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-zinc-300 leading-relaxed text-center sm:text-left">
                {selectedRec.reason}
              </p>
            </div>
          </div>

          {/* Save Button - Fixed at Bottom */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-900 border-t border-zinc-800 sm:relative sm:border-0 sm:bg-transparent sm:mt-8">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSave(selectedRec);
              }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-violet-600/20 hover:bg-violet-500 rounded-xl transition-colors duration-300 sm:max-w-xs sm:mx-auto"
            >
              <IoBookmarkOutline className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">Save to History</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
