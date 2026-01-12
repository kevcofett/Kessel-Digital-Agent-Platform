/**
 * Tool Shim for Copilot Studio
 *
 * Converts native tool_use format to structured prompts for environments
 * that don't support native tool calling (like Copilot Studio).
 *
 * Usage:
 * 1. Before sending to LLM: Append tool instructions to system prompt
 * 2. After receiving response: Parse action requests from response text
 * 3. Execute tools and format results for next turn
 */
import { LLMToolDefinition } from './interfaces.js';
/**
 * Parsed action request from LLM response
 */
export interface ToolUseRequest {
    name: string;
    input: Record<string, unknown>;
}
/**
 * Result of tool execution to be injected into conversation
 */
export interface ToolResult {
    name: string;
    result: string;
    isError?: boolean;
}
export declare class ToolShim {
    /**
     * For environments without tool_use support (Copilot Studio),
     * convert tool definitions to structured prompt instructions
     */
    static createToolInstructions(tools: LLMToolDefinition[]): string;
    /**
     * Parse agent response for action requests
     */
    static parseActionRequests(response: string): ToolUseRequest[];
    /**
     * Check if response contains any action requests
     */
    static hasActionRequests(response: string): boolean;
    /**
     * Format tool results to inject into next user message
     */
    static formatToolResults(results: ToolResult[]): string;
    /**
     * Extract text content from response, excluding action requests
     */
    static extractTextContent(response: string): string;
    /**
     * Generate example input for a tool based on its schema
     */
    private static generateExampleInput;
    /**
     * Format parameter schema for human-readable output
     */
    private static formatParameters;
}
export default ToolShim;
//# sourceMappingURL=tool-shim.d.ts.map