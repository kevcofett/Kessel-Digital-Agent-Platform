# PHASE 10: RAG AND LEARNING OPTIMIZATION
# Focused Net-New Elements Only

**Version:** 2.0
**Created:** 2026-01-12
**Status:** READY FOR EXECUTION

---

## INVENTORY SUMMARY

### ALREADY EXISTS - NO WORK NEEDED

#### TypeScript Infrastructure (agent-core/src/)
```
✅ learning/self-critique.ts
✅ learning/success-patterns.ts
✅ learning/kb-enhancement.ts
✅ learning/types.ts
✅ learning/local-kb-impact-storage.ts
✅ learning/dataverse-kb-impact-storage.ts
✅ rag/retrieval-engine.ts
✅ rag/document-processor.ts
✅ rag/vector-store.ts
✅ rag/embedding-service.ts
✅ providers/openai-embedding.ts
✅ providers/azure-openai-embedding.ts
✅ providers/dataverse-storage.ts
✅ providers/local-fs-storage.ts
```

#### MPA Flows (11 exist - no changes)
```
✅ flow_01 through flow_11
```

#### Seed Data (exists in /mnt/project/)
```
✅ mpa_benchmark_seed.csv (710 rows)
✅ mpa_channel_seed_updated.csv (43 rows)
✅ mpa_kpi_seed_updated.csv (43 rows)
✅ mpa_vertical_seed.csv (12 rows)
```

#### KB Files (76 total - validated in Phase 9)
```
✅ All 6-Rule compliant
```

---

## NET-NEW WORK ITEMS

### MASTERCARD ENVIRONMENT

#### A1. Dataverse Tables (3 new)

**Table: mpa_feedback**
- Purpose: Store user feedback on agent responses
- Fields: session_id (lookup), message_id, feedback_type (choice), feedback_text, user_query, agent_response, kb_files_used (JSON), agent_type (choice), created_at

**Table: mpa_kb_usage**
- Purpose: Track which KB files get used and correlation to feedback
- Fields: kb_file_name, session_id (lookup), query_text, relevance_score, feedback_received (choice), agent_type (choice), used_at

**Table: mpa_success_patterns**
- Purpose: Store high-scoring responses for few-shot learning
- Fields: scenario, user_message, agent_response, composite_score, scores_json, agent_type (choice), created_at

#### A2. Power Automate Flows (2 new)

**Flow 12: MPA_CaptureFeedback**
- Trigger: HTTP request from Copilot
- Input: session_id, feedback_type, feedback_text, kb_files_used[], user_query, agent_response
- Actions: Create mpa_feedback record, for-each kb_file create mpa_kb_usage record
- Output: feedback_id

**Flow 13: MPA_TrackKBUsage**
- Trigger: HTTP request from Copilot (called when KB files are referenced)
- Input: session_id, kb_files[{file_name, relevance_score}], query_text, agent_type
- Actions: For-each kb_file create mpa_kb_usage record
- Output: files_tracked count

#### A3. Copilot Topics (documented, manual creation)

Topics are configured in Copilot Studio UI. Document for manual setup:

| Agent | Topic | Trigger Phrases | Flow |
|-------|-------|-----------------|------|
| MPA | Feedback | "helpful", "not helpful", "thanks" | MPA_CaptureFeedback |
| CA | Feedback | "helpful", "not helpful", "thanks" | MPA_CaptureFeedback (shared) |
| EAP | Feedback | "helpful", "not helpful" | MPA_CaptureFeedback (shared) |

---

### PERSONAL ENVIRONMENT

#### B1. Test Files (5 new)

Create test files to verify RAG pipeline works end-to-end:

```
tests/
  test-01-embeddings.ts      - Verify embedding generation
  test-02-retrieval.ts       - Verify KB retrieval
  test-03-self-critique.ts   - Verify response critique
  test-04-success-patterns.ts - Verify pattern storage
  test-05-full-pipeline.ts   - End-to-end integration
```

#### B2. KB Sync Script

Script to sync KB files from repo to local test directory:
```
scripts/sync-kb-local.sh
```

#### B3. Environment Config Update

Update `/packages/agent-core/config/environment.personal.json` with local KB paths.

---

## EXECUTION

### VS CODE PROMPT (copy this)

```
PHASE 10 EXECUTION - RAG AND LEARNING OPTIMIZATION

Working directory: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

PART A: MASTERCARD BRANCH (do first)
=====================================

1. Switch to deploy/mastercard branch:
   git checkout deploy/mastercard

2. Create Dataverse table definitions:
   Location: /release/v5.5/agents/mpa/mastercard/dataverse/
   
   Create file: learning_tables.json
   Content: JSON definitions for mpa_feedback, mpa_kb_usage, mpa_success_patterns
   Use schema from PHASE_10_RAG_LEARNING_OPTIMIZATION.md Section A1

3. Create flow specifications:
   Location: /release/v5.5/agents/mpa/base/flows/specifications/
   
   Create: flow_12_MPA_CaptureFeedback.json
   Create: flow_13_MPA_TrackKBUsage.json
   Use specs from PHASE_10_RAG_LEARNING_OPTIMIZATION.md Section A2

4. Create deployment script:
   Location: /release/v5.5/deployment/mastercard/
   
   Create: deploy-learning-tables.ps1
   - Uses Dataverse Web API to create tables
   - Accepts environment URL and credentials as params

5. Document Copilot topics:
   Location: /release/v5.5/agents/mpa/mastercard/
   
   Create: COPILOT_TOPICS.md
   - Document trigger phrases for feedback topic
   - Manual configuration instructions

6. Commit and push:
   git add .
   git commit -m "Phase 10A: Add learning tables and feedback flows for Mastercard"
   git push origin deploy/mastercard


PART B: PERSONAL BRANCH (do second)
===================================

1. Switch to deploy/personal branch:
   git checkout deploy/personal

2. Create test files:
   Location: /packages/agent-core/src/tests/
   
   Create: test-01-embeddings.ts
   Create: test-02-retrieval.ts
   Create: test-03-self-critique.ts
   Create: test-04-success-patterns.ts
   Create: test-05-full-pipeline.ts

3. Create KB sync script:
   Location: /scripts/
   
   Create: sync-kb-local.sh
   - Copies KB files from release/v5.5/agents/*/base/kb/ to local test dir
   - Creates directory structure if not exists

4. Update environment config:
   File: /packages/agent-core/config/environment.personal.json
   
   Add paths for local KB files and embedding cache

5. Run tests to verify:
   cd packages/agent-core
   npx tsc
   node dist/tests/test-05-full-pipeline.js

6. Commit and push:
   git add .
   git commit -m "Phase 10B: Add RAG test suite and local KB sync for personal"
   git push origin deploy/personal


REPORT completion of each numbered step.
```

---

## SEED DATA IMPORT

The seed data files exist in the Claude project but need to be copied to the repo and deployed:

### Location in Claude Project:
- /mnt/project/mpa_benchmark_seed.csv
- /mnt/project/mpa_channel_seed_updated.csv
- /mnt/project/mpa_kpi_seed_updated.csv
- /mnt/project/mpa_vertical_seed.csv

### Action Required (CLAUDE):
I will copy these seed files to the repo at:
`/release/v5.5/agents/mpa/base/data/seed/`

Then VS Code will create the import script.

---

## FILE SPECIFICATIONS

### A1. learning_tables.json

```json
{
  "tables": [
    {
      "schemaName": "mpa_feedback",
      "displayName": "Agent Feedback",
      "pluralName": "Agent Feedback",
      "description": "User feedback on agent responses",
      "ownership": "OrganizationOwned",
      "fields": [
        {"schemaName": "mpa_feedback_id", "displayName": "Feedback ID", "type": "Uniqueidentifier", "isPrimaryKey": true},
        {"schemaName": "mpa_session_id", "displayName": "Session", "type": "Lookup", "target": "eap_session"},
        {"schemaName": "mpa_message_id", "displayName": "Message ID", "type": "SingleLineOfText", "maxLength": 100},
        {"schemaName": "mpa_feedback_type", "displayName": "Feedback Type", "type": "Choice", "options": [
          {"value": 100000000, "label": "Positive"},
          {"value": 100000001, "label": "Negative"},
          {"value": 100000002, "label": "Neutral"},
          {"value": 100000003, "label": "Correction"}
        ]},
        {"schemaName": "mpa_feedback_text", "displayName": "Feedback Text", "type": "MultilineText", "maxLength": 4000},
        {"schemaName": "mpa_user_query", "displayName": "User Query", "type": "MultilineText", "maxLength": 4000},
        {"schemaName": "mpa_agent_response", "displayName": "Agent Response", "type": "MultilineText", "maxLength": 50000},
        {"schemaName": "mpa_kb_files_used", "displayName": "KB Files Used", "type": "MultilineText", "maxLength": 4000},
        {"schemaName": "mpa_agent_type", "displayName": "Agent Type", "type": "Choice", "options": [
          {"value": 100000000, "label": "MPA"},
          {"value": 100000001, "label": "CA"},
          {"value": 100000002, "label": "EAP"}
        ]},
        {"schemaName": "mpa_created_at", "displayName": "Created At", "type": "DateTime"}
      ]
    },
    {
      "schemaName": "mpa_kb_usage",
      "displayName": "KB Usage Tracking",
      "pluralName": "KB Usage Tracking",
      "description": "Tracks KB file usage and feedback correlation",
      "ownership": "OrganizationOwned",
      "fields": [
        {"schemaName": "mpa_kb_usage_id", "displayName": "KB Usage ID", "type": "Uniqueidentifier", "isPrimaryKey": true},
        {"schemaName": "mpa_kb_file_name", "displayName": "KB File Name", "type": "SingleLineOfText", "maxLength": 200, "isRequired": true},
        {"schemaName": "mpa_session_id", "displayName": "Session", "type": "Lookup", "target": "eap_session"},
        {"schemaName": "mpa_query_text", "displayName": "Query Text", "type": "MultilineText", "maxLength": 2000},
        {"schemaName": "mpa_relevance_score", "displayName": "Relevance Score", "type": "Decimal", "precision": 4},
        {"schemaName": "mpa_feedback_received", "displayName": "Feedback Received", "type": "Choice", "options": [
          {"value": 100000000, "label": "None"},
          {"value": 100000001, "label": "Positive"},
          {"value": 100000002, "label": "Negative"}
        ]},
        {"schemaName": "mpa_agent_type", "displayName": "Agent Type", "type": "Choice", "options": [
          {"value": 100000000, "label": "MPA"},
          {"value": 100000001, "label": "CA"},
          {"value": 100000002, "label": "EAP"}
        ]},
        {"schemaName": "mpa_used_at", "displayName": "Used At", "type": "DateTime", "isRequired": true}
      ]
    },
    {
      "schemaName": "mpa_success_patterns",
      "displayName": "Success Patterns",
      "pluralName": "Success Patterns",
      "description": "High-scoring response patterns for few-shot learning",
      "ownership": "OrganizationOwned",
      "fields": [
        {"schemaName": "mpa_pattern_id", "displayName": "Pattern ID", "type": "Uniqueidentifier", "isPrimaryKey": true},
        {"schemaName": "mpa_scenario", "displayName": "Scenario", "type": "SingleLineOfText", "maxLength": 200, "isRequired": true},
        {"schemaName": "mpa_user_message", "displayName": "User Message", "type": "MultilineText", "maxLength": 4000, "isRequired": true},
        {"schemaName": "mpa_agent_response", "displayName": "Agent Response", "type": "MultilineText", "maxLength": 50000, "isRequired": true},
        {"schemaName": "mpa_composite_score", "displayName": "Composite Score", "type": "Decimal", "precision": 4, "isRequired": true},
        {"schemaName": "mpa_scores_json", "displayName": "Scores JSON", "type": "MultilineText", "maxLength": 4000},
        {"schemaName": "mpa_agent_type", "displayName": "Agent Type", "type": "Choice", "options": [
          {"value": 100000000, "label": "MPA"},
          {"value": 100000001, "label": "CA"},
          {"value": 100000002, "label": "EAP"}
        ]},
        {"schemaName": "mpa_created_at", "displayName": "Created At", "type": "DateTime", "isRequired": true}
      ]
    }
  ]
}
```

### A2. flow_12_MPA_CaptureFeedback.json

```json
{
  "metadata": {
    "flowName": "MPA_CaptureFeedback",
    "flowNumber": "12",
    "displayName": "MPA - Capture User Feedback",
    "version": "1.0.0",
    "tables": ["mpa_feedback", "mpa_kb_usage"]
  },
  "trigger": {
    "type": "Request",
    "kind": "Http",
    "schema": {
      "type": "object",
      "properties": {
        "session_id": {"type": "string"},
        "message_id": {"type": "string"},
        "feedback_type": {"type": "string", "enum": ["POSITIVE", "NEGATIVE", "NEUTRAL", "CORRECTION"]},
        "feedback_text": {"type": "string"},
        "kb_files_used": {"type": "array", "items": {"type": "string"}},
        "agent_response": {"type": "string"},
        "user_query": {"type": "string"},
        "agent_type": {"type": "string", "enum": ["MPA", "CA", "EAP"]}
      },
      "required": ["session_id", "feedback_type", "agent_type"]
    }
  },
  "actions": {
    "Initialize_Variables": {
      "type": "InitializeVariable",
      "inputs": {"variables": [{"name": "feedbackTypeCode", "type": "integer", "value": 100000000}]}
    },
    "Switch_Feedback_Type": {
      "type": "Switch",
      "expression": "@triggerBody()?['feedback_type']",
      "cases": {
        "POSITIVE": {"actions": {"Set_Positive": {"type": "SetVariable", "inputs": {"name": "feedbackTypeCode", "value": 100000000}}}},
        "NEGATIVE": {"actions": {"Set_Negative": {"type": "SetVariable", "inputs": {"name": "feedbackTypeCode", "value": 100000001}}}},
        "NEUTRAL": {"actions": {"Set_Neutral": {"type": "SetVariable", "inputs": {"name": "feedbackTypeCode", "value": 100000002}}}},
        "CORRECTION": {"actions": {"Set_Correction": {"type": "SetVariable", "inputs": {"name": "feedbackTypeCode", "value": 100000003}}}}
      }
    },
    "Create_Feedback_Record": {
      "type": "OpenApiConnection",
      "inputs": {
        "parameters": {
          "entityName": "mpa_feedbacks",
          "item": {
            "mpa_session_id@odata.bind": "/eap_sessions(@{triggerBody()?['session_id']})",
            "mpa_message_id": "@triggerBody()?['message_id']",
            "mpa_feedback_type": "@variables('feedbackTypeCode')",
            "mpa_feedback_text": "@triggerBody()?['feedback_text']",
            "mpa_user_query": "@triggerBody()?['user_query']",
            "mpa_agent_response": "@triggerBody()?['agent_response']",
            "mpa_kb_files_used": "@if(empty(triggerBody()?['kb_files_used']), null, string(triggerBody()?['kb_files_used']))",
            "mpa_agent_type": "@if(equals(triggerBody()?['agent_type'], 'MPA'), 100000000, if(equals(triggerBody()?['agent_type'], 'CA'), 100000001, 100000002))",
            "mpa_created_at": "@utcNow()"
          }
        }
      },
      "runAfter": {"Switch_Feedback_Type": ["Succeeded"]}
    },
    "Condition_Has_KB_Files": {
      "type": "If",
      "expression": {"and": [{"not": {"equals": ["@triggerBody()?['kb_files_used']", null]}}, {"greater": ["@length(coalesce(triggerBody()?['kb_files_used'], json('[]')))", 0]}]},
      "actions": {
        "Apply_to_each_KB_File": {
          "type": "Foreach",
          "foreach": "@triggerBody()?['kb_files_used']",
          "actions": {
            "Create_KB_Usage": {
              "type": "OpenApiConnection",
              "inputs": {
                "parameters": {
                  "entityName": "mpa_kb_usages",
                  "item": {
                    "mpa_kb_file_name": "@items('Apply_to_each_KB_File')",
                    "mpa_session_id@odata.bind": "/eap_sessions(@{triggerBody()?['session_id']})",
                    "mpa_query_text": "@triggerBody()?['user_query']",
                    "mpa_feedback_received": "@if(equals(triggerBody()?['feedback_type'], 'POSITIVE'), 100000001, if(equals(triggerBody()?['feedback_type'], 'NEGATIVE'), 100000002, 100000000))",
                    "mpa_agent_type": "@if(equals(triggerBody()?['agent_type'], 'MPA'), 100000000, if(equals(triggerBody()?['agent_type'], 'CA'), 100000001, 100000002))",
                    "mpa_used_at": "@utcNow()"
                  }
                }
              }
            }
          }
        }
      },
      "runAfter": {"Create_Feedback_Record": ["Succeeded"]}
    },
    "Response": {
      "type": "Response",
      "inputs": {
        "statusCode": 200,
        "body": {"status": "Success", "feedback_id": "@outputs('Create_Feedback_Record')?['body/mpa_feedbackid']"}
      },
      "runAfter": {"Condition_Has_KB_Files": ["Succeeded", "Skipped"]}
    }
  }
}
```

### A2. flow_13_MPA_TrackKBUsage.json

```json
{
  "metadata": {
    "flowName": "MPA_TrackKBUsage",
    "flowNumber": "13",
    "displayName": "MPA - Track KB Usage",
    "version": "1.0.0",
    "tables": ["mpa_kb_usage"]
  },
  "trigger": {
    "type": "Request",
    "kind": "Http",
    "schema": {
      "type": "object",
      "properties": {
        "session_id": {"type": "string"},
        "kb_files": {"type": "array", "items": {"type": "object", "properties": {"file_name": {"type": "string"}, "relevance_score": {"type": "number"}}}},
        "query_text": {"type": "string"},
        "agent_type": {"type": "string", "enum": ["MPA", "CA", "EAP"]}
      },
      "required": ["kb_files", "agent_type"]
    }
  },
  "actions": {
    "Apply_to_each": {
      "type": "Foreach",
      "foreach": "@triggerBody()?['kb_files']",
      "actions": {
        "Create_Usage_Record": {
          "type": "OpenApiConnection",
          "inputs": {
            "parameters": {
              "entityName": "mpa_kb_usages",
              "item": {
                "mpa_kb_file_name": "@items('Apply_to_each')?['file_name']",
                "mpa_session_id@odata.bind": "@if(empty(triggerBody()?['session_id']), null, concat('/eap_sessions(', triggerBody()?['session_id'], ')'))",
                "mpa_query_text": "@triggerBody()?['query_text']",
                "mpa_relevance_score": "@items('Apply_to_each')?['relevance_score']",
                "mpa_feedback_received": 100000000,
                "mpa_agent_type": "@if(equals(triggerBody()?['agent_type'], 'MPA'), 100000000, if(equals(triggerBody()?['agent_type'], 'CA'), 100000001, 100000002))",
                "mpa_used_at": "@utcNow()"
              }
            }
          }
        }
      }
    },
    "Response": {
      "type": "Response",
      "inputs": {"statusCode": 200, "body": {"status": "Success", "files_tracked": "@length(triggerBody()?['kb_files'])"}}
    }
  }
}
```

---

## VALIDATION CHECKLIST

### Mastercard (after VS Code completes Part A)
- [ ] learning_tables.json created in /release/v5.5/agents/mpa/mastercard/dataverse/
- [ ] flow_12_MPA_CaptureFeedback.json created
- [ ] flow_13_MPA_TrackKBUsage.json created
- [ ] deploy-learning-tables.ps1 created
- [ ] COPILOT_TOPICS.md created
- [ ] Committed to deploy/mastercard

### Personal (after VS Code completes Part B)
- [ ] 5 test files created in /packages/agent-core/src/tests/
- [ ] sync-kb-local.sh created
- [ ] environment.personal.json updated
- [ ] Tests pass
- [ ] Committed to deploy/personal

---

## END OF DOCUMENT
