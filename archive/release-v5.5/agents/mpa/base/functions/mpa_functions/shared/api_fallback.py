"""
API Fallback Utility
Implements graceful degradation when external APIs are unavailable.

Part of MPA v5.2 reliability improvements.
"""

import logging
import time
from typing import Any, Dict, Optional, Callable, List
from functools import wraps
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger(__name__)


class FallbackSource(Enum):
    """Identifies where fallback data came from."""
    API = "api"
    CACHE = "cache"
    KB_DEFAULT = "kb_default"
    USER_PROVIDED = "user_provided"
    HISTORICAL = "historical"


class ConfidenceLevel(Enum):
    """Confidence levels for data quality."""
    VERIFIED = "VERIFIED"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    ESTIMATED = "ESTIMATED"
    LOW = "LOW"


@dataclass
class FallbackResult:
    """Result from an API call with fallback information."""
    data: Any
    source: FallbackSource
    confidence: ConfidenceLevel
    api_name: str
    fallback_reason: Optional[str] = None
    cache_age_seconds: Optional[int] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        result = {
            "data": self.data,
            "source": self.source.value,
            "confidence": self.confidence.value,
            "api_name": self.api_name,
        }
        if self.fallback_reason:
            result["fallback_reason"] = self.fallback_reason
        if self.cache_age_seconds is not None:
            result["cache_age_seconds"] = self.cache_age_seconds
        if self.metadata:
            result["metadata"] = self.metadata
        return result


@dataclass
class CircuitBreakerState:
    """State for a circuit breaker."""
    failures: int = 0
    last_failure_time: float = 0
    is_open: bool = False


class APIFallbackManager:
    """
    Manages API calls with automatic fallback to cached/default data.

    Features:
    - Automatic fallback when API calls fail
    - Circuit breaker to prevent repeated failures
    - Cache integration for fast fallback
    - KB fallback for default values
    - Confidence metadata on all responses
    """

    # Default circuit breaker settings
    CIRCUIT_BREAKER_THRESHOLD = 3  # Failures before opening
    CIRCUIT_BREAKER_TIMEOUT = 60  # Seconds before trying again

    def __init__(
        self,
        cache_manager=None,
        kb_reader=None,
        circuit_breaker_threshold: int = 3,
        circuit_breaker_timeout: int = 60
    ):
        """
        Initialize the fallback manager.

        Args:
            cache_manager: Cache manager instance for caching
            kb_reader: KB reader for default values
            circuit_breaker_threshold: Number of failures before circuit opens
            circuit_breaker_timeout: Seconds before attempting retry after circuit opens
        """
        self.cache = cache_manager
        self.kb = kb_reader
        self.circuit_breaker_threshold = circuit_breaker_threshold
        self.circuit_breaker_timeout = circuit_breaker_timeout
        self.circuit_breaker_states: Dict[str, CircuitBreakerState] = {}

    def with_fallback(
        self,
        api_name: str,
        fallback_source: str = "kb",
        cache_ttl_seconds: int = 3600,
        fallback_data: Optional[Any] = None
    ):
        """
        Decorator that adds fallback behavior to API calls.

        Args:
            api_name: Name of the API for logging/metrics
            fallback_source: "kb" for knowledge base, "cache" for cached data
            cache_ttl_seconds: How long to cache successful responses
            fallback_data: Static fallback data if all else fails

        Returns:
            Decorator function
        """
        def decorator(func: Callable):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                # Check circuit breaker
                if self._is_circuit_open(api_name):
                    logger.warning(f"Circuit open for {api_name}, using fallback")
                    fallback = await self._get_fallback(
                        api_name, fallback_source, kwargs, fallback_data
                    )
                    if fallback:
                        return fallback
                    raise CircuitOpenError(f"Circuit open for {api_name} and no fallback available")

                try:
                    # Try the actual API call
                    result = await func(*args, **kwargs)

                    # Cache successful result
                    if self.cache:
                        cache_key = self._make_cache_key(api_name, kwargs)
                        await self._set_cache(cache_key, result, cache_ttl_seconds)

                    # Reset circuit breaker on success
                    self._record_success(api_name)

                    return FallbackResult(
                        data=result,
                        source=FallbackSource.API,
                        confidence=ConfidenceLevel.VERIFIED,
                        api_name=api_name
                    )

                except Exception as e:
                    logger.error(f"API call failed for {api_name}: {str(e)}")
                    self._record_failure(api_name)

                    # Try fallback
                    fallback = await self._get_fallback(
                        api_name, fallback_source, kwargs, fallback_data
                    )

                    if fallback:
                        fallback.fallback_reason = str(e)
                        return fallback

                    # No fallback available, re-raise
                    raise

            return wrapper
        return decorator

    async def _get_fallback(
        self,
        api_name: str,
        fallback_source: str,
        params: Dict,
        static_fallback: Optional[Any]
    ) -> Optional[FallbackResult]:
        """Get fallback data from cache, KB, or static data."""

        # Try cache first
        if self.cache:
            cache_key = self._make_cache_key(api_name, params)
            cached = await self._get_cache(cache_key)
            if cached is not None:
                logger.info(f"Using cached data for {api_name}")
                return FallbackResult(
                    data=cached["data"],
                    source=FallbackSource.CACHE,
                    confidence=ConfidenceLevel.HIGH,
                    api_name=api_name,
                    cache_age_seconds=cached.get("age_seconds")
                )

        # Try KB fallback
        if fallback_source == "kb" and self.kb:
            kb_data = await self._get_kb_fallback(api_name, params)
            if kb_data:
                logger.info(f"Using KB fallback for {api_name}")
                return FallbackResult(
                    data=kb_data,
                    source=FallbackSource.KB_DEFAULT,
                    confidence=ConfidenceLevel.ESTIMATED,
                    api_name=api_name
                )

        # Try static fallback
        if static_fallback is not None:
            logger.info(f"Using static fallback for {api_name}")
            return FallbackResult(
                data=static_fallback,
                source=FallbackSource.KB_DEFAULT,
                confidence=ConfidenceLevel.LOW,
                api_name=api_name
            )

        return None

    async def _get_kb_fallback(self, api_name: str, params: Dict) -> Optional[Any]:
        """Get fallback data from knowledge base."""
        # Map API names to KB lookup strategies
        kb_mappings = {
            "benchmark_api": self._get_benchmark_kb_fallback,
            "pricing_api": self._get_pricing_kb_fallback,
            "inventory_api": self._get_inventory_kb_fallback,
            "channel_api": self._get_channel_kb_fallback,
            "kpi_api": self._get_kpi_kb_fallback,
        }

        handler = kb_mappings.get(api_name)
        if handler:
            return await handler(params)
        return None

    async def _get_benchmark_kb_fallback(self, params: Dict) -> Optional[Dict]:
        """Get benchmark data from KB files."""
        # Default benchmarks by vertical
        default_benchmarks = {
            "general": {
                "cpm_median": 8.50,
                "ctr_median": 0.15,
                "cvr_median": 2.0
            },
            "retail": {
                "cpm_median": 6.50,
                "ctr_median": 0.20,
                "cvr_median": 2.5
            },
            "finance": {
                "cpm_median": 12.00,
                "ctr_median": 0.12,
                "cvr_median": 1.5
            },
            "healthcare": {
                "cpm_median": 10.00,
                "ctr_median": 0.10,
                "cvr_median": 1.8
            }
        }

        vertical = params.get("vertical", "general").lower()
        return default_benchmarks.get(vertical, default_benchmarks["general"])

    async def _get_pricing_kb_fallback(self, params: Dict) -> Optional[Dict]:
        """Get pricing data from KB files."""
        channel = params.get("channel", "display").lower()
        default_pricing = {
            "display": {"cpm_low": 3.0, "cpm_high": 15.0, "cpm_median": 8.0},
            "video": {"cpm_low": 15.0, "cpm_high": 45.0, "cpm_median": 28.0},
            "search": {"cpc_low": 1.0, "cpc_high": 10.0, "cpc_median": 3.5},
            "social": {"cpm_low": 6.0, "cpm_high": 25.0, "cpm_median": 12.0},
        }
        return default_pricing.get(channel, default_pricing["display"])

    async def _get_inventory_kb_fallback(self, params: Dict) -> Optional[Dict]:
        """Get inventory data from KB files."""
        return {"availability": "unknown", "estimated": True}

    async def _get_channel_kb_fallback(self, params: Dict) -> Optional[List]:
        """Get channel list from KB files."""
        return [
            {"name": "Programmatic Display", "code": "prog_display"},
            {"name": "Connected TV", "code": "ctv"},
            {"name": "Paid Search", "code": "paid_search"},
            {"name": "Paid Social", "code": "paid_social"},
        ]

    async def _get_kpi_kb_fallback(self, params: Dict) -> Optional[List]:
        """Get KPI list from KB files."""
        return [
            {"code": "cpm", "name": "Cost Per Mille"},
            {"code": "ctr", "name": "Click-Through Rate"},
            {"code": "cvr", "name": "Conversion Rate"},
            {"code": "roas", "name": "Return on Ad Spend"},
        ]

    def _is_circuit_open(self, api_name: str) -> bool:
        """Check if circuit breaker is open for an API."""
        state = self.circuit_breaker_states.get(api_name)
        if not state:
            return False

        if not state.is_open:
            return False

        # Check if timeout has passed
        elapsed = time.time() - state.last_failure_time
        if elapsed >= self.circuit_breaker_timeout:
            # Allow a test request
            state.is_open = False
            return False

        return True

    def _record_success(self, api_name: str) -> None:
        """Record successful API call."""
        if api_name in self.circuit_breaker_states:
            self.circuit_breaker_states[api_name] = CircuitBreakerState()

    def _record_failure(self, api_name: str) -> None:
        """Record failed API call."""
        state = self.circuit_breaker_states.setdefault(
            api_name, CircuitBreakerState()
        )
        state.failures += 1
        state.last_failure_time = time.time()

        if state.failures >= self.circuit_breaker_threshold:
            state.is_open = True
            logger.warning(f"Circuit breaker opened for {api_name}")

    def _make_cache_key(self, api_name: str, params: Dict) -> str:
        """Create cache key from API name and parameters."""
        # Sort params for consistent key
        param_str = "_".join(
            f"{k}={v}" for k, v in sorted(params.items())
            if v is not None and k not in ("headers", "auth")
        )
        return f"api_fallback:{api_name}:{param_str}"

    async def _get_cache(self, cache_key: str) -> Optional[Dict]:
        """Get value from cache with age tracking."""
        if not self.cache:
            return None

        try:
            cached = self.cache.get(cache_key)
            if cached:
                return {
                    "data": cached.get("data"),
                    "age_seconds": int(time.time() - cached.get("timestamp", time.time()))
                }
        except Exception as e:
            logger.warning(f"Cache get failed: {e}")

        return None

    async def _set_cache(self, cache_key: str, data: Any, ttl_seconds: int) -> None:
        """Set value in cache with timestamp."""
        if not self.cache:
            return

        try:
            self.cache.set(
                cache_key,
                {"data": data, "timestamp": time.time()},
                ttl_minutes=ttl_seconds // 60
            )
        except Exception as e:
            logger.warning(f"Cache set failed: {e}")

    def get_circuit_states(self) -> Dict[str, Dict]:
        """Get current state of all circuit breakers."""
        return {
            name: {
                "failures": state.failures,
                "is_open": state.is_open,
                "last_failure": state.last_failure_time
            }
            for name, state in self.circuit_breaker_states.items()
        }

    def reset_circuit(self, api_name: str) -> None:
        """Manually reset a circuit breaker."""
        if api_name in self.circuit_breaker_states:
            self.circuit_breaker_states[api_name] = CircuitBreakerState()
            logger.info(f"Circuit breaker reset for {api_name}")


class CircuitOpenError(Exception):
    """Raised when circuit breaker is open and no fallback available."""
    pass


# Singleton instance
_fallback_manager: Optional[APIFallbackManager] = None


def get_fallback_manager(
    cache_manager=None,
    kb_reader=None
) -> APIFallbackManager:
    """Get singleton fallback manager instance."""
    global _fallback_manager
    if _fallback_manager is None:
        _fallback_manager = APIFallbackManager(
            cache_manager=cache_manager,
            kb_reader=kb_reader
        )
    return _fallback_manager
