export type Show = {
  genres: {
    id: number;
    name: string;
  }[];
  title: string;
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  overview: string;
  popularity: number;
  adult: boolean;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
  original_name: string;
  vote_count: number;
  type: string;
  first_air_date: string;
};

export type Movie = {
  genres: {
    id: number;
    name: string;
  }[];
  name?: string;
  type: string;
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
  vote_count: number;
  genre_ids: number[];
  first_air_date?: string;
};

export type showDetails = {
  vote_count?: number;
  title: string;
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string | null;
  vote_average: number;
  first_air_date: string;
  release_date?: string;
  overview: string;
  status: string;
  tagline: string;
  type: string;
  number_of_episodes: number;
  number_of_seasons: number;
  in_production: boolean;
  created_by: {
    id: number;
    name: string;
    profile_path: string | null;
  }[];
  genres: {
    id: number;
    name: string;
  }[];
  networks: {
    id: number;
    name: string;
    logo_path: string | null;
  }[];
  seasons: {
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    air_date: string;
    episode_count: number;
    season_number: number;
    vote_average: number;
  }[];
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  belongs_to_collection: null;
};

export type movieDetails = {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  overview: string;
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  runtime: number;
  homepage: string;
  imdb_id: string;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
  vote_count: number;
  adult: boolean;
  genres: {
    id: number;
    name: string;
  }[];
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  belongs_to_collection: null;
};

export type AIRecommendation = {
  title: string;
  reason: string;
  media?: Show | Movie;
};

export type Episode = {
  air_date: string;
  episode_number: number;
  name: string;
  overview: string;
  id: number;
  production_code: string;
  runtime: number;
  season_number: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
};

