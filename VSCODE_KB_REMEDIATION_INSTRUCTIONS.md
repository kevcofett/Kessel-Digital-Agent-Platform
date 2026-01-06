# VS CODE CLAUDE: KB VALIDATION AND REMEDIATION

**Date:** 2026-01-06
**Priority:** IMMEDIATE - Blocking SharePoint deployment
**Scope:** Consulting_Agent/kb and Enterprise_AI_Platform/kb

---

## OBJECTIVE

Validate and remediate ALL knowledge base documents in both repositories to ensure they are:
1. Compliant with 6-Rule Framework
2. Ready for SharePoint deployment
3. Free of obsolete content
4. Properly formatted for Copilot Studio ingestion

---

## 6-RULE COMPLIANCE FRAMEWORK

All KB documents MUST comply with these rules:

| Rule | Requirement |
|------|-------------|
| 1 | ALL-CAPS HEADERS for section titles |
| 2 | SIMPLE LISTS using hyphens only (no bullets, no numbered lists) |
| 3 | ASCII CHARACTERS ONLY (no special characters, em-dashes, smart quotes) |
| 4 | ZERO VISUAL DEPENDENCIES (no tables requiring rendering, no images) |
| 5 | MANDATORY LANGUAGE throughout (MUST, SHALL, ALWAYS, NEVER) |
| 6 | PROFESSIONAL TONE with agent-ready decision logic |

---

## TASK 1: DELETE OBSOLETE V10 CONTENT

**Location:** `/Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/`

Execute these deletions:

```bash
rm -rf /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/CA_Knowledge_Base_V10/
rm /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/CA_Knowledge_Base_V10.zip
```

**Verify deletion completed.**

---

## TASK 2: REFORMAT FRAMEWORK_Library_Master_v1.txt

**CRITICAL GUIDANCE:** The content EXISTS but is compressed into 13 lines (wall of text). Do NOT regenerate from scratch. Instead:

1. Read the existing file content
2. Parse the wall of text to identify section breaks
3. Rewrite with proper line breaks and formatting

**Location:** `/Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/FRAMEWORK_Library_Master_v1.txt`

**Problem:** 34,400 bytes compressed into 13 lines

**Formatting Template:** Reference `/Users/kevinbauer/Kessel-Digital/Enterprise_AI_Platform/kb/FRAMEWORK_Library_v1.txt` (324 lines, properly formatted) for structure

**Required Structure:**
- Standard document header block
- ALL-CAPS section headers with blank lines before/after
- Each of 32 frameworks should have:
  - Framework ID
  - Category  
  - Purpose
  - Methodology
  - Use Cases
  - Outputs
  - Time Estimates
- Proper paragraph breaks
- Hyphens for lists

---

## TASK 3: VALIDATE ALL CONSULTING_AGENT/KB FILES

**Location:** `/Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/`

For EACH .txt file, validate:

1. **Line count sanity check** - File should have reasonable lines (not wall of text)
2. **6-Rule Compliance:**
   - Headers are ALL-CAPS
   - Lists use hyphens only (no bullets, no numbered lists)
   - No special characters (check for em-dash, curly quotes, bullets, arrows)
   - No markdown tables (plain text tables with dashes OK)
   - Uses MUST/SHALL/ALWAYS/NEVER language
   - Professional agent-ready tone

3. **Version consistency** - Should reference V12 (not V10, V11)
4. **Document header format** - Should have standard header block

**Files to validate (35 after V10 deletion):**

- ANALYSIS_PROGRESS_FORMAT_v1.txt
- BEHAVIORAL_Research_Routing_v1.txt
- BEHAVIORAL_Service_Availability_v1.txt
- CA_CONFIDENCE_LEVELS_v1.txt
- CA_DATA_SOURCE_HIERARCHY_v1.txt
- CONSISTENCY_CHECK_RULES_v1.txt
- CUSTOM_FRAMEWORK_GUIDE_v1.txt
- FRAMEWORK_Advanced_Analytics_v1.txt
- FRAMEWORK_COMPARISON_LOGIC_v1.txt
- FRAMEWORK_Consulting_Tools_v1.txt
- FRAMEWORK_Enterprise_Tools_v1.txt
- FRAMEWORK_Library_Master_v1.txt (REFORMAT per Task 2)
- INDUSTRY_Expertise_Guide_v1.txt
- OUTPUT_SANITIZATION_RULES_v1.txt
- REFERENCE_Clean_Room_v1.txt
- REFERENCE_Contextual_Targeting_v1.txt
- REFERENCE_Demographics_DMA_v1.txt
- REFERENCE_Demographics_Regional_v1.txt
- REFERENCE_DSP_CTV_OTT_v1.txt
- REFERENCE_DSP_Display_v1.txt
- REFERENCE_DSP_Mobile_v1.txt
- REFERENCE_DSP_Walled_Gardens_v1.txt
- REFERENCE_Glossary_v1.txt
- REFERENCE_Identity_Resolution_v1.txt
- REFERENCE_MarTech_CDP_v1.txt
- REFERENCE_RMN_Grocery_v1.txt
- REFERENCE_RMN_Mass_Specialty_v1.txt
- REFERENCE_SSP_Core_v1.txt
- REGISTRY_Benchmarks_Inventory_v1.txt
- REGISTRY_Benchmarks_Media_KPIs_v1.txt
- REGISTRY_URLs_Industry_v1.txt
- REGISTRY_URLs_Publications_v1.txt
- REGISTRY_URLs_Regulatory_v1.txt
- RESEARCH_QUALITY_INDICATORS_v1.txt
- SOURCE_QUALITY_TIERS_v1.txt

---

## TASK 4: VALIDATE ALL ENTERPRISE_AI_PLATFORM/KB FILES

**Location:** `/Users/kevinbauer/Kessel-Digital/Enterprise_AI_Platform/kb/`

Apply same validation as Task 3 to all 7 files:

- BEHAVIORAL_Service_Availability_v1.txt
- BENCHMARK_Industry_KPIs_v1.txt
- FRAMEWORK_Library_v1.txt
- INDUSTRY_Vertical_Expertise_v1.txt
- REFERENCE_Research_Routing_v1.txt
- REGISTRY_Available_Integrations_v1.txt
- TOOLS_Consulting_Methods_v1.txt

---

## TASK 5: EAP KB COMPLETENESS REVIEW

**GUIDANCE:** EAP is designed as THIN SHARED INFRASTRUCTURE. The 7 files are likely intentional and correct.

CA-specific content should stay in CA kb only:
- DSP references (Display, CTV, Mobile, Walled Gardens)
- RMN references (Grocery, Mass Specialty)
- Clean Room, CDP, SSP references
- Demographics references

**Action:** Confirm 7 files is correct for EAP's role. Do NOT copy CA-specific files to EAP.

**Output:** Brief statement confirming EAP kb is complete for its infrastructure role, OR list specific shared files that are genuinely missing.

---

## TASK 6: VERIFY COPILOT INSTRUCTIONS

**Location:** `/Users/kevinbauer/Kessel-Digital/Consulting_Agent/specs/copilot/Consulting_Agent_Instructions_V12.txt`

Verify:
- References V12 (not V10, V11)
- KB file names match actual files in kb/ folder
- No references to deleted V10 content

---

## TASK 7: GENERATE FINAL VALIDATION REPORT

**IMPORTANT - Correct Location:**
`/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/KB_FINAL_VALIDATION_REPORT.md`

Report MUST include:

1. **Summary Table**
   - Total files validated
   - Files passing
   - Files remediated
   - Files deleted

2. **CA KB Results** (35 files)
   - Pass/Fail status for each file
   - Issues found and fixed
   - Any remaining issues

3. **EAP KB Results** (7 files)
   - Pass/Fail status for each file
   - Completeness assessment

4. **Copilot Instructions Status**
   - V12 compliance confirmed

5. **SharePoint Readiness Verdict**
   - READY or NOT READY
   - If NOT READY, list blocking issues

---

## SUCCESS CRITERIA

- [ ] V10 folder and zip deleted from CA/kb
- [ ] FRAMEWORK_Library_Master_v1.txt reformatted (not regenerated) with proper line breaks
- [ ] All 35 CA kb files pass 6-Rule validation
- [ ] All 7 EAP kb files pass 6-Rule validation
- [ ] No obsolete version references (V10, V11) in active files
- [ ] Copilot Instructions V12 verified
- [ ] Final validation report generated in Kessel-Digital-Agent-Platform repo
- [ ] VERDICT: READY FOR SHAREPOINT

---

## SHAREPOINT DEPLOYMENT TARGETS

After validation complete, files deploy to:

- **CA KB:** `kessel-digital/Consulting_Agent/kb`
- **EAP KB:** `kessel-digital/Enterprise_AI_Platform/kb`

---

## CRITICAL REMINDERS

- Do NOT truncate, abbreviate, or summarize any file contents
- Completeness is priority over efficiency
- All files must be full and complete
- When reformatting files, preserve ALL content - just fix formatting
- ASCII only - replace any special characters found
- Final report goes in Kessel-Digital-Agent-Platform repo, NOT parent folder

---

END OF INSTRUCTIONS
