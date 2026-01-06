"""
Cached Data Access Layer for MPA Azure Functions.

Provides high-level functions for accessing Dataverse data with
automatic caching, following the Data Source Hierarchy.

Usage:
    from shared.cached_data_access import get_cached_benchmarks, get_cached_channels

    benchmarks = await get_cached_benchmarks(vertical="retail")
    channels = await get_cached_channels()

Version: 5.2
"""

import logging
from typing import Any, Dict, List, Optional
from functools import wraps

from .cache_manager import (
    get_cache,
    CacheConfig,
    CacheKeys,
)
from .dataverse_client import DataverseClient
from .odata_sanitization import sanitize_odata_string, sanitize_odata_guid, join_filters

logger = logging.getLogger(__name__)


# =============================================================================
# CONFIGURATION
# =============================================================================

# Load cache config for TTL values
_config = CacheConfig.from_environment()


# =============================================================================
# CACHED DATA ACCESS FUNCTIONS
# =============================================================================

def get_cached_benchmarks(
    dataverse_client: DataverseClient,
    vertical: Optional[str] = None,
    channel: Optional[str] = None,
    force_refresh: bool = False
) -> List[Dict[str, Any]]:
    """
    Get benchmark data with caching.

    Priority 1 in Data Source Hierarchy: API Data (VERIFIED)

    Args:
        dataverse_client: DataverseClient instance
        vertical: Optional vertical filter
        channel: Optional channel filter
        force_refresh: Force cache bypass

    Returns:
        List of benchmark records
    """
    cache = get_cache()

    # Build cache key
    if vertical and channel:
        cache_key = CacheKeys.benchmark(vertical, channel)
    elif vertical:
        cache_key = f"benchmarks:vertical:{vertical.lower()}"
    elif channel:
        cache_key = f"benchmarks:channel:{channel.lower()}"
    else:
        cache_key = CacheKeys.benchmark_all()

    # Check cache first (unless force refresh)
    if not force_refresh:
        cached = cache.get(cache_key)
        if cached is not None:
            logger.debug(f"Cache hit for benchmarks: {cache_key}")
            return cached

    # Fetch from Dataverse
    logger.debug(f"Cache miss for benchmarks: {cache_key}, fetching from Dataverse")

    try:
        # Build OData filter with sanitized values
        filters = []
        if vertical:
            filters.append(f"mpa_vertical eq '{sanitize_odata_string(vertical)}'")
        if channel:
            filters.append(f"mpa_channel eq '{sanitize_odata_string(channel)}'")

        filter_str = " and ".join(filters) if filters else None

        benchmarks = dataverse_client.get_records(
            table_name="new_advertisingbenchmark",
            select="mpa_benchmarkid,mpa_name,mpa_vertical,mpa_channel,mpa_kpi,mpa_minvalue,mpa_maxvalue,mpa_defaultvalue,mpa_source,mpa_lastupdated",
            filter_query=filter_str,
            order_by="mpa_vertical,mpa_channel"
        )

        # Cache the result
        cache.set(cache_key, benchmarks, ttl_minutes=_config.benchmark_ttl_minutes)
        logger.debug(f"Cached {len(benchmarks)} benchmarks with key: {cache_key}")

        return benchmarks

    except Exception as e:
        logger.error(f"Error fetching benchmarks from Dataverse: {e}")
        raise


def get_cached_channels(
    dataverse_client: DataverseClient,
    channel_id: Optional[str] = None,
    force_refresh: bool = False
) -> List[Dict[str, Any]]:
    """
    Get channel data with caching.

    Priority 1 in Data Source Hierarchy: API Data (VERIFIED)

    Args:
        dataverse_client: DataverseClient instance
        channel_id: Optional specific channel ID
        force_refresh: Force cache bypass

    Returns:
        List of channel records
    """
    cache = get_cache()

    # Build cache key
    if channel_id:
        cache_key = CacheKeys.channel(channel_id)
    else:
        cache_key = CacheKeys.channel_all()

    # Check cache first
    if not force_refresh:
        cached = cache.get(cache_key)
        if cached is not None:
            logger.debug(f"Cache hit for channels: {cache_key}")
            return cached

    # Fetch from Dataverse
    logger.debug(f"Cache miss for channels: {cache_key}, fetching from Dataverse")

    try:
        filter_query = f"mpa_channelid eq '{sanitize_odata_guid(channel_id)}'" if channel_id else None

        channels = dataverse_client.get_records(
            table_name="new_advertisingchannel",
            select="mpa_channelid,mpa_name,mpa_category,mpa_description,mpa_defaultcpm,mpa_defaultcpc,mpa_isactive",
            filter_query=filter_query,
            order_by="mpa_category,mpa_name"
        )

        # Cache the result
        cache.set(cache_key, channels, ttl_minutes=_config.channel_ttl_minutes)
        logger.debug(f"Cached {len(channels)} channels with key: {cache_key}")

        return channels

    except Exception as e:
        logger.error(f"Error fetching channels from Dataverse: {e}")
        raise


def get_cached_kpis(
    dataverse_client: DataverseClient,
    kpi_id: Optional[str] = None,
    force_refresh: bool = False
) -> List[Dict[str, Any]]:
    """
    Get KPI definitions with caching.

    Priority 1 in Data Source Hierarchy: API Data (VERIFIED)

    Args:
        dataverse_client: DataverseClient instance
        kpi_id: Optional specific KPI ID
        force_refresh: Force cache bypass

    Returns:
        List of KPI records
    """
    cache = get_cache()

    # Build cache key
    if kpi_id:
        cache_key = CacheKeys.kpi(kpi_id)
    else:
        cache_key = CacheKeys.kpi_all()

    # Check cache first
    if not force_refresh:
        cached = cache.get(cache_key)
        if cached is not None:
            logger.debug(f"Cache hit for KPIs: {cache_key}")
            return cached

    # Fetch from Dataverse
    logger.debug(f"Cache miss for KPIs: {cache_key}, fetching from Dataverse")

    try:
        filter_query = f"mpa_kpiid eq '{sanitize_odata_guid(kpi_id)}'" if kpi_id else None

        kpis = dataverse_client.get_records(
            table_name="new_keyperformanceindicator",
            select="mpa_kpiid,mpa_name,mpa_abbreviation,mpa_description,mpa_formula,mpa_unit,mpa_category,mpa_iscore",
            filter_query=filter_query,
            order_by="mpa_category,mpa_name"
        )

        # Cache the result
        cache.set(cache_key, kpis, ttl_minutes=_config.kpi_ttl_minutes)
        logger.debug(f"Cached {len(kpis)} KPIs with key: {cache_key}")

        return kpis

    except Exception as e:
        logger.error(f"Error fetching KPIs from Dataverse: {e}")
        raise


def get_cached_verticals(
    dataverse_client: DataverseClient,
    vertical_id: Optional[str] = None,
    force_refresh: bool = False
) -> List[Dict[str, Any]]:
    """
    Get vertical definitions with caching.

    Priority 1 in Data Source Hierarchy: API Data (VERIFIED)

    Args:
        dataverse_client: DataverseClient instance
        vertical_id: Optional specific vertical ID
        force_refresh: Force cache bypass

    Returns:
        List of vertical records
    """
    cache = get_cache()

    # Build cache key
    if vertical_id:
        cache_key = CacheKeys.vertical(vertical_id)
    else:
        cache_key = CacheKeys.vertical_all()

    # Check cache first
    if not force_refresh:
        cached = cache.get(cache_key)
        if cached is not None:
            logger.debug(f"Cache hit for verticals: {cache_key}")
            return cached

    # Fetch from Dataverse
    logger.debug(f"Cache miss for verticals: {cache_key}, fetching from Dataverse")

    try:
        filter_query = f"mpa_verticalid eq '{sanitize_odata_guid(vertical_id)}'" if vertical_id else None

        verticals = dataverse_client.get_records(
            table_name="new_businessvertical",
            select="mpa_verticalid,mpa_name,mpa_description,mpa_parentvertical,mpa_isactive",
            filter_query=filter_query,
            order_by="mpa_name"
        )

        # Cache the result
        cache.set(cache_key, verticals, ttl_minutes=_config.channel_ttl_minutes)
        logger.debug(f"Cached {len(verticals)} verticals with key: {cache_key}")

        return verticals

    except Exception as e:
        logger.error(f"Error fetching verticals from Dataverse: {e}")
        raise


def get_cached_session(
    dataverse_client: DataverseClient,
    session_id: str,
    force_refresh: bool = False
) -> Optional[Dict[str, Any]]:
    """
    Get session data with caching.

    Args:
        dataverse_client: DataverseClient instance
        session_id: Session ID to retrieve
        force_refresh: Force cache bypass

    Returns:
        Session record or None if not found
    """
    cache = get_cache()
    cache_key = CacheKeys.session(session_id)

    # Check cache first
    if not force_refresh:
        cached = cache.get(cache_key)
        if cached is not None:
            logger.debug(f"Cache hit for session: {session_id}")
            return cached

    # Fetch from Dataverse
    logger.debug(f"Cache miss for session: {session_id}, fetching from Dataverse")

    try:
        safe_session_id = sanitize_odata_guid(session_id)
        sessions = dataverse_client.get_records(
            table_name="new_session",
            select="eap_sessionid,eap_clientid,eap_userid,eap_agenttype,eap_status,eap_context,createdon,modifiedon",
            filter_query=f"eap_sessionid eq '{safe_session_id}'",
            top=1
        )

        if not sessions:
            return None

        session = sessions[0]

        # Cache the result
        cache.set(cache_key, session, ttl_minutes=_config.session_ttl_minutes)
        logger.debug(f"Cached session: {session_id}")

        return session

    except Exception as e:
        logger.error(f"Error fetching session from Dataverse: {e}")
        raise


def invalidate_session_cache(session_id: str) -> bool:
    """
    Invalidate cached session data.

    Call this when session is updated to ensure fresh data on next access.

    Args:
        session_id: Session ID to invalidate

    Returns:
        True if cache entry was removed
    """
    cache = get_cache()
    cache_key = CacheKeys.session(session_id)
    return cache.delete(cache_key)


def invalidate_benchmark_cache(
    vertical: Optional[str] = None,
    channel: Optional[str] = None
) -> int:
    """
    Invalidate cached benchmark data.

    Args:
        vertical: Optional vertical to invalidate
        channel: Optional channel to invalidate

    Returns:
        Number of cache entries invalidated
    """
    cache = get_cache()
    count = 0

    # Get all keys and find matching ones
    for key in cache.get_keys():
        if key.startswith("benchmark"):
            should_delete = False

            if vertical is None and channel is None:
                # Invalidate all benchmark caches
                should_delete = True
            elif vertical and vertical.lower() in key:
                should_delete = True
            elif channel and channel.lower() in key:
                should_delete = True

            if should_delete and cache.delete(key):
                count += 1

    logger.debug(f"Invalidated {count} benchmark cache entries")
    return count


def invalidate_all_reference_caches() -> int:
    """
    Invalidate all reference data caches.

    Use when reference data has been updated in Dataverse.

    Returns:
        Number of cache entries invalidated
    """
    cache = get_cache()
    count = 0

    # Invalidate all reference data caches
    prefixes = ["benchmark", "channel", "kpi", "vertical"]

    for key in cache.get_keys():
        for prefix in prefixes:
            if key.startswith(prefix):
                if cache.delete(key):
                    count += 1
                break

    logger.info(f"Invalidated {count} reference data cache entries")
    return count


# =============================================================================
# CACHE-ASIDE PATTERN DECORATOR
# =============================================================================

def cached(
    key_builder: callable,
    ttl_minutes: Optional[int] = None,
    cache_none: bool = False
):
    """
    Decorator for caching function results.

    Args:
        key_builder: Function that builds cache key from function args
        ttl_minutes: TTL for cached entries (uses default if not specified)
        cache_none: Whether to cache None results

    Usage:
        @cached(key_builder=lambda vertical, channel: f"data:{vertical}:{channel}")
        def get_data(vertical: str, channel: str) -> dict:
            return fetch_from_api(vertical, channel)
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache = get_cache()

            # Build cache key
            cache_key = key_builder(*args, **kwargs)

            # Check cache
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                logger.debug(f"Cache hit: {cache_key}")
                return cached_value

            # Execute function
            result = func(*args, **kwargs)

            # Cache result
            if result is not None or cache_none:
                cache.set(cache_key, result, ttl_minutes=ttl_minutes)
                logger.debug(f"Cached result: {cache_key}")

            return result

        return wrapper
    return decorator


# =============================================================================
# CACHE WARMING
# =============================================================================

def warm_reference_caches(dataverse_client: DataverseClient) -> Dict[str, int]:
    """
    Pre-populate caches with reference data.

    Call during function warmup to reduce cold start latency.

    Args:
        dataverse_client: DataverseClient instance

    Returns:
        Dictionary with counts of cached items per type
    """
    results = {}

    try:
        # Warm benchmarks
        benchmarks = get_cached_benchmarks(dataverse_client, force_refresh=True)
        results["benchmarks"] = len(benchmarks)

        # Warm channels
        channels = get_cached_channels(dataverse_client, force_refresh=True)
        results["channels"] = len(channels)

        # Warm KPIs
        kpis = get_cached_kpis(dataverse_client, force_refresh=True)
        results["kpis"] = len(kpis)

        # Warm verticals
        verticals = get_cached_verticals(dataverse_client, force_refresh=True)
        results["verticals"] = len(verticals)

        logger.info(f"Cache warming complete: {results}")

    except Exception as e:
        logger.error(f"Error during cache warming: {e}")
        results["error"] = str(e)

    return results


# =============================================================================
# CACHE HEALTH
# =============================================================================

def get_cache_health() -> Dict[str, Any]:
    """
    Get cache health information.

    Returns:
        Dictionary with cache health metrics
    """
    cache = get_cache()
    stats = cache.get_stats()

    # Determine health status
    health_status = "healthy"
    issues = []

    # Check hit rate (should be > 50% after warmup)
    if stats["total_requests"] > 100 and stats["hit_rate"] < 50:
        health_status = "degraded"
        issues.append(f"Low hit rate: {stats['hit_rate']}%")

    # Check utilization (warning if > 90%)
    if stats["utilization"] > 90:
        health_status = "warning"
        issues.append(f"High utilization: {stats['utilization']}%")

    # Check evictions (warning if high relative to sets)
    if stats["sets"] > 0:
        eviction_rate = stats["evictions"] / stats["sets"]
        if eviction_rate > 0.1:
            health_status = "warning"
            issues.append(f"High eviction rate: {eviction_rate:.2%}")

    return {
        "status": health_status,
        "issues": issues,
        "stats": stats,
    }
