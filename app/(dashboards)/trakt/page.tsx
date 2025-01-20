"use client";

import { useEffect, useState } from "react";
import { useTraktContext } from "@/contexts/traktContext";
import { getMovieDetails } from "@/services/content/movieServices";
import { getShowDetails } from "@/services/content/showServices";
import { useRouter } from "next/navigation";
import WatchHistoryOverview from "@/components/trakt/WatchHistoryOverview";
import TraktRecommendations from "@/components/trakt/traktRecommendations";
import { useHistory } from "@/contexts/historyContext";
import DataGrid from "@/components/bigData/dataGrid";
import PageLayout from "@/components/layout/PageLayout";
import Loading from "@/components/shared/loading";

const Trakt = () => {
  const {
    handleToken,
    isAuthenticated,
    getUserWatchedMovies,
    getUserWatchedShows,
    logout,
    watchedMoviesCache,
    watchedShowsCache,
  } = useTraktContext();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"shows" | "movies">("shows");
  const [watchedMovies, setWatchedMovies] = useState<any[]>(watchedMoviesCache);
  const [watchedShows, setWatchedShows] = useState<any[]>(watchedShowsCache);
  const [watchedMoviesDetails, setWatchedMoviesDetails] = useState<any[]>([]);
  const [watchedShowsDetails, setWatchedShowsDetails] = useState<any[]>([]);
  const [mappedMovies, setMappedMovies] = useState<any[]>([]);
  const [mappedShows, setMappedShows] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const { saveToHistory } = useHistory();
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWatchedData();
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      if (code) {
        // console.log("code", code);
        handleToken(code);
      }
    }
  }, [isAuthenticated]);

  const fetchWatchedData = async () => {
    setIsLoading(true);
    try {
      // Only fetch data if it's the first page or data hasn't been loaded yet
      if (page === 1 || (!watchedMovies.length && !watchedShows.length)) {
        const moviesWatchedData = await getUserWatchedMovies();
        const showsWatchedData = await getUserWatchedShows();
        setWatchedMovies(moviesWatchedData);
        setWatchedShows(showsWatchedData);

        let movieDetails: any[] = [];
        let showDetails: any[] = [];

        // Wait for all movie details to resolve
        if (moviesWatchedData && moviesWatchedData.length > 0) {
          movieDetails = await Promise.all(
            moviesWatchedData.map((movie: any) => getMovieDetails(movie.tmdbId))
          );
          setWatchedMoviesDetails(movieDetails);
        }

        // Wait for all show details to resolve
        if (showsWatchedData.length > 0) {
          showDetails = await Promise.all(
            showsWatchedData.map((show: any) => getShowDetails(show.tmdbId))
          );
          setWatchedShowsDetails(showDetails);
        }

        const newMappedMovies = movieDetails.map((movie: any) => ({
          id: movie.id,
          vote_average: movie.vote_average,
          title: movie.title,
          release_date: movie.release_date,
          poster_path: movie.poster_path,
          type: "movie",
        }));

        const newMappedShows = showDetails.map((show: any) => ({
          id: show.id,
          vote_average: show.vote_average,
          title: show.name,
          release_date: show.first_air_date,
          poster_path: show.poster_path,
          type: "show",
        }));

        setMappedMovies(newMappedMovies);
        setMappedShows(newMappedShows);
      }
    } catch (error) {
      console.error("Error fetching watched data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add useEffect to handle page changes
  useEffect(() => {
    if (isAuthenticated && page > 1) {
      // Don't reload data on page changes since we already have all the data
      setIsLoading(false);
    }
  }, [page, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Connecting to Trakt...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <Loading text="Loading Data..." />;
  }

  return (
    <PageLayout>
      <WatchHistoryOverview
        watchedMovies={watchedMovies}
        watchedShows={watchedShows}
        watchedMoviesDetails={watchedMoviesDetails}
        watchedShowsDetails={watchedShowsDetails}
      />

      <TraktRecommendations />

        <DataGrid
          activeTab={activeTab}
          setActiveTab={setActiveTab as any}
          shows={mappedShows}
          setShows={setMappedShows}
          movies={mappedMovies}
          setMovies={setMappedMovies}
          page={page}
          setPage={setPage}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          isWithSearch={true}
        />
    </PageLayout>
  );
};

export default Trakt;
