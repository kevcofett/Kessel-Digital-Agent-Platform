# Corporate Deployment Addendum

## Overview

This addendum covers additional requirements and configurations specific to corporate (Mastercard) environment deployment. Complete the base DEPLOYMENT_GUIDE.md first, then follow these additional steps.

## Corporate Environment Constraints

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| No external APIs | Cannot call services outside corporate network | Feature flags disable external calls |
| Limited web search | Cannot access public web | Use internal SharePoint/Confluence |
| Copilot/ChatGPT only | No Claude, GPT-4 direct access | All prompts compatible with Copilot |
| Strict firewall | All traffic filtered | Whitelist required endpoints |
| SSO mandatory | Microsoft authentication only | Use Entra ID |
| Teams channel | Primary interface | Deploy via Teams app |
| Data isolation | No external data transfer | Row-level security, audit logging |

## Additional Setup Steps

### Step A: Configure Corporate Feature Flags

Update `eap_featureflag` table with corporate defaults:

| Flag | Corporate Default | Reason |
|------|-------------------|--------|
| mpa_enable_web_search | **false** | External access restricted |
| mpa_enable_external_api | **false** | External access restricted |
| int_enable_confluence_search | **true** | Internal knowledge source |
| int_enable_sharepoint_search | **true** | Internal knowledge source |
| sec_enable_audit_logging | **true** | Compliance requirement |
| sec_require_data_classification | **true** | Data governance |
| sec_enable_row_level_security | **true** | Access control |
| ui_show_debug_info | **false** | Production security |

### Step B: Create Access Control Hierarchy

#### B.1: Create Extension Tables

In Dataverse, create these tables (schemas in `/platform/eap-core/extensions/`):

```
eap_businessunit
  - eap_businessunitid (Primary Key)
  - eap_bucode (String, 10)
  - eap_buname (String, 200)
  - eap_status (Choice: Active/Inactive)

eap_department
  - eap_departmentid (Primary Key)
  - eap_businessunitid (Lookup → eap_businessunit)
  - eap_deptcode (String, 20)
  - eap_deptname (String, 200)
  - eap_status (Choice)

eap_team
  - eap_teamid (Primary Key)
  - eap_departmentid (Lookup → eap_department)
  - eap_teamcode (String, 20)
  - eap_teamname (String, 200)
  - eap_status (Choice)

eap_pod
  - eap_podid (Primary Key)
  - eap_teamid (Lookup → eap_team)
  - eap_podcode (String, 20)
  - eap_podname (String, 200)
  - eap_status (Choice)

eap_userassignment
  - eap_userassignmentid (Primary Key)
  - eap_userid (Lookup → eap_user)
  - eap_businessunitid (Lookup)
  - eap_departmentid (Lookup)
  - eap_teamid (Lookup)
  - eap_podid (Lookup)
  - eap_accesslevel (Choice: Pod/Team/Dept/BU/Global)
  - eap_effectivedate (DateTime)
  - eap_expirationdate (DateTime, optional)
```

#### B.2: Populate Hierarchy

Import organizational structure:

```sql
-- Example: Marketing Business Unit
INSERT INTO eap_businessunit (eap_bucode, eap_buname, eap_status)
VALUES ('MKT', 'Marketing', 1);

-- Example: Brand Strategy Department under Marketing
INSERT INTO eap_department (eap_businessunitid, eap_deptcode, eap_deptname, eap_status)
VALUES ({MKT_ID}, 'BRAND', 'Brand Strategy', 1);

-- Continue for Teams, Pods...
```

#### B.3: Assign Users

Map users to their organizational position:

```sql
INSERT INTO eap_userassignment 
(eap_userid, eap_businessunitid, eap_departmentid, eap_teamid, eap_podid, eap_accesslevel, eap_effectivedate)
VALUES ({USER_ID}, {BU_ID}, {DEPT_ID}, {TEAM_ID}, {POD_ID}, 'Pod', GETDATE());
```

### Step C: Configure Row-Level Security

#### C.1: Create Security Roles in Dataverse

```
MPA User - Pod Level
  - Read: Own records + Pod records
  - Create: Yes
  - Update: Own records only
  - Delete: Own records only

MPA Manager - Team Level
  - Read: Own records + Team records
  - Create: Yes
  - Update: Own + direct report records
  - Delete: Own records only
  - Approve: Team records

MPA Director - Department Level
  - Read: All Department records
  - Create: Yes
  - Update: Department records
  - Delete: Own records only
  - Approve: Department records

MPA Admin - Global
  - Full access to all MPA records
```

#### C.2: Apply Security Roles to Tables

Configure on each MPA table (mpa_mediaplan, mpa_plansection, etc.):
- Enable row-level security
- Configure based on eap_userassignment hierarchy

### Step D: Configure Audit Logging

#### D.1: Create Audit Table

```
eap_auditlog
  - eap_auditlogid (Primary Key)
  - eap_timestamp (DateTime)
  - eap_userid (Lookup)
  - eap_agentcode (String)
  - eap_sessionid (Lookup)
  - eap_eventtype (Choice: Query/Create/Update/Delete/Access/Export)
  - eap_entityname (String)
  - eap_recordid (String)
  - eap_details (Memo - JSON)
  - eap_ipaddress (String)
  - eap_correlationid (String)
```

#### D.2: Create Audit Flow

Create Power Automate flow `eap_log_audit_event`:
- Triggered by HTTP request
- Inserts record into eap_auditlog
- Called by all data access operations when `sec_enable_audit_logging = true`

### Step E: Configure Data Sources

#### E.1: Create Data Source Table

```
eap_datasource
  - eap_datasourceid (Primary Key)
  - eap_sourcecode (String, 50)
  - eap_sourcename (String, 200)
  - eap_sourcetype (Choice: Internal/External/Hybrid)
  - eap_connectiontype (Choice: SharePoint/Graph/HTTP/Custom)
  - eap_baseurl (String, 500)
  - eap_authmethod (Choice: SSO/ServiceAccount/APIKey/Certificate)
  - eap_featureflag (String, 100)
  - eap_status (Choice: Active/Inactive)
  - eap_config (Memo - JSON)
```

#### E.2: Register Data Sources

```json
// SharePoint
{
  "eap_sourcecode": "SHAREPOINT",
  "eap_sourcename": "Mastercard SharePoint",
  "eap_sourcetype": 1,
  "eap_connectiontype": 1,
  "eap_baseurl": "https://mastercard.sharepoint.com",
  "eap_authmethod": 1,
  "eap_featureflag": "int_enable_sharepoint_search",
  "eap_status": 1
}

// Confluence (via Graph API)
{
  "eap_sourcecode": "CONFLUENCE",
  "eap_sourcename": "Mastercard Confluence",
  "eap_sourcetype": 1,
  "eap_connectiontype": 2,
  "eap_baseurl": "https://graph.microsoft.com/v1.0/sites/{site-id}",
  "eap_authmethod": 1,
  "eap_featureflag": "int_enable_confluence_search",
  "eap_status": 1
}
```

### Step F: Deploy via Teams Channel

#### F.1: Create Teams App Package

1. In Copilot Studio, publish agent
2. Select "Microsoft Teams" channel
3. Download Teams app package

#### F.2: Deploy to Teams Admin Center

1. Open Teams Admin Center
2. Navigate to Teams apps > Manage apps
3. Upload custom app package
4. Configure app policies for target users/groups

#### F.3: Configure App Permissions

- Ensure SSO is enabled
- Configure Graph API permissions if needed
- Set up consent flow for first-time users

### Step G: Security Hardening

#### G.1: Network Configuration

Whitelist required endpoints:
- Dataverse: `https://{org}.crm.dynamics.com`
- SharePoint: `https://{tenant}.sharepoint.com`
- Azure Functions: `https://{app}.azurewebsites.net`
- Graph API: `https://graph.microsoft.com`

#### G.2: Disable Development Features

```
Feature Flags to Disable:
- ui_show_debug_info = false
- ui_show_advanced_options = false
- eap_enable_cross_agent_handoff = false (until tested)
```

#### G.3: Configure Data Classification

Require sensitivity labels on all exports:
- Update document generation flow to require classification
- Enable `sec_require_data_classification` flag
- Configure available classification levels (Internal, Confidential, Restricted)

## Corporate Verification Checklist

- [ ] Feature flags set to corporate defaults
- [ ] Access control hierarchy tables created
- [ ] Organizational structure imported
- [ ] Users assigned to hierarchy nodes
- [ ] Row-level security roles created
- [ ] Security roles applied to tables
- [ ] Audit logging table and flow created
- [ ] Data sources registered
- [ ] Teams app package deployed
- [ ] App policies configured
- [ ] Network endpoints whitelisted
- [ ] Development features disabled
- [ ] Data classification enabled
- [ ] End-to-end test with production user

## Corporate Support

For corporate environment issues:
1. Check audit logs for access/permission issues
2. Verify user hierarchy assignment
3. Confirm feature flags for requested functionality
4. Contact IT for network/firewall issues
5. Escalate to platform team for agent issues
