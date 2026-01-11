/**
 * Success Patterns System
 *
 * Identifies and tracks successful interaction patterns from
 * exemplary agent responses. These patterns can be used to
 * guide future responses and improve consistency.
 *
 * Uses StorageProvider abstraction for persistence, working
 * in both personal (file) and corporate (Dataverse) environments.
 */

import { StorageProvider } from '../providers/interfaces.js';
import {
  SuccessPattern,
  PatternType,
  ResponseElement,
  PatternExample,
  ResponseCritique,
  LearningConfig,
  DEFAULT_LEARNING_CONFIG,
} from './types.js';

/**
 * Configuration for pattern storage paths
 */
export interface PatternStorageConfig {
  /**
   * Path/prefix for storing patterns
   */
  patternsPath: string;

  /**
   * Path/prefix for pattern index
   */
  indexPath: string;
}

const DEFAULT_STORAGE_CONFIG: PatternStorageConfig = {
  patternsPath: 'learning/patterns',
  indexPath: 'learning/patterns/index.json',
};

/**
 * Index of all patterns for quick lookup
 */
interface PatternIndex {
  patterns: Array<{
    id: string;
    patternType: PatternType;
    tags: string[];
    averageScore: number;
    observationCount: number;
  }>;
  lastUpdated: string;
}

/**
 * Success Patterns manager for tracking effective response patterns
 */
export class SuccessPatterns {
  private storage: StorageProvider;
  private storageConfig: PatternStorageConfig;
  private learningConfig: LearningConfig;
  private patternCache: Map<string, SuccessPattern> = new Map();
  private indexCache: PatternIndex | null = null;

  constructor(
    storage: StorageProvider,
    storageConfig?: Partial<PatternStorageConfig>,
    learningConfig?: Partial<LearningConfig>
  ) {
    this.storage = storage;
    this.storageConfig = { ...DEFAULT_STORAGE_CONFIG, ...storageConfig };
    this.learningConfig = { ...DEFAULT_LEARNING_CONFIG, ...learningConfig };
  }

  /**
   * Extract potential patterns from an exemplary critique
   */
  async extractFromCritique(critique: ResponseCritique): Promise<SuccessPattern | null> {
    if (!critique.isExemplary) {
      return null;
    }

    // Determine pattern type from the interaction
    const patternType = this.detectPatternType(critique.userQuery, critique.agentResponse);

    // Extract response elements that made it effective
    const responseElements = this.extractResponseElements(critique);

    // Generate trigger conditions
    const triggerConditions = this.extractTriggerConditions(critique.userQuery);

    // Check if we already have a similar pattern
    const existingPattern = await this.findSimilarPattern(patternType, triggerConditions);

    if (existingPattern) {
      // Reinforce existing pattern
      return await this.reinforcePattern(existingPattern, critique);
    }

    // Create new pattern
    const pattern: SuccessPattern = {
      id: `pattern_${Date.now()}`,
      createdAt: new Date(),
      lastReinforcedAt: new Date(),
      observationCount: 1,
      patternType,
      description: this.generatePatternDescription(patternType, responseElements),
      triggerConditions,
      responseElements,
      examples: [{
        query: critique.userQuery,
        responseSnippet: critique.agentResponse.slice(0, 500),
        score: critique.overallScore,
        critiqueId: critique.id,
      }],
      averageScore: critique.overallScore,
      confidence: 0.3,  // Low confidence until more observations
      tags: this.generateTags(critique),
    };

    await this.savePattern(pattern);
    return pattern;
  }

  /**
   * Detect the type of pattern from interaction
   */
  private detectPatternType(query: string, response: string): PatternType {
    const queryLower = query.toLowerCase();
    const responseLower = response.toLowerCase();

    if (queryLower.includes('calculate') || queryLower.includes('how much') ||
        responseLower.includes('calculation') || /\d+[\s]*[×x*\/+\-=][\s]*\d+/.test(response)) {
      return 'calculation_request';
    }

    if (queryLower.includes('benchmark') || queryLower.includes('typical') ||
        queryLower.includes('average') || queryLower.includes('industry')) {
      return 'benchmark_query';
    }

    if (queryLower.includes('?') && queryLower.length < 50 &&
        (queryLower.includes('what') || queryLower.includes('which') || queryLower.includes('do you'))) {
      return 'clarification_response';
    }

    if (queryLower.includes('recommend') || queryLower.includes('suggest') ||
        queryLower.includes('should') || queryLower.includes('best')) {
      return 'recommendation';
    }

    if (queryLower.includes('step') || queryLower.includes('how to') ||
        queryLower.includes('guidance')) {
      return 'step_guidance';
    }

    if (queryLower.includes('summarize') || queryLower.includes('overall') ||
        queryLower.includes('together')) {
      return 'synthesis';
    }

    return 'other';
  }

  /**
   * Extract response elements that made it effective
   */
  private extractResponseElements(critique: ResponseCritique): ResponseElement[] {
    const elements: ResponseElement[] = [];
    const response = critique.agentResponse;

    // Check for structured format
    if (response.includes('\n-') || response.includes('\n•') || response.includes('\n1.')) {
      elements.push({
        type: 'structure',
        description: 'Uses clear bullet points or numbered lists for organization',
        importance: 'important',
      });
    }

    // Check for citations
    if (response.includes('Based on Knowledge Base') || response.includes('according to')) {
      elements.push({
        type: 'citation',
        description: 'Provides citations to source material',
        importance: 'critical',
      });
    }

    // Check for calculations shown
    if (/\d+[\s]*[×x*\/+\-=][\s]*\d+/.test(response)) {
      elements.push({
        type: 'calculation',
        description: 'Shows calculation work explicitly',
        importance: 'critical',
      });
    }

    // Check for clear recommendations
    if (response.toLowerCase().includes('recommend') || response.toLowerCase().includes('suggest')) {
      elements.push({
        type: 'content',
        description: 'Provides clear, actionable recommendations',
        importance: 'important',
      });
    }

    // Check for caveats/nuance
    if (response.includes('however') || response.includes('note that') || response.includes('depends on')) {
      elements.push({
        type: 'content',
        description: 'Acknowledges nuance and caveats appropriately',
        importance: 'helpful',
      });
    }

    return elements;
  }

  /**
   * Extract trigger conditions from query
   */
  private extractTriggerConditions(query: string): string[] {
    const conditions: string[] = [];
    const queryLower = query.toLowerCase();

    // Extract key phrases that trigger this type of response
    const keyPhrases = [
      'calculate', 'how much', 'benchmark', 'typical', 'recommend',
      'suggest', 'what is', 'how to', 'step', 'guidance', 'best practice',
    ];

    for (const phrase of keyPhrases) {
      if (queryLower.includes(phrase)) {
        conditions.push(`Query contains "${phrase}"`);
      }
    }

    // Add query characteristics
    if (query.includes('?')) {
      conditions.push('Query is a question');
    }

    if (/\d/.test(query)) {
      conditions.push('Query contains numbers');
    }

    return conditions;
  }

  /**
   * Generate description for a pattern
   */
  private generatePatternDescription(type: PatternType, elements: ResponseElement[]): string {
    const elementDescriptions = elements
      .filter(e => e.importance !== 'helpful')
      .map(e => e.description)
      .join('; ');

    const typeDescriptions: Record<PatternType, string> = {
      calculation_request: 'Effective response to calculation requests',
      benchmark_query: 'Effective response to benchmark queries',
      clarification_response: 'Effective clarifying response',
      recommendation: 'Effective recommendation pattern',
      error_handling: 'Effective error handling pattern',
      step_guidance: 'Effective step guidance pattern',
      synthesis: 'Effective synthesis pattern',
      other: 'Effective response pattern',
    };

    return `${typeDescriptions[type]}. Key elements: ${elementDescriptions}`;
  }

  /**
   * Generate tags for categorization
   */
  private generateTags(critique: ResponseCritique): string[] {
    const tags: string[] = [];

    if (critique.metadata.step) {
      tags.push(`step-${critique.metadata.step}`);
    }

    if (critique.metadata.topic) {
      tags.push(critique.metadata.topic);
    }

    if (critique.metadata.citationsProvided && critique.metadata.citationsProvided > 0) {
      tags.push('has-citations');
    }

    if (critique.overallScore >= 0.9) {
      tags.push('high-quality');
    }

    return tags;
  }

  /**
   * Find a similar existing pattern
   */
  private async findSimilarPattern(
    type: PatternType,
    triggerConditions: string[]
  ): Promise<SuccessPattern | null> {
    await this.loadIndex();

    if (!this.indexCache) return null;

    // Find patterns of same type
    const candidates = this.indexCache.patterns.filter(p => p.patternType === type);

    for (const candidate of candidates) {
      const pattern = await this.loadPattern(candidate.id);
      if (pattern) {
        // Check for overlapping trigger conditions
        const overlap = pattern.triggerConditions.filter(tc =>
          triggerConditions.some(newTc => newTc.includes(tc.replace('Query contains ', '').replace('"', '')))
        );

        if (overlap.length >= triggerConditions.length * 0.5) {
          return pattern;
        }
      }
    }

    return null;
  }

  /**
   * Reinforce an existing pattern with new observation
   */
  private async reinforcePattern(
    pattern: SuccessPattern,
    critique: ResponseCritique
  ): Promise<SuccessPattern> {
    // Update pattern
    pattern.observationCount++;
    pattern.lastReinforcedAt = new Date();

    // Update average score
    pattern.averageScore = (
      (pattern.averageScore * (pattern.observationCount - 1)) + critique.overallScore
    ) / pattern.observationCount;

    // Update confidence based on observations and score consistency
    pattern.confidence = Math.min(0.95, pattern.observationCount / 10 + 0.3);

    // Add example if we have room
    if (pattern.examples.length < 5) {
      pattern.examples.push({
        query: critique.userQuery,
        responseSnippet: critique.agentResponse.slice(0, 500),
        score: critique.overallScore,
        critiqueId: critique.id,
      });
    } else {
      // Replace lowest scoring example
      const lowestIndex = pattern.examples.reduce((minIdx, ex, idx, arr) =>
        ex.score < arr[minIdx].score ? idx : minIdx, 0);

      if (critique.overallScore > pattern.examples[lowestIndex].score) {
        pattern.examples[lowestIndex] = {
          query: critique.userQuery,
          responseSnippet: critique.agentResponse.slice(0, 500),
          score: critique.overallScore,
          critiqueId: critique.id,
        };
      }
    }

    await this.savePattern(pattern);
    return pattern;
  }

  /**
   * Get patterns relevant to a query
   */
  async getRelevantPatterns(query: string, limit: number = 3): Promise<SuccessPattern[]> {
    await this.loadIndex();

    if (!this.indexCache) return [];

    const queryLower = query.toLowerCase();
    const relevant: Array<{ pattern: SuccessPattern; relevance: number }> = [];

    for (const entry of this.indexCache.patterns) {
      // Skip low-confidence patterns
      if (entry.observationCount < this.learningConfig.minPatternObservations) {
        continue;
      }

      const pattern = await this.loadPattern(entry.id);
      if (!pattern) continue;

      // Calculate relevance
      let relevance = 0;

      // Check trigger conditions
      for (const condition of pattern.triggerConditions) {
        const keyword = condition.replace('Query contains "', '').replace('"', '').toLowerCase();
        if (queryLower.includes(keyword)) {
          relevance += 0.3;
        }
      }

      // Boost by confidence and score
      relevance *= pattern.confidence * pattern.averageScore;

      if (relevance > 0) {
        relevant.push({ pattern, relevance });
      }
    }

    return relevant
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit)
      .map(r => r.pattern);
  }

  /**
   * Save a pattern to storage
   */
  private async savePattern(pattern: SuccessPattern): Promise<void> {
    const path = `${this.storageConfig.patternsPath}/${pattern.id}.json`;
    await this.storage.writeJSON(path, pattern);
    this.patternCache.set(pattern.id, pattern);
    await this.updateIndex(pattern);
  }

  /**
   * Load a pattern from storage
   */
  private async loadPattern(id: string): Promise<SuccessPattern | null> {
    if (this.patternCache.has(id)) {
      return this.patternCache.get(id)!;
    }

    try {
      const path = `${this.storageConfig.patternsPath}/${id}.json`;
      const pattern = await this.storage.readJSON<SuccessPattern>(path);
      this.patternCache.set(id, pattern);
      return pattern;
    } catch {
      return null;
    }
  }

  /**
   * Load the pattern index
   */
  private async loadIndex(): Promise<void> {
    if (this.indexCache) return;

    try {
      this.indexCache = await this.storage.readJSON<PatternIndex>(this.storageConfig.indexPath);
    } catch {
      this.indexCache = { patterns: [], lastUpdated: new Date().toISOString() };
    }
  }

  /**
   * Update the pattern index
   */
  private async updateIndex(pattern: SuccessPattern): Promise<void> {
    await this.loadIndex();

    if (!this.indexCache) {
      this.indexCache = { patterns: [], lastUpdated: new Date().toISOString() };
    }

    // Update or add pattern entry
    const existingIndex = this.indexCache.patterns.findIndex(p => p.id === pattern.id);

    const entry = {
      id: pattern.id,
      patternType: pattern.patternType,
      tags: pattern.tags,
      averageScore: pattern.averageScore,
      observationCount: pattern.observationCount,
    };

    if (existingIndex >= 0) {
      this.indexCache.patterns[existingIndex] = entry;
    } else {
      this.indexCache.patterns.push(entry);
    }

    this.indexCache.lastUpdated = new Date().toISOString();
    await this.storage.writeJSON(this.storageConfig.indexPath, this.indexCache);
  }

  /**
   * Get all patterns (for export/analysis)
   */
  async getAllPatterns(): Promise<SuccessPattern[]> {
    await this.loadIndex();

    if (!this.indexCache) return [];

    const patterns: SuccessPattern[] = [];
    for (const entry of this.indexCache.patterns) {
      const pattern = await this.loadPattern(entry.id);
      if (pattern) {
        patterns.push(pattern);
      }
    }

    return patterns;
  }

  /**
   * Get pattern statistics
   */
  async getStats(): Promise<{
    totalPatterns: number;
    patternsByType: Record<string, number>;
    averageConfidence: number;
    highConfidenceCount: number;
  }> {
    await this.loadIndex();

    if (!this.indexCache) {
      return {
        totalPatterns: 0,
        patternsByType: {},
        averageConfidence: 0,
        highConfidenceCount: 0,
      };
    }

    const patternsByType: Record<string, number> = {};
    let totalConfidence = 0;
    let highConfidenceCount = 0;

    for (const entry of this.indexCache.patterns) {
      patternsByType[entry.patternType] = (patternsByType[entry.patternType] || 0) + 1;

      const pattern = await this.loadPattern(entry.id);
      if (pattern) {
        totalConfidence += pattern.confidence;
        if (pattern.confidence >= 0.7) {
          highConfidenceCount++;
        }
      }
    }

    return {
      totalPatterns: this.indexCache.patterns.length,
      patternsByType,
      averageConfidence: this.indexCache.patterns.length > 0
        ? totalConfidence / this.indexCache.patterns.length
        : 0,
      highConfidenceCount,
    };
  }
}

export default SuccessPatterns;
