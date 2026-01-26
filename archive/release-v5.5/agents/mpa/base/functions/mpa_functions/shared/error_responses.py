"""
Structured Error Response Schema
Provides consistent error format across all APIs.

Part of MPA v5.2 standardization improvements.
"""

import logging
from dataclasses import dataclass, asdict, field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)


class ErrorCategory(Enum):
    """Categories of errors for routing and handling."""
    VALIDATION = "validation"
    AUTHENTICATION = "authentication"
    AUTHORIZATION = "authorization"
    NOT_FOUND = "not_found"
    CONFLICT = "conflict"
    RATE_LIMIT = "rate_limit"
    EXTERNAL_SERVICE = "external_service"
    INTERNAL = "internal"
    TIMEOUT = "timeout"
    BAD_REQUEST = "bad_request"


class ErrorCodes:
    """
    Standard error codes for MPA.

    Format: MPA-{HTTP_STATUS}-{SEQUENCE}

    Ranges:
    - 400: Validation/bad request errors
    - 401: Authentication errors
    - 403: Authorization errors
    - 404: Not found errors
    - 409: Conflict errors
    - 429: Rate limit errors
    - 500: Internal errors
    - 502: External service errors
    - 504: Timeout errors
    """

    # Validation errors (400)
    INVALID_INPUT = "MPA-400-001"
    MISSING_REQUIRED_FIELD = "MPA-400-002"
    INVALID_FORMAT = "MPA-400-003"
    VALUE_OUT_OF_RANGE = "MPA-400-004"
    INVALID_JSON = "MPA-400-005"
    INVALID_QUERY_PARAMETER = "MPA-400-006"
    INVALID_BUDGET = "MPA-400-007"
    INVALID_DATE_RANGE = "MPA-400-008"

    # Authentication errors (401)
    UNAUTHORIZED = "MPA-401-001"
    TOKEN_EXPIRED = "MPA-401-002"
    INVALID_TOKEN = "MPA-401-003"
    MISSING_TOKEN = "MPA-401-004"

    # Authorization errors (403)
    FORBIDDEN = "MPA-403-001"
    INSUFFICIENT_PERMISSIONS = "MPA-403-002"
    CLIENT_ACCESS_DENIED = "MPA-403-003"

    # Not found errors (404)
    SESSION_NOT_FOUND = "MPA-404-001"
    PLAN_NOT_FOUND = "MPA-404-002"
    CLIENT_NOT_FOUND = "MPA-404-003"
    CHANNEL_NOT_FOUND = "MPA-404-004"
    BENCHMARK_NOT_FOUND = "MPA-404-005"
    RESOURCE_NOT_FOUND = "MPA-404-006"

    # Conflict errors (409)
    DUPLICATE_SESSION = "MPA-409-001"
    PLAN_ALREADY_FINALIZED = "MPA-409-002"
    CONCURRENT_MODIFICATION = "MPA-409-003"
    DUPLICATE_RECORD = "MPA-409-004"

    # Rate limit errors (429)
    RATE_LIMIT_EXCEEDED = "MPA-429-001"
    TOO_MANY_REQUESTS = "MPA-429-002"

    # Internal errors (500)
    INTERNAL_ERROR = "MPA-500-001"
    DATABASE_ERROR = "MPA-500-002"
    CONFIGURATION_ERROR = "MPA-500-003"
    UNEXPECTED_ERROR = "MPA-500-004"

    # External service errors (502)
    EXTERNAL_API_FAILED = "MPA-502-001"
    DATAVERSE_ERROR = "MPA-502-002"
    SHAREPOINT_ERROR = "MPA-502-003"
    THIRD_PARTY_ERROR = "MPA-502-004"

    # Timeout errors (504)
    EXTERNAL_API_TIMEOUT = "MPA-504-001"
    OPERATION_TIMEOUT = "MPA-504-002"


@dataclass
class ErrorDetail:
    """Detail about a specific error (e.g., field validation error)."""
    field: str
    message: str
    code: str
    value: Optional[Any] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        result = {
            "field": self.field,
            "message": self.message,
            "code": self.code
        }
        if self.value is not None:
            result["value"] = str(self.value)
        return result


@dataclass
class ErrorResponse:
    """Standardized error response structure."""
    error_code: str
    message: str
    category: str
    correlation_id: str
    timestamp: str
    details: List[Dict[str, Any]] = field(default_factory=list)
    help_url: Optional[str] = None
    retry_after: Optional[int] = None
    request_id: Optional[str] = None

    @classmethod
    def create(
        cls,
        code: str,
        message: str,
        category: ErrorCategory,
        correlation_id: str,
        details: Optional[List[ErrorDetail]] = None,
        help_url: Optional[str] = None,
        retry_after: Optional[int] = None,
        request_id: Optional[str] = None
    ) -> 'ErrorResponse':
        """Create an error response with defaults."""
        return cls(
            error_code=code,
            message=message,
            category=category.value,
            correlation_id=correlation_id,
            timestamp=datetime.utcnow().isoformat() + "Z",
            details=[d.to_dict() for d in details] if details else [],
            help_url=help_url,
            retry_after=retry_after,
            request_id=request_id
        )

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary, removing None values."""
        result = asdict(self)
        return {k: v for k, v in result.items() if v is not None and v != []}

    def to_json_response(self, status_code: int = 500) -> Dict[str, Any]:
        """Convert to format suitable for HTTP response."""
        return {
            "status_code": status_code,
            "body": self.to_dict()
        }


# Error code to HTTP status mapping
ERROR_CODE_TO_STATUS: Dict[str, int] = {
    # 400 errors
    ErrorCodes.INVALID_INPUT: 400,
    ErrorCodes.MISSING_REQUIRED_FIELD: 400,
    ErrorCodes.INVALID_FORMAT: 400,
    ErrorCodes.VALUE_OUT_OF_RANGE: 400,
    ErrorCodes.INVALID_JSON: 400,
    ErrorCodes.INVALID_QUERY_PARAMETER: 400,
    ErrorCodes.INVALID_BUDGET: 400,
    ErrorCodes.INVALID_DATE_RANGE: 400,

    # 401 errors
    ErrorCodes.UNAUTHORIZED: 401,
    ErrorCodes.TOKEN_EXPIRED: 401,
    ErrorCodes.INVALID_TOKEN: 401,
    ErrorCodes.MISSING_TOKEN: 401,

    # 403 errors
    ErrorCodes.FORBIDDEN: 403,
    ErrorCodes.INSUFFICIENT_PERMISSIONS: 403,
    ErrorCodes.CLIENT_ACCESS_DENIED: 403,

    # 404 errors
    ErrorCodes.SESSION_NOT_FOUND: 404,
    ErrorCodes.PLAN_NOT_FOUND: 404,
    ErrorCodes.CLIENT_NOT_FOUND: 404,
    ErrorCodes.CHANNEL_NOT_FOUND: 404,
    ErrorCodes.BENCHMARK_NOT_FOUND: 404,
    ErrorCodes.RESOURCE_NOT_FOUND: 404,

    # 409 errors
    ErrorCodes.DUPLICATE_SESSION: 409,
    ErrorCodes.PLAN_ALREADY_FINALIZED: 409,
    ErrorCodes.CONCURRENT_MODIFICATION: 409,
    ErrorCodes.DUPLICATE_RECORD: 409,

    # 429 errors
    ErrorCodes.RATE_LIMIT_EXCEEDED: 429,
    ErrorCodes.TOO_MANY_REQUESTS: 429,

    # 500 errors
    ErrorCodes.INTERNAL_ERROR: 500,
    ErrorCodes.DATABASE_ERROR: 500,
    ErrorCodes.CONFIGURATION_ERROR: 500,
    ErrorCodes.UNEXPECTED_ERROR: 500,

    # 502 errors
    ErrorCodes.EXTERNAL_API_FAILED: 502,
    ErrorCodes.DATAVERSE_ERROR: 502,
    ErrorCodes.SHAREPOINT_ERROR: 502,
    ErrorCodes.THIRD_PARTY_ERROR: 502,

    # 504 errors
    ErrorCodes.EXTERNAL_API_TIMEOUT: 504,
    ErrorCodes.OPERATION_TIMEOUT: 504,
}


def get_status_code(error_code: str) -> int:
    """Get HTTP status code for an error code."""
    return ERROR_CODE_TO_STATUS.get(error_code, 500)


# Factory functions for common errors

def create_validation_error(
    correlation_id: str,
    details: List[ErrorDetail],
    message: str = "Request validation failed"
) -> ErrorResponse:
    """Create a validation error response."""
    return ErrorResponse.create(
        code=ErrorCodes.INVALID_INPUT,
        message=message,
        category=ErrorCategory.VALIDATION,
        correlation_id=correlation_id,
        details=details,
        help_url="https://docs.mpa.example.com/errors/validation"
    )


def create_not_found_error(
    correlation_id: str,
    resource_type: str,
    resource_id: str
) -> ErrorResponse:
    """Create a not found error response."""
    code_map = {
        "session": ErrorCodes.SESSION_NOT_FOUND,
        "plan": ErrorCodes.PLAN_NOT_FOUND,
        "client": ErrorCodes.CLIENT_NOT_FOUND,
        "channel": ErrorCodes.CHANNEL_NOT_FOUND,
        "benchmark": ErrorCodes.BENCHMARK_NOT_FOUND,
    }
    code = code_map.get(resource_type.lower(), ErrorCodes.RESOURCE_NOT_FOUND)

    return ErrorResponse.create(
        code=code,
        message=f"{resource_type.title()} not found: {resource_id}",
        category=ErrorCategory.NOT_FOUND,
        correlation_id=correlation_id
    )


def create_unauthorized_error(
    correlation_id: str,
    message: str = "Authentication required"
) -> ErrorResponse:
    """Create an unauthorized error response."""
    return ErrorResponse.create(
        code=ErrorCodes.UNAUTHORIZED,
        message=message,
        category=ErrorCategory.AUTHENTICATION,
        correlation_id=correlation_id,
        help_url="https://docs.mpa.example.com/auth"
    )


def create_forbidden_error(
    correlation_id: str,
    message: str = "Access denied"
) -> ErrorResponse:
    """Create a forbidden error response."""
    return ErrorResponse.create(
        code=ErrorCodes.FORBIDDEN,
        message=message,
        category=ErrorCategory.AUTHORIZATION,
        correlation_id=correlation_id
    )


def create_conflict_error(
    correlation_id: str,
    message: str,
    code: str = ErrorCodes.CONCURRENT_MODIFICATION
) -> ErrorResponse:
    """Create a conflict error response."""
    return ErrorResponse.create(
        code=code,
        message=message,
        category=ErrorCategory.CONFLICT,
        correlation_id=correlation_id
    )


def create_rate_limit_error(
    correlation_id: str,
    retry_after: int = 60
) -> ErrorResponse:
    """Create a rate limit error response."""
    return ErrorResponse.create(
        code=ErrorCodes.RATE_LIMIT_EXCEEDED,
        message="Rate limit exceeded. Please try again later.",
        category=ErrorCategory.RATE_LIMIT,
        correlation_id=correlation_id,
        retry_after=retry_after
    )


def create_external_service_error(
    correlation_id: str,
    service_name: str,
    error_message: str
) -> ErrorResponse:
    """Create an external service error response."""
    return ErrorResponse.create(
        code=ErrorCodes.EXTERNAL_API_FAILED,
        message=f"External service '{service_name}' failed: {error_message}",
        category=ErrorCategory.EXTERNAL_SERVICE,
        correlation_id=correlation_id
    )


def create_internal_error(
    correlation_id: str,
    message: str = "An internal error occurred"
) -> ErrorResponse:
    """Create an internal error response."""
    return ErrorResponse.create(
        code=ErrorCodes.INTERNAL_ERROR,
        message=message,
        category=ErrorCategory.INTERNAL,
        correlation_id=correlation_id,
        help_url="https://docs.mpa.example.com/support"
    )


def create_timeout_error(
    correlation_id: str,
    operation: str = "Operation"
) -> ErrorResponse:
    """Create a timeout error response."""
    return ErrorResponse.create(
        code=ErrorCodes.OPERATION_TIMEOUT,
        message=f"{operation} timed out. Please try again.",
        category=ErrorCategory.TIMEOUT,
        correlation_id=correlation_id,
        retry_after=30
    )


class MPAException(Exception):
    """Base exception for MPA errors with structured response."""

    def __init__(
        self,
        error_response: ErrorResponse,
        status_code: Optional[int] = None
    ):
        self.error_response = error_response
        self.status_code = status_code or get_status_code(error_response.error_code)
        super().__init__(error_response.message)

    def to_response(self) -> Dict[str, Any]:
        """Convert to HTTP response format."""
        return self.error_response.to_json_response(self.status_code)


class ValidationException(MPAException):
    """Raised for validation errors."""

    def __init__(
        self,
        correlation_id: str,
        details: List[ErrorDetail],
        message: str = "Request validation failed"
    ):
        error_response = create_validation_error(correlation_id, details, message)
        super().__init__(error_response, 400)


class NotFoundException(MPAException):
    """Raised when a resource is not found."""

    def __init__(
        self,
        correlation_id: str,
        resource_type: str,
        resource_id: str
    ):
        error_response = create_not_found_error(correlation_id, resource_type, resource_id)
        super().__init__(error_response, 404)


class UnauthorizedException(MPAException):
    """Raised for authentication errors."""

    def __init__(
        self,
        correlation_id: str,
        message: str = "Authentication required"
    ):
        error_response = create_unauthorized_error(correlation_id, message)
        super().__init__(error_response, 401)


class ForbiddenException(MPAException):
    """Raised for authorization errors."""

    def __init__(
        self,
        correlation_id: str,
        message: str = "Access denied"
    ):
        error_response = create_forbidden_error(correlation_id, message)
        super().__init__(error_response, 403)
