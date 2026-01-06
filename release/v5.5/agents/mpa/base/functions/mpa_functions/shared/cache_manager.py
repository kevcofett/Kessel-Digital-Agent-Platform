"""
In-memory cache manager for Azure Functions.
Caches Dataverse data to reduce API calls.

Enhanced with:
- LRU eviction when max size exceeded
- Hit/miss statistics tracking
- Configurable via environment variables
- Thread-safe operations

Version: 5.2
"""

import logging
import os
from typing import Any, Optional, Dict, List, Tuple
from datetime import datetime, timedelta
from threading import Lock
from collections import OrderedDict
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


# =============================================================================
# CONFIGURATION
# =============================================================================

@dataclass
class CacheConfig:
    """Cache configuration loaded from environment variables."""

    default_ttl_minutes: int = field(default_factory=lambda: int(
        os.environ.get("MPA_CACHE_DEFAULT_TTL_MINUTES", "60")
    ))
    max_entries: int = field(default_factory=lambda: int(
        os.environ.get("MPA_CACHE_MAX_ENTRIES", "1000")
    ))
    benchmark_ttl_minutes: int = field(default_factory=lambda: int(
        os.environ.get("MPA_CACHE_BENCHMARK_TTL_MINUTES", "30")
    ))
    channel_ttl_minutes: int = field(default_factory=lambda: int(
        os.environ.get("MPA_CACHE_CHANNEL_TTL_MINUTES", "60")
    ))
    kpi_ttl_minutes: int = field(default_factory=lambda: int(
        os.environ.get("MPA_CACHE_KPI_TTL_MINUTES", "60")
    ))
    session_ttl_minutes: int = field(default_factory=lambda: int(
        os.environ.get("MPA_CACHE_SESSION_TTL_MINUTES", "120")
    ))
    enable_stats: bool = field(default_factory=lambda: os.environ.get(
        "MPA_CACHE_ENABLE_STATS", "true"
    ).lower() == "true")

    @classmethod
    def from_environment(cls) -> "CacheConfig":
        """Load configuration from environment variables."""
        return cls()


# =============================================================================
# CACHE STATISTICS
# =============================================================================

@dataclass
class CacheStats:
    """Statistics for cache performance monitoring."""

    hits: int = 0
    misses: int = 0
    evictions: int = 0
    expirations: int = 0
    sets: int = 0
    deletes: int = 0
    clears: int = 0
    created_at: datetime = field(default_factory=datetime.utcnow)
    last_reset_at: datetime = field(default_factory=datetime.utcnow)

    @property
    def total_requests(self) -> int:
        """Total cache access attempts."""
        return self.hits + self.misses

    @property
    def hit_rate(self) -> float:
        """Cache hit rate as percentage (0-100)."""
        if self.total_requests == 0:
            return 0.0
        return round(100.0 * self.hits / self.total_requests, 2)

    @property
    def miss_rate(self) -> float:
        """Cache miss rate as percentage (0-100)."""
        if self.total_requests == 0:
            return 0.0
        return round(100.0 * self.misses / self.total_requests, 2)

    def to_dict(self) -> Dict[str, Any]:
        """Convert stats to dictionary for reporting."""
        return {
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": self.hit_rate,
            "miss_rate": self.miss_rate,
            "evictions": self.evictions,
            "expirations": self.expirations,
            "sets": self.sets,
            "deletes": self.deletes,
            "clears": self.clears,
            "total_requests": self.total_requests,
            "uptime_seconds": (datetime.utcnow() - self.created_at).total_seconds(),
            "last_reset_at": self.last_reset_at.isoformat(),
        }

    def reset(self) -> None:
        """Reset all statistics."""
        self.hits = 0
        self.misses = 0
        self.evictions = 0
        self.expirations = 0
        self.sets = 0
        self.deletes = 0
        self.clears = 0
        self.last_reset_at = datetime.utcnow()


# =============================================================================
# CACHE ENTRY
# =============================================================================

@dataclass
class CacheEntry:
    """Single cache entry with expiration and metadata."""

    value: Any
    expires_at: datetime
    created_at: datetime = field(default_factory=datetime.utcnow)
    last_accessed_at: datetime = field(default_factory=datetime.utcnow)
    access_count: int = 0

    @classmethod
    def create(cls, value: Any, ttl_minutes: int) -> "CacheEntry":
        """Create a new cache entry with TTL."""
        return cls(
            value=value,
            expires_at=datetime.utcnow() + timedelta(minutes=ttl_minutes),
        )

    @property
    def is_expired(self) -> bool:
        """Check if entry has expired."""
        return datetime.utcnow() > self.expires_at

    @property
    def ttl_remaining_seconds(self) -> float:
        """Seconds remaining until expiration."""
        remaining = (self.expires_at - datetime.utcnow()).total_seconds()
        return max(0.0, remaining)

    def touch(self) -> None:
        """Update last accessed time and increment access count."""
        self.last_accessed_at = datetime.utcnow()
        self.access_count += 1


# =============================================================================
# CACHE MANAGER
# =============================================================================

class CacheManager:
    """
    Thread-safe in-memory cache with LRU eviction.

    Features:
    - LRU (Least Recently Used) eviction when max size exceeded
    - TTL-based expiration per entry
    - Hit/miss statistics tracking
    - Thread-safe operations
    - Configurable via environment variables

    Usage:
        cache = CacheManager()
        cache.set("key", {"data": "value"})
        result = cache.get("key")

        # With custom TTL
        cache.set("key", data, ttl_minutes=30)

        # Get stats
        stats = cache.get_stats()
    """

    def __init__(
        self,
        default_ttl_minutes: Optional[int] = None,
        max_entries: Optional[int] = None,
        config: Optional[CacheConfig] = None
    ):
        """
        Initialize cache manager.

        Args:
            default_ttl_minutes: Default TTL for entries (overrides config)
            max_entries: Maximum entries before LRU eviction (overrides config)
            config: CacheConfig instance (loaded from env if not provided)
        """
        self._config = config or CacheConfig.from_environment()
        self._cache: OrderedDict[str, CacheEntry] = OrderedDict()
        self._lock = Lock()
        self._stats = CacheStats()

        # Allow constructor overrides
        self.default_ttl = default_ttl_minutes or self._config.default_ttl_minutes
        self.max_entries = max_entries or self._config.max_entries

    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache if not expired.

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found/expired
        """
        with self._lock:
            entry = self._cache.get(key)

            if entry is None:
                if self._config.enable_stats:
                    self._stats.misses += 1
                return None

            if entry.is_expired:
                del self._cache[key]
                if self._config.enable_stats:
                    self._stats.misses += 1
                    self._stats.expirations += 1
                return None

            # Move to end (most recently used)
            self._cache.move_to_end(key)
            entry.touch()

            if self._config.enable_stats:
                self._stats.hits += 1

            return entry.value

    def set(
        self,
        key: str,
        value: Any,
        ttl_minutes: Optional[int] = None
    ) -> None:
        """
        Set value in cache with optional TTL.

        Args:
            key: Cache key
            value: Value to cache
            ttl_minutes: Optional custom TTL (uses default if not specified)
        """
        ttl = ttl_minutes or self.default_ttl

        with self._lock:
            # Evict LRU entries if at capacity
            while len(self._cache) >= self.max_entries:
                self._evict_lru()

            self._cache[key] = CacheEntry.create(value, ttl)
            self._cache.move_to_end(key)

            if self._config.enable_stats:
                self._stats.sets += 1

    def get_or_set(
        self,
        key: str,
        factory: callable,
        ttl_minutes: Optional[int] = None
    ) -> Any:
        """
        Get value from cache or compute and cache it.

        Args:
            key: Cache key
            factory: Callable that returns value if not cached
            ttl_minutes: Optional custom TTL

        Returns:
            Cached or newly computed value
        """
        value = self.get(key)
        if value is not None:
            return value

        # Compute value (outside lock for potentially slow operations)
        new_value = factory()
        self.set(key, new_value, ttl_minutes)
        return new_value

    def delete(self, key: str) -> bool:
        """
        Delete key from cache.

        Args:
            key: Cache key

        Returns:
            True if key was deleted, False if not found
        """
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                if self._config.enable_stats:
                    self._stats.deletes += 1
                return True
            return False

    def clear(self) -> None:
        """Clear all cached entries."""
        with self._lock:
            self._cache.clear()
            if self._config.enable_stats:
                self._stats.clears += 1
            logger.info("Cache cleared")

    def cleanup_expired(self) -> int:
        """
        Remove all expired entries.

        Returns:
            Number of expired entries removed
        """
        with self._lock:
            expired_keys = [
                key for key, entry in self._cache.items()
                if entry.is_expired
            ]

            for key in expired_keys:
                del self._cache[key]

            if expired_keys:
                if self._config.enable_stats:
                    self._stats.expirations += len(expired_keys)
                logger.debug(f"Cleaned up {len(expired_keys)} expired cache entries")

            return len(expired_keys)

    def _evict_lru(self) -> Optional[str]:
        """
        Evict least recently used entry.

        Returns:
            Key of evicted entry or None if cache empty
        """
        if not self._cache:
            return None

        # First item in OrderedDict is least recently used
        key, _ = self._cache.popitem(last=False)

        if self._config.enable_stats:
            self._stats.evictions += 1

        logger.debug(f"Evicted LRU cache entry: {key}")
        return key

    @property
    def size(self) -> int:
        """Get number of cached entries."""
        return len(self._cache)

    @property
    def is_empty(self) -> bool:
        """Check if cache is empty."""
        return len(self._cache) == 0

    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.

        Returns:
            Dictionary with cache stats including size and hit rates
        """
        stats = self._stats.to_dict()
        stats["current_size"] = self.size
        stats["max_entries"] = self.max_entries
        stats["default_ttl_minutes"] = self.default_ttl
        stats["utilization"] = round(100.0 * self.size / self.max_entries, 2)
        return stats

    def reset_stats(self) -> None:
        """Reset cache statistics."""
        self._stats.reset()
        logger.info("Cache stats reset")

    def get_keys(self) -> List[str]:
        """
        Get all cache keys.

        Returns:
            List of all keys in cache
        """
        with self._lock:
            return list(self._cache.keys())

    def has_key(self, key: str) -> bool:
        """
        Check if key exists and is not expired.

        Args:
            key: Cache key

        Returns:
            True if key exists and not expired
        """
        with self._lock:
            entry = self._cache.get(key)
            if entry is None:
                return False
            if entry.is_expired:
                del self._cache[key]
                return False
            return True

    def get_entry_info(self, key: str) -> Optional[Dict[str, Any]]:
        """
        Get metadata about a cache entry.

        Args:
            key: Cache key

        Returns:
            Entry metadata or None if not found
        """
        with self._lock:
            entry = self._cache.get(key)
            if entry is None or entry.is_expired:
                return None

            return {
                "key": key,
                "created_at": entry.created_at.isoformat(),
                "expires_at": entry.expires_at.isoformat(),
                "last_accessed_at": entry.last_accessed_at.isoformat(),
                "ttl_remaining_seconds": entry.ttl_remaining_seconds,
                "access_count": entry.access_count,
                "is_expired": entry.is_expired,
            }


# =============================================================================
# GLOBAL CACHE INSTANCE
# =============================================================================

# Singleton cache instance for shared use across functions
_global_cache: Optional[CacheManager] = None
_global_cache_lock = Lock()


def get_cache() -> CacheManager:
    """
    Get the global cache instance.

    Creates the cache on first call (lazy initialization).

    Returns:
        Global CacheManager instance
    """
    global _global_cache

    if _global_cache is None:
        with _global_cache_lock:
            if _global_cache is None:
                _global_cache = CacheManager()
                logger.info(
                    f"Global cache initialized: max_entries={_global_cache.max_entries}, "
                    f"default_ttl={_global_cache.default_ttl}min"
                )

    return _global_cache


def reset_global_cache() -> None:
    """
    Reset the global cache instance.

    Use with caution - clears all cached data.
    """
    global _global_cache

    with _global_cache_lock:
        if _global_cache is not None:
            _global_cache.clear()
        _global_cache = None
        logger.info("Global cache reset")


# =============================================================================
# CACHE KEY BUILDERS
# =============================================================================

class CacheKeys:
    """
    Standard cache key builders for MPA data types.

    Ensures consistent key naming across all functions.
    """

    @staticmethod
    def benchmark(vertical: str, channel: str) -> str:
        """Key for benchmark data."""
        return f"benchmark:{vertical.lower()}:{channel.lower()}"

    @staticmethod
    def benchmark_all() -> str:
        """Key for all benchmarks list."""
        return "benchmarks:all"

    @staticmethod
    def channel(channel_id: str) -> str:
        """Key for channel data."""
        return f"channel:{channel_id}"

    @staticmethod
    def channel_all() -> str:
        """Key for all channels list."""
        return "channels:all"

    @staticmethod
    def kpi(kpi_id: str) -> str:
        """Key for KPI definition."""
        return f"kpi:{kpi_id}"

    @staticmethod
    def kpi_all() -> str:
        """Key for all KPIs list."""
        return "kpis:all"

    @staticmethod
    def vertical(vertical_id: str) -> str:
        """Key for vertical data."""
        return f"vertical:{vertical_id}"

    @staticmethod
    def vertical_all() -> str:
        """Key for all verticals list."""
        return "verticals:all"

    @staticmethod
    def session(session_id: str) -> str:
        """Key for session data."""
        return f"session:{session_id}"

    @staticmethod
    def plan(plan_id: str) -> str:
        """Key for media plan data."""
        return f"plan:{plan_id}"

    @staticmethod
    def client(client_id: str) -> str:
        """Key for client data."""
        return f"client:{client_id}"

    @staticmethod
    def feature_flag(flag_name: str) -> str:
        """Key for feature flag."""
        return f"feature_flag:{flag_name}"

    @staticmethod
    def feature_flags_all() -> str:
        """Key for all feature flags."""
        return "feature_flags:all"
