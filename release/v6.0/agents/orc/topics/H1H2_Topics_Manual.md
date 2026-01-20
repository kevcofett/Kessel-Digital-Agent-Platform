# MPA v6.1 Copilot Studio Topic Definitions - H1+H2

These topic definitions should be created in Copilot Studio for the ORC agent to enable H1+H2 functionality.

## Navigation

1. Go to: https://copilotstudio.microsoft.com
2. Select Environment: **Aragorn AI**
3. Open Agent: **Media Planning Agent** (or ORC agent)
4. Navigate to: Topics

---

## Topic 1: System.Greeting (Update Existing)

**Purpose:** Initialize memory system at conversation start

### Update the Existing Greeting Topic

Add the following actions to the beginning of the greeting topic:

```yaml
Name: System.Greeting
Trigger: OnConversationStart

Actions:
  1. Call MPA_Memory_Initialize flow
     Inputs:
       - user_id: System.User.Id
       - session_id: System.Conversation.Id

  2. Set Global Variables:
     - Global.UserPreferences = response.preferences_json
     - Global.SessionContext = response.context_json
     - Global.CanResume = response.session_resume_available
     - Global.LastSessionSummary = response.last_session_summary

  3. Condition: Check if Global.CanResume = true

     If YES:
       Message: "Welcome back! Based on our previous conversation, I can see you were working on {Global.LastSessionSummary}. Would you like to continue where we left off?"

       Question: Resume previous session?
       Options:
         - Yes, continue
         - No, start fresh

       If "Yes, continue":
         Message: "Great! Let me bring up your previous context..."
         [Apply session context]

       If "No, start fresh":
         Message: "No problem. How can I help you today?"

     If NO:
       Condition: Check if Global.UserPreferences is not empty

       If has preferences:
         Message: "Hello! I remember you typically work on {preference.vertical} campaigns. How can I help you today?"

       If no preferences:
         Message: "Hello! I'm your Media Planning Agent. I can help you with campaign strategy, budget optimization, audience targeting, and much more. What would you like to work on today?"
```

---

## Topic 2: CollaborativeWorkflow (New)

**Purpose:** Trigger collaborative multi-agent workflows

### Topic Configuration

```yaml
Name: CollaborativeWorkflow
Display Name: Start Collaborative Workflow

Trigger Phrases:
  - "complete media plan"
  - "full media plan"
  - "full campaign strategy"
  - "build me a plan"
  - "comprehensive media plan"
  - "end to end plan"
  - "optimize my budget"
  - "best budget allocation"
  - "optimize budget across channels"
  - "which channels for my audience"
  - "channel recommendations for"
  - "how should I measure"
  - "measurement strategy"
  - "analyze this campaign"
  - "full campaign analysis"
  - "post-mortem analysis"
```

### Actions

```yaml
Actions:
  1. Parse Trigger Phrase to Determine Workflow
     Set Variable: WorkflowCode based on trigger:
       - "media plan", "campaign strategy", "build plan" -> "FULL_MEDIA_PLAN"
       - "optimize budget", "budget allocation" -> "BUDGET_OPTIMIZATION"
       - "channels for audience", "channel recommendation" -> "AUDIENCE_CHANNEL_FIT"
       - "measurement", "how should I measure" -> "MEASUREMENT_STRATEGY"
       - "analyze campaign", "post-mortem" -> "CAMPAIGN_ANALYSIS"

  2. Get Workflow Definition
     Call Dataverse: List rows from eap_workflow_definition
     Filter: eap_workflow_code eq '{WorkflowCode}'
     Store: WorkflowDefinition

  3. Confirm with User
     Message: "I'll coordinate with multiple specialist agents to give you a comprehensive {WorkflowDefinition.eap_workflow_name}."

     If WorkflowDefinition.eap_estimated_duration_seconds > 30:
       Message: "This analysis typically involves {agent_count} specialists and may take a moment."

     Question: "Would you like me to proceed?"
     Options:
       - Yes, proceed
       - Tell me more first
       - No, I have a specific question instead

  4. If "Yes, proceed":
     Message: "Starting collaborative analysis..."

     Call MPA_Workflow_Orchestrate flow
     Inputs:
       - session_id: System.Conversation.Id
       - user_id: System.User.Id
       - workflow_code: {WorkflowCode}
       - original_request: {System.LastMessage.Text}
       - context_json: {Global.SessionContext}

     Wait for response

     Display Synthesized Response:
       Message: "{response.synthesized_response}"

       If response.confidence_overall >= 80:
         Message: "Confidence: HIGH - Our specialists are well-aligned on this recommendation."
       Else if response.confidence_overall >= 60:
         Message: "Confidence: MEDIUM - Some aspects have more certainty than others."
       Else:
         Message: "Confidence: MODERATE - You may want to explore specific areas further."

     Follow-up Question:
       "Would you like me to explain any specific aspect in more detail, or dive into a particular specialist's analysis?"

  5. If "Tell me more first":
     Message: "This {WorkflowDefinition.eap_workflow_name} workflow will:"

     For each agent in WorkflowDefinition.eap_agent_sequence_json:
       - ANL: "Analyze budget optimization and projections"
       - AUD: "Evaluate audience targeting strategy"
       - CHA: "Recommend channel mix and allocation"
       - PRF: "Design measurement framework"
       - DOC: "Synthesize into a cohesive recommendation"

     Message: "The result will be a unified recommendation that combines insights from all relevant specialists."

     Question: "Would you like to proceed with this analysis?"
     Loop back to step 3 options

  6. If "No, specific question":
     Message: "No problem! What specific question can I help you with?"
     Redirect to main topic
```

---

## Topic 3: FileUpload (New)

**Purpose:** Handle file uploads and data extraction

### Topic Configuration

```yaml
Name: FileUpload
Display Name: Handle File Upload

Trigger Phrases:
  - "I have a file"
  - "Here's my data"
  - "I'm uploading"
  - "Can you analyze this file"
  - "Process this spreadsheet"
  - "Look at this document"
  - "I have a CSV"
  - "Here's my Excel file"
  - "I have a PDF"
  - "Analyze this data"
```

### Actions

```yaml
Actions:
  1. Acknowledge Upload
     Message: "I can help you analyze uploaded files. Please share your file and I'll extract the relevant data for our planning session."

     Note: Copilot Studio file upload capability required

  2. Detect File Type
     If file extension is .csv:
       Set FileType = "csv"
     Else if file extension is .xlsx or .xls:
       Set FileType = "xlsx"
     Else if file extension is .pdf:
       Set FileType = "pdf"
     Else:
       Message: "I can currently analyze CSV, Excel (.xlsx), and PDF files. The file you shared appears to be a different format. Could you provide one of these supported formats?"
       End topic

  3. Process File
     Message: "Analyzing your {FileType} file..."

     Call MPA_File_Process flow
     Inputs:
       - session_id: System.Conversation.Id
       - file_content: {file_content or extracted_text}
       - file_type: {FileType}
       - file_name: {file_name}

     Wait for response

  4. Present Extraction Summary
     Message: "{response.extraction_summary}"

     If response.extracted_data contains budget:
       Message: "I found budget information: {budget_summary}"

     If response.extracted_data contains channels:
       Message: "I identified these channels: {channels_list}"

     If response.extracted_data contains metrics:
       Message: "I extracted these metrics: {metrics_summary}"

  5. Handle Clarifications
     If response.clarifications_needed is not empty:
       For each clarification:
         Question: "{clarification.question}"
         Store user response
         Update extracted data

  6. Confirm Data Usage
     Message: "I've extracted {field_count} data points from your file."

     Question: "Would you like me to use this data in our current planning session?"
     Options:
       - Yes, apply this data
       - Show me what was extracted first
       - No, just save for later

  7. If "Yes, apply":
     Store extracted data in session context
     Message: "Great! I've integrated the data from your file. {relevant_application_summary}"

     If in active workflow step:
       Message: "This data helps inform {current_step}. Would you like to continue with that step?"

  8. If "Show me first":
     Display detailed extraction:
       - Column mappings
       - Sample values
       - Data quality assessment

     Then return to confirmation question

  9. If "Save for later":
     Store in session memory with lower priority
     Message: "I've saved the data for reference. Just let me know when you'd like to use it."
```

---

## Topic 4: ProactiveTriggerResponse (New - Background)

**Purpose:** Handle user responses to proactive trigger messages

### Topic Configuration

```yaml
Name: ProactiveTriggerResponse
Display Name: Respond to Proactive Insight

Trigger Phrases:
  - "Tell me more about that"
  - "What do you mean by"
  - "Explain that alert"
  - "Why did you mention"
  - "What's the saturation warning"
  - "Explain the benchmark variance"
  - "What measurement gap"
```

### Actions

```yaml
Actions:
  1. Identify Which Trigger
     Check Global.LastTriggerFired for recent trigger

  2. If ANL trigger (saturation, low confidence):
     Route to ANL agent with trigger context
     Message: "Let me have our analytics specialist explain this further..."

  3. If CHA trigger (benchmark variance, emerging opportunity):
     Route to CHA agent with trigger context
     Message: "Our channel specialist can give you more detail on this..."

  4. If PRF trigger (attribution, measurement gap):
     Route to PRF agent with trigger context
     Message: "Let me get our measurement specialist to elaborate..."

  5. If AUD trigger (segment overlap, LTV opportunity):
     Route to AUD agent with trigger context
     Message: "Our audience specialist can explain this insight..."

  6. Record Engagement
     Update eap_trigger_history:
       - eap_user_response: "engaged"

  7. After specialist response:
     Question: "Would you like to address this now, or continue with your current task?"
```

---

## Topic 5: MemoryLearnPattern (Background Topic)

**Purpose:** Learn patterns from user behavior (runs periodically)

### Topic Configuration

```yaml
Name: MemoryLearnPattern
Display Name: Learn User Patterns
Type: Background / Scheduled

Trigger: After every 5 substantive exchanges OR at session end
```

### Actions

```yaml
Actions:
  1. Gather Session History
     Collect last 10 meaningful exchanges
     Include: Questions asked, options selected, specialists used

  2. Call MEM_LEARN_PATTERN prompt (via flow or direct)
     Inputs:
       - user_id: System.User.Id
       - session_history_json: {formatted_history}
       - existing_patterns_json: {Global.UserPreferences.learned_patterns_json}

  3. If Patterns Identified with confidence >= 60:
     Store in mpa_user_preferences.learned_patterns_json

  4. Update Communication Style if suggested:
     Update mpa_user_preferences.communication_style

  5. Log learning event (for analytics)
```

---

## Integration Notes

### Adding Topics to Agent

1. Create each topic in Copilot Studio
2. Connect flows to topics via "Call an action"
3. Test each topic independently
4. Enable topics in agent configuration

### Variable Configuration

Global variables needed:
- Global.UserPreferences (Object)
- Global.SessionContext (Object)
- Global.CanResume (Boolean)
- Global.LastSessionSummary (Text)
- Global.LastTriggerFired (Object)
- Global.CurrentWorkflowId (Text)

### Flow Connections

Each topic needs these flows connected:
- System.Greeting -> MPA_Memory_Initialize
- CollaborativeWorkflow -> MPA_Workflow_Orchestrate
- FileUpload -> MPA_File_Process
- ProactiveTriggerResponse -> (routes to specialists)
- MemoryLearnPattern -> MPA_Memory_Store

### Testing Checklist

- [ ] Greeting with new user shows generic welcome
- [ ] Greeting with returning user offers resume
- [ ] "Build me a complete media plan" triggers FULL_MEDIA_PLAN workflow
- [ ] File upload processes CSV correctly
- [ ] File upload processes Excel correctly
- [ ] File upload processes PDF correctly
- [ ] Proactive triggers appear at appropriate times
- [ ] User preferences are remembered across sessions
