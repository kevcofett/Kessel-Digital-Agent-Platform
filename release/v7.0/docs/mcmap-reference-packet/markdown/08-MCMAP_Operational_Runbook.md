# MCMAP Operational Runbook

**Document:** 07-MCMAP_Operational_Runbook.md  
**Version:** 1.0  
**Date:** January 23, 2026  
**Classification:** Mastercard Internal - Operations Reference  
**Audience:** Operations Teams, Support Engineers, Platform Administrators

---

## Table of Contents

1. [Operations Overview](#1-operations-overview)
2. [Monitoring & Alerting](#2-monitoring--alerting)
3. [Incident Management](#3-incident-management)
4. [Support Procedures](#4-support-procedures)
5. [Maintenance Operations](#5-maintenance-operations)
6. [Troubleshooting Guide](#6-troubleshooting-guide)
7. [Escalation Procedures](#7-escalation-procedures)
8. [Service Level Agreements](#8-service-level-agreements)
9. [Capacity Management](#9-capacity-management)
10. [Disaster Recovery](#10-disaster-recovery)

---

## 1. Operations Overview

### 1.1 Platform Components

MCMAP consists of these operational components:

| Component | Technology | Owner | Criticality |
|-----------|------------|-------|-------------|
| Copilot Agents (10) | Copilot Studio | Platform Team | Critical |
| Power Automate Flows (5) | Power Automate | Platform Team | Critical |
| AI Builder Prompts (26) | AI Builder | Platform Team | Critical |
| Dataverse Tables (14) | Dataverse | Platform Team | Critical |
| SharePoint KB (37 files) | SharePoint | Content Team | High |
| Teams Integration | Teams | Platform Team | Medium |

### 1.2 Operations Model

```
+-----------------------------------------------------------------+
|                    MCMAP OPERATIONS MODEL                        |
+-----------------------------------------------------------------+
|                                                                 |
|  +-------------+    +-------------+    +-------------+         |
|  |   L1        |    |   L2        |    |   L3        |         |
|  |  Support    |----||  Support    |----||  Engineering|         |
|  |             |    |             |    |             |         |
|  | - Triage    |    | - Diagnosis |    | - Root Cause|         |
|  | - Known     |    | - Config    |    | - Code Fix  |         |
|  |   Issues    |    |   Changes   |    | - Deploy    |         |
|  | - User Help |    | - Restart   |    | - Architect |         |
|  +-------------+    +-------------+    +-------------+         |
|        |                  |                  |                  |
|        v                  v                  v                  |
|  +---------------------------------------------------------+   |
|  |              MONITORING & ALERTING                      |   |
|  |  - Power Platform Admin Center                          |   |
|  |  - Dataverse Telemetry Queries                          |   |
|  |  - Teams Alert Channel                                  |   |
|  +---------------------------------------------------------+   |
|                                                                 |
+-----------------------------------------------------------------+
```

### 1.3 Operating Hours

| Service | Hours | Timezone |
|---------|-------|----------|
| Platform Availability | 24x7 | - |
| L1 Support | Business Hours | Local |
| L2 Support | Business Hours | US Eastern |
| L3 Engineering | On-Call | US Eastern |
| Planned Maintenance | Sundays 02:00-06:00 | US Eastern |

### 1.4 Key Contacts

| Role | Contact | Escalation Path |
|------|---------|-----------------|
| L1 Support | ServiceNow Ticket | 15 min SLA response |
| L2 Support | Teams: MCMAP-Support | 1 hour SLA |
| L3 Engineering | On-call rotation | 4 hour SLA |
| Platform Owner | Product Manager | Management escalation |
| Microsoft Support | Premier Support | Vendor escalation |

---

## 2. Monitoring & Alerting

### 2.1 Monitoring Architecture

```
+-----------------------------------------------------------------+
|                    MONITORING LAYERS                            |
+-----------------------------------------------------------------+
|                                                                 |
|  LAYER 1: Platform Health                                       |
|  +-- Power Platform Admin Center                                |
|  +-- Service Health Dashboard                                   |
|  +-- Capacity metrics                                           |
|                                                                 |
|  LAYER 2: Application Telemetry                                 |
|  +-- eap_telemetry table (custom)                              |
|  +-- Capability success/failure rates                           |
|  +-- Execution time metrics                                     |
|                                                                 |
|  LAYER 3: User Experience                                       |
|  +-- User feedback (thumbs up/down)                            |
|  +-- Session completion rates                                   |
|  +-- Error rates by user                                        |
|                                                                 |
|  LAYER 4: Business Metrics                                      |
|  +-- Daily active users                                         |
|  +-- Capability usage distribution                              |
|  +-- Document generation volume                                 |
|                                                                 |
+-----------------------------------------------------------------+
```

### 2.2 Key Metrics & Thresholds

| Metric | Description | Warning | Critical | Source |
|--------|-------------|---------|----------|--------|
| Capability Success Rate | % successful capability calls | < 98% | < 95% | eap_telemetry |
| Average Response Time | Mean capability execution | > 5s | > 10s | eap_telemetry |
| AI Builder Latency | AI Builder prompt response | > 3s | > 8s | eap_telemetry |
| Error Rate | Errors per 100 requests | > 3% | > 5% | eap_telemetry |
| Routing Accuracy | Correct agent routing | < 95% | < 90% | eap_telemetry |
| Active Sessions | Concurrent sessions | > 80% capacity | > 95% capacity | eap_session |
| KB Retrieval Hit Rate | Relevant KB retrieved | < 90% | < 80% | eap_telemetry |
| Flow Run Success | Power Automate success | < 98% | < 95% | Admin Center |
| API Requests | Dataverse API usage | > 80% limit | > 95% limit | Admin Center |

### 2.3 Dataverse Monitoring Queries

**Query 1: Hourly Error Rate**

```
Table: eap_telemetry
Filter: created_on >= NOW() - 1 HOUR
Group By: HOUR(created_on), event_type
Calculate: 
  - total_calls = COUNT(*)
  - errors = COUNT(*) WHERE event_type = 'CAPABILITY_FAILURE'
  - error_rate = errors / total_calls * 100
Alert: IF error_rate > 5% THEN CRITICAL
```

**Query 2: Capability Performance**

```
Table: eap_telemetry
Filter: 
  - event_type = 'CAPABILITY_SUCCESS'
  - created_on >= NOW() - 1 DAY
Group By: capability_code
Aggregate:
  - avg_time = AVG(execution_time_ms)
  - p95_time = PERCENTILE(execution_time_ms, 0.95)
  - call_count = COUNT(*)
Order By: avg_time DESC
Alert: IF p95_time > 8000 THEN WARNING
```

**Query 3: Agent Routing Distribution**

```
Table: eap_telemetry
Filter: 
  - event_type = 'ROUTING'
  - created_on >= NOW() - 1 DAY
Group By: agent_code
Aggregate:
  - route_count = COUNT(*)
  - pct_of_total = COUNT(*) / SUM(COUNT(*)) * 100
Order By: route_count DESC
```

### 2.4 Alert Configuration

**Alert Channels:**

| Channel | Alert Types | Recipients |
|---------|-------------|------------|
| Teams: MCMAP-Alerts | Critical, Warning | L2 Support, Engineering |
| Email | Critical | Platform Owner, L3 On-call |
| ServiceNow | All severities | Auto-ticket creation |
| Power Automate | Critical | Trigger remediation flows |

**Alert Templates:**

**Critical Alert:**
```
[!] CRITICAL: MCMAP Platform Alert

Metric: Capability Success Rate
Current: 92.3%
Threshold: < 95%
Duration: 15 minutes

Affected Components:
- ANL agent capabilities
- AI Builder prompts

Impact: Users experiencing calculation failures

Action Required: L3 Engineering escalation
Runbook: Section 6.2 - AI Builder Failures
```

**Warning Alert:**
```
[*] WARNING: MCMAP Performance Degradation

Metric: Average Response Time
Current: 6.2 seconds
Threshold: > 5 seconds
Duration: 30 minutes

Trend: Increasing over last hour

Action Required: L2 investigation
Runbook: Section 6.3 - Performance Issues
```

### 2.5 Dashboard Views

**Operations Dashboard (Power BI):**

| Section | Visualizations |
|---------|----------------|
| Platform Health | Success rate gauge, error trend chart |
| Performance | Response time histogram, latency by capability |
| Usage | Active users, requests per hour, agent distribution |
| Errors | Error breakdown by type, top error messages |
| Capacity | API usage, session count, storage utilization |

---

## 3. Incident Management

### 3.1 Incident Classification

| Severity | Definition | Response Time | Resolution Target |
|----------|------------|---------------|-------------------|
| **SEV-1 Critical** | Complete platform outage, all users affected | 15 minutes | 2 hours |
| **SEV-2 High** | Major feature unavailable, many users affected | 1 hour | 4 hours |
| **SEV-3 Medium** | Partial degradation, some users affected | 4 hours | 24 hours |
| **SEV-4 Low** | Minor issue, workaround available | 24 hours | 72 hours |

### 3.2 Incident Response Workflow

```
+-----------------------------------------------------------------+
|                 INCIDENT RESPONSE WORKFLOW                      |
+-----------------------------------------------------------------+
|                                                                 |
|  DETECTION                                                      |
|  +-- Alert triggered OR user report                            |
|  +-- ServiceNow ticket created                                  |
|         |                                                       |
|         v                                                       |
|  TRIAGE (L1 - 15 min)                                          |
|  +-- Classify severity                                          |
|  +-- Check known issues                                         |
|  +-- Assign to appropriate team                                 |
|         |                                                       |
|         v                                                       |
|  DIAGNOSIS (L2 - varies by severity)                           |
|  +-- Review telemetry                                           |
|  +-- Check component health                                     |
|  +-- Identify affected scope                                    |
|         |                                                       |
|         v                                                       |
|  CONTAINMENT                                                    |
|  +-- Isolate affected component if possible                    |
|  +-- Enable fallback mechanisms                                 |
|  +-- Communicate status to stakeholders                         |
|         |                                                       |
|         v                                                       |
|  RESOLUTION                                                     |
|  +-- Apply fix (config change, restart, deploy)                |
|  +-- Verify resolution                                          |
|  +-- Monitor for recurrence                                     |
|         |                                                       |
|         v                                                       |
|  POST-INCIDENT                                                  |
|  +-- Document root cause                                        |
|  +-- Create follow-up tickets                                   |
|  +-- Update runbook if needed                                   |
|                                                                 |
+-----------------------------------------------------------------+
```

### 3.3 Incident Communication Template

**Initial Notification:**
```
Subject: [SEV-X] MCMAP Incident - {Brief Description}

Status: INVESTIGATING

Summary:
{What is happening}

Impact:
{Who is affected and how}

Current Actions:
{What is being done}

Next Update: {Time}

Incident Commander: {Name}
```

**Resolution Notification:**
```
Subject: [RESOLVED] MCMAP Incident - {Brief Description}

Status: RESOLVED

Summary:
{What happened}

Root Cause:
{Why it happened}

Resolution:
{What was done to fix}

Duration: {Start time} to {End time} ({Duration})

Follow-up:
{Any planned improvements}
```

### 3.4 War Room Procedures

For SEV-1 and SEV-2 incidents:

1. **Activate War Room** - Teams meeting: MCMAP-Incident-Bridge
2. **Assign Roles:**
   - Incident Commander: Overall coordination
   - Technical Lead: Diagnosis and resolution
   - Communications Lead: Stakeholder updates
   - Scribe: Document timeline and actions
3. **Status Updates:** Every 15 minutes (SEV-1) or 30 minutes (SEV-2)
4. **Stakeholder List:** Platform Owner, Engineering Manager, Support Lead

---

## 4. Support Procedures

### 4.1 L1 Support Procedures

**Responsibilities:**
- Initial triage of all tickets
- Resolution of known issues with documented solutions
- User guidance and basic troubleshooting
- Escalation to L2 when required

**Common L1 Resolutions:**

| Issue | Resolution |
|-------|------------|
| User can't access agent | Verify user permissions in Dataverse |
| Slow response | Check current platform status, advise retry |
| Session timeout | Clear browser cache, start new session |
| Document not generated | Verify session has required data |
| Wrong agent response | Confirm user input was clear |

**L1 Checklist:**

- [ ] Verify user identity and permissions
- [ ] Check platform status page
- [ ] Review recent telemetry for user's session
- [ ] Search knowledge base for known issue
- [ ] Attempt documented resolution
- [ ] If unresolved after 15 minutes, escalate to L2

### 4.2 L2 Support Procedures

**Responsibilities:**
- Diagnosis of complex issues
- Configuration changes within approved scope
- Flow restart and recovery operations
- Coordination with L3 for code-level issues

**L2 Diagnostic Steps:**

1. **Review Telemetry:**
   - Query eap_telemetry for session_id
   - Check capability invocations and results
   - Identify error patterns

2. **Check Component Health:**
   - Power Platform Admin Center status
   - Dataverse API limits
   - AI Builder availability

3. **Configuration Verification:**
   - eap_capability_implementation records
   - eap_environment_config settings
   - Flow connection status

**L2 Remediation Actions:**

| Action | When to Use | Risk |
|--------|-------------|------|
| Restart Flow | Flow stuck or timeout | Low |
| Clear Session | Corrupted session state | Low |
| Refresh Connection | Authentication issues | Low |
| Toggle Capability | Isolate problematic capability | Medium |
| Update Config | Threshold adjustments | Medium |

### 4.3 L3 Engineering Procedures

**Responsibilities:**
- Root cause analysis for complex issues
- Code and prompt modifications
- Deployment of fixes
- Architecture decisions during incidents

**L3 Investigation Tools:**

| Tool | Purpose |
|------|---------|
| Dataverse Advanced Find | Complex query building |
| Flow Run History | Detailed flow execution trace |
| AI Builder Logs | Prompt execution details |
| Solution History | Deployment verification |

**L3 Remediation Actions:**

| Action | Approval Required | Deployment |
|--------|-------------------|------------|
| Prompt Update | L3 Lead | Solution import |
| Flow Modification | L3 Lead | Solution import |
| KB Content Update | Content Team | SharePoint upload |
| Schema Change | Architecture Review | Solution import |
| New Capability | Product Owner | Full deployment |

---

## 5. Maintenance Operations

### 5.1 Maintenance Schedule

| Maintenance Type | Frequency | Window | Notification |
|------------------|-----------|--------|--------------|
| Planned Updates | Weekly | Sunday 02:00-06:00 ET | 48 hours |
| Emergency Patches | As needed | Any time | Best effort |
| KB Updates | Weekly | During business hours | None required |
| Platform Updates | Monthly | Sunday 02:00-06:00 ET | 1 week |

### 5.2 Deployment Procedure

**Pre-Deployment Checklist:**

- [ ] Solution exported from dev environment
- [ ] Test cases pass in staging
- [ ] Rollback plan documented
- [ ] Maintenance notification sent
- [ ] On-call engineer confirmed

**Deployment Steps:**

1. **Backup Current State:**
   - Export current solution
   - Record current eap_capability_implementation values
   - Note current KB file versions

2. **Deploy Solution:**
   ```
   pac solution import --path MCMAP_Solution.zip --async true
   ```

3. **Verify Deployment:**
   - Check solution import status
   - Verify all flows are active
   - Run smoke test capabilities
   - Confirm telemetry logging

4. **Post-Deployment:**
   - Monitor error rates for 30 minutes
   - Verify user-reported functionality
   - Close maintenance window

**Rollback Procedure:**

1. Import previous solution version
2. Restore eap_capability_implementation records from backup
3. Verify functionality
4. Document rollback reason

### 5.3 Knowledge Base Updates

**KB Update Process:**

1. Content team updates documents
2. Compliance verification (6-Rule Framework):
   - [ ] ALL-CAPS headers
   - [ ] Hyphens-only lists
   - [ ] ASCII characters only
   - [ ] Character limit compliance
3. Upload to SharePoint via pac CLI
4. Verify Copilot retrieval
5. Run KB retrieval tests

**KB File Management:**

| Operation | Tool | Notes |
|-----------|------|-------|
| Upload | pac CLI | Maintains file metadata |
| Update | pac CLI | Overwrites existing |
| Delete | SharePoint UI | Requires admin approval |
| Versioning | SharePoint | Automatic version history |

### 5.4 Data Maintenance

**Regular Data Tasks:**

| Task | Frequency | Procedure |
|------|-----------|-----------|
| Telemetry Cleanup | Daily | Delete records > 180 days |
| Session Cleanup | Weekly | Delete expired sessions |
| Test Data Cleanup | Monthly | Remove test user data |
| Benchmark Update | Quarterly | Refresh mpa_benchmark values |

**Telemetry Retention Script:**

```
DELETE FROM eap_telemetry
WHERE created_on < DATEADD(day, -180, GETDATE())
```

---

## 6. Troubleshooting Guide

### 6.1 Agent Not Responding

**Symptoms:**
- User sends message, no response
- Timeout error displayed

**Diagnostic Steps:**

1. Check Copilot Studio agent status
2. Verify agent is published
3. Check Teams channel connection
4. Review flow run history for errors

**Resolution:**

| Finding | Action |
|---------|--------|
| Agent not published | Publish agent in Copilot Studio |
| Flow failed | Check flow error, restart if stuck |
| Connection expired | Refresh connection reference |
| Rate limited | Wait and retry, check capacity |

### 6.2 AI Builder Failures

**Symptoms:**
- Capability returns error
- Partial or garbled response
- Timeout during calculation

**Diagnostic Steps:**

1. Query eap_telemetry for capability_code
2. Check error_message field
3. Review AI Builder activity logs
4. Verify prompt configuration in eap_prompt

**Common AI Builder Errors:**

| Error | Cause | Resolution |
|-------|-------|------------|
| Invalid JSON response | Prompt returned malformed output | Review and fix prompt |
| Timeout | Complex request or high load | Simplify input, retry |
| Rate limit | Too many requests | Implement backoff |
| Content filter | Response blocked by safety | Adjust prompt wording |

### 6.3 Performance Degradation

**Symptoms:**
- Response times > 5 seconds
- User complaints of slowness
- Timeouts increasing

**Diagnostic Steps:**

1. Check eap_telemetry for execution_time_ms trends
2. Identify slowest capabilities
3. Check Dataverse API limits
4. Review concurrent session count

**Resolution:**

| Finding | Action |
|---------|--------|
| Single capability slow | Optimize prompt or add caching |
| All capabilities slow | Check platform status, API limits |
| Specific time periods | Correlate with usage patterns |
| Growing trend | Plan capacity increase |

### 6.4 Routing Errors

**Symptoms:**
- User queries go to wrong agent
- Irrelevant responses
- ORC_INTENT_CLASSIFY confidence low

**Diagnostic Steps:**

1. Review recent routing telemetry
2. Check ORC_IntentClassify prompt performance
3. Analyze misrouted queries for patterns
4. Compare to routing test cases

**Resolution:**

| Finding | Action |
|---------|--------|
| Ambiguous queries | Improve intent prompt examples |
| New query patterns | Add training examples |
| Keyword overlap | Adjust agent capability tags |
| Systematic misroute | Review eap_agent configuration |

### 6.5 Session Issues

**Symptoms:**
- Context lost mid-conversation
- User state not persisting
- Session expired prematurely

**Diagnostic Steps:**

1. Query eap_session for user's session
2. Check session state_json
3. Verify session flow is active
4. Review session timeout configuration

**Resolution:**

| Finding | Action |
|---------|--------|
| Session not found | Check session creation flow |
| State corrupted | Clear session, start new |
| Expired early | Adjust expires_at calculation |
| Concurrent sessions | Verify session isolation |

### 6.6 Document Generation Failures

**Symptoms:**
- DOC agent fails to produce output
- Incomplete documents
- Format errors

**Diagnostic Steps:**

1. Check DOC capability telemetry
2. Verify session has required data
3. Review DOC_Generate prompt output
4. Check SharePoint permissions

**Resolution:**

| Finding | Action |
|---------|--------|
| Missing data | Guide user through required steps |
| Prompt error | Review and fix DOC prompts |
| SharePoint error | Check permissions, retry |
| Template issue | Verify template availability |

---

## 7. Escalation Procedures

### 7.1 Escalation Matrix

| Situation | Escalate To | Contact Method | SLA |
|-----------|-------------|----------------|-----|
| L1 cannot resolve | L2 Support | ServiceNow escalate | 15 min |
| L2 needs engineering | L3 On-call | Teams + Phone | 30 min |
| Platform outage | Platform Owner | Phone | Immediate |
| Security incident | Security Team | Security hotline | Immediate |
| Microsoft platform issue | Premier Support | Support portal | Per contract |

### 7.2 Management Escalation

Escalate to management when:
- SEV-1 incident exceeds 2 hours
- SEV-2 incident exceeds 4 hours
- Multiple incidents in 24 hours
- User executive complaint
- Data integrity concerns

**Management Notification:**
```
Subject: Management Escalation - MCMAP Incident

Incident: {Ticket number}
Severity: {SEV level}
Duration: {Time since detection}

Current Status:
{Brief description}

Why Escalating:
{Reason for management attention}

Requested Decision:
{What decision is needed}

Options:
1. {Option 1}
2. {Option 2}
```

### 7.3 Vendor Escalation

**Microsoft Premier Support:**

| Issue Type | Priority | Expected Response |
|------------|----------|-------------------|
| Platform outage | Critical | 1 hour |
| Feature not working | High | 4 hours |
| Performance issue | Medium | 8 hours |
| Question | Low | 24 hours |

**Information to Provide:**
- Tenant ID and environment details
- Detailed reproduction steps
- Telemetry and error messages
- Business impact statement
- Actions already attempted

---

## 8. Service Level Agreements

### 8.1 Availability SLA

| Metric | Target | Measurement |
|--------|--------|-------------|
| Platform Availability | 99.9% | Monthly uptime |
| Planned Downtime | < 4 hours/month | Maintenance windows |
| Unplanned Downtime | < 44 minutes/month | Incident duration |

### 8.2 Performance SLA

| Metric | Target | P95 |
|--------|--------|-----|
| User Query Response | < 5 seconds | < 8 seconds |
| Capability Execution | < 3 seconds | < 5 seconds |
| Document Generation | < 10 seconds | < 15 seconds |
| KB Retrieval | < 1 second | < 2 seconds |

### 8.3 Support SLA

| Severity | Response Time | Resolution Target | Escalation |
|----------|---------------|-------------------|------------|
| SEV-1 | 15 minutes | 2 hours | Immediate to L3 |
| SEV-2 | 1 hour | 4 hours | 2 hours to L3 |
| SEV-3 | 4 hours | 24 hours | 8 hours to L2 |
| SEV-4 | 24 hours | 72 hours | 48 hours to L2 |

### 8.4 SLA Reporting

**Monthly SLA Report Contents:**
- Availability percentage
- Incident count by severity
- Average response and resolution times
- SLA breaches with root cause
- Capacity utilization trends
- User satisfaction metrics

---

## 9. Capacity Management

### 9.1 Current Capacity

| Resource | Limit | Current Usage | Alert Threshold |
|----------|-------|---------------|-----------------|
| Dataverse API calls | 80,000/day | 35,000/day | 80% |
| AI Builder transactions | 10,000/month | 6,500/month | 80% |
| SharePoint storage | 25 GB | 2 GB | 80% |
| Power Automate runs | 250,000/month | 95,000/month | 80% |
| Concurrent sessions | 100 | 45 peak | 80% |

### 9.2 Capacity Planning

**Growth Projections:**

| Timeframe | Expected Users | API Calls/Day | AI Builder/Month |
|-----------|----------------|---------------|------------------|
| Current | 150 | 35,000 | 6,500 |
| +3 months | 250 | 60,000 | 11,000 |
| +6 months | 400 | 90,000 | 18,000 |
| +12 months | 600 | 140,000 | 27,000 |

**Capacity Triggers:**

| Trigger | Action |
|---------|--------|
| API usage > 70% | Review optimization opportunities |
| API usage > 80% | Request capacity increase |
| AI Builder > 70% | Evaluate prompt efficiency |
| AI Builder > 80% | Request license expansion |
| Storage > 70% | Implement retention policy |

### 9.3 Capacity Optimization

| Optimization | Impact | Implementation |
|--------------|--------|----------------|
| Caching benchmark data | -20% API calls | Session-level cache |
| Batch telemetry writes | -15% API calls | Async logging |
| Prompt token reduction | -10% AI Builder | Concise prompts |
| Session cleanup | -5% storage | Automated retention |

---

## 10. Disaster Recovery

### 10.1 Recovery Objectives

| Metric | Target | Notes |
|--------|--------|-------|
| RPO (Recovery Point Objective) | 1 hour | Maximum data loss |
| RTO (Recovery Time Objective) | 4 hours | Maximum downtime |
| MTTR (Mean Time to Recover) | 2 hours | Average recovery |

### 10.2 Backup Strategy

| Component | Backup Method | Frequency | Retention |
|-----------|---------------|-----------|-----------|
| Dataverse data | Microsoft managed | Continuous | 28 days |
| SharePoint KB | Microsoft managed | Continuous | 93 days |
| Solution package | Export to Azure Blob | Daily | 90 days |
| Configuration | Export to Git | Per change | Indefinite |
| Seed data | CSV in Git | Per change | Indefinite |

### 10.3 Recovery Procedures

**Scenario 1: Dataverse Data Loss**

1. Contact Microsoft Support (SEV-1)
2. Request point-in-time restore
3. Verify data integrity post-restore
4. Reconcile any transactions during gap
5. Document incident

**Scenario 2: Solution Corruption**

1. Export corrupted solution for analysis
2. Import last known good solution from backup
3. Verify all components functional
4. Run full test suite
5. Re-deploy any lost changes

**Scenario 3: KB Content Loss**

1. Restore from SharePoint version history
2. If history unavailable, restore from Git backup
3. Upload restored files via pac CLI
4. Verify Copilot retrieval
5. Run KB test cases

**Scenario 4: Complete Environment Loss**

1. Provision new Power Platform environment
2. Import solution package
3. Configure connections
4. Import seed data
5. Deploy Copilot agents
6. Verify functionality
7. Update DNS/routing

### 10.4 DR Testing

**Quarterly DR Test:**

| Test | Procedure | Success Criteria |
|------|-----------|------------------|
| Backup verification | Restore to test environment | Complete restore successful |
| Solution import | Import to clean environment | All components deploy |
| Data recovery | Restore from backup | Data matches source |
| Failover | Activate secondary | Users can access |

---

## Document References

| Document | Purpose |
|----------|---------|
| [01-MCMAP_Executive_Summary.md](./01-MCMAP_Executive_Summary.md) | Executive overview |
| [02-MCMAP_System_Architecture.md](./02-MCMAP_System_Architecture.md) | Technical architecture |
| [03-MCMAP_Security_Compliance.md](./03-MCMAP_Security_Compliance.md) | Security framework |
| [04-MCMAP_Agent_Capabilities.md](./04-MCMAP_Agent_Capabilities.md) | Agent reference |
| [05-MCMAP_Data_Architecture.md](./05-MCMAP_Data_Architecture.md) | Data governance |
| [06-MCMAP_AIBuilder_Integration.md](./06-MCMAP_AIBuilder_Integration.md) | AI Builder reference |
| [08-MCMAP_Quality_Assurance.md](./08-MCMAP_Quality_Assurance.md) | Testing framework |

---

**Document Control:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-23 | MCMAP Team | Initial release |

---

*MCMAP Operational Runbook - Mastercard Internal*
