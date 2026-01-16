/**
 * Result Fusion Module
 *
 * Implements the Result Fusion layer from MPA v6.0 Improvement Plan:
 * - Reciprocal Rank Fusion (RRF): Combine results from multiple retrieval methods
 * - Domain Reranking: Apply media planning domain knowledge to boost relevance
 * - Source Attribution: Provide clear provenance for all results
 *
 * @module result-fusion
 * @version 6.0
 */
import { DocumentChunk, SearchResult, RetrievalResult } from './types.js';
import { AnalyzedQuery } from './query-understanding.js';
import { EnhancedDocumentChunk } from './document-processor.js';
/**
 * Result from a single retrieval method
 */
export interface MethodResult {
    chunk: DocumentChunk | EnhancedDocumentChunk;
    score: number;
    method: 'semantic' | 'keyword' | 'structured';
    rank: number;
}
/**
 * Fused result combining multiple retrieval methods
 */
export interface FusedResult {
    chunk: DocumentChunk | EnhancedDocumentChunk;
    fusedScore: number;
    rrfScore: number;
    domainBoost: number;
    sourceContributions: {
        semantic: number;
        keyword: number;
        structured: number;
    };
    attribution: ResultAttribution;
}
/**
 * Source attribution for a result
 */
export interface ResultAttribution {
    source: string;
    section: string;
    documentType: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    citationText: string;
}
/**
 * Configuration for result fusion
 */
export interface FusionConfig {
    rrfK: number;
    semanticWeight: number;
    keywordWeight: number;
    structuredWeight: number;
    domainBoostEnabled: boolean;
    maxResults: number;
    minFusedScore: number;
}
/**
 * Domain reranking factors
 */
export interface DomainRerankFactors {
    intentMatch: number;
    stepRelevance: number;
    benchmarkPresence: number;
    recencyFactor: number;
    confidenceLevel: number;
}
export declare class ResultFusion {
    private config;
    private domainFactors;
    constructor(config?: Partial<FusionConfig>, domainFactors?: Partial<DomainRerankFactors>);
    /**
     * Fuse results from multiple retrieval methods using RRF + domain reranking
     */
    fuseResults(semanticResults: MethodResult[], keywordResults: MethodResult[], structuredResults: MethodResult[], analyzedQuery?: AnalyzedQuery): FusedResult[];
    /**
     * Simple fusion for backward compatibility (semantic + keyword only)
     */
    fuseHybrid(semanticResults: SearchResult[], keywordResults: SearchResult[]): FusedResult[];
    /**
     * Rerank results using domain knowledge (without fusion)
     */
    domainRerank(results: SearchResult[], analyzedQuery: AnalyzedQuery): FusedResult[];
    /**
     * Calculate RRF score from multiple method ranks
     */
    private calculateRRFScore;
    /**
     * Calculate single RRF contribution: 1 / (k + rank)
     */
    private rrfContribution;
    /**
     * Calculate domain-specific boost for a chunk
     */
    private calculateDomainBoost;
    /**
     * Boost based on query intent matching document content
     */
    private calculateIntentBoost;
    /**
     * Boost based on workflow step relevance
     */
    private calculateStepBoost;
    /**
     * Boost for chunks containing benchmark data when query needs benchmarks
     */
    private calculateBenchmarkBoost;
    /**
     * Boost based on content recency (for enhanced chunks)
     */
    private calculateRecencyBoost;
    /**
     * Boost based on confidence level (for enhanced chunks)
     */
    private calculateConfidenceBoost;
    /**
     * Build source attribution for a result
     */
    private buildAttribution;
    /**
     * Convert fused results to standard RetrievalResult format
     */
    toRetrievalResults(fusedResults: FusedResult[]): RetrievalResult[];
    /**
     * Get fusion statistics for debugging
     */
    getFusionStats(fusedResults: FusedResult[]): {
        totalResults: number;
        avgFusedScore: number;
        avgDomainBoost: number;
        methodContributions: {
            semantic: number;
            keyword: number;
            structured: number;
        };
    };
    /**
     * Update configuration
     */
    updateConfig(config: Partial<FusionConfig>): void;
    /**
     * Update domain factors
     */
    updateDomainFactors(factors: Partial<DomainRerankFactors>): void;
}
/**
 * Quick RRF fusion without domain reranking
 */
export declare function quickRRFFusion(results1: SearchResult[], results2: SearchResult[], k?: number): FusedResult[];
/**
 * Create method results from search results
 */
export declare function toMethodResults(results: SearchResult[], method: 'semantic' | 'keyword' | 'structured'): MethodResult[];
export default ResultFusion;
//# sourceMappingURL=result-fusion.d.ts.map