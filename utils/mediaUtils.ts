import { API_CONFIG } from '@/config/constants';

export const mediaUtils = {
    getPosterUrl: (path: string | null, size: keyof typeof API_CONFIG.TMDB.POSTER_SIZES = 'MEDIUM') => {
        if (!path) return '/placeholder-poster.png';
        return `${API_CONFIG.TMDB.IMAGE_BASE_URL}/${API_CONFIG.TMDB.POSTER_SIZES[size]}${path}`;
    },

    formatReleaseDate: (date: string) => {
        if (!date) return 'N/A';
        return new Date(date).getFullYear().toString();
    },

    formatRuntime: (minutes: number) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    },

    formatRating: (rating: number) => {
        if (!rating) return 'N/A';
        return rating.toFixed(1);
    },

    getMediaTypeLabel: (type: 'movie' | 'show') => {
        return type === 'movie' ? 'Movie' : 'TV Show';
    }
}; 