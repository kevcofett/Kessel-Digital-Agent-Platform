/**
 * KB Impact Tracking Types
 *
 * Defines interfaces for tracking which KB documents contribute
 * to successful vs unsuccessful agent responses.
 */
export const DEFAULT_KB_IMPACT_CONFIG = {
    agentId: 'unknown',
    minUsagesForImpact: 10,
    confidenceThreshold: 0.7,
    deprecationThreshold: -0.15,
    enhancementThreshold: 0.05,
    autoGenerateProposals: true,
    maxProposalQueueSize: 100,
};
//# sourceMappingURL=kb-impact-types.js.map