"use client";

import { ShowDetails, MovieDetails } from "@/types/types";
import AIRecommendations from "@/components/AIRecommendations/aiRecommendations";
import { AIRecommendation } from "@/types/types";
import { useState } from "react";
import {
  IoStar,
  IoTime,
  IoCalendar,
  IoLanguage,
  IoBusinessSharp,
  IoFilm,
  IoTv,
  IoChevronDown,
  IoChevronUp,
} from "react-icons/io5";
import Card from "@/components/shared/ui/Card";
import OptimizedImage from "../shared/handlers/optimizedImage";

interface MediaDetailsProps {
  details: ShowDetails | MovieDetails;
  showAllSeasons: boolean;
  setShowAllSeasons: (show: boolean) => void;
  aiRecommendations: AIRecommendation[];
  isAiLoading: boolean;
  saveToHistory: (recommendation: AIRecommendation) => void;
  alert: string | null;
  toggleChat: () => boolean;
  showChat: boolean;
  setPrompt: (prompt: string) => void;
  prompt: string;
  handleSubmitPrompt: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isMobile: boolean;
}

function isShowDetails(d: ShowDetails | MovieDetails): d is ShowDetails {
  return "seasons" in d;
}

function isMovieDetails(d: ShowDetails | MovieDetails): d is MovieDetails {
  return "runtime" in d;
}

export default function MediaDetails({
  details,
  showAllSeasons,
  setShowAllSeasons,
  aiRecommendations,
  isAiLoading,
  saveToHistory,
  alert,
  toggleChat,
  showChat,
  setPrompt,
  prompt,
  handleSubmitPrompt,
  isMobile,
}: MediaDetailsProps) {
  const [showAllOverview, setShowAllOverview] = useState(false);

  const year =
    details.type === "movie"
      ? new Date((details as MovieDetails).release_date).getFullYear()
      : new Date((details as ShowDetails).first_air_date).getFullYear();

  const backdropSrc = details.backdrop_path || details.poster_path;

  return (
    <div className="relative w-full">
      {/* ─── Hero / Backdrop ─────────────────────────────────────── */}
      <div className="relative w-full h-[420px] sm:h-[500px] lg:h-[580px] overflow-hidden">
        {/* Backdrop image */}
        <div className="absolute inset-0">
          <OptimizedImage
            src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${backdropSrc}`}
            alt={details.title}
            className="object-cover scale-105"
            priority={true}
            sizes="100vw"
          />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/80 via-[#111111]/30 to-transparent" />

        {/* Hero content */}
        <div className="relative h-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-end h-full pb-10 sm:pb-14 gap-6 sm:gap-8">
            {/* Poster */}
            <div
              className="
                hidden sm:block
                relative flex-shrink-0
                w-[160px] md:w-[210px] lg:w-[240px]
                translate-y-16 md:translate-y-20
                rounded-xl overflow-hidden
                shadow-[0_20px_60px_rgba(0,0,0,0.8)]
                ring-1 ring-white/10
              "
            >
              <div className="aspect-[2/3]">
                <OptimizedImage
                  src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${details.poster_path}`}
                  alt={details.title}
                  className="object-cover"
                  priority={true}
                  sizes="(max-width: 768px) 160px, (max-width: 1024px) 210px, 240px"
                />
              </div>
            </div>

            {/* Title + meta */}
            <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
              {/* Type badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-semibold text-white/80 uppercase tracking-wider">
                  {details.type === "movie" ? (
                    <IoFilm className="w-3 h-3" />
                  ) : (
                    <IoTv className="w-3 h-3" />
                  )}
                  {details.type === "movie" ? "Movie" : "TV Show"}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-2xl">
                {details.title}
              </h1>

              {/* Quick stats pill */}
              <div className="inline-flex flex-wrap items-center gap-2.5 sm:gap-3 bg-black/40 backdrop-blur-xl rounded-2xl px-5 py-2.5 border border-white/15 shadow-2xl">
                {/* Rating */}
                {details.vote_average > 0 && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <IoStar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                      <span className="text-base sm:text-lg font-bold text-white">
                        {details.vote_average.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-px h-5 bg-white/20" />
                  </>
                )}

                {/* Year */}
                <div className="flex items-center gap-1.5 text-zinc-200">
                  <IoCalendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-sm sm:text-base font-medium">
                    {year}
                  </span>
                </div>

                {/* Runtime (movies) */}
                {isMovieDetails(details) && details.runtime > 0 && (
                  <>
                    <div className="w-px h-5 bg-white/20" />
                    <div className="flex items-center gap-1.5 text-zinc-200">
                      <IoTime className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="text-sm sm:text-base font-medium">
                        {Math.floor(details.runtime / 60)}h{" "}
                        {details.runtime % 60}m
                      </span>
                    </div>
                  </>
                )}

                {/* Ep runtime (shows) */}
                {isShowDetails(details) &&
                  details.episode_run_time?.[0] > 0 && (
                    <>
                      <div className="w-px h-5 bg-white/20" />
                      <div className="flex items-center gap-1.5 text-zinc-200">
                        <IoTime className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="text-sm sm:text-base font-medium">
                          {details.episode_run_time[0]}m / ep
                        </span>
                      </div>
                    </>
                  )}

                {/* Season count */}
                {isShowDetails(details) && details.number_of_seasons > 0 && (
                  <>
                    <div className="w-px h-5 bg-white/20" />
                    <span className="text-sm sm:text-base font-medium text-zinc-200">
                      {details.number_of_seasons}{" "}
                      {details.number_of_seasons === 1 ? "Season" : "Seasons"}
                    </span>
                  </>
                )}
              </div>

              {/* Genres */}
              {details.genres && details.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {details.genres.slice(0, 5).map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 sm:px-4 sm:py-1.5
                               bg-indigo-500/15 backdrop-blur-sm border border-indigo-400/25
                               rounded-full text-xs sm:text-sm text-indigo-200 font-medium
                               hover:bg-indigo-500/25 transition-colors"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-16 relative z-10">
        {/*
          On mobile: single column — poster is hidden in hero so nothing overlaps.
          On desktop: left sidebar has top-padding to account for the poster overflow.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 md:gap-10 lg:gap-12">
          {/* ── Left Sidebar ── */}
          <div className="space-y-5 order-2 lg:order-1 lg:pt-24">
            {/* Mobile poster (only visible on small screens) */}
            <div className="sm:hidden w-[140px] mx-auto -mt-16 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <div className="aspect-[2/3]">
                <OptimizedImage
                  src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${details.poster_path}`}
                  alt={details.title}
                  className="object-cover"
                  priority={true}
                  sizes="140px"
                />
              </div>
            </div>

            {/* Seasons (TV) */}
            {isShowDetails(details) &&
              details.seasons &&
              details.seasons.length > 0 && (
                <Card className="p-5 overflow-hidden">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-indigo-500 rounded-full" />
                    Seasons
                  </h3>
                  <div className="space-y-1">
                    {details.seasons
                      .filter((s) => s.episode_count > 0)
                      .slice(0, showAllSeasons ? undefined : 4)
                      .map((season) => (
                        <div
                          key={season.id}
                          className="flex justify-between items-center px-3 py-2.5
                                     hover:bg-zinc-800/60 rounded-lg transition-all
                                     group cursor-pointer"
                        >
                          <div>
                            <div className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                              {season.name}
                            </div>
                            <div className="text-xs text-zinc-500 mt-0.5">
                              {season.episode_count} eps
                              {season.air_date &&
                                ` · ${new Date(season.air_date).getFullYear()}`}
                            </div>
                          </div>
                          {season.vote_average > 0 && (
                            <div className="flex items-center gap-1">
                              <IoStar className="w-3 h-3 text-amber-400" />
                              <span className="text-xs font-medium text-zinc-400">
                                {season.vote_average.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                  {details.seasons.filter((s) => s.episode_count > 0).length >
                    4 && (
                    <button
                      onClick={() => setShowAllSeasons(!showAllSeasons)}
                      className="mt-3 w-full flex items-center justify-center gap-1.5
                                 text-xs text-indigo-400 hover:text-indigo-300
                                 transition-colors font-medium py-1.5
                                 border-t border-zinc-800/60"
                    >
                      {showAllSeasons ? (
                        <>
                          <IoChevronUp className="w-3.5 h-3.5" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <IoChevronDown className="w-3.5 h-3.5" />
                          All{" "}
                          {
                            details.seasons.filter((s) => s.episode_count > 0)
                              .length
                          }{" "}
                          Seasons
                        </>
                      )}
                    </button>
                  )}
                </Card>
              )}

            {/* Languages */}
            {details.spoken_languages && details.spoken_languages.length > 0 && (
              <Card className="p-5">
                <div className="flex items-center gap-2 text-white mb-3">
                  <IoLanguage className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold uppercase tracking-widest">
                    Languages
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {details.spoken_languages.map((lang) => (
                    <span
                      key={lang.iso_639_1}
                      className="text-xs text-zinc-300 bg-zinc-800/60 px-2.5 py-1 rounded-lg
                                 border border-zinc-700/40
                                 hover:bg-zinc-800 transition-colors"
                    >
                      {lang.english_name}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Production Companies */}
            {details.production_companies &&
              details.production_companies.length > 0 && (
                <Card className="p-5">
                  <div className="flex items-center gap-2 text-white mb-3">
                    <IoBusinessSharp className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold uppercase tracking-widest">
                      Production
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {details.production_companies
                      .map((c) => c.name)
                      .join(" · ")}
                  </p>
                </Card>
              )}
          </div>

          {/* ── Right Content ── */}
          <div
            className="space-y-10 order-1 lg:order-2
                        lg:pt-6"
          >
            {/* Overview */}
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                <span className="w-1 h-6 bg-indigo-500 rounded-full" />
                Overview
              </h2>
              <Card className="p-5 sm:p-7">
                <p
                  className={`text-sm sm:text-base text-zinc-300 leading-relaxed
                    ${!isMobile || showAllOverview ? "" : "line-clamp-4"}`}
                >
                  {details.overview || "No overview available."}
                </p>
                {isMobile && details.overview && details.overview.length > 200 && (
                  <button
                    onClick={() => setShowAllOverview(!showAllOverview)}
                    className="mt-3 flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300
                               transition-colors font-medium"
                  >
                    {showAllOverview ? (
                      <>
                        <IoChevronUp className="w-3.5 h-3.5" /> Show Less
                      </>
                    ) : (
                      <>
                        <IoChevronDown className="w-3.5 h-3.5" /> Read More
                      </>
                    )}
                  </button>
                )}
              </Card>
            </div>

            {/* AI Recommendations */}
            <AIRecommendations
              isAiLoading={isAiLoading}
              aiRecommendations={aiRecommendations}
              saveToHistory={saveToHistory}
              alert={alert}
              toggleChat={toggleChat}
              showChat={showChat}
              setPrompt={setPrompt}
              prompt={prompt}
              handleSubmitPrompt={handleSubmitPrompt}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
