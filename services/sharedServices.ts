import axios from "axios";
import { Movie, Show } from "@/types/types";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const search = async (query: string) => {
  const response = await axios.get(
    `${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${query}&page=1&sort_by=popularity.desc&include_adult=false`
  );
  const filteredResults = response.data.results.filter(
    (item: Movie | Show) =>
      item.poster_path &&
      item.vote_average &&
      (item.name || item.title) &&
      (item.release_date || item.first_air_date)
  );
  const mappedResults = filteredResults.map((item: Movie | Show) => {
    return {
      ...item,
      type: item.title ? "movie" : "show",
      title: item.title || item.name,
      release_date: item.release_date || item.first_air_date,
    };
  });
  return mappedResults.slice(0, 4);
};
