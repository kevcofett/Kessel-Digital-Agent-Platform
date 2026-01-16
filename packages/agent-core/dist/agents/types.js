/**
 * Agent Configuration Types
 * Shared types for agent configurations
 */
/**
 * Detect feedback from user message using trigger patterns
 */
export function detectFeedback(message, triggers) {
    const lowerMessage = message.toLowerCase();
    // Check positive triggers
    for (const phrase of triggers.positive) {
        if (lowerMessage.includes(phrase.toLowerCase())) {
            return {
                detected: true,
                type: 'POSITIVE',
                confidence: 0.85,
                matchedPhrase: phrase
            };
        }
    }
    // Check negative triggers
    for (const phrase of triggers.negative) {
        if (lowerMessage.includes(phrase.toLowerCase())) {
            return {
                detected: true,
                type: 'NEGATIVE',
                confidence: 0.85,
                matchedPhrase: phrase
            };
        }
    }
    // Check correction triggers
    for (const phrase of triggers.correction) {
        if (lowerMessage.includes(phrase.toLowerCase())) {
            return {
                detected: true,
                type: 'CORRECTION',
                confidence: 0.75,
                matchedPhrase: phrase
            };
        }
    }
    return {
        detected: false,
        confidence: 0
    };
}
//# sourceMappingURL=types.js.map