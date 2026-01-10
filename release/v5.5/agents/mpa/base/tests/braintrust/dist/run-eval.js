"use strict";
/**
 * Unified MPA Evaluation Runner
 *
 * Runs single-turn and/or multi-turn evaluations based on command line arguments.
 *
 * Usage:
 *   # Run single-turn evaluation only
 *   ANTHROPIC_API_KEY=xxx npx ts-node --esm run-eval.ts --single-turn
 *
 *   # Run multi-turn evaluation only
 *   ANTHROPIC_API_KEY=xxx npx ts-node --esm run-eval.ts --multi-turn
 *
 *   # Run both (two-phase validation)
 *   ANTHROPIC_API_KEY=xxx npx ts-node --esm run-eval.ts --both
 *
 *   # Run multi-turn with specific scenario
 *   ANTHROPIC_API_KEY=xxx npx ts-node --esm run-eval.ts --multi-turn --scenario basic-user-step1-2
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
function parseArgs() {
    const args = process.argv.slice(2);
    const result = {
        singleTurn: false,
        multiTurn: false,
        verbose: false,
    };
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case "--single-turn":
            case "-s":
                result.singleTurn = true;
                break;
            case "--multi-turn":
            case "-m":
                result.multiTurn = true;
                break;
            case "--both":
            case "-b":
                result.singleTurn = true;
                result.multiTurn = true;
                break;
            case "--scenario":
                result.scenario = args[++i];
                break;
            case "--verbose":
            case "-v":
                result.verbose = true;
                break;
        }
    }
    // Default to both if nothing specified
    if (!result.singleTurn && !result.multiTurn) {
        result.singleTurn = true;
        result.multiTurn = true;
    }
    return result;
}
async function runCommand(command, args, cwd) {
    return new Promise((resolve) => {
        const proc = (0, child_process_1.spawn)(command, args, {
            cwd,
            shell: true,
            env: process.env,
        });
        let stdout = "";
        let stderr = "";
        proc.stdout.on("data", (data) => {
            stdout += data.toString();
            process.stdout.write(data);
        });
        proc.stderr.on("data", (data) => {
            stderr += data.toString();
            process.stderr.write(data);
        });
        proc.on("close", (code) => {
            resolve({ stdout, stderr, exitCode: code || 0 });
        });
    });
}
async function runSingleTurnEval() {
    console.log("\n========================================");
    console.log("PHASE 1: Single-Turn Evaluation");
    console.log("========================================\n");
    try {
        const result = await runCommand("npx", ["braintrust", "eval", "mpa-eval.ts"], __dirname);
        if (result.exitCode !== 0) {
            return {
                type: "single-turn",
                success: false,
                error: `Exit code: ${result.exitCode}`,
            };
        }
        return {
            type: "single-turn",
            success: true,
            details: { stdout: result.stdout },
        };
    }
    catch (error) {
        return {
            type: "single-turn",
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
async function runMultiTurnEval(scenario) {
    console.log("\n========================================");
    console.log("PHASE 2: Multi-Turn Evaluation");
    console.log("========================================\n");
    try {
        const args = ["ts-node", "--esm", "mpa-multi-turn-eval.ts"];
        if (scenario) {
            args.push("--scenario", scenario);
        }
        const result = await runCommand("npx", args, __dirname);
        if (result.exitCode !== 0) {
            return {
                type: "multi-turn",
                success: false,
                error: `Exit code: ${result.exitCode}`,
            };
        }
        return {
            type: "multi-turn",
            success: true,
            details: { stdout: result.stdout },
        };
    }
    catch (error) {
        return {
            type: "multi-turn",
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
function printSummary(results) {
    console.log("\n========================================");
    console.log("EVALUATION SUMMARY");
    console.log("========================================\n");
    for (const result of results) {
        const status = result.success ? "PASS" : "FAIL";
        const icon = result.success ? "✅" : "❌";
        console.log(`${icon} ${result.type.toUpperCase()}: ${status}`);
        if (result.error) {
            console.log(`   Error: ${result.error}`);
        }
        if (result.composite !== undefined) {
            console.log(`   Composite: ${(result.composite * 100).toFixed(1)}%`);
        }
    }
    const allPassed = results.every((r) => r.success);
    console.log("\n----------------------------------------");
    console.log(`OVERALL: ${allPassed ? "✅ ALL EVALUATIONS PASSED" : "❌ SOME EVALUATIONS FAILED"}`);
    console.log("----------------------------------------\n");
}
async function main() {
    const args = parseArgs();
    console.log("MPA Unified Evaluation Runner");
    console.log("============================");
    console.log(`Single-turn: ${args.singleTurn ? "YES" : "NO"}`);
    console.log(`Multi-turn: ${args.multiTurn ? "YES" : "NO"}`);
    if (args.scenario) {
        console.log(`Scenario: ${args.scenario}`);
    }
    const results = [];
    // Phase 1: Single-turn evaluation
    if (args.singleTurn) {
        const singleTurnResult = await runSingleTurnEval();
        results.push(singleTurnResult);
        // If single-turn fails, skip multi-turn
        if (!singleTurnResult.success) {
            console.log("\nSingle-turn evaluation failed. Skipping multi-turn.");
            printSummary(results);
            process.exit(1);
        }
    }
    // Phase 2: Multi-turn evaluation
    if (args.multiTurn) {
        const multiTurnResult = await runMultiTurnEval(args.scenario);
        results.push(multiTurnResult);
    }
    printSummary(results);
    const allPassed = results.every((r) => r.success);
    process.exit(allPassed ? 0 : 1);
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
//# sourceMappingURL=run-eval.js.map