import { MemoryCache, generateCacheKey, getCache, resetCache } from '../utils/cache';

describe('MemoryCache', () => {
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache({ defaultTtlSeconds: 60, maxEntries: 100 });
  });

  describe('get and set', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', { data: 'value1' });
      const result = cache.get<{ data: string }>('key1');

      expect(result).toEqual({ data: 'value1' });
    });

    it('should return null for missing keys', () => {
      const result = cache.get('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle different value types', () => {
      cache.set('string', 'hello');
      cache.set('number', 42);
      cache.set('array', [1, 2, 3]);
      cache.set('object', { nested: { deep: true } });

      expect(cache.get('string')).toBe('hello');
      expect(cache.get('number')).toBe(42);
      expect(cache.get('array')).toEqual([1, 2, 3]);
      expect(cache.get('object')).toEqual({ nested: { deep: true } });
    });
  });

  describe('expiration', () => {
    it('should expire entries after TTL', async () => {
      const shortCache = new MemoryCache({ defaultTtlSeconds: 0.1 }); // 100ms TTL
      shortCache.set('expiring', 'value');

      expect(shortCache.get('expiring')).toBe('value');

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(shortCache.get('expiring')).toBeNull();
    });

    it('should respect custom TTL per entry', async () => {
      cache.set('long', 'value', 3600); // 1 hour
      cache.set('short', 'value', 0.1); // 100ms

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(cache.get('long')).toBe('value');
      expect(cache.get('short')).toBeNull();
    });
  });

  describe('has', () => {
    it('should return true for existing keys', () => {
      cache.set('exists', 'value');

      expect(cache.has('exists')).toBe(true);
    });

    it('should return false for missing keys', () => {
      expect(cache.has('missing')).toBe(false);
    });

    it('should return false for expired keys', async () => {
      const shortCache = new MemoryCache({ defaultTtlSeconds: 0.1 });
      shortCache.set('expiring', 'value');

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(shortCache.has('expiring')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should remove entries', () => {
      cache.set('toDelete', 'value');
      expect(cache.has('toDelete')).toBe(true);

      cache.delete('toDelete');
      expect(cache.has('toDelete')).toBe(false);
    });

    it('should return false for missing keys', () => {
      const result = cache.delete('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      cache.clear();

      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
      expect(cache.has('key3')).toBe(false);
    });

    it('should reset stats', () => {
      cache.set('key', 'value');
      cache.get('key');
      cache.get('missing');

      cache.clear();

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('stats', () => {
    it('should track hits and misses', () => {
      cache.set('key', 'value');

      cache.get('key'); // hit
      cache.get('key'); // hit
      cache.get('missing'); // miss
      cache.get('also-missing'); // miss

      const stats = cache.getStats();

      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe(0.5);
    });

    it('should track entry count', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const stats = cache.getStats();
      expect(stats.entries).toBe(2);
    });

    it('should handle zero total accesses', () => {
      const stats = cache.getStats();
      expect(stats.hitRate).toBe(0);
    });
  });

  describe('eviction', () => {
    it('should evict entries when at capacity', () => {
      const smallCache = new MemoryCache({ maxEntries: 3 });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');
      smallCache.set('key4', 'value4'); // Should trigger eviction

      const stats = smallCache.getStats();
      expect(stats.entries).toBe(3);
    });

    it('should evict least recently used entries', () => {
      const smallCache = new MemoryCache({ maxEntries: 3 });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');

      // Access key1 and key3 to increase their hit counts
      smallCache.get('key1');
      smallCache.get('key1');
      smallCache.get('key3');

      // Add new entry - should evict key2 (lowest hit count)
      smallCache.set('key4', 'value4');

      expect(smallCache.has('key1')).toBe(true);
      expect(smallCache.has('key3')).toBe(true);
      expect(smallCache.has('key4')).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', async () => {
      const shortCache = new MemoryCache({ defaultTtlSeconds: 0.1 });

      shortCache.set('expired1', 'value');
      shortCache.set('expired2', 'value');
      shortCache.set('valid', 'value', 3600);

      await new Promise(resolve => setTimeout(resolve, 150));

      const removed = shortCache.cleanup();

      expect(removed).toBe(2);
      expect(shortCache.has('valid')).toBe(true);
    });
  });
});

describe('generateCacheKey', () => {
  it('should generate consistent keys', () => {
    const key1 = generateCacheKey('connector', 'operation', { a: 1, b: 2 });
    const key2 = generateCacheKey('connector', 'operation', { a: 1, b: 2 });

    expect(key1).toBe(key2);
  });

  it('should generate different keys for different params', () => {
    const key1 = generateCacheKey('connector', 'operation', { a: 1 });
    const key2 = generateCacheKey('connector', 'operation', { a: 2 });

    expect(key1).not.toBe(key2);
  });

  it('should sort params for consistency', () => {
    const key1 = generateCacheKey('c', 'o', { a: 1, b: 2 });
    const key2 = generateCacheKey('c', 'o', { b: 2, a: 1 });

    expect(key1).toBe(key2);
  });

  it('should include connector and operation in key', () => {
    const key = generateCacheKey('media', 'fetch', { channel: 'search' });

    expect(key).toContain('media');
    expect(key).toContain('fetch');
  });
});

describe('cache singleton', () => {
  beforeEach(() => {
    resetCache();
  });

  it('should return same instance', () => {
    const cache1 = getCache();
    const cache2 = getCache();

    expect(cache1).toBe(cache2);
  });

  it('should reset cache', () => {
    const cache1 = getCache();
    cache1.set('key', 'value');

    resetCache();

    const cache2 = getCache();
    expect(cache2.has('key')).toBe(false);
  });
});
