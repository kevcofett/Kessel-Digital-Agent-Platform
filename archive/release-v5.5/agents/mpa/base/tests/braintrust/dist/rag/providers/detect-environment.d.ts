/**
 * Environment Detection
 *
 * Auto-detects the runtime environment based on available
 * credentials and configuration, returning the appropriate
 * EnvironmentConfig for provider initialization.
 */
import { EnvironmentConfig } from './interfaces.js';
/**
 * Detect the environment based on available environment variables
 * and credentials. Prioritizes corporate environment if those
 * credentials are available.
 */
export declare function detectEnvironment(): EnvironmentConfig;
/**
 * Get a human-readable description of the detected environment
 */
export declare function describeEnvironment(config: EnvironmentConfig): string;
/**
 * Validate that required credentials are present for the configuration
 */
export declare function validateEnvironment(config: EnvironmentConfig): {
    valid: boolean;
    errors: string[];
};
export default detectEnvironment;
//# sourceMappingURL=detect-environment.d.ts.map