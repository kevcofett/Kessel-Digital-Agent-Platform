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

export class ToolShim {
  /**
   * For environments without tool_use support (Copilot Studio),
   * convert tool definitions to structured prompt instructions
   */
  static createToolInstructions(tools: LLMToolDefinition[]): string {
    if (tools.length === 0) return '';

    const toolInstructions = tools.map(tool => {
      const exampleInput = this.generateExampleInput(tool);
      return `
### ${tool.name}
${tool.description}

**Parameters:**
${this.formatParameters(tool.input_schema)}

**To use:** Respond with exactly:
[ACTION:${tool.name}] ${JSON.stringify(exampleInput)}`;
    }).join('\n');

    return `
## Available Actions

When you need information or want to perform an action, use the formatted requests below.
After you request an action, STOP and wait for the result in my next message.
Do NOT continue with assumptions - wait for actual data.

${toolInstructions}

## Important Rules
1. Only request ONE action at a time
2. Wait for the result before requesting another action
3. Use the exact format: [ACTION:tool_name] {"param": "value"}
4. Parameters must be valid JSON
`;
  }

  /**
   * Parse agent response for action requests
   */
  static parseActionRequests(response: string): ToolUseRequest[] {
    const pattern = /\[ACTION:(\w+)\]\s*(\{[\s\S]*?\})/g;
    const requests: ToolUseRequest[] = [];
    let match;

    while ((match = pattern.exec(response)) !== null) {
      try {
        const input = JSON.parse(match[2]);
        requests.push({
          name: match[1],
          input,
        });
      } catch {
        // Invalid JSON, skip this match
        console.warn(`Failed to parse action input: ${match[2]}`);
      }
    }

    return requests;
  }

  /**
   * Check if response contains any action requests
   */
  static hasActionRequests(response: string): boolean {
    return /\[ACTION:\w+\]/.test(response);
  }

  /**
   * Format tool results to inject into next user message
   */
  static formatToolResults(results: ToolResult[]): string {
    if (results.length === 0) return '';

    const formatted = results.map(r => {
      if (r.isError) {
        return `[RESULT:${r.name}:ERROR]\n${r.result}`;
      }
      return `[RESULT:${r.name}]\n${r.result}`;
    }).join('\n\n');

    return `Here are the results of your requested actions:\n\n${formatted}\n\nPlease continue based on this information.`;
  }

  /**
   * Extract text content from response, excluding action requests
   */
  static extractTextContent(response: string): string {
    // Remove action blocks
    return response
      .replace(/\[ACTION:\w+\]\s*\{[\s\S]*?\}/g, '')
      .trim();
  }

  /**
   * Generate example input for a tool based on its schema
   */
  private static generateExampleInput(tool: LLMToolDefinition): Record<string, unknown> {
    const example: Record<string, unknown> = {};
    const props = tool.input_schema.properties;

    for (const [key, schema] of Object.entries(props)) {
      const propSchema = schema as { type?: string; description?: string };
      switch (propSchema.type) {
        case 'string':
          example[key] = `your_${key}_here`;
          break;
        case 'number':
          example[key] = 0;
          break;
        case 'boolean':
          example[key] = true;
          break;
        case 'array':
          example[key] = [];
          break;
        case 'object':
          example[key] = {};
          break;
        default:
          example[key] = `<${key}>`;
      }
    }

    return example;
  }

  /**
   * Format parameter schema for human-readable output
   */
  private static formatParameters(schema: LLMToolDefinition['input_schema']): string {
    const lines: string[] = [];
    const props = schema.properties;
    const required = new Set(schema.required);

    for (const [key, value] of Object.entries(props)) {
      const propSchema = value as { type?: string; description?: string };
      const isRequired = required.has(key);
      const requiredTag = isRequired ? ' (required)' : ' (optional)';
      const description = propSchema.description || 'No description';
      lines.push(`- **${key}**${requiredTag}: ${description}`);
    }

    return lines.join('\n');
  }
}

export default ToolShim;
