/**
 * Reforecasting Scorers for Multi-Turn MPA Evaluation
 *
 * Evaluates how well the agent handles mid-conversation data changes.
 * When a user revises inputs (budget, volume, timeline), the agent should:
 * 1. Acknowledge the change
 * 2. Recalculate affected metrics
 * 3. Explain the strategic impact
 * 4. Recommend actions to address
 */
import { ConversationTurn, TurnScore, DataChange } from "../mpa-multi-turn-types.js";
/**
 * Data revision record for tracking agent response to changes
 */
export interface DataRevisionRecord {
    turnNumber: number;
    field: string;
    oldValue: unknown;
    newValue: unknown;
    agentAcknowledged: boolean;
    agentRecalculated: boolean;
    agentExplainedImpact: boolean;
    agentRecommendedAction: boolean;
}
/**
 * Score how well the agent handles data changes (reforecasting quality)
 *
 * Evaluates:
 * - Acknowledgment of the change (25%)
 * - Recalculation of affected metrics (25%)
 * - Explanation of strategic impact (25%)
 * - Recommendation of actions (25%)
 *
 * If no data changes occurred, returns 1.0 (perfect - nothing to reforecast)
 */
export declare function scoreReforecasting(turns: ConversationTurn[], dataRevisions: DataRevisionRecord[]): TurnScore;
/**
 * Create data revision records from triggered data changes
 *
 * Call this after the user simulator triggers a data change to create
 * the revision record for tracking agent response.
 */
export declare function createDataRevisionRecord(turnNumber: number, dataChange: DataChange): DataRevisionRecord;
/**
 * Analyze agent response and update revision record
 *
 * Call this after getting the agent's response to a data change
 * to record how well the agent handled it.
 */
export declare function updateRevisionRecord(record: DataRevisionRecord, agentResponse: string): DataRevisionRecord;
//# sourceMappingURL=reforecasting-scorers.d.ts.map