"use client";

import { useState, useEffect } from "react";
import { MappedShow, MappedMovie } from "@/types/types";
import MediaCard from "@/components/shared/mediaCard";
import { IoClose } from "react-icons/io5";

interface DataGridProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  shows: MappedShow[];
  setShows: (shows: MappedShow[]) => void;
  movies: MappedMovie[];
  setMovies: (movies: MappedMovie[]) => void;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isWithSearch: boolean;
}

export default function DataGrid({
  activeTab,
  setActiveTab,
  shows,
  setShows,
  movies,
  setMovies,
  page,
  setPage,
  isLoading,
  setIsLoading,
  isWithSearch = false,
}: DataGridProps) {
  const data = activeTab === "movies" ? movies : shows;
  const [filteredData, setFilteredData] = useState<(MappedShow | MappedMovie)[]>(data);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [displayCount, setDisplayCount] = useState<number>(10);
  const itemsPerPage = window.innerWidth > 768 ? 10 : 9;

  useEffect(() => {
    setPage(1);
    setDisplayCount(10);
  }, [activeTab, setPage]);

  useEffect(() => {
    setFilteredData(data);
  }, [data, page]);

  const handleLoadMore = async () => {
    if (!isLoading) {
      setIsLoading(true);
      setPage((prev: number) => prev + 1);
      
      // Keep existing content visible while loading new items
      const newDisplayCount = displayCount + itemsPerPage;
      const existingItems = data.slice(0, displayCount);
      const loadingItems = Array(itemsPerPage).fill(null);
      
      setFilteredData([...existingItems, ...loadingItems]);
      setDisplayCount(newDisplayCount);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    const searchTerm = e.target.value.toLowerCase();
    const filteredData = data.filter((item) =>
      item.title.toLowerCase().includes(searchTerm)
    );
    setFilteredData(filteredData as (MappedShow | MappedMovie)[]);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilteredData(data);
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse w-[100px] md:w-[150px] lg:w-[180px] mb-10 mx-auto" key={Math.random()}>
      <div className="bg-zinc-800 rounded-lg h-[300px] w-full"></div>
      <div className="mt-2 bg-zinc-800 h-4 w-3/4 rounded"></div>
      <div className="mt-1 bg-zinc-800 h-3 w-1/2 rounded"></div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12" key={Math.random()}>
      <div className="mx-auto flex flex-col sm:flex-row justify-between items-center mb-16 gap-6 sm:gap-0">
        <div className={isWithSearch ? "inline-flex space-x-12 border-b border-zinc-800/50" : "mx-auto space-x-12 border-b border-zinc-800/50"}>
          <button
            onClick={() => setActiveTab("shows")}
            disabled={isLoading}
            className={`pb-4 px-3 text-base font-medium transition-all duration-300 relative ${
              activeTab === "shows"
                ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-zinc-400 after:to-zinc-600"
                : "text-zinc-500 hover:text-zinc-400"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Shows
          </button>
          <button
            onClick={() => setActiveTab("movies")}
            disabled={isLoading}
            className={`pb-4 px-3 text-base font-medium transition-all duration-300 relative ${
              activeTab === "movies"
                ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-zinc-400 after:to-zinc-600"
                : "text-zinc-500 hover:text-zinc-400"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Movies
          </button>
        </div>

        {isWithSearch && (
          <div className="relative w-full sm:w-auto">
            <input
              value={searchTerm}
              onChange={handleSearch}
              type="text"
              placeholder="Search..."
              disabled={isLoading}
              className={`w-full sm:w-64 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
            {searchTerm.length > 0 && (
              <button
                onClick={handleClearSearch}
                disabled={isLoading}
                className={`absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <IoClose size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-8 place-items-center">
        {(isWithSearch ? filteredData : data).slice(0, displayCount).map((item, index) => (
          <div key={item?.id + item?.title || `loading-${index}`} className="w-full flex justify-center">
            {item ? (
              <div className="animate-fadeIn" key={item.id + Math.random()}>
                <MediaCard item={item} activeTab={activeTab} key={Math.random()} />
              </div>
            ) : (
              <LoadingSkeleton key={Math.random()} />
            )}
          </div>
        ))}
      </div>

      {((!isWithSearch && data.length > displayCount) || (isWithSearch && filteredData.length > displayCount)) && (
        <div className="mt-20 mb-16 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="group relative px-8 py-3 bg-gradient-to-r from-zinc-700 to-zinc-800 
                             disabled:from-zinc-900 disabled:to-zinc-900 disabled:cursor-not-allowed
                             text-white text-sm rounded-full transition-all duration-300
                             hover:shadow-lg hover:shadow-zinc-800/25"
          >
            <div className="relative flex items-center space-x-2">
              {isLoading && data.length > 0 ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-zinc-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-zinc-300">Loading...</span>
                </>
              ) : (
                <span className="text-zinc-300">Load More</span>
              )}
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
