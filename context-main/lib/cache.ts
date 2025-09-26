/**
 * Client-side cache utilities for performance optimization
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ClientCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 100; // Maximum number of items to cache

  /**
   * Set an item in the cache with TTL
   */
  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  /**
   * Get an item from the cache if it's still valid
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Check if a key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove an item from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let validItems = 0;
    let expiredItems = 0;

    this.cache.forEach((item) => {
      if (now - item.timestamp > item.ttl) {
        expiredItems++;
      } else {
        validItems++;
      }
    });

    return {
      totalItems: this.cache.size,
      validItems,
      expiredItems,
      maxSize: this.maxSize,
    };
  }

  /**
   * Clean up expired items
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Singleton instance
export const clientCache = new ClientCache();

// Cache key generators for consistent caching
export const cacheKeys = {
  search: (query: string, limit: number) => `search:${query}:${limit}`,
  graph: (entityName?: string) => `graph:${entityName || 'all'}`,
  map: (mapId: string) => `map:${mapId}`,
  maps: () => 'maps:list',
  health: () => 'health:status',
  file: (fileId: string) => `file:${fileId}`,
} as const;

// Cache TTL constants (in milliseconds)
export const cacheTTL = {
  search: 5 * 60 * 1000,      // 5 minutes
  graph: 10 * 60 * 1000,     // 10 minutes
  maps: 5 * 60 * 1000,       // 5 minutes
  health: 30 * 1000,         // 30 seconds
  files: 15 * 60 * 1000,     // 15 minutes
} as const;

// Automatic cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    clientCache.cleanup();
  }, 5 * 60 * 1000);
}