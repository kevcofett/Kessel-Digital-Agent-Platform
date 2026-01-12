/**
 * Embedding Provider Factory
 *
 * Creates the appropriate embedding provider based on environment configuration.
 */
import { OpenAIEmbeddingProvider } from './openai-embedding.js';
import { AzureOpenAIEmbeddingProvider } from './azure-openai-embedding.js';
/**
 * Detect embedding environment from environment variables
 */
export function detectEmbeddingEnvironment() {
    // Check for Azure OpenAI (corporate)
    if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT) {
        return 'corporate';
    }
    // Check for OpenAI (personal)
    if (process.env.OPENAI_API_KEY) {
        return 'personal';
    }
    // Fall back to local TF-IDF
    return 'local';
}
// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================
/**
 * Create an embedding provider based on configuration
 */
export function createEmbeddingProvider(config) {
    switch (config.type) {
        case 'openai':
            return new OpenAIEmbeddingProvider(config.openai);
        case 'azure-openai':
            if (!config.azureOpenai) {
                throw new Error('Azure OpenAI configuration required');
            }
            return new AzureOpenAIEmbeddingProvider(config.azureOpenai);
        case 'tfidf':
            return new TFIDFEmbeddingProviderAdapter();
        default:
            throw new Error(`Unknown embedding provider type: ${config.type}`);
    }
}
/**
 * Create an embedding provider based on environment detection
 */
export function createEmbeddingProviderFromEnvironment() {
    const environment = detectEmbeddingEnvironment();
    switch (environment) {
        case 'personal':
            console.log('Using OpenAI embedding provider (personal environment)');
            return new OpenAIEmbeddingProvider();
        case 'corporate':
            console.log('Using Azure OpenAI embedding provider (corporate environment)');
            return new AzureOpenAIEmbeddingProvider({
                endpoint: process.env.AZURE_OPENAI_ENDPOINT,
                deploymentName: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-ada-002',
                apiKey: process.env.AZURE_OPENAI_API_KEY,
            });
        case 'local':
        default:
            console.log('Using TF-IDF embedding provider (local/fallback)');
            return new TFIDFEmbeddingProviderAdapter();
    }
}
/**
 * Try to create the best available embedding provider
 * Returns null if no semantic provider is available
 */
export async function createBestAvailableEmbeddingProvider() {
    // Try OpenAI first
    if (process.env.OPENAI_API_KEY) {
        const provider = new OpenAIEmbeddingProvider();
        if (await provider.isAvailable()) {
            console.log('Using OpenAI embedding provider');
            return provider;
        }
    }
    // Try Azure OpenAI
    if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT) {
        const provider = new AzureOpenAIEmbeddingProvider({
            endpoint: process.env.AZURE_OPENAI_ENDPOINT,
            deploymentName: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-ada-002',
        });
        if (await provider.isAvailable()) {
            console.log('Using Azure OpenAI embedding provider');
            return provider;
        }
    }
    // No semantic provider available
    console.log('No semantic embedding provider available, using TF-IDF only');
    return null;
}
// ============================================================================
// TF-IDF ADAPTER
// ============================================================================
/**
 * Adapter to make TFIDFEmbeddingProvider conform to SemanticEmbeddingProvider interface
 *
 * Note: TF-IDF doesn't produce true semantic embeddings, but can be used as a fallback.
 * The "embeddings" are sparse vectors based on term frequency.
 */
export class TFIDFEmbeddingProviderAdapter {
    providerId = 'tfidf-adapter';
    vocabulary = new Map();
    dimensions = 1000; // Fixed vocabulary size for consistency
    constructor() {
        // TFIDFEmbeddingProvider is available but not used directly in this adapter
        // This adapter provides a simpler bag-of-words approach
    }
    getDimensions() {
        return this.dimensions;
    }
    async embed(text) {
        // Simple bag-of-words embedding
        const tokens = this.tokenize(text);
        const vector = new Array(this.dimensions).fill(0);
        for (const token of tokens) {
            let index = this.vocabulary.get(token);
            if (index === undefined) {
                // Add to vocabulary if space available
                if (this.vocabulary.size < this.dimensions) {
                    index = this.vocabulary.size;
                    this.vocabulary.set(token, index);
                }
                else {
                    // Hash to existing index if vocabulary full
                    index = this.hashToIndex(token);
                }
            }
            vector[index] += 1;
        }
        // Normalize
        const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        if (magnitude > 0) {
            for (let i = 0; i < vector.length; i++) {
                vector[i] /= magnitude;
            }
        }
        return vector;
    }
    async embedBatch(texts) {
        return Promise.all(texts.map(text => this.embed(text)));
    }
    async isAvailable() {
        return true; // TF-IDF is always available
    }
    getMetadata() {
        return {
            providerId: this.providerId,
            model: 'tfidf-bow',
            dimensions: this.dimensions,
            maxTokensPerRequest: Infinity,
            supportsReducedDimensions: false,
            costPer1MTokens: 0,
        };
    }
    tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(token => token.length > 2);
    }
    hashToIndex(token) {
        let hash = 0;
        for (let i = 0; i < token.length; i++) {
            hash = ((hash << 5) - hash) + token.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash) % this.dimensions;
    }
}
//# sourceMappingURL=embedding-factory.js.map