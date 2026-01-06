"""
Graceful Shutdown Handler
Ensures in-flight requests complete before function recycles.

Part of MPA v5.2 reliability improvements.
"""

import asyncio
import signal
import logging
import time
from typing import Set, Optional, Dict, Any, Callable
from threading import Lock
from contextvars import ContextVar
from functools import wraps

logger = logging.getLogger(__name__)

# Track active requests
_active_requests: Set[str] = set()
_active_requests_lock = Lock()
_shutdown_requested = False
_shutdown_timeout = 30  # Default timeout in seconds

# Context variable for request tracking
request_id_var: ContextVar[str] = ContextVar('request_id', default='')


def register_request(request_id: str) -> None:
    """
    Register an active request.

    Args:
        request_id: Unique identifier for the request
    """
    with _active_requests_lock:
        _active_requests.add(request_id)
        logger.debug(f"Registered request {request_id}, active count: {len(_active_requests)}")


def unregister_request(request_id: str) -> None:
    """
    Unregister a completed request.

    Args:
        request_id: Unique identifier for the request
    """
    with _active_requests_lock:
        _active_requests.discard(request_id)
        logger.debug(f"Unregistered request {request_id}, active count: {len(_active_requests)}")


def get_active_request_count() -> int:
    """Get the number of active requests."""
    with _active_requests_lock:
        return len(_active_requests)


def get_active_requests() -> Set[str]:
    """Get a copy of active request IDs."""
    with _active_requests_lock:
        return _active_requests.copy()


async def wait_for_active_requests(timeout_seconds: int = 30) -> bool:
    """
    Wait for active requests to complete.

    Args:
        timeout_seconds: Maximum time to wait

    Returns:
        True if all requests completed, False if timed out
    """
    start_time = time.time()

    while True:
        active_count = get_active_request_count()

        if active_count == 0:
            logger.info("All requests completed")
            return True

        elapsed = time.time() - start_time
        if elapsed >= timeout_seconds:
            logger.warning(
                f"Shutdown timeout after {elapsed:.1f}s: "
                f"{active_count} requests still active"
            )
            return False

        remaining = timeout_seconds - elapsed
        logger.info(
            f"Waiting for {active_count} active requests... "
            f"({remaining:.1f}s remaining)"
        )
        await asyncio.sleep(1)


def setup_shutdown_handlers(timeout_seconds: int = 30) -> None:
    """
    Set up signal handlers for graceful shutdown.

    Args:
        timeout_seconds: Timeout for waiting on active requests
    """
    global _shutdown_timeout
    _shutdown_timeout = timeout_seconds

    def handle_shutdown(signum, frame):
        global _shutdown_requested
        _shutdown_requested = True
        signal_name = signal.Signals(signum).name
        logger.info(f"Shutdown signal received ({signal_name})")

    # Register handlers for common shutdown signals
    try:
        signal.signal(signal.SIGTERM, handle_shutdown)
        signal.signal(signal.SIGINT, handle_shutdown)
        logger.info("Shutdown handlers registered")
    except Exception as e:
        logger.warning(f"Could not register signal handlers: {e}")


def is_shutting_down() -> bool:
    """Check if shutdown has been requested."""
    return _shutdown_requested


def request_shutdown() -> None:
    """Programmatically request shutdown."""
    global _shutdown_requested
    _shutdown_requested = True
    logger.info("Shutdown requested programmatically")


def reset_shutdown() -> None:
    """Reset shutdown state (for testing)."""
    global _shutdown_requested
    _shutdown_requested = False
    with _active_requests_lock:
        _active_requests.clear()


class RequestTracker:
    """
    Context manager for tracking requests during graceful shutdown.

    Usage:
        with RequestTracker(request_id) as tracker:
            if tracker.should_proceed:
                process_request()
            else:
                return "Server is shutting down"
    """

    def __init__(self, request_id: str):
        self.request_id = request_id
        self.should_proceed = True

    def __enter__(self):
        if is_shutting_down():
            self.should_proceed = False
            logger.warning(f"Rejecting request {self.request_id} - shutdown in progress")
        else:
            register_request(self.request_id)
            request_id_var.set(self.request_id)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.should_proceed:
            unregister_request(self.request_id)
            request_id_var.set('')
        return False  # Don't suppress exceptions


def track_request(func: Callable):
    """
    Decorator that tracks requests for graceful shutdown.

    Expects request_id in kwargs or generates one.

    Usage:
        @track_request
        async def handle_request(request_id: str = None):
            ...
    """
    @wraps(func)
    async def async_wrapper(*args, **kwargs):
        import uuid
        request_id = kwargs.get('request_id') or str(uuid.uuid4())[:8]

        with RequestTracker(request_id) as tracker:
            if not tracker.should_proceed:
                return {
                    "status": "rejected",
                    "message": "Server is shutting down",
                    "retry_after": 30
                }

            try:
                return await func(*args, **kwargs)
            except Exception as e:
                logger.error(f"Request {request_id} failed: {e}")
                raise

    @wraps(func)
    def sync_wrapper(*args, **kwargs):
        import uuid
        request_id = kwargs.get('request_id') or str(uuid.uuid4())[:8]

        with RequestTracker(request_id) as tracker:
            if not tracker.should_proceed:
                return {
                    "status": "rejected",
                    "message": "Server is shutting down",
                    "retry_after": 30
                }

            try:
                return func(*args, **kwargs)
            except Exception as e:
                logger.error(f"Request {request_id} failed: {e}")
                raise

    if asyncio.iscoroutinefunction(func):
        return async_wrapper
    return sync_wrapper


async def graceful_shutdown(timeout_seconds: Optional[int] = None) -> Dict[str, Any]:
    """
    Perform graceful shutdown.

    Args:
        timeout_seconds: Override default timeout

    Returns:
        Shutdown result with statistics
    """
    global _shutdown_requested
    _shutdown_requested = True

    timeout = timeout_seconds or _shutdown_timeout
    start_time = time.time()

    initial_active = get_active_request_count()
    logger.info(f"Starting graceful shutdown with {initial_active} active requests")

    completed = await wait_for_active_requests(timeout)

    elapsed = time.time() - start_time
    final_active = get_active_request_count()

    result = {
        "status": "completed" if completed else "timeout",
        "initial_active_requests": initial_active,
        "final_active_requests": final_active,
        "elapsed_seconds": round(elapsed, 2),
        "timeout_seconds": timeout,
        "remaining_requests": list(get_active_requests()) if not completed else []
    }

    if completed:
        logger.info(f"Graceful shutdown completed in {elapsed:.2f}s")
    else:
        logger.warning(
            f"Graceful shutdown timed out after {elapsed:.2f}s, "
            f"{final_active} requests still active"
        )

    return result


def get_shutdown_status() -> Dict[str, Any]:
    """Get current shutdown status."""
    return {
        "shutdown_requested": _shutdown_requested,
        "active_requests": get_active_request_count(),
        "active_request_ids": list(get_active_requests()),
        "timeout_seconds": _shutdown_timeout
    }


class ShutdownAwareHTTPClient:
    """
    HTTP client wrapper that respects shutdown state.

    Won't start new requests if shutdown is in progress.
    """

    def __init__(self, base_client):
        self.client = base_client

    async def request(self, method: str, url: str, **kwargs):
        if is_shutting_down():
            raise ShutdownInProgressError("Cannot make HTTP requests during shutdown")
        return await self.client.request(method, url, **kwargs)

    async def get(self, url: str, **kwargs):
        return await self.request("GET", url, **kwargs)

    async def post(self, url: str, **kwargs):
        return await self.request("POST", url, **kwargs)


class ShutdownInProgressError(Exception):
    """Raised when operation is attempted during shutdown."""
    pass


# Azure Functions host.json configuration recommendation
HOST_JSON_SHUTDOWN_CONFIG = {
    "version": "2.0",
    "functionTimeout": "00:10:00",
    "extensions": {
        "http": {
            "routePrefix": "api"
        }
    },
    "logging": {
        "applicationInsights": {
            "samplingSettings": {
                "isEnabled": True
            }
        }
    },
    "shutdownTimeout": "00:00:30"
}
