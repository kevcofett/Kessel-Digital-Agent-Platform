/**
 * Stack-Aware Provider Factory
 * Creates providers based on active stack configuration
 */
import { StackToggle } from './stack-toggle.js';
import type { LLMProvider, StorageProvider } from '../providers/interfaces.js';
import type { SemanticEmbeddingProvider } from '../providers/embedding-types.js';
import type { KBImpactStorage } from '../learning/kb-impact-types.js';
/**
 * Provider instances container
 */
export interface StackProviderInstances {
    llm: LLMProvider;
    embedding: SemanticEmbeddingProvider;
    storage: StorageProvider;
    kbStorage: KBImpactStorage;
}
/**
 * Stack-aware provider factory
 */
export declare class StackProviderFactory {
    private stackToggle;
    private providers;
    constructor(stackToggle?: StackToggle);
    /**
     * Create all providers for the active stack
     */
    createProviders(): Promise<StackProviderInstances>;
    /**
     * Create Claude stack providers
     */
    private createClaudeProviders;
    /**
     * Create Microsoft stack providers
     */
    private createMicrosoftProviders;
    /**
     * Get or create LLM provider
     */
    getLLMProvider(): Promise<LLMProvider>;
    /**
     * Get or create embedding provider
     */
    getEmbeddingProvider(): Promise<SemanticEmbeddingProvider>;
    /**
     * Get or create storage provider
     */
    getStorageProvider(): Promise<StorageProvider>;
    /**
     * Get or create KB impact storage
     */
    getKBImpactStorage(): Promise<KBImpactStorage>;
    /**
     * Get all providers at once
     */
    getAllProviders(): Promise<StackProviderInstances>;
    /**
     * Reset all providers (useful for testing or reconfiguration)
     */
    reset(): void;
}
/**
 * Get the singleton StackProviderFactory instance
 */
export declare function getStackProviderFactory(): StackProviderFactory;
/**
 * Create a new StackProviderFactory with optional custom toggle
 */
export declare function createStackProviderFactory(stackToggle?: StackToggle): StackProviderFactory;
//# sourceMappingURL=stack-provider-factory.d.ts.map