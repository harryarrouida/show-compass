import Image from "next/image";
import { IoStar, IoClose, IoTime } from "react-icons/io5";
import { AIRecommendation } from "@/types/types";

interface RecommendationModalProps {
  recommendation: AIRecommendation;
  onClose: () => void;
}

export function RecommendationModal({
  recommendation: selectedRec,
  onClose,
}: RecommendationModalProps) {
  return (
    <div className="fixed inset-0 -top-10 min-h-screen z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-lg" onClick={onClose} />
      <div className="relative bg-zinc-900 w-full sm:rounded-lg sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white hover:text-zinc-300 z-10"
        >
          <IoClose className="w-6 h-6" />
        </button>

        <div className="relative h-[200px] sm:h-[300px] w-full">
          <Image
            src={`${process.env.NEXT_PUBLIC_TMDB_BACKDROP_URL}${selectedRec.media?.backdrop_path}`}
            alt={selectedRec.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
        </div>

        <div className="p-4 sm:p-6 -mt-16 relative">
          <div className="flex gap-4 sm:gap-6">
            <div className="relative w-[100px] sm:w-[120px] h-[150px] sm:h-[180px] rounded-lg overflow-hidden flex-shrink-0 shadow-xl">
              <Image
                src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${selectedRec.media?.poster_path}`}
                alt={selectedRec.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="space-y-2 sm:space-y-4 flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-semibold text-white truncate">
                {selectedRec.title}
              </h2>
              <div className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base text-zinc-300">
                <span>{selectedRec.media?.release_date?.split("-")[0]}</span>
                {selectedRec.media?.vote_average && (
                  <div className="flex items-center gap-1">
                    <IoStar className="text-amber-400" />
                    <span>{selectedRec.media.vote_average.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                {selectedRec.reason}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
