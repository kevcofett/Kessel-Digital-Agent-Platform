# VS CODE KICKOFF PROMPT - MPA v6.0 KB EXPANSION

Copy and paste this entire prompt into VS Code Claude to begin the 71-file KB expansion.

---

## PROMPT TO PASTE INTO VS CODE:

```
I need you to create 71 KB files for the MPA v6.0 expansion. Claude.ai is simultaneously creating 25 complex architecture files in parallel.

## CRITICAL REQUIREMENTS

### Six-Rule Framework (ALL FILES MUST PASS)
1. ALL-CAPS HEADERS - Section headers must be ALL CAPS
2. HYPHENS ONLY FOR LISTS - Use hyphens (-) for all list items, never bullets or numbers
3. ASCII CHARACTERS ONLY - No smart quotes, no em-dashes, no unicode
4. ZERO VISUAL DEPENDENCIES - No tables, no images, no markdown formatting
5. MANDATORY DOCUMENT HEADER - Every file starts with VERSION, STATUS, COMPLIANCE, LAST UPDATED, CHARACTER COUNT
6. PROFESSIONAL TONE - No emoji, no first person, no casual language

### Microsoft Stack Compatibility
- Copilot Studio: Max 36,000 characters per file
- Azure: No spaces in filenames, use underscores
- UTF-8 encoding required

## REPOSITORY SETUP

First, run these commands:

```bash
cd /path/to/Kessel-Digital-Agent-Platform
git fetch origin
git checkout feature/v6.0-kb-expansion
git pull origin feature/v6.0-kb-expansion
chmod +x validate_kb_file.sh
```

## DOCUMENT TEMPLATE

Use this EXACT template for every file:

```
[AGENT]_KB_[Topic]_v1.0.txt
VERSION: 1.0
STATUS: Production Ready
COMPLIANCE: 6-Rule Compliant
LAST UPDATED: 2026-01-18
CHARACTER COUNT: [UPDATE AFTER COMPLETION]

================================================================================
SECTION 1 - [TITLE IN ALL CAPS]
================================================================================

OVERVIEW

[Opening paragraph]

[SUBSECTION IN ALL CAPS]

- List item with hyphen
- Another item

================================================================================
SECTION N - AGENT APPLICATION GUIDANCE
================================================================================

WHEN TO USE THIS KNOWLEDGE

[Guidance]

================================================================================
END OF DOCUMENT
================================================================================
```

## FILE LOCATIONS
- UDM files: release/v6.0/agents/udm/kb/
- NDS files: release/v6.0/agents/nds/kb/
- CSO files: release/v6.0/agents/cso/kb/
- ANL files: release/v6.0/agents/anl/kb/
- AUD files: release/v6.0/agents/aud/kb/
- PRF files: release/v6.0/agents/prf/kb/
- SPO files: release/v6.0/agents/spo/kb/
- SYS files: release/v6.0/system/

## GIT WORKFLOW (AFTER EACH FILE)
```bash
./validate_kb_file.sh path/to/file.txt
git add path/to/file.txt
git commit -m "feat(agent): Add [filename]"
# Push every 5 commits
git push origin feature/v6.0-kb-expansion
```

## YOUR 71 FILES

### BATCH 1: UDM - Unstructured Data Mining (8 files)
Location: release/v6.0/agents/udm/kb/

1. UDM_KB_Text_Mining_Methods_v1.0.txt (12-15K chars)
   Sections: TEXT PREPROCESSING PIPELINE, EMBEDDING MODELS, TOPIC MODELING, SENTIMENT AND EMOTION ANALYSIS, MARKETING APPLICATIONS

2. UDM_KB_Creative_Analysis_v1.0.txt (12-15K chars)
   Sections: IMAGE ANALYSIS, VIDEO ANALYSIS, CREATIVE ATTRIBUTE EXTRACTION, CREATIVE PERFORMANCE PREDICTION, IMPLEMENTATION GUIDANCE

3. UDM_KB_Social_Web_Mining_v1.0.txt (10-12K chars)
   Sections: SOCIAL LISTENING, WEB CONTENT MINING, GRAPH-BASED ANALYSIS, REAL-TIME STREAM PROCESSING

4. UDM_KB_Log_Event_Analysis_v1.0.txt (10-12K chars)
   Sections: LOG PARSING, EVENT SEQUENCE ANALYSIS, ANOMALY DETECTION IN LOGS, USER BEHAVIOR MODELING

5. UDM_KB_Feature_Engineering_Unstructured_v1.0.txt (10-12K chars)
   Sections: FEATURE EXTRACTION PATTERNS, FEATURE STORE INTEGRATION, DOWNSTREAM MODEL INTEGRATION, QUALITY AND MONITORING

6. UDM_KB_Anomaly_Pattern_Detection_v1.0.txt (10-12K chars)
   Sections: ANOMALY DETECTION METHODS, PATTERN MINING, TREND DETECTION, ALERT PRIORITIZATION

7. UDM_KB_NLP_Marketing_Applications_v1.0.txt (10-12K chars)
   Sections: CUSTOMER FEEDBACK ANALYSIS, CONVERSATIONAL ANALYTICS, CONTENT GENERATION SIGNALS, SEARCH AND DISCOVERY

8. UDM_KB_Multimodal_Integration_v1.0.txt (10-12K chars)
   Sections: MULTIMODAL FUSION, CREATIVE PERFORMANCE MODELING, UNIFIED REPRESENTATION, PRODUCTION CONSIDERATIONS

### BATCH 2: MMM Enhancement (5 files)
Location: release/v6.0/agents/anl/kb/

9. ANL_KB_Bayesian_MMM_v1.0.txt
10. ANL_KB_Campaign_Level_MMM_v1.0.txt
11. ANL_KB_GeoLift_Augmented_MMM_v1.0.txt
12. ANL_KB_MMM_External_Factors_v1.0.txt
13. ANL_KB_MMM_Output_Utilization_v1.0.txt

### BATCH 3: MTA/Attribution (5 files)
Location: release/v6.0/agents/prf/kb/

14. PRF_KB_Shapley_Attribution_v1.0.txt
15. PRF_KB_Sequence_Attribution_Models_v1.0.txt
16. PRF_KB_Path_Based_Attribution_v1.0.txt
17. PRF_KB_Attribution_Validation_v1.0.txt
18. PRF_KB_Attribution_MTA_MMM_Reconciliation_v1.0.txt

### BATCH 4: Incrementality (5 files)
Location: release/v6.0/agents/prf/kb/

19. PRF_KB_Geo_Test_Design_v1.0.txt
20. PRF_KB_Audience_Split_Tests_v1.0.txt
21. PRF_KB_Always_On_Experiments_v1.0.txt
22. PRF_KB_Holdout_Design_v1.0.txt
23. PRF_KB_Lift_Operationalization_v1.0.txt

### BATCH 5: View/Click Tracking (4 files)
Location: release/v6.0/agents/prf/kb/

24. PRF_KB_View_Click_Measurement_v1.0.txt
25. PRF_KB_View_Through_Bias_Correction_v1.0.txt
26. PRF_KB_Multi_Impression_Sequence_v1.0.txt
27. PRF_KB_Signal_Integration_Framework_v1.0.txt

### BATCH 6: NDS Supporting (5 files)
Location: release/v6.0/agents/nds/kb/

28. NDS_KB_Real_Time_Optimization_v1.0.txt
29. NDS_KB_Simulation_WhatIf_v1.0.txt
30. NDS_KB_Audience_Level_Allocation_v1.0.txt
31. NDS_KB_Channel_Tactic_Allocation_v1.0.txt
32. NDS_KB_Always_On_Optimization_v1.0.txt

### BATCH 7: CSO Supporting (3 files)
Location: release/v6.0/agents/cso/kb/

33. CSO_KB_Channel_Creative_Mix_v1.0.txt
34. CSO_KB_Constraint_Handling_v1.0.txt
35. CSO_KB_Journey_Orchestration_v1.0.txt

### BATCH 8: ML Scientific - AUD (7 files)
Location: release/v6.0/agents/aud/kb/

36. AUD_KB_Churn_Prediction_ML_v1.0.txt
37. AUD_KB_RFM_Advanced_Analytics_v1.0.txt
38. AUD_KB_Intent_Modeling_ML_v1.0.txt
39. AUD_KB_Taxonomy_Management_v1.0.txt
40. AUD_KB_Data_Onboarding_Scientific_v1.0.txt
41. AUD_KB_Privacy_Preserving_Matching_v1.0.txt
42. AUD_KB_B2B_Identity_Resolution_v1.0.txt

### BATCH 9: ML Scientific - ANL (6 files)
Location: release/v6.0/agents/anl/kb/

43. ANL_KB_Deep_Learning_Marketing_v1.0.txt
44. ANL_KB_Optimization_Algorithms_v1.0.txt
45. ANL_KB_Simulation_Methods_v1.0.txt
46. ANL_KB_Financial_Modeling_Marketing_v1.0.txt
47. ANL_KB_Experimental_Design_v1.0.txt
48. ANL_KB_Econometric_Modeling_v1.0.txt

### BATCH 10: PRF Scientific (7 files)
Location: release/v6.0/agents/prf/kb/

49. PRF_KB_Viewability_Deep_Dive_v1.0.txt
50. PRF_KB_MFA_Detection_v1.0.txt
51. PRF_KB_Attention_Measurement_Scientific_v1.0.txt
52. PRF_KB_Multi_Touch_Attribution_Scientific_v1.0.txt
53. PRF_KB_Anomaly_Detection_ML_v1.0.txt
54. PRF_KB_Forecasting_ML_v1.0.txt
55. PRF_KB_Model_Validation_Framework_v1.0.txt

### BATCH 11: SPO Enhancement (4 files)
Location: release/v6.0/agents/spo/kb/

56. SPO_KB_Margin_Analysis_v1.0.txt
57. SPO_KB_Working_Media_v1.0.txt
58. SPO_KB_Hidden_Fees_v1.0.txt
59. SPO_KB_Verification_ROI_Analysis_v1.0.txt

### BATCH 12: Cross-Platform (4 files)

60. PRF_KB_Cross_Platform_Deduplication_v1.0.txt (release/v6.0/agents/prf/kb/)
61. PRF_KB_Advanced_Experiment_Designs_v1.0.txt (release/v6.0/agents/prf/kb/)
62. ANL_KB_Cross_Channel_Optimization_v1.0.txt (release/v6.0/agents/anl/kb/)
63. SPO_KB_Quality_Score_Framework_v1.0.txt (release/v6.0/agents/spo/kb/)

### BATCH 13: System & Data (8 files)

64. SYS_KB_Missing_Model_Classes_v1.0.txt (release/v6.0/system/)
65. SYS_KB_Implementation_Roadmap_v1.0.txt (release/v6.0/system/)
66. ANL_KB_MMM_Data_Requirements_v1.0.txt (release/v6.0/agents/anl/kb/)
67. AUD_KB_Zero_Party_Data_v1.0.txt (release/v6.0/agents/aud/kb/)
68. AUD_KB_Audience_Overlap_v1.0.txt (release/v6.0/agents/aud/kb/)
69. SPO_KB_Bid_Landscape_v1.0.txt (release/v6.0/agents/spo/kb/)
70. SPO_KB_Header_Bidding_v1.0.txt (release/v6.0/agents/spo/kb/)
71. SPO_KB_Cost_Benchmarks_v1.0.txt (release/v6.0/agents/spo/kb/)

## DETAILED SPECIFICATIONS

For detailed section requirements for each file, read:
docs/plans/VSCODE_KB_71_Files_Instructions.md

## START NOW

Begin with BATCH 1, File 1: UDM_KB_Text_Mining_Methods_v1.0.txt

Create the complete file with all required sections, validate it, commit it, then proceed to the next file. Report progress after each batch.
```

---

## END OF PROMPT

Copy everything between the ``` markers above and paste into VS Code Claude.
