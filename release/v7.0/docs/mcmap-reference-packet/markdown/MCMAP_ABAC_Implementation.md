# MASTERCARD CONSULTING & MARKETING AGENT PLATFORM (MCMAP)
# ATTRIBUTE-BASED ACCESS CONTROL (ABAC) IMPLEMENTATION GUIDE

**Document:** MCMAP_ABAC_Implementation.md
**Version:** 1.0
**Date:** January 24, 2026
**Classification:** Mastercard Internal - Security Sensitive
**Status:** Production Ready
**Audience:** Security, Engineering, Platform Administration

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Two-Mode Operation](#2-two-mode-operation)
3. [Architecture Overview](#3-architecture-overview)
4. [Microsoft Directory Integration](#4-microsoft-directory-integration)
5. [Dataverse Tables](#5-dataverse-tables)
6. [Power Automate Flows](#6-power-automate-flows)
7. [Copilot Studio Topics](#7-copilot-studio-topics)
8. [Access Rules Configuration](#8-access-rules-configuration)
9. [Agent Integration](#9-agent-integration)
10. [Access Request Workflow](#10-access-request-workflow)
11. [Usage Reporting](#11-usage-reporting)
12. [Operational Procedures](#12-operational-procedures)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Purpose

MCMAP implements Attribute-Based Access Control (ABAC) to provide granular content protection based on user attributes from the Mastercard Microsoft Directory. This enables:

- **Role-appropriate content delivery**: Executive content for executives, operational content for operations
- **Department-based restrictions**: Sensitive content restricted to relevant departments
- **Geographic controls**: Regional data access based on user region
- **Comprehensive usage tracking**: Full visibility into platform adoption by organizational dimension

### 1.2 Key Features

| Feature | Description | Status |
|---------|-------------|--------|
| C-Suite Protection | Executive briefs protected via declarative agent | ON by default |
| Full ABAC | Complete attribute-based access control | Built but OFF by default |
| Profile Tracking | User attributes captured from directory | ON by default |
| Access Requests | Self-service access request workflow | ON by default |
| Usage Reporting | Analytics by level/department/division/region | Available |

### 1.3 Two-Mode Operation Summary

| Mode | When Active | What's Protected |
|------|-------------|------------------|
| **Launch Mode** | ABAC_ENABLED = false | C-Suite documents only (CEO Brief, 00-A through 00-D, Investment Proposal) |
| **Full ABAC Mode** | ABAC_ENABLED = true | All rules active (department, division, region, content sets, data areas) |

---

## 2. TWO-MODE OPERATION

### 2.1 Launch Mode (Default)

At launch, the platform operates with minimal access restrictions:

```
Configuration:
  ABAC_ENABLED: false
  CSUITE_PROTECTION_ENABLED: true

Active Rules:
  - C-Suite Executive Briefs (00-MCMAP_CEO_Brief.md, 00-A through 00-D)
  - Investment Proposal (09A-MCMAP_Investment_Proposal.md)

All Other Content:
  - Accessible to authenticated users
```

**Why This Mode:**
- Maximizes adoption during initial rollout
- Protects only the most sensitive executive content
- Reduces support burden for access requests
- Allows usage patterns to inform future access rules

### 2.2 Full ABAC Mode

When full ABAC is enabled, all configured rules become active:

```
Configuration:
  ABAC_ENABLED: true
  CSUITE_PROTECTION_ENABLED: true

Active Rules:
  - All C-Suite protection rules
  - Department-based content restrictions
  - Division-based access controls
  - Regional data access rules
  - Role-level requirements
```

**When to Enable:**
- After observing usage patterns from Launch Mode
- When department-specific content is added
- When regional data restrictions are required
- When role-based differentiation is needed

### 2.3 Toggling Between Modes

To enable full ABAC, update the eap_security_config table:

```
Table: eap_security_config
Record: config_key = 'ABAC_ENABLED'
Update: config_value = 'true'
```

No platform restart required. Changes take effect on next access check.

---

## 3. ARCHITECTURE OVERVIEW

### 3.1 System Diagram

```
+-----------------------------------------------------------------------------+
|                    MCMAP ATTRIBUTE-BASED ACCESS CONTROL                     |
+-----------------------------------------------------------------------------+
|                                                                             |
|  +---------------------+     +-------------------------------------+        |
|  | User Accesses Agent |---->| MCMAP_User_Profile_Sync Flow        |        |
|  +---------------------+     | (Reads from Microsoft Directory)    |        |
|                              +------------------+------------------+        |
|                                                 |                           |
|                                                 V                           |
|  +----------------------------------------------------------------------+   |
|  |                     eap_user_profile Table                           |   |
|  |  +----------------------------------------------------------------+  |   |
|  |  | user_id, display_name, email, job_title, employee_level,       |  |   |
|  |  | department, team, division, region, country, office_location,  |  |   |
|  |  | cost_center, manager_chain, security_groups                    |  |   |
|  |  +----------------------------------------------------------------+  |   |
|  +----------------------------------------------------------------------+   |
|                                                 |                           |
|                                                 V                           |
|  +----------------------------------------------------------------------+   |
|  |                     eap_access_rule Table                            |   |
|  |  +----------------------------------------------------------------+  |   |
|  |  | Rule Conditions (JSON):                                        |  |   |
|  |  | - employee_level IN ["EVP", "SVP", "VP"]                       |  |   |
|  |  | - department = "Marketing Services"                            |  |   |
|  |  | - division = "Data & Services"                                 |  |   |
|  |  | - region = "North America"                                     |  |   |
|  |  | - security_group = "MCMAP-Executive-Access"                    |  |   |
|  |  +----------------------------------------------------------------+  |   |
|  +----------------------------------------------------------------------+   |
|                                                 |                           |
|                    +----------------------------+---------------------------+
|                    |                                                        |
|                    V                                                        V
|             ACCESS GRANTED                                        ACCESS DENIED
|             (Return content)                                     (Graceful message)
|                                                                             |
+-----------------------------------------------------------------------------+
```

### 3.2 Component Summary

| Component | Purpose | Technology |
|-----------|---------|------------|
| eap_security_config | Global toggles and settings | Dataverse table |
| eap_user_profile | User attributes from directory | Dataverse table |
| eap_access_rule | Access rule definitions | Dataverse table |
| eap_access_request | Access request tracking | Dataverse table |
| MCMAP_User_Profile_Sync | Sync profile from directory | Power Automate flow |
| MCMAP_Check_Content_Access | Evaluate ABAC rules | Power Automate flow |
| MCMAP_Access_Request | Handle access requests | Power Automate flow |
| MCMAP_Session_Start | Session initialization topic | Copilot Studio topic |
| MCMAP_Access_Check | Content access verification | Copilot Studio topic |
| MCMAP_Request_Access | Access request handling | Copilot Studio topic |

---

## 4. MICROSOFT DIRECTORY INTEGRATION

### 4.1 Microsoft Graph API Fields

The platform captures these attributes from Microsoft Entra ID (Azure AD):

| eap_user_profile Field | Graph API Property | Description |
|------------------------|-------------------|-------------|
| user_id | id | Azure AD user GUID |
| display_name | displayName | Full name |
| email | mail, userPrincipalName | Email address |
| job_title | jobTitle | Job title |
| employee_level | extension_employeeLevel | Employee level (parsed from title if not available) |
| department | department | Department name |
| team | extension_team | Team name |
| division | extension_division, companyName | Business division |
| region | usageLocation, extension_region | Geographic region |
| country | country | Country |
| office_location | officeLocation | Office location |
| cost_center | extension_costCenter | Cost center code |
| company_name | companyName | Legal entity |
| manager_id | manager.id | Direct manager's ID |
| manager_display_name | manager.displayName | Manager's name |

### 4.2 Employee Level Detection

Employee level is determined by:

1. **Extension Attribute**: extension_{app_id}_employeeLevel (preferred)
2. **Job Title Parsing**: Keywords extracted from jobTitle:
   - "CEO", "Chief" -> CEO
   - "Executive Vice President", "EVP" -> EVP
   - "Senior Vice President", "SVP" -> SVP
   - "Vice President", "VP" -> VP
   - "Director" -> Director
   - "Senior Manager" -> Senior Manager
   - "Manager" -> Manager
   - "Senior" -> Senior Analyst
   - "Analyst" -> Analyst
   - Default -> Associate

### 4.3 Security Group Membership

Security groups are captured for group-based access rules:

```json
{
  "security_groups": [
    {"id": "guid-1", "displayName": "MCMAP-Executive-Access"},
    {"id": "guid-2", "displayName": "Marketing-Services-All"},
    {"id": "guid-3", "displayName": "Data-Services-Leadership"}
  ]
}
```

### 4.4 Manager Chain

Manager hierarchy is captured up to 10 levels for manager-based access:

```json
{
  "manager_chain": [
    {"id": "guid-1", "displayName": "Direct Manager", "level": 1},
    {"id": "guid-2", "displayName": "VP", "level": 2},
    {"id": "guid-3", "displayName": "SVP", "level": 3}
  ]
}
```

---

## 5. DATAVERSE TABLES

### 5.1 eap_security_config

Global security settings and toggles.

| config_key | Default | Description |
|------------|---------|-------------|
| ABAC_ENABLED | false | Master toggle for full ABAC |
| CSUITE_PROTECTION_ENABLED | true | C-Suite protection always on |
| PROFILE_TRACKING_ENABLED | true | Capture user profiles |
| ACCESS_REQUEST_ENABLED | true | Enable access request workflow |
| CACHE_TTL_HOURS | 24 | Profile cache duration |
| DIRECTORY_SYNC_ENABLED | true | Sync from Microsoft Directory |
| DEFAULT_ACCESS | ALLOW | Default when no rule matches |
| LOG_ACCESS_CHECKS | true | Log access decisions to telemetry |

### 5.2 eap_user_profile

Full user profile from Microsoft Directory. See Section 4.1 for field mapping.

**Cache Behavior:**
- Profile refreshed when older than CACHE_TTL_HOURS
- Forced refresh on session start if stale
- Manual refresh available via flow trigger

### 5.3 eap_access_rule

Flexible attribute-based access rules with JSON conditions.

| Field | Description |
|-------|-------------|
| rule_name | Descriptive rule name |
| rule_type | AGENT, CONTENT_SET, DOCUMENT, CAPABILITY, DATA_AREA |
| target_pattern | What this rule protects (supports wildcards) |
| conditions_json | JSON conditions that must be met |
| condition_logic | ALL (AND) or ANY (OR) |
| applies_when_abac_off | Does this rule apply in Launch Mode? |
| priority | Higher = evaluated first |
| denial_message | Custom denial message |

### 5.4 eap_access_request

Track access requests and resolutions.

| Field | Description |
|-------|-------------|
| user_id | Requesting user |
| user_display_name | User's name |
| user_department | User's department |
| user_employee_level | User's level |
| requested_content | What they want access to |
| justification | Why they need access |
| request_status | PENDING, APPROVED, DENIED |
| requested_at | When submitted |
| resolved_at | When resolved |
| resolved_by | Who resolved it |

---

## 6. POWER AUTOMATE FLOWS

### 6.1 MCMAP_User_Profile_Sync

**Trigger:** HTTP request from Copilot Studio on session start

**Purpose:** Sync user profile from Microsoft Directory

**Flow:**
1. Check if profile exists and is within cache TTL
2. If stale or missing, call Microsoft Graph API
3. Parse employee level from extension or job title
4. Get manager chain (up to 10 levels)
5. Get security group memberships
6. Upsert to eap_user_profile
7. Return complete profile

**File:** `release/v6.0/platform/flows/MCMAP_User_Profile_Sync.json`

### 6.2 MCMAP_Check_Content_Access

**Trigger:** HTTP request before returning protected content

**Purpose:** Evaluate ABAC rules against user attributes

**Flow:**
1. Get user profile from eap_user_profile
2. Check ABAC_ENABLED and CSUITE_PROTECTION_ENABLED
3. Query matching rules from eap_access_rule
4. Filter rules by mode (applies_when_abac_off)
5. Evaluate conditions for each matching rule
6. Return access decision with denial message if denied
7. Log to eap_telemetry if LOG_ACCESS_CHECKS enabled

**File:** `release/v6.0/platform/flows/MCMAP_Check_Content_Access.json`

### 6.3 MCMAP_Access_Request

**Trigger:** HTTP request when user says "request access"

**Purpose:** Handle access request workflow

**Flow:**
1. Check if ACCESS_REQUEST_ENABLED
2. Get full user profile
3. Check for duplicate pending request
4. Create eap_access_request record
5. Send email to Platform Owner (hardcoded, never exposed)
6. Log to eap_telemetry
7. Return request ID to user

**File:** `release/v6.0/platform/flows/MCMAP_Access_Request.json`

---

## 7. COPILOT STUDIO TOPICS

### 7.1 MCMAP_Session_Start

**Trigger:** Conversation Start

**Purpose:** Initialize session and sync user profile

**Actions:**
1. Get System.User.Id
2. Call MCMAP_User_Profile_Sync flow
3. Store profile in session variables
4. Continue to agent greeting

### 7.2 MCMAP_Access_Check (Internal)

**Trigger:** Called before protected content retrieval

**Purpose:** Verify user access

**Actions:**
1. Call MCMAP_Check_Content_Access flow
2. If granted: Return true, proceed
3. If denied: Display denial message, offer access request

### 7.3 MCMAP_Request_Access

**Trigger Phrases:** "request access", "I need access", "how do I get access"

**Purpose:** Handle access request

**Actions:**
1. Ask: "What content would you like access to?"
2. Ask: "Please briefly describe why you need this access."
3. Call MCMAP_Access_Request flow
4. Display confirmation with request ID
5. Never display Platform Owner email

---

## 8. ACCESS RULES CONFIGURATION

### 8.1 Rule File Location

`release/v6.0/platform/security/mcmap_access_rules.yaml`

### 8.2 Condition Operators

| Operator | Description | Example |
|----------|-------------|---------|
| EQUALS | Exact match | department EQUALS "Finance" |
| NOT_EQUALS | Not equal | region NOT_EQUALS "APAC" |
| IN | Value in list | employee_level IN ["EVP", "SVP"] |
| NOT_IN | Value not in list | division NOT_IN ["Corporate"] |
| CONTAINS | String contains | job_title CONTAINS "Director" |
| STARTS_WITH | String starts with | department STARTS_WITH "Marketing" |
| MEMBER_OF | Security group | security_group MEMBER_OF "MCMAP-*" |
| MANAGER_CHAIN | Manager hierarchy | manager_chain CONTAINS "user-guid" |
| REGEX | Regular expression | cost_center REGEX "^[0-9]{4}$" |

### 8.3 Rule Types

| Type | Protects | Example Pattern |
|------|----------|-----------------|
| AGENT | Agent access | "ORC", "ANL" |
| CONTENT_SET | Document groups | "00-MCMAP_CEO_*.md" |
| DOCUMENT | Single document | "09A-MCMAP_Investment_Proposal.md" |
| CAPABILITY | Capabilities | "ANL_BUDGET_OPTIMIZATION" |
| DATA_AREA | Data subsets | "mpa_benchmark.region_na_*" |

### 8.4 Pre-Configured Rules

**Launch Mode (applies_when_abac_off: true):**
- C-Suite Executive Briefs
- Investment Proposal

**Full ABAC Mode (applies_when_abac_off: false):**
- Technical Architecture Documentation
- Marketing Services Content
- Consulting-Only Content
- Regional Data Access (NA, Europe, APAC)
- Division-Specific Access
- Financial Benchmark Data
- Public Documentation

---

## 9. AGENT INTEGRATION

### 9.1 DOCS Agent

The DOCS agent serves protected content and enforces access control:

**Instructions Addition (DOCS_Instructions_v6.txt):**
```
ACCESS CONTROL

This agent enforces attribute-based access policies integrated with the
Mastercard directory. Before returning executive content, verify user access.

Protected content requiring executive access:
- 00-MCMAP_CEO_Brief.md
- 00-A-MCMAP_Chief_Consulting_Officer.md
- 00-B-MCMAP_Chief_Technology_Officer.md
- 00-C-MCMAP_Chief_AI_Officer.md
- 00-D-MCMAP_Chief_Revenue_Officer.md
- 09A-MCMAP_Investment_Proposal.md

If user requests protected content:
- Call MCMAP_Check_Content_Access flow
- If granted: Return the content
- If denied: Display denial message from flow response

When access denied display generic message and offer access request.
Never reveal Platform Owner email or specific access conditions.
```

### 9.2 ORC Agent

The ORC agent routes to DOCS for protected content:

**Instructions Addition (ORC_Copilot_Instructions_v4.txt):**
```
ACCESS CONTROL

This agent enforces attribute-based access policies integrated with the
Mastercard directory. User profile is synced on session start via
MCMAP_User_Profile_Sync flow.

When routing to DOCS for executive content:
- If user requests CEO Brief or C-Suite briefs, inform them DOCS will verify
- Do not pre-check access, let DOCS handle verification

When user says request access:
- Route to DOCS agent which handles access request workflow
- Do not reveal Platform Owner email address
```

### 9.3 Other Agents

Other agents (ANL, AUD, CHA, SPO, DOC, PRF, CST, CHG, MKT) do not require instruction changes:
- They do not serve protected documentation
- Access control is enforced at flow/topic level
- Profile tracking happens independently via session start

---

## 10. ACCESS REQUEST WORKFLOW

### 10.1 User Experience

1. User requests protected content
2. Access denied with message: "This content requires specific access permissions. To request access, say 'request access' and I'll submit your request."
3. User says "request access"
4. System asks: "What content would you like access to?"
5. System asks: "Please briefly describe why you need this access."
6. Request submitted with confirmation: "Your request has been submitted. Request ID: REQ-abc12345. The Platform team typically responds within 2 business days."

### 10.2 Platform Owner Experience

Platform Owner receives email with:
- Request ID
- Requester name, email, title
- Employee level, department, division, region
- Requested content
- Justification
- Rule that triggered denial

### 10.3 Resolution

Platform Owner updates eap_access_request record in Dataverse:
- request_status: APPROVED or DENIED
- resolved_at: Current timestamp
- resolved_by: Admin name
- resolution_notes: Explanation

---

## 11. USAGE REPORTING

### 11.1 Available Dimensions

With full directory integration, generate reports by:

| Dimension | Source | Example |
|-----------|--------|---------|
| Employee Level | eap_user_profile.employee_level | EVP, SVP, VP, Director, Manager |
| Department | eap_user_profile.department | Marketing Services, Engineering |
| Team | eap_user_profile.team | Media Planning, Analytics |
| Division | eap_user_profile.division | Data & Services, Network |
| Region | eap_user_profile.region | North America, Europe, APAC |
| Country | eap_user_profile.country | United States, United Kingdom |
| Office | eap_user_profile.office_location | Purchase, London, Singapore |

### 11.2 Telemetry Fields for Reporting

The eap_telemetry table includes:
- user_id
- user_display_name
- user_employee_level
- user_department
- user_division
- user_region
- content_requested
- access_granted
- access_rule_applied

### 11.3 Sample Queries

**Usage by Employee Level:**
```sql
SELECT user_employee_level, COUNT(*) as sessions
FROM eap_telemetry
WHERE event_type = 'SESSION_START'
GROUP BY user_employee_level
ORDER BY sessions DESC
```

**Adoption by Department:**
```sql
SELECT user_department, COUNT(DISTINCT user_id) as unique_users
FROM eap_telemetry
WHERE timestamp >= DATEADD(month, -1, GETDATE())
GROUP BY user_department
ORDER BY unique_users DESC
```

**Access Denial Trends:**
```sql
SELECT content_requested, COUNT(*) as denials
FROM eap_telemetry
WHERE event_type = 'ACCESS_CHECK' AND access_granted = false
GROUP BY content_requested
ORDER BY denials DESC
```

---

## 12. OPERATIONAL PROCEDURES

### 12.1 Enabling Full ABAC

1. Review current usage patterns in telemetry
2. Confirm all required rules are configured in mcmap_access_rules.yaml
3. Sync rules to eap_access_rule table
4. Update eap_security_config: ABAC_ENABLED = true
5. Monitor access denials for first 24 hours
6. Adjust rules as needed

### 12.2 Adding New Rules

1. Edit mcmap_access_rules.yaml
2. Define rule with appropriate:
   - target_pattern
   - conditions_json
   - applies_when_abac_off (usually false)
   - priority
   - denial_message
3. Sync to Dataverse
4. Test with representative users

### 12.3 Modifying User Access

**Grant Temporary Access:**
1. Add user to appropriate security group in Azure AD
2. Profile will refresh on next session (or force refresh)

**Approve Access Request:**
1. Open eap_access_request record
2. Update request_status to APPROVED
3. Add user to appropriate security group
4. Update resolution_notes

### 12.4 Monitoring

**Daily Checks:**
- Review access denial count
- Check for unusual access patterns
- Monitor access request queue

**Weekly Checks:**
- Usage by department/level trends
- Access request resolution time
- Rule effectiveness review

---

## 13. TROUBLESHOOTING

### 13.1 User Cannot Access Expected Content

1. Check user profile in eap_user_profile
2. Verify employee_level, department, division are correct
3. Check if applicable rules exist in eap_access_rule
4. Verify rule conditions match user attributes
5. Check if ABAC_ENABLED is set correctly

### 13.2 Profile Not Syncing

1. Check DIRECTORY_SYNC_ENABLED in eap_security_config
2. Verify Microsoft Graph API permissions
3. Check flow run history for MCMAP_User_Profile_Sync
4. Confirm user exists in Azure AD

### 13.3 Access Request Not Received

1. Check ACCESS_REQUEST_ENABLED in eap_security_config
2. Verify Office 365 connector has send mail permission
3. Check flow run history for MCMAP_Access_Request
4. Confirm eap_access_request record was created

### 13.4 Rules Not Enforcing

1. Verify rule is_active = true
2. Check applies_when_abac_off for current mode
3. Verify target_pattern matches content identifier
4. Check condition_logic (ALL vs ANY)
5. Review conditions_json syntax

---

## APPENDIX A: SECURITY PRINCIPLES

1. **Never reveal Platform Owner email** - Use generic "Platform team" messaging
2. **Never disclose specific access conditions** - Don't tell users exactly what they need
3. **Never bypass access controls** - No workarounds, even for executives
4. **Never hint at workarounds** - Don't suggest "ask your manager for access"
5. **Log everything** - All access checks and requests for audit
6. **Fail closed** - If access check errors, deny access

---

## APPENDIX B: FILE INVENTORY

| File Path | Purpose |
|-----------|---------|
| `platform/dataverse/eap_security_config.csv` | Security settings seed data |
| `platform/dataverse/eap_user_profile_schema.json` | User profile schema |
| `platform/dataverse/eap_access_rule_schema.json` | Access rule schema |
| `platform/dataverse/eap_access_request_schema.json` | Access request schema |
| `platform/security/mcmap_access_rules.yaml` | Master rules configuration |
| `platform/flows/MCMAP_User_Profile_Sync.json` | Profile sync flow spec |
| `platform/flows/MCMAP_Check_Content_Access.json` | Access check flow spec |
| `platform/flows/MCMAP_Access_Request.json` | Access request flow spec |
| `agents/docs/instructions/DOCS_Instructions_v6.txt` | DOCS instructions with access control |
| `solutions/agents/orc/instructions/ORC_Copilot_Instructions_v4.txt` | ORC instructions with access routing |
| `docs/mcmap-reference-packet/KB-MCMAP_DOCS_Persona_Responses.md` | Persona responses for RAG |

---

**Document Version:** 1.0
**Classification:** Mastercard Internal - Security Sensitive
**Last Updated:** January 24, 2026
