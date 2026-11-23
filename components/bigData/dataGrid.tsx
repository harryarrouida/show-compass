"use client";

import { useEffect, useMemo, useState } from "react";
import { IoClose, IoSearchOutline, IoTvOutline, IoFilmOutline } from "react-icons/io5";
import { MappedShow, MappedMovie } from "@/types/types";
import MediaCard from "@/components/bigData/mediaCard";
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
  movies,
  page,
  setPage,
  isLoading,
  isWithSearch = false,
}: DataGridProps) {
  const data = activeTab === "movies" ? movies : shows;
  const [searchTerm, setSearchTerm] = useState("");
  const [displayCount, setDisplayCount] = useState(10);
  const [requestedPage, setRequestedPage] = useState<number | null>(null);

  useEffect(() => {
    setDisplayCount(10);
    setSearchTerm("");
    setRequestedPage(null);
  }, [activeTab]);

  useEffect(() => {
    if (!isLoading && requestedPage === page) setRequestedPage(null);
  }, [isLoading, page, requestedPage]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLocaleLowerCase();
    return term ? data.filter(item => item.title.toLocaleLowerCase().includes(term)) : data;
  }, [data, searchTerm]);

  const visible = isWithSearch ? filtered.slice(0, displayCount) : filtered;
  // Trakt has a finite local collection; trending fetches new pages from TMDB.
  // A response smaller than one typical TMDB page indicates the end of trending data.
  const canLoadMore = isWithSearch
    ? visible.length < filtered.length
    : data.length >= page * 20;
  const loadingMore = isLoading || requestedPage !== null;

  const changeTab = (tab: "shows" | "movies") => {
    if (tab === activeTab) return;
    setPage(1);
    setActiveTab(tab);
  };

  const loadMore = () => {
    if (loadingMore || !canLoadMore) return;
    if (isWithSearch) setDisplayCount(count => count + 10);
    else {
      setRequestedPage(page + 1);
      setPage(previous => previous + 1);
    }
  };

  return (
    <section className="w-full space-y-6" aria-label={isWithSearch ? "Your Trakt library" : "Trending titles"}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-hover">
            {isWithSearch ? "Your collection" : "Discover"}
          </p>
          <h2 className="section-heading">{isWithSearch ? "Your watch history" : "Trending now"}</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {isWithSearch ? "Browse the movies and shows you've watched." : "Explore popular titles and discover your next favorite."}
          </p>
        </div>
        <div className="flex items-center gap-1 self-start rounded-xl border border-border-primary bg-background-secondary p-1" role="group" aria-label="Content type">
          {(["shows", "movies"] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => changeTab(tab)}
              aria-pressed={activeTab === tab}
              className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${activeTab === tab ? "bg-accent-primary/15 text-accent-hover" : "text-text-secondary hover:bg-background-tertiary hover:text-text-primary"}`}
            >
              {tab === "shows" ? <IoTvOutline aria-hidden="true" /> : <IoFilmOutline aria-hidden="true" />}
              {tab === "shows" ? "TV shows" : "Movies"}
            </button>
          ))}
        </div>
      </div>

      {isWithSearch && (
        <div className="relative max-w-sm">
          <IoSearchOutline aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            value={searchTerm}
            onChange={event => { setSearchTerm(event.target.value); setDisplayCount(10); }}
            type="search"
            aria-label={`Filter ${activeTab}`}
            placeholder={`Filter ${activeTab}...`}
            className="field-control w-full py-3 pl-11 pr-11"
          />
          {searchTerm && (
            <button type="button" onClick={() => { setSearchTerm(""); setDisplayCount(10); }} aria-label="Clear filter"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-text-secondary hover:text-text-primary">
              <IoClose aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {visible.length > 0 && (
        <div className="poster-grid">
          {visible.map(item => (
            <MediaCard key={`${activeTab}-${item.id}`} item={item} activeTab={activeTab} />
          ))}
        </div>
      )}

      {isLoading && data.length === 0 && (
        <div className="poster-grid" aria-label="Loading titles" aria-busy="true">
          {Array.from({ length: 10 }, (_, index) => <CardSkeleton key={index} index={index} />)}
        </div>
      )}

      {!isLoading && visible.length === 0 && (
        <div className="empty-state" role="status">
          <h3 className="font-semibold text-text-primary">{searchTerm ? "No matching titles" : "No titles to show"}</h3>
          <p className="mt-2">{searchTerm ? "Try a different search term." : "Nothing is available in this section yet."}</p>
          {searchTerm && <button className="secondary-action mt-4" onClick={() => setSearchTerm("")}>Clear filter</button>}
        </div>
      )}

      {canLoadMore && (
        <div className="flex justify-center pt-4">
          <button type="button" onClick={loadMore} disabled={loadingMore} className="secondary-action min-w-40" aria-busy={loadingMore}>
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </section>
  );
}
