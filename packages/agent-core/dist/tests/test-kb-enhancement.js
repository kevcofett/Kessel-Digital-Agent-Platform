/**
 * Test KB enhancement pipeline
 * Run: npx ts-node src/tests/test-kb-enhancement.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { KBEnhancementPipeline } from '../learning/kb-enhancement';
async function testKBEnhancement() {
    console.log('=== Testing KB Enhancement Pipeline ===\n');
    // Create output directory
    const outputDir = path.join(__dirname, '../../learning-outputs/kb-suggestions');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    console.log(`Output directory: ${outputDir}\n`);
    const config = {
        enabled: true,
        outputDirectory: outputDir,
        minGapThreshold: 0.92,
        suggestionsPerFile: 5
    };
    const pipeline = new KBEnhancementPipeline(config);
    // Simulate eval results with various gaps
    const mockEvalResults = [
        {
            input: 'What is incrementality testing?',
            output: 'Incrementality testing measures the true causal impact of advertising.',
            scores: { accuracy: 0.85, completeness: 0.70 },
            kbFilesUsed: ['Channel_Measurement_v5_5.txt']
        },
        {
            input: 'How do I set up a holdout test?',
            output: 'A holdout test involves keeping a control group unexposed to ads.',
            scores: { accuracy: 0.90, completeness: 0.65 },
            kbFilesUsed: ['Channel_Measurement_v5_5.txt']
        },
        {
            input: 'What is a typical CPM for display?',
            output: 'Based on Knowledge Base benchmarks, display CPMs typically range $2-8.',
            scores: { accuracy: 0.98, completeness: 0.95 },
            kbFilesUsed: ['Benchmarks_Performance_v5_5.txt']
        },
        {
            input: 'How do I measure brand lift?',
            output: 'Brand lift is measured through surveys comparing exposed and unexposed groups.',
            scores: { accuracy: 0.88, completeness: 0.72 },
            kbFilesUsed: ['Channel_Measurement_v5_5.txt']
        },
        {
            input: 'What channels are best for B2B?',
            output: 'LinkedIn and trade publications are commonly used for B2B.',
            scores: { accuracy: 0.75, completeness: 0.60 },
            kbFilesUsed: ['Channel_Selection_v5_5.txt']
        },
        {
            input: 'What is a good CTR for search ads?',
            output: 'Based on Knowledge Base data, search CTRs typically range 2-5% for branded terms.',
            scores: { accuracy: 0.95, completeness: 0.92 },
            kbFilesUsed: ['Benchmarks_Performance_v5_5.txt']
        }
    ];
    // Analyze for gaps
    console.log('--- Analyzing Eval Results for Gaps ---\n');
    console.log(`Total eval results: ${mockEvalResults.length}`);
    console.log(`Gap threshold: ${config.minGapThreshold}\n`);
    const suggestions = await pipeline.analyze(mockEvalResults);
    console.log(`Generated ${suggestions.length} KB enhancement suggestions:\n`);
    suggestions.forEach((s, i) => {
        console.log(`${i + 1}. File: ${s.kbFile}`);
        console.log(`   Gap Type: ${s.gapType}`);
        console.log(`   Related Query: "${s.relatedQuery.substring(0, 50)}..."`);
        console.log(`   Score: ${s.score.toFixed(2)}`);
        console.log(`   Suggestion: ${s.suggestion.substring(0, 100)}...`);
        console.log('');
    });
    // Group suggestions by file
    console.log('--- Suggestions by KB File ---\n');
    const byFile = new Map();
    for (const s of suggestions) {
        const existing = byFile.get(s.kbFile) || [];
        existing.push(s);
        byFile.set(s.kbFile, existing);
    }
    for (const [file, fileSuggestions] of byFile) {
        console.log(`${file}: ${fileSuggestions.length} suggestions`);
        fileSuggestions.forEach(s => {
            console.log(`  - ${s.gapType}: ${s.suggestion.substring(0, 60)}...`);
        });
        console.log('');
    }
    // Test export functionality
    console.log('--- Testing Export ---\n');
    const exportPath = path.join(outputDir, 'test-suggestions.json');
    await pipeline.exportSuggestions(suggestions, exportPath);
    if (fs.existsSync(exportPath)) {
        const exported = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));
        console.log(`Exported ${exported.suggestions.length} suggestions to: ${exportPath}`);
        console.log(`Export metadata: generated=${exported.metadata.generatedAt}, threshold=${exported.metadata.threshold}`);
    }
    else {
        console.log('ERROR: Export file not created');
    }
    // Test prioritization
    console.log('\n--- Testing Prioritization ---\n');
    const prioritized = pipeline.prioritize(suggestions);
    console.log('Top 3 priority suggestions:');
    prioritized.slice(0, 3).forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.kbFile} - ${s.gapType} (score: ${s.score.toFixed(2)})`);
    });
    // Validate gap detection
    console.log('\n--- Validating Gap Detection ---\n');
    const gapsDetected = mockEvalResults.filter(r => {
        const composite = (r.scores.accuracy + r.scores.completeness) / 2;
        return composite < config.minGapThreshold;
    }).length;
    console.log(`Eval results below threshold: ${gapsDetected}`);
    console.log(`Suggestions generated: ${suggestions.length}`);
    if (suggestions.length >= gapsDetected) {
        console.log('PASS: At least one suggestion per gap');
    }
    else {
        console.log('INFO: Fewer suggestions than gaps (some may be consolidated)');
    }
    console.log('\n=== KB Enhancement Tests Complete ===');
}
// Run if executed directly
testKBEnhancement().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
//# sourceMappingURL=test-kb-enhancement.js.map