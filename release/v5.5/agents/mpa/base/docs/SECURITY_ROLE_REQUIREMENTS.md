# MPA Security Role Requirements

## Overview

This document defines the Dataverse security roles required for proper session isolation in the Media Planning Agent.

**Version:** 5.2
**Last Updated:** December 30, 2025
**Status:** Requires Manual Configuration

---

## Contents

1. [Security Model](#security-model)
2. [Role Definitions](#role-definitions)
3. [Table Permissions](#table-permissions)
4. [Row-Level Security](#row-level-security)
5. [Implementation Steps](#implementation-steps)
6. [Testing](#testing)

---

## Security Model

MPA uses a hierarchical security model:

```
+------------------------+
|   MPA System Admin     |  <- Full access to all data
+------------------------+
          |
+------------------------+
|   MPA Client Admin     |  <- Full access within client
+------------------------+
          |
+------------------------+
|      MPA User          |  <- Access to own sessions only
+------------------------+
```

### Key Principles

1. **Least Privilege** - Users get minimum required access
2. **Session Isolation** - Users cannot access other users' sessions
3. **Client Isolation** - Clients cannot access other clients' data
4. **Audit Trail** - All access is logged for compliance

---

## Role Definitions

### MPA User (Base Role)

The standard user role for media planners.

| Capability | Access Level |
|------------|--------------|
| Create sessions | Own only |
| Read sessions | Own only |
| Update sessions | Own only |
| Delete sessions | None |
| Read benchmarks | Organization-wide |
| Read channels | Organization-wide |
| Read KPIs | Organization-wide |
| Create media plans | Own only |
| Read media plans | Own + shared |

### MPA Client Admin

Elevated role for client account managers.

| Capability | Access Level |
|------------|--------------|
| All MPA User capabilities | Yes |
| Read sessions | Same client |
| Read media plans | Same client |
| Manage client settings | Same client |
| View audit logs | Same client |

### MPA System Admin

Administrative role for system operators.

| Capability | Access Level |
|------------|--------------|
| All capabilities | Organization-wide |
| Manage security roles | Yes |
| Configure feature flags | Yes |
| Access audit logs | Yes |
| Deploy changes | Yes |

---

## Table Permissions

### EAP Shared Tables

| Table | MPA User | MPA Client Admin | MPA System Admin |
|-------|----------|------------------|------------------|
| eap_session | User | Business Unit | Organization |
| eap_client | Read Only | Business Unit | Organization |
| eap_user | User | Business Unit | Organization |
| eap_audit_log | None | Business Unit | Organization |
| eap_learning | User | Business Unit | Organization |

### MPA Tables

| Table | MPA User | MPA Client Admin | MPA System Admin |
|-------|----------|------------------|------------------|
| mpa_mediaplan | User | Business Unit | Organization |
| mpa_planversion | User | Business Unit | Organization |
| mpa_allocation | User | Business Unit | Organization |
| mpa_benchmark | Read Only | Read Only | Organization |
| mpa_channel | Read Only | Read Only | Organization |
| mpa_kpi | Read Only | Read Only | Organization |
| mpa_vertical | Read Only | Read Only | Organization |
| mpa_sessioncustomization | User | Business Unit | Organization |
| mpa_featureflag | Read Only | Read Only | Organization |

### Permission Levels Explained

| Level | Description |
|-------|-------------|
| User | Records owned by the user |
| Business Unit | Records in user's business unit (used for client isolation) |
| Organization | All records in the organization |
| Read Only | Can read but not modify |
| None | No access |

---

## Row-Level Security

### Session Isolation Filter

Apply this filter to `eap_session` table:

```
// User can only see their own sessions
eap_userid == @CurrentUserId
```

### Client Isolation Filter

Apply this filter to `mpa_mediaplan` and related tables:

```
// User can only see plans for their assigned clients
mpa_clientid IN (@UserAssignedClients)
```

### Implementation via Security Roles

1. Create a Dataverse security role
2. Set table permissions per the matrix above
3. For "User" level access, Dataverse automatically filters to owned records
4. For "Business Unit" level, configure business units per client

---

## Implementation Steps

### Step 1: Create Security Roles

1. Navigate to Power Platform Admin Center
2. Select the Aragorn AI environment
3. Go to Settings > Users + permissions > Security roles
4. Create the three roles defined above

### Step 2: Configure Table Permissions

For each table listed in the permissions matrix:

1. Open the security role
2. Navigate to Custom Entities (or the appropriate tab)
3. Set Create/Read/Write/Delete/Append/AppendTo permissions
4. Set the access level (User/Business Unit/Organization)

### Step 3: Configure Business Units (for Client Isolation)

1. Create a Business Unit per major client
2. Assign users to their client's Business Unit
3. Set "Business Unit" level permissions for client-scoped data

### Step 4: Assign Roles to Users

1. Navigate to Users in the Admin Center
2. Select the user
3. Click "Manage Roles"
4. Assign the appropriate MPA role

### Step 5: Test Isolation

Run the session isolation test suite:

```powershell
.\tests\session_isolation_tests.ps1 -EnvironmentUrl "<url>"
```

---

## Testing

### Verify User Isolation

1. Log in as User A
2. Create a session
3. Log in as User B
4. Attempt to query User A's session
5. Expected: No results or access denied

### Verify Client Isolation

1. Create plans for Client A
2. Create plans for Client B
3. As a Client A user, query all plans
4. Expected: Only Client A plans returned

### Verify Role Inheritance

1. Assign MPA User role to a test user
2. Verify base capabilities work
3. Upgrade to MPA Client Admin role
4. Verify additional capabilities are available

---

## Audit Requirements

### Logged Events

- Session creation/modification
- Media plan creation/modification
- Security role changes
- Permission elevation attempts
- Failed access attempts

### Retention

- Audit logs retained for 90 days minimum
- Security-related events retained for 1 year
- Export available for compliance review

---

## Troubleshooting

### "Access Denied" for Valid Data

1. Check user's security role assignment
2. Verify role has correct permissions
3. Check business unit assignment
4. Review row-level security filters

### User Can See Other Users' Data

1. Verify permission level is "User" not "Organization"
2. Check for conflicting security roles
3. Review custom security filters
4. Run isolation tests to identify the leak

### Client Data Visible Across Clients

1. Verify business unit configuration
2. Check user's business unit assignment
3. Verify "Business Unit" level permissions
4. Review any sharing rules

---

## Related Documentation

- [Session Isolation Tests](../tests/SESSION_ISOLATION_TEST_GUIDE.md)
- [PRIMARY_AGENT_INSTRUCTIONS Session Isolation section](../kb/PRIMARY_AGENT_INSTRUCTIONS_v5_1.txt)
- [Microsoft Dataverse Security Concepts](https://docs.microsoft.com/power-platform/admin/wp-security-cds)
