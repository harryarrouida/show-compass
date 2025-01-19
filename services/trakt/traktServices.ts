import axios from "axios";
import { getCachedData } from '@/utils/cache';

const baseUrl = process.env.NEXT_PUBLIC_TRAKT_BASE_URL;

export const traktToken = async (code: string) => {
  const response = await axios.post("/api/trakt/token", { code });
  console.log(response.data);
  return response.data;
};

export const traktUser = async (token: string) => {
  const response = await axios.get("/api/trakt/user", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const traktWatched = async (token: string) => {
  if (!token) {
    return console.log("No token");
  }
  const watched = await axios.get(`${baseUrl}/users/me/watched/movies`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return watched;
};

export const traktWatchlist = async (token: string) => {
  const watchlist = await axios.get(`${baseUrl}/users/me/watchlist/movies`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "trakt-api-key": process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID,
      "trakt-api-version": "2",
    },
  });
  console.log(watchlist.data);
  return watchlist;
};

export const traktHistory = async (token: string) => {
  const history = await axios.get(`${baseUrl}/users/me/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID,
    },
  });
  return history;
};

export const moviesWatched = async (token: string) => {
  const cacheKey = `movies-watched-${token}`;
  return getCachedData(cacheKey, async () => {
    const moviesWatched = await axios.get(`${baseUrl}/users/me/watched/movies`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "trakt-api-key": process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID,
        "trakt-api-version": "2",
        "Content-Type": "application/json",
      },
    });
    const mappedMoviesWatched = moviesWatched.data.map((movie: any) => {
      return {
        title: movie.movie.title,
        tmdbId: movie.movie.ids.tmdb,
        type: "movie",
      };
    });
    return mappedMoviesWatched;
  });
};

export const showsWatched = async (token: string) => {
  const cacheKey = `shows-watched-${token}`;
  return getCachedData(cacheKey, async () => {
    const showsWatched = await axios.get(`${baseUrl}/users/me/watched/shows`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "trakt-api-key": process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID,
        "trakt-api-version": "2",
        "Content-Type": "application/json",
      },
    });
    const mappedShowsWatched = showsWatched.data.map((show: any) => {
      return {
        title: show.show.title,
        tmdbId: show.show.ids.tmdb,
        type: "show",
      };
    });
    return mappedShowsWatched;
  });
};

export const getUserWatchlist = async (token: string, type: string) => {
  const watchlist = await axios.get(`${baseUrl}/users/me/watchlist/${type}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "trakt-api-key": process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID,
      "trakt-api-version": "2",
      "Content-Type": "application/json",
    },
  });
  const mappedWatchlist = watchlist.data.map((item: any) => {
    return {
      title: item[item.type].title,
      tmdbId: item[item.type].ids.tmdb,
      type: item.type,
      listedAt: item.listed_at,
    };
  });
  return mappedWatchlist;
};
