"""
Circuit Breaker Pattern Implementation
Prevents cascading failures by failing fast when a service is down.

Part of MPA v5.2 reliability improvements.
"""

import time
import logging
from typing import Callable, Any, Optional, Dict
from dataclasses import dataclass, field
from enum import Enum
from functools import wraps
from threading import Lock

logger = logging.getLogger(__name__)


class CircuitState(Enum):
    """Circuit breaker states."""
    CLOSED = "closed"      # Normal operation, requests flow through
    OPEN = "open"          # Failing fast, no requests allowed
    HALF_OPEN = "half_open"  # Testing if service recovered


@dataclass
class CircuitBreakerConfig:
    """Configuration for a circuit breaker."""
    failure_threshold: int = 5       # Failures before opening
    success_threshold: int = 3       # Successes to close from half-open
    timeout_seconds: int = 60        # Time before trying again
    half_open_max_calls: int = 3     # Max calls in half-open state

    # Optional callbacks
    on_open: Optional[Callable] = None
    on_close: Optional[Callable] = None
    on_half_open: Optional[Callable] = None


@dataclass
class CircuitBreakerMetrics:
    """Metrics for a circuit breaker."""
    total_calls: int = 0
    successful_calls: int = 0
    failed_calls: int = 0
    rejected_calls: int = 0  # Calls rejected when circuit is open
    last_failure_time: float = 0
    last_success_time: float = 0
    state_changes: int = 0


class CircuitBreaker:
    """
    Circuit breaker that prevents repeated calls to failing services.

    States:
    - CLOSED: Normal operation. Requests flow through.
    - OPEN: Service is failing. Requests are rejected immediately.
    - HALF_OPEN: Testing if service recovered. Limited requests allowed.

    Usage:
        breaker = CircuitBreaker("my_service")

        if breaker.can_execute():
            try:
                result = call_external_service()
                breaker.record_success()
            except Exception:
                breaker.record_failure()
    """

    def __init__(
        self,
        name: str,
        config: Optional[CircuitBreakerConfig] = None
    ):
        self.name = name
        self.config = config or CircuitBreakerConfig()
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time: float = 0
        self.half_open_calls = 0
        self.metrics = CircuitBreakerMetrics()
        self._lock = Lock()

    def can_execute(self) -> bool:
        """
        Check if a call should be allowed.

        Returns:
            True if call is allowed, False if circuit is open
        """
        with self._lock:
            if self.state == CircuitState.CLOSED:
                return True

            if self.state == CircuitState.OPEN:
                # Check if timeout has passed
                elapsed = time.time() - self.last_failure_time
                if elapsed >= self.config.timeout_seconds:
                    self._transition_to_half_open()
                    return True

                # Still in timeout period
                self.metrics.rejected_calls += 1
                return False

            if self.state == CircuitState.HALF_OPEN:
                # Allow limited calls in half-open state
                if self.half_open_calls < self.config.half_open_max_calls:
                    self.half_open_calls += 1
                    return True
                return False

            return False

    def record_success(self) -> None:
        """Record a successful call."""
        with self._lock:
            self.metrics.total_calls += 1
            self.metrics.successful_calls += 1
            self.metrics.last_success_time = time.time()

            if self.state == CircuitState.HALF_OPEN:
                self.success_count += 1
                if self.success_count >= self.config.success_threshold:
                    self._transition_to_closed()
            else:
                # Reset failure count on success in closed state
                self.failure_count = 0

    def record_failure(self) -> None:
        """Record a failed call."""
        with self._lock:
            self.metrics.total_calls += 1
            self.metrics.failed_calls += 1
            self.metrics.last_failure_time = time.time()

            self.failure_count += 1
            self.last_failure_time = time.time()

            if self.state == CircuitState.HALF_OPEN:
                # Any failure in half-open returns to open
                self._transition_to_open()
            elif self.failure_count >= self.config.failure_threshold:
                self._transition_to_open()

    def _transition_to_open(self) -> None:
        """Open the circuit."""
        logger.warning(
            f"Circuit breaker '{self.name}' OPENED after {self.failure_count} failures"
        )
        self.state = CircuitState.OPEN
        self.metrics.state_changes += 1

        if self.config.on_open:
            try:
                self.config.on_open(self.name)
            except Exception as e:
                logger.error(f"Error in on_open callback: {e}")

    def _transition_to_half_open(self) -> None:
        """Move to half-open state."""
        logger.info(f"Circuit breaker '{self.name}' moving to HALF_OPEN")
        self.state = CircuitState.HALF_OPEN
        self.half_open_calls = 0
        self.success_count = 0
        self.metrics.state_changes += 1

        if self.config.on_half_open:
            try:
                self.config.on_half_open(self.name)
            except Exception as e:
                logger.error(f"Error in on_half_open callback: {e}")

    def _transition_to_closed(self) -> None:
        """Close the circuit."""
        logger.info(
            f"Circuit breaker '{self.name}' CLOSED after {self.success_count} successes"
        )
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.metrics.state_changes += 1

        if self.config.on_close:
            try:
                self.config.on_close(self.name)
            except Exception as e:
                logger.error(f"Error in on_close callback: {e}")

    def get_state(self) -> Dict[str, Any]:
        """Get current state as dictionary."""
        return {
            "name": self.name,
            "state": self.state.value,
            "failure_count": self.failure_count,
            "success_count": self.success_count,
            "last_failure_time": self.last_failure_time,
            "metrics": {
                "total_calls": self.metrics.total_calls,
                "successful_calls": self.metrics.successful_calls,
                "failed_calls": self.metrics.failed_calls,
                "rejected_calls": self.metrics.rejected_calls,
                "state_changes": self.metrics.state_changes,
            }
        }

    def force_open(self) -> None:
        """Force circuit to open state (for testing/maintenance)."""
        with self._lock:
            self._transition_to_open()

    def force_close(self) -> None:
        """Force circuit to closed state (for recovery)."""
        with self._lock:
            self._transition_to_closed()

    def reset(self) -> None:
        """Reset circuit breaker to initial state."""
        with self._lock:
            self.state = CircuitState.CLOSED
            self.failure_count = 0
            self.success_count = 0
            self.last_failure_time = 0
            self.half_open_calls = 0
            self.metrics = CircuitBreakerMetrics()
            logger.info(f"Circuit breaker '{self.name}' reset")


class CircuitBreakerRegistry:
    """
    Registry of circuit breakers for different services.

    Usage:
        breaker = CircuitBreakerRegistry.get("dataverse_api")
    """

    _breakers: Dict[str, CircuitBreaker] = {}
    _lock = Lock()

    @classmethod
    def get(
        cls,
        name: str,
        config: Optional[CircuitBreakerConfig] = None
    ) -> CircuitBreaker:
        """Get or create a circuit breaker."""
        with cls._lock:
            if name not in cls._breakers:
                cls._breakers[name] = CircuitBreaker(name, config)
            return cls._breakers[name]

    @classmethod
    def get_all_states(cls) -> Dict[str, Dict]:
        """Get states of all circuit breakers."""
        with cls._lock:
            return {
                name: breaker.get_state()
                for name, breaker in cls._breakers.items()
            }

    @classmethod
    def reset_all(cls) -> None:
        """Reset all circuit breakers."""
        with cls._lock:
            for breaker in cls._breakers.values():
                breaker.reset()

    @classmethod
    def remove(cls, name: str) -> None:
        """Remove a circuit breaker from registry."""
        with cls._lock:
            if name in cls._breakers:
                del cls._breakers[name]


def circuit_breaker(
    name: str,
    config: Optional[CircuitBreakerConfig] = None,
    fallback: Optional[Callable] = None
):
    """
    Decorator that applies circuit breaker pattern to a function.

    Usage:
        @circuit_breaker("dataverse_api")
        async def query_dataverse():
            ...

        @circuit_breaker("external_api", fallback=get_cached_data)
        async def call_external_api():
            ...
    """
    def decorator(func: Callable):
        cb = CircuitBreakerRegistry.get(name, config)

        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            if not cb.can_execute():
                if fallback:
                    logger.info(f"Circuit '{name}' open, using fallback")
                    return await fallback(*args, **kwargs) if asyncio.iscoroutinefunction(fallback) else fallback(*args, **kwargs)
                raise CircuitOpenError(f"Circuit '{name}' is open")

            try:
                result = await func(*args, **kwargs)
                cb.record_success()
                return result
            except Exception as e:
                cb.record_failure()
                raise

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            if not cb.can_execute():
                if fallback:
                    logger.info(f"Circuit '{name}' open, using fallback")
                    return fallback(*args, **kwargs)
                raise CircuitOpenError(f"Circuit '{name}' is open")

            try:
                result = func(*args, **kwargs)
                cb.record_success()
                return result
            except Exception as e:
                cb.record_failure()
                raise

        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper

    return decorator


class CircuitOpenError(Exception):
    """Raised when circuit breaker is open and call is rejected."""

    def __init__(self, message: str, circuit_name: Optional[str] = None):
        super().__init__(message)
        self.circuit_name = circuit_name


def get_circuit_health() -> Dict[str, Any]:
    """
    Get health status of all circuit breakers.

    Returns:
        Dictionary with health information
    """
    states = CircuitBreakerRegistry.get_all_states()

    open_circuits = [
        name for name, state in states.items()
        if state["state"] == "open"
    ]

    return {
        "status": "healthy" if not open_circuits else "degraded",
        "open_circuits": open_circuits,
        "total_circuits": len(states),
        "circuits": states
    }
