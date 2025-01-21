"use client";

import Image from "next/image";
import { ShowDetails, MovieDetails } from "@/types/types";
import AIRecommendations from "@/components/AIRecommendations/aiRecommendations";
import { AIRecommendation } from "@/types/types";
import { useState } from "react";
import { IoStarOutline, IoStar, IoTime, IoCalendar, IoLanguage, IoBusinessSharp, IoChevronDown, IoChevronUp } from "react-icons/io5";
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
  const [showAllDetails, setShowAllDetails] = useState(false);

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-8 mb-12">
      {/* Left Column - Media Info */}
      <div className="space-y-6">
        {/* Poster */}
        <div className="relative aspect-[2/3] w-[200px] sm:w-[240px] lg:w-[280px] mx-auto rounded-xl overflow-hidden">
          <OptimizedImage
            src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${details.poster_path}`}
            alt={details.title}
            className="object-cover"
            priority={true}
            sizes="(max-width: 640px) 200px, (max-width: 1024px) 240px, 280px"
          />
        </div>

        {/* Quick Info */}
        {/* <Card className="p-4"> */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <IoStar className="w-5 h-5 text-amber-400" />
              <span className="text-lg font-medium text-white">
                {details.vote_average?.toFixed(1)}
              </span>
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
        {/* </Card> */}

        {/* Genres */}
        {details.genres && (
          <div className="flex flex-wrap gap-2">
            {details.genres.map((genre) => (
              <span
                key={genre.id}
                className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 
                         rounded-full text-sm text-blue-300 whitespace-nowrap"
              >
                {genre.name}
              </span>
            ))}
          </div>
        )}

        {/* Additional Details Button (Mobile) */}
        {isMobile && (
          <button
            onClick={() => setShowAllDetails(!showAllDetails)}
            className="w-full text-sm text-zinc-400 hover:text-blue-400 transition-colors"
          >
            {showAllDetails ? "Show Less" : "Show More Details"}
          </button>
        )}

        {/* Detailed Info (Collapsible on Mobile) */}
        <div className={`space-y-6 ${isMobile && !showAllDetails ? 'hidden' : ''}`}>
          {/* Seasons (for TV Shows) */}
          {"seasons" in details && details.seasons && (
            <Card className="p-4">
              <h3 className="text-sm font-medium text-zinc-300 uppercase tracking-wider mb-4">
                Seasons
              </h3>
              <div className="space-y-3">
                {details.seasons
                  .slice(0, showAllSeasons ? undefined : 3)
                  .map((season) => (
                    <div
                      key={season.id}
                      className="flex justify-between items-center p-2 hover:bg-zinc-800/30 rounded-lg transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-white">
                          {season.name}
                        </div>
                        <div className="text-xs text-zinc-400">
                          {season.episode_count} Episodes • {new Date(season.air_date).getFullYear()}
                        </div>
                      </div>
                      {season.vote_average > 0 && (
                        <div className="flex items-center gap-1 text-amber-400">
                          <span>★</span>
                          <span className="text-zinc-400">
                            {season.vote_average.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                {details.seasons.length > 3 && (
                  <button
                    onClick={() => setShowAllSeasons(!showAllSeasons)}
                    className="w-full text-center text-sm text-zinc-400 hover:text-blue-400 transition-colors"
                  >
                    {showAllSeasons ? "Show Less" : `Show All ${details.seasons.length} Seasons`}
                  </button>
                )}
              </div>
            </Card>
          )}

          {/* Languages */}
          <Card className="p-4">
            <div className="flex items-center gap-2 text-zinc-300 mb-3">
              <IoLanguage className="w-4 h-4" />
              <h3 className="text-sm font-medium uppercase tracking-wider">Languages</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {details.spoken_languages?.map((lang) => (
                <span
                  key={lang.iso_639_1}
                  className="text-xs text-zinc-400 bg-zinc-800/20 px-3 py-1.5 rounded-full"
                >
                  {lang.english_name}
                </span>
              ))}
            </div>
          </Card>

          {/* Production Companies */}
          {details.production_companies && details.production_companies.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 text-zinc-300 mb-3">
                <IoBusinessSharp className="w-4 h-4" />
                <h3 className="text-sm font-medium uppercase tracking-wider">Production</h3>
              </div>
              <p className="text-sm text-zinc-400">
                {details.production_companies.map((company) => company.name).join(", ")}
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Right Column - Content */}
      <div className="space-y-8">
        {/* Title and Overview */}
        <div className="space-y-6">
          <h1 className="text-2xl lg:text-4xl font-bold text-white">
            {details.title}
          </h1>
          <Card className="p-6">
            <p className={`text-base lg:text-lg text-zinc-300 leading-relaxed
              ${!isMobile || showAllOverview ? "" : "line-clamp-3"}`}
            >
              {details.overview}
            </p>
            {isMobile && (
              <button
                onClick={() => setShowAllOverview(!showAllOverview)}
                className="mt-4 text-sm text-zinc-400 hover:text-blue-400 transition-colors"
              >
                {showAllOverview ? "Show Less" : "Show More"}
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
  );
}
