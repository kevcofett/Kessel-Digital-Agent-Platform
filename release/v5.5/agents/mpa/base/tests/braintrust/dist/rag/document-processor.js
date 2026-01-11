/**
 * Document Processor - Chunks KB files into retrievable passages
 *
 * Enhanced with:
 * - Multi-format section header detection (ALL CAPS, numbered, markdown)
 * - Synonym normalization for key MPA terms
 * - Document purpose tagging
 * - Enhanced benchmark extraction
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { RAG_CONFIG, TOPIC_KEYWORDS, STEP_KEYWORDS, DOCUMENT_TYPE_PATTERNS, } from './types.js';
/**
 * Synonym mappings for key MPA terms
 * Maps variations to canonical forms for improved search matching
 */
const SYNONYM_MAPPINGS = {
    'ltv': ['lifetime value', 'customer lifetime value', 'clv', 'cltv'],
    'cac': ['customer acquisition cost', 'acquisition cost', 'cost of acquisition'],
    'roas': ['return on ad spend', 'return on advertising spend', 'ad return'],
    'cpm': ['cost per thousand', 'cost per mille'],
    'cpa': ['cost per acquisition', 'cost per action', 'acquisition cost'],
    'ctr': ['click through rate', 'click-through rate', 'clickthrough rate'],
    'cvr': ['conversion rate', 'conv rate'],
    'aov': ['average order value', 'avg order value'],
    'channel mix': ['media mix', 'allocation', 'channel allocation', 'media allocation'],
    'benchmark': ['typical', 'industry standard', 'average', 'baseline', 'norm'],
    'kpi': ['key performance indicator', 'metric', 'target metric'],
    'incrementality': ['incremental lift', 'incremental value', 'lift'],
    'attribution': ['credit', 'contribution', 'touchpoint credit'],
    'reach': ['audience reach', 'addressable audience'],
    'frequency': ['ad frequency', 'exposure frequency', 'avg frequency'],
};
const DOCUMENT_PURPOSE_PATTERNS = {
    definitive: [/analytics_engine/i, /confidence_level/i, /gap_detection/i],
    guidance: [/expert_lens/i, /strategic_wisdom/i, /implications/i],
    reference: [/framework/i, /benchmark/i, /reference/i],
    procedural: [/operating_standards/i, /playbook/i, /process/i],
    template: [/output_templates/i, /template/i],
    example: [/conversation_examples/i, /examples/i],
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
    constructor(kbPath = RAG_CONFIG.paths.kbDirectory) {
        this.kbPath = kbPath;
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
     * Get list of KB files (excluding templates and low-value files)
     */
    async getKBFiles() {
        const absolutePath = path.resolve(__dirname, '..', this.kbPath);
        const entries = await fs.readdir(absolutePath);
        return entries
            .filter(f => f.endsWith('.txt'))
            .filter(f => !EXCLUDED_FILES.includes(f)) // Exclude template files
            .map(f => path.join(absolutePath, f));
    }
    /**
     * Process a single file into chunks
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
     * Split content into sections based on headers
     * Supports multiple header formats:
     * - ALL CAPS: "SECTION NAME" or "SECTION 1: NAME"
     * - Numbered: "1.1 Section Name" or "1. Section Name"
     * - Markdown: "## Section Name" or "### Section Name"
     */
    splitIntoSections(content) {
        const sections = [];
        // Combined pattern for multiple header formats
        const headerPatterns = [
            /^([A-Z][A-Z\s:]+[A-Z])$/gm, // ALL CAPS: "SECTION NAME" or "SECTION 1: NAME"
            /^(SECTION\s+\d+[:\s].*)$/gim, // "SECTION 1: Name" format
            /^(\d+\.\d*\s+[A-Z].{2,50})$/gm, // Numbered: "1.1 Section Name" or "1. Name"
            /^(#{1,3}\s+.{3,60})$/gm, // Markdown: "## Section Name"
        ];
        // Find all headers with their positions
        const headerMatches = [];
        for (const pattern of headerPatterns) {
            let match;
            // Reset lastIndex for each pattern
            pattern.lastIndex = 0;
            while ((match = pattern.exec(content)) !== null) {
                // Clean up the title (remove markdown hashes, normalize whitespace)
                let title = match[1].trim();
                title = title.replace(/^#+\s*/, ''); // Remove markdown hashes
                title = title.replace(/\s+/g, ' '); // Normalize whitespace
                headerMatches.push({
                    index: match.index,
                    title,
                    length: match[0].length,
                });
            }
        }
        // Sort by position and deduplicate overlapping matches
        headerMatches.sort((a, b) => a.index - b.index);
        // Remove duplicates (headers matched by multiple patterns)
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
     * Chunk a section into smaller pieces
     */
    chunkSection(content, sectionTitle, filename, documentType, startIndex) {
        const chunks = [];
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
            if (!trimmedPara)
                continue;
            // If adding this paragraph would exceed max, save current chunk
            if (currentChunk.length + trimmedPara.length > maxChars && currentChunk.length >= minChars) {
                chunks.push(this.createChunk(currentChunk.trim(), filename, sectionTitle, documentType, startIndex + localIndex, chunkStart));
                localIndex++;
                // Start new chunk with overlap
                const overlapStart = Math.max(0, currentChunk.length - overlapChars);
                currentChunk = currentChunk.slice(overlapStart) + '\n\n' + trimmedPara;
                chunkStart += overlapStart;
            }
            else {
                currentChunk += (currentChunk ? '\n\n' : '') + trimmedPara;
            }
            // If we've reached target size and paragraph boundary, save
            if (currentChunk.length >= targetChars) {
                chunks.push(this.createChunk(currentChunk.trim(), filename, sectionTitle, documentType, startIndex + localIndex, chunkStart));
                localIndex++;
                // Overlap for next chunk
                const overlapStart = Math.max(0, currentChunk.length - overlapChars);
                currentChunk = currentChunk.slice(overlapStart);
                chunkStart += overlapStart;
            }
        }
        // Save remaining content
        if (currentChunk.trim().length >= minChars) {
            chunks.push(this.createChunk(currentChunk.trim(), filename, sectionTitle, documentType, startIndex + localIndex, chunkStart));
        }
        else if (currentChunk.trim().length > 0 && chunks.length > 0) {
            // Append small remainder to last chunk
            const lastChunk = chunks[chunks.length - 1];
            lastChunk.content += '\n\n' + currentChunk.trim();
        }
        else if (currentChunk.trim().length > 0) {
            // First and only chunk, even if small
            chunks.push(this.createChunk(currentChunk.trim(), filename, sectionTitle, documentType, startIndex + localIndex, chunkStart));
        }
        return chunks;
    }
    /**
     * Create a chunk with metadata
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
        // Check the canonical term itself
        if (contentLower.includes(canonicalTerm))
            return true;
        // Check all synonyms
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
     * Enhanced to capture confidence levels and ranges
     */
    extractBenchmarkDetails(content) {
        const contentLower = content.toLowerCase();
        // Check for benchmark indicators
        const hasBenchmarkKeywords = contentLower.includes('benchmark') ||
            contentLower.includes('typical') ||
            contentLower.includes('average') ||
            contentLower.includes('range') ||
            contentLower.includes('industry standard');
        // Extract numeric ranges
        const rangePatterns = [
            /(\d+(?:\.\d+)?)\s*[-–to]+\s*(\d+(?:\.\d+)?)\s*%/g, // "25-45%" or "25 to 45%"
            /\$[\d,]+\s*[-–to]+\s*\$[\d,]+/g, // "$50-$100"
            /(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)\s*(?:ratio|to\s*\d)/gi, // "3:1 ratio"
            /(?:under|below|less than)\s*(\d+(?:\.\d+)?%?)/gi, // "under 25%"
            /(?:above|over|greater than|exceeds?)\s*(\d+(?:\.\d+)?%?)/gi, // "above 50%"
        ];
        const benchmarkRanges = [];
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
        // Detect topics (with synonym support)
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
        // Detect steps
        const steps = [];
        for (const [step, keywords] of Object.entries(STEP_KEYWORDS)) {
            if (keywords.some(kw => contentLower.includes(kw))) {
                steps.push(parseInt(step));
            }
        }
        // Enhanced benchmark extraction
        const benchmarkDetails = this.extractBenchmarkDetails(content);
        // Extract verticals mentioned (normalized)
        const verticalPatterns = [
            'ecommerce', 'e-commerce', 'retail', 'saas', 'b2b', 'b2c',
            'financial', 'healthcare', 'technology', 'cpg', 'automotive',
            'travel', 'hospitality', 'entertainment', 'media', 'education',
            'insurance', 'real estate', 'manufacturing', 'pharma', 'telecom'
        ];
        const verticals = verticalPatterns.filter(v => contentLower.includes(v));
        // Normalize e-commerce variants
        if (verticals.includes('e-commerce') && !verticals.includes('ecommerce')) {
            verticals.push('ecommerce');
        }
        // Extract metrics mentioned (with synonyms)
        const metricPatterns = [
            'cac', 'cpa', 'cpm', 'ctr', 'cvr', 'roas', 'ltv', 'aov',
            'conversion rate', 'click rate', 'impression', 'reach', 'frequency',
            'iroas', 'moas', 'romi', 'adstock', 'incrementality', 'lift'
        ];
        const metrics = metricPatterns.filter(m => this.matchesSynonyms(contentLower, m));
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
            // Extended metadata
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
}
export default DocumentProcessor;
//# sourceMappingURL=document-processor.js.map