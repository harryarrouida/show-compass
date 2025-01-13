/** Media Types */
export interface TraktWatchedItem {
    title: string;
    tmdbId: number;
    type: 'movie' | 'show';
}

export interface CacheItem<T> {
    data: T;
    timestamp: number;
}

export interface AIRecommendation {
    title: string;
    reason: string;
    media?: {
        id: number;
        vote_average: number;
        title: string;
        release_date: string;
        poster_path: string;
        type: 'movie' | 'show';
        popularity?: number;
    };
}

/** Service Response Types */
export interface TMDBSearchResponse {
    page: number;
    results: any[];
    total_pages: number;
    total_results: number;
}

/** Context Types */
export interface TraktContextState {
    isAuthenticated: boolean;
    accessToken: string | null;
    user: TraktUser | null;
    watchedMoviesCache: TraktWatchedItem[];
    watchedShowsCache: TraktWatchedItem[];
    isLoadingMovies: boolean;
    isLoadingShows: boolean;
}

export interface TraktUser {
    username: string;
    name?: string;
    joined_at?: string;
}

export interface Movie {
    id: number;
    title: string;
    release_date: string;
    poster_path: string | null;
    vote_average: number;
    overview: string;
    type: 'movie';
}

export interface Show {
    id: number;
    name: string;
    first_air_date: string;
    poster_path: string | null;
    vote_average: number;
    overview: string;
    type: 'show';
}

export interface MappedMovie {
    id: number;
    title: string;
    type: 'movie';
    release_date: string;
    poster_path: string | null;
    vote_average: number;
    overview: string;
}

export interface MappedShow {
    id: number;
    title: string;
    type: 'show';
    first_air_date: string;
    release_date?: string;
    poster_path: string | null;
    vote_average: number;
    overview: string;
}

export interface MovieDetails extends Movie {
    release_date: string;
    runtime: number;
    genres: Array<{ id: number; name: string }>;
    spoken_languages: Array<{ iso_639_1: string; english_name: string }>;
    production_companies: Array<{ id: number; name: string }>;
    vote_count: number;
}

export interface ShowDetails extends Omit<Show, 'name'> {
    title: string;
    first_air_date: string;
    release_date?: string;
    episode_run_time: number[];
    number_of_seasons: number;
    number_of_episodes: number;
    genres: Array<{ id: number; name: string }>;
    spoken_languages: Array<{ iso_639_1: string; english_name: string }>;
    production_companies: Array<{ id: number; name: string }>;
    seasons: Array<{
        id: number;
        name: string;
        episode_count: number;
        air_date: string;
        vote_average: number;
    }>;
}

