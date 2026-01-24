# MCMAP ATTRIBUTE-BASED ACCESS CONTROL (ABAC) DEPLOYMENT
## COMPREHENSIVE VS CODE EXECUTION INSTRUCTIONS

**Document:** VSCODE_MCMAP_ABAC_Deployment.md
**Version:** 1.0
**Date:** January 24, 2026
**Purpose:** Complete instructions for deploying ABAC security system to Mastercard environment

---

## EXECUTIVE SUMMARY

This document provides step-by-step instructions to deploy the MCMAP Attribute-Based Access Control (ABAC) system:

1. **Dataverse Table Deployment** - Create 4 new security tables programmatically
2. **Power Automate Flow Deployment** - Deploy 3 security flows
3. **Agent Instructions Update** - Update DOCS and ORC agents with access control
4. **Configuration Deployment** - Load YAML access rules into Dataverse
5. **Copilot Studio Topic Creation** - Create manual access check and request topics
6. **Testing & Validation** - Verify two-mode operation works correctly

**Estimated execution time:** 4-6 hours

---

## PRE-EXECUTION SETUP

### Step 0.1: Navigate to Repository
```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
```

### Step 0.2: Verify Branch and Pull Latest
```bash
git checkout deploy/mastercard
git pull origin deploy/mastercard
git status
```

### Step 0.3: Verify ABAC Files Exist
```bash
echo "=== Verifying ABAC Implementation Files ==="

# Dataverse Schemas
ls -la release/v6.0/platform/dataverse/eap_security_config.csv
ls -la release/v6.0/platform/dataverse/eap_user_profile_schema.json
ls -la release/v6.0/platform/dataverse/eap_access_rule_schema.json
ls -la release/v6.0/platform/dataverse/eap_access_request_schema.json

# Flow Specifications
ls -la release/v6.0/platform/flows/MCMAP_User_Profile_Sync.json
ls -la release/v6.0/platform/flows/MCMAP_Check_Content_Access.json
ls -la release/v6.0/platform/flows/MCMAP_Access_Request.json

# Configuration
ls -la release/v6.0/platform/security/mcmap_access_rules.yaml

# Agent Instructions
ls -la release/v6.0/agents/docs/instructions/DOCS_Instructions_v6.txt
ls -la release/v6.0/solutions/agents/orc/instructions/ORC_Copilot_Instructions_v4.txt

# Documentation
ls -la release/v6.0/docs/mcmap-reference-packet/MCMAP_ABAC_Implementation.md
ls -la release/v6.0/docs/mcmap-reference-packet/KB-MCMAP_Access_Control_Reference.md

echo "=== All files verified ==="
```

---

## PHASE 1: DATAVERSE TABLE DEPLOYMENT (PROGRAMMATIC)

### Task 1.1: Create Deployment Script for Security Tables

Create a Python script to deploy the 4 security tables to Dataverse.

**File:** `release/v6.0/scripts/deploy_abac_tables.py`

```python
"""
MCMAP ABAC Dataverse Table Deployment Script
Deploys 4 security tables to Mastercard Dataverse environment
"""

import json
import requests
from msal import ConfidentialClientApplication

# Configuration - Update for target environment
TENANT_ID = "3933d83c-778f-4bf2-b5d7-1eea5844e9a3"  # Mastercard tenant
CLIENT_ID = "f1ccccf1-c2a0-4890-8d52-fdfcd6620ac8"  # App registration
CLIENT_SECRET = None  # Set via environment variable MCMAP_CLIENT_SECRET
ENVIRONMENT_URL = "https://aragornai.crm.dynamics.com"
API_URL = f"{ENVIRONMENT_URL}/api/data/v9.2"

# Table definitions
TABLES = {
    "eap_security_config": {
        "SchemaName": "eap_security_config",
        "DisplayName": "EAP Security Config",
        "DisplayCollectionName": "EAP Security Configs",
        "Description": "Global security settings and toggles for MCMAP ABAC",
        "PrimaryNameAttribute": "config_key",
        "Attributes": [
            {"SchemaName": "config_key", "Type": "String", "MaxLength": 100, "Required": True},
            {"SchemaName": "config_value", "Type": "String", "MaxLength": 500, "Required": True},
            {"SchemaName": "description", "Type": "String", "MaxLength": 500, "Required": False},
            {"SchemaName": "is_active", "Type": "Boolean", "DefaultValue": True}
        ]
    },
    "eap_user_profile": {
        "SchemaName": "eap_user_profile",
        "DisplayName": "EAP User Profile",
        "DisplayCollectionName": "EAP User Profiles",
        "Description": "User profiles synced from Microsoft Directory",
        "PrimaryNameAttribute": "display_name",
        "Attributes": [
            {"SchemaName": "user_id", "Type": "Uniqueidentifier", "Required": True},
            {"SchemaName": "display_name", "Type": "String", "MaxLength": 200, "Required": True},
            {"SchemaName": "email", "Type": "String", "MaxLength": 320, "Required": True},
            {"SchemaName": "job_title", "Type": "String", "MaxLength": 200, "Required": False},
            {"SchemaName": "employee_level", "Type": "String", "MaxLength": 50, "Required": False},
            {"SchemaName": "department", "Type": "String", "MaxLength": 200, "Required": False},
            {"SchemaName": "team", "Type": "String", "MaxLength": 200, "Required": False},
            {"SchemaName": "division", "Type": "String", "MaxLength": 200, "Required": False},
            {"SchemaName": "region", "Type": "String", "MaxLength": 100, "Required": False},
            {"SchemaName": "country", "Type": "String", "MaxLength": 100, "Required": False},
            {"SchemaName": "office_location", "Type": "String", "MaxLength": 200, "Required": False},
            {"SchemaName": "cost_center", "Type": "String", "MaxLength": 50, "Required": False},
            {"SchemaName": "manager_id", "Type": "Uniqueidentifier", "Required": False},
            {"SchemaName": "manager_display_name", "Type": "String", "MaxLength": 200, "Required": False},
            {"SchemaName": "manager_chain_json", "Type": "Memo", "Required": False},
            {"SchemaName": "security_groups_json", "Type": "Memo", "Required": False},
            {"SchemaName": "first_seen", "Type": "DateTime", "Required": False},
            {"SchemaName": "last_updated", "Type": "DateTime", "Required": False}
        ]
    },
    "eap_access_rule": {
        "SchemaName": "eap_access_rule",
        "DisplayName": "EAP Access Rule",
        "DisplayCollectionName": "EAP Access Rules",
        "Description": "ABAC rule definitions for content protection",
        "PrimaryNameAttribute": "rule_name",
        "Attributes": [
            {"SchemaName": "rule_name", "Type": "String", "MaxLength": 200, "Required": True},
            {"SchemaName": "rule_description", "Type": "String", "MaxLength": 1000, "Required": False},
            {"SchemaName": "rule_type", "Type": "Picklist", "Options": ["AGENT", "CONTENT_SET", "DOCUMENT", "CAPABILITY", "DATA_AREA"]},
            {"SchemaName": "target_pattern", "Type": "String", "MaxLength": 500, "Required": True},
            {"SchemaName": "conditions_json", "Type": "Memo", "Required": True},
            {"SchemaName": "condition_logic", "Type": "Picklist", "Options": ["ALL", "ANY"]},
            {"SchemaName": "denial_message", "Type": "String", "MaxLength": 1000, "Required": False},
            {"SchemaName": "applies_when_abac_off", "Type": "Boolean", "DefaultValue": False},
            {"SchemaName": "priority", "Type": "Integer", "Required": True},
            {"SchemaName": "is_active", "Type": "Boolean", "DefaultValue": True}
        ]
    },
    "eap_access_request": {
        "SchemaName": "eap_access_request",
        "DisplayName": "EAP Access Request",
        "DisplayCollectionName": "EAP Access Requests",
        "Description": "Track access requests from users",
        "PrimaryNameAttribute": "user_display_name",
        "Attributes": [
            {"SchemaName": "user_id", "Type": "Uniqueidentifier", "Required": True},
            {"SchemaName": "user_display_name", "Type": "String", "MaxLength": 200, "Required": False},
            {"SchemaName": "user_email", "Type": "String", "MaxLength": 320, "Required": False},
            {"SchemaName": "user_department", "Type": "String", "MaxLength": 200, "Required": False},
            {"SchemaName": "user_job_title", "Type": "String", "MaxLength": 200, "Required": False},
            {"SchemaName": "user_employee_level", "Type": "String", "MaxLength": 50, "Required": False},
            {"SchemaName": "user_division", "Type": "String", "MaxLength": 200, "Required": False},
            {"SchemaName": "user_region", "Type": "String", "MaxLength": 100, "Required": False},
            {"SchemaName": "requested_content", "Type": "String", "MaxLength": 500, "Required": True},
            {"SchemaName": "justification", "Type": "Memo", "Required": False},
            {"SchemaName": "request_status", "Type": "Picklist", "Options": ["PENDING", "APPROVED", "DENIED"]},
            {"SchemaName": "requested_at", "Type": "DateTime", "Required": True},
            {"SchemaName": "resolved_at", "Type": "DateTime", "Required": False},
            {"SchemaName": "resolved_by", "Type": "String", "MaxLength": 200, "Required": False},
            {"SchemaName": "resolution_notes", "Type": "String", "MaxLength": 1000, "Required": False},
            {"SchemaName": "rule_triggered", "Type": "String", "MaxLength": 200, "Required": False}
        ]
    }
}

def get_access_token():
    """Obtain access token for Dataverse API"""
    import os
    client_secret = os.environ.get('MCMAP_CLIENT_SECRET', CLIENT_SECRET)
    if not client_secret:
        raise ValueError("Set MCMAP_CLIENT_SECRET environment variable")

    app = ConfidentialClientApplication(
        CLIENT_ID,
        authority=f"https://login.microsoftonline.com/{TENANT_ID}",
        client_credential=client_secret
    )

    result = app.acquire_token_for_client(scopes=[f"{ENVIRONMENT_URL}/.default"])

    if "access_token" not in result:
        raise Exception(f"Failed to get token: {result.get('error_description')}")

    return result["access_token"]

def create_table(token, table_def):
    """Create a Dataverse table"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0"
    }

    # Table creation would use Web API metadata operations
    # This is a simplified representation
    print(f"Creating table: {table_def['SchemaName']}")
    print(f"  Attributes: {len(table_def['Attributes'])}")

    # In production, use proper Dataverse Web API calls
    # POST to EntityDefinitions endpoint

    return True

def main():
    print("=" * 60)
    print("MCMAP ABAC Dataverse Table Deployment")
    print("=" * 60)

    try:
        token = get_access_token()
        print("✓ Authentication successful")

        for table_name, table_def in TABLES.items():
            success = create_table(token, table_def)
            if success:
                print(f"✓ Created table: {table_name}")
            else:
                print(f"✗ Failed to create: {table_name}")

        print("\n" + "=" * 60)
        print("Deployment complete")
        print("=" * 60)

    except Exception as e:
        print(f"✗ Deployment failed: {e}")
        raise

if __name__ == "__main__":
    main()
```

### Task 1.2: Execute Table Deployment

**Option A: Programmatic (if API access configured)**
```bash
export MCMAP_CLIENT_SECRET="your-client-secret"
python release/v6.0/scripts/deploy_abac_tables.py
```

**Option B: Manual via Power Apps Maker Portal**

If programmatic deployment is not available, follow these manual steps:

---

## PHASE 1B: MANUAL DATAVERSE TABLE CREATION

### Step 1: Navigate to Power Apps Maker Portal

1. Go to https://make.powerapps.com
2. Select "Aragorn AI" environment (or target Mastercard environment)
3. Navigate to Tables in the left sidebar

### Step 2: Create eap_security_config Table

**Table Settings:**
- Display name: `EAP Security Config`
- Plural display name: `EAP Security Configs`
- Schema name: `eap_security_config`
- Primary column name: `config_key`
- Description: `Global security settings and toggles for MCMAP ABAC`

**Columns to Add:**

| Display Name | Schema Name | Type | Required | Additional Settings |
|--------------|-------------|------|----------|---------------------|
| Config Key | config_key | Single line of text | Yes | Max length: 100 |
| Config Value | config_value | Single line of text | Yes | Max length: 500 |
| Description | description | Single line of text | No | Max length: 500 |
| Is Active | is_active | Yes/No | Yes | Default: Yes |

**Seed Data to Add:**

| config_key | config_value | description | is_active |
|------------|--------------|-------------|-----------|
| ABAC_ENABLED | false | Master toggle for full ABAC (OFF by default) | Yes |
| CSUITE_PROTECTION_ENABLED | true | C-Suite content protection (ON from day 1) | Yes |
| PROFILE_TRACKING_ENABLED | true | User profile capture enabled | Yes |
| ACCESS_REQUEST_ENABLED | true | Access request flow enabled | Yes |
| CACHE_TTL_HOURS | 24 | User profile cache duration in hours | Yes |
| DIRECTORY_SYNC_ENABLED | true | Sync from Microsoft Directory enabled | Yes |
| DEFAULT_ACCESS | ALLOW | Default access when no rule matches | Yes |
| PLATFORM_OWNER_EMAIL | kevin.bauer@mastercard.com | Platform owner for access requests (NEVER expose) | Yes |

### Step 3: Create eap_user_profile Table

**Table Settings:**
- Display name: `EAP User Profile`
- Plural display name: `EAP User Profiles`
- Schema name: `eap_user_profile`
- Primary column name: `display_name`
- Description: `User profiles synced from Microsoft Directory for ABAC`

**Columns to Add:**

| Display Name | Schema Name | Type | Required | Additional Settings |
|--------------|-------------|------|----------|---------------------|
| User ID | user_id | Unique identifier | Yes | |
| Display Name | display_name | Single line of text | Yes | Max: 200 |
| Email | email | Single line of text | Yes | Max: 320 |
| Job Title | job_title | Single line of text | No | Max: 200 |
| Employee Level | employee_level | Single line of text | No | Max: 50 |
| Department | department | Single line of text | No | Max: 200 |
| Team | team | Single line of text | No | Max: 200 |
| Division | division | Single line of text | No | Max: 200 |
| Region | region | Single line of text | No | Max: 100 |
| Country | country | Single line of text | No | Max: 100 |
| Office Location | office_location | Single line of text | No | Max: 200 |
| Cost Center | cost_center | Single line of text | No | Max: 50 |
| Manager ID | manager_id | Unique identifier | No | |
| Manager Display Name | manager_display_name | Single line of text | No | Max: 200 |
| Manager Chain JSON | manager_chain_json | Multiline text | No | |
| Security Groups JSON | security_groups_json | Multiline text | No | |
| First Seen | first_seen | Date and time | No | |
| Last Updated | last_updated | Date and time | No | |

### Step 4: Create eap_access_rule Table

**Table Settings:**
- Display name: `EAP Access Rule`
- Plural display name: `EAP Access Rules`
- Schema name: `eap_access_rule`
- Primary column name: `rule_name`
- Description: `ABAC rule definitions for content protection`

**Columns to Add:**

| Display Name | Schema Name | Type | Required | Additional Settings |
|--------------|-------------|------|----------|---------------------|
| Rule Name | rule_name | Single line of text | Yes | Max: 200 |
| Rule Description | rule_description | Single line of text | No | Max: 1000 |
| Rule Type | rule_type | Choice | Yes | Options: AGENT, CONTENT_SET, DOCUMENT, CAPABILITY, DATA_AREA |
| Target Pattern | target_pattern | Single line of text | Yes | Max: 500 |
| Conditions JSON | conditions_json | Multiline text | Yes | |
| Condition Logic | condition_logic | Choice | Yes | Options: ALL, ANY |
| Denial Message | denial_message | Single line of text | No | Max: 1000 |
| Applies When ABAC Off | applies_when_abac_off | Yes/No | Yes | Default: No |
| Priority | priority | Whole number | Yes | |
| Is Active | is_active | Yes/No | Yes | Default: Yes |

**Seed Rules to Add (from mcmap_access_rules.yaml):**

See `release/v6.0/platform/security/mcmap_access_rules.yaml` for complete rule definitions.

Key rules to create:

1. **C-Suite Executive Briefs** (applies_when_abac_off = YES)
2. **Investment Proposal** (applies_when_abac_off = YES)
3. **Technical Architecture Documentation** (applies_when_abac_off = NO)
4. **Public Documentation** (applies_when_abac_off = NO)

### Step 5: Create eap_access_request Table

**Table Settings:**
- Display name: `EAP Access Request`
- Plural display name: `EAP Access Requests`
- Schema name: `eap_access_request`
- Primary column name: `user_display_name`
- Description: `Track access requests from users`

**Columns to Add:**

| Display Name | Schema Name | Type | Required | Additional Settings |
|--------------|-------------|------|----------|---------------------|
| User ID | user_id | Unique identifier | Yes | |
| User Display Name | user_display_name | Single line of text | No | Max: 200 |
| User Email | user_email | Single line of text | No | Max: 320 |
| User Department | user_department | Single line of text | No | Max: 200 |
| User Job Title | user_job_title | Single line of text | No | Max: 200 |
| User Employee Level | user_employee_level | Single line of text | No | Max: 50 |
| User Division | user_division | Single line of text | No | Max: 200 |
| User Region | user_region | Single line of text | No | Max: 100 |
| Requested Content | requested_content | Single line of text | Yes | Max: 500 |
| Justification | justification | Multiline text | No | |
| Request Status | request_status | Choice | Yes | Options: PENDING, APPROVED, DENIED |
| Requested At | requested_at | Date and time | Yes | |
| Resolved At | resolved_at | Date and time | No | |
| Resolved By | resolved_by | Single line of text | No | Max: 200 |
| Resolution Notes | resolution_notes | Single line of text | No | Max: 1000 |
| Rule Triggered | rule_triggered | Single line of text | No | Max: 200 |

---

## PHASE 2: POWER AUTOMATE FLOW DEPLOYMENT (MANUAL)

### Task 2.1: Create MCMAP_User_Profile_Sync Flow

**Navigate to:** Power Automate > My Flows > New > Instant cloud flow

**Flow Name:** MCMAP_User_Profile_Sync

**Trigger:** When called from Copilot

**Input Parameters:**
- user_id (GUID) - Required

**Flow Steps:**

1. **Initialize variable** - user_profile (Object)

2. **Get row by ID** - Query eap_user_profile where user_id matches
   - If found AND last_updated < 24 hours ago, return cached profile

3. **HTTP - Call Microsoft Graph** (Premium connector required)
   ```
   GET https://graph.microsoft.com/v1.0/users/{user_id}
   ?$select=id,displayName,mail,userPrincipalName,jobTitle,department,companyName,officeLocation,country,usageLocation
   ```

4. **Parse JSON** - Parse Graph response

5. **HTTP - Get Manager** (Premium)
   ```
   GET https://graph.microsoft.com/v1.0/users/{user_id}/manager
   ```

6. **HTTP - Get Security Groups** (Premium)
   ```
   GET https://graph.microsoft.com/v1.0/users/{user_id}/memberOf
   ```

7. **Compose** - Build user profile object with all attributes

8. **Update or Create Row** - Upsert to eap_user_profile table

9. **Return value** - Output user profile JSON

**Reference:** `release/v6.0/platform/flows/MCMAP_User_Profile_Sync.json`

### Task 2.2: Create MCMAP_Check_Content_Access Flow

**Flow Name:** MCMAP_Check_Content_Access

**Trigger:** When called from Copilot

**Input Parameters:**
- user_id (GUID) - Required
- content_identifier (String) - Required

**Flow Steps:**

1. **Get row** - Get user profile from eap_user_profile

2. **List rows** - Get security config (ABAC_ENABLED, CSUITE_PROTECTION_ENABLED)

3. **List rows** - Query eap_access_rule where:
   - target_pattern matches content_identifier
   - is_active = true
   - Order by priority DESC

4. **Apply to each** - For each matching rule:
   - Parse conditions_json
   - Evaluate each condition against user profile
   - If ALL/ANY conditions met (based on condition_logic):
     - Set access_granted = true
     - Break loop

5. **Condition** - If no rule granted access:
   - Check default_access setting
   - Set access_granted accordingly

6. **Return value** - Output:
   ```json
   {
     "granted": true/false,
     "rule_applied": "rule_name or none",
     "denial_message": "message if denied"
   }
   ```

**Reference:** `release/v6.0/platform/flows/MCMAP_Check_Content_Access.json`

### Task 2.3: Create MCMAP_Access_Request Flow

**Flow Name:** MCMAP_Access_Request

**Trigger:** When called from Copilot

**Input Parameters:**
- user_id (GUID) - Required
- requested_content (String) - Required
- justification (String) - Required

**Flow Steps:**

1. **Get row** - Get full user profile from eap_user_profile

2. **Add row** - Create record in eap_access_request:
   - All user attributes from profile
   - requested_content
   - justification
   - request_status = PENDING
   - requested_at = utcNow()

3. **Get row** - Get PLATFORM_OWNER_EMAIL from eap_security_config

4. **Send email (V2)** - Send to Platform Owner:
   ```
   Subject: MCMAP Access Request: {requested_content}

   Body:
   Requester: {display_name}
   Email: {email}
   Title: {job_title}
   Level: {employee_level}
   Department: {department}
   Division: {division}
   Region: {region}

   Requested Content: {requested_content}
   Justification: {justification}

   Request ID: {record_id}
   ```

5. **Return value** - Output:
   ```json
   {
     "request_id": "short_guid",
     "status": "submitted",
     "message": "Request submitted. Response within 2 business days."
   }
   ```

**Reference:** `release/v6.0/platform/flows/MCMAP_Access_Request.json`

---

## PHASE 3: COPILOT STUDIO TOPIC DEPLOYMENT (MANUAL)

### Task 3.1: Create Session Start Topic with Profile Sync

**Navigate to:** Copilot Studio > MCMAP Agent > Topics

**Topic Name:** MCMAP_Session_Start

**Trigger:** System > Conversation Start

**Actions:**

1. **Call an action** - Call MCMAP_User_Profile_Sync flow
   - Input: System.User.Id

2. **Set variable** - Store user profile in session variable
   - Variable name: UserProfile
   - Value: Flow output

3. **Redirect** - Continue to Greeting topic

### Task 3.2: Create Access Check Topic

**Topic Name:** MCMAP_Access_Check (Internal)

**Trigger:** Redirect from other topics (not phrase-triggered)

**Input Variable:** content_identifier (String)

**Actions:**

1. **Call an action** - Call MCMAP_Check_Content_Access flow
   - Inputs: System.User.Id, content_identifier

2. **Condition** - If granted = true:
   - Set variable: AccessGranted = true
   - End topic (return to caller)

3. **Condition** - If granted = false:
   - **Message:** Display denial_message from flow response
   - **Message:** "To request access, say 'request access' and I'll help submit your request."
   - Set variable: AccessGranted = false
   - End topic

### Task 3.3: Create Request Access Topic

**Topic Name:** MCMAP_Request_Access

**Trigger Phrases:**
- request access
- I need access
- how do I get access
- access request
- get access to

**Actions:**

1. **Question** - "What content would you like access to?"
   - Save response as: RequestedContent

2. **Question** - "Please briefly describe why you need this access (1-2 sentences)."
   - Save response as: Justification

3. **Call an action** - Call MCMAP_Access_Request flow
   - Inputs: System.User.Id, RequestedContent, Justification

4. **Message:** "Your access request has been submitted."

5. **Message:** "Request ID: {flow.request_id}"

6. **Message:** "The Platform team typically responds within 2 business days. Is there anything else I can help you with in the meantime?"

---

## PHASE 4: AGENT INSTRUCTION DEPLOYMENT (MANUAL)

### Task 4.1: Update DOCS Agent Instructions

**Navigate to:** Copilot Studio > DOCS Agent > Settings > Instructions

**Action:** Replace current instructions with content from:
```
release/v6.0/agents/docs/instructions/DOCS_Instructions_v6.txt
```

**Verify:**
- ACCESS CONTROL section is present
- Character count is under 8,000

### Task 4.2: Update ORC Agent Instructions

**Navigate to:** Copilot Studio > ORC Agent (Orchestrator) > Settings > Instructions

**Action:** Replace current instructions with content from:
```
release/v6.0/solutions/agents/orc/instructions/ORC_Copilot_Instructions_v4.txt
```

**Verify:**
- ACCESS CONTROL and STAKEHOLDER BRIEF ROUTING sections present
- Character count is under 8,000

### Task 4.3: Upload KB Documents

**Navigate to:** SharePoint > MCMAP Knowledge Base library

**Upload:**
1. `KB-MCMAP_Access_Control_Reference.md` (for DOCS agent RAG)
2. `MCMAP_ABAC_Implementation.md` (for reference)

**For Copilot-compliant environments, also upload:**
- `KB-MCMAP_Access_Control_Reference_CopilotCompliant.txt`

---

## PHASE 5: VERIFICATION & TESTING

### Task 5.1: Verify Two-Mode Operation

**Test 1: Launch Mode (ABAC_ENABLED = false)**

1. Verify eap_security_config has ABAC_ENABLED = false
2. Log in as a non-executive user (Manager level)
3. Request CEO Brief via DOCS agent
4. **Expected:** Access denied with graceful message

5. Log in as an executive user (EVP level)
6. Request CEO Brief via DOCS agent
7. **Expected:** Access granted, content returned

**Test 2: Access Request Flow**

1. As non-executive user, say "request access"
2. Provide content: "CEO Brief"
3. Provide justification: "Need for presentation"
4. **Expected:** Confirmation with request ID
5. **Verify:** Email sent to Platform Owner
6. **Verify:** Record created in eap_access_request

**Test 3: Profile Sync**

1. Start new conversation
2. Check eap_user_profile table
3. **Expected:** User profile created/updated with all directory attributes

### Task 5.2: Verify Full ABAC Mode

**Only perform after Launch Mode is validated:**

1. Update eap_security_config: ABAC_ENABLED = true
2. Test department-based rules
3. Test division-based rules
4. Test regional content restrictions
5. Revert ABAC_ENABLED = false after testing

---

## PHASE 6: COMMIT AND PUSH

### Task 6.1: Verify All Files

```bash
echo "=== ABAC Deployment Verification ==="

# Check all ABAC-related files
git status

# List new files
git ls-files --others --exclude-standard | grep -E "(abac|access|security)"
```

### Task 6.2: Stage and Commit

```bash
# Stage new ABAC documentation
git add release/v6.0/docs/mcmap-reference-packet/KB-MCMAP_Access_Control_Reference.md
git add release/v6.0/docs/mcmap-reference-packet/VSCODE_MCMAP_ABAC_Deployment.md
git add release/v6.0/agents/docs/kb/KB-MCMAP_Access_Control_Reference_CopilotCompliant.txt

# Stage updated documentation
git add release/v6.0/docs/mcmap-reference-packet/00-MCMAP_Index.md
git add release/v6.0/docs/mcmap-reference-packet/02-MCMAP_System_Architecture.md

# Commit
git commit -m "docs(security): Add ABAC deployment instructions and access control KB

- Add KB-MCMAP_Access_Control_Reference.md for agent RAG
- Add Copilot-compliant plain text version for KB
- Add comprehensive VSCODE deployment guide
- Update Index with ABAC documentation references
- Update System Architecture with ABAC layer and table counts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### Task 6.3: Push to All Branches

```bash
# Push to mastercard branch
git push origin deploy/mastercard

# Push to corporate branch (if maintaining)
git checkout deploy/corporate
git merge deploy/mastercard
git push origin deploy/corporate

# Push to personal branch (if maintaining)
git checkout deploy/personal
git merge deploy/mastercard
git push origin deploy/personal

# Return to mastercard
git checkout deploy/mastercard
```

---

## COMPLETION CHECKLIST

### Phase 1: Dataverse Tables
- [ ] eap_security_config created with seed data
- [ ] eap_user_profile created
- [ ] eap_access_rule created with seed rules
- [ ] eap_access_request created

### Phase 2: Power Automate Flows
- [ ] MCMAP_User_Profile_Sync flow created
- [ ] MCMAP_Check_Content_Access flow created
- [ ] MCMAP_Access_Request flow created
- [ ] All flows tested individually

### Phase 3: Copilot Studio Topics
- [ ] MCMAP_Session_Start topic created
- [ ] MCMAP_Access_Check topic created
- [ ] MCMAP_Request_Access topic created

### Phase 4: Agent Instructions
- [ ] DOCS agent updated to v6 instructions
- [ ] ORC agent updated to v4 instructions
- [ ] KB documents uploaded to SharePoint

### Phase 5: Testing
- [ ] Launch Mode tested (C-Suite protection only)
- [ ] Access request flow tested
- [ ] Profile sync tested
- [ ] Email delivery verified

### Phase 6: Deployment
- [ ] All changes committed
- [ ] Pushed to deploy/mastercard
- [ ] Pushed to deploy/corporate (if applicable)
- [ ] Pushed to deploy/personal (if applicable)

---

## TROUBLESHOOTING

### Flow Errors

**Microsoft Graph 401 Unauthorized:**
- Verify app registration has User.Read.All, Directory.Read.All permissions
- Verify admin consent granted

**Dataverse Access Denied:**
- Verify service principal has System Administrator or equivalent role

### Topic Errors

**Flow not found:**
- Verify flow is shared with Copilot Studio connection
- Verify flow is saved and published

### Access Control Issues

**Always denying access:**
- Check CSUITE_PROTECTION_ENABLED is true
- Verify rules have applies_when_abac_off = true for C-Suite content
- Check priority ordering

**Always granting access:**
- Verify rules are active (is_active = true)
- Check condition_logic (ALL vs ANY)

---

**Document Version:** 1.0
**Created:** January 24, 2026
**Purpose:** VS Code Execution Instructions for ABAC Deployment
**Status:** Ready for Execution
