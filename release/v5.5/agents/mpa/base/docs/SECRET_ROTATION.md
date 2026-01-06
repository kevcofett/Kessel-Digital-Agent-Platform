# MPA Secret Rotation Procedures

## Overview

This document describes the procedures for rotating secrets used by the Media Planning Agent (MPA) v5.1. All secrets are stored in Azure Key Vault (`mpa-keyvault`) and referenced by the Azure Function App (`mpa-functions-prod`).

## Secrets Inventory

| Secret Name | Description | Location | Rotation Period | Last Rotated |
|-------------|-------------|----------|-----------------|--------------|
| MPA-FunctionKey | Azure Function host key | mpa-keyvault | 90 days | [DATE] |
| MPA-DataverseClientId | App Registration client ID | mpa-keyvault | On compromise only | [DATE] |
| MPA-DataverseTenantId | Azure AD tenant ID | mpa-keyvault | Never (static) | N/A |
| MPA-DataverseClientSecret | App Registration client secret | mpa-keyvault | 90 days | [DATE] |
| MPA-DataverseUrl | Dataverse environment URL | mpa-keyvault | Never (static) | N/A |

## Rotation Schedules

### High-Priority Rotation (Every 90 Days)
- `MPA-FunctionKey`
- `MPA-DataverseClientSecret`

### On-Demand Rotation (On Compromise Only)
- `MPA-DataverseClientId` (requires new App Registration)

### Static Values (No Rotation)
- `MPA-DataverseTenantId`
- `MPA-DataverseUrl`

---

## Rotation Procedures

### 1. Function Key Rotation

**When**: Every 90 days or on suspected compromise

**Steps**:

1. **Generate new function key in Azure Portal**
   ```
   Azure Portal → Function App (mpa-functions-prod) → App keys → Host keys → + New host key
   ```

2. **Update Key Vault secret**
   ```bash
   az keyvault secret set \
     --vault-name mpa-keyvault \
     --name "MPA-FunctionKey" \
     --value "<NEW_FUNCTION_KEY>"
   ```

3. **Update Power Automate flows** (if they use the function key directly)
   - Open each flow that calls Azure Functions
   - Update the `x-functions-key` header or `code` query parameter
   - Save and test each flow

4. **Test all flows that call Azure Functions**
   - MPA_ValidatePlan (calls ValidateGate)
   - MPA_GenerateDocument (calls GenerateDocument)

5. **Delete old key after 24 hours**
   ```
   Azure Portal → Function App → App keys → Delete old key
   ```

6. **Update this document** with the rotation date

---

### 2. Dataverse Client Secret Rotation

**When**: Every 90 days or on suspected compromise

**Steps**:

1. **Create new secret in App Registration**
   ```
   Azure Portal → Azure Active Directory → App registrations →
   MPA Service Principal (6ae675d0-0f75-4833-a74a-17b52d4047c8) →
   Certificates & secrets → + New client secret
   ```
   - Description: `MPA-Dataverse-YYYYMMDD`
   - Expiry: 90 days

2. **Copy the new secret value** (shown only once)

3. **Update Key Vault secret**
   ```bash
   az keyvault secret set \
     --vault-name mpa-keyvault \
     --name "MPA-DataverseClientSecret" \
     --value "<NEW_CLIENT_SECRET>"
   ```

4. **Restart Function App to pick up new secret**
   ```bash
   az functionapp restart \
     --name mpa-functions-prod \
     --resource-group mpa-rg
   ```

5. **Test Dataverse connectivity**
   - Call any function that accesses Dataverse
   - Verify successful data retrieval

6. **Delete old secret after 24 hours**
   ```
   Azure Portal → App Registration → Certificates & secrets → Delete old secret
   ```

7. **Update this document** with the rotation date

---

## Emergency Rotation (On Compromise)

If a secret is suspected to be compromised:

### Immediate Actions

1. **Rotate the compromised secret immediately** using procedures above

2. **Review audit logs**
   ```bash
   az monitor activity-log list \
     --resource-group mpa-rg \
     --start-time $(date -d '7 days ago' +%Y-%m-%dT%H:%M:%SZ) \
     --query "[?contains(operationName.value, 'secrets')]"
   ```

3. **Check Key Vault access logs**
   ```
   Azure Portal → mpa-keyvault → Diagnostic settings → Logs
   ```

4. **Notify security team** if unauthorized access is confirmed

### Post-Incident Actions

1. Review and tighten Key Vault access policies
2. Enable additional monitoring if not already configured
3. Document incident in security log
4. Schedule security review meeting

---

## Key Vault Access Policies

### Current Access

| Identity | Type | Permissions |
|----------|------|-------------|
| mpa-functions-prod | Managed Identity | Get, List secrets |
| MPA Administrators | Azure AD Group | All secret operations |

### Reviewing Access

```bash
az keyvault show \
  --name mpa-keyvault \
  --query "properties.accessPolicies"
```

---

## Monitoring and Alerts

### Recommended Alerts

1. **Secret Expiration Warning**
   - Alert 14 days before secret expiration
   - Configure in Key Vault → Alerts

2. **Unauthorized Access Attempts**
   - Alert on failed secret access
   - Configure in Azure Monitor

3. **Rotation Reminder**
   - Calendar reminder every 90 days
   - Assigned to: MPA Operations Team

---

## Automation (Future Enhancement)

Consider implementing automated secret rotation using:

1. **Azure Automation Runbooks** - Scheduled PowerShell scripts
2. **Azure Key Vault Rotation Policies** - Built-in rotation for supported secret types
3. **Azure DevOps Pipelines** - CI/CD integrated rotation

---

## Contacts

| Role | Contact | Responsibility |
|------|---------|----------------|
| MPA Operations | [ops-team@company.com] | Routine rotation |
| Security Team | [security@company.com] | Compromise response |
| Azure Admin | [azure-admin@company.com] | Key Vault access |

---

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-12-28 | 1.0 | Claude Code | Initial document |

---

*Last Updated: 2025-12-28*
