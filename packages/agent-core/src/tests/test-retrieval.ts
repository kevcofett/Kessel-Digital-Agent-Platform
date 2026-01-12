/**
 * Test RAG retrieval against KB files
 * Run: npx ts-node src/tests/test-retrieval.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { RetrievalEngine } from '../rag/retrieval-engine';
import { DocumentProcessor } from '../rag/document-processor';
import { createEmbeddingProvider } from '../providers/embedding-factory';

interface DocumentChunk {
  content: string;
  metadata: {
    filename: string;
    chunkIndex: number;
  };
}

async function testRetrieval(): Promise<void> {
  console.log('=== Testing RAG Retrieval ===\n');

  // Check for API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: OPENAI_API_KEY environment variable not set');
    process.exit(1);
  }

  // Locate KB files
  const possiblePaths = [
    path.join(__dirname, '../../../../release/v5.5/agents/mpa/base/kb'),
    path.join(__dirname, '../../../../../release/v5.5/agents/mpa/base/kb'),
    path.resolve('/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/kb')
  ];

  let kbPath: string | null = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      kbPath = p;
      break;
    }
  }

  if (!kbPath) {
    console.error('KB path not found. Tried:');
    possiblePaths.forEach(p => console.error(`  - ${p}`));
    process.exit(1);
  }

  console.log(`KB Path: ${kbPath}\n`);

  // Load KB files
  const files = fs.readdirSync(kbPath).filter(f => f.endsWith('.txt'));
  console.log(`Found ${files.length} KB files`);

  if (files.length === 0) {
    console.error('No .txt files found in KB directory');
    process.exit(1);
  }

  // Process documents
  console.log('\n--- Processing Documents ---\n');

  const processor = new DocumentProcessor({
    chunkSize: 400,
    chunkOverlap: 50
  });

  const documents: DocumentChunk[] = [];
  const filesToProcess = files.slice(0, 5); // Test with first 5 files

  for (const file of filesToProcess) {
    const content = fs.readFileSync(path.join(kbPath, file), 'utf-8');
    const chunks = processor.chunk(content);
    console.log(`  ${file}: ${chunks.length} chunks`);

    chunks.forEach((chunk, i) => {
      documents.push({
        content: chunk,
        metadata: { filename: file, chunkIndex: i }
      });
    });
  }

  console.log(`\nTotal: ${documents.length} chunks from ${filesToProcess.length} files\n`);

  // Initialize embedding provider
  const embeddingProvider = createEmbeddingProvider('openai', {
    apiKey,
    model: 'text-embedding-3-small'
  });

  // Initialize retrieval engine
  console.log('--- Initializing Retrieval Engine ---\n');

  const retrieval = new RetrievalEngine({
    embeddingProvider,
    topK: 3,
    minScore: 0.5
  });

  console.log('Indexing documents...');
  await retrieval.indexDocuments(documents);
  console.log('Indexing complete.\n');

  // Test queries
  console.log('--- Running Test Queries ---\n');

  const testQueries = [
    "What is a typical CPM for CTV advertising?",
    "How should I allocate budget across channels?",
    "What KPIs should I track for awareness campaigns?"
  ];

  for (const query of testQueries) {
    console.log(`Query: "${query}"`);
    try {
      const results = await retrieval.search(query);

      if (results.length === 0) {
        console.log('  No results found\n');
        continue;
      }

      results.forEach((result, i) => {
        console.log(`  ${i + 1}. ${result.metadata.filename} (score: ${result.score.toFixed(4)})`);
        const preview = result.content.substring(0, 100).replace(/\n/g, ' ');
        console.log(`     "${preview}..."`);
      });
      console.log('');
    } catch (error) {
      console.error(`  Error: ${error}`);
      console.log('');
    }
  }

  // Test edge cases
  console.log('--- Edge Case Tests ---\n');

  // Empty query
  try {
    const emptyResults = await retrieval.search('');
    console.log(`Empty query: ${emptyResults.length} results (expected: 0 or handled gracefully)`);
  } catch (error) {
    console.log(`Empty query handled with error: ${error}`);
  }

  // Very long query
  const longQuery = 'What are the best practices for ' + 'media planning '.repeat(50);
  try {
    const longResults = await retrieval.search(longQuery);
    console.log(`Long query (${longQuery.length} chars): ${longResults.length} results`);
  } catch (error) {
    console.log(`Long query handled with error: ${error}`);
  }

  console.log('\n=== Retrieval Tests Complete ===');
}

// Run if executed directly
testRetrieval().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
