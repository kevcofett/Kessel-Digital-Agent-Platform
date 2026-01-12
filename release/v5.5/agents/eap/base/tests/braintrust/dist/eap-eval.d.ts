/**
 * EAP Agent Braintrust Evaluation Runner
 *
 * Evaluates the Enterprise AI Platform agent's RAG retrieval quality
 * and response generation capabilities.
 */
interface EAPTestCase {
    input: string;
    expectedTopic: string;
    expectedDocTypes: string[];
    description: string;
}
declare const EAP_TEST_CASES: EAPTestCase[];
export { EAP_TEST_CASES };
//# sourceMappingURL=eap-eval.d.ts.map