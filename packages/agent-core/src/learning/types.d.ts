/**
 * Self-Learning System Types
 *
 * Types for the continuous learning system that enables agents
 * to improve over time through self-critique, success patterns,
 * and knowledge base enhancement.
 */
/**
 * Critique of a single agent response
 */
export interface ResponseCritique {
    /**
     * Unique ID for this critique
     */
    id: string;
    /**
     * Timestamp of the critique
     */
    timestamp: Date;
    /**
     * The original user query
     */
    userQuery: string;
    /**
     * The agent's response being critiqued
     */
    agentResponse: string;
    /**
     * Overall quality score (0-1)
     */
    overallScore: number;
    /**
     * Breakdown of scores by dimension
     */
    dimensions: CritiqueDimension[];
    /**
     * Specific issues identified
     */
    issues: CritiqueIssue[];
    /**
     * Suggested improvements
     */
    suggestions: string[];
    /**
     * Whether this response should be used as a positive example
     */
    isExemplary: boolean;
    /**
     * Metadata about the conversation context
     */
    metadata: CritiqueMetadata;
}
/**
 * A scored dimension in the critique
 */
export interface CritiqueDimension {
    name: string;
    score: number;
    weight: number;
    feedback: string;
}
/**
 * A specific issue identified in the response
 */
export interface CritiqueIssue {
    type: 'accuracy' | 'completeness' | 'clarity' | 'citation' | 'calculation' | 'other';
    severity: 'minor' | 'moderate' | 'major';
    description: string;
    location?: string;
    suggestedFix?: string;
}
/**
 * Metadata about the critique context
 */
export interface CritiqueMetadata {
    conversationId: string;
    turnNumber: number;
    step?: number;
    topic?: string;
    ragQueriesUsed?: number;
    citationsProvided?: number;
}
/**
 * A successful interaction pattern extracted from exemplary responses
 */
export interface SuccessPattern {
    /**
     * Unique ID for this pattern
     */
    id: string;
    /**
     * When the pattern was identified
     */
    createdAt: Date;
    /**
     * When the pattern was last reinforced
     */
    lastReinforcedAt: Date;
    /**
     * Number of times this pattern has been observed
     */
    observationCount: number;
    /**
     * The type of interaction this pattern applies to
     */
    patternType: PatternType;
    /**
     * Natural language description of what makes this effective
     */
    description: string;
    /**
     * The query/scenario this pattern addresses
     */
    triggerConditions: string[];
    /**
     * Key elements that make the response effective
     */
    responseElements: ResponseElement[];
    /**
     * Example snippets demonstrating the pattern
     */
    examples: PatternExample[];
    /**
     * Average score across observations
     */
    averageScore: number;
    /**
     * Confidence in this pattern (based on observation count and score consistency)
     */
    confidence: number;
    /**
     * Tags for categorization
     */
    tags: string[];
}
export type PatternType = 'calculation_request' | 'benchmark_query' | 'clarification_response' | 'recommendation' | 'error_handling' | 'step_guidance' | 'synthesis' | 'other';
/**
 * An element of an effective response
 */
export interface ResponseElement {
    type: 'structure' | 'content' | 'tone' | 'citation' | 'calculation';
    description: string;
    importance: 'critical' | 'important' | 'helpful';
}
/**
 * An example demonstrating a pattern
 */
export interface PatternExample {
    query: string;
    responseSnippet: string;
    score: number;
    critiqueId: string;
}
/**
 * A proposed enhancement to the knowledge base
 */
export interface KBEnhancement {
    /**
     * Unique ID
     */
    id: string;
    /**
     * When identified
     */
    createdAt: Date;
    /**
     * Type of enhancement
     */
    type: EnhancementType;
    /**
     * Priority (1-5, with 1 being highest)
     */
    priority: number;
    /**
     * Current status
     */
    status: EnhancementStatus;
    /**
     * The gap or issue this addresses
     */
    description: string;
    /**
     * Evidence supporting this enhancement
     */
    evidence: EnhancementEvidence[];
    /**
     * Proposed content or changes
     */
    proposedContent: string;
    /**
     * Target location in KB (document/section)
     */
    targetLocation?: string;
    /**
     * Impact assessment
     */
    impactAssessment: ImpactAssessment;
}
export type EnhancementType = 'missing_content' | 'outdated_content' | 'unclear_content' | 'missing_example' | 'benchmark_update' | 'new_topic';
export type EnhancementStatus = 'identified' | 'validated' | 'in_progress' | 'pending_review' | 'approved' | 'rejected' | 'implemented';
/**
 * Evidence supporting a KB enhancement
 */
export interface EnhancementEvidence {
    type: 'failed_query' | 'low_score_response' | 'user_feedback' | 'repeated_gap';
    description: string;
    timestamp: Date;
    conversationId?: string;
}
/**
 * Assessment of enhancement impact
 */
export interface ImpactAssessment {
    estimatedQueryCoverage: number;
    criticalityLevel: 'low' | 'medium' | 'high';
    affectedTopics: string[];
    effort: 'minimal' | 'moderate' | 'significant';
}
/**
 * Explicit feedback from users on agent responses
 */
export interface UserFeedback {
    id: string;
    timestamp: Date;
    conversationId: string;
    turnNumber: number;
    feedbackType: 'positive' | 'negative' | 'correction' | 'suggestion';
    rating?: number;
    comment?: string;
    correctedContent?: string;
    agentResponseId?: string;
}
/**
 * Summary of a learning session (batch processing)
 */
export interface LearningSessionSummary {
    sessionId: string;
    startedAt: Date;
    completedAt: Date;
    conversationsAnalyzed: number;
    critiquesGenerated: number;
    patternsIdentified: number;
    patternsReinforced: number;
    enhancementsProposed: number;
    overallHealthScore: number;
    insights: string[];
}
/**
 * Configuration for the self-learning system
 */
export interface LearningConfig {
    /**
     * Minimum score for a response to be considered exemplary
     */
    exemplaryThreshold: number;
    /**
     * Minimum observation count to consider a pattern reliable
     */
    minPatternObservations: number;
    /**
     * Weights for critique dimensions
     */
    critiqueDimensionWeights: Record<string, number>;
    /**
     * Whether to enable automatic KB enhancement proposals
     */
    enableAutoEnhancement: boolean;
    /**
     * Maximum age (days) for patterns before they decay
     */
    patternDecayDays: number;
}
/**
 * Default learning configuration
 */
export declare const DEFAULT_LEARNING_CONFIG: LearningConfig;
//# sourceMappingURL=types.d.ts.map