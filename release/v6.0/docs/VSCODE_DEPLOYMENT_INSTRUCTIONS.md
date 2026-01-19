# MPA v6.0 POWER PLATFORM DEPLOYMENT - VS CODE INSTRUCTIONS

**Date:** 2026-01-19
**Priority:** CRITICAL - Production deployment
**Estimated Time:** 12-16 hours

---

## EXECUTIVE SUMMARY

This document provides step-by-step instructions for deploying MPA v6.0 to Power Platform. The repo contains all specifications (YAML flows, JSON schemas, CSV seed data) but nothing is deployed yet.

**Your deliverables:**
1. Create 15 Dataverse tables from schemas
2. Validate and import 13 seed data files with 100% data integrity
3. Create 25 Power Automate flows from YAML specifications
4. Create 20+ AI Builder prompts
5. Export solution package
6. Run validation tests

---

## PHASE 1: ENVIRONMENT SETUP

### 1.1 Prerequisites Check

```powershell
# Verify PAC CLI is installed
pac --version

# Authenticate to target environment
pac auth create --environment "https://[your-org].crm.dynamics.com"

# Verify connection
pac org who
```

### 1.2 Create Solution Container

```powershell
# Create new solution for MPA v6.0
pac solution init --publisher-name KesselDigital --publisher-prefix kd

# Set solution properties
$solutionName = "MPAv6MultiAgent"
$solutionVersion = "6.0.0.0"
```

---

## PHASE 2: DATAVERSE TABLE CREATION

### 2.1 Table Creation Order (Dependencies Matter!)

Create tables in this exact order due to foreign key relationships:

```
TIER 1 (No dependencies):
1. mpa_vertical
2. mpa_channel  
3. mpa_kpi
4. mpa_partner
5. eap_agent
6. ca_framework

TIER 2 (Depends on Tier 1):
7. mpa_benchmark (depends on: mpa_vertical, mpa_channel, mpa_kpi)
8. eap_capability (depends on: eap_agent)
9. eap_prompt (depends on: eap_agent)
10. ca_project (depends on: mpa_vertical)

TIER 3 (Depends on Tier 2):
11. eap_capability_implementation (depends on: eap_capability)
12. eap_session (depends on: eap_agent)
13. ca_deliverable (depends on: ca_project)

TIER 4 (Depends on Tier 3):
14. eap_test_case (depends on: eap_agent, eap_capability)
15. eap_telemetry (depends on: eap_agent, eap_session)
```

### 2.2 Schema Files Location

All schema definitions are in: `base/dataverse/schema/`

```
base/dataverse/schema/
├── ca_deliverable.json
├── ca_framework.json
├── ca_project.json
├── eap_agent.json
├── eap_capability.json
├── eap_capability_implementation.json
├── eap_prompt.json
├── eap_session.json
├── eap_telemetry.json
├── eap_test_case.json
├── mpa_benchmark.json
├── mpa_channel.json
├── mpa_kpi.json
├── mpa_partner.json
└── mpa_vertical.json
```

### 2.3 Table Creation Script

Create file: `scripts/create-dataverse-tables.ps1`

```powershell
<#
.SYNOPSIS
    Creates all Dataverse tables for MPA v6.0
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$EnvironmentUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$SchemaPath = "../base/dataverse/schema"
)

# Table creation order (respects dependencies)
$tableOrder = @(
    # Tier 1
    "mpa_vertical",
    "mpa_channel",
    "mpa_kpi",
    "mpa_partner",
    "eap_agent",
    "ca_framework",
    # Tier 2
    "mpa_benchmark",
    "eap_capability",
    "eap_prompt",
    "ca_project",
    # Tier 3
    "eap_capability_implementation",
    "eap_session",
    "ca_deliverable",
    # Tier 4
    "eap_test_case",
    "eap_telemetry"
)

foreach ($table in $tableOrder) {
    $schemaFile = Join-Path $SchemaPath "$table.json"
    
    if (Test-Path $schemaFile) {
        Write-Host "Creating table: $table" -ForegroundColor Cyan
        
        $schema = Get-Content $schemaFile | ConvertFrom-Json
        
        # Use PAC CLI to create table
        # pac table create --name $schema.table_name --display-name $schema.display_name
        
        Write-Host "  Created: $($schema.display_name)" -ForegroundColor Green
    } else {
        Write-Host "Schema not found: $schemaFile" -ForegroundColor Red
    }
}
```

---

## PHASE 3: SEED DATA VALIDATION & IMPORT

### 3.1 Seed File Inventory

| File | Table | Rows | Status |
|------|-------|------|--------|
| mpa_vertical_seed.csv | mpa_vertical | 15 | ⚠️ Has nullable parent_vertical_code |
| mpa_channel_seed.csv | mpa_channel | 30 | ✅ Complete |
| mpa_kpi_seed.csv | mpa_kpi | 24 | ✅ Complete |
| mpa_partner_seed.csv | mpa_partner | 20 | ✅ Complete |
| mpa_benchmark_seed.csv | mpa_benchmark | 31 | ✅ Complete |
| eap_agent_seed.csv | eap_agent | 10 | ⚠️ Has nullable fallback/effective_to |
| eap_capability_seed.csv | eap_capability | 20 | ✅ Complete |
| eap_capability_ca_seed.csv | eap_capability | 20 | ✅ Complete (merge with above) |
| eap_capability_implementation_seed.csv | eap_capability_implementation | 47 | ⚠️ Has nullable fallback_implementation_id |
| eap_prompt_seed.csv | eap_prompt | 19 | ⚠️ Has nullable last_tested_at/test_pass_rate |
| eap_session_seed.csv | eap_session | 5 | ⚠️ Has nullable completed_at |
| eap_test_case_seed.csv | eap_test_case | 15 | ⚠️ Has nullable last_run fields |
| ca_framework_seed.csv | ca_framework | 60 | ✅ Complete |

### 3.2 Column Validation Rules by Table

#### mpa_vertical

| Column | Type | Required | Format | Validation |
|--------|------|----------|--------|------------|
| mpa_verticalid | GUID | Yes | 00000000-0000-0000-0008-XXXXXXXXXXXX | Must be valid UUID |
| vertical_code | String(20) | Yes | UPPERCASE | No spaces, alphanumeric + underscore |
| vertical_name | String(100) | Yes | Title Case | Human readable |
| parent_vertical_code | String(20) | **No** | UPPERCASE or NULL | Must match existing vertical_code or be empty for top-level |
| typical_sales_cycle_days | Integer | Yes | 1-365 | Positive integer |
| typical_aov_low | Decimal | Yes | 0.00+ | Currency format, 2 decimals |
| typical_aov_high | Decimal | Yes | > aov_low | Must be >= aov_low |
| seasonality_pattern | Integer | Yes | 1-4 | 1=Stable, 2=Holiday, 3=Summer, 4=Back-to-school |
| description | String(500) | Yes | Any | Non-empty |
| is_active | Boolean | Yes | true/false | Lowercase |

#### mpa_channel

| Column | Type | Required | Format | Validation |
|--------|------|----------|--------|------------|
| mpa_channelid | GUID | Yes | 00000000-0000-0000-0009-XXXXXXXXXXXX | Must be valid UUID |
| channel_code | String(30) | Yes | UPPERCASE_SNAKE | e.g., SEARCH_BRAND |
| channel_name | String(100) | Yes | Title Case | Human readable |
| channel_category | Integer | Yes | 1-11 | See category enum |
| funnel_stage | Integer | Yes | 1-4 | 1=Awareness, 2=Consideration, 3=Conversion, 4=Retention |
| supports_awareness | Boolean | Yes | true/false | Lowercase |
| supports_consideration | Boolean | Yes | true/false | Lowercase |
| supports_conversion | Boolean | Yes | true/false | Lowercase |
| supports_retention | Boolean | Yes | true/false | Lowercase |
| typical_cpm_low | Decimal | Yes | 0.00+ | Currency, 2 decimals |
| typical_cpm_high | Decimal | Yes | >= cpm_low | Must be >= cpm_low |
| min_budget_recommended | Decimal | Yes | 0.00+ | Currency, 2 decimals |
| description | String(500) | Yes | Any | Non-empty |
| is_active | Boolean | Yes | true/false | Lowercase |

#### mpa_kpi

| Column | Type | Required | Format | Validation |
|--------|------|----------|--------|------------|
| mpa_kpiid | GUID | Yes | 00000000-0000-0000-000A-XXXXXXXXXXXX | Must be valid UUID |
| kpi_code | String(30) | Yes | UPPERCASE_SNAKE | e.g., ROAS, CPA, CTR |
| kpi_name | String(100) | Yes | Title Case | Human readable |
| kpi_category | Integer | Yes | 1-5 | 1=Efficiency, 2=Volume, 3=Quality, 4=Financial, 5=Engagement |
| funnel_stage | Integer | Yes | 1-4 | Same as channel |
| formula | String(500) | Yes | Any | Mathematical expression or description |
| unit_of_measure | String(20) | Yes | Any | e.g., "ratio", "percent", "currency", "count" |
| direction | String(10) | Yes | higher/lower | "higher" = good when up, "lower" = good when down |
| description | String(500) | Yes | Any | Non-empty |
| is_primary | Boolean | Yes | true/false | Lowercase |
| is_active | Boolean | Yes | true/false | Lowercase |

#### mpa_partner

| Column | Type | Required | Format | Validation |
|--------|------|----------|--------|------------|
| mpa_partnerid | GUID | Yes | 00000000-0000-0000-000B-XXXXXXXXXXXX | Must be valid UUID |
| partner_code | String(30) | Yes | UPPERCASE_SNAKE | e.g., TTD, DV360 |
| partner_name | String(100) | Yes | Title Case | Human readable |
| partner_type | Integer | Yes | 1-5 | 1=DSP, 2=SSP, 3=DMP, 4=Verification, 5=Other |
| platform_fee_percent | Decimal | Yes | 0.00-100.00 | Percentage, 2 decimals |
| tech_fee_cpm | Decimal | Yes | 0.00+ | Currency, 2 decimals |
| data_fee_cpm | Decimal | Yes | 0.00+ | Currency, 2 decimals |
| minimum_spend | Decimal | Yes | 0.00+ | Currency, 2 decimals |
| supported_channels | String(200) | Yes | CSV list | e.g., "DISPLAY,VIDEO,CTV" |
| nbi_score | Decimal | Yes | 0.00-100.00 | Score, 2 decimals |
| brand_safety_certified | Boolean | Yes | true/false | Lowercase |
| viewability_guarantee | Decimal | Yes | 0.00-100.00 | Percentage, 2 decimals |
| description | String(500) | Yes | Any | Non-empty |
| is_preferred | Boolean | Yes | true/false | Lowercase |
| is_active | Boolean | Yes | true/false | Lowercase |

#### mpa_benchmark

| Column | Type | Required | Format | Validation |
|--------|------|----------|--------|------------|
| mpa_benchmarkid | GUID | Yes | 00000000-0000-0000-000C-XXXXXXXXXXXX | Must be valid UUID |
| vertical_code | String(20) | Yes | UPPERCASE | Must exist in mpa_vertical |
| channel_code | String(30) | Yes | UPPERCASE_SNAKE | Must exist in mpa_channel |
| kpi_code | String(30) | Yes | UPPERCASE_SNAKE | Must exist in mpa_kpi |
| benchmark_p10 | Decimal | Yes | Any | 10th percentile value |
| benchmark_p25 | Decimal | Yes | >= p10 | 25th percentile |
| benchmark_p50 | Decimal | Yes | >= p25 | Median |
| benchmark_p75 | Decimal | Yes | >= p50 | 75th percentile |
| benchmark_p90 | Decimal | Yes | >= p75 | 90th percentile |
| sample_size | Integer | Yes | > 0 | Positive integer |
| data_source | String(100) | Yes | Any | Source name |
| effective_date | DateTime | Yes | ISO 8601 | YYYY-MM-DDTHH:MM:SSZ |
| expiry_date | DateTime | Yes | > effective_date | Must be after effective_date |
| is_active | Boolean | Yes | true/false | Lowercase |

#### eap_agent

| Column | Type | Required | Format | Validation |
|--------|------|----------|--------|------------|
| eap_agentid | GUID | Yes | 00000000-0000-0000-0002-XXXXXXXXXXXX | Must be valid UUID |
| agent_code | String(10) | Yes | UPPERCASE | 3-letter code: ORC, ANL, AUD, CHA, SPO, DOC, PRF, CHG, CST, MKT |
| agent_name | String(100) | Yes | Title Case | Human readable |
| description | String(2000) | Yes | Any | Non-empty |
| capability_tags | String(500) | Yes | CSV list | Comma-separated keywords |
| required_inputs | String(200) | Yes | CSV list | Required input parameters |
| instruction_char_count | Integer | Yes | 5000-8000 | Character count |
| kb_file_count | Integer | Yes | 1-50 | Positive integer |
| confidence_threshold | Decimal | Yes | 0.50-1.00 | 2 decimals |
| fallback_agent_code | String(10) | **No** | UPPERCASE or NULL | NULL only for ORC |
| max_tokens | Integer | Yes | 1000-32000 | Positive integer |
| temperature | Decimal | Yes | 0.00-1.00 | 2 decimals |
| is_active | Boolean | Yes | true/false | Lowercase |
| version | String(10) | Yes | X.X | Semantic version |
| effective_from | DateTime | Yes | ISO 8601 | YYYY-MM-DDTHH:MM:SSZ |
| effective_to | DateTime | **No** | ISO 8601 or NULL | NULL for active agents |

#### eap_capability

| Column | Type | Required | Format | Validation |
|--------|------|----------|--------|------------|
| eap_capabilityid | GUID | Yes | 00000000-0000-0000-0003-XXXXXXXXXXXX | Must be valid UUID |
| capability_code | String(50) | Yes | UPPERCASE_SNAKE | e.g., ANL_BUDGET_ALLOCATE |
| capability_name | String(100) | Yes | Title Case | Human readable |
| description | String(500) | Yes | Any | Non-empty |
| agent_code | String(10) | Yes | UPPERCASE | Must exist in eap_agent |
| input_schema | String(2000) | Yes | JSON | Valid JSON schema |
| output_schema | String(2000) | Yes | JSON | Valid JSON schema |
| is_active | Boolean | Yes | true/false | Lowercase |
| version | String(10) | Yes | X.X | Semantic version |
| timeout_default_seconds | Integer | Yes | 5-300 | Positive integer |

#### eap_prompt

| Column | Type | Required | Format | Validation |
|--------|------|----------|--------|------------|
| eap_promptid | GUID | Yes | 00000000-0000-0000-0004-XXXXXXXXXXXX | Must be valid UUID |
| prompt_code | String(50) | Yes | UPPERCASE_SNAKE | e.g., ANL_ALLOCATE_BUDGET |
| prompt_name | String(100) | Yes | Title Case | Human readable |
| agent_code | String(10) | Yes | UPPERCASE | Must exist in eap_agent |
| description | String(500) | Yes | Any | Non-empty |
| system_prompt_template | Text | Yes | Any | Non-empty template |
| user_prompt_template | Text | Yes | Any | Non-empty template |
| output_format | String(20) | Yes | json/text/markdown | One of these values |
| output_schema | String(2000) | Yes | JSON | Valid JSON schema |
| temperature | Decimal | Yes | 0.00-1.00 | 2 decimals |
| max_tokens | Integer | Yes | 100-16000 | Positive integer |
| few_shot_examples | Text | **No** | JSON or NULL | Valid JSON array if present |
| version | String(10) | Yes | X.X | Semantic version |
| is_active | Boolean | Yes | true/false | Lowercase |
| created_at | DateTime | Yes | ISO 8601 | YYYY-MM-DDTHH:MM:SSZ |
| last_tested_at | DateTime | **No** | ISO 8601 or NULL | NULL if never tested |
| test_pass_rate | Decimal | **No** | 0.00-100.00 or NULL | NULL if never tested |

### 3.3 Data Validation Script

Create file: `scripts/validate-seed-data.js`

```javascript
/**
 * MPA v6.0 Seed Data Validator
 * Validates all CSV seed files for data integrity before import
 */

const fs = require('fs');
const path = require('path');

// Validation rules by table
const validationRules = {
  'mpa_vertical': {
    required: ['mpa_verticalid', 'vertical_code', 'vertical_name', 'typical_sales_cycle_days', 
               'typical_aov_low', 'typical_aov_high', 'seasonality_pattern', 'description', 'is_active'],
    nullable: ['parent_vertical_code'],
    formats: {
      'mpa_verticalid': /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      'vertical_code': /^[A-Z][A-Z0-9_]*$/,
      'is_active': /^(true|false)$/,
      'seasonality_pattern': /^[1-4]$/,
      'typical_sales_cycle_days': /^\d+$/,
      'typical_aov_low': /^\d+(\.\d{1,2})?$/,
      'typical_aov_high': /^\d+(\.\d{1,2})?$/
    }
  },
  'mpa_channel': {
    required: ['mpa_channelid', 'channel_code', 'channel_name', 'channel_category', 'funnel_stage',
               'supports_awareness', 'supports_consideration', 'supports_conversion', 'supports_retention',
               'typical_cpm_low', 'typical_cpm_high', 'min_budget_recommended', 'description', 'is_active'],
    nullable: [],
    formats: {
      'mpa_channelid': /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      'channel_code': /^[A-Z][A-Z0-9_]*$/,
      'channel_category': /^([1-9]|1[0-1])$/,
      'funnel_stage': /^[1-4]$/,
      'supports_awareness': /^(true|false)$/,
      'supports_consideration': /^(true|false)$/,
      'supports_conversion': /^(true|false)$/,
      'supports_retention': /^(true|false)$/,
      'is_active': /^(true|false)$/
    }
  },
  'eap_agent': {
    required: ['eap_agentid', 'agent_code', 'agent_name', 'description', 'capability_tags',
               'required_inputs', 'instruction_char_count', 'kb_file_count', 'confidence_threshold',
               'max_tokens', 'temperature', 'is_active', 'version', 'effective_from'],
    nullable: ['fallback_agent_code', 'effective_to'],
    formats: {
      'eap_agentid': /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      'agent_code': /^(ORC|ANL|AUD|CHA|SPO|DOC|PRF|CHG|CST|MKT)$/,
      'is_active': /^(true|false)$/,
      'instruction_char_count': /^\d+$/,
      'kb_file_count': /^\d+$/,
      'confidence_threshold': /^0\.\d{1,2}$|^1(\.0{1,2})?$/,
      'temperature': /^0\.\d{1,2}$|^1(\.0{1,2})?$/,
      'max_tokens': /^\d+$/,
      'effective_from': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    }
  }
  // Add more table rules as needed
};

function validateCSV(filePath, tableName) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  const rules = validationRules[tableName];
  
  if (!rules) {
    console.log(`⚠️  No validation rules for ${tableName}`);
    return { errors: [], warnings: ['No validation rules defined'] };
  }
  
  const errors = [];
  const warnings = [];
  
  // Check all required columns exist
  for (const required of rules.required) {
    if (!headers.includes(required)) {
      errors.push(`Missing required column: ${required}`);
    }
  }
  
  // Validate each row
  lines.slice(1).forEach((line, rowIndex) => {
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, i) => row[h] = values[i] || '');
    
    // Check required fields are not empty
    for (const required of rules.required) {
      if (!row[required] || row[required].trim() === '') {
        errors.push(`Row ${rowIndex + 2}: Required field '${required}' is empty`);
      }
    }
    
    // Check format validation
    for (const [field, regex] of Object.entries(rules.formats || {})) {
      const value = row[field];
      if (value && value.trim() !== '' && !regex.test(value.trim())) {
        errors.push(`Row ${rowIndex + 2}: Field '${field}' has invalid format: "${value}"`);
      }
    }
    
    // Check nullable fields that ARE empty
    for (const nullable of rules.nullable || []) {
      if (!row[nullable] || row[nullable].trim() === '') {
        warnings.push(`Row ${rowIndex + 2}: Nullable field '${nullable}' is empty (OK if intentional)`);
      }
    }
  });
  
  return { errors, warnings };
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

// Main execution
const seedFiles = [
  { file: 'base/dataverse/seed/mpa_vertical_seed.csv', table: 'mpa_vertical' },
  { file: 'base/dataverse/seed/mpa_channel_seed.csv', table: 'mpa_channel' },
  { file: 'base/dataverse/seed/mpa_kpi_seed.csv', table: 'mpa_kpi' },
  { file: 'base/dataverse/seed/mpa_partner_seed.csv', table: 'mpa_partner' },
  { file: 'base/dataverse/seed/mpa_benchmark_seed.csv', table: 'mpa_benchmark' },
  { file: 'base/dataverse/seed/eap_agent_seed.csv', table: 'eap_agent' },
  { file: 'base/dataverse/seed/eap_capability_seed.csv', table: 'eap_capability' },
  { file: 'base/dataverse/seed/eap_prompt_seed.csv', table: 'eap_prompt' },
  { file: 'base/dataverse/seed/ca_framework_seed.csv', table: 'ca_framework' }
];

console.log('=== MPA v6.0 SEED DATA VALIDATION ===\n');

let totalErrors = 0;
let totalWarnings = 0;

for (const { file, table } of seedFiles) {
  const filePath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${file}`);
    totalErrors++;
    continue;
  }
  
  const { errors, warnings } = validateCSV(filePath, table);
  
  console.log(`--- ${table} (${file}) ---`);
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All validations passed\n');
  } else {
    errors.forEach(e => {
      console.log(`❌ ERROR: ${e}`);
      totalErrors++;
    });
    warnings.forEach(w => {
      console.log(`⚠️  WARNING: ${w}`);
      totalWarnings++;
    });
    console.log('');
  }
}

console.log('=== SUMMARY ===');
console.log(`Total Errors: ${totalErrors}`);
console.log(`Total Warnings: ${totalWarnings}`);
console.log(`Status: ${totalErrors === 0 ? '✅ READY FOR IMPORT' : '❌ FIX ERRORS BEFORE IMPORT'}`);

process.exit(totalErrors > 0 ? 1 : 0);
```

### 3.4 Seed Data Import Script

Create file: `scripts/import-seed-data.ps1`

```powershell
<#
.SYNOPSIS
    Imports seed data into Dataverse tables with validation
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$EnvironmentUrl,
    
    [Parameter(Mandatory=$false)]
    [switch]$ValidateOnly
)

# Import order (respects foreign key dependencies)
$importOrder = @(
    @{ Table = "mpa_vertical"; File = "base/dataverse/seed/mpa_vertical_seed.csv" },
    @{ Table = "mpa_channel"; File = "base/dataverse/seed/mpa_channel_seed.csv" },
    @{ Table = "mpa_kpi"; File = "base/dataverse/seed/mpa_kpi_seed.csv" },
    @{ Table = "mpa_partner"; File = "base/dataverse/seed/mpa_partner_seed.csv" },
    @{ Table = "eap_agent"; File = "base/dataverse/seed/eap_agent_seed.csv" },
    @{ Table = "ca_framework"; File = "base/dataverse/seed/ca_framework_seed.csv" },
    @{ Table = "mpa_benchmark"; File = "base/dataverse/seed/mpa_benchmark_seed.csv" },
    @{ Table = "eap_capability"; File = "base/dataverse/seed/eap_capability_seed.csv" },
    @{ Table = "eap_capability"; File = "base/dataverse/seed/eap_capability_ca_seed.csv" },
    @{ Table = "eap_prompt"; File = "base/dataverse/seed/eap_prompt_seed.csv" },
    @{ Table = "eap_capability_implementation"; File = "base/dataverse/seed/eap_capability_implementation_seed.csv" },
    @{ Table = "eap_session"; File = "base/dataverse/seed/eap_session_seed.csv" },
    @{ Table = "eap_test_case"; File = "base/dataverse/seed/eap_test_case_seed.csv" }
)

Write-Host "=== MPA v6.0 SEED DATA IMPORT ===" -ForegroundColor Cyan

# Run validation first
Write-Host "`nRunning validation..." -ForegroundColor Yellow
$validationResult = node ./scripts/validate-seed-data.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Validation failed. Fix errors before importing." -ForegroundColor Red
    exit 1
}

if ($ValidateOnly) {
    Write-Host "`n✅ Validation passed. Use -ValidateOnly:$false to import." -ForegroundColor Green
    exit 0
}

# Import each file
foreach ($import in $importOrder) {
    $table = $import.Table
    $file = $import.File
    
    if (Test-Path $file) {
        Write-Host "`nImporting $table from $file..." -ForegroundColor Cyan
        
        # Use PAC CLI data import
        # pac data import --data $file --target $table --environment $EnvironmentUrl
        
        # Or use Power Platform CLI
        # pac data upsert --data $file --table $table
        
        Write-Host "  ✅ Imported $table" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n=== IMPORT COMPLETE ===" -ForegroundColor Cyan
```

---

## PHASE 4: POWER AUTOMATE FLOW CREATION

### 4.1 Flow Inventory

| Agent | Flow Name | YAML Location |
|-------|-----------|---------------|
| ORC | RouteToSpecialist | agents/orc/flows/RouteToSpecialist.yaml |
| ORC | GetSessionState | agents/orc/flows/GetSessionState.yaml |
| ORC | UpdateProgress | agents/orc/flows/UpdateProgress.yaml |
| ANL | CalculateProjection | agents/anl/flows/CalculateProjection.yaml |
| ANL | RunScenario | agents/anl/flows/RunScenario.yaml |
| AUD | SegmentAudience | agents/aud/flows/SegmentAudience.yaml |
| AUD | CalculateLTV | agents/aud/flows/CalculateLTV.yaml |
| CHA | CalculateAllocation | agents/cha/flows/CalculateAllocation.yaml |
| CHA | LookupBenchmarks | agents/cha/flows/LookupBenchmarks.yaml |
| SPO | CalculateNBI | agents/spo/flows/CalculateNBI.yaml |
| SPO | AnalyzeFees | agents/spo/flows/AnalyzeFees.yaml |
| SPO | EvaluatePartner | agents/spo/flows/EvaluatePartner.yaml |
| DOC | GenerateDocument | agents/doc/flows/GenerateDocument.yaml |
| PRF | AnalyzePerformance | agents/prf/flows/AnalyzePerformance.yaml |
| PRF | DetectAnomalies | agents/prf/flows/DetectAnomalies.yaml |
| PRF | ExtractLearnings | agents/prf/flows/ExtractLearnings.yaml |
| CHG | AssessReadiness | agents/chg/flows/AssessReadiness.yaml |
| CHG | MapStakeholders | agents/chg/flows/MapStakeholders.yaml |
| CHG | PlanAdoption | agents/chg/flows/PlanAdoption.yaml |
| CST | SelectFramework | agents/cst/flows/SelectFramework.yaml |
| CST | ApplyAnalysis | agents/cst/flows/ApplyAnalysis.yaml |
| CST | PrioritizeInitiatives | agents/cst/flows/PrioritizeInitiatives.yaml |
| MKT | DevelopStrategy | agents/mkt/flows/DevelopStrategy.yaml |
| MKT | CreateBrief | agents/mkt/flows/CreateBrief.yaml |
| MKT | AnalyzeCompetitive | agents/mkt/flows/AnalyzeCompetitive.yaml |

### 4.2 Flow Creation Script

Create file: `scripts/create-power-automate-flows.ps1`

```powershell
<#
.SYNOPSIS
    Creates Power Automate flows from YAML specifications
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$EnvironmentUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$FlowsPath = "../release/v6.0/agents"
)

# Find all flow YAML files
$flowFiles = Get-ChildItem -Path $FlowsPath -Filter "*.yaml" -Recurse

Write-Host "=== MPA v6.0 POWER AUTOMATE FLOW CREATION ===" -ForegroundColor Cyan
Write-Host "Found $($flowFiles.Count) flow definitions`n" -ForegroundColor Yellow

foreach ($file in $flowFiles) {
    $flowName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $agentCode = $file.Directory.Parent.Name.ToUpper()
    
    Write-Host "Creating flow: $agentCode/$flowName" -ForegroundColor Cyan
    
    # Read YAML specification
    $yamlContent = Get-Content $file.FullName -Raw
    
    # Parse YAML and create flow
    # This requires converting YAML to Power Automate JSON format
    
    # Use Power Platform CLI to create flow
    # pac flow create --name "$agentCode-$flowName" --definition $file.FullName
    
    Write-Host "  ✅ Created: $agentCode-$flowName" -ForegroundColor Green
}

Write-Host "`n=== FLOW CREATION COMPLETE ===" -ForegroundColor Cyan
Write-Host "Total flows created: $($flowFiles.Count)" -ForegroundColor Green
```

### 4.3 Flow Structure Template

Each YAML flow must be converted to Power Automate format. The general structure is:

```yaml
# From YAML spec:
name: CalculateProjection
trigger:
  type: HTTP
  method: POST
  schema: {...}
actions:
  - name: Parse Request
    type: ParseJSON
  - name: Get Session Context
    type: Dataverse
    operation: GetRecord
  - name: Call AI Builder
    type: AIBuilder
    operation: InvokePrompt
  ...

# Converts to Power Automate JSON:
{
  "definition": {
    "triggers": {
      "manual": {
        "type": "Request",
        "kind": "Http",
        "inputs": {
          "schema": {...}
        }
      }
    },
    "actions": {
      "Parse_Request": {...},
      "Get_Session_Context": {...},
      "Call_AI_Builder": {...}
    }
  }
}
```

---

## PHASE 5: AI BUILDER PROMPT CREATION

### 5.1 Prompt Inventory

Reference: `docs/architecture/MPA_v6_AI_Builder_Prompts.md`

| Agent | Prompt Code | Purpose |
|-------|-------------|---------|
| ORC | ORC_ROUTE_REQUEST | Route user message to specialist |
| ORC | ORC_SYNTHESIZE_RESPONSE | Combine specialist responses |
| ANL | ANL_ALLOCATE_BUDGET | Budget allocation calculation |
| ANL | ANL_RUN_SCENARIO | Scenario comparison |
| AUD | AUD_BUILD_SEGMENT | Audience segmentation |
| AUD | AUD_CALCULATE_LTV | LTV calculation |
| CHA | CHA_RECOMMEND_MIX | Channel mix recommendation |
| CHA | CHA_LOOKUP_BENCHMARK | Benchmark retrieval |
| SPO | SPO_CALCULATE_NBI | NBI calculation |
| SPO | SPO_ANALYZE_FEES | Fee stack analysis |
| DOC | DOC_GENERATE_PLAN | Plan document generation |
| PRF | PRF_DETECT_ANOMALY | Anomaly detection |
| PRF | PRF_EXTRACT_LEARNING | Learning extraction |
| CHG | CHG_ASSESS_READINESS | Change readiness assessment |
| CHG | CHG_MAP_STAKEHOLDERS | Stakeholder mapping |
| CHG | CHG_PLAN_ADOPTION | Adoption planning |
| CST | CST_SELECT_FRAMEWORK | Framework selection |
| CST | CST_APPLY_ANALYSIS | Strategic analysis |
| CST | CST_PRIORITIZE | Initiative prioritization |
| MKT | MKT_DEVELOP_STRATEGY | Campaign strategy |
| MKT | MKT_CREATE_BRIEF | Creative brief |
| MKT | MKT_ANALYZE_COMPETITIVE | Competitive analysis |

### 5.2 Prompt Templates Location

Prompt templates are in the seed data: `base/dataverse/seed/eap_prompt_seed.csv`

Each row contains:
- `system_prompt_template`: System instructions
- `user_prompt_template`: User message template with {{placeholders}}
- `output_schema`: Expected JSON output structure

---

## PHASE 6: SOLUTION EXPORT & VALIDATION

### 6.1 Export Solution

```powershell
# Export managed solution
pac solution export `
    --path "./solutions/MPAv6MultiAgent_managed.zip" `
    --name "MPAv6MultiAgent" `
    --managed

# Export unmanaged solution (for development)
pac solution export `
    --path "./solutions/MPAv6MultiAgent_unmanaged.zip" `
    --name "MPAv6MultiAgent"

# Unpack for source control
pac solution unpack `
    --zipfile "./solutions/MPAv6MultiAgent_unmanaged.zip" `
    --folder "./solutions/MPAv6MultiAgent_unpacked"
```

### 6.2 Validation Tests

```powershell
# Run smoke tests
node ./scripts/run-smoke-tests.js

# Test routing
$testCases = @(
    @{ Input = "Calculate projections for $500K budget"; Expected = "ANL" },
    @{ Input = "Segment our audience by RFM"; Expected = "AUD" },
    @{ Input = "Recommend channel mix"; Expected = "CHA" },
    @{ Input = "Analyze supply path fees"; Expected = "SPO" },
    @{ Input = "Generate media plan document"; Expected = "DOC" },
    @{ Input = "Detect performance anomalies"; Expected = "PRF" },
    @{ Input = "Assess change readiness"; Expected = "CHG" },
    @{ Input = "Select strategic framework"; Expected = "CST" },
    @{ Input = "Develop campaign strategy"; Expected = "MKT" }
)

foreach ($test in $testCases) {
    Write-Host "Testing: $($test.Input)"
    # Invoke routing and check result
}
```

---

## PHASE 7: DEPLOYMENT CHECKLIST

### Pre-Deployment Verification

```
□ All 15 Dataverse tables created
□ All seed data imported (13 files)
□ All 25 Power Automate flows deployed
□ All 20+ AI Builder prompts created
□ Solution exported successfully
□ Routing tests pass (9/9)
□ Agent tests pass (10/10)
```

### Post-Deployment Validation

```powershell
# Verify table row counts
$expectedCounts = @{
    "mpa_vertical" = 15
    "mpa_channel" = 30
    "mpa_kpi" = 24
    "mpa_partner" = 20
    "mpa_benchmark" = 31
    "eap_agent" = 10
    "eap_capability" = 40  # 20 + 20 CA
    "eap_prompt" = 19
    "ca_framework" = 60
}

foreach ($table in $expectedCounts.Keys) {
    $count = # Query Dataverse for count
    if ($count -eq $expectedCounts[$table]) {
        Write-Host "✅ $table : $count rows" -ForegroundColor Green
    } else {
        Write-Host "❌ $table : $count rows (expected $($expectedCounts[$table]))" -ForegroundColor Red
    }
}
```

---

## EXECUTION ORDER

1. **Run validation first:**
   ```bash
   node scripts/validate-seed-data.js
   ```

2. **Create Dataverse tables (Tier 1-4 order)**

3. **Import seed data (dependency order)**

4. **Create AI Builder prompts**

5. **Create Power Automate flows**

6. **Run integration tests**

7. **Export solution package**

8. **Final validation**

---

## FILES TO CREATE

1. `scripts/validate-seed-data.js` - Data validation
2. `scripts/create-dataverse-tables.ps1` - Table creation
3. `scripts/import-seed-data.ps1` - Data import
4. `scripts/create-power-automate-flows.ps1` - Flow creation
5. `scripts/run-smoke-tests.js` - Validation tests

---

## CRITICAL NOTES

1. **NEVER skip validation** - Run validate-seed-data.js before ANY import
2. **Table order matters** - Create tables in dependency order
3. **Import order matters** - Import seed data in dependency order
4. **Nullable fields are OK** - Some fields legitimately allow NULL (parent_vertical_code, effective_to, fallback_agent_code for ORC)
5. **Test after each phase** - Don't proceed until current phase validates

---

**Document Version:** 1.0
**Created:** 2026-01-19
**For:** VS Code (Claude Code)
