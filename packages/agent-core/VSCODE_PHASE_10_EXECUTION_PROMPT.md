# VS CODE PHASE 10 EXECUTION PROMPT
# RAG and Learning Optimization for Mastercard + Personal Environments

**Date:** 2026-01-12
**Specification:** /packages/agent-core/PHASE_10_RAG_LEARNING_OPTIMIZATION.md

---

## EXECUTION OVERVIEW

You will execute Phase 10 in TWO PARTS:
- **Part A:** Mastercard environment (deploy/mastercard branch)
- **Part B:** Personal environment (deploy/personal branch)

Read the full specification first, then execute each part sequentially.

---

## PART A: MASTERCARD ENVIRONMENT

### Switch to Mastercard Branch
```bash
git checkout deploy/mastercard
git pull origin deploy/mastercard
```

### A1: Create Dataverse Table Definitions

Create directory and 3 JSON files:

```bash
mkdir -p /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/mastercard/dataverse
```

**File 1:** `mpa_feedback.json`
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "metadata": {
    "tableName": "mpa_feedback",
    "version": "1.0.0",
    "created": "2026-01-12",
    "purpose": "Store user feedback on agent responses for learning"
  },
  "table": {
    "schemaName": "mpa_feedback",
    "displayName": "Agent Feedback",
    "pluralName": "Agent Feedback",
    "description": "Stores user feedback on agent responses for self-learning system",
    "primaryColumn": "mpa_feedback_id",
    "ownership": "Organization",
    "tableType": "Standard"
  },
  "fields": [
    {
      "schemaName": "mpa_feedback_id",
      "displayName": "Feedback ID",
      "dataType": "Uniqueidentifier",
      "isPrimaryKey": true,
      "isRequired": true
    },
    {
      "schemaName": "mpa_session_id",
      "displayName": "Session ID",
      "dataType": "Lookup",
      "relatedTable": "eap_session",
      "isRequired": true,
      "description": "Link to parent session"
    },
    {
      "schemaName": "mpa_message_id",
      "displayName": "Message ID",
      "dataType": "SingleLineOfText",
      "maxLength": 100,
      "description": "Unique identifier for the message within the session"
    },
    {
      "schemaName": "mpa_feedback_type",
      "displayName": "Feedback Type",
      "dataType": "Choice",
      "isRequired": true,
      "options": [
        {"value": 100000000, "label": "Positive"},
        {"value": 100000001, "label": "Negative"},
        {"value": 100000002, "label": "Neutral"},
        {"value": 100000003, "label": "Correction"}
      ]
    },
    {
      "schemaName": "mpa_feedback_text",
      "displayName": "Feedback Text",
      "dataType": "MultilineText",
      "maxLength": 4000,
      "description": "Optional text explanation of feedback"
    },
    {
      "schemaName": "mpa_user_query",
      "displayName": "User Query",
      "dataType": "MultilineText",
      "maxLength": 4000,
      "description": "The user message that prompted the response"
    },
    {
      "schemaName": "mpa_agent_response",
      "displayName": "Agent Response",
      "dataType": "MultilineText",
      "maxLength": 50000,
      "description": "The agent response that received feedback"
    },
    {
      "schemaName": "mpa_kb_files_used",
      "displayName": "KB Files Used",
      "dataType": "MultilineText",
      "maxLength": 4000,
      "format": "JSON",
      "description": "JSON array of KB file names referenced in response"
    },
    {
      "schemaName": "mpa_agent_type",
      "displayName": "Agent Type",
      "dataType": "Choice",
      "isRequired": true,
      "options": [
        {"value": 100000000, "label": "MPA"},
        {"value": 100000001, "label": "CA"},
        {"value": 100000002, "label": "EAP"}
      ]
    },
    {
      "schemaName": "mpa_created_at",
      "displayName": "Created At",
      "dataType": "DateTime",
      "isRequired": true,
      "description": "Timestamp when feedback was submitted"
    }
  ],
  "indexes": [
    {
      "name": "idx_feedback_session",
      "fields": ["mpa_session_id"],
      "isUnique": false
    },
    {
      "name": "idx_feedback_type_agent",
      "fields": ["mpa_feedback_type", "mpa_agent_type"],
      "isUnique": false
    }
  ]
}
```

**File 2:** `mpa_kb_usage.json`
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "metadata": {
    "tableName": "mpa_kb_usage",
    "version": "1.0.0",
    "created": "2026-01-12",
    "purpose": "Track KB file usage and effectiveness"
  },
  "table": {
    "schemaName": "mpa_kb_usage",
    "displayName": "KB Usage Tracking",
    "pluralName": "KB Usage Tracking",
    "description": "Tracks which KB files are referenced and their correlation with feedback",
    "primaryColumn": "mpa_kb_usage_id",
    "ownership": "Organization",
    "tableType": "Standard"
  },
  "fields": [
    {
      "schemaName": "mpa_kb_usage_id",
      "displayName": "KB Usage ID",
      "dataType": "Uniqueidentifier",
      "isPrimaryKey": true,
      "isRequired": true
    },
    {
      "schemaName": "mpa_kb_file_name",
      "displayName": "KB File Name",
      "dataType": "SingleLineOfText",
      "maxLength": 200,
      "isRequired": true,
      "description": "Name of the KB file that was used"
    },
    {
      "schemaName": "mpa_session_id",
      "displayName": "Session ID",
      "dataType": "Lookup",
      "relatedTable": "eap_session",
      "description": "Link to session where file was used"
    },
    {
      "schemaName": "mpa_query_text",
      "displayName": "Query Text",
      "dataType": "MultilineText",
      "maxLength": 2000,
      "description": "The query that triggered KB retrieval"
    },
    {
      "schemaName": "mpa_relevance_score",
      "displayName": "Relevance Score",
      "dataType": "Decimal",
      "precision": 4,
      "minValue": 0,
      "maxValue": 1,
      "description": "Semantic similarity score (0-1)"
    },
    {
      "schemaName": "mpa_feedback_received",
      "displayName": "Feedback Received",
      "dataType": "Choice",
      "options": [
        {"value": 100000000, "label": "None"},
        {"value": 100000001, "label": "Positive"},
        {"value": 100000002, "label": "Negative"}
      ],
      "description": "Feedback on response that used this KB file"
    },
    {
      "schemaName": "mpa_agent_type",
      "displayName": "Agent Type",
      "dataType": "Choice",
      "options": [
        {"value": 100000000, "label": "MPA"},
        {"value": 100000001, "label": "CA"},
        {"value": 100000002, "label": "EAP"}
      ]
    },
    {
      "schemaName": "mpa_used_at",
      "displayName": "Used At",
      "dataType": "DateTime",
      "isRequired": true,
      "description": "Timestamp when KB file was retrieved"
    }
  ],
  "indexes": [
    {
      "name": "idx_kb_usage_file",
      "fields": ["mpa_kb_file_name"],
      "isUnique": false
    },
    {
      "name": "idx_kb_usage_feedback",
      "fields": ["mpa_feedback_received", "mpa_agent_type"],
      "isUnique": false
    }
  ]
}
```

**File 3:** `mpa_success_patterns.json`
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "metadata": {
    "tableName": "mpa_success_patterns",
    "version": "1.0.0",
    "created": "2026-01-12",
    "purpose": "Store high-scoring response patterns for few-shot learning"
  },
  "table": {
    "schemaName": "mpa_success_patterns",
    "displayName": "Success Patterns",
    "pluralName": "Success Patterns",
    "description": "High-scoring response patterns used for few-shot prompt injection",
    "primaryColumn": "mpa_pattern_id",
    "ownership": "Organization",
    "tableType": "Standard"
  },
  "fields": [
    {
      "schemaName": "mpa_pattern_id",
      "displayName": "Pattern ID",
      "dataType": "Uniqueidentifier",
      "isPrimaryKey": true,
      "isRequired": true
    },
    {
      "schemaName": "mpa_scenario",
      "displayName": "Scenario",
      "dataType": "SingleLineOfText",
      "maxLength": 200,
      "isRequired": true,
      "description": "Category of the successful interaction (e.g., benchmark_query, channel_recommendation)"
    },
    {
      "schemaName": "mpa_user_message",
      "displayName": "User Message",
      "dataType": "MultilineText",
      "maxLength": 4000,
      "isRequired": true,
      "description": "The user query that led to high-scoring response"
    },
    {
      "schemaName": "mpa_agent_response",
      "displayName": "Agent Response",
      "dataType": "MultilineText",
      "maxLength": 50000,
      "isRequired": true,
      "description": "The high-scoring agent response"
    },
    {
      "schemaName": "mpa_composite_score",
      "displayName": "Composite Score",
      "dataType": "Decimal",
      "precision": 4,
      "minValue": 0,
      "maxValue": 1,
      "isRequired": true,
      "description": "Overall quality score (must be >= 0.95 to store)"
    },
    {
      "schemaName": "mpa_scores_json",
      "displayName": "Scores JSON",
      "dataType": "MultilineText",
      "maxLength": 4000,
      "format": "JSON",
      "description": "Individual scorer results as JSON"
    },
    {
      "schemaName": "mpa_agent_type",
      "displayName": "Agent Type",
      "dataType": "Choice",
      "options": [
        {"value": 100000000, "label": "MPA"},
        {"value": 100000001, "label": "CA"},
        {"value": 100000002, "label": "EAP"}
      ]
    },
    {
      "schemaName": "mpa_created_at",
      "displayName": "Created At",
      "dataType": "DateTime",
      "isRequired": true
    }
  ],
  "indexes": [
    {
      "name": "idx_patterns_scenario_score",
      "fields": ["mpa_scenario", "mpa_composite_score"],
      "isUnique": false
    }
  ]
}
```

### A2: Create New Flow Specifications

**File:** `flow_12_MPA_CaptureFeedback.json`
Location: `/release/v5.5/agents/mpa/base/flows/specifications/`

```json
{
  "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
  "metadata": {
    "flowName": "MPA_CaptureFeedback",
    "flowNumber": "12",
    "displayName": "MPA - Capture User Feedback",
    "description": "Capture and store user feedback for self-learning. Shared across MPA, CA, EAP agents.",
    "version": "1.0.0",
    "author": "Phase 10 Implementation",
    "createdDate": "2026-01-12",
    "tables": ["mpa_feedback", "mpa_kb_usage"],
    "azureFunctions": []
  },
  "trigger": {
    "type": "Request",
    "kind": "Http",
    "schema": {
      "type": "object",
      "properties": {
        "session_id": {"type": "string", "description": "Session ID from eap_session"},
        "message_id": {"type": "string", "description": "Optional message identifier"},
        "feedback_type": {"type": "string", "enum": ["POSITIVE", "NEGATIVE", "NEUTRAL", "CORRECTION"]},
        "feedback_text": {"type": "string", "description": "Optional explanation"},
        "kb_files_used": {"type": "array", "items": {"type": "string"}, "description": "KB files referenced"},
        "agent_response": {"type": "string", "description": "The response being rated"},
        "user_query": {"type": "string", "description": "Original user message"},
        "agent_type": {"type": "string", "enum": ["MPA", "CA", "EAP"]}
      },
      "required": ["session_id", "feedback_type", "agent_type"]
    }
  },
  "variables": [
    {"name": "varFeedbackTypeCode", "type": "Integer", "value": 100000000},
    {"name": "varAgentTypeCode", "type": "Integer", "value": 100000000},
    {"name": "varSuccess", "type": "Boolean", "value": true},
    {"name": "varErrorMessage", "type": "String", "value": ""}
  ],
  "actions": {
    "Scope_Try": {
      "type": "Scope",
      "actions": {
        "Switch_Feedback_Type": {
          "type": "Switch",
          "expression": "@triggerBody()?['feedback_type']",
          "cases": {
            "POSITIVE": {"case": "POSITIVE", "actions": {"Set_Feedback_Positive": {"type": "SetVariable", "inputs": {"name": "varFeedbackTypeCode", "value": 100000000}}}},
            "NEGATIVE": {"case": "NEGATIVE", "actions": {"Set_Feedback_Negative": {"type": "SetVariable", "inputs": {"name": "varFeedbackTypeCode", "value": 100000001}}}},
            "NEUTRAL": {"case": "NEUTRAL", "actions": {"Set_Feedback_Neutral": {"type": "SetVariable", "inputs": {"name": "varFeedbackTypeCode", "value": 100000002}}}},
            "CORRECTION": {"case": "CORRECTION", "actions": {"Set_Feedback_Correction": {"type": "SetVariable", "inputs": {"name": "varFeedbackTypeCode", "value": 100000003}}}}
          },
          "default": {"actions": {}},
          "runAfter": {}
        },
        "Switch_Agent_Type": {
          "type": "Switch",
          "expression": "@triggerBody()?['agent_type']",
          "cases": {
            "MPA": {"case": "MPA", "actions": {"Set_Agent_MPA": {"type": "SetVariable", "inputs": {"name": "varAgentTypeCode", "value": 100000000}}}},
            "CA": {"case": "CA", "actions": {"Set_Agent_CA": {"type": "SetVariable", "inputs": {"name": "varAgentTypeCode", "value": 100000001}}}},
            "EAP": {"case": "EAP", "actions": {"Set_Agent_EAP": {"type": "SetVariable", "inputs": {"name": "varAgentTypeCode", "value": 100000002}}}}
          },
          "default": {"actions": {}},
          "runAfter": {"Switch_Feedback_Type": ["Succeeded"]}
        },
        "Create_Feedback_Record": {
          "type": "OpenApiConnection",
          "inputs": {
            "host": {
              "connectionName": "shared_commondataserviceforapps",
              "operationId": "CreateRecord",
              "apiId": "/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps"
            },
            "parameters": {
              "entityName": "mpa_feedback",
              "item": {
                "mpa_session_id": "@triggerBody()?['session_id']",
                "mpa_message_id": "@triggerBody()?['message_id']",
                "mpa_feedback_type": "@variables('varFeedbackTypeCode')",
                "mpa_feedback_text": "@triggerBody()?['feedback_text']",
                "mpa_user_query": "@triggerBody()?['user_query']",
                "mpa_agent_response": "@triggerBody()?['agent_response']",
                "mpa_kb_files_used": "@if(empty(triggerBody()?['kb_files_used']), null, string(triggerBody()?['kb_files_used']))",
                "mpa_agent_type": "@variables('varAgentTypeCode')",
                "mpa_created_at": "@utcNow()"
              }
            }
          },
          "runAfter": {"Switch_Agent_Type": ["Succeeded"]}
        },
        "Condition_Has_KB_Files": {
          "type": "If",
          "expression": {
            "and": [
              {"not": {"equals": ["@triggerBody()?['kb_files_used']", null]}},
              {"greater": ["@length(coalesce(triggerBody()?['kb_files_used'], json('[]')))", 0]}
            ]
          },
          "actions": {
            "For_Each_KB_File": {
              "type": "Foreach",
              "foreach": "@triggerBody()?['kb_files_used']",
              "actions": {
                "Create_KB_Usage_Record": {
                  "type": "OpenApiConnection",
                  "inputs": {
                    "host": {
                      "connectionName": "shared_commondataserviceforapps",
                      "operationId": "CreateRecord",
                      "apiId": "/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps"
                    },
                    "parameters": {
                      "entityName": "mpa_kb_usage",
                      "item": {
                        "mpa_kb_file_name": "@items('For_Each_KB_File')",
                        "mpa_session_id": "@triggerBody()?['session_id']",
                        "mpa_query_text": "@triggerBody()?['user_query']",
                        "mpa_feedback_received": "@if(equals(variables('varFeedbackTypeCode'), 100000000), 100000001, if(equals(variables('varFeedbackTypeCode'), 100000001), 100000002, 100000000))",
                        "mpa_agent_type": "@variables('varAgentTypeCode')",
                        "mpa_used_at": "@utcNow()"
                      }
                    }
                  }
                }
              },
              "runtimeConfiguration": {"concurrency": {"repetitions": 5}}
            }
          },
          "else": {"actions": {}},
          "runAfter": {"Create_Feedback_Record": ["Succeeded"]}
        },
        "Response_Success": {
          "type": "Response",
          "inputs": {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": {
              "status": "Success",
              "feedback_id": "@outputs('Create_Feedback_Record')?['body/mpa_feedbackid']",
              "kb_files_tracked": "@length(coalesce(triggerBody()?['kb_files_used'], json('[]')))"
            }
          },
          "runAfter": {"Condition_Has_KB_Files": ["Succeeded", "Skipped"]}
        }
      }
    },
    "Scope_Catch": {
      "type": "Scope",
      "runAfter": {"Scope_Try": ["Failed", "TimedOut"]},
      "actions": {
        "Set_Error": {
          "type": "SetVariable",
          "inputs": {"name": "varErrorMessage", "value": "@{result('Scope_Try')}"}
        },
        "Response_Error": {
          "type": "Response",
          "inputs": {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": {"status": "Error", "message": "Failed to capture feedback", "details": "@variables('varErrorMessage')"}
          },
          "runAfter": {"Set_Error": ["Succeeded"]}
        }
      }
    }
  },
  "connectionReferences": {
    "shared_commondataserviceforapps": {
      "connectionName": "shared_commondataserviceforapps",
      "source": "Embedded",
      "id": "/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps",
      "tier": "Standard"
    }
  }
}
```

**File:** `flow_13_MPA_TrackKBUsage.json`
```json
{
  "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
  "metadata": {
    "flowName": "MPA_TrackKBUsage",
    "flowNumber": "13",
    "displayName": "MPA - Track KB Usage",
    "description": "Track which KB files are retrieved during response generation (before feedback)",
    "version": "1.0.0",
    "author": "Phase 10 Implementation",
    "createdDate": "2026-01-12",
    "tables": ["mpa_kb_usage"],
    "azureFunctions": []
  },
  "trigger": {
    "type": "Request",
    "kind": "Http",
    "schema": {
      "type": "object",
      "properties": {
        "session_id": {"type": "string"},
        "kb_files": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "file_name": {"type": "string"},
              "relevance_score": {"type": "number"}
            },
            "required": ["file_name"]
          }
        },
        "query_text": {"type": "string"},
        "agent_type": {"type": "string", "enum": ["MPA", "CA", "EAP"]}
      },
      "required": ["kb_files", "agent_type"]
    }
  },
  "variables": [
    {"name": "varAgentTypeCode", "type": "Integer", "value": 100000000},
    {"name": "varFilesTracked", "type": "Integer", "value": 0}
  ],
  "actions": {
    "Switch_Agent_Type": {
      "type": "Switch",
      "expression": "@triggerBody()?['agent_type']",
      "cases": {
        "MPA": {"case": "MPA", "actions": {"Set_MPA": {"type": "SetVariable", "inputs": {"name": "varAgentTypeCode", "value": 100000000}}}},
        "CA": {"case": "CA", "actions": {"Set_CA": {"type": "SetVariable", "inputs": {"name": "varAgentTypeCode", "value": 100000001}}}},
        "EAP": {"case": "EAP", "actions": {"Set_EAP": {"type": "SetVariable", "inputs": {"name": "varAgentTypeCode", "value": 100000002}}}}
      },
      "default": {"actions": {}},
      "runAfter": {}
    },
    "For_Each_KB_File": {
      "type": "Foreach",
      "foreach": "@triggerBody()?['kb_files']",
      "actions": {
        "Create_Usage_Record": {
          "type": "OpenApiConnection",
          "inputs": {
            "host": {
              "connectionName": "shared_commondataserviceforapps",
              "operationId": "CreateRecord",
              "apiId": "/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps"
            },
            "parameters": {
              "entityName": "mpa_kb_usage",
              "item": {
                "mpa_kb_file_name": "@items('For_Each_KB_File')?['file_name']",
                "mpa_session_id": "@triggerBody()?['session_id']",
                "mpa_query_text": "@triggerBody()?['query_text']",
                "mpa_relevance_score": "@coalesce(items('For_Each_KB_File')?['relevance_score'], 0)",
                "mpa_feedback_received": 100000000,
                "mpa_agent_type": "@variables('varAgentTypeCode')",
                "mpa_used_at": "@utcNow()"
              }
            }
          }
        },
        "Increment_Counter": {
          "type": "IncrementVariable",
          "inputs": {"name": "varFilesTracked", "value": 1},
          "runAfter": {"Create_Usage_Record": ["Succeeded"]}
        }
      },
      "runtimeConfiguration": {"concurrency": {"repetitions": 10}},
      "runAfter": {"Switch_Agent_Type": ["Succeeded"]}
    },
    "Response_Success": {
      "type": "Response",
      "inputs": {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": {"status": "Success", "files_tracked": "@variables('varFilesTracked')"}
      },
      "runAfter": {"For_Each_KB_File": ["Succeeded"]}
    }
  },
  "connectionReferences": {
    "shared_commondataserviceforapps": {
      "connectionName": "shared_commondataserviceforapps",
      "source": "Embedded",
      "id": "/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps",
      "tier": "Standard"
    }
  }
}
```

### A3: Create CA and EAP Flow Directories

```bash
mkdir -p /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/ca/base/flows/specifications
mkdir -p /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/eap/base/flows/specifications
```

Create minimal flow specs for CA and EAP (they share MPA_CaptureFeedback):

**CA:** `flow_01_CA_InitializeSession.json` (same pattern as MPA but agent_type = CA)
**EAP:** `flow_01_EAP_InitializeSession.json` (same pattern but agent_type = EAP)

### A4: Create Deployment Scripts

Location: `/release/v5.5/deployment/mastercard/scripts/`

```bash
mkdir -p /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/deployment/mastercard/scripts
```

Create `deploy-learning-tables.ps1` and `deploy-learning-flows.ps1` as specified in the Phase 10 document.

### A5: Create Copilot Topics Documentation

Create `/release/v5.5/agents/mpa/mastercard/COPILOT_TOPICS.md`:

```markdown
# MPA Copilot Studio Topics

## Topic Configuration for Mastercard Deployment

### Topic 1: Start Planning Session
- **Display Name:** Start Media Planning
- **Trigger Phrases:**
  - start a new media plan
  - create media plan
  - new campaign plan
  - help me plan media
  - begin planning
  - start planning session
- **Action:** Call flow MPA_InitializeSession
- **Inputs:** pathway (choice: EXPRESS/GUIDED/STANDARD)

### Topic 2: Search Benchmarks
- **Display Name:** Search Industry Benchmarks
- **Trigger Phrases:**
  - what are typical CPMs
  - benchmark data for
  - industry benchmarks
  - what's a good CTR
  - average performance for
- **Action:** Call flow MPA_SearchBenchmarks
- **Inputs:** metric_type, channel, vertical (extracted from message)

### Topic 3: Provide Feedback
- **Display Name:** Provide Feedback
- **Trigger Phrases:**
  - that was helpful
  - that wasn't helpful
  - good answer
  - not what I needed
  - this is wrong
- **Action:** Call flow MPA_CaptureFeedback
- **Inputs:** feedback_type (auto-detected), feedback_text

### Topic 4: Generate Document
- **Display Name:** Generate Plan Document
- **Trigger Phrases:**
  - generate the document
  - create the media plan document
  - export the plan
  - download the plan
- **Action:** Call flow MPA_GenerateDocument
- **Inputs:** format (DOCX/PDF)

### Topic 5: Search Channels
- **Display Name:** Search Channel Information
- **Trigger Phrases:**
  - tell me about display advertising
  - what channels should I use
  - CTV options
  - paid social channels
- **Action:** Call flow MPA_SearchChannels
- **Inputs:** channel_query (extracted)

### Topic 6: Import Performance Data
- **Display Name:** Import Performance Data
- **Trigger Phrases:**
  - import data
  - upload performance
  - add campaign results
- **Action:** Call flow MPA_ImportPerformance
```

Create similar files for CA and EAP.

### A6: Update Agent Config Files

Add feedback trigger patterns to:
- `/packages/agent-core/src/agents/mpa/mpa-agent-config.ts`
- `/packages/agent-core/src/agents/ca/ca-agent-config.ts`
- `/packages/agent-core/src/agents/eap/eap-agent-config.ts`

Add this to each config:
```typescript
feedbackTriggers: {
  positive: ['helpful', 'great', 'perfect', 'exactly what I needed', 'thanks', 'excellent'],
  negative: ['wrong', 'not helpful', 'incorrect', 'bad', 'useless', 'that doesnt help'],
  correction: ['actually', 'let me correct', 'that should be', 'no its']
}
```

### A7: Commit Mastercard Changes

```bash
git add .
git commit -m "Phase 10A: Mastercard RAG and Learning Optimization - 3 Dataverse tables, 2 flows, topic docs"
git push origin deploy/mastercard
```

---

## PART B: PERSONAL ENVIRONMENT

### Switch to Personal Branch
```bash
git checkout deploy/personal
git pull origin deploy/personal
```

### B1: Create RAG Test Files

Location: `/packages/agent-core/src/tests/`

**File 1:** `test-embeddings.ts`
```typescript
/**
 * Test embedding generation for RAG pipeline
 * Run: npx ts-node src/tests/test-embeddings.ts
 */

import { OpenAIEmbeddingProvider } from '../providers/embeddings/openai-embedding-provider';

async function testEmbeddings(): Promise<void> {
  console.log('=== Testing Embedding Generation ===\n');
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: OPENAI_API_KEY environment variable not set');
    process.exit(1);
  }
  
  const provider = new OpenAIEmbeddingProvider({
    apiKey,
    model: 'text-embedding-3-small'
  });
  
  const testQueries = [
    "What is a typical CPM for display advertising?",
    "What channels work best for brand awareness?",
    "How do I calculate ROAS?"
  ];
  
  for (const query of testQueries) {
    console.log(`Query: "${query}"`);
    const embedding = await provider.embed(query);
    console.log(`  Dimension: ${embedding.length}`);
    console.log(`  First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}]`);
    console.log(`  Magnitude: ${Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0)).toFixed(4)}`);
    console.log('');
  }
  
  // Test similarity
  console.log('=== Testing Similarity ===\n');
  const emb1 = await provider.embed("What is CPM?");
  const emb2 = await provider.embed("Cost per thousand impressions");
  const emb3 = await provider.embed("The weather is nice today");
  
  const cosineSim = (a: number[], b: number[]): number => {
    const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
    const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
    return dot / (magA * magB);
  };
  
  console.log(`Similarity (CPM vs Cost per thousand): ${cosineSim(emb1, emb2).toFixed(4)}`);
  console.log(`Similarity (CPM vs weather): ${cosineSim(emb1, emb3).toFixed(4)}`);
  
  console.log('\n✅ Embedding tests passed!');
}

testEmbeddings().catch(console.error);
```

**File 2:** `test-retrieval.ts`
```typescript
/**
 * Test RAG retrieval against KB files
 * Run: npx ts-node src/tests/test-retrieval.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { RetrievalEngine } from '../rag/retrieval-engine';
import { DocumentProcessor } from '../rag/document-processor';

async function testRetrieval(): Promise<void> {
  console.log('=== Testing RAG Retrieval ===\n');
  
  // Load KB files
  const kbPath = path.join(__dirname, '../../../../release/v5.5/agents/mpa/base/kb');
  
  if (!fs.existsSync(kbPath)) {
    console.error(`KB path not found: ${kbPath}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(kbPath).filter(f => f.endsWith('.txt'));
  console.log(`Found ${files.length} KB files`);
  
  // Process documents
  const processor = new DocumentProcessor({
    chunkSize: 400,
    chunkOverlap: 50
  });
  
  const documents: Array<{content: string; metadata: {filename: string}}> = [];
  for (const file of files.slice(0, 5)) { // Test with first 5 files
    const content = fs.readFileSync(path.join(kbPath, file), 'utf-8');
    const chunks = processor.chunk(content);
    chunks.forEach((chunk, i) => {
      documents.push({
        content: chunk,
        metadata: { filename: file }
      });
    });
  }
  
  console.log(`Created ${documents.length} chunks from ${files.slice(0, 5).length} files\n`);
  
  // Initialize retrieval engine
  const retrieval = new RetrievalEngine({
    embeddingProvider: 'openai',
    topK: 3
  });
  
  await retrieval.initialize(documents);
  
  // Test queries
  const testQueries = [
    "What is a typical CPM for CTV advertising?",
    "How should I allocate budget across channels?",
    "What KPIs should I track for awareness campaigns?"
  ];
  
  for (const query of testQueries) {
    console.log(`Query: "${query}"`);
    const results = await retrieval.search(query);
    
    results.forEach((result, i) => {
      console.log(`  ${i + 1}. ${result.metadata.filename} (score: ${result.score.toFixed(4)})`);
      console.log(`     "${result.content.substring(0, 100)}..."`);
    });
    console.log('');
  }
  
  console.log('✅ Retrieval tests passed!');
}

testRetrieval().catch(console.error);
```

**File 3:** `test-self-critique.ts`
```typescript
/**
 * Test self-critique layer
 * Run: npx ts-node src/tests/test-self-critique.ts
 */

import { SelfCritique } from '../learning/self-critique';

async function testSelfCritique(): Promise<void> {
  console.log('=== Testing Self-Critique ===\n');
  
  const critique = new SelfCritique({
    model: 'claude-3-5-haiku-20241022',
    criteria: ['source-citation', 'acronym-definition', 'response-length', 'single-question']
  });
  
  const testCases = [
    {
      query: "What is a typical CPM for display?",
      response: "Display CPMs typically range from $2-8.",
      expectedIssues: ['source-citation'] // Missing citation
    },
    {
      query: "What is CPM?",
      response: "CPM, or Cost Per Mille, is the cost per 1,000 impressions. Based on Knowledge Base benchmarks, typical CPMs range from $2-15 depending on channel.",
      expectedIssues: [] // Good response
    },
    {
      query: "Tell me about display",
      response: "Display advertising is great! Here are 5 questions: What's your budget? What's your target? What's your timeline? What creative do you have? What's your KPI?",
      expectedIssues: ['single-question'] // Too many questions
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`Query: "${testCase.query}"`);
    console.log(`Response: "${testCase.response.substring(0, 80)}..."`);
    
    const result = await critique.evaluate(testCase.response, testCase.query);
    
    console.log(`  Pass: ${result.pass}`);
    console.log(`  Issues: ${result.issues.length > 0 ? result.issues.join(', ') : 'None'}`);
    console.log(`  Expected: ${testCase.expectedIssues.length > 0 ? testCase.expectedIssues.join(', ') : 'None'}`);
    console.log('');
  }
  
  console.log('✅ Self-critique tests completed!');
}

testSelfCritique().catch(console.error);
```

**File 4:** `test-success-patterns.ts`
```typescript
/**
 * Test success pattern storage and retrieval
 * Run: npx ts-node src/tests/test-success-patterns.ts
 */

import * as path from 'path';
import { SuccessPatterns } from '../learning/success-patterns';
import { JsonStorage } from '../learning/storage/json-storage';

async function testSuccessPatterns(): Promise<void> {
  console.log('=== Testing Success Patterns ===\n');
  
  const storagePath = path.join(__dirname, '../../learning-outputs/patterns');
  const storage = new JsonStorage<any>(storagePath);
  const patterns = new SuccessPatterns(storage);
  
  // Store test patterns
  const testPatterns = [
    {
      scenario: 'benchmark_query',
      userMessage: 'What is a typical CPM for CTV?',
      agentResponse: 'Based on Knowledge Base benchmarks, typical CTV CPMs range from $25-45 for premium inventory and $15-25 for programmatic. Factors affecting price include targeting specificity, publisher quality, and time of year.',
      compositeScore: 0.96
    },
    {
      scenario: 'channel_recommendation',
      userMessage: 'What channels should I use for awareness?',
      agentResponse: 'For awareness campaigns, Based on Knowledge Base guidance, I recommend: 1) CTV/OTT for high-impact video reach, 2) Programmatic Display for scale, 3) Paid Social for precise targeting. Budget allocation typically follows 40/35/25 split.',
      compositeScore: 0.97
    }
  ];
  
  console.log('Storing patterns...');
  for (const pattern of testPatterns) {
    await patterns.store(pattern);
    console.log(`  Stored: ${pattern.scenario} (score: ${pattern.compositeScore})`);
  }
  
  // Retrieve similar patterns
  console.log('\nRetrieving similar patterns...');
  const similar = await patterns.getSimilar('What CPM should I expect for streaming ads?');
  console.log(`Found ${similar.length} similar patterns:`);
  similar.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.scenario} - "${p.userMessage.substring(0, 40)}..."`);
  });
  
  console.log('\n✅ Success patterns tests passed!');
}

testSuccessPatterns().catch(console.error);
```

**File 5:** `test-kb-enhancement.ts`
```typescript
/**
 * Test KB enhancement pipeline
 * Run: npx ts-node src/tests/test-kb-enhancement.ts
 */

import * as path from 'path';
import { KBEnhancementPipeline } from '../learning/kb-enhancement-pipeline';

async function testKBEnhancement(): Promise<void> {
  console.log('=== Testing KB Enhancement Pipeline ===\n');
  
  const outputDir = path.join(__dirname, '../../learning-outputs/kb-suggestions');
  
  const pipeline = new KBEnhancementPipeline({
    outputDirectory: outputDir,
    minGapThreshold: 0.92
  });
  
  // Simulate eval results with gaps
  const mockEvalResults = [
    {
      input: 'What is incrementality testing?',
      output: 'Incrementality testing measures the true causal impact of advertising.',
      scores: { accuracy: 0.85, completeness: 0.70 }, // Gap: low completeness
      kbFilesUsed: ['Channel_Measurement_v5_5.txt']
    },
    {
      input: 'How do I set up a holdout test?',
      output: 'A holdout test involves keeping a control group unexposed to ads.',
      scores: { accuracy: 0.90, completeness: 0.65 }, // Gap: low completeness
      kbFilesUsed: ['Channel_Measurement_v5_5.txt']
    },
    {
      input: 'What is a typical CPM for display?',
      output: 'Based on Knowledge Base benchmarks, display CPMs typically range $2-8.',
      scores: { accuracy: 0.98, completeness: 0.95 }, // Good score
      kbFilesUsed: ['Benchmarks_Performance_v5_5.txt']
    }
  ];
  
  console.log('Analyzing eval results for gaps...');
  const suggestions = await pipeline.analyze(mockEvalResults);
  
  console.log(`\nGenerated ${suggestions.length} KB enhancement suggestions:`);
  suggestions.forEach((s, i) => {
    console.log(`\n${i + 1}. File: ${s.kbFile}`);
    console.log(`   Gap Type: ${s.gapType}`);
    console.log(`   Suggestion: ${s.suggestion.substring(0, 100)}...`);
  });
  
  console.log('\n✅ KB enhancement tests completed!');
}

testKBEnhancement().catch(console.error);
```

### B2: Create KB Sync Script

Location: `/scripts/sync-kb-to-personal.sh`

```bash
#!/bin/bash
# sync-kb-to-personal.sh
# Syncs KB files from repo to personal testing directory

set -e

SOURCE_DIR="$(dirname "$0")/../release/v5.5/agents"
TARGET_DIR="${HOME}/Documents/MPA-Personal-KB"

echo "Syncing KB files to personal environment..."
echo "Source: $SOURCE_DIR"
echo "Target: $TARGET_DIR"

# Create target directories
mkdir -p "$TARGET_DIR/mpa"
mkdir -p "$TARGET_DIR/ca"
mkdir -p "$TARGET_DIR/eap"

# Sync MPA KB files
if [ -d "$SOURCE_DIR/mpa/base/kb" ]; then
  cp "$SOURCE_DIR/mpa/base/kb/"*.txt "$TARGET_DIR/mpa/" 2>/dev/null || true
  MPA_COUNT=$(ls -1 "$TARGET_DIR/mpa"/*.txt 2>/dev/null | wc -l)
  echo "MPA: $MPA_COUNT files synced"
else
  echo "MPA: Source directory not found"
fi

# Sync CA KB files
if [ -d "$SOURCE_DIR/ca/base/kb" ]; then
  cp "$SOURCE_DIR/ca/base/kb/"*.txt "$TARGET_DIR/ca/" 2>/dev/null || true
  CA_COUNT=$(ls -1 "$TARGET_DIR/ca"/*.txt 2>/dev/null | wc -l)
  echo "CA: $CA_COUNT files synced"
else
  echo "CA: Source directory not found"
fi

# Sync EAP KB files
if [ -d "$SOURCE_DIR/eap/base/kb" ]; then
  cp "$SOURCE_DIR/eap/base/kb/"*.txt "$TARGET_DIR/eap/" 2>/dev/null || true
  EAP_COUNT=$(ls -1 "$TARGET_DIR/eap"/*.txt 2>/dev/null | wc -l)
  echo "EAP: $EAP_COUNT files synced"
else
  echo "EAP: Source directory not found"
fi

echo ""
echo "Sync complete!"
echo "Total files: $((MPA_COUNT + CA_COUNT + EAP_COUNT))"
```

### B3: Update Environment Config

Update `/packages/agent-core/config/environment.personal.json`:

```json
{
  "environment": "personal",
  "platform": "claude",
  "rag": {
    "enabled": true,
    "embeddingProvider": "openai",
    "embeddingModel": "text-embedding-3-small",
    "vectorStore": "local",
    "vectorStorePath": "./kb-index",
    "topK": 5,
    "minScore": 0.7
  },
  "learning": {
    "selfCritique": {
      "enabled": true,
      "model": "claude-3-5-haiku-20241022"
    },
    "successPatterns": {
      "enabled": true,
      "storageBackend": "json",
      "storagePath": "./learning-outputs/patterns"
    },
    "kbEnhancement": {
      "enabled": true,
      "outputDirectory": "./learning-outputs/kb-suggestions"
    }
  },
  "kbPaths": {
    "mpa": "~/Documents/MPA-Personal-KB/mpa",
    "ca": "~/Documents/MPA-Personal-KB/ca",
    "eap": "~/Documents/MPA-Personal-KB/eap"
  }
}
```

### B4: Run Tests

```bash
# Ensure dependencies
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/packages/agent-core
npm install

# Build TypeScript
npx tsc

# Run tests (requires OPENAI_API_KEY and ANTHROPIC_API_KEY)
export OPENAI_API_KEY="your-key"
export ANTHROPIC_API_KEY="your-key"

npx ts-node src/tests/test-embeddings.ts
npx ts-node src/tests/test-retrieval.ts
npx ts-node src/tests/test-self-critique.ts
npx ts-node src/tests/test-success-patterns.ts
npx ts-node src/tests/test-kb-enhancement.ts
```

### B5: Commit Personal Changes

```bash
git add .
git commit -m "Phase 10B: Personal RAG and Learning tests - 5 test files, sync script, env config"
git push origin deploy/personal
```

---

## COMPLETION CHECKLIST

### Part A (Mastercard)
- [ ] Created mpa_feedback.json
- [ ] Created mpa_kb_usage.json
- [ ] Created mpa_success_patterns.json
- [ ] Created flow_12_MPA_CaptureFeedback.json
- [ ] Created flow_13_MPA_TrackKBUsage.json
- [ ] Created CA flows directory with init flow
- [ ] Created EAP flows directory with init flow
- [ ] Created deploy-learning-tables.ps1
- [ ] Created deploy-learning-flows.ps1
- [ ] Created COPILOT_TOPICS.md for MPA/CA/EAP
- [ ] Committed to deploy/mastercard

### Part B (Personal)
- [ ] Created test-embeddings.ts
- [ ] Created test-retrieval.ts
- [ ] Created test-self-critique.ts
- [ ] Created test-success-patterns.ts
- [ ] Created test-kb-enhancement.ts
- [ ] Created sync-kb-to-personal.sh
- [ ] Updated environment.personal.json
- [ ] All tests pass
- [ ] Committed to deploy/personal

---

Report completion of each step. Do NOT skip any steps.
