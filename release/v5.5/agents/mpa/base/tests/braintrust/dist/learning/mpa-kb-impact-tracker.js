/**
 * MPA KB Impact Tracker
 *
 * MPA-specific implementation of KB impact tracking.
 * Extends BaseKBImpactTracker with media planning domain knowledge.
 */
import { BaseKBImpactTracker, LocalKBImpactStorage } from '@kessel-digital/agent-core';
import * as path from 'path';
// ============================================================================
// MPA-SPECIFIC TOPIC EXTRACTION
// ============================================================================
const MPA_TOPIC_KEYWORDS = {
    'budget': ['budget', 'spend', 'allocation', 'investment', 'cost', 'funding'],
    'audience': ['audience', 'targeting', 'segment', 'persona', 'demographic'],
    'channel': ['channel', 'media', 'platform', 'tactic', 'paid search', 'social'],
    'measurement': ['measurement', 'attribution', 'tracking', 'analytics', 'kpi'],
    'benchmark': ['benchmark', 'average', 'typical', 'industry', 'baseline'],
    'creative': ['creative', 'messaging', 'ad copy', 'content', 'value prop'],
    'optimization': ['optimization', 'improve', 'efficiency', 'performance'],
    'testing': ['test', 'experiment', 'incrementality', 'holdout', 'lift'],
};
const MPA_STEP_KEYWORDS = {
    1: ['objective', 'goal', 'kpi', 'target'],
    2: ['economics', 'ltv', 'cac', 'unit economics'],
    3: ['audience', 'targeting', 'segment'],
    4: ['geography', 'geo', 'region', 'dma'],
    5: ['budget', 'spend', 'allocation'],
    6: ['value proposition', 'messaging', 'creative'],
    7: ['channel', 'media', 'tactic'],
    8: ['measurement', 'attribution'],
    9: ['testing', 'experiment'],
    10: ['risk', 'contingency'],
};
// ============================================================================
// MPA KB IMPACT TRACKER
// ============================================================================
export class MPAKBImpactTracker extends BaseKBImpactTracker {
    constructor(config) {
        const storagePath = path.join(process.cwd(), '.mpa-kb-impact');
        const storage = new LocalKBImpactStorage(storagePath);
        super({
            agentId: 'mpa',
            minUsagesForImpact: 10,
            confidenceThreshold: 0.7,
            deprecationThreshold: -0.15,
            enhancementThreshold: 0.05,
            autoGenerateProposals: true,
            maxProposalQueueSize: 100,
            ...config,
        }, storage);
    }
    /**
     * Extract MPA-specific topics from a query
     */
    extractTopics(query) {
        const normalizedQuery = query.toLowerCase();
        const topics = [];
        // Extract domain topics
        for (const [topic, keywords] of Object.entries(MPA_TOPIC_KEYWORDS)) {
            for (const keyword of keywords) {
                if (normalizedQuery.includes(keyword)) {
                    topics.push(topic);
                    break;
                }
            }
        }
        // Extract step references
        for (const [step, keywords] of Object.entries(MPA_STEP_KEYWORDS)) {
            for (const keyword of keywords) {
                if (normalizedQuery.includes(keyword)) {
                    topics.push(`step-${step}`);
                    break;
                }
            }
        }
        // Fall back to base implementation if no domain topics found
        if (topics.length === 0) {
            return super.extractTopics(query);
        }
        return [...new Set(topics)];
    }
    /**
     * Extract document title with MPA-specific logic
     */
    extractDocumentTitle(documentId) {
        // MPA documents often have prefixes like KB_, MPA_, etc.
        let title = documentId
            .replace(/^(KB_|MPA_|mpa_)/i, '')
            .replace(/[-_]/g, ' ')
            .replace(/\.\w+$/, '')
            .trim();
        // Capitalize first letter of each word
        title = title.replace(/\b\w/g, c => c.toUpperCase());
        return title;
    }
}
// ============================================================================
// FACTORY FUNCTION
// ============================================================================
export function createMPAKBImpactTracker(config) {
    return new MPAKBImpactTracker(config);
}
export default MPAKBImpactTracker;
//# sourceMappingURL=mpa-kb-impact-tracker.js.map