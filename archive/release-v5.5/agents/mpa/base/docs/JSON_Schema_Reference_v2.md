# Media Plan Document JSON Schema v2.0

Version: 2.0.0
Last Updated: 2026-01-02
Status: ACTIVE

## Overview

The Media Planning Agent generates formatted Word documents by calling the GenerateMediaPlanDocument Azure Function. This function uses python-docx to programmatically create comprehensive media plan documents with dynamic budget tiers, channel allocations, and DMA distributions.

## Azure Function Endpoint

Endpoint: POST /api/generate-media-plan-document
Content-Type: application/json
Response: Binary .docx file

## Complete JSON Schema

```json
{
  "metadata": {
    "planName": "string (required)",
    "clientName": "string (required)",
    "preparedBy": "string (required)",
    "preparedDate": "string (required, format: YYYY-MM-DD)",
    "version": "string (required)",
    "campaignObjective": "string (optional)",
    "flightDates": {
      "start": "string (format: YYYY-MM-DD)",
      "end": "string (format: YYYY-MM-DD)"
    }
  },
  "budgetTiers": [
    {
      "tierName": "string (required)",
      "budget": "number (required)",
      "percentage": "number (required)",
      "description": "string (optional)"
    }
  ],
  "channels": [
    {
      "name": "string (required)",
      "allocation": "number (required, percentage)",
      "budget": "number (required)",
      "rationale": "string (optional)",
      "kpis": {
        "cpm": "number (optional)",
        "ctr": "number (optional)",
        "viewability": "number (optional)",
        "vtr": "number (optional)",
        "completionRate": "number (optional)",
        "engagementRate": "number (optional)",
        "listenThroughRate": "number (optional)"
      }
    }
  ],
  "dmaAllocations": [
    {
      "dma": "string (required)",
      "dmaCode": "string (optional)",
      "tier": "string (optional)",
      "budget": "number (required)",
      "percentage": "number (required)",
      "population": "number (optional)",
      "indexScore": "number (optional)"
    }
  ],
  "audiences": [
    {
      "segmentName": "string (required)",
      "description": "string (optional)",
      "size": "number (optional)",
      "reachGoal": "number (optional, percentage)",
      "frequencyTarget": "number (optional)"
    }
  ],
  "performanceTargets": {
    "totalImpressions": "number (optional)",
    "totalReach": "number (optional)",
    "averageFrequency": "number (optional)",
    "brandLiftTarget": "number (optional, percentage)",
    "awarenessLiftTarget": "number (optional, percentage)",
    "estimatedCpm": "number (optional)"
  },
  "behavioralSignals": [
    {
      "signalType": "string (required)",
      "description": "string (optional)",
      "weight": "string (optional, values: High | Medium | Low)"
    }
  ],
  "contextualCategories": [
    {
      "category": "string (required)",
      "relevance": "string (optional, values: High | Medium | Low)",
      "description": "string (optional)"
    }
  ],
  "measurementPlan": {
    "primaryKpis": ["string"],
    "secondaryKpis": ["string"],
    "measurementPartners": ["string"],
    "reportingCadence": "string (optional)"
  }
}
```

## Required Fields

METADATA SECTION (All Required)
- planName: Name of the media plan
- clientName: Client or brand name
- preparedBy: Author or agent name
- preparedDate: Creation date in YYYY-MM-DD format
- version: Plan version number

BUDGET TIERS (At Least One Required)
- tierName: Name of the budget tier
- budget: Dollar amount for the tier
- percentage: Percentage of total budget

CHANNELS (At Least One Required)
- name: Channel name
- allocation: Percentage allocation
- budget: Dollar amount

DMA ALLOCATIONS (At Least One Required)
- dma: DMA market name
- budget: Dollar amount
- percentage: Percentage allocation

## Optional Sections

AUDIENCES
Defines target audience segments with reach and frequency goals.

PERFORMANCE TARGETS
Overall campaign performance objectives and projections.

BEHAVIORAL SIGNALS
Data signals used for targeting.

CONTEXTUAL CATEGORIES
Content categories for contextual targeting.

MEASUREMENT PLAN
KPIs and measurement approach.

## Document Structure

The generated document includes the following sections:

COVER PAGE
- Plan name
- Client name
- Prepared by
- Date and version

EXECUTIVE SUMMARY
- Campaign objective
- Flight dates
- Total budget
- Key channels and markets

BUDGET TIER BREAKDOWN
- Table showing all tiers
- Budget amounts and percentages
- Tier descriptions

CHANNEL ALLOCATION
- Channel-by-channel breakdown
- Budget and percentage per channel
- KPI targets per channel
- Rationale for channel selection

DMA DISTRIBUTION
- Geographic market allocations
- Population and index data
- Tier assignments

AUDIENCE STRATEGY
- Segment definitions
- Reach and frequency targets
- Size estimates

TARGETING APPROACH
- Behavioral signals
- Contextual categories
- Weighting and prioritization

MEASUREMENT FRAMEWORK
- Primary and secondary KPIs
- Measurement partners
- Reporting cadence

## Document Formatting

HEADERS
- Bold section headers
- Professional blue color scheme (#2E75B6)

TABLES
- Blue header rows
- Formatted currency values
- Percentage formatting
- Right-aligned numbers

BUDGET DISPLAY
- Currency formatted with commas
- Two decimal places for percentages
- Totals row at bottom of tables

## Example Payloads

MINIMAL PAYLOAD

```json
{
  "metadata": {
    "planName": "Q1 2026 Campaign",
    "clientName": "Acme Corp",
    "preparedBy": "Media Planning Agent",
    "preparedDate": "2026-01-02",
    "version": "1.0"
  },
  "budgetTiers": [
    {
      "tierName": "National",
      "budget": 500000,
      "percentage": 100
    }
  ],
  "channels": [
    {
      "name": "Programmatic Display",
      "allocation": 100,
      "budget": 500000,
      "kpis": {"cpm": 5.00}
    }
  ],
  "dmaAllocations": [
    {
      "dma": "National",
      "budget": 500000,
      "percentage": 100
    }
  ]
}
```

COMPREHENSIVE PAYLOAD

See: azure_functions/tests/fixtures/test_media_plan_document_payload.json

## Power Automate Integration

CALLING THE FUNCTION

```json
{
  "type": "Http",
  "inputs": {
    "method": "POST",
    "uri": "@{parameters('AzureFunctionsBaseUrl')}/api/generate-media-plan-document",
    "headers": {
      "Content-Type": "application/json",
      "x-functions-key": "@{parameters('FunctionKey')}"
    },
    "body": {
      "metadata": {
        "planName": "@{outputs('Get_Plan')?['body/mpa_plan_name']}",
        "clientName": "@{outputs('Get_Plan')?['body/mpa_client_name']}",
        "preparedBy": "Media Planning Agent",
        "preparedDate": "@{utcNow('yyyy-MM-dd')}",
        "version": "@{outputs('Get_Plan')?['body/mpa_version']}"
      },
      "budgetTiers": "@{variables('budgetTiers')}",
      "channels": "@{variables('channels')}",
      "dmaAllocations": "@{variables('dmaAllocations')}"
    }
  }
}
```

SAVING TO SHAREPOINT

```json
{
  "type": "SharePointOnline",
  "inputs": {
    "operation": "CreateFile",
    "siteUrl": "@{parameters('SharePointSiteUrl')}",
    "folderPath": "/Shared Documents/Media Plans/@{triggerBody()?['planId']}",
    "fileName": "@{variables('planName')}_@{utcNow('yyyyMMdd_HHmmss')}.docx",
    "content": "@{body('Call_GenerateMediaPlanDocument_Function')}"
  }
}
```

## Error Responses

STATUS 400 BAD REQUEST
- Missing required metadata fields
- Empty budgetTiers array
- Empty channels array
- Empty dmaAllocations array
- Invalid date format

STATUS 500 INTERNAL SERVER ERROR
- Document generation failure
- python-docx library error

## Validation Rules

BUDGET VALIDATION
- Total tier percentages should equal 100
- Total channel allocations should equal 100
- DMA percentages should sum appropriately

DATA INTEGRITY
- All budget amounts must be positive numbers
- Percentages must be between 0 and 100
- Dates must be valid YYYY-MM-DD format

## Related Documentation

- azure_functions/mpa_functions/GenerateMediaPlanDocument/__init__.py - Function implementation
- flows/definitions/flow_06_GenerateDocument.json - Flow definition
- flows/specifications/flow_05_MPA_GenerateDocument.json - Flow specification
- azure_functions/tests/fixtures/test_media_plan_document_payload.json - Test payload
