/**
 * MPA System Prompt Content for Multi-Turn Evaluation
 *
 * VERSION: v6.0 - Updated for MPA v6.0 KB Architecture
 *
 * Supports dynamic loading via MPA_INSTRUCTIONS_PATH environment variable.
 * Falls back to embedded v6_0 prompt if not specified.
 *
 * Usage:
 *   MPA_INSTRUCTIONS_PATH=path/to/instructions.txt node dist/mpa-multi-turn-eval.js
 *
 * IMPORTANT: Core instructions must be 7,500-7,999 characters.
 * Detailed guidance belongs in KB documents, not here.
 */
export declare const MPA_SYSTEM_PROMPT: string;
/**
 * RAG Tool Instructions - Appended when agentic RAG is enabled
 * Updated for v6.0 KB architecture
 */
export declare const RAG_TOOL_INSTRUCTIONS = "\n\nKNOWLEDGE BASE TOOLS\n\nYou have access to tools for searching the media planning knowledge base:\n\n1. search_knowledge_base - Search for relevant information, frameworks, or guidance\n   - Uses META tag routing from KB_INDEX for optimal retrieval\n   - Returns confidence level (HIGH/MEDIUM/LOW) for each result\n2. get_benchmark - Get specific benchmark values for industry verticals and metrics\n   - Supports 14 verticals: RETAIL, ECOMMERCE, CPG, FINANCE, TECHNOLOGY, HEALTHCARE, AUTOMOTIVE, TRAVEL, ENTERTAINMENT, TELECOM, GAMING, HOSPITALITY, EDUCATION, B2B_PROFESSIONAL\n   - Returns channel-specific metrics (PAID_SEARCH, PAID_SOCIAL, PROGRAMMATIC_DISPLAY, CTV_OTT)\n3. get_audience_sizing - Get audience size estimates with methodology\n   - NOTE: For census data, use web_search tool as indicated by META_WEB_SEARCH_TRIGGER\n\nTOOL USAGE RULES\n\n1. Use get_benchmark BEFORE citing any specific benchmark number (CAC, CPM, conversion rates, etc.)\n2. Use search_knowledge_base when you need framework guidance or best practices\n3. Use get_audience_sizing when discussing market size or targeting precision\n4. For census population data, use web_search - do NOT fabricate census statistics\n5. If a tool returns no results, clearly state \"My estimate\" instead of fabricating data\n6. Do not use tools for basic conversation - only for data retrieval needs\n\nCITATION FORMAT\n\nAfter using a tool, incorporate the provided citation naturally:\n- CORRECT: \"Based on Knowledge Base, typical ecommerce CAC runs $25-45 (confidence: HIGH).\"\n- CORRECT: \"Based on benchmark data for RETAIL vertical, CPM ranges $8-15.\"\n- INCORRECT: \"Industry benchmarks suggest CAC is typically around $25-45.\"\n\nThe tool results include pre-formatted citation text. Use it directly.\n\nWHEN NOT TO USE TOOLS\n\n- For basic conversation and greetings\n- When the user has already provided the specific data you need\n- When making general strategic recommendations that don't require specific numbers\n- When you've already retrieved the relevant information in this conversation\n";
/**
 * KB v6.0 Document Index (for RAG simulation in testing)
 * Maps intents to KB documents
 */
export declare const KB_V6_DOCUMENT_MAP: {
    CHANNEL_SELECTION: string[];
    BUDGET_PLANNING: string[];
    AUDIENCE_TARGETING: string[];
    MEASUREMENT_GUIDANCE: string[];
    BENCHMARK_LOOKUP: string[];
    GAP_RESOLUTION: string[];
    WORKFLOW_HELP: string[];
    CONFIDENCE_ASSESSMENT: string[];
};
/**
 * Supported verticals for benchmark retrieval (v6.0)
 */
export declare const SUPPORTED_VERTICALS: string[];
/**
 * Supported channels for benchmark retrieval (v6.0)
 */
export declare const SUPPORTED_CHANNELS: string[];
export default MPA_SYSTEM_PROMPT;
//# sourceMappingURL=mpa-prompt-content.d.ts.map