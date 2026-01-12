# VS CODE CLAUDE: POWER AUTOMATE FLOW VALIDATION

## OBJECTIVE

Validate all deployed Power Automate flows against the MPA v5.5 codebase to ensure:
- Correct table names (mpa_ prefix, singular)
- Correct column names (match Dataverse schema)
- Correct Azure Function endpoints
- Proper error handling patterns
- Connection reference consistency

## CONTEXT

The user has built 11 Power Automate flows manually in the Aragorn AI environment.
These flows need to be validated against the authoritative specifications to catch:
- Column name mismatches (mpa_is_active vs mpa_isactive)
- Table name errors (plural vs singular)
- Deprecated column references
- Azure Function URL mismatches
- Missing error handling

## INPUTS REQUIRED

**User must provide:**
1. Flow export files (JSON) placed in: `/release/v5.5/flows/deployed/`
2. List of flow names that were built

**Authoritative sources in repo:**
1. Flow specifications: `/release/v5.5/flows/specifications/`
2. Dataverse schema: `/release/v5.5/specs/dataverse/`
3. Azure Functions specs: `/release/v5.5/specs/azure-functions/`
4. Table config: `/release/v5.5/config/table_config.py`

## VALIDATION CHECKLIST

### Phase 1: File Inventory

**Check deployed flows directory:**
```bash
ls -la /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/flows/deployed/
```

**Expected files (11 flows):**
- MPA_SearchBenchmarks.json
- MPA_SearchChannels.json
- MPA_SearchKPIs.json
- MPA_SearchVerticals.json
- MPA_ValidatePlan.json
- MPA_GenerateDocument.json
- MPA_SavePlan.json
- MPA_LoadPlan.json
- MPA_SearchPlans.json
- MPA_GetPlanVersions.json
- MPA_ProcessMediaBrief.json

**If files missing:**
Inform user which flows need to be exported.

### Phase 2: Schema Validation

**For each flow, validate:**

**A. Table Names**
- ✅ All table names use singular: mpa_benchmark (not mpa_benchmarks)
- ✅ Correct prefix: mpa_ for MPA tables, eap_ for EAP tables
- ❌ No "new_" prefix tables
- ❌ No deprecated plural tables

**B. Column Names**
Load authoritative column names from:
```python
# Read from table_config.py
TABLE_CONFIG = {
    "mpa_benchmark": {
        "columns": ["mpa_benchmarkid", "mpa_name", "mpa_verticalcode", 
                   "mpa_channelcode", "mpa_kpicode", "mpa_value", 
                   "mpa_datasource", "mpa_year", "mpa_isactive"]
    },
    "mpa_vertical": {
        "columns": ["mpa_verticalid", "mpa_name", "mpa_verticalcode", 
                   "mpa_description", "mpa_isactive"]
    },
    "mpa_channel": {
        "columns": ["mpa_channelid", "mpa_name", "mpa_channelcode", 
                   "mpa_category", "mpa_description", "mpa_isactive"]
    },
    "mpa_kpi": {
        "columns": ["mpa_kpiid", "mpa_name", "mpa_kpicode", 
                   "mpa_unit", "mpa_description", "mpa_isactive"]
    },
    "mpa_mediaplan": {
        "columns": ["mpa_mediaplanid", "mpa_name", "mpa_clientname",
                   "mpa_campaignobjective", "mpa_status", "mpa_createdon"]
    },
    "mpa_plansection": {
        "columns": ["mpa_plansectionid", "mpa_mediaplanid", "mpa_sectiontype",
                   "mpa_content", "mpa_order"]
    }
}
```

**Common errors to flag:**
- ❌ mpa_is_active → Should be: mpa_isactive
- ❌ mpa_channel_name → Should be: mpa_newcolumn
- ❌ mpa_vertical → Should be: mpa_verticalcode
- ❌ mpa_benchmarktype → Does not exist (correct: mpa_channelcode)

**C. Azure Function Endpoints**
```
Base URL: https://func-aragorn-mpa.azurewebsites.net/api/

Expected endpoints:
- CalculateBudget
- CalculateReach
- CalculateCPM
- SearchBenchmarks
- SessionManager
- ValidateMediaPlan
- GenerateDocument
- DataProvenance
```

**Validate:**
- ✅ Correct base URL
- ✅ Correct function names
- ✅ Function key included in headers
- ❌ No http://localhost references
- ❌ No old environment URLs

### Phase 3: Connection References

**Check Dataverse connections:**
- ✅ Connection reference uses correct Dataverse environment
- ✅ Environment URL: aragornai.crm.dynamics.com
- ❌ No references to old environments (org5c737821.crm.dynamics.com)

**Check SharePoint connections:**
- ✅ Site URL: https://kesseldigitalcom.sharepoint.com/sites/AragornAI2
- ✅ Library: MediaPlanningKB
- ❌ No references to old sites

### Phase 4: Parameter Validation

**For each flow, validate inputs/outputs match specifications:**

**Example: MPA_SearchBenchmarks**
```json
Expected inputs:
{
  "vertical_code": "string (optional)",
  "channel_code": "string (optional)",
  "kpi_code": "string (optional)"
}

Expected outputs:
{
  "benchmarks": "array",
  "count": "integer",
  "message": "string"
}
```

**Validate:**
- ✅ Input parameters match specification
- ✅ Output schema matches specification
- ✅ Parameter names use snake_case (not camelCase)
- ❌ No missing required parameters

### Phase 5: Error Handling

**Check each flow has:**
- ✅ Try-Catch scope for Dataverse operations
- ✅ Try-Catch scope for Azure Function calls
- ✅ Respond action for errors (returns error message)
- ✅ Respond action for success (returns data)

### Phase 6: Comparison Report

**Generate report:**
```markdown
# FLOW VALIDATION REPORT

## Summary
- Flows validated: X/11
- Flows with issues: X
- Critical errors: X
- Warnings: X

## Flow-by-Flow Results

### MPA_SearchBenchmarks
Status: ✅ PASS / ❌ FAIL
Issues:
- [CRITICAL] Line 45: Column name "mpa_is_active" should be "mpa_isactive"
- [WARNING] Line 78: Missing error handling for Dataverse query

### MPA_SearchChannels
Status: ✅ PASS
Issues: None

[Continue for all flows...]

## Critical Issues (Must Fix)

1. [MPA_SearchBenchmarks] Incorrect column names
2. [MPA_ValidatePlan] Wrong Azure Function endpoint

## Warnings (Should Fix)

1. [MPA_SavePlan] Missing error handling
2. [MPA_LoadPlan] Connection reference uses old environment

## Action Items

### Priority 1 (Blocking)
- [ ] Fix column names in MPA_SearchBenchmarks
- [ ] Update Azure Function endpoint in MPA_ValidatePlan

### Priority 2 (Important)
- [ ] Add error handling to MPA_SavePlan
- [ ] Update connection reference in MPA_LoadPlan

## Files to Update

After fixes, export corrected flows and save to:
/release/v5.5/flows/deployed/

## Git Commands
```bash
git add release/v5.5/flows/deployed/*.json
git add release/v5.5/docs/FLOW_VALIDATION_REPORT.md
git commit -m "Add validated Power Automate flows for MPA v5.5"
git push
```
```

## EXECUTION INSTRUCTIONS

### Step 1: Verify User Has Exported Flows
```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/flows/deployed
ls -la *.json
```

If directory empty, STOP and instruct user to export flows first.

### Step 2: Load Authoritative Schemas
```bash
# Read table config
cat /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/config/table_config.py

# Read flow specifications
ls /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/flows/specifications/

# Read Azure Function specs
cat /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/specs/azure-functions/*.json
```

### Step 3: Parse Each Flow
For each flow JSON:
1. Extract Dataverse queries
2. Extract Azure Function calls
3. Extract connection references
4. Extract input/output schemas

### Step 4: Compare Against Specs
For each extracted element:
1. Check table names against TABLE_CONFIG
2. Check column names against TABLE_CONFIG
3. Check Azure Function URLs against specs
4. Check parameters against flow specifications

### Step 5: Generate Report
Create comprehensive validation report with:
- Pass/fail status per flow
- Line-specific issues
- Severity ratings (Critical/Warning)
- Action items with priority
- Git commands for committing fixes

### Step 6: Output Report
Save report to:
```bash
/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/docs/FLOW_VALIDATION_REPORT.md
```

Print summary to console.

## COMMON ISSUES TO CHECK

### Issue 1: Plural Table Names
**Pattern:** `"tableName": "mpa_benchmarks"`
**Fix:** Should be `"tableName": "mpa_benchmark"`

### Issue 2: Underscore vs CamelCase in Columns
**Pattern:** `"mpa_is_active"`
**Fix:** Should be `"mpa_isactive"`

### Issue 3: Wrong Column Names
**Pattern:** `"mpa_vertical"` in filter
**Fix:** Should be `"mpa_verticalcode"`

### Issue 4: Old Environment URLs
**Pattern:** `"environment": "org5c737821.crm.dynamics.com"`
**Fix:** Should be `"environment": "aragornai.crm.dynamics.com"`

### Issue 5: Missing Error Handling
**Pattern:** Dataverse action not wrapped in try-catch
**Fix:** Add Configure Run After + Respond to HTTP with error

### Issue 6: Localhost References
**Pattern:** `"uri": "http://localhost:7071/api/..."`
**Fix:** Should be `"uri": "https://func-aragorn-mpa.azurewebsites.net/api/..."`

## OUTPUT FORMAT

**Console Output:**
```
================================================================================
POWER AUTOMATE FLOW VALIDATION
================================================================================

Validating flows in: /release/v5.5/flows/deployed/
Comparing against: /release/v5.5/flows/specifications/

Flows found: 11
Flows validated: 11

Results:
✅ MPA_SearchChannels - PASS
✅ MPA_SearchKPIs - PASS  
✅ MPA_SearchVerticals - PASS
❌ MPA_SearchBenchmarks - FAIL (2 critical issues)
⚠️  MPA_ValidatePlan - PASS (1 warning)
❌ MPA_GenerateDocument - FAIL (1 critical issue)
✅ MPA_SavePlan - PASS
✅ MPA_LoadPlan - PASS
✅ MPA_SearchPlans - PASS
✅ MPA_GetPlanVersions - PASS
✅ MPA_ProcessMediaBrief - PASS

Summary:
- Pass: 8/11
- Fail: 2/11
- Warnings: 1/11
- Critical issues: 3

Detailed report saved to:
/release/v5.5/docs/FLOW_VALIDATION_REPORT.md
```

## SUCCESS CRITERIA

Validation is complete when:
1. ✅ All 11 flows analyzed
2. ✅ Validation report generated
3. ✅ Critical issues documented with line numbers
4. ✅ Action items prioritized
5. ✅ Report committed to git

## USER HANDOFF

After validation, inform user:
```
Flow validation complete!

Summary:
- X flows passed validation
- X flows have issues requiring fixes
- X critical issues found (blocking)
- X warnings found (recommended fixes)

Next steps:
1. Review: /release/v5.5/docs/FLOW_VALIDATION_REPORT.md
2. Fix critical issues in Power Automate
3. Re-export corrected flows
4. Run validation again

Would you like me to:
A) Generate fix instructions for each issue
B) Create a Power Automate checklist for corrections
C) Proceed with fixing non-flow issues
```

---

## END OF PROMPT
