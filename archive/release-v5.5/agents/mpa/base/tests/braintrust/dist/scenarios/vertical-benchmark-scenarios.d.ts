/**
 * Vertical Benchmark Test Scenarios
 *
 * Tests for MPA v6.0 expanded benchmark coverage across 14 verticals.
 * These scenarios validate that the agent retrieves and applies
 * vertical-appropriate benchmark data.
 *
 * SUPPORTED VERTICALS (14):
 * - Tier 1: RETAIL, ECOMMERCE, CPG, FINANCE, TECHNOLOGY
 * - Tier 2: HEALTHCARE, AUTOMOTIVE, TRAVEL, ENTERTAINMENT, TELECOM
 * - Tier 3: GAMING, HOSPITALITY, EDUCATION, B2B_PROFESSIONAL
 */
import { TestScenario, UserPersona, QualityContext } from "../mpa-multi-turn-types.js";
export declare const retailMarketingManagerPersona: UserPersona;
export declare const healthcareMarketingDirectorPersona: UserPersona;
export declare const gamingStartupFounderPersona: UserPersona;
export declare const b2bSaasVpMarketingPersona: UserPersona;
export declare const retailBenchmarkContext: QualityContext;
export declare const healthcareBenchmarkContext: QualityContext;
export declare const gamingBenchmarkContext: QualityContext;
export declare const b2bBenchmarkContext: QualityContext;
export declare const retailBenchmarkScenario: TestScenario;
export declare const healthcareBenchmarkScenario: TestScenario;
export declare const gamingBenchmarkScenario: TestScenario;
export declare const b2bBenchmarkScenario: TestScenario;
export declare const VERTICAL_BENCHMARK_SCENARIOS: TestScenario[];
export default VERTICAL_BENCHMARK_SCENARIOS;
//# sourceMappingURL=vertical-benchmark-scenarios.d.ts.map