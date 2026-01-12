/**
 * Extended Embedding Provider Types
 *
 * Defines interfaces for semantic embedding providers beyond TF-IDF.
 */
// ============================================================================
// SIMILARITY FUNCTIONS
// ============================================================================
/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a, b) {
    if (a.length !== b.length) {
        throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    if (magnitude === 0) {
        return 0;
    }
    return dotProduct / magnitude;
}
/**
 * Calculate euclidean distance between two vectors
 */
export function euclideanDistance(a, b) {
    if (a.length !== b.length) {
        throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
    }
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        const diff = a[i] - b[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
}
/**
 * Calculate dot product between two vectors
 */
export function dotProduct(a, b) {
    if (a.length !== b.length) {
        throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
    }
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        sum += a[i] * b[i];
    }
    return sum;
}
export default {
    cosineSimilarity,
    euclideanDistance,
    dotProduct,
};
//# sourceMappingURL=embedding-types.js.map