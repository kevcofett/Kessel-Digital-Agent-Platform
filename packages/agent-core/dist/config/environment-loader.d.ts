/**
 * Environment Configuration Loader
 *
 * Loads and validates environment configurations from files or environment variables.
 */
import type { EnvironmentConfig, EnvironmentType } from './environment-types.js';
export declare const PERSONAL_ENV_CONFIG: EnvironmentConfig;
export declare const CORPORATE_ENV_CONFIG: EnvironmentConfig;
export declare class EnvironmentLoader {
    private configPath?;
    private cachedConfig?;
    constructor(configPath?: string);
    /**
     * Load environment configuration
     * Priority: 1. Config file, 2. ENV var, 3. Default based on NODE_ENV
     */
    load(): Promise<EnvironmentConfig>;
    /**
     * Load configuration from a JSON file
     */
    loadFromFile(filePath: string): Promise<EnvironmentConfig>;
    /**
     * Detect environment type from environment variables
     */
    detectEnvironmentType(): EnvironmentType;
    /**
     * Get default configuration for environment type
     */
    getDefaultConfig(type: EnvironmentType): EnvironmentConfig;
    /**
     * Resolve environment variable references in config
     * Variables prefixed with $ are replaced with their env var values
     */
    resolveEnvVars(config: EnvironmentConfig): EnvironmentConfig;
    /**
     * Clear cached configuration
     */
    clearCache(): void;
    /**
     * Get current cached config without loading
     */
    getCached(): EnvironmentConfig | undefined;
}
/**
 * Get the default environment loader instance
 */
export declare function getEnvironmentLoader(): EnvironmentLoader;
/**
 * Load environment configuration using default loader
 */
export declare function loadEnvironmentConfig(): Promise<EnvironmentConfig>;
/**
 * Set custom config path for default loader
 */
export declare function setEnvironmentConfigPath(configPath: string): void;
export default EnvironmentLoader;
//# sourceMappingURL=environment-loader.d.ts.map