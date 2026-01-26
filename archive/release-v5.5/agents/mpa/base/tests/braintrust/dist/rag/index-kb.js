/**
 * Standalone KB Indexer - Run to rebuild the RAG index
 */
import { RetrievalEngine } from './retrieval-engine.js';
async function indexKB() {
    console.log('=== KB Indexer ===\n');
    const engine = new RetrievalEngine();
    console.log('Building index (this may take a moment)...\n');
    await engine.initialize();
    console.log('\nIndexing complete!');
    console.log(`Stats: ${JSON.stringify(engine.getStats())}`);
}
indexKB().catch(console.error);
//# sourceMappingURL=index-kb.js.map