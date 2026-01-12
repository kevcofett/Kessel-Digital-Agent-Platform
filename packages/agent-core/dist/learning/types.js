/**
 * Self-Learning System Types
 *
 * Types for the continuous learning system that enables agents
 * to improve over time through self-critique, success patterns,
 * and knowledge base enhancement.
 */
/**
 * Default learning configuration
 */
export const DEFAULT_LEARNING_CONFIG = {
    exemplaryThreshold: 0.85,
    minPatternObservations: 3,
    critiqueDimensionWeights: {
        accuracy: 0.25,
        completeness: 0.20,
        clarity: 0.15,
        citation: 0.20,
        helpfulness: 0.20,
    },
    enableAutoEnhancement: true,
    patternDecayDays: 90,
};
//# sourceMappingURL=types.js.map