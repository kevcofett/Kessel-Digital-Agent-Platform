# MPA Caching Guide

## Overview

The MPA Azure Functions use an in-memory LRU (Least Recently Used) cache to reduce Dataverse API calls and improve response times. This guide covers configuration, usage patterns, and best practices.

**Version:** 5.2
**Last Updated:** December 30, 2025

---

## Contents

1. [Quick Start](#quick-start)
2. [Configuration](#configuration)
3. [Usage Patterns](#usage-patterns)
4. [Cache Keys](#cache-keys)
5. [Cached Data Access Layer](#cached-data-access-layer)
6. [Cache Warming](#cache-warming)
7. [Monitoring](#monitoring)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Basic Usage

```python
from shared.cache_manager import get_cache, CacheKeys

# Get global cache instance
cache = get_cache()

# Store data
cache.set("my_key", {"data": "value"})

# Retrieve data
result = cache.get("my_key")  # Returns {"data": "value"} or None if expired

# With custom TTL (in minutes)
cache.set("short_lived", data, ttl_minutes=5)
```

### Using the Cached Data Access Layer

```python
from shared.cached_data_access import get_cached_benchmarks, get_cached_channels
from shared.dataverse_client import DataverseClient

client = DataverseClient()

# Automatically caches results
benchmarks = get_cached_benchmarks(client, vertical="retail")
channels = get_cached_channels(client)
```

---

## Configuration

The cache is configured via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `MPA_CACHE_DEFAULT_TTL_MINUTES` | 60 | Default TTL for cache entries |
| `MPA_CACHE_MAX_ENTRIES` | 1000 | Maximum entries before LRU eviction |
| `MPA_CACHE_BENCHMARK_TTL_MINUTES` | 30 | TTL for benchmark data |
| `MPA_CACHE_CHANNEL_TTL_MINUTES` | 60 | TTL for channel data |
| `MPA_CACHE_KPI_TTL_MINUTES` | 60 | TTL for KPI definitions |
| `MPA_CACHE_SESSION_TTL_MINUTES` | 120 | TTL for session data |
| `MPA_CACHE_ENABLE_STATS` | true | Enable statistics tracking |

### Setting Configuration in Azure

```bash
az functionapp config appsettings set \
  --name "func-mpa-prod" \
  --resource-group "rg-mpa-prod" \
  --settings \
    MPA_CACHE_DEFAULT_TTL_MINUTES=60 \
    MPA_CACHE_MAX_ENTRIES=1000 \
    MPA_CACHE_BENCHMARK_TTL_MINUTES=30
```

### Configuration in local.settings.json

```json
{
  "Values": {
    "MPA_CACHE_DEFAULT_TTL_MINUTES": "60",
    "MPA_CACHE_MAX_ENTRIES": "1000",
    "MPA_CACHE_BENCHMARK_TTL_MINUTES": "30",
    "MPA_CACHE_CHANNEL_TTL_MINUTES": "60",
    "MPA_CACHE_KPI_TTL_MINUTES": "60",
    "MPA_CACHE_SESSION_TTL_MINUTES": "120",
    "MPA_CACHE_ENABLE_STATS": "true"
  }
}
```

---

## Usage Patterns

### 1. Direct Cache Access

```python
from shared.cache_manager import get_cache

cache = get_cache()

# Set and get
cache.set("key", value)
result = cache.get("key")

# Check if key exists
if cache.has_key("key"):
    # Key exists and not expired
    pass

# Delete a key
cache.delete("key")

# Clear all entries
cache.clear()
```

### 2. Get-or-Set Pattern

```python
# Fetch from cache or compute if missing
result = cache.get_or_set(
    key="expensive_computation",
    factory=lambda: compute_expensive_data(),
    ttl_minutes=30
)
```

### 3. Decorator Pattern

```python
from shared.cached_data_access import cached

@cached(
    key_builder=lambda vertical, channel: f"data:{vertical}:{channel}",
    ttl_minutes=30
)
def get_performance_data(vertical: str, channel: str) -> dict:
    # This will be cached automatically
    return fetch_from_api(vertical, channel)
```

### 4. Cache-Aside Pattern (Recommended)

```python
from shared.cached_data_access import get_cached_benchmarks

def process_request(vertical: str, channel: str):
    # Use cached data access layer
    benchmarks = get_cached_benchmarks(
        dataverse_client=client,
        vertical=vertical,
        channel=channel
    )
    return process(benchmarks)
```

---

## Cache Keys

Use the `CacheKeys` class for consistent key naming:

```python
from shared.cache_manager import CacheKeys

# Benchmark keys
key = CacheKeys.benchmark("retail", "paid_search")  # "benchmark:retail:paid_search"
key = CacheKeys.benchmark_all()  # "benchmarks:all"

# Channel keys
key = CacheKeys.channel("ch-123")  # "channel:ch-123"
key = CacheKeys.channel_all()  # "channels:all"

# KPI keys
key = CacheKeys.kpi("ctr")  # "kpi:ctr"
key = CacheKeys.kpi_all()  # "kpis:all"

# Session keys
key = CacheKeys.session("sess-abc")  # "session:sess-abc"

# Plan keys
key = CacheKeys.plan("plan-xyz")  # "plan:plan-xyz"

# Feature flag keys
key = CacheKeys.feature_flag("new_ui")  # "feature_flag:new_ui"
```

---

## Cached Data Access Layer

The `cached_data_access` module provides high-level functions that automatically handle caching:

### Available Functions

| Function | Description | TTL |
|----------|-------------|-----|
| `get_cached_benchmarks()` | Get benchmark data | 30 min |
| `get_cached_channels()` | Get channel definitions | 60 min |
| `get_cached_kpis()` | Get KPI definitions | 60 min |
| `get_cached_verticals()` | Get vertical definitions | 60 min |
| `get_cached_session()` | Get session data | 120 min |

### Force Refresh

```python
# Bypass cache and fetch fresh data
benchmarks = get_cached_benchmarks(
    dataverse_client=client,
    vertical="retail",
    force_refresh=True  # Skip cache, fetch from Dataverse
)
```

### Cache Invalidation

```python
from shared.cached_data_access import (
    invalidate_session_cache,
    invalidate_benchmark_cache,
    invalidate_all_reference_caches
)

# Invalidate specific session
invalidate_session_cache("session-123")

# Invalidate benchmarks for a vertical
invalidate_benchmark_cache(vertical="retail")

# Invalidate all reference data caches
invalidate_all_reference_caches()
```

---

## Cache Warming

Pre-populate caches during function warmup to reduce cold start latency:

```python
from shared.cached_data_access import warm_reference_caches
from shared.dataverse_client import DataverseClient

def warm_caches():
    client = DataverseClient()
    results = warm_reference_caches(client)
    # Returns: {"benchmarks": 50, "channels": 20, "kpis": 15, "verticals": 10}
    return results
```

The `WarmupTrigger` function automatically warms caches every 5 minutes.

---

## Monitoring

### Getting Cache Statistics

```python
from shared.cache_manager import get_cache

cache = get_cache()
stats = cache.get_stats()

# Returns:
{
    "hits": 1500,
    "misses": 300,
    "hit_rate": 83.33,
    "miss_rate": 16.67,
    "evictions": 50,
    "expirations": 100,
    "sets": 400,
    "deletes": 20,
    "clears": 0,
    "total_requests": 1800,
    "current_size": 250,
    "max_entries": 1000,
    "default_ttl_minutes": 60,
    "utilization": 25.0,
    "uptime_seconds": 3600.0,
    "last_reset_at": "2025-12-30T10:00:00"
}
```

### Cache Health Check

```python
from shared.cached_data_access import get_cache_health

health = get_cache_health()

# Returns:
{
    "status": "healthy",  # or "warning" or "degraded"
    "issues": [],  # List of any issues found
    "stats": { ... }  # Full cache stats
}
```

### Health Endpoint Integration

The `/health` endpoints include cache statistics:

```json
{
  "status": "healthy",
  "function": "SearchBenchmarks",
  "cache": {
    "status": "healthy",
    "hit_rate": 85.5,
    "size": 250,
    "max_entries": 1000
  }
}
```

### Application Insights Metrics

The cache emits custom metrics to Application Insights:

| Metric | Description |
|--------|-------------|
| `mpa_cache_hits` | Number of cache hits |
| `mpa_cache_misses` | Number of cache misses |
| `mpa_cache_size` | Current cache size |
| `mpa_cache_evictions` | Number of LRU evictions |

---

## Best Practices

### 1. Use Appropriate TTLs

```python
# Frequently changing data: short TTL
cache.set("live_metrics", data, ttl_minutes=5)

# Reference data: longer TTL
cache.set("channel_definitions", data, ttl_minutes=60)

# Session data: match session timeout
cache.set("session:123", data, ttl_minutes=120)
```

### 2. Use Consistent Keys

Always use `CacheKeys` class:

```python
# Good
key = CacheKeys.benchmark("retail", "search")

# Avoid
key = f"benchmark-retail-search"  # Inconsistent format
```

### 3. Handle Cache Misses Gracefully

```python
result = cache.get("key")
if result is None:
    # Cache miss - fetch from source
    result = fetch_from_dataverse()
    cache.set("key", result)
return result
```

### 4. Use the Cached Data Access Layer

```python
# Preferred - handles caching automatically
benchmarks = get_cached_benchmarks(client, vertical="retail")

# Instead of manual caching
benchmarks = cache.get("benchmarks:retail")
if not benchmarks:
    benchmarks = client.get_records(...)
    cache.set("benchmarks:retail", benchmarks)
```

### 5. Invalidate on Updates

```python
def update_session(session_id: str, data: dict):
    # Update in Dataverse
    client.update_record("eap_session", session_id, data)

    # Invalidate cache
    invalidate_session_cache(session_id)
```

### 6. Monitor Cache Performance

```python
# Periodically check cache health
health = get_cache_health()
if health["status"] != "healthy":
    logger.warning(f"Cache issues: {health['issues']}")
```

---

## Troubleshooting

### Low Hit Rate

**Symptoms:** Hit rate below 50% after warmup

**Causes:**
- TTL too short for data access patterns
- Keys not matching between set/get operations
- Cache not being warmed properly

**Solutions:**
1. Review TTL settings for your data patterns
2. Verify key consistency using `CacheKeys` class
3. Ensure `WarmupTrigger` is running

### High Eviction Rate

**Symptoms:** Many evictions relative to cache sets

**Causes:**
- `MPA_CACHE_MAX_ENTRIES` too low for workload
- Too many unique cache keys being generated

**Solutions:**
1. Increase `MPA_CACHE_MAX_ENTRIES`
2. Review key generation - avoid over-specific keys
3. Consider TTL increases to reduce turnover

### Stale Data

**Symptoms:** Users seeing outdated information

**Causes:**
- TTL too long for data that changes frequently
- Cache not being invalidated on updates

**Solutions:**
1. Reduce TTL for frequently changing data
2. Implement cache invalidation on data updates
3. Use `force_refresh=True` when fresh data required

### Memory Issues

**Symptoms:** High memory usage on function instances

**Causes:**
- Caching large objects
- Too many entries
- Objects not being garbage collected

**Solutions:**
1. Reduce `MPA_CACHE_MAX_ENTRIES`
2. Avoid caching large objects
3. Review what's being cached - may need selective caching

### Getting Entry Details

```python
# Debug a specific cache entry
info = cache.get_entry_info("benchmark:retail:search")
if info:
    print(f"TTL remaining: {info['ttl_remaining_seconds']}s")
    print(f"Access count: {info['access_count']}")
    print(f"Created at: {info['created_at']}")
```

---

## Related Documentation

- [Data Source Hierarchy](../../kb/DATA_SOURCE_HIERARCHY.txt)
- [Health Check Utilities](./health.py)
- [Monitoring Setup](../../monitoring/MONITORING_SETUP.md)
- [PII Redaction](./PII_REDACTION_INTEGRATION.md)
