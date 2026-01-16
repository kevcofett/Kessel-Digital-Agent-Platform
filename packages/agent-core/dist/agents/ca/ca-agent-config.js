/**
 * CA Agent Configuration
 * Consulting Agent configuration including feedback triggers for self-learning
 */
/**
 * Feedback trigger patterns for detecting user feedback in natural conversation
 */
export const caFeedbackTriggers = {
    positive: [
        'helpful',
        'great',
        'perfect',
        'exactly what I needed',
        'thanks',
        'excellent',
        'good insight',
        'useful analysis',
        'that works',
        'makes sense',
        'clear explanation',
        'well done'
    ],
    negative: [
        'wrong',
        'not helpful',
        'incorrect',
        'bad',
        'useless',
        'that doesnt help',
        'not what I asked',
        'confusing',
        'unclear',
        'doesnt make sense',
        'try again',
        'thats not right'
    ],
    correction: [
        'actually',
        'let me correct',
        'that should be',
        'no its',
        'I meant',
        'not quite',
        'close but',
        'the correct answer is',
        'what I really need is'
    ]
};
/**
 * CA Agent Configuration
 */
export const caAgentConfig = {
    id: 'ca',
    name: 'Consulting Agent',
    version: '5.5.0',
    description: 'AI-powered consulting assistant for research, analysis, and strategic guidance',
    // Agent type code for Dataverse
    agentTypeCode: 100000001,
    // Feedback configuration
    feedbackTriggers: caFeedbackTriggers,
    // Knowledge base configuration
    kb: {
        basePath: 'release/v5.5/agents/ca/base/kb',
        filePattern: '*.txt',
        categories: [
            'BEHAVIORAL',
            'MARKET',
            'COMPETITOR',
            'CASE_STUDY',
            'METHODOLOGY',
            'FRAMEWORK'
        ]
    },
    // Pathways configuration
    pathways: {
        EXPRESS: {
            description: 'Quick research with direct answers',
            defaultSteps: ['query', 'search', 'synthesize'],
            maxTurns: 10
        },
        GUIDED: {
            description: 'Structured research with context gathering',
            defaultSteps: ['context', 'query', 'search', 'analyze', 'synthesize', 'recommend'],
            maxTurns: 30
        },
        STANDARD: {
            description: 'Comprehensive consulting engagement',
            defaultSteps: ['context', 'scope', 'query', 'search', 'analyze', 'synthesize', 'recommend', 'document'],
            maxTurns: 50
        }
    },
    // Self-critique configuration
    selfCritique: {
        enabled: true,
        criteria: [
            'source-citation',
            'evidence-based',
            'response-length',
            'single-question',
            'actionable-recommendations'
        ],
        minScoreThreshold: 0.85
    },
    // Success pattern storage
    successPatterns: {
        enabled: true,
        minCompositeScore: 0.95,
        scenarios: [
            'market_research',
            'competitor_analysis',
            'trend_identification',
            'strategic_recommendation',
            'case_study_search',
            'framework_application'
        ]
    }
};
export default caAgentConfig;
//# sourceMappingURL=ca-agent-config.js.map