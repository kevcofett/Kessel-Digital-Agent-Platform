#!/usr/bin/env node
/**
 * Dataverse Seed Data Import Script
 * Uses Azure CLI authentication to import CSV data to Dataverse tables
 *
 * CSV headers must match Dataverse column schema names exactly:
 * - mpa_verticalcode, mpa_newcolumn, mpa_description, mpa_isactive
 * - mpa_kpicode, mpa_newcolumn, mpa_category, mpa_formula, etc.
 * - mpa_channelcode, mpa_newcolumn, mpa_category, mpa_minbudget, etc.
 * - mpa_metricname, mpa_verticalcode, mpa_channelcode, mpa_kpicode, etc.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ORG_URL = 'https://aragornai.crm.dynamics.com';
const API_URL = `${ORG_URL}/api/data/v9.2`;

// Field types for proper conversion (Money and Decimal fields)
const FIELD_TYPES = {
  mpa_channel: {
    'mpa_minbudget': 'money',
    'mpa_cpmhigh': 'money',
    'mpa_cpmlow': 'decimal',
    'mpa_cpchigh': 'decimal',
    'mpa_cpclow': 'decimal',
    'mpa_isactive': 'boolean'
  },
  mpa_kpi: {
    'mpa_isactive': 'boolean'
  },
  mpa_vertical: {
    'mpa_isactive': 'boolean'
  },
  mpa_benchmark: {
    'mpa_metriclow': 'decimal',
    'mpa_metricmedian': 'decimal',
    'mpa_metrichigh': 'decimal',
    'mpa_metricbest': 'decimal',
    'mpa_isactive': 'boolean'
  }
};

// Columns to skip (not in Dataverse schema)
const SKIP_COLUMNS = {
  mpa_kpi: ['mpa_confidence_level'],
  mpa_channel: ['mpa_confidence_level'],
  mpa_benchmark: ['mpa_isactive']
};

const SEED_FILES = [
  { file: 'mpa_vertical_seed.csv', table: 'mpa_verticals', entity: 'mpa_vertical' },
  { file: 'mpa_kpi_seed.csv', table: 'mpa_kpis', entity: 'mpa_kpi' },
  { file: 'mpa_channel_seed.csv', table: 'mpa_channels', entity: 'mpa_channel' },
  { file: 'mpa_benchmark_seed.csv', table: 'mpa_benchmarks', entity: 'mpa_benchmark' },
];

const SEED_DIR = path.join(__dirname, '../release/v5.5/agents/mpa/base/data/seed');

function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    // Handle quoted fields with commas inside
    const values = [];
    let current = '';
    let inQuotes = false;

    for (const char of lines[i]) {
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

    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    rows.push(row);
  }
  return { headers, rows };
}

function convertValue(value, fieldType) {
  if (value === '' || value === undefined || value === null) {
    return null;
  }

  switch (fieldType) {
    case 'boolean':
      return value === 'Yes' || value === 'true' || value === true;
    case 'money':
    case 'decimal':
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    case 'integer':
      const int = parseInt(value, 10);
      return isNaN(int) ? null : int;
    default:
      return value;
  }
}

function mapRowToDataverse(row, entity) {
  const fieldTypes = FIELD_TYPES[entity] || {};
  const skipCols = SKIP_COLUMNS[entity] || [];

  const mapped = {};
  for (const [col, value] of Object.entries(row)) {
    // Skip columns not in Dataverse
    if (skipCols.includes(col)) continue;

    const fieldType = fieldTypes[col];
    let processedValue;

    if (fieldType) {
      processedValue = convertValue(value, fieldType);
    } else if (value === 'Yes') {
      processedValue = true;
    } else if (value === 'No') {
      processedValue = false;
    } else if (value === '') {
      processedValue = null;
    } else {
      processedValue = value;
    }

    // Only include non-null values
    if (processedValue !== null) {
      mapped[col] = processedValue;
    }
  }
  return mapped;
}

async function getAccessToken() {
  try {
    const token = execSync(
      `az account get-access-token --resource=${ORG_URL} --query accessToken -o tsv`,
      { encoding: 'utf8' }
    ).trim();
    return token;
  } catch (error) {
    console.error('Failed to get access token. Please run: az login');
    process.exit(1);
  }
}

async function createRecord(token, table, data) {
  const response = await fetch(`${API_URL}/${table}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText}`);
  }

  return response.json();
}

async function importSeedData() {
  console.log('Dataverse Seed Data Import');
  console.log('==========================\n');
  console.log('Getting access token...');
  const token = await getAccessToken();
  console.log('✓ Got access token\n');

  for (const { file, table, entity } of SEED_FILES) {
    const filePath = path.join(SEED_DIR, file);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠ Skipping ${file} - file not found`);
      continue;
    }

    console.log(`Importing ${file} → ${table}...`);
    const content = fs.readFileSync(filePath, 'utf8');
    const { rows } = parseCSV(content);

    let success = 0;
    let skipped = 0;
    let failed = 0;
    const errors = [];

    for (const row of rows) {
      try {
        const mappedData = mapRowToDataverse(row, entity);
        await createRecord(token, table, mappedData);
        success++;
        process.stdout.write('.');
      } catch (error) {
        if (error.message.includes('duplicate') || error.message.includes('DuplicateRecord') || error.message.includes('already exists')) {
          skipped++;
          process.stdout.write('s');
        } else {
          failed++;
          process.stdout.write('x');
          if (errors.length < 5) {
            const rowId = row.mpa_channelcode || row.mpa_kpicode || row.mpa_verticalcode || row.mpa_metricname || 'unknown';
            errors.push({ rowId, error: error.message.substring(0, 200) });
          }
        }
      }
    }

    console.log(`\n✓ ${file}: ${success} created, ${skipped} skipped (duplicates), ${failed} failed\n`);

    if (errors.length > 0) {
      console.log('Sample errors:');
      errors.forEach(e => console.log(`  ${e.rowId}: ${e.error}\n`));
    }
  }

  console.log('Import complete!');
}

importSeedData().catch(console.error);
