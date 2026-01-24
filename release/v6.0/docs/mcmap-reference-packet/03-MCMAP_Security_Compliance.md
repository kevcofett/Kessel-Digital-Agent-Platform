# MASTERCARD CONSULTING & MARKETING AGENT PLATFORM (MCMAP)
# MASTERCARD DEPLOYMENT - SECURITY & COMPLIANCE FRAMEWORK

**Document:** 03-MCMAP_Security_Compliance.md  
**Version:** 1.1  
**Date:** January 24, 2026  
**Classification:** Mastercard Internal - Security Sensitive  
**Status:** Production Ready  
**Audience:** Security, Compliance, Risk, Engineering Leadership

---

## TABLE OF CONTENTS

1. [Security Overview](#1-security-overview)
2. [Data Loss Prevention (DLP) Compliance](#2-data-loss-prevention-dlp-compliance)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [Data Protection](#4-data-protection)
5. [Network Security](#5-network-security)
6. [Audit & Monitoring](#6-audit--monitoring)
7. [Incident Response](#7-incident-response)
8. [Compliance Certifications](#8-compliance-certifications)
9. [Risk Assessment](#9-risk-assessment)
10. [Security Controls Matrix](#10-security-controls-matrix)
11. [Development Data Provenance & Build Security Attestation](#11-development-data-provenance--build-security-attestation)

---

## 1. SECURITY OVERVIEW

### 1.1 Security Architecture Principles

MCMAP is architected with security as a foundational principle, designed specifically to operate within Mastercard's stringent security environment:

| Principle | Implementation |
|-----------|----------------|
| **Zero External Connectivity** | No HTTP connectors, no external API calls |
| **DLP-First Design** | All components use only Mastercard-approved connectors |
| **Least Privilege** | Role-based access with minimal permissions |
| **Defense in Depth** | Multiple security layers from identity to data |
| **Audit Everything** | Comprehensive logging of all operations |
| **Fail Secure** | Default deny, explicit allow for all access |

### 1.2 Security Boundary

```
+-----------------------------------------------------------------------------+
|                      MCMAP SECURITY BOUNDARY                                 |
+-----------------------------------------------------------------------------+
|                                                                              |
|  EXTERNAL (BLOCKED)                        INTERNAL (ALLOWED)                |
|  +----------------------+                  +----------------------+          |
|  | X Public Internet    |                  | V Azure AD           |          |
|  | X External APIs      |                  | V Dataverse          |          |
|  | X Third-party SaaS   |    FIREWALL      | V SharePoint         |          |
|  | X Custom Endpoints   |<--------------->| V AI Builder         |          |
|  | X Unmanaged Azure    |                  | V Power Automate     |          |
|  | X HTTP Connector     |                  | V Copilot Studio     |          |
|  +----------------------+                  | V Microsoft Teams    |          |
|                                            | V Office 365         |          |
|                                            +----------------------+          |
|                                                                              |
|  +----------------------------------------------------------------------+   |
|  |                      DLP ENFORCEMENT LAYER                           |   |
|  |  All data flows validated against Mastercard DLP policies            |   |
|  |  Non-compliant connectors blocked at runtime                         |   |
|  +----------------------------------------------------------------------+   |
|                                                                              |
+-----------------------------------------------------------------------------+
```

### 1.3 Security Posture Summary

| Category | Status | Evidence |
|----------|--------|----------|
| External Connectivity | BLOCKED | DLP policy enforcement |
| Data Exfiltration | PREVENTED | No outbound HTTP |
| Authentication | ENFORCED | Azure AD SSO required |
| Authorization | IMPLEMENTED | RBAC via Dataverse |
| Audit Logging | ENABLED | eap_telemetry table |
| Encryption at Rest | ENABLED | Dataverse TDE |
| Encryption in Transit | ENABLED | TLS 1.2+ mandatory |

---

## 2. DATA LOSS PREVENTION (DLP) COMPLIANCE

### 2.1 Mastercard DLP Policy Alignment

MCMAP is fully compliant with Mastercard's Data Loss Prevention policies:

| DLP Requirement | MCMAP Implementation | Compliance Status |
|-----------------|---------------------|-------------------|
| No external HTTP calls | HTTP connector not used | COMPLIANT |
| No custom connectors | Only approved connectors | COMPLIANT |
| No data export to external | All data stays in Dataverse/SharePoint | COMPLIANT |
| Approved connectors only | See approved list below | COMPLIANT |
| Audit trail required | eap_telemetry logging | COMPLIANT |

### 2.2 Approved Connector Inventory

MCMAP uses **exclusively** Mastercard-approved connectors:

| Connector | Business Justification | Data Flow |
|-----------|------------------------|-----------|
| **Microsoft Dataverse** | Primary data storage for configuration, sessions, telemetry | Bidirectional |
| **AI Builder** | Computation layer for analytics and processing | Processing only |
| **SharePoint** | Knowledge base document storage | Read-only |
| **Office 365 Outlook** | Notification delivery (optional) | Outbound only |
| **Office 365 Users** | User identity resolution | Read-only |
| **Microsoft Teams** | User interface integration | Bidirectional |
| **Approvals** | Workflow approval processes | Bidirectional |
| **Excel Online (Business)** | Data import/export within tenant | Bidirectional |

### 2.3 Blocked Connectors

The following connectors are **NOT USED** in MCMAP due to DLP restrictions:

| Connector | Reason Blocked | Alternative Used |
|-----------|----------------|------------------|
| HTTP | External connectivity risk | AI Builder prompts |
| Custom Connectors | Unvetted external endpoints | None required |
| Azure Functions | External Azure resources | AI Builder prompts |
| Azure Blob Storage | External storage risk | SharePoint |
| SQL Server | External database risk | Dataverse |
| SFTP | External file transfer risk | SharePoint |

### 2.4 DLP Policy Verification

```
DLP POLICY VERIFICATION CHECKLIST

[X] All Power Automate flows use only approved connectors
[X] No HTTP trigger or HTTP action in any flow
[X] No custom connector references
[X] All data persisted in Dataverse or SharePoint only
[X] AI Builder prompts use internal models only
[X] Copilot Studio agents reference internal knowledge only
[X] No external API calls in any component
[X] Power Platform DLP policy enforcement verified
```

---

## 3. AUTHENTICATION & AUTHORIZATION

### 3.1 Authentication Architecture

```
+-----------------------------------------------------------------------------+
|                      AUTHENTICATION FLOW                                     |
+-----------------------------------------------------------------------------+
|                                                                              |
|  USER                     AZURE AD                      MCMAP                |
|   |                          |                           |                   |
|   |  1. Access Request       |                           |                   |
|   |------------------------->|                           |                   |
|   |                          |                           |                   |
|   |  2. MFA Challenge        |                           |                   |
|   |<-------------------------|                           |                   |
|   |                          |                           |                   |
|   |  3. MFA Response         |                           |                   |
|   |------------------------->|                           |                   |
|   |                          |                           |                   |
|   |  4. Token Issued         |                           |                   |
|   |<-------------------------|                           |                   |
|   |                          |                           |                   |
|   |  5. Access with Token    |                           |                   |
|   |----------------------------------------------------->|                   |
|   |                          |                           |                   |
+-----------------------------------------------------------------------------+
```

### 3.2 Authentication Requirements

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| SSO Integration | Azure AD single sign-on | ENABLED |
| Multi-Factor Authentication | Azure AD MFA required | ENFORCED |
| Token Validation | Automatic token refresh | ENABLED |
| Session Management | Dataverse session records | IMPLEMENTED |

### 3.3 Authorization Model

MCMAP implements role-based access control (RBAC) via Dataverse security roles:

| Role | Permissions | Typical Users |
|------|-------------|---------------|
| MCMAP User | Read reference data, Create/Edit own sessions | All employees |
| MCMAP Administrator | Full CRUD on all MCMAP tables | Platform admins |
| MCMAP Developer | KB management, configuration access | Development team |

---

## 4. DATA PROTECTION

### 4.1 Data Classification

| Data Category | Classification | Protection Level |
|---------------|----------------|------------------|
| Session Data | Internal | Encrypted, user-isolated |
| Configuration Data | Internal | Encrypted, admin-only write |
| Telemetry Data | Internal | Encrypted, audit purposes |
| Knowledge Base | Internal | Encrypted, read-only access |
| Reference Data | Internal | Encrypted, read-only access |

### 4.2 Encryption Standards

| Encryption Type | Standard | Implementation |
|-----------------|----------|----------------|
| At Rest | AES-256 | Dataverse TDE |
| In Transit | TLS 1.2+ | All connections |
| Key Management | Microsoft Managed | Azure Key Vault |

### 4.3 Data Retention

| Data Type | Retention Period | Deletion Method |
|-----------|------------------|-----------------|
| Session Data | 90 days | Automatic purge |
| Telemetry | 1 year | Automatic purge |
| Audit Logs | 7 years | Compliance retention |

---

## 5. NETWORK SECURITY

### 5.1 Network Isolation

MCMAP operates entirely within Microsoft's managed network infrastructure:

| Layer | Control | Status |
|-------|---------|--------|
| Perimeter | Azure network security | ENABLED |
| Application | DLP connector blocking | ENFORCED |
| Data | Dataverse row-level security | ENABLED |

### 5.2 No External Network Access

MCMAP has **zero external network connectivity**:

- No HTTP connectors
- No custom API endpoints
- No external webhooks
- No outbound data flows

---

## 6. AUDIT & MONITORING

### 6.1 Audit Logging Architecture

All MCMAP operations are logged to the eap_telemetry Dataverse table:

| Field | Content | Purpose |
|-------|---------|---------|
| session_id | Session identifier | Correlation |
| user_id | Azure AD user ID | Attribution |
| action | Operation performed | Audit trail |
| timestamp | UTC timestamp | Timeline |
| details | Operation details | Investigation |

### 6.2 Monitoring Capabilities

| Capability | Implementation | Frequency |
|------------|----------------|-----------|
| Usage Metrics | Power BI dashboard | Real-time |
| Error Tracking | Telemetry alerts | Real-time |
| Performance | Response time monitoring | Continuous |
| Security Events | Azure AD sign-in logs | Continuous |

---

## 7. INCIDENT RESPONSE

### 7.1 Incident Classification

| Severity | Description | Response Time |
|----------|-------------|---------------|
| Critical | Data breach, complete outage | 1 hour |
| High | Partial outage, security concern | 4 hours |
| Medium | Degraded performance | 24 hours |
| Low | Minor issues | 72 hours |

### 7.2 Response Procedures

```
INCIDENT RESPONSE WORKFLOW

1. DETECTION
   - Automated monitoring alerts
   - User-reported issues
   - Security team notification

2. ASSESSMENT
   - Severity classification
   - Impact analysis
   - Containment needs

3. CONTAINMENT
   - Isolate affected components
   - Preserve evidence
   - Notify stakeholders

4. RESOLUTION
   - Root cause analysis
   - Implement fix
   - Verify resolution

5. POST-INCIDENT
   - Document lessons learned
   - Update procedures
   - Report to leadership
```

### 7.3 Security Incident Contacts

| Role | Responsibility | Notification Method |
|------|----------------|---------------------|
| Platform Owner | Strategic decisions | Direct call |
| Security Contact | Compliance coordination | Email + call |
| Technical Lead | Technical resolution | Teams + email |
| Operations Lead | Operational coordination | Teams |

---

## 8. COMPLIANCE CERTIFICATIONS

### 8.1 Microsoft Power Platform Compliance

MCMAP inherits Microsoft Power Platform's compliance certifications:

| Certification | Status | Relevance |
|---------------|--------|-----------|
| SOC 1 Type II | Certified | Financial reporting controls |
| SOC 2 Type II | Certified | Security, availability, confidentiality |
| ISO 27001 | Certified | Information security management |
| ISO 27017 | Certified | Cloud security controls |
| ISO 27018 | Certified | PII protection in cloud |
| GDPR | Compliant | EU data protection |
| HIPAA | Certified | Healthcare data (not applicable) |
| FedRAMP | Certified | US government (informational) |

### 8.2 Compliance Documentation

| Document | Purpose | Location |
|----------|---------|----------|
| Microsoft Trust Center | Platform compliance details | trust.microsoft.com |
| Power Platform Compliance | Specific certifications | docs.microsoft.com |
| Data Processing Agreement | Microsoft DPA | Volume licensing |

---

## 9. RISK ASSESSMENT

### 9.1 Risk Matrix

| Risk | Likelihood | Impact | Mitigation | Residual Risk |
|------|------------|--------|------------|---------------|
| Data exfiltration via HTTP | Very Low | High | DLP blocks all HTTP | LOW |
| Unauthorized access | Low | High | Azure AD MFA + RBAC | LOW |
| AI hallucination | Medium | Medium | KB grounding, validation | MEDIUM |
| Service unavailability | Low | Medium | Microsoft SLA 99.9% | LOW |
| Configuration error | Low | Medium | Testing framework | LOW |
| Knowledge base tampering | Very Low | High | SharePoint permissions | LOW |

### 9.2 Risk Mitigations

| Risk Category | Control | Effectiveness |
|---------------|---------|---------------|
| Connectivity | DLP policy enforcement | HIGH |
| Authentication | Azure AD MFA | HIGH |
| Authorization | Dataverse RBAC | HIGH |
| Data Protection | Encryption at rest/transit | HIGH |
| Availability | Microsoft managed infrastructure | HIGH |
| Integrity | Version-controlled KB | MEDIUM |

### 9.3 Accepted Residual Risks

| Risk | Residual Level | Justification |
|------|----------------|---------------|
| AI output accuracy | MEDIUM | Mitigated by KB grounding, human review |
| Platform outage | LOW | Microsoft SLA provides adequate assurance |
| Insider threat | LOW | Standard enterprise controls apply |

### 9.4 Strategic & Business Risks

In addition to technical security risks, the following strategic and business risks are identified for executive awareness:

| Risk Category | Risk | Likelihood | Impact | Mitigation |
|---------------|------|------------|--------|------------|
| **Adoption** | Users don't adopt platform | Medium | Medium | Phased rollout, champion network, executive sponsorship |
| **Competitive** | Competitors launch similar capabilities | High | Medium | First-mover advantage, Mastercard data moat, rapid iteration |
| **Dependency** | Microsoft changes platform/pricing | Low | High | Portable architecture, abstraction layer |
| **Regulatory** | AI governance requirements increase | Medium | Medium | Audit logging in place, explainability features |
| **Resource** | Cannot hire/retain platform team | Medium | High | Competitive compensation, clear career path |
| **Integration** | Mastercard data integration delays | Medium | Medium | Phased approach, alternative value delivery |

### 9.5 AI-Specific Governance Considerations

| Consideration | MCMAP Approach | Status |
|---------------|----------------|--------|
| **Explainability** | All responses cite knowledge base sources | Implemented |
| **Auditability** | Complete telemetry logging | Implemented |
| **Human Oversight** | Users review and approve all outputs | By design |
| **Bias Monitoring** | Evaluation framework includes fairness checks | Implemented |
| **Data Minimization** | No PII processing, session isolation | Implemented |
| **Model Governance** | Microsoft-managed LLM, no custom training | By design |

### 9.6 Regulatory Landscape

| Regulation | Applicability | MCMAP Compliance |
|------------|---------------|------------------|
| **EU AI Act** | Medium (marketing services) | Low-risk classification expected |
| **GDPR** | High (EU users) | No PII processing, consent not required |
| **CCPA** | Medium (CA users) | No consumer data processing |
| **SOX** | Low (not financial reporting) | Audit trail available if needed |
| **Industry-Specific** | Varies by client vertical | Configurable compliance constraints |

---

## 10. SECURITY CONTROLS MATRIX

### 10.1 Control Categories

| Control Domain | Controls Implemented | Compliance |
|----------------|---------------------|------------|
| Access Control | Azure AD, MFA, RBAC | Yes |
| Data Protection | Encryption, DLP, Data minimization | Yes |
| Network Security | TLS, No external connectivity | Yes |
| Audit & Accountability | Comprehensive logging | Yes |
| Incident Response | Defined procedures | Yes |
| Configuration Management | Version control, change management | Yes |
| System Integrity | Input validation, KB grounding | Yes |

### 10.2 Control Verification Schedule

| Control | Verification Method | Frequency |
|---------|---------------------|-----------|
| DLP Policy | Power Platform Admin review | Monthly |
| Access Permissions | Security role audit | Quarterly |
| Audit Logs | Log completeness check | Weekly |
| Authentication | Azure AD sign-in review | Monthly |
| Encryption | Configuration verification | Quarterly |
| Incident Response | Tabletop exercise | Annually |

### 10.3 Security Sign-Off Checklist

```
SECURITY APPROVAL CHECKLIST

Pre-Deployment Security Review:

[X] DLP compliance verified - no HTTP connectors
[X] Approved connectors only - verified against policy
[X] Azure AD authentication configured
[X] RBAC roles defined and assigned
[X] Audit logging enabled and tested
[X] Data encryption verified (at rest and in transit)
[X] Session isolation confirmed
[X] Knowledge base permissions secured
[X] Incident response procedures documented
[X] Security contact identified

Approved By: ____________________  Date: ____________

Security Contact: ____________________
```

---

## 11. DEVELOPMENT DATA PROVENANCE & BUILD SECURITY ATTESTATION

### 11.1 Overview

This section provides formal attestation regarding the data sources, development process, and security measures employed during the creation of MCMAP. It addresses a critical governance question: **How can Mastercard be confident that building this platform outside the corporate firewall did not compromise security or expose proprietary information?**

### 11.2 Development Data Provenance Attestation

| Attestation | Statement | Evidence |
|-------------|-----------|----------|
| **No Proprietary MC Data Used** | MCMAP was built without access to any Mastercard proprietary data, systems, or confidential information | All training data and knowledge base content derived from public sources |
| **Public Sources Only** | All knowledge base content was sourced from publicly available industry publications, academic research, vendor documentation, and open frameworks | KB file headers include source citations |
| **No Internal System Access** | Development occurred without connection to Mastercard internal networks, databases, or document repositories | Development environment isolated from MC infrastructure |
| **No Confidential Information** | No Mastercard trade secrets, customer data, internal processes, or confidential business information was incorporated | Content review confirms public-source derivation |

### 11.3 Knowledge Base Content Sourcing

All 140+ knowledge base files were created using exclusively public information:

| Content Category | Public Sources Used | Proprietary MC Data | Status |
|------------------|---------------------|---------------------|--------|
| **Media Planning Methodologies** | Industry publications (eMarketer, IAB, MMA), academic research, agency white papers | NONE | Verified |
| **Analytics Frameworks** | Public statistical methods, open-source algorithms, academic literature | NONE | Verified |
| **Audience Segmentation** | Industry-standard approaches (RFM, LTV models), public CDP documentation | NONE | Verified |
| **Channel Benchmarks** | Published industry benchmarks, vendor documentation (Google, Meta, LinkedIn) | NONE | Verified |
| **Attribution Models** | Academic papers, industry consortium publications (MRC, IAB) | NONE | Verified |
| **Programmatic Standards** | IAB Tech Lab specifications, OpenRTB documentation, public DSP/SSP documentation | NONE | Verified |
| **Consulting Frameworks** | Publicly available strategic frameworks (Porter, McKinsey 7S, SWOT, etc.) | NONE | Verified |
| **Vertical Industry Content** | Public industry reports, trade association publications, regulatory guidance | NONE | Verified |

### 11.4 Development Environment Security

The development environment was intentionally isolated from Mastercard systems:

```
+-----------------------------------------------------------------------------+
|                    DEVELOPMENT ENVIRONMENT (ISOLATED)                        |
+-----------------------------------------------------------------------------+
|                                                                              |
|  +-------------------------------------------------------------------------+|
|  | DEVELOPMENT TOOLS                   DATA SOURCES                        ||
|  |                                                                         ||
|  |  - Claude.ai (AI assistance)        - Public industry publications      ||
|  |  - Claude Code (VS Code)            - Open-source documentation         ||
|  |  - GitHub (version control)         - Academic research papers          ||
|  |  - Braintrust (testing)             - Vendor public documentation       ||
|  |  - Perplexity (research)            - Industry consortium specs         ||
|  |  - ChatGPT (supplementary)          - Publicly available benchmarks     ||
|  |                                                                         ||
|  +-------------------------------------------------------------------------+|
|                                                                              |
|                         NO CONNECTION TO:                                    |
|                                                                              |
|  +-------------------------------------------------------------------------+|
|  |                                                                         ||
|  |  X Mastercard internal networks      X MC customer databases            ||
|  |  X Mastercard SharePoint/Teams       X MC transaction data              ||
|  |  X Mastercard confidential docs      X MC proprietary algorithms        ||
|  |  X Mastercard data products          X MC internal research             ||
|  |                                                                         ||
|  +-------------------------------------------------------------------------+|
|                                                                              |
+-----------------------------------------------------------------------------+
```

### 11.5 Build Process Security

| Phase | Security Measure | Verification |
|-------|------------------|--------------|
| **Development** | Personal development environment with no MC system access | Environment audit |
| **Version Control** | Private GitHub repository with access controls | Repository settings |
| **Testing** | Braintrust platform with synthetic test data only | Test data review |
| **Code Review** | All code reviewed for proprietary data references | Code scan complete |
| **Documentation** | All documents cite public sources only | Source verification |

### 11.6 Deployment Isolation Measures

When deployed to Mastercard environments, MCMAP operates under strict isolation:

| Control | Implementation | Effect |
|---------|----------------|--------|
| **No Outbound HTTP** | DLP policy blocks all HTTP connectors | Data cannot leave MC boundary |
| **No External APIs** | Custom connectors blocked by policy | No external service calls possible |
| **Internal Storage Only** | All data persists in Dataverse/SharePoint | Data stays within MC tenant |
| **No Internet KB Access** | Knowledge base hosted in MC SharePoint | KB retrieval is internal only |
| **No External AI Calls** | AI Builder uses MC-tenant GPT instances | No data sent to external models |
| **No Code Execution** | No Azure Functions or external compute | All logic in Copilot/Power Automate |

### 11.7 Data Flow Security Post-Deployment

```
+-----------------------------------------------------------------------------+
|               MASTERCARD ENVIRONMENT (POST-DEPLOYMENT)                       |
+-----------------------------------------------------------------------------+
|                                                                              |
|  +-------------------------------------------------------------------------+|
|  |                    INTERNAL DATA FLOWS ONLY                             ||
|  |                                                                         ||
|  |    USER <-> COPILOT STUDIO <-> AI BUILDER <-> DATAVERSE                ||
|  |                  |                                                      ||
|  |           SHAREPOINT KB                                                 ||
|  |           (MC-hosted)                                                   ||
|  |                                                                         ||
|  |    All computation and storage within MC security boundary              ||
|  +-------------------------------------------------------------------------+|
|                                                                              |
|                    +------------------------+                                |
|                    |   DLP ENFORCEMENT      |                                |
|                    |   LAYER                |                                |
|                    |                        |                                |
|                    |  X HTTP blocked        |                                |
|                    |  X Custom blocked      |                                |
|                    |  X External blocked    |                                |
|                    +------------------------+                                |
|                              |                                               |
|                              V                                               |
|                    +------------------------+                                |
|                    |   EXTERNAL INTERNET    |                                |
|                    |   (NO ACCESS)          |                                |
|                    +------------------------+                                |
|                                                                              |
+-----------------------------------------------------------------------------+
```

### 11.8 No Data Leakage Attestation

| Attestation Point | Status | Evidence |
|-------------------|--------|----------|
| **During Development** | No MC data exposed | Development used public sources only |
| **In Code Repository** | No MC data in code | GitHub repository contains no proprietary data |
| **In Knowledge Base** | No MC data in KB | All KB content from public sources |
| **During Testing** | No MC data in tests | Test scenarios use synthetic data |
| **Post-Deployment** | No MC data can exit | DLP blocks all outbound data flows |

### 11.9 Third-Party Tool Data Handling

| Tool | Data Shared | MC Proprietary Data | Data Retention |
|------|-------------|---------------------|----------------|
| **Claude.ai/Claude Code** | Code, prompts, generic questions | NONE | Per Anthropic policy |
| **GitHub** | Source code, documentation | NONE | Private repository |
| **Braintrust** | Test scenarios, synthetic data | NONE | Per Braintrust policy |
| **Perplexity/ChatGPT** | Research queries | NONE | Per provider policies |

**Note:** All tools received only generic industry questions and public information. No Mastercard-specific data, customer information, or proprietary business details were shared with any third-party service.

### 11.10 Comparison: Development Environment vs. Production Environment

| Aspect | Development (External) | Production (MC Environment) |
|--------|------------------------|------------------------------|
| **Data Sources** | Public information only | MC-approved data + public info |
| **Network Access** | Standard internet | MC internal network only |
| **Data Storage** | Local/GitHub | Dataverse/SharePoint (MC tenant) |
| **Outbound Connectivity** | Standard internet | BLOCKED by DLP |
| **AI Model Access** | Public Claude/GPT APIs | MC-tenant AI Builder only |
| **Security Controls** | Standard development practices | Full MC enterprise security |

### 11.11 Security Confidence Statement

**The external development of MCMAP does not compromise Mastercard's security posture because:**

1. **No proprietary data was ever at risk** - Development used exclusively public information
2. **The platform has no backdoors** - All code is visible, auditable, and contains no external dependencies
3. **Deployment isolation is absolute** - DLP policies physically prevent data from leaving MC boundaries
4. **The architecture is designed for isolation** - No HTTP connectors, no external APIs, no custom code execution
5. **All runtime data stays internal** - User data, session data, and generated content never leave MC tenant

### 11.12 Development Data Provenance Sign-Off Checklist

```
DEVELOPMENT DATA PROVENANCE ATTESTATION

I attest that the following statements are true:

[ ] No Mastercard proprietary data was used in developing this platform
[ ] All knowledge base content was derived from publicly available sources
[ ] No Mastercard customer data was accessed or incorporated
[ ] No Mastercard internal systems were connected during development
[ ] No Mastercard confidential business information was incorporated
[ ] The GitHub repository contains no Mastercard proprietary data
[ ] All test scenarios use synthetic data, not real MC data
[ ] Third-party tools received no Mastercard-specific information
[ ] The deployed solution operates entirely within MC security boundaries
[ ] DLP policies prevent any data exfiltration post-deployment

Developer Attestation: ____________________  Date: ____________

Security Review: ____________________  Date: ____________

Compliance Acknowledgment: ____________________  Date: ____________
```

---

## 12. ATTRIBUTE-BASED ACCESS CONTROL (ABAC)

### 12.1 ABAC Architecture Overview

MCMAP implements Attribute-Based Access Control integrated with the Mastercard Microsoft Directory for granular content protection:

```
+-----------------------------------------------------------------------------+
|                    ABAC ENFORCEMENT LAYER                                    |
+-----------------------------------------------------------------------------+
|                                                                              |
|  USER SESSION START                                                          |
|        |                                                                     |
|        V                                                                     |
|  +---------------------------+      +----------------------------------+     |
|  | MCMAP_User_Profile_Sync   |----->| eap_user_profile Table           |     |
|  | (Microsoft Graph API)     |      | - employee_level                 |     |
|  +---------------------------+      | - department, team, division     |     |
|                                     | - region, country                |     |
|                                     | - security_groups, manager_chain |     |
|                                     +----------------------------------+     |
|                                                    |                         |
|  CONTENT REQUEST                                   V                         |
|        |                              +----------------------------------+   |
|        V                              | eap_access_rule Table            |   |
|  +---------------------------+        | - conditions_json (ABAC rules)   |   |
|  | MCMAP_Check_Content_Access|------->| - applies_when_abac_off flag     |   |
|  | (Rule Evaluation)         |        +----------------------------------+   |
|  +---------------------------+                     |                         |
|        |                                           |                         |
|        +--------------------+----------------------+                         |
|                             |                                                |
|               +-------------+-------------+                                  |
|               |                           |                                  |
|               V                           V                                  |
|        ACCESS GRANTED              ACCESS DENIED                             |
|        (Return content)            (Graceful message)                        |
|                                                                              |
+-----------------------------------------------------------------------------+
```

### 12.2 Two-Mode Operation

| Mode | ABAC_ENABLED | Protection Level |
|------|--------------|------------------|
| **Launch Mode** (default) | false | C-Suite documents only (CEO Brief, 00-A through 00-D, Investment Proposal) |
| **Full ABAC Mode** | true | All rules active (department, division, region, data areas) |

### 12.3 User Profile Attributes Captured

| Attribute | Source | Purpose |
|-----------|--------|---------|
| employee_level | Microsoft Directory / Job Title | Role-based access |
| department | Microsoft Directory | Department restrictions |
| team | Extension attribute | Team-level access |
| division | Microsoft Directory | Division-based rules |
| region | Usage location | Geographic restrictions |
| country | Microsoft Directory | Country-specific content |
| security_groups | Azure AD | Group-based access |
| manager_chain | Microsoft Graph | Hierarchical access |

### 12.4 ABAC Condition Operators

| Operator | Description | Example |
|----------|-------------|---------|
| EQUALS | Exact match | department EQUALS "Finance" |
| IN | Value in list | employee_level IN ["EVP", "SVP", "VP"] |
| NOT_IN | Value not in list | division NOT_IN ["Corporate"] |
| CONTAINS | String contains | job_title CONTAINS "Director" |
| MEMBER_OF | Security group | security_group MEMBER_OF "MCMAP-Executive-Access" |
| MANAGER_CHAIN | Manager hierarchy | manager_chain CONTAINS "user-guid" |

### 12.5 Access Denial Handling

When access is denied, the system:

1. **Returns graceful message**: "This content requires specific access permissions."
2. **Offers access request**: "To request access, say 'request access' and I'll submit your request."
3. **Never reveals**:
   - Platform Owner email address
   - Specific access conditions
   - Workarounds to access content

### 12.6 Access Request Workflow

| Step | Action | Data Captured |
|------|--------|---------------|
| 1 | User says "request access" | Request initiated |
| 2 | System asks for content desired | requested_content |
| 3 | System asks for justification | justification |
| 4 | Request submitted | Full user profile + request details |
| 5 | Email sent to Platform Owner | All context for decision |
| 6 | User receives confirmation | Request ID, 2-day SLA |

### 12.7 ABAC Security Controls

| Control | Implementation | Verification |
|---------|----------------|--------------|
| Rule Evaluation | Server-side Power Automate | Cannot be bypassed from client |
| Profile Sync | Microsoft Graph API | Authoritative directory source |
| Telemetry Logging | All access checks logged | Full audit trail |
| Email Protection | Hardcoded in flow | Never exposed to user |
| Condition Privacy | Never disclosed to user | Prevents gaming |

### 12.8 ABAC-Related Dataverse Tables

| Table | Purpose | Records |
|-------|---------|---------|
| eap_security_config | Global toggles (ABAC_ENABLED, etc.) | 8 |
| eap_user_profile | User attributes from directory | Per user |
| eap_access_rule | Access rule definitions | ~20 |
| eap_access_request | Access request tracking | Per request |

**Reference:** For complete ABAC implementation details, see `MCMAP_ABAC_Implementation.md`

---

## APPENDIX A: SECURITY CONFIGURATION REFERENCE

### A.1 Azure AD Application Registration

```
Application: MCMAP Copilot Platform
Application ID: [Mastercard-assigned]
Authentication: Azure AD single tenant
API Permissions:
  - User.Read (Delegated)
  - Sites.Read.All (Delegated) - SharePoint KB access
  - Directory.Read.All (Delegated) - User lookup
```

### A.2 Dataverse Security Roles

```
Role: MCMAP User
  - eap_* tables: Read organization-wide
  - mpa_session: Create/Read/Write own records
  - mpa_* reference tables: Read organization-wide

Role: MCMAP Administrator
  - All eap_* tables: Full permissions
  - All mpa_* tables: Full permissions
  - System administrator rights for MCMAP solution
```

### A.3 SharePoint Permissions

```
Site: MCMAP Knowledge Base
Library: Shared Documents
  - MCMAP Users: Read
  - MCMAP Administrators: Contribute
  - MCMAP Developers: Full Control
```

---

**Document Version:** 1.1  
**Classification:** Mastercard Internal - Security Sensitive  
**Last Updated:** January 24, 2026  
**Next Review:** April 24, 2026  
**Change Log:** v1.1 - Added Section 11: Development Data Provenance & Build Security Attestation
