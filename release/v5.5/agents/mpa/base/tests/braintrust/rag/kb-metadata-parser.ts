/**
 * KB Document Header Parser
 *
 * Parses structured metadata from KB document headers for improved retrieval.
 * Supports the new document header standard with META_ prefixed fields.
 *
 * Header Format:
 * ================================================================================
 * [SECTION TITLE]
 * ================================================================================
 *
 * META_WORKFLOW_STEPS: 3,4,5
 * META_TOPICS: channel_selection, budget_allocation
 * META_VERTICALS: ALL
 * META_CHANNELS: PROGRAMMATIC_DISPLAY, CTV_OTT
 * META_INTENT: CHANNEL_SELECTION, BUDGET_PLANNING
 * META_CONFIDENCE: HIGH
 * META_LAST_UPDATED: 2026-01-15
 *
 * [Section content...]
 * ================================================================================
 *
 * @module kb-metadata-parser
 * @version 6.0
 */

import { DocumentType, Topic } from './types.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Intent categories for query-to-document matching
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
  | 'GENERAL_GUIDANCE';

/**
 * Confidence levels for document sections
 */
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Structured metadata extracted from document headers
 */
export interface KBSectionMetadata {
  sectionTitle: string;
  workflowSteps: number[];
  topics: string[];
  verticals: string[];
  channels: string[];
  intents: QueryIntent[];
  confidence: ConfidenceLevel;
  lastUpdated: Date | null;
  rawMetadata: Record<string, string>;
}

/**
 * Document-level metadata combining header info with file-level data
 */
export interface KBDocumentMetadata {
  filename: string;
  documentType: DocumentType;
  category: string;
  version: string;
  date: string | null;
  status: string;
  sections: KBSectionMetadata[];
  totalSections: number;
  topics: string[];
}

/**
 * Legacy header format (DOCUMENT:, CATEGORY:, etc.)
 */
export interface LegacyDocumentHeader {
  document: string;
  category: string;
  topics: string[];
  version: string;
  date: string | null;
  status: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * META_ field definitions and their parsers
 */
const META_FIELD_PARSERS: Record<string, (value: string) => unknown> = {
  META_WORKFLOW_STEPS: (v) => v.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)),
  META_TOPICS: (v) => v.split(',').map(s => s.trim().toLowerCase()),
  META_VERTICALS: (v) => v.toUpperCase() === 'ALL' ? ['ALL'] : v.split(',').map(s => s.trim().toUpperCase()),
  META_CHANNELS: (v) => v.split(',').map(s => s.trim().toUpperCase()),
  META_INTENT: (v) => v.split(',').map(s => s.trim().toUpperCase()) as QueryIntent[],
  META_CONFIDENCE: (v) => v.trim().toUpperCase() as ConfidenceLevel,
  META_LAST_UPDATED: (v) => {
    const parsed = new Date(v.trim());
    return isNaN(parsed.getTime()) ? null : parsed;
  },
};

/**
 * Legacy header field patterns
 */
const LEGACY_HEADER_PATTERNS = {
  document: /^DOCUMENT:\s*(.+)$/m,
  category: /^CATEGORY:\s*(.+)$/m,
  topics: /^TOPICS:\s*(.+)$/m,
  version: /^VERSION:\s*(.+)$/m,
  date: /^DATE:\s*(.+)$/m,
  status: /^STATUS:\s*(.+)$/m,
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
  parseDocument(content: string, filename: string): KBDocumentMetadata {
    const legacyHeader = this.parseLegacyHeader(content);
    const sections = this.parseSections(content);

    // Aggregate topics from all sections
    const allTopics = new Set<string>(legacyHeader.topics);
    for (const section of sections) {
      for (const topic of section.topics) {
        allTopics.add(topic);
      }
    }

    return {
      filename,
      documentType: this.inferDocumentType(filename, legacyHeader.category),
      category: legacyHeader.category,
      version: legacyHeader.version,
      date: legacyHeader.date,
      status: legacyHeader.status,
      sections,
      totalSections: sections.length,
      topics: Array.from(allTopics),
    };
  }

  /**
   * Parse legacy header format (DOCUMENT:, CATEGORY:, etc.)
   */
  parseLegacyHeader(content: string): LegacyDocumentHeader {
    const header: LegacyDocumentHeader = {
      document: '',
      category: '',
      topics: [],
      version: '',
      date: null,
      status: '',
    };

    // Extract first 2000 chars for header search (headers are at top)
    const headerSection = content.slice(0, 2000);

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
    const workflowSteps = this.parseMetaField('META_WORKFLOW_STEPS', rawMetadata, []) as number[];
    const topics = this.parseMetaField('META_TOPICS', rawMetadata, []) as string[];
    const verticals = this.parseMetaField('META_VERTICALS', rawMetadata, []) as string[];
    const channels = this.parseMetaField('META_CHANNELS', rawMetadata, []) as string[];
    const intents = this.parseMetaField('META_INTENT', rawMetadata, ['GENERAL_GUIDANCE']) as QueryIntent[];
    const confidence = this.parseMetaField('META_CONFIDENCE', rawMetadata, 'MEDIUM') as ConfidenceLevel;
    const lastUpdated = this.parseMetaField('META_LAST_UPDATED', rawMetadata, null) as Date | null;

    // If no explicit metadata, infer from content
    const inferredMetadata = this.inferMetadataFromContent(content, title);

    return {
      sectionTitle: title,
      workflowSteps: workflowSteps.length > 0 ? workflowSteps : inferredMetadata.workflowSteps,
      topics: topics.length > 0 ? topics : inferredMetadata.topics,
      verticals: verticals.length > 0 ? verticals : inferredMetadata.verticals,
      channels: channels.length > 0 ? channels : inferredMetadata.channels,
      intents: intents.length > 0 ? intents : inferredMetadata.intents,
      confidence,
      lastUpdated,
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
  ): Omit<KBSectionMetadata, 'sectionTitle' | 'confidence' | 'lastUpdated' | 'rawMetadata'> {
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
   * Infer document type from filename and category
   */
  private inferDocumentType(filename: string, category: string): DocumentType {
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
    CHANNEL_SELECTION: [7],
    BUDGET_PLANNING: [5],
    AUDIENCE_TARGETING: [3, 4],
    MEASUREMENT_GUIDANCE: [8],
    WORKFLOW_HELP: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    ECONOMICS_VALIDATION: [2],
    RISK_ASSESSMENT: [10],
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

export default KBMetadataParser;
