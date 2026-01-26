# PII Redaction Integration Guide

## Overview

The `pii_redaction` module provides automatic redaction of Personally Identifiable Information (PII) from log messages and data contexts. This ensures compliance with privacy regulations (GDPR, CCPA, etc.) by preventing sensitive data from appearing in Application Insights and other logs.

## Quick Start

### Basic Text Redaction

```python
from shared.pii_redaction import redact_pii

# Redact PII from any text
safe_text = redact_pii("Contact john@example.com or call 555-123-4567")
# Result: "Contact [EMAIL_REDACTED] or call [PHONE_REDACTED]"
```

### Safe Logging Context

```python
from shared.pii_redaction import create_safe_log_context

# Create a safe copy of request data for logging
safe_context = create_safe_log_context({
    "user_email": "john@example.com",
    "phone": "555-123-4567",
    "plan_id": "plan-123"  # Non-sensitive, kept as-is
})
# Result: {
#     "user_email": "[FIELD_REDACTED]",
#     "phone": "[FIELD_REDACTED]",
#     "plan_id": "plan-123"
# }
```

### Auto-Redacting Logger

```python
from shared.pii_redaction import wrap_logger
import logging

logger = logging.getLogger(__name__)
safe_logger = wrap_logger(logger)

# All log messages are automatically redacted
safe_logger.info("User email: john@example.com")
# Logs: "User email: [EMAIL_REDACTED]"
```

## Integration into Existing Functions

### Step 1: Import the Module

Add to your function's imports:

```python
from ..shared.pii_redaction import (
    redact_pii,
    create_safe_log_context,
    wrap_logger
)
```

### Step 2: Wrap Your Logger

At the top of your function:

```python
logger = logging.getLogger(__name__)
safe_logger = wrap_logger(logger)

def main(req: func.HttpRequest) -> func.HttpResponse:
    safe_logger.info("Processing request...")  # Auto-redacted
```

### Step 3: Safe Context Logging

When logging request/response data:

```python
def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()

        # Log request safely
        safe_logger.info(f"Request received: {create_safe_log_context(req_body)}")

        # ... process request ...

        # Log response safely
        safe_logger.info(f"Response: {create_safe_log_context(result)}")

    except Exception as e:
        # Error messages are auto-redacted
        safe_logger.error(f"Error processing request: {str(e)}")
```

## Redaction Patterns

### Default Patterns

| Pattern | Replacement | Example |
|---------|-------------|---------|
| Email addresses | `[EMAIL_REDACTED]` | `john@example.com` |
| Phone numbers | `[PHONE_REDACTED]` | `555-123-4567`, `+1 (555) 123-4567` |
| SSN | `[SSN_REDACTED]` | `123-45-6789` |
| Credit cards | `[CC_REDACTED]` | `4111-1111-1111-1111` |
| IP addresses | `[IP_REDACTED]` | `192.168.1.1` |
| API keys (32+ chars) | `[KEY_REDACTED]` | Long alphanumeric strings |

### Sensitive Field Names

Dictionary keys containing these terms are automatically redacted:

- `password`, `secret`, `token`, `api_key`
- `ssn`, `social_security`, `tax_id`
- `credit_card`, `card_number`, `cvv`
- `email`, `phone`, `mobile`
- `address`, `street`, `city`, `zip`
- `dob`, `date_of_birth`
- `ip_address`, `user_agent`

### Custom Patterns

Add custom patterns via environment variable:

```bash
# Format: pattern::replacement|pattern2::replacement2
export MPA_REDACT_PATTERNS="CompanyName::[COMPANY_REDACTED]|Project\d+::[PROJECT_REDACTED]"
```

### Client Name Redaction

Redact specific client names:

```python
from shared.pii_redaction import redact_client_name

# Via function parameter
safe_text = redact_client_name("Plan for Acme Corp", ["Acme Corp"])
# Result: "Plan for [CLIENT_REDACTED]"

# Via environment variable
# export MPA_CLIENT_NAMES="Acme Corp,Widget Inc,GlobalTech"
safe_text = redact_client_name("Plan for Acme Corp")
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MPA_REDACT_PATTERNS` | Custom regex patterns | `pattern::replacement\|pattern2::replacement2` |
| `MPA_CLIENT_NAMES` | Client names to redact | `Acme Corp,Widget Inc` |

## Example: Full Function Integration

```python
"""Example Azure Function with PII Redaction"""

import azure.functions as func
import json
import logging
from ..shared.pii_redaction import wrap_logger, create_safe_log_context

# Wrap logger at module level
_logger = logging.getLogger(__name__)
logger = wrap_logger(_logger)


def main(req: func.HttpRequest) -> func.HttpResponse:
    """Process request with automatic PII redaction in logs."""
    logger.info("Function triggered")

    try:
        req_body = req.get_json()

        # Log request with PII redacted
        logger.info(f"Processing request: {create_safe_log_context(req_body)}")

        # Process the request...
        result = process_data(req_body)

        # Log result safely
        logger.info(f"Request completed: {create_safe_log_context(result)}")

        return func.HttpResponse(
            json.dumps(result),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        # Error logging is automatically redacted
        logger.error(f"Error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json"
        )
```

## Best Practices

1. **Always use `wrap_logger`** - Never log directly with the standard logger in production code

2. **Use `create_safe_log_context` for objects** - When logging dictionaries, lists, or complex objects

3. **Set client names via environment** - Use `MPA_CLIENT_NAMES` to automatically redact client identifiers

4. **Test your patterns** - Use `get_redaction_patterns()` to verify configured patterns

5. **Don't log raw request bodies** - Always pass through redaction first

## Testing

```python
from shared.pii_redaction import redact_pii, get_redaction_patterns

# Test basic redaction
assert "[EMAIL_REDACTED]" in redact_pii("test@example.com")
assert "[PHONE_REDACTED]" in redact_pii("555-123-4567")

# View all patterns
patterns = get_redaction_patterns()
for p in patterns:
    print(f"{p['source']}: {p['pattern']} -> {p['replacement']}")
```

## Troubleshooting

### Patterns Not Working

1. Check pattern syntax with `get_redaction_patterns()`
2. Clear cache if patterns changed: `clear_pattern_cache()`
3. Verify environment variables are set

### Too Much Redaction

- Review `SENSITIVE_FIELD_NAMES` list
- Check for overly broad custom patterns
- Use more specific regex patterns

### Not Enough Redaction

- Add custom patterns via `MPA_REDACT_PATTERNS`
- Add client names to `MPA_CLIENT_NAMES`
- Report missing patterns for future default inclusion

## Related Documentation

- [MPA Security Guidelines](../../docs/SECURITY_GUIDELINES.md)
- [Application Insights Logging](../../docs/MONITORING_SETUP.md)
- [GDPR Compliance](../../docs/COMPLIANCE.md)
