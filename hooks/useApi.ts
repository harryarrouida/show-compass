import { useState, useCallback } from 'react';
import { cacheService } from '@/utils/caching';

interface UseApiOptions<T> {
    cacheKey?: string;
    cacheDuration?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
}

export function useApi<T>(
    apiFunction: (...args: any[]) => Promise<T>,
    options: UseApiOptions<T> = {}
) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const execute = useCallback(async (...args: any[]) => {
        setIsLoading(true);
        setError(null);

        try {
            // Check cache if cacheKey is provided
            if (options.cacheKey) {
                const cachedData = cacheService.get<T>(
                    options.cacheKey,
                    options.cacheDuration
                );
                if (cachedData) {
                    setData(cachedData);
                    options.onSuccess?.(cachedData);
                    setIsLoading(false);
                    return cachedData;
                }
            }

            // Make API call
            const result = await apiFunction(...args);
            setData(result);

            // Cache result if cacheKey is provided
            if (options.cacheKey) {
                cacheService.set(options.cacheKey, result, options.cacheDuration);
            }

            options.onSuccess?.(result);
            return result;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('An error occurred');
            setError(error);
            options.onError?.(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [apiFunction, options]);

    return { data, error, isLoading, execute };
} 