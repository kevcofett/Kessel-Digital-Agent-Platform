/**
 * KB Document Update Pipeline
 *
 * Programmatically updates KB documents based on impact analysis,
 * uploads to SharePoint, and tracks changes for before/after comparison.
 *
 * Pipeline stages:
 * 1. Analyze KB impact from evaluation results
 * 2. Generate optimization recommendations
 * 3. Apply updates to local KB files
 * 4. Upload updated files to SharePoint
 * 5. Track baseline for comparison
 * 6. Trigger re-evaluation with updated KB
 *
 * Usage:
 *   # Analyze and generate recommendations (no changes)
 *   npx ts-node --esm kb-update-pipeline.ts --analyze
 *
 *   # Apply recommendations and upload to SharePoint
 *   npx ts-node --esm kb-update-pipeline.ts --apply --upload
 *
 *   # Full pipeline: analyze, apply, upload, re-evaluate
 *   npx ts-node --esm kb-update-pipeline.ts --full-pipeline
 */
import { KBOptimizationRecommendation } from "./kb-impact-tracker.js";
/**
 * KB baseline record - tracks document versions before/after optimization
 */
export interface KBBaselineRecord {
    timestamp: number;
    promptVersion: string;
    documents: {
        id: string;
        filename: string;
        version: string;
        contentHash: string;
        lastModified: string;
    }[];
    evaluationResults?: {
        overallComposite: number;
        perScenarioScores: Record<string, number>;
    };
}
/**
 * Create a baseline snapshot of current KB documents
 */
declare function createKBBaseline(promptVersion: string): KBBaselineRecord;
/**
 * Save KB baseline to file
 */
declare function saveKBBaseline(baseline: KBBaselineRecord, label?: string): string;
/**
 * Load most recent KB baseline
 */
declare function loadLatestKBBaseline(): KBBaselineRecord | null;
/**
 * Compare two KB baselines
 */
declare function compareKBBaselines(before: KBBaselineRecord, after: KBBaselineRecord): {
    changed: string[];
    added: string[];
    removed: string[];
    unchanged: string[];
};
/**
 * Update types supported by the pipeline
 */
export declare enum KBUpdateType {
    ADD_BENCHMARK = "add_benchmark",
    CLARIFY_SECTION = "clarify_section",
    ADD_EXAMPLE = "add_example",
    SIMPLIFY_LANGUAGE = "simplify_language",
    ADD_SOURCE_CITATION = "add_source_citation",
    CONSOLIDATE_CONTENT = "consolidate_content",
    RESTRUCTURE_HEADERS = "restructure_headers"
}
/**
 * KB update specification
 */
export interface KBUpdate {
    documentId: string;
    updateType: KBUpdateType;
    targetSection?: string;
    newContent?: string;
    replacePattern?: RegExp;
    replaceWith?: string;
    appendAfter?: string;
    prependBefore?: string;
    rationale: string;
}
/**
 * Generate KB updates from optimization recommendations
 */
declare function generateKBUpdates(recommendations: KBOptimizationRecommendation[]): KBUpdate[];
/**
 * Apply a single update to a KB document
 */
declare function applyKBUpdate(update: KBUpdate): boolean;
/**
 * Apply all KB updates
 */
declare function applyAllKBUpdates(updates: KBUpdate[]): {
    applied: string[];
    skipped: string[];
    failed: string[];
};
/**
 * Upload KB documents to SharePoint
 *
 * Uses the existing upload script in the scripts directory
 */
declare function uploadToSharePoint(documentIds?: string[]): Promise<{
    uploaded: string[];
    failed: string[];
}>;
export { createKBBaseline, saveKBBaseline, loadLatestKBBaseline, compareKBBaselines, generateKBUpdates, applyKBUpdate, applyAllKBUpdates, uploadToSharePoint, };
//# sourceMappingURL=kb-update-pipeline.d.ts.map