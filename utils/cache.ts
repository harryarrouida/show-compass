// Cache configuration
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Centralized cache store to avoid creating multiple objects
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Global cache map to store all cached data in memory
const memoryCache = new Map<string, CacheEntry<any>>();

/**
 * Improved caching system with memory and localStorage support
 * Uses a centralized store to avoid creating multiple objects
 */
export function getCachedData<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  
  // First check memory cache (faster than localStorage)
  const memoryCacheEntry = memoryCache.get(key);
  if (memoryCacheEntry && now - memoryCacheEntry.timestamp < CACHE_DURATION) {
    return Promise.resolve(memoryCacheEntry.data);
  }
  
  // Then check localStorage
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const parsedCache = JSON.parse(cached) as CacheEntry<T>;
      if (now - parsedCache.timestamp < CACHE_DURATION) {
        // Store in memory cache for faster future access
        memoryCache.set(key, parsedCache);
        return Promise.resolve(parsedCache.data);
      }
    }
  } catch (error) {
    // If localStorage fails (quota exceeded, etc.), continue with fetch
    console.warn(`Cache read error for key ${key}:`, error);
  }

  // If not in cache or expired, fetch fresh data
  return fetchFn().then((data) => {
    const cacheEntry: CacheEntry<T> = {
      data,
      timestamp: now,
    };
    
    // Update memory cache
    memoryCache.set(key, cacheEntry);
    
    // Try to update localStorage, but don't fail if it errors
    try {
      localStorage.setItem(key, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn(`Cache write error for key ${key}:`, error);
      // If localStorage fails, we still have the data in memory cache
    }
    
    return data;
  });
}

/**
 * Clear all cached data for a specific key
 */
export function clearCache(key: string): void {
  memoryCache.delete(key);
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to clear cache for key ${key}:`, error);
  }
}

/**
 * Clear all cached data or data matching a pattern
 */
export function clearAllCache(pattern?: RegExp): void {
  if (pattern) {
    // Clear specific pattern
    memoryCache.forEach((_, key) => {
      if (pattern.test(key)) {
        memoryCache.delete(key);
      }
    });
    
    // Clear matching localStorage items
    try {
      Object.keys(localStorage).forEach(key => {
        if (pattern.test(key)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Error clearing localStorage cache:', error);
    }
  } else {
    // Clear all cache
    memoryCache.clear();
    
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Error clearing localStorage cache:', error);
    }
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    memoryEntries: memoryCache.size,
    memoryKeys: Array.from(memoryCache.keys()),
    localStorageEntries: Object.keys(localStorage).length,
    localStorageKeys: Object.keys(localStorage),
  };
}