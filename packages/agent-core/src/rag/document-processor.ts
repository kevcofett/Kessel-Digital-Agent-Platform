/**
 * Document Processor - Chunks KB files into retrievable passages
 *
 * Generic document processor that accepts agent-specific configuration
 * for customizing chunking, metadata extraction, and file handling.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  DocumentChunk,
  ChunkMetadata,
  DocumentPurpose,
} from './types.js';
import { AgentRAGConfig, RAGSystemConfig, DEFAULT_RAG_CONFIG } from './config.js';

export class DocumentProcessor {
  private agentConfig: AgentRAGConfig;
  private systemConfig: RAGSystemConfig;
  private basePath: string;

  constructor(
    agentConfig: AgentRAGConfig,
    systemConfig?: Partial<RAGSystemConfig>,
    basePath?: string
  ) {
    this.agentConfig = agentConfig;
    this.systemConfig = { ...DEFAULT_RAG_CONFIG, ...systemConfig };
    this.basePath = basePath || process.cwd();
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
   * Get list of KB files (excluding configured files)
   */
  private async getKBFiles(): Promise<string[]> {
    const kbPath = this.resolveKBPath();
    const entries = await fs.readdir(kbPath);
    return entries
      .filter(f => f.endsWith('.txt') || f.endsWith('.md'))
      .filter(f => !this.agentConfig.excludedFiles.includes(f))
      .map(f => path.join(kbPath, f));
  }

  /**
   * Resolve the KB path
   */
  private resolveKBPath(): string {
    if (path.isAbsolute(this.agentConfig.kbPath)) {
      return this.agentConfig.kbPath;
    }
    return path.resolve(this.basePath, this.agentConfig.kbPath);
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
   * Detect document type from filename using agent config
   */
  private detectDocumentType(filename: string): string {
    for (const [type, patterns] of Object.entries(this.agentConfig.documentTypePatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(filename)) {
          return type;
        }
      }
    }
    return 'document';
  }

  /**
   * Detect document purpose from filename
   */
  private detectDocumentPurpose(filename: string): DocumentPurpose {
    for (const [purpose, patterns] of Object.entries(this.agentConfig.documentPurposePatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(filename)) {
          return purpose as DocumentPurpose;
        }
      }
    }
    return 'reference';
  }

  /**
   * Split content into sections based on headers
   * Supports multiple header formats:
   * - ALL CAPS: "SECTION NAME" or "SECTION 1: NAME"
   * - Numbered: "1.1 Section Name" or "1. Section Name"
   * - Markdown: "## Section Name" or "### Section Name"
   */
  private splitIntoSections(content: string): Array<{ title: string; content: string }> {
    const sections: Array<{ title: string; content: string }> = [];

    // Combined pattern for multiple header formats
    const headerPatterns = [
      /^([A-Z][A-Z\s:]+[A-Z])$/gm,                    // ALL CAPS
      /^(SECTION\s+\d+[:\s].*)$/gim,                  // "SECTION 1: Name"
      /^(\d+\.\d*\s+[A-Z].{2,50})$/gm,                // Numbered: "1.1 Section Name"
      /^(#{1,3}\s+.{3,60})$/gm,                       // Markdown: "## Section Name"
    ];

    // Find all headers with their positions
    const headerMatches: Array<{ index: number; title: string; length: number }> = [];

    for (const pattern of headerPatterns) {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(content)) !== null) {
        let title = match[1].trim();
        title = title.replace(/^#+\s*/, '');
        title = title.replace(/\s+/g, ' ');

        headerMatches.push({
          index: match.index,
          title,
          length: match[0].length,
        });
      }
    }

    // Sort by position and deduplicate
    headerMatches.sort((a, b) => a.index - b.index);

    const uniqueHeaders: typeof headerMatches = [];
    for (const header of headerMatches) {
      const lastHeader = uniqueHeaders[uniqueHeaders.length - 1];
      if (!lastHeader || header.index >= lastHeader.index + lastHeader.length) {
        uniqueHeaders.push(header);
      }
    }

    // Extract sections between headers
    let lastIndex = 0;
    let lastTitle = 'INTRODUCTION';

    for (const header of uniqueHeaders) {
      if (lastIndex < header.index) {
        const sectionContent = content.slice(lastIndex, header.index).trim();
        if (sectionContent.length > 50) {
          sections.push({
            title: lastTitle,
            content: sectionContent,
          });
        }
      }
      lastTitle = header.title;
      lastIndex = header.index + header.length;
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
    documentType: string,
    startIndex: number
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const { targetChunkSize, maxChunkSize, minChunkSize, overlapTokens } = this.systemConfig.chunking;

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

        const overlapStart = Math.max(0, currentChunk.length - overlapChars);
        currentChunk = currentChunk.slice(overlapStart) + '\n\n' + trimmedPara;
        chunkStart += overlapStart;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + trimmedPara;
      }

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
      const lastChunk = chunks[chunks.length - 1];
      lastChunk.content += '\n\n' + currentChunk.trim();
    } else if (currentChunk.trim().length > 0) {
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
    documentType: string,
    chunkIndex: number,
    startChar: number
  ): DocumentChunk {
    const metadata = this.extractMetadata(content, filename, documentType);

    return {
      id: `${filename.replace(/\.[^.]+$/, '')}_${chunkIndex}`,
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
    documentType: string
  ): ChunkMetadata {
    const contentLower = content.toLowerCase();
    const documentPurpose = this.detectDocumentPurpose(filename);
    const isDeprioritized = this.agentConfig.deprioritizedFiles.some(f => filename.includes(f));

    // Detect topics using agent config
    const topics: string[] = [];
    for (const [topic, keywords] of Object.entries(this.agentConfig.topicKeywords)) {
      if (topic === 'general') continue;
      if (keywords.some(kw => contentLower.includes(kw))) {
        topics.push(topic);
      }
    }
    if (topics.length === 0) topics.push('general');

    // Detect steps using agent config
    const steps: number[] = [];
    for (const [step, keywords] of Object.entries(this.agentConfig.stepKeywords)) {
      if (keywords.some(kw => contentLower.includes(kw))) {
        steps.push(parseInt(step));
      }
    }

    // Extract benchmark details
    const benchmarkDetails = this.extractBenchmarkDetails(content);

    // Extract verticals using agent config
    const verticals = this.agentConfig.verticalPatterns.filter(v => contentLower.includes(v));

    // Extract metrics using agent config (with synonym support)
    const metrics = this.agentConfig.metricPatterns.filter(m => this.matchesSynonyms(contentLower, m));

    // Extract normalized terms for improved search
    const normalizedTerms = this.extractNormalizedTerms(contentLower);

    return {
      documentType,
      topics,
      steps,
      hasNumbers: /\d+%|\$[\d,]+|\d+:\d+/.test(content),
      hasBenchmarks: benchmarkDetails.hasBenchmarks,
      verticals,
      metrics,
      documentPurpose,
      normalizedTerms,
      benchmarkRanges: benchmarkDetails.benchmarkRanges,
      confidenceQualifiers: benchmarkDetails.confidenceQualifiers,
      isDeprioritized,
    };
  }

  /**
   * Check if content matches any synonym for a canonical term
   */
  private matchesSynonyms(contentLower: string, canonicalTerm: string): boolean {
    if (contentLower.includes(canonicalTerm)) return true;

    const synonyms = this.agentConfig.synonymMappings[canonicalTerm];
    if (synonyms) {
      return synonyms.some(syn => contentLower.includes(syn));
    }
    return false;
  }

  /**
   * Extract normalized terms from content
   */
  private extractNormalizedTerms(contentLower: string): string[] {
    const terms: string[] = [];

    for (const [canonical, synonyms] of Object.entries(this.agentConfig.synonymMappings)) {
      if (contentLower.includes(canonical) || synonyms.some(syn => contentLower.includes(syn))) {
        terms.push(canonical);
      }
    }

    return terms;
  }

  /**
   * Extract benchmark values with qualitative context
   */
  private extractBenchmarkDetails(content: string): {
    hasBenchmarks: boolean;
    benchmarkRanges: string[];
    confidenceQualifiers: string[];
  } {
    const contentLower = content.toLowerCase();

    const hasBenchmarkKeywords =
      contentLower.includes('benchmark') ||
      contentLower.includes('typical') ||
      contentLower.includes('average') ||
      contentLower.includes('range') ||
      contentLower.includes('industry standard');

    // Extract numeric ranges
    const rangePatterns = [
      /(\d+(?:\.\d+)?)\s*[-–to]+\s*(\d+(?:\.\d+)?)\s*%/g,
      /\$[\d,]+\s*[-–to]+\s*\$[\d,]+/g,
      /(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)\s*(?:ratio|to\s*\d)/gi,
      /(?:under|below|less than)\s*(\d+(?:\.\d+)?%?)/gi,
      /(?:above|over|greater than|exceeds?)\s*(\d+(?:\.\d+)?%?)/gi,
    ];

    const benchmarkRanges: string[] = [];
    for (const pattern of rangePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        benchmarkRanges.push(...matches);
      }
    }

    // Extract confidence qualifiers
    const qualifierPatterns = [
      /conservative[\s:]*(\d+(?:\.\d+)?[-–\s%to]+\d+(?:\.\d+)?%?)/gi,
      /typical[\s:]*(\d+(?:\.\d+)?[-–\s%to]+\d+(?:\.\d+)?%?)/gi,
      /aggressive[\s:]*(\d+(?:\.\d+)?[-–\s%to]+\d+(?:\.\d+)?%?)/gi,
      /ambitious[\s:]*(\d+(?:\.\d+)?[-–\s%to]+\d+(?:\.\d+)?%?)/gi,
      /moderate[\s:]*(\d+(?:\.\d+)?[-–\s%to]+\d+(?:\.\d+)?%?)/gi,
    ];

    const confidenceQualifiers: string[] = [];
    for (const pattern of qualifierPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        confidenceQualifiers.push(match[0]);
      }
    }

    const hasNumbers = /\d+%|\$[\d,]+|\d+:\d+/.test(content);
    const hasBenchmarks = hasNumbers && (hasBenchmarkKeywords || benchmarkRanges.length > 0);

    return {
      hasBenchmarks,
      benchmarkRanges,
      confidenceQualifiers,
    };
  }

  /**
   * Save chunks to cache file
   */
  async saveToCache(chunks: DocumentChunk[]): Promise<void> {
    const cachePath = path.resolve(this.basePath, this.systemConfig.paths.chunksCache);
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
      const cachePath = path.resolve(this.basePath, this.systemConfig.paths.chunksCache);
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
