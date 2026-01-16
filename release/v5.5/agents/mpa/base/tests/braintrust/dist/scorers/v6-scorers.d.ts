/**
 * V6.0 Specific Scorers
 *
 * New scorers for MPA v6.0 KB architecture:
 * - benchmark-vertical-coverage: Validates vertical-appropriate benchmark retrieval
 * - web-search-trigger: Validates web search detection for external data
 * - kb-routing-validation: Validates META tag routing compliance
 *
 * SCORER_SPECIFICATION: v3.0
 */
import { TurnScore } from "../mpa-multi-turn-types.js";
/**
 * Supported verticals in MPA v6.0 benchmark dataset (331 records)
 */
export declare const SUPPORTED_VERTICALS: readonly ["RETAIL", "ECOMMERCE", "CPG", "FINANCE", "TECHNOLOGY", "HEALTHCARE", "AUTOMOTIVE", "TRAVEL", "ENTERTAINMENT", "TELECOM", "GAMING", "HOSPITALITY", "EDUCATION", "B2B_PROFESSIONAL"];
export type SupportedVertical = typeof SUPPORTED_VERTICALS[number];
/**
 * Supported channels for benchmark data
 */
export declare const SUPPORTED_CHANNELS: readonly ["PAID_SEARCH", "PAID_SOCIAL", "PROGRAMMATIC_DISPLAY", "CTV_OTT"];
/**
 * Normalize a vertical string to standard format
 */
export declare function normalizeVertical(vertical: string): SupportedVertical | null;
/**
 * Check if a vertical is supported
 */
export declare function isVerticalSupported(vertical: string): boolean;
/**
 * Score benchmark vertical coverage
 *
 * Validates that agent retrieves vertical-appropriate benchmarks when citing data.
 * Weight: 2% (Tier 3)
 *
 * @param output - Agent response
 * @param userVertical - User's industry vertical (from conversation context)
 * @returns TurnScore with benchmark coverage assessment
 */
export declare function scoreBenchmarkVerticalCoverage(output: string, userVertical?: string): TurnScore;
/**
 * Score web search trigger detection
 *
 * Validates that agent appropriately triggers web search for external data
 * and doesn't fabricate census/taxonomy data.
 * Weight: 2% (Tier 3)
 *
 * @param output - Agent response
 * @param input - User input (for context)
 * @returns TurnScore with web search trigger assessment
 */
export declare function scoreWebSearchTrigger(output: string, input: string): TurnScore;
/**
 * Detect primary intent from user input
 */
export declare function detectIntent(input: string): string | null;
/**
 * Score KB routing validation
 *
 * Validates that agent retrieves appropriate KB documents for detected intent.
 * This is a diagnostic scorer for RAG system validation.
 *
 * @param output - Agent response
 * @param input - User input
 * @param retrievedDocs - Documents actually retrieved (from RAG system)
 * @returns TurnScore with routing validation
 */
export declare function scoreKbRoutingValidation(output: string, input: string, retrievedDocs?: string[]): TurnScore;
/**
 * Score confidence level attribution
 *
 * Validates that agent includes confidence levels when citing KB data.
 * v6.0 KB documents include META_CONFIDENCE tags.
 *
 * @param output - Agent response
 * @returns TurnScore with confidence level assessment
 */
export declare function scoreConfidenceLevelAttribution(output: string): TurnScore;
//# sourceMappingURL=v6-scorers.d.ts.map