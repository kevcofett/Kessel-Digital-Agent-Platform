/**
 * Agent Configuration Types
 * Shared types for agent configurations
 */

/**
 * Feedback trigger patterns for detecting user feedback in natural conversation
 */
export interface FeedbackTriggers {
  /** Phrases indicating positive feedback */
  positive: string[];
  /** Phrases indicating negative feedback */
  negative: string[];
  /** Phrases indicating user is correcting the agent */
  correction: string[];
}

/**
 * Knowledge base configuration
 */
export interface KBConfig {
  /** Base path to KB files */
  basePath: string;
  /** File pattern for KB files (e.g., '*.txt') */
  filePattern: string;
  /** Categories of KB files */
  categories: string[];
}

/**
 * Pathway configuration
 */
export interface PathwayConfig {
  /** Description of the pathway */
  description: string;
  /** Default steps/stages for this pathway */
  defaultSteps?: (string | number)[];
  /** Maximum conversation turns allowed */
  maxTurns: number;
}

/**
 * Self-critique configuration
 */
export interface SelfCritiqueConfig {
  /** Whether self-critique is enabled */
  enabled: boolean;
  /** Criteria to evaluate */
  criteria: string[];
  /** Minimum score threshold to pass */
  minScoreThreshold: number;
}

/**
 * Success pattern storage configuration
 */
export interface SuccessPatternConfig {
  /** Whether pattern storage is enabled */
  enabled: boolean;
  /** Minimum composite score required to store a pattern */
  minCompositeScore: number;
  /** Scenario categories for patterns */
  scenarios: string[];
}

/**
 * Routing configuration for orchestrator agents
 */
export interface RoutingConfig {
  /** Default agent to route to (null requires explicit routing) */
  defaultAgent: string | null;
  /** Agent-specific routing rules */
  agents: {
    [agentId: string]: {
      /** Trigger phrases for this agent */
      triggers: string[];
      /** Description of what this agent handles */
      description: string;
    };
  };
}

/**
 * Complete agent configuration
 */
export interface AgentConfig {
  /** Unique agent identifier */
  id: string;
  /** Display name */
  name: string;
  /** Version string */
  version: string;
  /** Agent description */
  description: string;
  /** Dataverse agent type code */
  agentTypeCode: number;
  /** Feedback trigger configuration */
  feedbackTriggers: FeedbackTriggers;
  /** Knowledge base configuration */
  kb: KBConfig;
  /** Pathway configurations */
  pathways: {
    EXPRESS: PathwayConfig;
    GUIDED: PathwayConfig;
    STANDARD: PathwayConfig;
  };
  /** Self-critique configuration */
  selfCritique: SelfCritiqueConfig;
  /** Success pattern configuration */
  successPatterns: SuccessPatternConfig;
  /** Optional routing configuration (for orchestrator agents) */
  routing?: RoutingConfig;
}

/**
 * Feedback detection result
 */
export interface FeedbackDetection {
  /** Whether feedback was detected */
  detected: boolean;
  /** Type of feedback if detected */
  type?: 'POSITIVE' | 'NEGATIVE' | 'CORRECTION' | 'NEUTRAL';
  /** Confidence score (0-1) */
  confidence: number;
  /** Matched trigger phrase */
  matchedPhrase?: string;
}

/**
 * Detect feedback from user message using trigger patterns
 */
export function detectFeedback(
  message: string,
  triggers: FeedbackTriggers
): FeedbackDetection {
  const lowerMessage = message.toLowerCase();

  // Check positive triggers
  for (const phrase of triggers.positive) {
    if (lowerMessage.includes(phrase.toLowerCase())) {
      return {
        detected: true,
        type: 'POSITIVE',
        confidence: 0.85,
        matchedPhrase: phrase
      };
    }
  }

  // Check negative triggers
  for (const phrase of triggers.negative) {
    if (lowerMessage.includes(phrase.toLowerCase())) {
      return {
        detected: true,
        type: 'NEGATIVE',
        confidence: 0.85,
        matchedPhrase: phrase
      };
    }
  }

  // Check correction triggers
  for (const phrase of triggers.correction) {
    if (lowerMessage.includes(phrase.toLowerCase())) {
      return {
        detected: true,
        type: 'CORRECTION',
        confidence: 0.75,
        matchedPhrase: phrase
      };
    }
  }

  return {
    detected: false,
    confidence: 0
  };
}
