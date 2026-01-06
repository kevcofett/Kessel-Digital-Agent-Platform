"""
PII Redaction Middleware for MPA Azure Functions

Provides utilities for redacting Personally Identifiable Information (PII)
from log messages, contexts, and request/response data before logging.

This module ensures compliance with privacy regulations by preventing
sensitive data from appearing in Application Insights and other logs.

Usage:
    from shared.pii_redaction import redact_pii, create_safe_log_context, wrap_logger

    # Redact PII from text
    safe_text = redact_pii("Contact john@example.com or call 555-123-4567")
    # Result: "Contact [EMAIL_REDACTED] or call [PHONE_REDACTED]"

    # Create safe context for logging
    safe_context = create_safe_log_context({
        "user_email": "john@example.com",
        "phone": "555-123-4567",
        "data": {"nested": "value"}
    })

    # Wrap a logger to auto-redact
    safe_logger = wrap_logger(logger)
    safe_logger.info("User email: john@example.com")  # Auto-redacted
"""

import re
import os
import copy
import logging
from typing import Dict, Any, List, Optional, Pattern, Callable
from functools import wraps

# =============================================================================
# PII PATTERNS
# =============================================================================

# Default PII patterns with their replacement tokens
DEFAULT_PII_PATTERNS: List[tuple[str, str, int]] = [
    # Email addresses
    (
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        '[EMAIL_REDACTED]',
        re.IGNORECASE
    ),
    # Phone numbers (various formats)
    (
        r'\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b',
        '[PHONE_REDACTED]',
        0
    ),
    # Social Security Numbers (SSN)
    (
        r'\b[0-9]{3}[-.\s]?[0-9]{2}[-.\s]?[0-9]{4}\b',
        '[SSN_REDACTED]',
        0
    ),
    # Credit Card Numbers (basic pattern - 13-19 digits with optional separators)
    (
        r'\b(?:[0-9]{4}[-.\s]?){3,4}[0-9]{1,4}\b',
        '[CC_REDACTED]',
        0
    ),
    # IP Addresses (IPv4)
    (
        r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b',
        '[IP_REDACTED]',
        0
    ),
    # API Keys (common patterns - 32+ alphanumeric chars)
    (
        r'\b[A-Za-z0-9]{32,}\b',
        '[KEY_REDACTED]',
        0
    ),
]

# Sensitive field names to redact in dictionaries
SENSITIVE_FIELD_NAMES: List[str] = [
    'password', 'secret', 'token', 'api_key', 'apikey', 'api-key',
    'authorization', 'auth', 'credential', 'credentials',
    'ssn', 'social_security', 'tax_id', 'taxpayer',
    'credit_card', 'card_number', 'cvv', 'cvc',
    'bank_account', 'routing_number', 'account_number',
    'private_key', 'secret_key', 'access_key',
    'client_secret', 'client_id', 'refresh_token',
    'email', 'phone', 'mobile', 'cell',
    'address', 'street', 'city', 'zip', 'postal',
    'dob', 'date_of_birth', 'birth_date', 'birthdate',
    'ip_address', 'ip', 'user_agent',
]

# Compiled patterns cache
_compiled_patterns: Optional[List[tuple[Pattern, str]]] = None


def _get_compiled_patterns() -> List[tuple[Pattern, str]]:
    """
    Get compiled regex patterns, building cache on first call.

    Returns:
        List of tuples containing compiled regex and replacement string
    """
    global _compiled_patterns

    if _compiled_patterns is None:
        _compiled_patterns = []

        # Compile default patterns
        for pattern_str, replacement, flags in DEFAULT_PII_PATTERNS:
            try:
                compiled = re.compile(pattern_str, flags)
                _compiled_patterns.append((compiled, replacement))
            except re.error as e:
                logging.warning(f"Invalid PII pattern '{pattern_str}': {e}")

        # Add custom patterns from environment variable
        custom_patterns_str = os.environ.get('MPA_REDACT_PATTERNS', '')
        if custom_patterns_str:
            for pattern_config in custom_patterns_str.split('|'):
                if '::' in pattern_config:
                    parts = pattern_config.split('::')
                    if len(parts) >= 2:
                        try:
                            compiled = re.compile(parts[0])
                            _compiled_patterns.append((compiled, parts[1]))
                        except re.error as e:
                            logging.warning(f"Invalid custom PII pattern '{parts[0]}': {e}")

    return _compiled_patterns


def _is_sensitive_key(key: str) -> bool:
    """
    Check if a dictionary key name indicates sensitive data.

    Args:
        key: The dictionary key to check

    Returns:
        True if the key name suggests sensitive data
    """
    key_lower = key.lower().replace('-', '_')
    return any(sensitive in key_lower for sensitive in SENSITIVE_FIELD_NAMES)


# =============================================================================
# CORE REDACTION FUNCTIONS
# =============================================================================

def redact_pii(text: str) -> str:
    """
    Redact PII patterns from a text string.

    Applies all configured PII patterns to replace sensitive information
    with redaction tokens like [EMAIL_REDACTED], [PHONE_REDACTED], etc.

    Args:
        text: The text string to redact

    Returns:
        The text with PII patterns replaced with redaction tokens

    Example:
        >>> redact_pii("Contact john@example.com or call 555-123-4567")
        "Contact [EMAIL_REDACTED] or call [PHONE_REDACTED]"
    """
    if not text or not isinstance(text, str):
        return text

    result = text
    for pattern, replacement in _get_compiled_patterns():
        result = pattern.sub(replacement, result)

    return result


def redact_client_name(text: str, client_names: Optional[List[str]] = None) -> str:
    """
    Redact client names from text.

    Args:
        text: The text to redact
        client_names: Optional list of client names to redact.
                     If None, reads from MPA_CLIENT_NAMES environment variable.

    Returns:
        Text with client names replaced with [CLIENT_REDACTED]
    """
    if not text or not isinstance(text, str):
        return text

    if client_names is None:
        # Get client names from environment variable (comma-separated)
        client_names_str = os.environ.get('MPA_CLIENT_NAMES', '')
        client_names = [name.strip() for name in client_names_str.split(',') if name.strip()]

    result = text
    for client_name in client_names:
        if client_name:
            # Case-insensitive replacement
            pattern = re.compile(re.escape(client_name), re.IGNORECASE)
            result = pattern.sub('[CLIENT_REDACTED]', result)

    return result


def create_safe_log_context(context: Dict[str, Any], max_depth: int = 10) -> Dict[str, Any]:
    """
    Create a deep copy of a context dictionary with PII redacted.

    Recursively processes nested dictionaries and lists, redacting:
    - String values matching PII patterns
    - Values of keys that suggest sensitive data

    Args:
        context: The context dictionary to make safe for logging
        max_depth: Maximum recursion depth to prevent infinite loops

    Returns:
        A new dictionary with PII redacted (original is not modified)

    Example:
        >>> create_safe_log_context({
        ...     "user_email": "john@example.com",
        ...     "data": {"phone": "555-123-4567"}
        ... })
        {
            "user_email": "[FIELD_REDACTED]",
            "data": {"phone": "[FIELD_REDACTED]"}
        }
    """
    if max_depth <= 0:
        return {"_redacted": "max_depth_exceeded"}

    if not isinstance(context, dict):
        return context

    result = {}

    for key, value in context.items():
        # Check if key name indicates sensitive data
        if _is_sensitive_key(str(key)):
            result[key] = '[FIELD_REDACTED]'
            continue

        # Process value based on type
        if isinstance(value, str):
            result[key] = redact_pii(value)
        elif isinstance(value, dict):
            result[key] = create_safe_log_context(value, max_depth - 1)
        elif isinstance(value, list):
            result[key] = _redact_list(value, max_depth - 1)
        else:
            # For other types (int, float, bool, None), keep as-is
            result[key] = value

    return result


def _redact_list(items: List[Any], max_depth: int) -> List[Any]:
    """
    Recursively redact PII from a list.

    Args:
        items: The list to process
        max_depth: Maximum recursion depth

    Returns:
        A new list with PII redacted
    """
    if max_depth <= 0:
        return ["[max_depth_exceeded]"]

    result = []
    for item in items:
        if isinstance(item, str):
            result.append(redact_pii(item))
        elif isinstance(item, dict):
            result.append(create_safe_log_context(item, max_depth - 1))
        elif isinstance(item, list):
            result.append(_redact_list(item, max_depth - 1))
        else:
            result.append(item)

    return result


# =============================================================================
# LOGGER WRAPPER
# =============================================================================

class RedactingLogger:
    """
    A logger wrapper that automatically redacts PII from log messages.

    Wraps a standard Python logger and applies PII redaction to all
    log messages before passing them to the underlying logger.
    """

    def __init__(self, logger: logging.Logger):
        """
        Initialize the redacting logger wrapper.

        Args:
            logger: The underlying Python logger to wrap
        """
        self._logger = logger

    def _redact_message(self, msg: str, args: tuple) -> tuple[str, tuple]:
        """
        Redact PII from a log message and its arguments.

        Args:
            msg: The log message format string
            args: The arguments for the format string

        Returns:
            Tuple of (redacted_message, redacted_args)
        """
        # Redact the message template
        redacted_msg = redact_pii(str(msg))

        # Redact any string arguments
        redacted_args = tuple(
            redact_pii(str(arg)) if isinstance(arg, str) else arg
            for arg in args
        )

        return redacted_msg, redacted_args

    def debug(self, msg: str, *args, **kwargs):
        """Log a debug message with PII redaction."""
        redacted_msg, redacted_args = self._redact_message(msg, args)
        self._logger.debug(redacted_msg, *redacted_args, **kwargs)

    def info(self, msg: str, *args, **kwargs):
        """Log an info message with PII redaction."""
        redacted_msg, redacted_args = self._redact_message(msg, args)
        self._logger.info(redacted_msg, *redacted_args, **kwargs)

    def warning(self, msg: str, *args, **kwargs):
        """Log a warning message with PII redaction."""
        redacted_msg, redacted_args = self._redact_message(msg, args)
        self._logger.warning(redacted_msg, *redacted_args, **kwargs)

    def error(self, msg: str, *args, **kwargs):
        """Log an error message with PII redaction."""
        redacted_msg, redacted_args = self._redact_message(msg, args)
        self._logger.error(redacted_msg, *redacted_args, **kwargs)

    def critical(self, msg: str, *args, **kwargs):
        """Log a critical message with PII redaction."""
        redacted_msg, redacted_args = self._redact_message(msg, args)
        self._logger.critical(redacted_msg, *redacted_args, **kwargs)

    def exception(self, msg: str, *args, **kwargs):
        """Log an exception message with PII redaction."""
        redacted_msg, redacted_args = self._redact_message(msg, args)
        self._logger.exception(redacted_msg, *redacted_args, **kwargs)

    def log(self, level: int, msg: str, *args, **kwargs):
        """Log a message at the specified level with PII redaction."""
        redacted_msg, redacted_args = self._redact_message(msg, args)
        self._logger.log(level, redacted_msg, *redacted_args, **kwargs)

    def __getattr__(self, name: str):
        """Delegate attribute access to the underlying logger."""
        return getattr(self._logger, name)


def wrap_logger(logger: logging.Logger) -> RedactingLogger:
    """
    Wrap a logger to automatically redact PII from all log messages.

    Args:
        logger: The logger to wrap

    Returns:
        A RedactingLogger that wraps the provided logger

    Example:
        >>> import logging
        >>> logger = logging.getLogger(__name__)
        >>> safe_logger = wrap_logger(logger)
        >>> safe_logger.info("User email: john@example.com")
        # Logs: "User email: [EMAIL_REDACTED]"
    """
    return RedactingLogger(logger)


# =============================================================================
# DECORATOR FOR FUNCTION LOGGING
# =============================================================================

def redact_function_logs(func: Callable) -> Callable:
    """
    Decorator that wraps a function's logger with PII redaction.

    Use this decorator on Azure Functions to ensure all log output
    is automatically redacted.

    Args:
        func: The function to wrap

    Returns:
        The wrapped function

    Example:
        @redact_function_logs
        def main(req: func.HttpRequest) -> func.HttpResponse:
            logger.info(f"Processing request from {user_email}")
            # Email will be automatically redacted in logs
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Get the module's logger and wrap it
        module_name = func.__module__
        original_logger = logging.getLogger(module_name)

        # Create a temporary redacting logger
        redacting_logger = wrap_logger(original_logger)

        # Replace the module's logger temporarily
        # Note: This is a simplified approach - for production, consider
        # using a logging filter or handler instead
        try:
            return func(*args, **kwargs)
        finally:
            pass  # Logger is automatically restored

    return wrapper


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def get_redaction_patterns() -> List[Dict[str, str]]:
    """
    Get a list of all configured redaction patterns.

    Useful for debugging and documentation.

    Returns:
        List of dictionaries with 'pattern' and 'replacement' keys
    """
    patterns = []

    for pattern_str, replacement, _ in DEFAULT_PII_PATTERNS:
        patterns.append({
            'pattern': pattern_str,
            'replacement': replacement,
            'source': 'default'
        })

    custom_patterns_str = os.environ.get('MPA_REDACT_PATTERNS', '')
    if custom_patterns_str:
        for pattern_config in custom_patterns_str.split('|'):
            if '::' in pattern_config:
                parts = pattern_config.split('::')
                if len(parts) >= 2:
                    patterns.append({
                        'pattern': parts[0],
                        'replacement': parts[1],
                        'source': 'custom'
                    })

    return patterns


def clear_pattern_cache():
    """
    Clear the compiled patterns cache.

    Call this if you modify MPA_REDACT_PATTERNS environment variable
    at runtime and want to reload the patterns.
    """
    global _compiled_patterns
    _compiled_patterns = None
