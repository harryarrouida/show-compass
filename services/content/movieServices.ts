import axios from "axios";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
import { Movie, MappedMovie, MovieDetails } from "@/types/types";

export async function getTrendingMovies(
  page: number = 1
): Promise<MappedMovie[]> {
  const response = await axios.get(
    `${BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&include_adult=false&page=${page}`
  );
  const filteredData = response.data.results.filter(
    (item: Movie) => item.poster_path !== null
  );
  const mappedData = filteredData.map((item: Movie) => {
    return {
      id: item.id,
      title: item.title,
      type: "movie",
      release_date: item.release_date,
      poster_path: item.poster_path,
      vote_average: item.vote_average,
      overview: item.overview,
    };
  });
  console.log("mappedData from getTrendingMovies", mappedData);
  return mappedData;
}

export async function getPopularMovies(page: number = 1): Promise<Movie[]> {
  try {
    const response = await axios.get(
      `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}&include_adult=false`
    );
    const filteredData = response.data.results.filter(
      (item: Movie) => item.poster_path !== null
    );
    const mappedData = filteredData.map((item: Movie) => {
      return {
        ...item,
        title: item.title,
        type: "movie",
      };
    });
    return mappedData;
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    return [];
  }
}

export async function searchMovies(
  query: string,
  page: number = 1
): Promise<MappedMovie[]> {
  try {
    const response = await axios.get(
      `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        query
      )}&page=${page}&include_adult=false`
    );
    const filteredData = response.data.results.filter(
      (item: Movie) => item.poster_path !== null
    );
    const mappedData = filteredData.map((item: Movie) => {
      return {
        id: item.id,
        title: item.title,
        type: "movie",
        release_date: item.release_date,
        poster_path: item.poster_path,
        vote_average: item.vote_average,
        overview: item.overview,
      };
    });
    console.log("mappedData from searchMovies", mappedData);
    return mappedData;
  } catch (error) {
    console.error("Error searching movies:", error);
    return [];
  }
}

export async function getMovieDetails(
  movieId: number, 
  page: number = 1
): Promise<MovieDetails | null> {
  try {
    const response = await axios.get(
      `${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&include_adult=false&page=${page}`
    );
    const mappedData = {
      ...response.data,
      type: "movie",
    };
    console.log("mappedData from getMovieDetails", mappedData);
    return mappedData;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
}
