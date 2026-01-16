/**
 * Audience Sizing Completeness Scorer v2.1 (6% weight)
 *
 * TIER 3: ADVANCED QUALITY
 *
 * SCORER_SPECIFICATION_v2.1 Updates:
 * - ADDED: Census source citation present (12%)
 * - ADDED: Calculation methodology shown (10%)
 * - ADDED: Taxonomy codes present (10%)
 * - REBALANCED: Existing components reduced proportionally
 *
 * Evaluates: When in Step 4 Geography, agent MUST present audience sizing table
 * with census-validated data and taxonomy codes before proceeding to Step 5.
 */

export interface AudienceSizingResult {
  score: number;
  rationale: string;
  analysis: TableAnalysis;
}

export interface TableAnalysis {
  hasTable: boolean;
  hasGeoColumn: boolean;
  hasPopulationColumn: boolean;
  hasTargetAudienceColumn: boolean;
  hasTargetPercentColumn: boolean;
  hasTotalRow: boolean;
  hasMultipleDMAs: boolean;
  hasWeightedAverage: boolean;
  // v2.1 additions
  hasCensusCitation: boolean;
  hasCalculationMethodology: boolean;
  hasTaxonomyCodes: boolean;
}

/**
 * Check for census/official data source citation
 * 
 * Per SCORER_SPECIFICATION_v2.1:
 * Census patterns include US Census, ACS, Statistics Canada, 
 * Eurostat, and other national statistical offices
 */
function checkCensusCitation(text: string): boolean {
  const censusPatterns = [
    /census/i,
    /acs\s*\d{4}/i,
    /american community survey/i,
    /statistics canada/i,
    /statcan/i,
    /ons\.gov/i,
    /eurostat/i,
    /abs\.gov/i,
    /inegi/i,
    /ibge/i,
    /data source/i,
    /population data from/i,
    /according to census/i,
    /census bureau/i,
    /official statistics/i,
    /government data/i,
    /national statistics/i,
  ];
  return censusPatterns.some(p => p.test(text));
}

/**
 * Check for taxonomy codes (platform targeting)
 * 
 * Per SCORER_SPECIFICATION_v2.1:
 * Taxonomy patterns include IAB categories, Google/Meta/LinkedIn
 * targeting taxonomies, and platform-specific segments
 */
function checkTaxonomyCodes(text: string): boolean {
  const taxonomyPatterns = [
    /iab\d+/i,
    /iab-?\d+/i,
    /iab[\s-]?category/i,
    /\/affinity\//i,
    /\/in-market\//i,
    /google (affinity|in-market)/i,
    /meta (interests?|behaviors?)/i,
    /facebook (interests?|behaviors?)/i,
    /linkedin targeting/i,
    /interests?:/i,
    /behaviors?:/i,
    /contextual targeting/i,
    /taxonomy/i,
    /audience segment/i,
    /targeting segment/i,
    /custom audience/i,
    /lookalike/i,
    /similar audience/i,
    /first-party data/i,
    /1p data/i,
  ];
  return taxonomyPatterns.some(p => p.test(text));
}

/**
 * Check for calculation methodology explanation
 * 
 * Agent should show HOW audience size was calculated,
 * not just present the numbers
 */
function checkCalculationMethodology(text: string): boolean {
  const methodologyPatterns = [
    /calculated (by|as|using)/i,
    /methodology/i,
    /derived from/i,
    /based on.*population/i,
    /applying.*rate/i,
    /penetration rate/i,
    /conversion rate/i,
    /\* (total|population|base)/i,
    /multiplied by/i,
    /times the/i,
    /percent of/i,
    /% of total/i,
    /here's how/i,
    /calculation:/i,
    /formula:/i,
    /audience = /i,
    /target = /i,
  ];
  return methodologyPatterns.some(p => p.test(text));
}

/**
 * Analyze table structure in response
 */
function analyzeTable(text: string): TableAnalysis {
  // Check for table presence (pipe-separated format)
  const tableMatch = text.match(/\|[^|]+\|[^|]+\|/gm);

  if (!tableMatch || tableMatch.length < 2) {
    return {
      hasTable: false,
      hasGeoColumn: false,
      hasPopulationColumn: false,
      hasTargetAudienceColumn: false,
      hasTargetPercentColumn: false,
      hasTotalRow: false,
      hasMultipleDMAs: false,
      hasWeightedAverage: false,
      hasCensusCitation: checkCensusCitation(text),
      hasCalculationMethodology: checkCalculationMethodology(text),
      hasTaxonomyCodes: checkTaxonomyCodes(text),
    };
  }

  // Get header row (first row with pipes)
  const headerRow = tableMatch[0].toLowerCase();

  // Check for required columns
  const hasGeoColumn = /dma|geography|market|region|city|metro|location|area/i.test(headerRow);
  const hasPopulationColumn = /population|pop\b|total\s*pop/i.test(headerRow);
  const hasTargetAudienceColumn = /target\s*(audience|aud)?|addressable|audience\s*size/i.test(headerRow);
  const hasTargetPercentColumn = /(target|tgt)?\s*%|percent|penetration/i.test(headerRow);

  // Check for TOTAL row
  const hasTotalRow = /\|\s*(\**)?(total|grand total|sum|rollup)(\**)?\s*\|/i.test(text);

  // Check for multiple DMAs (at least 2 data rows plus header and total)
  // Count non-header, non-separator rows
  const dataRows = tableMatch.filter(row =>
    !row.includes('---') &&
    !row.includes('===') &&
    !/dma|geography|market|region/i.test(row) &&
    !/^\s*\|[\s-]+\|/.test(row)
  );
  const hasMultipleDMAs = dataRows.length >= 2;

  // Check for weighted average (harder to verify, look for patterns)
  const hasWeightedAverage = checkWeightedAverage(text, tableMatch);

  // v2.1: Check for census citation, methodology, and taxonomy codes
  const hasCensusCitation = checkCensusCitation(text);
  const hasCalculationMethodology = checkCalculationMethodology(text);
  const hasTaxonomyCodes = checkTaxonomyCodes(text);

  return {
    hasTable: true,
    hasGeoColumn,
    hasPopulationColumn,
    hasTargetAudienceColumn,
    hasTargetPercentColumn,
    hasTotalRow,
    hasMultipleDMAs,
    hasWeightedAverage,
    hasCensusCitation,
    hasCalculationMethodology,
    hasTaxonomyCodes,
  };
}

/**
 * Check if TOTAL row appears to use weighted average
 */
function checkWeightedAverage(text: string, tableRows: string[]): boolean {
  // Look for TOTAL row
  const totalRowIndex = tableRows.findIndex(row => /total/i.test(row));
  if (totalRowIndex === -1) return false;

  const totalRow = tableRows[totalRowIndex];

  // Extract percentage from TOTAL row
  const percentMatch = totalRow.match(/(\d+\.?\d*)%/);
  if (!percentMatch) return false;

  // If there's a TOTAL with a percentage that's not 100%, assume weighted
  // (This is a heuristic - true verification would require calculation)
  const totalPercent = parseFloat(percentMatch[1]);
  return totalPercent > 0 && totalPercent < 100;
}

/**
 * Score audience sizing completeness v2.1
 * 
 * Component weights (total = 100%):
 * - DMA/Geography column: 10%
 * - Total Population column: 10%
 * - Target Audience column (whole numbers): 10%
 * - Target % column: 8%
 * - TOTAL row with aggregation: 10%
 * - Multiple DMAs if regional/national: 10%
 * - Weighted average for percentages: 10%
 * - Census source citation: 12%
 * - Calculation methodology: 10%
 * - Taxonomy codes: 10%
 */
export function scoreAudienceSizingCompleteness(
  response: string,
  currentStep: number
): AudienceSizingResult {
  // Not applicable before Step 4
  if (currentStep < 4) {
    return {
      score: 1.0,
      rationale: 'Not applicable - before Step 4 Geography',
      analysis: {
        hasTable: false,
        hasGeoColumn: false,
        hasPopulationColumn: false,
        hasTargetAudienceColumn: false,
        hasTargetPercentColumn: false,
        hasTotalRow: false,
        hasMultipleDMAs: false,
        hasWeightedAverage: false,
        hasCensusCitation: false,
        hasCalculationMethodology: false,
        hasTaxonomyCodes: false,
      },
    };
  }

  const analysis = analyzeTable(response);

  // No table at all - but may still have census/methodology/taxonomy
  if (!analysis.hasTable) {
    // Give partial credit for data quality elements even without table
    let score = 0;
    const components: string[] = [];

    if (analysis.hasCensusCitation) {
      score += 0.12;
      components.push('census citation');
    }
    if (analysis.hasCalculationMethodology) {
      score += 0.10;
      components.push('methodology');
    }
    if (analysis.hasTaxonomyCodes) {
      score += 0.10;
      components.push('taxonomy codes');
    }

    return {
      score: Math.round(score * 100) / 100,
      rationale: components.length > 0
        ? `No table, but has: ${components.join(', ')}`
        : 'No audience sizing table found in Step 4+ response',
      analysis,
    };
  }

  // Calculate score based on v2.1 component weights
  let score = 0;
  const components: string[] = [];
  const missing: string[] = [];

  // Table structure components (68% total)
  if (analysis.hasGeoColumn) {
    score += 0.10;
    components.push('geo column');
  } else {
    missing.push('geo column');
  }

  if (analysis.hasPopulationColumn) {
    score += 0.10;
    components.push('population column');
  } else {
    missing.push('population column');
  }

  if (analysis.hasTargetAudienceColumn) {
    score += 0.10;
    components.push('target audience column');
  } else {
    missing.push('target audience column');
  }

  if (analysis.hasTargetPercentColumn) {
    score += 0.08;
    components.push('target % column');
  } else {
    missing.push('target % column');
  }

  if (analysis.hasTotalRow) {
    score += 0.10;
    components.push('TOTAL row');
  } else {
    missing.push('TOTAL row');
  }

  if (analysis.hasMultipleDMAs) {
    score += 0.10;
    components.push('multiple DMAs');
  } else {
    missing.push('multiple DMAs');
  }

  if (analysis.hasWeightedAverage) {
    score += 0.10;
    components.push('weighted average');
  } else {
    missing.push('weighted average');
  }

  // v2.1 additions: Data quality components (32% total)
  if (analysis.hasCensusCitation) {
    score += 0.12;
    components.push('census citation');
  } else {
    missing.push('census citation');
  }

  if (analysis.hasCalculationMethodology) {
    score += 0.10;
    components.push('methodology');
  } else {
    missing.push('methodology');
  }

  if (analysis.hasTaxonomyCodes) {
    score += 0.10;
    components.push('taxonomy codes');
  } else {
    missing.push('taxonomy codes');
  }

  // Build rationale
  let rationale = `Table found with: ${components.join(', ')}.`;
  if (missing.length > 0) {
    rationale += ` Missing: ${missing.join(', ')}.`;
  }

  return {
    score: Math.round(score * 100) / 100,
    rationale,
    analysis,
  };
}

export default scoreAudienceSizingCompleteness;
