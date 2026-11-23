"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Dialog from "@/components/shared/ui/Dialog";
import {
  IoTrashOutline,
  IoStarOutline,
  IoStar,
  IoAnalytics,
  IoClose,
  IoBookmarkOutline,
} from "react-icons/io5";
import { RiRobot2Line } from "react-icons/ri";
import Card from "@/components/shared/ui/Card";
import { useHistory } from "@/contexts/historyContext";
import { MappedMovie, MappedShow } from "@/types/types";
import OptimizedImage from "@/components/shared/handlers/optimizedImage";
import CardSkeleton from "@/components/shared/loaders/CardSkeleton";

interface HistoryItem {
  id: number;
  mediaType: "movie" | "show";
  timestamp: number;
  data: MappedMovie | MappedShow;
  reason: string;
  from: MappedMovie | MappedShow | string;
}

export default function HistoryPage() {
  const [showAll, setShowAll] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const {
    history: historyContext,
    clearHistory,
    deleteFromHistory,
  } = useHistory();
  const [showFullReason, setShowFullReason] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const sortedHistory = [...historyContext].sort((a, b) => b.timestamp - a.timestamp);
  const displayHistory = showAll ? sortedHistory : sortedHistory.slice(0, 10);

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  return (
    <div
      className={`page-shell min-h-[70vh] max-w-7xl transition-opacity duration-500 ease-in-out ${isVisible ? "opacity-100" : "opacity-0"
        }`}
    >
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6 sm:mb-8">
        <div><h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">Saved recommendations</h1><p className="mt-2 text-sm text-text-secondary">Keep track of recommendations worth revisiting.</p></div>{historyContext.length > 0 && <span className="chip-action">{historyContext.length} saved</span>}
      </div>

      {historyContext.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <p className="text-zinc-300 text-base sm:text-lg">
            No saved recommendations yet. Save a title to find it here later.
          </p>
        </Card>
      ) : (
        <>
          <div className="poster-grid">
            {displayHistory.map((item) => (
                <div
                  key={item.id}
                  className="relative min-w-0"
                >
                  <button type="button" className="poster-control group" aria-haspopup="dialog" onClick={() => setSelectedItem(item as HistoryItem); setShowFullReason(false)}>
                    <span className="poster-frame">
                      <OptimizedImage
                        src={item.data.poster_path || ""}
                        alt=""
                        className="object-cover"
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    </span>
                    <span className="poster-title">{item.data.title}</span>
                    {item.data.vote_average > 0 && (
                      <span className="poster-rating">
                        <IoStar aria-hidden="true" className="size-3 text-amber-400" />
                        <span className="sr-only">Rating</span>
                        {item.data.vote_average.toFixed(1)}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { if (window.confirm(`Remove ${item.data.title} from saved recommendations?`)) deleteFromHistory(item.id); }}
                    aria-label={`Remove ${item.data.title} from history`}
                    className="icon-action absolute right-1 top-1 text-red-300"
                  >
                    <IoTrashOutline className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                  </button>
                </div>
              ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 mt-6 sm:mt-8">
            <button
              onClick={toggleShowAll}
              className="secondary-action"
            >
              {showAll ? "Show Less" : "Show All"}
            </button>
            <button
              onClick={() => { if (window.confirm("Remove all saved recommendations? This cannot be undone.")) clearHistory(); }}
              className="secondary-action text-red-300"
            >
              <IoTrashOutline className="w-4 h-4 mr-2" />
              Clear History
            </button>
          </div>
        </>
      )}

      {selectedItem && (
        <Dialog title={selectedItem.data.title} onClose={() => setSelectedItem(null)}>
            <div className="relative h-[200px] sm:h-[300px]">
              <OptimizedImage
                src={`${selectedItem.data.backdrop_path}`}
                alt={selectedItem.data.title}
                className="object-cover opacity-80"
                priority
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/70 to-transparent" />
            </div>

            <div className="absolute top-0 right-0 z-10 p-4">
              <button
                onClick={() => setSelectedItem(null)}
                className="icon-action"
                aria-label="Close saved recommendation"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>

            <div className="px-4 pb-8 sm:p-8 relative">
              <div className="flex flex-col md:flex-row md:gap-8">
                <div className="relative flex flex-col items-center">
                  <div className="relative w-[140px] h-[210px] md:w-[200px] md:h-[300px] rounded-lg overflow-hidden mx-auto md:mx-0 -mt-20 md:-mt-32">
                    <OptimizedImage
                      src={`${selectedItem.data.poster_path}`}
                      alt={selectedItem.data.title}
                      className="object-cover opacity-90"
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  </div>
                  <div className="hidden md:block w-full mt-4">
                    <button
                      onClick={() => {
                        deleteFromHistory(selectedItem.id);
                        setSelectedItem(null);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors duration-300"
                    >
                      <IoTrashOutline className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 text-sm font-medium">
                        Remove
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-4 mt-4 md:mt-0">
                  <h2 className="text-xl md:text-3xl font-semibold text-white text-center md:text-left">
                    {selectedItem.data.title}
                  </h2>

                  <div className="flex items-center justify-center md:justify-start gap-4 text-sm md:text-base text-zinc-300">
                    {selectedItem.data.release_date && (
                      <span>
                        {new Date(selectedItem.data.release_date).getFullYear()}
                      </span>
                    )}
                    {selectedItem.data.vote_average && (
                      <div className="flex items-center gap-1.5">
                        <IoStar className="text-amber-400 w-5 h-5" />
                        <span>{selectedItem.data.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-sm md:text-base text-zinc-300 leading-relaxed text-center md:text-left mb-10">
                    <p className={showFullReason ? "" : "line-clamp-2"}>
                      {selectedItem.reason}
                    </p>
                    <button
                      onClick={() => setShowFullReason(!showFullReason)}
                      className="text-zinc-400 hover:text-zinc-200 text-sm mt-2 transition-colors"
                    >
                      {showFullReason ? "Show Less" : "Show More"}
                    </button>
                  </div>

                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2 px-4 py-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50 backdrop-blur">
                    <div className="flex items-center gap-2">
                      <RiRobot2Line className="w-5 h-5 text-zinc-400" />
                      <span className="text-zinc-400 text-sm">
                        Recommended from:
                      </span>
                    </div>
                    <span className="text-blue-200 text-sm font-medium">
                      {typeof selectedItem.from === "string"
                        ? selectedItem.from
                        : selectedItem.from.title}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-zinc-900 border-t border-zinc-800 md:hidden mt-10">
                <button
                  onClick={() => {
                    deleteFromHistory(selectedItem.id);
                    setSelectedItem(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors duration-300"
                >
                  <IoTrashOutline className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 text-sm font-medium">
                    Remove from History
                  </span>
                </button>
              </div>
            </div>
        </Dialog>
      )}
    </div>
  );
}
