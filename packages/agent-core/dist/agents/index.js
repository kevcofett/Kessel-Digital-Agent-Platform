/**
 * Agent Configuration Exports
 * Central export point for all agent configurations
 */
export * from './types';
export { mpaAgentConfig, mpaFeedbackTriggers } from './mpa/mpa-agent-config';
export { caAgentConfig, caFeedbackTriggers } from './ca/ca-agent-config';
export { eapAgentConfig, eapFeedbackTriggers } from './eap/eap-agent-config';
import { mpaAgentConfig } from './mpa/mpa-agent-config';
import { caAgentConfig } from './ca/ca-agent-config';
import { eapAgentConfig } from './eap/eap-agent-config';
/**
 * Map of all agent configurations
 */
export const agentConfigs = {
    mpa: mpaAgentConfig,
    ca: caAgentConfig,
    eap: eapAgentConfig
};
/**
 * Get agent configuration by ID
 */
export function getAgentConfig(agentId) {
    return agentConfigs[agentId.toLowerCase()];
}
/**
 * Get agent configuration by Dataverse type code
 */
export function getAgentConfigByTypeCode(typeCode) {
    return Object.values(agentConfigs).find(config => config.agentTypeCode === typeCode);
}
//# sourceMappingURL=index.js.map