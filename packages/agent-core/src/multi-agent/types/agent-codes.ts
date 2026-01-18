/**
 * Multi-Agent Architecture - Agent Code Definitions
 *
 * Defines the 7 specialized agents in the multi-agent MPA system.
 * Each agent has a unique 3-letter code used for routing and identification.
 */

export const AGENT_CODES = {
  ORC: 'ORC',  // Orchestrator - Routes requests and synthesizes responses
  ANL: 'ANL',  // Analytics & Forecasting - Projections, statistics, scenarios
  AUD: 'AUD',  // Audience Intelligence - Segmentation, LTV, targeting
  CHA: 'CHA',  // Channel Strategy - Channel mix, allocation, benchmarks
  SPO: 'SPO',  // Supply Path Optimization - Fee analysis, partner evaluation
  DOC: 'DOC',  // Document Generation - Plans, briefs, presentations
  PRF: 'PRF',  // Performance Intelligence - Optimization, anomalies, learnings
} as const;

export type AgentCode = typeof AGENT_CODES[keyof typeof AGENT_CODES];

export const AGENT_NAMES: Record<AgentCode, string> = {
  ORC: 'Orchestrator Agent',
  ANL: 'Analytics & Forecasting Agent',
  AUD: 'Audience Intelligence Agent',
  CHA: 'Channel Strategy Agent',
  SPO: 'Supply Path Optimization Agent',
  DOC: 'Document Generation Agent',
  PRF: 'Performance Intelligence Agent',
};

export const AGENT_DESCRIPTIONS: Record<AgentCode, string> = {
  ORC: 'Routes user requests to specialist agents and synthesizes final responses',
  ANL: 'Calculates projections, runs scenarios, and validates statistical significance',
  AUD: 'Segments audiences, models LTV, and recommends targeting strategies',
  CHA: 'Optimizes channel mix, calculates allocations, and provides benchmarks',
  SPO: 'Analyzes supply path fees, evaluates partners, and calculates Net Benefit Index',
  DOC: 'Generates media plans, creative briefs, and presentation decks',
  PRF: 'Analyzes performance, detects anomalies, and extracts learnings',
};

/**
 * Validates if a string is a valid agent code
 */
export function isValidAgentCode(code: string): code is AgentCode {
  return Object.values(AGENT_CODES).includes(code as AgentCode);
}

/**
 * Returns all specialist agent codes (excludes ORC)
 */
export function getSpecialistCodes(): AgentCode[] {
  return Object.values(AGENT_CODES).filter(code => code !== 'ORC') as AgentCode[];
}
