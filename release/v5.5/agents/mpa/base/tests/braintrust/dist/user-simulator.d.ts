/**
 * User Simulator for Multi-Turn MPA Evaluation
 *
 * Simulates realistic user behavior based on defined personas.
 */
import { UserPersona, ConversationTurn, UserSimulatorResponse, UserSimulatorConfig } from "./mpa-multi-turn-types.js";
/**
 * Build the user simulator system prompt
 */
declare function buildUserSimulatorPrompt(persona: UserPersona): string;
/**
 * Parse user response for metadata extraction
 */
declare function parseUserResponse(response: string, persona: UserPersona): UserSimulatorResponse;
/**
 * User Simulator class
 */
export declare class UserSimulator {
    private anthropic;
    private config;
    constructor(config?: Partial<UserSimulatorConfig>);
    /**
     * Generate the user's response to an agent message
     */
    generateResponse(persona: UserPersona, agentMessage: string, conversationHistory: ConversationTurn[], openingMessage?: string): Promise<UserSimulatorResponse>;
    /**
     * Generate a "goodbye" or conversation-ending response
     */
    generateClosingResponse(persona: UserPersona, conversationHistory: ConversationTurn[]): Promise<UserSimulatorResponse>;
}
export { buildUserSimulatorPrompt, parseUserResponse };
//# sourceMappingURL=user-simulator.d.ts.map