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
/**
 * Score source citation
 */
export declare function scoreSourceCitation(response: string): SourceCitationResult;
export default scoreSourceCitation;
//# sourceMappingURL=source-citation.d.ts.map