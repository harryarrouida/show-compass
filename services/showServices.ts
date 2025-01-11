import axios from "axios";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
import { Show, showDetails } from "@/types/types";

export async function getPopularShows(page: number = 1): Promise<Show[]> {
  try {
    const response = await axios.get(
      `${BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${page}&include_adult=false`
    );
    const filteredData = response.data.results.filter(
      (item: Show) => item.poster_path !== null
    );
    const mappedData = filteredData.map((item: Show) => {
      return {
        ...item,
        title: item.name,
        type: "show",
        release_date: item.first_air_date,
      };
    });
    return mappedData;
  } catch (error) {
    console.error("Error fetching popular shows:", error);
    return [];
  }
}

export async function searchShows(
  query: string,
  page: number = 1
): Promise<Show[]> {
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
        ...item,
        title: item.name,
        type: "show",
        release_date: item.first_air_date,
      };
    });
    return mappedData;
  } catch (error) {
    console.error("Error searching shows:", error);
    return [];
  }
}

export async function getShowDetails(showId: number): Promise<Show | null> {
  try {
    const response = await axios.get(
      `${BASE_URL}/tv/${showId}?api_key=${TMDB_API_KEY}&include_adult=false`
    );
    if (response.data.poster_path === null) {
      return null;
    }
    return { ...response.data, title: response.data.name, release_date: response.data.first_air_date };
  } catch (error) {
    console.error("Error fetching show details:", error);
    return null;
  }
}
