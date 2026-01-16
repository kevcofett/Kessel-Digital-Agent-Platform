/**
 * Stack Toggle System
 * Runtime switching between Claude and Microsoft stacks
 */
import { StackType, StackConfig, StackFeatureFlags, StackDetectionResult, ProviderAvailability } from './stack-types.js';
/**
 * Stack Toggle class for managing provider stacks
 */
export declare class StackToggle {
    private detectionResult;
    private config;
    /**
     * Detect the active stack based on environment
     */
    detectStack(): StackDetectionResult;
    /**
     * Check which providers have available credentials
     */
    checkProviderAvailability(): ProviderAvailability;
    /**
     * Get feature flags for a stack type
     */
    private getFeaturesForStack;
    /**
     * Get the active stack type
     */
    getActiveStack(): StackType;
    /**
     * Check if Claude stack is active
     */
    isClaudeStack(): boolean;
    /**
     * Check if Microsoft stack is active
     */
    isMicrosoftStack(): boolean;
    /**
     * Get feature flags for active stack
     */
    getFeatureFlags(): StackFeatureFlags;
    /**
     * Check if a specific feature is enabled
     */
    isFeatureEnabled(feature: keyof StackFeatureFlags): boolean;
    /**
     * Load stack configuration from environment
     */
    loadConfig(): StackConfig;
    /**
     * Load Claude stack configuration
     */
    private loadClaudeConfig;
    /**
     * Load Microsoft stack configuration
     */
    private loadMicrosoftConfig;
    /**
     * Get a summary of the current stack status
     */
    getStackSummary(): string;
    /**
     * Reset detection (useful for testing)
     */
    reset(): void;
}
/**
 * Get the singleton StackToggle instance
 */
export declare function getStackToggle(): StackToggle;
/**
 * Convenience functions
 */
export declare function getActiveStack(): StackType;
export declare function isClaudeStack(): boolean;
export declare function isMicrosoftStack(): boolean;
export declare function getFeatureFlags(): StackFeatureFlags;
export declare function isFeatureEnabled(feature: keyof StackFeatureFlags): boolean;
//# sourceMappingURL=stack-toggle.d.ts.map