# Enterprise DVO Agent - Architecture Reference

## Overview

The Enterprise DVO (DevOps) Agent provides natural language deployment orchestration for the Kessel Digital v7.0 Agent Platform, hardened for Mastercard managed environments.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ENTERPRISE DVO AGENT                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   FastAPI   │    │   Azure AD  │    │    RBAC     │    │   Policy    │  │
│  │   Gateway   │───▶│    Auth     │───▶│   Manager   │───▶│  Enforcer   │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│         │                                      │                  │         │
│         │                                      ▼                  ▼         │
│         │                              ┌─────────────┐    ┌─────────────┐  │
│         │                              │ Capability  │    │  Approval   │  │
│         │                              │  Manager    │    │  Workflow   │  │
│         │                              └─────────────┘    └─────────────┘  │
│         │                                      │                  │         │
│         ▼                                      ▼                  ▼         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         DVO AGENT CORE                               │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐        │   │
│  │  │ Validate  │  │  Deploy   │  │  Status   │  │  Rollback │        │   │
│  │  │   Tool    │  │   Tool    │  │   Tool    │  │   Tool    │        │   │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         DEPLOYERS                                    │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐        │   │
│  │  │ LangChain │  │  FastAPI  │  │  Copilot  │  │   Azure   │        │   │
│  │  │ Deployer  │  │ Deployer  │  │  Studio   │  │ Functions │        │   │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────┐                                                           │
│  │   Audit     │──────────────────────────────────────▶  SIEM             │
│  │   Logger    │                                         (Splunk/Sentinel) │
│  └─────────────┘                                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. API Gateway (FastAPI)

**Purpose:** RESTful API entry point for all DVO operations

**Endpoints:**
- `/v1/deployments/` - Deployment operations
- `/v1/policies/` - Policy management
- `/v1/capabilities/` - Feature flag management
- `/v1/audit/` - Audit log access
- `/health` - Health checks

**Technology:** FastAPI 0.100+, Pydantic v2, uvicorn

### 2. Azure AD Authentication

**Purpose:** Enterprise identity and access management

**Components:**
- `AzureADAuthProvider` - Token validation, user info retrieval
- `AuthMiddleware` - Request authentication
- Group-to-role mapping

**Flow:**
```
User → Azure AD → Access Token → DVO API → Validate Token → Extract Roles
```

### 3. RBAC Manager

**Purpose:** Role-based permission enforcement

**Roles (hierarchy):**
```
admin
  └── release_manager
        └── operator
              └── developer
                    └── viewer
```

**Permissions:** 10 discrete permissions mapped to roles

### 4. Policy Enforcer

**Purpose:** Deployment policy evaluation and enforcement

**Default Policies:**
- Production approval requirement
- Staging validation gate
- Weekend deployment block
- Business hours warning
- Audit all deployments

### 5. Capability Manager

**Purpose:** Feature flag control with graceful degradation

**Capabilities:** 11 configurable features
**Fallback Behaviors:** error, skip, degrade, manual

### 6. Approval Workflow

**Purpose:** Gated deployment approvals for sensitive environments

**States:** pending → approved/rejected/expired/cancelled

### 7. Audit Logger

**Purpose:** Comprehensive audit trail for compliance

**Features:**
- 25+ event types
- Tamper-evident checksums
- SIEM export (CEF, JSON)
- 90-day retention

### 8. DVO Agent Core

**Purpose:** Natural language deployment orchestration

**Tools:**
- ValidateTool - Pre-deployment validation
- DeployTool - Execute deployments
- StatusTool - Check deployment status
- RollbackTool - Revert deployments

### 9. Deployers

**Purpose:** Platform-specific deployment execution

**Supported Platforms:**
- LangChain (primary)
- FastAPI
- Copilot Studio (degraded in MC)
- Azure Functions

## Data Flow

### Deployment Request Flow

```
1. User submits deployment request via API
2. AuthMiddleware validates Azure AD token
3. RBAC Manager checks user permissions
4. Policy Enforcer evaluates deployment policies
5. If REQUIRE_APPROVAL → Create approval request, wait
6. If ALLOW → Capability Manager checks feature availability
7. DVO Agent selects appropriate deployer
8. Deployer executes deployment
9. Audit Logger records all events
10. Response returned to user
```

### Approval Flow

```
1. Deployment triggers REQUIRE_APPROVAL policy
2. ApprovalRequest created with expiry
3. Notification sent to approvers (release_managers)
4. Approver reviews and approves/rejects
5. If approved → Deployment proceeds
6. If rejected → Deployment blocked
7. If expired → Request auto-cancelled
```

## Security Architecture

### Authentication Layers

| Layer | Mechanism |
|-------|-----------|
| Network | TLS 1.3, mTLS for internal |
| Identity | Azure AD OAuth2 |
| Session | JWT with refresh |
| MFA | Required for production |

### Authorization Model

```
User → Roles (from AD groups) → Permissions → Resource Access
```

### Data Protection

| Data Type | Protection |
|-----------|------------|
| Secrets | Azure Key Vault |
| Tokens | Encrypted at rest |
| Audit Logs | Tamper-evident, encrypted |
| Config | Encrypted, versioned |

## Deployment Architecture

### Kubernetes Deployment

```yaml
┌─────────────────────────────────────────┐
│            Kubernetes Cluster            │
├─────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐     │
│  │  DVO Agent  │    │  DVO Agent  │     │
│  │  Pod (1)    │    │  Pod (2)    │     │
│  └──────┬──────┘    └──────┬──────┘     │
│         │                  │            │
│         └────────┬─────────┘            │
│                  ▼                      │
│         ┌─────────────┐                 │
│         │   Service   │                 │
│         └──────┬──────┘                 │
│                ▼                        │
│         ┌─────────────┐                 │
│         │   Ingress   │                 │
│         └─────────────┘                 │
└─────────────────────────────────────────┘
              │
              ▼
    ┌─────────────────┐
    │  Load Balancer  │
    └─────────────────┘
```

### External Dependencies

| Service | Purpose | Criticality |
|---------|---------|-------------|
| Azure AD | Authentication | Critical |
| PostgreSQL | State persistence | Critical |
| Redis | Session cache | High |
| Splunk/Sentinel | Audit export | Medium |

## Integration Points

### v7.0 Agent Platform

DVO deploys and manages v7.0 agents:
- ORC, ANL, AUD, CHA, SPO, DOC, PRF, CHG, CST, MKT, GHA

### CAAT (Constraint-Aware Agent Architecture Translator)

DVO uses CAAT for platform translation:
- Agent specs → LangChain
- Agent specs → FastAPI
- Agent specs → Copilot Studio

### SIEM Integration

Real-time audit export to:
- Splunk via HEC
- Azure Sentinel via Log Analytics
- Syslog (CEF format)

## Scalability

### Horizontal Scaling

- Stateless API pods (scale via HPA)
- Redis for distributed sessions
- PostgreSQL for persistent state

### Performance Targets

| Metric | Target |
|--------|--------|
| API Latency (p99) | < 500ms |
| Deployment Time | < 5 min |
| Approval SLA | < 24 hours |
| Audit Ingestion | 1000 events/sec |

## Disaster Recovery

### RTO/RPO

| Component | RTO | RPO |
|-----------|-----|-----|
| API | 5 min | N/A |
| Database | 1 hour | 5 min |
| Audit Logs | 4 hours | 1 hour |

### Backup Strategy

- Database: Continuous replication + daily snapshots
- Audit Logs: Real-time SIEM export + file backup
- Configuration: Git-versioned, encrypted

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01 | Initial enterprise release |
