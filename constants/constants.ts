export const API_CONFIG = {
    TMDB: {
        BASE_URL: 'https://api.themoviedb.org/3',
        IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
        POSTER_SIZES: {
            SMALL: 'w200',
            MEDIUM: 'w400',
            LARGE: 'w500',
            ORIGINAL: 'original'
        }
    },
    TRAKT: {
        BASE_URL: 'https://api.trakt.tv',
        VERSION: '2'
    }
};

export const CACHE_KEYS = {
    TRAKT: {
        WATCHED_MOVIES: 'trakt_watched_movies',
        WATCHED_SHOWS: 'trakt_watched_shows',
        USER: 'trakt_user'
    },
    TMDB: {
        SEARCH: (query: string) => `tmdb_search_${query}`,
        MOVIE_DETAILS: (id: number) => `tmdb_movie_${id}`,
        SHOW_DETAILS: (id: number) => `tmdb_show_${id}`
    }
};

export const CACHE_DURATION = {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 30 * 60 * 1000, // 30 minutes
    LONG: 24 * 60 * 60 * 1000, // 24 hours
    WEEK: 7 * 24 * 60 * 60 * 1000 // 1 week
}; 