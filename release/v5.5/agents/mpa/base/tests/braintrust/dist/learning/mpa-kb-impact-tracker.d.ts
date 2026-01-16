/**
 * MPA KB Impact Tracker
 *
 * MPA-specific implementation of KB impact tracking.
 * Extends BaseKBImpactTracker with media planning domain knowledge.
 */
import { BaseKBImpactTracker } from '@kessel-digital/agent-core';
import type { KBImpactTrackerConfig } from '@kessel-digital/agent-core';
export declare class MPAKBImpactTracker extends BaseKBImpactTracker {
    constructor(config?: Partial<KBImpactTrackerConfig>);
    /**
     * Extract MPA-specific topics from a query
     */
    protected extractTopics(query: string): string[];
    /**
     * Extract document title with MPA-specific logic
     */
    protected extractDocumentTitle(documentId: string): string;
}
export declare function createMPAKBImpactTracker(config?: Partial<KBImpactTrackerConfig>): MPAKBImpactTracker;
export default MPAKBImpactTracker;
//# sourceMappingURL=mpa-kb-impact-tracker.d.ts.map