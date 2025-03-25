import { useCallback, useRef } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface CacheConfig {
  cacheDuration?: number; // Cache duration in milliseconds (default: 60 seconds)
}

/**
 * Custom hook for fetching data with caching capabilities.
 * Prevents excessive API calls by caching results for a specified duration.
 */
export function useFetchWithCache<T>(defaultConfig: CacheConfig = {}) {
  // In-memory cache for API responses
  const cache = useRef<Record<string, CacheItem<T>>>({});
  
  // Default cache duration is 60 seconds (60000 ms)
  const defaultCacheDuration = defaultConfig.cacheDuration || 60000;

  /**
   * Fetch data with caching
   */
  const fetchWithCache = useCallback(async (
    url: string,
    options?: RequestInit,
    config?: CacheConfig
  ): Promise<T> => {
    const cacheKey = `${url}:${JSON.stringify(options?.body || '')}`;
    const cacheDuration = config?.cacheDuration || defaultCacheDuration;
    const now = Date.now();
    
    // Check if we have cached data and it's still fresh
    const cachedItem = cache.current[cacheKey];
    if (cachedItem && (now - cachedItem.timestamp < cacheDuration)) {
      return cachedItem.data;
    }
    
    // If no valid cache, make the API call
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the new data
      cache.current[cacheKey] = {
        data,
        timestamp: now
      };
      
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }, [defaultCacheDuration]);

  /**
   * Invalidate cache for a specific URL
   */
  const invalidateCache = useCallback((url: string, bodyPattern?: string) => {
    const pattern = `${url}:${bodyPattern || ''}`;
    
    Object.keys(cache.current).forEach(key => {
      if (key.startsWith(pattern)) {
        delete cache.current[key];
      }
    });
  }, []);

  /**
   * Clear entire cache
   */
  const clearCache = useCallback(() => {
    cache.current = {};
  }, []);

  return { 
    fetchWithCache,
    invalidateCache,
    clearCache
  };
} 