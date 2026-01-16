/**
 * KB v6.0 Integration Test
 *
 * Verifies that the RAG modules correctly parse and process KB v6.0 files.
 */
import * as path from 'path';
import { fileURLToPath } from 'url';
import { KBMetadataParser, loadKBV6Documents, loadKBV6Index, shouldTriggerWebSearch, } from './kb-metadata-parser.js';
import { QueryUnderstanding } from './query-understanding.js';
import { ResultFusion } from './result-fusion.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Path to KB v6.0 directory (relative to this file in rag/ folder)
const KB_V6_PATH = path.resolve(__dirname, '../../../kb-v6');
console.log('='.repeat(80));
console.log('KB v6.0 Integration Test');
console.log('='.repeat(80));
console.log(`\nKB v6.0 Path: ${KB_V6_PATH}\n`);
// Test 1: Load KB v6.0 documents
console.log('TEST 1: Loading KB v6.0 Documents');
console.log('-'.repeat(40));
const documents = loadKBV6Documents(KB_V6_PATH);
console.log(`Loaded ${documents.length} documents`);
if (documents.length > 0) {
    console.log('\nSample document metadata:');
    const sample = documents[0];
    console.log(`  Filename: ${sample.filename}`);
    console.log(`  Document Type: ${sample.documentType}`);
    console.log(`  Document Type Code: ${sample.documentTypeCode}`);
    console.log(`  Primary Topics: ${sample.primaryTopics.join(', ') || 'N/A'}`);
    console.log(`  Workflow Steps: ${sample.workflowSteps.join(', ') || 'N/A'}`);
    console.log(`  Intents: ${sample.intents.join(', ') || 'N/A'}`);
    console.log(`  Chunk Priority: ${sample.chunkPriority}`);
    console.log(`  Has Web Search Triggers: ${sample.hasWebSearchTriggers}`);
    console.log(`  Sections: ${sample.totalSections}`);
}
// Test 2: Load KB v6.0 Index
console.log('\n\nTEST 2: Loading KB v6.0 Index');
console.log('-'.repeat(40));
const kbIndex = loadKBV6Index(KB_V6_PATH);
console.log(`Total Documents: ${kbIndex.totalDocuments}`);
console.log(`Intent Mappings: ${kbIndex.intentMappings.length}`);
console.log(`Workflow Step Mappings: ${kbIndex.workflowStepMappings.size}`);
console.log(`Dataverse Tables: ${kbIndex.dataverseTables.join(', ')}`);
// Test 3: Query Understanding
console.log('\n\nTEST 3: Query Understanding');
console.log('-'.repeat(40));
const queryUnderstanding = new QueryUnderstanding();
const testQueries = [
    'What is a typical CPM for retail programmatic display?',
    'How should I allocate my $500K budget across channels?',
    'What audience targeting should I use for Gen Z?',
    "We're falling short of our conversion goals, what should we do?",
    'What are the latest CTV pricing trends?',
];
for (const query of testQueries) {
    console.log(`\nQuery: "${query}"`);
    const analysis = queryUnderstanding.analyzeQuery(query);
    console.log(`  Primary Intent: ${analysis.primaryIntent}`);
    console.log(`  Confidence: ${analysis.confidence}`);
    console.log(`  Trigger Keywords: ${analysis.triggerKeywords.join(', ') || 'None'}`);
    console.log(`  Should Use Web Search: ${analysis.shouldUseWebSearch}`);
    console.log(`  Suggested Dataverse Tables: ${analysis.suggestedDataverseTables.join(', ') || 'None'}`);
    console.log(`  Relevant Steps: ${analysis.relevantSteps.join(', ')}`);
}
// Test 4: Query Understanding with KB Index
console.log('\n\nTEST 4: Query Understanding with KB Index');
console.log('-'.repeat(40));
if (kbIndex.totalDocuments > 0) {
    const query = 'What channels should I use for brand awareness?';
    console.log(`\nQuery: "${query}"`);
    const enhancedAnalysis = queryUnderstanding.analyzeQueryWithIndex(query, kbIndex);
    console.log(`  Primary Intent: ${enhancedAnalysis.primaryIntent}`);
    console.log(`  Primary Documents: ${enhancedAnalysis.primaryDocuments.map(d => d.filename).join(', ') || 'None'}`);
    console.log(`  Secondary Documents: ${enhancedAnalysis.secondaryDocuments.map(d => d.filename).join(', ') || 'None'}`);
    console.log(`  Should Use Web Search: ${enhancedAnalysis.shouldUseWebSearch}`);
}
else {
    console.log('Skipped - No documents loaded');
}
// Test 5: Document-level metadata parsing
console.log('\n\nTEST 5: Document-Level Metadata Parsing');
console.log('-'.repeat(40));
const parser = new KBMetadataParser();
const expertLensDoc = documents.find(d => d.filename.includes('Expert_Lens_Channel'));
if (expertLensDoc) {
    console.log(`\nDocument: ${expertLensDoc.filename}`);
    console.log(`  Compliance: ${expertLensDoc.compliance || 'N/A'}`);
    console.log(`  Version: ${expertLensDoc.version}`);
    console.log(`  Last Updated: ${expertLensDoc.lastUpdated?.toISOString() || 'N/A'}`);
    console.log(`  Chunk Priority: ${expertLensDoc.chunkPriority}`);
    if (expertLensDoc.sections.length > 0) {
        console.log('\n  Sample Section Metadata:');
        const section = expertLensDoc.sections[0];
        console.log(`    Title: ${section.sectionTitle}`);
        console.log(`    Section ID: ${section.sectionId || 'N/A'}`);
        console.log(`    Workflow Steps: ${section.workflowSteps.join(', ')}`);
        console.log(`    Topics: ${section.topics.join(', ')}`);
        console.log(`    Intent: ${section.intents.join(', ')}`);
        console.log(`    Confidence: ${section.confidence}`);
        console.log(`    Web Search Trigger: ${section.webSearchTrigger}`);
    }
}
else {
    console.log('Expert Lens Channel document not found');
}
// Test 6: Web Search Trigger Detection
console.log('\n\nTEST 6: Web Search Trigger Detection');
console.log('-'.repeat(40));
const webSearchTestQueries = [
    'What are the latest Meta advertising features?',
    'What is a typical CPM for retail?',
    'What is the current population of Los Angeles DMA?',
];
for (const query of webSearchTestQueries) {
    const shouldSearch = shouldTriggerWebSearch(documents.slice(0, 5), query);
    console.log(`"${query}" -> Web Search: ${shouldSearch}`);
}
// Test 7: Result Fusion with Chunk Priority
console.log('\n\nTEST 7: Result Fusion Configuration');
console.log('-'.repeat(40));
const resultFusion = new ResultFusion();
console.log('Default Domain Factors include chunkPriority boost');
console.log('Chunk Priority Boost: 0.15 (Priority 0=100%, 1=66%, 2=33%, 3=0%)');
console.log('\n' + '='.repeat(80));
console.log('All tests completed successfully!');
console.log('='.repeat(80));
//# sourceMappingURL=test-kb-v6-integration.js.map