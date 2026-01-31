# MCMAP ACCESS CONTROL REFERENCE

**Document:** KB-MCMAP_Access_Control_Reference.md
**Version:** 1.0
**Date:** January 24, 2026
**Classification:** Mastercard Internal - Knowledge Base
**Purpose:** Reference guide for ABAC-protected content and access request workflows

---

## OVERVIEW

This document provides agents with reference information for handling access-controlled content within MCMAP. The platform implements Attribute-Based Access Control (ABAC) integrated with the Mastercard Microsoft Directory.

---

## PROTECTED CONTENT CATALOG

### Executive Briefs (Protected)

| Document | Protection Level | Required Attributes |
|----------|------------------|---------------------|
| 00-MCMAP_CEO_Brief.md | Executive Only | employee_level IN [CEO, President, EVP, SVP] OR security_group = MCMAP-Executive-Access |
| 00-A-MCMAP_Chief_Consulting_Officer.md | Executive Only | Same as above |
| 00-B-MCMAP_Chief_Technology_Officer.md | Executive Only | Same as above |
| 00-C-MCMAP_Chief_AI_Officer.md | Executive Only | Same as above |
| 00-D-MCMAP_Chief_Revenue_Officer.md | Executive Only | Same as above |
| 09A-MCMAP_Investment_Proposal.md | Executive/Finance | employee_level IN [CEO, President, EVP, SVP] OR department IN [Finance, Strategy] |

### Public Content (No Restriction)

| Document | Access Level |
|----------|--------------|
| 00-MCMAP_Glossary.md | All authenticated users |
| 00-MCMAP_Index.md | All authenticated users |
| 01-MCMAP_Executive_Summary.md | All authenticated users* |
| 04-MCMAP_Agent_Capabilities.md | All authenticated users* |
| 07-MCMAP_Operational_Runbook.md | All authenticated users |
| 10-MCMAP_Contact_Reference.md | All authenticated users |

*When Full ABAC Mode is enabled, additional restrictions may apply.

---

## TWO-MODE OPERATION

### Launch Mode (Default)

| Setting | Value | Effect |
|---------|-------|--------|
| ABAC_ENABLED | false | Full ABAC rules dormant |
| CSUITE_PROTECTION_ENABLED | true | Executive content protected |

**Protected in Launch Mode:**
- CEO Brief and C-Suite role briefs (00-A through 00-D)
- Investment Proposal (09A)

**Not Protected in Launch Mode:**
- All other technical documentation
- Glossary and Index
- Operational documentation

### Full ABAC Mode

| Setting | Value | Effect |
|---------|-------|--------|
| ABAC_ENABLED | true | All ABAC rules active |
| CSUITE_PROTECTION_ENABLED | true | Executive content protected |

**Additional Protections When Full ABAC Enabled:**
- Department-specific content (KB-Marketing-*, KB-Consulting-*)
- Regional benchmark data (mpa_benchmark.region_*)
- Division-specific capabilities
- Financial benchmark data

---

## ACCESS DENIAL HANDLING

### Denial Message Template

When a user is denied access to protected content, use this response pattern:

```
This content requires specific access permissions based on your role in the organization.

To request access, say 'request access' and I'll help submit your request to the Platform team. They typically respond within 2 business days.

In the meantime, I can help you with:
- [Alternative content relevant to their role]
- [General platform documentation]
- [Contact information for questions]
```

### Critical Rules

| Rule | Requirement |
|------|-------------|
| Email Protection | NEVER reveal the Platform Owner email address in denial messages |
| Condition Privacy | NEVER disclose specific access conditions or rules to users |
| No Workarounds | NEVER suggest ways to bypass access controls |
| No Hints | NEVER hint at what attributes would grant access |
| Graceful Messaging | ALWAYS use friendly, helpful language in denials |

---

## ACCESS REQUEST WORKFLOW

### When User Says "Request Access"

**Step 1: Collect Information**
```
What content would you like access to?
```

**Step 2: Collect Justification**
```
Please briefly describe why you need this access (1-2 sentences).
```

**Step 3: Confirm Submission**
```
Your request has been submitted. The Platform team typically responds within 2 business days.

Request ID: [ID from flow response]

Is there anything else I can help you with in the meantime?
```

### Information Captured Automatically

The access request flow automatically captures from the user's directory profile:
- Display name and email
- Job title and employee level
- Department, team, and division
- Region and country
- Manager chain

This information is included in the request email to the Platform Owner for decision-making.

---

## AGENT INTEGRATION

### DOCS Agent Responsibilities

When DOCS agent receives a request for protected content:

1. **Check Access** - Call MCMAP_Check_Content_Access flow
2. **If Granted** - Return the requested content normally
3. **If Denied** - Display graceful denial message, offer alternatives
4. **Offer Access Request** - Always mention the access request option

### ORC Agent Responsibilities

When ORC routes to DOCS for executive content:

1. **Route Normally** - Let DOCS handle access verification
2. **Don't Pre-Check** - Access verification happens at DOCS level
3. **Handle Returns** - When user returns from DOCS, continue session normally

---

## USER PROFILE ATTRIBUTES

### Attributes Available for Access Rules

| Attribute | Source | Example Values |
|-----------|--------|----------------|
| employee_level | Microsoft Directory | CEO, EVP, SVP, VP, Director, Manager, Analyst |
| department | Microsoft Directory | Marketing Services, Finance, Engineering |
| team | Extension attribute | Consulting Team A, Analytics Team |
| division | Microsoft Directory | Data & Services, Network Services |
| region | Usage location | North America, Europe, APMEA |
| country | Microsoft Directory | United States, United Kingdom |
| security_groups | Azure AD | MCMAP-Executive-Access, MCMAP-Leadership-Access |
| manager_chain | Microsoft Graph | Array of manager IDs up to CEO |

---

## CONDITION OPERATORS

### Supported Operators for Access Rules

| Operator | Description | Example |
|----------|-------------|---------|
| EQUALS | Exact match | department EQUALS "Finance" |
| NOT_EQUALS | Not equal | region NOT_EQUALS "APAC" |
| IN | Value in list | employee_level IN ["EVP", "SVP", "VP"] |
| NOT_IN | Value not in list | division NOT_IN ["Corporate"] |
| CONTAINS | String contains | job_title CONTAINS "Director" |
| STARTS_WITH | String starts with | department STARTS_WITH "Marketing" |
| MEMBER_OF | Security group membership | security_group MEMBER_OF "MCMAP-*" |
| MANAGER_CHAIN | User in manager hierarchy | manager_chain CONTAINS "user-guid" |

---

## QUICK REFERENCE

### Check If Content Is Protected

1. Is it a CEO Brief or C-Suite brief (00-A through 00-D)? -> **Protected**
2. Is it the Investment Proposal (09A)? -> **Protected**
3. Is Full ABAC Mode enabled? -> Check mcmap_access_rules.yaml for additional rules
4. Otherwise -> **Not Protected**

### Handle Access Denial

1. Display graceful message (never mention specific rules)
2. Offer alternative content
3. Offer access request option
4. Never reveal email addresses

### Process Access Request

1. Ask what content they want
2. Ask for brief justification
3. Submit via MCMAP_Access_Request flow
4. Confirm with request ID
5. Mention 2-day response SLA

---

## RELATED DOCUMENTATION

| Document | Content |
|----------|---------|
| MCMAP_ABAC_Implementation.md | Full technical implementation guide |
| 03-MCMAP_Security_Compliance.md | Section 12: ABAC system overview |
| 05-MCMAP_Data_Architecture.md | Section 3.2: EAP Security tables |
| mcmap_access_rules.yaml | Master access rule configuration |

---

**Document Version:** 1.0
**Classification:** Mastercard Internal - Knowledge Base
**Last Updated:** January 24, 2026
