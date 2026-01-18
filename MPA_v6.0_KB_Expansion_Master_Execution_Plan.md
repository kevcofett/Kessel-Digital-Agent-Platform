# MPA v6.0 KB EXPANSION MASTER EXECUTION PLAN
## Comprehensive Decision Science & ML Enhancement
### Date: January 18, 2026
### Version: 1.0

---

## DOCUMENT CONTROL

| Property | Value |
|----------|-------|
| Document ID | MPA-EXEC-PLAN-20260118 |
| Status | ACTIVE |
| Owner | Kessel Digital |
| Review Date | January 25, 2026 |

---

## SECTION 1: EXECUTIVE SUMMARY

### Objective
Create 138 new KB files to transform MPA into a state-of-the-art decision science platform with comprehensive capabilities across unstructured data mining, next-dollar-spend optimization, MMM/MTA, incrementality testing, contact stream optimization, identity resolution, and ML-driven analysis.

### Target State
- **Current KB Files:** 72
- **New KB Files:** 138
- **Total Target:** 210 KB documents
- **New Agents:** 3 (UDM, NDS, CSO)

### Execution Model
- **Claude.ai:** Foundation files, novel architecture, cross-agent coordination (25-30 files)
- **VS Code:** Pattern-based, parallelizable batch creation (108-113 files)

---

## SECTION 2: MANDATORY COMPLIANCE REQUIREMENTS

### 2.1 Six-Rule Compliance Framework

ALL documents MUST pass the following 6-rule compliance check before commit:

```
RULE 1 - ALL-CAPS HEADERS
- Section headers must be ALL CAPS
- No mixed case in headers
- Example: SECTION 1 - OVERVIEW (correct)
- Example: Section 1 - Overview (WRONG)

RULE 2 - HYPHENS ONLY FOR LISTS
- Use hyphens (-) for all list items
- No bullets, asterisks, or numbers for unordered lists
- Example: - Item one (correct)
- Example: • Item one (WRONG)
- Example: * Item one (WRONG)

RULE 3 - ASCII CHARACTERS ONLY
- No unicode characters
- No smart quotes (" " ' ')
- No em-dashes (—)
- No special symbols (©, ®, ™, →, etc.)
- Use straight quotes (" ')
- Use double hyphens (--) for em-dash effect

RULE 4 - NO VISUAL DEPENDENCIES
- No tables (use structured text instead)
- No images or diagrams
- No embedded objects
- Content must be readable as plain text

RULE 5 - MANDATORY LANGUAGE PATTERNS
- Use declarative statements
- Avoid passive voice where possible
- Include actionable guidance
- Define all acronyms on first use

RULE 6 - PROFESSIONAL TONE
- No casual language
- No humor or colloquialisms
- Consistent terminology throughout
- Clear, precise, unambiguous statements
```

### 2.2 Platform Compatibility Requirements

ALL documents MUST be compatible with:

#### COPILOT STUDIO
- Core instructions: 7,500-7,999 characters EXACTLY
- KB documents: Under 36,000 characters (split if larger)
- Plain text format only
- No markdown rendering dependencies

#### AZURE OPENAI
- UTF-8 encoding
- No special tokens or control characters
- Compatible with embedding models

#### POWER AUTOMATE
- Variable names: Alphanumeric + underscore only
- No spaces in identifiers
- CamelCase or snake_case consistently

#### POWER APPS
- Field names: Under 64 characters
- No reserved keywords
- Compatible with Dataverse schema

#### DATAVERSE
- Table names: mpa_ prefix
- Column names: mpa_ prefix
- Logical names: Lowercase, underscores
- Schema version tracking

#### SHAREPOINT
- Document size: Under 7MB
- Page count: Under 20 pages
- Word count: Under 15,000 words per document
- No embedded macros or scripts

### 2.3 Naming Convention Standards

#### KB File Naming
```
{AGENT}_{KB}_{Topic}_{Subtopic}_v{Major}.{Minor}.txt

Examples:
- AUD_KB_Identity_Graph_Algorithms_v1.0.txt
- NDS_KB_Marginal_Return_Estimation_v1.0.txt
- CSO_KB_Journey_State_Models_v1.0.txt
```

#### Agent Codes
- ANL: Analyst Agent
- AUD: Audience Agent
- CHA: Channel Agent
- CSO: Contact Stream Optimization Agent (NEW)
- DOC: Document Agent
- NDS: Next Dollar Spend Agent (NEW)
- ORC: Orchestrator Agent
- PRF: Performance Agent
- SPO: Spend Optimization Agent
- SYS: System/Shared
- UDM: Unstructured Data Mining Agent (NEW)

#### Version Convention
- v1.0: Initial release
- v1.1, v1.2: Minor updates (content refinement)
- v2.0: Major revision (structural changes)

### 2.4 Document Header Template

ALL KB files MUST begin with this header:

```
{AGENT} KNOWLEDGE BASE - {TOPIC} v{VERSION}
VERSION: {Major}.{Minor}
STATUS: Production Ready
COMPLIANCE: 6-Rule Compliant
PLATFORM: Copilot Studio / Azure / Power Platform
LAST UPDATED: {YYYY-MM-DD}

================================================================================
SECTION 1 - {FIRST SECTION TITLE}
================================================================================

{Content}
```

### 2.5 Document Footer Template

ALL KB files MUST end with:

```
================================================================================
END OF DOCUMENT
================================================================================
```

---

## SECTION 3: REPOSITORY STRUCTURE

### 3.1 Directory Structure

```
/release/v6.0/
├── agents/
│   ├── anl/
│   │   ├── instructions/
│   │   │   └── ANL_Copilot_Instructions_v1.0.txt
│   │   ├── kb/
│   │   │   ├── ANL_KB_Analytics_Engine_v1.0.txt
│   │   │   ├── ANL_KB_Bayesian_MMM_v1.0.txt
│   │   │   └── ... (all ANL KB files)
│   │   ├── flows/
│   │   └── tests/
│   ├── aud/
│   │   ├── instructions/
│   │   ├── kb/
│   │   ├── flows/
│   │   └── tests/
│   ├── cha/
│   ├── cso/  (NEW)
│   │   ├── instructions/
│   │   │   └── CSO_Copilot_Instructions_v1.0.txt
│   │   ├── kb/
│   │   │   ├── CSO_KB_Journey_State_Models_v1.0.txt
│   │   │   └── ... (all CSO KB files)
│   │   ├── flows/
│   │   └── tests/
│   ├── doc/
│   ├── nds/  (NEW)
│   │   ├── instructions/
│   │   │   └── NDS_Copilot_Instructions_v1.0.txt
│   │   ├── kb/
│   │   │   ├── NDS_KB_Marginal_Return_Estimation_v1.0.txt
│   │   │   └── ... (all NDS KB files)
│   │   ├── flows/
│   │   └── tests/
│   ├── orc/
│   ├── prf/
│   ├── spo/
│   └── udm/  (NEW)
│       ├── instructions/
│       │   └── UDM_Copilot_Instructions_v1.0.txt
│       ├── kb/
│       │   ├── UDM_KB_Text_Mining_Methods_v1.0.txt
│       │   └── ... (all UDM KB files)
│       ├── flows/
│       └── tests/
├── shared/
│   ├── SHARED_Formula_Reference_v1.0.txt
│   ├── SHARED_Glossary_v1.0.txt
│   └── ... (shared resources)
├── system/  (NEW)
│   ├── SYS_KB_Model_Orchestration_v1.0.txt
│   ├── SYS_KB_Source_of_Truth_v1.0.txt
│   └── ... (system KB files)
├── verticals/
│   └── ... (vertical overlays)
├── platform/
│   └── seed/
│       └── ... (seed data CSVs)
└── docs/
    └── ... (documentation)
```

### 3.2 Git Workflow

#### Branches
- `feature/multi-agent-architecture`: Active development branch
- `deploy/mastercard`: Mastercard production
- `deploy/personal`: Aragorn AI production

#### Commit Convention
```
feat: Add {description}
fix: Correct {description}
docs: Update {description}
refactor: Restructure {description}
```

#### Commit Frequency
- Commit after EACH file creation
- Push to remote after EACH batch of 5 files
- Merge to deploy branches after each phase completion

---

## SECTION 4: EXECUTION ASSIGNMENTS

### 4.1 Claude.ai Assignments (25 files)

#### Phase 1A: Identity Foundation (4 files)
| File | Priority | Est. Chars |
|------|----------|------------|
| AUD_KB_Identity_Graph_Algorithms_v1.0.txt | CRITICAL | 14,000 |
| AUD_KB_Card_Portfolio_Resolution_v1.0.txt | CRITICAL | 13,000 |
| AUD_KB_Household_Resolution_v1.0.txt | CRITICAL | 12,000 |
| AUD_KB_Entity_Resolution_v1.0.txt | HIGH | 13,000 |

#### Phase 1B: NDS Agent Core (5 files)
| File | Priority | Est. Chars |
|------|----------|------------|
| NDS_KB_Marginal_Return_Estimation_v1.0.txt | CRITICAL | 14,000 |
| NDS_KB_Spend_NoSpend_Logic_v1.0.txt | CRITICAL | 12,000 |
| NDS_KB_Multi_Input_Integration_v1.0.txt | CRITICAL | 13,000 |
| NDS_KB_Budget_Response_Functions_v1.0.txt | HIGH | 12,000 |
| NDS_KB_Risk_Adjusted_Allocation_v1.0.txt | HIGH | 11,000 |

#### Phase 1C: CSO Agent Core (5 files)
| File | Priority | Est. Chars |
|------|----------|------------|
| CSO_KB_Journey_State_Models_v1.0.txt | CRITICAL | 14,000 |
| CSO_KB_Next_Best_Action_v1.0.txt | CRITICAL | 14,000 |
| CSO_KB_Reinforcement_Learning_Marketing_v1.0.txt | HIGH | 13,000 |
| CSO_KB_Sequence_Timing_Optimization_v1.0.txt | HIGH | 12,000 |
| CSO_KB_Frequency_Fatigue_Management_v1.0.txt | HIGH | 11,000 |

#### Phase 1D: System Architecture (7 files)
| File | Priority | Est. Chars |
|------|----------|------------|
| SYS_KB_Model_Orchestration_v1.0.txt | CRITICAL | 13,000 |
| SYS_KB_Source_of_Truth_v1.0.txt | CRITICAL | 11,000 |
| SYS_KB_Agent_Communication_v1.0.txt | HIGH | 10,000 |
| SYS_KB_Decision_Conflict_Resolution_v1.0.txt | HIGH | 10,000 |
| SYS_KB_Continuous_Learning_v1.0.txt | HIGH | 11,000 |
| SYS_KB_Missing_Model_Classes_v1.0.txt | MEDIUM | 12,000 |
| SYS_KB_Implementation_Roadmap_v1.0.txt | MEDIUM | 10,000 |

#### Phase 1E: Agent Instructions (4 files)
| File | Priority | Est. Chars |
|------|----------|------------|
| NDS_Copilot_Instructions_v1.0.txt | CRITICAL | 7,800 |
| CSO_Copilot_Instructions_v1.0.txt | CRITICAL | 7,800 |
| UDM_Copilot_Instructions_v1.0.txt | CRITICAL | 7,800 |
| SYS_Routing_Extensions_v1.0.txt | HIGH | 5,000 |

### 4.2 VS Code Assignments (113 files)

#### Batch A: Unstructured Data Mining (8 files)
| File | Template From |
|------|---------------|
| UDM_KB_Text_Mining_Methods_v1.0.txt | Blueprint spec |
| UDM_KB_Creative_Analysis_v1.0.txt | Blueprint spec |
| UDM_KB_Social_Web_Mining_v1.0.txt | Blueprint spec |
| UDM_KB_Log_Event_Analysis_v1.0.txt | Blueprint spec |
| UDM_KB_Feature_Engineering_Unstructured_v1.0.txt | Blueprint spec |
| UDM_KB_Anomaly_Pattern_Detection_v1.0.txt | Blueprint spec |
| UDM_KB_NLP_Marketing_Applications_v1.0.txt | Blueprint spec |
| UDM_KB_Multimodal_Integration_v1.0.txt | Blueprint spec |

#### Batch B: NDS Agent Extended (5 files)
| File | Template From |
|------|---------------|
| NDS_KB_Real_Time_Optimization_v1.0.txt | Blueprint spec |
| NDS_KB_Simulation_WhatIf_v1.0.txt | Blueprint spec |
| NDS_KB_Audience_Level_Allocation_v1.0.txt | Blueprint spec |
| NDS_KB_Channel_Tactic_Allocation_v1.0.txt | Blueprint spec |
| NDS_KB_Always_On_Optimization_v1.0.txt | Blueprint spec |

#### Batch C: CSO Agent Extended (3 files)
| File | Template From |
|------|---------------|
| CSO_KB_Channel_Creative_Mix_v1.0.txt | Blueprint spec |
| CSO_KB_Constraint_Handling_v1.0.txt | Blueprint spec |
| CSO_KB_Journey_Orchestration_v1.0.txt | Blueprint spec |

#### Batch D: MMM/MMO Enhancement (6 files)
| File | Template From |
|------|---------------|
| ANL_KB_Bayesian_MMM_v1.0.txt | Blueprint spec |
| ANL_KB_Campaign_Level_MMM_v1.0.txt | Blueprint spec |
| ANL_KB_GeoLift_Augmented_MMM_v1.0.txt | Blueprint spec |
| ANL_KB_MMM_External_Factors_v1.0.txt | Blueprint spec |
| ANL_KB_MMM_Output_Utilization_v1.0.txt | Blueprint spec |
| ANL_KB_MMM_Data_Requirements_v1.0.txt | Blueprint spec |

#### Batch E: MTA/Attribution (5 files)
| File | Template From |
|------|---------------|
| PRF_KB_Shapley_Attribution_v1.0.txt | Blueprint spec |
| PRF_KB_Sequence_Attribution_Models_v1.0.txt | Blueprint spec |
| PRF_KB_Path_Based_Attribution_v1.0.txt | Blueprint spec |
| PRF_KB_Attribution_Validation_v1.0.txt | Blueprint spec |
| PRF_KB_Attribution_MTA_MMM_Reconciliation_v1.0.txt | Blueprint spec |

#### Batch F: Incrementality (6 files)
| File | Template From |
|------|---------------|
| PRF_KB_Geo_Test_Design_v1.0.txt | Blueprint spec |
| PRF_KB_Audience_Split_Tests_v1.0.txt | Blueprint spec |
| PRF_KB_Always_On_Experiments_v1.0.txt | Blueprint spec |
| PRF_KB_Holdout_Design_v1.0.txt | Blueprint spec |
| PRF_KB_Lift_Operationalization_v1.0.txt | Blueprint spec |
| PRF_KB_Advanced_Experiment_Designs_v1.0.txt | Blueprint spec |

#### Batch G: View/Click Tracking (4 files)
| File | Template From |
|------|---------------|
| PRF_KB_View_Click_Measurement_v1.0.txt | Blueprint spec |
| PRF_KB_View_Through_Bias_Correction_v1.0.txt | Blueprint spec |
| PRF_KB_Multi_Impression_Sequence_v1.0.txt | Blueprint spec |
| PRF_KB_Signal_Integration_Framework_v1.0.txt | Blueprint spec |

#### Batch H: Fraud & Viewability (6 files)
| File | Template From |
|------|---------------|
| PRF_KB_Fraud_Detection_Methods_v1.0.txt | Advanced plan spec |
| PRF_KB_Viewability_Deep_Dive_v1.0.txt | Advanced plan spec |
| PRF_KB_MFA_Detection_v1.0.txt | Advanced plan spec |
| PRF_KB_Attention_Measurement_Scientific_v1.0.txt | Advanced plan spec |
| SPO_KB_Verification_ROI_Analysis_v1.0.txt | Advanced plan spec |
| SPO_KB_Quality_Score_Framework_v1.0.txt | Advanced plan spec |

#### Batch I: Cross-Channel Measurement (6 files)
| File | Template From |
|------|---------------|
| PRF_KB_Unified_Measurement_Framework_v1.0.txt | Advanced plan spec |
| PRF_KB_Cross_Platform_Deduplication_v1.0.txt | Advanced plan spec |
| PRF_KB_Incrementality_Testing_Advanced_v1.0.txt | Advanced plan spec |
| PRF_KB_Multi_Touch_Attribution_Scientific_v1.0.txt | Advanced plan spec |
| ANL_KB_Cross_Channel_Optimization_v1.0.txt | Advanced plan spec |
| ANL_KB_Econometric_Modeling_v1.0.txt | Advanced plan spec |

#### Batch J: Identity & Matching (4 files)
| File | Template From |
|------|---------------|
| AUD_KB_Taxonomy_Management_v1.0.txt | Advanced plan spec |
| AUD_KB_Data_Onboarding_Scientific_v1.0.txt | Advanced plan spec |
| AUD_KB_Privacy_Preserving_Matching_v1.0.txt | Advanced plan spec |
| AUD_KB_B2B_Identity_Resolution_v1.0.txt | Advanced plan spec |

#### Batch K: ML Propensity & Scoring (14 files)
| File | Template From |
|------|---------------|
| AUD_KB_ML_Propensity_Models_v1.0.txt | Advanced plan spec |
| AUD_KB_Churn_Prediction_ML_v1.0.txt | Advanced plan spec |
| AUD_KB_RFM_Advanced_Analytics_v1.0.txt | Advanced plan spec |
| AUD_KB_Intent_Modeling_ML_v1.0.txt | Advanced plan spec |
| ANL_KB_Causal_ML_Methods_v1.0.txt | Advanced plan spec |
| ANL_KB_Bayesian_Methods_v1.0.txt | Advanced plan spec |
| ANL_KB_Deep_Learning_Marketing_v1.0.txt | Advanced plan spec |
| ANL_KB_Optimization_Algorithms_v1.0.txt | Advanced plan spec |
| ANL_KB_Simulation_Methods_v1.0.txt | Advanced plan spec |
| ANL_KB_Financial_Modeling_Marketing_v1.0.txt | Advanced plan spec |
| ANL_KB_Experimental_Design_v1.0.txt | Advanced plan spec |
| PRF_KB_Anomaly_Detection_ML_v1.0.txt | Advanced plan spec |
| PRF_KB_Forecasting_ML_v1.0.txt | Advanced plan spec |
| PRF_KB_Model_Validation_Framework_v1.0.txt | Advanced plan spec |

#### Batch L: SPO Enhancement (4 files)
| File | Template From |
|------|---------------|
| SPO_KB_Margin_Analysis_v1.0.txt | Original plan spec |
| SPO_KB_Working_Media_v1.0.txt | Original plan spec |
| SPO_KB_Hidden_Fees_v1.0.txt | Original plan spec |
| SPO_KB_Cost_Benchmarks_v1.0.txt | Original plan spec |

#### Batch M: Financial Analysis (4 files)
| File | Template From |
|------|---------------|
| ANL_KB_PL_Impact_Modeling_v1.0.txt | Original plan spec |
| ANL_KB_Customer_Economics_v1.0.txt | Original plan spec |
| ANL_KB_Break_Even_Analysis_v1.0.txt | Original plan spec |
| ANL_KB_Marketing_Finance_Integration_v1.0.txt | Original plan spec |

#### Batch N: Existing File Updates (38 files)
Update all existing v1 files to v1.0 naming convention and verify compliance:
- All ANL KB files (8)
- All AUD KB files (10)
- All CHA KB files (10)
- All DOC KB files (5)
- All ORC KB files (4)
- All PRF KB files (9)
- All SPO KB files (7)
- All Shared files (2)
- All Vertical files (12)

---

## SECTION 5: VALIDATION PROCEDURES

### 5.1 Pre-Commit Checklist

Before committing ANY file, verify:

```
[ ] File follows naming convention: {AGENT}_KB_{Topic}_v{X}.{Y}.txt
[ ] Header includes all required fields (VERSION, STATUS, COMPLIANCE, PLATFORM, LAST UPDATED)
[ ] All section headers are ALL CAPS
[ ] All lists use hyphens only
[ ] No unicode or special characters
[ ] No tables or visual elements
[ ] Character count within limits:
    - Instructions: 7,500-7,999 characters
    - KB files: Under 36,000 characters
[ ] Footer present: END OF DOCUMENT
[ ] Content is substantive and actionable
[ ] All acronyms defined on first use
```

### 5.2 Validation Script

Run this validation before each commit:

```bash
#!/bin/bash
# validate_kb_file.sh

FILE=$1

# Check file exists
if [ ! -f "$FILE" ]; then
    echo "ERROR: File not found: $FILE"
    exit 1
fi

# Check character count
CHARS=$(wc -c < "$FILE")
if [ $CHARS -gt 36000 ]; then
    echo "ERROR: File exceeds 36,000 characters: $CHARS"
    exit 1
fi

# Check for unicode characters
if grep -P '[^\x00-\x7F]' "$FILE" > /dev/null; then
    echo "ERROR: File contains non-ASCII characters"
    grep -P '[^\x00-\x7F]' "$FILE"
    exit 1
fi

# Check for bullets
if grep -E '^[•*]' "$FILE" > /dev/null; then
    echo "ERROR: File contains bullet points (use hyphens)"
    exit 1
fi

# Check header
if ! head -1 "$FILE" | grep -E '^[A-Z]{3}_' > /dev/null; then
    echo "WARNING: File may not follow naming convention in header"
fi

# Check footer
if ! tail -1 "$FILE" | grep -q "END OF DOCUMENT"; then
    echo "ERROR: Missing END OF DOCUMENT footer"
    exit 1
fi

echo "PASSED: $FILE ($CHARS characters)"
```

### 5.3 Batch Validation

After each batch, run comprehensive validation:

```bash
#!/bin/bash
# validate_all_kb.sh

ERRORS=0
for file in $(find release/v6.0 -name "*.txt" -type f); do
    if ! ./validate_kb_file.sh "$file"; then
        ERRORS=$((ERRORS + 1))
    fi
done

echo "Validation complete. Errors: $ERRORS"
```

---

## SECTION 6: GIT OPERATIONS PROTOCOL

### 6.1 Immediate Commit After Creation

```bash
# After creating each file:
git add release/v6.0/agents/{agent}/kb/{filename}
git commit -m "feat: Add {filename} - {brief description}"

# After every 5 files:
git push origin feature/multi-agent-architecture
```

### 6.2 Phase Completion Merge

```bash
# After completing each phase:
git checkout deploy/mastercard
git merge feature/multi-agent-architecture -m "Merge: Phase {N} - {description}"
git push origin deploy/mastercard

git checkout deploy/personal
git merge feature/multi-agent-architecture -m "Merge: Phase {N} - {description}"
git push origin deploy/personal

git checkout feature/multi-agent-architecture
```

### 6.3 Conflict Resolution

If conflicts occur:
1. STOP immediately
2. Document the conflict
3. Resolve manually with content review
4. Commit resolution with detailed message
5. Continue workflow

---

## SECTION 7: PROGRESS TRACKING

### 7.1 Status Indicators

- [ ] NOT STARTED
- [~] IN PROGRESS
- [x] COMPLETED
- [!] BLOCKED

### 7.2 Progress Dashboard

Update after each session:

```
CLAUDE.AI PROGRESS
==================
Phase 1A (Identity): [ ] [ ] [ ] [ ]
Phase 1B (NDS Core): [ ] [ ] [ ] [ ] [ ]
Phase 1C (CSO Core): [ ] [ ] [ ] [ ] [ ]
Phase 1D (System):   [ ] [ ] [ ] [ ] [ ] [ ] [ ]
Phase 1E (Instructions): [ ] [ ] [ ] [ ]

VS CODE PROGRESS
================
Batch A (UDM):       [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]
Batch B (NDS Ext):   [ ] [ ] [ ] [ ] [ ]
Batch C (CSO Ext):   [ ] [ ] [ ]
Batch D (MMM):       [ ] [ ] [ ] [ ] [ ] [ ]
Batch E (MTA):       [ ] [ ] [ ] [ ] [ ]
Batch F (Incr):      [ ] [ ] [ ] [ ] [ ] [ ]
Batch G (View/Click):[ ] [ ] [ ] [ ]
Batch H (Fraud):     [ ] [ ] [ ] [ ] [ ] [ ]
Batch I (Cross-Ch):  [ ] [ ] [ ] [ ] [ ] [ ]
Batch J (Identity):  [ ] [ ] [ ] [ ]
Batch K (ML):        [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]
Batch L (SPO):       [ ] [ ] [ ] [ ]
Batch M (Financial): [ ] [ ] [ ] [ ]
Batch N (Updates):   [38 files to update]
```

---

## SECTION 8: HANDOFF PROCEDURES

### 8.1 Claude.ai to VS Code Handoff

When Claude.ai completes a phase:
1. Commit and push all files
2. Update progress dashboard
3. Create continuation prompt for VS Code
4. Document any blockers or dependencies

### 8.2 VS Code to Claude.ai Handoff

When VS Code completes a batch:
1. Commit and push all files
2. Run validation script on all new files
3. Update progress dashboard
4. Flag any files needing Claude.ai review

### 8.3 Session Recovery

If a session is interrupted:
1. Check git status for uncommitted changes
2. Commit any complete files
3. Document incomplete work
4. Resume from last committed checkpoint

---

## SECTION 9: QUALITY ASSURANCE

### 9.1 Review Checklist

For each completed file:

```
CONTENT QUALITY
[ ] Substantive content (not placeholder)
[ ] Accurate technical information
[ ] Actionable guidance included
[ ] Appropriate depth for audience
[ ] No contradictions with other KB files

FORMAT COMPLIANCE
[ ] 6-rule framework passed
[ ] Platform compatibility verified
[ ] Character limits respected
[ ] Naming convention followed

INTEGRATION
[ ] Cross-references to related KB files
[ ] Agent interface points documented
[ ] Data requirements specified
[ ] Methodological options with pros/cons
```

### 9.2 Peer Review

- Claude.ai reviews VS Code batch outputs
- Focus on scientific accuracy and depth
- Flag files needing revision

---

## SECTION 10: EMERGENCY PROCEDURES

### 10.1 Data Loss Prevention

- Commit after EVERY file creation
- Push after EVERY 5 files
- Never leave uncommitted work at session end
- Use git stash for work-in-progress if needed

### 10.2 Rollback Procedure

If critical issues discovered:

```bash
# Identify last good commit
git log --oneline -20

# Rollback to specific commit
git reset --hard {commit_hash}

# Force push if needed (use with caution)
git push origin feature/multi-agent-architecture --force
```

### 10.3 Escalation

If blockers encountered:
1. Document the issue in detail
2. Create GitHub issue if persistent
3. Continue with other files if possible
4. Flag for manual resolution

---

## APPENDIX A: FILE COUNT SUMMARY

| Category | Claude.ai | VS Code | Total |
|----------|-----------|---------|-------|
| Identity Foundation | 4 | 4 | 8 |
| NDS Agent | 5 | 5 | 10 |
| CSO Agent | 5 | 3 | 8 |
| System Architecture | 7 | 0 | 7 |
| Agent Instructions | 4 | 0 | 4 |
| UDM Agent | 0 | 8 | 8 |
| MMM/MMO | 0 | 6 | 6 |
| MTA/Attribution | 0 | 5 | 5 |
| Incrementality | 0 | 6 | 6 |
| View/Click Tracking | 0 | 4 | 4 |
| Fraud/Viewability | 0 | 6 | 6 |
| Cross-Channel | 0 | 6 | 6 |
| Identity/Matching | 0 | 4 | 4 |
| ML Propensity | 0 | 14 | 14 |
| SPO Enhancement | 0 | 4 | 4 |
| Financial Analysis | 0 | 4 | 4 |
| Existing Updates | 0 | 38 | 38 |
| **TOTAL** | **25** | **113** | **138** |

---

## APPENDIX B: TIMELINE ESTIMATE

| Phase | Owner | Duration | Files |
|-------|-------|----------|-------|
| Phase 1A | Claude.ai | Day 1 | 4 |
| Phase 1B | Claude.ai | Day 1-2 | 5 |
| Phase 1C | Claude.ai | Day 2 | 5 |
| Phase 1D | Claude.ai | Day 2-3 | 7 |
| Phase 1E | Claude.ai | Day 3 | 4 |
| Batch A-D | VS Code | Day 1-2 | 22 |
| Batch E-H | VS Code | Day 2-3 | 21 |
| Batch I-K | VS Code | Day 3-4 | 24 |
| Batch L-N | VS Code | Day 4-5 | 46 |

**Estimated Total Duration:** 5 working days (parallel execution)

---

*Document Version: 1.0*
*Created: January 18, 2026*
*Status: ACTIVE*
