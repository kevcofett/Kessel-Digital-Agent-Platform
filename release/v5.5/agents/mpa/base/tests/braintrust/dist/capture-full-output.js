/**
 * Script to capture full agent responses for analysis
 * Runs a single scenario and outputs complete turn-by-turn conversation
 */
import { ConversationEngine } from "./conversation-engine.js";
import { getScenarioById } from "./scenarios/index.js";
async function captureFullOutput(scenarioId) {
    const scenario = getScenarioById(scenarioId);
    if (!scenario) {
        console.error(`Scenario not found: ${scenarioId}`);
        process.exit(1);
    }
    console.log("=".repeat(80));
    console.log(`FULL CONVERSATION CAPTURE: ${scenario.name}`);
    console.log("=".repeat(80));
    console.log(`Description: ${scenario.description}`);
    console.log(`Category: ${scenario.category}`);
    console.log("=".repeat(80));
    console.log();
    const engine = new ConversationEngine({
        verbose: false, // We'll do our own output
        useAgenticRAG: true,
    });
    const result = await engine.runConversation(scenario);
    // Output full conversation
    console.log("CONVERSATION TRANSCRIPT:");
    console.log("-".repeat(80));
    for (const turn of result.turns) {
        console.log();
        console.log(`=== TURN ${turn.turnNumber} (Step ${turn.currentStep}) ===`);
        console.log();
        console.log("USER:");
        console.log(turn.userMessage);
        console.log();
        console.log("AGENT:");
        console.log(turn.agentResponse);
        console.log();
        if (turn.turnScores) {
            console.log("TURN SCORES:");
            for (const [scoreName, scoreData] of Object.entries(turn.turnScores)) {
                console.log(`  ${scoreName}: ${(scoreData.score * 100).toFixed(1)}% (criteria: ${scoreData.criteria.join(", ")})`);
            }
        }
        console.log("-".repeat(80));
    }
    console.log();
    console.log("=".repeat(80));
    console.log("FINAL RESULTS");
    console.log("=".repeat(80));
    console.log(`Total Turns: ${result.totalTurns}`);
    console.log(`Composite Score: ${(result.compositeScore * 100).toFixed(1)}%`);
    console.log(`Passed: ${result.passed ? "YES" : "NO"}`);
    console.log();
    console.log("CONVERSATION-LEVEL SCORES:");
    for (const [scoreName, scoreData] of Object.entries(result.conversationScores)) {
        console.log(`  ${scoreName}: ${(scoreData.score * 100).toFixed(1)}%`);
        if (scoreData.metadata) {
            console.log(`    metadata: ${JSON.stringify(scoreData.metadata)}`);
        }
    }
    console.log();
    console.log("TURN SCORE AGGREGATES:");
    for (const [scoreName, aggregate] of Object.entries(result.turnScoreAggregates)) {
        console.log(`  ${scoreName}:`);
        console.log(`    avg: ${(aggregate.avg * 100).toFixed(1)}%`);
        console.log(`    min: ${(aggregate.min * 100).toFixed(1)}%`);
        console.log(`    max: ${(aggregate.max * 100).toFixed(1)}%`);
    }
}
// Run with scenario from command line
const scenarioId = process.argv[2];
if (!scenarioId) {
    console.log("Usage: npx tsx capture-full-output.ts <scenario-id>");
    console.log();
    console.log("Available advanced analytics scenarios:");
    console.log("  adv-rfm-segmentation-scoring");
    console.log("  adv-propensity-model-scoring");
    console.log("  adv-decile-analysis-cutoffs");
    console.log("  adv-lookalike-audience-strategy");
    console.log("  adv-name-flow-customer-journey");
    console.log("  adv-profitability-media-plan");
    process.exit(0);
}
captureFullOutput(scenarioId).catch(console.error);
//# sourceMappingURL=capture-full-output.js.map