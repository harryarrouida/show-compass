import axios from "axios";
import { GENRES } from "@/constants/constants";
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

export const search = async (query: string) => {
  try {
    // Search for both movies and shows
    const [movieResponse, showResponse] = await Promise.all([
      axios.get(
        `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          query
        )}&language=en-US`
      ),
      axios.get(
        `${BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          query
        )}&language=en-US`
      ),
    ]);

    const movies = movieResponse.data.results;
    const shows = showResponse.data.results;

    console.log("movies", movies);
    console.log("shows", shows);

    movies.filter(
      (movie: any) =>
        movie.poster_path !== null ||
        movie.backdrop_path !== null ||
        movie.vote_average !== 0 ||
        movie.vote_average !== undefined ||
        movie.popularity !== 0 ||
        movie.popularity !== undefined ||
        movie.title !== null
    );
    shows.filter(
      (show: any) =>
        show.poster_path !== null ||
        show.backdrop_path !== null ||
        show.vote_average !== 0 ||
        show.vote_average !== undefined ||
        show.popularity !== 0 ||
        show.popularity !== undefined ||
        show.title !== null
    );

    // Combine and map results
    const combinedResults = [
      ...movies.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        popularity: movie.popularity,
        type: "movie",
        backdrop_path: movie.backdrop_path,
        genres:
          movie.genre_ids?.map(
            (id: number) => GENRES[id as keyof typeof GENRES]
          ) || [],
        overview: movie.overview,
      })),
      ...shows.map((show: any) => ({
        id: show.id,
        title: show.name,
        release_date: show.first_air_date,
        poster_path: show.poster_path,
        vote_average: show.vote_average,
        popularity: show.popularity,
        type: "show",
        backdrop_path: show.backdrop_path,
        genres:
          show.genre_ids?.map(
            (id: number) => GENRES[id as keyof typeof GENRES]
          ) || [],
        overview: show.overview,
      })),
    ];

    // console.log("combinedResults", combinedResults);

    // Sort by title match and popularity
    const sortedResults = combinedResults
      .filter((item) => item.poster_path) // Only items with posters
      .sort((a, b) => {
        // Exact title match gets priority
        const aExactMatch = a.title.toLowerCase() === query.toLowerCase();
        const bExactMatch = b.title.toLowerCase() === query.toLowerCase();
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;

        // Then sort by popularity
        return b.popularity - a.popularity;
      });

    // console.log("Sample result:", combinedResults[0]); // This will help debug what data is coming from TMDB

    return sortedResults.slice(0, 5); // Return top 5 results
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
};
