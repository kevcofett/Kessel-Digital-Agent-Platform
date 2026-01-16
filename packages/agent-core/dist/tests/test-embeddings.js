/**
 * Test embedding generation for RAG pipeline
 * Run: npx ts-node src/tests/test-embeddings.ts
 */
import { createEmbeddingProvider } from '../providers/embedding-factory';
async function testEmbeddings() {
    console.log('=== Testing Embedding Generation ===\n');
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error('ERROR: OPENAI_API_KEY environment variable not set');
        console.log('Set the environment variable and try again:');
        console.log('  export OPENAI_API_KEY="your-key-here"');
        process.exit(1);
    }
    let provider;
    try {
        provider = createEmbeddingProvider('openai', {
            apiKey,
            model: 'text-embedding-3-small'
        });
        console.log('Embedding provider initialized: OpenAI text-embedding-3-small\n');
    }
    catch (error) {
        console.error('Failed to create embedding provider:', error);
        process.exit(1);
    }
    const testQueries = [
        "What is a typical CPM for display advertising?",
        "What channels work best for brand awareness?",
        "How do I calculate ROAS?"
    ];
    console.log('--- Single Query Embeddings ---\n');
    for (const query of testQueries) {
        console.log(`Query: "${query}"`);
        try {
            const embedding = await provider.embed(query);
            console.log(`  Dimension: ${embedding.length}`);
            console.log(`  First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}]`);
            const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
            console.log(`  Magnitude: ${magnitude.toFixed(4)}`);
            console.log('');
        }
        catch (error) {
            console.error(`  ERROR: ${error}`);
        }
    }
    // Test batch embedding
    console.log('--- Batch Embedding ---\n');
    try {
        const batchEmbeddings = await provider.embedBatch(testQueries);
        console.log(`Batch size: ${testQueries.length}`);
        console.log(`Results: ${batchEmbeddings.length} embeddings`);
        console.log(`All same dimension: ${batchEmbeddings.every(e => e.length === batchEmbeddings[0].length)}`);
        console.log('');
    }
    catch (error) {
        console.log(`Batch embedding not supported or failed: ${error}`);
        console.log('');
    }
    // Test similarity
    console.log('--- Testing Semantic Similarity ---\n');
    const cosineSimilarity = (a, b) => {
        const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
        const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
        const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
        return dot / (magA * magB);
    };
    try {
        const emb1 = await provider.embed("What is CPM?");
        const emb2 = await provider.embed("Cost per thousand impressions");
        const emb3 = await provider.embed("The weather is nice today");
        const sim12 = cosineSimilarity(emb1, emb2);
        const sim13 = cosineSimilarity(emb1, emb3);
        console.log('Similarity comparisons:');
        console.log(`  "What is CPM?" vs "Cost per thousand impressions": ${sim12.toFixed(4)}`);
        console.log(`  "What is CPM?" vs "The weather is nice today": ${sim13.toFixed(4)}`);
        console.log('');
        // Validate semantic similarity
        if (sim12 > sim13) {
            console.log('PASS: Related concepts have higher similarity than unrelated');
        }
        else {
            console.log('WARNING: Similarity scores may not reflect semantic relationships correctly');
        }
    }
    catch (error) {
        console.error(`Similarity test failed: ${error}`);
    }
    console.log('\n=== Embedding Tests Complete ===');
}
// Run if executed directly
testEmbeddings().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
//# sourceMappingURL=test-embeddings.js.map