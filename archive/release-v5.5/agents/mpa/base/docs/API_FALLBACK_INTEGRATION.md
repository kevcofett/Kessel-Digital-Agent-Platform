# API Fallback Integration Guide

## Overview

The API Fallback utility provides graceful degradation when external APIs are unavailable. This ensures the MPA agent can continue providing value even when dependent services fail.

## Location

- **Module**: `azure_functions/mpa_functions/shared/api_fallback.py`

## Features

1. **Automatic Fallback** - Falls back to cached or default data on failure
2. **Circuit Breaker** - Prevents repeated calls to failing services
3. **Confidence Metadata** - All responses include confidence levels
4. **Cache Integration** - Uses CacheManager for fast fallback

## Quick Start

```python
from shared.api_fallback import get_fallback_manager, FallbackResult

# Get the manager
manager = get_fallback_manager(cache_manager=my_cache)

# Decorate API calls
@manager.with_fallback("benchmark_api", fallback_source="kb")
async def get_benchmarks(vertical: str, channel: str):
    return await dataverse_client.query_records(...)
```

## Fallback Sources

| Source | Priority | Confidence | Use Case |
|--------|----------|------------|----------|
| API | 1 | VERIFIED | Fresh data from live API |
| Cache | 2 | HIGH | Recently fetched data |
| KB Default | 3 | ESTIMATED | Static fallback values |
| Static | 4 | LOW | Hardcoded emergency fallback |

## Configuration

### Circuit Breaker Settings

```python
manager = APIFallbackManager(
    cache_manager=cache,
    circuit_breaker_threshold=5,  # Failures before opening
    circuit_breaker_timeout=60    # Seconds before retry
)
```

### Cache TTL

```python
@manager.with_fallback(
    "pricing_api",
    cache_ttl_seconds=3600  # Cache for 1 hour
)
```

## Response Format

All responses are wrapped in `FallbackResult`:

```python
{
    "data": {...},                    # The actual data
    "source": "api",                  # api, cache, kb_default
    "confidence": "VERIFIED",         # Confidence level
    "api_name": "benchmark_api",      # API identifier
    "fallback_reason": null,          # Error if fallback used
    "cache_age_seconds": null         # Age if from cache
}
```

## KB Fallback Mappings

The manager includes default fallback data for key APIs:

| API | Fallback Data |
|-----|---------------|
| benchmark_api | Default CPM/CTR/CVR by vertical |
| pricing_api | Default pricing by channel |
| channel_api | Standard channel list |
| kpi_api | Standard KPI list |

## Integration Steps

### 1. Initialize Manager

In your function's startup:

```python
from shared.api_fallback import get_fallback_manager
from shared.cache_manager import CacheManager

cache = CacheManager()
fallback_manager = get_fallback_manager(cache_manager=cache)
```

### 2. Wrap API Calls

```python
@fallback_manager.with_fallback("dataverse_benchmarks")
async def get_benchmarks(vertical: str):
    return await client.query_records(
        table_name="mpa_benchmark",
        filter_query=f"mpa_vertical eq '{vertical}'"
    )
```

### 3. Handle Response

```python
result = await get_benchmarks("retail")

if result.source != FallbackSource.API:
    # Using fallback data
    logger.warning(f"Using {result.source} for benchmarks: {result.fallback_reason}")

# Always include confidence in response
response = {
    "benchmarks": result.data,
    "confidence": result.confidence.value,
    "data_source": result.source.value
}
```

## Circuit Breaker Behavior

1. **Closed** (Normal): Requests flow through
2. **Open** (5+ failures): Requests rejected, fallback used
3. **Half-Open** (after timeout): Limited test requests allowed

### Monitoring Circuits

```python
states = fallback_manager.get_circuit_states()
# Returns: {"benchmark_api": {"failures": 2, "is_open": False}}
```

### Manual Reset

```python
fallback_manager.reset_circuit("benchmark_api")
```

## Error Handling

When circuit is open and no fallback available:

```python
from shared.api_fallback import CircuitOpenError

try:
    result = await get_benchmarks("retail")
except CircuitOpenError as e:
    # Circuit open and no fallback
    return {
        "error": "Service temporarily unavailable",
        "retry_after": 60
    }
```

## Testing

### Mock Fallback Manager

```python
class MockFallbackManager:
    def with_fallback(self, *args, **kwargs):
        def decorator(func):
            return func
        return decorator

# In tests
fallback_manager = MockFallbackManager()
```

### Force Circuit States

```python
# Force open for testing
manager.circuit_breaker_states["test_api"].is_open = True

# Reset after test
manager.reset_circuit("test_api")
```

## Best Practices

1. **Always include confidence** - Users need to know data quality
2. **Log fallback usage** - Track when fallbacks are used
3. **Monitor circuits** - Alert on circuits staying open
4. **Test fallback paths** - Verify KB defaults are valid
5. **Set appropriate TTLs** - Balance freshness vs resilience

## Related Documentation

- [Circuit Breaker](./circuit_breaker.py) - Circuit breaker implementation
- [Cache Manager](./CACHING.md) - Caching configuration
- [DATA_SOURCE_HIERARCHY.txt](../kb/DATA_SOURCE_HIERARCHY.txt) - Data source priorities
