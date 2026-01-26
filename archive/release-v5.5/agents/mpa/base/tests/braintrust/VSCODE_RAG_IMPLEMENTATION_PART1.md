# VSCODE CLAUDE: IMPLEMENT MPA AGENTIC RAG SYSTEM

## MISSION

Implement a full agentic RAG system for the MPA Braintrust evaluation harness. This replaces static KB injection with agent-driven semantic retrieval using Claude's tool_use capability.

READ FIRST: /release/v5.5/agents/mpa/base/tests/braintrust/AGENTIC_RAG_SPECIFICATION.md

## IMPLEMENTATION SEQUENCE

Complete each phase in order. Do not skip ahead. Verify each phase works before proceeding.


## PHASE 1: PROJECT SETUP

### Step 1.1: Create package.json

Location: /release/v5.5/agents/mpa/base/tests/braintrust/package.json

```json
{
  "name": "mpa-braintrust-eval",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "eval": "node dist/mpa-multi-turn-eval.js",
    "eval:fast": "node dist/mpa-multi-turn-eval.js --fast",
    "index-kb": "node dist/rag/index-kb.js",
    "test:rag": "node dist/rag/test-rag.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.0",
    "braintrust": "^0.0.160",
    "dotenv": "^16.3.1",
    "natural": "^6.10.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  }
}
```

### Step 1.2: Install dependencies

```bash
cd release/v5.5/agents/mpa/base/tests/braintrust
npm install
```

### Step 1.3: Create rag directory

```bash
mkdir -p release/v5.5/agents/mpa/base/tests/braintrust/rag
```

### Step 1.4: Update tsconfig.json

Add to include array:
```json
"include": [
  "./**/*.ts",
  "./rag/**/*.ts"
]
```


## PHASE 2: RAG TYPE DEFINITIONS

### Step 2.1: Create rag/types.ts

```typescript
/**
 * RAG System Type Definitions
 */

// ============================================================================
// DOCUMENT PROCESSING TYPES
// ============================================================================

export interface DocumentChunk {
  id: string;                    // Unique: {filename}_{chunk_index}
  content: string;               // Chunk text
  filename: string;              // Source KB filename
  sectionTitle: string;          // Extracted section header
  chunkIndex: number;            // Position in document
  startChar: number;             // Character offset in original
  endChar: number;
  metadata: ChunkMetadata;
}

export interface ChunkMetadata {
  documentType: DocumentType;
  topics: Topic[];
  steps: number[];               // Relevant MPA steps
  hasNumbers: boolean;
  hasBenchmarks: boolean;
  verticals: string[];
  metrics: string[];
}

export type DocumentType = 
  | 'benchmark' 
  | 'framework' 
  | 'playbook' 
  | 'examples' 
  | 'implications'
  | 'operating-standards';

export type Topic = 
  | 'audience' 
  | 'budget' 
  | 'channel' 
  | 'measurement' 
  | 'benchmark' 
  | 'efficiency'
  | 'general';

// ============================================================================
// VECTOR STORE TYPES
// ============================================================================

export interface StoredChunk extends DocumentChunk {
  embedding: number[];
}

export interface SearchResult {
  chunk: DocumentChunk;
  score: number;
  scoreBreakdown: {
    semantic: number;
    keyword: number;
    metadataBoost: number;
  };
}

export interface MetadataFilter {
  documentTypes?: DocumentType[];
  topics?: Topic[];
  steps?: number[];
  mustHaveBenchmarks?: boolean;
  verticals?: string[];
}

// ============================================================================
// RETRIEVAL TYPES
// ============================================================================

export interface SearchOptions {
  topK?: number;
  minScore?: number;
  filters?: MetadataFilter;
  includeContext?: boolean;
}

export interface RetrievalResult {
  content: string;
  source: string;
  section: string;
  relevanceScore: number;
  citationText: string;
}

export interface BenchmarkResult {
  metric: string;
  vertical: string;
  value: string;
  qualifier: 'conservative' | 'typical' | 'ambitious' | 'aggressive';
  source: string;
  citationText: string;
}

export interface AudienceSizingResult {
  audienceType: string;
  totalSize: string;
  methodology: string;
  source: string;
  citationText: string;
}

// ============================================================================
// TOOL TYPES
// ============================================================================

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}

export interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResult {
  content: string;
  citations: string[];
  success: boolean;
}

export interface ToolUsageStats {
  totalCalls: number;
  callsByTool: Record<string, number>;
  averageResultsPerCall: number;
  citationsGenerated: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export const RAG_CONFIG = {
  chunking: {
    targetChunkSize: 400,
    maxChunkSize: 600,
    minChunkSize: 100,
    overlapTokens: 50,
  },
  embedding: {
    maxFeatures: 1000,
    minDocFreq: 2,
    maxDocFreqRatio: 0.95,
  },
  retrieval: {
    defaultTopK: 5,
    minScore: 0.2,
    semanticWeight: 0.6,
    keywordWeight: 0.4,
    benchmarkBoost: 1.5,
    exactMatchBoost: 2.0,
  },
  paths: {
    kbDirectory: '../kb',
    chunksCache: './rag-cache/kb-chunks.json',
    indexCache: './rag-cache/kb-index.json',
  }
} as const;

// ============================================================================
// KEYWORD MAPPINGS
// ============================================================================

export const TOPIC_KEYWORDS: Record<Topic, string[]> = {
  audience: ['audience', 'targeting', 'segment', 'demographic', 'persona', 'customer'],
  budget: ['budget', 'spend', 'allocation', 'investment', 'cost', 'dollar'],
  channel: ['channel', 'media', 'platform', 'placement', 'inventory', 'programmatic'],
  measurement: ['measurement', 'attribution', 'kpi', 'metric', 'tracking', 'analytics'],
  benchmark: ['benchmark', 'typical', 'average', 'range', 'industry', 'standard'],
  efficiency: ['cac', 'cpa', 'cpm', 'roas', 'efficiency', 'cost per', 'ltv'],
  general: [],
};

export const STEP_KEYWORDS: Record<number, string[]> = {
  1: ['objective', 'outcome', 'goal', 'success', 'business'],
  2: ['economics', 'ltv', 'cac', 'margin', 'profitability', 'unit'],
  3: ['audience', 'targeting', 'segment', 'persona', 'demographic'],
  4: ['geography', 'geo', 'dma', 'region', 'market', 'location'],
  5: ['budget', 'allocation', 'spend', 'investment'],
  6: ['value proposition', 'messaging', 'positioning', 'differentiation'],
  7: ['channel', 'media mix', 'platform', 'programmatic'],
  8: ['measurement', 'attribution', 'kpi', 'tracking'],
  9: ['testing', 'experiment', 'hypothesis', 'learn'],
  10: ['risk', 'mitigation', 'contingency', 'fallback'],
};

export const DOCUMENT_TYPE_PATTERNS: Record<DocumentType, RegExp[]> = {
  benchmark: [/benchmark/i, /analytics.*engine/i, /data/i],
  framework: [/framework/i, /expert.*lens/i, /strategic.*wisdom/i],
  playbook: [/playbook/i, /gap.*detection/i, /confidence/i],
  examples: [/example/i, /conversation/i, /template/i],
  implications: [/implications/i],
  'operating-standards': [/kb.*00/i, /operating.*standard/i, /supporting.*instruction/i],
};
```


## PHASE 3: DOCUMENT PROCESSOR

### Step 3.1: Create rag/document-processor.ts

```typescript
/**
 * Document Processor - Chunks KB files into retrievable passages
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  DocumentChunk,
  ChunkMetadata,
  DocumentType,
  Topic,
  RAG_CONFIG,
  TOPIC_KEYWORDS,
  STEP_KEYWORDS,
  DOCUMENT_TYPE_PATTERNS,
} from './types.js';

export class DocumentProcessor {
  private kbPath: string;

  constructor(kbPath: string = RAG_CONFIG.paths.kbDirectory) {
    this.kbPath = kbPath;
  }

  /**
   * Process all KB files and return chunks
   */
  async processAll(): Promise<DocumentChunk[]> {
    const files = await this.getKBFiles();
    const allChunks: DocumentChunk[] = [];

    for (const file of files) {
      const chunks = await this.processFile(file);
      allChunks.push(...chunks);
    }

    console.log(`Processed ${files.length} files into ${allChunks.length} chunks`);
    return allChunks;
  }

  /**
   * Get list of KB files
   */
  private async getKBFiles(): Promise<string[]> {
    const absolutePath = path.resolve(__dirname, '..', this.kbPath);
    const entries = await fs.readdir(absolutePath);
    return entries
      .filter(f => f.endsWith('.txt'))
      .map(f => path.join(absolutePath, f));
  }

  /**
   * Process a single file into chunks
   */
  private async processFile(filepath: string): Promise<DocumentChunk[]> {
    const content = await fs.readFile(filepath, 'utf-8');
    const filename = path.basename(filepath);
    const documentType = this.detectDocumentType(filename);

    // Split into sections first
    const sections = this.splitIntoSections(content);
    const chunks: DocumentChunk[] = [];
    let chunkIndex = 0;

    for (const section of sections) {
      const sectionChunks = this.chunkSection(
        section.content,
        section.title,
        filename,
        documentType,
        chunkIndex
      );
      
      for (const chunk of sectionChunks) {
        chunks.push(chunk);
        chunkIndex++;
      }
    }

    return chunks;
  }

  /**
   * Detect document type from filename
   */
  private detectDocumentType(filename: string): DocumentType {
    for (const [type, patterns] of Object.entries(DOCUMENT_TYPE_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(filename)) {
          return type as DocumentType;
        }
      }
    }
    return 'framework';
  }

  /**
   * Split content into sections based on headers
   */
  private splitIntoSections(content: string): Array<{ title: string; content: string }> {
    const sections: Array<{ title: string; content: string }> = [];
    
    // Pattern for ALL CAPS headers (our KB format)
    const headerPattern = /^([A-Z][A-Z\s]+)$/gm;
    
    let lastIndex = 0;
    let lastTitle = 'INTRODUCTION';
    let match;

    while ((match = headerPattern.exec(content)) !== null) {
      if (lastIndex < match.index) {
        const sectionContent = content.slice(lastIndex, match.index).trim();
        if (sectionContent.length > 50) {
          sections.push({
            title: lastTitle,
            content: sectionContent,
          });
        }
      }
      lastTitle = match[1].trim();
      lastIndex = match.index + match[0].length;
    }

    // Add final section
    const finalContent = content.slice(lastIndex).trim();
    if (finalContent.length > 50) {
      sections.push({
        title: lastTitle,
        content: finalContent,
      });
    }

    // If no sections found, treat entire content as one section
    if (sections.length === 0) {
      sections.push({
        title: 'CONTENT',
        content: content.trim(),
      });
    }

    return sections;
  }

  /**
   * Chunk a section into smaller pieces
   */
  private chunkSection(
    content: string,
    sectionTitle: string,
    filename: string,
    documentType: DocumentType,
    startIndex: number
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const { targetChunkSize, maxChunkSize, minChunkSize, overlapTokens } = RAG_CONFIG.chunking;

    // Rough token estimate: ~4 chars per token
    const targetChars = targetChunkSize * 4;
    const maxChars = maxChunkSize * 4;
    const minChars = minChunkSize * 4;
    const overlapChars = overlapTokens * 4;

    // Split by paragraphs first
    const paragraphs = content.split(/\n\n+/);
    
    let currentChunk = '';
    let chunkStart = 0;
    let localIndex = 0;

    for (const para of paragraphs) {
      const trimmedPara = para.trim();
      if (!trimmedPara) continue;

      // If adding this paragraph would exceed max, save current chunk
      if (currentChunk.length + trimmedPara.length > maxChars && currentChunk.length >= minChars) {
        chunks.push(this.createChunk(
          currentChunk.trim(),
          filename,
          sectionTitle,
          documentType,
          startIndex + localIndex,
          chunkStart
        ));
        localIndex++;
        
        // Start new chunk with overlap
        const overlapStart = Math.max(0, currentChunk.length - overlapChars);
        currentChunk = currentChunk.slice(overlapStart) + '\n\n' + trimmedPara;
        chunkStart += overlapStart;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + trimmedPara;
      }

      // If we've reached target size and paragraph boundary, save
      if (currentChunk.length >= targetChars) {
        chunks.push(this.createChunk(
          currentChunk.trim(),
          filename,
          sectionTitle,
          documentType,
          startIndex + localIndex,
          chunkStart
        ));
        localIndex++;
        
        // Overlap for next chunk
        const overlapStart = Math.max(0, currentChunk.length - overlapChars);
        currentChunk = currentChunk.slice(overlapStart);
        chunkStart += overlapStart;
      }
    }

    // Save remaining content
    if (currentChunk.trim().length >= minChars) {
      chunks.push(this.createChunk(
        currentChunk.trim(),
        filename,
        sectionTitle,
        documentType,
        startIndex + localIndex,
        chunkStart
      ));
    } else if (currentChunk.trim().length > 0 && chunks.length > 0) {
      // Append small remainder to last chunk
      const lastChunk = chunks[chunks.length - 1];
      lastChunk.content += '\n\n' + currentChunk.trim();
    } else if (currentChunk.trim().length > 0) {
      // First and only chunk, even if small
      chunks.push(this.createChunk(
        currentChunk.trim(),
        filename,
        sectionTitle,
        documentType,
        startIndex + localIndex,
        chunkStart
      ));
    }

    return chunks;
  }

  /**
   * Create a chunk with metadata
   */
  private createChunk(
    content: string,
    filename: string,
    sectionTitle: string,
    documentType: DocumentType,
    chunkIndex: number,
    startChar: number
  ): DocumentChunk {
    const metadata = this.extractMetadata(content, filename, documentType);

    return {
      id: `${filename.replace('.txt', '')}_${chunkIndex}`,
      content,
      filename,
      sectionTitle,
      chunkIndex,
      startChar,
      endChar: startChar + content.length,
      metadata,
    };
  }

  /**
   * Extract metadata from chunk content
   */
  private extractMetadata(
    content: string,
    filename: string,
    documentType: DocumentType
  ): ChunkMetadata {
    const contentLower = content.toLowerCase();

    // Detect topics
    const topics: Topic[] = [];
    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      if (topic === 'general') continue;
      if (keywords.some(kw => contentLower.includes(kw))) {
        topics.push(topic as Topic);
      }
    }
    if (topics.length === 0) topics.push('general');

    // Detect steps
    const steps: number[] = [];
    for (const [step, keywords] of Object.entries(STEP_KEYWORDS)) {
      if (keywords.some(kw => contentLower.includes(kw))) {
        steps.push(parseInt(step));
      }
    }

    // Detect numbers and benchmarks
    const hasNumbers = /\d+%|\$[\d,]+|\d+:\d+/.test(content);
    const hasBenchmarks = hasNumbers && (
      contentLower.includes('benchmark') ||
      contentLower.includes('typical') ||
      contentLower.includes('average') ||
      contentLower.includes('range')
    );

    // Extract verticals mentioned
    const verticalPatterns = [
      'ecommerce', 'e-commerce', 'retail', 'saas', 'b2b', 'b2c',
      'financial', 'healthcare', 'technology', 'cpg', 'automotive',
      'travel', 'hospitality', 'entertainment', 'media', 'education'
    ];
    const verticals = verticalPatterns.filter(v => contentLower.includes(v));

    // Extract metrics mentioned
    const metricPatterns = [
      'cac', 'cpa', 'cpm', 'ctr', 'cvr', 'roas', 'ltv', 'aov',
      'conversion rate', 'click rate', 'impression', 'reach', 'frequency'
    ];
    const metrics = metricPatterns.filter(m => contentLower.includes(m));

    return {
      documentType,
      topics,
      steps,
      hasNumbers,
      hasBenchmarks,
      verticals,
      metrics,
    };
  }

  /**
   * Save chunks to cache file
   */
  async saveToCache(chunks: DocumentChunk[]): Promise<void> {
    const cachePath = path.resolve(__dirname, RAG_CONFIG.paths.chunksCache);
    const cacheDir = path.dirname(cachePath);
    
    await fs.mkdir(cacheDir, { recursive: true });
    await fs.writeFile(cachePath, JSON.stringify(chunks, null, 2));
    console.log(`Saved ${chunks.length} chunks to ${cachePath}`);
  }

  /**
   * Load chunks from cache if available
   */
  async loadFromCache(): Promise<DocumentChunk[] | null> {
    try {
      const cachePath = path.resolve(__dirname, RAG_CONFIG.paths.chunksCache);
      const data = await fs.readFile(cachePath, 'utf-8');
      const chunks = JSON.parse(data) as DocumentChunk[];
      console.log(`Loaded ${chunks.length} chunks from cache`);
      return chunks;
    } catch {
      return null;
    }
  }
}

export default DocumentProcessor;
```


## PHASE 4: EMBEDDING SERVICE

### Step 4.1: Create rag/embedding-service.ts

```typescript
/**
 * Embedding Service - TF-IDF based embeddings using natural library
 */

import natural from 'natural';
import { DocumentChunk, RAG_CONFIG } from './types.js';

const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

export class EmbeddingService {
  private tfidf: natural.TfIdf;
  private vocabulary: Map<string, number>;
  private idfValues: Map<string, number>;
  private dimension: number;
  private initialized: boolean = false;

  constructor() {
    this.tfidf = new TfIdf();
    this.vocabulary = new Map();
    this.idfValues = new Map();
    this.dimension = RAG_CONFIG.embedding.maxFeatures;
  }

  /**
   * Initialize with corpus to build vocabulary
   */
  async initialize(chunks: DocumentChunk[]): Promise<void> {
    console.log('Building TF-IDF vocabulary...');

    // Add all documents to TF-IDF
    for (const chunk of chunks) {
      this.tfidf.addDocument(chunk.content.toLowerCase());
    }

    // Build vocabulary from most important terms across all documents
    const termScores: Map<string, number> = new Map();

    this.tfidf.documents.forEach((doc, docIndex) => {
      this.tfidf.listTerms(docIndex).forEach((item) => {
        const currentScore = termScores.get(item.term) || 0;
        termScores.set(item.term, currentScore + item.tfidf);
      });
    });

    // Sort by total TF-IDF score and take top N
    const sortedTerms = Array.from(termScores.entries())
      .filter(([term]) => term.length > 2) // Filter short terms
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.dimension);

    // Build vocabulary index
    sortedTerms.forEach(([term], index) => {
      this.vocabulary.set(term, index);
    });

    // Calculate IDF values
    const numDocs = chunks.length;
    for (const [term] of this.vocabulary) {
      const docsWithTerm = chunks.filter(c => 
        c.content.toLowerCase().includes(term)
      ).length;
      const idf = Math.log((numDocs + 1) / (docsWithTerm + 1)) + 1;
      this.idfValues.set(term, idf);
    }

    this.initialized = true;
    console.log(`Vocabulary built with ${this.vocabulary.size} terms`);
  }

  /**
   * Generate embedding for text
   */
  embed(text: string): number[] {
    if (!this.initialized) {
      throw new Error('EmbeddingService not initialized. Call initialize() first.');
    }

    const embedding = new Array(this.dimension).fill(0);
    const tokens = tokenizer.tokenize(text.toLowerCase()) || [];
    const termFreq: Map<string, number> = new Map();

    // Count term frequencies
    for (const token of tokens) {
      termFreq.set(token, (termFreq.get(token) || 0) + 1);
    }

    // Build TF-IDF vector
    for (const [term, tf] of termFreq) {
      const vocabIndex = this.vocabulary.get(term);
      if (vocabIndex !== undefined) {
        const idf = this.idfValues.get(term) || 1;
        // Sublinear TF: log(1 + tf)
        const tfidf = (1 + Math.log(tf)) * idf;
        embedding[vocabIndex] = tfidf;
      }
    }

    // L2 normalize
    return this.normalize(embedding);
  }

  /**
   * Generate embeddings for multiple texts
   */
  embedBatch(texts: string[]): number[][] {
    return texts.map(text => this.embed(text));
  }

  /**
   * L2 normalize a vector
   */
  private normalize(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) return vector;
    return vector.map(val => val / magnitude);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
    }
    
    // Vectors are already normalized, so dot product = cosine similarity
    return dotProduct;
  }

  /**
   * Get embedding dimension
   */
  getDimension(): number {
    return this.dimension;
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Export vocabulary for persistence
   */
  exportVocabulary(): { vocabulary: [string, number][]; idf: [string, number][] } {
    return {
      vocabulary: Array.from(this.vocabulary.entries()),
      idf: Array.from(this.idfValues.entries()),
    };
  }

  /**
   * Import vocabulary from persistence
   */
  importVocabulary(data: { vocabulary: [string, number][]; idf: [string, number][] }): void {
    this.vocabulary = new Map(data.vocabulary);
    this.idfValues = new Map(data.idf);
    this.initialized = true;
  }
}

export default EmbeddingService;
```


## PHASE 5: VECTOR STORE

### Step 5.1: Create rag/vector-store.ts

```typescript
/**
 * Vector Store - In-memory storage with semantic and keyword search
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import natural from 'natural';
import {
  DocumentChunk,
  StoredChunk,
  SearchResult,
  MetadataFilter,
  RAG_CONFIG,
} from './types.js';
import { EmbeddingService } from './embedding-service.js';

const BM25 = natural.TfIdf;

export class VectorStore {
  private chunks: StoredChunk[] = [];
  private embeddingService: EmbeddingService;
  private bm25: natural.TfIdf;

  constructor(embeddingService: EmbeddingService) {
    this.embeddingService = embeddingService;
    this.bm25 = new BM25();
  }

  /**
   * Add chunks with embeddings to store
   */
  addChunks(chunks: DocumentChunk[], embeddings: number[][]): void {
    if (chunks.length !== embeddings.length) {
      throw new Error('Chunks and embeddings count mismatch');
    }

    // Clear existing
    this.chunks = [];
    this.bm25 = new BM25();

    // Add to store
    for (let i = 0; i < chunks.length; i++) {
      this.chunks.push({
        ...chunks[i],
        embedding: embeddings[i],
      });
      this.bm25.addDocument(chunks[i].content.toLowerCase());
    }

    console.log(`Added ${chunks.length} chunks to vector store`);
  }

  /**
   * Semantic search using embeddings
   */
  searchSemantic(queryEmbedding: number[], topK: number): SearchResult[] {
    const results: SearchResult[] = [];

    for (const chunk of this.chunks) {
      const similarity = this.embeddingService.cosineSimilarity(
        queryEmbedding,
        chunk.embedding
      );

      results.push({
        chunk,
        score: similarity,
        scoreBreakdown: {
          semantic: similarity,
          keyword: 0,
          metadataBoost: 1,
        },
      });
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  /**
   * Keyword search using BM25
   */
  searchKeyword(query: string, topK: number): SearchResult[] {
    const queryLower = query.toLowerCase();
    const results: SearchResult[] = [];

    // Get BM25 scores
    this.bm25.tfidfs(queryLower, (docIndex, measure) => {
      if (docIndex < this.chunks.length) {
        results.push({
          chunk: this.chunks[docIndex],
          score: measure,
          scoreBreakdown: {
            semantic: 0,
            keyword: measure,
            metadataBoost: 1,
          },
        });
      }
    });

    // Normalize scores to 0-1 range
    const maxScore = Math.max(...results.map(r => r.score), 1);
    for (const result of results) {
      result.score = result.score / maxScore;
      result.scoreBreakdown.keyword = result.score;
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  /**
   * Hybrid search combining semantic and keyword
   */
  searchHybrid(
    query: string,
    queryEmbedding: number[],
    topK: number,
    semanticWeight: number = RAG_CONFIG.retrieval.semanticWeight
  ): SearchResult[] {
    const keywordWeight = 1 - semanticWeight;

    // Get both result sets
    const semanticResults = this.searchSemantic(queryEmbedding, topK * 2);
    const keywordResults = this.searchKeyword(query, topK * 2);

    // Build score map
    const scoreMap = new Map<string, SearchResult>();

    for (const result of semanticResults) {
      scoreMap.set(result.chunk.id, {
        ...result,
        score: result.score * semanticWeight,
        scoreBreakdown: {
          semantic: result.score,
          keyword: 0,
          metadataBoost: 1,
        },
      });
    }

    for (const result of keywordResults) {
      const existing = scoreMap.get(result.chunk.id);
      if (existing) {
        existing.score += result.score * keywordWeight;
        existing.scoreBreakdown.keyword = result.score;
      } else {
        scoreMap.set(result.chunk.id, {
          ...result,
          score: result.score * keywordWeight,
          scoreBreakdown: {
            semantic: 0,
            keyword: result.score,
            metadataBoost: 1,
          },
        });
      }
    }

    // Apply metadata boosts
    const results = Array.from(scoreMap.values());
    this.applyMetadataBoosts(results, query);

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  /**
   * Search with metadata filters
   */
  searchFiltered(
    query: string,
    queryEmbedding: number[],
    filters: MetadataFilter,
    topK: number
  ): SearchResult[] {
    // First get hybrid results
    const results = this.searchHybrid(query, queryEmbedding, topK * 3);

    // Apply filters
    const filtered = results.filter(result => {
      const meta = result.chunk.metadata;

      if (filters.documentTypes?.length && 
          !filters.documentTypes.includes(meta.documentType)) {
        return false;
      }

      if (filters.topics?.length && 
          !filters.topics.some(t => meta.topics.includes(t))) {
        return false;
      }

      if (filters.steps?.length && 
          !filters.steps.some(s => meta.steps.includes(s))) {
        return false;
      }

      if (filters.mustHaveBenchmarks && !meta.hasBenchmarks) {
        return false;
      }

      if (filters.verticals?.length && 
          !filters.verticals.some(v => meta.verticals.includes(v))) {
        return false;
      }

      return true;
    });

    return filtered.slice(0, topK);
  }

  /**
   * Apply metadata-based score boosts
   */
  private applyMetadataBoosts(results: SearchResult[], query: string): void {
    const queryLower = query.toLowerCase();
    const { benchmarkBoost, exactMatchBoost } = RAG_CONFIG.retrieval;

    for (const result of results) {
      let boost = 1;

      // Boost if query mentions benchmarks and chunk has them
      if ((queryLower.includes('benchmark') || queryLower.includes('typical') || 
           queryLower.includes('average')) && result.chunk.metadata.hasBenchmarks) {
        boost *= benchmarkBoost;
      }

      // Boost for exact phrase match
      if (result.chunk.content.toLowerCase().includes(queryLower)) {
        boost *= exactMatchBoost;
      }

      result.scoreBreakdown.metadataBoost = boost;
      result.score *= boost;
    }
  }

  /**
   * Persist store to disk
   */
  async persist(filepath: string): Promise<void> {
    const absolutePath = path.resolve(__dirname, filepath);
    const dir = path.dirname(absolutePath);
    await fs.mkdir(dir, { recursive: true });

    const data = {
      chunks: this.chunks,
      vocabulary: this.embeddingService.exportVocabulary(),
    };

    await fs.writeFile(absolutePath, JSON.stringify(data));
    console.log(`Persisted vector store to ${absolutePath}`);
  }

  /**
   * Load store from disk
   */
  async load(filepath: string): Promise<boolean> {
    try {
      const absolutePath = path.resolve(__dirname, filepath);
      const data = JSON.parse(await fs.readFile(absolutePath, 'utf-8'));

      this.chunks = data.chunks;
      this.embeddingService.importVocabulary(data.vocabulary);

      // Rebuild BM25 index
      this.bm25 = new BM25();
      for (const chunk of this.chunks) {
        this.bm25.addDocument(chunk.content.toLowerCase());
      }

      console.log(`Loaded ${this.chunks.length} chunks from ${absolutePath}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get chunk count
   */
  getChunkCount(): number {
    return this.chunks.length;
  }
}

export default VectorStore;
```

CONTINUE IN NEXT MESSAGE - This spec is getting long. 

Create a second file: VSCODE_RAG_IMPLEMENTATION_PART2.md with Phases 6-10.
