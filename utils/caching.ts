import { CacheItem } from '@/types/types';

const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const cacheService = {
    set: <T>(key: string, data: T, duration: number = DEFAULT_CACHE_DURATION) => {
        const item: CacheItem<T> = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(item));
    },

    get: <T>(key: string, duration: number = DEFAULT_CACHE_DURATION): T | null => {
        const item = localStorage.getItem(key);
        if (!item) return null;

        const { data, timestamp }: CacheItem<T> = JSON.parse(item);
        if (Date.now() - timestamp > duration) {
            localStorage.removeItem(key);
            return null;
        }

        return data;
    },

    clear: (prefix?: string) => {
        if (prefix) {
            Object.keys(localStorage)
                .filter(key => key.startsWith(prefix))
                .forEach(key => localStorage.removeItem(key));
        } else {
            localStorage.clear();
        }
    }
}; 