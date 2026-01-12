# VS CODE CLAUDE: AUTOMATED FLOW VALIDATION VIA PAC CLI

## OBJECTIVE

Validate Power Automate flows directly from the Aragorn AI environment using Power Platform CLI (pac) without requiring manual JSON exports.

## PREREQUISITES CHECK

### Step 1: Verify PAC CLI is Installed

```bash
pac --version
```

**If not installed:**
```bash
# macOS installation
brew tap microsoft/powerplatform-cli https://github.com/microsoft/powerplatform-cli
brew install pac-cli
```

**If installed but outdated:**
```bash
pac install latest
```

### Step 2: Authenticate to Power Platform

```bash
# Authenticate (will open browser)
pac auth create --environment https://aragornai.crm.dynamics.com

# List auth profiles to verify
pac auth list

# Select the Aragorn AI profile if multiple exist
pac auth select --index 0
```

## AUTOMATED FLOW EXTRACTION

### Step 1: List All Flows in Environment

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/flows

# List all flows
pac flow list --environment https://aragornai.crm.dynamics.com > flow_list.txt

# Display results
cat flow_list.txt
```

**Expected output:**
```
Flow Name                    | Flow ID                              | State
----------------------------|--------------------------------------|-------
MPA_SearchBenchmarks        | a1b2c3d4-...                        | Started
MPA_SearchChannels          | e5f6g7h8-...                        | Started
...
```

### Step 2: Export Each Flow Definition

```bash
# Create deployed directory
mkdir -p /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/flows/deployed

# Export individual flows (replace FLOW_ID with actual ID from step 1)
pac flow export --name FLOW_ID --environment https://aragornai.crm.dynamics.com --output-directory deployed/
```

**For automation, extract flow IDs and loop:**
```bash
# Extract flow IDs from list
grep "MPA_" flow_list.txt | awk '{print $3}' > flow_ids.txt

# Export all flows
while read flow_id; do
  echo "Exporting flow: $flow_id"
  pac flow export --name "$flow_id" --environment https://aragornai.crm.dynamics.com --output-directory deployed/
done < flow_ids.txt
```

### Step 3: Parse Exported Files

```bash
# List exported flows
ls -lh deployed/

# The pac CLI exports as .zip files, extract them
cd deployed/
for zip in *.zip; do
  unzip -q "$zip" -d "${zip%.zip}"
  echo "Extracted: $zip"
done
```

## ALTERNATIVE: Direct Flow Inspection via API

If pac CLI doesn't work, use Power Automate Management API directly:

```bash
# Get access token
TOKEN=$(pac auth list --json | jq -r '.[0].accessToken')

# List flows
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments/c672b470-9cc7-e9d8-a0e2-ca83751f800c/flows?api-version=2016-11-01"

# Get specific flow definition
FLOW_ID="<flow-id-here>"
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments/c672b470-9cc7-e9d8-a0e2-ca83751f800c/flows/$FLOW_ID?api-version=2016-11-01" > "deployed/$FLOW_ID.json"
```

## VALIDATION EXECUTION

Once flows are extracted, run the same validation as original prompt:

```bash
# Execute validation
python /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/scripts/validate_flows.py
```

## VALIDATION SCRIPT (TO CREATE)

Create a Python validation script that VS Code Claude can run:

```python
#!/usr/bin/env python3
"""
Validate Power Automate flows against MPA v5.5 specifications.
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Tuple

# Load table config
sys.path.insert(0, str(Path(__file__).parent.parent))
from config.table_config import TABLE_CONFIG

DEPLOYED_DIR = Path(__file__).parent.parent / "flows" / "deployed"
SPECS_DIR = Path(__file__).parent.parent / "flows" / "specifications"

EXPECTED_FLOWS = [
    "MPA_SearchBenchmarks",
    "MPA_SearchChannels",
    "MPA_SearchKPIs",
    "MPA_SearchVerticals",
    "MPA_ValidatePlan",
    "MPA_GenerateDocument",
    "MPA_SavePlan",
    "MPA_LoadPlan",
    "MPA_SearchPlans",
    "MPA_GetPlanVersions",
    "MPA_ProcessMediaBrief",
]

class FlowValidator:
    def __init__(self):
        self.issues = []
        self.warnings = []
        
    def validate_flow(self, flow_path: Path) -> Tuple[bool, List[str], List[str]]:
        """Validate a single flow file."""
        issues = []
        warnings = []
        
        with open(flow_path) as f:
            flow = json.load(f)
        
        # Validate table names
        issues.extend(self._check_table_names(flow))
        
        # Validate column names
        issues.extend(self._check_column_names(flow))
        
        # Validate Azure Function URLs
        issues.extend(self._check_azure_functions(flow))
        
        # Check error handling
        warnings.extend(self._check_error_handling(flow))
        
        passed = len(issues) == 0
        return passed, issues, warnings
    
    def _check_table_names(self, flow: dict) -> List[str]:
        """Check for plural or incorrect table names."""
        issues = []
        flow_str = json.dumps(flow)
        
        # Check for plural tables
        if "mpa_benchmarks" in flow_str:
            issues.append("CRITICAL: Found 'mpa_benchmarks' (should be 'mpa_benchmark')")
        if "mpa_verticals" in flow_str:
            issues.append("CRITICAL: Found 'mpa_verticals' (should be 'mpa_vertical')")
        if "mpa_channels" in flow_str:
            issues.append("CRITICAL: Found 'mpa_channels' (should be 'mpa_channel')")
        if "mpa_kpis" in flow_str:
            issues.append("CRITICAL: Found 'mpa_kpis' (should be 'mpa_kpi')")
            
        # Check for new_ prefix
        if "new_" in flow_str:
            issues.append("CRITICAL: Found 'new_' prefix tables (should be 'mpa_' or 'eap_')")
            
        return issues
    
    def _check_column_names(self, flow: dict) -> List[str]:
        """Check for incorrect column names."""
        issues = []
        flow_str = json.dumps(flow)
        
        # Common column errors
        if "mpa_is_active" in flow_str:
            issues.append("CRITICAL: Found 'mpa_is_active' (should be 'mpa_isactive')")
        if "mpa_channel_name" in flow_str:
            issues.append("CRITICAL: Found 'mpa_channel_name' (should be 'mpa_newcolumn')")
        if '"mpa_vertical"' in flow_str and "mpa_verticalcode" not in flow_str:
            issues.append("CRITICAL: Found 'mpa_vertical' filter (should be 'mpa_verticalcode')")
            
        return issues
    
    def _check_azure_functions(self, flow: dict) -> List[str]:
        """Check Azure Function endpoints."""
        issues = []
        flow_str = json.dumps(flow)
        
        # Check for localhost
        if "localhost:7071" in flow_str:
            issues.append("CRITICAL: Found localhost URL (should be production Azure Functions)")
            
        # Check for old environment
        if "org5c737821" in flow_str:
            issues.append("CRITICAL: Found old environment URL (should be aragornai)")
            
        # Check for correct base URL
        if "func-aragorn-mpa" not in flow_str and "azurewebsites.net" in flow_str:
            issues.append("WARNING: Azure Functions URL may be incorrect")
            
        return issues
    
    def _check_error_handling(self, flow: dict) -> List[str]:
        """Check for error handling patterns."""
        warnings = []
        
        # This is simplified - real check would parse flow structure
        flow_str = json.dumps(flow)
        
        if '"runAfter"' not in flow_str:
            warnings.append("WARNING: Missing error handling (no runAfter configurations)")
            
        return warnings

def main():
    print("=" * 80)
    print("POWER AUTOMATE FLOW VALIDATION")
    print("=" * 80)
    print()
    
    if not DEPLOYED_DIR.exists():
        print(f"ERROR: Deployed flows directory not found: {DEPLOYED_DIR}")
        print("Please export flows using pac CLI first.")
        sys.exit(1)
    
    flow_files = list(DEPLOYED_DIR.glob("**/*.json"))
    
    if not flow_files:
        print("ERROR: No flow JSON files found in deployed directory")
        sys.exit(1)
    
    print(f"Found {len(flow_files)} flow files to validate\n")
    
    validator = FlowValidator()
    results = []
    
    for flow_file in flow_files:
        print(f"Validating: {flow_file.name}")
        passed, issues, warnings = validator.validate_flow(flow_file)
        
        status = "✅ PASS" if passed else "❌ FAIL"
        if warnings and passed:
            status = "⚠️  PASS"
        
        print(f"  {status}")
        
        for issue in issues:
            print(f"    {issue}")
        for warning in warnings:
            print(f"    {warning}")
        
        print()
        
        results.append({
            "name": flow_file.stem,
            "passed": passed,
            "issues": issues,
            "warnings": warnings
        })
    
    # Summary
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    passed_count = sum(1 for r in results if r["passed"])
    failed_count = len(results) - passed_count
    total_issues = sum(len(r["issues"]) for r in results)
    total_warnings = sum(len(r["warnings"]) for r in results)
    
    print(f"Flows validated: {len(results)}")
    print(f"Passed: {passed_count}/{len(results)}")
    print(f"Failed: {failed_count}/{len(results)}")
    print(f"Critical issues: {total_issues}")
    print(f"Warnings: {total_warnings}")
    print()
    
    if failed_count > 0:
        print("FLOWS WITH ISSUES:")
        for r in results:
            if not r["passed"]:
                print(f"  ❌ {r['name']}")
        print()
        sys.exit(1)
    else:
        print("✅ All flows passed validation!")
        sys.exit(0)

if __name__ == "__main__":
    main()
```

## EXECUTION SEQUENCE

**VS Code Claude should execute:**

1. Check pac CLI installation
2. Authenticate to Power Platform
3. List flows in Aragorn AI environment
4. Export flow definitions
5. Run validation script
6. Generate detailed report
7. Commit validated flows to git

**If pac CLI unavailable:**
- Fall back to manual validation checklist
- Provide step-by-step portal inspection guide

---

## END OF PROMPT
