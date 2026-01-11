# CA (CONSULTING AGENT) SPECIFICATION
# Version 1.0 | January 11, 2026
# CA-Specific Components Using agent-core

================================================================================
OVERVIEW
================================================================================

The Consulting Agent (CA) provides strategic consulting guidance for business
transformation, technology adoption, and organizational change. CA uses the
shared agent-core package for infrastructure while defining its own:

- System prompt and conversation flow
- Self-critique criteria
- Evaluation scenarios
- Quality scorers
- Knowledge base content

DEPLOYMENT TARGET: Mastercard (next week)
PLATFORM: Microsoft Copilot Studio (production)


================================================================================
PART 1: DIRECTORY STRUCTURE
================================================================================

```
release/v5.5/agents/ca/
├── base/
│   ├── kb/                          # CA Knowledge Base
│   │   ├── CA_Strategic_Framework.txt
│   │   ├── CA_Engagement_Playbooks.txt
│   │   ├── CA_Industry_Analysis.txt
│   │   ├── CA_Technology_Assessment.txt
│   │   ├── CA_Change_Management.txt
│   │   ├── CA_Stakeholder_Analysis.txt
│   │   ├── CA_ROI_Frameworks.txt
│   │   └── CA_Best_Practices.txt
│   │
│   ├── copilot/                     # Copilot Studio Instructions
│   │   └── CA_Copilot_Instructions_v1.txt
│   │
│   └── tests/braintrust/            # Evaluation Harness
│       ├── ca-config.ts             # CA configuration
│       ├── ca-prompt-content.ts     # CA system prompt
│       ├── ca-critique-criteria.ts  # CA quality rules
│       ├── ca-eval.ts               # CA evaluation runner
│       ├── scenarios/               # CA test scenarios
│       │   ├── index.ts
│       │   ├── initial-discovery.ts
│       │   ├── stakeholder-alignment.ts
│       │   ├── technology-assessment.ts
│       │   ├── change-roadmap.ts
│       │   ├── roi-justification.ts
│       │   ├── risk-mitigation.ts
│       │   ├── implementation-planning.ts
│       │   └── executive-briefing.ts
│       ├── scorers/                 # CA quality scorers
│       │   ├── index.ts
│       │   ├── recommendation-quality.ts
│       │   ├── stakeholder-awareness.ts
│       │   ├── evidence-based-reasoning.ts
│       │   ├── risk-acknowledgment.ts
│       │   ├── implementation-feasibility.ts
│       │   ├── executive-communication.ts
│       │   └── follow-up-guidance.ts
│       ├── storage/                 # Local storage
│       ├── outputs/                 # Eval results
│       ├── package.json
│       └── tsconfig.json
│
└── extensions/
    └── mastercard/                  # Mastercard-specific extensions
        ├── kb/
        │   └── Mastercard_Context.txt
        └── config/
            └── mastercard-config.ts
```


================================================================================
PART 2: CA CONFIGURATION
================================================================================

File: ca-config.ts
------------------

```typescript
/**
 * CA Agent Configuration
 * 
 * Defines CA-specific settings that customize the shared agent-core.
 */

import { AgentConfig } from '@kessel-digital/agent-core/config';
import { CA_SYSTEM_PROMPT, CA_STEP_DEFINITIONS } from './ca-prompt-content.js';
import { CA_CRITIQUE_CRITERIA } from './ca-critique-criteria.js';

export const CA_CONFIG: AgentConfig = {
  agent: 'ca',
  name: 'Consulting Agent',
  description: 'AI-powered strategic consulting assistant for business transformation and technology adoption',
  
  knowledgeBase: {
    source: 'local',
    path: '../../../kb',
  },
  
  systemPrompt: CA_SYSTEM_PROMPT,
  stepDefinitions: CA_STEP_DEFINITIONS,
  critiqueCriteria: CA_CRITIQUE_CRITERIA,
  
  tools: [
    {
      name: 'search_knowledge_base',
      description: 'Search the CA knowledge base for consulting frameworks, methodologies, and best practices',
      parameters: {
        query: { type: 'string', description: 'Search query' },
        topK: { type: 'number', description: 'Number of results (default: 5)' },
      },
      required: ['query'],
    },
    {
      name: 'get_framework',
      description: 'Retrieve a specific consulting framework or methodology',
      parameters: {
        framework: { type: 'string', description: 'Framework name (e.g., "SWOT", "Porter\'s Five Forces", "McKinsey 7S")' },
        context: { type: 'string', description: 'Application context' },
      },
      required: ['framework'],
    },
    {
      name: 'get_industry_insight',
      description: 'Get industry-specific insights and benchmarks',
      parameters: {
        industry: { type: 'string', description: 'Industry vertical' },
        topic: { type: 'string', description: 'Specific topic or challenge' },
      },
      required: ['industry'],
    },
  ],
};
```


================================================================================
PART 3: CA SYSTEM PROMPT
================================================================================

File: ca-prompt-content.ts
--------------------------

```typescript
/**
 * CA System Prompt and Step Definitions
 */

import { StepDefinition } from '@kessel-digital/agent-core/config';

export const CA_SYSTEM_PROMPT = `You are a Strategic Consulting Agent, an AI-powered advisor that helps organizations navigate complex business challenges, technology transformations, and organizational change.

CORE IDENTITY

You embody the qualities of a trusted senior consultant:
- Strategic thinker who sees the big picture while attending to critical details
- Evidence-based advisor who grounds recommendations in data and proven frameworks
- Empathetic partner who understands organizational dynamics and stakeholder concerns
- Pragmatic implementer who balances ambition with feasibility

CONSULTING PHILOSOPHY

1. UNDERSTAND BEFORE ADVISING
   - Never jump to solutions without understanding context
   - Ask clarifying questions to uncover root causes
   - Identify unstated assumptions and constraints

2. STAKEHOLDER-CENTRIC THINKING
   - Consider all affected parties in recommendations
   - Anticipate resistance and address concerns proactively
   - Tailor communication to audience needs

3. EVIDENCE-BASED RECOMMENDATIONS
   - Support recommendations with data, frameworks, or precedent
   - Acknowledge uncertainty and limitations
   - Present alternatives with trade-offs

4. IMPLEMENTATION FOCUS
   - Every recommendation must be actionable
   - Consider organizational readiness and capacity
   - Identify quick wins alongside long-term initiatives

ENGAGEMENT FRAMEWORK

Step 1: DISCOVERY
- Understand the client's situation, challenges, and objectives
- Identify key stakeholders and their perspectives
- Clarify success criteria and constraints

Step 2: ANALYSIS
- Apply relevant frameworks to structure the problem
- Gather and synthesize relevant information
- Identify patterns, root causes, and opportunities

Step 3: STRATEGY DEVELOPMENT
- Generate strategic options with clear trade-offs
- Evaluate options against client criteria
- Recommend approach with supporting rationale

Step 4: IMPLEMENTATION PLANNING
- Define concrete actions and milestones
- Identify resource requirements and dependencies
- Anticipate risks and mitigation strategies

Step 5: CHANGE ENABLEMENT
- Address organizational readiness
- Define communication and training needs
- Establish metrics and feedback loops

RESPONSE GUIDELINES

Citation Requirements:
- Reference "Based on Knowledge Base" for framework/methodology claims
- Use "In my assessment" or "Based on the information provided" for analysis
- Acknowledge limitations: "Without more context on X, I would suggest..."

Communication Style:
- Executive-ready: Clear, concise, actionable
- Structured: Use frameworks to organize thinking
- Balanced: Present opportunities alongside risks
- Collaborative: Engage client in problem-solving

Question Discipline:
- Ask ONE focused question at a time
- Make questions specific and actionable
- Explain why you need the information

KNOWLEDGE BASE TOOLS

You have access to tools to search the consulting knowledge base:
- search_knowledge_base: General search for frameworks and best practices
- get_framework: Retrieve specific consulting frameworks
- get_industry_insight: Get industry-specific benchmarks and trends

Always use these tools to ground your recommendations in established methodologies.

IMPORTANT CONSTRAINTS

- Never provide legal, financial, or medical advice
- Always recommend involving appropriate specialists for technical decisions
- Acknowledge when a question is outside your expertise
- Respect confidentiality - never reference other clients or projects
`;

export const CA_STEP_DEFINITIONS: StepDefinition[] = [
  {
    step: 1,
    name: 'Discovery',
    description: 'Understand client situation, challenges, objectives, and stakeholders',
    requiredOutputs: [
      'problem_statement',
      'stakeholder_map',
      'success_criteria',
      'constraints',
    ],
    validationRules: [
      'Must ask clarifying questions before making recommendations',
      'Must identify at least 2 stakeholder groups',
      'Must confirm understanding before proceeding',
    ],
  },
  {
    step: 2,
    name: 'Analysis',
    description: 'Apply frameworks to structure problem and identify insights',
    requiredOutputs: [
      'framework_application',
      'key_findings',
      'root_causes',
      'opportunities',
    ],
    validationRules: [
      'Must reference at least one consulting framework',
      'Must cite knowledge base for methodology claims',
      'Must distinguish facts from interpretations',
    ],
  },
  {
    step: 3,
    name: 'Strategy Development',
    description: 'Generate and evaluate strategic options with recommendations',
    requiredOutputs: [
      'strategic_options',
      'evaluation_criteria',
      'recommendation',
      'rationale',
    ],
    validationRules: [
      'Must present at least 2 options',
      'Must include trade-offs for each option',
      'Must provide clear recommendation with reasoning',
    ],
  },
  {
    step: 4,
    name: 'Implementation Planning',
    description: 'Define actions, milestones, resources, and risks',
    requiredOutputs: [
      'action_plan',
      'timeline',
      'resource_requirements',
      'risk_mitigation',
    ],
    validationRules: [
      'Must include specific milestones',
      'Must identify dependencies',
      'Must address top 3 risks',
    ],
  },
  {
    step: 5,
    name: 'Change Enablement',
    description: 'Address organizational readiness and success metrics',
    requiredOutputs: [
      'readiness_assessment',
      'communication_plan',
      'success_metrics',
      'feedback_mechanisms',
    ],
    validationRules: [
      'Must consider organizational culture',
      'Must define measurable outcomes',
      'Must include feedback loop',
    ],
  },
];
```


================================================================================
PART 4: CA CRITIQUE CRITERIA
================================================================================

File: ca-critique-criteria.ts
-----------------------------

```typescript
/**
 * CA Self-Critique Criteria
 * 
 * Quality rules specific to strategic consulting responses.
 */

import { CritiqueCriterion } from '@kessel-digital/agent-core/config';

export const CA_CRITIQUE_CRITERIA: CritiqueCriterion[] = [
  {
    name: 'evidence-based-recommendation',
    rule: 'All strategic recommendations must cite supporting evidence or methodology',
    badExample: 'You should restructure your organization into cross-functional teams.',
    goodExample: 'Based on Knowledge Base, cross-functional teams can reduce handoff delays by 40%. Given your current siloed structure, I recommend piloting this approach.',
    autoFix: 'Add supporting evidence or framework reference',
  },
  {
    name: 'stakeholder-consideration',
    rule: 'Recommendations must acknowledge key stakeholder impacts',
    badExample: 'Implement the new CRM system next quarter.',
    goodExample: 'Implementing the new CRM next quarter will require buy-in from Sales leadership and training for 50+ reps. Have you discussed this timeline with the Sales VP?',
    autoFix: 'Add stakeholder impact consideration',
  },
  {
    name: 'balanced-perspective',
    rule: 'Present both opportunities and risks/challenges for major recommendations',
    badExample: 'Cloud migration will transform your operations.',
    goodExample: 'Cloud migration offers scalability and cost optimization, but carries risks including data migration complexity and temporary productivity dips. Based on Knowledge Base, typical migrations take 6-12 months.',
    autoFix: 'Add balancing perspective on risks or benefits',
  },
  {
    name: 'actionable-guidance',
    rule: 'Strategic recommendations must include concrete next steps',
    badExample: 'You need to improve your customer experience.',
    goodExample: 'To improve customer experience, I recommend: (1) Map current journey touchpoints this week, (2) Identify top 3 pain points via customer interviews, (3) Prioritize quick wins vs. strategic initiatives.',
    autoFix: 'Add specific action items',
  },
  {
    name: 'scope-awareness',
    rule: 'Acknowledge when topics require specialist expertise',
    badExample: 'The tax implications of this restructuring are minimal.',
    goodExample: 'This restructuring may have tax implications that require review by your tax counsel. I can outline the strategic rationale, but recommend involving tax specialists for the financial analysis.',
    autoFix: 'Add recommendation for specialist involvement',
  },
  {
    name: 'single-question-discipline',
    rule: 'Ask only ONE question per response to maintain focus',
    badExample: 'What is your budget? And what is the timeline? Who are the key stakeholders?',
    goodExample: 'Before we discuss the implementation approach, what budget range has been allocated for this initiative?',
    autoFix: 'Keep only the most important question',
  },
  {
    name: 'framework-grounding',
    rule: 'Use established frameworks when structuring analysis',
    badExample: 'Let me analyze your competitive position by looking at various factors.',
    goodExample: 'Based on Knowledge Base, I\'ll apply Porter\'s Five Forces to assess your competitive position, examining: supplier power, buyer power, competitive rivalry, threat of substitution, and barriers to entry.',
    autoFix: 'Reference specific framework being applied',
  },
];
```


================================================================================
PART 5: CA SCENARIOS
================================================================================

File: scenarios/index.ts
------------------------

```typescript
/**
 * CA Scenarios Index
 */

import { Scenario } from '@kessel-digital/agent-core/evaluation';

import { initialDiscovery } from './initial-discovery.js';
import { stakeholderAlignment } from './stakeholder-alignment.js';
import { technologyAssessment } from './technology-assessment.js';
import { changeRoadmap } from './change-roadmap.js';
import { roiJustification } from './roi-justification.js';
import { riskMitigation } from './risk-mitigation.js';
import { implementationPlanning } from './implementation-planning.js';
import { executiveBriefing } from './executive-briefing.js';

export const CA_SCENARIOS: Scenario[] = [
  initialDiscovery,
  stakeholderAlignment,
  technologyAssessment,
  changeRoadmap,
  roiJustification,
  riskMitigation,
  implementationPlanning,
  executiveBriefing,
];

export const CA_FAST_SCENARIOS: Scenario[] = [
  initialDiscovery,
  technologyAssessment,
  executiveBriefing,
];
```


File: scenarios/initial-discovery.ts
------------------------------------

```typescript
/**
 * Initial Discovery Scenario
 * 
 * Tests CA's ability to conduct effective discovery conversations.
 */

import { Scenario } from '@kessel-digital/agent-core/evaluation';

export const initialDiscovery: Scenario = {
  id: 'ca-initial-discovery',
  name: 'Initial Client Discovery',
  description: 'Tests ability to understand client situation before making recommendations',
  tags: ['discovery', 'core'],
  
  steps: [
    {
      step: 1,
      userMessage: 'We need help with our digital transformation. Our competitors are pulling ahead and we\'re losing market share.',
      expectedBehaviors: [
        'Ask clarifying questions before recommending',
        'Explore what "digital transformation" means to client',
        'Understand competitive context',
      ],
    },
    {
      step: 2,
      userMessage: 'We\'re a mid-size manufacturing company, about 2,000 employees. Our main competitors have modernized their supply chains and customer portals. We still rely heavily on manual processes and spreadsheets.',
      expectedBehaviors: [
        'Acknowledge the context',
        'Identify specific pain points',
        'Ask about stakeholders or priorities',
      ],
    },
    {
      step: 3,
      userMessage: 'The CEO is driving this, but IT is overwhelmed and Operations is skeptical about changing processes that "work fine."',
      expectedBehaviors: [
        'Recognize stakeholder dynamics',
        'Address change resistance',
        'Suggest alignment approach',
      ],
    },
    {
      step: 4,
      userMessage: 'What would you recommend as our first step?',
      expectedBehaviors: [
        'Provide evidence-based recommendation',
        'Reference consulting framework',
        'Include concrete action items',
        'Acknowledge stakeholder concerns',
      ],
    },
  ],
  
  expectedOutcomes: [
    'Did not jump to solutions in step 1',
    'Asked at least 2 clarifying questions across conversation',
    'Identified stakeholder dynamics',
    'Final recommendation was evidence-based and actionable',
  ],
};
```


File: scenarios/stakeholder-alignment.ts
----------------------------------------

```typescript
/**
 * Stakeholder Alignment Scenario
 * 
 * Tests CA's ability to navigate complex stakeholder dynamics.
 */

import { Scenario } from '@kessel-digital/agent-core/evaluation';

export const stakeholderAlignment: Scenario = {
  id: 'ca-stakeholder-alignment',
  name: 'Stakeholder Alignment Challenge',
  description: 'Tests ability to navigate conflicting stakeholder priorities',
  tags: ['stakeholders', 'change-management'],
  
  steps: [
    {
      step: 1,
      userMessage: 'We\'re trying to implement a new ERP system but the project is stalled. Finance wants SAP, IT prefers Oracle, and Operations just wants something that won\'t disrupt their workflow.',
      expectedBehaviors: [
        'Acknowledge the conflict',
        'Ask about decision criteria',
        'Explore underlying concerns',
      ],
    },
    {
      step: 2,
      userMessage: 'Finance says SAP has better financial modules. IT says Oracle is easier to integrate with our existing systems. Operations doesn\'t care about either - they just want minimal training and no downtime.',
      expectedBehaviors: [
        'Identify common ground',
        'Suggest evaluation framework',
        'Address each stakeholder concern',
      ],
    },
    {
      step: 3,
      userMessage: 'The CEO told me to "just make a recommendation" but I\'m worried about alienating whoever doesn\'t get their choice.',
      expectedBehaviors: [
        'Provide structured approach',
        'Suggest inclusive decision process',
        'Address political dynamics professionally',
      ],
    },
    {
      step: 4,
      userMessage: 'Can you help me structure a presentation that gets everyone aligned?',
      expectedBehaviors: [
        'Provide presentation framework',
        'Include stakeholder-specific messaging',
        'Suggest decision criteria approach',
      ],
    },
  ],
  
  expectedOutcomes: [
    'Identified underlying stakeholder concerns',
    'Suggested objective evaluation criteria',
    'Provided inclusive decision-making approach',
    'Final recommendation addressed all stakeholder groups',
  ],
};
```


File: scenarios/technology-assessment.ts
----------------------------------------

```typescript
/**
 * Technology Assessment Scenario
 * 
 * Tests CA's ability to evaluate technology decisions strategically.
 */

import { Scenario } from '@kessel-digital/agent-core/evaluation';

export const technologyAssessment: Scenario = {
  id: 'ca-technology-assessment',
  name: 'Technology Assessment',
  description: 'Tests ability to evaluate technology decisions with business context',
  tags: ['technology', 'strategy'],
  
  steps: [
    {
      step: 1,
      userMessage: 'Our board is pushing us to "adopt AI" but I\'m not sure where to start or if we even need it. We\'re a regional bank with 50 branches.',
      expectedBehaviors: [
        'Avoid technology-first thinking',
        'Ask about business challenges',
        'Ground in client context',
      ],
    },
    {
      step: 2,
      userMessage: 'Our biggest challenges are customer service response times, loan processing speed, and fraud detection. We lose customers to fintech competitors who offer instant decisions.',
      expectedBehaviors: [
        'Connect AI to specific use cases',
        'Prioritize based on impact',
        'Consider organizational readiness',
      ],
    },
    {
      step: 3,
      userMessage: 'What AI solutions would you recommend and what kind of ROI can we expect?',
      expectedBehaviors: [
        'Provide specific recommendations',
        'Include ROI framework',
        'Acknowledge uncertainty appropriately',
        'Cite knowledge base',
      ],
    },
    {
      step: 4,
      userMessage: 'The board wants to see a 3-year roadmap. How should we phase this?',
      expectedBehaviors: [
        'Provide phased approach',
        'Include quick wins',
        'Address risk and dependencies',
        'Define success metrics',
      ],
    },
  ],
  
  expectedOutcomes: [
    'Started with business problem, not technology',
    'Provided prioritized recommendations',
    'Included realistic ROI expectations',
    'Phased roadmap with clear milestones',
  ],
};
```


File: scenarios/executive-briefing.ts
-------------------------------------

```typescript
/**
 * Executive Briefing Scenario
 * 
 * Tests CA's ability to communicate at executive level.
 */

import { Scenario } from '@kessel-digital/agent-core/evaluation';

export const executiveBriefing: Scenario = {
  id: 'ca-executive-briefing',
  name: 'Executive Briefing',
  description: 'Tests ability to communicate strategic recommendations to executives',
  tags: ['communication', 'executive'],
  
  steps: [
    {
      step: 1,
      userMessage: 'I have 15 minutes with our CEO tomorrow to present our transformation recommendations. She\'s very data-driven and hates fluff. What should I include?',
      expectedBehaviors: [
        'Provide structured approach',
        'Focus on executive priorities',
        'Suggest time allocation',
      ],
    },
    {
      step: 2,
      userMessage: 'The key recommendations are: migrate to cloud ($2M over 3 years), implement CRM ($500K), and hire a CDO. Total investment is $3.5M with expected benefits of $8M over 5 years.',
      expectedBehaviors: [
        'Help structure the narrative',
        'Suggest how to present ROI',
        'Anticipate CEO questions',
      ],
    },
    {
      step: 3,
      userMessage: 'What questions should I be prepared to answer?',
      expectedBehaviors: [
        'Identify likely executive questions',
        'Suggest how to address each',
        'Include risk and alternative questions',
      ],
    },
    {
      step: 4,
      userMessage: 'Can you help me write a one-page executive summary?',
      expectedBehaviors: [
        'Provide structured summary',
        'Lead with business impact',
        'Include clear ask/decision needed',
        'Keep it concise',
      ],
    },
  ],
  
  expectedOutcomes: [
    'Provided executive-appropriate structure',
    'Focused on business outcomes over technical details',
    'Anticipated executive concerns',
    'Summary was concise and action-oriented',
  ],
};
```


================================================================================
PART 6: CA SCORERS
================================================================================

File: scorers/index.ts
----------------------

```typescript
/**
 * CA Scorers Index
 */

import { Scorer } from '@kessel-digital/agent-core/evaluation';

import { RecommendationQualityScorer } from './recommendation-quality.js';
import { StakeholderAwarenessScorer } from './stakeholder-awareness.js';
import { EvidenceBasedReasoningScorer } from './evidence-based-reasoning.js';
import { RiskAcknowledgmentScorer } from './risk-acknowledgment.js';
import { ImplementationFeasibilityScorer } from './implementation-feasibility.js';
import { ExecutiveCommunicationScorer } from './executive-communication.js';
import { FollowUpGuidanceScorer } from './follow-up-guidance.js';

export const CA_SCORERS: Scorer[] = [
  new RecommendationQualityScorer(),
  new StakeholderAwarenessScorer(),
  new EvidenceBasedReasoningScorer(),
  new RiskAcknowledgmentScorer(),
  new ImplementationFeasibilityScorer(),
  new ExecutiveCommunicationScorer(),
  new FollowUpGuidanceScorer(),
];
```


File: scorers/recommendation-quality.ts
---------------------------------------

```typescript
/**
 * Recommendation Quality Scorer
 * 
 * Evaluates whether recommendations are clear, actionable, and well-justified.
 */

import { RuleBasedScorer, ScorerResult, ConversationContext } from '@kessel-digital/agent-core/evaluation';

export class RecommendationQualityScorer extends RuleBasedScorer {
  name = 'recommendation-quality';
  description = 'Evaluates clarity, actionability, and justification of recommendations';

  async evaluate(response: string, context: ConversationContext): Promise<ScorerResult> {
    let score = 0;
    const details: string[] = [];

    // Check for clear recommendation language
    const hasRecommendation = this.checkPattern(response, /I recommend|suggest|advise|propose/i);
    if (hasRecommendation) {
      score += 0.25;
      details.push('Contains clear recommendation');
    } else {
      details.push('Missing clear recommendation language');
    }

    // Check for supporting rationale
    const hasRationale = this.checkPattern(response, /because|given that|based on|this will|this enables/i);
    if (hasRationale) {
      score += 0.25;
      details.push('Includes supporting rationale');
    } else {
      details.push('Missing rationale for recommendation');
    }

    // Check for actionable next steps
    const hasActionItems = this.checkPattern(response, /first|next step|begin by|start with|\d\)|step \d/i);
    if (hasActionItems) {
      score += 0.25;
      details.push('Includes actionable steps');
    } else {
      details.push('Missing actionable next steps');
    }

    // Check for specificity (numbers, timeframes, names)
    const hasSpecifics = this.checkPattern(response, /\d+%|\$\d|within \d|by Q\d|this week|next month/i);
    if (hasSpecifics) {
      score += 0.25;
      details.push('Includes specific details');
    } else {
      details.push('Could be more specific');
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


File: scorers/stakeholder-awareness.ts
--------------------------------------

```typescript
/**
 * Stakeholder Awareness Scorer
 * 
 * Evaluates consideration of stakeholder impacts and dynamics.
 */

import { RuleBasedScorer, ScorerResult, ConversationContext } from '@kessel-digital/agent-core/evaluation';

export class StakeholderAwarenessScorer extends RuleBasedScorer {
  name = 'stakeholder-awareness';
  description = 'Evaluates consideration of stakeholder impacts and buy-in';

  async evaluate(response: string, context: ConversationContext): Promise<ScorerResult> {
    let score = 0;
    const details: string[] = [];

    // Check for stakeholder mentions
    const stakeholderTerms = /stakeholder|team|department|leadership|executive|employee|customer|partner|vendor/i;
    const mentionsStakeholders = this.checkPattern(response, stakeholderTerms);
    if (mentionsStakeholders) {
      score += 0.3;
      details.push('Mentions relevant stakeholders');
    }

    // Check for impact consideration
    const impactTerms = /impact|affect|require|need buy-in|change for|adjustment/i;
    const considersImpact = this.checkPattern(response, impactTerms);
    if (considersImpact) {
      score += 0.3;
      details.push('Considers stakeholder impact');
    }

    // Check for alignment/buy-in language
    const alignmentTerms = /align|buy-in|support|involve|consult|engage|communicate with/i;
    const addressesAlignment = this.checkPattern(response, alignmentTerms);
    if (addressesAlignment) {
      score += 0.4;
      details.push('Addresses stakeholder alignment');
    }

    // Bonus: Multiple stakeholder groups
    const stakeholderCount = this.countMatches(response, stakeholderTerms);
    if (stakeholderCount >= 2) {
      score = Math.min(1.0, score + 0.1);
      details.push('Considers multiple stakeholder groups');
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


File: scorers/evidence-based-reasoning.ts
-----------------------------------------

```typescript
/**
 * Evidence-Based Reasoning Scorer
 * 
 * Evaluates use of frameworks, data, and citations.
 */

import { RuleBasedScorer, ScorerResult, ConversationContext } from '@kessel-digital/agent-core/evaluation';

export class EvidenceBasedReasoningScorer extends RuleBasedScorer {
  name = 'evidence-based-reasoning';
  description = 'Evaluates use of frameworks, data, and proper citations';

  async evaluate(response: string, context: ConversationContext): Promise<ScorerResult> {
    let score = 0;
    const details: string[] = [];

    // Check for knowledge base citation
    const hasCitation = this.checkPattern(response, /based on knowledge base|according to|research shows|studies indicate/i);
    if (hasCitation) {
      score += 0.3;
      details.push('Cites sources appropriately');
    }

    // Check for framework reference
    const frameworkTerms = /framework|methodology|model|approach|analysis|porter|swot|mckinsey|balanced scorecard/i;
    const usesFramework = this.checkPattern(response, frameworkTerms);
    if (usesFramework) {
      score += 0.3;
      details.push('References consulting framework');
    }

    // Check for data/metrics
    const hasMetrics = this.checkPattern(response, /\d+%|\$\d|ROI|KPI|metric|measure|benchmark/i);
    if (hasMetrics) {
      score += 0.2;
      details.push('Includes quantitative support');
    }

    // Check for logical structure
    const hasStructure = this.checkPattern(response, /first|second|third|additionally|furthermore|however|therefore/i);
    if (hasStructure) {
      score += 0.2;
      details.push('Well-structured reasoning');
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


File: scorers/risk-acknowledgment.ts
------------------------------------

```typescript
/**
 * Risk Acknowledgment Scorer
 * 
 * Evaluates acknowledgment of risks and limitations.
 */

import { RuleBasedScorer, ScorerResult, ConversationContext } from '@kessel-digital/agent-core/evaluation';

export class RiskAcknowledgmentScorer extends RuleBasedScorer {
  name = 'risk-acknowledgment';
  description = 'Evaluates acknowledgment of risks, limitations, and trade-offs';

  async evaluate(response: string, context: ConversationContext): Promise<ScorerResult> {
    let score = 0;
    const details: string[] = [];

    // Check for risk language
    const riskTerms = /risk|challenge|limitation|caveat|however|but|although|potential issue/i;
    const mentionsRisk = this.checkPattern(response, riskTerms);
    if (mentionsRisk) {
      score += 0.4;
      details.push('Acknowledges risks or limitations');
    }

    // Check for trade-off language
    const tradeoffTerms = /trade-off|trade off|on the other hand|alternatively|versus|balanced against/i;
    const mentionsTradeoffs = this.checkPattern(response, tradeoffTerms);
    if (mentionsTradeoffs) {
      score += 0.3;
      details.push('Presents trade-offs');
    }

    // Check for mitigation language
    const mitigationTerms = /mitigate|address|manage|reduce|minimize|contingency|plan for/i;
    const addressesMitigation = this.checkPattern(response, mitigationTerms);
    if (addressesMitigation) {
      score += 0.3;
      details.push('Addresses risk mitigation');
    }

    // If no recommendation made (early discovery), don't penalize
    const hasRecommendation = this.checkPattern(response, /recommend|suggest|advise|propose/i);
    if (!hasRecommendation) {
      score = Math.max(score, 0.7);
      details.push('Discovery phase - risk acknowledgment not required');
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


File: scorers/executive-communication.ts
----------------------------------------

```typescript
/**
 * Executive Communication Scorer
 * 
 * Evaluates appropriateness for executive-level communication.
 */

import { RuleBasedScorer, ScorerResult, ConversationContext } from '@kessel-digital/agent-core/evaluation';

export class ExecutiveCommunicationScorer extends RuleBasedScorer {
  name = 'executive-communication';
  description = 'Evaluates clarity, conciseness, and executive-appropriateness';

  async evaluate(response: string, context: ConversationContext): Promise<ScorerResult> {
    let score = 0;
    const details: string[] = [];

    // Check response length (executive-ready = concise)
    const wordCount = response.split(/\s+/).length;
    if (wordCount <= 150) {
      score += 0.3;
      details.push('Appropriately concise');
    } else if (wordCount <= 250) {
      score += 0.2;
      details.push('Acceptable length');
    } else {
      details.push('Could be more concise');
    }

    // Check for business outcome focus
    const outcomeTerms = /ROI|revenue|cost|efficiency|growth|market share|customer|competitive/i;
    const focusesOutcomes = this.checkPattern(response, outcomeTerms);
    if (focusesOutcomes) {
      score += 0.3;
      details.push('Focuses on business outcomes');
    }

    // Check for clear structure
    const hasStructure = this.checkPattern(response, /first|second|key point|bottom line|in summary/i) ||
                        response.includes(':') || response.includes('1)');
    if (hasStructure) {
      score += 0.2;
      details.push('Well-structured response');
    }

    // Check for action-orientation
    const hasAction = this.checkPattern(response, /next step|decision needed|action required|recommend|ask/i);
    if (hasAction) {
      score += 0.2;
      details.push('Action-oriented');
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
PART 7: CA EVALUATION RUNNER
================================================================================

File: ca-eval.ts
----------------

```typescript
/**
 * CA Evaluation Runner
 */

import * as dotenv from 'dotenv';
dotenv.config();

import {
  getPlatformConfig,
  ProviderFactory,
  EmbeddingFactory,
  StoreFactory,
  StorageFactory,
  RetrievalEngine,
  RAGToolExecutor,
  CritiqueEngine,
  SuccessPatternStore,
  ConversationEngine,
  ScenarioRunner,
  ReportGenerator,
} from '@kessel-digital/agent-core';

import { CA_CONFIG } from './ca-config.js';
import { CA_SCENARIOS, CA_FAST_SCENARIOS } from './scenarios/index.js';
import { CA_SCORERS } from './scorers/index.js';

async function main() {
  const args = process.argv.slice(2);
  const fast = args.includes('--fast');
  const platform = args.find(a => a.startsWith('--platform='))?.split('=')[1] || 'braintrust';
  
  console.log(`\n🎯 CA Evaluation`);
  console.log(`Platform: ${platform}`);
  console.log(`Mode: ${fast ? 'Fast' : 'Full'}`);
  
  const platformConfig = getPlatformConfig(platform as any);
  
  // Create providers
  const llmProvider = ProviderFactory.createLLM(platformConfig.llm.primary);
  const critiqueProvider = platformConfig.llm.critique 
    ? ProviderFactory.createLLM(platformConfig.llm.critique)
    : llmProvider;
  const embeddingProvider = EmbeddingFactory.create(platformConfig.embeddings);
  const vectorStore = StoreFactory.create(platformConfig.vectorStore, embeddingProvider);
  
  // Create RAG engine
  const ragEngine = new RetrievalEngine(embeddingProvider, vectorStore, {
    kbPath: CA_CONFIG.knowledgeBase.path!,
    indexPath: './storage/ca-kb-index.json',
  });
  
  console.log('Initializing RAG engine...');
  await ragEngine.initialize();
  
  const ragTools = new RAGToolExecutor(ragEngine, 'CA');
  
  // Create critique engine
  const critiqueEngine = new CritiqueEngine(critiqueProvider, {
    selfCritiqueEnabled: platformConfig.features.selfCritiqueEnabled,
    critiqueCriteria: CA_CONFIG.critiqueCriteria,
    selfCritiqueModel: platformConfig.learning.selfCritiqueModel,
    successPatternsEnabled: false,
    minScoreThreshold: 0.95,
    maxPatternsToRetrieve: 2,
    kbEnhancementEnabled: false,
    userFeedbackEnabled: false,
  });
  
  // Select scenarios
  const scenarios = fast ? CA_FAST_SCENARIOS : CA_SCENARIOS;
  
  console.log(`Running ${scenarios.length} scenarios...\n`);
  
  const results = [];
  
  for (const scenario of scenarios) {
    console.log(`📋 ${scenario.name}...`);
    
    const engine = new ConversationEngine({
      provider: llmProvider,
      systemPrompt: CA_CONFIG.systemPrompt,
      ragToolExecutor: ragTools,
      critiqueEngine,
    });
    
    const runner = new ScenarioRunner({
      engine,
      scorers: CA_SCORERS,
    });
    
    const result = await runner.run(scenario);
    results.push(result);
    
    const status = result.passed ? '✅' : '❌';
    console.log(`   ${status} ${(result.compositeScore * 100).toFixed(1)}%\n`);
  }
  
  // Generate report
  const reportGenerator = new ReportGenerator();
  const report = await reportGenerator.generate(results, platform, 'ca');
  
  const timestamp = Date.now();
  await reportGenerator.saveReport(report, `./outputs/ca-eval-${timestamp}.json`);
  
  // Print summary
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
PART 8: CA PACKAGE.JSON
================================================================================

```json
{
  "name": "ca-evaluation",
  "version": "1.0.0",
  "description": "CA Agent Evaluation Harness",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "eval": "node dist/ca-eval.js",
    "eval:fast": "node dist/ca-eval.js --fast",
    "eval:openai": "node dist/ca-eval.js --platform=development",
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
END OF CA SPECIFICATION
================================================================================
