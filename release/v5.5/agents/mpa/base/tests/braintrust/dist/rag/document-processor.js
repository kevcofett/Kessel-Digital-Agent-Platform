/**
 * Document Processor - Chunks KB files into retrievable passages
 *
 * v6.0 Enhanced with:
 * - Integration with KBMetadataParser for structured headers
 * - Concept-aligned semantic chunking
 * - Multi-format section header detection (ALL CAPS, numbered, markdown)
 * - Synonym normalization for key MPA terms
 * - Document purpose tagging
 * - Enhanced benchmark extraction
 * - Content-type aware chunk sizing
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { RAG_CONFIG, TOPIC_KEYWORDS, STEP_KEYWORDS, DOCUMENT_TYPE_PATTERNS, SYNONYM_MAPPINGS, } from './types.js';
import { KBMetadataParser, } from './kb-metadata-parser.js';
const DOCUMENT_PURPOSE_PATTERNS = {
    definitive: [/analytics_engine/i, /confidence_level/i, /gap_detection/i],
    guidance: [/expert_lens/i, /strategic_wisdom/i, /implications/i],
    reference: [/framework/i, /benchmark/i, /reference/i],
    procedural: [/operating_standards/i, /playbook/i, /process/i],
    template: [/output_templates/i, /template/i],
    example: [/conversation_examples/i, /examples/i],
};
/**
 * Content-type aware chunk size configurations
 * Per MPA v6.0 Improvement Plan Section 3.4
 */
const CONTENT_TYPE_CHUNK_SIZES = {
    definition: { target: 300, max: 400, min: 150 }, // Quick lookup, one concept
    benchmark: { target: 600, max: 800, min: 300 }, // Table + context
    framework: { target: 1200, max: 1500, min: 600 }, // Complete decision tree
    expert: { target: 1500, max: 2000, min: 800 }, // Nuanced reasoning
    example: { target: 2000, max: 3000, min: 1000 }, // Full conversation turn
    default: { target: 400, max: 600, min: 100 }, // Standard chunks
};
/**
 * Files to exclude or deprioritize from RAG
 */
const EXCLUDED_FILES = ['Output_Templates_v5_5.txt'];
const DEPRIORITIZED_FILES = ['Conversation_Examples_v5_5.txt'];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class DocumentProcessor {
    kbPath;
    metadataParser;
    useSemanticChunking;
    constructor(kbPath = RAG_CONFIG.paths.kbDirectory, options = {}) {
        this.kbPath = kbPath;
        this.metadataParser = new KBMetadataParser();
        this.useSemanticChunking = options.useSemanticChunking ?? true;
    }
    /**
     * Process all KB files and return chunks
     */
    async processAll() {
        const files = await this.getKBFiles();
        const allChunks = [];
        for (const file of files) {
            const chunks = await this.processFile(file);
            allChunks.push(...chunks);
        }
        console.log(`Processed ${files.length} files into ${allChunks.length} chunks`);
        return allChunks;
    }
    /**
     * Process all KB files with v6.0 enhanced metadata
     */
    async processAllEnhanced() {
        const files = await this.getKBFiles();
        const allChunks = [];
        for (const file of files) {
            const chunks = await this.processFileEnhanced(file);
            allChunks.push(...chunks);
        }
        console.log(`[v6.0] Processed ${files.length} files into ${allChunks.length} enhanced chunks`);
        return allChunks;
    }
    /**
     * Get list of KB files (excluding templates and low-value files)
     */
    async getKBFiles() {
        const absolutePath = path.resolve(__dirname, '..', this.kbPath);
        const entries = await fs.readdir(absolutePath);
        return entries
            .filter(f => f.endsWith('.txt'))
            .filter(f => !EXCLUDED_FILES.includes(f))
            .map(f => path.join(absolutePath, f));
    }
    /**
     * Process a single file into chunks (legacy method for backwards compatibility)
     */
    async processFile(filepath) {
        const content = await fs.readFile(filepath, 'utf-8');
        const filename = path.basename(filepath);
        const documentType = this.detectDocumentType(filename);
        // Split into sections first
        const sections = this.splitIntoSections(content);
        const chunks = [];
        let chunkIndex = 0;
        for (const section of sections) {
            const sectionChunks = this.chunkSection(section.content, section.title, filename, documentType, chunkIndex);
            for (const chunk of sectionChunks) {
                chunks.push(chunk);
                chunkIndex++;
            }
        }
        return chunks;
    }
    /**
     * Process a single file with v6.0 enhanced chunking
     */
    async processFileEnhanced(filepath) {
        const content = await fs.readFile(filepath, 'utf-8');
        const filename = path.basename(filepath);
        // Use new metadata parser - include filepath for v6.0 metadata
        const docMetadata = this.metadataParser.parseDocument(content, filename, filepath);
        const chunks = [];
        let chunkIndex = 0;
        // If document has structured sections from parser, use them
        if (docMetadata.sections.length > 0) {
            for (const section of docMetadata.sections) {
                const sectionContent = this.extractSectionContent(content, section.sectionTitle);
                const contentType = this.detectContentType(sectionContent, section);
                const sectionChunks = this.chunkSectionSemantic(sectionContent, section, filename, docMetadata.documentType, chunkIndex, contentType);
                for (const chunk of sectionChunks) {
                    // KB v6.0: Attach document-level metadata for priority boosting
                    chunk.documentMetadata = docMetadata;
                    chunks.push(chunk);
                    chunkIndex++;
                }
            }
        }
        else {
            // Fall back to legacy section splitting
            const sections = this.splitIntoSections(content);
            for (const section of sections) {
                const contentType = this.detectContentTypeFromContent(section.content);
                const sectionChunks = this.chunkSectionSemantic(section.content, null, filename, docMetadata.documentType, chunkIndex, contentType);
                for (const chunk of sectionChunks) {
                    // Set section title from legacy parsing
                    chunk.sectionTitle = section.title;
                    // KB v6.0: Attach document-level metadata for priority boosting
                    chunk.documentMetadata = docMetadata;
                    chunks.push(chunk);
                    chunkIndex++;
                }
            }
        }
        return chunks;
    }
    /**
     * Extract section content from document using section title
     */
    extractSectionContent(content, sectionTitle) {
        // Find the section by title
        const titlePattern = new RegExp(`(?:^|\\n)(?:=+\\n)?${this.escapeRegex(sectionTitle)}(?:\\n=+)?\\n([\\s\\S]*?)(?=(?:\\n=+\\n[A-Z])|$)`, 'i');
        const match = content.match(titlePattern);
        if (match) {
            return match[1].trim();
        }
        // Fallback: find content after the title
        const titleIndex = content.indexOf(sectionTitle);
        if (titleIndex !== -1) {
            const afterTitle = content.slice(titleIndex + sectionTitle.length);
            const nextSection = afterTitle.search(/\n={40,}\n/);
            if (nextSection !== -1) {
                return afterTitle.slice(0, nextSection).trim();
            }
            return afterTitle.trim();
        }
        return '';
    }
    /**
     * Escape special regex characters
     */
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    /**
     * Detect content type for chunk size optimization
     */
    detectContentType(content, section) {
        const contentLower = content.toLowerCase();
        const titleLower = section?.sectionTitle.toLowerCase() || '';
        // Check for definitions (short, reference content)
        if (titleLower.includes('definition') ||
            titleLower.includes('glossary') ||
            contentLower.match(/^[a-z]+:\s+/m)) {
            return 'definition';
        }
        // Check for benchmarks (numeric data)
        if (titleLower.includes('benchmark') ||
            contentLower.includes('benchmark') ||
            (content.match(/\d+%/g) || []).length > 3) {
            return 'benchmark';
        }
        // Check for expert guidance (nuanced reasoning)
        if (titleLower.includes('expert') ||
            titleLower.includes('strategic') ||
            section?.intents.includes('BUDGET_PLANNING') ||
            section?.intents.includes('CHANNEL_SELECTION')) {
            return 'expert';
        }
        // Check for frameworks (decision trees)
        if (titleLower.includes('framework') ||
            titleLower.includes('process') ||
            contentLower.includes('step 1') ||
            contentLower.includes('if ... then')) {
            return 'framework';
        }
        // Check for examples (conversation turns)
        if (titleLower.includes('example') ||
            titleLower.includes('conversation') ||
            contentLower.includes('user:') ||
            contentLower.includes('agent:')) {
            return 'example';
        }
        return 'default';
    }
    /**
     * Detect content type from content only (for legacy path)
     */
    detectContentTypeFromContent(content) {
        const contentLower = content.toLowerCase();
        if ((content.match(/\d+%/g) || []).length > 3)
            return 'benchmark';
        if (contentLower.includes('user:') || contentLower.includes('agent:'))
            return 'example';
        if (contentLower.includes('step 1') || contentLower.includes('framework'))
            return 'framework';
        if (contentLower.match(/^[a-z]+:\s+/m))
            return 'definition';
        return 'default';
    }
    /**
     * Chunk section with semantic awareness (v6.0)
     */
    chunkSectionSemantic(content, sectionMetadata, filename, documentType, startIndex, contentType) {
        const chunks = [];
        // Get content-type aware chunk sizes
        const chunkConfig = CONTENT_TYPE_CHUNK_SIZES[contentType] || CONTENT_TYPE_CHUNK_SIZES.default;
        // Rough token estimate: ~4 chars per token
        const targetChars = chunkConfig.target;
        const maxChars = chunkConfig.max;
        const minChars = chunkConfig.min;
        const overlapChars = RAG_CONFIG.chunking.overlapTokens * 4;
        // Detect semantic boundaries within the section
        const semanticUnits = this.detectSemanticUnits(content);
        let currentChunk = '';
        let chunkStart = 0;
        let localIndex = 0;
        let isSemanticBoundary = true;
        for (const unit of semanticUnits) {
            const trimmedUnit = unit.content.trim();
            if (!trimmedUnit)
                continue;
            // If adding this unit would exceed max, save current chunk
            if (currentChunk.length + trimmedUnit.length > maxChars && currentChunk.length >= minChars) {
                chunks.push(this.createEnhancedChunk(currentChunk.trim(), filename, sectionMetadata?.sectionTitle || 'CONTENT', documentType, startIndex + localIndex, chunkStart, sectionMetadata, contentType, isSemanticBoundary));
                localIndex++;
                // Start new chunk with overlap
                const overlapStart = Math.max(0, currentChunk.length - overlapChars);
                currentChunk = currentChunk.slice(overlapStart) + '\n\n' + trimmedUnit;
                chunkStart += overlapStart;
                isSemanticBoundary = unit.isBoundary;
            }
            else {
                currentChunk += (currentChunk ? '\n\n' : '') + trimmedUnit;
                // Preserve semantic boundary status if this is a boundary unit
                if (unit.isBoundary && currentChunk.length < minChars) {
                    isSemanticBoundary = true;
                }
            }
            // If we've reached target size and at a semantic boundary, save
            if (currentChunk.length >= targetChars && unit.isBoundary) {
                chunks.push(this.createEnhancedChunk(currentChunk.trim(), filename, sectionMetadata?.sectionTitle || 'CONTENT', documentType, startIndex + localIndex, chunkStart, sectionMetadata, contentType, true));
                localIndex++;
                // Overlap for next chunk
                const overlapStart = Math.max(0, currentChunk.length - overlapChars);
                currentChunk = currentChunk.slice(overlapStart);
                chunkStart += overlapStart;
                isSemanticBoundary = false;
            }
        }
        // Save remaining content
        if (currentChunk.trim().length >= minChars) {
            chunks.push(this.createEnhancedChunk(currentChunk.trim(), filename, sectionMetadata?.sectionTitle || 'CONTENT', documentType, startIndex + localIndex, chunkStart, sectionMetadata, contentType, isSemanticBoundary));
        }
        else if (currentChunk.trim().length > 0 && chunks.length > 0) {
            // Append small remainder to last chunk
            const lastChunk = chunks[chunks.length - 1];
            lastChunk.content += '\n\n' + currentChunk.trim();
        }
        else if (currentChunk.trim().length > 0) {
            // First and only chunk, even if small
            chunks.push(this.createEnhancedChunk(currentChunk.trim(), filename, sectionMetadata?.sectionTitle || 'CONTENT', documentType, startIndex + localIndex, chunkStart, sectionMetadata, contentType, isSemanticBoundary));
        }
        return chunks;
    }
    /**
     * Detect semantic units (concept boundaries) within content
     */
    detectSemanticUnits(content) {
        const units = [];
        // Split by double newlines first (paragraph boundaries)
        const paragraphs = content.split(/\n\n+/);
        for (const para of paragraphs) {
            const trimmed = para.trim();
            if (!trimmed)
                continue;
            // Check if this paragraph is a semantic boundary
            const isBoundary = this.isSemanticBoundary(trimmed);
            units.push({
                content: trimmed,
                isBoundary,
            });
        }
        return units;
    }
    /**
     * Check if content represents a semantic boundary (complete concept)
     */
    isSemanticBoundary(content) {
        const contentLower = content.toLowerCase();
        // Headers are always boundaries
        if (content.match(/^[A-Z][A-Z\s]+[A-Z]$/m))
            return true;
        if (content.match(/^\d+\.\d*\s+[A-Z]/m))
            return true;
        // Lists that end (last item of a list)
        if (content.match(/^[-•]\s+.+[.!?]$/))
            return true;
        // Complete sentences with conclusion markers
        if (contentLower.includes('in summary') ||
            contentLower.includes('therefore') ||
            contentLower.includes('in conclusion') ||
            contentLower.includes('the key is')) {
            return true;
        }
        // Benchmark statements (complete data points)
        if (content.match(/\d+%.*typical|typical.*\d+%/i))
            return true;
        if (content.match(/\$[\d,]+.*average|average.*\$[\d,]+/i))
            return true;
        // Content ending with period suggests complete thought
        if (content.endsWith('.') && content.length > 100)
            return true;
        return false;
    }
    /**
     * Create enhanced chunk with v6.0 metadata
     */
    createEnhancedChunk(content, filename, sectionTitle, documentType, chunkIndex, startChar, kbMetadata, contentType, semanticBoundary) {
        const metadata = this.extractMetadata(content, filename, documentType);
        // Merge KB metadata into chunk metadata
        if (kbMetadata) {
            metadata.steps = kbMetadata.workflowSteps.length > 0
                ? kbMetadata.workflowSteps
                : metadata.steps;
            metadata.verticals = kbMetadata.verticals.length > 0
                ? kbMetadata.verticals.map(v => v.toLowerCase())
                : metadata.verticals;
        }
        return {
            id: `${filename.replace('.txt', '')}_${chunkIndex}`,
            content,
            filename,
            sectionTitle,
            chunkIndex,
            startChar,
            endChar: startChar + content.length,
            metadata,
            kbMetadata: kbMetadata || undefined,
            contentType,
            semanticBoundary,
        };
    }
    /**
     * Detect document type from filename
     */
    detectDocumentType(filename) {
        for (const [type, patterns] of Object.entries(DOCUMENT_TYPE_PATTERNS)) {
            for (const pattern of patterns) {
                if (pattern.test(filename)) {
                    return type;
                }
            }
        }
        return 'framework';
    }
    /**
     * Split content into sections based on headers (legacy method)
     * Supports multiple header formats:
     * - ALL CAPS: "SECTION NAME" or "SECTION 1: NAME"
     * - Numbered: "1.1 Section Name" or "1. Section Name"
     * - Markdown: "## Section Name" or "### Section Name"
     */
    splitIntoSections(content) {
        const sections = [];
        // Combined pattern for multiple header formats
        const headerPatterns = [
            /^([A-Z][A-Z\s:]+[A-Z])$/gm,
            /^(SECTION\s+\d+[:\s].*)$/gim,
            /^(\d+\.\d*\s+[A-Z].{2,50})$/gm,
            /^(#{1,3}\s+.{3,60})$/gm,
        ];
        // Find all headers with their positions
        const headerMatches = [];
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
        const uniqueHeaders = [];
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
     * Chunk a section into smaller pieces (legacy method)
     */
    chunkSection(content, sectionTitle, filename, documentType, startIndex) {
        const chunks = [];
        const { targetChunkSize, maxChunkSize, minChunkSize, overlapTokens } = RAG_CONFIG.chunking;
        const targetChars = targetChunkSize * 4;
        const maxChars = maxChunkSize * 4;
        const minChars = minChunkSize * 4;
        const overlapChars = overlapTokens * 4;
        const paragraphs = content.split(/\n\n+/);
        let currentChunk = '';
        let chunkStart = 0;
        let localIndex = 0;
        for (const para of paragraphs) {
            const trimmedPara = para.trim();
            if (!trimmedPara)
                continue;
            if (currentChunk.length + trimmedPara.length > maxChars && currentChunk.length >= minChars) {
                chunks.push(this.createChunk(currentChunk.trim(), filename, sectionTitle, documentType, startIndex + localIndex, chunkStart));
                localIndex++;
                const overlapStart = Math.max(0, currentChunk.length - overlapChars);
                currentChunk = currentChunk.slice(overlapStart) + '\n\n' + trimmedPara;
                chunkStart += overlapStart;
            }
            else {
                currentChunk += (currentChunk ? '\n\n' : '') + trimmedPara;
            }
            if (currentChunk.length >= targetChars) {
                chunks.push(this.createChunk(currentChunk.trim(), filename, sectionTitle, documentType, startIndex + localIndex, chunkStart));
                localIndex++;
                const overlapStart = Math.max(0, currentChunk.length - overlapChars);
                currentChunk = currentChunk.slice(overlapStart);
                chunkStart += overlapStart;
            }
        }
        if (currentChunk.trim().length >= minChars) {
            chunks.push(this.createChunk(currentChunk.trim(), filename, sectionTitle, documentType, startIndex + localIndex, chunkStart));
        }
        else if (currentChunk.trim().length > 0 && chunks.length > 0) {
            const lastChunk = chunks[chunks.length - 1];
            lastChunk.content += '\n\n' + currentChunk.trim();
        }
        else if (currentChunk.trim().length > 0) {
            chunks.push(this.createChunk(currentChunk.trim(), filename, sectionTitle, documentType, startIndex + localIndex, chunkStart));
        }
        return chunks;
    }
    /**
     * Create a chunk with metadata (legacy method)
     */
    createChunk(content, filename, sectionTitle, documentType, chunkIndex, startChar) {
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
     * Detect document purpose from filename
     */
    detectDocumentPurpose(filename) {
        for (const [purpose, patterns] of Object.entries(DOCUMENT_PURPOSE_PATTERNS)) {
            for (const pattern of patterns) {
                if (pattern.test(filename)) {
                    return purpose;
                }
            }
        }
        return 'reference';
    }
    /**
     * Check if content matches any synonym for a canonical term
     */
    matchesSynonyms(contentLower, canonicalTerm) {
        if (contentLower.includes(canonicalTerm))
            return true;
        const synonyms = SYNONYM_MAPPINGS[canonicalTerm];
        if (synonyms) {
            return synonyms.some(syn => contentLower.includes(syn));
        }
        return false;
    }
    /**
     * Extract normalized terms from content (for search optimization)
     */
    extractNormalizedTerms(contentLower) {
        const terms = [];
        for (const [canonical, synonyms] of Object.entries(SYNONYM_MAPPINGS)) {
            if (contentLower.includes(canonical) || synonyms.some(syn => contentLower.includes(syn))) {
                terms.push(canonical);
            }
        }
        return terms;
    }
    /**
     * Extract benchmark values with qualitative context
     */
    extractBenchmarkDetails(content) {
        const contentLower = content.toLowerCase();
        const hasBenchmarkKeywords = contentLower.includes('benchmark') ||
            contentLower.includes('typical') ||
            contentLower.includes('average') ||
            contentLower.includes('range') ||
            contentLower.includes('industry standard');
        const rangePatterns = [
            /(\d+(?:\.\d+)?)\s*[-–to]+\s*(\d+(?:\.\d+)?)\s*%/g,
            /\$[\d,]+\s*[-–to]+\s*\$[\d,]+/g,
            /(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)\s*(?:ratio|to\s*\d)/gi,
            /(?:under|below|less than)\s*(\d+(?:\.\d+)?%?)/gi,
            /(?:above|over|greater than|exceeds?)\s*(\d+(?:\.\d+)?%?)/gi,
        ];
        const benchmarkRanges = [];
        for (const pattern of rangePatterns) {
            const matches = content.match(pattern);
            if (matches) {
                benchmarkRanges.push(...matches);
            }
        }
        const qualifierPatterns = [
            /conservative[\s:]*(\d+(?:\.\d+)?[-–\s%to]+\d+(?:\.\d+)?%?)/gi,
            /typical[\s:]*(\d+(?:\.\d+)?[-–\s%to]+\d+(?:\.\d+)?%?)/gi,
            /aggressive[\s:]*(\d+(?:\.\d+)?[-–\s%to]+\d+(?:\.\d+)?%?)/gi,
            /ambitious[\s:]*(\d+(?:\.\d+)?[-–\s%to]+\d+(?:\.\d+)?%?)/gi,
            /moderate[\s:]*(\d+(?:\.\d+)?[-–\s%to]+\d+(?:\.\d+)?%?)/gi,
        ];
        const confidenceQualifiers = [];
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
     * Extract metadata from chunk content
     */
    extractMetadata(content, filename, documentType) {
        const contentLower = content.toLowerCase();
        const documentPurpose = this.detectDocumentPurpose(filename);
        const isDeprioritized = DEPRIORITIZED_FILES.some(f => filename.includes(f));
        const topics = [];
        for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
            if (topic === 'general')
                continue;
            if (keywords.some(kw => contentLower.includes(kw))) {
                topics.push(topic);
            }
        }
        if (topics.length === 0)
            topics.push('general');
        const steps = [];
        for (const [step, keywords] of Object.entries(STEP_KEYWORDS)) {
            if (keywords.some(kw => contentLower.includes(kw))) {
                steps.push(parseInt(step));
            }
        }
        const benchmarkDetails = this.extractBenchmarkDetails(content);
        const verticalPatterns = [
            'ecommerce', 'e-commerce', 'retail', 'saas', 'b2b', 'b2c',
            'financial', 'healthcare', 'technology', 'cpg', 'automotive',
            'travel', 'hospitality', 'entertainment', 'media', 'education',
            'insurance', 'real estate', 'manufacturing', 'pharma', 'telecom'
        ];
        const verticals = verticalPatterns.filter(v => contentLower.includes(v));
        if (verticals.includes('e-commerce') && !verticals.includes('ecommerce')) {
            verticals.push('ecommerce');
        }
        const metricPatterns = [
            'cac', 'cpa', 'cpm', 'ctr', 'cvr', 'roas', 'ltv', 'aov',
            'conversion rate', 'click rate', 'impression', 'reach', 'frequency',
            'iroas', 'moas', 'romi', 'adstock', 'incrementality', 'lift'
        ];
        const metrics = metricPatterns.filter(m => this.matchesSynonyms(contentLower, m));
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
     * Save chunks to cache file
     */
    async saveToCache(chunks) {
        const cachePath = path.resolve(__dirname, RAG_CONFIG.paths.chunksCache);
        const cacheDir = path.dirname(cachePath);
        await fs.mkdir(cacheDir, { recursive: true });
        await fs.writeFile(cachePath, JSON.stringify(chunks, null, 2));
        console.log(`Saved ${chunks.length} chunks to ${cachePath}`);
    }
    /**
     * Save enhanced chunks to cache file (v6.0)
     */
    async saveEnhancedToCache(chunks) {
        const cachePath = path.resolve(__dirname, RAG_CONFIG.paths.chunksCache.replace('.json', '-v6.json'));
        const cacheDir = path.dirname(cachePath);
        await fs.mkdir(cacheDir, { recursive: true });
        await fs.writeFile(cachePath, JSON.stringify(chunks, null, 2));
        console.log(`[v6.0] Saved ${chunks.length} enhanced chunks to ${cachePath}`);
    }
    /**
     * Load chunks from cache if available
     */
    async loadFromCache() {
        try {
            const cachePath = path.resolve(__dirname, RAG_CONFIG.paths.chunksCache);
            const data = await fs.readFile(cachePath, 'utf-8');
            const chunks = JSON.parse(data);
            console.log(`Loaded ${chunks.length} chunks from cache`);
            return chunks;
        }
        catch {
            return null;
        }
    }
    /**
     * Load enhanced chunks from cache if available (v6.0)
     */
    async loadEnhancedFromCache() {
        try {
            const cachePath = path.resolve(__dirname, RAG_CONFIG.paths.chunksCache.replace('.json', '-v6.json'));
            const data = await fs.readFile(cachePath, 'utf-8');
            const chunks = JSON.parse(data);
            console.log(`[v6.0] Loaded ${chunks.length} enhanced chunks from cache`);
            return chunks;
        }
        catch {
            return null;
        }
    }
}
export default DocumentProcessor;
//# sourceMappingURL=document-processor.js.map