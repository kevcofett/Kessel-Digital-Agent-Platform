"""
OData Sanitization Utility

Provides secure escaping for values used in OData filter queries.
Prevents OData injection attacks by sanitizing user input before
including in filter expressions.

Version: 5.2
Last Updated: December 30, 2025
"""

import re
import logging
from typing import Optional, Union
from uuid import UUID

logger = logging.getLogger(__name__)


# Patterns that could be used for OData injection
DANGEROUS_ODATA_OPERATORS = [
    ' eq ', ' ne ', ' gt ', ' lt ', ' ge ', ' le ',
    ' and ', ' or ', ' not ',
    ' contains(', ' endswith(', ' startswith(',
    ' has ', ' in ',
    '/', '$', '@'
]

# Valid GUID pattern
GUID_PATTERN = re.compile(
    r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
)

# Valid identifier pattern (alphanumeric, underscore, hyphen, space)
IDENTIFIER_PATTERN = re.compile(r'^[a-zA-Z0-9_\s\-\.]+$')


def sanitize_odata_string(value: Optional[str], max_length: int = 255) -> str:
    """
    Sanitize a string value for use in OData filter queries.

    This function:
    1. Handles None values safely
    2. Escapes single quotes by doubling them (OData standard)
    3. Removes dangerous OData operators
    4. Truncates to max length
    5. Strips leading/trailing whitespace

    Args:
        value: The string value to sanitize
        max_length: Maximum allowed length (default 255)

    Returns:
        Sanitized string safe for OData filter use

    Example:
        >>> sanitize_odata_string("O'Reilly")
        "O''Reilly"
        >>> sanitize_odata_string("test' or '1'='1")
        "test'' or ''1''=''1"
    """
    if value is None:
        return ""

    # Convert to string if needed
    sanitized = str(value)

    # Escape single quotes by doubling them (OData standard)
    sanitized = sanitized.replace("'", "''")

    # Remove dangerous OData operators (case-insensitive)
    lower_value = sanitized.lower()
    for pattern in DANGEROUS_ODATA_OPERATORS:
        if pattern.lower() in lower_value:
            sanitized = re.sub(
                re.escape(pattern),
                ' ',
                sanitized,
                flags=re.IGNORECASE
            )
            logger.warning(
                f"Removed potentially dangerous OData pattern from input: {pattern}"
            )

    # Truncate to max length
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
        logger.warning(f"Truncated OData value to {max_length} characters")

    # Strip whitespace
    return sanitized.strip()


def sanitize_odata_guid(value: Optional[str]) -> Optional[str]:
    """
    Sanitize and validate a GUID value for OData filter queries.

    Args:
        value: The GUID string to sanitize

    Returns:
        Validated GUID string, or None if invalid

    Raises:
        ValueError: If the value is not a valid GUID format
    """
    if value is None:
        return None

    # Clean the value
    cleaned = str(value).strip().lower()

    # Remove any surrounding quotes
    cleaned = cleaned.strip("'\"")

    # Validate GUID format
    if not GUID_PATTERN.match(cleaned):
        raise ValueError(f"Invalid GUID format: {value}")

    return cleaned


def sanitize_odata_identifier(value: Optional[str], max_length: int = 100) -> str:
    """
    Sanitize an identifier (channel name, vertical, etc.) for OData filters.

    More restrictive than sanitize_odata_string - only allows alphanumeric,
    underscore, hyphen, period, and space characters.

    Args:
        value: The identifier to sanitize
        max_length: Maximum allowed length

    Returns:
        Sanitized identifier string

    Raises:
        ValueError: If the identifier contains invalid characters
    """
    if value is None:
        return ""

    sanitized = str(value).strip()

    # Escape single quotes
    sanitized = sanitized.replace("'", "''")

    # Check for valid characters
    # After escaping, check the unescaped version for valid pattern
    unescaped_check = sanitized.replace("''", "X")  # Temp replace escaped quotes
    if not IDENTIFIER_PATTERN.match(unescaped_check) and unescaped_check:
        # Remove invalid characters instead of raising
        sanitized = re.sub(r'[^a-zA-Z0-9_\s\-\.]', '', sanitized)
        logger.warning(f"Removed invalid characters from identifier: {value}")

    # Truncate
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length]

    return sanitized


def sanitize_odata_number(value: Union[int, float, str, None]) -> Optional[float]:
    """
    Sanitize a numeric value for OData filter queries.

    Args:
        value: The numeric value to sanitize

    Returns:
        The value as a float, or None if invalid

    Raises:
        ValueError: If the value cannot be converted to a number
    """
    if value is None:
        return None

    try:
        # Remove any non-numeric characters except . and -
        if isinstance(value, str):
            # Remove currency symbols, commas, etc.
            cleaned = re.sub(r'[^\d.\-]', '', value)
            return float(cleaned)
        return float(value)
    except (ValueError, TypeError) as e:
        raise ValueError(f"Invalid numeric value: {value}") from e


def build_safe_filter(
    field: str,
    operator: str,
    value: str,
    value_type: str = "string"
) -> str:
    """
    Build a safe OData filter expression.

    Args:
        field: The field name (e.g., 'mpa_vertical')
        operator: The OData operator (eq, ne, gt, lt, ge, le)
        value: The value to compare
        value_type: Type of value ('string', 'guid', 'number', 'boolean')

    Returns:
        A safe OData filter expression

    Example:
        >>> build_safe_filter('mpa_vertical', 'eq', "retail")
        "mpa_vertical eq 'retail'"
        >>> build_safe_filter('mpa_budget', 'gt', '50000', 'number')
        "mpa_budget gt 50000"
    """
    # Validate operator
    valid_operators = ['eq', 'ne', 'gt', 'lt', 'ge', 'le']
    if operator not in valid_operators:
        raise ValueError(f"Invalid operator: {operator}. Must be one of {valid_operators}")

    # Validate field name (should only contain alphanumeric and underscore)
    if not re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', field):
        raise ValueError(f"Invalid field name: {field}")

    # Sanitize value based on type
    if value_type == "string":
        safe_value = sanitize_odata_string(value)
        return f"{field} {operator} '{safe_value}'"
    elif value_type == "guid":
        safe_value = sanitize_odata_guid(value)
        return f"{field} {operator} '{safe_value}'"
    elif value_type == "number":
        safe_value = sanitize_odata_number(value)
        return f"{field} {operator} {safe_value}"
    elif value_type == "boolean":
        safe_value = str(value).lower() in ('true', '1', 'yes')
        return f"{field} {operator} {str(safe_value).lower()}"
    else:
        raise ValueError(f"Invalid value_type: {value_type}")


def join_filters(filters: list, operator: str = "and") -> str:
    """
    Safely join multiple filter expressions.

    Args:
        filters: List of filter expressions
        operator: Join operator ('and' or 'or')

    Returns:
        Combined filter expression
    """
    if operator not in ['and', 'or']:
        raise ValueError(f"Invalid join operator: {operator}")

    # Filter out empty strings
    valid_filters = [f for f in filters if f and f.strip()]

    if not valid_filters:
        return ""

    return f" {operator} ".join(valid_filters)


# Convenience functions for common patterns

def eq_string(field: str, value: str) -> str:
    """Build field eq 'value' filter with string sanitization."""
    return build_safe_filter(field, 'eq', value, 'string')


def eq_guid(field: str, value: str) -> str:
    """Build field eq 'value' filter with GUID validation."""
    return build_safe_filter(field, 'eq', value, 'guid')


def eq_number(field: str, value: Union[int, float, str]) -> str:
    """Build field eq value filter for numbers."""
    return build_safe_filter(field, 'eq', str(value), 'number')


def eq_bool(field: str, value: bool) -> str:
    """Build field eq value filter for booleans."""
    return build_safe_filter(field, 'eq', str(value), 'boolean')
