# EAP (ENTERPRISE AI PLATFORM) SPECIFICATION
# Version 1.0 | January 11, 2026
# EAP-Specific Components Using agent-core

================================================================================
OVERVIEW
================================================================================

The Enterprise AI Platform (EAP) serves as the orchestration layer and
administrative interface for the Kessel Digital Agent Platform. Unlike MPA
and CA which are domain-specific agents, EAP provides:

- Platform administration and configuration
- Agent routing and orchestration
- User management and access control
- Analytics and reporting across all agents
- System health monitoring

EAP uses agent-core but with a different focus - it's more about platform
operations than domain expertise.


================================================================================
PART 1: DIRECTORY STRUCTURE
================================================================================

```
release/v5.5/agents/eap/
├── base/
│   ├── kb/                          # EAP Knowledge Base
│   │   ├── EAP_Platform_Guide.txt
│   │   ├── EAP_Agent_Catalog.txt
│   │   ├── EAP_Administration.txt
│   │   ├── EAP_Troubleshooting.txt
│   │   ├── EAP_Security_Policies.txt
│   │   └── EAP_Integration_Guide.txt
│   │
│   ├── copilot/                     # Copilot Studio Instructions
│   │   └── EAP_Copilot_Instructions_v1.txt
│   │
│   └── tests/braintrust/            # Evaluation Harness
│       ├── eap-config.ts
│       ├── eap-prompt-content.ts
│       ├── eap-critique-criteria.ts
│       ├── eap-eval.ts
│       ├── scenarios/
│       │   ├── index.ts
│       │   ├── agent-routing.ts
│       │   ├── platform-status.ts
│       │   ├── user-onboarding.ts
│       │   ├── troubleshooting.ts
│       │   ├── analytics-request.ts
│       │   └── configuration-help.ts
│       ├── scorers/
│       │   ├── index.ts
│       │   ├── routing-accuracy.ts
│       │   ├── platform-knowledge.ts
│       │   ├── helpful-guidance.ts
│       │   └── escalation-appropriateness.ts
│       ├── storage/
│       ├── outputs/
│       ├── package.json
│       └── tsconfig.json
│
└── extensions/
    └── mastercard/
        └── kb/
            └── Mastercard_Platform_Config.txt
```


================================================================================
PART 2: EAP CONFIGURATION
================================================================================

File: eap-config.ts
-------------------

```typescript
/**
 * EAP Agent Configuration
 */

import { AgentConfig } from '@kessel-digital/agent-core/config';
import { EAP_SYSTEM_PROMPT } from './eap-prompt-content.js';
import { EAP_CRITIQUE_CRITERIA } from './eap-critique-criteria.js';

export const EAP_CONFIG: AgentConfig = {
  agent: 'eap',
  name: 'Enterprise AI Platform',
  description: 'Platform orchestration, administration, and user support for the Kessel Digital Agent ecosystem',
  
  knowledgeBase: {
    source: 'local',
    path: '../../../kb',
  },
  
  systemPrompt: EAP_SYSTEM_PROMPT,
  critiqueCriteria: EAP_CRITIQUE_CRITERIA,
  
  tools: [
    {
      name: 'search_knowledge_base',
      description: 'Search EAP documentation for platform information',
      parameters: {
        query: { type: 'string', description: 'Search query' },
        topK: { type: 'number', description: 'Number of results' },
      },
      required: ['query'],
    },
    {
      name: 'get_agent_info',
      description: 'Get information about available agents',
      parameters: {
        agent: { type: 'string', description: 'Agent name (mpa, ca, or all)', enum: ['mpa', 'ca', 'all'] },
      },
      required: ['agent'],
    },
    {
      name: 'get_platform_status',
      description: 'Get current platform status and health',
      parameters: {},
      required: [],
    },
    {
      name: 'route_to_agent',
      description: 'Route user to appropriate specialized agent',
      parameters: {
        agent: { type: 'string', description: 'Target agent', enum: ['mpa', 'ca'] },
        context: { type: 'string', description: 'Context to pass to agent' },
      },
      required: ['agent'],
    },
  ],
};
```


================================================================================
PART 3: EAP SYSTEM PROMPT
================================================================================

File: eap-prompt-content.ts
---------------------------

```typescript
/**
 * EAP System Prompt
 */

export const EAP_SYSTEM_PROMPT = `You are the Enterprise AI Platform (EAP) assistant, the central hub for the Kessel Digital Agent ecosystem. Your role is to help users navigate the platform, route them to appropriate specialized agents, and provide administrative support.

CORE RESPONSIBILITIES

1. AGENT ROUTING
   - Understand user needs and route to the appropriate agent
   - MPA (Media Planning Agent): Media strategy, campaign planning, budget allocation
   - CA (Consulting Agent): Business strategy, transformation, organizational change
   - Handle requests that don't fit specialized agents

2. PLATFORM SUPPORT
   - Answer questions about platform capabilities
   - Guide users through features and settings
   - Troubleshoot common issues
   - Escalate technical problems appropriately

3. USER ONBOARDING
   - Welcome new users and explain available agents
   - Help users understand which agent fits their needs
   - Provide getting-started guidance

4. ADMINISTRATIVE FUNCTIONS
   - Explain access and permissions
   - Guide configuration and settings
   - Provide usage analytics when requested

AGENT CATALOG

MPA (Media Planning Agent)
- Purpose: Media planning and advertising strategy
- Use for: Campaign planning, budget allocation, channel mix, audience targeting, benchmarks
- Expertise: Digital advertising, media metrics, audience sizing, performance optimization

CA (Consulting Agent)  
- Purpose: Strategic business consulting
- Use for: Transformation initiatives, technology assessment, stakeholder alignment, change management
- Expertise: Business strategy, organizational change, executive communication

ROUTING GUIDELINES

Route to MPA when user mentions:
- Advertising, media, campaigns
- Budget allocation for marketing
- Audience targeting, reach, frequency
- CPM, CTR, CAC, ROAS, conversion rates
- Channels: display, video, social, search, CTV

Route to CA when user mentions:
- Business transformation, digital transformation
- Organizational change, restructuring
- Technology evaluation, vendor selection
- Stakeholder alignment, executive buy-in
- Strategy development, roadmaps

Handle directly when:
- Questions about the platform itself
- User doesn't know which agent they need
- Technical issues or access problems
- General questions about capabilities

RESPONSE GUIDELINES

1. Be helpful and welcoming
2. Ask clarifying questions when routing is unclear
3. Provide brief context when routing to another agent
4. Acknowledge limitations and escalate when appropriate
5. Keep responses concise and action-oriented

KNOWLEDGE BASE

You have access to tools for:
- Searching platform documentation
- Getting agent information
- Checking platform status
- Routing to specialized agents

Always use these tools to provide accurate, up-to-date information.
`;
```


================================================================================
PART 4: EAP CRITIQUE CRITERIA
================================================================================

File: eap-critique-criteria.ts
------------------------------

```typescript
/**
 * EAP Self-Critique Criteria
 */

import { CritiqueCriterion } from '@kessel-digital/agent-core/config';

export const EAP_CRITIQUE_CRITERIA: CritiqueCriterion[] = [
  {
    name: 'routing-clarity',
    rule: 'When routing to another agent, clearly explain why and what the user can expect',
    badExample: 'You should talk to MPA.',
    goodExample: 'Based on your media planning needs, I\'ll connect you with MPA (Media Planning Agent). MPA specializes in campaign strategy and budget allocation. It will help you develop your channel mix and audience targeting.',
    autoFix: 'Add explanation of why routing and what to expect',
  },
  {
    name: 'platform-accuracy',
    rule: 'Platform information must be accurate and cite documentation',
    badExample: 'The platform can do that.',
    goodExample: 'Based on Knowledge Base, the platform supports three deployment modes: development, staging, and production. Each has different access controls.',
    autoFix: 'Add citation and specific details',
  },
  {
    name: 'helpful-alternatives',
    rule: 'When unable to help directly, provide alternative paths forward',
    badExample: 'I can\'t help with that.',
    goodExample: 'That\'s outside my current capabilities, but you have two options: (1) Contact your platform administrator for access configuration, or (2) Submit a feature request through the feedback channel.',
    autoFix: 'Add alternative options or next steps',
  },
  {
    name: 'welcoming-tone',
    rule: 'Maintain a helpful, welcoming tone especially for new users',
    badExample: 'What do you need?',
    goodExample: 'Welcome! I\'m here to help you get started with the platform. What would you like to accomplish today?',
    autoFix: 'Add welcoming language',
  },
];
```


================================================================================
PART 5: EAP SCENARIOS
================================================================================

File: scenarios/index.ts
------------------------

```typescript
/**
 * EAP Scenarios Index
 */

import { Scenario } from '@kessel-digital/agent-core/evaluation';

import { agentRouting } from './agent-routing.js';
import { platformStatus } from './platform-status.js';
import { userOnboarding } from './user-onboarding.js';
import { troubleshooting } from './troubleshooting.js';
import { analyticsRequest } from './analytics-request.js';
import { configurationHelp } from './configuration-help.js';

export const EAP_SCENARIOS: Scenario[] = [
  agentRouting,
  platformStatus,
  userOnboarding,
  troubleshooting,
  analyticsRequest,
  configurationHelp,
];

export const EAP_FAST_SCENARIOS: Scenario[] = [
  agentRouting,
  userOnboarding,
];
```


File: scenarios/agent-routing.ts
--------------------------------

```typescript
/**
 * Agent Routing Scenario
 */

import { Scenario } from '@kessel-digital/agent-core/evaluation';

export const agentRouting: Scenario = {
  id: 'eap-agent-routing',
  name: 'Agent Routing',
  description: 'Tests ability to correctly route users to specialized agents',
  tags: ['routing', 'core'],
  
  steps: [
    {
      step: 1,
      userMessage: 'I need help planning a Q2 advertising campaign for our new product launch.',
      expectedBehaviors: [
        'Recognize this as media planning need',
        'Route to MPA',
        'Explain what MPA can help with',
      ],
    },
    {
      step: 2,
      userMessage: 'Actually, before we get into the campaign, we\'re also going through a digital transformation and need to figure out our technology stack.',
      expectedBehaviors: [
        'Recognize shift to consulting need',
        'Offer CA for transformation help',
        'Clarify which they want to address first',
      ],
    },
    {
      step: 3,
      userMessage: 'Let\'s start with the transformation piece. We need to modernize our marketing technology.',
      expectedBehaviors: [
        'Route to CA',
        'Provide context about martech transformation',
        'Smooth handoff',
      ],
    },
  ],
  
  expectedOutcomes: [
    'Correctly identified MPA need initially',
    'Recognized CA need when context changed',
    'Provided clear routing with context',
  ],
};
```


File: scenarios/user-onboarding.ts
----------------------------------

```typescript
/**
 * User Onboarding Scenario
 */

import { Scenario } from '@kessel-digital/agent-core/evaluation';

export const userOnboarding: Scenario = {
  id: 'eap-user-onboarding',
  name: 'User Onboarding',
  description: 'Tests ability to welcome and orient new users',
  tags: ['onboarding', 'core'],
  
  steps: [
    {
      step: 1,
      userMessage: 'Hi, I\'m new here. What is this platform?',
      expectedBehaviors: [
        'Welcome the user',
        'Explain platform purpose',
        'Introduce available agents',
      ],
    },
    {
      step: 2,
      userMessage: 'What\'s the difference between MPA and CA?',
      expectedBehaviors: [
        'Clearly explain each agent',
        'Provide use case examples',
        'Help user identify their needs',
      ],
    },
    {
      step: 3,
      userMessage: 'I work in marketing and need help with both campaigns and broader strategy. Which should I use?',
      expectedBehaviors: [
        'Acknowledge dual needs',
        'Suggest starting point',
        'Explain both are available',
      ],
    },
  ],
  
  expectedOutcomes: [
    'Provided welcoming introduction',
    'Clearly differentiated agents',
    'Helped user identify appropriate path',
  ],
};
```


================================================================================
PART 6: EAP SCORERS
================================================================================

File: scorers/index.ts
----------------------

```typescript
/**
 * EAP Scorers Index
 */

import { Scorer } from '@kessel-digital/agent-core/evaluation';

import { RoutingAccuracyScorer } from './routing-accuracy.js';
import { PlatformKnowledgeScorer } from './platform-knowledge.js';
import { HelpfulGuidanceScorer } from './helpful-guidance.js';
import { EscalationAppropriatenessScorer } from './escalation-appropriateness.js';

export const EAP_SCORERS: Scorer[] = [
  new RoutingAccuracyScorer(),
  new PlatformKnowledgeScorer(),
  new HelpfulGuidanceScorer(),
  new EscalationAppropriatenessScorer(),
];
```


File: scorers/routing-accuracy.ts
---------------------------------

```typescript
/**
 * Routing Accuracy Scorer
 */

import { RuleBasedScorer, ScorerResult, ConversationContext } from '@kessel-digital/agent-core/evaluation';

export class RoutingAccuracyScorer extends RuleBasedScorer {
  name = 'routing-accuracy';
  description = 'Evaluates correctness of agent routing decisions';

  async evaluate(response: string, context: ConversationContext): Promise<ScorerResult> {
    let score = 0;
    const details: string[] = [];

    // Check if routing was needed based on conversation
    const lastUserMessage = context.transcript
      .filter(t => t.role === 'user')
      .pop()?.content.toLowerCase() || '';

    const needsMPA = /campaign|advertising|media|budget|channel|audience|cpm|ctr|reach/i.test(lastUserMessage);
    const needsCA = /transformation|strategy|stakeholder|change management|technology assessment/i.test(lastUserMessage);

    // Check response for appropriate routing
    const mentionsMPA = this.checkPattern(response, /MPA|Media Planning Agent/i);
    const mentionsCA = this.checkPattern(response, /CA|Consulting Agent/i);

    if (needsMPA && mentionsMPA) {
      score += 0.5;
      details.push('Correctly identified MPA need');
    }
    if (needsCA && mentionsCA) {
      score += 0.5;
      details.push('Correctly identified CA need');
    }
    if (!needsMPA && !needsCA) {
      score = 0.8;
      details.push('Handled directly (appropriate)');
    }

    // Check for context/explanation
    const providesContext = this.checkPattern(response, /specialize|help with|can assist|will help/i);
    if (providesContext) {
      score = Math.min(1.0, score + 0.2);
      details.push('Provided routing context');
    }

    return {
      name: this.name,
      score: Math.min(1.0, score),
      passed: score >= 0.5,
      details: details.join('; '),
    };
  }
}
```


File: scorers/helpful-guidance.ts
---------------------------------

```typescript
/**
 * Helpful Guidance Scorer
 */

import { RuleBasedScorer, ScorerResult, ConversationContext } from '@kessel-digital/agent-core/evaluation';

export class HelpfulGuidanceScorer extends RuleBasedScorer {
  name = 'helpful-guidance';
  description = 'Evaluates helpfulness and clarity of guidance provided';

  async evaluate(response: string, context: ConversationContext): Promise<ScorerResult> {
    let score = 0;
    const details: string[] = [];

    // Check for welcoming/helpful tone
    const helpfulTone = this.checkPattern(response, /help|assist|guide|happy to|let me|I can/i);
    if (helpfulTone) {
      score += 0.3;
      details.push('Helpful tone');
    }

    // Check for clear explanation
    const hasExplanation = this.checkPattern(response, /because|this means|which allows|so you can/i);
    if (hasExplanation) {
      score += 0.3;
      details.push('Provides explanation');
    }

    // Check for next steps
    const hasNextSteps = this.checkPattern(response, /next|start by|first|would you like|shall I/i);
    if (hasNextSteps) {
      score += 0.4;
      details.push('Offers next steps');
    }

    return {
      name: this.name,
      score,
      passed: score >= 0.5,
      details: details.join('; '),
    };
  }
}
```


================================================================================
PART 7: EAP EVALUATION RUNNER
================================================================================

File: eap-eval.ts
-----------------

```typescript
/**
 * EAP Evaluation Runner
 */

import * as dotenv from 'dotenv';
dotenv.config();

import {
  getPlatformConfig,
  ProviderFactory,
  EmbeddingFactory,
  StoreFactory,
  RetrievalEngine,
  RAGToolExecutor,
  CritiqueEngine,
  ConversationEngine,
  ScenarioRunner,
  ReportGenerator,
} from '@kessel-digital/agent-core';

import { EAP_CONFIG } from './eap-config.js';
import { EAP_SCENARIOS, EAP_FAST_SCENARIOS } from './scenarios/index.js';
import { EAP_SCORERS } from './scorers/index.js';

async function main() {
  const args = process.argv.slice(2);
  const fast = args.includes('--fast');
  const platform = args.find(a => a.startsWith('--platform='))?.split('=')[1] || 'braintrust';
  
  console.log(`\n🎯 EAP Evaluation`);
  console.log(`Platform: ${platform}`);
  console.log(`Mode: ${fast ? 'Fast' : 'Full'}`);
  
  const platformConfig = getPlatformConfig(platform as any);
  
  const llmProvider = ProviderFactory.createLLM(platformConfig.llm.primary);
  const critiqueProvider = platformConfig.llm.critique 
    ? ProviderFactory.createLLM(platformConfig.llm.critique)
    : llmProvider;
  const embeddingProvider = EmbeddingFactory.create(platformConfig.embeddings);
  const vectorStore = StoreFactory.create(platformConfig.vectorStore, embeddingProvider);
  
  const ragEngine = new RetrievalEngine(embeddingProvider, vectorStore, {
    kbPath: EAP_CONFIG.knowledgeBase.path!,
    indexPath: './storage/eap-kb-index.json',
  });
  
  console.log('Initializing RAG engine...');
  await ragEngine.initialize();
  
  const ragTools = new RAGToolExecutor(ragEngine, 'EAP');
  
  const critiqueEngine = new CritiqueEngine(critiqueProvider, {
    selfCritiqueEnabled: platformConfig.features.selfCritiqueEnabled,
    critiqueCriteria: EAP_CONFIG.critiqueCriteria,
    selfCritiqueModel: platformConfig.learning.selfCritiqueModel,
    successPatternsEnabled: false,
    minScoreThreshold: 0.95,
    maxPatternsToRetrieve: 2,
    kbEnhancementEnabled: false,
    userFeedbackEnabled: false,
  });
  
  const scenarios = fast ? EAP_FAST_SCENARIOS : EAP_SCENARIOS;
  
  console.log(`Running ${scenarios.length} scenarios...\n`);
  
  const results = [];
  
  for (const scenario of scenarios) {
    console.log(`📋 ${scenario.name}...`);
    
    const engine = new ConversationEngine({
      provider: llmProvider,
      systemPrompt: EAP_CONFIG.systemPrompt,
      ragToolExecutor: ragTools,
      critiqueEngine,
    });
    
    const runner = new ScenarioRunner({
      engine,
      scorers: EAP_SCORERS,
    });
    
    const result = await runner.run(scenario);
    results.push(result);
    
    const status = result.passed ? '✅' : '❌';
    console.log(`   ${status} ${(result.compositeScore * 100).toFixed(1)}%\n`);
  }
  
  const reportGenerator = new ReportGenerator();
  const report = await reportGenerator.generate(results, platform, 'eap');
  
  const timestamp = Date.now();
  await reportGenerator.saveReport(report, `./outputs/eap-eval-${timestamp}.json`);
  
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Scenarios: ${report.summary.totalScenarios}`);
  console.log(`Passed: ${report.summary.passed}`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log(`Composite Score: ${(report.summary.compositeScore * 100).toFixed(1)}%`);
  
  process.exit(report.summary.compositeScore >= 0.92 ? 0 : 1);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```


================================================================================
PART 8: EAP PACKAGE.JSON
================================================================================

```json
{
  "name": "eap-evaluation",
  "version": "1.0.0",
  "description": "EAP Agent Evaluation Harness",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "eval": "node dist/eap-eval.js",
    "eval:fast": "node dist/eap-eval.js --fast",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@kessel-digital/agent-core": "file:../../../../../../packages/agent-core",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  }
}
```


================================================================================
END OF EAP SPECIFICATION
================================================================================
