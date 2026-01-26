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
import { scoreMetadataMatch, } from './kb-metadata-parser.js';
// ============================================================================
// CONSTANTS
// ============================================================================
const DEFAULT_FUSION_CONFIG = {
    rrfK: 60,
    semanticWeight: 0.5,
    keywordWeight: 0.3,
    structuredWeight: 0.2,
    domainBoostEnabled: true,
    maxResults: 10,
    minFusedScore: 0.15,
};
const DEFAULT_DOMAIN_FACTORS = {
    intentMatch: 0.25,
    stepRelevance: 0.20,
    benchmarkPresence: 0.15,
    recencyFactor: 0.10,
    confidenceLevel: 0.10,
    chunkPriority: 0.15, // KB v6.0: Priority 0 gets full boost, 3 gets none
};
// ============================================================================
// MAIN RESULT FUSION CLASS
// ============================================================================
export class ResultFusion {
    config;
    domainFactors;
    constructor(config = {}, domainFactors = {}) {
        this.config = { ...DEFAULT_FUSION_CONFIG, ...config };
        this.domainFactors = { ...DEFAULT_DOMAIN_FACTORS, ...domainFactors };
    }
    /**
     * Fuse results from multiple retrieval methods using RRF + domain reranking
     */
    fuseResults(semanticResults, keywordResults, structuredResults, analyzedQuery) {
        // Build chunk ID to results map
        const resultsByChunkId = new Map();
        // Collect results from all methods
        for (const result of semanticResults) {
            const id = result.chunk.id;
            if (!resultsByChunkId.has(id)) {
                resultsByChunkId.set(id, { chunk: result.chunk });
            }
            resultsByChunkId.get(id).semantic = result;
        }
        for (const result of keywordResults) {
            const id = result.chunk.id;
            if (!resultsByChunkId.has(id)) {
                resultsByChunkId.set(id, { chunk: result.chunk });
            }
            resultsByChunkId.get(id).keyword = result;
        }
        for (const result of structuredResults) {
            const id = result.chunk.id;
            if (!resultsByChunkId.has(id)) {
                resultsByChunkId.set(id, { chunk: result.chunk });
            }
            resultsByChunkId.get(id).structured = result;
        }
        // Calculate fused scores
        const fusedResults = [];
        for (const [_id, results] of resultsByChunkId) {
            const rrfScore = this.calculateRRFScore(results.semantic?.rank, results.keyword?.rank, results.structured?.rank);
            let domainBoost = 0;
            if (this.config.domainBoostEnabled && analyzedQuery) {
                domainBoost = this.calculateDomainBoost(results.chunk, analyzedQuery);
            }
            const fusedScore = rrfScore + domainBoost;
            // Build source contributions
            const sourceContributions = {
                semantic: results.semantic ? this.rrfContribution(results.semantic.rank) * this.config.semanticWeight : 0,
                keyword: results.keyword ? this.rrfContribution(results.keyword.rank) * this.config.keywordWeight : 0,
                structured: results.structured ? this.rrfContribution(results.structured.rank) * this.config.structuredWeight : 0,
            };
            // Build attribution
            const attribution = this.buildAttribution(results.chunk, analyzedQuery);
            fusedResults.push({
                chunk: results.chunk,
                fusedScore,
                rrfScore,
                domainBoost,
                sourceContributions,
                attribution,
            });
        }
        // Sort by fused score and apply limits
        return fusedResults
            .sort((a, b) => b.fusedScore - a.fusedScore)
            .filter(r => r.fusedScore >= this.config.minFusedScore)
            .slice(0, this.config.maxResults);
    }
    /**
     * Simple fusion for backward compatibility (semantic + keyword only)
     */
    fuseHybrid(semanticResults, keywordResults) {
        const semanticMethod = semanticResults.map((r, i) => ({
            chunk: r.chunk,
            score: r.score,
            method: 'semantic',
            rank: i + 1,
        }));
        const keywordMethod = keywordResults.map((r, i) => ({
            chunk: r.chunk,
            score: r.score,
            method: 'keyword',
            rank: i + 1,
        }));
        return this.fuseResults(semanticMethod, keywordMethod, []);
    }
    /**
     * Rerank results using domain knowledge (without fusion)
     */
    domainRerank(results, analyzedQuery) {
        return results.map((result, index) => {
            const domainBoost = this.calculateDomainBoost(result.chunk, analyzedQuery);
            const baseScore = result.score;
            const fusedScore = baseScore + domainBoost;
            return {
                chunk: result.chunk,
                fusedScore,
                rrfScore: baseScore,
                domainBoost,
                sourceContributions: {
                    semantic: baseScore,
                    keyword: 0,
                    structured: 0,
                },
                attribution: this.buildAttribution(result.chunk, analyzedQuery),
            };
        }).sort((a, b) => b.fusedScore - a.fusedScore);
    }
    // ============================================================================
    // RRF CALCULATION
    // ============================================================================
    /**
     * Calculate RRF score from multiple method ranks
     */
    calculateRRFScore(semanticRank, keywordRank, structuredRank) {
        let score = 0;
        if (semanticRank !== undefined) {
            score += this.rrfContribution(semanticRank) * this.config.semanticWeight;
        }
        if (keywordRank !== undefined) {
            score += this.rrfContribution(keywordRank) * this.config.keywordWeight;
        }
        if (structuredRank !== undefined) {
            score += this.rrfContribution(structuredRank) * this.config.structuredWeight;
        }
        return score;
    }
    /**
     * Calculate single RRF contribution: 1 / (k + rank)
     */
    rrfContribution(rank) {
        return 1 / (this.config.rrfK + rank);
    }
    // ============================================================================
    // DOMAIN RERANKING
    // ============================================================================
    /**
     * Calculate domain-specific boost for a chunk
     */
    calculateDomainBoost(chunk, analyzedQuery) {
        let boost = 0;
        // Intent match boost
        boost += this.calculateIntentBoost(chunk, analyzedQuery);
        // Step relevance boost
        boost += this.calculateStepBoost(chunk, analyzedQuery);
        // Benchmark presence boost
        boost += this.calculateBenchmarkBoost(chunk, analyzedQuery);
        // Recency boost (if enhanced chunk)
        boost += this.calculateRecencyBoost(chunk);
        // Confidence level boost (if enhanced chunk)
        boost += this.calculateConfidenceBoost(chunk);
        // KB v6.0: Chunk priority boost
        boost += this.calculateChunkPriorityBoost(chunk);
        return boost;
    }
    /**
     * Boost based on query intent matching document content
     */
    calculateIntentBoost(chunk, analyzedQuery) {
        const enhancedChunk = chunk;
        // If we have KB metadata, use it for precise matching
        if (enhancedChunk.kbMetadata) {
            const metadataScore = scoreMetadataMatch(enhancedChunk.kbMetadata, analyzedQuery.primaryIntent, analyzedQuery.relevantSteps);
            return metadataScore * this.domainFactors.intentMatch;
        }
        // Fallback: check document type against intent
        const intentDocTypes = analyzedQuery.relevantDocumentTypes;
        if (intentDocTypes.includes(chunk.metadata.documentType)) {
            return this.domainFactors.intentMatch * 0.5;
        }
        return 0;
    }
    /**
     * Boost based on workflow step relevance
     */
    calculateStepBoost(chunk, analyzedQuery) {
        const querySteps = analyzedQuery.relevantSteps;
        const chunkSteps = chunk.metadata.steps;
        if (querySteps.length === 0 || chunkSteps.length === 0) {
            return 0;
        }
        const overlap = querySteps.filter(s => chunkSteps.includes(s)).length;
        const overlapRatio = overlap / querySteps.length;
        return overlapRatio * this.domainFactors.stepRelevance;
    }
    /**
     * Boost for chunks containing benchmark data when query needs benchmarks
     */
    calculateBenchmarkBoost(chunk, analyzedQuery) {
        // Check if query is asking for benchmarks
        const needsBenchmarks = analyzedQuery.primaryIntent === 'BENCHMARK_LOOKUP' ||
            analyzedQuery.primaryIntent === 'ECONOMICS_VALIDATION' ||
            analyzedQuery.relevantTopics.includes('benchmark') ||
            analyzedQuery.relevantTopics.includes('efficiency');
        if (!needsBenchmarks) {
            return 0;
        }
        // Check if chunk has benchmark data
        if (chunk.metadata.hasBenchmarks) {
            // Extra boost if chunk has confidence qualifiers
            const hasQualifiers = chunk.metadata.confidenceQualifiers &&
                chunk.metadata.confidenceQualifiers.length > 0;
            return this.domainFactors.benchmarkPresence * (hasQualifiers ? 1.2 : 1.0);
        }
        return 0;
    }
    /**
     * Boost based on content recency (for enhanced chunks)
     */
    calculateRecencyBoost(chunk) {
        const enhancedChunk = chunk;
        if (!enhancedChunk.kbMetadata?.lastUpdated) {
            return 0;
        }
        const ageInDays = (Date.now() - enhancedChunk.kbMetadata.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
        // Full boost for content updated in last 30 days, decaying over 180 days
        if (ageInDays <= 30) {
            return this.domainFactors.recencyFactor;
        }
        else if (ageInDays <= 180) {
            return this.domainFactors.recencyFactor * (1 - (ageInDays - 30) / 150);
        }
        return 0;
    }
    /**
     * Boost based on confidence level (for enhanced chunks)
     */
    calculateConfidenceBoost(chunk) {
        const enhancedChunk = chunk;
        if (!enhancedChunk.kbMetadata?.confidence) {
            return 0;
        }
        switch (enhancedChunk.kbMetadata.confidence) {
            case 'HIGH':
                return this.domainFactors.confidenceLevel;
            case 'MEDIUM':
                return this.domainFactors.confidenceLevel * 0.5;
            case 'LOW':
                return 0;
            default:
                return 0;
        }
    }
    /**
     * KB v6.0: Boost based on META_CHUNK_PRIORITY
     * Priority 0 (highest) = full boost, Priority 3 (lowest) = no boost
     */
    calculateChunkPriorityBoost(chunk) {
        const enhancedChunk = chunk;
        // Check if we have document-level metadata with chunk priority
        if (!enhancedChunk.documentMetadata) {
            return 0;
        }
        const priority = enhancedChunk.documentMetadata.chunkPriority;
        // Priority 0 = 100% boost, 1 = 66%, 2 = 33%, 3 = 0%
        const boostMultiplier = Math.max(0, 1 - (priority / 3));
        return this.domainFactors.chunkPriority * boostMultiplier;
    }
    // ============================================================================
    // ATTRIBUTION
    // ============================================================================
    /**
     * Build source attribution for a result
     */
    buildAttribution(chunk, analyzedQuery) {
        // Clean source filename for display
        const cleanSource = chunk.filename
            .replace(/_v5_5\.txt$/, '')
            .replace(/_v5_6\.txt$/, '')
            .replace(/_/g, ' ');
        // Determine confidence based on match quality
        let confidence = 'MEDIUM';
        if (analyzedQuery) {
            const enhancedChunk = chunk;
            // HIGH confidence if intent matches and has benchmarks (for benchmark queries)
            if (analyzedQuery.primaryIntent === 'BENCHMARK_LOOKUP' &&
                chunk.metadata.hasBenchmarks) {
                confidence = 'HIGH';
            }
            // HIGH confidence if KB metadata confidence is HIGH
            if (enhancedChunk.kbMetadata?.confidence === 'HIGH') {
                confidence = 'HIGH';
            }
            // LOW confidence if document is deprioritized
            if (chunk.metadata.isDeprioritized) {
                confidence = 'LOW';
            }
        }
        // Build citation text
        const contentPreview = chunk.content.slice(0, 250).trim();
        const citationText = `Based on Knowledge Base (${cleanSource}): ${contentPreview}${chunk.content.length > 250 ? '...' : ''}`;
        return {
            source: chunk.filename,
            section: chunk.sectionTitle,
            documentType: chunk.metadata.documentType,
            confidence,
            citationText,
        };
    }
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    /**
     * Convert fused results to standard RetrievalResult format
     */
    toRetrievalResults(fusedResults) {
        return fusedResults.map(fr => ({
            content: fr.chunk.content,
            source: fr.attribution.source,
            section: fr.attribution.section,
            relevanceScore: fr.fusedScore,
            citationText: fr.attribution.citationText,
        }));
    }
    /**
     * Get fusion statistics for debugging
     */
    getFusionStats(fusedResults) {
        if (fusedResults.length === 0) {
            return {
                totalResults: 0,
                avgFusedScore: 0,
                avgDomainBoost: 0,
                methodContributions: { semantic: 0, keyword: 0, structured: 0 },
            };
        }
        const total = fusedResults.length;
        const avgFusedScore = fusedResults.reduce((sum, r) => sum + r.fusedScore, 0) / total;
        const avgDomainBoost = fusedResults.reduce((sum, r) => sum + r.domainBoost, 0) / total;
        const methodContributions = {
            semantic: fusedResults.reduce((sum, r) => sum + r.sourceContributions.semantic, 0) / total,
            keyword: fusedResults.reduce((sum, r) => sum + r.sourceContributions.keyword, 0) / total,
            structured: fusedResults.reduce((sum, r) => sum + r.sourceContributions.structured, 0) / total,
        };
        return {
            totalResults: total,
            avgFusedScore: Math.round(avgFusedScore * 1000) / 1000,
            avgDomainBoost: Math.round(avgDomainBoost * 1000) / 1000,
            methodContributions,
        };
    }
    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * Update domain factors
     */
    updateDomainFactors(factors) {
        this.domainFactors = { ...this.domainFactors, ...factors };
    }
}
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
/**
 * Quick RRF fusion without domain reranking
 */
export function quickRRFFusion(results1, results2, k = 60) {
    const fusion = new ResultFusion({ rrfK: k, domainBoostEnabled: false });
    return fusion.fuseHybrid(results1, results2);
}
/**
 * Create method results from search results
 */
export function toMethodResults(results, method) {
    return results.map((r, i) => ({
        chunk: r.chunk,
        score: r.score,
        method,
        rank: i + 1,
    }));
}
export default ResultFusion;
//# sourceMappingURL=result-fusion.js.map