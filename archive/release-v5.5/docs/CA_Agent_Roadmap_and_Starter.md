# CONSULTING AGENT (CA) ROADMAP AND DEVELOPMENT PLAN

## Executive Summary

The Consulting Agent (CA) extends the Kessel Digital Agent Platform beyond media planning into general strategic consulting capabilities. CA leverages the shared Enterprise AI Platform (EAP) infrastructure established for MPA while maintaining its own specialized knowledge base, workflows, and document generation capabilities.

**Target Timeline:**
- MPA v5.5 Production: January 2026 (current)
- CA Development Start: February 2026
- CA v1.0 Production: March 2026

**Key Dependencies:**
- MPA v5.5 successfully deployed (validates EAP infrastructure)
- EAP platform tables operational
- Shared authentication and session management proven

---

## PART 1: STRATEGIC VISION

### 1.1 Purpose and Positioning

The Consulting Agent serves as an AI-powered strategic consulting assistant that helps users with:

- Strategic analysis and recommendations
- Proposal and pitch deck development
- Competitive landscape assessment
- Business case development
- Client presentation preparation
- Research synthesis and insights

### 1.2 Differentiation from MPA

| Dimension | Media Planning Agent (MPA) | Consulting Agent (CA) |
|-----------|---------------------------|----------------------|
| Primary Domain | Media planning and advertising | Strategic consulting |
| User Persona | Media planners, marketing managers | Consultants, strategists |
| Input Types | Budgets, audience data, campaign briefs | Business problems, client contexts |
| Output Types | Media plans, channel allocations | Proposals, analyses, recommendations |
| Data Sources | Benchmarks, industry metrics | Frameworks, case studies, methodologies |
| Time Horizon | Campaign-based (weeks to quarters) | Project-based (months to years) |
| Success Metrics | Media efficiency, reach, ROAS | Strategic clarity, client satisfaction |

### 1.3 Shared vs Unique Components

**Shared Components (EAP Platform):**
- eap_sessions - Session management
- eap_users - User profiles and preferences
- eap_feature_flags - Feature configuration
- eap_agents - Agent registry
- eap_audit - Audit logging
- Authentication flows
- Session creation/management flows
- Audit logging flows
- Document generation infrastructure

**Unique to CA:**
- ca_projects - Consulting project tracking
- ca_clients - Client information
- ca_frameworks - Strategic frameworks library
- ca_deliverables - Output document tracking
- CA-specific knowledge base files
- CA-specific Power Automate flows
- CA-specific document templates
- CA Copilot instructions

---

## PART 2: KNOWLEDGE BASE DESIGN

### 2.1 Proposed KB Files

CA requires approximately 15-20 knowledge base files organized by consulting domain:

**Core Methodology Files:**

| File | Description | Priority |
|------|-------------|----------|
| CA_CORE_METHODOLOGY_v1_0.txt | Overall consulting approach and interaction patterns | Critical |
| CA_ENGAGEMENT_FRAMEWORK_v1_0.txt | Client engagement models and phases | Critical |
| CA_QUALITY_GATES_v1_0.txt | Deliverable quality checkpoints | Critical |

**Strategic Frameworks:**

| File | Description | Priority |
|------|-------------|----------|
| CA_STRATEGY_FRAMEWORKS_v1_0.txt | Porter's Five Forces, SWOT, Blue Ocean, etc. | High |
| CA_BUSINESS_MODEL_CANVAS_v1_0.txt | Business model analysis tools | High |
| CA_COMPETITIVE_ANALYSIS_v1_0.txt | Competitive intelligence frameworks | High |
| CA_MARKET_SIZING_v1_0.txt | TAM/SAM/SOM and sizing methodologies | High |

**Domain Expertise:**

| File | Description | Priority |
|------|-------------|----------|
| CA_DIGITAL_TRANSFORMATION_v1_0.txt | Digital strategy guidance | Medium |
| CA_OPERATING_MODEL_v1_0.txt | Organizational design frameworks | Medium |
| CA_CHANGE_MANAGEMENT_v1_0.txt | Change and transformation approaches | Medium |
| CA_DATA_STRATEGY_v1_0.txt | Data and analytics strategy guidance | Medium |

**Deliverable Templates:**

| File | Description | Priority |
|------|-------------|----------|
| CA_PROPOSAL_TEMPLATES_v1_0.txt | Proposal structure and content guides | Critical |
| CA_PRESENTATION_FRAMEWORKS_v1_0.txt | Slide deck structures and storytelling | High |
| CA_EXECUTIVE_SUMMARIES_v1_0.txt | Executive communication patterns | High |
| CA_CASE_STUDY_FORMAT_v1_0.txt | Case study documentation standards | Medium |

**Industry Verticals:**

| File | Description | Priority |
|------|-------------|----------|
| CA_INDUSTRY_FINANCIAL_SERVICES_v1_0.txt | Financial services consulting context | Medium |
| CA_INDUSTRY_HEALTHCARE_v1_0.txt | Healthcare consulting context | Medium |
| CA_INDUSTRY_TECHNOLOGY_v1_0.txt | Technology sector consulting context | Medium |
| CA_INDUSTRY_RETAIL_v1_0.txt | Retail and consumer consulting context | Medium |

### 2.2 KB File Structure

Each CA knowledge base file follows the 6-Rule Compliance Framework:

```
================================================================================
[FILE TITLE IN ALL CAPS]
================================================================================

PURPOSE
- Clear statement of file purpose
- When CA should reference this content
- Relationship to other KB files

CORE CONTENT
- Organized with ALL-CAPS section headers
- Simple lists with hyphens only
- ASCII characters only
- No visual dependencies
- Mandatory language where appropriate
- Professional tone with decision logic

AGENT GUIDANCE
- When to apply this content
- How to adapt for user context
- Integration with workflows

CROSS-REFERENCES
- Related KB files
- Related flows
- Related templates

================================================================================
END OF FILE
================================================================================
```

---

## PART 3: DATAVERSE SCHEMA

### 3.1 CA-Specific Tables

**ca_projects**
```json
{
  "tableName": "ca_projects",
  "displayName": "CA Projects",
  "description": "Consulting projects and engagements",
  "columns": [
    {"name": "project_id", "type": "string", "required": true, "description": "Unique project identifier"},
    {"name": "project_name", "type": "string", "required": true, "description": "Project display name"},
    {"name": "client_id", "type": "lookup", "target": "ca_clients", "description": "Associated client"},
    {"name": "project_type", "type": "choice", "options": ["STRATEGY", "TRANSFORMATION", "OPERATIONS", "TECHNOLOGY", "MARKET_ENTRY", "DUE_DILIGENCE", "OTHER"], "description": "Project classification"},
    {"name": "status", "type": "choice", "options": ["PROSPECT", "PROPOSAL", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"], "description": "Project status"},
    {"name": "start_date", "type": "datetime", "description": "Project start date"},
    {"name": "end_date", "type": "datetime", "description": "Project end date"},
    {"name": "budget", "type": "currency", "description": "Project budget"},
    {"name": "description", "type": "text", "description": "Project description and scope"},
    {"name": "session_id", "type": "lookup", "target": "eap_sessions", "description": "Associated conversation session"},
    {"name": "created_by", "type": "lookup", "target": "eap_users", "description": "User who created project"},
    {"name": "created_at", "type": "datetime", "description": "Creation timestamp"},
    {"name": "modified_at", "type": "datetime", "description": "Last modification timestamp"}
  ]
}
```

**ca_clients**
```json
{
  "tableName": "ca_clients",
  "displayName": "CA Clients",
  "description": "Client organizations for consulting engagements",
  "columns": [
    {"name": "client_id", "type": "string", "required": true, "description": "Unique client identifier"},
    {"name": "client_name", "type": "string", "required": true, "description": "Client organization name"},
    {"name": "industry", "type": "choice", "options": ["FINANCIAL_SERVICES", "HEALTHCARE", "TECHNOLOGY", "RETAIL", "MANUFACTURING", "ENERGY", "TELECOMMUNICATIONS", "MEDIA", "OTHER"], "description": "Client industry vertical"},
    {"name": "company_size", "type": "choice", "options": ["STARTUP", "SMB", "MID_MARKET", "ENTERPRISE", "FORTUNE_500"], "description": "Company size classification"},
    {"name": "headquarters", "type": "string", "description": "Headquarters location"},
    {"name": "website", "type": "string", "description": "Client website URL"},
    {"name": "primary_contact", "type": "string", "description": "Primary contact name"},
    {"name": "contact_email", "type": "string", "description": "Primary contact email"},
    {"name": "notes", "type": "text", "description": "Additional client notes"},
    {"name": "created_at", "type": "datetime", "description": "Creation timestamp"},
    {"name": "modified_at", "type": "datetime", "description": "Last modification timestamp"}
  ]
}
```

**ca_frameworks**
```json
{
  "tableName": "ca_frameworks",
  "displayName": "CA Frameworks",
  "description": "Strategic frameworks library",
  "columns": [
    {"name": "framework_id", "type": "string", "required": true, "description": "Unique framework identifier"},
    {"name": "framework_name", "type": "string", "required": true, "description": "Framework display name"},
    {"name": "category", "type": "choice", "options": ["STRATEGY", "ANALYSIS", "OPERATIONS", "ORGANIZATION", "FINANCIAL", "MARKETING", "TECHNOLOGY"], "description": "Framework category"},
    {"name": "description", "type": "text", "description": "Framework description and usage"},
    {"name": "when_to_use", "type": "text", "description": "Situations where framework applies"},
    {"name": "key_components", "type": "text", "description": "Main components or elements"},
    {"name": "example_output", "type": "text", "description": "Example of framework application"},
    {"name": "source", "type": "string", "description": "Framework origin/attribution"},
    {"name": "created_at", "type": "datetime", "description": "Creation timestamp"}
  ]
}
```

**ca_deliverables**
```json
{
  "tableName": "ca_deliverables",
  "displayName": "CA Deliverables",
  "description": "Consulting deliverables and outputs",
  "columns": [
    {"name": "deliverable_id", "type": "string", "required": true, "description": "Unique deliverable identifier"},
    {"name": "project_id", "type": "lookup", "target": "ca_projects", "description": "Associated project"},
    {"name": "deliverable_type", "type": "choice", "options": ["PROPOSAL", "PRESENTATION", "REPORT", "ANALYSIS", "EXECUTIVE_SUMMARY", "WORKSHOP_MATERIALS", "IMPLEMENTATION_PLAN", "OTHER"], "description": "Deliverable type"},
    {"name": "title", "type": "string", "required": true, "description": "Deliverable title"},
    {"name": "status", "type": "choice", "options": ["DRAFT", "IN_REVIEW", "FINAL", "DELIVERED"], "description": "Deliverable status"},
    {"name": "content_summary", "type": "text", "description": "Summary of deliverable content"},
    {"name": "file_url", "type": "string", "description": "URL to generated document"},
    {"name": "created_by", "type": "lookup", "target": "eap_users", "description": "User who created deliverable"},
    {"name": "created_at", "type": "datetime", "description": "Creation timestamp"},
    {"name": "delivered_at", "type": "datetime", "description": "Delivery timestamp"}
  ]
}
```

---

## PART 4: POWER AUTOMATE FLOWS

### 4.1 CA-Specific Flows

| Flow Name | Trigger | Purpose |
|-----------|---------|---------|
| CA - Create Project | Agent action | Create new consulting project record |
| CA - Update Project | Agent action | Update project status and details |
| CA - Get Project | Agent action | Retrieve project information |
| CA - Create Client | Agent action | Create new client record |
| CA - Search Frameworks | Agent action | Search frameworks library |
| CA - Generate Proposal | Agent action | Create proposal document |
| CA - Generate Presentation | Agent action | Create presentation slides |
| CA - Create Deliverable | Agent action | Track new deliverable |
| CA - Update Deliverable | Agent action | Update deliverable status |

### 4.2 Shared Flows (from EAP)

| Flow Name | Purpose |
|-----------|---------|
| EAP - Create Session | Initialize conversation session |
| EAP - Update Session | Update session state |
| EAP - Get Session | Retrieve session data |
| EAP - Log Audit Event | Record audit trail |
| EAP - Get Feature Flags | Check feature configuration |
| EAP - Get User | Retrieve user information |

---

## PART 5: DEVELOPMENT PHASES

### Phase 1: Foundation (Week 1-2)

**Objectives:**
- Set up CA directory structure in repository
- Create initial KB file templates
- Define Dataverse table schemas
- Draft Copilot instructions outline

**Deliverables:**
- [ ] /agents/ca/base/kb/ directory created
- [ ] /agents/ca/base/flows/ directory created
- [ ] /agents/ca/base/copilot/ directory created
- [ ] Table schema JSON files created
- [ ] Initial 5 KB files drafted (Core Methodology, Engagement Framework, Quality Gates, Strategy Frameworks, Proposal Templates)

**Validation:**
- Directory structure matches MPA pattern
- Schema files pass JSON validation
- KB files pass 6-Rule Compliance

### Phase 2: Knowledge Base (Week 2-3)

**Objectives:**
- Complete all core KB files
- Implement strategic frameworks content
- Create industry vertical content
- Develop deliverable templates

**Deliverables:**
- [ ] All 15-20 KB files completed
- [ ] KB files validated for compliance
- [ ] Cross-references verified
- [ ] Content reviewed for accuracy

**Validation:**
- All files pass 6-Rule Compliance
- Total word count appropriate for SharePoint limits
- Cross-references resolve correctly

### Phase 3: Flows and Functions (Week 3-4)

**Objectives:**
- Create CA-specific Power Automate flows
- Develop Azure Functions if needed
- Integrate with EAP shared flows
- Test flow execution

**Deliverables:**
- [ ] 9 CA flows created and tested
- [ ] Flow definitions documented
- [ ] Azure Functions deployed (if applicable)
- [ ] Integration with EAP flows verified

**Validation:**
- All flows execute without errors
- Data correctly written to Dataverse
- Error handling works correctly

### Phase 4: Agent Configuration (Week 4)

**Objectives:**
- Create CA Copilot instructions
- Configure SharePoint KB connection
- Connect all flows as actions
- Initial agent testing

**Deliverables:**
- [ ] Copilot instructions finalized (under 8,000 chars)
- [ ] Agent created in Copilot Studio
- [ ] KB connected and indexed
- [ ] All actions connected

**Validation:**
- Agent responds correctly to test prompts
- KB content accessible in responses
- Flows trigger correctly

### Phase 5: Testing and Refinement (Week 5)

**Objectives:**
- Execute full test suite
- Gather user feedback
- Refine KB content and instructions
- Fix identified issues

**Deliverables:**
- [ ] Test suite executed (all tests pass)
- [ ] User feedback documented
- [ ] Issues resolved
- [ ] Documentation updated

**Validation:**
- All critical tests pass
- User feedback addressed
- Ready for production deployment

### Phase 6: Production Deployment (Week 6)

**Objectives:**
- Deploy to production environment
- Migrate all components
- Enable for target users
- Monitor initial usage

**Deliverables:**
- [ ] Production deployment complete
- [ ] User access configured
- [ ] Monitoring dashboards active
- [ ] Support documentation ready

**Validation:**
- Production agent functional
- Users can access and interact
- No critical issues in first 48 hours

---

## PART 6: RESOURCE REQUIREMENTS

### 6.1 Development Effort

| Phase | Effort (Hours) | Primary Resource |
|-------|---------------|------------------|
| Foundation | 16 | Developer |
| Knowledge Base | 40 | Content + Developer |
| Flows and Functions | 24 | Developer |
| Agent Configuration | 8 | Developer |
| Testing and Refinement | 16 | QA + Developer |
| Production Deployment | 8 | Developer + Ops |
| **Total** | **112 hours** | |

### 6.2 Infrastructure

- Existing EAP infrastructure (no additional cost)
- 4 additional Dataverse tables
- 9 additional Power Automate flows
- 15-20 additional SharePoint KB files
- Copilot Studio agent (included in existing license)

---

## PART 7: RISK ASSESSMENT

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| EAP platform issues delay CA | Medium | High | Complete MPA deployment validation first |
| KB content quality insufficient | Medium | Medium | Involve domain experts in content review |
| Flow complexity exceeds estimates | Low | Medium | Leverage MPA patterns as templates |
| User adoption slower than expected | Medium | Low | Develop comprehensive training materials |
| Scope creep during development | Medium | Medium | Strict change control process |

---

## PART 8: VS CODE STARTER PROMPT

Use this prompt to begin CA development when ready:

```
================================================================================
VS CODE CLAUDE: CONSULTING AGENT (CA) V1.0 DEVELOPMENT
================================================================================

CRITICAL INSTRUCTIONS:
- DO NOT use memories or prior context
- Start fresh with this prompt only
- Create all files COMPLETELY - no stubs or placeholders

================================================================================
MISSION
================================================================================

Create the Consulting Agent (CA) v1.0 following the pattern established by MPA v5.5.
CA shares EAP platform infrastructure but has its own KB, flows, and capabilities.

================================================================================
REPOSITORY CONTEXT
================================================================================

Repository: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
Branch: deploy/personal (development) -> main (production)

Reference implementation: /release/v5.5/agents/mpa/

CA location: /release/v5.5/agents/ca/
(Create this directory structure if it doesn't exist)

================================================================================
PHASE 1 TASKS: FOUNDATION
================================================================================

1. Create directory structure:
   /release/v5.5/agents/ca/
   ├── base/
   │   ├── kb/
   │   ├── flows/
   │   ├── copilot/
   │   └── schema/
   └── extensions/

2. Create table schema files in /base/schema/:
   - ca_projects.json
   - ca_clients.json
   - ca_frameworks.json
   - ca_deliverables.json

3. Create initial KB files in /base/kb/:
   - CA_CORE_METHODOLOGY_v1_0.txt
   - CA_ENGAGEMENT_FRAMEWORK_v1_0.txt
   - CA_QUALITY_GATES_v1_0.txt
   - CA_STRATEGY_FRAMEWORKS_v1_0.txt
   - CA_PROPOSAL_TEMPLATES_v1_0.txt

4. Create Copilot instructions draft in /base/copilot/:
   - CA_Copilot_Instructions_v1_0.txt (outline only for Phase 1)

================================================================================
KB FILE REQUIREMENTS
================================================================================

All KB files MUST follow 6-Rule Compliance Framework:
1. ALL-CAPS headers with === separators
2. Simple lists with hyphens only (no bullets, no numbers)
3. ASCII characters only (no smart quotes, no special characters)
4. Zero visual dependencies (no tables, no formatting)
5. Mandatory language where appropriate (MUST, SHALL, REQUIRED)
6. Professional tone with agent-ready decision logic

================================================================================
SCHEMA FILE REQUIREMENTS
================================================================================

Schema files follow EAP pattern. Reference:
/release/v5.5/platform/eap-core/base/schema/tables/eap_sessions.json

================================================================================
EXECUTION
================================================================================

1. Read the MPA reference implementation to understand patterns
2. Create directory structure
3. Create all schema files
4. Create all Phase 1 KB files
5. Commit to git with message: "CA v1.0: Phase 1 Foundation - directory structure and initial files"
6. Push to deploy/personal

================================================================================
VALIDATION
================================================================================

Before committing, verify:
- [ ] All directories created
- [ ] All schema files valid JSON
- [ ] All KB files pass 6-Rule Compliance
- [ ] No placeholder content - everything is complete
- [ ] File naming follows conventions (*_v1_0.txt, *.json)

================================================================================
END OF PROMPT
================================================================================
```

---

## PART 9: SUCCESS CRITERIA

### 9.1 Technical Success

- [ ] All 4 Dataverse tables created and functional
- [ ] All 9 Power Automate flows operational
- [ ] All 15-20 KB files indexed in SharePoint
- [ ] Copilot agent published and accessible
- [ ] All test cases passing

### 9.2 Business Success

- [ ] Users can create consulting projects through conversation
- [ ] Strategic frameworks accessible and useful
- [ ] Proposal generation produces quality output
- [ ] Session continuity maintained across conversations
- [ ] Audit trail complete and compliant

### 9.3 Operational Success

- [ ] Monitoring dashboards functional
- [ ] Error rates below 1%
- [ ] Response times under 10 seconds
- [ ] Support documentation complete
- [ ] Training materials available

---

## APPENDIX A: SAMPLE CA CONVERSATION

```
User: I need to help a client develop their digital transformation strategy. They're a mid-size manufacturing company.

CA: I'd be glad to help you develop a digital transformation strategy for your manufacturing client. Let me gather some context to ensure we create a relevant and actionable approach.

A few questions to start:
- What's driving the transformation initiative? (cost reduction, competitive pressure, customer demands, etc.)
- Where is the company in their digital maturity journey currently?
- What's the approximate timeline and budget envelope for this engagement?
- Are there specific areas they've identified as priorities (operations, customer experience, supply chain, etc.)?

User: They're being pressured by competitors who have modernized their operations. Currently very manual processes. Timeline is 6 months for strategy, budget around $500K for the strategy phase. They're most concerned about operations and supply chain.

CA: Thank you for that context. Given the competitive pressure and focus on operations and supply chain, I recommend structuring this engagement around three workstreams:

**Workstream 1: Current State Assessment (Weeks 1-4)**
- Process mapping of core operations and supply chain
- Technology landscape inventory
- Capability gap analysis using our Digital Maturity Framework
- Competitive benchmarking

**Workstream 2: Future State Vision (Weeks 5-8)**
- Industry 4.0 opportunity identification
- Prioritized use case development
- Technology architecture recommendations
- Change readiness assessment

**Workstream 3: Transformation Roadmap (Weeks 9-12)**
- Initiative prioritization using value/complexity matrix
- Investment requirements and business case
- Implementation phasing
- Governance and organization design

Would you like me to generate a proposal document with this structure, or should we refine the approach first?
```

---

## APPENDIX B: RELATED DOCUMENTS

- MPA_PowerAutomate_Complete_Specification_v7.md - Reference for flow patterns
- PLATFORM_ARCHITECTURE.md - EAP platform architecture
- MPA_Copilot_Instructions_v5_5.txt - Reference for instruction patterns
- 6-Rule Compliance Framework documentation

---

## REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-06 | MPA Deployment | Initial roadmap creation |
