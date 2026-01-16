/**
 * Test self-critique layer
 * Run: npx ts-node src/tests/test-self-critique.ts
 */

import { SelfCritique, SelfCritiqueConfig, CritiqueResult } from '../learning/self-critique';

interface TestCase {
  name: string;
  query: string;
  response: string;
  expectedPass: boolean;
  expectedIssues: string[];
}

async function testSelfCritique(): Promise<void> {
  console.log('=== Testing Self-Critique ===\n');

  // Check for API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log('WARNING: ANTHROPIC_API_KEY not set. Using rule-based critique only.\n');
  }

  const config: SelfCritiqueConfig = {
    enabled: true,
    criteria: [
      'source-citation',
      'acronym-definition',
      'response-length',
      'single-question'
    ],
    useLLM: !!apiKey,
    llmConfig: apiKey ? {
      model: 'claude-3-5-haiku-20241022',
      apiKey
    } : undefined
  };

  const critique = new SelfCritique(config);

  const testCases: TestCase[] = [
    {
      name: 'Missing source citation',
      query: 'What is a typical CPM for display?',
      response: 'Display CPMs typically range from $2-8.',
      expectedPass: false,
      expectedIssues: ['source-citation']
    },
    {
      name: 'Good response with citation',
      query: 'What is CPM?',
      response: 'CPM, or Cost Per Mille, is the cost per 1,000 impressions. Based on Knowledge Base benchmarks, typical CPMs range from $2-15 depending on channel.',
      expectedPass: true,
      expectedIssues: []
    },
    {
      name: 'Too many questions',
      query: 'Tell me about display',
      response: 'Display advertising is great! Here are 5 questions: What\'s your budget? What\'s your target? What\'s your timeline? What creative do you have? What\'s your KPI?',
      expectedPass: false,
      expectedIssues: ['single-question']
    },
    {
      name: 'Undefined acronym',
      query: 'What metrics matter?',
      response: 'The key metrics are CPM, CTR, and CPA. These help measure campaign performance.',
      expectedPass: false,
      expectedIssues: ['acronym-definition']
    },
    {
      name: 'Response too long',
      query: 'What is display?',
      response: 'Display advertising refers to visual advertisements shown on websites, apps, and digital platforms. ' +
        'It includes banner ads, rich media, video ads, and native advertising formats. ' +
        'Based on Knowledge Base data, display advertising is one of the most common forms of digital marketing. ' +
        'The format has evolved significantly over the years with the introduction of programmatic buying. ' +
        'Advertisers can now target specific audiences based on demographics, interests, and behaviors. ' +
        'Display campaigns can be optimized for various objectives including awareness, consideration, and conversion. '.repeat(5),
      expectedPass: false,
      expectedIssues: ['response-length']
    },
    {
      name: 'Perfect response',
      query: 'What is a good CTV CPM?',
      response: 'Based on Knowledge Base benchmarks, CTV (Connected TV) CPMs typically range from $25-45 for premium inventory. This metric represents the cost per thousand impressions for streaming video content.',
      expectedPass: true,
      expectedIssues: []
    }
  ];

  let passed = 0;
  let failed = 0;

  console.log('--- Running Test Cases ---\n');

  for (const testCase of testCases) {
    console.log(`Test: ${testCase.name}`);
    console.log(`  Query: "${testCase.query}"`);
    console.log(`  Response: "${testCase.response.substring(0, 80)}${testCase.response.length > 80 ? '...' : ''}"`);

    try {
      const result: CritiqueResult = await critique.evaluate(testCase.response, testCase.query);

      console.log(`  Result:`);
      console.log(`    Pass: ${result.pass} (expected: ${testCase.expectedPass})`);
      console.log(`    Issues: ${result.issues.length > 0 ? result.issues.join(', ') : 'None'}`);
      console.log(`    Expected Issues: ${testCase.expectedIssues.length > 0 ? testCase.expectedIssues.join(', ') : 'None'}`);

      // Check if test passed
      const passMatch = result.pass === testCase.expectedPass;
      const issuesMatch = testCase.expectedIssues.every(i => result.issues.includes(i));

      if (passMatch && issuesMatch) {
        console.log(`  STATUS: PASS`);
        passed++;
      } else {
        console.log(`  STATUS: FAIL`);
        if (!passMatch) console.log(`    - Pass value mismatch`);
        if (!issuesMatch) console.log(`    - Missing expected issues`);
        failed++;
      }
    } catch (error) {
      console.log(`  ERROR: ${error}`);
      failed++;
    }

    console.log('');
  }

  console.log('--- Summary ---\n');
  console.log(`Passed: ${passed}/${testCases.length}`);
  console.log(`Failed: ${failed}/${testCases.length}`);

  if (failed === 0) {
    console.log('\n=== All Self-Critique Tests Passed ===');
  } else {
    console.log('\n=== Some Tests Failed ===');
    process.exit(1);
  }
}

// Run if executed directly
testSelfCritique().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
