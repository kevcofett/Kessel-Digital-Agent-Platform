# Media Planning Agent - Copilot Studio Setup Guide

## Environment Details

- **Environment**: Aragorn AI
- **Dataverse URL**: https://aragornai.crm.dynamics.com
- **Power Automate URL**: https://make.powerautomate.com/environments/Default-{tenant-id}/flows

## Prerequisites

Before setting up the Copilot Studio agent:

1. All 44 Dataverse tables deployed (completed)
2. Reference data seeded (completed)
3. Power Automate flows activated (see below)

## Step 1: Activate Power Automate Flows

The flows are deployed but need manual activation to configure connections.

### Navigate to Power Automate

1. Go to [Power Automate](https://make.powerautomate.com)
2. Select **Aragorn AI** environment from the environment picker (top right)
3. Click **My flows** in the left navigation

### Activate Each Flow

For each flow starting with `flow_`:

1. Click on the flow name to open it
2. Click **Edit**
3. You'll see a prompt to configure connections - click **Sign in** for the Dataverse connector
4. Once connected, click **Save**
5. Click the back arrow, then click **Turn on**

### Flows to Activate

**EAP Shared Flows (01-04):**
- `flow_01_shared_initialize_session` - Creates session records
- `flow_02_shared_record_exchange` - Logs conversation exchanges
- `flow_03_shared_create_output` - Records generated documents
- `flow_04_shared_end_session` - Closes sessions

**MPA Flows (60-69):**
- `flow_60_mpa_initialize_session` - MPA-specific session setup
- `flow_61_mpa_create_plan` - Creates new media plans
- `flow_62_mpa_save_section` - Saves plan sections
- `flow_63_mpa_validate_plan` - Validates plan completeness
- `flow_64_mpa_generate_document` - Triggers document generation
- `flow_65_mpa_search_benchmarks` - Searches industry benchmarks
- `flow_66_mpa_search_channels` - Searches available channels
- `flow_67_mpa_import_performance` - Imports performance data
- `flow_68_mpa_create_postmortem` - Creates post-mortem reports
- `flow_69_mpa_promote_learning` - Promotes learnings to shared repository

## Step 2: Create Copilot Studio Agent

### Navigate to Copilot Studio

1. Go to [Copilot Studio](https://copilotstudio.microsoft.com)
2. Select **Aragorn AI** environment
3. Click **Create** > **New agent**

### Configure Agent Basics

| Setting | Value |
|---------|-------|
| Name | Media Planning Agent |
| Description | AI-powered assistant for creating comprehensive media plans |
| Primary language | English (US) |
| Solution | Default or create new "MediaPlanningAgent" |

### Add Knowledge Sources

1. In the agent settings, go to **Knowledge**
2. Add Dataverse tables as knowledge sources:
   - `mpa_channel` - For channel recommendations
   - `mpa_benchmark` - For industry benchmarks
   - `mpa_adpartner` - For ad partner information

### Create Topics

Create the following topics to handle user intents:

#### Topic: Start New Plan
- **Trigger phrases**: "create a media plan", "new plan", "start planning"
- **Actions**: Call `flow_01_shared_initialize_session`, then `flow_60_mpa_initialize_session`

#### Topic: Search Channels
- **Trigger phrases**: "what channels", "recommend channels", "channel options"
- **Actions**: Call `flow_66_mpa_search_channels`

#### Topic: Get Benchmarks
- **Trigger phrases**: "industry benchmarks", "what's a good CTR", "benchmark data"
- **Actions**: Call `flow_65_mpa_search_benchmarks`

#### Topic: Save Progress
- **Trigger phrases**: "save", "save my plan", "keep this"
- **Actions**: Call `flow_62_mpa_save_section`

#### Topic: Generate Document
- **Trigger phrases**: "create document", "export plan", "generate report"
- **Actions**: Call `flow_64_mpa_generate_document`

### Configure Actions (Flow Connections)

For each topic that calls a flow:

1. Add an **Action** node
2. Select **Call a flow**
3. Choose the appropriate flow from the list
4. Map input parameters from conversation variables
5. Store output in conversation variables for response

### Test the Agent

1. Click **Test** in the top right
2. Try these test phrases:
   - "I want to create a new media plan"
   - "What channels should I use for a B2B campaign?"
   - "What's the benchmark CTR for retail paid search?"

### Publish

1. Click **Publish** when ready
2. Choose deployment channels:
   - Microsoft Teams
   - Web chat
   - Custom website embed

## Step 3: Configure Security

### Dataverse Security Roles

Ensure the agent's service principal has appropriate access:

1. Go to [Power Platform Admin Center](https://admin.powerplatform.microsoft.com)
2. Select Aragorn AI environment
3. Go to **Settings** > **Users + permissions** > **Security roles**
4. Assign appropriate roles to the Copilot Studio application user

### Recommended Roles

| Role | Access Level |
|------|-------------|
| Basic User | Read access to reference tables |
| Custom MPA Role | Create/Read/Write for session and plan tables |

## Troubleshooting

### Flows Not Appearing in Copilot Studio

- Ensure flows are activated (turned on)
- Flows must have HTTP trigger (Request trigger) to be callable
- Check that you're in the correct environment

### Connection Errors

- Re-authenticate Dataverse connection in Power Automate
- Verify the connection is shared with the Copilot Studio application

### Missing Data in Responses

- Verify reference data was seeded correctly
- Check table permissions for the agent's user context

## Next Steps

1. Customize conversation flows based on user feedback
2. Add more sophisticated validation logic
3. Implement document generation integration
4. Set up SharePoint knowledge base connection
5. Configure analytics and monitoring
