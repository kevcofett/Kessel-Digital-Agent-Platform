"""
Shared services for MPA Azure Functions.

All services read reference data from Dataverse - NO HARDCODED DATA.
"""

from .cache_manager import (
    CacheManager,
    CacheConfig,
    CacheStats,
    CacheEntry,
    CacheKeys,
    get_cache,
    reset_global_cache,
)
from .dataverse_client import DataverseClient
from .benchmark_service import BenchmarkService, get_benchmark_service
from .kpi_service import KPIService, get_kpi_service
from .channel_service import ChannelService, get_channel_service
from .health import (
    create_health_response,
    is_health_check_request,
    handle_health_check,
    get_cache_stats,
)
from .pii_redaction import (
    redact_pii,
    redact_client_name,
    create_safe_log_context,
    wrap_logger,
    RedactingLogger,
    get_redaction_patterns,
    clear_pattern_cache,
)

from .cached_data_access import (
    get_cached_benchmarks,
    get_cached_channels,
    get_cached_kpis,
    get_cached_verticals,
    get_cached_session,
    invalidate_session_cache,
    invalidate_benchmark_cache,
    invalidate_all_reference_caches,
    warm_reference_caches,
    get_cache_health,
    cached,
)

__all__ = [
    # Cache management
    "CacheManager",
    "CacheConfig",
    "CacheStats",
    "CacheEntry",
    "CacheKeys",
    "get_cache",
    "reset_global_cache",
    # Cached data access
    "get_cached_benchmarks",
    "get_cached_channels",
    "get_cached_kpis",
    "get_cached_verticals",
    "get_cached_session",
    "invalidate_session_cache",
    "invalidate_benchmark_cache",
    "invalidate_all_reference_caches",
    "warm_reference_caches",
    "get_cache_health",
    "cached",
    # Data services
    "DataverseClient",
    "BenchmarkService",
    "get_benchmark_service",
    "KPIService",
    "get_kpi_service",
    "ChannelService",
    "get_channel_service",
    # Health check utilities
    "create_health_response",
    "is_health_check_request",
    "handle_health_check",
    "get_cache_stats",
    # PII redaction utilities
    "redact_pii",
    "redact_client_name",
    "create_safe_log_context",
    "wrap_logger",
    "RedactingLogger",
    "get_redaction_patterns",
    "clear_pattern_cache",
]
