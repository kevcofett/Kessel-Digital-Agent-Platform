/**
 * Caching utilities for Benchmark API responses
 * Provides in-memory and optional Redis caching
 */

export interface CacheConfig {
  defaultTtlSeconds: number;
  maxEntries: number;
  enableCompression?: boolean;
}

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
  hitCount: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  entries: number;
  hitRate: number;
}

export class MemoryCache {
  private readonly cache: Map<string, CacheEntry<unknown>>;
  private readonly config: CacheConfig;
  private stats: { hits: number; misses: number };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTtlSeconds: 300, // 5 minutes default
      maxEntries: 1000,
      enableCompression: false,
      ...config,
    };
    this.cache = new Map();
    this.stats = { hits: 0, misses: 0 };
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    entry.hitCount++;
    this.stats.hits++;
    return entry.data;
  }

  set<T>(key: string, data: T, ttlSeconds?: number): void {
    // Evict if at capacity
    if (this.cache.size >= this.config.maxEntries) {
      this.evictLRU();
    }

    const ttl = ttlSeconds ?? this.config.defaultTtlSeconds;
    const entry: CacheEntry<T> = {
      data,
      expiresAt: Date.now() + ttl * 1000,
      createdAt: Date.now(),
      hitCount: 0,
    };

    this.cache.set(key, entry);
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      entries: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }

  private evictLRU(): void {
    // Find entry with lowest hit count and oldest creation time
    let oldestKey: string | null = null;
    let lowestScore = Infinity;

    for (const [key, entry] of this.cache) {
      // Score combines hit count and age (lower is worse)
      const ageMs = Date.now() - entry.createdAt;
      const score = entry.hitCount - ageMs / 60000; // Penalize older entries

      if (score < lowestScore) {
        lowestScore = score;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Clean expired entries periodically
  cleanup(): number {
    let removed = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }
}

export function generateCacheKey(
  connector: string,
  operation: string,
  params: Record<string, unknown>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&');

  return `${connector}:${operation}:${sortedParams}`;
}

// Singleton cache instance
let cacheInstance: MemoryCache | null = null;

export function getCache(config?: Partial<CacheConfig>): MemoryCache {
  if (!cacheInstance) {
    cacheInstance = new MemoryCache(config);
  }
  return cacheInstance;
}

export function resetCache(): void {
  if (cacheInstance) {
    cacheInstance.clear();
  }
  cacheInstance = null;
}
