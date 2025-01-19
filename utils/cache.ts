// Cache configuration
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Helper function to get or set cached data
 */
export function getCachedData<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  const cached = localStorage.getItem(key);
  const now = Date.now();

  if (cached) {
    const parsedCache = JSON.parse(cached);
    if (now - parsedCache.timestamp < CACHE_DURATION) {
      return Promise.resolve(parsedCache.data);
    }
  }

  return fetchFn().then((data) => {
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: now,
      })
    );
    return data;
  });
} 