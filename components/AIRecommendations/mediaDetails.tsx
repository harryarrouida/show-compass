"use client";

import Image from "next/image";
import { ShowDetails, MovieDetails } from "@/types/types";
import AIRecommendations from "@/components/AIRecommendations/aiRecommendations";
import { AIRecommendation } from "@/types/types";
import { useState } from "react";
import { IoStar, IoTime, IoCalendar, IoLanguage, IoBusinessSharp } from "react-icons/io5";
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

  return (
    <div className="relative w-full">
      {/* Backdrop Hero Section */}
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        {/* Backdrop Image */}
        <div className="absolute inset-0">
          <OptimizedImage
            src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${details.backdrop_path || details.poster_path}`}
            alt={details.title}
            className="object-cover"
            priority={true}
            sizes="100vw"
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row items-end h-full pb-12 md:pb-16 gap-6 md:gap-8">
            {/* Poster - Overlapping */}
            <div className="relative w-[180px] sm:w-[220px] md:w-[260px] lg:w-[300px] flex-shrink-0 
                          transform md:translate-y-16 lg:translate-y-20
                          shadow-2xl rounded-xl overflow-hidden
                          ring-1 ring-white/10">
              <div className="aspect-[2/3]">
                <OptimizedImage
                  src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${details.poster_path}`}
                  alt={details.title}
                  className="object-cover"
                  priority={true}
                  sizes="(max-width: 640px) 180px, (max-width: 768px) 220px, (max-width: 1024px) 260px, 300px"
                />
              </div>
            </div>

            {/* Title and Quick Info Card */}
            <div className="flex-1 space-y-4 md:space-y-6">
              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white 
                           drop-shadow-2xl leading-tight">
                {details.title}
              </h1>

              {/* Quick Stats - Glassmorphism Card */}
              <div className="inline-flex flex-wrap items-center gap-3 md:gap-4
                            bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-3
                            border border-white/20 shadow-2xl">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <IoStar className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                  <span className="text-lg md:text-xl font-bold text-white">
                    {details.vote_average?.toFixed(1)}
                  </span>
                </div>

                <div className="w-px h-6 bg-white/20" />

                {/* Year */}
                <div className="flex items-center gap-2 text-zinc-200">
                  <IoCalendar className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base font-medium">
                    {details.type === "movie"
                      ? new Date(details.release_date).getFullYear()
                      : new Date(details.first_air_date).getFullYear()}
                  </span>
                </div>

                {/* Runtime */}
                {"runtime" in details && details.runtime && (
                  <>
                    <div className="w-px h-6 bg-white/20" />
                    <div className="flex items-center gap-2 text-zinc-200">
                      <IoTime className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-sm md:text-base font-medium">
                        {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Genres */}
              {details.genres && details.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {details.genres.slice(0, 4).map((genre) => (
                    <span
                      key={genre.id}
                      className="px-4 py-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30
                               rounded-full text-sm md:text-base text-blue-200 font-medium
                               hover:bg-blue-500/30 transition-colors"
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 -mt-12 md:-mt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 md:gap-12">
          {/* Left Sidebar - Additional Details */}
          <div className="space-y-6 order-2 lg:order-1">
            {/* Seasons (for TV Shows) */}
            {"seasons" in details && details.seasons && details.seasons.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-500 rounded-full" />
                  Seasons
                </h3>
                <div className="space-y-3">
                  {details.seasons
                    .slice(0, showAllSeasons ? undefined : 3)
                    .map((season) => (
                      <div
                        key={season.id}
                        className="flex justify-between items-center p-3 
                                 hover:bg-zinc-800/50 rounded-lg transition-all
                                 group cursor-pointer"
                      >
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {season.name}
                          </div>
                          <div className="text-xs text-zinc-400 mt-0.5">
                            {season.episode_count} Episodes • {new Date(season.air_date).getFullYear()}
                          </div>
                        </div>
                        {season.vote_average > 0 && (
                          <div className="flex items-center gap-1.5">
                            <IoStar className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium text-zinc-300">
                              {season.vote_average.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  {details.seasons.length > 3 && (
                    <button
                      onClick={() => setShowAllSeasons(!showAllSeasons)}
                      className="w-full text-center text-sm text-blue-400 hover:text-blue-300 
                               transition-colors font-medium py-2"
                    >
                      {showAllSeasons ? "Show Less" : `Show All ${details.seasons.length} Seasons`}
                    </button>
                  )}
                </div>
              </Card>
            )}

            {/* Languages */}
            {details.spoken_languages && details.spoken_languages.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 text-white mb-4">
                  <IoLanguage className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold uppercase tracking-wide">Languages</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {details.spoken_languages.map((lang) => (
                    <span
                      key={lang.iso_639_1}
                      className="text-sm text-zinc-300 bg-zinc-800/50 px-3 py-1.5 rounded-lg
                               hover:bg-zinc-800 transition-colors"
                    >
                      {lang.english_name}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Production Companies */}
            {details.production_companies && details.production_companies.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 text-white mb-4">
                  <IoBusinessSharp className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold uppercase tracking-wide">Production</h3>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {details.production_companies.map((company) => company.name).join(", ")}
                </p>
              </Card>
            )}
          </div>

          {/* Right Content - Overview and Recommendations */}
          <div className="space-y-8 md:space-y-12 order-1 lg:order-2">
            {/* Overview */}
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <span className="w-1 h-7 bg-blue-500 rounded-full" />
                Overview
              </h2>
              <Card className="p-6 md:p-8">
                <p className={`text-base md:text-lg text-zinc-300 leading-relaxed
                  ${!isMobile || showAllOverview ? "" : "line-clamp-4"}`}
                >
                  {details.overview}
                </p>
                {isMobile && details.overview.length > 200 && (
                  <button
                    onClick={() => setShowAllOverview(!showAllOverview)}
                    className="mt-4 text-sm text-blue-400 hover:text-blue-300 
                             transition-colors font-medium"
                  >
                    {showAllOverview ? "Show Less" : "Read More"}
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
