"use client";

import { useEffect, useState } from "react";
import { RiRobot2Line } from "react-icons/ri";
import { IoChevronForwardOutline, IoSparklesOutline } from "react-icons/io5";
import { useTraktContext } from "@/contexts/traktContext";
import { useHistory } from "@/contexts/historyContext";
import { useGenerations } from "@/contexts/GenerationsContext";
import { useRecommendationFeedback } from "@/contexts/recommendationFeedbackContext";
import { generateTraktAIRecommendations } from "@/app/actions/traktRecommendations";
import { getUserRatings, getUserWatchlist } from "@/services/trakt/traktServices";
import type { AIRecommendation } from "@/types/types";
import type { MediaKind } from "@/lib/recommendation-engine";
import Card from "@/components/shared/ui/Card";
import CardSkeleton from "@/components/shared/loaders/CardSkeleton";
import { RecommendationCard } from "@/components/AIRecommendations/RecommendationCard";
import { RecommendationModal } from "@/components/AIRecommendations/RecommendationModal";

const COOLDOWN_KEY = "showcompass:recommendations:cooldown";

export default function TraktRecommendations() {
  const { accessToken, watchedMoviesCache, watchedShowsCache, getUserWatchedMovies, getUserWatchedShows } = useTraktContext();
  const { history, saveToHistory } = useHistory();
  const { generationsLeft, useGeneration: consumeGeneration } = useGenerations();
  const { feedback, ready, mark } = useRecommendationFeedback();

  const [type, setType] = useState<MediaKind>("show");
  const [count, setCount] = useState<5 | 10>(5);
  const [fromWatchlist, setFromWatchlist] = useState(false);
  const [animeOnly, setAnimeOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AIRecommendation[]>([]);
  const [selected, setSelected] = useState<AIRecommendation | null>(null);
  const [pastIds, setPastIds] = useState<number[]>([]);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
    try {
      setCooldownUntil(Number(localStorage.getItem(COOLDOWN_KEY) || 0));
    } catch { /* Optional local cooldown storage */ }
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    setResults([]);
    setPastIds([]);
    setError(null);
  }, [type, fromWatchlist]);

  const remainingSeconds = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
  const outOfGenerations = process.env.NODE_ENV === "production" && generationsLeft <= 0;
  const visibleResults = results.filter(rec => !feedback.some(item =>
    item.id === rec.media?.id && item.type === type && item.sentiment === "not_interested"
  ));

  const generate = async () => {
    if (loading || remainingSeconds > 0 || outOfGenerations || !ready) return;
    if (!accessToken) {
      setError("Connect your Trakt account first.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const typeKey = type === "movie" ? "movies" : "shows";
      const cached = type === "movie" ? watchedMoviesCache : watchedShowsCache;
      const watched = cached.length ? cached : await (type === "movie" ? getUserWatchedMovies() : getUserWatchedShows());
      if (!Array.isArray(watched) || !watched.length) {
        throw new Error(`No watched ${typeKey} in your Trakt history yet.`);
      }

      // This is a real personal signal; TMDB public ratings are not user ratings.
      const [ratings, watchlist] = await Promise.all([
        getUserRatings(accessToken, typeKey).catch(error => {
          console.warn("Trakt ratings unavailable; continuing without them:", error);
          return [];
        }),
        fromWatchlist ? getUserWatchlist(accessToken, typeKey) : Promise.resolve([]),
      ]);

      if (fromWatchlist && !watchlist.length) throw new Error("Your Trakt watchlist is empty.");

      const picks = await generateTraktAIRecommendations({
        mode: "trakt",
        type,
        count,
        animeOnly,
        watched: watched.map((item: { tmdbId: number; title: string }) => ({
          id: item.tmdbId, title: item.title, type,
        })),
        saved: history.map(item => ({
          id: item.data.id, title: item.data.title, type: item.mediaType,
        })),
        watchlist: watchlist.map((item: { tmdbId: number; title: string }) => ({
          id: item.tmdbId, title: item.title, type,
        })),
        ratings,
        feedback,
        excludedIds: pastIds,
      });

      setResults(picks);
      setPastIds(previous => [...new Set([...previous, ...picks.map(p => p.media?.id).filter((id): id is number => typeof id === "number")])].slice(-300));
      consumeGeneration();

      if (process.env.NODE_ENV === "production") {
        const until = Date.now() + 3 * 60 * 1000;
        setCooldownUntil(until);
        setNow(Date.now());
        try { localStorage.setItem(COOLDOWN_KEY, String(until)); } catch { /* Optional */ }
      }
    } catch (error) {
      console.error("Trakt recommendation request failed:", error);
      setError(error instanceof Error ? error.message : "Couldn't generate recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const save = (rec: AIRecommendation) => {
    if (!rec.media) return;
    saveToHistory(rec.media as any, rec.media.type, rec.reason, "Trakt Recommendations");
  };

  return (
    <section className="space-y-6" aria-labelledby="trakt-ai-heading">
      <Card className="p-5 sm:p-8">
        <div className="flex items-start gap-3 border-b border-border-primary pb-5">
          <div className="rounded-xl border border-border-primary bg-background-tertiary p-3 text-accent-primary">
            <RiRobot2Line aria-hidden="true" className="size-5" />
          </div>
          <div>
            <h2 id="trakt-ai-heading" className="section-heading">Personalized AI picks</h2>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              Ranked from real TMDB titles using your Trakt history and personal ratings.
            </p>
            {process.env.NODE_ENV === "production" &&
              <p className="mt-1 text-xs text-text-tertiary">{generationsLeft} generations left today</p>}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex flex-1 flex-wrap items-end gap-3">
              <label className="flex min-w-36 flex-1 flex-col gap-2 text-xs font-medium text-text-secondary sm:flex-none">
                Media
                <select value={type} onChange={event => setType(event.target.value as MediaKind)} className="field-control min-h-11 px-4 text-sm">
                  <option value="show">TV shows</option>
                  <option value="movie">Movies</option>
                </select>
              </label>
              <label className="flex min-w-36 flex-1 flex-col gap-2 text-xs font-medium text-text-secondary sm:flex-none">
                Results
                <select value={count} onChange={event => setCount(Number(event.target.value) as 5 | 10)} className="field-control min-h-11 px-4 text-sm">
                  <option value={5}>5 picks</option>
                  <option value={10}>10 picks</option>
                </select>
              </label>
              <button type="button" aria-pressed={fromWatchlist} onClick={() => setFromWatchlist(value => !value)}
                className={`secondary-action ${fromWatchlist ? "border-border-hover bg-accent-primary/15 text-accent-hover" : ""}`}>
                {fromWatchlist ? "From watchlist" : "Any title"}
              </button>
              <button type="button" aria-pressed={animeOnly} onClick={() => setAnimeOnly(value => !value)}
                className={`secondary-action ${animeOnly ? "border-border-hover bg-accent-primary/15 text-accent-hover" : ""}`}>
                {animeOnly ? "Anime only" : "All animation & live action"}
              </button>
            </div>
            <button type="button" onClick={generate}
              disabled={loading || remainingSeconds > 0 || outOfGenerations || !ready}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-interactive-button-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-interactive-button-primaryHover disabled:cursor-not-allowed disabled:opacity-50">
              <IoSparklesOutline aria-hidden="true" />
              {loading ? "Finding matches..." : remainingSeconds > 0 ? `Try again in ${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, "0")}` : outOfGenerations ? "Daily limit reached" : "Find recommendations"}
              {!loading && remainingSeconds === 0 && !outOfGenerations && <IoChevronForwardOutline aria-hidden="true" />}
            </button>
          </div>
          <p className="text-xs leading-relaxed text-text-tertiary">
            Interested / Not interested feedback improves future results on this device. We exclude watched, saved, and dismissed titles.
          </p>
          {error && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}
        </div>
      </Card>

      {loading && <div className="poster-grid" aria-label="Finding recommendations" aria-busy="true">
        {Array.from({ length: count }, (_, index) => <CardSkeleton key={index} index={index} />)}
      </div>}

      {!loading && visibleResults.length > 0 && (
        <div className="poster-grid">
          {visibleResults.map((rec, index) => (
            <RecommendationCard key={`${rec.media?.type}-${rec.media?.id}`} recommendation={rec} index={index}
              onSelect={setSelected} onSave={save} />
          ))}
        </div>
      )}

      {selected && (
        <RecommendationModal recommendation={selected} onClose={() => setSelected(null)}
          onSave={save}
          onFeedback={(sentiment) => { if (selected.media) mark(selected.media.id, selected.media.type, sentiment); setSelected(null); }} />
      )}
    </section>
  );
}
