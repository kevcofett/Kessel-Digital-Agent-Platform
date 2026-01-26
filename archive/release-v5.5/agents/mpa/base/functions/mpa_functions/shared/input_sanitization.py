"""
Input Sanitization Utility
Validates and sanitizes all user inputs before processing.

Part of MPA v5.2 security improvements.
"""

import re
import html
import logging
from typing import Any, Dict, List, Optional, Union
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime

logger = logging.getLogger(__name__)


class SanitizationType(Enum):
    """Types of sanitization to apply."""
    TEXT = "text"
    NUMBER = "number"
    INTEGER = "integer"
    EMAIL = "email"
    URL = "url"
    DATE = "date"
    CURRENCY = "currency"
    PERCENTAGE = "percentage"
    GUID = "guid"
    PHONE = "phone"
    IDENTIFIER = "identifier"


@dataclass
class ValidationResult:
    """Result of validation/sanitization."""
    is_valid: bool
    sanitized_value: Any
    original_value: Any
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "is_valid": self.is_valid,
            "sanitized_value": self.sanitized_value,
            "original_value": self.original_value,
            "errors": self.errors,
            "warnings": self.warnings
        }


class InputSanitizer:
    """
    Sanitizes and validates user inputs.

    Features:
    - Type-specific sanitization
    - XSS prevention
    - SQL/OData injection prevention
    - Length limiting
    - Format validation
    """

    # Dangerous patterns to remove (XSS prevention)
    DANGEROUS_PATTERNS = [
        r'<script[^>]*>.*?</script>',  # Script tags
        r'javascript:',                  # JavaScript URLs
        r'on\w+\s*=',                   # Event handlers
        r'data:text/html',              # Data URLs
        r'vbscript:',                   # VBScript URLs
        r'expression\s*\(',             # CSS expressions
    ]

    # Maximum lengths by field type
    MAX_LENGTHS = {
        "text": 1000,
        "name": 200,
        "description": 5000,
        "email": 254,
        "url": 2083,
        "identifier": 100,
        "phone": 20,
    }

    # GUID pattern
    GUID_PATTERN = re.compile(
        r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    )

    # Email pattern (simplified but effective)
    EMAIL_PATTERN = re.compile(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )

    # URL pattern
    URL_PATTERN = re.compile(
        r'^https?://[^\s<>"{}|\\^`\[\]]+$'
    )

    # Identifier pattern (safe for database fields)
    IDENTIFIER_PATTERN = re.compile(
        r'^[a-zA-Z][a-zA-Z0-9_]*$'
    )

    def sanitize(
        self,
        value: Any,
        field_name: str,
        field_type: SanitizationType,
        required: bool = False,
        min_value: Optional[float] = None,
        max_value: Optional[float] = None,
        min_length: Optional[int] = None,
        max_length: Optional[int] = None,
        allowed_values: Optional[List[Any]] = None,
        pattern: Optional[str] = None
    ) -> ValidationResult:
        """
        Sanitize and validate a single input value.

        Args:
            value: The input value to sanitize
            field_name: Name of the field (for error messages)
            field_type: Type of sanitization to apply
            required: Whether the field is required
            min_value: Minimum value for numbers
            max_value: Maximum value for numbers
            min_length: Minimum string length
            max_length: Maximum string length
            allowed_values: List of allowed values (whitelist)
            pattern: Custom regex pattern to match

        Returns:
            ValidationResult with sanitized value and any errors/warnings
        """
        errors = []
        warnings = []

        # Check required
        if value is None or value == "":
            if required:
                errors.append(f"{field_name} is required")
            return ValidationResult(
                is_valid=not required,
                sanitized_value=None,
                original_value=value,
                errors=errors,
                warnings=warnings
            )

        # Type-specific sanitization
        sanitized = value

        if field_type == SanitizationType.TEXT:
            sanitized, text_errors, text_warnings = self._sanitize_text(
                value, max_length, min_length
            )
            errors.extend(text_errors)
            warnings.extend(text_warnings)

        elif field_type == SanitizationType.NUMBER:
            sanitized, num_errors = self._sanitize_number(
                value, min_value, max_value
            )
            errors.extend(num_errors)

        elif field_type == SanitizationType.INTEGER:
            sanitized, int_errors = self._sanitize_integer(
                value, min_value, max_value
            )
            errors.extend(int_errors)

        elif field_type == SanitizationType.EMAIL:
            sanitized, email_errors = self._sanitize_email(value)
            errors.extend(email_errors)

        elif field_type == SanitizationType.URL:
            sanitized, url_errors = self._sanitize_url(value)
            errors.extend(url_errors)

        elif field_type == SanitizationType.CURRENCY:
            sanitized, curr_errors = self._sanitize_currency(
                value, min_value, max_value
            )
            errors.extend(curr_errors)

        elif field_type == SanitizationType.PERCENTAGE:
            sanitized, pct_errors = self._sanitize_percentage(value)
            errors.extend(pct_errors)

        elif field_type == SanitizationType.GUID:
            sanitized, guid_errors = self._sanitize_guid(value)
            errors.extend(guid_errors)

        elif field_type == SanitizationType.DATE:
            sanitized, date_errors = self._sanitize_date(value)
            errors.extend(date_errors)

        elif field_type == SanitizationType.IDENTIFIER:
            sanitized, id_errors = self._sanitize_identifier(value)
            errors.extend(id_errors)

        elif field_type == SanitizationType.PHONE:
            sanitized, phone_errors = self._sanitize_phone(value)
            errors.extend(phone_errors)

        # Check allowed values
        if allowed_values and sanitized not in allowed_values:
            errors.append(f"{field_name} must be one of: {', '.join(str(v) for v in allowed_values)}")

        # Check custom pattern
        if pattern and sanitized and isinstance(sanitized, str):
            if not re.match(pattern, sanitized):
                errors.append(f"{field_name} does not match required format")

        return ValidationResult(
            is_valid=len(errors) == 0,
            sanitized_value=sanitized,
            original_value=value,
            errors=[f"{field_name}: {e}" for e in errors],
            warnings=[f"{field_name}: {w}" for w in warnings]
        )

    def _sanitize_text(
        self,
        value: str,
        max_length: Optional[int] = None,
        min_length: Optional[int] = None
    ) -> tuple[str, List[str], List[str]]:
        """Sanitize text input."""
        errors = []
        warnings = []

        if not isinstance(value, str):
            value = str(value)

        # HTML escape to prevent XSS
        value = html.escape(value)

        # Remove dangerous patterns
        original_len = len(value)
        for pattern in self.DANGEROUS_PATTERNS:
            value = re.sub(pattern, '', value, flags=re.IGNORECASE | re.DOTALL)

        if len(value) < original_len:
            warnings.append("Potentially dangerous content was removed")

        # Normalize whitespace
        value = ' '.join(value.split())

        # Check length
        max_len = max_length or self.MAX_LENGTHS["text"]
        if len(value) > max_len:
            value = value[:max_len]
            warnings.append(f"Truncated to {max_len} characters")

        if min_length and len(value) < min_length:
            errors.append(f"Must be at least {min_length} characters")

        return value.strip(), errors, warnings

    def _sanitize_number(
        self,
        value: Any,
        min_value: Optional[float],
        max_value: Optional[float]
    ) -> tuple[Optional[float], List[str]]:
        """Sanitize numeric input."""
        errors = []

        try:
            # Remove currency symbols and commas
            if isinstance(value, str):
                value = re.sub(r'[$,€£¥₹]', '', value)
                value = value.strip()
            num = float(value)
        except (ValueError, TypeError):
            errors.append("Invalid number format")
            return None, errors

        if min_value is not None and num < min_value:
            errors.append(f"Must be at least {min_value}")
        if max_value is not None and num > max_value:
            errors.append(f"Must be at most {max_value}")

        return num, errors

    def _sanitize_integer(
        self,
        value: Any,
        min_value: Optional[float],
        max_value: Optional[float]
    ) -> tuple[Optional[int], List[str]]:
        """Sanitize integer input."""
        errors = []

        try:
            if isinstance(value, str):
                value = value.strip()
            num = int(float(value))
        except (ValueError, TypeError):
            errors.append("Invalid integer format")
            return None, errors

        if min_value is not None and num < min_value:
            errors.append(f"Must be at least {int(min_value)}")
        if max_value is not None and num > max_value:
            errors.append(f"Must be at most {int(max_value)}")

        return num, errors

    def _sanitize_currency(
        self,
        value: Any,
        min_value: Optional[float],
        max_value: Optional[float]
    ) -> tuple[Optional[float], List[str]]:
        """Sanitize currency input."""
        # Currency is just a number with min 0 by default
        return self._sanitize_number(value, min_value or 0, max_value)

    def _sanitize_percentage(self, value: Any) -> tuple[Optional[float], List[str]]:
        """Sanitize percentage input."""
        errors = []

        try:
            if isinstance(value, str):
                value = value.replace('%', '').strip()
            num = float(value)
        except (ValueError, TypeError):
            errors.append("Invalid percentage format")
            return None, errors

        if num < 0 or num > 100:
            errors.append("Percentage must be between 0 and 100")

        return num, errors

    def _sanitize_email(self, value: str) -> tuple[Optional[str], List[str]]:
        """Sanitize email input."""
        errors = []

        value = str(value).strip().lower()

        if len(value) > self.MAX_LENGTHS["email"]:
            errors.append("Email address too long")
            return None, errors

        if not self.EMAIL_PATTERN.match(value):
            errors.append("Invalid email format")
            return None, errors

        return value, errors

    def _sanitize_url(self, value: str) -> tuple[Optional[str], List[str]]:
        """Sanitize URL input."""
        errors = []

        value = str(value).strip()

        if len(value) > self.MAX_LENGTHS["url"]:
            errors.append("URL too long")
            return None, errors

        # Ensure protocol
        if not value.startswith(('http://', 'https://')):
            value = 'https://' + value

        if not self.URL_PATTERN.match(value):
            errors.append("Invalid URL format")
            return None, errors

        return value, errors

    def _sanitize_guid(self, value: str) -> tuple[Optional[str], List[str]]:
        """Sanitize GUID/UUID input."""
        errors = []

        value = str(value).strip().lower()

        if not self.GUID_PATTERN.match(value):
            errors.append("Invalid GUID format")
            return None, errors

        return value, errors

    def _sanitize_date(self, value: Any) -> tuple[Optional[str], List[str]]:
        """Sanitize date input."""
        errors = []

        if isinstance(value, datetime):
            return value.isoformat(), errors

        if isinstance(value, str):
            value = value.strip()

            # Try common date formats
            formats = [
                "%Y-%m-%d",
                "%Y-%m-%dT%H:%M:%S",
                "%Y-%m-%dT%H:%M:%SZ",
                "%Y-%m-%dT%H:%M:%S.%f",
                "%m/%d/%Y",
                "%d/%m/%Y",
            ]

            for fmt in formats:
                try:
                    parsed = datetime.strptime(value, fmt)
                    return parsed.isoformat(), errors
                except ValueError:
                    continue

        errors.append("Invalid date format")
        return None, errors

    def _sanitize_identifier(self, value: str) -> tuple[Optional[str], List[str]]:
        """Sanitize identifier input (safe for database field names)."""
        errors = []

        value = str(value).strip()

        if len(value) > self.MAX_LENGTHS["identifier"]:
            errors.append("Identifier too long")
            return None, errors

        if not self.IDENTIFIER_PATTERN.match(value):
            errors.append("Identifier must start with letter and contain only letters, numbers, underscores")
            return None, errors

        return value, errors

    def _sanitize_phone(self, value: str) -> tuple[Optional[str], List[str]]:
        """Sanitize phone number input."""
        errors = []

        value = str(value).strip()

        # Remove common formatting characters
        cleaned = re.sub(r'[\s\-\.\(\)]', '', value)

        # Should be mostly digits with optional leading +
        if not re.match(r'^\+?\d{7,15}$', cleaned):
            errors.append("Invalid phone number format")
            return None, errors

        return cleaned, errors

    def sanitize_request(
        self,
        request: Dict[str, Any],
        schema: Dict[str, Dict]
    ) -> Dict[str, ValidationResult]:
        """
        Sanitize an entire request against a schema.

        Args:
            request: The request data to sanitize
            schema: Schema defining field types and constraints

        Returns:
            Dictionary of field names to ValidationResults
        """
        results = {}

        for field_name, field_config in schema.items():
            value = request.get(field_name)

            field_type_str = field_config.get("type", "text")
            try:
                field_type = SanitizationType(field_type_str)
            except ValueError:
                field_type = SanitizationType.TEXT

            results[field_name] = self.sanitize(
                value=value,
                field_name=field_name,
                field_type=field_type,
                required=field_config.get("required", False),
                min_value=field_config.get("min"),
                max_value=field_config.get("max"),
                min_length=field_config.get("min_length"),
                max_length=field_config.get("max_length"),
                allowed_values=field_config.get("allowed_values"),
                pattern=field_config.get("pattern")
            )

        return results

    def is_request_valid(self, results: Dict[str, ValidationResult]) -> bool:
        """Check if all validation results are valid."""
        return all(r.is_valid for r in results.values())

    def get_errors(self, results: Dict[str, ValidationResult]) -> List[str]:
        """Get all errors from validation results."""
        errors = []
        for result in results.values():
            errors.extend(result.errors)
        return errors

    def get_sanitized_data(self, results: Dict[str, ValidationResult]) -> Dict[str, Any]:
        """Get sanitized data from validation results."""
        return {
            field_name: result.sanitized_value
            for field_name, result in results.items()
        }


# Singleton instance
_sanitizer: Optional[InputSanitizer] = None


def get_input_sanitizer() -> InputSanitizer:
    """Get singleton input sanitizer instance."""
    global _sanitizer
    if _sanitizer is None:
        _sanitizer = InputSanitizer()
    return _sanitizer
