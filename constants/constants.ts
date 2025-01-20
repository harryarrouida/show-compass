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

export const GENRES = {
    28: "Action",
    12: "Adventure",
    16: "Animation", 
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History", 
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
    10759: "Action & Adventure",
    10762: "Kids",
    10763: "News", 
    10764: "Reality",
    10765: "Sci-Fi & Fantasy",
    10766: "Soap",
    10767: "Talk",
    10768: "War & Politics",
    10769: "Western",
    10771: "Adult",
    10772: "Adventure",
    10773: "Animation",
    10774: "Biography",
    10775: "Comedy",
    10776: "Crime",
    10777: "Documentary", 
    10778: "Drama",
    10779: "Family",
    10780: "Fantasy",
    10781: "Game Show",
    10782: "History",
    10783: "Horror",
    10784: "Music",
    10785: "Mystery",
    10786: "News",
    10787: "Reality",
    10788: "Romance",
    10789: "Science Fiction",
    10790: "Soap",
    10791: "Talk",
    10792: "TV Movie",
    10793: "Thriller",
    10794: "War",
    10795: "Western"
  };