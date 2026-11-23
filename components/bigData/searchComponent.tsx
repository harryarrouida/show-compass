"use client";

import { useEffect, useState } from "react";
import { IoClose, IoSearchOutline, IoSparklesOutline } from "react-icons/io5";
import { MappedMovie, MappedShow } from "@/types/types";
import { searchMovies } from "@/services/content/movieServices";
import { searchShows } from "@/services/content/showServices";
import MediaCard from "@/components/bigData/mediaCard";
import CardSkeleton from "@/components/shared/loaders/CardSkeleton";

const suggestions = ["Arcane", "Attack on Titan", "Frieren"];

export default function SearchComponent() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<(MappedMovie | MappedShow)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const normalizedQuery = query.trim();
  const hasQuery = normalizedQuery.length >= 2;

  useEffect(() => {
    let active = true;
    if (!hasQuery) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const timer = setTimeout(async () => {
      try {
        // Don't let a failure in one TMDB endpoint hide results from the other.
        const [movies, shows] = await Promise.allSettled([
          searchMovies(normalizedQuery),
          searchShows(normalizedQuery),
        ]);
        if (!active) return;
        if (movies.status === "rejected" && shows.status === "rejected") {
          throw new Error("Both searches failed");
        }
        const combined = [
          ...(movies.status === "fulfilled" ? movies.value : []),
          ...(shows.status === "fulfilled" ? shows.value : []),
        ];
        const unique = Array.from(new Map(combined.map(item => [`${item.type}-${item.id}`, item])).values());
        setResults(unique.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)).slice(0, 10));
      } catch (err) {
        if (!active) return;
        console.error("Search error:", err);
        setResults([]);
        setError("Search is unavailable right now. Please try again.");
      } finally {
        if (active) setIsLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [normalizedQuery, hasQuery, retry]);

  return (
    <section className="surface-panel relative overflow-hidden px-5 py-10 sm:px-10 sm:py-14" aria-labelledby="discover-heading">
      <div className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full bg-accent-primary/10 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-accent-hover">
          <IoSparklesOutline aria-hidden="true" />
          Discover something worth watching
        </div>
        <h1 id="discover-heading" className="text-center text-3xl font-bold tracking-tight text-text-primary sm:text-5xl">
          Find your next watch
        </h1>
        <p className="mx-auto mb-8 mt-4 max-w-xl text-center text-sm leading-relaxed text-text-secondary sm:text-base">
          Start with a movie or series you love. We&apos;ll help you find what to watch next.
        </p>

        <div className="relative">
          <IoSearchOutline aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-text-secondary" />
          <input
            id="media-search"
            type="search"
            autoComplete="off"
            aria-label="Search movies and TV shows"
            aria-controls="media-search-results"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search movies and TV shows..."
            className="field-control w-full py-4 pl-12 pr-14 text-base [&::-webkit-search-cancel-button]:hidden"
          />
          {query.length > 0 && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="icon-action absolute right-2 top-1/2 -translate-y-1/2">
              <IoClose aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-text-tertiary">Try</span>
          {suggestions.map(suggestion => (
            <button key={suggestion} type="button" onClick={() => setQuery(suggestion)} className="chip-action">
              {suggestion}
            </button>
          ))}
        </div>

        <div id="media-search-results" aria-live="polite" aria-busy={isLoading} className="mt-8">
          {isLoading ? (
            <div className="poster-grid">{Array.from({ length: 5 }, (_, index) => <CardSkeleton key={index} index={index} />)}</div>
          ) : error ? (
            <div role="alert" className="empty-state border-red-500/30">
              <p className="text-red-300">{error}</p>
              <button type="button" className="secondary-action mt-3" onClick={() => setRetry(value => value + 1)}>Try again</button>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-sm font-semibold text-text-primary">Search results</h2>
                <span className="text-xs text-text-tertiary">{results.length} titles</span>
              </div>
              <div className="poster-grid">{results.map(item => <MediaCard key={`${item.type}-${item.id}`} item={item} activeTab="" />)}</div>
            </>
          ) : hasQuery ? (
            <div className="empty-state" role="status">
              No results for <strong className="text-text-primary">{normalizedQuery}</strong>. Try a different title.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
