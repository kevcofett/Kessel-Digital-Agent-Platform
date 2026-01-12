/**
 * MPA Agent Configuration for agent-core RAG System
 *
 * This configuration defines how the Media Planning Agent processes
 * queries, matches documents, and retrieves relevant knowledge.
 */
import type { AgentRAGConfig } from '@kessel-digital/agent-core';
export type MPADocumentType = 'benchmark' | 'framework' | 'playbook' | 'examples' | 'implications' | 'operating-standards';
export type MPATopic = 'audience' | 'budget' | 'channel' | 'measurement' | 'benchmark' | 'efficiency' | 'general';
export type MPAVertical = 'ecommerce' | 'retail' | 'dtc' | 'b2b' | 'saas' | 'financial' | 'healthcare' | 'pharma' | 'automotive' | 'travel' | 'cpg' | 'technology' | 'entertainment' | 'education';
export type MPAMetric = 'cac' | 'cpa' | 'cpm' | 'cpc' | 'ctr' | 'cvr' | 'roas' | 'roi' | 'ltv' | 'aov' | 'reach' | 'frequency' | 'impressions' | 'clicks' | 'conversions';
export declare const MPA_AGENT_CONFIG: AgentRAGConfig;
/**
 * Detect which MPA step a query relates to
 */
export declare function detectMPAStep(query: string): number | null;
/**
 * Detect the primary topic of a query
 */
export declare function detectMPATopic(query: string): MPATopic;
/**
 * Expand query with synonyms
 */
export declare function expandMPAQuery(query: string): string[];
/**
 * Get step-specific boost for document scoring
 */
export declare function getMPAStepBoost(documentContent: string, targetStep: number): number;
export default MPA_AGENT_CONFIG;
//# sourceMappingURL=mpa-agent-config.d.ts.map