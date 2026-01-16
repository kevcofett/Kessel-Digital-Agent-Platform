/**
 * EAP Agent Configuration for agent-core RAG System
 *
 * This configuration defines how the Enterprise AI Platform agent processes
 * queries, matches documents, and retrieves relevant knowledge.
 */
import type { AgentRAGConfig } from '@kessel-digital/agent-core';
export type EAPDocumentType = 'architecture' | 'integration' | 'security' | 'governance' | 'operations' | 'best-practice' | 'reference' | 'registry';
export type EAPTopic = 'infrastructure' | 'integration' | 'security' | 'data' | 'ml-ops' | 'governance' | 'tools' | 'general';
export type EAPVertical = 'enterprise' | 'saas' | 'cloud' | 'on-premise' | 'hybrid' | 'multi-tenant' | 'startup' | 'regulated';
export type EAPMetric = 'latency' | 'throughput' | 'availability' | 'uptime' | 'cost' | 'token-usage' | 'error-rate' | 'accuracy' | 'p50' | 'p95' | 'p99' | 'ttft' | 'model-size' | 'context-length';
export declare const EAP_AGENT_CONFIG: AgentRAGConfig;
/**
 * Detect the primary topic of a query
 */
export declare function detectEAPTopic(query: string): EAPTopic;
/**
 * Expand query with synonyms
 */
export declare function expandEAPQuery(query: string): string[];
/**
 * Detect document type from content
 */
export declare function detectEAPDocumentType(content: string): EAPDocumentType;
export default EAP_AGENT_CONFIG;
//# sourceMappingURL=eap-agent-config.d.ts.map