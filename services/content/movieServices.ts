import axios from "axios";
import { Movie, MappedMovie, MovieDetails } from "@/types/types";
import { APIError, fetchWithErrorHandling } from '@/utils/apiErrorHandler';
import { getCachedData } from '@/utils/cache';

// API configuration
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;


export async function getTrendingMovies(page: number = 1): Promise<MappedMovie[]> {
  const cacheKey = `trending-movies-${page}`;
  
  return getCachedData(cacheKey, async () => {
    const response = await axios.get(
      `${BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&include_adult=false&page=${page}`
    );
    return mapMovieResults(response.data.results);
  }).catch(() => []);
}

export async function getPopularMovies(page: number = 1): Promise<Movie[]> {
  const cacheKey = `popular-movies-${page}`;

  return getCachedData(cacheKey, async () => {
    const response = await axios.get(
      `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}&include_adult=false`
    );
    
    return response.data.results
      .filter((item: Movie) => item.poster_path !== null)
      .map((item: Movie) => ({
        ...item,
        type: "movie"
      }));
  }).catch(() => []);
}

export async function searchMovies(query: string, page: number = 1): Promise<MappedMovie[]> {
  const cacheKey = `search-movies-${query}-${page}`;

  return getCachedData(cacheKey, async () => {
    const response = await axios.get(
      `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`
    );
    
    return mapMovieResults(response.data.results, true);
  }).catch(() => []);
}

export async function getMovieDetails(movieId: number): Promise<MovieDetails | null> {
  const cacheKey = `movie-details-${movieId}`;

  return getCachedData(cacheKey, async () => {
    const data = await fetchWithErrorHandling<MovieDetails>(
      `${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`
    );

    if (!data.poster_path) {
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      release_date: data.release_date,
      poster_path: data.poster_path,
      vote_average: data.vote_average,
      overview: data.overview,
      type: "movie" as const,
      popularity: data.popularity,
      vote_count: data.vote_count,
      backdrop_path: data.backdrop_path || null,
      runtime: data.runtime,
      genres: data.genres,
      spoken_languages: data.spoken_languages,
      production_companies: data.production_companies,
    };
  }).catch((error) => {
    if (error instanceof APIError && error.status === 404) {
      return null;
    }
    throw error;
  });
}

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
