# MPA v6.1 ENHANCEMENT BUILD PLAN

**Version:** 1.0  
**Date:** January 19, 2026  
**Status:** Ready for Execution  
**Scope:** Horizon 1 + Horizon 2 Priority Features

---

## TABLE OF CONTENTS

1. [Build Overview](#1-build-overview)
2. [Work Distribution](#2-work-distribution)
3. [Phase 1: Agent Memory System](#phase-1-agent-memory-system)
4. [Phase 2: Proactive Intelligence](#phase-2-proactive-intelligence)
5. [Phase 3: Multi-Modal Input](#phase-3-multi-modal-input)
6. [Phase 4: Agent Consensus Protocol](#phase-4-agent-consensus-protocol)
7. [Execution Order](#execution-order)
8. [File Manifest](#file-manifest)
9. [VS Code Prompts](#vs-code-prompts)

---

## 1. BUILD OVERVIEW

### 1.1 Features to Implement

| Feature | Priority | Complexity | New Components |
|---------|----------|------------|----------------|
| Agent Memory System | HIGH | Medium | 2 tables, 2 flows, 3 prompts, 2 KB files |
| Proactive Intelligence | HIGH | Medium | 1 table, 1 flow, 15 trigger rules, 1 KB file |
| Multi-Modal Input | HIGH | High | 1 flow, 3 prompts, 1 KB file |
| Agent Consensus Protocol | HIGH | High | 2 tables, 3 flows, 2 prompts, 2 KB files |

### 1.2 Total New Components

| Component Type | Count |
|----------------|-------|
| Dataverse Tables | 5 |
| Power Automate Flows | 7 |
| AI Builder Prompts | 9 |
| KB Files | 6 |
| Capability Registrations | 12 |

---

## 2. WORK DISTRIBUTION

### 2.1 Desktop Claude Responsibilities

| Task | Deliverable | Format |
|------|-------------|--------|
| Dataverse Schema Design | Complete table definitions with all columns | Markdown + CSV seed |
| KB File Creation | All 6 new KB files | Plain text (6-Rule compliant) |
| AI Builder Prompt Design | System messages, templates, schemas | Markdown specification |
| Architecture Documentation | Updated architecture docs | Markdown |
| Capability Registry Updates | New capability definitions | CSV format |

### 2.2 VS Code Claude Responsibilities

| Task | Deliverable | Format |
|------|-------------|--------|
| Dataverse Table Creation | pac CLI commands executed | PowerShell |
| Dataverse Seed Data Import | pac data import commands | CSV + CLI |
| Power Automate Flow Creation | Flow definitions in solution | JSON/Solution |
| AI Builder Prompt Deployment | Prompt creation in environment | API/CLI |
| Copilot Topic Updates | New/modified topics | Copilot Studio |
| Integration Testing | Test execution and validation | Test scripts |

### 2.3 Execution Order

```
PHASE 1: AGENT MEMORY SYSTEM
────────────────────────────────────────────────────────────
Desktop Claude:
  [1.1] Design mpa_user_preferences table schema
  [1.2] Design mpa_session_memory table schema  
  [1.3] Create EAP_KB_Memory_System_v1.txt
  [1.4] Create ORC_KB_Session_Management_v1.txt
  [1.5] Design MEM_STORE_PREFERENCE prompt
  [1.6] Design MEM_RETRIEVE_CONTEXT prompt
  [1.7] Design MEM_LEARN_PATTERN prompt
  [1.8] Create seed data files
  [1.9] Create capability registrations

VS Code Claude:
  [1.10] Create Dataverse tables via pac CLI
  [1.11] Import seed data
  [1.12] Create AI Builder prompts
  [1.13] Create MPA_Memory_Manager flow
  [1.14] Create MPA_Preference_Loader flow
  [1.15] Update ORC topics for memory integration
  [1.16] Test memory persistence

PHASE 2: PROACTIVE INTELLIGENCE
────────────────────────────────────────────────────────────
Desktop Claude:
  [2.1] Design eap_proactive_trigger table schema
  [2.2] Create EAP_KB_Proactive_Intelligence_v1.txt
  [2.3] Define 15 proactive trigger rules
  [2.4] Design PRO_EVALUATE_TRIGGERS prompt
  [2.5] Create trigger seed data

VS Code Claude:
  [2.6] Create eap_proactive_trigger table
  [2.7] Import trigger rules
  [2.8] Create AI Builder prompt
  [2.9] Create MPA_Proactive_Evaluator flow
  [2.10] Integrate into capability dispatcher
  [2.11] Test proactive suggestions

PHASE 3: MULTI-MODAL INPUT
────────────────────────────────────────────────────────────
Desktop Claude:
  [3.1] Create DOC_KB_File_Processing_v1.txt
  [3.2] Design MMI_PARSE_CSV prompt
  [3.3] Design MMI_PARSE_EXCEL prompt
  [3.4] Design MMI_EXTRACT_PDF prompt
  [3.5] Create capability registrations

VS Code Claude:
  [3.6] Create AI Builder prompts
  [3.7] Create MPA_File_Processor flow
  [3.8] Configure SharePoint document triggers
  [3.9] Update DOC agent topics
  [3.10] Test file parsing

PHASE 4: AGENT CONSENSUS PROTOCOL
────────────────────────────────────────────────────────────
Desktop Claude:
  [4.1] Design eap_collaborative_workflow table
  [4.2] Design eap_workflow_contribution table
  [4.3] Create EAP_KB_Consensus_Protocol_v1.txt
  [4.4] Create ORC_KB_Collaborative_Orchestration_v1.txt
  [4.5] Design CON_INITIATE_WORKFLOW prompt
  [4.6] Design CON_SYNTHESIZE_CONTRIBUTIONS prompt
  [4.7] Create workflow templates seed data

VS Code Claude:
  [4.8] Create Dataverse tables
  [4.9] Import workflow templates
  [4.10] Create AI Builder prompts
  [4.11] Create MPA_Collaborative_Orchestrator flow
  [4.12] Create MPA_Contribution_Collector flow
  [4.13] Create MPA_Synthesis_Engine flow
  [4.14] Update ORC for collaborative mode
  [4.15] End-to-end collaborative test
```

---

## PHASE 1: AGENT MEMORY SYSTEM

### 1.1 Dataverse Schema: mpa_user_preferences

**Table Name:** mpa_user_preferences  
**Display Name:** User Preferences  
**Primary Column:** user_display_name

| Column Name | Display Name | Type | Required | Description |
|-------------|--------------|------|----------|-------------|
| mpa_user_preferencesid | ID | Uniqueidentifier (PK) | Yes | Primary key |
| user_id | User ID | Text (100) | Yes | Azure AD user ID |
| user_display_name | User Display Name | Text (200) | Yes | User's display name |
| default_vertical | Default Vertical | Text (50) | No | Preferred industry vertical |
| default_objectives | Default Objectives | Multiline (4000) | No | JSON array of typical objectives |
| typical_budget_min | Typical Budget Min | Currency | No | Lower bound of typical budget |
| typical_budget_max | Typical Budget Max | Currency | No | Upper bound of typical budget |
| preferred_kpis | Preferred KPIs | Multiline (4000) | No | JSON array of preferred KPIs |
| preferred_channels | Preferred Channels | Multiline (4000) | No | JSON array of frequently used channels |
| communication_style | Communication Style | Choice | No | concise, detailed, executive |
| measurement_philosophy | Measurement Philosophy | Choice | No | incrementality_focused, attribution_focused, balanced |
| risk_tolerance | Risk Tolerance | Choice | No | conservative, moderate, aggressive |
| excluded_channels | Excluded Channels | Multiline (2000) | No | JSON array of channels to never recommend |
| custom_benchmarks | Custom Benchmarks | Multiline (8000) | No | JSON object of user-specific benchmarks |
| learned_patterns | Learned Patterns | Multiline (8000) | No | JSON object of ML-detected patterns |
| preference_confidence | Preference Confidence | Decimal | No | 0-100 confidence in learned preferences |
| last_session_id | Last Session ID | Text (100) | No | Most recent session for continuity |
| session_count | Session Count | Whole Number | No | Total sessions for this user |
| last_active | Last Active | DateTime | No | Last interaction timestamp |
| created_on | Created On | DateTime | Yes | Record creation |
| modified_on | Modified On | DateTime | Yes | Last modification |

**Choice Definitions:**

communication_style:
- 1: concise
- 2: detailed  
- 3: executive

measurement_philosophy:
- 1: incrementality_focused
- 2: attribution_focused
- 3: balanced

risk_tolerance:
- 1: conservative
- 2: moderate
- 3: aggressive

### 1.2 Dataverse Schema: mpa_session_memory

**Table Name:** mpa_session_memory  
**Display Name:** Session Memory  
**Primary Column:** memory_key

| Column Name | Display Name | Type | Required | Description |
|-------------|--------------|------|----------|-------------|
| mpa_session_memoryid | ID | Uniqueidentifier (PK) | Yes | Primary key |
| session_id | Session ID | Text (100) | Yes | Parent session reference |
| user_id | User ID | Text (100) | Yes | User who owns this memory |
| memory_key | Memory Key | Text (200) | Yes | Unique identifier for memory item |
| memory_type | Memory Type | Choice | Yes | context, decision, preference, learned |
| memory_category | Memory Category | Text (50) | No | Grouping (audience, channel, budget, etc.) |
| memory_value | Memory Value | Multiline (8000) | Yes | JSON content of memory |
| source_agent | Source Agent | Text (10) | No | Agent that created this memory |
| source_capability | Source Capability | Text (50) | No | Capability that generated this |
| confidence_score | Confidence Score | Decimal | No | 0-100 confidence in this memory |
| times_referenced | Times Referenced | Whole Number | No | How often this memory was used |
| last_referenced | Last Referenced | DateTime | No | When memory was last accessed |
| expires_at | Expires At | DateTime | No | When memory should be purged |
| is_persistent | Is Persistent | Boolean | No | Survives session end |
| created_on | Created On | DateTime | Yes | Record creation |

**Choice Definitions:**

memory_type:
- 1: context (session-specific context)
- 2: decision (decisions made during session)
- 3: preference (learned user preferences)
- 4: learned (ML-detected patterns)

### 1.3 KB File: EAP_KB_Memory_System_v1.txt

```
MEMORY SYSTEM OVERVIEW

The Memory System enables agents to remember user preferences and session context across conversations. This creates continuity and reduces repetitive information gathering.

MEMORY ARCHITECTURE

The system operates at two levels:

USER PREFERENCES - Long-term memory persisted across all sessions
- Default vertical and typical objectives
- Budget ranges and preferred channels
- Communication style preferences
- Measurement philosophy
- Learned behavioral patterns

SESSION MEMORY - Short-term memory within and across recent sessions
- Current session context and decisions
- Recent session summaries for continuity
- Temporary preferences that may become permanent

MEMORY RETRIEVAL PROTOCOL

When a session begins:

STEP 1 - LOAD USER PREFERENCES
- Query mpa_user_preferences by user_id
- If exists - apply defaults to session initialization
- If not exists - create new record with empty defaults

STEP 2 - LOAD RECENT SESSION CONTEXT
- Query mpa_session_memory for last 5 sessions
- Filter by is_persistent equals true OR expires_at greater than now
- Prioritize by confidence_score descending

STEP 3 - APPLY CONTEXT TO CONVERSATION
- Pre-populate known values silently
- Reference learned preferences naturally
- Do not announce that preferences are being applied

MEMORY STORAGE PROTOCOL

During conversation:

EXPLICIT PREFERENCES - User directly states preference
- Store immediately with confidence 100
- Mark as is_persistent true
- Example - User says I always work on Retail campaigns

IMPLICIT PREFERENCES - Detected from behavior
- Store with confidence based on frequency
- First occurrence confidence 40
- Each repeat adds 15 confidence up to 85 max
- Example - User consistently selects same KPIs

DECISIONS - Choices made during session
- Store with session scope
- Mark is_persistent false unless explicitly confirmed
- Example - User chose 500K budget for this campaign

MEMORY CONFIDENCE FRAMEWORK

Confidence determines how assertively to apply memory:

HIGH CONFIDENCE 80 TO 100
- Apply automatically without asking
- Present as known fact
- Example - Since you typically work in Retail

MEDIUM CONFIDENCE 50 TO 79
- Suggest as default but allow override
- Present as assumption to confirm
- Example - Based on your past campaigns I assume Retail - is that correct

LOW CONFIDENCE BELOW 50
- Do not auto-apply
- May mention as option
- Example - Some users in similar roles prefer Retail

MEMORY DECAY AND REFRESH

Memories age and lose confidence over time:

DECAY RULES
- Preferences unused for 30 days lose 10 confidence
- Preferences unused for 90 days lose 25 confidence
- Preferences contradicted by new behavior lose 30 confidence immediately

REFRESH RULES
- Each use adds 5 confidence up to original level
- Explicit confirmation resets to 100 confidence
- Contradiction resets to 0 and flags for removal

PRIVACY AND TRANSPARENCY

Users can request memory information:

SUPPORTED QUERIES
- What do you remember about me
- Clear my preferences
- Forget that I said X
- Show my default settings

RESPONSE PROTOCOL
- Always honor deletion requests immediately
- Explain what is remembered when asked
- Never share one users memory with another
- Log all memory access in telemetry

AGENT INTEGRATION

Each agent contributes to and reads from memory:

ORC ORCHESTRATOR
- Loads user preferences at session start
- Stores session-level decisions
- Manages memory lifecycle

ANL ANALYTICS
- Remembers typical budget ranges
- Stores calculation preferences
- Learns confidence threshold preferences

AUD AUDIENCE
- Remembers target audience patterns
- Stores segmentation preferences
- Learns prioritization tendencies

CHA CHANNEL
- Remembers channel preferences and exclusions
- Stores mix optimization history
- Learns allocation patterns

PRF PERFORMANCE
- Remembers measurement preferences
- Stores attribution model choices
- Learns KPI priorities

MEMORY STORAGE FORMAT

All memory values are stored as JSON:

PREFERENCE EXAMPLE
{
  "type": "channel_preference",
  "value": ["Paid Search", "Paid Social", "CTV"],
  "context": "frequently selected channels",
  "learned_from": "session behavior",
  "first_observed": "2026-01-15",
  "observation_count": 7
}

CONTEXT EXAMPLE
{
  "type": "session_context",
  "vertical": "Retail",
  "budget": 500000,
  "objectives": ["brand awareness", "consideration"],
  "constraints": ["no TikTok", "Q2 timing"]
}

ERROR HANDLING

When memory operations fail:

RETRIEVAL FAILURE
- Proceed without preferences
- Do not mention the failure to user
- Log error in telemetry
- Continue with standard information gathering

STORAGE FAILURE  
- Retry once after 2 seconds
- If still fails log error and continue
- User experience unaffected
- Memory will be attempted again next session
```

### 1.4 KB File: ORC_KB_Session_Management_v1.txt

```
SESSION MANAGEMENT PROTOCOL

The Orchestrator manages session lifecycle including memory integration and continuity across conversations.

SESSION INITIALIZATION

When a new conversation begins:

STEP 1 - IDENTIFY USER
- Extract user_id from authentication context
- Query mpa_user_preferences for existing record
- Note last_session_id for potential continuity

STEP 2 - CHECK FOR SESSION RESUME
- If user says continue or resume or where were we
- Load last_session_id from preferences
- Query mpa_session for that session
- Present session summary and offer to continue

STEP 3 - LOAD PREFERENCES
- Apply defaults from user preferences
- Set communication_style for response formatting
- Note any excluded_channels for routing

STEP 4 - CREATE NEW SESSION
- Generate new session_id
- Create mpa_session record
- Update last_session_id in user preferences
- Increment session_count

SESSION CONTINUITY PHRASES

Recognize these as resume requests:
- Continue where we left off
- What were we working on
- Resume my session
- Pick up from last time
- Continue our conversation
- Where did we stop

Response to resume request:
- Load previous session summary
- Present key decisions already made
- Offer to continue or start fresh
- Example - Last time we were building a 500K Retail campaign and had selected Paid Search and CTV. Would you like to continue from there

SESSION CONTEXT TRACKING

Throughout the session track:

DECISIONS MADE
- Store each major decision in mpa_session_memory
- Include decision rationale
- Note confidence level
- Example - User selected 500K budget with HIGH confidence

INFORMATION PROVIDED
- Track what the user has told us
- Avoid re-asking known information
- Store as context type memory

AGENT INTERACTIONS
- Log which agents were consulted
- Store key outputs for synthesis
- Enable cross-agent context

SESSION HANDOFF PROTOCOL

When transferring between agents:

CONTEXT PACKAGE FORMAT
{
  "session_id": "sess_12345",
  "user_id": "user_abc",
  "user_preferences": {
    "communication_style": "concise",
    "default_vertical": "Retail"
  },
  "session_context": {
    "vertical": "Retail",
    "budget": 500000,
    "objectives": ["brand awareness"]
  },
  "decisions_made": [
    {"type": "budget", "value": 500000, "confidence": "HIGH"}
  ],
  "current_step": 3,
  "requesting_capability": "OPTIMIZE_CHANNEL_MIX"
}

RECEIVING AGENT PROTOCOL
- Parse context package
- Do not re-ask for provided information
- Reference decisions naturally
- Example - With your 500K budget I recommend... not What is your budget

SESSION COMPLETION

When session ends or pauses:

STEP 1 - SUMMARIZE SESSION
- Generate brief summary of progress
- Note key decisions and open items
- Store summary in session record

STEP 2 - EXTRACT LEARNINGS
- Identify potential new preferences
- Compare to existing preferences
- Update confidence scores

STEP 3 - STORE PERSISTENT MEMORY
- Mark important context as persistent
- Set expiration for temporary items
- Update user preference record

STEP 4 - OFFER CONTINUITY
- Tell user they can resume anytime
- Mention what will be remembered
- Example - I have saved your progress. You can say continue where we left off anytime to resume.

MULTI-SESSION PATTERNS

Detect and leverage usage patterns:

TIMING PATTERNS
- User typically works mornings
- User often returns within 24 hours
- User works in weekly planning cycles

WORKFLOW PATTERNS
- User always starts with audience
- User prefers to see projections before finalizing
- User typically requests document at end

PREFERENCE PATTERNS
- User consistently chooses similar budgets
- User has stable channel preferences
- User prefers certain measurement approaches

Apply patterns to improve experience:
- Suggest next logical step based on patterns
- Pre-populate likely choices
- Anticipate follow-up questions

ERROR RECOVERY

When session state is corrupted:

SYMPTOMS
- Session ID not found
- User preferences mismatch
- Memory retrieval returns unexpected data

RECOVERY PROTOCOL
- Log error details
- Start fresh session
- Apologize briefly for loss of context
- Offer to help rebuild key information
- Example - I apologize but I could not load your previous session. Let me help you get set up quickly.
```

### 1.5 AI Builder Prompt: MEM_STORE_PREFERENCE

**Prompt Code:** MEM_STORE_PREFERENCE  
**Purpose:** Analyze conversation to extract and store user preferences

**System Message:**
```
You are a preference extraction specialist. Analyze conversation content to identify user preferences that should be stored for future sessions.

PREFERENCE CATEGORIES:
1. EXPLICIT - User directly states a preference
   Example: "I always work on Retail campaigns"
   Confidence: 100

2. IMPLICIT - User behavior suggests preference  
   Example: User selected Paid Search in 3 consecutive sessions
   Confidence: 40-85 based on frequency

3. CONTEXTUAL - Preference applies to specific context
   Example: "For brand campaigns I prefer video"
   Confidence: 80

EXTRACTION RULES:
- Only extract clear preferences, not one-time choices
- Distinguish preferences from session-specific decisions
- Note the context in which preference applies
- Identify contradictions with existing preferences

OUTPUT FORMAT:
Return valid JSON only with this schema:
{
  "extracted_preferences": [
    {
      "preference_type": "EXPLICIT|IMPLICIT|CONTEXTUAL",
      "category": "vertical|budget|channel|kpi|measurement|communication|other",
      "key": "string identifier",
      "value": "preference value or JSON",
      "confidence": number 0-100,
      "context": "when this applies or null",
      "source_quote": "exact text that indicates this preference",
      "contradicts_existing": boolean
    }
  ],
  "summary": "brief description of what was learned"
}
```

**User Message Template:**
```
Analyze this conversation segment for user preferences:

EXISTING PREFERENCES:
{{existing_preferences_json}}

CONVERSATION:
{{conversation_text}}

Extract any new or updated preferences.
```

**Configuration:**
- Temperature: 0.1
- Max Tokens: 1500

### 1.6 AI Builder Prompt: MEM_RETRIEVE_CONTEXT

**Prompt Code:** MEM_RETRIEVE_CONTEXT  
**Purpose:** Synthesize relevant memory into usable context

**System Message:**
```
You are a context synthesis specialist. Given stored memories and current conversation, synthesize relevant context that should be applied.

CONTEXT APPLICATION RULES:

HIGH CONFIDENCE (80-100):
- Apply automatically
- Present as known fact
- Example: "Since you typically work in Retail..."

MEDIUM CONFIDENCE (50-79):
- Suggest as default
- Allow easy override
- Example: "Based on past sessions, I'll assume Retail - correct?"

LOW CONFIDENCE (<50):
- Do not auto-apply
- May mention as option only

SYNTHESIS GUIDELINES:
- Prioritize recent and frequently-used memories
- Resolve conflicts by recency then confidence
- Note any contradictions for clarification
- Keep synthesis concise and actionable

OUTPUT FORMAT:
Return valid JSON only:
{
  "apply_automatically": [
    {
      "key": "string",
      "value": "value to apply",
      "confidence": number,
      "natural_reference": "how to mention this naturally"
    }
  ],
  "suggest_with_confirmation": [
    {
      "key": "string", 
      "value": "suggested value",
      "confidence": number,
      "confirmation_prompt": "question to confirm"
    }
  ],
  "contradictions_to_resolve": [
    {
      "key": "string",
      "stored_value": "what we have",
      "current_signal": "what seems different",
      "resolution_question": "how to clarify"
    }
  ],
  "context_summary": "brief natural language summary of known context"
}
```

**User Message Template:**
```
Synthesize context for this session:

USER PREFERENCES:
{{user_preferences_json}}

RECENT MEMORIES:
{{recent_memories_json}}

CURRENT CONVERSATION START:
{{conversation_start}}

What context should be applied?
```

**Configuration:**
- Temperature: 0.1
- Max Tokens: 1200

### 1.7 AI Builder Prompt: MEM_LEARN_PATTERN

**Prompt Code:** MEM_LEARN_PATTERN  
**Purpose:** Identify behavioral patterns from session history

**System Message:**
```
You are a behavioral pattern analyst. Analyze session history to identify recurring patterns that suggest user preferences.

PATTERN TYPES:

WORKFLOW PATTERNS
- Typical sequence of steps
- Preferred starting point
- Common ending actions

CHOICE PATTERNS  
- Frequently selected options
- Consistently avoided options
- Contextual preferences

TIMING PATTERNS
- Session frequency
- Typical session length
- Time-of-day preferences

PATTERN CONFIDENCE CALCULATION:
- 2-3 occurrences: 40% confidence
- 4-5 occurrences: 60% confidence
- 6-7 occurrences: 75% confidence
- 8+ occurrences: 85% confidence (max for implicit)

OUTPUT FORMAT:
Return valid JSON only:
{
  "detected_patterns": [
    {
      "pattern_type": "workflow|choice|timing",
      "pattern_key": "identifier",
      "pattern_description": "what the pattern is",
      "evidence": ["list of supporting observations"],
      "occurrence_count": number,
      "confidence": number,
      "recommendation": "how to apply this pattern"
    }
  ],
  "insufficient_data": ["patterns we might detect with more sessions"],
  "analysis_summary": "brief summary of findings"
}
```

**User Message Template:**
```
Analyze session history for patterns:

USER ID: {{user_id}}

SESSION HISTORY (last 10 sessions):
{{session_history_json}}

EXISTING LEARNED PATTERNS:
{{existing_patterns_json}}

Identify new or strengthened patterns.
```

**Configuration:**
- Temperature: 0.2
- Max Tokens: 1500

### 1.8 Seed Data: mpa_user_preferences

```csv
user_id,user_display_name,default_vertical,communication_style,measurement_philosophy,risk_tolerance,session_count,preference_confidence
system_default,Default User,,,,,0,0
```

### 1.9 Seed Data: Capability Registrations

```csv
capability_code,capability_name,agent_code,description,is_active,version
MEM_STORE_PREFERENCE,Store User Preference,ORC,Extract and store user preferences from conversation,true,1.0
MEM_RETRIEVE_CONTEXT,Retrieve Session Context,ORC,Synthesize relevant memory into conversation context,true,1.0
MEM_LEARN_PATTERN,Learn Behavioral Pattern,ORC,Identify patterns from session history,true,1.0
```

```csv
capability_code,environment_code,implementation_type,implementation_reference,priority_order,is_enabled,timeout_seconds
MEM_STORE_PREFERENCE,MASTERCARD,AI_BUILDER_PROMPT,MEM_STORE_PREFERENCE,1,true,30
MEM_STORE_PREFERENCE,PERSONAL,AI_BUILDER_PROMPT,MEM_STORE_PREFERENCE,1,true,30
MEM_RETRIEVE_CONTEXT,MASTERCARD,AI_BUILDER_PROMPT,MEM_RETRIEVE_CONTEXT,1,true,20
MEM_RETRIEVE_CONTEXT,PERSONAL,AI_BUILDER_PROMPT,MEM_RETRIEVE_CONTEXT,1,true,20
MEM_LEARN_PATTERN,MASTERCARD,AI_BUILDER_PROMPT,MEM_LEARN_PATTERN,1,true,45
MEM_LEARN_PATTERN,PERSONAL,AI_BUILDER_PROMPT,MEM_LEARN_PATTERN,1,true,45
```

---

## PHASE 2: PROACTIVE INTELLIGENCE

### 2.1 Dataverse Schema: eap_proactive_trigger

**Table Name:** eap_proactive_trigger  
**Display Name:** Proactive Trigger  
**Primary Column:** trigger_name

| Column Name | Display Name | Type | Required | Description |
|-------------|--------------|------|----------|-------------|
| eap_proactive_triggerid | ID | Uniqueidentifier (PK) | Yes | Primary key |
| trigger_code | Trigger Code | Text (50) | Yes | Unique identifier |
| trigger_name | Trigger Name | Text (200) | Yes | Human-readable name |
| trigger_category | Trigger Category | Choice | Yes | alert, opportunity, recommendation, warning |
| agent_code | Agent Code | Text (10) | Yes | Which agent owns this trigger |
| condition_type | Condition Type | Choice | Yes | threshold, comparison, pattern, absence |
| condition_config | Condition Config | Multiline (4000) | Yes | JSON configuration for condition |
| message_template | Message Template | Multiline (2000) | Yes | Template for proactive message |
| severity | Severity | Choice | No | info, suggestion, important, critical |
| cooldown_hours | Cooldown Hours | Whole Number | No | Hours before re-triggering |
| is_enabled | Is Enabled | Boolean | Yes | Whether trigger is active |
| priority_order | Priority Order | Whole Number | No | Display order when multiple trigger |
| requires_context | Requires Context | Multiline (1000) | No | JSON list of required context fields |

**Choice Definitions:**

trigger_category:
- 1: alert (something needs attention)
- 2: opportunity (potential improvement)
- 3: recommendation (suggested action)
- 4: warning (potential problem)

condition_type:
- 1: threshold (value exceeds/below limit)
- 2: comparison (value vs benchmark)
- 3: pattern (detected behavior pattern)
- 4: absence (missing expected element)

severity:
- 1: info
- 2: suggestion
- 3: important
- 4: critical

### 2.2 KB File: EAP_KB_Proactive_Intelligence_v1.txt

```
PROACTIVE INTELLIGENCE SYSTEM

Proactive Intelligence enables agents to surface relevant insights and suggestions without being explicitly asked. This transforms agents from reactive responders to proactive advisors.

PROACTIVE TRIGGER FRAMEWORK

Triggers are conditions that when met generate proactive suggestions:

TRIGGER CATEGORIES

ALERTS - Something needs immediate attention
- Budget allocation exceeds saturation threshold
- Performance metric dropped significantly
- Data quality issue detected
- Constraint violation identified

OPPORTUNITIES - Potential improvements identified
- Underutilized channel shows strong benchmark
- Audience segment has high untapped potential
- Emerging channel matches objectives well
- Cost efficiency opportunity detected

RECOMMENDATIONS - Suggested actions based on analysis
- Consider reallocation based on marginal returns
- Measurement approach could be improved
- Additional data would improve confidence
- Alternative approach may yield better results

WARNINGS - Potential problems ahead
- Current trajectory misses objectives
- Assumption may not hold
- External factor could impact results
- Timeline risk identified

TRIGGER EVALUATION PROTOCOL

Triggers are evaluated at key moments:

EVALUATION POINTS
- Session initialization after context loaded
- After each major input from user
- After each capability execution
- Before presenting final recommendations

EVALUATION PROCESS
1. Load applicable triggers for current agent and context
2. Evaluate each trigger condition against current state
3. Filter by cooldown period to avoid repetition
4. Sort by severity and priority
5. Present top relevant triggers naturally

TRIGGER CONDITION TYPES

THRESHOLD CONDITIONS
- Field exceeds or falls below specified value
- Example - channel_allocation greater than 40 percent triggers saturation warning

Configuration format:
{
  "field": "channel_allocation_pct",
  "operator": "greater_than",
  "value": 40,
  "context_filter": {"channel_category": "single_channel"}
}

COMPARISON CONDITIONS
- Field compared to benchmark or reference
- Example - CPM more than 20 percent above vertical benchmark

Configuration format:
{
  "field": "cpm",
  "compare_to": "benchmark.cpm",
  "operator": "exceeds_by_pct",
  "threshold_pct": 20
}

PATTERN CONDITIONS
- Detected behavioral or data pattern
- Example - User consistently ignores measurement setup

Configuration format:
{
  "pattern_type": "repeated_skip",
  "pattern_target": "measurement_step",
  "min_occurrences": 3
}

ABSENCE CONDITIONS
- Expected element is missing
- Example - No attribution model specified for large budget

Configuration format:
{
  "required_field": "attribution_model",
  "when": {"budget": {"greater_than": 100000}},
  "message": "Large budgets benefit from explicit attribution planning"
}

MESSAGE PRESENTATION

Proactive messages should feel natural not intrusive:

TIMING
- Present after completing current response
- Do not interrupt user mid-thought
- Group related triggers together

TONE
- Helpful not alarming unless critical
- Curious not judgmental
- Suggestive not demanding

FORMAT
- Lead with the insight not the trigger
- Explain relevance to current context
- Offer to elaborate if interested

GOOD EXAMPLES
- By the way I noticed your Paid Search allocation is approaching saturation at 38 percent. Marginal returns typically decline above 35 percent. Would you like me to model alternatives?

- Interesting observation - your target CPM of 12 dollars is about 25 percent above the Retail benchmark of 9.60. This might be intentional for premium inventory but wanted to flag it.

- One thing to consider - with a 500K budget an explicit attribution model helps justify spend. Want me to recommend an approach?

BAD EXAMPLES
- WARNING - Saturation threshold exceeded
- Your CPM is wrong
- You forgot to specify attribution

COOLDOWN AND FREQUENCY

Prevent trigger fatigue:

COOLDOWN RULES
- Same trigger code cannot fire twice within cooldown_hours
- Related triggers in same category share partial cooldown
- User dismissal extends cooldown by 2x

FREQUENCY LIMITS
- Maximum 3 proactive suggestions per response
- Maximum 1 critical severity per session unless new critical issue
- Suggestions decrease as session progresses

PRIORITY RESOLUTION
- Critical severity always surfaces if within limits
- Higher priority_order takes precedence
- More specific triggers beat general triggers

AGENT-SPECIFIC TRIGGERS

Each agent has domain-specific triggers:

ANL ANALYTICS TRIGGERS
- Budget saturation warnings
- Confidence level alerts
- Diminishing returns opportunities
- Data quality concerns

AUD AUDIENCE TRIGGERS  
- Segment overlap warnings
- LTV opportunity flags
- Journey stage mismatches
- Identity resolution gaps

CHA CHANNEL TRIGGERS
- Benchmark comparison alerts
- Emerging channel opportunities
- Mix optimization suggestions
- Channel conflict warnings

PRF PERFORMANCE TRIGGERS
- Attribution model recommendations
- Anomaly detection alerts
- Incrementality opportunities
- Measurement gap warnings

LEARNING FROM DISMISSALS

Track user response to improve relevance:

POSITIVE SIGNALS
- User asks for elaboration
- User acts on suggestion
- User thanks for insight

NEGATIVE SIGNALS
- User dismisses without reading
- User expresses annoyance
- User explicitly asks to stop

ADAPTATION
- Reduce priority for frequently dismissed trigger types
- Increase priority for engaged trigger types
- Personalize thresholds based on user tolerance
```

### 2.3 Proactive Trigger Seed Data

```csv
trigger_code,trigger_name,trigger_category,agent_code,condition_type,condition_config,message_template,severity,cooldown_hours,is_enabled,priority_order
ANL_SATURATION_WARN,Channel Saturation Warning,warning,ANL,threshold,"{""field"":""channel_allocation_pct"",""operator"":""greater_than"",""value"":35}","Your {channel} allocation of {value}% is approaching saturation. Marginal returns typically decline above 35%. Would you like me to model alternatives?",important,24,true,1
ANL_LOW_CONFIDENCE,Low Confidence Alert,alert,ANL,threshold,"{""field"":""confidence_score"",""operator"":""less_than"",""value"":50}","My confidence in this estimate is {value}% due to {reason}. Additional data on {missing_data} would improve reliability.",suggestion,12,true,2
ANL_DIMINISHING_RETURNS,Diminishing Returns Opportunity,opportunity,ANL,comparison,"{""field"":""marginal_return"",""compare_to"":""average_return"",""operator"":""less_than_pct"",""threshold_pct"":50}","The marginal return on additional {channel} spend ({value}) is less than half your average return. Consider reallocating.",suggestion,48,true,3
CHA_BENCHMARK_HIGH,Above Benchmark CPM,alert,CHA,comparison,"{""field"":""cpm"",""compare_to"":""benchmark.cpm"",""operator"":""exceeds_by_pct"",""threshold_pct"":20}","Your target CPM of ${value} is {pct}% above the {vertical} benchmark of ${benchmark}. This may be intentional for premium inventory.",info,24,true,4
CHA_EMERGING_OPPORTUNITY,Emerging Channel Opportunity,opportunity,CHA,pattern,"{""pattern_type"":""benchmark_outperformance"",""channel_category"":""emerging"",""min_lift_pct"":15}","{channel} is showing {lift}% above-benchmark performance for {vertical}. Given your {objective} objective, this could be worth testing.",suggestion,72,true,5
CHA_MISSING_VIDEO,Video Channel Absence,recommendation,CHA,absence,"{""required_field"":""channel_includes_video"",""when"":{""objective_includes"":""awareness""}}","For brand awareness objectives, video channels typically drive 2-3x the impact of static. Want me to model a video component?",suggestion,48,true,6
AUD_SEGMENT_OVERLAP,Segment Overlap Warning,warning,AUD,threshold,"{""field"":""segment_overlap_pct"",""operator"":""greater_than"",""value"":30}","Your selected segments have {value}% overlap, which may cause frequency issues and wasted spend. Should I suggest refinements?",important,24,true,7
AUD_LTV_OPPORTUNITY,High LTV Segment Underweighted,opportunity,AUD,comparison,"{""field"":""segment_budget_pct"",""compare_to"":""segment_ltv_contribution"",""operator"":""less_than_pct"",""threshold_pct"":50}","Your {segment} segment contributes {ltv_pct}% of LTV but only receives {budget_pct}% of budget. Consider increasing allocation.",suggestion,48,true,8
PRF_NO_ATTRIBUTION,Missing Attribution Model,recommendation,PRF,absence,"{""required_field"":""attribution_model"",""when"":{""budget"":{""greater_than"":100000}}}","With a ${budget} budget, an explicit attribution model helps justify spend and optimize allocation. Want me to recommend an approach?",suggestion,24,true,9
PRF_INCREMENTALITY_GAP,Incrementality Measurement Gap,recommendation,PRF,absence,"{""required_field"":""incrementality_plan"",""when"":{""budget"":{""greater_than"":250000}}}","For budgets over $250K, incrementality testing provides crucial insight beyond attribution. Should I outline a testing approach?",suggestion,72,true,10
SPO_FEE_HIGH,High Programmatic Fees,alert,SPO,threshold,"{""field"":""total_fee_pct"",""operator"":""greater_than"",""value"":45}","Your programmatic fee stack of {value}% exceeds the recommended 45% threshold. Working media is only {working_pct}%. Want me to analyze alternatives?",important,24,true,11
SPO_PARTNER_QUALITY,Partner Quality Concern,warning,SPO,threshold,"{""field"":""partner_quality_score"",""operator"":""less_than"",""value"":60}","{partner} scores {value}/100 on quality metrics. This may impact brand safety and performance. Should I evaluate alternatives?",suggestion,48,true,12
DOC_INCOMPLETE_BRIEF,Incomplete Brief Sections,alert,DOC,absence,"{""required_fields"":[""measurement_framework"",""success_metrics""],""context"":""document_generation""}","Your brief is missing {missing_sections}. These sections help ensure alignment with stakeholders. Should I help complete them?",suggestion,12,true,13
ORC_STUCK_PATTERN,User Appears Stuck,recommendation,ORC,pattern,"{""pattern_type"":""repeated_similar_query"",""min_occurrences"":3,""within_minutes"":10}","It seems like we might be going in circles. Would it help to step back and clarify the core objective?",info,60,true,14
ORC_SKIP_MEASUREMENT,Repeatedly Skipping Measurement,warning,ORC,pattern,"{""pattern_type"":""repeated_skip"",""pattern_target"":""measurement_step"",""min_occurrences"":2}","I notice measurement planning often gets skipped. It is much harder to optimize without a measurement baseline. Should we address it now?",suggestion,168,true,15
```

### 2.4 AI Builder Prompt: PRO_EVALUATE_TRIGGERS

**Prompt Code:** PRO_EVALUATE_TRIGGERS  
**Purpose:** Evaluate proactive triggers against current context

**System Message:**
```
You are a proactive intelligence evaluator. Given current session context and a set of trigger definitions, determine which triggers should fire and generate appropriate messages.

EVALUATION RULES:

1. Only fire triggers where condition is clearly met
2. Respect cooldown - skip if last_fired within cooldown_hours
3. Limit to maximum 3 triggers per evaluation
4. Prioritize by severity (critical > important > suggestion > info)
5. Then by priority_order (lower number = higher priority)

MESSAGE GENERATION:
- Use message_template as base
- Replace placeholders with actual values
- Ensure message is natural and helpful
- Add context-specific details

OUTPUT FORMAT:
Return valid JSON only:
{
  "triggers_fired": [
    {
      "trigger_code": "string",
      "severity": "string",
      "message": "generated message with values filled in",
      "supporting_data": {
        "field": "value that triggered",
        "threshold": "threshold value",
        "context": "relevant context"
      }
    }
  ],
  "triggers_evaluated": number,
  "triggers_skipped_cooldown": number,
  "triggers_skipped_condition": number
}

If no triggers fire, return empty triggers_fired array.
```

**User Message Template:**
```
Evaluate proactive triggers:

CURRENT CONTEXT:
{{session_context_json}}

TRIGGERS TO EVALUATE:
{{applicable_triggers_json}}

TRIGGER HISTORY (for cooldown):
{{trigger_history_json}}

Which triggers should fire?
```

**Configuration:**
- Temperature: 0.1
- Max Tokens: 1200

---

## PHASE 3: MULTI-MODAL INPUT

### 3.1 KB File: DOC_KB_File_Processing_v1.txt

```
FILE PROCESSING SYSTEM

The File Processing System enables users to upload structured data files that are automatically parsed and integrated into the planning session.

SUPPORTED FILE TYPES

CSV FILES
- Campaign performance data
- Budget allocation tables
- Audience segment lists
- Channel performance exports
- Custom benchmark data

EXCEL FILES
- Multi-sheet workbooks
- Formatted budget templates
- Performance dashboards
- Planning templates
- Partner rate cards

PDF FILES
- RFP documents
- Campaign briefs
- Competitive reports
- Research summaries
- Strategy documents

PROCESSING WORKFLOW

STEP 1 - FILE RECEPTION
- User uploads file via chat or SharePoint
- System detects file type by extension
- File is queued for processing

STEP 2 - FILE VALIDATION
- Check file size within limits
- Verify file is not corrupted
- Confirm file type matches extension
- Scan for malicious content

STEP 3 - CONTENT EXTRACTION
- CSV - Parse rows and columns detect headers
- Excel - Extract specified sheets identify data ranges
- PDF - Extract text identify structure

STEP 4 - CONTENT ANALYSIS
- Identify data type and purpose
- Map columns to known fields
- Detect anomalies or issues
- Generate extraction summary

STEP 5 - SESSION INTEGRATION
- Populate relevant session fields
- Store extracted data in session memory
- Notify user of what was extracted
- Offer to clarify ambiguities

CSV PROCESSING RULES

HEADER DETECTION
- First row assumed headers unless all numeric
- Common header patterns recognized automatically
- Unknown headers flagged for user confirmation

COLUMN MAPPING
Recognized columns and mappings:
- channel OR media OR platform maps to channel_name
- spend OR budget OR cost maps to budget_amount
- impressions OR imps maps to impressions
- clicks maps to clicks
- conversions OR conv maps to conversions
- cpm OR cost_per_mille maps to cpm
- cpc OR cost_per_click maps to cpc
- cpa OR cost_per_acquisition maps to cpa
- roas OR return_on_ad_spend maps to roas
- date OR period OR month maps to date_period

DATA VALIDATION
- Numeric columns checked for valid numbers
- Date columns parsed with common formats
- Currency symbols stripped from numbers
- Percentage signs handled appropriately

EXCEL PROCESSING RULES

SHEET SELECTION
- If single sheet process entire sheet
- If multiple sheets look for these names first
  - Summary or Overview or Dashboard
  - Data or Raw Data or Export
  - Budget or Spend or Allocation
- Otherwise process first sheet

DATA RANGE DETECTION
- Find contiguous data block
- Identify header row
- Skip empty rows and columns
- Handle merged cells by unmerging

FORMULA HANDLING
- Extract calculated values not formulas
- Note where formulas exist
- Flag circular references

PDF PROCESSING RULES

TEXT EXTRACTION
- Extract all readable text
- Preserve paragraph structure
- Identify headers and sections
- Handle multi-column layouts

TABLE DETECTION
- Identify tabular data in PDF
- Extract to structured format
- Map columns as with CSV

KEY INFORMATION EXTRACTION
- Campaign objectives
- Budget figures
- Timeline dates
- Target audience descriptions
- KPI targets
- Constraints and requirements

EXTRACTION SUMMARY FORMAT

After processing present summary to user:

EXAMPLE SUMMARY
I extracted the following from your file:

FILE: Q4_Campaign_Performance.csv
ROWS: 12 channel records
DATE RANGE: October 2025 to December 2025

EXTRACTED DATA:
- Total Budget: $450,000
- Channels: 8 unique channels identified
- Top Channel by Spend: Paid Search ($125,000)
- Performance Metrics: Impressions, Clicks, Conversions, ROAS

MAPPED TO SESSION:
- Historical performance baseline
- Channel preference signals
- Budget range reference

NEEDS CLARIFICATION:
- Column labeled Target unclear - is this target CPA or target audience?

Shall I proceed with this data or would you like to review the details?

ERROR HANDLING

FILE TOO LARGE
- Maximum 10MB for CSV
- Maximum 25MB for Excel
- Maximum 50MB for PDF
- Suggest splitting or summarizing

PARSING FAILURE
- Log specific error
- Provide user-friendly explanation
- Suggest alternative approaches
- Offer manual data entry option

AMBIGUOUS DATA
- Present interpretation to user
- Ask clarifying questions
- Do not assume - confirm

MISSING EXPECTED DATA
- Note what was expected but not found
- Ask if data exists elsewhere
- Proceed with available data

SECURITY CONSIDERATIONS

CONTENT SCANNING
- No executable content allowed
- Macro-enabled files rejected
- External links flagged

DATA PRIVACY
- Extracted data stays in session
- No permanent storage without consent
- User can request deletion

AUDIT LOGGING
- Log file uploads
- Log extraction results
- Track data lineage
```

### 3.2 AI Builder Prompt: MMI_PARSE_CSV

**Prompt Code:** MMI_PARSE_CSV  
**Purpose:** Parse CSV content and map to session fields

**System Message:**
```
You are a CSV parsing specialist. Analyze CSV content to extract structured data for media planning sessions.

PARSING TASKS:
1. Identify headers and their meaning
2. Determine data type for each column
3. Map columns to standard field names
4. Validate data quality
5. Summarize key statistics

COLUMN MAPPING RULES:
Map columns to these standard fields when detected:
- channel_name: channel, media, platform, tactic
- budget_amount: spend, budget, cost, investment
- impressions: impressions, imps, imp
- clicks: clicks, click
- conversions: conversions, conv, actions
- cpm: cpm, cost_per_mille
- cpc: cpc, cost_per_click
- ctr: ctr, click_through_rate
- cpa: cpa, cost_per_acquisition, cost_per_action
- roas: roas, return_on_ad_spend
- date_period: date, period, month, week, day

OUTPUT FORMAT:
Return valid JSON only:
{
  "parsing_success": boolean,
  "row_count": number,
  "column_count": number,
  "headers": ["list of headers"],
  "column_mapping": {
    "original_header": "standard_field or UNMAPPED"
  },
  "data_summary": {
    "date_range": {"start": "date", "end": "date"} or null,
    "total_budget": number or null,
    "channel_count": number,
    "channels_found": ["list"],
    "metrics_available": ["list of standard metrics"]
  },
  "data_quality": {
    "missing_values": {"column": count},
    "anomalies": ["description of any data issues"],
    "quality_score": number 0-100
  },
  "unmapped_columns": ["columns that could not be mapped"],
  "clarification_needed": ["questions about ambiguous columns"],
  "extracted_records": [first 5 rows as objects for preview]
}
```

**User Message Template:**
```
Parse this CSV content:

HEADERS:
{{csv_headers}}

SAMPLE ROWS (first 10):
{{csv_sample_rows}}

TOTAL ROW COUNT: {{row_count}}

Extract structure and key data.
```

**Configuration:**
- Temperature: 0.1
- Max Tokens: 2000

### 3.3 AI Builder Prompt: MMI_PARSE_EXCEL

**Prompt Code:** MMI_PARSE_EXCEL  
**Purpose:** Parse Excel content and map to session fields

**System Message:**
```
You are an Excel parsing specialist. Analyze Excel workbook content to extract structured data for media planning sessions.

EXCEL-SPECIFIC CONSIDERATIONS:
1. Handle multiple sheets - identify most relevant
2. Detect data ranges within sheets
3. Handle merged cells and formatting
4. Extract values not formulas
5. Identify summary vs detail data

SHEET PRIORITIZATION:
Look for sheets with these names (in order):
1. Summary, Overview, Dashboard
2. Data, Raw Data, Export
3. Budget, Spend, Allocation
4. Performance, Results, Metrics

If none match, analyze first sheet with substantial data.

OUTPUT FORMAT:
Return valid JSON only:
{
  "parsing_success": boolean,
  "workbook_summary": {
    "sheet_count": number,
    "sheets": [{"name": "string", "row_count": number, "has_data": boolean}]
  },
  "primary_sheet": {
    "name": "selected sheet name",
    "selection_reason": "why this sheet"
  },
  "data_extraction": {
    "row_count": number,
    "column_count": number,
    "headers": ["list"],
    "column_mapping": {"original": "standard"},
    "data_summary": {
      "date_range": {} or null,
      "total_budget": number or null,
      "key_metrics": {}
    }
  },
  "additional_sheets_relevant": [
    {"name": "string", "potential_use": "description"}
  ],
  "clarification_needed": ["questions"],
  "extracted_records": [first 5 rows]
}
```

**User Message Template:**
```
Parse this Excel workbook:

SHEETS FOUND:
{{sheet_list_json}}

SELECTED SHEET: {{primary_sheet_name}}

HEADERS:
{{sheet_headers}}

SAMPLE DATA (first 10 rows):
{{sheet_sample_rows}}

Extract structure and key data.
```

**Configuration:**
- Temperature: 0.1
- Max Tokens: 2000

### 3.4 AI Builder Prompt: MMI_EXTRACT_PDF

**Prompt Code:** MMI_EXTRACT_PDF  
**Purpose:** Extract key information from PDF documents

**System Message:**
```
You are a PDF content extraction specialist. Analyze PDF text content to extract key information relevant to media planning.

EXTRACTION TARGETS:

CAMPAIGN INFORMATION
- Campaign name and description
- Objectives and goals
- Timeline and flight dates
- Geographic scope

BUDGET INFORMATION
- Total budget amounts
- Budget breakdowns
- Spending constraints
- Payment terms

AUDIENCE INFORMATION
- Target audience descriptions
- Demographic details
- Behavioral characteristics
- Segment priorities

CHANNEL REQUIREMENTS
- Required channels
- Excluded channels
- Channel preferences
- Tactical requirements

PERFORMANCE EXPECTATIONS
- KPI targets
- Success metrics
- Benchmarks referenced
- Measurement requirements

CONSTRAINTS AND REQUIREMENTS
- Brand guidelines
- Compliance requirements
- Approval processes
- Timing restrictions

OUTPUT FORMAT:
Return valid JSON only:
{
  "extraction_success": boolean,
  "document_type": "rfp|brief|report|strategy|other",
  "document_summary": "2-3 sentence summary",
  "extracted_fields": {
    "campaign_name": "string or null",
    "objectives": ["list"] or null,
    "total_budget": number or null,
    "budget_details": "string or null",
    "timeline": {"start": "date", "end": "date"} or null,
    "target_audience": "description or null",
    "required_channels": ["list"] or null,
    "excluded_channels": ["list"] or null,
    "kpi_targets": [{"kpi": "name", "target": "value"}] or null,
    "constraints": ["list"] or null
  },
  "confidence_by_field": {
    "field_name": number 0-100
  },
  "tables_detected": [
    {"description": "what the table contains", "row_count": number}
  ],
  "clarification_needed": ["questions about unclear content"],
  "key_quotes": ["important verbatim text to preserve"]
}
```

**User Message Template:**
```
Extract key information from this PDF:

DOCUMENT TEXT:
{{pdf_text_content}}

TABLES DETECTED:
{{pdf_tables_json}}

Focus on media planning relevant information.
```

**Configuration:**
- Temperature: 0.1
- Max Tokens: 2500

### 3.5 Capability Registrations for Multi-Modal

```csv
capability_code,capability_name,agent_code,description,is_active,version
MMI_PARSE_CSV,Parse CSV File,DOC,Extract and map CSV data to session fields,true,1.0
MMI_PARSE_EXCEL,Parse Excel File,DOC,Extract and map Excel data to session fields,true,1.0
MMI_EXTRACT_PDF,Extract PDF Content,DOC,Extract key information from PDF documents,true,1.0
```

```csv
capability_code,environment_code,implementation_type,implementation_reference,priority_order,is_enabled,timeout_seconds
MMI_PARSE_CSV,MASTERCARD,AI_BUILDER_PROMPT,MMI_PARSE_CSV,1,true,30
MMI_PARSE_CSV,PERSONAL,AI_BUILDER_PROMPT,MMI_PARSE_CSV,1,true,30
MMI_PARSE_EXCEL,MASTERCARD,AI_BUILDER_PROMPT,MMI_PARSE_EXCEL,1,true,30
MMI_PARSE_EXCEL,PERSONAL,AI_BUILDER_PROMPT,MMI_PARSE_EXCEL,1,true,30
MMI_EXTRACT_PDF,MASTERCARD,AI_BUILDER_PROMPT,MMI_EXTRACT_PDF,1,true,45
MMI_EXTRACT_PDF,PERSONAL,AI_BUILDER_PROMPT,MMI_EXTRACT_PDF,1,true,45
```

---

## PHASE 4: AGENT CONSENSUS PROTOCOL

### 4.1 Dataverse Schema: eap_collaborative_workflow

**Table Name:** eap_collaborative_workflow  
**Display Name:** Collaborative Workflow  
**Primary Column:** workflow_name

| Column Name | Display Name | Type | Required | Description |
|-------------|--------------|------|----------|-------------|
| eap_collaborative_workflowid | ID | Uniqueidentifier (PK) | Yes | Primary key |
| workflow_code | Workflow Code | Text (50) | Yes | Unique identifier |
| workflow_name | Workflow Name | Text (200) | Yes | Human-readable name |
| workflow_description | Description | Multiline (2000) | No | What this workflow accomplishes |
| trigger_phrases | Trigger Phrases | Multiline (2000) | Yes | JSON array of phrases that initiate this workflow |
| participating_agents | Participating Agents | Multiline (500) | Yes | JSON array of agent codes in order |
| agent_prompts | Agent Prompts | Multiline (4000) | Yes | JSON object mapping agent to prompt |
| synthesis_template | Synthesis Template | Multiline (4000) | Yes | Template for combining contributions |
| required_context | Required Context | Multiline (1000) | No | JSON list of required inputs |
| estimated_duration_seconds | Est Duration | Whole Number | No | Expected completion time |
| is_enabled | Is Enabled | Boolean | Yes | Whether workflow is active |
| success_count | Success Count | Whole Number | No | Times completed successfully |
| average_duration_seconds | Avg Duration | Whole Number | No | Actual average completion time |

### 4.2 Dataverse Schema: eap_workflow_contribution

**Table Name:** eap_workflow_contribution  
**Display Name:** Workflow Contribution  
**Primary Column:** contribution_summary

| Column Name | Display Name | Type | Required | Description |
|-------------|--------------|------|----------|-------------|
| eap_workflow_contributionid | ID | Uniqueidentifier (PK) | Yes | Primary key |
| workflow_instance_id | Workflow Instance | Text (100) | Yes | Links contributions to workflow run |
| workflow_code | Workflow Code | Text (50) | Yes | Which workflow template |
| session_id | Session ID | Text (100) | Yes | Parent session |
| agent_code | Agent Code | Text (10) | Yes | Contributing agent |
| sequence_order | Sequence Order | Whole Number | Yes | Order in workflow |
| agent_prompt | Agent Prompt | Multiline (2000) | Yes | What agent was asked |
| contribution_json | Contribution | Multiline (8000) | Yes | Agent's structured contribution |
| contribution_summary | Summary | Text (500) | Yes | Brief summary for display |
| confidence_score | Confidence | Decimal | No | Agent's confidence in contribution |
| execution_time_ms | Execution Time | Whole Number | No | How long agent took |
| status | Status | Choice | Yes | pending, complete, failed, skipped |
| error_message | Error | Text (500) | No | Error details if failed |
| created_on | Created On | DateTime | Yes | When contribution started |
| completed_on | Completed On | DateTime | No | When contribution finished |

**Choice Definitions:**

status:
- 1: pending
- 2: complete
- 3: failed
- 4: skipped

### 4.3 KB File: EAP_KB_Consensus_Protocol_v1.txt

```
AGENT CONSENSUS PROTOCOL

The Agent Consensus Protocol enables multiple specialist agents to collaborate on complex requests, synthesizing their expertise into unified recommendations.

COLLABORATIVE WORKFLOW CONCEPT

When a user request requires multiple domains of expertise, the Orchestrator initiates a collaborative workflow:

SINGLE AGENT RESPONSE
- User asks specific question
- One agent handles completely
- Direct response

COLLABORATIVE RESPONSE
- User asks complex multi-faceted question
- Multiple agents contribute expertise
- Synthesis combines into unified response

WORKFLOW INITIATION

Trigger conditions for collaborative mode:

EXPLICIT TRIGGERS
- User says build me a complete plan
- User says I need a comprehensive analysis
- User says give me the full picture
- User asks for document generation with analysis

IMPLICIT TRIGGERS
- Request spans multiple agent domains
- Budget plus audience plus channel in one ask
- Request for strategy plus execution plus measurement
- High complexity score from intent analysis

WORKFLOW EXECUTION PHASES

PHASE 1 - INITIATION
- ORC detects collaborative trigger
- ORC selects appropriate workflow template
- ORC prepares shared context package
- ORC notifies user of collaborative approach

PHASE 2 - CONTRIBUTION COLLECTION
- ORC sends context to each participating agent
- Each agent executes independently
- Each agent returns structured contribution
- Contributions stored in eap_workflow_contribution

PHASE 3 - SYNTHESIS
- ORC collects all contributions
- Synthesis prompt combines expertise
- Conflicts identified and resolved
- Unified recommendation generated

PHASE 4 - PRESENTATION
- Combined response formatted
- Individual contributions cited
- Confidence levels aggregated
- Follow-up options offered

AGENT CONTRIBUTION FORMAT

Each agent returns structured contribution:

CONTRIBUTION SCHEMA
{
  "agent_code": "ANL",
  "contribution_type": "analysis|recommendation|validation|context",
  "summary": "one sentence summary",
  "key_findings": [
    {
      "finding": "description",
      "confidence": 85,
      "supporting_data": "evidence"
    }
  ],
  "recommendations": [
    {
      "recommendation": "specific action",
      "rationale": "why",
      "priority": "high|medium|low"
    }
  ],
  "concerns": [
    {
      "concern": "potential issue",
      "mitigation": "how to address"
    }
  ],
  "data_for_synthesis": {
    "structured data other agents may need"
  },
  "confidence_overall": 80
}

CONTRIBUTION PROMPTS BY AGENT

Each agent receives tailored prompt:

ANL PROMPT
Given the context, provide quantitative analysis:
- Budget allocation recommendations with marginal returns
- Projection calculations with confidence intervals
- Scenario comparison if relevant
Focus on the numbers and validation.

AUD PROMPT
Given the context, provide audience strategy:
- Priority segments with LTV rationale
- Targeting recommendations
- Journey stage considerations
Focus on who to reach and why.

CHA PROMPT
Given the context, provide channel strategy:
- Recommended channel mix
- Allocation rationale by channel
- Emerging channel opportunities
Focus on where to reach the audience.

PRF PROMPT
Given the context, provide measurement strategy:
- Attribution model recommendation
- KPIs and targets
- Testing opportunities
Focus on how to measure success.

DOC PROMPT
Given all contributions, synthesize into document:
- Executive summary
- Integrated recommendations
- Supporting analysis
Format for stakeholder presentation.

SYNTHESIS RULES

When combining contributions:

AGREEMENT
- When agents agree highlight consensus
- Aggregate confidence scores
- Present as unified recommendation

COMPLEMENTARY
- When agents add different perspectives
- Weave together logically
- Show how pieces fit together

CONFLICT
- When agents disagree note the tension
- Present both perspectives
- Recommend resolution approach
- Do not hide disagreement

GAPS
- When expected contribution is missing
- Note the gap explicitly
- Offer to gather additional input
- Proceed with available information

CONFIDENCE AGGREGATION

Combined confidence calculation:

METHOD
- Weight by relevance to request
- Reduce for conflicts
- Increase for consensus

FORMULA
Base = average of individual confidences
Consensus bonus = +5 for each agreeing pair
Conflict penalty = -10 for each conflict
Final = min(95, max(30, Base + bonuses - penalties))

PRESENTATION FORMAT

Collaborative responses follow this structure:

OPENING
Brief acknowledgment that multiple agents contributed

UNIFIED RECOMMENDATION
The synthesized recommendation as if from one voice

SUPPORTING PERSPECTIVES
How each agent's expertise supports the recommendation

DETAILED CONTRIBUTIONS
Option to expand each agent's full analysis

CONFIDENCE AND CAVEATS
Overall confidence with any noted disagreements

NEXT STEPS
Follow-up options and actions

EXAMPLE COLLABORATIVE RESPONSE

User: Build me a complete media plan for a $500K retail brand awareness campaign.

Response:

I have consulted with our Analytics, Audience, Channel, and Performance specialists to build a comprehensive plan. Here is the unified recommendation:

RECOMMENDATION SUMMARY
For your $500K retail brand awareness campaign, we recommend a video-heavy channel mix targeting high-value lifestyle segments, measured through brand lift with incrementality validation.

BUDGET ALLOCATION
The Analytics team recommends this allocation based on marginal return optimization:
- Connected TV: $175K (35%) - Primary awareness driver
- Paid Social Video: $125K (25%) - Reach extension  
- YouTube: $100K (20%) - Engagement depth
- Programmatic Display: $75K (15%) - Retargeting support
- Paid Search Brand: $25K (5%) - Intent capture

AUDIENCE STRATEGY  
The Audience team identified three priority segments:
1. Affluent Lifestyle Seekers (LTV index 145)
2. Brand-Conscious Millennials (LTV index 128)
3. Digital-First Families (LTV index 115)

MEASUREMENT FRAMEWORK
The Performance team recommends:
- Primary KPI: Brand Lift (target +15%)
- Secondary: Aided Awareness (target +8 points)
- Validation: Geo-based incrementality test

CONFIDENCE: 82%
All agents aligned on strategy. Minor difference on CTV allocation (ANL suggested 40%, CHA suggested 30%) resolved at 35%.

Would you like me to elaborate on any section or generate the formal brief document?

ERROR HANDLING

When collaborative workflow encounters issues:

AGENT TIMEOUT
- Note which agent did not respond
- Proceed with available contributions
- Offer to retry failed agent

AGENT ERROR
- Log error details
- Use fallback if available
- Note reduced confidence

SYNTHESIS FAILURE
- Present individual contributions
- Explain synthesis issue
- Offer manual integration
```

### 4.4 KB File: ORC_KB_Collaborative_Orchestration_v1.txt

```
COLLABORATIVE ORCHESTRATION GUIDE

The Orchestrator manages collaborative workflows, coordinating multiple agents to produce unified responses.

WORKFLOW DETECTION

Detect when collaborative mode is needed:

KEYWORD TRIGGERS
- complete plan
- comprehensive analysis
- full strategy
- end to end
- everything I need
- build me a
- create a full

COMPLEXITY TRIGGERS
- Request mentions 3 or more agent domains
- Request includes both strategy and execution
- Request asks for document with analysis
- Budget exceeds 250K with multiple objectives

DETECTION PROMPT
When uncertain, assess:
- Does this need multiple expert perspectives?
- Would a single agent miss important aspects?
- Is the user expecting a comprehensive deliverable?

WORKFLOW SELECTION

Match request to workflow template:

FULL_MEDIA_PLAN
- Trigger: complete media plan or full campaign strategy
- Agents: ANL then AUD then CHA then PRF then DOC
- Duration: 45-60 seconds
- Output: Comprehensive plan document

BUDGET_OPTIMIZATION
- Trigger: optimize my budget or best allocation
- Agents: ANL then CHA then PRF
- Duration: 30-40 seconds
- Output: Optimized allocation with rationale

AUDIENCE_CHANNEL_FIT
- Trigger: which channels for my audience or reach my target
- Agents: AUD then CHA
- Duration: 20-30 seconds
- Output: Channel recommendations by segment

MEASUREMENT_STRATEGY
- Trigger: how should I measure or attribution approach
- Agents: PRF then ANL
- Duration: 20-30 seconds
- Output: Measurement framework

CAMPAIGN_ANALYSIS
- Trigger: analyze this campaign or what happened
- Agents: PRF then ANL then CHA
- Duration: 30-40 seconds
- Output: Performance analysis with recommendations

CONTEXT PREPARATION

Before dispatching to agents prepare shared context:

CONTEXT PACKAGE CONTENTS
{
  "workflow_instance_id": "unique identifier",
  "workflow_code": "FULL_MEDIA_PLAN",
  "session_id": "parent session",
  "user_id": "requesting user",
  "original_request": "user's exact words",
  "extracted_parameters": {
    "budget": 500000,
    "vertical": "Retail",
    "objectives": ["brand awareness"],
    "timeline": {"start": "2026-04-01", "end": "2026-06-30"},
    "constraints": []
  },
  "user_preferences": {
    "loaded from mpa_user_preferences"
  },
  "session_context": {
    "any relevant prior decisions"
  },
  "previous_contributions": []
}

SEQUENTIAL DISPATCH

Agents are called in order with accumulating context:

DISPATCH FLOW
1. Call first agent with base context
2. Wait for contribution
3. Add contribution to previous_contributions
4. Call next agent with enriched context
5. Repeat until all agents complete
6. Call synthesis

INTER-AGENT CONTEXT
Each agent sees:
- Original request and parameters
- All previous agent contributions
- Specific prompt for their role

This allows later agents to build on earlier work.

PARALLEL VS SEQUENTIAL

Current implementation is sequential because:
- Later agents benefit from earlier contributions
- Reduces redundant analysis
- Enables building narrative

Future enhancement could parallelize independent agents.

CONTRIBUTION MONITORING

Track each contribution:

TIMING
- Start time when dispatched
- End time when received
- Timeout at 30 seconds per agent

STATUS TRACKING
- pending: dispatched awaiting response
- complete: received valid contribution
- failed: error or timeout
- skipped: intentionally omitted

QUALITY CHECK
- Verify JSON structure
- Check required fields present
- Validate confidence score range
- Flag empty or minimal contributions

SYNTHESIS ORCHESTRATION

After collecting contributions:

SYNTHESIS INPUTS
{
  "workflow_code": "FULL_MEDIA_PLAN",
  "original_request": "user request",
  "contributions": [
    {"agent_code": "ANL", "contribution_json": {...}},
    {"agent_code": "AUD", "contribution_json": {...}},
    ...
  ],
  "synthesis_template": "from workflow definition",
  "presentation_preferences": {
    "communication_style": "from user preferences"
  }
}

SYNTHESIS PROMPT STRUCTURE
Given these expert contributions, synthesize into a unified response:

[Contribution summaries]

Create a cohesive recommendation that:
1. Leads with the unified strategy
2. Shows how each perspective supports it
3. Notes any disagreements transparently
4. Provides clear next steps

USER COMMUNICATION

Keep user informed during workflow:

INITIATION MESSAGE
This is a comprehensive request, so I am consulting with our Analytics, Audience, Channel, and Performance specialists. This will take about 45 seconds.

PROGRESS UPDATES (if over 30 seconds)
Analytics complete. Now consulting Audience specialist...

COMPLETION MESSAGE
I have synthesized recommendations from all specialists. Here is the unified plan:

ERROR COMMUNICATION
I was unable to get a response from the Performance specialist. I will proceed with the available analysis and note where measurement input would strengthen the recommendation.

WORKFLOW METRICS

Track for optimization:

PER WORKFLOW
- Total duration
- Individual agent durations
- Success vs failure rate
- User satisfaction signals

AGGREGATE
- Most used workflows
- Average durations by workflow
- Common failure points
- Synthesis quality scores

Use metrics to improve workflow definitions and timeouts.
```

### 4.5 AI Builder Prompt: CON_INITIATE_WORKFLOW

**Prompt Code:** CON_INITIATE_WORKFLOW  
**Purpose:** Analyze request to determine if collaborative workflow needed

**System Message:**
```
You are a workflow routing specialist. Analyze user requests to determine if collaborative multi-agent workflow is needed and which workflow template applies.

WORKFLOW TRIGGERS:

EXPLICIT - User directly asks for comprehensive output:
- "Build me a complete media plan"
- "Give me the full picture"
- "I need end-to-end strategy"

IMPLICIT - Request spans multiple domains:
- Budget + audience + channels mentioned
- Strategy + execution + measurement needed
- Analysis + recommendations + documentation

SINGLE AGENT - One domain is sufficient:
- Specific calculation question
- Single topic clarification
- Isolated tactical question

AVAILABLE WORKFLOWS:
1. FULL_MEDIA_PLAN - Complete campaign planning
2. BUDGET_OPTIMIZATION - Allocation optimization
3. AUDIENCE_CHANNEL_FIT - Audience-channel matching
4. MEASUREMENT_STRATEGY - Measurement framework
5. CAMPAIGN_ANALYSIS - Performance analysis

OUTPUT FORMAT:
Return valid JSON only:
{
  "requires_collaboration": boolean,
  "confidence": number 0-100,
  "reasoning": "why collaboration is or is not needed",
  "recommended_workflow": "workflow code or null",
  "workflow_match_confidence": number or null,
  "extracted_parameters": {
    "budget": number or null,
    "vertical": "string or null",
    "objectives": ["list"] or null,
    "timeline": {} or null,
    "other_relevant": {}
  },
  "alternative_approach": "if not collaborative, what single agent handles this"
}
```

**User Message Template:**
```
Analyze this request for collaborative workflow:

USER REQUEST:
{{user_message}}

SESSION CONTEXT:
{{session_context_json}}

AVAILABLE WORKFLOWS:
{{workflow_templates_json}}

Should this trigger a collaborative workflow?
```

**Configuration:**
- Temperature: 0.1
- Max Tokens: 800

### 4.6 AI Builder Prompt: CON_SYNTHESIZE_CONTRIBUTIONS

**Prompt Code:** CON_SYNTHESIZE_CONTRIBUTIONS  
**Purpose:** Synthesize multiple agent contributions into unified response

**System Message:**
```
You are a synthesis specialist. Combine multiple expert agent contributions into a unified, coherent recommendation.

SYNTHESIS PRINCIPLES:

1. UNIFIED VOICE
   - Present as one coherent recommendation
   - Do not list agent contributions separately first
   - Weave perspectives together naturally

2. HIGHLIGHT CONSENSUS
   - When agents agree, present with confidence
   - Note the strength of multi-expert alignment

3. HANDLE CONFLICTS
   - Do not hide disagreements
   - Present both perspectives fairly
   - Recommend resolution if possible
   - Note impact on confidence

4. MAINTAIN ATTRIBUTION
   - Reference which analysis supports which point
   - Enable user to dig deeper into any area
   - Credit expertise appropriately

5. ACTIONABLE OUTPUT
   - Lead with recommendations
   - Support with analysis
   - End with clear next steps

OUTPUT FORMAT:
Return valid JSON only:
{
  "synthesis_success": boolean,
  "unified_recommendation": {
    "summary": "2-3 sentence executive summary",
    "key_recommendations": [
      {
        "recommendation": "specific action",
        "supporting_agents": ["ANL", "CHA"],
        "confidence": number
      }
    ],
    "detailed_sections": [
      {
        "section_title": "string",
        "content": "synthesized content",
        "primary_contributor": "agent code"
      }
    ]
  },
  "consensus_areas": ["where agents agreed"],
  "conflict_areas": [
    {
      "topic": "what they disagreed on",
      "positions": {"ANL": "position", "CHA": "position"},
      "resolution": "how to resolve or null"
    }
  ],
  "confidence_calculation": {
    "base_average": number,
    "consensus_bonus": number,
    "conflict_penalty": number,
    "final_confidence": number
  },
  "follow_up_options": ["suggested next steps"]
}
```

**User Message Template:**
```
Synthesize these agent contributions:

ORIGINAL REQUEST:
{{original_request}}

CONTRIBUTIONS:
{{contributions_json}}

USER PREFERENCES:
Communication style: {{communication_style}}

Create unified recommendation.
```

**Configuration:**
- Temperature: 0.2
- Max Tokens: 3000

### 4.7 Workflow Template Seed Data

```csv
workflow_code,workflow_name,trigger_phrases,participating_agents,agent_prompts,synthesis_template,estimated_duration_seconds,is_enabled
FULL_MEDIA_PLAN,Full Media Plan,"[""build me a complete media plan"",""full campaign strategy"",""comprehensive media plan"",""end to end media plan""]","[""ANL"",""AUD"",""CHA"",""PRF"",""DOC""]","{""ANL"":""Analyze budget and provide allocation recommendations with marginal returns"",""AUD"":""Identify priority audience segments with LTV rationale"",""CHA"":""Recommend channel mix and allocation strategy"",""PRF"":""Define measurement framework and KPIs"",""DOC"":""Synthesize into comprehensive brief""}","Unified media plan with budget allocation, audience strategy, channel mix, and measurement framework",60,true
BUDGET_OPTIMIZATION,Budget Optimization,"[""optimize my budget"",""best budget allocation"",""how should I allocate"",""maximize my spend""]","[""ANL"",""CHA"",""PRF""]","{""ANL"":""Calculate optimal allocation using marginal returns"",""CHA"":""Validate channel selection and recommend adjustments"",""PRF"":""Confirm measurement approach supports optimization""}","Optimized budget allocation with supporting analysis",40,true
AUDIENCE_CHANNEL_FIT,Audience Channel Fit,"[""which channels for my audience"",""reach my target audience"",""best channels for these segments"",""audience channel match""]","[""AUD"",""CHA""]","{""AUD"":""Define audience segments and their characteristics"",""CHA"":""Match channels to audience behaviors and preferences""}","Channel recommendations matched to audience segments",25,true
MEASUREMENT_STRATEGY,Measurement Strategy,"[""how should I measure"",""attribution approach"",""measurement framework"",""what KPIs""]","[""PRF"",""ANL""]","{""PRF"":""Define attribution model and measurement approach"",""ANL"":""Validate measurement feasibility and confidence levels""}","Measurement framework with attribution model and KPIs",25,true
CAMPAIGN_ANALYSIS,Campaign Analysis,"[""analyze this campaign"",""what happened with my campaign"",""campaign performance review"",""why did performance""]","[""PRF"",""ANL"",""CHA""]","{""PRF"":""Analyze performance data and identify anomalies"",""ANL"":""Provide statistical validation and projections"",""CHA"":""Assess channel performance versus benchmarks""}","Comprehensive campaign analysis with recommendations",35,true
```

---

## EXECUTION ORDER

### Complete Sequence

```
DESKTOP CLAUDE DELIVERABLES (Complete First)
────────────────────────────────────────────────────────────
[DC-1] mpa_user_preferences schema → base/dataverse/schema/
[DC-2] mpa_session_memory schema → base/dataverse/schema/
[DC-3] eap_proactive_trigger schema → base/dataverse/schema/
[DC-4] eap_collaborative_workflow schema → base/dataverse/schema/
[DC-5] eap_workflow_contribution schema → base/dataverse/schema/
[DC-6] EAP_KB_Memory_System_v1.txt → base/platform/eap/kb/
[DC-7] ORC_KB_Session_Management_v1.txt → base/agents/orc/kb/
[DC-8] EAP_KB_Proactive_Intelligence_v1.txt → base/platform/eap/kb/
[DC-9] DOC_KB_File_Processing_v1.txt → base/agents/doc/kb/
[DC-10] EAP_KB_Consensus_Protocol_v1.txt → base/platform/eap/kb/
[DC-11] ORC_KB_Collaborative_Orchestration_v1.txt → base/agents/orc/kb/
[DC-12] All AI Builder prompt specifications → base/platform/eap/prompts/
[DC-13] All seed data files → base/dataverse/seed/ + environments/*/seed/
[DC-14] Capability registrations → base/dataverse/seed/

VS CODE CLAUDE DELIVERABLES (After Desktop Complete)
────────────────────────────────────────────────────────────
[VC-1] Create 5 Dataverse tables via pac CLI
[VC-2] Import all seed data
[VC-3] Create 9 AI Builder prompts
[VC-4] Create MPA_Memory_Manager flow
[VC-5] Create MPA_Preference_Loader flow
[VC-6] Create MPA_Proactive_Evaluator flow
[VC-7] Create MPA_File_Processor flow
[VC-8] Create MPA_Collaborative_Orchestrator flow
[VC-9] Create MPA_Contribution_Collector flow
[VC-10] Create MPA_Synthesis_Engine flow
[VC-11] Update ORC topics for new capabilities
[VC-12] Update DOC topics for file processing
[VC-13] Integration testing all features
[VC-14] Deploy to both environments
```

---

## FILE MANIFEST

### New Files to Create

| File Path | Type | Owner |
|-----------|------|-------|
| base/dataverse/schema/mpa_user_preferences.md | Schema | Desktop |
| base/dataverse/schema/mpa_session_memory.md | Schema | Desktop |
| base/dataverse/schema/eap_proactive_trigger.md | Schema | Desktop |
| base/dataverse/schema/eap_collaborative_workflow.md | Schema | Desktop |
| base/dataverse/schema/eap_workflow_contribution.md | Schema | Desktop |
| base/platform/eap/kb/EAP_KB_Memory_System_v1.txt | KB | Desktop |
| base/platform/eap/kb/EAP_KB_Proactive_Intelligence_v1.txt | KB | Desktop |
| base/platform/eap/kb/EAP_KB_Consensus_Protocol_v1.txt | KB | Desktop |
| base/agents/orc/kb/ORC_KB_Session_Management_v1.txt | KB | Desktop |
| base/agents/orc/kb/ORC_KB_Collaborative_Orchestration_v1.txt | KB | Desktop |
| base/agents/doc/kb/DOC_KB_File_Processing_v1.txt | KB | Desktop |
| base/platform/eap/prompts/MEM_STORE_PREFERENCE_PROMPT.json | Prompt | Desktop |
| base/platform/eap/prompts/MEM_RETRIEVE_CONTEXT_PROMPT.json | Prompt | Desktop |
| base/platform/eap/prompts/MEM_LEARN_PATTERN_PROMPT.json | Prompt | Desktop |
| base/platform/eap/prompts/PRO_EVALUATE_TRIGGERS_PROMPT.json | Prompt | Desktop |
| base/platform/eap/prompts/MMI_PARSE_CSV_PROMPT.json | Prompt | Desktop |
| base/platform/eap/prompts/MMI_PARSE_EXCEL_PROMPT.json | Prompt | Desktop |
| base/platform/eap/prompts/MMI_EXTRACT_PDF_PROMPT.json | Prompt | Desktop |
| base/platform/eap/prompts/CON_INITIATE_WORKFLOW_PROMPT.json | Prompt | Desktop |
| base/platform/eap/prompts/CON_SYNTHESIZE_CONTRIBUTIONS_PROMPT.json | Prompt | Desktop |
| base/dataverse/seed/mpa_user_preferences_seed.csv | Seed | Desktop |
| base/dataverse/seed/mpa_session_memory_seed.csv | Seed | Desktop |
| base/dataverse/seed/eap_proactive_trigger_seed.csv | Seed | Desktop |
| base/dataverse/seed/eap_collaborative_workflow_seed.csv | Seed | Desktop |
| base/dataverse/seed/eap_capability_v61_seed.csv | Seed | Desktop |
| base/dataverse/seed/eap_capability_impl_v61_seed.csv | Seed | Desktop |
| docs/MPA_v61_Enhancement_Build_Plan.md | Doc | Desktop |

---

## VS CODE PROMPTS

### VS Code Prompt for Complete Implementation

See Section 9 below for the complete VS Code prompt to execute after Desktop Claude deliverables are complete.
