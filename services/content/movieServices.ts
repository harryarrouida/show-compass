import axios from "axios";
import { Movie, MappedMovie, MovieDetails } from "@/types/types";

// API configuration
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// Cache configuration
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const cache = new Map<string, { data: any; timestamp: number }>();

/**
 * Helper function to get or set cached data
 */
function getCachedData<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return Promise.resolve(cached.data);
  }

  return fetchFn().then((data) => {
    cache.set(key, { data, timestamp: now });
    return data;
  });
}

/**
 * Fetches trending movies for the week
 * @param page - Page number for pagination
 * @returns Promise containing array of mapped movie data
 */
export async function getTrendingMovies(page: number = 1): Promise<MappedMovie[]> {
  const cacheKey = `trending-movies-${page}`;
  
  return getCachedData(cacheKey, async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&include_adult=false&page=${page}`
      );
      return mapMovieResults(response.data.results);
    } catch (error) {
      return [];
    }
  });
}

/**
 * Fetches popular movies
 * @param page - Page number for pagination
 * @returns Promise containing array of movie data
 */
export async function getPopularMovies(page: number = 1): Promise<Movie[]> {
  const cacheKey = `popular-movies-${page}`;

  return getCachedData(cacheKey, async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}&include_adult=false`
      );
      
      return response.data.results
        .filter((item: Movie) => item.poster_path !== null)
        .map((item: Movie) => ({
          ...item,
          type: "movie"
        }));
    } catch (error) {
      return [];
    }
  });
}

/**
 * Searches movies by query string
 * @param query - Search query
 * @param page - Page number for pagination
 * @returns Promise containing array of mapped movie data
 */
export async function searchMovies(query: string, page: number = 1): Promise<MappedMovie[]> {
  const cacheKey = `search-movies-${query}-${page}`;

  return getCachedData(cacheKey, async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`
      );
      
      return mapMovieResults(response.data.results, true);
    } catch (error) {
      return [];
    }
  });
}

/**
 * Fetches detailed information for a specific movie
 * @param movieId - TMDB movie ID
 * @returns Promise containing movie details or null
 */
export async function getMovieDetails(movieId: number): Promise<MovieDetails | null> {
  const cacheKey = `movie-details-${movieId}`;

  return getCachedData(cacheKey, async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&include_adult=false`
      );
      
      return {
        ...response.data,
        type: "movie"
      };
    } catch (error) {
      return null;
    }
  });
}

/**
 * Helper function to map movie results to consistent format
 * @param results - Raw movie results from API
 * @param includeExtra - Include additional fields like popularity and vote_count
 * @returns Array of mapped movie data
 */
function mapMovieResults(results: any[], includeExtra: boolean = false): MappedMovie[] {
  return results
    .filter((item: Movie) => item.poster_path !== null)
    .map((item: Movie) => ({
      id: item.id,
      title: item.title,
      type: "movie",
      release_date: item.release_date,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path || null,
      vote_average: item.vote_average,
      overview: item.overview,
      ...(includeExtra && {
        popularity: item.popularity,
        vote_count: item.vote_count,
      })
    }));
}
