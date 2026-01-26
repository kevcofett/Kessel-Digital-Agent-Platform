# MPA v6.0 KB EXPANSION EXECUTION PLAN
## Master Coordination Document
### Date: January 18, 2026
### Version: 1.0

---

## EXECUTIVE SUMMARY

This document defines the complete execution plan for expanding MPA v6.0 from 72 KB documents to 168+ KB documents. Work is split between Claude.ai (complex architecture) and VS Code (pattern-based batch creation).

**Total New Files:** 96 KB documents
**Timeline:** 10-day sprint
**Quality Standard:** 100% 6-Rule Compliance + Microsoft Stack Compatibility

---

## SECTION 1: COMPLIANCE REQUIREMENTS

### 1.1 Six-Rule Compliance Framework (MANDATORY)

ALL documents must pass these rules before commit:

```
RULE 1: ALL-CAPS HEADERS
- Section headers must be ALL CAPS
- Example: SECTION 1 - CORE CONCEPTS
- NO title case, NO sentence case for headers

RULE 2: HYPHENS ONLY FOR LISTS
- Use hyphens (-) for all list items
- NO bullets, NO asterisks, NO numbers for lists
- Exception: Numbered steps in procedures use numbers

RULE 3: ASCII CHARACTERS ONLY
- NO unicode characters
- NO smart quotes (use straight quotes)
- NO em-dashes (use double hyphens --)
- NO special symbols

RULE 4: ZERO VISUAL DEPENDENCIES
- NO tables (use structured text)
- NO images or diagrams
- NO formatting that requires rendering
- Must be readable as plain text

RULE 5: MANDATORY DOCUMENT HEADER
Every KB file must start with:
[AGENT]_KB_[Topic]_v[Version].txt
VERSION: [X.Y]
STATUS: [Production Ready | Draft | Review]
COMPLIANCE: 6-Rule Compliant

RULE 6: PROFESSIONAL TONE
- NO emoji
- NO casual language
- NO first person (I, we, our)
- Factual, instructional tone
```

### 1.2 Microsoft Stack Compatibility Requirements

ALL documents must be compatible with:

```
COPILOT STUDIO REQUIREMENTS
- Character limit: 36,000 characters max per KB file
- Plain text format only
- No markdown rendering dependencies
- UTF-8 encoding

AZURE REQUIREMENTS
- File names: No spaces, use underscores
- Max filename length: 255 characters
- Case-sensitive naming consistency

POWER AUTOMATE REQUIREMENTS
- JSON-safe content (escape special characters if referenced)
- No circular references in content
- Clear section delineation for parsing

POWER APPS REQUIREMENTS
- Text must be readable without formatting
- Consistent structure for programmatic access

DATAVERSE REQUIREMENTS
- Content compatible with multi-line text fields
- Max field size awareness (1MB per record)

SHAREPOINT REQUIREMENTS
- Max file size: 7MB (target: under 100KB per file)
- Max 20 pages equivalent per document
- Compatible with SharePoint search indexing
```

### 1.3 Naming Convention Standard

```
FORMAT: [AGENT]_KB_[Topic]_v[Major].[Minor].txt

AGENT CODES:
- ANL = Analyst Agent
- AUD = Audience Agent
- CHA = Channel Agent
- CSO = Contact Stream Optimizer (NEW)
- DOC = Document Agent
- NDS = Next Dollar Spend (NEW)
- ORC = Orchestrator Agent
- PRF = Performance Agent
- SPO = Spend Optimization Agent
- SYS = System/Shared
- UDM = Unstructured Data Mining (NEW)

EXAMPLES:
- AUD_KB_Identity_Graph_Algorithms_v1.0.txt
- NDS_KB_Marginal_Return_Estimation_v1.0.txt
- CSO_KB_Journey_State_Models_v1.0.txt

VERSION RULES:
- v1.0 = Initial release
- v1.1 = Minor update (fixes, clarifications)
- v2.0 = Major update (new sections, restructure)
```

### 1.4 Document Structure Template

```
[AGENT]_KB_[Topic]_v1.0.txt
VERSION: 1.0
STATUS: Production Ready
COMPLIANCE: 6-Rule Compliant
LAST UPDATED: [YYYY-MM-DD]
CHARACTER COUNT: [XXXX]

================================================================================
SECTION 1 - [SECTION NAME IN ALL CAPS]
================================================================================

[Content with hyphens for lists]

SUBSECTION NAME

[Content continues...]

================================================================================
SECTION 2 - [NEXT SECTION]
================================================================================

[Content...]

================================================================================
END OF DOCUMENT
================================================================================
```

---

## SECTION 2: WORK DISTRIBUTION

### 2.1 Claude.ai Responsibilities (25 Files)

**Focus:** Complex architecture, novel systems, cross-agent coordination

#### Phase 1A - Identity Foundation (3 files)
```
1. AUD_KB_Identity_Graph_Algorithms_v1.0.txt
   - Graph matching algorithms
   - Record linkage pipelines
   - ML matching methods
   - Scaling considerations

2. AUD_KB_Card_Portfolio_Resolution_v1.0.txt
   - Multi-PAN linkage
   - Cardholder matching
   - Wallet share calculation
   - Mastercard-specific patterns

3. AUD_KB_Household_Resolution_v1.0.txt
   - Address standardization
   - Device clustering
   - Composition inference
   - Provider integration
```

#### Phase 1B - NDS Agent Core (5 files)
```
4. NDS_KB_Marginal_Return_Estimation_v1.0.txt
   - Hill function modeling
   - Diminishing returns curves
   - Uncertainty quantification

5. NDS_KB_Spend_NoSpend_Logic_v1.0.txt
   - Decision framework
   - Saturation detection
   - Quality thresholds

6. NDS_KB_Multi_Input_Integration_v1.0.txt
   - MMM + MTA + Incrementality fusion
   - Source prioritization
   - Conflict resolution

7. NDS_KB_Risk_Adjusted_Allocation_v1.0.txt
   - Portfolio theory for marketing
   - Risk metrics
   - Diversification strategies

8. NDS_KB_Budget_Response_Functions_v1.0.txt
   - Channel response curves
   - Cross-channel interactions
   - Temporal dynamics
```

#### Phase 1C - CSO Agent Core (5 files)
```
9. CSO_KB_Journey_State_Models_v1.0.txt
    - Markov models
    - Sequence models (LSTM, Transformer)
    - State representation

10. CSO_KB_Next_Best_Action_v1.0.txt
    - NBA framework
    - RL methods (Q-learning, bandits)
    - Constraint handling

11. CSO_KB_Sequence_Timing_Optimization_v1.0.txt
    - Message sequencing
    - Send time optimization
    - Temporal modeling

12. CSO_KB_Frequency_Fatigue_Management_v1.0.txt
    - Optimal frequency curves
    - Fatigue modeling
    - Suppression rules

13. CSO_KB_Reinforcement_Learning_Marketing_v1.0.txt
    - RL formulation
    - Algorithm selection
    - Safe deployment
```

#### Phase 1D - System Architecture (5 files)
```
14. SYS_KB_Model_Orchestration_v1.0.txt
    - Shared vs embedded models
    - Data flow patterns
    - Model versioning

15. SYS_KB_Source_of_Truth_v1.0.txt
    - Authoritative sources
    - Decision horizon views
    - Governance

16. SYS_KB_Agent_Communication_v1.0.txt
    - Communication patterns
    - Message contracts
    - Error handling

17. SYS_KB_Decision_Conflict_Resolution_v1.0.txt
    - Conflict types
    - Resolution strategies
    - Escalation paths

18. SYS_KB_Continuous_Learning_v1.0.txt
    - Feedback loops
    - Retraining triggers
    - Drift detection
```

#### Phase 1E - Critical ML Files (7 files)
```
19. ANL_KB_Causal_ML_Methods_v1.0.txt
    - CATE estimation
    - Meta-learners
    - Causal forests
    - Uplift modeling

20. ANL_KB_Bayesian_Methods_v1.0.txt
    - Bayesian A/B testing
    - Bayesian MMM
    - MCMC methods

21. PRF_KB_Fraud_Detection_Methods_v1.0.txt
    - GIVT/SIVT taxonomy
    - Detection algorithms
    - Channel-specific patterns

22. PRF_KB_Unified_Measurement_Framework_v1.0.txt
    - MTA + MMM + Incrementality
    - Triangulation methodology
    - Governance

23. PRF_KB_Incrementality_Testing_Advanced_v1.0.txt
    - Synthetic control
    - Matched markets
    - Power analysis

24. AUD_KB_ML_Propensity_Models_v1.0.txt
    - XGBoost, LightGBM, neural nets
    - Feature engineering
    - Calibration

25. AUD_KB_Entity_Resolution_v1.0.txt
    - Blocking strategies
    - Classification
    - Clustering
```

### 2.2 VS Code Responsibilities (71 Files)

**Focus:** Pattern-based creation, batch processing, template replication

#### Batch 1 - Unstructured Data Mining (8 files)
```
UDM_KB_Text_Mining_Methods_v1.0.txt
UDM_KB_Creative_Analysis_v1.0.txt
UDM_KB_Social_Web_Mining_v1.0.txt
UDM_KB_Log_Event_Analysis_v1.0.txt
UDM_KB_Feature_Engineering_Unstructured_v1.0.txt
UDM_KB_Anomaly_Pattern_Detection_v1.0.txt
UDM_KB_NLP_Marketing_Applications_v1.0.txt
UDM_KB_Multimodal_Integration_v1.0.txt
```

#### Batch 2 - MMM Enhancement (5 files)
```
ANL_KB_Bayesian_MMM_v1.0.txt
ANL_KB_Campaign_Level_MMM_v1.0.txt
ANL_KB_GeoLift_Augmented_MMM_v1.0.txt
ANL_KB_MMM_External_Factors_v1.0.txt
ANL_KB_MMM_Output_Utilization_v1.0.txt
```

#### Batch 3 - MTA/Attribution (5 files)
```
PRF_KB_Shapley_Attribution_v1.0.txt
PRF_KB_Sequence_Attribution_Models_v1.0.txt
PRF_KB_Path_Based_Attribution_v1.0.txt
PRF_KB_Attribution_Validation_v1.0.txt
PRF_KB_Attribution_MTA_MMM_Reconciliation_v1.0.txt
```

#### Batch 4 - Incrementality (5 files)
```
PRF_KB_Geo_Test_Design_v1.0.txt
PRF_KB_Audience_Split_Tests_v1.0.txt
PRF_KB_Always_On_Experiments_v1.0.txt
PRF_KB_Holdout_Design_v1.0.txt
PRF_KB_Lift_Operationalization_v1.0.txt
```

#### Batch 5 - View/Click Tracking (4 files)
```
PRF_KB_View_Click_Measurement_v1.0.txt
PRF_KB_View_Through_Bias_Correction_v1.0.txt
PRF_KB_Multi_Impression_Sequence_v1.0.txt
PRF_KB_Signal_Integration_Framework_v1.0.txt
```

#### Batch 6 - NDS Supporting (5 files)
```
NDS_KB_Real_Time_Optimization_v1.0.txt
NDS_KB_Simulation_WhatIf_v1.0.txt
NDS_KB_Audience_Level_Allocation_v1.0.txt
NDS_KB_Channel_Tactic_Allocation_v1.0.txt
NDS_KB_Always_On_Optimization_v1.0.txt
```

#### Batch 7 - CSO Supporting (3 files)
```
CSO_KB_Channel_Creative_Mix_v1.0.txt
CSO_KB_Constraint_Handling_v1.0.txt
CSO_KB_Journey_Orchestration_v1.0.txt
```

#### Batch 8 - ML Scientific (13 files)
```
AUD_KB_Churn_Prediction_ML_v1.0.txt
AUD_KB_RFM_Advanced_Analytics_v1.0.txt
AUD_KB_Intent_Modeling_ML_v1.0.txt
AUD_KB_Taxonomy_Management_v1.0.txt
AUD_KB_Data_Onboarding_Scientific_v1.0.txt
AUD_KB_Privacy_Preserving_Matching_v1.0.txt
AUD_KB_B2B_Identity_Resolution_v1.0.txt
ANL_KB_Deep_Learning_Marketing_v1.0.txt
ANL_KB_Optimization_Algorithms_v1.0.txt
ANL_KB_Simulation_Methods_v1.0.txt
ANL_KB_Financial_Modeling_Marketing_v1.0.txt
ANL_KB_Experimental_Design_v1.0.txt
ANL_KB_Econometric_Modeling_v1.0.txt
```

#### Batch 9 - PRF Scientific (7 files)
```
PRF_KB_Viewability_Deep_Dive_v1.0.txt
PRF_KB_MFA_Detection_v1.0.txt
PRF_KB_Attention_Measurement_Scientific_v1.0.txt
PRF_KB_Multi_Touch_Attribution_Scientific_v1.0.txt
PRF_KB_Anomaly_Detection_ML_v1.0.txt
PRF_KB_Forecasting_ML_v1.0.txt
PRF_KB_Model_Validation_Framework_v1.0.txt
```

#### Batch 10 - SPO Enhancement (4 files)
```
SPO_KB_Margin_Analysis_v1.0.txt
SPO_KB_Working_Media_v1.0.txt
SPO_KB_Hidden_Fees_v1.0.txt
SPO_KB_Verification_ROI_Analysis_v1.0.txt
```

#### Batch 11 - Cross-Platform (4 files)
```
PRF_KB_Cross_Platform_Deduplication_v1.0.txt
PRF_KB_Advanced_Experiment_Designs_v1.0.txt
ANL_KB_Cross_Channel_Optimization_v1.0.txt
SPO_KB_Quality_Score_Framework_v1.0.txt
```

#### Batch 12 - System Supporting (2 files)
```
SYS_KB_Missing_Model_Classes_v1.0.txt
SYS_KB_Implementation_Roadmap_v1.0.txt
```

#### Batch 13 - Data Requirements (6 files)
```
ANL_KB_MMM_Data_Requirements_v1.0.txt
AUD_KB_Zero_Party_Data_v1.0.txt
AUD_KB_Audience_Overlap_v1.0.txt
SPO_KB_Bid_Landscape_v1.0.txt
SPO_KB_Header_Bidding_v1.0.txt
SPO_KB_Cost_Benchmarks_v1.0.txt
```

---

## SECTION 3: REPOSITORY STRUCTURE

### 3.1 Directory Structure

```
Kessel-Digital-Agent-Platform/
├── release/
│   └── v6.0/
│       ├── agents/
│       │   ├── anl/
│       │   │   ├── instructions/
│       │   │   │   └── ANL_Copilot_Instructions_v1.txt
│       │   │   └── kb/
│       │   │       └── [ANL KB files]
│       │   ├── aud/
│       │   │   ├── instructions/
│       │   │   └── kb/
│       │   ├── cha/
│       │   │   ├── instructions/
│       │   │   └── kb/
│       │   ├── cso/  [NEW]
│       │   │   ├── instructions/
│       │   │   │   └── CSO_Copilot_Instructions_v1.txt
│       │   │   └── kb/
│       │   ├── doc/
│       │   │   ├── instructions/
│       │   │   └── kb/
│       │   ├── nds/  [NEW]
│       │   │   ├── instructions/
│       │   │   │   └── NDS_Copilot_Instructions_v1.txt
│       │   │   └── kb/
│       │   ├── orc/
│       │   │   ├── instructions/
│       │   │   └── kb/
│       │   ├── prf/
│       │   │   ├── instructions/
│       │   │   └── kb/
│       │   ├── spo/
│       │   │   ├── instructions/
│       │   │   └── kb/
│       │   └── udm/  [NEW]
│       │       ├── instructions/
│       │       │   └── UDM_Copilot_Instructions_v1.txt
│       │       └── kb/
│       ├── shared/
│       │   └── [Shared KB files]
│       ├── system/  [NEW]
│       │   └── [SYS KB files]
│       ├── verticals/
│       │   └── [Vertical overlays]
│       └── platform/
│           └── seed/
│               └── [Seed data files]
└── docs/
    └── plans/
        └── [Planning documents]
```

### 3.2 Git Workflow

```
BRANCH STRATEGY:
- feature/v6.0-kb-expansion (working branch)
- deploy/personal (Aragorn AI deployment)
- deploy/mastercard (Mastercard deployment)

COMMIT PROTOCOL:
- Commit after EVERY file creation
- Commit message format: "feat(agent): Add [filename] - [brief description]"
- Push to origin after every 5 commits minimum
- Tag releases: v6.0.0-kb-[batch number]

MERGE STRATEGY:
- Complete each batch before merge to deploy branches
- Test in feature branch first
- Merge to deploy/personal then deploy/mastercard
```

---

## SECTION 4: EXECUTION TIMELINE

### 4.1 Claude.ai Timeline

```
DAY 1 (Session 1):
- Create execution plan (this document) ✓
- Push to repos ✓
- Create VS Code instructions ✓
- Start Phase 1A: Identity Foundation (3 files)

DAY 1-2 (Session 2):
- Complete Phase 1A
- Start Phase 1B: NDS Agent Core (5 files)

DAY 2-3 (Session 3):
- Complete Phase 1B
- Start Phase 1C: CSO Agent Core (5 files)

DAY 3-4 (Session 4):
- Complete Phase 1C
- Start Phase 1D: System Architecture (5 files)

DAY 4-5 (Session 5):
- Complete Phase 1D
- Start Phase 1E: Critical ML Files (7 files)

DAY 5-6:
- Complete Phase 1E
- Review VS Code output
- Fix any issues
```

### 4.2 VS Code Timeline

```
DAY 1:
- Read execution plan and VS Code instructions
- Set up directory structure
- Create validation scripts

DAY 1-2:
- Batch 1: UDM files (8 files)
- Batch 2: MMM Enhancement (5 files)

DAY 2-3:
- Batch 3: MTA/Attribution (5 files)
- Batch 4: Incrementality (5 files)
- Batch 5: View/Click Tracking (4 files)

DAY 3-4:
- Batch 6: NDS Supporting (5 files)
- Batch 7: CSO Supporting (3 files)
- Batch 8: ML Scientific (13 files)

DAY 4-5:
- Batch 9: PRF Scientific (7 files)
- Batch 10: SPO Enhancement (4 files)
- Batch 11: Cross-Platform (4 files)

DAY 5-6:
- Batch 12: System Supporting (2 files)
- Batch 13: Data Requirements (6 files)
- Final validation and cleanup
```

---

## SECTION 5: VALIDATION PROCEDURES

### 5.1 Pre-Commit Validation Checklist

```
□ File naming follows convention: [AGENT]_KB_[Topic]_v1.0.txt
□ Document header complete with VERSION, STATUS, COMPLIANCE
□ All headers are ALL CAPS
□ All lists use hyphens only
□ No unicode characters (smart quotes, em-dashes, etc.)
□ No tables or visual formatting
□ Character count under 36,000
□ UTF-8 encoding verified
□ No markdown dependencies
□ Professional tone throughout
□ LAST UPDATED field current
□ CHARACTER COUNT field accurate
□ END OF DOCUMENT marker present
```

### 5.2 Validation Script

```bash
#!/bin/bash
# validate_kb_file.sh

FILE=$1

echo "Validating: $FILE"

# Check character count
CHARS=$(wc -c < "$FILE")
if [ $CHARS -gt 36000 ]; then
    echo "FAIL: Character count $CHARS exceeds 36000"
    exit 1
fi

# Check for unicode
if grep -P '[^\x00-\x7F]' "$FILE"; then
    echo "FAIL: Unicode characters detected"
    exit 1
fi

# Check for bullets/asterisks in lists
if grep -E '^\s*[\*•]' "$FILE"; then
    echo "FAIL: Bullet points detected (use hyphens)"
    exit 1
fi

# Check for tables
if grep -E '^\|.*\|$' "$FILE"; then
    echo "FAIL: Table formatting detected"
    exit 1
fi

# Check for document header
if ! head -5 "$FILE" | grep -q "VERSION:"; then
    echo "FAIL: Missing VERSION in header"
    exit 1
fi

# Check for END OF DOCUMENT
if ! tail -5 "$FILE" | grep -q "END OF DOCUMENT"; then
    echo "FAIL: Missing END OF DOCUMENT marker"
    exit 1
fi

echo "PASS: All validation checks passed"
echo "Character count: $CHARS"
```

### 5.3 Batch Validation

```bash
#!/bin/bash
# validate_all_kb.sh

FAILED=0
PASSED=0

for file in release/v6.0/agents/*/kb/*.txt; do
    if ./validate_kb_file.sh "$file"; then
        ((PASSED++))
    else
        ((FAILED++))
        echo "FAILED: $file"
    fi
done

echo "========================"
echo "Validation Complete"
echo "Passed: $PASSED"
echo "Failed: $FAILED"
```

---

## SECTION 6: ROLLBACK PROCEDURES

### 6.1 File-Level Rollback

```bash
# Revert single file to previous commit
git checkout HEAD~1 -- path/to/file.txt
git commit -m "fix: Revert [filename] to previous version"
```

### 6.2 Batch-Level Rollback

```bash
# Revert entire batch
git revert --no-commit HEAD~[N]..HEAD
git commit -m "fix: Revert batch [N] due to [reason]"
```

### 6.3 Full Rollback

```bash
# Reset to pre-expansion state
git reset --hard [pre-expansion-commit-hash]
git push --force-with-lease origin feature/v6.0-kb-expansion
```

---

## SECTION 7: SUCCESS CRITERIA

### 7.1 Completion Metrics

```
- 96 new KB files created
- 100% pass 6-rule validation
- 100% pass character limit (<36,000)
- All files committed to feature branch
- All files merged to deploy branches
- All files pushed to remote
- Zero validation errors in final check
```

### 7.2 Quality Metrics

```
- Scientific accuracy verified
- Cross-references consistent
- No duplicate content
- Proper agent attribution
- Complete section coverage per spec
```

---

## SECTION 8: CONTACT AND ESCALATION

### 8.1 Decision Authority

```
CLAUDE.AI DECISIONS:
- Architecture changes
- New agent design
- Cross-agent coordination
- Complex ML methodology

VS CODE DECISIONS:
- File structure within batches
- Minor content adjustments
- Validation script updates
- Batch ordering
```

### 8.2 Escalation Path

```
1. File-level issue → Fix in place, re-commit
2. Batch-level issue → Review with other workstream
3. Architecture issue → Stop, document, coordinate
4. Compliance issue → Stop all work, investigate
```

---

## APPENDIX A: EXISTING FILES TO VERIFY

The following existing files must be verified for naming convention and 6-rule compliance:

### Agent Instructions (7 files)
```
ANL_Copilot_Instructions_v1.txt
AUD_Copilot_Instructions_v1.txt
CHA_Copilot_Instructions_v1.txt
DOC_Copilot_Instructions_v1.txt
ORC_Copilot_Instructions_v1.txt
PRF_Copilot_Instructions_v1.txt
SPO_Copilot_Instructions_v1.txt
```

### Existing KB Files (58 files)
```
[Full inventory available in repo]
All must be verified against naming convention
All must pass 6-rule validation
Non-compliant files must be updated
```

### Verticals (12 files)
```
[All vertical overlays must be verified]
```

### Shared (2 files)
```
SHARED_Formula_Reference_v1.txt → Rename to SYS_KB_Formula_Reference_v1.0.txt
SHARED_Glossary_v1.txt → Rename to SYS_KB_Glossary_v1.0.txt
```

---

## APPENDIX B: FILE COUNT SUMMARY

| Category | Existing | New (Claude) | New (VS Code) | Total |
|----------|----------|--------------|---------------|-------|
| ANL | 8 | 2 | 7 | 17 |
| AUD | 10 | 5 | 7 | 22 |
| CHA | 10 | 0 | 0 | 10 |
| CSO | 0 | 5 | 3 | 8 |
| DOC | 5 | 0 | 0 | 5 |
| NDS | 0 | 5 | 5 | 10 |
| ORC | 4 | 0 | 0 | 4 |
| PRF | 9 | 4 | 16 | 29 |
| SPO | 7 | 0 | 8 | 15 |
| SYS | 2 | 5 | 2 | 9 |
| UDM | 0 | 0 | 8 | 8 |
| Verticals | 12 | 0 | 0 | 12 |
| **TOTAL** | **72** | **25** | **71** | **168** |

---

*Document Version: 1.0*
*Created: January 18, 2026*
*Author: Claude.ai*
*Status: APPROVED FOR EXECUTION*
