/**
 * MPA Instruction Iteration Runner
 *
 * Automates the iteration workflow:
 * 1. Reads instruction file
 * 2. Updates Braintrust prompt
 * 3. Pushes to Braintrust
 * 4. Runs evaluation via API
 * 5. Fetches results
 *
 * Usage: npm exec tsx src/scripts/run-iteration.ts <instruction-file>
 * Example: npm exec tsx src/scripts/run-iteration.ts MPA_Copilot_Instructions_v5_7_1.txt
 */

import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BRAINTRUST_API_KEY = process.env.BRAINTRUST_API_KEY;
const PROJECT_NAME = "Kessel-MPA-Agent";
const PROMPT_SLUG = "mpa-v57-agent";

const INSTRUCTIONS_DIR = path.resolve(
  __dirname,
  "../../../../agents/mpa/base/copilot"
);
const BRAINTRUST_DIR = path.resolve(
  __dirname,
  "../../../../agents/mpa/base/tests/braintrust"
);

interface ExperimentResult {
  id: string;
  name: string;
  scores: Record<string, number>;
}

async function readInstructionFile(filename: string): Promise<string> {
  const filePath = path.join(INSTRUCTIONS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Instruction file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf-8");
}

function generatePromptFile(instructions: string, version: string): string {
  const promptContent = `/**
 * MPA Agent Prompt for Braintrust Evaluations
 * Version: ${version}
 * Generated: ${new Date().toISOString()}
 *
 * Upload to Braintrust via: braintrust push mpa-prompt.ts
 */

import braintrust from "braintrust";

const project = braintrust.projects.create({ name: "${PROJECT_NAME}" });

project.prompts.create({
  name: "MPA ${version} Agent",
  slug: "${PROMPT_SLUG}",
  description: "Media Planning Agent using MPA ${version} instruction set",
  model: "claude-sonnet-4-20250514",
  messages: [
    {
      role: "system",
      content: \`${instructions.replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`,
    },
    {
      role: "user",
      content: "{{input.message}}",
    },
  ],
  modelParams: {
    temperature: 0.7,
    maxTokens: 1024,
  },
});

export default project;
`;
  return promptContent;
}

async function pushToBraintrust(): Promise<void> {
  console.log("\n2. Pushing prompt to Braintrust...");
  const promptFile = path.join(BRAINTRUST_DIR, "mpa-prompt.ts");
  try {
    execSync(
      `BRAINTRUST_API_KEY=${BRAINTRUST_API_KEY} braintrust push ${promptFile} --if-exists replace`,
      { stdio: "inherit" }
    );
    console.log("   Prompt pushed successfully");
  } catch (error) {
    throw new Error(`Failed to push prompt: ${error}`);
  }
}

async function fetchLatestExperiment(): Promise<ExperimentResult | null> {
  console.log("\n4. Fetching experiment results...");

  const response = await fetch(
    `https://api.braintrust.dev/v1/experiment?project_name=${encodeURIComponent(PROJECT_NAME)}&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${BRAINTRUST_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    console.error("   Failed to fetch experiments:", await response.text());
    return null;
  }

  const data = await response.json();
  if (!data.objects || data.objects.length === 0) {
    console.log("   No experiments found");
    return null;
  }

  const experiment = data.objects[0];
  console.log(`   Found experiment: ${experiment.name}`);

  // Fetch experiment results
  const resultsResponse = await fetch(
    `https://api.braintrust.dev/v1/experiment/${experiment.id}/fetch`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${BRAINTRUST_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ limit: 100 }),
    }
  );

  if (!resultsResponse.ok) {
    console.error(
      "   Failed to fetch results:",
      await resultsResponse.text()
    );
    return null;
  }

  const resultsData = await resultsResponse.json();
  const rows = resultsData.events || [];

  // Aggregate scores
  const scoreAggregates: Record<string, { sum: number; count: number }> = {};
  for (const row of rows) {
    if (row.scores) {
      for (const [scorer, score] of Object.entries(row.scores)) {
        if (typeof score === "number") {
          if (!scoreAggregates[scorer]) {
            scoreAggregates[scorer] = { sum: 0, count: 0 };
          }
          scoreAggregates[scorer].sum += score;
          scoreAggregates[scorer].count += 1;
        }
      }
    }
  }

  const scores: Record<string, number> = {};
  for (const [scorer, agg] of Object.entries(scoreAggregates)) {
    scores[scorer] = agg.sum / agg.count;
  }

  return {
    id: experiment.id,
    name: experiment.name,
    scores,
  };
}

function printResults(results: ExperimentResult): void {
  console.log("\n" + "=".repeat(60));
  console.log("EVALUATION RESULTS");
  console.log("=".repeat(60));
  console.log(`Experiment: ${results.name}`);
  console.log("\nScores:");

  const sortedScores = Object.entries(results.scores).sort(
    ([, a], [, b]) => a - b
  );

  for (const [scorer, score] of sortedScores) {
    const pct = (score * 100).toFixed(1);
    const status = score >= 0.7 ? "✓" : score >= 0.5 ? "⚠" : "✗";
    console.log(`   ${status} ${scorer}: ${pct}%`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log("Usage: npm exec tsx src/scripts/run-iteration.ts <instruction-file>");
    console.log("Example: npm exec tsx src/scripts/run-iteration.ts MPA_Copilot_Instructions_v5_7_1.txt");
    process.exit(1);
  }

  const instructionFile = args[0];
  const version = instructionFile.match(/v(\d+_\d+(?:_\d+)?)/)?.[1] || "5_7";

  console.log("MPA Iteration Runner");
  console.log("=".repeat(60));
  console.log(`Instruction file: ${instructionFile}`);
  console.log(`Version: v${version}`);

  // Step 1: Read instruction file
  console.log("\n1. Reading instruction file...");
  const instructions = await readInstructionFile(instructionFile);
  console.log(`   Read ${instructions.length} characters`);

  // Step 2: Generate and write prompt file
  console.log("\n2. Generating prompt file...");
  const promptContent = generatePromptFile(instructions, `v${version}`);
  const promptFile = path.join(BRAINTRUST_DIR, "mpa-prompt.ts");
  fs.writeFileSync(promptFile, promptContent);
  console.log(`   Written to ${promptFile}`);

  // Step 3: Push to Braintrust
  await pushToBraintrust();

  // Step 4: Instructions for running eval
  console.log("\n" + "=".repeat(60));
  console.log("NEXT STEPS");
  console.log("=".repeat(60));
  console.log("\nThe prompt has been pushed to Braintrust.");
  console.log("\nTo run the evaluation:");
  console.log("1. Go to: https://www.braintrust.dev/app/Kessel-MPA-Agent");
  console.log("2. Navigate to Experiments");
  console.log("3. Click 'New Experiment'");
  console.log("4. Select the 'MPA v" + version + " Agent' prompt");
  console.log("5. Select your dataset");
  console.log("6. Run the experiment");
  console.log("\nAfter the eval completes, run:");
  console.log("   /check-results");
  console.log("\nOr fetch results programmatically:");
  console.log("   npm exec tsx src/scripts/eval-analyzer.ts");
}

main().catch(console.error);
