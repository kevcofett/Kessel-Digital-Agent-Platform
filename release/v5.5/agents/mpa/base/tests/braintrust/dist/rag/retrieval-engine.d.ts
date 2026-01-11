/**
 * Retrieval Engine - High-level RAG interface
 */
import { SearchOptions, RetrievalResult, BenchmarkResult, AudienceSizingResult } from './types.js';
export declare class RetrievalEngine {
    private documentProcessor;
    private embeddingService;
    private vectorStore;
    private initialized;
    private initializationPromise;
    constructor(kbPath?: string);
    /**
     * Initialize the retrieval engine
     */
    initialize(): Promise<void>;
    private _doInitialize;
    /**
     * Ensure engine is initialized
     */
    private ensureInitialized;
    /**
     * General knowledge search
     */
    search(query: string, options?: SearchOptions): Promise<RetrievalResult[]>;
    /**
     * Get specific benchmark data
     */
    getBenchmark(vertical: string, metric: string): Promise<BenchmarkResult | null>;
    /**
     * Extract benchmark value from text
     */
    private extractBenchmarkValue;
    /**
     * Get audience sizing data
     */
    getAudienceSizing(audienceType: string, geography?: string): Promise<AudienceSizingResult | null>;
    /**
     * Get step-specific guidance
     */
    getStepGuidance(step: number, topic?: string): Promise<RetrievalResult[]>;
    /**
     * Format chunk into retrieval result
     */
    private formatRetrievalResult;
    /**
     * Check if initialized
     */
    isInitialized(): boolean;
    /**
     * Get statistics
     */
    getStats(): {
        chunkCount: number;
        initialized: boolean;
    };
}
export default RetrievalEngine;
//# sourceMappingURL=retrieval-engine.d.ts.map