"use client";

import Image from "next/image";
import { ShowDetails, MovieDetails } from "@/types/types";
import AIRecommendations from "@/components/recommendations/aiRecommendations";
import { AIRecommendation } from "@/types/types";
import { useState } from "react";
import { IoTime, IoCalendar, IoLanguage, IoBusinessSharp, IoChevronDown, IoChevronUp } from "react-icons/io5";

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
  const [showAllDetails, setShowAllDetails] = useState(false);

  return (
    <div className="flex flex-col md:grid md:grid-cols-[300px_1fr] gap-8 mb-12">
      {/* Left Column */}
      <div className="space-y-8 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-sm rounded-2xl border border-zinc-800/50 p-6 w-full">
        {/* Poster */}
        <div className="relative aspect-[2/3] w-[200px] sm:w-[240px] md:w-[260px] mx-auto rounded-xl overflow-hidden bg-zinc-900/40 ring-1 ring-zinc-800/50">
          <Image
            src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${details.poster_path}`}
            alt={details.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-500"
            priority
            sizes="(max-width: 640px) 200px, (max-width: 768px) 240px, 260px"
          />
        </div>

        {/* Info Section */}
        <div className="space-y-8">
          {/* Rating & Year */}
          <div className="bg-zinc-800/20 backdrop-blur-sm rounded-xl p-5 border border-zinc-700/30 space-y-4 hover:border-zinc-700/50 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-lg">★</span>
                <span className="text-white text-lg font-medium">{details.vote_average?.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <IoCalendar className="w-4 h-4" />
                <span>
                  {details.type === "movie"
                    ? new Date(details.release_date).getFullYear()
                    : new Date(details.first_air_date).getFullYear()}
                </span>
              </div>
            </div>

            {/* Runtime */}
            {"runtime" in details && details.runtime && (
              <div className="flex items-center gap-2 text-zinc-400">
                <IoTime className="w-4 h-4" />
                <span>{Math.floor(details.runtime / 60)}h {details.runtime % 60}m</span>
              </div>
            )}
          </div>

          {/* Mobile Toggle Button */}
          {isMobile && (
            <button
              onClick={() => setShowAllDetails(!showAllDetails)}
              className="w-full flex items-center justify-center gap-2 text-zinc-400 hover:text-violet-400 transition-colors"
            >
              <span>{showAllDetails ? "Show Less" : "Show More Details"}</span>
              {showAllDetails ? <IoChevronUp /> : <IoChevronDown />}
            </button>
          )}

          <div className={`space-y-8 ${isMobile && !showAllDetails ? 'hidden' : ''}`}>
            {/* Genres */}
            {details.genres && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {details.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 
                               rounded-full text-sm text-violet-300 whitespace-nowrap transition-all duration-300 cursor-default"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Show Specific Details - Seasons */}
            {"seasons" in details && details.seasons && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-300 uppercase tracking-wider">Seasons</h3>
                <div className="space-y-3">
                  {details.seasons
                    .slice(0, showAllSeasons ? undefined : 4)
                    .map((season) => (
                      <div
                        key={season.id}
                        className="bg-zinc-800/20 backdrop-blur-sm rounded-xl p-4 space-y-2 border border-zinc-700/30 
                                 hover:bg-zinc-800/30 hover:border-zinc-700/50 transition-all duration-300"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-white">
                            {season.name}
                          </span>
                          {season.vote_average > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-amber-400/90">★</span>
                              <span className="text-zinc-400">
                                {season.vote_average.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400">
                          {season.episode_count} Episodes • {new Date(season.air_date).getFullYear()}
                        </div>
                      </div>
                    ))}
                  {details.seasons.length > 4 && (
                    <button
                      onClick={() => setShowAllSeasons(!showAllSeasons)}
                      className="w-full text-center text-sm text-zinc-400 hover:text-violet-400 transition-colors py-2"
                    >
                      {showAllSeasons
                        ? "Show Less"
                        : `Show All ${details.seasons.length} Seasons`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Languages */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-300">
                <IoLanguage className="w-4 h-4" />
                <h3 className="text-sm font-medium uppercase tracking-wider">Languages</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {details.spoken_languages?.map((lang) => (
                  <span
                    key={lang.iso_639_1}
                    className="text-xs text-zinc-400 bg-zinc-800/20 backdrop-blur-sm px-3 py-1.5 rounded-full 
                             border border-zinc-700/30 hover:border-zinc-700/50 transition-colors cursor-default"
                  >
                    {lang.english_name}
                  </span>
                ))}
              </div>
            </div>

            {/* Production Companies */}
            {details.production_companies && details.production_companies.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-300">
                  <IoBusinessSharp className="w-4 h-4" />
                  <h3 className="text-sm font-medium uppercase tracking-wider">Production</h3>
                </div>
                <div className="text-sm text-zinc-400">
                  {details.production_companies.map((company) => company.name).join(", ")}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-8">
        {/* Title and Overview */}
        <div className="space-y-6">
          <h1 className="text-2xl md:text-4xl font-bold text-white text-center md:text-left bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            {details.title}
          </h1>
          <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-sm rounded-2xl border border-zinc-800/50 p-6">
            <p className={`text-base md:text-lg text-zinc-300 leading-relaxed
              ${!isMobile || showAllOverview ? "line-clamp-none" : "line-clamp-3"}`}
            >
              {details.overview}
            </p>
            {isMobile && (
              <button
                onClick={() => setShowAllOverview(!showAllOverview)}
                className="mt-4 text-center w-full text-zinc-400 text-sm hover:text-violet-400 transition-colors"
              >
                {showAllOverview ? "Show Less" : "Show More"}
              </button>
            )}
          </div>
        </div>

        {/* AI Recommendations Section */}
        <div>
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
  );
}
