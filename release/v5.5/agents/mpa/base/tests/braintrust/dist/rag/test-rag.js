/**
 * RAG System Test Script
 */
import { RetrievalEngine } from './retrieval-engine.js';
import { ToolExecutor } from './tool-executor.js';
const TEST_CASES = [
    {
        name: 'Search for CAC benchmarks',
        tool: 'search_knowledge_base',
        input: { query: 'customer acquisition cost benchmark ecommerce', topic: 'benchmark' },
        expectedInResult: ['CAC', 'cost'],
    },
    {
        name: 'Get ecommerce CAC benchmark',
        tool: 'get_benchmark',
        input: { vertical: 'ecommerce', metric: 'CAC' },
        expectedInResult: ['Based on Knowledge Base', '$'],
    },
    {
        name: 'Get SaaS LTV:CAC ratio',
        tool: 'get_benchmark',
        input: { vertical: 'saas', metric: 'LTV:CAC ratio' },
        expectedInResult: ['Based on Knowledge Base'],
    },
    {
        name: 'Search for audience targeting guidance',
        tool: 'search_knowledge_base',
        input: { query: 'audience targeting best practices signals', topic: 'audience' },
        expectedInResult: ['audience', 'targeting'],
    },
    {
        name: 'Get fitness enthusiast audience sizing',
        tool: 'get_audience_sizing',
        input: { audience_type: 'fitness enthusiasts', geography: 'US national' },
        expectedInResult: ['Based on Knowledge Base'],
    },
    {
        name: 'Search for channel mix guidance',
        tool: 'search_knowledge_base',
        input: { query: 'channel mix allocation brand awareness', topic: 'channel' },
        expectedInResult: ['channel'],
    },
    {
        name: 'Search for measurement framework',
        tool: 'search_knowledge_base',
        input: { query: 'measurement attribution incrementality', topic: 'measurement' },
        expectedInResult: ['measurement', 'attribution'],
    },
];
async function runTests() {
    console.log('=== RAG System Test Suite ===\n');
    // Initialize
    console.log('Initializing RAG engine...');
    const ragEngine = new RetrievalEngine();
    await ragEngine.initialize();
    const toolExecutor = new ToolExecutor(ragEngine);
    console.log(`Engine stats: ${JSON.stringify(ragEngine.getStats())}\n`);
    // Run tests
    let passed = 0;
    let failed = 0;
    for (const testCase of TEST_CASES) {
        console.log(`\nTest: ${testCase.name}`);
        console.log(`Tool: ${testCase.tool}`);
        console.log(`Input: ${JSON.stringify(testCase.input)}`);
        try {
            const result = await toolExecutor.execute({
                type: 'tool_use',
                id: `test-${Date.now()}`,
                name: testCase.tool,
                input: testCase.input,
            });
            console.log(`Success: ${result.success}`);
            console.log(`Citations: ${result.citations.join(', ') || 'none'}`);
            console.log(`Content preview: ${result.content.slice(0, 200)}...`);
            // Check expected content
            const allExpectedFound = testCase.expectedInResult.every(expected => result.content.toLowerCase().includes(expected.toLowerCase()));
            if (allExpectedFound) {
                console.log('✅ PASSED - All expected content found');
                passed++;
            }
            else {
                console.log('❌ FAILED - Missing expected content');
                console.log(`  Expected: ${testCase.expectedInResult.join(', ')}`);
                failed++;
            }
        }
        catch (error) {
            console.log(`❌ FAILED - Error: ${error}`);
            failed++;
        }
    }
    // Summary
    console.log('\n=== Test Summary ===');
    console.log(`Passed: ${passed}/${TEST_CASES.length}`);
    console.log(`Failed: ${failed}/${TEST_CASES.length}`);
    console.log(`Tool usage stats: ${JSON.stringify(toolExecutor.getUsageStats())}`);
    process.exit(failed > 0 ? 1 : 0);
}
runTests().catch(console.error);
//# sourceMappingURL=test-rag.js.map