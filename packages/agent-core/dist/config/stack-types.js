/**
 * Stack Types for Multi-Provider Support
 * Enables runtime switching between Claude and Microsoft stacks
 */
/**
 * Default feature flags for Claude stack
 */
export const CLAUDE_STACK_FEATURES = {
    useCopilotStudioOrchestration: false,
    useAzureOpenAIDirectly: false,
    useClaudeAPI: true,
    useDataverseStorage: false,
    useLocalStorage: true,
    useSharePointKB: false,
    useAzureAISearch: false,
    useLocalKB: true,
    usePowerAutomateFlows: false,
    useDataverseImpactTracking: false,
    useLocalImpactTracking: true,
    enableDebugLogging: true,
    enablePerformanceMetrics: true,
};
/**
 * Default feature flags for Microsoft stack
 */
export const MICROSOFT_STACK_FEATURES = {
    useCopilotStudioOrchestration: true,
    useAzureOpenAIDirectly: true,
    useClaudeAPI: false,
    useDataverseStorage: true,
    useLocalStorage: false,
    useSharePointKB: true,
    useAzureAISearch: true,
    useLocalKB: false,
    usePowerAutomateFlows: true,
    useDataverseImpactTracking: true,
    useLocalImpactTracking: false,
    enableDebugLogging: false,
    enablePerformanceMetrics: true,
};
//# sourceMappingURL=stack-types.js.map