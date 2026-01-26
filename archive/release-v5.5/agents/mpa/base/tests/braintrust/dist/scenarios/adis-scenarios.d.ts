/**
 * ADIS Test Scenarios
 *
 * Tests for Audience Data Intelligence System integration in MPA v6.4
 * - Trigger detection for customer data mentions
 * - RFM/CLV/segmentation keyword recognition
 * - AMMO optimization offers at budget step
 * - Channel affinity references in channel selection
 */
import { TestScenario, UserPersona, QualityContext } from "../mpa-multi-turn-types.js";
export declare const dataRichRetailPersona: UserPersona;
export declare const customerValueFocusedPersona: UserPersona;
export declare const segmentationNewbiePersona: UserPersona;
export declare const adisTriggerContext: QualityContext;
export declare const adisTriggerScenario: TestScenario;
export declare const rfmAudienceCreationContext: QualityContext;
export declare const rfmAudienceCreationScenario: TestScenario;
export declare const ammoBudgetOptimizationContext: QualityContext;
export declare const ammoBudgetOptimizationScenario: TestScenario;
export declare const clvAnalysisContext: QualityContext;
export declare const clvAnalysisScenario: TestScenario;
export declare const segmentationNewbieContext: QualityContext;
export declare const segmentationNewbieScenario: TestScenario;
export declare const ADIS_SCENARIOS: TestScenario[];
export declare const ADIS_CONTEXTS: Record<string, QualityContext>;
export declare const ADIS_SCENARIO_METADATA: {
    "adis-trigger-detection": {
        name: string;
        description: string;
        expectedDuration: string;
        expectedTurns: string;
        difficulty: string;
        category: string;
        qualityFocus: string[];
    };
    "rfm-audience-creation": {
        name: string;
        description: string;
        expectedDuration: string;
        expectedTurns: string;
        difficulty: string;
        category: string;
        qualityFocus: string[];
    };
    "ammo-budget-optimization": {
        name: string;
        description: string;
        expectedDuration: string;
        expectedTurns: string;
        difficulty: string;
        category: string;
        qualityFocus: string[];
    };
    "clv-analysis-sophisticated": {
        name: string;
        description: string;
        expectedDuration: string;
        expectedTurns: string;
        difficulty: string;
        category: string;
        qualityFocus: string[];
    };
    "segmentation-newbie-user": {
        name: string;
        description: string;
        expectedDuration: string;
        expectedTurns: string;
        difficulty: string;
        category: string;
        qualityFocus: string[];
    };
};
//# sourceMappingURL=adis-scenarios.d.ts.map