# MASTERCARD DEPLOYMENT PLACEHOLDER WORKSHEET

## Purpose

This worksheet contains EVERY placeholder value required for MPA v5.5 deployment to the Mastercard corporate environment. Complete ALL sections before beginning deployment. Missing values will block deployment progress.

## Instructions

1. Work through each section in order
2. Fill in the Value column for each placeholder
3. Use the Where to Find column for guidance on locating each value
4. Complete the validation checklist at the end before proceeding

---

## SECTION 1: AZURE ACTIVE DIRECTORY / TENANT

These values identify the Mastercard Azure AD tenant and are required for all authentication and authorization.

| Placeholder | Value | Where to Find |
|-------------|-------|---------------|
| {MASTERCARD_TENANT_ID} | ________________________________ | Azure Portal > Azure Active Directory > Overview > Tenant ID (GUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx) |
| {MASTERCARD_TENANT_NAME} | ________________________________ | Azure Portal > Azure Active Directory > Overview > Primary domain (e.g., mastercard.onmicrosoft.com, use only the prefix before .onmicrosoft.com) |
| {MASTERCARD_TENANT_DOMAIN} | ________________________________ | The full primary domain including .onmicrosoft.com suffix |
| {MASTERCARD_CUSTOM_DOMAIN} | ________________________________ | Custom domain if configured (e.g., mastercard.com) - Optional, leave blank if not applicable |

### Validation for Section 1

- [ ] Tenant ID is in GUID format (8-4-4-4-12 hexadecimal characters)
- [ ] Tenant name does not include .onmicrosoft.com suffix
- [ ] You have confirmed access to this tenant with appropriate admin permissions

---

## SECTION 2: APP REGISTRATION

An Azure AD App Registration is required for authentication between components. Create this before filling in values.

| Placeholder | Value | Where to Find |
|-------------|-------|---------------|
| {MASTERCARD_APP_CLIENT_ID} | ________________________________ | Azure Portal > App Registrations > [MPA App] > Overview > Application (client) ID |
| {MASTERCARD_APP_CLIENT_SECRET} | ________________________________ | Azure Portal > App Registrations > [MPA App] > Certificates & secrets > Client secrets > Value (copy immediately after creation, not visible later) |
| {MASTERCARD_APP_OBJECT_ID} | ________________________________ | Azure Portal > App Registrations > [MPA App] > Overview > Object ID |

### Required API Permissions for App Registration

Before proceeding, ensure the App Registration has these permissions granted:

| API | Permission | Type | Status |
|-----|------------|------|--------|
| Dynamics CRM | user_impersonation | Delegated | [ ] Granted |
| Microsoft Graph | User.Read | Delegated | [ ] Granted |
| Microsoft Graph | Sites.Read.All | Application | [ ] Granted |
| Microsoft Graph | Files.Read.All | Application | [ ] Granted |

### Validation for Section 2

- [ ] App Registration created with name: MPA-MediaPlanningAgent-Prod (or similar)
- [ ] Client ID is in GUID format
- [ ] Client secret copied and stored securely (expires: note date ____________)
- [ ] All required API permissions granted with admin consent

---

## SECTION 3: DATAVERSE / POWER PLATFORM

These values connect to the Dataverse environment where MPA tables and data reside.

| Placeholder | Value | Where to Find |
|-------------|-------|---------------|
| {MASTERCARD_DATAVERSE_URL} | ________________________________ | Power Platform Admin Center > Environments > [Environment] > Environment URL (format: https://orgname.crm.dynamics.com) |
| {MASTERCARD_DATAVERSE_API_URL} | ________________________________ | Same as above but with API path (format: https://orgname.api.crm.dynamics.com/api/data/v9.2) |
| {MASTERCARD_ENVIRONMENT_ID} | ________________________________ | Power Platform Admin Center > Environments > [Environment] > Environment ID (GUID format) |
| {MASTERCARD_ENVIRONMENT_NAME} | ________________________________ | Power Platform Admin Center > Environments > [Environment] > Display name |
| {MASTERCARD_ORG_ID} | ________________________________ | Dataverse > Settings > Customizations > Developer Resources > Organization ID |
| {MASTERCARD_ORG_UNIQUE_NAME} | ________________________________ | Dataverse > Settings > Customizations > Developer Resources > Unique Name |
| {MASTERCARD_SOLUTION_PUBLISHER_PREFIX} | ________________________________ | Dataverse > Settings > Solutions > Publisher > Prefix (typically 3-5 characters, e.g., mcard) |

### Validation for Section 3

- [ ] Dataverse URL accessible in browser (shows Power Apps home or login)
- [ ] API URL returns metadata when accessed with authentication
- [ ] Environment ID is in GUID format
- [ ] You have System Administrator or System Customizer role in this environment

---

## SECTION 4: SHAREPOINT

SharePoint hosts the MPA Knowledge Base files that Copilot Studio references.

| Placeholder | Value | Where to Find |
|-------------|-------|---------------|
| {MASTERCARD_SHAREPOINT_URL} | ________________________________ | SharePoint > Site URL (format: https://mastercard.sharepoint.com/sites/SiteName) |
| {MASTERCARD_SHAREPOINT_SITE_NAME} | ________________________________ | The site name portion of the URL (e.g., MPAKnowledgeBase) |
| {MASTERCARD_SHAREPOINT_SITE_ID} | ________________________________ | SharePoint > Site Settings > Site Collection ID, or via Graph API |
| {MASTERCARD_KB_LIBRARY_NAME} | ________________________________ | Document library name for KB files (recommend: MediaPlanningKB) |
| {MASTERCARD_KB_LIBRARY_ID} | ________________________________ | SharePoint > Library Settings > Library ID |

### SharePoint Site Requirements

Before proceeding, ensure the SharePoint site has:

| Requirement | Status |
|-------------|--------|
| Site created and accessible | [ ] Complete |
| Document library created with name from above | [ ] Complete |
| Copilot Studio service principal has read access | [ ] Complete |
| Indexing enabled for document library | [ ] Complete |

### Validation for Section 4

- [ ] SharePoint URL accessible in browser
- [ ] Document library exists and is empty (ready for KB upload)
- [ ] You have Site Collection Administrator or Site Owner permissions

---

## SECTION 5: AZURE FUNCTIONS

Azure Functions provide serverless compute for benchmark lookups, session management, and document generation.

| Placeholder | Value | Where to Find |
|-------------|-------|---------------|
| {MASTERCARD_FUNCTION_APP_NAME} | ________________________________ | Azure Portal > Function Apps > [App Name] (recommend: func-mastercard-mpa) |
| {MASTERCARD_FUNCTION_APP_URL} | ________________________________ | Azure Portal > Function Apps > [App] > Overview > URL (format: https://funcname.azurewebsites.net) |
| {MASTERCARD_FUNCTION_APP_KEY} | ________________________________ | Azure Portal > Function Apps > [App] > Functions > App keys > default or _master |
| {MASTERCARD_FUNCTION_RESOURCE_GROUP} | ________________________________ | Azure Portal > Function Apps > [App] > Overview > Resource group |
| {MASTERCARD_FUNCTION_SUBSCRIPTION_ID} | ________________________________ | Azure Portal > Subscriptions > [Subscription] > Subscription ID |
| {MASTERCARD_FUNCTION_REGION} | ________________________________ | Azure Portal > Function Apps > [App] > Overview > Location (e.g., East US, West Europe) |
| {MASTERCARD_STORAGE_ACCOUNT_NAME} | ________________________________ | Azure Portal > Function Apps > [App] > Configuration > AzureWebJobsStorage connection string > Account name |
| {MASTERCARD_STORAGE_CONNECTION_STRING} | ________________________________ | Azure Portal > Storage Accounts > [Account] > Access keys > Connection string |

### Azure Functions to Deploy

| Function Name | Purpose | Endpoint |
|---------------|---------|----------|
| SearchBenchmarks | Benchmark data lookup | /api/benchmarks/search |
| SessionManager | Session CRUD operations | /api/sessions/* |
| GapAnalyzer | Media plan gap analysis | /api/analyze/gaps |
| DocumentGenerator | Word/PDF generation | /api/documents/generate |
| HealthCheck | Deployment verification | /api/health |
| BudgetOptimizer | Budget allocation | /api/optimize/budget |
| ChannelRecommender | Channel recommendations | /api/recommend/channels |
| AuditLogger | Audit trail recording | /api/audit/log |

### Validation for Section 5

- [ ] Function App created in Azure
- [ ] Runtime stack: Node.js 18 LTS or Python 3.11
- [ ] App key copied and stored securely
- [ ] Managed Identity enabled (System Assigned)
- [ ] Managed Identity granted Dataverse access

---

## SECTION 6: COPILOT STUDIO

Copilot Studio hosts the MPA agent that users interact with.

| Placeholder | Value | Where to Find |
|-------------|-------|---------------|
| {MASTERCARD_COPILOT_ENV_URL} | ________________________________ | Copilot Studio > Settings > Environment (format: https://copilotstudio.microsoft.com/environments/{env-id}) |
| {MASTERCARD_COPILOT_BOT_ID} | ________________________________ | Copilot Studio > [Agent] > Settings > Bot ID (created after agent setup) |
| {MASTERCARD_COPILOT_BOT_NAME} | ________________________________ | Display name for the agent (recommend: Media Planning Agent) |
| {MASTERCARD_COPILOT_SCHEMA_NAME} | ________________________________ | Internal schema name (recommend: mpa_mediaplanning_agent) |

### Copilot Studio Configuration Checklist

| Configuration Item | Status |
|-------------------|--------|
| Agent created in correct environment | [ ] Complete |
| Instructions pasted (7,808 characters) | [ ] Complete |
| SharePoint KB connected as knowledge source | [ ] Complete |
| All 11 Power Automate flows connected | [ ] Complete |
| Authentication configured for SSO | [ ] Complete |
| Published to Teams channel | [ ] Complete |

### Validation for Section 6

- [ ] Copilot Studio accessible for this environment
- [ ] You have Environment Maker or higher role
- [ ] Teams channel deployment is permitted in this tenant

---

## SECTION 7: MICROSOFT TEAMS

If deploying MPA to Teams (recommended for Mastercard).

| Placeholder | Value | Where to Find |
|-------------|-------|---------------|
| {MASTERCARD_TEAMS_APP_ID} | ________________________________ | Teams Admin Center > Manage apps > [MPA App] > App ID |
| {MASTERCARD_TEAMS_CHANNEL_ID} | ________________________________ | Teams > [Team] > [Channel] > Get link to channel > Extract channel ID from URL |
| {MASTERCARD_TEAMS_TEAM_ID} | ________________________________ | Teams > [Team] > Get link to team > Extract team ID from URL |

### Teams Deployment Checklist

| Configuration Item | Status |
|-------------------|--------|
| Custom app upload permitted in tenant | [ ] Verified |
| App catalog configured | [ ] Complete |
| Target team/channel identified | [ ] Complete |
| App permissions reviewed and approved | [ ] Complete |

### Validation for Section 7

- [ ] Teams Admin Center accessible
- [ ] Custom app policies allow MPA deployment
- [ ] Target users have Teams licenses

---

## SECTION 8: MONITORING AND LOGGING

For production monitoring and troubleshooting.

| Placeholder | Value | Where to Find |
|-------------|-------|---------------|
| {MASTERCARD_APP_INSIGHTS_KEY} | ________________________________ | Azure Portal > Application Insights > [Instance] > Overview > Instrumentation Key |
| {MASTERCARD_APP_INSIGHTS_CONNECTION_STRING} | ________________________________ | Azure Portal > Application Insights > [Instance] > Overview > Connection String |
| {MASTERCARD_LOG_ANALYTICS_WORKSPACE_ID} | ________________________________ | Azure Portal > Log Analytics workspaces > [Workspace] > Overview > Workspace ID |
| {MASTERCARD_LOG_ANALYTICS_KEY} | ________________________________ | Azure Portal > Log Analytics workspaces > [Workspace] > Agents > Primary key |

### Monitoring Configuration Checklist

| Configuration Item | Status |
|-------------------|--------|
| Application Insights instance created | [ ] Complete |
| Log Analytics workspace configured | [ ] Complete |
| Diagnostic settings enabled on Function App | [ ] Complete |
| Alert rules configured for failures | [ ] Complete |
| Dashboard created for operations | [ ] Optional |

### Validation for Section 8

- [ ] Application Insights receiving telemetry
- [ ] Log Analytics queries returning results
- [ ] Alert notification channel configured (email, Teams, etc.)

---

## SECTION 9: SECURITY CONFIGURATION

Mastercard-specific security settings.

| Placeholder | Value | Where to Find |
|-------------|-------|---------------|
| {MASTERCARD_DATA_CLASSIFICATION_DEFAULT} | ________________________________ | Mastercard data classification policy (recommend: Internal) |
| {MASTERCARD_AUDIT_RETENTION_DAYS} | ________________________________ | Audit log retention period in days (recommend: 90) |
| {MASTERCARD_SESSION_TIMEOUT_MINUTES} | ________________________________ | Session timeout in minutes (recommend: 60) |
| {MASTERCARD_MAX_TOKENS_PER_REQUEST} | ________________________________ | Token limit for LLM requests (recommend: 4000) |

### Security Features to Enable

| Feature | Setting | Status |
|---------|---------|--------|
| Row-Level Security | Enabled | [ ] Configured |
| Audit Logging | Enabled | [ ] Configured |
| Data Firewall | Enabled (no external APIs) | [ ] Configured |
| Web Search | Disabled | [ ] Configured |
| External Data Sources | Disabled | [ ] Configured |
| SSO Required | Enabled | [ ] Configured |

### Validation for Section 9

- [ ] Security settings align with Mastercard InfoSec policies
- [ ] Data classification labels approved
- [ ] Audit logging verified operational

---

## SECTION 10: ACCESS CONTROL HIERARCHY

Mastercard's organizational hierarchy for row-level security.

| Placeholder | Value | Where to Find |
|-------------|-------|---------------|
| {MASTERCARD_ROOT_BUSINESS_UNIT_ID} | ________________________________ | Created during deployment - GUID of root BU record |
| {MASTERCARD_ROOT_BUSINESS_UNIT_NAME} | ________________________________ | Top-level business unit name (e.g., Mastercard Global) |
| {MASTERCARD_DEPLOYING_USER_ID} | ________________________________ | Azure AD Object ID of user performing deployment |
| {MASTERCARD_DEPLOYING_USER_EMAIL} | ________________________________ | Email of user performing deployment |

### Hierarchy Structure Template

Document the planned hierarchy structure before deployment:

```
Business Unit: {MASTERCARD_ROOT_BUSINESS_UNIT_NAME}
├── Department: ________________________________
│   ├── Team: ________________________________
│   │   ├── Pod: ________________________________
│   │   │   └── Employee: ________________________________
│   │   └── Pod: ________________________________
│   └── Team: ________________________________
└── Department: ________________________________
    └── Team: ________________________________
```

### Validation for Section 10

- [ ] Hierarchy structure approved by stakeholders
- [ ] Initial users identified for each level
- [ ] Row-level security rules defined

---

## SECTION 11: SEED DATA CONFIGURATION

Configuration for initial data import.

| Placeholder | Value | Where to Find |
|-------------|-------|---------------|
| {MASTERCARD_SEED_DATA_SOURCE} | ________________________________ | Location of seed data CSVs (local path or SharePoint URL) |
| {MASTERCARD_CUSTOM_BENCHMARKS_PATH} | ________________________________ | Path to Mastercard-specific benchmark data if any (Optional) |
| {MASTERCARD_CUSTOM_VERTICALS} | ________________________________ | Additional vertical industries to add beyond standard 12 (Optional) |

### Seed Data Counts (Standard)

| Dataset | Record Count | Status |
|---------|--------------|--------|
| Verticals | 12 | [ ] Imported |
| Channels | 43 | [ ] Imported |
| KPIs | 44 | [ ] Imported |
| Benchmarks | 794 | [ ] Imported |
| Feature Flags | 24 | [ ] Imported |

### Validation for Section 11

- [ ] Seed data CSV files accessible
- [ ] Column mappings verified against schema
- [ ] Custom data reviewed and approved (if applicable)

---

## FINAL VALIDATION CHECKLIST

Complete this checklist before beginning deployment.

### Prerequisites Verified

| Category | Status |
|----------|--------|
| All Section 1 values filled | [ ] Complete |
| All Section 2 values filled | [ ] Complete |
| All Section 3 values filled | [ ] Complete |
| All Section 4 values filled | [ ] Complete |
| All Section 5 values filled | [ ] Complete |
| All Section 6 values filled | [ ] Complete |
| All Section 7 values filled | [ ] Complete |
| All Section 8 values filled | [ ] Complete |
| All Section 9 values filled | [ ] Complete |
| All Section 10 values filled | [ ] Complete |
| All Section 11 values filled | [ ] Complete |

### Format Validation

| Check | Status |
|-------|--------|
| All GUIDs are valid format (8-4-4-4-12) | [ ] Verified |
| All URLs are accessible | [ ] Verified |
| All secrets stored securely | [ ] Verified |
| No placeholder brackets remain unfilled | [ ] Verified |

### Permissions Confirmed

| Role | Environment | Status |
|------|-------------|--------|
| Azure AD Global Admin or App Admin | Azure AD | [ ] Confirmed |
| Power Platform System Administrator | Dataverse | [ ] Confirmed |
| SharePoint Site Collection Admin | SharePoint | [ ] Confirmed |
| Azure Contributor | Function App Resource Group | [ ] Confirmed |
| Copilot Studio Environment Maker | Copilot Studio | [ ] Confirmed |
| Teams Admin | Microsoft Teams | [ ] Confirmed |

---

## SIGN-OFF

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Deployment Lead | ________________ | ________ | ________ |
| Security Review | ________________ | ________ | ________ |
| Infrastructure | ________________ | ________ | ________ |
| Business Owner | ________________ | ________ | ________ |

---

## NEXT STEPS

Once this worksheet is complete:

1. Save a copy of this completed worksheet securely
2. Proceed to `00_MASTER_DEPLOYMENT_GUIDE.txt` in corporate-deployment-docs/
3. Follow the phase-by-phase deployment instructions
4. Reference this worksheet whenever a placeholder value is needed

---

## REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-06 | MPA Deployment | Initial creation |
