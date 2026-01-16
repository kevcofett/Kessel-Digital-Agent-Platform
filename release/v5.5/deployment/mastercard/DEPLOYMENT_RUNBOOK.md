# MASTERCARD DEPLOYMENT RUNBOOK
# Step-by-Step Deployment Instructions

## OVERVIEW

This runbook provides detailed instructions for deploying the agent platform to the Mastercard environment. Follow each section in order.

## 1. ENVIRONMENT SETUP

### 1.1 Load Environment Variables

```bash
# Navigate to deployment directory
cd /path/to/Kessel-Digital-Agent-Platform/release/v5.5/deployment/mastercard

# Copy template and fill in values
cp .env.mastercard.template .env

# Edit .env with actual values
# NEVER commit .env to source control

# Load environment variables
source .env
# Or on Windows:
# foreach ($line in Get-Content .env) { if ($line -match '^([^#].+?)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1], $matches[2]) } }
```

### 1.2 Validate Environment

```powershell
# Run validation script
./scripts/validate-environment.ps1

# Expected output:
# ✓ Azure AD authentication successful
# ✓ Dataverse connection verified
# ✓ SharePoint access confirmed
# ✓ Azure OpenAI endpoint accessible
```

## 2. DATAVERSE DEPLOYMENT

### 2.1 Import Solution

```powershell
# Install Power Platform CLI if not installed
winget install Microsoft.PowerPlatformCLI

# Authenticate to Power Platform
pac auth create --environment $env:DATAVERSE_ENVIRONMENT_URL

# Import solution
./scripts/deploy-dataverse.ps1
```

### 2.2 Verify Tables

After import, verify these tables exist in Dataverse:
- cr_agentsessions
- cr_kbdocuments
- cr_kbusagerecords
- cr_kbdocumentimpacts
- cr_kbupdateproposals
- cr_verticals
- cr_kpis
- cr_channels
- cr_benchmarks

### 2.3 Import Seed Data

```powershell
# Import reference data
pac data import --data ./seed-data/verticals.csv --target-table cr_verticals
pac data import --data ./seed-data/kpis.csv --target-table cr_kpis
pac data import --data ./seed-data/channels.csv --target-table cr_channels
pac data import --data ./seed-data/benchmarks.csv --target-table cr_benchmarks
```

## 3. SHAREPOINT DEPLOYMENT

### 3.1 Upload KB Documents

```powershell
# Run SharePoint deployment script
./scripts/deploy-sharepoint.ps1

# This will:
# - Connect to SharePoint site
# - Create folder structure
# - Upload all KB documents
# - Set metadata on documents
```

### 3.2 Verify Upload

Access SharePoint and verify:
- AgentKnowledgeBase library exists
- Folders created: MPA, CA, EAP
- All .txt files uploaded to correct folders
- Document count matches expected (MPA: 22+, CA: 35, EAP: 7)

## 4. POWER AUTOMATE DEPLOYMENT

### 4.1 Import Flows

```powershell
# Run flow deployment script
./scripts/deploy-flows.ps1

# This imports flows for:
# - Session initialization
# - KB retrieval
# - Response generation
# - Impact tracking
```

### 4.2 Update Connections

After import, manually update connections:
1. Open each flow in Power Automate
2. Update Dataverse connection to use correct environment
3. Update SharePoint connection to use correct site
4. Save and test each flow

### 4.3 Enable Flows

```powershell
# Enable all flows
pac flow enable --all
```

## 5. COPILOT STUDIO DEPLOYMENT

### 5.1 Create or Update Agent

```powershell
# Run Copilot Studio deployment
./scripts/deploy-copilot-studio.ps1

# This will:
# - Create agent if not exists
# - Update agent settings
# - Note: Instructions must be pasted manually
```

### 5.2 Configure Agent Instructions

1. Open Copilot Studio
2. Navigate to agent settings
3. Open Instructions section
4. Paste contents from appropriate file:
   - MPA: `agents/mpa/mastercard/instructions/MPA_Copilot_Instructions_PRODUCTION.txt`
   - CA: `agents/ca/mastercard/instructions/CA_Copilot_Instructions_PRODUCTION.txt`
   - EAP: `agents/eap/mastercard/instructions/EAP_Copilot_Instructions_PRODUCTION.txt`
5. Save changes

### 5.3 Configure KB Connection

1. In Copilot Studio, go to Knowledge section
2. Add SharePoint as knowledge source
3. Select AgentKnowledgeBase library
4. Configure search settings
5. Test KB retrieval

### 5.4 Connect Flows

1. Go to Actions section in Copilot Studio
2. Add Power Automate flows as actions
3. Map flow inputs/outputs to topics
4. Test each flow action

### 5.5 Publish Agent

1. Run test conversations in Copilot Studio
2. Verify all functionality works
3. Click Publish
4. Select deployment channels (Teams, Web, etc.)
5. Complete publishing

## 6. VALIDATION

### 6.1 End-to-End Test

Run test scenarios:

```
Test 1: Basic Greeting
Input: "Hello"
Expected: Agent responds with greeting and offers assistance

Test 2: KB Retrieval
Input: "What frameworks are available for strategic analysis?"
Expected: Agent retrieves and summarizes relevant frameworks from KB

Test 3: Session Tracking
Input: Start new conversation, make several requests
Expected: Session data saved to Dataverse

Test 4: Error Handling
Input: Invalid or ambiguous request
Expected: Agent handles gracefully with clarifying questions
```

### 6.2 Performance Check

Verify response times:
- Initial response: < 5 seconds
- KB retrieval: < 3 seconds
- Flow execution: < 10 seconds

### 6.3 Logging Verification

Check Dataverse tables for:
- New session records created
- KB usage records logged
- No error records

## 7. TROUBLESHOOTING

### Common Issues

**Authentication Failures**
```
Error: AADSTS700016 - Application not found
Solution: Verify client ID and ensure app is registered in correct tenant
```

**Dataverse Connection Errors**
```
Error: Cannot connect to Dataverse
Solution: Verify environment URL format (https://org.crm.dynamics.com)
         Check app has Dataverse permissions
```

**SharePoint Upload Failures**
```
Error: Access denied to SharePoint
Solution: Verify Sites.ReadWrite.All permission granted
         Check site URL is correct
```

**Flow Execution Errors**
```
Error: Flow failed with connection error
Solution: Re-authenticate connections in Power Automate
         Check connection credentials not expired
```

### Getting Help

1. Check Azure AD sign-in logs for auth issues
2. Check Power Automate run history for flow errors
3. Check Dataverse system jobs for import errors
4. Contact Mastercard IT support for network issues

## 8. MAINTENANCE

### Regular Tasks

Weekly:
- Review flow run history for errors
- Check Dataverse storage usage
- Monitor agent conversation logs

Monthly:
- Review KB document freshness
- Update benchmark data if needed
- Check for platform updates

Quarterly:
- Review and update agent instructions
- Performance tuning based on usage patterns
- Security review of connections and permissions
