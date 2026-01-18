/**
 * Phase 5 Agent Test Scenarios
 *
 * Test scenarios for SPO, DOC, and PRF specialist agents.
 * 25 comprehensive scenarios covering all capabilities.
 *
 * @module phase5-agent-scenarios
 * @version 1.0.0
 */

import { AGENT_CODES } from "../../../packages/agent-core/src/multi-agent/types/agent-codes.js";

/**
 * Test scenario interface
 */
export interface AgentTestScenario {
  id: string;
  name: string;
  agent: string;
  capability: string;
  input: string;
  expectedBehavior: string;
  expectedElements: string[];
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
}

/**
 * SPO (Supply Path Optimization) Test Scenarios - 8 scenarios
 */
export const spoTestScenarios: AgentTestScenario[] = [
  {
    id: "spo-001",
    name: "Fee Stack Analysis Request",
    agent: AGENT_CODES.SPO,
    capability: "AnalyzeFees",
    input:
      "Our programmatic display is showing 42% working media. Can you analyze the fee stack?",
    expectedBehavior:
      "Fee breakdown with improvement recommendations and benchmark comparison",
    expectedElements: [
      "working_media",
      "dsp_fee",
      "ssp_fee",
      "benchmark",
      "recommendation",
    ],
    difficulty: "medium",
    tags: ["spo", "fee-analysis", "working-media"],
  },
  {
    id: "spo-002",
    name: "NBI Calculation for Path Change",
    agent: AGENT_CODES.SPO,
    capability: "CalculateNBI",
    input: "What's the NBI if we switch from open exchange to PMP?",
    expectedBehavior:
      "NBI calculation with quality trade-off assessment and recommendation",
    expectedElements: [
      "nbi_score",
      "fee_savings",
      "effectiveness_impact",
      "recommendation",
    ],
    difficulty: "hard",
    tags: ["spo", "nbi", "supply-path"],
  },
  {
    id: "spo-003",
    name: "DSP Partner Evaluation",
    agent: AGENT_CODES.SPO,
    capability: "EvaluatePartner",
    input: "How do we evaluate whether to switch DSPs?",
    expectedBehavior:
      "Partner evaluation criteria with weighted scoring methodology",
    expectedElements: [
      "evaluation_criteria",
      "scoring",
      "tier_assignment",
      "recommendation",
    ],
    difficulty: "medium",
    tags: ["spo", "partner-evaluation", "dsp"],
  },
  {
    id: "spo-004",
    name: "Reseller Inventory Analysis",
    agent: AGENT_CODES.SPO,
    capability: "AnalyzeFees",
    input:
      "We're seeing a lot of reseller inventory. Is that a problem?",
    expectedBehavior:
      "Supply path analysis with quality concerns and optimization recommendations",
    expectedElements: [
      "reseller_impact",
      "quality_concerns",
      "transparency",
      "recommendation",
    ],
    difficulty: "medium",
    tags: ["spo", "resellers", "supply-quality"],
  },
  {
    id: "spo-005",
    name: "Working Media Benchmark by Channel",
    agent: AGENT_CODES.SPO,
    capability: "AnalyzeFees",
    input: "What's a good target for working media ratio in CTV?",
    expectedBehavior: "Channel-specific benchmark with industry context",
    expectedElements: [
      "benchmark",
      "channel_context",
      "target_range",
      "industry_comparison",
    ],
    difficulty: "easy",
    tags: ["spo", "benchmark", "ctv"],
  },
  {
    id: "spo-006",
    name: "Fee Benchmark Comparison",
    agent: AGENT_CODES.SPO,
    capability: "AnalyzeFees",
    input:
      "Our DSP charges 18% and SSP takes 22%. Is that normal?",
    expectedBehavior: "Fee benchmark comparison with industry standards",
    expectedElements: [
      "fee_comparison",
      "industry_benchmark",
      "assessment",
      "negotiation_guidance",
    ],
    difficulty: "easy",
    tags: ["spo", "fees", "benchmark"],
  },
  {
    id: "spo-007",
    name: "MFA Detection Guidance",
    agent: AGENT_CODES.SPO,
    capability: "EvaluatePartner",
    input: "How do we detect MFA inventory?",
    expectedBehavior:
      "MFA detection signals and prevention strategies",
    expectedElements: [
      "mfa_signals",
      "detection_methods",
      "prevention_tactics",
      "partner_requirements",
    ],
    difficulty: "hard",
    tags: ["spo", "mfa", "fraud-prevention"],
  },
  {
    id: "spo-008",
    name: "DSP Consolidation Analysis",
    agent: AGENT_CODES.SPO,
    capability: "CalculateNBI",
    input: "Should we consolidate from 4 DSPs to 2?",
    expectedBehavior:
      "Consolidation analysis with NBI calculation and risk assessment",
    expectedElements: [
      "consolidation_analysis",
      "nbi_impact",
      "risk_assessment",
      "recommendation",
    ],
    difficulty: "hard",
    tags: ["spo", "consolidation", "strategy"],
  },
];

/**
 * DOC (Document Generation) Test Scenarios - 8 scenarios
 */
export const docTestScenarios: AgentTestScenario[] = [
  {
    id: "doc-001",
    name: "Full Media Plan Generation",
    agent: AGENT_CODES.DOC,
    capability: "GenerateDocument",
    input: "Generate the full media plan document",
    expectedBehavior:
      "Complete plan document with all required sections",
    expectedElements: [
      "document_type",
      "sections",
      "download_link",
      "format",
    ],
    difficulty: "medium",
    tags: ["doc", "full-plan", "generation"],
  },
  {
    id: "doc-002",
    name: "Executive Summary Generation",
    agent: AGENT_CODES.DOC,
    capability: "GenerateDocument",
    input: "I need a 2-page executive summary for leadership",
    expectedBehavior:
      "Concise executive summary with key metrics and recommendations",
    expectedElements: [
      "summary",
      "key_metrics",
      "recommendations",
      "format",
    ],
    difficulty: "easy",
    tags: ["doc", "executive-summary", "leadership"],
  },
  {
    id: "doc-003",
    name: "Channel Brief Creation",
    agent: AGENT_CODES.DOC,
    capability: "GenerateDocument",
    input: "Create a channel brief for our Meta agency",
    expectedBehavior:
      "Channel-specific brief with targeting, budget, and requirements",
    expectedElements: [
      "channel_detail",
      "targeting",
      "budget",
      "requirements",
    ],
    difficulty: "medium",
    tags: ["doc", "channel-brief", "agency"],
  },
  {
    id: "doc-004",
    name: "PDF Export Request",
    agent: AGENT_CODES.DOC,
    capability: "GenerateDocument",
    input: "Export the plan as PDF",
    expectedBehavior: "PDF export with download link provided",
    expectedElements: ["format_pdf", "download_link", "confirmation"],
    difficulty: "easy",
    tags: ["doc", "export", "pdf"],
  },
  {
    id: "doc-005",
    name: "Presentation Deck Generation",
    agent: AGENT_CODES.DOC,
    capability: "GenerateDocument",
    input: "I need a PowerPoint deck for the client meeting",
    expectedBehavior:
      "PPTX presentation with slides and visual elements",
    expectedElements: [
      "format_pptx",
      "slides",
      "visuals",
      "download_link",
    ],
    difficulty: "medium",
    tags: ["doc", "presentation", "pptx"],
  },
  {
    id: "doc-006",
    name: "Post-Mortem Report",
    agent: AGENT_CODES.DOC,
    capability: "GenerateDocument",
    input: "Create a post-mortem report for Q4 campaign",
    expectedBehavior:
      "Post-mortem document with learnings and recommendations",
    expectedElements: [
      "performance_summary",
      "learnings",
      "what_worked",
      "recommendations",
    ],
    difficulty: "medium",
    tags: ["doc", "post-mortem", "analysis"],
  },
  {
    id: "doc-007",
    name: "Multi-Document Package",
    agent: AGENT_CODES.DOC,
    capability: "GenerateDocument",
    input: "Package everything for client approval",
    expectedBehavior:
      "Multiple document generation with approval package",
    expectedElements: [
      "multiple_documents",
      "package",
      "approval_ready",
    ],
    difficulty: "hard",
    tags: ["doc", "package", "multi-document"],
  },
  {
    id: "doc-008",
    name: "Template Structure Guidance",
    agent: AGENT_CODES.DOC,
    capability: "GenerateDocument",
    input:
      "What sections should be in the measurement plan document?",
    expectedBehavior: "Template structure guidance with section descriptions",
    expectedElements: [
      "template_structure",
      "sections",
      "guidance",
    ],
    difficulty: "easy",
    tags: ["doc", "template", "measurement"],
  },
];

/**
 * PRF (Performance Intelligence) Test Scenarios - 9 scenarios
 */
export const prfTestScenarios: AgentTestScenario[] = [
  {
    id: "prf-001",
    name: "CPA Variance Analysis",
    agent: AGENT_CODES.PRF,
    capability: "AnalyzePerformance",
    input: "Our CPA is 25% above target. What should we do?",
    expectedBehavior:
      "Variance analysis with severity assessment and action recommendations",
    expectedElements: [
      "variance_percent",
      "severity",
      "recommendations",
      "action",
    ],
    difficulty: "medium",
    tags: ["prf", "variance", "cpa"],
  },
  {
    id: "prf-002",
    name: "Pacing Analysis",
    agent: AGENT_CODES.PRF,
    capability: "AnalyzePerformance",
    input:
      "We're only at 75% of pacing midway through the flight",
    expectedBehavior:
      "Pacing analysis with corrective actions and projection",
    expectedElements: [
      "pacing_status",
      "projection",
      "corrective_actions",
    ],
    difficulty: "medium",
    tags: ["prf", "pacing", "budget"],
  },
  {
    id: "prf-003",
    name: "CTR Anomaly Detection",
    agent: AGENT_CODES.PRF,
    capability: "DetectAnomalies",
    input:
      "CTR dropped from 0.15% to 0.08% in the last week",
    expectedBehavior:
      "Anomaly detection with investigation guidance",
    expectedElements: [
      "anomaly_type",
      "z_score",
      "investigation_steps",
      "confidence",
    ],
    difficulty: "hard",
    tags: ["prf", "anomaly", "ctr"],
  },
  {
    id: "prf-004",
    name: "Post-Campaign Learning Extraction",
    agent: AGENT_CODES.PRF,
    capability: "ExtractLearnings",
    input: "The campaign ended. What did we learn?",
    expectedBehavior:
      "Learning extraction with categorization and future application",
    expectedElements: [
      "learnings",
      "categories",
      "recommendations",
      "future_application",
    ],
    difficulty: "medium",
    tags: ["prf", "learnings", "post-mortem"],
  },
  {
    id: "prf-005",
    name: "Budget Reallocation Analysis",
    agent: AGENT_CODES.PRF,
    capability: "AnalyzePerformance",
    input: "Should we reallocate budget from display to video?",
    expectedBehavior:
      "Performance-based reallocation analysis with recommendations",
    expectedElements: [
      "channel_comparison",
      "performance_data",
      "recommendation",
    ],
    difficulty: "hard",
    tags: ["prf", "reallocation", "optimization"],
  },
  {
    id: "prf-006",
    name: "Statistical Significance Assessment",
    agent: AGENT_CODES.PRF,
    capability: "DetectAnomalies",
    input: "Is the 12% CTR variance statistically significant?",
    expectedBehavior:
      "Statistical significance assessment with confidence level",
    expectedElements: [
      "statistical_analysis",
      "significance",
      "confidence",
      "sample_size",
    ],
    difficulty: "hard",
    tags: ["prf", "statistics", "significance"],
  },
  {
    id: "prf-007",
    name: "Optimization Trigger Setup",
    agent: AGENT_CODES.PRF,
    capability: "AnalyzePerformance",
    input: "What optimization triggers should we set up?",
    expectedBehavior:
      "Threshold recommendations by metric with action triggers",
    expectedElements: [
      "thresholds",
      "metrics",
      "triggers",
      "actions",
    ],
    difficulty: "medium",
    tags: ["prf", "optimization", "triggers"],
  },
  {
    id: "prf-008",
    name: "Frequency Analysis",
    agent: AGENT_CODES.PRF,
    capability: "AnalyzePerformance",
    input: "Our frequency hit 8x. Is that too high?",
    expectedBehavior:
      "Frequency analysis with benchmark and recommendation",
    expectedElements: [
      "frequency_assessment",
      "benchmark",
      "impact",
      "recommendation",
    ],
    difficulty: "easy",
    tags: ["prf", "frequency", "reach"],
  },
  {
    id: "prf-009",
    name: "Cross-Campaign Comparison",
    agent: AGENT_CODES.PRF,
    capability: "AnalyzePerformance",
    input:
      "Compare this campaign's performance to the Q3 campaign",
    expectedBehavior:
      "Cross-campaign comparison with variance and insights",
    expectedElements: [
      "comparison",
      "variance",
      "insights",
      "recommendations",
    ],
    difficulty: "hard",
    tags: ["prf", "comparison", "historical"],
  },
];

/**
 * All Phase 5 test scenarios combined
 */
export const allPhase5Scenarios: AgentTestScenario[] = [
  ...spoTestScenarios,
  ...docTestScenarios,
  ...prfTestScenarios,
];

/**
 * Get scenarios by agent
 */
export function getScenariosByAgent(agent: string): AgentTestScenario[] {
  return allPhase5Scenarios.filter((s) => s.agent === agent);
}

/**
 * Get scenarios by difficulty
 */
export function getScenariosByDifficulty(
  difficulty: "easy" | "medium" | "hard"
): AgentTestScenario[] {
  return allPhase5Scenarios.filter((s) => s.difficulty === difficulty);
}

/**
 * Get scenarios by capability
 */
export function getScenariosByCapability(
  capability: string
): AgentTestScenario[] {
  return allPhase5Scenarios.filter((s) => s.capability === capability);
}

/**
 * Scenario statistics
 */
export const phase5ScenarioStats = {
  total: allPhase5Scenarios.length,
  byAgent: {
    SPO: spoTestScenarios.length,
    DOC: docTestScenarios.length,
    PRF: prfTestScenarios.length,
  },
  byDifficulty: {
    easy: allPhase5Scenarios.filter((s) => s.difficulty === "easy").length,
    medium: allPhase5Scenarios.filter((s) => s.difficulty === "medium").length,
    hard: allPhase5Scenarios.filter((s) => s.difficulty === "hard").length,
  },
  byCapability: {
    CalculateNBI: getScenariosByCapability("CalculateNBI").length,
    AnalyzeFees: getScenariosByCapability("AnalyzeFees").length,
    EvaluatePartner: getScenariosByCapability("EvaluatePartner").length,
    GenerateDocument: getScenariosByCapability("GenerateDocument").length,
    AnalyzePerformance: getScenariosByCapability("AnalyzePerformance").length,
    DetectAnomalies: getScenariosByCapability("DetectAnomalies").length,
    ExtractLearnings: getScenariosByCapability("ExtractLearnings").length,
  },
};
