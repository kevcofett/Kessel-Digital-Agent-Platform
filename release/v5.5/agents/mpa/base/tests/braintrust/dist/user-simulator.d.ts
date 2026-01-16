/**
 * User Simulator for Multi-Turn MPA Evaluation
 *
 * Simulates realistic user behavior based on defined personas.
 */
import { UserPersona, ConversationTurn, UserSimulatorResponse, UserSimulatorConfig, DataChange } from "./mpa-multi-turn-types.js";
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
    private triggeredDataChanges;
    constructor(config?: Partial<UserSimulatorConfig>);
    /**
     * Reset triggered data changes (call at start of new conversation)
     */
    resetTriggeredChanges(): void;
    /**
     * Check if a data change should be triggered at this turn
     * Each data change can only be triggered once per conversation
     */
    private checkForDataChange;
    /**
     * Generate the user's response to an agent message
     *
     * @param persona - The user persona to simulate
     * @param agentMessage - The agent's most recent message
     * @param conversationHistory - All previous turns
     * @param openingMessage - Optional specific opening message
     * @param dataChanges - Optional data changes to inject mid-conversation
     * @param currentTurn - Current turn number (for data change timing)
     */
    generateResponse(persona: UserPersona, agentMessage: string, conversationHistory: ConversationTurn[], openingMessage?: string, dataChanges?: DataChange[], currentTurn?: number): Promise<UserSimulatorResponse & {
        dataChangeTriggered?: DataChange;
    }>;
    /**
     * Generate a "goodbye" or conversation-ending response
     */
    generateClosingResponse(persona: UserPersona, conversationHistory: ConversationTurn[]): Promise<UserSimulatorResponse>;
}
export { buildUserSimulatorPrompt, parseUserResponse };
//# sourceMappingURL=user-simulator.d.ts.map