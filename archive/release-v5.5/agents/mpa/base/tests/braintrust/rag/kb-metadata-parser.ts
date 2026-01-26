/**
 * KB Document Header Parser
 *
 * Parses structured metadata from KB document headers for improved retrieval.
 * Supports the new document header standard with META_ prefixed fields.
 *
 * Document-Level META Tags (KB v6.0):
 * META_DOCUMENT_TYPE: expert_guidance | framework | playbook | index | ...
 * META_PRIMARY_TOPICS: comma-separated topic list
 * META_WORKFLOW_STEPS: 3,4,5 | ALL
 * META_INTENTS: CHANNEL_SELECTION, BUDGET_PLANNING | ALL
 * META_VERTICALS: ALL | RETAIL, ECOMMERCE
 * META_CHANNELS: ALL | PAID_SEARCH, CTV_OTT
 * META_LAST_UPDATED: 2026-01-16
 * META_CHUNK_PRIORITY: 0-3 (0=highest, 3=lowest)
 *
 * Section-Level META Tags:
 * META_SECTION_ID: unique_section_identifier
 * META_TOPICS: section-specific topics
 * META_WORKFLOW_STEPS: section-specific steps
 * META_INTENT: section-specific intent (singular)
 * META_CONFIDENCE: HIGH | MEDIUM | LOW
 * META_WEB_SEARCH_TRIGGER: TRUE | FALSE
 *
 * @module kb-metadata-parser
 * @version 6.0
 */

import * as fs from 'fs';
import * as path from 'path';
import { DocumentType, Topic } from './types.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Intent categories for query-to-document matching
 * Aligned with KB_INDEX_v6_0.txt intent definitions
 */
export type QueryIntent =
  | 'BENCHMARK_LOOKUP'
  | 'CHANNEL_SELECTION'
  | 'BUDGET_PLANNING'
  | 'AUDIENCE_TARGETING'
  | 'MEASUREMENT_GUIDANCE'
  | 'WORKFLOW_HELP'
  | 'ECONOMICS_VALIDATION'
  | 'RISK_ASSESSMENT'
  | 'CONFIDENCE_ASSESSMENT'  // KB v6.0: From Confidence_Level_Framework
  | 'GAP_RESOLUTION'         // KB v6.0: From Gap_Detection_Playbook
  | 'GENERAL_GUIDANCE';

/**
 * Confidence levels for document sections
 */
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Chunk priority levels (0 = highest priority, 3 = lowest)
 */
export type ChunkPriority = 0 | 1 | 2 | 3;

/**
 * KB v6.0 document type codes
 */
export type KBDocumentTypeCode =
  | 'index'
  | 'expert_guidance'
  | 'framework'
  | 'playbook'
  | 'guide'
  | 'implications'
  | 'audience'
  | 'support'
  | 'core_standards';

/**
 * Structured metadata extracted from document headers
 */
export interface KBSectionMetadata {
  sectionTitle: string;
  sectionId: string | null;           // META_SECTION_ID
  workflowSteps: number[];
  topics: string[];
  verticals: string[];
  channels: string[];
  intents: QueryIntent[];
  confidence: ConfidenceLevel;
  lastUpdated: Date | null;
  webSearchTrigger: boolean;          // META_WEB_SEARCH_TRIGGER
  rawMetadata: Record<string, string>;
}

/**
 * Document-level metadata combining header info with file-level data
 */
export interface KBDocumentMetadata {
  filename: string;
  filepath: string;                     // Full path to file
  documentType: DocumentType;
  documentTypeCode: KBDocumentTypeCode | null;  // META_DOCUMENT_TYPE value
  category: string;
  version: string;
  date: string | null;
  status: string;
  compliance: string | null;            // e.g., "6-Rule Compliant"
  sections: KBSectionMetadata[];
  totalSections: number;
  topics: string[];
  primaryTopics: string[];              // META_PRIMARY_TOPICS
  workflowSteps: number[];              // Document-level META_WORKFLOW_STEPS
  intents: QueryIntent[];               // Document-level META_INTENTS
  verticals: string[];                  // Document-level META_VERTICALS
  channels: string[];                   // Document-level META_CHANNELS
  chunkPriority: ChunkPriority;         // META_CHUNK_PRIORITY (0-3)
  lastUpdated: Date | null;             // META_LAST_UPDATED
  hasWebSearchTriggers: boolean;        // Any section has META_WEB_SEARCH_TRIGGER: TRUE
}

/**
 * Legacy header format (DOCUMENT:, CATEGORY:, etc.) plus v6.0 document-level META
 */
export interface LegacyDocumentHeader {
  document: string;
  category: string;
  topics: string[];
  version: string;
  date: string | null;
  status: string;
  compliance: string | null;
  // v6.0 document-level META fields
  documentTypeCode: KBDocumentTypeCode | null;
  primaryTopics: string[];
  workflowSteps: number[];
  intents: QueryIntent[];
  verticals: string[];
  channels: string[];
  chunkPriority: ChunkPriority;
  lastUpdated: Date | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * META_ field definitions and their parsers
 */
const META_FIELD_PARSERS: Record<string, (value: string) => unknown> = {
  // Document-level META fields
  META_DOCUMENT_TYPE: (v) => v.trim().toLowerCase() as KBDocumentTypeCode,
  META_PRIMARY_TOPICS: (v) => v.split(',').map(s => s.trim().toLowerCase()),
  META_CHUNK_PRIORITY: (v) => {
    const num = parseInt(v.trim());
    return (num >= 0 && num <= 3 ? num : 2) as ChunkPriority;
  },
  META_INTENTS: (v) => {
    if (v.toUpperCase().trim() === 'ALL') {
      return ['GENERAL_GUIDANCE'] as QueryIntent[]; // 'ALL' means applicable to all intents
    }
    return v.split(',').map(s => s.trim().toUpperCase()) as QueryIntent[];
  },

  // Section-level META fields
  META_SECTION_ID: (v) => v.trim(),
  META_WORKFLOW_STEPS: (v) => {
    if (v.toUpperCase().trim() === 'ALL') {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    }
    return v.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  },
  META_TOPICS: (v) => v.split(',').map(s => s.trim().toLowerCase()),
  META_VERTICALS: (v) => v.toUpperCase().trim() === 'ALL' ? ['ALL'] : v.split(',').map(s => s.trim().toUpperCase()),
  META_CHANNELS: (v) => v.toUpperCase().trim() === 'ALL' ? ['ALL'] : v.split(',').map(s => s.trim().toUpperCase()),
  META_INTENT: (v) => v.split(',').map(s => s.trim().toUpperCase()) as QueryIntent[],
  META_CONFIDENCE: (v) => v.trim().toUpperCase() as ConfidenceLevel,
  META_LAST_UPDATED: (v) => {
    const parsed = new Date(v.trim());
    return isNaN(parsed.getTime()) ? null : parsed;
  },
  META_WEB_SEARCH_TRIGGER: (v) => v.trim().toUpperCase() === 'TRUE',
};

/**
 * Legacy header field patterns (including new v6.0 fields)
 */
const LEGACY_HEADER_PATTERNS = {
  document: /^DOCUMENT:\s*(.+)$/m,
  category: /^CATEGORY:\s*(.+)$/m,
  topics: /^TOPICS:\s*(.+)$/m,
  version: /^VERSION:\s*(.+)$/m,
  date: /^DATE:\s*(.+)$/m,
  status: /^STATUS:\s*(.+)$/m,
  compliance: /^COMPLIANCE:\s*(.+)$/m,
};

/**
 * Section delimiter pattern (line of = characters)
 */
const SECTION_DELIMITER = /^={40,}$/gm;

/**
 * Section title pattern (text between delimiters, ALL CAPS or numbered)
 */
const SECTION_TITLE_PATTERNS = [
  /^SECTION\s+\d+[:\s]+(.+)$/im,
  /^(\d+\.\d*)\s+([A-Z][A-Z\s]+)$/m,
  /^([A-Z][A-Z\s:]+[A-Z])$/m,
];

/**
 * META_ field line pattern
 */
const META_LINE_PATTERN = /^(META_\w+):\s*(.+)$/gm;

// ============================================================================
// MAIN PARSER CLASS
// ============================================================================

export class KBMetadataParser {
  /**
   * Parse a complete KB document and extract all metadata
   */
  parseDocument(content: string, filename: string, filepath?: string): KBDocumentMetadata {
    const legacyHeader = this.parseLegacyHeader(content);
    const sections = this.parseSections(content);

    // Aggregate topics from all sections
    const allTopics = new Set<string>(legacyHeader.topics);
    for (const section of sections) {
      for (const topic of section.topics) {
        allTopics.add(topic);
      }
    }

    // Check if any section has web search triggers
    const hasWebSearchTriggers = sections.some(s => s.webSearchTrigger);

    return {
      filename,
      filepath: filepath || filename,
      documentType: this.inferDocumentType(filename, legacyHeader.category, legacyHeader.documentTypeCode),
      documentTypeCode: legacyHeader.documentTypeCode,
      category: legacyHeader.category,
      version: legacyHeader.version,
      date: legacyHeader.date,
      status: legacyHeader.status,
      compliance: legacyHeader.compliance,
      sections,
      totalSections: sections.length,
      topics: Array.from(allTopics),
      primaryTopics: legacyHeader.primaryTopics,
      workflowSteps: legacyHeader.workflowSteps,
      intents: legacyHeader.intents,
      verticals: legacyHeader.verticals,
      channels: legacyHeader.channels,
      chunkPriority: legacyHeader.chunkPriority,
      lastUpdated: legacyHeader.lastUpdated,
      hasWebSearchTriggers,
    };
  }

  /**
   * Parse legacy header format (DOCUMENT:, CATEGORY:, etc.) plus v6.0 document-level META
   */
  parseLegacyHeader(content: string): LegacyDocumentHeader {
    const header: LegacyDocumentHeader = {
      document: '',
      category: '',
      topics: [],
      version: '',
      date: null,
      status: '',
      compliance: null,
      // v6.0 document-level META defaults
      documentTypeCode: null,
      primaryTopics: [],
      workflowSteps: [],
      intents: [],
      verticals: [],
      channels: [],
      chunkPriority: 2,
      lastUpdated: null,
    };

    // Extract first 2000 chars for header search (headers are at top)
    const headerSection = content.slice(0, 2000);

    // Parse legacy fields
    for (const [field, pattern] of Object.entries(LEGACY_HEADER_PATTERNS)) {
      const match = headerSection.match(pattern);
      if (match) {
        if (field === 'topics') {
          header.topics = match[1].split(',').map(t => t.trim().toLowerCase());
        } else {
          (header as unknown as Record<string, unknown>)[field] = match[1].trim();
        }
      }
    }

    // Parse v6.0 document-level META tags
    const metaPattern = new RegExp(META_LINE_PATTERN.source, 'gm');
    const rawMetadata: Record<string, string> = {};
    let match: RegExpExecArray | null;

    while ((match = metaPattern.exec(headerSection)) !== null) {
      rawMetadata[match[1]] = match[2];
    }

    // Extract document-level META fields
    header.documentTypeCode = this.parseMetaField('META_DOCUMENT_TYPE', rawMetadata, null) as KBDocumentTypeCode | null;
    header.primaryTopics = this.parseMetaField('META_PRIMARY_TOPICS', rawMetadata, []) as string[];
    header.chunkPriority = this.parseMetaField('META_CHUNK_PRIORITY', rawMetadata, 2) as ChunkPriority;
    header.lastUpdated = this.parseMetaField('META_LAST_UPDATED', rawMetadata, null) as Date | null;

    // Document-level intents (META_INTENTS plural)
    header.intents = this.parseMetaField('META_INTENTS', rawMetadata, []) as QueryIntent[];

    // Document-level workflow steps, verticals, channels
    header.workflowSteps = this.parseMetaField('META_WORKFLOW_STEPS', rawMetadata, []) as number[];
    header.verticals = this.parseMetaField('META_VERTICALS', rawMetadata, []) as string[];
    header.channels = this.parseMetaField('META_CHANNELS', rawMetadata, []) as string[];

    return header;
  }

  /**
   * Parse document into sections with their metadata
   */
  parseSections(content: string): KBSectionMetadata[] {
    const sections: KBSectionMetadata[] = [];

    // Find all section delimiters
    const delimiterMatches: number[] = [];
    let match: RegExpExecArray | null;
    const delimiterPattern = new RegExp(SECTION_DELIMITER.source, 'gm');

    while ((match = delimiterPattern.exec(content)) !== null) {
      delimiterMatches.push(match.index);
    }

    if (delimiterMatches.length < 2) {
      // No structured sections found, treat as single section
      const singleSection = this.parseSection(content, 'CONTENT');
      if (singleSection) {
        sections.push(singleSection);
      }
      return sections;
    }

    // Extract sections between delimiters
    for (let i = 0; i < delimiterMatches.length - 1; i += 2) {
      const startDelim = delimiterMatches[i];
      const endDelim = delimiterMatches[i + 1];
      const nextStartDelim = delimiterMatches[i + 2] ?? content.length;

      // Title is between first pair of delimiters
      const titleContent = content.slice(startDelim, endDelim + 80).trim();
      const title = this.extractSectionTitle(titleContent);

      // Section content is after the second delimiter until next section
      const sectionContent = content.slice(endDelim + 80, nextStartDelim).trim();

      const section = this.parseSection(sectionContent, title);
      if (section) {
        sections.push(section);
      }
    }

    return sections;
  }

  /**
   * Parse a single section and extract its metadata
   */
  private parseSection(content: string, title: string): KBSectionMetadata | null {
    if (!content || content.length < 20) {
      return null;
    }

    const rawMetadata: Record<string, string> = {};
    const metaPattern = new RegExp(META_LINE_PATTERN.source, 'gm');
    let match: RegExpExecArray | null;

    while ((match = metaPattern.exec(content)) !== null) {
      rawMetadata[match[1]] = match[2];
    }

    // Parse each META_ field
    const sectionId = this.parseMetaField('META_SECTION_ID', rawMetadata, null) as string | null;
    const workflowSteps = this.parseMetaField('META_WORKFLOW_STEPS', rawMetadata, []) as number[];
    const topics = this.parseMetaField('META_TOPICS', rawMetadata, []) as string[];
    const verticals = this.parseMetaField('META_VERTICALS', rawMetadata, []) as string[];
    const channels = this.parseMetaField('META_CHANNELS', rawMetadata, []) as string[];
    const intents = this.parseMetaField('META_INTENT', rawMetadata, ['GENERAL_GUIDANCE']) as QueryIntent[];
    const confidence = this.parseMetaField('META_CONFIDENCE', rawMetadata, 'MEDIUM') as ConfidenceLevel;
    const lastUpdated = this.parseMetaField('META_LAST_UPDATED', rawMetadata, null) as Date | null;
    const webSearchTrigger = this.parseMetaField('META_WEB_SEARCH_TRIGGER', rawMetadata, false) as boolean;

    // If no explicit metadata, infer from content
    const inferredMetadata = this.inferMetadataFromContent(content, title);

    return {
      sectionTitle: title,
      sectionId,
      workflowSteps: workflowSteps.length > 0 ? workflowSteps : inferredMetadata.workflowSteps,
      topics: topics.length > 0 ? topics : inferredMetadata.topics,
      verticals: verticals.length > 0 ? verticals : inferredMetadata.verticals,
      channels: channels.length > 0 ? channels : inferredMetadata.channels,
      intents: intents.length > 0 ? intents : inferredMetadata.intents,
      confidence,
      lastUpdated,
      webSearchTrigger,
      rawMetadata,
    };
  }

  /**
   * Parse a META_ field using its registered parser
   */
  private parseMetaField(
    fieldName: string,
    rawMetadata: Record<string, string>,
    defaultValue: unknown
  ): unknown {
    const value = rawMetadata[fieldName];
    if (!value) {
      return defaultValue;
    }

    const parser = META_FIELD_PARSERS[fieldName];
    if (parser) {
      try {
        return parser(value);
      } catch {
        return defaultValue;
      }
    }

    return value;
  }

  /**
   * Extract section title from content between delimiters
   */
  private extractSectionTitle(content: string): string {
    // Try each title pattern
    for (const pattern of SECTION_TITLE_PATTERNS) {
      const match = content.match(pattern);
      if (match) {
        // Return the captured group (actual title)
        return (match[2] || match[1]).trim();
      }
    }

    // Fall back to cleaning the content
    const lines = content.split('\n').filter(l => l.trim() && !l.match(/^=+$/));
    return lines[0]?.trim() || 'UNTITLED';
  }

  /**
   * Infer metadata from content when no META_ fields present
   */
  private inferMetadataFromContent(
    content: string,
    title: string
  ): Omit<KBSectionMetadata, 'sectionTitle' | 'sectionId' | 'confidence' | 'lastUpdated' | 'webSearchTrigger' | 'rawMetadata'> {
    const contentLower = content.toLowerCase();
    const titleLower = title.toLowerCase();

    // Infer workflow steps from content
    const workflowSteps: number[] = [];
    const stepKeywords: Record<number, string[]> = {
      1: ['objective', 'outcome', 'goal', 'success'],
      2: ['economics', 'ltv', 'cac', 'margin', 'profitability'],
      3: ['audience', 'targeting', 'segment', 'persona'],
      4: ['geography', 'geo', 'dma', 'region', 'market'],
      5: ['budget', 'allocation', 'spend'],
      6: ['value proposition', 'messaging', 'positioning'],
      7: ['channel', 'media mix', 'platform'],
      8: ['measurement', 'attribution', 'kpi'],
      9: ['testing', 'experiment', 'hypothesis'],
      10: ['risk', 'mitigation', 'contingency'],
    };

    for (const [step, keywords] of Object.entries(stepKeywords)) {
      if (keywords.some(kw => contentLower.includes(kw) || titleLower.includes(kw))) {
        workflowSteps.push(parseInt(step));
      }
    }

    // Infer topics
    const topics: string[] = [];
    const topicKeywords: Record<string, string[]> = {
      audience: ['audience', 'targeting', 'segment'],
      budget: ['budget', 'spend', 'allocation'],
      channel: ['channel', 'media', 'platform'],
      measurement: ['measurement', 'attribution', 'kpi'],
      benchmark: ['benchmark', 'typical', 'average'],
      efficiency: ['cac', 'cpa', 'roas', 'efficiency'],
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(kw => contentLower.includes(kw))) {
        topics.push(topic);
      }
    }
    if (topics.length === 0) {
      topics.push('general');
    }

    // Infer verticals
    const verticals: string[] = [];
    const verticalPatterns = [
      'ecommerce', 'retail', 'saas', 'b2b', 'b2c', 'financial',
      'healthcare', 'technology', 'cpg', 'automotive', 'travel',
    ];
    for (const v of verticalPatterns) {
      if (contentLower.includes(v)) {
        verticals.push(v.toUpperCase());
      }
    }

    // Infer channels
    const channels: string[] = [];
    const channelPatterns = [
      'programmatic', 'display', 'social', 'search', 'ctv', 'ott',
      'video', 'audio', 'native', 'retail media', 'ooh',
    ];
    for (const c of channelPatterns) {
      if (contentLower.includes(c)) {
        channels.push(c.replace(' ', '_').toUpperCase());
      }
    }

    // Infer intents
    const intents: QueryIntent[] = [];
    if (contentLower.includes('benchmark') || contentLower.includes('typical')) {
      intents.push('BENCHMARK_LOOKUP');
    }
    if (contentLower.includes('channel') || contentLower.includes('media mix')) {
      intents.push('CHANNEL_SELECTION');
    }
    if (contentLower.includes('budget') || contentLower.includes('allocation')) {
      intents.push('BUDGET_PLANNING');
    }
    if (contentLower.includes('audience') || contentLower.includes('targeting')) {
      intents.push('AUDIENCE_TARGETING');
    }
    if (contentLower.includes('measurement') || contentLower.includes('kpi')) {
      intents.push('MEASUREMENT_GUIDANCE');
    }
    if (contentLower.includes('step') || contentLower.includes('workflow')) {
      intents.push('WORKFLOW_HELP');
    }
    if (intents.length === 0) {
      intents.push('GENERAL_GUIDANCE');
    }

    return {
      workflowSteps,
      topics,
      verticals,
      channels,
      intents,
    };
  }

  /**
   * Infer document type from filename, category, and v6.0 documentTypeCode
   */
  private inferDocumentType(
    filename: string,
    category: string,
    documentTypeCode: KBDocumentTypeCode | null
  ): DocumentType {
    // If we have a v6.0 document type code, use it
    if (documentTypeCode) {
      const typeCodeMapping: Record<KBDocumentTypeCode, DocumentType> = {
        index: 'operating-standards',
        expert_guidance: 'framework',
        framework: 'framework',
        playbook: 'playbook',
        guide: 'framework',
        implications: 'implications',
        audience: 'framework',
        support: 'operating-standards',
        core_standards: 'operating-standards',
      };
      return typeCodeMapping[documentTypeCode] || 'framework';
    }

    // Legacy inference from filename and category
    const filenameLower = filename.toLowerCase();
    const categoryLower = category.toLowerCase();

    if (filenameLower.includes('benchmark') || filenameLower.includes('analytics')) {
      return 'benchmark';
    }
    if (filenameLower.includes('framework') || filenameLower.includes('expert_lens')) {
      return 'framework';
    }
    if (filenameLower.includes('playbook') || filenameLower.includes('gap_detection')) {
      return 'playbook';
    }
    if (filenameLower.includes('example') || filenameLower.includes('conversation')) {
      return 'examples';
    }
    if (filenameLower.includes('implications')) {
      return 'implications';
    }
    if (filenameLower.includes('kb_00') || filenameLower.includes('operating')) {
      return 'operating-standards';
    }

    // Fall back to category
    if (categoryLower.includes('benchmark')) return 'benchmark';
    if (categoryLower.includes('framework')) return 'framework';
    if (categoryLower.includes('example')) return 'examples';

    return 'framework';
  }

  /**
   * Check if a document has the new META_ header format
   */
  hasStructuredMetadata(content: string): boolean {
    return META_LINE_PATTERN.test(content);
  }

  /**
   * Generate META_ header block for a section (utility for document migration)
   */
  generateMetaBlock(metadata: Partial<KBSectionMetadata>): string {
    const lines: string[] = [];

    if (metadata.workflowSteps?.length) {
      lines.push(`META_WORKFLOW_STEPS: ${metadata.workflowSteps.join(',')}`);
    }
    if (metadata.topics?.length) {
      lines.push(`META_TOPICS: ${metadata.topics.join(', ')}`);
    }
    if (metadata.verticals?.length) {
      const verticalValue = metadata.verticals.includes('ALL') ? 'ALL' : metadata.verticals.join(', ');
      lines.push(`META_VERTICALS: ${verticalValue}`);
    }
    if (metadata.channels?.length) {
      lines.push(`META_CHANNELS: ${metadata.channels.join(', ')}`);
    }
    if (metadata.intents?.length) {
      lines.push(`META_INTENT: ${metadata.intents.join(', ')}`);
    }
    if (metadata.confidence) {
      lines.push(`META_CONFIDENCE: ${metadata.confidence}`);
    }
    if (metadata.lastUpdated) {
      lines.push(`META_LAST_UPDATED: ${metadata.lastUpdated.toISOString().split('T')[0]}`);
    }

    return lines.join('\n');
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Map query intent to relevant document types
 */
export function getDocumentTypesForIntent(intent: QueryIntent): DocumentType[] {
  const intentToTypes: Record<QueryIntent, DocumentType[]> = {
    BENCHMARK_LOOKUP: ['benchmark', 'framework'],
    CHANNEL_SELECTION: ['framework', 'implications'],
    BUDGET_PLANNING: ['framework', 'implications', 'playbook'],
    AUDIENCE_TARGETING: ['framework', 'playbook'],
    MEASUREMENT_GUIDANCE: ['framework', 'benchmark'],
    WORKFLOW_HELP: ['operating-standards', 'examples'],
    ECONOMICS_VALIDATION: ['benchmark', 'framework'],
    RISK_ASSESSMENT: ['playbook', 'implications'],
    CONFIDENCE_ASSESSMENT: ['framework', 'playbook'],
    GAP_RESOLUTION: ['playbook', 'framework'],
    GENERAL_GUIDANCE: ['framework', 'operating-standards'],
  };

  return intentToTypes[intent] || ['framework'];
}

/**
 * Map query intent to relevant workflow steps
 */
export function getStepsForIntent(intent: QueryIntent): number[] {
  const intentToSteps: Record<QueryIntent, number[]> = {
    BENCHMARK_LOOKUP: [2, 7, 8],
    CHANNEL_SELECTION: [4], // Step 4 in KB_INDEX_v6_0
    BUDGET_PLANNING: [5],
    AUDIENCE_TARGETING: [2], // Step 2 in KB_INDEX_v6_0
    MEASUREMENT_GUIDANCE: [3, 8], // Steps 3 and 8 in KB_INDEX_v6_0
    WORKFLOW_HELP: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    ECONOMICS_VALIDATION: [2],
    RISK_ASSESSMENT: [10],
    CONFIDENCE_ASSESSMENT: [6], // Step 6 in KB_INDEX_v6_0
    GAP_RESOLUTION: [6], // Step 6 in KB_INDEX_v6_0
    GENERAL_GUIDANCE: [],
  };

  return intentToSteps[intent] || [];
}

/**
 * Score how well section metadata matches a query intent
 */
export function scoreMetadataMatch(
  sectionMetadata: KBSectionMetadata,
  queryIntent: QueryIntent,
  querySteps: number[]
): number {
  let score = 0;

  // Intent match (highest weight)
  if (sectionMetadata.intents.includes(queryIntent)) {
    score += 0.4;
  }

  // Step overlap
  const stepOverlap = querySteps.filter(s => sectionMetadata.workflowSteps.includes(s)).length;
  if (querySteps.length > 0) {
    score += 0.3 * (stepOverlap / querySteps.length);
  }

  // Confidence boost
  if (sectionMetadata.confidence === 'HIGH') {
    score += 0.2;
  } else if (sectionMetadata.confidence === 'MEDIUM') {
    score += 0.1;
  }

  // Freshness boost (if within 90 days)
  if (sectionMetadata.lastUpdated) {
    const ageInDays = (Date.now() - sectionMetadata.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays < 90) {
      score += 0.1 * (1 - ageInDays / 90);
    }
  }

  return Math.min(1, score);
}

// ============================================================================
// KB V6.0 DIRECTORY LOADING
// ============================================================================

/**
 * Default path to KB v6.0 directory
 */
export const KB_V6_DEFAULT_PATH = '../../../kb-v6';

/**
 * Intent to document mapping from KB_INDEX_v6_0.txt
 */
export interface IntentDocumentMapping {
  intent: QueryIntent;
  primary: string[];
  secondary: string[];
  implications: string[];
  triggers: string[];
}

/**
 * KB v6.0 Index structure parsed from KB_INDEX_v6_0.txt
 */
export interface KBIndexV6 {
  documents: KBDocumentMetadata[];
  intentMappings: IntentDocumentMapping[];
  workflowStepMappings: Map<number, string[]>;
  dataverseTables: string[];
  totalDocuments: number;
}

/**
 * Load and parse all KB v6.0 documents from a directory
 */
export function loadKBV6Documents(kbDir: string): KBDocumentMetadata[] {
  const parser = new KBMetadataParser();
  const documents: KBDocumentMetadata[] = [];

  // Check if directory exists
  if (!fs.existsSync(kbDir)) {
    console.warn(`KB v6.0 directory not found: ${kbDir}`);
    return documents;
  }

  // Read all .txt files
  const files = fs.readdirSync(kbDir).filter(f => f.endsWith('.txt'));

  for (const filename of files) {
    const filepath = path.join(kbDir, filename);
    try {
      const content = fs.readFileSync(filepath, 'utf-8');
      const metadata = parser.parseDocument(content, filename, filepath);
      documents.push(metadata);
    } catch (error) {
      console.warn(`Failed to parse KB file ${filename}:`, error);
    }
  }

  return documents;
}

/**
 * Parse KB_INDEX_v6_0.txt to extract intent-to-document mappings
 */
export function parseKBIndex(indexContent: string): IntentDocumentMapping[] {
  const mappings: IntentDocumentMapping[] = [];

  // Pattern to find INTENT blocks
  const intentPattern = /INTENT:\s+(\w+)\n([\s\S]*?)(?=\nINTENT:|================================================================================|$)/g;
  let match: RegExpExecArray | null;

  while ((match = intentPattern.exec(indexContent)) !== null) {
    const intentName = match[1].toUpperCase() as QueryIntent;
    const block = match[2];

    const mapping: IntentDocumentMapping = {
      intent: intentName,
      primary: [],
      secondary: [],
      implications: [],
      triggers: [],
    };

    // Extract Primary documents
    const primaryMatch = block.match(/Primary:\s*(.+)/);
    if (primaryMatch) {
      mapping.primary = primaryMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    }

    // Extract Secondary documents
    const secondaryMatch = block.match(/Secondary:\s*(.+)/);
    if (secondaryMatch) {
      mapping.secondary = secondaryMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    }

    // Extract Implications documents
    const implicationsMatch = block.match(/Implications:\s*(.+)/);
    if (implicationsMatch) {
      mapping.implications = implicationsMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    }

    // Extract Triggers
    const triggersMatch = block.match(/Triggers:\s*(.+)/);
    if (triggersMatch) {
      mapping.triggers = triggersMatch[1].split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    }

    mappings.push(mapping);
  }

  return mappings;
}

/**
 * Parse workflow step mappings from KB_INDEX_v6_0.txt
 */
export function parseWorkflowStepMappings(indexContent: string): Map<number, string[]> {
  const mappings = new Map<number, string[]>();

  // Pattern to find STEP blocks
  const stepPattern = /STEP\s+(\d+(?:-\d+)?)\s*-\s*\w+[:\s]*\n([\s\S]*?)(?=\nSTEP\s+\d|================================================================================|$)/gi;
  let match: RegExpExecArray | null;

  while ((match = stepPattern.exec(indexContent)) !== null) {
    const stepRange = match[1];
    const block = match[2];

    // Extract document references (lines starting with -)
    const docLines = block.match(/^-\s+(.+)$/gm) || [];
    const documents = docLines.map(line => line.replace(/^-\s+/, '').trim());

    // Handle step ranges like "9-10"
    if (stepRange.includes('-')) {
      const [start, end] = stepRange.split('-').map(Number);
      for (let step = start; step <= end; step++) {
        mappings.set(step, documents);
      }
    } else {
      mappings.set(parseInt(stepRange), documents);
    }
  }

  return mappings;
}

/**
 * Load complete KB v6.0 index including documents and mappings
 */
export function loadKBV6Index(kbDir: string): KBIndexV6 {
  const documents = loadKBV6Documents(kbDir);

  // Find and parse KB_INDEX
  const indexPath = path.join(kbDir, 'KB_INDEX_v6_0.txt');
  let intentMappings: IntentDocumentMapping[] = [];
  let workflowStepMappings = new Map<number, string[]>();
  const dataverseTables: string[] = ['mpa_benchmark', 'mpa_channel', 'mpa_kpi', 'mpa_vertical'];

  if (fs.existsSync(indexPath)) {
    try {
      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      intentMappings = parseKBIndex(indexContent);
      workflowStepMappings = parseWorkflowStepMappings(indexContent);
    } catch (error) {
      console.warn('Failed to parse KB_INDEX_v6_0.txt:', error);
    }
  }

  return {
    documents,
    intentMappings,
    workflowStepMappings,
    dataverseTables,
    totalDocuments: documents.length,
  };
}

/**
 * Get documents relevant to a specific intent from KB v6.0 index
 */
export function getDocumentsForIntentV6(
  index: KBIndexV6,
  intent: QueryIntent
): { primary: KBDocumentMetadata[]; secondary: KBDocumentMetadata[] } {
  const mapping = index.intentMappings.find(m => m.intent === intent);
  if (!mapping) {
    return { primary: [], secondary: [] };
  }

  const findDocs = (names: string[]) =>
    index.documents.filter(d =>
      names.some(name =>
        d.filename.includes(name.replace('.txt', '')) ||
        d.filename.toLowerCase() === name.toLowerCase()
      )
    );

  return {
    primary: findDocs(mapping.primary),
    secondary: findDocs([...mapping.secondary, ...mapping.implications]),
  };
}

/**
 * Get documents relevant to a workflow step from KB v6.0 index
 */
export function getDocumentsForStepV6(
  index: KBIndexV6,
  step: number
): KBDocumentMetadata[] {
  const docNames = index.workflowStepMappings.get(step) || [];

  return index.documents.filter(d =>
    docNames.some(name =>
      d.filename.includes(name.replace('.txt', '')) ||
      // Also check document-level workflow steps
      d.workflowSteps.includes(step)
    )
  );
}

/**
 * Check if a query should trigger web search based on KB document metadata
 */
export function shouldTriggerWebSearch(
  documents: KBDocumentMetadata[],
  query: string
): boolean {
  // Check if any retrieved document has web search triggers
  const hasWebSearchDoc = documents.some(d => d.hasWebSearchTriggers);

  // Also check for common web search trigger patterns in query
  const webSearchPatterns = [
    /latest|recent|current|today|2026|this year/i,
    /competitor|competitive intelligence/i,
    /census|population data|market size/i,
    /platform.*(feature|update|change)/i,
    /pricing|cost.*(current|now)/i,
  ];

  const queryTriggersWebSearch = webSearchPatterns.some(p => p.test(query));

  return hasWebSearchDoc || queryTriggersWebSearch;
}

export default KBMetadataParser;
