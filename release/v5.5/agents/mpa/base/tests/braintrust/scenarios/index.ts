/**
 * Test Scenarios Index
 *
 * Exports all test scenarios for the multi-turn MPA evaluation system.
 */

import { TestScenario } from "../mpa-multi-turn-types.js";

// Import individual scenarios
import {
  basicUserStep1_2Scenario,
  basicUserPersona,
} from "./basic-user-step1-2.js";
import {
  sophisticatedIdkScenario,
  sophisticatedUserPersona,
} from "./sophisticated-idk.js";
import {
  full10StepScenario,
  intermediateUserPersona,
} from "./full-10-step.js";

// Export individual scenarios
export {
  basicUserStep1_2Scenario,
  basicUserPersona,
  sophisticatedIdkScenario,
  sophisticatedUserPersona,
  full10StepScenario,
  intermediateUserPersona,
};

/**
 * All available test scenarios
 */
export const ALL_SCENARIOS: TestScenario[] = [
  basicUserStep1_2Scenario,
  sophisticatedIdkScenario,
  full10StepScenario,
];

/**
 * Quick test scenarios (faster execution, fewer turns)
 */
export const QUICK_SCENARIOS: TestScenario[] = [
  basicUserStep1_2Scenario,
  sophisticatedIdkScenario,
];

/**
 * Full test scenarios (comprehensive, more turns)
 */
export const FULL_SCENARIOS: TestScenario[] = [full10StepScenario];

/**
 * Get scenario by ID
 */
export function getScenarioById(id: string): TestScenario | undefined {
  return ALL_SCENARIOS.find((s) => s.id === id);
}

/**
 * Get scenarios by tag/category
 */
export function getScenariosByCategory(
  category: "quick" | "full" | "all"
): TestScenario[] {
  switch (category) {
    case "quick":
      return QUICK_SCENARIOS;
    case "full":
      return FULL_SCENARIOS;
    case "all":
    default:
      return ALL_SCENARIOS;
  }
}

/**
 * Scenario metadata for reporting
 */
export const SCENARIO_METADATA = {
  "basic-user-step1-2": {
    name: "Basic User - Steps 1-2",
    description: "Tests language adaptation and calculation for basic user",
    expectedDuration: "2-5 minutes",
    expectedTurns: "4-12",
    difficulty: "easy",
  },
  "sophisticated-idk-protocol": {
    name: "Sophisticated User - IDK Protocol",
    description: "Tests handling of uncertainty and benchmark modeling",
    expectedDuration: "3-8 minutes",
    expectedTurns: "5-15",
    difficulty: "medium",
  },
  "full-10-step": {
    name: "Full 10-Step Planning",
    description: "Complete media planning session through all steps",
    expectedDuration: "15-30 minutes",
    expectedTurns: "20-50",
    difficulty: "hard",
  },
};

export default ALL_SCENARIOS;
