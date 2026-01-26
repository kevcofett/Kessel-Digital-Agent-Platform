# MPA Test Automation Suite

Automated testing for Media Planning Agent using Power CAT Copilot Studio Kit.

## Overview

This suite enables automated behavioral testing of the MPA agent via the Copilot Studio Kit's Dataverse-based test framework. Tests validate response quality, source transparency, analytical proactivity, and workflow discipline.

## Files

| File | Description |
|------|-------------|
| `mpa_test_cases.json` | Test definitions - edit this to add/modify tests |
| `Import-MPA-Tests.ps1` | PowerShell import script (Windows/Mac/Linux) |
| `import_mpa_tests.py` | Python import script (cross-platform alternative) |
| `Agent_Behavioral_Guide.txt` | KB document with good/bad examples for SharePoint |

## Quick Start

### Option 1: PowerShell

```powershell
# Prerequisites
Install-Module Az -Scope CurrentUser
Connect-AzAccount

# Import tests
cd /path/to/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/tests
.\Import-MPA-Tests.ps1 -EnvironmentUrl "https://yourorg.crm.dynamics.com"

# With force replace existing
.\Import-MPA-Tests.ps1 -EnvironmentUrl "https://yourorg.crm.dynamics.com" -Force

# Dry run (preview without changes)
.\Import-MPA-Tests.ps1 -EnvironmentUrl "https://yourorg.crm.dynamics.com" -WhatIf
```

### Option 2: Python

```bash
# Prerequisites
pip install msal requests

# Import tests
cd /path/to/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/tests
python import_mpa_tests.py --env https://yourorg.crm.dynamics.com

# With force replace existing
python import_mpa_tests.py --env https://yourorg.crm.dynamics.com --force

# Dry run
python import_mpa_tests.py --env https://yourorg.crm.dynamics.com --dry-run
```

## Test Case Format

Edit `mpa_test_cases.json` to add or modify tests:

```json
{
  "testCases": [
    {
      "id": "MPA-011",
      "name": "New Test Name",
      "category": "Analytics|Tone|Workflow|Citations|Efficiency|Clarity",
      "testType": "Generative Answers",
      "utterance": "What the user says to the agent",
      "expectedBehavior": "Detailed description of expected agent behavior for AI evaluation",
      "passCriteria": "Brief summary of what passes"
    }
  ]
}
```

### Test Types

| Type | Use Case | Evaluation Method |
|------|----------|-------------------|
| `Response Match` | Exact or partial text matching | String comparison |
| `Generative Answers` | AI-evaluated behavioral criteria | AI Builder prompt |
| `Topic Match` | Verify correct topic triggered | Dataverse enrichment |
| `Multi-turn` | Multi-message conversation flow | Sequential execution |

For MPA behavioral testing, use `Generative Answers` - it allows natural language criteria instead of exact matching.

## Agent Configuration in Kit

Before running tests, ensure your Agent Configuration has:

1. **Token Endpoint** - From Copilot Studio > Settings > Advanced > Metadata
2. **User Authentication** - Set to "No Authentication" for automated testing
3. **Analyze Generated Answers** - Toggle ON (required for Generative Answers tests)

## Running Tests

After import:

1. Open **Power CAT Copilot Studio Kit**
2. Go to **Test Runs** > **+ New**
3. Select your **Agent Configuration**
4. Select **Test Set**: "MPA Core Behaviors"
5. Click **Run**

## Test Categories

| Category | What It Tests |
|----------|---------------|
| **Tone** | Warm opening, professional demeanor |
| **Analytics** | CAC calculation, benchmark comparison, feasibility |
| **Citations** | Source transparency (KB/web/estimate labeling) |
| **Efficiency** | Response conciseness, no redundant questions |
| **Workflow** | Step boundaries, proper sequencing |
| **Clarity** | Acronym definitions, clear explanations |

## Scoring Rubric

Tests are evaluated on 5 dimensions:

| Dimension | Weight | Criteria |
|-----------|--------|----------|
| Source Transparency | 25% | Agent cites KB, web, or labels estimates clearly |
| Response Efficiency | 20% | Responses are concise, no redundant repetition |
| Analytical Proactivity | 25% | Agent calculates when data allows |
| Step Discipline | 20% | Agent maintains workflow boundaries |
| Tone Quality | 10% | Warm, professional, not robotic |

Scale: 0 = Does not meet, 1 = Partially meets, 2 = Fully meets

## Adding New Test Suites

Create a new JSON file following the same structure:

```bash
# Import custom test file
.\Import-MPA-Tests.ps1 -EnvironmentUrl "https://yourorg.crm.dynamics.com" -TestFile "my_custom_tests.json"
```

## Troubleshooting

### Authentication Errors
- Ensure `Connect-AzAccount` completed successfully
- Verify you have access to the Dataverse environment
- Check that your user has System Administrator or Copilot Studio Kit roles

### Test Set Already Exists
- Use `-Force` flag to replace existing test set
- Or delete manually in Kit UI under Test Sets

### Tests Not Running
- Verify Agent Configuration has correct Token Endpoint
- Ensure "No Authentication" is set for automated testing
- Enable "Analyze Generated Answers" toggle

### AI Builder Errors
- Ensure AI Builder is enabled in your environment
- Check AI Builder credit availability
- Verify AI Builder connection reference in Kit solution

## Environment URLs

Find your environment URL:
1. Go to make.powerapps.com
2. Select your environment
3. Click Settings (gear icon) > Session details
4. Copy the "Instance url" value

Example: `https://org12345.crm.dynamics.com`
