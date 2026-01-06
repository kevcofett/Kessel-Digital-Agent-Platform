# Kessel-Digital Agent Platform Migration Plan

## Document Information

| Field | Value |
|-------|-------|
| Version | 1.0 |
| Date | January 2026 |
| Author | Kevin Bauer, Kessel Digital |
| Status | Approved for Execution |
| Classification | Internal / Shareable with Mastercard |

---

## Executive Summary

This document outlines the migration strategy for consolidating three AI agent repositories (MPA, EAP, CA) into a unified Agent Platform architecture. The design supports dual-environment deployment (Personal/Corporate) while maximizing code reuse and enabling environment-specific extensions.

### Key Objectives

1. Create single source of truth for all agent development
2. Enable clean branching for Personal vs Corporate environments
3. Support extensive Corporate customization without fragmenting codebase
4. Establish extensibility patterns for future agent development
5. Maintain clear separation between shared components and environment-specific extensions

### Target Environments

| Environment | Repository | Primary Use |
|-------------|------------|-------------|
| Personal | Kessel-Digital-Agent-Platform | Development, POC, Personal Deployment |
| Corporate | Mastercard-Agent-Platform | Enterprise Production Deployment |

---

## Architecture Overview

### Platform Structure

```
{Organization}-Agent-Platform/
│
├── /release/v5.5/
│   │
│   ├── /platform/                          # Shared Infrastructure
│   │   ├── /config/
│   │   ├── /eap-core/
│   │   │   ├── /base/                      # Shared across all environments
│   │   │   └── /extensions/                # Environment-specific additions
│   │   └── /security/
│   │       ├── /base/
│   │       └── /extensions/
│   │
│   ├── /agents/                            # Individual Agents
│   │   ├── /mpa/
│   │   │   ├── /base/
│   │   │   └── /extensions/
│   │   ├── /ca/
│   │   │   ├── /base/
│   │   │   └── /extensions/
│   │   └── /agent-template/
│   │
│   └── /docs/                              # Platform Documentation
│
└── BRANCHES:
    ├── main                                # Canonical source of truth
    ├── deploy/personal                     # Personal environment config
    └── deploy/corporate                    # Corporate environment config
```

### Base/Extensions Pattern

The architecture uses a layered approach separating shared components from environment-specific customizations:

#### /base/ Folders (Shared)
- Contains core functionality required by all environments
- Changes flow bidirectionally between branches via cherry-pick
- Must maintain cross-environment compatibility
- Modifications require consideration of all deployment targets

#### /extensions/ Folders (Environment-Specific)
- Empty in main branch (contains only .gitkeep)
- Corporate branch adds enterprise-specific components
- Personal branch may add experimental features
- Never merged back to main branch
- Extensions augment but never override base functionality

### Design Principles

1. **Extensions Augment, Never Override**: Environment-specific code adds capabilities via feature flags without modifying base components

2. **Feature Flag Driven**: All optional functionality controlled by flags enabling graceful degradation

3. **Contract-Based Integration**: Agents integrate with EAP through defined interface contracts

4. **Configuration Over Code**: Environment differences expressed through configuration, not code branches

---

## Component Architecture

### Enterprise AI Platform (EAP) Core

EAP serves as the orchestration layer providing shared services to all agents.

#### Base Components (All Environments)

| Component | Type | Purpose |
|-----------|------|---------|
| eap_session | Table | Unified session management |
| eap_user | Table | User identity and profile |
| eap_client | Table | Client/organization context |
| eap_feature_flag | Table | Platform-wide feature control |
| eap_agent_registry | Table | Registered agents catalog |
| eap_initialize_session | Flow | Session creation and validation |
| eap_check_feature_flag | Flow | Flag evaluation with defaults |

#### Extension Components (Corporate)

| Component | Type | Purpose |
|-----------|------|---------|
| eap_business_unit | Table | BU hierarchy node |
| eap_department | Table | Department hierarchy node |
| eap_team | Table | Team hierarchy node |
| eap_pod | Table | Pod hierarchy node |
| eap_user_assignment | Table | User to hierarchy mapping |
| eap_audit_log | Table | Compliance audit trail |
| eap_data_source | Table | Registered data sources |
| eap_get_user_permissions | Flow | Access control evaluation |
| eap_log_audit_event | Flow | Audit event recording |

### Media Planning Agent (MPA)

MPA is the first agent achieving v5.5 production readiness.

#### Base Components

| Category | Count | Description |
|----------|-------|-------------|
| Knowledge Base | 22 files | Strategic guidance, methodology, frameworks |
| Copilot Instructions | 1 file | Agent behavior specification (8K char limit) |
| Flows | 11 flows | Dataverse CRUD, document generation |
| Azure Functions | 8 functions | Calculations, document generation |
| Adaptive Cards | 6 cards | User interface components |
| Schema | 8 tables | MPA-specific data structures |
| Seed Data | 4 CSVs | Channels, KPIs, Verticals, Benchmarks |

#### Extension Components (Corporate)

| Component | Purpose |
|-----------|---------|
| Corporate compliance KB additions | Mastercard-specific guidance |
| Enhanced audit logging flows | Compliance trail |
| Data classification tagging | Sensitivity management |

### Consulting Agent (CA)

CA is placeholder in v5.5, to be populated when development completes.

---

## Branch Strategy

### Branch Purposes

| Branch | Purpose | Merge Direction |
|--------|---------|-----------------|
| main | Canonical v5.5 source of truth | Receives cherry-picks from deploy branches |
| deploy/personal | Personal environment deployment | Merges from main, never to main |
| deploy/corporate | Corporate environment deployment | Merges from main, cherry-picks base improvements to main |

### Workflow: Base Component Improvement

When an improvement to shared functionality occurs in any branch:

```
1. Developer makes change in /base/ folder (any branch)
2. Change is committed with clear commit message
3. Change is cherry-picked to main branch
4. Other deploy branches merge from main to receive change
```

Example:
```bash
# On deploy/corporate branch
git commit -m "EAP-BASE: Add data source interface contract"

# On main branch  
git cherry-pick <commit-hash>

# On deploy/personal branch
git merge main
```

### Workflow: Extension Addition

When environment-specific functionality is added:

```
1. Developer makes change in /extensions/ folder (deploy branch only)
2. Change is committed with environment prefix in message
3. Change stays in that branch permanently
4. Never cherry-picked or merged to main
```

Example:
```bash
# On deploy/corporate branch
git commit -m "EAP-CORP: Add Confluence data source connector"
# This commit never goes to main or personal
```

### Commit Message Convention

| Prefix | Meaning | Cherry-pick to main? |
|--------|---------|---------------------|
| MPA-BASE: | MPA base component change | Yes |
| MPA-CORP: | MPA corporate extension | No |
| MPA-PERS: | MPA personal extension | No |
| EAP-BASE: | EAP base component change | Yes |
| EAP-CORP: | EAP corporate extension | No |
| CA-BASE: | CA base component change | Yes |
| PLATFORM: | Platform-wide change | Yes |
| CONFIG: | Configuration change | Depends on scope |
| DOCS: | Documentation change | Usually yes |

---

## Corporate Environment Considerations

### Constraints

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| No external APIs | Cannot call non-Mastercard services | Feature flags disable external calls; internal alternatives |
| Limited web search | Cannot scrape public web | Leverage internal SharePoint/Confluence |
| Copilot/ChatGPT only | No Claude, GPT-4 direct | All prompts compatible with Copilot |
| Strict firewall | No data exfiltration | All data stays within tenant |
| SSO only | Microsoft authentication required | Designed for Entra ID |
| Teams channel | Primary user interface | Copilot Studio Teams integration |

### Access Control Hierarchy

Corporate deployment requires row-level security across organizational structure:

```
Business Unit (BU)
  └── Department
       └── Team
            └── Pod
                 └── Employee
```

Implementation:
- Each level is a Dataverse table in /extensions/
- eap_user_assignment maps users to hierarchy nodes
- Row-level security rules filter data based on user's position
- Users see data at their level and below

### Data Source Integration

Corporate environment leverages internal data sources:

| Source | Type | Connection |
|--------|------|------------|
| SharePoint | Document repository | Native connector |
| Confluence | Knowledge base | SharePoint connector or Graph API |
| Dataverse | Structured data | Native |
| Internal APIs | Service data | Power Automate HTTP (internal only) |

Data sources registered in eap_data_source table, controlled by feature flags.

---

## Feature Flag Strategy

### Flag Categories

| Category | Prefix | Example |
|----------|--------|---------|
| Platform | eap_ | eap_enable_audit_logging |
| Agent | {agent}_ | mpa_enable_document_generation |
| Integration | int_ | int_enable_confluence_search |
| Security | sec_ | sec_require_mfa |
| UI | ui_ | ui_show_advanced_options |

### Graceful Degradation Pattern

All features implement graceful degradation:

```
1. Check feature flag before execution
2. If disabled: Return friendly message, log event, continue workflow
3. If enabled: Execute feature
4. If error: Catch, log, return degraded response, continue workflow
```

Example flow pseudocode:
```
IF check_feature_flag("mpa_enable_web_search") = false THEN
    RETURN "Web search is not available in this environment. 
            Using internal knowledge base instead."
    LOG "Feature mpa_enable_web_search disabled, using fallback"
    CALL internal_knowledge_search()
ELSE
    CALL web_search()
END IF
```

### Default Flag Values

| Environment | Default Stance | Reasoning |
|-------------|---------------|-----------|
| Personal | Most features ON | Development flexibility |
| Corporate | Conservative, explicit ON | Security, compliance |

---

## Migration Phases

### Phase 1: Create Platform Repository Structure

| Task | Owner | Status |
|------|-------|--------|
| Create Kessel-Digital-Agent-Platform folder | Claude | Pending |
| Initialize git repository | Claude | Pending |
| Create complete folder structure with /base/ and /extensions/ | Claude | Pending |
| Create README.md | Claude | Pending |
| Create PLATFORM_ARCHITECTURE.md | Claude | Pending |

### Phase 2: Package MPA v5.5

| Task | Owner | Status |
|------|-------|--------|
| Copy 22 KB files to /agents/mpa/base/kb/ | Claude | Pending |
| Copy copilot instructions to /agents/mpa/base/copilot/ | Claude | Pending |
| Copy flows to /agents/mpa/base/flows/ | Claude | Pending |
| Copy functions to /agents/mpa/base/functions/ | Claude | Pending |
| Copy schema to /agents/mpa/base/schema/ | Claude | Pending |
| Copy cards to /agents/mpa/base/cards/ | Claude | Pending |
| Copy templates to /agents/mpa/base/templates/ | Claude | Pending |
| Copy seed data to /agents/mpa/base/data/seed/ | Claude | Pending |
| Copy 18 docs to /agents/mpa/base/docs/ | Claude | Pending |

### Phase 3: Create EAP-Core

| Task | Owner | Status |
|------|-------|--------|
| Extract EAP table schemas to /platform/eap-core/base/schema/ | Claude | Pending |
| Create interface contracts in /platform/eap-core/base/interfaces/ | Claude | Pending |
| Create extension placeholders for corporate | Claude | Pending |
| Document access control hierarchy schema | Claude | Pending |
| Create EAP_ARCHITECTURE.md | Claude | Pending |

### Phase 4: Create Configuration Templates

| Task | Owner | Status |
|------|-------|--------|
| Create environment.template.json | Claude | Pending |
| Create feature_flags.template.json with full catalog | Claude | Pending |
| Create security_roles.template.json | Claude | Pending |
| Document configuration patterns | Claude | Pending |

### Phase 5: Platform Documentation

| Task | Owner | Status |
|------|-------|--------|
| Create DEPLOYMENT_GUIDE.md | Claude | Pending |
| Create RELEASE_NOTES.md | Claude | Pending |
| Create CORPORATE_DEPLOYMENT_ADDENDUM.md | Claude | Pending |
| Create BRANCHING_AND_EXTENSION_GUIDE.md | Claude | Pending |
| Create EAP_EXTENSIBILITY_GUIDE.md | Claude | Pending |

### Phase 6: Git and GitHub Setup

| Task | Owner | Status |
|------|-------|--------|
| Commit all to main branch locally | Claude | Pending |
| Create Kessel-Digital-Agent-Platform repo on GitHub | Kevin | Pending |
| Push to GitHub | Claude | Pending |
| Create deploy/personal branch | Claude | Pending |
| Create deploy/corporate branch | Claude | Pending |

### Phase 7: Archive Original Repositories

| Task | Owner | Status |
|------|-------|--------|
| Rename Media_Planning_Agent repo | Kevin | Pending |
| Set to read-only | Kevin | Pending |
| Update README with archive notice | Kevin | Pending |
| Repeat for EAP and CA when ready | Kevin | Future |

---

## Success Criteria

### Migration Complete When:

- [ ] Kessel-Digital-Agent-Platform repo exists on GitHub
- [ ] All MPA v5.5 assets in /release/v5.5/agents/mpa/base/
- [ ] EAP-core base components documented and structured
- [ ] Configuration templates created with {ORGANIZATION} placeholders
- [ ] deploy/personal branch created and functional
- [ ] deploy/corporate branch created with extension placeholders
- [ ] All documentation complete and shareable
- [ ] Original MPA repo archived as read-only

### Corporate Readiness Criteria:

- [ ] Access control hierarchy schema defined
- [ ] Feature flag catalog includes all corporate toggles
- [ ] Graceful degradation patterns documented
- [ ] Data source plugin pattern documented
- [ ] Teams channel deployment path documented
- [ ] No external API dependencies in base components

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Base/extension boundary unclear | Medium | High | Clear documentation, code review |
| Cherry-pick conflicts | Low | Medium | Small, focused commits |
| Corporate extensions grow unwieldy | Medium | Medium | Regular refactoring, promote to base |
| Feature flag sprawl | Medium | Low | Flag naming convention, periodic audit |
| Documentation drift | High | Medium | Docs updated with code changes |

---

## Appendices

### Appendix A: Complete Folder Structure

See PLATFORM_ARCHITECTURE.md for full folder tree.

### Appendix B: Feature Flag Catalog

See feature_flags.template.json for complete flag listing.

### Appendix C: Interface Contracts

See /platform/eap-core/base/interfaces/ for all contract definitions.

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | Kevin Bauer | Initial version |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Author | Kevin Bauer | January 2026 | _____________ |
| Technical Review | | | _____________ |
| Business Review | | | _____________ |
