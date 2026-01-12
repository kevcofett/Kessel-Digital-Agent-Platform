/**
 * Retrieval Engine - High-level RAG interface
 *
 * Generic retrieval engine that accepts agent-specific configuration
 * for customizing search behavior, query expansion, and result formatting.
 */
import * as path from 'path';
import { DEFAULT_RAG_CONFIG } from './config.js';
import { DocumentProcessor } from './document-processor.js';
import { EmbeddingService } from './embedding-service.js';
import { VectorStore } from './vector-store.js';
export class RetrievalEngine {
    documentProcessor;
    embeddingService;
    vectorStore;
    agentConfig;
    systemConfig;
    basePath;
    initialized = false;
    initializationPromise = null;
    constructor(options) {
        this.agentConfig = options.agentConfig;
        this.systemConfig = { ...DEFAULT_RAG_CONFIG, ...options.systemConfig };
        this.basePath = options.basePath || process.cwd();
        this.embeddingService = new EmbeddingService(options.embeddingProvider);
        this.documentProcessor = new DocumentProcessor(this.agentConfig, this.systemConfig, this.basePath);
        this.vectorStore = new VectorStore(this.embeddingService, this.systemConfig);
    }
    /**
     * Initialize the retrieval engine
     */
    async initialize() {
        // Prevent multiple simultaneous initializations
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        if (this.initialized) {
            return;
        }
        this.initializationPromise = this._doInitialize();
        await this.initializationPromise;
        this.initializationPromise = null;
    }
    async _doInitialize() {
        console.log('Initializing RAG Retrieval Engine...');
        const startTime = Date.now();
        // Try to load from cache first
        const indexPath = path.resolve(this.basePath, this.systemConfig.paths.indexCache);
        const cacheLoaded = await this.vectorStore.load(indexPath);
        if (!cacheLoaded) {
            console.log('Cache not found, building index from KB documents...');
            // Process documents
            let chunks = await this.documentProcessor.loadFromCache();
            if (!chunks) {
                chunks = await this.documentProcessor.processAll();
                await this.documentProcessor.saveToCache(chunks);
            }
            // Build embeddings
            await this.embeddingService.initialize(chunks);
            const embeddings = await this.embeddingService.embedBatch(chunks.map(c => c.content));
            // Add to vector store
            this.vectorStore.addChunks(chunks, embeddings);
            // Persist for next time
            await this.vectorStore.persist(indexPath);
        }
        this.initialized = true;
        console.log(`RAG Engine initialized in ${Date.now() - startTime}ms with ${this.vectorStore.getChunkCount()} chunks`);
    }
    /**
     * Ensure engine is initialized
     */
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initialize();
        }
    }
    /**
     * Expand query with synonyms for improved retrieval
     */
    expandQuery(query) {
        let expanded = query.toLowerCase();
        const addedTerms = [];
        for (const [canonical, synonyms] of Object.entries(this.agentConfig.synonymMappings)) {
            if (expanded.includes(canonical))
                continue;
            for (const syn of synonyms) {
                if (expanded.includes(syn)) {
                    addedTerms.push(canonical);
                    break;
                }
            }
        }
        if (addedTerms.length > 0) {
            expanded = `${expanded} ${addedTerms.join(' ')}`;
        }
        return expanded;
    }
    /**
     * General knowledge search
     */
    async search(query, options = {}) {
        await this.ensureInitialized();
        const { topK = this.systemConfig.retrieval.defaultTopK, minScore = this.systemConfig.retrieval.minScore, filters, } = options;
        // Expand query with synonyms
        const expandedQuery = this.expandQuery(query);
        // Generate query embedding
        const queryEmbedding = await this.embeddingService.embed(expandedQuery);
        // Search
        let results;
        if (filters) {
            results = this.vectorStore.searchFiltered(expandedQuery, queryEmbedding, filters, topK);
        }
        else {
            results = this.vectorStore.searchHybrid(expandedQuery, queryEmbedding, topK);
        }
        // Filter by minimum score and format results
        return results
            .filter(r => r.score >= minScore)
            .map(r => this.formatRetrievalResult(r.chunk, r.score));
    }
    /**
     * Get specific benchmark data
     */
    async getBenchmark(vertical, metric) {
        await this.ensureInitialized();
        const baseQuery = `${vertical} ${metric} benchmark typical range`;
        const expandedQuery = this.expandQuery(baseQuery);
        const queryEmbedding = await this.embeddingService.embed(expandedQuery);
        const results = this.vectorStore.searchFiltered(expandedQuery, queryEmbedding, {
            mustHaveBenchmarks: true,
            verticals: [vertical.toLowerCase()],
        }, 10);
        const metricLower = metric.toLowerCase();
        for (const result of results) {
            const content = result.chunk.content.toLowerCase();
            if (content.includes(metricLower) ||
                result.chunk.metadata.metrics.some(m => m.includes(metricLower))) {
                const benchmarkValue = this.extractBenchmarkValue(result.chunk.content, metric);
                if (benchmarkValue) {
                    return {
                        metric,
                        vertical,
                        value: benchmarkValue.value,
                        qualifier: benchmarkValue.qualifier,
                        source: result.chunk.filename,
                        citationText: `Based on Knowledge Base, ${benchmarkValue.qualifier} ${vertical} ${metric} is ${benchmarkValue.value}.`,
                    };
                }
            }
        }
        if (results.length > 0) {
            const best = results[0];
            return {
                metric,
                vertical,
                value: 'varies by segment',
                qualifier: 'typical',
                source: best.chunk.filename,
                citationText: `Based on Knowledge Base, ${metric} for ${vertical} varies by segment. ${best.chunk.content.slice(0, 200)}...`,
            };
        }
        return null;
    }
    /**
     * Extract benchmark value from text
     */
    extractBenchmarkValue(content, metric) {
        const patterns = [
            /\$[\d,]+(?:\s*[-–to]+\s*\$?[\d,]+)?/gi,
            /[\d.]+%(?:\s*[-–to]+\s*[\d.]+%)?/gi,
            /[\d.]+:[\d.]+(?:\s*[-–to]+\s*[\d.]+:[\d.]+)?/gi,
            /\b\d+(?:\s*[-–to]+\s*\d+)?\b/gi,
        ];
        const metricIndex = content.toLowerCase().indexOf(metric.toLowerCase());
        if (metricIndex === -1)
            return null;
        const contextStart = Math.max(0, metricIndex - 100);
        const contextEnd = Math.min(content.length, metricIndex + 200);
        const context = content.slice(contextStart, contextEnd);
        for (const pattern of patterns) {
            const matches = context.match(pattern);
            if (matches && matches.length > 0) {
                const value = matches[0];
                const contextLower = context.toLowerCase();
                let qualifier = 'typical';
                if (contextLower.includes('aggressive') || contextLower.includes('stretch')) {
                    qualifier = 'aggressive';
                }
                else if (contextLower.includes('ambitious') || contextLower.includes('optimistic')) {
                    qualifier = 'ambitious';
                }
                else if (contextLower.includes('conservative') || contextLower.includes('safe')) {
                    qualifier = 'conservative';
                }
                return { value, qualifier };
            }
        }
        return null;
    }
    /**
     * Get audience sizing data
     */
    async getAudienceSizing(audienceType, geography) {
        await this.ensureInitialized();
        const baseQuery = `${audienceType} audience size ${geography || 'national'} population percentage`;
        const expandedQuery = this.expandQuery(baseQuery);
        const queryEmbedding = await this.embeddingService.embed(expandedQuery);
        const results = this.vectorStore.searchFiltered(expandedQuery, queryEmbedding, {
            topics: ['audience'],
        }, 10);
        if (results.length > 0) {
            const best = results[0];
            const content = best.chunk.content;
            const sizingMatch = content.match(/(\d+(?:\.\d+)?)\s*(?:million|M|%)/i);
            return {
                audienceType,
                totalSize: sizingMatch ? sizingMatch[0] : 'varies by definition',
                methodology: `Estimated based on ${best.chunk.sectionTitle} guidance`,
                source: best.chunk.filename,
                citationText: `Based on Knowledge Base, ${audienceType} audience ${geography ? `in ${geography}` : 'nationally'} is approximately ${sizingMatch ? sizingMatch[0] : 'variable based on targeting criteria'}. The methodology involves ${best.chunk.content.slice(0, 150)}...`,
            };
        }
        return null;
    }
    /**
     * Get step-specific guidance
     */
    async getStepGuidance(step, topic) {
        await this.ensureInitialized();
        const query = topic
            ? `step ${step} ${topic} guidance best practice`
            : `step ${step} guidance requirements`;
        return this.search(query, {
            topK: 3,
            filters: {
                steps: [step],
            },
        });
    }
    /**
     * Format chunk into retrieval result
     */
    formatRetrievalResult(chunk, score) {
        const source = chunk.filename
            .replace(/_v\d+_\d+\.txt$/, '')
            .replace(/_/g, ' ');
        return {
            content: chunk.content,
            source: chunk.filename,
            section: chunk.sectionTitle,
            relevanceScore: score,
            citationText: `Based on Knowledge Base (${source}): ${chunk.content.slice(0, 300)}${chunk.content.length > 300 ? '...' : ''}`,
        };
    }
    /**
     * Check if initialized
     */
    isInitialized() {
        return this.initialized;
    }
    /**
     * Get statistics
     */
    getStats() {
        return {
            chunkCount: this.vectorStore.getChunkCount(),
            initialized: this.initialized,
        };
    }
    /**
     * Clear caches and force rebuild
     */
    async rebuild() {
        this.initialized = false;
        await this.initialize();
    }
}
export default RetrievalEngine;
//# sourceMappingURL=retrieval-engine.js.map