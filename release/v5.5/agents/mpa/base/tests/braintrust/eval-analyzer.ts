/**
 * MPA Eval Analyzer
 *
 * Fetches Braintrust evaluation results, identifies patterns in low scores,
 * and suggests prompt improvements. Can be run manually or via CI/CD.
 *
 * Usage:
 *   npx tsx eval-analyzer.ts [--experiment-id <id>] [--auto-fix]
 */

import { config } from "dotenv";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

// Load environment variables
const envPath =
  "/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/integrations/vercel-ai-gateway/.env";
config({ path: envPath });

const API_BASE = "https://api.braintrust.dev/v1";
const PROJECT_NAME = "Kessel-MPA-Agent";

interface EvalResult {
  name: string;
  input: {
    message: string;
    context?: string;
  };
  output: string | null;
  expected: {
    behaviors: string[];
    ideal_response?: string;
  };
  scores: Record<string, number>;
  metadata: Record<string, unknown>;
}

interface ScorePattern {
  scorer: string;
  avgScore: number;
  lowScoreCount: number;
  examples: Array<{
    input: string;
    output: string;
    score: number;
    expected: string[];
  }>;
}

interface PromptSuggestion {
  issue: string;
  currentBehavior: string;
  suggestedFix: string;
  affectedTestCases: string[];
  priority: "high" | "medium" | "low";
}

async function fetchLatestExperiment(): Promise<string> {
  const apiKey = process.env.BRAINTRUST_API_KEY;
  if (!apiKey) throw new Error("BRAINTRUST_API_KEY not found");

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  // Get project ID
  const projectResp = await fetch(
    `${API_BASE}/project?project_name=${encodeURIComponent(PROJECT_NAME)}`,
    { headers }
  );
  const projects = (await projectResp.json()) as {
    objects?: Array<{ id: string }>;
  };

  if (!projects.objects?.length) {
    throw new Error(`Project ${PROJECT_NAME} not found`);
  }

  const projectId = projects.objects[0].id;

  // Get latest experiment
  const expResp = await fetch(
    `${API_BASE}/experiment?project_id=${projectId}&limit=1`,
    { headers }
  );
  const experiments = (await expResp.json()) as {
    objects?: Array<{ id: string; name: string }>;
  };

  if (!experiments.objects?.length) {
    throw new Error("No experiments found");
  }

  console.log(`Found latest experiment: ${experiments.objects[0].name}`);
  return experiments.objects[0].id;
}

async function fetchExperimentResults(
  experimentId: string
): Promise<EvalResult[]> {
  const apiKey = process.env.BRAINTRUST_API_KEY;
  if (!apiKey) throw new Error("BRAINTRUST_API_KEY not found");

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const resp = await fetch(`${API_BASE}/experiment/${experimentId}/fetch`, {
    headers,
  });
  const data = (await resp.json()) as { events?: EvalResult[] };

  return data.events || [];
}

function analyzeScorePatterns(results: EvalResult[]): ScorePattern[] {
  const scorerStats: Record<
    string,
    { total: number; sum: number; lowScores: EvalResult[] }
  > = {};

  // Collect stats for each scorer
  for (const result of results) {
    if (!result.scores) continue;

    for (const [scorer, score] of Object.entries(result.scores)) {
      if (!scorerStats[scorer]) {
        scorerStats[scorer] = { total: 0, sum: 0, lowScores: [] };
      }

      scorerStats[scorer].total++;
      scorerStats[scorer].sum += score;

      if (score < 0.6) {
        scorerStats[scorer].lowScores.push(result);
      }
    }
  }

  // Convert to patterns
  const patterns: ScorePattern[] = [];

  for (const [scorer, stats] of Object.entries(scorerStats)) {
    patterns.push({
      scorer,
      avgScore: stats.sum / stats.total,
      lowScoreCount: stats.lowScores.length,
      examples: stats.lowScores.slice(0, 3).map((r) => ({
        input: r.input.message,
        output: r.output || "",
        score: r.scores[scorer],
        expected: r.expected?.behaviors || [],
      })),
    });
  }

  // Sort by lowest average score
  return patterns.sort((a, b) => a.avgScore - b.avgScore);
}

async function generatePromptSuggestions(
  patterns: ScorePattern[]
): Promise<PromptSuggestion[]> {
  const lowPerformingPatterns = patterns.filter((p) => p.avgScore < 0.7);

  if (lowPerformingPatterns.length === 0) {
    console.log("All scorers performing above 0.7 threshold");
    return [];
  }

  const analysisPrompt = `You are analyzing evaluation results for a Media Planning Agent (MPA).

The agent is supposed to follow these key behaviors:
- Ask ONE question at a time
- Keep responses under 75 words
- Calculate implied CAC when budget and volume are provided
- Cite benchmark sources for data claims
- Model with assumptions when user says "I don't know" instead of blocking
- Match language complexity to user sophistication level
- Maintain progress momentum, don't over-refine

Here are the low-performing scorer patterns:

${lowPerformingPatterns
  .map(
    (p) => `
## ${p.scorer}
Average Score: ${(p.avgScore * 100).toFixed(1)}%
Low Score Cases: ${p.lowScoreCount}

Examples of failures:
${p.examples
  .map(
    (e, i) => `
Example ${i + 1} (Score: ${(e.score * 100).toFixed(0)}%):
- User Input: "${e.input}"
- Agent Output: "${e.output.slice(0, 300)}..."
- Expected behaviors: ${e.expected.join(", ")}
`
  )
  .join("")}
`
  )
  .join("\n---\n")}

Based on these patterns, suggest specific prompt improvements. For each issue:
1. Identify the root cause in the current prompt behavior
2. Suggest a concrete addition or modification to the system prompt
3. Indicate priority (high/medium/low) based on impact

Return your analysis as JSON array with this structure:
[
  {
    "issue": "Brief description of the issue",
    "currentBehavior": "What the agent is doing wrong",
    "suggestedFix": "Specific text to add/modify in the prompt",
    "affectedTestCases": ["test case names"],
    "priority": "high|medium|low"
  }
]

Return ONLY the JSON array, no other text.`;

  const result = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    prompt: analysisPrompt,
    maxTokens: 2000,
    temperature: 0.3,
  });

  try {
    return JSON.parse(result.text) as PromptSuggestion[];
  } catch {
    console.error("Failed to parse suggestions:", result.text);
    return [];
  }
}

function generateReport(
  results: EvalResult[],
  patterns: ScorePattern[],
  suggestions: PromptSuggestion[]
): string {
  const totalTests = results.length;
  const avgOverallScore =
    results.reduce((sum, r) => {
      const scores = Object.values(r.scores || {});
      return sum + (scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0);
    }, 0) / totalTests;

  let report = `# MPA Evaluation Report

## Summary
- Total Test Cases: ${totalTests}
- Average Overall Score: ${(avgOverallScore * 100).toFixed(1)}%
- Timestamp: ${new Date().toISOString()}

## Scorer Performance

| Scorer | Avg Score | Low Score Cases |
|--------|-----------|-----------------|
${patterns.map((p) => `| ${p.scorer} | ${(p.avgScore * 100).toFixed(1)}% | ${p.lowScoreCount} |`).join("\n")}

## Issues Identified

`;

  if (suggestions.length === 0) {
    report += "No critical issues identified. All scorers performing adequately.\n";
  } else {
    for (const suggestion of suggestions) {
      report += `### ${suggestion.priority.toUpperCase()}: ${suggestion.issue}

**Current Behavior:** ${suggestion.currentBehavior}

**Suggested Fix:**
\`\`\`
${suggestion.suggestedFix}
\`\`\`

**Affected Test Cases:** ${suggestion.affectedTestCases.join(", ")}

---

`;
    }
  }

  report += `## Next Steps

1. Review suggested prompt modifications
2. Update mpa-prompt.ts with approved changes
3. Run \`braintrust push mpa-prompt.ts --if-exists replace\`
4. Re-run evaluation to verify improvements
`;

  return report;
}

async function main() {
  console.log("MPA Eval Analyzer\n");

  // Parse CLI args
  const args = process.argv.slice(2);
  let experimentId: string | undefined;
  const autoFix = args.includes("--auto-fix");

  const idIndex = args.indexOf("--experiment-id");
  if (idIndex !== -1 && args[idIndex + 1]) {
    experimentId = args[idIndex + 1];
  }

  // Fetch experiment
  console.log("1. Fetching experiment results...");
  if (!experimentId) {
    experimentId = await fetchLatestExperiment();
  }

  const results = await fetchExperimentResults(experimentId);
  console.log(`   Found ${results.length} test results`);

  // Analyze patterns
  console.log("\n2. Analyzing score patterns...");
  const patterns = analyzeScorePatterns(results);

  for (const pattern of patterns) {
    const status =
      pattern.avgScore >= 0.8 ? "✓" : pattern.avgScore >= 0.6 ? "⚠" : "✗";
    console.log(
      `   ${status} ${pattern.scorer}: ${(pattern.avgScore * 100).toFixed(1)}% avg (${pattern.lowScoreCount} low scores)`
    );
  }

  // Generate suggestions
  console.log("\n3. Generating prompt improvement suggestions...");
  const suggestions = await generatePromptSuggestions(patterns);
  console.log(`   Generated ${suggestions.length} suggestions`);

  // Generate report
  console.log("\n4. Generating report...");
  const report = generateReport(results, patterns, suggestions);

  // Save report
  const reportPath = `/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/tests/braintrust/eval-report-${Date.now()}.md`;
  const fs = await import("fs");
  fs.writeFileSync(reportPath, report);
  console.log(`   Report saved to: ${reportPath}`);

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));

  if (suggestions.length === 0) {
    console.log("✓ All scorers performing adequately (>0.7 threshold)");
  } else {
    console.log(`Found ${suggestions.length} issues to address:\n`);
    for (const s of suggestions) {
      console.log(`[${s.priority.toUpperCase()}] ${s.issue}`);
    }
  }

  // Auto-fix if requested
  if (autoFix && suggestions.length > 0) {
    console.log("\n--auto-fix flag detected. Auto-fix not yet implemented.");
    console.log("Review the report and manually apply suggested changes.");
  }

  return { patterns, suggestions, report };
}

main().catch(console.error);
