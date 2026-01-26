/**
 * CA Agent Braintrust Evaluation Runner
 *
 * Evaluates the Consulting Agent's RAG retrieval quality
 * and response generation capabilities.
 */
interface CATestCase {
    input: string;
    expectedTopic: string;
    expectedDocTypes: string[];
    description: string;
}
declare const CA_TEST_CASES: CATestCase[];
export { CA_TEST_CASES };
//# sourceMappingURL=ca-eval.d.ts.map