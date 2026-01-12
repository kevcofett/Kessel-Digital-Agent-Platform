/**
 * Environment Configuration Types
 *
 * Defines the structure for environment-specific configurations
 * that switch between personal (Aragorn AI) and corporate (Mastercard) deployments.
 */
// ============================================================================
// VALIDATION
// ============================================================================
export function validateEnvironmentConfig(config) {
    if (!config || typeof config !== 'object') {
        return false;
    }
    const c = config;
    if (!c.type || !['personal', 'corporate'].includes(c.type)) {
        return false;
    }
    if (!c.name || typeof c.name !== 'string') {
        return false;
    }
    if (!c.llm || typeof c.llm !== 'object') {
        return false;
    }
    if (!c.embedding || typeof c.embedding !== 'object') {
        return false;
    }
    if (!c.storage || typeof c.storage !== 'object') {
        return false;
    }
    return true;
}
//# sourceMappingURL=environment-types.js.map