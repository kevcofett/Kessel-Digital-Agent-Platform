/**
 * Agent Configuration Exports
 * Central export point for all agent configurations
 */
export * from './types';
export { mpaAgentConfig, mpaFeedbackTriggers } from './mpa/mpa-agent-config';
export { caAgentConfig, caFeedbackTriggers } from './ca/ca-agent-config';
export { eapAgentConfig, eapFeedbackTriggers } from './eap/eap-agent-config';
import { AgentConfig } from './types';
/**
 * Map of all agent configurations
 */
export declare const agentConfigs: Record<string, AgentConfig>;
/**
 * Get agent configuration by ID
 */
export declare function getAgentConfig(agentId: string): AgentConfig | undefined;
/**
 * Get agent configuration by Dataverse type code
 */
export declare function getAgentConfigByTypeCode(typeCode: number): AgentConfig | undefined;
//# sourceMappingURL=index.d.ts.map