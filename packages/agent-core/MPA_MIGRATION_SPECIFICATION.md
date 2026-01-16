# MPA MIGRATION TO AGENT-CORE
# Version 1.0 | January 11, 2026
# How MPA Uses the Shared agent-core Package

================================================================================
OVERVIEW
================================================================================

This document specifies how MPA (Media Planning Agent) migrates from standalone
implementation to using the shared @kessel-digital/agent-core package.

MIGRATION GOAL:
- Move all infrastructure code to agent-core
- Keep only MPA-specific content in the MPA directory
- Maintain 100% backward compatibility with existing eval harness


================================================================================
PART 1: BEFORE AND AFTER STRUCTURE
================================================================================

BEFORE (Standalone MPA):
------------------------
```
release/v5.5/agents/mpa/base/tests/braintrust/
├── providers/           # MPA-specific (TO REMOVE)
├── embeddings/          # MPA-specific (TO REMOVE)
├── vector-stores/       # MPA-specific (TO REMOVE)
├── storage/             # MPA-specific (TO REMOVE)
├── rag/                 # MPA-specific (TO REMOVE)
├── learning/            # MPA-specific (TO REMOVE)
├── conversation-engine.ts     # Infrastructure (TO MODIFY)
├── mpa-prompt-content.ts      # MPA-specific (KEEP)
├── mpa-multi-turn-eval.ts     # Infrastructure (TO MODIFY)
├── mpa-multi-turn-types.ts    # Hybrid (TO MODIFY)
├── scenarios/                 # MPA-specific (KEEP)
└── scorers/                   # MPA-specific (KEEP)
```

AFTER (Using agent-core):
-------------------------
```
release/v5.5/agents/mpa/base/tests/braintrust/
├── mpa-config.ts              # MPA configuration (NEW)
├── mpa-prompt-content.ts      # MPA system prompt (KEEP)
├── mpa-critique-criteria.ts   # MPA-specific criteria (NEW)
├── mpa-eval.ts                # MPA evaluation runner (MODIFIED)
├── scenarios/                 # MPA scenarios (KEEP)
│   ├── basic-user-step1-2.ts
│   ├── full-10-step.ts
│   └── ...
├── scorers/                   # MPA scorers (KEEP)
│   ├── source-citation.ts
│   ├── audience-sizing-completeness.ts
│   └── ...
└── storage/                   # Local storage (auto-created)
```


================================================================================
PART 2: MPA-SPECIFIC FILES
================================================================================

File: mpa-config.ts
-------------------

```typescript
/**
 * MPA Agent Configuration
 * 
 * Defines MPA-specific settings that customize the shared agent-core.
 */

import { AgentConfig, CritiqueCriterion } from '@kessel-digital/agent-core/config';
import { MPA_SYSTEM_PROMPT, MPA_STEP_DEFINITIONS } from './mpa-prompt-content.js';
import { MPA_CRITIQUE_CRITERIA } from './mpa-critique-criteria.js';

export const MPA_CONFIG: AgentConfig = {
  agent: 'mpa',
  name: 'Media Planning Agent',
  description: 'AI-powered media planning assistant for campaign strategy and optimization',
  
  knowledgeBase: {
    source: 'local',
    path: '../../../kb',  // Relative to braintrust directory
  },
  
  systemPrompt: MPA_SYSTEM_PROMPT,
  stepDefinitions: MPA_STEP_DEFINITIONS,
  critiqueCriteria: MPA_CRITIQUE_CRITERIA,
  
  tools: [
    {
      name: 'search_knowledge_base',
      description: 'Search the MPA knowledge base for media planning information',
      parameters: {
        query: { type: 'string', description: 'Search query' },
        topK: { type: 'number', description: 'Number of results (default: 5)' },
      },
      required: ['query'],
    },
    {
      name: 'get_benchmark',
      description: 'Get industry benchmarks for media metrics',
      parameters: {
        metric: { type: 'string', description: 'Metric name (CPM, CTR, etc.)' },
        vertical: { type: 'string', description: 'Industry vertical' },
        channel: { type: 'string', description: 'Media channel' },
      },
      required: ['metric'],
    },
    {
      name: 'get_audience_sizing',
      description: 'Get audience size estimates with methodology',
      parameters: {
        audience: { type: 'string', description: 'Audience description' },
        geography: { type: 'string', description: 'Geographic scope' },
      },
      required: ['audience'],
    },
  ],
};
```


File: mpa-critique-criteria.ts
------------------------------

```typescript
/**
 * MPA Self-Critique Criteria
 * 
 * Defines quality rules specific to media planning responses.
 */

import { CritiqueCriterion } from '@kessel-digital/agent-core/config';

export const MPA_CRITIQUE_CRITERIA: CritiqueCriterion[] = [
  {
    name: 'source-citation',
    rule: 'All benchmark claims must cite "Based on Knowledge Base" or "My estimate"',
    badExample: 'Typical ecommerce CAC runs $25-45.',
    goodExample: 'Based on Knowledge Base, typical ecommerce CAC runs $25-45.',
    autoFix: 'Prepend "Based on Knowledge Base, " to benchmark claims',
  },
  {
    name: 'acronym-definition',
    rule: 'First use of any acronym must include parenthetical definition',
    badExample: 'Your CAC of $50 is reasonable.',
    goodExample: 'Your cost per acquisition (CAC) of $50 is reasonable.',
    autoFix: 'Add parenthetical definition after acronym',
  },
  {
    name: 'response-length',
    rule: 'Responses should be under 75 words to maintain focus',
    badExample: '[Any response over 75 words with redundant content]',
    goodExample: '[Concise response under 75 words]',
    autoFix: 'Remove redundant phrases, combine sentences',
  },
  {
    name: 'single-question',
    rule: 'Ask only ONE question per response to avoid overwhelming the user',
    badExample: 'What is your budget? And what channels have you used before?',
    goodExample: 'What is your total media budget for this campaign?',
    autoFix: 'Keep only the most important question',
  },
  {
    name: 'calculation-presence',
    rule: 'Show math when presenting numerical estimates',
    badExample: 'You could acquire approximately 2,000 customers.',
    goodExample: '$50,000 budget ÷ $25 CAC = 2,000 customer acquisitions.',
    autoFix: 'Add calculation showing how number was derived',
  },
];
```


File: mpa-eval.ts
-----------------

```typescript
/**
 * MPA Evaluation Runner
 * 
 * Uses @kessel-digital/agent-core for infrastructure,
 * with MPA-specific configuration.
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

import { MPA_CONFIG } from './mpa-config.js';
import { MPA_SCENARIOS } from './scenarios/index.js';
import { MPA_SCORERS } from './scorers/index.js';

async function main() {
  // Parse CLI arguments
  const args = process.argv.slice(2);
  const fast = args.includes('--fast');
  const platform = args.find(a => a.startsWith('--platform='))?.split('=')[1] || 'braintrust';
  
  console.log(`\n🎯 MPA Evaluation`);
  console.log(`Platform: ${platform}`);
  console.log(`Mode: ${fast ? 'Fast (subset)' : 'Full'}`);
  
  // Load platform configuration
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
    kbPath: MPA_CONFIG.knowledgeBase.path!,
    indexPath: './storage/mpa-kb-index.json',
  });
  
  console.log('Initializing RAG engine...');
  await ragEngine.initialize();
  
  const ragTools = new RAGToolExecutor(ragEngine, 'MPA');
  
  // Create learning components
  const critiqueEngine = new CritiqueEngine(critiqueProvider, {
    selfCritiqueEnabled: platformConfig.features.selfCritiqueEnabled,
    critiqueCriteria: MPA_CONFIG.critiqueCriteria,
    selfCritiqueModel: platformConfig.learning.selfCritiqueModel,
    successPatternsEnabled: platformConfig.features.successPatternsEnabled,
    minScoreThreshold: platformConfig.learning.minScoreThreshold,
    maxPatternsToRetrieve: platformConfig.learning.maxPatternsToRetrieve,
    kbEnhancementEnabled: platformConfig.features.kbEnhancementEnabled,
    userFeedbackEnabled: platformConfig.features.userFeedbackEnabled,
  });
  
  // Create success pattern store (if enabled)
  let successPatternStore: SuccessPatternStore | undefined;
  if (platformConfig.features.successPatternsEnabled) {
    const patternStorage = StorageFactory.create(platformConfig.storage, 'mpa-success-patterns');
    successPatternStore = new SuccessPatternStore(patternStorage, embeddingProvider, {
      selfCritiqueEnabled: true,
      critiqueCriteria: MPA_CONFIG.critiqueCriteria,
      successPatternsEnabled: true,
      minScoreThreshold: 0.95,
      maxPatternsToRetrieve: 2,
      kbEnhancementEnabled: false,
      userFeedbackEnabled: false,
    });
  }
  
  // Select scenarios
  const scenarios = fast 
    ? MPA_SCENARIOS.slice(0, 3)  // First 3 for fast mode
    : MPA_SCENARIOS;
  
  console.log(`Running ${scenarios.length} scenarios...\n`);
  
  // Run each scenario
  const results = [];
  
  for (const scenario of scenarios) {
    console.log(`📋 ${scenario.name}...`);
    
    // Create fresh conversation engine for each scenario
    const engine = new ConversationEngine({
      provider: llmProvider,
      systemPrompt: MPA_CONFIG.systemPrompt,
      ragToolExecutor: ragTools,
      critiqueEngine,
      successPatternStore,
    });
    
    const runner = new ScenarioRunner({
      engine,
      scorers: MPA_SCORERS,
    });
    
    const result = await runner.run(scenario);
    results.push(result);
    
    const status = result.passed ? '✅' : '❌';
    console.log(`   ${status} ${(result.compositeScore * 100).toFixed(1)}%\n`);
    
    // Store successful patterns
    if (successPatternStore && result.compositeScore >= 0.95) {
      const lastTurn = result.transcript.filter(t => t.role === 'assistant').pop();
      const lastUser = result.transcript.filter(t => t.role === 'user').pop();
      
      if (lastTurn && lastUser) {
        await successPatternStore.store({
          scenario: scenario.name,
          userMessage: lastUser.content,
          agentResponse: lastTurn.content,
          scores: result.scores,
          compositeScore: result.compositeScore,
        });
      }
    }
  }
  
  // Generate report
  const reportGenerator = new ReportGenerator();
  const report = await reportGenerator.generate(results, platform, 'mpa');
  
  // Save report
  const timestamp = Date.now();
  await reportGenerator.saveReport(report, `./outputs/mpa-eval-${timestamp}.json`);
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Scenarios: ${report.summary.totalScenarios}`);
  console.log(`Passed: ${report.summary.passed}`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log(`Composite Score: ${(report.summary.compositeScore * 100).toFixed(1)}%`);
  console.log('\nScorer Averages:');
  
  for (const [scorer, avg] of Object.entries(report.summary.scorerAverages)) {
    const status = avg >= 0.92 ? '✅' : '❌';
    console.log(`  ${status} ${scorer}: ${(avg * 100).toFixed(1)}%`);
  }
  
  // Exit with appropriate code
  process.exit(report.summary.compositeScore >= 0.92 ? 0 : 1);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```


File: scenarios/index.ts (Updated)
----------------------------------

```typescript
/**
 * MPA Scenarios Index
 * 
 * Exports all MPA evaluation scenarios.
 */

import { Scenario } from '@kessel-digital/agent-core/evaluation';

// Import individual scenarios
import { basicUserStep1_2 } from './basic-user-step1-2.js';
import { full10Step } from './full-10-step.js';
import { aggressiveKpiNarrowTargeting } from './aggressive-kpi-narrow-targeting.js';
import { brandBuildingLimitedData } from './brand-building-limited-data.js';
import { highStakesPerformance } from './high-stakes-performance.js';
import { massNationalSimplicity } from './mass-national-simplicity.js';
import { precisionTargetingComplex } from './precision-targeting-complex.js';
import { sophisticatedIdk } from './sophisticated-idk.js';
import { budgetRevisionMidstream } from './budget-revision-midstream.js';
import { budgetDecreaseMidstream } from './budget-decrease-midstream.js';
import { channelMixChange } from './channel-mix-change.js';
import { timelineCompression } from './timeline-compression.js';
import { efficiencyShock } from './efficiency-shock.js';
import { volumeTargetIncrease } from './volume-target-increase.js';
import { outcomeKpiChange } from './outcome-kpi-change.js';
import { audienceAdditionChange } from './audience-addition-change.js';
import { audienceRemovalChange } from './audience-removal-change.js';
import { demographicShiftChange } from './demographic-shift-change.js';
import { behavioralTargetingChange } from './behavioral-targeting-change.js';
import { geoExpansionChange } from './geo-expansion-change.js';
import { multiAudienceUnifiedPlan } from './multi-audience-unified-plan.js';
import { multiAudienceChannelAllocation } from './multi-audience-channel-allocation.js';
import { multiAudienceVaryingKpis } from './multi-audience-varying-kpis.js';

export const MPA_SCENARIOS: Scenario[] = [
  basicUserStep1_2,
  full10Step,
  aggressiveKpiNarrowTargeting,
  brandBuildingLimitedData,
  highStakesPerformance,
  massNationalSimplicity,
  precisionTargetingComplex,
  sophisticatedIdk,
  budgetRevisionMidstream,
  budgetDecreaseMidstream,
  channelMixChange,
  timelineCompression,
  efficiencyShock,
  volumeTargetIncrease,
  outcomeKpiChange,
  audienceAdditionChange,
  audienceRemovalChange,
  demographicShiftChange,
  behavioralTargetingChange,
  geoExpansionChange,
  multiAudienceUnifiedPlan,
  multiAudienceChannelAllocation,
  multiAudienceVaryingKpis,
];

// Fast mode scenarios (representative subset)
export const MPA_FAST_SCENARIOS: Scenario[] = [
  basicUserStep1_2,
  aggressiveKpiNarrowTargeting,
  budgetRevisionMidstream,
];
```


File: scorers/index.ts (Updated)
--------------------------------

```typescript
/**
 * MPA Scorers Index
 * 
 * Exports all MPA evaluation scorers.
 */

import { Scorer } from '@kessel-digital/agent-core/evaluation';

// Import individual scorers
import { SourceCitationScorer } from './source-citation.js';
import { AudienceSizingCompletenessScorer } from './audience-sizing-completeness.js';
import { ProactiveCalculationScorer } from './proactive-calculation.js';
import { TeachingBehaviorScorer } from './teaching-behavior.js';
import { FeasibilityFramingScorer } from './feasibility-framing.js';
import { CrossStepSynthesisScorer } from './cross-step-synthesis.js';
import { RecalculationOnChangeScorer } from './recalculation-on-change.js';

export const MPA_SCORERS: Scorer[] = [
  new SourceCitationScorer(),
  new AudienceSizingCompletenessScorer(),
  new ProactiveCalculationScorer(),
  new TeachingBehaviorScorer(),
  new FeasibilityFramingScorer(),
  new CrossStepSynthesisScorer(),
  new RecalculationOnChangeScorer(),
];

// Re-export individual scorers for testing
export {
  SourceCitationScorer,
  AudienceSizingCompletenessScorer,
  ProactiveCalculationScorer,
  TeachingBehaviorScorer,
  FeasibilityFramingScorer,
  CrossStepSynthesisScorer,
  RecalculationOnChangeScorer,
};
```


File: scorers/source-citation.ts (Updated)
------------------------------------------

```typescript
/**
 * Source Citation Scorer
 * 
 * Verifies that benchmark claims cite their source.
 */

import { RuleBasedScorer } from '@kessel-digital/agent-core/evaluation';
import { ScorerResult, ConversationContext } from '@kessel-digital/agent-core/evaluation';

export class SourceCitationScorer extends RuleBasedScorer {
  name = 'source-citation';
  description = 'Verifies benchmark claims cite "Based on Knowledge Base" or "My estimate"';

  async evaluate(response: string, context: ConversationContext): Promise<ScorerResult> {
    // Pattern to find benchmark claims (numbers with units like %, $, CPM, etc.)
    const benchmarkPattern = /\b\d+(?:\.\d+)?(?:\s*(?:%|percent|\$|dollars|CPM|CPC|CTR|CAC|ROAS|CPA))\b/gi;
    const benchmarkClaims = response.match(benchmarkPattern) || [];

    if (benchmarkClaims.length === 0) {
      // No benchmark claims to cite
      return {
        name: this.name,
        score: 1.0,
        passed: true,
        details: 'No benchmark claims found',
      };
    }

    // Check for citation patterns
    const hasCitation = this.checkPattern(response, /based on knowledge base/i) ||
                       this.checkPattern(response, /my estimate/i) ||
                       this.checkPattern(response, /according to/i) ||
                       this.checkPattern(response, /industry benchmark/i);

    const score = hasCitation ? 1.0 : 0.0;

    return {
      name: this.name,
      score,
      passed: score >= 0.5,
      details: hasCitation
        ? `Found ${benchmarkClaims.length} benchmark claims with proper citation`
        : `Found ${benchmarkClaims.length} benchmark claims without citation`,
      metadata: {
        benchmarkCount: benchmarkClaims.length,
        hasCitation,
      },
    };
  }
}
```


================================================================================
PART 3: PACKAGE.JSON FOR MPA
================================================================================

File: release/v5.5/agents/mpa/base/tests/braintrust/package.json
-----------------------------------------------------------------

```json
{
  "name": "mpa-evaluation",
  "version": "5.9.0",
  "description": "MPA Agent Evaluation Harness",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "eval": "node dist/mpa-eval.js",
    "eval:fast": "node dist/mpa-eval.js --fast",
    "eval:openai": "node dist/mpa-eval.js --platform=development",
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
PART 4: MIGRATION STEPS
================================================================================

1. Create packages/agent-core/ directory structure
2. Implement all agent-core modules (45 files)
3. Build agent-core: cd packages/agent-core && npm install && npm run build
4. Update MPA package.json to depend on agent-core
5. Create mpa-config.ts and mpa-critique-criteria.ts
6. Update mpa-eval.ts to use agent-core imports
7. Update scenarios/index.ts and scorers/index.ts
8. Update individual scorers to extend agent-core base classes
9. Remove old infrastructure directories (providers, embeddings, etc.)
10. Test: cd release/v5.5/agents/mpa/base/tests/braintrust && npm run eval:fast


================================================================================
PART 5: FILES TO REMOVE FROM MPA
================================================================================

After migration, these can be deleted from MPA:

DIRECTORIES TO REMOVE:
- providers/
- embeddings/
- vector-stores/
- storage/ (only the code, not the data)
- rag/ (only the code, not the index)
- learning/
- config/
- copilot-studio/ (move to agent-core)

FILES TO REMOVE:
- conversation-engine.ts (replaced by agent-core)
- mpa-multi-turn-eval.ts (replaced by mpa-eval.ts)
- mpa-multi-turn-types.ts (replaced by agent-core types)


================================================================================
PART 6: FILES TO KEEP IN MPA
================================================================================

MPA-specific files that stay:

- mpa-config.ts (NEW)
- mpa-critique-criteria.ts (NEW)
- mpa-eval.ts (MODIFIED)
- mpa-prompt-content.ts (KEEP)
- scenarios/*.ts (KEEP, minor import updates)
- scorers/*.ts (KEEP, minor import updates)
- storage/ (data directory)
- outputs/ (eval results)
- package.json (MODIFIED)
- tsconfig.json (MODIFIED)


================================================================================
END OF MPA MIGRATION SPECIFICATION
================================================================================
