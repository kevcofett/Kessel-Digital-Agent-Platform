# MASTERCARD CORPORATE EXTENSIONS GUIDE

## Overview

Extensions are Mastercard-specific customizations that augment the base MPA v5.5 functionality. Extensions live in `/extensions/` directories and NEVER modify or override `/base/` content. This architecture allows Mastercard to maintain custom features while still receiving base platform updates.

**Key Principle:** Extensions ADD functionality. They never REPLACE base functionality.

---

## PART 1: EXTENSION ARCHITECTURE

### 1.1 Directory Structure

```
release/v5.5/
├── platform/
│   ├── eap-core/
│   │   ├── base/                    # Shared across all deployments
│   │   │   ├── schema/
│   │   │   ├── flows/
│   │   │   └── seed-data/
│   │   └── extensions/              # Mastercard-specific
│   │       ├── access-control/      # Hierarchy tables
│   │       ├── data-sources/        # Confluence, internal systems
│   │       └── audit/               # Enhanced audit logging
│   └── security/
│       ├── base/
│       └── extensions/
│           └── data-classification/ # Data classification labels
└── agents/
    └── mpa/
        ├── base/                    # Shared MPA components
        │   ├── kb/
        │   ├── flows/
        │   └── copilot/
        └── extensions/              # Mastercard-specific
            ├── benchmarks/          # Mastercard-specific benchmarks
            └── templates/           # Mastercard document templates
```

### 1.2 Extension Naming Conventions

| Component Type | Base Pattern | Extension Pattern |
|---------------|--------------|-------------------|
| Tables | eap_[name] or mpa_[name] | eap_mc_[name] or mpa_mc_[name] |
| Flows | [Agent] - [Flow Name] | [Agent] - MC - [Flow Name] |
| KB Files | [NAME]_v5_5.txt | [NAME]_mc_v5_5.txt |
| Config Files | [name].json | [name].mastercard.json |
| Functions | [FunctionName] | MC[FunctionName] |

The `mc` prefix indicates Mastercard-specific components.

### 1.3 Extension Loading Order

1. Base components load first
2. Extensions load second and augment base
3. Feature flags control which extensions are active
4. Extensions can be disabled without affecting base functionality

---

## PART 2: ACCESS CONTROL EXTENSION

### 2.1 Purpose

Implement Mastercard's organizational hierarchy for row-level security:

```
Business Unit
    └── Department
            └── Team
                    └── Pod
                            └── Employee
```

This hierarchy ensures users only see data within their organizational scope.

### 2.2 Table Schemas

#### eap_mc_businessunit

```json
{
  "schemaName": "eap_mc_businessunit",
  "displayName": "Business Unit",
  "description": "Top-level organizational unit in Mastercard hierarchy",
  "pluralName": "Business Units",
  "primaryColumn": "name",
  "columns": [
    {
      "schemaName": "businessunit_id",
      "displayName": "Business Unit ID",
      "type": "string",
      "required": true,
      "maxLength": 50,
      "description": "Unique identifier for the business unit"
    },
    {
      "schemaName": "name",
      "displayName": "Name",
      "type": "string",
      "required": true,
      "maxLength": 200,
      "description": "Business unit display name"
    },
    {
      "schemaName": "code",
      "displayName": "Code",
      "type": "string",
      "required": true,
      "maxLength": 20,
      "description": "Short code for the business unit"
    },
    {
      "schemaName": "description",
      "displayName": "Description",
      "type": "text",
      "maxLength": 2000,
      "description": "Business unit description"
    },
    {
      "schemaName": "leader_email",
      "displayName": "Leader Email",
      "type": "string",
      "maxLength": 200,
      "description": "Email of business unit leader"
    },
    {
      "schemaName": "is_active",
      "displayName": "Is Active",
      "type": "boolean",
      "default": true,
      "description": "Whether this business unit is active"
    },
    {
      "schemaName": "created_at",
      "displayName": "Created At",
      "type": "datetime",
      "description": "Record creation timestamp"
    },
    {
      "schemaName": "modified_at",
      "displayName": "Modified At",
      "type": "datetime",
      "description": "Record last modification timestamp"
    }
  ]
}
```

#### eap_mc_department

```json
{
  "schemaName": "eap_mc_department",
  "displayName": "Department",
  "description": "Department within a business unit",
  "pluralName": "Departments",
  "primaryColumn": "name",
  "columns": [
    {
      "schemaName": "department_id",
      "displayName": "Department ID",
      "type": "string",
      "required": true,
      "maxLength": 50,
      "description": "Unique identifier for the department"
    },
    {
      "schemaName": "businessunit_id",
      "displayName": "Business Unit",
      "type": "lookup",
      "target": "eap_mc_businessunit",
      "required": true,
      "description": "Parent business unit"
    },
    {
      "schemaName": "name",
      "displayName": "Name",
      "type": "string",
      "required": true,
      "maxLength": 200,
      "description": "Department display name"
    },
    {
      "schemaName": "code",
      "displayName": "Code",
      "type": "string",
      "required": true,
      "maxLength": 20,
      "description": "Short code for the department"
    },
    {
      "schemaName": "description",
      "displayName": "Description",
      "type": "text",
      "maxLength": 2000,
      "description": "Department description"
    },
    {
      "schemaName": "leader_email",
      "displayName": "Leader Email",
      "type": "string",
      "maxLength": 200,
      "description": "Email of department leader"
    },
    {
      "schemaName": "is_active",
      "displayName": "Is Active",
      "type": "boolean",
      "default": true,
      "description": "Whether this department is active"
    },
    {
      "schemaName": "created_at",
      "displayName": "Created At",
      "type": "datetime",
      "description": "Record creation timestamp"
    },
    {
      "schemaName": "modified_at",
      "displayName": "Modified At",
      "type": "datetime",
      "description": "Record last modification timestamp"
    }
  ]
}
```

#### eap_mc_team

```json
{
  "schemaName": "eap_mc_team",
  "displayName": "Team",
  "description": "Team within a department",
  "pluralName": "Teams",
  "primaryColumn": "name",
  "columns": [
    {
      "schemaName": "team_id",
      "displayName": "Team ID",
      "type": "string",
      "required": true,
      "maxLength": 50,
      "description": "Unique identifier for the team"
    },
    {
      "schemaName": "department_id",
      "displayName": "Department",
      "type": "lookup",
      "target": "eap_mc_department",
      "required": true,
      "description": "Parent department"
    },
    {
      "schemaName": "name",
      "displayName": "Name",
      "type": "string",
      "required": true,
      "maxLength": 200,
      "description": "Team display name"
    },
    {
      "schemaName": "code",
      "displayName": "Code",
      "type": "string",
      "required": true,
      "maxLength": 20,
      "description": "Short code for the team"
    },
    {
      "schemaName": "description",
      "displayName": "Description",
      "type": "text",
      "maxLength": 2000,
      "description": "Team description"
    },
    {
      "schemaName": "leader_email",
      "displayName": "Leader Email",
      "type": "string",
      "maxLength": 200,
      "description": "Email of team leader"
    },
    {
      "schemaName": "is_active",
      "displayName": "Is Active",
      "type": "boolean",
      "default": true,
      "description": "Whether this team is active"
    },
    {
      "schemaName": "created_at",
      "displayName": "Created At",
      "type": "datetime",
      "description": "Record creation timestamp"
    },
    {
      "schemaName": "modified_at",
      "displayName": "Modified At",
      "type": "datetime",
      "description": "Record last modification timestamp"
    }
  ]
}
```

#### eap_mc_pod

```json
{
  "schemaName": "eap_mc_pod",
  "displayName": "Pod",
  "description": "Pod within a team (smallest organizational unit above individual)",
  "pluralName": "Pods",
  "primaryColumn": "name",
  "columns": [
    {
      "schemaName": "pod_id",
      "displayName": "Pod ID",
      "type": "string",
      "required": true,
      "maxLength": 50,
      "description": "Unique identifier for the pod"
    },
    {
      "schemaName": "team_id",
      "displayName": "Team",
      "type": "lookup",
      "target": "eap_mc_team",
      "required": true,
      "description": "Parent team"
    },
    {
      "schemaName": "name",
      "displayName": "Name",
      "type": "string",
      "required": true,
      "maxLength": 200,
      "description": "Pod display name"
    },
    {
      "schemaName": "code",
      "displayName": "Code",
      "type": "string",
      "required": true,
      "maxLength": 20,
      "description": "Short code for the pod"
    },
    {
      "schemaName": "description",
      "displayName": "Description",
      "type": "text",
      "maxLength": 2000,
      "description": "Pod description"
    },
    {
      "schemaName": "leader_email",
      "displayName": "Leader Email",
      "type": "string",
      "maxLength": 200,
      "description": "Email of pod leader"
    },
    {
      "schemaName": "is_active",
      "displayName": "Is Active",
      "type": "boolean",
      "default": true,
      "description": "Whether this pod is active"
    },
    {
      "schemaName": "created_at",
      "displayName": "Created At",
      "type": "datetime",
      "description": "Record creation timestamp"
    },
    {
      "schemaName": "modified_at",
      "displayName": "Modified At",
      "type": "datetime",
      "description": "Record last modification timestamp"
    }
  ]
}
```

#### eap_mc_employee_assignment

```json
{
  "schemaName": "eap_mc_employee_assignment",
  "displayName": "Employee Assignment",
  "description": "Maps employees to organizational hierarchy",
  "pluralName": "Employee Assignments",
  "primaryColumn": "user_email",
  "columns": [
    {
      "schemaName": "assignment_id",
      "displayName": "Assignment ID",
      "type": "string",
      "required": true,
      "maxLength": 50,
      "description": "Unique identifier for the assignment"
    },
    {
      "schemaName": "user_id",
      "displayName": "User",
      "type": "lookup",
      "target": "eap_users",
      "required": true,
      "description": "Reference to EAP user record"
    },
    {
      "schemaName": "user_email",
      "displayName": "User Email",
      "type": "string",
      "required": true,
      "maxLength": 200,
      "description": "User email address (for quick lookup)"
    },
    {
      "schemaName": "pod_id",
      "displayName": "Pod",
      "type": "lookup",
      "target": "eap_mc_pod",
      "description": "Assigned pod (most granular)"
    },
    {
      "schemaName": "team_id",
      "displayName": "Team",
      "type": "lookup",
      "target": "eap_mc_team",
      "description": "Assigned team (derived or direct)"
    },
    {
      "schemaName": "department_id",
      "displayName": "Department",
      "type": "lookup",
      "target": "eap_mc_department",
      "description": "Assigned department (derived or direct)"
    },
    {
      "schemaName": "businessunit_id",
      "displayName": "Business Unit",
      "type": "lookup",
      "target": "eap_mc_businessunit",
      "description": "Assigned business unit (derived or direct)"
    },
    {
      "schemaName": "role",
      "displayName": "Role",
      "type": "choice",
      "options": ["MEMBER", "LEAD", "MANAGER", "DIRECTOR", "VP", "ADMIN"],
      "default": "MEMBER",
      "description": "User's role in the organization"
    },
    {
      "schemaName": "access_scope",
      "displayName": "Access Scope",
      "type": "choice",
      "options": ["SELF", "POD", "TEAM", "DEPARTMENT", "BUSINESS_UNIT", "GLOBAL"],
      "default": "SELF",
      "description": "Data access scope for this user"
    },
    {
      "schemaName": "is_active",
      "displayName": "Is Active",
      "type": "boolean",
      "default": true,
      "description": "Whether this assignment is active"
    },
    {
      "schemaName": "effective_date",
      "displayName": "Effective Date",
      "type": "datetime",
      "description": "When this assignment became effective"
    },
    {
      "schemaName": "end_date",
      "displayName": "End Date",
      "type": "datetime",
      "description": "When this assignment ended (null if current)"
    },
    {
      "schemaName": "created_at",
      "displayName": "Created At",
      "type": "datetime",
      "description": "Record creation timestamp"
    },
    {
      "schemaName": "modified_at",
      "displayName": "Modified At",
      "type": "datetime",
      "description": "Record last modification timestamp"
    }
  ]
}
```

### 2.3 Access Control Flow

**Flow Name:** MPA - MC - Check User Access

**Purpose:** Verify user has access to requested data based on organizational hierarchy

**Trigger:** Called by other flows before returning data

**Logic:**
```
1. Get user_email from session
2. Query eap_mc_employee_assignment for user's assignment
3. Get user's access_scope
4. Based on scope:
   - SELF: Filter to user's own records only
   - POD: Filter to records from same pod
   - TEAM: Filter to records from same team
   - DEPARTMENT: Filter to records from same department
   - BUSINESS_UNIT: Filter to records from same business unit
   - GLOBAL: No filtering (admin access)
5. Return filter criteria to calling flow
```

### 2.4 Row-Level Security Implementation

Add these columns to data tables that require access control:

```json
{
  "schemaName": "owner_user_id",
  "displayName": "Owner User",
  "type": "lookup",
  "target": "eap_users",
  "description": "User who owns this record"
},
{
  "schemaName": "owner_pod_id",
  "displayName": "Owner Pod",
  "type": "lookup",
  "target": "eap_mc_pod",
  "description": "Pod that owns this record"
},
{
  "schemaName": "owner_team_id",
  "displayName": "Owner Team",
  "type": "lookup",
  "target": "eap_mc_team",
  "description": "Team that owns this record"
},
{
  "schemaName": "owner_department_id",
  "displayName": "Owner Department",
  "type": "lookup",
  "target": "eap_mc_department",
  "description": "Department that owns this record"
},
{
  "schemaName": "owner_businessunit_id",
  "displayName": "Owner Business Unit",
  "type": "lookup",
  "target": "eap_mc_businessunit",
  "description": "Business unit that owns this record"
}
```

---

## PART 3: DATA CLASSIFICATION EXTENSION

### 3.1 Purpose

Require data classification labels on all records to comply with Mastercard information security policies.

### 3.2 Classification Levels

| Level | Code | Description | Handling Requirements |
|-------|------|-------------|----------------------|
| Public | PUBLIC | Information approved for public release | No restrictions |
| Internal | INTERNAL | Internal use only, not for external sharing | Encrypt at rest |
| Confidential | CONFIDENTIAL | Sensitive business information | Encrypt in transit and at rest |
| Restricted | RESTRICTED | Highly sensitive, limited access | Full audit trail, MFA required |

### 3.3 Schema Addition

Add this column to all data tables:

```json
{
  "schemaName": "data_classification",
  "displayName": "Data Classification",
  "type": "choice",
  "options": ["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"],
  "required": true,
  "default": "INTERNAL",
  "description": "Information security classification level"
}
```

### 3.4 Classification Enforcement Flow

**Flow Name:** MPA - MC - Enforce Classification

**Purpose:** Ensure all new records have appropriate classification

**Trigger:** On record create (for all data tables)

**Logic:**
```
1. Check if data_classification is set
2. If not set, apply default based on table:
   - mpa_sessions: INTERNAL
   - mpa_media_plans: CONFIDENTIAL
   - mpa_benchmarks: INTERNAL
3. Log classification assignment to audit
4. If RESTRICTED, trigger additional approval workflow
```

---

## PART 4: ENHANCED AUDIT EXTENSION

### 4.1 Purpose

Extended audit trail beyond base EAP audit to meet Mastercard compliance requirements.

### 4.2 Schema

#### eap_mc_audit_extended

```json
{
  "schemaName": "eap_mc_audit_extended",
  "displayName": "Extended Audit Log",
  "description": "Enhanced audit logging for compliance",
  "pluralName": "Extended Audit Logs",
  "primaryColumn": "event_id",
  "columns": [
    {
      "schemaName": "event_id",
      "displayName": "Event ID",
      "type": "string",
      "required": true,
      "maxLength": 50,
      "description": "Unique event identifier"
    },
    {
      "schemaName": "base_audit_id",
      "displayName": "Base Audit Reference",
      "type": "lookup",
      "target": "eap_audit",
      "description": "Reference to base audit record"
    },
    {
      "schemaName": "user_email",
      "displayName": "User Email",
      "type": "string",
      "required": true,
      "maxLength": 200,
      "description": "Email of user who performed action"
    },
    {
      "schemaName": "user_department",
      "displayName": "User Department",
      "type": "string",
      "maxLength": 200,
      "description": "Department of user at time of action"
    },
    {
      "schemaName": "user_businessunit",
      "displayName": "User Business Unit",
      "type": "string",
      "maxLength": 200,
      "description": "Business unit of user at time of action"
    },
    {
      "schemaName": "action_type",
      "displayName": "Action Type",
      "type": "choice",
      "options": ["CREATE", "READ", "UPDATE", "DELETE", "EXPORT", "SHARE", "LOGIN", "LOGOUT", "SEARCH", "GENERATE"],
      "required": true,
      "description": "Type of action performed"
    },
    {
      "schemaName": "resource_type",
      "displayName": "Resource Type",
      "type": "string",
      "maxLength": 100,
      "description": "Type of resource accessed"
    },
    {
      "schemaName": "resource_id",
      "displayName": "Resource ID",
      "type": "string",
      "maxLength": 100,
      "description": "ID of resource accessed"
    },
    {
      "schemaName": "resource_classification",
      "displayName": "Resource Classification",
      "type": "choice",
      "options": ["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"],
      "description": "Data classification of accessed resource"
    },
    {
      "schemaName": "ip_address",
      "displayName": "IP Address",
      "type": "string",
      "maxLength": 50,
      "description": "IP address of request origin"
    },
    {
      "schemaName": "user_agent",
      "displayName": "User Agent",
      "type": "string",
      "maxLength": 500,
      "description": "Browser/client user agent string"
    },
    {
      "schemaName": "session_id",
      "displayName": "Session ID",
      "type": "string",
      "maxLength": 100,
      "description": "Associated session identifier"
    },
    {
      "schemaName": "request_payload_hash",
      "displayName": "Request Payload Hash",
      "type": "string",
      "maxLength": 100,
      "description": "SHA-256 hash of request payload (not the payload itself)"
    },
    {
      "schemaName": "response_status",
      "displayName": "Response Status",
      "type": "choice",
      "options": ["SUCCESS", "FAILURE", "PARTIAL", "DENIED"],
      "description": "Outcome of the action"
    },
    {
      "schemaName": "failure_reason",
      "displayName": "Failure Reason",
      "type": "string",
      "maxLength": 500,
      "description": "Reason for failure if applicable"
    },
    {
      "schemaName": "timestamp",
      "displayName": "Timestamp",
      "type": "datetime",
      "required": true,
      "description": "When the event occurred"
    },
    {
      "schemaName": "retention_date",
      "displayName": "Retention Date",
      "type": "datetime",
      "description": "Date when this record can be purged"
    }
  ]
}
```

### 4.3 Retention Policy

- Default retention: 90 days
- RESTRICTED access events: 1 year
- Export/Share events: 1 year
- Failed access attempts: 1 year

### 4.4 Audit Flow

**Flow Name:** MPA - MC - Extended Audit Log

**Purpose:** Create extended audit record for all significant events

**Trigger:** Called by all flows that modify or access data

**Input:**
- base_audit_id (from EAP audit)
- action_type
- resource_type
- resource_id
- response_status
- failure_reason (optional)

**Logic:**
```
1. Get user context from session
2. Query employee assignment for department/business unit
3. Calculate retention_date based on action_type and classification
4. Create extended audit record
5. If RESTRICTED resource or failed access, trigger security alert
```

---

## PART 5: CONFLUENCE DATA SOURCE EXTENSION

### 5.1 Purpose

Allow MPA to reference Mastercard Confluence content as an additional knowledge source.

### 5.2 Connector Configuration

**Note:** This extension requires Confluence API access. Implementation depends on Mastercard's Confluence deployment (Cloud vs Server).

#### Connector Schema

```json
{
  "connectorName": "mc_confluence",
  "displayName": "Mastercard Confluence",
  "type": "REST_API",
  "baseUrl": "{MASTERCARD_CONFLUENCE_URL}",
  "authentication": {
    "type": "OAUTH2",
    "tokenEndpoint": "{MASTERCARD_OAUTH_ENDPOINT}",
    "scopes": ["read:confluence-content.all"]
  },
  "endpoints": [
    {
      "name": "searchContent",
      "method": "GET",
      "path": "/wiki/rest/api/content/search",
      "parameters": [
        {"name": "cql", "type": "string", "required": true},
        {"name": "limit", "type": "integer", "default": 10}
      ]
    },
    {
      "name": "getPage",
      "method": "GET",
      "path": "/wiki/rest/api/content/{pageId}",
      "parameters": [
        {"name": "pageId", "type": "string", "required": true},
        {"name": "expand", "type": "string", "default": "body.view"}
      ]
    }
  ],
  "rateLimiting": {
    "requestsPerMinute": 60,
    "burstLimit": 10
  }
}
```

### 5.3 Confluence Search Flow

**Flow Name:** MPA - MC - Search Confluence

**Purpose:** Search Mastercard Confluence for relevant content

**Trigger:** Agent action when user asks about internal documentation

**Input:**
- search_query
- space_keys (optional, to limit search scope)
- max_results (default: 5)

**Output:**
- results array with page titles, excerpts, and URLs

### 5.4 Feature Flag Control

This extension is controlled by feature flag:

```json
{
  "flag_code": "CONFLUENCE_SEARCH",
  "flag_name": "Confluence Search Integration",
  "category": "DATA_SOURCES",
  "default_value": false,
  "description": "Enable searching Mastercard Confluence content"
}
```

---

## PART 6: MASTERCARD BENCHMARKS EXTENSION

### 6.1 Purpose

Add Mastercard-specific benchmark data that supplements or overrides base MPA benchmarks.

### 6.2 Schema

#### mpa_mc_benchmarks

```json
{
  "schemaName": "mpa_mc_benchmarks",
  "displayName": "Mastercard Benchmarks",
  "description": "Mastercard-specific media planning benchmarks",
  "pluralName": "Mastercard Benchmarks",
  "primaryColumn": "benchmark_id",
  "columns": [
    {
      "schemaName": "benchmark_id",
      "displayName": "Benchmark ID",
      "type": "string",
      "required": true,
      "maxLength": 50,
      "description": "Unique benchmark identifier"
    },
    {
      "schemaName": "vertical",
      "displayName": "Vertical",
      "type": "string",
      "required": true,
      "maxLength": 50,
      "description": "Industry vertical (FINANCIAL_SERVICES for most MC data)"
    },
    {
      "schemaName": "channel",
      "displayName": "Channel",
      "type": "string",
      "required": true,
      "maxLength": 50,
      "description": "Media channel"
    },
    {
      "schemaName": "metric",
      "displayName": "Metric",
      "type": "string",
      "required": true,
      "maxLength": 50,
      "description": "Metric name (CPM, CTR, CPC, etc.)"
    },
    {
      "schemaName": "value_low",
      "displayName": "Value Low",
      "type": "decimal",
      "description": "Low end of benchmark range"
    },
    {
      "schemaName": "value_mid",
      "displayName": "Value Mid",
      "type": "decimal",
      "description": "Midpoint or typical value"
    },
    {
      "schemaName": "value_high",
      "displayName": "Value High",
      "type": "decimal",
      "description": "High end of benchmark range"
    },
    {
      "schemaName": "region",
      "displayName": "Region",
      "type": "choice",
      "options": ["GLOBAL", "NA", "EMEA", "APAC", "LATAM"],
      "default": "GLOBAL",
      "description": "Geographic region for this benchmark"
    },
    {
      "schemaName": "source",
      "displayName": "Source",
      "type": "string",
      "maxLength": 200,
      "description": "Data source or campaign reference"
    },
    {
      "schemaName": "campaign_type",
      "displayName": "Campaign Type",
      "type": "choice",
      "options": ["BRAND", "ACQUISITION", "RETENTION", "PRODUCT_LAUNCH", "SPONSORSHIP"],
      "description": "Type of campaign this benchmark applies to"
    },
    {
      "schemaName": "period",
      "displayName": "Period",
      "type": "string",
      "maxLength": 20,
      "description": "Time period (e.g., Q3 2025, FY2024)"
    },
    {
      "schemaName": "is_active",
      "displayName": "Is Active",
      "type": "boolean",
      "default": true,
      "description": "Whether this benchmark is current"
    },
    {
      "schemaName": "data_classification",
      "displayName": "Data Classification",
      "type": "choice",
      "options": ["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"],
      "default": "CONFIDENTIAL",
      "description": "Information security classification"
    },
    {
      "schemaName": "created_at",
      "displayName": "Created At",
      "type": "datetime",
      "description": "Record creation timestamp"
    },
    {
      "schemaName": "modified_at",
      "displayName": "Modified At",
      "type": "datetime",
      "description": "Record last modification timestamp"
    }
  ]
}
```

### 6.3 Benchmark Priority

When searching benchmarks, the flow checks in this order:
1. mpa_mc_benchmarks (Mastercard-specific) - highest priority
2. mpa_benchmarks (base) - fallback

If Mastercard-specific benchmark exists for the query, it takes precedence.

---

## PART 7: CREATING NEW EXTENSIONS

### 7.1 Step-by-Step Process

1. **Identify the Need**
   - Document the business requirement
   - Confirm it cannot be met by base functionality
   - Get stakeholder approval

2. **Design the Extension**
   - Create schema definitions
   - Define flow logic
   - Identify feature flags needed

3. **Create Directory Structure**
   ```
   /extensions/[extension-name]/
   ├── schema/
   │   └── [table_name].json
   ├── flows/
   │   └── [flow_name].json
   ├── seed-data/
   │   └── [data_file].csv
   └── README.md
   ```

4. **Implement Schema**
   - Create table in Dataverse
   - Add columns per schema definition
   - Set up relationships

5. **Implement Flows**
   - Create Power Automate flows
   - Connect to agent as actions
   - Test flow execution

6. **Create Feature Flag**
   - Add flag to eap_feature_flags
   - Set default value (usually false for new extensions)
   - Document flag purpose

7. **Test Extension**
   - Verify extension works independently
   - Verify base functionality still works
   - Test with extension enabled and disabled

8. **Document**
   - Update this guide with new extension details
   - Create README.md in extension directory
   - Update deployment documentation

9. **Deploy**
   - Commit to deploy/corporate branch only
   - Do not merge to main (keeps base clean)
   - Follow change management process

### 7.2 Extension Checklist

Before deploying any new extension:

- [ ] Schema files valid JSON
- [ ] Table names follow mc_ convention
- [ ] Flow names include MC prefix
- [ ] Feature flag created and documented
- [ ] Extension works when disabled (graceful degradation)
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Tested in non-production environment

---

## PART 8: TROUBLESHOOTING

### 8.1 Common Issues

**Issue: Extension not loading**
- Check feature flag is enabled
- Verify table exists in Dataverse
- Check flow connections are authenticated

**Issue: Access control not working**
- Verify employee assignment record exists
- Check access_scope is set correctly
- Review flow logic for filter application

**Issue: Audit records missing**
- Check extended audit flow is triggered
- Verify Dataverse permissions for audit table
- Check for flow errors in run history

**Issue: Confluence search returning no results**
- Verify API credentials are valid
- Check CQL query syntax
- Confirm user has Confluence access

### 8.2 Support Contacts

| Area | Contact |
|------|---------|
| Platform Issues | platform-support@kesseldigital.com |
| Mastercard IT | [Mastercard IT Contact] |
| Security Questions | [Security Team Contact] |

---

## APPENDIX A: FEATURE FLAGS FOR EXTENSIONS

| Flag Code | Extension | Default | Description |
|-----------|-----------|---------|-------------|
| ACCESS_CONTROL_HIERARCHY | Access Control | true | Enable organizational hierarchy filtering |
| DATA_CLASSIFICATION_REQUIRED | Data Classification | true | Require classification on all records |
| EXTENDED_AUDIT | Enhanced Audit | true | Enable extended audit logging |
| CONFLUENCE_SEARCH | Confluence | false | Enable Confluence content search |
| MC_BENCHMARKS | Mastercard Benchmarks | true | Use Mastercard-specific benchmarks |
| ROW_LEVEL_SECURITY | Access Control | true | Enable row-level security filtering |

---

## REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-06 | MPA Deployment | Initial guide creation |
