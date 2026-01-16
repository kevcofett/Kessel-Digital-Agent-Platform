/**
 * Test success pattern storage and retrieval
 * Run: npx ts-node src/tests/test-success-patterns.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { SuccessPatterns } from '../learning/success-patterns';
async function testSuccessPatterns() {
    console.log('=== Testing Success Patterns ===\n');
    // Create test output directory
    const outputDir = path.join(__dirname, '../../learning-outputs/patterns');
    // Clean up any previous test data
    if (fs.existsSync(outputDir)) {
        const files = fs.readdirSync(outputDir);
        for (const file of files) {
            if (file.startsWith('test-')) {
                fs.unlinkSync(path.join(outputDir, file));
            }
        }
    }
    else {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    console.log(`Output directory: ${outputDir}\n`);
    const config = {
        enabled: true,
        storagePath: outputDir,
        storageBackend: 'json',
        minCompositeScore: 0.95,
        maxPatternsPerScenario: 10
    };
    const patterns = new SuccessPatterns(config);
    // Test patterns to store
    const testPatterns = [
        {
            id: 'test-1',
            scenario: 'benchmark_query',
            userMessage: 'What is a typical CPM for CTV?',
            agentResponse: 'Based on Knowledge Base benchmarks, typical CTV CPMs range from $25-45 for premium inventory and $15-25 for programmatic. Factors affecting price include targeting specificity, publisher quality, and time of year.',
            compositeScore: 0.96,
            scores: {
                accuracy: 0.98,
                completeness: 0.95,
                citation: 1.0
            },
            agentType: 'MPA',
            createdAt: new Date().toISOString()
        },
        {
            id: 'test-2',
            scenario: 'channel_recommendation',
            userMessage: 'What channels should I use for awareness?',
            agentResponse: 'For awareness campaigns, Based on Knowledge Base guidance, I recommend: 1) CTV/OTT for high-impact video reach, 2) Programmatic Display for scale, 3) Paid Social for precise targeting. Budget allocation typically follows 40/35/25 split.',
            compositeScore: 0.97,
            scores: {
                accuracy: 0.96,
                completeness: 0.98,
                citation: 0.97
            },
            agentType: 'MPA',
            createdAt: new Date().toISOString()
        },
        {
            id: 'test-3',
            scenario: 'benchmark_query',
            userMessage: 'What CTR should I expect for display ads?',
            agentResponse: 'Based on Knowledge Base benchmarks, display ad CTRs typically range from 0.05% to 0.15% for standard banners. Rich media can achieve 0.20-0.40%. Premium publishers and targeted campaigns may see higher rates.',
            compositeScore: 0.95,
            scores: {
                accuracy: 0.95,
                completeness: 0.94,
                citation: 0.96
            },
            agentType: 'MPA',
            createdAt: new Date().toISOString()
        }
    ];
    // Store patterns
    console.log('--- Storing Patterns ---\n');
    for (const pattern of testPatterns) {
        try {
            await patterns.store(pattern);
            console.log(`Stored: ${pattern.scenario} - "${pattern.userMessage.substring(0, 40)}..." (score: ${pattern.compositeScore})`);
        }
        catch (error) {
            console.error(`Failed to store pattern: ${error}`);
        }
    }
    // Retrieve patterns by scenario
    console.log('\n--- Retrieving by Scenario ---\n');
    const benchmarkPatterns = await patterns.getByScenario('benchmark_query');
    console.log(`benchmark_query patterns: ${benchmarkPatterns.length}`);
    benchmarkPatterns.forEach(p => {
        console.log(`  - ${p.userMessage.substring(0, 40)}... (score: ${p.compositeScore})`);
    });
    const channelPatterns = await patterns.getByScenario('channel_recommendation');
    console.log(`\nchannel_recommendation patterns: ${channelPatterns.length}`);
    channelPatterns.forEach(p => {
        console.log(`  - ${p.userMessage.substring(0, 40)}... (score: ${p.compositeScore})`);
    });
    // Test similarity search
    console.log('\n--- Testing Similarity Search ---\n');
    const similarQueries = [
        'What CPM should I expect for streaming ads?',
        'Which platforms are best for building brand awareness?',
        'How much does CTV advertising cost?'
    ];
    for (const query of similarQueries) {
        console.log(`Query: "${query}"`);
        try {
            const similar = await patterns.getSimilar(query, 2);
            if (similar.length === 0) {
                console.log('  No similar patterns found');
            }
            else {
                similar.forEach((p, i) => {
                    console.log(`  ${i + 1}. ${p.scenario}: "${p.userMessage.substring(0, 40)}..."`);
                });
            }
        }
        catch (error) {
            console.log(`  Error: ${error}`);
        }
        console.log('');
    }
    // Test pattern deletion
    console.log('--- Testing Pattern Deletion ---\n');
    const countBefore = (await patterns.getByScenario('benchmark_query')).length;
    console.log(`benchmark_query count before delete: ${countBefore}`);
    await patterns.delete('test-1');
    console.log('Deleted pattern test-1');
    const countAfter = (await patterns.getByScenario('benchmark_query')).length;
    console.log(`benchmark_query count after delete: ${countAfter}`);
    if (countAfter === countBefore - 1) {
        console.log('PASS: Pattern deletion working correctly');
    }
    else {
        console.log('FAIL: Pattern count mismatch after deletion');
    }
    // Test low score rejection
    console.log('\n--- Testing Score Threshold ---\n');
    const lowScorePattern = {
        id: 'test-low',
        scenario: 'benchmark_query',
        userMessage: 'What is CPM?',
        agentResponse: 'CPM is a metric.',
        compositeScore: 0.80, // Below threshold
        scores: { accuracy: 0.80 },
        agentType: 'MPA',
        createdAt: new Date().toISOString()
    };
    try {
        const stored = await patterns.store(lowScorePattern);
        if (stored) {
            console.log('WARNING: Low score pattern was stored (should have been rejected)');
        }
        else {
            console.log('PASS: Low score pattern correctly rejected');
        }
    }
    catch (error) {
        console.log(`PASS: Low score pattern rejected with error: ${error}`);
    }
    console.log('\n=== Success Patterns Tests Complete ===');
}
// Run if executed directly
testSuccessPatterns().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
//# sourceMappingURL=test-success-patterns.js.map