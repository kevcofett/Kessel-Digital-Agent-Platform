/**
 * Retrieval Engine - High-level RAG interface
 */
import { RAG_CONFIG, SYNONYM_MAPPINGS, } from './types.js';
import { DocumentProcessor } from './document-processor.js';
import { EmbeddingService } from './embedding-service.js';
import { VectorStore } from './vector-store.js';
export class RetrievalEngine {
    documentProcessor;
    embeddingService;
    vectorStore;
    initialized = false;
    initializationPromise = null;
    constructor(kbPath) {
        this.documentProcessor = new DocumentProcessor(kbPath);
        this.embeddingService = new EmbeddingService();
        this.vectorStore = new VectorStore(this.embeddingService);
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
        const cacheLoaded = await this.vectorStore.load(RAG_CONFIG.paths.indexCache);
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
            const embeddings = this.embeddingService.embedBatch(chunks.map(c => c.content));
            // Add to vector store
            this.vectorStore.addChunks(chunks, embeddings);
            // Persist for next time
            await this.vectorStore.persist(RAG_CONFIG.paths.indexCache);
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
     * Expand query with synonyms for improved retrieval.
     * If query contains any synonym, adds the canonical term.
     */
    expandQuery(query) {
        let expanded = query.toLowerCase();
        const addedTerms = [];
        for (const [canonical, synonyms] of Object.entries(SYNONYM_MAPPINGS)) {
            // If query already contains the canonical term, skip
            if (expanded.includes(canonical))
                continue;
            // Check if query contains any synonym
            for (const syn of synonyms) {
                if (expanded.includes(syn)) {
                    addedTerms.push(canonical);
                    break;
                }
            }
        }
        // Append canonical terms to query
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
        const { topK = RAG_CONFIG.retrieval.defaultTopK, minScore = RAG_CONFIG.retrieval.minScore, filters, } = options;
        // Expand query with synonyms
        const expandedQuery = this.expandQuery(query);
        // Generate query embedding (using expanded query)
        const queryEmbedding = this.embeddingService.embed(expandedQuery);
        // Search (use original query for keyword matching, expanded for semantic)
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
        // Build targeted query with expansion
        const baseQuery = `${vertical} ${metric} benchmark typical range`;
        const expandedQuery = this.expandQuery(baseQuery);
        const queryEmbedding = this.embeddingService.embed(expandedQuery);
        // Search with benchmark filter
        const results = this.vectorStore.searchFiltered(expandedQuery, queryEmbedding, {
            mustHaveBenchmarks: true,
            verticals: [vertical.toLowerCase()],
        }, 10);
        // Find chunk with the specific metric
        const metricLower = metric.toLowerCase();
        for (const result of results) {
            const content = result.chunk.content.toLowerCase();
            // Check if chunk contains both vertical and metric
            if (content.includes(metricLower) ||
                result.chunk.metadata.metrics.some(m => m.includes(metricLower))) {
                // Extract benchmark value using patterns
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
        // Fallback: return best matching chunk as general guidance
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
        // Common patterns for benchmark values
        const patterns = [
            // "$25-45" or "$25 to $45"
            /\$[\d,]+(?:\s*[-–to]+\s*\$?[\d,]+)?/gi,
            // "25-45%" or "25% to 45%"
            /[\d.]+%(?:\s*[-–to]+\s*[\d.]+%)?/gi,
            // "3:1 to 5:1" ratio
            /[\d.]+:[\d.]+(?:\s*[-–to]+\s*[\d.]+:[\d.]+)?/gi,
            // "25 to 45" plain numbers
            /\b\d+(?:\s*[-–to]+\s*\d+)?\b/gi,
        ];
        // Find metric context
        const metricIndex = content.toLowerCase().indexOf(metric.toLowerCase());
        if (metricIndex === -1)
            return null;
        // Look in surrounding text
        const contextStart = Math.max(0, metricIndex - 100);
        const contextEnd = Math.min(content.length, metricIndex + 200);
        const context = content.slice(contextStart, contextEnd);
        // Try each pattern
        for (const pattern of patterns) {
            const matches = context.match(pattern);
            if (matches && matches.length > 0) {
                const value = matches[0];
                // Determine qualifier based on surrounding words
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
        // Build query with expansion
        const baseQuery = `${audienceType} audience size ${geography || 'national'} population percentage`;
        const expandedQuery = this.expandQuery(baseQuery);
        const queryEmbedding = this.embeddingService.embed(expandedQuery);
        // Search with audience filter
        const results = this.vectorStore.searchFiltered(expandedQuery, queryEmbedding, {
            topics: ['audience'],
        }, 10);
        if (results.length > 0) {
            const best = results[0];
            // Try to extract sizing methodology
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
        // Clean source filename for citation
        const source = chunk.filename
            .replace(/_v5_5\.txt$/, '')
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
}
export default RetrievalEngine;
//# sourceMappingURL=retrieval-engine.js.map