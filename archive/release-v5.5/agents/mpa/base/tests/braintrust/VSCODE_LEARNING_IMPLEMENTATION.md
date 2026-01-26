# VSCODE: CONTINUOUS LEARNING SYSTEM IMPLEMENTATION

## OVERVIEW

Implement a four-layer continuous learning system for the MPA agent:

| Layer | Name | Description | Storage Required |
|-------|------|-------------|------------------|
| **C** | Self-Critique | Real-time quality check before response | None |
| **B** | Success Patterns | Few-shot from high-scoring responses | JSON or Dataverse |
| **A** | KB Enhancement | Offline gap analysis and KB generation | None (file output) |
| **D** | User Feedback | Capture thumbs/edits for improvement | JSON or Dataverse |

**Goal**: +3-8% composite score improvement with graceful degradation when storage unavailable.

**Full Specification**: CONTINUOUS_LEARNING_SPECIFICATION.md


## IMPLEMENTATION ORDER

### Phase 1: Create Directory Structure

```bash
mkdir -p release/v5.5/agents/mpa/base/tests/braintrust/learning/storage
mkdir -p release/v5.5/agents/mpa/base/tests/braintrust/learning/criteria
mkdir -p release/v5.5/agents/mpa/base/tests/braintrust/learning-outputs/kb-suggestions
mkdir -p release/v5.5/agents/mpa/base/tests/braintrust/learning-outputs/patterns
mkdir -p release/v5.5/agents/mpa/base/tests/braintrust/learning-outputs/feedback
```

### Phase 2: Create Files (in order)

```
learning/
├── types.ts                        # All type definitions
├── storage/
│   ├── storage-interface.ts        # Abstract interface
│   ├── json-storage.ts             # JSON file backend
│   └── dataverse-storage.ts        # Dataverse stub
├── criteria/
│   └── critique-criteria.ts        # Self-critique rules
├── self-critique.ts                # Layer C
├── success-patterns.ts             # Layer B
├── kb-enhancement-pipeline.ts      # Layer A
├── user-feedback.ts                # Layer D
├── index.ts                        # Exports + default config
└── test-learning.ts                # Test suite
```

### Phase 3: Modify Existing Files

1. **mpa-multi-turn-types.ts**: Add `learning?: LearningSystemConfig` to config
2. **conversation-engine.ts**: Add learning system integration
3. **mpa-multi-turn-eval.ts**: Store successful patterns after eval


## KEY IMPLEMENTATION DETAILS

### Configuration with Graceful Degradation

```typescript
// Default config - storage-dependent features disabled by default
const DEFAULT_LEARNING_CONFIG: LearningSystemConfig = {
  selfCritique: {
    enabled: true,              // ALWAYS ON - no storage needed
    model: 'claude-3-5-haiku-20241022',
    maxRevisions: 1,
    criteriaToCheck: ['source-citation', 'acronym-definition', 'response-length', 'single-question'],
  },
  successPatterns: {
    enabled: false,             // OFF until storage configured
    storageBackend: 'none',
    minScoreThreshold: 0.95,
    maxPatternsToRetrieve: 2,
  },
  kbEnhancement: {
    enabled: true,              // ON - outputs to files only
    autoApply: false,
    outputDirectory: './learning-outputs/kb-suggestions',
    minGapThreshold: 0.92,
  },
  userFeedback: {
    enabled: false,             // OFF until Dataverse configured
    storageBackend: 'none',
    feedbackTypes: ['thumbs', 'edit'],
  },
};
```

### Self-Critique Flow (Layer C)

```typescript
// After getting agent response, before returning:
if (this.selfCritique) {
  const critiqueResult = await this.selfCritique.critique(response, context);
  if (critiqueResult.wasRevised) {
    response = critiqueResult.revisedResponse;
  }
}
```

### Success Patterns Flow (Layer B)

```typescript
// Before calling Claude, inject few-shot examples:
if (this.successPatterns) {
  const patterns = await this.successPatterns.getSimilarPatterns(userMessage);
  if (patterns.length > 0) {
    systemPrompt += this.successPatterns.formatAsExamples(patterns);
  }
}

// After eval, store high-scoring responses:
if (result.aggregateScore >= 0.95) {
  await this.successPatterns.storePattern(...);
}
```

### Critique Criteria (5 scorers)

```typescript
const CRITIQUE_CRITERIA = {
  'source-citation': {
    rule: 'All benchmark claims must cite "Based on Knowledge Base" or "My estimate"',
    check: 'Does response cite source when mentioning numbers?',
    fix: 'Add "Based on Knowledge Base, " before benchmark claims',
  },
  'acronym-definition': {
    rule: 'First use of acronym must include definition',
    check: 'Are CAC, CPM, LTV, etc. defined on first use?',
    fix: 'Add parenthetical: "cost per acquisition (CPA)"',
  },
  'response-length': {
    rule: 'Responses under 75 words',
    check: 'Is response concise?',
    fix: 'Remove redundant phrases, cut examples',
  },
  'single-question': {
    rule: 'Ask only ONE question',
    check: 'More than one question mark?',
    fix: 'Keep only most important question',
  },
  'calculation-presence': {
    rule: 'Show math when citing numbers',
    check: 'Is calculation shown?',
    fix: 'Add: "$50K ÷ $25 = 2,000 customers"',
  },
};
```


## TESTING

After implementation:

```bash
npx tsc
node dist/learning/test-learning.js
```

Expected: 4/4 tests pass:
1. Self-critique adds missing citation
2. Self-critique defines undefined acronym
3. Self-critique passes good response unchanged
4. Success patterns store and retrieve correctly


## INTEGRATION CHECKLIST

- [ ] learning/types.ts created with all interfaces
- [ ] Storage interface and JSON backend implemented
- [ ] Self-critique system works standalone
- [ ] Success patterns store/retrieve works
- [ ] KB enhancement generates suggestions to files
- [ ] conversation-engine.ts modified for learning integration
- [ ] Config allows enabling/disabling each layer
- [ ] Graceful degradation when storage unavailable
- [ ] Tests pass
- [ ] Eval runs successfully with learning enabled


## EXPECTED IMPACT

| Metric | Before | After | Mechanism |
|--------|--------|-------|-----------|
| source-citation | 52-62% | 85%+ | Self-critique catches missing citations |
| acronym-definition | 0-23% | 70%+ | Self-critique catches undefined acronyms |
| response-length | 57-78% | 80%+ | Self-critique enforces brevity |
| Composite | 86.8% | 90-92% | Combined effect |

Note: RAG system is expected to provide additional +4-6% on top of this.


## COPILOT STUDIO NOTES

When deploying to Copilot Studio:

1. **Self-Critique**: Implement as Power Automate flow called via Action
2. **Success Patterns**: Store in Dataverse `mpa_success_patterns` table
3. **User Feedback**: Capture via Adaptive Card, store in Dataverse
4. **KB Enhancement**: Run as scheduled Power Automate flow

The `dataverse-storage.ts` stub should be expanded to call Power Automate HTTP endpoints for CRUD operations.
