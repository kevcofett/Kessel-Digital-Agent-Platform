/**
 * MPA System Prompt Content for Multi-Turn Evaluation
 *
 * Supports dynamic loading via MPA_INSTRUCTIONS_PATH environment variable.
 * Falls back to embedded v5_8 prompt if not specified.
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
 */
export declare const RAG_TOOL_INSTRUCTIONS = "\n\nKNOWLEDGE BASE TOOLS\n\nYou have access to tools for searching the media planning knowledge base:\n\n1. search_knowledge_base - Search for relevant information, frameworks, or guidance\n2. get_benchmark - Get specific benchmark values for industry verticals and metrics\n3. get_audience_sizing - Get audience size estimates with methodology\n\nTOOL USAGE RULES\n\n1. Use get_benchmark BEFORE citing any specific benchmark number (CAC, CPM, conversion rates, etc.)\n2. Use search_knowledge_base when you need framework guidance or best practices\n3. Use get_audience_sizing when discussing market size or targeting precision\n4. If a tool returns no results, clearly state \"My estimate\" instead of fabricating data\n5. Do not use tools for basic conversation - only for data retrieval needs\n\nCITATION FORMAT\n\nAfter using a tool, incorporate the provided citation naturally:\n- CORRECT: \"Based on Knowledge Base, typical ecommerce CAC runs $25-45.\"\n- INCORRECT: \"Industry benchmarks suggest CAC is typically around $25-45.\"\n\nThe tool results include pre-formatted citation text. Use it directly.\n\nWHEN NOT TO USE TOOLS\n\n- For basic conversation and greetings\n- When the user has already provided the specific data you need\n- When making general strategic recommendations that don't require specific numbers\n- When you've already retrieved the relevant information in this conversation\n";
export default MPA_SYSTEM_PROMPT;
//# sourceMappingURL=mpa-prompt-content.d.ts.map