# VS Code Claude Continuation - MPA Test Import Script

## CURRENT STATE

The Python script `import_mpa_tests.py` is nearly working but has schema mismatches with the Copilot Studio Kit Dataverse tables.

**Test set was created successfully:**
- ID: `c2da2b02-00ed-f011-8544-6045bd014035`
- Name: "MPA Core Behaviors"

**Test case creation is failing** due to incorrect field/relationship names.

## CORRECT SCHEMA (discovered via API)

### Table: cat_copilottestsets
- Primary key: `cat_copilottestsetid`
- Name field: `cat_name`
- NO description field exists

### Table: cat_copilottests
Key fields:
- `cat_copilottestid` (Uniqueidentifier) - primary key
- `cat_copilottestsetid` (Lookup) - relationship to test set
- `cat_name` (String)
- `cat_testutterance` (Memo)
- `cat_expectedresponse` (Memo)
- `cat_order` (Integer)
- `cat_testtypecode` (Picklist) - NOT cat_testtype
- `cat_validationinstructions` (Memo)
- `cat_group` (String)
- `cat_critical` (Boolean)
- `cat_passthreshold` (Integer)

## TASK

1. Open `/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/tests/import_mpa_tests.py`

2. Fix ALL remaining schema issues:
   - Lookup binding should be: `"cat_copilottestsetid@odata.bind": f"/cat_copilottestsets({test_set_id})"`
   - Test type field is: `cat_testtypecode` (already fixed)
   - Ensure all ID references use `cat_copilottestsetid` not `cat_copilotagenttestsetid`

3. Run the script:
   ```bash
   cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/tests
   python3 import_mpa_tests.py --env https://aragornai.crm.dynamics.com --force
   ```

4. Debug any remaining errors by querying the API for correct field names

## AUTHENTICATION

The script uses device code flow - user will authenticate via browser when prompted.

## SUCCESS CRITERIA

Script should output:
```
Test Cases Created: 10 / 10
```

Then user can open Copilot Studio Kit and run tests against the MPA agent.

## FILES

- Script: `import_mpa_tests.py`
- Test definitions: `mpa_test_cases.json`
- Both in: `/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/tests/`
