import axios from "axios";
import { getCachedData } from '@/utils/cache';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
import { Show, ShowDetails, MappedShow } from "@/types/types";

export async function getTrendingShows(
  page: number = 1
): Promise<MappedShow[]> {
  const cacheKey = `trending-shows-${page}`;
  return getCachedData(cacheKey, async () => {
    const response = await axios.get(
      `${BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}&include_adult=false&page=${page}`
    );
    const filteredData = response.data.results.filter(
      (item: Show) => item.poster_path !== null
    );
    const mappedData = filteredData.map((item: Show) => {
      return {
        id: item.id,
        title: item.name,
        type: "show", 
        release_date: item.first_air_date,
        poster_path: item.poster_path,
        vote_average: item.vote_average,
        overview: item.overview,
      };
    });
    return mappedData;
  });
}

export async function getPopularShows(page: number = 1): Promise<MappedShow[]> {
  const cacheKey = `popular-shows-${page}`;
  return getCachedData(cacheKey, async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${page}&include_adult=false`
      );
      const filteredData = response.data.results.filter(
        (item: Show) => item.poster_path !== null
      );
      const mappedData = filteredData.map((item: Show) => {
        return {
          id: item.id,
          title: item.name,
          type: "show",
          release_date: item.first_air_date,
          poster_path: item.poster_path,
          vote_average: item.vote_average,
          overview: item.overview,
        };
      });
      return mappedData;
    } catch (error) {
      return [];
    }
  });
}

export async function searchShows(
  query: string,
  page: number = 1
): Promise<MappedShow[]> {
  const cacheKey = `search-shows-${query}-${page}`;
  return getCachedData(cacheKey, async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          query
        )}&page=${page}&include_adult=false`
      );
      const filteredData = response.data.results.filter(
        (item: Show) => item.poster_path !== null
      );
      const mappedData = filteredData.map((item: Show) => {
        return {
          id: item.id,
          title: item.name,
          type: "show",
          release_date: item.first_air_date,
          poster_path: item.poster_path,
          vote_average: item.vote_average,
          overview: item.overview,
          popularity: item.popularity,
          vote_count: item.vote_count,
        };
      });
      return mappedData;
    } catch (error) {
      return [];
    }
  });
}

export async function getShowDetails(
  showId: number,
  page: number = 1
): Promise<ShowDetails | null> {
  const cacheKey = `show-details-${showId}-${page}`;
  return getCachedData(cacheKey, async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/tv/${showId}?api_key=${TMDB_API_KEY}&include_adult=false&page=${page}`
      );
      if (response.data.poster_path === null) {
        return null;
      }
      const data = response.data;
      const mappedData: ShowDetails = {
        ...data,
        title: data.name,
        first_air_date: data.first_air_date,
        type: "show",
      };
      return mappedData;
    } catch (error) {
      return null;
    }
  });
}
