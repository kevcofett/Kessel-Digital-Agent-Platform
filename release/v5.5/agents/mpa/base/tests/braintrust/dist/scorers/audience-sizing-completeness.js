/**
 * Audience Sizing Completeness Scorer (6% weight)
 *
 * TIER 3: ADVANCED QUALITY
 *
 * Evaluates: When in Step 4 Geography, agent MUST present audience sizing table
 * before proceeding to Step 5.
 */
/**
 * Analyze table structure in response
 */
function analyzeTable(text) {
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
        };
    }
    // Get header row (first row with pipes)
    const headerRow = tableMatch[0].toLowerCase();
    // Check for required columns
    const hasGeoColumn = /dma|geography|market|region|city|metro|location/i.test(headerRow);
    const hasPopulationColumn = /population|pop\b|total\s*pop/i.test(headerRow);
    const hasTargetAudienceColumn = /target\s*(audience|aud)?|addressable|audience\s*size/i.test(headerRow);
    const hasTargetPercentColumn = /(target|tgt)?\s*%|percent|penetration/i.test(headerRow);
    // Check for TOTAL row
    const hasTotalRow = /\|\s*total\s*\|/i.test(text);
    // Check for multiple DMAs (at least 2 data rows plus header and total)
    // Count non-header, non-separator rows
    const dataRows = tableMatch.filter(row => !row.includes('---') &&
        !row.includes('===') &&
        !/dma|geography|market|region/i.test(row) &&
        !/^\s*\|[\s-]+\|/.test(row));
    const hasMultipleDMAs = dataRows.length >= 2;
    // Check for weighted average (harder to verify, look for patterns)
    // Weighted average should show a different percentage in TOTAL than simple average
    const hasWeightedAverage = checkWeightedAverage(text, tableMatch);
    return {
        hasTable: true,
        hasGeoColumn,
        hasPopulationColumn,
        hasTargetAudienceColumn,
        hasTargetPercentColumn,
        hasTotalRow,
        hasMultipleDMAs,
        hasWeightedAverage,
    };
}
/**
 * Check if TOTAL row appears to use weighted average
 */
function checkWeightedAverage(text, tableRows) {
    // Look for TOTAL row
    const totalRowIndex = tableRows.findIndex(row => /total/i.test(row));
    if (totalRowIndex === -1)
        return false;
    const totalRow = tableRows[totalRowIndex];
    // Extract percentage from TOTAL row
    const percentMatch = totalRow.match(/(\d+\.?\d*)%/);
    if (!percentMatch)
        return false;
    // If there's a TOTAL with a percentage that's not 100%, assume weighted
    // (This is a heuristic - true verification would require calculation)
    const totalPercent = parseFloat(percentMatch[1]);
    return totalPercent > 0 && totalPercent < 100;
}
/**
 * Score audience sizing completeness
 */
export function scoreAudienceSizingCompleteness(response, currentStep) {
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
            },
        };
    }
    const analysis = analyzeTable(response);
    // No table at all
    if (!analysis.hasTable) {
        return {
            score: 0.0,
            rationale: 'No audience sizing table found in Step 4+ response',
            analysis,
        };
    }
    // Calculate score based on component weights
    let score = 0;
    const components = [];
    const missing = [];
    if (analysis.hasGeoColumn) {
        score += 0.15;
        components.push('geo column');
    }
    else {
        missing.push('geo column');
    }
    if (analysis.hasPopulationColumn) {
        score += 0.15;
        components.push('population column');
    }
    else {
        missing.push('population column');
    }
    if (analysis.hasTargetAudienceColumn) {
        score += 0.15;
        components.push('target audience column');
    }
    else {
        missing.push('target audience column');
    }
    if (analysis.hasTargetPercentColumn) {
        score += 0.10;
        components.push('target % column');
    }
    else {
        missing.push('target % column');
    }
    if (analysis.hasTotalRow) {
        score += 0.15;
        components.push('TOTAL row');
    }
    else {
        missing.push('TOTAL row');
    }
    if (analysis.hasMultipleDMAs) {
        score += 0.15;
        components.push('multiple DMAs');
    }
    else {
        missing.push('multiple DMAs');
    }
    if (analysis.hasWeightedAverage) {
        score += 0.15;
        components.push('weighted average');
    }
    else {
        missing.push('weighted average');
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
//# sourceMappingURL=audience-sizing-completeness.js.map