const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
import { Show, Movie } from "@/types/types";

export const searchMovies = async (query: string) => {
  const response= await fetch(
    `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      query
    )}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch movie search results");
  }
  const data = await response.json();
  return data.results;
};

export const searchShows = async (query: string) => {
  const response = await fetch(
    `${BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      query
    )}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch TV show search results");
  }
  const data = await response.json();
  return data.results;
};
