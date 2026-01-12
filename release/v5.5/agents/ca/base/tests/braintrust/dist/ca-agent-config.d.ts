/**
 * CA Agent Configuration for agent-core RAG System
 *
 * This configuration defines how the Consulting Agent processes
 * queries, matches documents, and retrieves relevant knowledge.
 */
import type { AgentRAGConfig } from '@kessel-digital/agent-core';
export type CADocumentType = 'methodology' | 'framework' | 'case-study' | 'template' | 'best-practice' | 'industry-analysis' | 'reference' | 'registry' | 'behavioral';
export type CATopic = 'strategy' | 'operations' | 'technology' | 'transformation' | 'analytics' | 'organization' | 'research' | 'benchmarks' | 'general';
export type CAVertical = 'financial-services' | 'banking' | 'insurance' | 'healthcare' | 'pharma' | 'retail' | 'consumer' | 'manufacturing' | 'technology' | 'telecom' | 'energy' | 'public-sector' | 'private-equity';
export type CAMetric = 'roi' | 'npv' | 'irr' | 'payback' | 'tco' | 'revenue' | 'cost' | 'margin' | 'ebitda' | 'nps' | 'adoption-rate' | 'headcount' | 'attrition' | 'time-to-value';
export declare const CA_FRAMEWORKS: {
    strategic: string[];
    operational: string[];
    organizational: string[];
    financial: string[];
};
export declare const CA_AGENT_CONFIG: AgentRAGConfig;
/**
 * Detect the primary topic of a query
 */
export declare function detectCATopic(query: string): CATopic;
/**
 * Expand query with synonyms
 */
export declare function expandCAQuery(query: string): string[];
/**
 * Detect document type from content
 */
export declare function detectCADocumentType(content: string): CADocumentType;
/**
 * Get relevant frameworks for a topic
 */
export declare function getCAFrameworksForTopic(topic: CATopic): string[];
export default CA_AGENT_CONFIG;
//# sourceMappingURL=ca-agent-config.d.ts.map