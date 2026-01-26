# MPA Copilot Studio Integration

This folder contains the configuration files needed to integrate the 11 MPA Power Automate flows as actions in Microsoft Copilot Studio.

## Files

- **flow_actions.json** - Complete action definitions for all 11 MPA flows with input/output schemas

## Prerequisites

1. All 11 MPA Power Automate flows deployed and activated in your environment
2. Access to Copilot Studio with permissions to add custom actions
3. The MPA agent created in Copilot Studio

## How to Import Actions into Copilot Studio

### Option 1: Manual Configuration (Recommended)

1. **Open Copilot Studio** and navigate to your MPA agent
2. Go to **Topics** → **Actions** → **Add an action**
3. Select **Power Automate flow** as the action type
4. For each flow, configure:
   - **Display Name**: Use the `displayName` from flow_actions.json
   - **Description**: Use the `description` from flow_actions.json
   - **Flow**: Select the corresponding flow from your environment
   - **Input Parameters**: Configure based on `inputSchema`
   - **Output Parameters**: Configure based on `outputSchema`

### Option 2: Using Power Platform CLI

```bash
# Export existing agent
pac copilot export --name "Media Planning Agent" --path ./export

# Modify the agent definition to include actions
# Then reimport
pac copilot import --path ./export
```

## Flow Actions Reference

### 1. Initialize Session
- **Flow**: MPA Initialize Session
- **Purpose**: Starts a new planning session
- **Required Inputs**: `user_id`, `client_id`
- **Key Output**: `session_id`

### 2. Create Plan
- **Flow**: MPA Create Plan
- **Purpose**: Creates a new media plan
- **Required Inputs**: `client_id`, `campaign_name`, `user_id`
- **Key Outputs**: `plan_id`, `plan_code`, `version_id`

### 3. Save Section
- **Flow**: MPA Save Section
- **Purpose**: Saves a section of the plan (objectives, audience, channels, etc.)
- **Required Inputs**: `plan_id`, `section_type`, `section_data`
- **Key Output**: `section_id`

### 4. Validate Plan
- **Flow**: MPA Validate Plan
- **Purpose**: Validates current step before advancing
- **Required Inputs**: `plan_id`
- **Key Outputs**: `is_valid`, `validation_errors`

### 5. Generate Document
- **Flow**: MPA Generate Document
- **Purpose**: Generates plan documents (summary, presentation, etc.)
- **Required Inputs**: `plan_id`, `document_type`
- **Key Outputs**: `document_id`, `content`

### 6. Search Benchmarks
- **Flow**: MPA Search Benchmarks
- **Purpose**: Searches industry benchmarks by vertical, channel, KPI
- **Optional Inputs**: `vertical`, `channel`, `kpi_type`, `limit`
- **Key Output**: `results` (array of benchmarks)

### 7. Search Channels
- **Flow**: MPA Search Channels
- **Purpose**: Searches available media channels
- **Optional Inputs**: `category`, `search_term`, `limit`
- **Key Output**: `results` (array of channels)

### 8. Import Performance
- **Flow**: MPA Import Performance
- **Purpose**: Imports campaign performance data
- **Required Inputs**: `plan_id`, `performance_data`
- **Key Output**: `records_imported`

### 9. Create PostMortem
- **Flow**: MPA Create PostMortem
- **Purpose**: Creates post-campaign analysis report
- **Required Inputs**: `plan_id`, `report_title`
- **Key Output**: `report_id`

### 10. Promote Learning
- **Flow**: MPA Promote Learning
- **Purpose**: Promotes plan learning to shared library
- **Required Inputs**: `learning_id`
- **Key Output**: `shared_learning_id`

### 11. Process Media Brief
- **Flow**: MPA Process Media Brief
- **Purpose**: Processes incoming brief to create pre-filled plan
- **Required Inputs**: `client_id`, `campaign_name`, `user_id`
- **Key Outputs**: `plan_id`, `plan_code`, `session_id`

## Copilot Studio Action Configuration Tips

### Input Parameters

When configuring inputs in Copilot Studio:

1. **Required vs Optional**: Mark parameters as required based on the `required` array in the schema
2. **Types**: Map JSON types to Copilot Studio types:
   - `string` → Text
   - `integer` / `number` → Number
   - `boolean` → Yes/No
   - `object` → JSON (use adaptive card or structured input)
   - `array` → Multi-value or JSON

3. **Enums**: For fields with enum values, configure as choice/option set

### Output Handling

1. **Status Check**: Always check the `status` field first
2. **Error Handling**: If status is "Error", display the `message` field to user
3. **ID Capture**: Store returned IDs (plan_id, session_id, etc.) for subsequent calls

### Example Topic Flow

```
User: "Create a new media plan for ABC Company"

1. Call CreatePlan action
   - client_id: [lookup or ask]
   - campaign_name: [extract from utterance or ask]
   - user_id: [from context]

2. Check response status

3. If success:
   - Store plan_id in conversation variable
   - Respond: "Created plan {plan_code}. What's the primary objective?"

4. If error:
   - Respond: "I couldn't create the plan: {message}"
```

## Authentication

The flows use SAS token authentication (sig= parameter in URL). No additional Bearer tokens needed when calling from Copilot Studio as long as:

1. The flows are in the same environment as the Copilot
2. The connection references are properly configured
3. The invoking user has appropriate Dataverse permissions

## Testing

Test each action in Copilot Studio's test panel before publishing:

1. Open the agent in Copilot Studio
2. Click **Test your agent**
3. Type a phrase that should trigger the action
4. Verify the flow is called and response is handled correctly

## Troubleshooting

### Action not appearing
- Verify the flow is activated in Power Automate
- Check the flow has an HTTP trigger
- Ensure you have permissions to the flow

### 401/403 errors
- Check connection reference authentication
- Verify user has Dataverse table permissions

### 502/504 errors
- Flow may have runtime errors
- Check flow run history in Power Automate for details

### Empty responses
- Verify the Response action is configured in the flow
- Check flow completed successfully (not just started)

## Flow Endpoints

The current flow trigger URLs are stored in:
- `/scripts/powerautomate/flow_endpoints.json`

If flows are redeployed, update the URLs in flow_actions.json accordingly.
