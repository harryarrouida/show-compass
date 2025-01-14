import axios from "axios";
import { Movie, Show } from "@/types/types";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const search = async (query: string) => {
    try {
        // Search for both movies and shows
        const [movieResponse, showResponse] = await Promise.all([
            axios.get(`${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`),
            axios.get(`${BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`)
        ]);

        const movies = movieResponse.data.results;
        const shows = showResponse.data.results;

        // Combine and map results
        const combinedResults = [
            ...movies.map((movie: any) => ({
                id: movie.id,
                title: movie.title,
                release_date: movie.release_date,
                poster_path: movie.poster_path,
                vote_average: movie.vote_average,
                popularity: movie.popularity,
                type: 'movie',
                backdrop_path: movie.backdrop_path
            })),
            ...shows.map((show: any) => ({
                id: show.id,
                title: show.name,
                release_date: show.first_air_date,
                poster_path: show.poster_path,
                vote_average: show.vote_average,
                popularity: show.popularity,
                type: 'show',
                backdrop_path: show.backdrop_path
            }))
        ];

        // Sort by title match and popularity
        const sortedResults = combinedResults
            .filter(item => item.poster_path) // Only items with posters
            .sort((a, b) => {
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
        console.error('Search error:', error);
        return [];
    }
};
