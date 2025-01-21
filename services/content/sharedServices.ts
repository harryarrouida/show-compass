import axios from "axios";
import { GENRES } from "@/constants/constants";
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

export const search = async (query: string) => {
  try {
    // Add delay between requests to avoid rate limiting
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Search movies first
    const movieResponse = await axios.get(
      `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        query
      )}&language=en-US`
    );

    // Wait 250ms before making second request
    await delay(250);

    // Then search shows
    const showResponse = await axios.get(
      `${BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        query
      )}&language=en-US`
    );

    const movies = movieResponse.data.results.filter((movie: any) => 
      movie.poster_path && 
      movie.backdrop_path && 
      movie.vote_average
    );

    const shows = showResponse.data.results.filter((show: any) =>
      show.poster_path &&
      show.backdrop_path &&
      show.vote_average
    );

    // Combine and map results
    const combinedResults = [
      ...movies.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        poster_path: `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${movie.poster_path}`,
        backdrop_path: `${process.env.NEXT_PUBLIC_TMDB_BACKDROP_URL}${movie.backdrop_path}`,
        vote_average: movie.vote_average,
        popularity: movie.popularity,
        type: "movie",
        genres: movie.genre_ids?.map((id: number) => GENRES[id as keyof typeof GENRES]) || [],
        overview: movie.overview,
      })),
      ...shows.map((show: any) => ({
        id: show.id,
        title: show.name,
        release_date: show.first_air_date,
        poster_path: `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${show.poster_path}`,
        backdrop_path: `${process.env.NEXT_PUBLIC_TMDB_BACKDROP_URL}${show.backdrop_path}`,
        vote_average: show.vote_average,
        popularity: show.popularity,
        type: "show",
        genres: show.genre_ids?.map((id: number) => GENRES[id as keyof typeof GENRES]) || [],
        overview: show.overview,
      })),
    ];

    // Sort by title match and popularity
    const sortedResults = combinedResults.sort((a, b) => {
      // Exact title match gets priority
      const aExactMatch = a.title.toLowerCase() === query.toLowerCase();
      const bExactMatch = b.title.toLowerCase() === query.toLowerCase();
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      // Then sort by popularity
      return b.popularity - a.popularity;
    });

    return sortedResults.slice(0, 5); // Return top 5 results
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
};
