/**
 * Source Citation Scorer (10% weight)
 *
 * TIER 1: CORE QUALITY BEHAVIOR
 *
 * Evaluates: Every data claim MUST cite exactly one of five sources using exact phrasing.
 */

export interface SourceCitationResult {
  score: number;
  rationale: string;
  claims: ClaimAnalysis[];
}

interface ClaimAnalysis {
  claim: string;
  hasExplicitSource: boolean;
  hasImplicitSource: boolean;
  sourceType?: string;
}

// The 5 required source patterns
const SOURCE_PATTERNS = [
  { pattern: /Based on Knowledge Base/i, requiresLink: false, name: 'Knowledge Base' },
  { pattern: /Based on Websearch.*\[source:/i, requiresLink: true, name: 'Websearch' },
  { pattern: /Based on API Call/i, requiresLink: false, name: 'API Call' },
  { pattern: /Based on User Provided/i, requiresLink: false, name: 'User Provided' },
  { pattern: /Based on Benchmark.*\[source:/i, requiresLink: true, name: 'Benchmark' },
];

// Implicit source patterns (partial credit)
const IMPLICIT_PATTERNS = [
  /you mentioned/i,
  /you (said|provided|told me)/i,
  /typical(ly)?( range)?/i,
  /industry (data|benchmarks?)/i,
  /generally (runs?|ranges?)/i,
  /based on (your|what you)/i,
  /per your/i,
  /as you (mentioned|said|noted)/i,
];

// Patterns that indicate a data claim
const CLAIM_PATTERNS = [
  /\$[\d,]+[KkMm]?/g,  // Dollar amounts
  /[\d]+(\.\d+)?%/g,    // Percentages
  /[\d,]+\s+(customers?|conversions?|leads?|users?)/gi,  // Volume metrics
  /CAC\s+(of\s+)?\$?[\d,]+/gi,  // CAC claims
  /ROAS\s+(of\s+)?[\d.]+/gi,    // ROAS claims
  /CPM\s+(of\s+)?\$?[\d,]+/gi,  // CPM claims
  /CPA\s+(of\s+)?\$?[\d,]+/gi,  // CPA claims
  /range\s+(of\s+)?\$?[\d,]+-\$?[\d,]+/gi,  // Range claims
];

/**
 * Extract quantitative claims from response
 */
function extractQuantitativeClaims(response: string): string[] {
  const claims: string[] = [];

  for (const pattern of CLAIM_PATTERNS) {
    const matches = response.match(pattern);
    if (matches) {
      claims.push(...matches);
    }
  }

  // Deduplicate
  return [...new Set(claims)];
}

/**
 * Check if a claim has an explicit source in nearby context
 */
function hasExplicitSource(response: string, claim: string): { has: boolean; sourceType?: string } {
  // Find the claim position
  const claimIndex = response.indexOf(claim);
  if (claimIndex === -1) {
    return { has: false };
  }

  // Check within 200 chars before and after for source patterns
  const contextStart = Math.max(0, claimIndex - 200);
  const contextEnd = Math.min(response.length, claimIndex + claim.length + 200);
  const context = response.slice(contextStart, contextEnd);

  for (const source of SOURCE_PATTERNS) {
    if (source.pattern.test(context)) {
      // If link required, check for it
      if (source.requiresLink) {
        if (/\[source:\s*\S+\]/i.test(context) || /https?:\/\/\S+/i.test(context)) {
          return { has: true, sourceType: source.name };
        }
      } else {
        return { has: true, sourceType: source.name };
      }
    }
  }

  return { has: false };
}

/**
 * Check if a claim has an implicit source
 */
function hasImplicitSource(response: string, claim: string): boolean {
  const claimIndex = response.indexOf(claim);
  if (claimIndex === -1) {
    return false;
  }

  // Check within 150 chars before for implicit patterns
  const contextStart = Math.max(0, claimIndex - 150);
  const context = response.slice(contextStart, claimIndex + claim.length + 50);

  return IMPLICIT_PATTERNS.some(pattern => pattern.test(context));
}

/**
 * Score source citation
 */
export function scoreSourceCitation(response: string): SourceCitationResult {
  const claims = extractQuantitativeClaims(response);

  // If no claims, perfect score
  if (claims.length === 0) {
    return {
      score: 1.0,
      rationale: 'No quantitative claims to cite',
      claims: [],
    };
  }

  const claimAnalyses: ClaimAnalysis[] = [];
  let totalScore = 0;

  for (const claim of claims) {
    const explicit = hasExplicitSource(response, claim);
    const implicit = hasImplicitSource(response, claim);

    const analysis: ClaimAnalysis = {
      claim,
      hasExplicitSource: explicit.has,
      hasImplicitSource: implicit,
      sourceType: explicit.sourceType,
    };
    claimAnalyses.push(analysis);

    if (explicit.has) {
      totalScore += 1.0;
    } else if (implicit) {
      totalScore += 0.7;
    } else {
      totalScore += 0.3;
    }
  }

  const avgScore = totalScore / claims.length;

  // Build rationale
  const explicitCount = claimAnalyses.filter(c => c.hasExplicitSource).length;
  const implicitCount = claimAnalyses.filter(c => c.hasImplicitSource && !c.hasExplicitSource).length;
  const unattributedCount = claims.length - explicitCount - implicitCount;

  let rationale = `${claims.length} claims found: `;
  if (explicitCount > 0) rationale += `${explicitCount} with explicit source, `;
  if (implicitCount > 0) rationale += `${implicitCount} with implicit source, `;
  if (unattributedCount > 0) rationale += `${unattributedCount} unattributed`;
  rationale = rationale.replace(/, $/, '');

  return {
    score: Math.round(avgScore * 100) / 100,
    rationale,
    claims: claimAnalyses,
  };
}

export default scoreSourceCitation;
