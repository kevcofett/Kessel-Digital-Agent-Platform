/**
 * Data Quality Scorers - Tests adherence to data quality hierarchy
 *
 * The MPA has a defined data hierarchy for prioritizing information sources:
 * 1. Direct API data (highest priority)
 * 2. Web research from credible sources
 * 3. User provided data
 * 4. KB benchmarks
 * 5. Agent estimates (lowest priority - must be labeled clearly)
 *
 * These scorers verify the agent:
 * - Uses the correct data source for each context
 * - Labels data sources correctly
 * - Doesn't claim higher-priority sources when using lower ones
 * - Recommends validation for estimates
 */

import Anthropic from "@anthropic-ai/sdk";

/**
 * Data source types in priority order (highest to lowest)
 */
export enum DataSourcePriority {
  API_DATA = 1,
  WEB_RESEARCH = 2,
  USER_PROVIDED = 3,
  KB_BENCHMARK = 4,
  AGENT_ESTIMATE = 5,
}

/**
 * Patterns to detect data source claims
 */
const DATA_SOURCE_PATTERNS = {
  api: [
    /(?:api|direct|real.?time).*(?:data|fetch|retrieve)/i,
    /(?:pull|get).*(?:from|via).*api/i,
  ],
  webResearch: [
    /(?:based on|from).*(?:web|search|research)/i,
    /(?:according to|per).*(?:recent|2024|2025|2026)/i,
    /(?:source|cite).*(?:website|article|report)/i,
  ],
  userProvided: [
    /(?:you|user).*(?:said|mentioned|provided|told)/i,
    /(?:based on|from).*(?:your|input|data you)/i,
  ],
  kbBenchmark: [
    /(?:kb|knowledge base|benchmark)/i,
    /(?:industry|typical|average).*(?:benchmark|standard)/i,
    /(?:based on|per).*(?:kb|industry data)/i,
  ],
  estimate: [
    /(?:my|i|i'm|agent).*(?:estimate|assumption|guess)/i,
    /(?:estimate|assumption|model).*(?:based on|using)/i,
    /(?:recommend|should).*(?:validat|verify|confirm)/i,
  ],
};

/**
 * Score data source attribution - does agent correctly attribute data?
 */
export function scoreDataSourceAttribution(
  agentResponse: string,
  expectedSource?: DataSourcePriority
): { score: number; metadata: Record<string, unknown> } {
  const detectedSources: string[] = [];
  let highestPriorityDetected: DataSourcePriority | null = null;

  // Check for each source type
  for (const pattern of DATA_SOURCE_PATTERNS.api) {
    if (pattern.test(agentResponse)) {
      detectedSources.push("api");
      if (!highestPriorityDetected || DataSourcePriority.API_DATA < highestPriorityDetected) {
        highestPriorityDetected = DataSourcePriority.API_DATA;
      }
    }
  }

  for (const pattern of DATA_SOURCE_PATTERNS.webResearch) {
    if (pattern.test(agentResponse)) {
      detectedSources.push("web_research");
      if (!highestPriorityDetected || DataSourcePriority.WEB_RESEARCH < highestPriorityDetected) {
        highestPriorityDetected = DataSourcePriority.WEB_RESEARCH;
      }
    }
  }

  for (const pattern of DATA_SOURCE_PATTERNS.userProvided) {
    if (pattern.test(agentResponse)) {
      detectedSources.push("user_provided");
      if (!highestPriorityDetected || DataSourcePriority.USER_PROVIDED < highestPriorityDetected) {
        highestPriorityDetected = DataSourcePriority.USER_PROVIDED;
      }
    }
  }

  for (const pattern of DATA_SOURCE_PATTERNS.kbBenchmark) {
    if (pattern.test(agentResponse)) {
      detectedSources.push("kb_benchmark");
      if (!highestPriorityDetected || DataSourcePriority.KB_BENCHMARK < highestPriorityDetected) {
        highestPriorityDetected = DataSourcePriority.KB_BENCHMARK;
      }
    }
  }

  for (const pattern of DATA_SOURCE_PATTERNS.estimate) {
    if (pattern.test(agentResponse)) {
      detectedSources.push("estimate");
      if (!highestPriorityDetected || DataSourcePriority.AGENT_ESTIMATE < highestPriorityDetected) {
        highestPriorityDetected = DataSourcePriority.AGENT_ESTIMATE;
      }
    }
  }

  // Calculate score based on attribution presence
  let score = 0;

  if (detectedSources.length > 0) {
    // Agent attributed at least one source
    score += 0.5;

    // Bonus for multiple attributions (shows thoroughness)
    if (detectedSources.length >= 2) {
      score += 0.2;
    }

    // Check if expected source matches (if provided)
    if (expectedSource && highestPriorityDetected === expectedSource) {
      score += 0.3;
    } else if (!expectedSource) {
      // No expected source, just reward attribution
      score += 0.3;
    }
  }

  return {
    score: Math.min(1, score),
    metadata: {
      detectedSources,
      highestPriorityDetected,
      expectedSource,
      hasAttribution: detectedSources.length > 0,
    },
  };
}

/**
 * Score estimate labeling - does agent clearly label estimates?
 */
export function scoreEstimateLabeling(agentResponse: string): {
  score: number;
  metadata: Record<string, unknown>;
} {
  // Patterns that indicate an estimate is being made
  const estimateIndicators = [
    /(?:approximately|roughly|about|around|~)\s*\$?\d/i,
    /(?:likely|probably|estimate|project|expect)/i,
    /(?:assume|assumption|model|forecast)/i,
    /(?:range|between).*(?:and|to)/i,
  ];

  // Patterns that properly label estimates
  const properLabeling = [
    /(?:my|i|agent).*(?:estimate|assumption)/i,
    /(?:estimate|assumption|model|forecast).*(?:based on|using)/i,
    /(?:recommend|should|would).*(?:validat|verify|confirm)/i,
    /(?:this is|these are).*(?:estimate|assumption|rough|approximate)/i,
    /(?:note|caveat|important):.*(?:estimate|assumption)/i,
  ];

  const hasEstimate = estimateIndicators.some((p) => p.test(agentResponse));
  const hasProperLabeling = properLabeling.some((p) => p.test(agentResponse));

  let score = 1.0;

  if (hasEstimate) {
    if (!hasProperLabeling) {
      // Estimate present but not properly labeled - major deduction
      score = 0.3;
    } else {
      // Properly labeled estimate
      score = 1.0;
    }
  }

  return {
    score,
    metadata: {
      hasEstimate,
      hasProperLabeling,
      status: hasEstimate
        ? hasProperLabeling
          ? "properly_labeled"
          : "unlabeled_estimate"
        : "no_estimate",
    },
  };
}

/**
 * Score validation recommendation - does agent recommend validation for estimates?
 */
export function scoreValidationRecommendation(agentResponse: string): {
  score: number;
  metadata: Record<string, unknown>;
} {
  const estimateIndicators = [
    /(?:my|i|agent).*(?:estimate|assumption)/i,
    /(?:assume|assumption|model)/i,
  ];

  const validationRecommendations = [
    /(?:recommend|should|would).*(?:validat|verify|confirm|check)/i,
    /(?:you|user).*(?:can|may|might|should).*(?:refine|adjust|update|correct)/i,
    /(?:feel free|you're welcome).*(?:refine|adjust|correct)/i,
    /(?:later|anytime|when you have).*(?:refine|adjust|update)/i,
  ];

  const hasEstimate = estimateIndicators.some((p) => p.test(agentResponse));
  const hasValidationRec = validationRecommendations.some((p) => p.test(agentResponse));

  let score = 1.0;

  if (hasEstimate) {
    if (!hasValidationRec) {
      // Estimate without validation recommendation
      score = 0.5;
    }
  }

  return {
    score,
    metadata: {
      hasEstimate,
      hasValidationRecommendation: hasValidationRec,
      status: hasEstimate
        ? hasValidationRec
          ? "validation_recommended"
          : "no_validation_recommendation"
        : "no_estimate",
    },
  };
}

/**
 * Score data hierarchy adherence - does agent use highest available source?
 *
 * This is an LLM-as-judge scorer that evaluates whether the agent
 * appropriately used the data hierarchy given the context.
 */
export async function scoreDataHierarchyAdherence(
  userMessage: string,
  agentResponse: string,
  availableData: {
    hasApiData?: boolean;
    hasWebSearchAvailable?: boolean;
    hasUserData?: boolean;
    hasKBData?: boolean;
  }
): Promise<{ score: number; metadata: Record<string, unknown> }> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const prompt = `You are evaluating whether an AI agent correctly followed the data quality hierarchy.

DATA QUALITY HIERARCHY (highest to lowest priority):
1. Direct API data - Real-time, authoritative data from APIs
2. Web research - Recent information from credible sources
3. User provided data - Information the user has shared
4. KB benchmarks - Industry benchmarks from knowledge base
5. Agent estimates - Agent's own estimates (must be labeled, validation recommended)

CONTEXT:
Available data sources in this conversation:
- API data available: ${availableData.hasApiData ? "Yes" : "No"}
- Web search available: ${availableData.hasWebSearchAvailable ? "Yes" : "No"}
- User data provided: ${availableData.hasUserData ? "Yes" : "No"}
- KB benchmarks available: ${availableData.hasKBData ? "Yes" : "No"}

USER MESSAGE: "${userMessage}"

AGENT RESPONSE: "${agentResponse}"

EVALUATION CRITERIA:
- Did the agent use the highest-priority source available?
- Did the agent correctly attribute the data source?
- If using estimates, did the agent label them clearly and recommend validation?
- Did the agent avoid claiming a higher-priority source when using a lower one?

Score A-F where:
A = Perfect hierarchy adherence, correct attribution, appropriate source use
B = Good adherence with minor attribution gaps
C = Used appropriate source but attribution unclear
D = Used lower-priority source when higher was available
F = Misattributed sources or violated hierarchy significantly

Reply with ONLY a single letter: A, B, C, D, or F`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 10,
      messages: [{ role: "user", content: prompt }],
    });

    const letter = (response.content[0] as Anthropic.TextBlock).text.trim().toUpperCase();
    const scores: Record<string, number> = { A: 1.0, B: 0.8, C: 0.6, D: 0.3, F: 0 };

    return {
      score: scores[letter] ?? 0.5,
      metadata: { grade: letter, availableData },
    };
  } catch (error) {
    return {
      score: 0.5,
      metadata: { error: "LLM scoring failed", availableData },
    };
  }
}

/**
 * Combined data quality score
 */
export function calculateDataQualityScore(scores: {
  sourceAttribution: number;
  estimateLabeling: number;
  validationRecommendation: number;
  hierarchyAdherence?: number;
}): number {
  const weights = {
    sourceAttribution: 0.3,
    estimateLabeling: 0.25,
    validationRecommendation: 0.2,
    hierarchyAdherence: 0.25,
  };

  let weightedSum = 0;
  let totalWeight = 0;

  weightedSum += scores.sourceAttribution * weights.sourceAttribution;
  totalWeight += weights.sourceAttribution;

  weightedSum += scores.estimateLabeling * weights.estimateLabeling;
  totalWeight += weights.estimateLabeling;

  weightedSum += scores.validationRecommendation * weights.validationRecommendation;
  totalWeight += weights.validationRecommendation;

  if (scores.hierarchyAdherence !== undefined) {
    weightedSum += scores.hierarchyAdherence * weights.hierarchyAdherence;
    totalWeight += weights.hierarchyAdherence;
  }

  return weightedSum / totalWeight;
}

export default {
  scoreDataSourceAttribution,
  scoreEstimateLabeling,
  scoreValidationRecommendation,
  scoreDataHierarchyAdherence,
  calculateDataQualityScore,
  DataSourcePriority,
};
