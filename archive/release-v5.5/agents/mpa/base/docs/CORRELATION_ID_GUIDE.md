# Correlation ID Guide

## Overview

Correlation IDs enable end-to-end request tracing across Azure Functions, Power Automate flows, and Dataverse operations. This guide explains how to implement and use correlation IDs in MPA.

## Location

- **Module**: `azure_functions/mpa_functions/shared/correlation.py`

## Why Correlation IDs?

- **Debugging**: Trace a single request through all systems
- **Monitoring**: Track request flow in Application Insights
- **Auditing**: Link audit records to specific operations
- **Support**: Give users a reference ID for issue reports

## ID Format

```
mpa-a1b2c3d4e5f6
```

- Prefix: `mpa-` (identifies Media Planning Agent)
- Suffix: 12-character hex string (unique identifier)

## Quick Start

### Basic Usage

```python
from shared.correlation import (
    get_correlation_id,
    set_correlation_id,
    CorrelatedLogger
)

# Get current ID (generates new if none set)
correlation_id = get_correlation_id()

# Set ID from incoming request
set_correlation_id(request_correlation_id)

# Log with automatic correlation ID
logger = CorrelatedLogger(__name__)
logger.info("Processing request")  # Outputs: [mpa-a1b2c3d4e5f6] Processing request
```

### Decorator Usage

```python
from shared.correlation import with_correlation_id

@with_correlation_id
async def handle_request(req, correlation_id=None):
    # correlation_id is automatically set and passed
    logger.info(f"Handling request {correlation_id}")
```

## Azure Functions Integration

### Extract from Request

```python
from shared.correlation import extract_from_azure_function_request

def main(req: func.HttpRequest) -> func.HttpResponse:
    correlation_id = extract_from_azure_function_request(req)

    # All subsequent operations use this ID
    process_request(req)

    return func.HttpResponse(
        json.dumps({"correlation_id": correlation_id}),
        headers={"X-Correlation-ID": correlation_id}
    )
```

### Context Manager

```python
from shared.correlation import CorrelationMiddleware

middleware = CorrelationMiddleware()

def main(req: func.HttpRequest) -> func.HttpResponse:
    with middleware.context(req) as correlation_id:
        # All operations here have correlation ID set
        result = process_request()
        return create_response(result)
```

## Header Conventions

### Inbound Headers (Extracted)

| Header | Priority |
|--------|----------|
| X-Correlation-ID | 1 |
| x-correlation-id | 2 |
| X-Request-ID | 3 |
| Request-Id | 4 (Azure default) |

### Outbound Headers (Added)

```python
from shared.correlation import create_outbound_headers

headers = create_outbound_headers()
# Returns: {"X-Correlation-ID": "mpa-a1b2c3d4e5f6"}

response = await http_client.get(url, headers=headers)
```

## Logging Integration

### CorrelatedLogger

```python
from shared.correlation import CorrelatedLogger

logger = CorrelatedLogger(__name__)

logger.info("Starting operation")     # [mpa-xxx] Starting operation
logger.error("Operation failed")      # [mpa-xxx] Operation failed
logger.debug("Details", extra={"key": "value"})
```

### Application Insights

Correlation IDs appear in custom dimensions:

```kusto
traces
| where customDimensions.correlation_id == "mpa-a1b2c3d4e5f6"
| order by timestamp asc
```

## Power Automate Integration

### Pass to Flow

Include correlation_id in flow trigger:

```json
{
  "session_id": "session-123",
  "correlation_id": "mpa-a1b2c3d4e5f6",
  "action": "create_plan"
}
```

### Extract in Flow

Add to flow variables:
- `varCorrelationId`: `triggerBody()?['correlation_id']`

### Pass to Functions

Include in HTTP action headers:
```
X-Correlation-ID: @{variables('varCorrelationId')}
```

## Dataverse Integration

### Store in Audit Records

```python
audit_record = {
    "eap_correlation_id": get_correlation_id(),
    "eap_action": "plan_created",
    "eap_session_id": session_id,
    "eap_timestamp": datetime.utcnow().isoformat()
}
await client.create_record("eap_audit", audit_record)
```

### Query by Correlation

```python
filter_query = f"eap_correlation_id eq '{correlation_id}'"
records = await client.query_records("eap_audit", filter_query=filter_query)
```

## Response Inclusion

### In Response Body

```python
from shared.correlation import add_correlation_to_response

response = add_correlation_to_response(
    {"result": "success"},
    include_in_body=True
)
# Returns: {"result": "success", "correlation_id": "mpa-xxx"}
```

### In Response Headers

```python
return func.HttpResponse(
    json.dumps(response),
    headers={
        "X-Correlation-ID": get_correlation_id(),
        "Content-Type": "application/json"
    }
)
```

## Best Practices

1. **Extract Early**: Get correlation ID at function entry point
2. **Propagate Always**: Include in all outbound calls
3. **Log Consistently**: Use CorrelatedLogger throughout
4. **Store for Audit**: Save in Dataverse audit records
5. **Return to User**: Include in response for support reference

## Troubleshooting

### ID Not Propagating

Check that you're setting the ID in context:
```python
set_correlation_id(correlation_id)
```

### Missing in Logs

Ensure using CorrelatedLogger:
```python
logger = CorrelatedLogger(__name__)
```

### Different IDs in Flow

Verify flow is passing ID in HTTP actions:
```
X-Correlation-ID: @{variables('varCorrelationId')}
```

## Example: Full Request Flow

```python
from shared.correlation import (
    extract_from_azure_function_request,
    CorrelatedLogger,
    create_outbound_headers,
    get_correlation_id
)

logger = CorrelatedLogger(__name__)

def main(req: func.HttpRequest) -> func.HttpResponse:
    # 1. Extract correlation ID
    correlation_id = extract_from_azure_function_request(req)
    logger.info("Request received")

    try:
        # 2. Process request
        data = process_data(req.get_json())
        logger.info("Data processed")

        # 3. Call external service with correlation
        headers = create_outbound_headers()
        external_result = call_external_service(headers)

        # 4. Store audit record
        store_audit(correlation_id, "request_completed")

        # 5. Return with correlation ID
        return func.HttpResponse(
            json.dumps({
                "status": "success",
                "correlation_id": correlation_id
            }),
            headers={"X-Correlation-ID": correlation_id}
        )

    except Exception as e:
        logger.error(f"Request failed: {e}")
        raise
```

## Related Documentation

- [Application Insights Dashboard](./APP_INSIGHTS_DASHBOARD.md)
- [Audit Trail Design](../kb/DATA_PROVENANCE_FRAMEWORK_v5_1.txt)
- [Error Responses](./error_responses.py)
