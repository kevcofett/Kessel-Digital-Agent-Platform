/**
 * OpenAI Embedding Provider
 *
 * Provides semantic embeddings using OpenAI's text-embedding models.
 * Used in personal/development environments.
 */
// ============================================================================
// CONSTANTS
// ============================================================================
const DEFAULT_MODEL = 'text-embedding-3-small';
const DEFAULT_DIMENSIONS = {
    'text-embedding-3-small': 1536,
    'text-embedding-3-large': 3072,
    'text-embedding-ada-002': 1536,
};
const MAX_TOKENS_PER_REQUEST = 8191;
const COST_PER_1M_TOKENS = {
    'text-embedding-3-small': 0.02,
    'text-embedding-3-large': 0.13,
    'text-embedding-ada-002': 0.10,
};
// ============================================================================
// OPENAI EMBEDDING PROVIDER
// ============================================================================
export class OpenAIEmbeddingProvider {
    providerId = 'openai-embedding';
    apiKey;
    model;
    dimensions;
    baseURL;
    maxRetries;
    timeout;
    constructor(config = {}) {
        this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || '';
        this.model = config.model || DEFAULT_MODEL;
        this.baseURL = config.baseURL || 'https://api.openai.com/v1';
        this.maxRetries = config.maxRetries ?? 3;
        this.timeout = config.timeout ?? 30000;
        // Handle dimension reduction for v3 models
        if (config.dimensions && this.model.includes('text-embedding-3')) {
            this.dimensions = config.dimensions;
        }
        else {
            this.dimensions = DEFAULT_DIMENSIONS[this.model] || 1536;
        }
    }
    getDimensions() {
        return this.dimensions;
    }
    async embed(text) {
        const results = await this.embedBatch([text]);
        return results[0];
    }
    async embedBatch(texts) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY environment variable or pass apiKey in config.');
        }
        if (texts.length === 0) {
            return [];
        }
        // OpenAI supports batching up to 2048 inputs
        const batchSize = 100;
        const allEmbeddings = [];
        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            const embeddings = await this.embedBatchInternal(batch);
            allEmbeddings.push(...embeddings);
        }
        return allEmbeddings;
    }
    async embedBatchInternal(texts) {
        const body = {
            input: texts,
            model: this.model,
        };
        // Add dimensions parameter for v3 models if custom dimensions set
        if (this.model.includes('text-embedding-3') && this.dimensions !== DEFAULT_DIMENSIONS[this.model]) {
            body.dimensions = this.dimensions;
        }
        let lastError = null;
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                const response = await fetch(`${this.baseURL}/embeddings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`,
                    },
                    body: JSON.stringify(body),
                    signal: AbortSignal.timeout(this.timeout),
                });
                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`OpenAI API error ${response.status}: ${errorBody}`);
                }
                const data = await response.json();
                // Sort by index to ensure correct order
                const sorted = data.data.sort((a, b) => a.index - b.index);
                return sorted.map(item => item.embedding);
            }
            catch (error) {
                lastError = error;
                // Don't retry on auth errors
                if (lastError.message.includes('401') || lastError.message.includes('403')) {
                    throw lastError;
                }
                // Exponential backoff
                if (attempt < this.maxRetries - 1) {
                    await this.sleep(Math.pow(2, attempt) * 1000);
                }
            }
        }
        throw lastError || new Error('Failed to get embeddings after retries');
    }
    async isAvailable() {
        if (!this.apiKey) {
            return false;
        }
        try {
            // Make a minimal request to verify API key works
            await this.embed('test');
            return true;
        }
        catch {
            return false;
        }
    }
    getMetadata() {
        return {
            providerId: this.providerId,
            model: this.model,
            dimensions: this.dimensions,
            maxTokensPerRequest: MAX_TOKENS_PER_REQUEST,
            supportsReducedDimensions: this.model.includes('text-embedding-3'),
            costPer1MTokens: COST_PER_1M_TOKENS[this.model],
        };
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
// ============================================================================
// FACTORY FUNCTION
// ============================================================================
/**
 * Create an OpenAI embedding provider with optional configuration
 */
export function createOpenAIEmbeddingProvider(config) {
    return new OpenAIEmbeddingProvider(config);
}
export default OpenAIEmbeddingProvider;
//# sourceMappingURL=openai-embedding.js.map