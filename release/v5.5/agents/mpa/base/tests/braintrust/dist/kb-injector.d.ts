/**
 * KB Injector for Multi-Turn MPA Evaluation
 *
 * Simulates RAG by injecting relevant KB content at each step.
 */
/**
 * KB file mapping by step
 */
export declare const KB_FILES_BY_STEP: Record<number, string[]>;
/**
 * KB Injector class
 */
export declare class KBInjector {
    private kbCache;
    private basePath;
    constructor(basePath?: string);
    /**
     * Get KB content for a specific step
     */
    getKBForStep(step: number, customKBMap?: Record<number, string[]>): Promise<string[]>;
    /**
     * Get KB content as a single concatenated string
     */
    getKBStringForStep(step: number, customKBMap?: Record<number, string[]>): Promise<string>;
    /**
     * Load a KB file with caching
     */
    private loadKBFile;
    /**
     * Format KB content with header
     */
    private formatKBContent;
    /**
     * Truncate content to max characters
     */
    private truncateContent;
    /**
     * Clear the cache
     */
    clearCache(): void;
    /**
     * Preload all KB files into cache
     */
    preloadAll(): Promise<void>;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        cachedFiles: number;
        totalChars: number;
    };
    /**
     * Get list of KB files for a step
     */
    getKBFilesForStep(step: number): string[];
}
export default KBInjector;
//# sourceMappingURL=kb-injector.d.ts.map