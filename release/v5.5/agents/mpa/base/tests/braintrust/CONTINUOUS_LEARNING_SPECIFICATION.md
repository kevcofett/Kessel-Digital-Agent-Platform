# MPA CONTINUOUS LEARNING SYSTEM SPECIFICATION v1.0

## EXECUTIVE SUMMARY

This specification defines a four-layer continuous learning system for the MPA agent that enables self-improvement through real-time critique, pattern mining, KB enhancement, and user feedback. The system is designed with graceful degradation - all storage-dependent features can be disabled while maintaining core functionality.

TARGET OUTCOME: 
- Immediate: +3-5% composite score from self-critique
- Short-term: +5-8% from success pattern learning
- Long-term: Continuous improvement through feedback loops

DEPLOYMENT TARGETS:
- Braintrust evaluation harness (immediate)
- Copilot Studio production (future)


## SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MPA AGENT RUNTIME                                    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    LAYER C: SELF-CRITIQUE                            │    │
│  │  Real-time reflection before response delivery                       │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │    │
│  │  │ Draft        │→ │ Critique     │→ │ Revised Response         │   │    │
│  │  │ Response     │  │ Pass (Haiku) │  │ (if needed)              │   │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘   │    │
│  │  ALWAYS ON - No storage required                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    LAYER B: SUCCESS PATTERNS                         │    │
│  │  Few-shot examples from high-scoring past responses                  │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │    │
│  │  │ Pattern      │→ │ Similarity   │→ │ Inject as Few-Shot       │   │    │
│  │  │ Store        │  │ Search       │  │ Examples                 │   │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘   │    │
│  │  OPTIONAL - Requires storage (JSON file or Dataverse)               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
└────────────────────────────────────┼─────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         POST-EVAL PIPELINE                                   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    LAYER A: KB ENHANCEMENT                           │    │
│  │  Automated gap analysis and KB content generation                    │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │    │
│  │  │ Eval Results │→ │ Gap Analysis │→ │ Generated KB Content     │   │    │
│  │  │ Analysis     │  │ (Claude)     │  │ (Human Review)           │   │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘   │    │
│  │  OFFLINE - Runs after eval, outputs to files                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    LAYER D: USER FEEDBACK                            │    │
│  │  Capture explicit user signals to improve responses                  │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │    │
│  │  │ Thumbs Up/   │→ │ Feedback     │→ │ Pattern Extraction       │   │    │
│  │  │ Down, Edits  │  │ Storage      │  │ & KB Update              │   │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘   │    │
│  │  OPTIONAL - Requires Dataverse for production                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```


## FEATURE FLAGS AND GRACEFUL DEGRADATION

```typescript
interface LearningSystemConfig {
  // Layer C: Self-Critique (always available)
  selfCritique: {
    enabled: boolean;              // Default: true
    model: string;                 // Default: 'claude-3-5-haiku-20241022'
    maxRevisions: number;          // Default: 1
    criteriaToCheck: string[];     // Which scorers to self-check
  };
  
  // Layer B: Success Patterns (requires storage)
  successPatterns: {
    enabled: boolean;              // Default: true if storage available
    storageBackend: 'json' | 'dataverse' | 'none';
    minScoreThreshold: number;     // Default: 0.95
    maxPatternsToRetrieve: number; // Default: 2
    patternFilePath?: string;      // For JSON backend
    dataverseTable?: string;       // For Dataverse backend
  };
  
  // Layer A: KB Enhancement (offline pipeline)
  kbEnhancement: {
    enabled: boolean;              // Default: true
    autoApply: boolean;            // Default: false (human review)
    outputDirectory: string;       // Where to write suggestions
    minGapThreshold: number;       // Default: 0.92 (below this = gap)
  };
  
  // Layer D: User Feedback (requires Dataverse in production)
  userFeedback: {
    enabled: boolean;              // Default: true if Dataverse available
    storageBackend: 'json' | 'dataverse' | 'none';
    feedbackTypes: ('thumbs' | 'edit' | 'explicit')[];
    dataverseTable?: string;
  };
}

// Default configuration with graceful degradation
const DEFAULT_LEARNING_CONFIG: LearningSystemConfig = {
  selfCritique: {
    enabled: true,
    model: 'claude-3-5-haiku-20241022',
    maxRevisions: 1,
    criteriaToCheck: [
      'source-citation',
      'acronym-definition', 
      'response-length',
      'single-question',
      'calculation-presence'
    ],
  },
  successPatterns: {
    enabled: false,  // Disabled until storage configured
    storageBackend: 'none',
    minScoreThreshold: 0.95,
    maxPatternsToRetrieve: 2,
  },
  kbEnhancement: {
    enabled: true,
    autoApply: false,
    outputDirectory: './learning-outputs/kb-suggestions',
    minGapThreshold: 0.92,
  },
  userFeedback: {
    enabled: false,  // Disabled until Dataverse configured
    storageBackend: 'none',
    feedbackTypes: ['thumbs', 'edit'],
  },
};
```


## FILE STRUCTURE

```
braintrust/
├── learning/
│   ├── index.ts                     # Exports and config
│   ├── types.ts                     # Type definitions
│   ├── self-critique.ts             # Layer C implementation
│   ├── success-patterns.ts          # Layer B implementation
│   ├── kb-enhancement-pipeline.ts   # Layer A implementation
│   ├── user-feedback.ts             # Layer D implementation
│   ├── storage/
│   │   ├── storage-interface.ts     # Abstract storage interface
│   │   ├── json-storage.ts          # JSON file backend
│   │   └── dataverse-storage.ts     # Dataverse backend (stub for now)
│   └── criteria/
│       ├── critique-criteria.ts     # Self-critique rules
│       └── scorer-mappings.ts       # Maps scorers to critique rules
├── learning-outputs/                # Generated content (gitignored)
│   ├── kb-suggestions/              # Layer A outputs
│   ├── patterns/                    # Layer B pattern cache
│   └── feedback/                    # Layer D feedback logs
└── ... (existing files)
```


## COMPONENT SPECIFICATIONS


### LAYER C: SELF-CRITIQUE SYSTEM

**Purpose**: Real-time quality check before delivering responses. Catches common scoring failures.

**File**: learning/self-critique.ts

```typescript
/**
 * Self-Critique System
 * 
 * Performs a fast reflection pass on agent responses before delivery.
 * Uses Claude Haiku for speed (~200ms per critique).
 */

import Anthropic from '@anthropic-ai/sdk';
import { LearningSystemConfig, CritiqueResult, CriteriaCheck } from './types.js';
import { CRITIQUE_CRITERIA } from './criteria/critique-criteria.js';

export class SelfCritiqueSystem {
  private anthropic: Anthropic;
  private config: LearningSystemConfig['selfCritique'];
  private stats: CritiqueStats;

  constructor(anthropic: Anthropic, config: LearningSystemConfig['selfCritique']) {
    this.anthropic = anthropic;
    this.config = config;
    this.stats = {
      totalCritiques: 0,
      revisionsTriggered: 0,
      criteriaFailures: {},
    };
  }

  /**
   * Critique a response and optionally revise it
   */
  async critique(
    originalResponse: string,
    context: CritiqueContext
  ): Promise<CritiqueResult> {
    if (!this.config.enabled) {
      return {
        originalResponse,
        revisedResponse: originalResponse,
        wasRevised: false,
        checks: [],
        latencyMs: 0,
      };
    }

    const startTime = Date.now();
    this.stats.totalCritiques++;

    // Build criteria-specific prompt
    const criteriaPrompt = this.buildCriteriaPrompt(context);

    // Fast critique pass
    const critiqueResponse = await this.anthropic.messages.create({
      model: this.config.model,
      max_tokens: 800,
      temperature: 0,
      system: SELF_CRITIQUE_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `RESPONSE TO CRITIQUE:
${originalResponse}

CONTEXT:
- User message: ${context.userMessage}
- Current step: ${context.currentStep}
- Tools used: ${context.toolsUsed.join(', ') || 'none'}

CRITERIA TO CHECK:
${criteriaPrompt}

Analyze the response against each criterion. Output JSON:
{
  "checks": [
    {"criterion": "...", "passed": true/false, "issue": "..." or null}
  ],
  "needsRevision": true/false,
  "revisedResponse": "..." or null
}`
      }]
    });

    const result = this.parseResponse(critiqueResponse.content[0].text, originalResponse);
    
    if (result.wasRevised) {
      this.stats.revisionsTriggered++;
    }

    // Track which criteria fail most often
    for (const check of result.checks) {
      if (!check.passed) {
        this.stats.criteriaFailures[check.criterion] = 
          (this.stats.criteriaFailures[check.criterion] || 0) + 1;
      }
    }

    result.latencyMs = Date.now() - startTime;
    return result;
  }

  /**
   * Build prompt section for criteria checks
   */
  private buildCriteriaPrompt(context: CritiqueContext): string {
    return this.config.criteriaToCheck
      .map(criterion => {
        const spec = CRITIQUE_CRITERIA[criterion];
        return `${criterion.toUpperCase()}:
  Rule: ${spec.rule}
  Check: ${spec.check}
  Fix: ${spec.fix}`;
      })
      .join('\n\n');
  }

  /**
   * Parse critique response
   */
  private parseResponse(text: string, original: string): CritiqueResult {
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.noRevisionResult(original);
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        originalResponse: original,
        revisedResponse: parsed.needsRevision ? parsed.revisedResponse : original,
        wasRevised: parsed.needsRevision && parsed.revisedResponse,
        checks: parsed.checks || [],
        latencyMs: 0,
      };
    } catch {
      return this.noRevisionResult(original);
    }
  }

  private noRevisionResult(original: string): CritiqueResult {
    return {
      originalResponse: original,
      revisedResponse: original,
      wasRevised: false,
      checks: [],
      latencyMs: 0,
    };
  }

  /**
   * Get statistics
   */
  getStats(): CritiqueStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalCritiques: 0,
      revisionsTriggered: 0,
      criteriaFailures: {},
    };
  }
}

const SELF_CRITIQUE_SYSTEM_PROMPT = `You are a quality checker for an AI media planning assistant.

Your job is to review responses against specific criteria and suggest revisions ONLY when necessary.

IMPORTANT RULES:
1. Be conservative - only flag clear violations
2. Keep revisions minimal - fix the issue, don't rewrite everything
3. Preserve the response's tone and substance
4. If multiple issues exist, fix all of them in one revision
5. If the response is fine, don't change it

Output valid JSON only. No markdown, no explanations outside the JSON.`;

export default SelfCritiqueSystem;
```


**File**: learning/criteria/critique-criteria.ts

```typescript
/**
 * Critique Criteria Definitions
 * 
 * Maps scorer names to self-critique rules.
 */

export interface CriteriaDef {
  rule: string;
  check: string;
  fix: string;
  examples?: {
    bad: string;
    good: string;
  };
}

export const CRITIQUE_CRITERIA: Record<string, CriteriaDef> = {
  'source-citation': {
    rule: 'All benchmark claims must cite source using exact phrases',
    check: 'Does the response cite "Based on Knowledge Base" or "My estimate" when mentioning numbers/benchmarks?',
    fix: 'Add "Based on Knowledge Base, " before benchmark claims, or "My estimate is " if no KB source',
    examples: {
      bad: 'Typical ecommerce CAC runs $25-45.',
      good: 'Based on Knowledge Base, typical ecommerce CAC runs $25-45.',
    },
  },
  
  'acronym-definition': {
    rule: 'First use of any acronym must include parenthetical definition',
    check: 'Are acronyms like CAC, CPM, LTV, ROAS defined on first use?',
    fix: 'Add parenthetical definition: "cost per acquisition (CPA)" on first use',
    examples: {
      bad: 'Your CAC of $50 is reasonable.',
      good: 'Your cost per acquisition (CAC) of $50 is reasonable.',
    },
  },
  
  'response-length': {
    rule: 'Responses should be under 75 words',
    check: 'Is the response concise? Count approximate words.',
    fix: 'Shorten by removing redundant phrases, combining sentences, cutting examples',
    examples: {
      bad: 'Based on the information you have provided about your business and considering the various factors that typically influence customer acquisition costs in the ecommerce space, I would say that your target of $30 CAC is quite reasonable and achievable, especially given your focus on digital channels which tend to have lower acquisition costs than traditional media.',
      good: 'Based on Knowledge Base, your $30 CAC target is achievable for ecommerce. Digital channels typically deliver $25-45 CAC. What channels are you considering?',
    },
  },
  
  'single-question': {
    rule: 'Ask only ONE question per response',
    check: 'Does the response contain more than one question mark or multiple question phrases?',
    fix: 'Keep only the most important question, remove or convert others to statements',
    examples: {
      bad: 'What channels are you considering? And what is your timeline? Do you have creative ready?',
      good: 'What channels are you considering for this campaign?',
    },
  },
  
  'calculation-presence': {
    rule: 'When citing numbers, show the calculation',
    check: 'If the response includes a calculated number, is the math shown?',
    fix: 'Add brief calculation: "$50K budget ÷ $25 CAC = 2,000 customers"',
    examples: {
      bad: 'You could acquire about 2,000 customers.',
      good: 'With $50K budget at $25 CAC, you could acquire 2,000 customers ($50,000 ÷ $25 = 2,000).',
    },
  },
  
  'audience-sizing': {
    rule: 'Audience size estimates must include methodology',
    check: 'If audience size is mentioned, is the calculation approach explained?',
    fix: 'Add sizing logic: "US adults 25-54 (120M) × fitness interest (15%) = 18M base audience"',
    examples: {
      bad: 'Your target audience is about 2 million people.',
      good: 'Based on Knowledge Base, fitness enthusiasts are 2-4% of adults. US adults 25-54 (120M) × 3% = 3.6M target audience.',
    },
  },
};

export default CRITIQUE_CRITERIA;
```


### LAYER B: SUCCESS PATTERN SYSTEM

**Purpose**: Store high-scoring responses and retrieve as few-shot examples.

**File**: learning/success-patterns.ts

```typescript
/**
 * Success Pattern Mining System
 * 
 * Stores successful responses and retrieves similar examples for few-shot prompting.
 */

import { LearningSystemConfig, SuccessPattern, PatternSearchResult } from './types.js';
import { StorageInterface } from './storage/storage-interface.js';
import { JsonStorage } from './storage/json-storage.js';
import { DataverseStorage } from './storage/dataverse-storage.js';
import { EmbeddingService } from '../rag/embedding-service.js';

export class SuccessPatternSystem {
  private config: LearningSystemConfig['successPatterns'];
  private storage: StorageInterface<SuccessPattern> | null = null;
  private embeddingService: EmbeddingService;
  private patternEmbeddings: Map<string, number[]> = new Map();

  constructor(
    config: LearningSystemConfig['successPatterns'],
    embeddingService: EmbeddingService
  ) {
    this.config = config;
    this.embeddingService = embeddingService;
    this.initializeStorage();
  }

  /**
   * Initialize appropriate storage backend
   */
  private initializeStorage(): void {
    if (!this.config.enabled || this.config.storageBackend === 'none') {
      this.storage = null;
      return;
    }

    switch (this.config.storageBackend) {
      case 'json':
        this.storage = new JsonStorage<SuccessPattern>(
          this.config.patternFilePath || './learning-outputs/patterns/success-patterns.json'
        );
        break;
      case 'dataverse':
        this.storage = new DataverseStorage<SuccessPattern>(
          this.config.dataverseTable || 'mpa_success_patterns'
        );
        break;
    }
  }

  /**
   * Check if system is available
   */
  isAvailable(): boolean {
    return this.config.enabled && this.storage !== null;
  }

  /**
   * Store a successful pattern from eval results
   */
  async storePattern(
    scenario: string,
    userMessage: string,
    agentResponse: string,
    scores: Record<string, number>,
    compositeScore: number,
    metadata?: Record<string, unknown>
  ): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    // Only store if above threshold
    if (compositeScore < this.config.minScoreThreshold) {
      return false;
    }

    const pattern: SuccessPattern = {
      id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      scenario,
      userMessage,
      agentResponse,
      scores,
      compositeScore,
      metadata: metadata || {},
      createdAt: new Date().toISOString(),
    };

    // Generate and store embedding for similarity search
    const embedding = this.embeddingService.embed(userMessage);
    this.patternEmbeddings.set(pattern.id, embedding);

    await this.storage!.save(pattern.id, pattern);
    return true;
  }

  /**
   * Retrieve similar patterns for few-shot prompting
   */
  async getSimilarPatterns(
    userMessage: string,
    currentStep?: number,
    scenario?: string
  ): Promise<PatternSearchResult[]> {
    if (!this.isAvailable()) {
      return [];
    }

    // Get all patterns
    const allPatterns = await this.storage!.list();
    if (allPatterns.length === 0) {
      return [];
    }

    // Load embeddings if needed
    await this.ensureEmbeddingsLoaded(allPatterns);

    // Compute query embedding
    const queryEmbedding = this.embeddingService.embed(userMessage);

    // Score all patterns by similarity
    const scored: PatternSearchResult[] = [];
    
    for (const pattern of allPatterns) {
      const patternEmbedding = this.patternEmbeddings.get(pattern.id);
      if (!patternEmbedding) continue;

      let score = this.embeddingService.cosineSimilarity(queryEmbedding, patternEmbedding);
      
      // Boost if same scenario
      if (scenario && pattern.scenario === scenario) {
        score *= 1.2;
      }
      
      // Boost if same step (if metadata includes step)
      if (currentStep && pattern.metadata?.step === currentStep) {
        score *= 1.1;
      }

      scored.push({
        pattern,
        similarityScore: Math.min(score, 1.0), // Cap at 1.0
      });
    }

    // Sort by score and return top K
    return scored
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, this.config.maxPatternsToRetrieve);
  }

  /**
   * Format patterns as few-shot examples for prompt injection
   */
  formatAsExamples(results: PatternSearchResult[]): string {
    if (results.length === 0) {
      return '';
    }

    const examples = results.map((r, i) => 
      `EXAMPLE ${i + 1} (Score: ${(r.pattern.compositeScore * 100).toFixed(0)}%):
USER: ${r.pattern.userMessage}
AGENT: ${r.pattern.agentResponse}`
    ).join('\n\n');

    return `
EXAMPLES OF HIGH-QUALITY RESPONSES:
${examples}

Apply similar patterns of brevity, citation, and structure to your response.
`;
  }

  /**
   * Ensure all patterns have embeddings loaded
   */
  private async ensureEmbeddingsLoaded(patterns: SuccessPattern[]): Promise<void> {
    for (const pattern of patterns) {
      if (!this.patternEmbeddings.has(pattern.id)) {
        const embedding = this.embeddingService.embed(pattern.userMessage);
        this.patternEmbeddings.set(pattern.id, embedding);
      }
    }
  }

  /**
   * Get pattern count
   */
  async getPatternCount(): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }
    const patterns = await this.storage!.list();
    return patterns.length;
  }

  /**
   * Clear all patterns (useful for testing)
   */
  async clearPatterns(): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }
    await this.storage!.clear();
    this.patternEmbeddings.clear();
  }
}

export default SuccessPatternSystem;
```


### LAYER A: KB ENHANCEMENT PIPELINE

**Purpose**: Analyze eval results and generate KB improvements.

**File**: learning/kb-enhancement-pipeline.ts

```typescript
/**
 * KB Enhancement Pipeline
 * 
 * Analyzes evaluation results to identify scoring gaps and
 * generates KB content suggestions to address them.
 * 
 * This is an OFFLINE process - runs after evals, outputs files for human review.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import {
  LearningSystemConfig,
  ScoringGap,
  KBEnhancementSuggestion,
  EvalResultSummary,
} from './types.js';

export class KBEnhancementPipeline {
  private anthropic: Anthropic;
  private config: LearningSystemConfig['kbEnhancement'];

  constructor(anthropic: Anthropic, config: LearningSystemConfig['kbEnhancement']) {
    this.anthropic = anthropic;
    this.config = config;
  }

  /**
   * Main entry point - analyze eval results and generate suggestions
   */
  async analyzeAndSuggest(evalResults: EvalResultSummary[]): Promise<KBEnhancementSuggestion[]> {
    if (!this.config.enabled) {
      return [];
    }

    console.log('KB Enhancement Pipeline: Analyzing eval results...');

    // Step 1: Identify scoring gaps
    const gaps = this.identifyGaps(evalResults);
    console.log(`Found ${gaps.length} scoring gaps below ${this.config.minGapThreshold * 100}%`);

    if (gaps.length === 0) {
      console.log('No gaps to address - all scorers above threshold');
      return [];
    }

    // Step 2: Analyze failure patterns for each gap
    const suggestions: KBEnhancementSuggestion[] = [];

    for (const gap of gaps) {
      console.log(`Analyzing gap: ${gap.scorer} (${(gap.averageScore * 100).toFixed(1)}%)`);
      
      // Get failing examples
      const failingExamples = this.getFailingExamples(evalResults, gap.scorer);
      
      // Analyze patterns
      const patterns = await this.analyzeFailurePatterns(gap.scorer, failingExamples);
      
      // Generate KB content
      const suggestion = await this.generateKBSuggestion(gap, patterns, failingExamples);
      suggestions.push(suggestion);
    }

    // Step 3: Save suggestions to files
    await this.saveSuggestions(suggestions);

    return suggestions;
  }

  /**
   * Identify scorers below threshold
   */
  private identifyGaps(results: EvalResultSummary[]): ScoringGap[] {
    // Aggregate scores by scorer
    const scorerTotals: Record<string, { sum: number; count: number; scenarios: string[] }> = {};

    for (const result of results) {
      for (const [scorer, score] of Object.entries(result.scores)) {
        if (!scorerTotals[scorer]) {
          scorerTotals[scorer] = { sum: 0, count: 0, scenarios: [] };
        }
        scorerTotals[scorer].sum += score;
        scorerTotals[scorer].count++;
        
        if (score < this.config.minGapThreshold) {
          scorerTotals[scorer].scenarios.push(result.scenario);
        }
      }
    }

    // Find gaps
    const gaps: ScoringGap[] = [];
    
    for (const [scorer, data] of Object.entries(scorerTotals)) {
      const average = data.sum / data.count;
      if (average < this.config.minGapThreshold) {
        gaps.push({
          scorer,
          averageScore: average,
          failingScenarios: [...new Set(data.scenarios)],
          sampleCount: data.count,
        });
      }
    }

    // Sort by severity (lowest scores first)
    return gaps.sort((a, b) => a.averageScore - b.averageScore);
  }

  /**
   * Get examples that failed a specific scorer
   */
  private getFailingExamples(
    results: EvalResultSummary[],
    scorer: string
  ): Array<{ userMessage: string; agentResponse: string; score: number }> {
    const examples: Array<{ userMessage: string; agentResponse: string; score: number }> = [];

    for (const result of results) {
      const score = result.scores[scorer];
      if (score !== undefined && score < this.config.minGapThreshold) {
        // Get the response that was scored
        if (result.sampleTurn) {
          examples.push({
            userMessage: result.sampleTurn.userMessage,
            agentResponse: result.sampleTurn.agentResponse,
            score,
          });
        }
      }
    }

    return examples.slice(0, 10); // Limit to 10 examples for analysis
  }

  /**
   * Use Claude to analyze failure patterns
   */
  private async analyzeFailurePatterns(
    scorer: string,
    examples: Array<{ userMessage: string; agentResponse: string; score: number }>
  ): Promise<string[]> {
    if (examples.length === 0) {
      return [];
    }

    const examplesText = examples.map((e, i) => 
      `Example ${i + 1} (Score: ${(e.score * 100).toFixed(0)}%):
USER: ${e.userMessage}
AGENT: ${e.agentResponse}`
    ).join('\n\n---\n\n');

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      temperature: 0,
      messages: [{
        role: 'user',
        content: `Analyze these agent responses that scored poorly on the "${scorer}" criterion.

${examplesText}

Identify 3-5 specific patterns that cause these responses to fail. 
Be concrete - what exactly is wrong?

Output as a JSON array of strings:
["pattern 1", "pattern 2", ...]`
      }]
    });

    try {
      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch {
      // Fall back to empty
    }
    
    return [];
  }

  /**
   * Generate KB content suggestion to address a gap
   */
  private async generateKBSuggestion(
    gap: ScoringGap,
    patterns: string[],
    examples: Array<{ userMessage: string; agentResponse: string; score: number }>
  ): Promise<KBEnhancementSuggestion> {
    const patternsText = patterns.length > 0
      ? `Common failure patterns:\n${patterns.map((p, i) => `${i + 1}. ${p}`).join('\n')}`
      : 'No clear patterns identified';

    const examplesText = examples.slice(0, 3).map((e, i) =>
      `Bad Example ${i + 1}:\nUSER: ${e.userMessage}\nAGENT: ${e.agentResponse}`
    ).join('\n\n');

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2500,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: `The MPA agent is scoring ${(gap.averageScore * 100).toFixed(1)}% on "${gap.scorer}".
Target is ${this.config.minGapThreshold * 100}%.

${patternsText}

${examplesText}

Generate KB content that would help the agent improve on this scorer.

REQUIREMENTS:
- Use ALL CAPS section headers
- No markdown formatting (no #, *, \`, -)
- No tables or bullet points
- Plain text only with line breaks
- Include specific examples of correct behavior
- Include anti-patterns to avoid
- Keep under 3000 characters

Output the KB content directly, no preamble.`
      }]
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    return {
      scorer: gap.scorer,
      currentScore: gap.averageScore,
      targetScore: this.config.minGapThreshold,
      failurePatterns: patterns,
      suggestedContent: content,
      affectedScenarios: gap.failingScenarios,
      generatedAt: new Date().toISOString(),
      status: 'pending_review',
    };
  }

  /**
   * Save suggestions to files for human review
   */
  private async saveSuggestions(suggestions: KBEnhancementSuggestion[]): Promise<void> {
    const outputDir = path.resolve(__dirname, '..', this.config.outputDirectory);
    await fs.mkdir(outputDir, { recursive: true });

    // Save individual suggestion files
    for (const suggestion of suggestions) {
      const filename = `${suggestion.scorer}_suggestion_${Date.now()}.txt`;
      const filepath = path.join(outputDir, filename);
      
      const content = `KB ENHANCEMENT SUGGESTION
========================

Scorer: ${suggestion.scorer}
Current Score: ${(suggestion.currentScore * 100).toFixed(1)}%
Target Score: ${(suggestion.targetScore * 100).toFixed(1)}%
Generated: ${suggestion.generatedAt}

FAILURE PATTERNS IDENTIFIED:
${suggestion.failurePatterns.map((p, i) => `${i + 1}. ${p}`).join('\n')}

AFFECTED SCENARIOS:
${suggestion.affectedScenarios.join(', ')}

SUGGESTED KB CONTENT:
=====================
${suggestion.suggestedContent}

=====================
STATUS: ${suggestion.status}
INSTRUCTIONS: Review the suggested content above. If approved, add to appropriate KB file.
`;

      await fs.writeFile(filepath, content, 'utf-8');
      console.log(`Saved suggestion: ${filepath}`);
    }

    // Save summary report
    const summaryPath = path.join(outputDir, `summary_${Date.now()}.json`);
    await fs.writeFile(summaryPath, JSON.stringify(suggestions, null, 2), 'utf-8');
    console.log(`Saved summary: ${summaryPath}`);
  }
}

export default KBEnhancementPipeline;
```


### LAYER D: USER FEEDBACK SYSTEM

**Purpose**: Capture and learn from explicit user feedback.

**File**: learning/user-feedback.ts

```typescript
/**
 * User Feedback System
 * 
 * Captures user feedback (thumbs up/down, edits, explicit ratings)
 * and uses it to improve agent responses over time.
 * 
 * In Braintrust: Stores to JSON files
 * In Copilot Studio: Stores to Dataverse
 */

import { LearningSystemConfig, UserFeedback, FeedbackAnalysis } from './types.js';
import { StorageInterface } from './storage/storage-interface.js';
import { JsonStorage } from './storage/json-storage.js';
import { DataverseStorage } from './storage/dataverse-storage.js';

export class UserFeedbackSystem {
  private config: LearningSystemConfig['userFeedback'];
  private storage: StorageInterface<UserFeedback> | null = null;

  constructor(config: LearningSystemConfig['userFeedback']) {
    this.config = config;
    this.initializeStorage();
  }

  /**
   * Initialize appropriate storage backend
   */
  private initializeStorage(): void {
    if (!this.config.enabled || this.config.storageBackend === 'none') {
      this.storage = null;
      return;
    }

    switch (this.config.storageBackend) {
      case 'json':
        this.storage = new JsonStorage<UserFeedback>(
          './learning-outputs/feedback/user-feedback.json'
        );
        break;
      case 'dataverse':
        this.storage = new DataverseStorage<UserFeedback>(
          this.config.dataverseTable || 'mpa_user_feedback'
        );
        break;
    }
  }

  /**
   * Check if system is available
   */
  isAvailable(): boolean {
    return this.config.enabled && this.storage !== null;
  }

  /**
   * Record thumbs up/down feedback
   */
  async recordThumbsFeedback(
    sessionId: string,
    turnId: string,
    userMessage: string,
    agentResponse: string,
    isPositive: boolean,
    metadata?: Record<string, unknown>
  ): Promise<boolean> {
    if (!this.isAvailable() || !this.config.feedbackTypes.includes('thumbs')) {
      return false;
    }

    const feedback: UserFeedback = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'thumbs',
      sessionId,
      turnId,
      userMessage,
      agentResponse,
      feedbackValue: isPositive ? 'positive' : 'negative',
      metadata: metadata || {},
      createdAt: new Date().toISOString(),
    };

    await this.storage!.save(feedback.id, feedback);
    return true;
  }

  /**
   * Record user edit to agent response
   */
  async recordEditFeedback(
    sessionId: string,
    turnId: string,
    userMessage: string,
    originalResponse: string,
    editedResponse: string,
    metadata?: Record<string, unknown>
  ): Promise<boolean> {
    if (!this.isAvailable() || !this.config.feedbackTypes.includes('edit')) {
      return false;
    }

    const feedback: UserFeedback = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'edit',
      sessionId,
      turnId,
      userMessage,
      agentResponse: originalResponse,
      editedResponse,
      feedbackValue: 'edit',
      metadata: metadata || {},
      createdAt: new Date().toISOString(),
    };

    await this.storage!.save(feedback.id, feedback);
    return true;
  }

  /**
   * Record explicit rating (1-5 stars)
   */
  async recordExplicitFeedback(
    sessionId: string,
    turnId: string,
    userMessage: string,
    agentResponse: string,
    rating: number,
    comment?: string,
    metadata?: Record<string, unknown>
  ): Promise<boolean> {
    if (!this.isAvailable() || !this.config.feedbackTypes.includes('explicit')) {
      return false;
    }

    const feedback: UserFeedback = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'explicit',
      sessionId,
      turnId,
      userMessage,
      agentResponse,
      feedbackValue: rating.toString(),
      comment,
      metadata: metadata || {},
      createdAt: new Date().toISOString(),
    };

    await this.storage!.save(feedback.id, feedback);
    return true;
  }

  /**
   * Analyze feedback to identify improvement opportunities
   */
  async analyzeFeedback(): Promise<FeedbackAnalysis> {
    if (!this.isAvailable()) {
      return {
        totalFeedback: 0,
        positiveRate: 0,
        negativePatterns: [],
        editPatterns: [],
        suggestions: [],
      };
    }

    const allFeedback = await this.storage!.list();

    // Calculate positive rate for thumbs feedback
    const thumbsFeedback = allFeedback.filter(f => f.type === 'thumbs');
    const positiveCount = thumbsFeedback.filter(f => f.feedbackValue === 'positive').length;
    const positiveRate = thumbsFeedback.length > 0 
      ? positiveCount / thumbsFeedback.length 
      : 0;

    // Collect negative examples for pattern analysis
    const negativeExamples = allFeedback
      .filter(f => f.feedbackValue === 'negative')
      .map(f => ({
        userMessage: f.userMessage,
        agentResponse: f.agentResponse,
      }));

    // Collect edit examples
    const editExamples = allFeedback
      .filter(f => f.type === 'edit' && f.editedResponse)
      .map(f => ({
        userMessage: f.userMessage,
        original: f.agentResponse,
        edited: f.editedResponse!,
      }));

    return {
      totalFeedback: allFeedback.length,
      positiveRate,
      negativePatterns: negativeExamples.slice(0, 10),
      editPatterns: editExamples.slice(0, 10),
      suggestions: [], // Would be populated by Claude analysis
    };
  }

  /**
   * Get recent negative feedback for KB enhancement pipeline
   */
  async getNegativeFeedback(limit: number = 20): Promise<UserFeedback[]> {
    if (!this.isAvailable()) {
      return [];
    }

    const allFeedback = await this.storage!.list();
    return allFeedback
      .filter(f => f.feedbackValue === 'negative' || f.type === 'edit')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

export default UserFeedbackSystem;
```


## STORAGE INTERFACE

**File**: learning/storage/storage-interface.ts

```typescript
/**
 * Abstract storage interface for learning system
 * 
 * Allows swapping between JSON files (development) and Dataverse (production)
 */

export interface StorageInterface<T> {
  /**
   * Save an item
   */
  save(id: string, item: T): Promise<void>;

  /**
   * Get an item by ID
   */
  get(id: string): Promise<T | null>;

  /**
   * List all items
   */
  list(): Promise<T[]>;

  /**
   * Delete an item
   */
  delete(id: string): Promise<boolean>;

  /**
   * Clear all items
   */
  clear(): Promise<void>;

  /**
   * Check if storage is available
   */
  isAvailable(): boolean;
}
```


**File**: learning/storage/json-storage.ts

```typescript
/**
 * JSON File Storage Backend
 * 
 * Simple file-based storage for development and testing.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { StorageInterface } from './storage-interface.js';

export class JsonStorage<T extends { id: string }> implements StorageInterface<T> {
  private filepath: string;
  private data: Map<string, T> = new Map();
  private loaded: boolean = false;

  constructor(filepath: string) {
    this.filepath = path.resolve(__dirname, '../..', filepath);
  }

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return;

    try {
      const dir = path.dirname(this.filepath);
      await fs.mkdir(dir, { recursive: true });

      const content = await fs.readFile(this.filepath, 'utf-8');
      const items: T[] = JSON.parse(content);
      this.data = new Map(items.map(item => [item.id, item]));
    } catch {
      // File doesn't exist yet, start with empty
      this.data = new Map();
    }

    this.loaded = true;
  }

  private async persist(): Promise<void> {
    const items = Array.from(this.data.values());
    const dir = path.dirname(this.filepath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.filepath, JSON.stringify(items, null, 2));
  }

  async save(id: string, item: T): Promise<void> {
    await this.ensureLoaded();
    this.data.set(id, item);
    await this.persist();
  }

  async get(id: string): Promise<T | null> {
    await this.ensureLoaded();
    return this.data.get(id) || null;
  }

  async list(): Promise<T[]> {
    await this.ensureLoaded();
    return Array.from(this.data.values());
  }

  async delete(id: string): Promise<boolean> {
    await this.ensureLoaded();
    const existed = this.data.delete(id);
    if (existed) {
      await this.persist();
    }
    return existed;
  }

  async clear(): Promise<void> {
    this.data = new Map();
    await this.persist();
  }

  isAvailable(): boolean {
    return true; // JSON storage is always available
  }
}
```


**File**: learning/storage/dataverse-storage.ts

```typescript
/**
 * Dataverse Storage Backend (Stub)
 * 
 * For Copilot Studio production deployment.
 * This is a stub - actual implementation will use Power Automate flows.
 */

import { StorageInterface } from './storage-interface.js';

export class DataverseStorage<T extends { id: string }> implements StorageInterface<T> {
  private tableName: string;
  private available: boolean = false;

  constructor(tableName: string) {
    this.tableName = tableName;
    // In production, this would check for Dataverse connection
    this.available = false;
  }

  async save(id: string, item: T): Promise<void> {
    if (!this.available) {
      console.warn(`DataverseStorage: Not available, skipping save to ${this.tableName}`);
      return;
    }
    // TODO: Implement via Power Automate HTTP action
    throw new Error('DataverseStorage not implemented');
  }

  async get(id: string): Promise<T | null> {
    if (!this.available) {
      return null;
    }
    // TODO: Implement via Power Automate HTTP action
    throw new Error('DataverseStorage not implemented');
  }

  async list(): Promise<T[]> {
    if (!this.available) {
      return [];
    }
    // TODO: Implement via Power Automate HTTP action
    throw new Error('DataverseStorage not implemented');
  }

  async delete(id: string): Promise<boolean> {
    if (!this.available) {
      return false;
    }
    // TODO: Implement via Power Automate HTTP action
    throw new Error('DataverseStorage not implemented');
  }

  async clear(): Promise<void> {
    if (!this.available) {
      return;
    }
    // TODO: Implement via Power Automate HTTP action
    throw new Error('DataverseStorage not implemented');
  }

  isAvailable(): boolean {
    return this.available;
  }

  /**
   * Set availability (called after verifying Dataverse connection)
   */
  setAvailable(available: boolean): void {
    this.available = available;
  }
}
```


## TYPE DEFINITIONS

**File**: learning/types.ts

```typescript
/**
 * Learning System Type Definitions
 */

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface LearningSystemConfig {
  selfCritique: {
    enabled: boolean;
    model: string;
    maxRevisions: number;
    criteriaToCheck: string[];
  };
  
  successPatterns: {
    enabled: boolean;
    storageBackend: 'json' | 'dataverse' | 'none';
    minScoreThreshold: number;
    maxPatternsToRetrieve: number;
    patternFilePath?: string;
    dataverseTable?: string;
  };
  
  kbEnhancement: {
    enabled: boolean;
    autoApply: boolean;
    outputDirectory: string;
    minGapThreshold: number;
  };
  
  userFeedback: {
    enabled: boolean;
    storageBackend: 'json' | 'dataverse' | 'none';
    feedbackTypes: ('thumbs' | 'edit' | 'explicit')[];
    dataverseTable?: string;
  };
}

// ============================================================================
// SELF-CRITIQUE TYPES
// ============================================================================

export interface CritiqueContext {
  userMessage: string;
  currentStep: number;
  toolsUsed: string[];
  conversationHistory?: string;
}

export interface CritiqueResult {
  originalResponse: string;
  revisedResponse: string;
  wasRevised: boolean;
  checks: CriteriaCheck[];
  latencyMs: number;
}

export interface CriteriaCheck {
  criterion: string;
  passed: boolean;
  issue: string | null;
}

export interface CritiqueStats {
  totalCritiques: number;
  revisionsTriggered: number;
  criteriaFailures: Record<string, number>;
}

// ============================================================================
// SUCCESS PATTERN TYPES
// ============================================================================

export interface SuccessPattern {
  id: string;
  scenario: string;
  userMessage: string;
  agentResponse: string;
  scores: Record<string, number>;
  compositeScore: number;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface PatternSearchResult {
  pattern: SuccessPattern;
  similarityScore: number;
}

// ============================================================================
// KB ENHANCEMENT TYPES
// ============================================================================

export interface ScoringGap {
  scorer: string;
  averageScore: number;
  failingScenarios: string[];
  sampleCount: number;
}

export interface KBEnhancementSuggestion {
  scorer: string;
  currentScore: number;
  targetScore: number;
  failurePatterns: string[];
  suggestedContent: string;
  affectedScenarios: string[];
  generatedAt: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'applied';
}

export interface EvalResultSummary {
  scenario: string;
  scores: Record<string, number>;
  compositeScore: number;
  sampleTurn?: {
    userMessage: string;
    agentResponse: string;
  };
}

// ============================================================================
// USER FEEDBACK TYPES
// ============================================================================

export interface UserFeedback {
  id: string;
  type: 'thumbs' | 'edit' | 'explicit';
  sessionId: string;
  turnId: string;
  userMessage: string;
  agentResponse: string;
  editedResponse?: string;
  feedbackValue: string;
  comment?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface FeedbackAnalysis {
  totalFeedback: number;
  positiveRate: number;
  negativePatterns: Array<{ userMessage: string; agentResponse: string }>;
  editPatterns: Array<{ userMessage: string; original: string; edited: string }>;
  suggestions: string[];
}
```


## INTEGRATION WITH CONVERSATION ENGINE

**Modifications to**: conversation-engine.ts

```typescript
// Add imports
import { 
  SelfCritiqueSystem,
  SuccessPatternSystem,
  UserFeedbackSystem,
  LearningSystemConfig,
  DEFAULT_LEARNING_CONFIG,
} from './learning/index.js';

// Add to ConversationEngine class
class ConversationEngine {
  // ... existing properties ...
  
  // Learning system components
  private learningConfig: LearningSystemConfig;
  private selfCritique: SelfCritiqueSystem | null = null;
  private successPatterns: SuccessPatternSystem | null = null;
  private userFeedback: UserFeedbackSystem | null = null;

  constructor(config: Partial<ConversationEngineConfig> = {}) {
    // ... existing initialization ...
    
    // Initialize learning system
    this.learningConfig = config.learning || DEFAULT_LEARNING_CONFIG;
    this.initializeLearningSystem();
  }

  private initializeLearningSystem(): void {
    // Layer C: Self-Critique (always available if enabled)
    if (this.learningConfig.selfCritique.enabled) {
      this.selfCritique = new SelfCritiqueSystem(
        this.anthropic,
        this.learningConfig.selfCritique
      );
    }

    // Layer B: Success Patterns (requires embedding service from RAG)
    if (this.learningConfig.successPatterns.enabled && 
        this.learningConfig.successPatterns.storageBackend !== 'none') {
      // Will be initialized after RAG engine is ready
      // See initializeSuccessPatterns() below
    }

    // Layer D: User Feedback
    if (this.learningConfig.userFeedback.enabled &&
        this.learningConfig.userFeedback.storageBackend !== 'none') {
      this.userFeedback = new UserFeedbackSystem(this.learningConfig.userFeedback);
    }
  }

  private async initializeSuccessPatterns(): Promise<void> {
    if (!this.learningConfig.successPatterns.enabled) return;
    if (this.learningConfig.successPatterns.storageBackend === 'none') return;
    
    // Reuse embedding service from RAG system
    if (this.ragEngine && this.ragEngine.isInitialized()) {
      this.successPatterns = new SuccessPatternSystem(
        this.learningConfig.successPatterns,
        // @ts-ignore - access internal embedding service
        this.ragEngine.embeddingService
      );
    }
  }

  // Modified getAgentResponse - add self-critique
  private async getAgentResponse(
    systemPrompt: string,
    messageHistory: Anthropic.MessageParam[],
    kbContent: string
  ): Promise<AgentResponseResult> {
    // Get few-shot examples if available
    let enhancedPrompt = systemPrompt;
    if (this.successPatterns && messageHistory.length > 0) {
      const lastUserMsg = this.getLastUserMessage(messageHistory);
      if (lastUserMsg) {
        const patterns = await this.successPatterns.getSimilarPatterns(lastUserMsg);
        if (patterns.length > 0) {
          enhancedPrompt += '\n' + this.successPatterns.formatAsExamples(patterns);
        }
      }
    }

    // Get response (with RAG tools if enabled)
    let result = await this._getAgentResponseWithRAG(enhancedPrompt, messageHistory, kbContent);

    // Apply self-critique if enabled
    if (this.selfCritique && result.response) {
      const critiqueResult = await this.selfCritique.critique(result.response, {
        userMessage: this.getLastUserMessage(messageHistory) || '',
        currentStep: this.stepTracker.getCurrentStep(),
        toolsUsed: result.citations || [],
      });

      if (critiqueResult.wasRevised) {
        console.log(`Self-critique revised response (${critiqueResult.checks.filter(c => !c.passed).map(c => c.criterion).join(', ')})`);
        result.response = critiqueResult.revisedResponse;
        result.wasRevised = true;
        result.critiqueLatencyMs = critiqueResult.latencyMs;
      }
    }

    return result;
  }

  private getLastUserMessage(history: Anthropic.MessageParam[]): string | null {
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === 'user') {
        const content = history[i].content;
        if (typeof content === 'string') return content;
        if (Array.isArray(content)) {
          const textBlock = content.find(b => b.type === 'text');
          if (textBlock && 'text' in textBlock) return textBlock.text;
        }
      }
    }
    return null;
  }

  // Add method to store successful patterns after eval
  async storeSuccessfulResult(result: ConversationResult): Promise<void> {
    if (!this.successPatterns) return;

    // Store high-scoring turns
    for (const turn of result.turns) {
      if (result.aggregateScore >= this.learningConfig.successPatterns.minScoreThreshold) {
        await this.successPatterns.storePattern(
          result.scenario,
          turn.userMessage,
          turn.agentResponse,
          result.scores,
          result.aggregateScore,
          { step: turn.step }
        );
      }
    }
  }
}
```


## COPILOT STUDIO CONSIDERATIONS

For Copilot Studio deployment, these layers map to platform features:

| Layer | Braintrust | Copilot Studio |
|-------|------------|----------------|
| **C: Self-Critique** | In conversation-engine | Topic with "AI Builder" action |
| **B: Success Patterns** | JSON files | Dataverse table + Power Automate |
| **D: User Feedback** | JSON files | Dataverse table + adaptive card |
| **A: KB Enhancement** | Offline script | Power Automate scheduled flow |

### Copilot Studio Implementation Notes

**Self-Critique in Copilot Studio:**
```
Topic: "Response Quality Check"
Trigger: After every agent response
Action: 
  1. Call Power Automate flow "CritiqueResponse"
  2. Flow calls Azure OpenAI with critique prompt
  3. If revision needed, replace response variable
```

**User Feedback in Copilot Studio:**
```
Topic: "Collect Feedback"
Trigger: End of conversation OR explicit feedback request
Action:
  1. Show adaptive card with thumbs up/down
  2. On selection, call Power Automate flow "StoreFeedback"
  3. Flow writes to Dataverse mpa_user_feedback table
```

**Dataverse Tables for Learning:**
```
mpa_success_patterns
- id (GUID)
- scenario (text)
- user_message (text)
- agent_response (text)
- scores (JSON)
- composite_score (decimal)
- created_at (datetime)

mpa_user_feedback
- id (GUID)
- type (choice: thumbs/edit/explicit)
- session_id (text)
- user_message (text)
- agent_response (text)
- edited_response (text, nullable)
- feedback_value (text)
- created_at (datetime)
```


## TESTING

**File**: learning/test-learning.ts

```typescript
/**
 * Learning System Test Suite
 */

import Anthropic from '@anthropic-ai/sdk';
import { SelfCritiqueSystem } from './self-critique.js';
import { SuccessPatternSystem } from './success-patterns.js';
import { KBEnhancementPipeline } from './kb-enhancement-pipeline.js';
import { DEFAULT_LEARNING_CONFIG } from './index.js';
import { EmbeddingService } from '../rag/embedding-service.js';

async function runTests() {
  console.log('=== Learning System Tests ===\n');
  
  const anthropic = new Anthropic();
  let passed = 0;
  let failed = 0;

  // Test 1: Self-Critique detects missing citation
  console.log('Test 1: Self-Critique - Missing Citation');
  const critique = new SelfCritiqueSystem(anthropic, DEFAULT_LEARNING_CONFIG.selfCritique);
  
  const result1 = await critique.critique(
    'Typical ecommerce CAC runs $25-45. What channels are you considering?',
    {
      userMessage: 'What is a good CAC for ecommerce?',
      currentStep: 2,
      toolsUsed: ['get_benchmark'],
    }
  );
  
  if (result1.wasRevised && result1.revisedResponse.includes('Based on Knowledge Base')) {
    console.log('✅ PASSED - Added citation');
    passed++;
  } else {
    console.log('❌ FAILED - Did not add citation');
    console.log(`  Original: ${result1.originalResponse}`);
    console.log(`  Revised: ${result1.revisedResponse}`);
    failed++;
  }

  // Test 2: Self-Critique detects undefined acronym
  console.log('\nTest 2: Self-Critique - Undefined Acronym');
  const result2 = await critique.critique(
    'Your CAC target of $30 is reasonable for ecommerce.',
    {
      userMessage: 'Is $30 CAC good?',
      currentStep: 2,
      toolsUsed: [],
    }
  );
  
  if (result2.wasRevised && result2.revisedResponse.toLowerCase().includes('cost')) {
    console.log('✅ PASSED - Defined acronym');
    passed++;
  } else {
    console.log('❌ FAILED - Did not define acronym');
    failed++;
  }

  // Test 3: Self-Critique passes good response
  console.log('\nTest 3: Self-Critique - Good Response Unchanged');
  const result3 = await critique.critique(
    'Based on Knowledge Base, your cost per acquisition (CAC) target of $30 is reasonable.',
    {
      userMessage: 'Is $30 CAC good?',
      currentStep: 2,
      toolsUsed: ['get_benchmark'],
    }
  );
  
  if (!result3.wasRevised) {
    console.log('✅ PASSED - Good response unchanged');
    passed++;
  } else {
    console.log('❌ FAILED - Unnecessarily revised');
    failed++;
  }

  // Test 4: Success Patterns storage and retrieval
  console.log('\nTest 4: Success Patterns - Store and Retrieve');
  const embeddings = new EmbeddingService();
  await embeddings.initialize([{ content: 'test', id: 'test' }] as any);
  
  const patterns = new SuccessPatternSystem(
    { ...DEFAULT_LEARNING_CONFIG.successPatterns, enabled: true, storageBackend: 'json' },
    embeddings
  );
  
  await patterns.clearPatterns();
  await patterns.storePattern(
    'test-scenario',
    'What is a good CAC?',
    'Based on Knowledge Base, typical CAC is $25-45.',
    { 'source-citation': 1.0 },
    0.96
  );
  
  const retrieved = await patterns.getSimilarPatterns('What CAC should I target?');
  
  if (retrieved.length > 0 && retrieved[0].pattern.scenario === 'test-scenario') {
    console.log('✅ PASSED - Pattern stored and retrieved');
    passed++;
  } else {
    console.log('❌ FAILED - Pattern not retrieved');
    failed++;
  }

  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`Passed: ${passed}/${passed + failed}`);
  console.log(`Failed: ${failed}/${passed + failed}`);
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
```


## IMPLEMENTATION ORDER

1. **Phase 1**: Create learning/ directory and types.ts
2. **Phase 2**: Implement storage interface and JSON backend
3. **Phase 3**: Implement self-critique system (Layer C)
4. **Phase 4**: Implement success patterns system (Layer B)
5. **Phase 5**: Implement KB enhancement pipeline (Layer A)
6. **Phase 6**: Implement user feedback system (Layer D)
7. **Phase 7**: Integrate with conversation-engine.ts
8. **Phase 8**: Run tests and validate
9. **Phase 9**: Run eval with learning enabled


## SUCCESS CRITERIA

- [ ] Self-critique catches >80% of citation issues in test cases
- [ ] Self-critique adds <300ms average latency
- [ ] Success patterns store and retrieve correctly
- [ ] KB enhancement generates valid suggestions
- [ ] All systems gracefully degrade when storage unavailable
- [ ] Composite score improves +3-5% with self-critique enabled
- [ ] No regressions >2% on any scorer
