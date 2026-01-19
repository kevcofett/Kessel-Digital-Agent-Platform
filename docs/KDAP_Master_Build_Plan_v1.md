# KESSEL DIGITAL AGENT PLATFORM - MASTER BUILD PLAN v1.0

**Date:** January 18, 2026  
**Status:** APPROVED - Ready for Execution  
**Scope:** Complete 10-Agent Platform with MPA + CA Integration

---

## EXECUTIVE SUMMARY

This plan integrates consulting capabilities into the existing MPA v6 architecture using a **distributed approach** - extending existing agents where appropriate and creating only the new agents absolutely required.

### Key Decisions
1. **Reuse over rebuild** - Leverage 143 existing MPA KB files and 35 existing CA KB files
2. **Extend, don't duplicate** - Financial analysis goes to ANL, document generation goes to DOC
3. **New agents only for unique domains** - CST (Consulting Strategy) and CHG (Change Management)
4. **Archive deprecated agents** - NDS, CSO, UDM move to archive (content already merged)

### Effort Summary
| Category | Count | Effort |
|----------|-------|--------|
| New KB files to CREATE | 17 | High |
| Existing files to UPDATE | 2 | Low |
| Files to ARCHIVE (no work) | 41 | Trivial |
| Files to COPY/MIGRATE | 14 | Low |
| Dataverse tables to CREATE | 3 | Medium |

---

## PART 1: CURRENT STATE INVENTORY

### 1.1 MPA Platform Repository (143 files)

| Agent | Instructions | KB Files | Status | Action |
|-------|--------------|----------|--------|--------|
| ORC | 1 | 4 | ✓ Active | UPDATE routing |
| ANL | 1 | 16 | ✓ Active | ADD 1 KB file |
| AUD | 1 | 21 | ✓ Active | No change |
| CHA | 1 | 10 | ✓ Active | No change |
| SPO | 1 | 15 | ✓ Active | No change |
| DOC | 1 | 5 | ✓ Active | ADD 1 KB file |
| PRF | 1 | 24 | ✓ Active | No change |
| NDS | 0 | 29 | ⚠ Deprecated | ARCHIVE |
| CSO | 0 | 4 | ⚠ Deprecated | ARCHIVE |
| UDM | 0 | 8 | ⚠ Deprecated | ARCHIVE |

### 1.2 Consulting Agent Repository (35 files)

| Category | Files | Disposition |
|----------|-------|-------------|
| FRAMEWORK_*.txt | 5 | → CST KB + Dataverse seed |
| REFERENCE_*.txt | 14 | → Shared reference library |
| REGISTRY_*.txt | 5 | → Dataverse seed data |
| BEHAVIORAL_*.txt | 2 | → CST_KB_Consulting_Core |
| CA_CONFIDENCE/DATA_SOURCE | 2 | → EAP shared KB |
| Other operational | 7 | → CST/CHG consolidation |

### 1.3 What Does NOT Exist Yet

| Component | Files Needed | Priority |
|-----------|--------------|----------|
| EAP Shared KB | 6 | HIGH |
| CST Agent | 5 | HIGH |
| CHG Agent | 4 | HIGH |
| ANL Financial Extension | 1 | HIGH |
| DOC Consulting Extension | 1 | HIGH |
| ca_framework Dataverse table | 1 schema + seed | MEDIUM |
| ca_project Dataverse table | 1 schema | MEDIUM |
| ca_deliverable Dataverse table | 1 schema | MEDIUM |

---

## PART 2: TARGET ARCHITECTURE

### 2.1 Final Agent Roster (9 Active + 1 Archived)

```
KESSEL DIGITAL AGENT PLATFORM v6.0
├── ORC (Orchestrator) ─────────── Routes all queries
│
├── MPA DOMAIN
│   ├── ANL (Analytics) ────────── Projections, modeling, financial calcs [EXTENDED]
│   ├── AUD (Audience) ─────────── Segmentation, targeting, journeys
│   ├── CHA (Channel) ──────────── Media mix, allocation
│   ├── SPO (Supply Path) ──────── Programmatic optimization
│   ├── DOC (Document) ─────────── Generation, export, templates [EXTENDED]
│   └── PRF (Performance) ──────── Attribution, monitoring
│
├── CA DOMAIN
│   ├── CST (Consulting Strategy) ─ Frameworks, methodology [NEW]
│   └── CHG (Change Management) ─── Organizational change [NEW]
│
└── SHARED
    └── EAP (Platform Layer) ────── Shared KB, infrastructure [NEW]

ARCHIVED: NDS, CSO, UDM (content merged into active agents)
```

### 2.2 Capability Distribution

| Capability | Owner | Notes |
|------------|-------|-------|
| **Financial Calculations** | ANL | NPV, IRR, TCO, Monte Carlo, Sensitivity |
| **Framework Selection** | CST | 32+ frameworks, selection logic |
| **Prioritization** | CST | RICE, weighted matrix, MoSCoW |
| **Strategic Analysis** | CST | SWOT, Porter's, scenario planning |
| **Change Methodology** | CHG | Kotter, ADKAR, stakeholder analysis |
| **Adoption Planning** | CHG | Rollout, training, sustainment |
| **Business Case Docs** | DOC | Templates, generation |
| **Roadmap Docs** | DOC | Templates, generation |

---

## PART 3: NEW CONTENT REQUIREMENTS

### 3.1 EAP Shared KB (6 files) - CREATE NEW

| File | Size | Source Content |
|------|------|----------------|
| EAP_KB_Data_Provenance_v1.txt | ~15K | CA_DATA_SOURCE_HIERARCHY + SOURCE_QUALITY_TIERS |
| EAP_KB_Confidence_Levels_v1.txt | ~12K | CA_CONFIDENCE_LEVELS |
| EAP_KB_Error_Handling_v1.txt | ~10K | New |
| EAP_KB_Formatting_Standards_v1.txt | ~8K | 6-Rule Framework documentation |
| EAP_KB_Strategic_Principles_v1.txt | ~12K | New |
| EAP_KB_Communication_Contract_v1.txt | ~10K | New |

### 3.2 CST Agent (5 files) - CREATE NEW

| File | Size | Source Content |
|------|------|----------------|
| CST_Copilot_Instructions_v1.txt | 8K max | New |
| CST_KB_Consulting_Core_v1.txt | ~25K | BEHAVIORAL_* + CUSTOM_FRAMEWORK_GUIDE |
| CST_KB_Strategic_Frameworks_v1.txt | ~22K | FRAMEWORK_Consulting_Tools + Enterprise_Tools |
| CST_KB_Prioritization_Methods_v1.txt | ~18K | New (RICE, weighted matrix) |
| CST_KB_Industry_Context_v1.txt | ~15K | INDUSTRY_Expertise_Guide |

### 3.3 CHG Agent (4 files) - CREATE NEW

| File | Size | Source Content |
|------|------|----------------|
| CHG_Copilot_Instructions_v1.txt | 8K max | New |
| CHG_KB_Change_Core_v1.txt | ~22K | New (Kotter, ADKAR, Lewin) |
| CHG_KB_Stakeholder_Methods_v1.txt | ~18K | New |
| CHG_KB_Adoption_Planning_v1.txt | ~15K | New |

### 3.4 Agent Extensions (2 files) - CREATE NEW

| File | Size | Source Content |
|------|------|----------------|
| ANL_KB_Financial_Investment_v1.txt | ~22K | FRAMEWORK_Advanced_Analytics + new |
| DOC_KB_Consulting_Templates_v1.txt | ~18K | New |

### 3.5 Updates to Existing (2 files) - MODIFY

| File | Changes |
|------|---------|
| ORC_Copilot_Instructions_v1.txt | Add CST/CHG routing rules |
| ORC_KB_Routing_Logic_v1.txt | Add CA intent patterns |

---

## PART 4: REPOSITORY STRUCTURE CHANGES

### 4.1 New Directories to Create

```
base/
├── agents/
│   ├── cst/                    # NEW
│   │   ├── instructions/
│   │   └── kb/
│   └── chg/                    # NEW
│       ├── instructions/
│       └── kb/
├── platform/
│   └── eap/
│       └── kb/                 # NEW (exists but empty)
└── shared/
    └── reference/              # NEW - for CA reference files

archive/                        # NEW
├── nds/
├── cso/
└── udm/
```

### 4.2 File Migration Map

```
FROM: release/v6.0/agents/nds/*
TO:   archive/nds/

FROM: release/v6.0/agents/cso/*
TO:   archive/cso/

FROM: release/v6.0/agents/udm/*
TO:   archive/udm/

FROM: /Consulting_Agent/kb/REFERENCE_*.txt
TO:   base/shared/reference/
```

---

## PART 5: DATAVERSE ADDITIONS

### 5.1 ca_framework Table (Reference Data)

```json
{
  "table_name": "ca_framework",
  "columns": [
    {"name": "framework_code", "type": "Text(20)", "unique": true},
    {"name": "framework_name", "type": "Text(100)"},
    {"name": "category", "type": "Choice", "options": ["Domain", "Strategic", "Competitive", "Operational", "Customer", "Financial", "Change", "Planning", "Problem"]},
    {"name": "complexity", "type": "Choice", "options": ["Standard", "Advanced", "Expert"]},
    {"name": "description", "type": "Text(500)"},
    {"name": "when_to_use", "type": "Text(1000)"},
    {"name": "is_active", "type": "Boolean", "default": true}
  ]
}
```

**Seed Data:** 32 frameworks from FRAMEWORK_Library_Master_v1.txt

### 5.2 ca_project Table

```json
{
  "table_name": "ca_project",
  "columns": [
    {"name": "project_name", "type": "Text(200)"},
    {"name": "client_name", "type": "Text(200)"},
    {"name": "engagement_type", "type": "Choice", "options": ["Assessment", "Strategy", "Transformation", "Due Diligence"]},
    {"name": "status", "type": "Choice", "options": ["Discovery", "Analysis", "Recommendations", "Roadmap", "Complete"]},
    {"name": "session_id", "type": "Lookup(eap_session)"}
  ]
}
```

### 5.3 ca_deliverable Table

```json
{
  "table_name": "ca_deliverable",
  "columns": [
    {"name": "project_id", "type": "Lookup(ca_project)"},
    {"name": "deliverable_type", "type": "Choice", "options": ["Analysis", "Business Case", "Roadmap", "Presentation", "Report"]},
    {"name": "framework_used", "type": "Text(100)"},
    {"name": "status", "type": "Choice", "options": ["Draft", "Review", "Final"]}
  ]
}
```

---

## PART 6: SEQUENTIAL WORKPLAN

### Overview by Phase

| Phase | Days | Focus | VS Code | Desktop |
|-------|------|-------|---------|---------|
| 1 | 1 | Foundation & Archive | 100% | 0% |
| 2 | 2 | EAP Shared KB | 10% | 90% |
| 3 | 1 | ANL & DOC Extensions | 10% | 90% |
| 4 | 2 | CST Agent | 10% | 90% |
| 5 | 2 | CHG Agent | 10% | 90% |
| 6 | 1 | ORC Updates | 20% | 80% |
| 7 | 1 | Dataverse Schema | 100% | 0% |
| 8 | 1 | Testing & Validation | 100% | 0% |
| **Total** | **11** | | | |

---

## PART 7: DETAILED TASK LIST WITH PROMPTS

---

### PHASE 1: FOUNDATION & ARCHIVE (Day 1)

**Owner: VS Code Claude**

#### Task 1.1: Create Directory Structure and Archive Deprecated Agents

```
PROMPT FOR VS CODE CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Foundation Setup - Create directories and archive deprecated agents

REPOSITORY: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
BRANCH: feature/v6.0-kb-expansion

EXECUTE IN ORDER:

# 1. Create archive directory structure
mkdir -p archive/nds archive/cso archive/udm

# 2. Move deprecated agents to archive (preserve content for reference)
mv release/v6.0/agents/nds/* archive/nds/
mv release/v6.0/agents/cso/* archive/cso/
mv release/v6.0/agents/udm/* archive/udm/

# 3. Remove empty agent directories
rmdir release/v6.0/agents/nds release/v6.0/agents/cso release/v6.0/agents/udm

# 4. Create new agent directories
mkdir -p base/agents/cst/instructions base/agents/cst/kb
mkdir -p base/agents/chg/instructions base/agents/chg/kb

# 5. Create EAP KB directory (may already exist but ensure it does)
mkdir -p base/platform/eap/kb

# 6. Create shared reference directory
mkdir -p base/shared/reference

# 7. Copy CA reference files to shared location
cp /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/REFERENCE_*.txt base/shared/reference/

# 8. Verify structure
echo "=== Archive ===" && ls archive/
echo "=== New Agents ===" && ls -la base/agents/
echo "=== EAP ===" && ls -la base/platform/eap/
echo "=== Shared ===" && ls base/shared/reference/

# 9. Commit
git add -A
git status
git commit -m "chore: Archive deprecated agents (NDS/CSO/UDM), create CST/CHG/EAP structure"
git push origin feature/v6.0-kb-expansion

VALIDATION CHECKLIST:
- [ ] archive/nds/ contains 29 KB files
- [ ] archive/cso/ contains 4 KB files  
- [ ] archive/udm/ contains 8 KB files
- [ ] base/agents/cst/ exists with instructions/ and kb/ subdirs
- [ ] base/agents/chg/ exists with instructions/ and kb/ subdirs
- [ ] base/platform/eap/kb/ exists
- [ ] base/shared/reference/ contains 14 REFERENCE_*.txt files
═══════════════════════════════════════════════════════════════
```

---

### PHASE 2: EAP SHARED KB (Days 2-3)

**Owner: Desktop Claude (6 files)**

#### Task 2.1: Create EAP_KB_Data_Provenance_v1.txt

```
PROMPT FOR DESKTOP CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Create EAP_KB_Data_Provenance_v1.txt

OUTPUT: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/platform/eap/kb/EAP_KB_Data_Provenance_v1.txt

SOURCE CONTENT TO INCORPORATE:
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/CA_DATA_SOURCE_HIERARCHY_v1.txt
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/SOURCE_QUALITY_TIERS_v1.txt
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/RESEARCH_QUALITY_INDICATORS_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only, no emojis
- Target size: 15,000 characters maximum
- This is SHARED across ALL agents - must be comprehensive and authoritative

REQUIRED SECTIONS:

DATA SOURCE HIERARCHY
- Primary sources: First-party data, direct measurement, contractual data
- Secondary sources: Industry reports, published benchmarks, partner data
- Tertiary sources: Aggregated estimates, modeled data, derived metrics
- Source ranking rules and override conditions

QUALITY TIER DEFINITIONS
- Tier 1 (Highest): Audited, verified, contractually guaranteed
- Tier 2 (Standard): Published, attributed, less than 12 months old
- Tier 3 (Acceptable): Estimated, modeled, 12-24 months old
- Tier 4 (Use with caution): Unverified, aged, single source

CITATION REQUIREMENTS
- Mandatory citation triggers
- Citation format: Source, Date, Confidence indicator
- When paraphrasing vs quoting
- Attribution for calculations and derivations

PROVENANCE TRACKING
- Data lineage documentation requirements
- Transformation logging
- Confidence degradation rules (each transformation step)
- Audit trail requirements

CRITICAL: Read the source files first, consolidate the best content, 
remove any duplication with other EAP files, ensure 6-Rule compliance.
═══════════════════════════════════════════════════════════════
```

#### Task 2.2: Create EAP_KB_Confidence_Levels_v1.txt

```
PROMPT FOR DESKTOP CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Create EAP_KB_Confidence_Levels_v1.txt

OUTPUT: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/platform/eap/kb/EAP_KB_Confidence_Levels_v1.txt

SOURCE CONTENT TO INCORPORATE:
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/CA_CONFIDENCE_LEVELS_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 12,000 characters maximum
- This is SHARED across ALL agents

REQUIRED SECTIONS:

CONFIDENCE BAND DEFINITIONS
- HIGH (85-100%): Multiple verified sources, recent data, validated methodology
- MEDIUM (60-84%): Good evidence with some assumptions or data gaps
- LOW (40-59%): Limited evidence, significant assumptions required
- SPECULATIVE (below 40%): Insufficient data, directional guidance only

UNCERTAINTY COMMUNICATION
- Language patterns for each confidence band
- Required qualifiers by band (must use, should use, may use)
- Range vs point estimate decision rules
- Mandatory disclosures by confidence level

CONFIDENCE CALCULATION FACTORS
- Data recency factor (weight: 25%)
- Source quality factor (weight: 30%)
- Sample size factor (weight: 20%)
- Methodology rigor factor (weight: 25%)
- Calculation examples

DEGRADATION RULES
- Confidence reduction for data aging (per month)
- Confidence reduction for each transformation step
- Minimum confidence thresholds for recommendations
- Escalation triggers when confidence falls below threshold

PRESENTATION STANDARDS
- Visual indicators for confidence in documents
- Verbal indicators for conversational responses
- Required disclosures at each level
═══════════════════════════════════════════════════════════════
```

#### Task 2.3: Create EAP_KB_Error_Handling_v1.txt

```
PROMPT FOR DESKTOP CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Create EAP_KB_Error_Handling_v1.txt

OUTPUT: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/platform/eap/kb/EAP_KB_Error_Handling_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 10,000 characters maximum
- This is SHARED across ALL agents

REQUIRED SECTIONS:

ERROR CATEGORIES
- Data errors: Missing required input, invalid format, stale data, conflicting sources
- Capability errors: Timeout, service unavailable, capacity exceeded
- Routing errors: Unknown intent, ambiguous request, multi-domain query
- User errors: Insufficient context, impossible request, out of scope

GRACEFUL DEGRADATION PATTERNS
- Primary to fallback capability routing
- Partial results with clear disclosure of limitations
- Estimation when exact calculation unavailable
- Manual override guidance when automation fails

USER-FACING ERROR MESSAGES
- Never blame the user
- Structure: What happened, Why it matters, What to do next
- Examples for each error category
- Tone: Constructive, helpful, action-oriented

RECOVERY STRATEGIES
- Automatic retry conditions and limits
- Alternative approach suggestions
- Escalation to human support triggers
- Session preservation during errors

LOGGING REQUIREMENTS
- Required fields for error logging
- Severity classification
- Correlation ID tracking
- Retention and review cadence
═══════════════════════════════════════════════════════════════
```

#### Task 2.4: Create EAP_KB_Formatting_Standards_v1.txt

```
PROMPT FOR DESKTOP CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Create EAP_KB_Formatting_Standards_v1.txt

OUTPUT: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/platform/eap/kb/EAP_KB_Formatting_Standards_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 8,000 characters maximum
- This is SHARED across ALL agents

REQUIRED SECTIONS:

THE 6-RULE COMPLIANCE FRAMEWORK
- Rule 1: ALL-CAPS HEADERS - All section titles in capitals
- Rule 2: HYPHENS-ONLY LISTS - Use hyphens, never bullets or numbers
- Rule 3: ASCII ONLY - No em-dashes, smart quotes, or special characters
- Rule 4: ZERO VISUAL DEPENDENCIES - Content readable without formatting
- Rule 5: MANDATORY LANGUAGE - Use must, shall, always, never (not should, could)
- Rule 6: PROFESSIONAL TONE - Clear, authoritative, actionable

DOCUMENT TYPE STANDARDS
- Knowledge Base files: Strict 6-Rule compliance, max 36K chars
- Instruction files: Strict 6-Rule compliance, max 8K chars (Copilot limit)
- User-facing documents: Standard markdown permitted
- Deliverables: Full formatting, professional styling allowed

OUTPUT FORMATTING FOR RESPONSES
- When to use structured format vs prose
- Number formatting: Commas for thousands, 2 decimal places for percentages
- Currency formatting: Symbol prefix, no decimals for whole numbers
- Date formatting: YYYY-MM-DD for data, Month DD, YYYY for display

CHARACTER LIMIT ENFORCEMENT
- KB files: Hard limit 36,000 characters
- Instruction files: Hard limit 8,000 characters
- Response chunks: Soft limit 4,000 characters before offering continuation
- Validation: Always count characters before saving
═══════════════════════════════════════════════════════════════
```

#### Task 2.5: Create EAP_KB_Strategic_Principles_v1.txt

```
PROMPT FOR DESKTOP CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Create EAP_KB_Strategic_Principles_v1.txt

OUTPUT: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/platform/eap/kb/EAP_KB_Strategic_Principles_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 12,000 characters maximum
- This is SHARED across ALL agents - defines platform philosophy

REQUIRED SECTIONS:

PLATFORM PHILOSOPHY
- Strategic advisor, not compliance enforcer
- Strong opinions, loosely held - always respect user autonomy
- Teach and mentor, not just execute
- Challenge assumptions constructively
- Long-term thinking over short-term optimization

CUSTOMERS OVER TRANSACTIONS
- Incrementality-first measurement approach
- Net economics over gross figures (LTV-CAC, not just revenue)
- Customer lifetime value governs acquisition cost limits
- Challenge ROAS as primary KPI when appropriate

ANALYTICAL GUARDRAILS
- Never present single-point estimates without confidence ranges
- Always acknowledge trade-offs in recommendations
- Disclose data limitations upfront
- Separate facts from assumptions explicitly

COMMUNICATION PRINCIPLES
- Lead with insight, not process
- Quantify impact whenever possible
- Provide options with clear trade-offs
- Make recommendations actionable

QUALITY MARKERS
- Completeness: All relevant factors considered
- Consistency: Aligned with previous guidance and platform principles
- Actionability: Clear next steps provided
- Transparency: Sources and methods disclosed
═══════════════════════════════════════════════════════════════
```

#### Task 2.6: Create EAP_KB_Communication_Contract_v1.txt

```
PROMPT FOR DESKTOP CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Create EAP_KB_Communication_Contract_v1.txt

OUTPUT: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/platform/eap/kb/EAP_KB_Communication_Contract_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 10,000 characters maximum
- This defines inter-agent communication protocol

REQUIRED SECTIONS:

INTER-AGENT REQUEST FORMAT
- Required fields: source_agent, target_agent, capability_code, session_id
- Input payload: JSON structure with typed parameters
- Context preservation: conversation_history_summary, user_preferences
- Priority levels: URGENT, NORMAL, BACKGROUND

INTER-AGENT RESPONSE FORMAT
- Required fields: status (SUCCESS/PARTIAL/ERROR), result_payload
- Confidence indicator: HIGH/MEDIUM/LOW/SPECULATIVE
- Processing metadata: execution_time_ms, tokens_used
- Continuation token for paginated results

HANDOFF PROTOCOL
- When to route vs handle locally (capability boundaries)
- Context that must be preserved during handoffs
- User transparency requirements (inform user of specialist routing)
- Return path for follow-up questions

ORCHESTRATOR RESPONSIBILITIES
- Intent classification and routing
- Multi-agent coordination for complex queries
- Response aggregation from multiple specialists
- Session state management

ERROR PROPAGATION
- How errors bubble up through agent chain
- Partial success handling
- Fallback routing when primary agent fails
- User notification standards for failures
═══════════════════════════════════════════════════════════════
```

#### Task 2.7: Commit EAP KB Files (VS Code)

```
PROMPT FOR VS CODE CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Validate and commit EAP KB files

REPOSITORY: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
BRANCH: feature/v6.0-kb-expansion

EXECUTE:

# 1. Verify all 6 files exist
ls -la base/platform/eap/kb/

# Expected files:
# EAP_KB_Data_Provenance_v1.txt
# EAP_KB_Confidence_Levels_v1.txt
# EAP_KB_Error_Handling_v1.txt
# EAP_KB_Formatting_Standards_v1.txt
# EAP_KB_Strategic_Principles_v1.txt
# EAP_KB_Communication_Contract_v1.txt

# 2. Validate 6-Rule compliance (no special characters)
for f in base/platform/eap/kb/*.txt; do
  echo "Checking $f..."
  if grep -P '[–—""''•]' "$f"; then
    echo "FAIL: $f contains non-ASCII characters"
  else
    echo "PASS: $f is 6-Rule compliant"
  fi
  echo "Character count: $(wc -c < "$f")"
done

# 3. Commit
git add base/platform/eap/kb/
git commit -m "feat(eap): Add 6 shared KB files for platform-wide standards

- EAP_KB_Data_Provenance: Source hierarchy and quality tiers
- EAP_KB_Confidence_Levels: Uncertainty communication standards
- EAP_KB_Error_Handling: Graceful degradation patterns
- EAP_KB_Formatting_Standards: 6-Rule compliance framework
- EAP_KB_Strategic_Principles: Platform philosophy and guardrails
- EAP_KB_Communication_Contract: Inter-agent protocol"

git push origin feature/v6.0-kb-expansion

VALIDATION CHECKLIST:
- [ ] All 6 files exist
- [ ] All files pass 6-Rule compliance check
- [ ] All files under 36,000 characters
- [ ] Commit successful
═══════════════════════════════════════════════════════════════
```

---

### PHASE 3: ANL & DOC EXTENSIONS (Day 4)

**Owner: Desktop Claude (2 files)**

#### Task 3.1: Create ANL_KB_Financial_Investment_v1.txt

```
PROMPT FOR DESKTOP CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Create ANL_KB_Financial_Investment_v1.txt

OUTPUT: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v6.0/agents/anl/kb/ANL_KB_Financial_Investment_v1.txt

SOURCE CONTENT TO INCORPORATE:
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/FRAMEWORK_Advanced_Analytics_v1.txt
- MPA_v6_CA_Framework_Expansion.md (Business Case & Investment section)

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 22,000 characters maximum
- This EXTENDS ANL for consulting financial analysis capabilities

REQUIRED SECTIONS:

NET PRESENT VALUE (NPV) METHODOLOGY
- Discount rate selection criteria (WACC, hurdle rate, risk-adjusted)
- Cash flow projection methods (bottom-up, top-down, hybrid)
- Terminal value calculation (perpetuity growth, exit multiple)
- Sensitivity to discount rate changes
- NPV decision rules: Accept if NPV > 0, compare alternatives by NPV

INTERNAL RATE OF RETURN (IRR)
- IRR calculation approach and interpretation
- Multiple IRR scenarios and how to handle
- Modified IRR (MIRR) when appropriate
- IRR vs NPV: When they conflict, NPV wins

TOTAL COST OF OWNERSHIP (TCO)
- Lifecycle phases: Acquisition, Operation, Maintenance, End-of-life
- Hidden cost identification checklist
- Opportunity cost inclusion
- TCO vs purchase price framing for stakeholders

PAYBACK PERIOD ANALYSIS
- Simple payback calculation
- Discounted payback (time value adjusted)
- Break-even analysis
- Payback limitations and when not to rely on it

SENSITIVITY ANALYSIS
- Tornado diagram methodology (one variable at a time)
- Spider diagram methodology (multiple variables)
- Key variable identification criteria
- Scenario definition: Base case, Bull case, Bear case
- Presentation format for stakeholders

MONTE CARLO SIMULATION
- Input distribution selection (normal, triangular, uniform)
- Iteration count guidance (minimum 1,000, recommend 10,000)
- Output interpretation (mean, median, percentiles)
- Confidence interval reporting

INVESTMENT DECISION FRAMEWORK
- When to use which method
- Combined analysis approach (NPV + IRR + Payback + Sensitivity)
- Presentation to different stakeholders (Finance, Executive, Board)
═══════════════════════════════════════════════════════════════
```

#### Task 3.2: Create DOC_KB_Consulting_Templates_v1.txt

```
PROMPT FOR DESKTOP CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Create DOC_KB_Consulting_Templates_v1.txt

OUTPUT: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v6.0/agents/doc/kb/DOC_KB_Consulting_Templates_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 18,000 characters maximum
- This EXTENDS DOC for consulting deliverable generation

REQUIRED SECTIONS:

BUSINESS CASE DOCUMENT TEMPLATE
- Executive Summary (1 page max): Problem, Solution, Investment, Return, Recommendation
- Problem Statement: Current state, Pain points, Cost of inaction
- Proposed Solution: Approach, Key features, Differentiation
- Financial Analysis: Investment required, NPV, IRR, Payback, Sensitivity
- Risk Assessment: Key risks, Mitigation strategies, Contingencies
- Implementation Approach: Phases, Timeline, Resources, Governance
- Recommendation: Clear ask, Decision criteria met, Next steps
- Appendices: Detailed calculations, Assumptions, Supporting data

IMPLEMENTATION ROADMAP TEMPLATE
- Executive Overview: Vision, Scope, Timeline summary
- Current State Summary: As-is assessment, Key gaps
- Future State Vision: Target operating model, Success metrics
- Phased Approach: Phase definitions, Milestones, Dependencies
- Resource Requirements: People, Technology, Budget by phase
- Risk Mitigation: Risk register, Mitigation actions, Owners
- Success Metrics: KPIs, Targets, Measurement approach
- Governance Model: Steering committee, Decision rights, Escalation

ASSESSMENT REPORT TEMPLATE
- Executive Summary: Scope, Key findings, Priority recommendations
- Methodology: Approach, Data sources, Stakeholders interviewed
- Current State Analysis: Findings by assessment dimension
- Gap Analysis: Current vs target state by area
- Findings and Observations: Grouped by theme, severity coded
- Recommendations: Prioritized list with effort/impact
- Quick Wins vs Strategic Initiatives: Immediate vs long-term
- Next Steps: Proposed engagement, Timeline, Investment

TEMPLATE SELECTION LOGIC
- New initiative justification: Business Case
- Post-assessment planning: Implementation Roadmap
- Maturity evaluation: Assessment Report
- Combining templates: When and how to merge sections
═══════════════════════════════════════════════════════════════
```

#### Task 3.3: Commit ANL & DOC Extensions (VS Code)

```
PROMPT FOR VS CODE CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Validate and commit ANL and DOC extension files

REPOSITORY: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
BRANCH: feature/v6.0-kb-expansion

EXECUTE:

# 1. Verify files exist
ls -la release/v6.0/agents/anl/kb/ANL_KB_Financial_Investment_v1.txt
ls -la release/v6.0/agents/doc/kb/DOC_KB_Consulting_Templates_v1.txt

# 2. Validate 6-Rule compliance
for f in release/v6.0/agents/anl/kb/ANL_KB_Financial_Investment_v1.txt release/v6.0/agents/doc/kb/DOC_KB_Consulting_Templates_v1.txt; do
  echo "Checking $f..."
  if grep -P '[–—""''•]' "$f"; then
    echo "FAIL: Contains non-ASCII"
  else
    echo "PASS: 6-Rule compliant"
  fi
  echo "Size: $(wc -c < "$f") characters"
done

# 3. Commit
git add release/v6.0/agents/anl/kb/ANL_KB_Financial_Investment_v1.txt
git add release/v6.0/agents/doc/kb/DOC_KB_Consulting_Templates_v1.txt
git commit -m "feat(anl,doc): Add financial analysis and consulting template extensions

- ANL: NPV, IRR, TCO, Monte Carlo, sensitivity analysis methods
- DOC: Business case, roadmap, and assessment report templates"

git push origin feature/v6.0-kb-expansion
═══════════════════════════════════════════════════════════════
```

---

### PHASE 4: CST AGENT (Days 5-6)

**Owner: Desktop Claude (5 files)**

#### Task 4.1: Create CST_Copilot_Instructions_v1.txt

```
PROMPT FOR DESKTOP CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Create CST_Copilot_Instructions_v1.txt

OUTPUT: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/agents/cst/instructions/CST_Copilot_Instructions_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- HARD LIMIT: 8,000 characters maximum (Copilot Studio constraint)
- Count characters carefully - reject if over limit

REQUIRED CONTENT:

AGENT IDENTITY
- Code: CST
- Name: Consulting Strategy Agent
- Role: Framework selection, consulting methodology, strategic analysis, prioritization
- Personality: Strategic advisor, methodical, evidence-based, options-oriented

CAPABILITIES
- CST_FRAMEWORK_SELECT: Recommend appropriate frameworks for challenge type
- CST_STRATEGIC_ANALYZE: Apply strategic analysis frameworks (SWOT, Porter, etc.)
- CST_PRIORITIZE: Score and rank initiatives using RICE, weighted matrix, MoSCoW
- CST_ENGAGEMENT_GUIDE: Guide through consulting phases (discovery to roadmap)

ROUTING RULES (WHEN TO HAND OFF)
- Financial calculations (NPV, IRR, Monte Carlo) - Route to ANL
- Document generation (business case, roadmap) - Route to DOC
- Change management and adoption - Route to CHG
- Media planning specifics - Route to appropriate MPA agent
- Keep: Framework selection, prioritization, strategic analysis

BEHAVIOR GUIDELINES
- Always ask clarifying questions before recommending frameworks
- Present 2-3 framework options with trade-offs when appropriate
- Explain WHY a framework fits the situation
- Reference ca_framework Dataverse table for framework details
- Connect analysis to business outcomes

REQUIRED KB RETRIEVAL
- Always retrieve CST_KB_Consulting_Core for methodology context
- Retrieve CST_KB_Strategic_Frameworks for framework application requests
- Retrieve CST_KB_Prioritization_Methods for scoring and ranking requests
- Retrieve CST_KB_Industry_Context when industry-specific guidance needed

RESPONSE PATTERNS
- For framework requests: Recommend framework, explain fit, outline application steps
- For prioritization: Gather criteria, score systematically, present ranked list
- For strategic analysis: Apply framework step-by-step, synthesize findings, recommend actions

CRITICAL: Must be UNDER 8,000 characters. Count before saving.
═══════════════════════════════════════════════════════════════
```

#### Task 4.2: Create CST_KB_Consulting_Core_v1.txt

```
PROMPT FOR DESKTOP CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Create CST_KB_Consulting_Core_v1.txt

OUTPUT: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/agents/cst/kb/CST_KB_Consulting_Core_v1.txt

SOURCE CONTENT TO INCORPORATE:
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/BEHAVIORAL_Research_Routing_v1.txt
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/BEHAVIORAL_Service_Availability_v1.txt
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/CUSTOM_FRAMEWORK_GUIDE_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 25,000 characters maximum
- This is the CORE KB - always retrieved for CST queries

REQUIRED SECTIONS:

CONSULTING ENGAGEMENT MODEL
- Phase 1 - Discovery: Understand the problem, stakeholders, constraints
- Phase 2 - Assessment: Analyze current state, gather data, identify gaps
- Phase 3 - Recommendations: Develop options, evaluate trade-offs, prioritize
- Phase 4 - Roadmap: Plan implementation, define milestones, assign resources
- Phase transitions: Criteria for moving between phases
- Deliverables by phase

DISCOVERY METHODOLOGY
- Stakeholder identification and mapping
- Problem framing techniques (5 Whys, Issue Trees)
- Scope definition and boundaries
- Success criteria establishment
- Discovery interview guide
- Key questions to ask in discovery

ASSESSMENT APPROACH
- Data gathering methods (interviews, surveys, document review, observation)
- Current state documentation templates
- Gap analysis framework (current vs target)
- Finding synthesis and theming
- Assessment scoring approaches

RECOMMENDATION DEVELOPMENT
- Option generation techniques (brainstorming, benchmarking, best practices)
- Evaluation criteria definition
- Trade-off analysis methods
- Recommendation prioritization approaches
- Stakeholder alignment strategies

ROADMAP CREATION
- Phasing strategy (quick wins first, dependencies, risk sequencing)
- Dependency mapping techniques
- Resource estimation approaches
- Risk identification and mitigation
- Governance model design

FRAMEWORK SELECTION PRINCIPLES
- Match framework complexity to problem complexity
- Consider audience familiarity with framework
- Combine frameworks when single framework insufficient
- Customize standard frameworks when needed
- Document framework modifications
═══════════════════════════════════════════════════════════════
```

#### Task 4.3: Create CST_KB_Strategic_Frameworks_v1.txt

```
PROMPT FOR DESKTOP CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Create CST_KB_Strategic_Frameworks_v1.txt

OUTPUT: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/agents/cst/kb/CST_KB_Strategic_Frameworks_v1.txt

SOURCE CONTENT TO INCORPORATE:
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/FRAMEWORK_Consulting_Tools_v1.txt
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/FRAMEWORK_Enterprise_Tools_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 22,000 characters maximum
- Focus on HOW TO APPLY frameworks, not just definitions

NOTE: Framework METADATA (names, codes, descriptions) lives in ca_framework 
Dataverse table. This KB covers APPLICATION GUIDANCE only.

REQUIRED SECTIONS:

STRATEGIC ANALYSIS FRAMEWORKS
- SWOT Analysis: Application steps, facilitation guide, output template
- PESTEL Analysis: Environmental scanning process, factor identification
- Scenario Planning: Scenario development, implications analysis
- Ansoff Matrix: Growth strategy mapping, risk assessment by quadrant

COMPETITIVE ANALYSIS FRAMEWORKS
- Porters Five Forces: Industry analysis steps, competitive intensity scoring
- Competitor Profiling: Data gathering, profile template, comparison matrix
- Strategic Group Mapping: Dimension selection, positioning analysis
- Win-Loss Analysis: Interview protocol, pattern identification

OPERATIONAL FRAMEWORKS
- Value Chain Analysis: Activity mapping, cost/value assessment
- Process Mapping: SIPOC, swimlane diagrams, bottleneck identification
- Root Cause Analysis: 5 Whys application, fishbone diagram facilitation

CUSTOMER FRAMEWORKS
- Customer Journey Mapping: Touchpoint identification, pain point analysis
- Jobs-to-be-Done: Interview methodology, job statement formulation
- Kano Model: Feature classification, satisfaction analysis

FRAMEWORK COMBINATION PATTERNS
- Market entry: Porters Five Forces + PESTEL + Competitor Profiling
- Growth strategy: Ansoff + BCG Matrix + Value Chain
- Digital transformation: Current state assessment + Journey Mapping + Roadmap
- M&A due diligence: Porters + SWOT + Synergy Analysis
═══════════════════════════════════════════════════════════════
```

#### Task 4.4: Create CST_KB_Prioritization_Methods_v1.txt

```
PROMPT FOR DESKTOP CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Create CST_KB_Prioritization_Methods_v1.txt

OUTPUT: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/agents/cst/kb/CST_KB_Prioritization_Methods_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 18,000 characters maximum
- Include formulas and calculation examples

REQUIRED SECTIONS:

RICE SCORING METHODOLOGY
- Reach: Estimate number of customers/users affected per quarter
- Impact: Score 3 (massive), 2 (high), 1 (medium), 0.5 (low), 0.25 (minimal)
- Confidence: Percentage based on evidence quality (100% = data-backed, 50% = educated guess)
- Effort: Person-months required for implementation
- Formula: RICE Score = (Reach x Impact x Confidence) / Effort
- Interpretation: Higher score = higher priority
- Example calculation with walkthrough

WEIGHTED DECISION MATRIX
- Step 1: Identify evaluation criteria
- Step 2: Assign weights to criteria (must sum to 100%)
- Step 3: Define scoring scale (typically 1-5 or 1-10)
- Step 4: Score each option against each criterion
- Step 5: Calculate weighted scores
- Step 6: Rank by total weighted score
- Sensitivity analysis on weights
- Example matrix with calculations

MOSCOW PRIORITIZATION
- Must Have: Non-negotiable, project fails without these
- Should Have: Important but not critical, can workaround
- Could Have: Nice to have, include if resources allow
- Wont Have: Explicitly out of scope for this phase
- Facilitation approach for stakeholder alignment
- Common pitfalls and how to avoid

EFFORT-IMPACT MATRIX (2x2)
- Quadrant 1 - Quick Wins: Low effort, High impact - Do first
- Quadrant 2 - Major Projects: High effort, High impact - Plan carefully
- Quadrant 3 - Fill-ins: Low effort, Low impact - Do if time permits
- Quadrant 4 - Thankless Tasks: High effort, Low impact - Avoid or delegate
- Calibration approach for effort and impact

DEPENDENCY MAPPING
- Identifying dependencies (technical, resource, sequential)
- Critical path analysis
- Parallel vs sequential execution decisions
- Visualization techniques

METHOD SELECTION GUIDE
- Use RICE for product/feature prioritization
- Use Weighted Matrix for complex multi-criteria decisions
- Use MoSCoW for scope negotiation
- Use Effort-Impact for quick portfolio triage
- Combine methods for comprehensive prioritization
═══════════════════════════════════════════════════════════════
```

#### Task 4.5: Create CST_KB_Industry_Context_v1.txt

```
PROMPT FOR DESKTOP CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Create CST_KB_Industry_Context_v1.txt

OUTPUT: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/agents/cst/kb/CST_KB_Industry_Context_v1.txt

SOURCE CONTENT TO INCORPORATE:
- /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/INDUSTRY_Expertise_Guide_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 15,000 characters maximum
- Connect to mpa_vertical codes for consistency

REQUIRED SECTIONS:

INDUSTRY CLASSIFICATION
- Mapping to mpa_vertical codes (Retail, CPG, Financial Services, Technology, Healthcare, etc.)
- Industry-specific terminology
- Key industry metrics and KPIs
- Regulatory landscape overview by industry

RETAIL AND CPG
- Key frameworks: Customer journey, category management, promotion optimization
- Common challenges: Omnichannel integration, inventory optimization, private label strategy
- Relevant benchmarks: Same-store sales, basket size, customer acquisition cost
- Regulatory considerations: Privacy, product safety, labeling

FINANCIAL SERVICES
- Key frameworks: Risk management, customer lifecycle, product profitability
- Common challenges: Digital transformation, regulatory compliance, fintech disruption
- Relevant benchmarks: NIM, cost-to-income ratio, customer lifetime value
- Regulatory considerations: Banking regulations, data privacy, fiduciary duties

TECHNOLOGY AND SAAS
- Key frameworks: Product-led growth, customer success, ARR optimization
- Common challenges: Churn reduction, upsell/cross-sell, market expansion
- Relevant benchmarks: ARR, NDR, CAC payback, Rule of 40
- Regulatory considerations: Data privacy, security compliance

HEALTHCARE
- Key frameworks: Patient journey, value-based care, population health
- Common challenges: Care coordination, cost reduction, digital health adoption
- Relevant benchmarks: Patient satisfaction, readmission rates, cost per member
- Regulatory considerations: HIPAA, FDA, payer requirements

INDUSTRY TREND AWARENESS
- Technology disruption patterns by industry
- Market consolidation trends
- Emerging business models
- Sustainability and ESG considerations
═══════════════════════════════════════════════════════════════
```

#### Task 4.6: Commit CST Agent (VS Code)

```
PROMPT FOR VS CODE CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Validate and commit CST agent files

REPOSITORY: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
BRANCH: feature/v6.0-kb-expansion

EXECUTE:

# 1. Verify all 5 files exist
ls -la base/agents/cst/instructions/
ls -la base/agents/cst/kb/

# Expected:
# base/agents/cst/instructions/CST_Copilot_Instructions_v1.txt
# base/agents/cst/kb/CST_KB_Consulting_Core_v1.txt
# base/agents/cst/kb/CST_KB_Strategic_Frameworks_v1.txt
# base/agents/cst/kb/CST_KB_Prioritization_Methods_v1.txt
# base/agents/cst/kb/CST_KB_Industry_Context_v1.txt

# 2. Validate 6-Rule compliance
for f in base/agents/cst/instructions/*.txt base/agents/cst/kb/*.txt; do
  echo "=== $f ==="
  if grep -P '[–—""''•]' "$f"; then
    echo "FAIL: Non-ASCII characters found"
  else
    echo "PASS: 6-Rule compliant"
  fi
  chars=$(wc -c < "$f")
  echo "Size: $chars characters"
  if [[ "$f" == *"Instructions"* ]] && [[ $chars -gt 8000 ]]; then
    echo "ERROR: Instruction file exceeds 8000 char limit!"
  fi
done

# 3. Commit
git add base/agents/cst/
git commit -m "feat(cst): Add Consulting Strategy agent

New CST agent for framework selection, prioritization, and strategic analysis:
- CST_Copilot_Instructions: Agent behavior and routing rules
- CST_KB_Consulting_Core: Engagement methodology (discovery to roadmap)
- CST_KB_Strategic_Frameworks: Framework application guidance
- CST_KB_Prioritization_Methods: RICE, weighted matrix, MoSCoW, effort-impact
- CST_KB_Industry_Context: Industry-specific considerations"

git push origin feature/v6.0-kb-expansion
═══════════════════════════════════════════════════════════════
```

---

### PHASE 5: CHG AGENT (Days 7-8)

**Owner: Desktop Claude (4 files)**

#### Task 5.1: Create CHG_Copilot_Instructions_v1.txt

```
PROMPT FOR DESKTOP CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Create CHG_Copilot_Instructions_v1.txt

OUTPUT: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/agents/chg/instructions/CHG_Copilot_Instructions_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- HARD LIMIT: 8,000 characters maximum (Copilot Studio constraint)

REQUIRED CONTENT:

AGENT IDENTITY
- Code: CHG
- Name: Change Management Agent
- Role: Organizational change methodology, stakeholder management, adoption planning
- Personality: Empathetic, people-focused, systematic, realistic about challenges

CAPABILITIES
- CHG_READINESS: Assess organizational readiness for change
- CHG_STAKEHOLDER: Map, analyze, and develop engagement strategies for stakeholders
- CHG_ADOPTION: Create adoption plans including training, communication, sustainment

ROUTING RULES (WHEN TO HAND OFF)
- Strategic framework selection - Route to CST
- Financial analysis and business case - Route to ANL
- Document generation - Route to DOC
- Media planning topics - Route to appropriate MPA agent
- Keep: Change methodology, stakeholder analysis, adoption planning

BEHAVIOR GUIDELINES
- Acknowledge that change is fundamentally about people, not just process
- Always consider resistance and adoption barriers
- Recommend communication strategies tailored to stakeholder groups
- Connect change activities to business outcomes
- Be realistic about timelines and challenges

REQUIRED KB RETRIEVAL
- Always retrieve CHG_KB_Change_Core for methodology context
- Retrieve CHG_KB_Stakeholder_Methods for stakeholder analysis requests
- Retrieve CHG_KB_Adoption_Planning for rollout and training requests

RESPONSE PATTERNS
- For readiness assessment: Evaluate key factors, identify gaps, recommend interventions
- For stakeholder analysis: Map stakeholders, assess influence/impact, develop engagement plan
- For adoption planning: Design rollout approach, training plan, sustainment mechanisms

CRITICAL: Must be UNDER 8,000 characters. Count before saving.
═══════════════════════════════════════════════════════════════
```

#### Task 5.2: Create CHG_KB_Change_Core_v1.txt

```
PROMPT FOR DESKTOP CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Create CHG_KB_Change_Core_v1.txt

OUTPUT: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/agents/chg/kb/CHG_KB_Change_Core_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 22,000 characters maximum
- This is the CORE KB - always retrieved for CHG queries

REQUIRED SECTIONS:

KOTTERS 8-STEP CHANGE MODEL
- Step 1 - Create Urgency: Build compelling case for change, burning platform
- Step 2 - Form Coalition: Identify and align key sponsors and influencers
- Step 3 - Create Vision: Define clear, compelling future state
- Step 4 - Communicate Vision: Multi-channel, repeated, two-way communication
- Step 5 - Remove Obstacles: Address barriers, empower action
- Step 6 - Create Short-term Wins: Plan and celebrate quick wins
- Step 7 - Build on Change: Use wins to drive more change
- Step 8 - Anchor in Culture: Embed changes in organizational DNA
- Application guidance for each step

ADKAR MODEL
- Awareness: Why is the change needed? Communication strategies
- Desire: Personal motivation to participate. What is in it for me?
- Knowledge: How to change? Training and information
- Ability: Skills and behaviors to implement change
- Reinforcement: Sustaining the change over time
- Assessment approach: Score each element 1-5, address lowest scores first

LEWINS CHANGE MODEL
- Unfreeze: Create motivation to change, challenge status quo
- Change: Implement the new way, provide support and resources
- Refreeze: Stabilize the new state, update systems and processes
- Force Field Analysis integration: Driving forces vs restraining forces

BRIDGES TRANSITION MODEL
- Ending: Help people let go of the old way (loss, grieving)
- Neutral Zone: Navigate the in-between state (confusion, creativity)
- New Beginning: Embrace the new way (energy, commitment)
- Emotional journey considerations

CHANGE READINESS ASSESSMENT
- Leadership alignment factor
- Organizational capacity factor
- Change history factor
- Resource availability factor
- Cultural compatibility factor
- Readiness scoring and interpretation

MODEL SELECTION GUIDE
- Large transformation: Kotter 8-Step
- Individual behavior change: ADKAR
- Understanding resistance: Lewins Force Field
- Emotional aspects: Bridges Transition
- Combining models for comprehensive approach
═══════════════════════════════════════════════════════════════
```

#### Task 5.3: Create CHG_KB_Stakeholder_Methods_v1.txt

```
PROMPT FOR DESKTOP CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Create CHG_KB_Stakeholder_Methods_v1.txt

OUTPUT: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/agents/chg/kb/CHG_KB_Stakeholder_Methods_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 18,000 characters maximum
- Include practical templates and examples

REQUIRED SECTIONS:

STAKEHOLDER IDENTIFICATION
- Categories: Executive sponsors, Project team, Middle management, End users, External partners
- Identification techniques: Organizational chart review, process mapping, impact assessment
- Stakeholder inventory template: Name, Role, Department, Impact level, Influence level

STAKEHOLDER ANALYSIS MATRICES
- Power/Interest Grid: High power/high interest, High power/low interest, etc.
- Influence/Impact Matrix: Who can influence outcomes, who is impacted
- Support Assessment: Champion, Supporter, Neutral, Skeptic, Resistor
- RACI for change: Responsible, Accountable, Consulted, Informed

ENGAGEMENT STRATEGIES BY QUADRANT
- High Power, High Interest: Manage closely, frequent engagement, involve in decisions
- High Power, Low Interest: Keep satisfied, targeted communication, escalate issues
- Low Power, High Interest: Keep informed, leverage as advocates, gather feedback
- Low Power, Low Interest: Monitor, minimal communication, standard updates

COMMUNICATION PLANNING
- Message customization: Tailor content, channel, frequency by stakeholder group
- Channel selection: Town halls, email, one-on-ones, team meetings, digital platforms
- Communication cadence: Pre-change, during change, post-change frequencies
- Two-way feedback: Mechanisms for input and questions

RESISTANCE MANAGEMENT
- Types of resistance: Fear, loss of control, bad timing, lack of trust, surprise
- Root cause analysis: Interview techniques, observation, pattern identification
- Intervention strategies: Involvement, education, support, negotiation, mandate
- Converting resistors: Addressing concerns, building allies, demonstrating value

STAKEHOLDER METRICS
- Engagement scores over time
- Sentiment tracking
- Adoption indicators by stakeholder group
- Feedback volume and themes
═══════════════════════════════════════════════════════════════
```

#### Task 5.4: Create CHG_KB_Adoption_Planning_v1.txt

```
PROMPT FOR DESKTOP CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Create CHG_KB_Adoption_Planning_v1.txt

OUTPUT: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/agents/chg/kb/CHG_KB_Adoption_Planning_v1.txt

REQUIREMENTS:
- 6-Rule Compliance: ALL-CAPS headers, hyphens-only lists, ASCII only
- Target size: 15,000 characters maximum
- Include practical checklists

REQUIRED SECTIONS:

ROLLOUT STRATEGY OPTIONS
- Big Bang: All at once, high risk, fast completion
- Phased by Geography: Region by region, learn and improve
- Phased by Function: Department by department, manage dependencies
- Pilot First: Test with subset, validate before scale
- Selection criteria for rollout approach
- Hybrid approaches

PILOT PLANNING
- Pilot selection criteria: Representative, willing, capable, visible
- Pilot scope definition
- Success metrics for pilot
- Pilot feedback collection
- Pilot to scale transition plan

TRAINING APPROACH
- Training needs assessment: Current skills vs required skills gap
- Delivery methods: Instructor-led, eLearning, blended, on-the-job
- Train-the-trainer programs: Selection, preparation, certification
- Just-in-time training: Job aids, quick reference guides, help systems
- Training effectiveness measurement

CHANGE NETWORK
- Change champion role definition
- Champion selection criteria: Influence, credibility, enthusiasm, time
- Champion responsibilities and time commitment
- Champion enablement and support
- Super user programs: Technical experts for peer support

SUSTAINMENT PLANNING
- Reinforcement mechanisms: Recognition, incentives, accountability
- Performance support: Job aids, knowledge base, help desk
- Manager coaching: Equipping managers to reinforce change
- Continuous improvement: Feedback loops, iteration

ADOPTION METRICS
- Leading indicators: Training completion, system access, feature usage
- Lagging indicators: Productivity, quality, satisfaction
- Adoption curves: Expected adoption pattern over time
- Target setting and tracking
- Intervention triggers when adoption lags

COMMON RISKS AND MITIGATION
- Training not retained: Provide job aids, spaced repetition
- Manager resistance: Extra attention, involvement, accountability
- Competing priorities: Executive commitment, resource protection
- Technical issues: IT support readiness, escalation paths
- Change fatigue: Prioritization, realistic timelines, celebration
═══════════════════════════════════════════════════════════════
```

#### Task 5.5: Commit CHG Agent (VS Code)

```
PROMPT FOR VS CODE CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Validate and commit CHG agent files

REPOSITORY: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
BRANCH: feature/v6.0-kb-expansion

EXECUTE:

# 1. Verify all 4 files exist
ls -la base/agents/chg/instructions/
ls -la base/agents/chg/kb/

# Expected:
# base/agents/chg/instructions/CHG_Copilot_Instructions_v1.txt
# base/agents/chg/kb/CHG_KB_Change_Core_v1.txt
# base/agents/chg/kb/CHG_KB_Stakeholder_Methods_v1.txt
# base/agents/chg/kb/CHG_KB_Adoption_Planning_v1.txt

# 2. Validate
for f in base/agents/chg/instructions/*.txt base/agents/chg/kb/*.txt; do
  echo "=== $f ==="
  if grep -P '[–—""''•]' "$f"; then
    echo "FAIL: Non-ASCII characters"
  else
    echo "PASS: 6-Rule compliant"
  fi
  chars=$(wc -c < "$f")
  echo "Size: $chars characters"
  if [[ "$f" == *"Instructions"* ]] && [[ $chars -gt 8000 ]]; then
    echo "ERROR: Exceeds 8000 char limit!"
  fi
done

# 3. Commit
git add base/agents/chg/
git commit -m "feat(chg): Add Change Management agent

New CHG agent for organizational change and adoption:
- CHG_Copilot_Instructions: Agent behavior and routing
- CHG_KB_Change_Core: Kotter, ADKAR, Lewin, Bridges methodologies
- CHG_KB_Stakeholder_Methods: Analysis, engagement, resistance management
- CHG_KB_Adoption_Planning: Rollout, training, sustainment"

git push origin feature/v6.0-kb-expansion
═══════════════════════════════════════════════════════════════
```

---

### PHASE 6: ORC UPDATES (Day 9)

**Owner: Desktop Claude (updates), VS Code Claude (commit)**

#### Task 6.1: Update ORC_Copilot_Instructions_v1.txt

```
PROMPT FOR DESKTOP CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Update ORC_Copilot_Instructions_v1.txt to add CST and CHG routing

FILE: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v6.0/agents/orc/instructions/ORC_Copilot_Instructions_v1.txt

ACTION: ADD the following sections to the existing routing rules. 
DO NOT delete existing content - only ADD new sections.

ADD TO ROUTING RULES SECTION:

---
CONSULTING STRATEGY AGENT (CST) ROUTING
- Framework selection and application requests
- Prioritization and scoring requests (RICE, weighted matrix, MoSCoW)
- Strategic analysis requests (SWOT, Porter, competitive analysis)
- Consulting methodology guidance
- Intent patterns: framework, prioritize, RICE, SWOT, Porter, strategic analysis, assessment, methodology

CHANGE MANAGEMENT AGENT (CHG) ROUTING
- Organizational change methodology requests
- Stakeholder analysis and management
- Adoption and rollout planning
- Training and communication planning
- Intent patterns: change management, stakeholder, adoption, rollout, resistance, training plan, communication plan, Kotter, ADKAR
---

ADD TO MULTI-AGENT SCENARIOS:

---
CA DOMAIN MULTI-AGENT FLOWS
- Business case development: CST (framework selection) then ANL (financials) then DOC (document)
- Digital transformation: CST (assessment) then CHG (change plan) then DOC (roadmap)
- Investment prioritization: CST (prioritize) then ANL (financial analysis) then DOC (summary)
---

VALIDATION:
- Ensure file remains under 8,000 characters
- Maintain 6-Rule compliance
- Preserve all existing routing rules
═══════════════════════════════════════════════════════════════
```

#### Task 6.2: Update ORC_KB_Routing_Logic_v1.txt

```
PROMPT FOR DESKTOP CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Update ORC_KB_Routing_Logic_v1.txt to add CA domain routing

FILE: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v6.0/agents/orc/kb/ORC_KB_Routing_Logic_v1.txt

ACTION: ADD a new section for CA domain routing. 
DO NOT delete existing content - only ADD.

ADD NEW SECTION:

---
CA DOMAIN ROUTING

CST AGENT TRIGGERS
- User asks about consulting frameworks or methodology
- User requests help with prioritization or scoring
- User needs strategic analysis (SWOT, Porter, competitive)
- User asks about assessment or discovery process
- Keywords: framework, SWOT, Porter, RICE, prioritize, assess, strategic, methodology, consulting

CHG AGENT TRIGGERS  
- User asks about change management or organizational change
- User needs stakeholder analysis or mapping
- User requests adoption or rollout planning
- User asks about training or communication planning
- Keywords: change management, stakeholder, adoption, rollout, resistance, training, communication, Kotter, ADKAR, transition

CA ROUTING DECISION TREE
1. Is request about frameworks or methodology? - Route to CST
2. Is request about prioritization or scoring? - Route to CST
3. Is request about organizational change? - Route to CHG
4. Is request about stakeholders or adoption? - Route to CHG
5. Is request about financial calculations? - Route to ANL (even for CA context)
6. Is request about document generation? - Route to DOC (even for CA context)

CA MULTI-AGENT COORDINATION
When CA query requires multiple agents:
- ORC identifies primary domain (CST or CHG)
- Primary agent handles methodology
- ANL handles any financial calculations needed
- DOC handles any document generation needed
- ORC aggregates responses if needed
---

VALIDATION:
- Maintain 6-Rule compliance
- Ensure logical flow with existing routing
═══════════════════════════════════════════════════════════════
```

#### Task 6.3: Commit ORC Updates (VS Code)

```
PROMPT FOR VS CODE CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Validate and commit ORC updates

REPOSITORY: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
BRANCH: feature/v6.0-kb-expansion

EXECUTE:

# 1. Show diff of changes
git diff release/v6.0/agents/orc/

# 2. Validate instruction file size
chars=$(wc -c < release/v6.0/agents/orc/instructions/ORC_Copilot_Instructions_v1.txt)
echo "ORC Instructions: $chars characters"
if [[ $chars -gt 8000 ]]; then
  echo "ERROR: Exceeds 8000 char limit - must reduce"
fi

# 3. Validate 6-Rule compliance
for f in release/v6.0/agents/orc/instructions/*.txt release/v6.0/agents/orc/kb/*.txt; do
  if grep -P '[–—""''•]' "$f"; then
    echo "FAIL: $f has non-ASCII"
  fi
done

# 4. Commit
git add release/v6.0/agents/orc/
git commit -m "feat(orc): Add CST and CHG routing rules for CA integration

- Added CST routing: frameworks, prioritization, strategic analysis
- Added CHG routing: change management, stakeholders, adoption
- Added CA multi-agent coordination patterns"

git push origin feature/v6.0-kb-expansion
═══════════════════════════════════════════════════════════════
```

---

### PHASE 7: DATAVERSE SCHEMA (Day 10)

**Owner: VS Code Claude**

#### Task 7.1: Create Dataverse Schema Files

```
PROMPT FOR VS CODE CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Create Dataverse schema and seed files for CA tables

REPOSITORY: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
BRANCH: feature/v6.0-kb-expansion

EXECUTE:

# 1. Create schema directory if needed
mkdir -p base/dataverse/schema base/dataverse/seed

# 2. Create ca_framework schema
cat > base/dataverse/schema/ca_framework.json << 'EOF'
{
  "schema_name": "ca_framework",
  "display_name": "CA Framework",
  "description": "Reference data for consulting frameworks",
  "primary_key": "ca_framework_id",
  "columns": [
    {"name": "ca_framework_id", "type": "Autonumber", "description": "Primary key"},
    {"name": "framework_code", "type": "Text", "max_length": 20, "required": true, "unique": true},
    {"name": "framework_name", "type": "Text", "max_length": 100, "required": true},
    {"name": "category", "type": "Choice", "options": ["Domain", "Strategic", "Competitive", "Operational", "Customer", "Financial", "Change", "Planning", "Problem"]},
    {"name": "complexity", "type": "Choice", "options": ["Standard", "Advanced", "Expert"]},
    {"name": "description", "type": "Text", "max_length": 500},
    {"name": "when_to_use", "type": "Text", "max_length": 1000},
    {"name": "typical_duration", "type": "Text", "max_length": 50},
    {"name": "is_active", "type": "Boolean", "default": true},
    {"name": "display_order", "type": "Integer"}
  ]
}
EOF

# 3. Create ca_project schema
cat > base/dataverse/schema/ca_project.json << 'EOF'
{
  "schema_name": "ca_project",
  "display_name": "CA Project",
  "description": "Consulting engagement tracking",
  "primary_key": "ca_project_id",
  "columns": [
    {"name": "ca_project_id", "type": "GUID", "description": "Primary key"},
    {"name": "project_name", "type": "Text", "max_length": 200, "required": true},
    {"name": "client_name", "type": "Text", "max_length": 200},
    {"name": "industry_code", "type": "Lookup", "target": "mpa_vertical"},
    {"name": "engagement_type", "type": "Choice", "options": ["Assessment", "Strategy", "Transformation", "Due Diligence"]},
    {"name": "status", "type": "Choice", "options": ["Discovery", "Analysis", "Recommendations", "Roadmap", "Complete"]},
    {"name": "session_id", "type": "Lookup", "target": "eap_session"},
    {"name": "created_on", "type": "DateTime"},
    {"name": "modified_on", "type": "DateTime"}
  ]
}
EOF

# 4. Create ca_deliverable schema
cat > base/dataverse/schema/ca_deliverable.json << 'EOF'
{
  "schema_name": "ca_deliverable",
  "display_name": "CA Deliverable",
  "description": "Consulting deliverable tracking",
  "primary_key": "ca_deliverable_id",
  "columns": [
    {"name": "ca_deliverable_id", "type": "GUID", "description": "Primary key"},
    {"name": "project_id", "type": "Lookup", "target": "ca_project", "required": true},
    {"name": "deliverable_type", "type": "Choice", "options": ["Analysis", "Business Case", "Roadmap", "Presentation", "Report"]},
    {"name": "framework_used", "type": "Text", "max_length": 100},
    {"name": "status", "type": "Choice", "options": ["Draft", "Review", "Final"]},
    {"name": "file_url", "type": "Text", "max_length": 500},
    {"name": "created_on", "type": "DateTime"}
  ]
}
EOF

# 5. Verify
ls -la base/dataverse/schema/

# 6. Commit
git add base/dataverse/schema/
git commit -m "feat(dataverse): Add CA table schemas

- ca_framework: Reference data for 32+ consulting frameworks
- ca_project: Engagement tracking
- ca_deliverable: Deliverable tracking"

git push origin feature/v6.0-kb-expansion
═══════════════════════════════════════════════════════════════
```

#### Task 7.2: Generate ca_framework Seed Data

```
PROMPT FOR VS CODE CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Generate ca_framework seed data from existing FRAMEWORK_Library_Master

SOURCE: /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/FRAMEWORK_Library_Master_v1.txt
OUTPUT: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/dataverse/seed/ca_framework_seed.csv

INSTRUCTIONS:
1. Read the FRAMEWORK_Library_Master_v1.txt file
2. Extract all 32 frameworks
3. Generate CSV with columns:
   framework_code,framework_name,category,complexity,description,when_to_use,is_active,display_order

FRAMEWORK MAPPING (extract from source file):

Pack 1 - Domain-Specific (4 frameworks):
- FW-001: MarTech Assessment Framework, Domain, Expert
- FW-002: Media Planning Framework, Domain, Advanced
- FW-003: Loyalty Strategy Framework, Domain, Advanced
- FW-004: Data Strategy Framework, Domain, Expert

Pack 2 - Strategic Analysis (8 frameworks):
- FW-005: SWOT Analysis, Strategic, Standard
- FW-006: PESTEL Analysis, Strategic, Standard
- FW-007: Scenario Planning, Strategic, Advanced
- FW-008: Ansoff Matrix, Strategic, Standard
- FW-009: BCG Matrix, Strategic, Standard
- FW-010: GE-McKinsey Nine Box, Strategic, Advanced
- FW-011: Value Proposition Canvas, Strategic, Standard
- FW-012: Blue Ocean Strategy, Strategic, Advanced

Pack 3 - Competitive Analysis (6 frameworks):
- FW-013: Porters Five Forces, Competitive, Standard
- FW-014: Competitor Profiling, Competitive, Standard
- FW-015: Benchmarking Framework, Competitive, Standard
- FW-016: Strategic Group Analysis, Competitive, Advanced
- FW-017: Positioning Map, Competitive, Standard
- FW-018: Win-Loss Analysis, Competitive, Advanced

Pack 4 - Operational (6 frameworks):
- FW-019: Value Chain Analysis, Operational, Standard
- FW-020: Process Mapping, Operational, Standard
- FW-021: Lean Six Sigma, Operational, Advanced
- FW-022: RACI Matrix, Operational, Standard
- FW-023: Root Cause Analysis, Operational, Standard
- FW-024: Capacity Planning, Operational, Advanced

Pack 5 - Customer and Market (8 frameworks):
- FW-025: Customer Journey Mapping, Customer, Standard
- FW-026: Jobs to be Done, Customer, Advanced
- FW-027: Kano Model, Customer, Advanced
- FW-028: STP Framework, Customer, Standard
- FW-029: Marketing Mix 4Ps/7Ps, Customer, Standard
- FW-030: Technology Adoption Lifecycle, Customer, Standard
- FW-031: RACE Framework, Customer, Standard
- FW-032: Net Promoter System, Customer, Standard

Generate complete CSV and commit.
═══════════════════════════════════════════════════════════════
```

---

### PHASE 8: TESTING AND VALIDATION (Day 11)

**Owner: VS Code Claude**

#### Task 8.1: Create Agent Validation Tests

```
PROMPT FOR VS CODE CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Create validation tests for new agents and extensions

REPOSITORY: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
BRANCH: feature/v6.0-kb-expansion

CREATE TEST SCENARIOS:

# 1. Create test directory
mkdir -p base/tests/scenarios/ca

# 2. Create CST test scenarios
cat > base/tests/scenarios/ca/cst_routing_tests.yaml << 'EOF'
test_suite: CST Routing Tests
agent: CST
scenarios:
  - name: Framework Selection Request
    input: "What framework should I use to analyze our competitive landscape?"
    expected_routing: CST
    expected_capability: CST_FRAMEWORK_SELECT
    expected_kb_retrieval: CST_KB_Strategic_Frameworks
    
  - name: RICE Prioritization Request
    input: "Help me prioritize these 10 initiatives using RICE scoring"
    expected_routing: CST
    expected_capability: CST_PRIORITIZE
    expected_kb_retrieval: CST_KB_Prioritization_Methods
    
  - name: SWOT Analysis Request
    input: "Can you walk me through a SWOT analysis for our new product launch?"
    expected_routing: CST
    expected_capability: CST_STRATEGIC_ANALYZE
    expected_kb_retrieval: CST_KB_Strategic_Frameworks
    
  - name: Financial Calc Handoff
    input: "Calculate the NPV for this investment"
    expected_routing: ANL
    notes: Should route to ANL even if in CST context
EOF

# 3. Create CHG test scenarios
cat > base/tests/scenarios/ca/chg_routing_tests.yaml << 'EOF'
test_suite: CHG Routing Tests
agent: CHG
scenarios:
  - name: Change Readiness Request
    input: "How ready is our organization for this digital transformation?"
    expected_routing: CHG
    expected_capability: CHG_READINESS
    expected_kb_retrieval: CHG_KB_Change_Core
    
  - name: Stakeholder Analysis Request
    input: "Help me map out the stakeholders for this initiative"
    expected_routing: CHG
    expected_capability: CHG_STAKEHOLDER
    expected_kb_retrieval: CHG_KB_Stakeholder_Methods
    
  - name: Adoption Planning Request
    input: "Create a training and rollout plan for the new system"
    expected_routing: CHG
    expected_capability: CHG_ADOPTION
    expected_kb_retrieval: CHG_KB_Adoption_Planning
EOF

# 4. Create integration test scenarios
cat > base/tests/scenarios/ca/ca_integration_tests.yaml << 'EOF'
test_suite: CA Integration Tests
scenarios:
  - name: Business Case Flow
    description: Multi-agent business case development
    flow:
      - step: 1
        input: "Help me build a business case for a new CDP implementation"
        expected_routing: CST
        expected_action: Framework selection and assessment
      - step: 2
        input: "Now calculate the NPV and IRR for a $500K investment"
        expected_routing: ANL
        expected_action: Financial analysis
      - step: 3
        input: "Generate the business case document"
        expected_routing: DOC
        expected_action: Document generation
        
  - name: Transformation Planning Flow
    description: Multi-agent transformation planning
    flow:
      - step: 1
        input: "Assess our MarTech maturity"
        expected_routing: CST
      - step: 2
        input: "Create a change management plan"
        expected_routing: CHG
      - step: 3
        input: "Generate the transformation roadmap"
        expected_routing: DOC
EOF

# 5. Commit
git add base/tests/scenarios/ca/
git commit -m "test(ca): Add CA agent test scenarios

- CST routing tests: framework selection, prioritization, strategic analysis
- CHG routing tests: readiness, stakeholder, adoption
- Integration tests: multi-agent flows for business case and transformation"

git push origin feature/v6.0-kb-expansion
═══════════════════════════════════════════════════════════════
```

#### Task 8.2: Final Validation Checklist

```
PROMPT FOR VS CODE CLAUDE:
═══════════════════════════════════════════════════════════════

TASK: Final validation of all CA integration work

REPOSITORY: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
BRANCH: feature/v6.0-kb-expansion

RUN VALIDATION:

echo "=== FINAL VALIDATION CHECKLIST ==="

echo ""
echo "1. ARCHIVE CHECK"
ls -la archive/ | grep -E "^d"
echo "Expected: nds/, cso/, udm/"

echo ""
echo "2. EAP KB CHECK"
ls base/platform/eap/kb/*.txt | wc -l
echo "Expected: 6 files"

echo ""
echo "3. CST AGENT CHECK"
ls base/agents/cst/instructions/*.txt | wc -l
ls base/agents/cst/kb/*.txt | wc -l
echo "Expected: 1 instruction, 4 KB files"

echo ""
echo "4. CHG AGENT CHECK"
ls base/agents/chg/instructions/*.txt | wc -l
ls base/agents/chg/kb/*.txt | wc -l
echo "Expected: 1 instruction, 3 KB files"

echo ""
echo "5. ANL EXTENSION CHECK"
ls release/v6.0/agents/anl/kb/ | grep -c Financial
echo "Expected: 1 (ANL_KB_Financial_Investment)"

echo ""
echo "6. DOC EXTENSION CHECK"
ls release/v6.0/agents/doc/kb/ | grep -c Consulting
echo "Expected: 1 (DOC_KB_Consulting_Templates)"

echo ""
echo "7. SHARED REFERENCE CHECK"
ls base/shared/reference/*.txt | wc -l
echo "Expected: 14 REFERENCE files"

echo ""
echo "8. DATAVERSE SCHEMA CHECK"
ls base/dataverse/schema/*.json | wc -l
echo "Expected: 3 schemas (ca_framework, ca_project, ca_deliverable)"

echo ""
echo "9. 6-RULE COMPLIANCE CHECK"
find base/agents -name "*.txt" -exec grep -l -P '[–—""''•]' {} \;
find base/platform -name "*.txt" -exec grep -l -P '[–—""''•]' {} \;
echo "Expected: No files listed (empty = pass)"

echo ""
echo "10. INSTRUCTION SIZE CHECK"
for f in base/agents/*/instructions/*.txt; do
  size=$(wc -c < "$f")
  if [[ $size -gt 8000 ]]; then
    echo "FAIL: $f is $size chars (limit 8000)"
  fi
done
echo "Expected: No FAIL messages"

echo ""
echo "=== VALIDATION COMPLETE ==="
═══════════════════════════════════════════════════════════════
```

---

## PART 8: SUMMARY

### Files Created (17 new)

| Phase | File | Owner |
|-------|------|-------|
| 2 | EAP_KB_Data_Provenance_v1.txt | Desktop |
| 2 | EAP_KB_Confidence_Levels_v1.txt | Desktop |
| 2 | EAP_KB_Error_Handling_v1.txt | Desktop |
| 2 | EAP_KB_Formatting_Standards_v1.txt | Desktop |
| 2 | EAP_KB_Strategic_Principles_v1.txt | Desktop |
| 2 | EAP_KB_Communication_Contract_v1.txt | Desktop |
| 3 | ANL_KB_Financial_Investment_v1.txt | Desktop |
| 3 | DOC_KB_Consulting_Templates_v1.txt | Desktop |
| 4 | CST_Copilot_Instructions_v1.txt | Desktop |
| 4 | CST_KB_Consulting_Core_v1.txt | Desktop |
| 4 | CST_KB_Strategic_Frameworks_v1.txt | Desktop |
| 4 | CST_KB_Prioritization_Methods_v1.txt | Desktop |
| 4 | CST_KB_Industry_Context_v1.txt | Desktop |
| 5 | CHG_Copilot_Instructions_v1.txt | Desktop |
| 5 | CHG_KB_Change_Core_v1.txt | Desktop |
| 5 | CHG_KB_Stakeholder_Methods_v1.txt | Desktop |
| 5 | CHG_KB_Adoption_Planning_v1.txt | Desktop |

### Files Updated (2)

| Phase | File | Owner |
|-------|------|-------|
| 6 | ORC_Copilot_Instructions_v1.txt | Desktop |
| 6 | ORC_KB_Routing_Logic_v1.txt | Desktop |

### Files Archived (41)

| Agent | Files |
|-------|-------|
| NDS | 29 |
| CSO | 4 |
| UDM | 8 |

### Files Copied (14)

| Source | Destination |
|--------|-------------|
| CA REFERENCE_*.txt | base/shared/reference/ |

---

**Document Version:** 1.0  
**Created:** January 18, 2026  
**Total Estimated Effort:** 11 days
**Ready for Execution:** YES
