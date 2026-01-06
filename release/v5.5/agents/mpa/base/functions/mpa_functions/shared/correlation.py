"""
Correlation ID Utility
Generates and propagates correlation IDs through all operations.

Part of MPA v5.2 observability improvements.
"""

import uuid
import logging
from typing import Optional, Dict, Any, Callable
from contextvars import ContextVar
from functools import wraps

# Context variable for correlation ID (thread-safe)
correlation_id_var: ContextVar[str] = ContextVar('correlation_id', default='')

logger = logging.getLogger(__name__)


def generate_correlation_id() -> str:
    """
    Generate a new correlation ID.

    Format: mpa-{12-char-hex}
    Example: mpa-a1b2c3d4e5f6
    """
    return f"mpa-{uuid.uuid4().hex[:12]}"


def get_correlation_id() -> str:
    """
    Get the current correlation ID from context.

    Returns existing ID or generates new one if none set.
    """
    current = correlation_id_var.get()
    if not current:
        current = generate_correlation_id()
        correlation_id_var.set(current)
    return current


def set_correlation_id(correlation_id: str) -> None:
    """Set the correlation ID in context."""
    correlation_id_var.set(correlation_id)


def clear_correlation_id() -> None:
    """Clear the correlation ID from context."""
    correlation_id_var.set('')


def with_correlation_id(func: Callable):
    """
    Decorator that ensures correlation ID is set for the function.

    Extracts from headers/params or generates new ID.
    Adds correlation_id to kwargs for downstream use.
    """
    @wraps(func)
    async def async_wrapper(*args, **kwargs):
        # Try to get from various sources
        correlation_id = _extract_correlation_id(kwargs)
        set_correlation_id(correlation_id)

        # Add to kwargs for downstream use
        kwargs['correlation_id'] = correlation_id

        logger.info(f"Starting operation", extra={'correlation_id': correlation_id})

        try:
            result = await func(*args, **kwargs)
            logger.info(f"Completed operation", extra={'correlation_id': correlation_id})
            return result
        except Exception as e:
            logger.error(f"Failed operation: {e}", extra={'correlation_id': correlation_id})
            raise
        finally:
            # Clear after operation
            clear_correlation_id()

    @wraps(func)
    def sync_wrapper(*args, **kwargs):
        # Try to get from various sources
        correlation_id = _extract_correlation_id(kwargs)
        set_correlation_id(correlation_id)

        # Add to kwargs for downstream use
        kwargs['correlation_id'] = correlation_id

        logger.info(f"Starting operation", extra={'correlation_id': correlation_id})

        try:
            result = func(*args, **kwargs)
            logger.info(f"Completed operation", extra={'correlation_id': correlation_id})
            return result
        except Exception as e:
            logger.error(f"Failed operation: {e}", extra={'correlation_id': correlation_id})
            raise
        finally:
            # Clear after operation
            clear_correlation_id()

    # Return appropriate wrapper based on function type
    import asyncio
    if asyncio.iscoroutinefunction(func):
        return async_wrapper
    return sync_wrapper


def _extract_correlation_id(kwargs: Dict[str, Any]) -> str:
    """Extract correlation ID from various sources."""
    # Try headers (for HTTP triggers)
    headers = kwargs.get('headers', {})
    if isinstance(headers, dict):
        correlation_id = (
            headers.get('X-Correlation-ID') or
            headers.get('x-correlation-id') or
            headers.get('X-Request-ID') or
            headers.get('x-request-id')
        )
        if correlation_id:
            return correlation_id

    # Try direct parameter
    if 'correlation_id' in kwargs and kwargs['correlation_id']:
        return kwargs['correlation_id']

    # Try request object (Azure Functions)
    req = kwargs.get('req')
    if req and hasattr(req, 'headers'):
        correlation_id = (
            req.headers.get('X-Correlation-ID') or
            req.headers.get('x-correlation-id')
        )
        if correlation_id:
            return correlation_id

    # Generate new ID
    return generate_correlation_id()


class CorrelatedLogger:
    """
    Logger wrapper that automatically includes correlation ID.

    Usage:
        logger = CorrelatedLogger(__name__)
        logger.info("Processing request")  # Automatically includes correlation_id
    """

    def __init__(self, name: str):
        self.logger = logging.getLogger(name)

    def _get_extra(self, extra: Optional[Dict] = None) -> Dict:
        """Build extra dict with correlation ID."""
        result = extra.copy() if extra else {}
        result['correlation_id'] = get_correlation_id()
        return result

    def _format_message(self, message: str) -> str:
        """Format message with correlation ID prefix."""
        correlation_id = get_correlation_id()
        if correlation_id:
            return f"[{correlation_id}] {message}"
        return message

    def debug(self, message: str, *args, extra: Optional[Dict] = None, **kwargs):
        """Log debug message with correlation ID."""
        self.logger.debug(
            self._format_message(message),
            *args,
            extra=self._get_extra(extra),
            **kwargs
        )

    def info(self, message: str, *args, extra: Optional[Dict] = None, **kwargs):
        """Log info message with correlation ID."""
        self.logger.info(
            self._format_message(message),
            *args,
            extra=self._get_extra(extra),
            **kwargs
        )

    def warning(self, message: str, *args, extra: Optional[Dict] = None, **kwargs):
        """Log warning message with correlation ID."""
        self.logger.warning(
            self._format_message(message),
            *args,
            extra=self._get_extra(extra),
            **kwargs
        )

    def error(self, message: str, *args, extra: Optional[Dict] = None, **kwargs):
        """Log error message with correlation ID."""
        self.logger.error(
            self._format_message(message),
            *args,
            extra=self._get_extra(extra),
            **kwargs
        )

    def exception(self, message: str, *args, extra: Optional[Dict] = None, **kwargs):
        """Log exception with correlation ID."""
        self.logger.exception(
            self._format_message(message),
            *args,
            extra=self._get_extra(extra),
            **kwargs
        )

    def critical(self, message: str, *args, extra: Optional[Dict] = None, **kwargs):
        """Log critical message with correlation ID."""
        self.logger.critical(
            self._format_message(message),
            *args,
            extra=self._get_extra(extra),
            **kwargs
        )


def create_outbound_headers(additional_headers: Optional[Dict[str, str]] = None) -> Dict[str, str]:
    """
    Create headers for outbound HTTP calls with correlation ID.

    Args:
        additional_headers: Extra headers to include

    Returns:
        Headers dict with correlation ID
    """
    headers = {
        'X-Correlation-ID': get_correlation_id()
    }
    if additional_headers:
        headers.update(additional_headers)
    return headers


def add_correlation_to_response(
    response_data: Dict[str, Any],
    include_in_body: bool = False
) -> Dict[str, Any]:
    """
    Add correlation ID to response.

    Args:
        response_data: The response data dict
        include_in_body: If True, add correlation_id to body; otherwise just for headers

    Returns:
        Response data with correlation_id added
    """
    if include_in_body:
        response_data['correlation_id'] = get_correlation_id()
    return response_data


def extract_from_azure_function_request(req) -> str:
    """
    Extract correlation ID from Azure Functions HttpRequest.

    Args:
        req: Azure Functions HttpRequest object

    Returns:
        Correlation ID (extracted or generated)
    """
    if req:
        correlation_id = (
            req.headers.get('X-Correlation-ID') or
            req.headers.get('x-correlation-id') or
            req.headers.get('X-Request-ID') or
            req.headers.get('x-request-id') or
            req.headers.get('Request-Id')  # Azure's default
        )
        if correlation_id:
            set_correlation_id(correlation_id)
            return correlation_id

    # Generate new if not found
    correlation_id = generate_correlation_id()
    set_correlation_id(correlation_id)
    return correlation_id


class CorrelationMiddleware:
    """
    Middleware-style helper for managing correlation in request handlers.

    Usage:
        middleware = CorrelationMiddleware()

        def handle_request(req):
            with middleware.context(req):
                # All operations here have correlation ID set
                process_request()
    """

    def __init__(self):
        self._original_id: Optional[str] = None

    class context:
        """Context manager for correlation scope."""

        def __init__(self, req=None, correlation_id: Optional[str] = None):
            self.req = req
            self.provided_id = correlation_id
            self._original_id: Optional[str] = None

        def __enter__(self):
            # Save original ID
            self._original_id = correlation_id_var.get()

            # Set new ID
            if self.provided_id:
                set_correlation_id(self.provided_id)
            elif self.req:
                extract_from_azure_function_request(self.req)
            else:
                set_correlation_id(generate_correlation_id())

            return get_correlation_id()

        def __exit__(self, exc_type, exc_val, exc_tb):
            # Restore original ID
            if self._original_id:
                set_correlation_id(self._original_id)
            else:
                clear_correlation_id()
            return False  # Don't suppress exceptions
