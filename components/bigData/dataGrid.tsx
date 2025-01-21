"use client";

import { useState, useEffect } from "react";
import { MappedShow, MappedMovie } from "@/types/types";
import MediaCard from "@/components/bigData/mediaCard";
import { IoClose } from "react-icons/io5";
import CardSkeleton from "../shared/loaders/CardSkeleton";

interface DataGridProps {
  activeTab: "shows" | "movies";
  setActiveTab: (tab: "shows" | "movies") => void;
  shows: MappedShow[];
  setShows: React.Dispatch<React.SetStateAction<MappedShow[]>>;
  movies: MappedMovie[];
  setMovies: React.Dispatch<React.SetStateAction<MappedMovie[]>>;
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
  const [filteredData, setFilteredData] =
    useState<(MappedShow | MappedMovie)[]>(data);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [displayCount, setDisplayCount] = useState<number>(10);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setItemsPerPage(window.innerWidth > 768 ? 10 : 9);

    const handleResize = () => {
      setItemsPerPage(window.innerWidth > 768 ? 10 : 9);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setPage(1);
    setDisplayCount(10);
  }, [activeTab, setPage]);

  useEffect(() => {
    setFilteredData(data);
  }, [data, activeTab]);

  const handleLoadMore = () => {
    if (!isLoading) {
      if (isWithSearch) {
        setDisplayCount((prevCount) => prevCount + itemsPerPage);
      } else {
        setPage((prev) => prev + 1);
      }
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

  return (
    <div className="mx-auto max-w-8xl lg:max-w-7xl px-2 sm:px-6 lg:px-12">
      <div className="mx-auto flex flex-col sm:flex-row justify-between items-center mb-16 gap-6 sm:gap-0">
        <div
          className={
            isWithSearch
              ? "inline-flex space-x-12 border-b border-zinc-800/50"
              : "mx-auto space-x-12 border-b border-zinc-800/50"
          }
        >
          <button
            onClick={() => setActiveTab("shows")}
            disabled={isLoading}
            className={`pb-4 px-3 text-base font-medium relative ${
              activeTab === "shows"
                ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-zinc-500"
                : "text-zinc-500 hover:text-zinc-400"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Shows
          </button>
          <button
            onClick={() => setActiveTab("movies")}
            disabled={isLoading}
            className={`pb-4 px-3 text-base font-medium relative ${
              activeTab === "movies"
                ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-zinc-500"
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
              className={`w-full sm:w-64 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
            {searchTerm.length > 0 && (
              <button
                onClick={handleClearSearch}
                disabled={isLoading}
                className={`absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <IoClose size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="w-full grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 sm:gap-8">
        {(isWithSearch ? filteredData : data)
          .slice(0, isWithSearch ? displayCount : undefined)
          .map((item, index) => (
            <div key={item.id + index} className="w-full aspect-[2/3]">
              <MediaCard
                item={item}
                activeTab={activeTab}
                key={item.id + index}
              />
            </div>
          ))}
      </div>

      {isLoading && (
        <div className="w-full grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {[...Array(10)].map((_, index) => (
            <CardSkeleton key={index} index={index} />
          ))}
        </div>
      )}

      {(!isWithSearch && !isLoading) ||
      (isWithSearch &&
        (filteredData.length > displayCount || data.length > displayCount)) ? (
        <div className="mt-20 mb-16 flex justify-center">
          <button
            onClick={handleLoadMore}
            className="px-8 py-3 bg-zinc-800 text-zinc-300 text-sm rounded-full"
          >
            Load More
          </button>
        </div>
      ) : null}
    </div>
  );
}
