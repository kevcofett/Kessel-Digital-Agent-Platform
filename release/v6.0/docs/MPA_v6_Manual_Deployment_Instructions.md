# MPA v6.0 MANUAL DEPLOYMENT INSTRUCTIONS

**Version:** 2.0  
**Date:** January 22, 2026  
**Purpose:** Complete manual configuration for Copilot Studio  
**Environment:** Mastercard and Personal (Aragorn AI)

---

## EXECUTIVE SUMMARY

This document provides step-by-step instructions for manual configuration tasks that cannot be automated, including AI settings, KB sanitization, and validation testing.

---

## PART 1: GIT PUSH STATUS ✅

The following files have been pushed to all branches:

| Branch | Status | Commit |
|--------|--------|--------|
| deploy/mastercard | ✅ Pushed | a27c5a2d |
| deploy/personal | ✅ Pushed | cfe3758b |
| main | ✅ Pushed | 796eda43 |

**Files Added:**
```
release/v6.0/agents/orc/instructions/ORC_Copilot_Instructions_v3.txt
release/v6.0/agents/aud/instructions/AUD_Copilot_Instructions_v2.txt
release/v6.0/scripts/sanitize_kb_files.py
release/v6.0/docs/MPA_v6_Agent_Configuration_Reference.md
```

---

## PART 2: COMPLETE AGENT SETTINGS (ALL 10 AGENTS)

### 2.1 Master Settings Table

**Configure these settings for EVERY agent in Copilot Studio UI:**

| Agent | Model | Web Search | General Knowledge | Deep Reasoning | Moderation |
|-------|-------|------------|-------------------|----------------|------------|
| **ORC** | Claude Sonnet 4.5 | OFF | OFF | OFF | Medium |
| **AUD** | Claude Sonnet 4.5 | ON | OFF | OFF | Medium |
| **CHA** | Claude Sonnet 4.5 | ON | OFF | OFF | Medium |
| **ANL** | Claude Opus 4.5 | OFF | OFF | ON | Medium |
| **SPO** | Claude Opus 4.5 | ON | OFF | ON | Medium |
| **DOC** | Claude Sonnet 4.5 | OFF | OFF | OFF | Medium |
| **PRF** | Claude Opus 4.5 | ON | OFF | ON | Medium |
| **CHG** | Claude Sonnet 4.5 | OFF | OFF | OFF | Medium |
| **CST** | Claude Sonnet 4.5 | OFF | OFF | OFF | Medium |
| **MKT** | Claude Sonnet 4.5 | ON | OFF | OFF | Medium |

### 2.2 Settings Location in UI

| Setting | Where to Find It |
|---------|------------------|
| **Model** | Settings → AI capabilities → Model selection dropdown |
| **Web Search** | Overview tab toggle OR Settings → Knowledge → "Use information from web" |
| **General Knowledge** | Settings → Knowledge → "Use general knowledge" |
| **Deep Reasoning** | Settings → AI capabilities → Deep reasoning toggle |
| **Content Moderation** | Settings → AI capabilities → Moderation level |
| **Generative AI Orchestration** | Settings → Orchestration (ORC only: set to ON/Dynamic) |

### 2.3 Critical Rules

| Rule | Applies To | Why |
|------|------------|-----|
| **General Knowledge = OFF** | ALL 10 agents | Prevents "based on general industry knowledge" responses |
| **Web Search = Selective** | See table | Only agents needing current market data |
| **Deep Reasoning = Selective** | ANL, SPO, PRF only | Complex calculations need it; others should be concise |

---

## PART 3: STEP-BY-STEP CONFIGURATION

### 3.1 Open Copilot Studio

1. Navigate to: `https://copilotstudio.microsoft.com`
2. Select the **Mastercard environment** from the top-right dropdown
3. Click **Copilots** in the left navigation

### 3.2 For EACH Agent, Complete These Steps

#### Step A: Update Instructions

1. Click on the agent name to open it
2. Go to **Overview** tab
3. Scroll to **Instructions** section
4. **Delete all existing text**
5. Copy/paste from the appropriate instruction file:
   - ORC: `ORC_Copilot_Instructions_v3.txt`
   - AUD: `AUD_Copilot_Instructions_v2.txt`
   - Others: Current v1.txt files
6. Click **Save**

#### Step B: Configure AI Settings

1. Click **Settings** (gear icon)
2. Navigate to **AI capabilities** section
3. Set **Model** per table above
4. Set **Deep Reasoning** per table above
5. Set **Content Moderation** to Medium
6. Click **Save**

#### Step C: Configure Knowledge Settings

1. Still in Settings, navigate to **Knowledge** section
2. Set **Use general knowledge** → **OFF**
3. Set **Use information from web** per table above
4. Click **Save**

#### Step D: Configure Web Search (Overview)

1. Go back to **Overview** tab
2. Find the **Web Search** toggle
3. Set per table above
4. Click **Save**

#### Step E: Publish

1. Click **Publish** button (top right)
2. Wait for publishing to complete
3. Verify no errors

### 3.3 Quick Reference by Agent

**ORC (Orchestrator)**
- Model: Sonnet | Web: OFF | General: OFF | Deep: OFF

**AUD (Audience)**
- Model: Sonnet | Web: ON | General: OFF | Deep: OFF

**CHA (Channel)**
- Model: Sonnet | Web: ON | General: OFF | Deep: OFF

**ANL (Analytics)**
- Model: Opus | Web: OFF | General: OFF | Deep: ON

**SPO (Supply Path)**
- Model: Opus | Web: ON | General: OFF | Deep: ON

**DOC (Document)**
- Model: Sonnet | Web: OFF | General: OFF | Deep: OFF

**PRF (Performance)**
- Model: Opus | Web: ON | General: OFF | Deep: ON

**CHG (Change)**
- Model: Sonnet | Web: OFF | General: OFF | Deep: OFF

**CST (Customer Strategy)**
- Model: Sonnet | Web: OFF | General: OFF | Deep: OFF

**MKT (Marketing)**
- Model: Sonnet | Web: ON | General: OFF | Deep: OFF

---

## PART 4: KB SANITIZATION SCRIPT

**⚠️ This script runs on YOUR LOCAL MACHINE (Mac), not in Copilot Studio.**

### 4.1 What It Does

Scans all `.txt` KB files and:
1. Replaces non-ASCII characters (em-dashes, curly quotes, etc.) with ASCII equivalents
2. Creates backup files before modification
3. Reports all changes made

### 4.2 Step-by-Step Instructions

#### Step 4.2.1: Open Terminal

1. Press `Cmd + Space`
2. Type `Terminal`
3. Press Enter

#### Step 4.2.2: Navigate to Repository

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
```

#### Step 4.2.3: Dry Run First

**Always run dry-run first to see what would change:**

```bash
# Check ALL agent KB files
python3 release/v6.0/scripts/sanitize_kb_files.py release/v6.0/agents --dry-run

# Check EAP platform KB files
python3 release/v6.0/scripts/sanitize_kb_files.py release/v6.0/platform/eap/kb --dry-run
```

#### Step 4.2.4: Apply Fixes

**After reviewing dry-run output:**

```bash
# Fix ALL KB files (creates .bak backups)
python3 release/v6.0/scripts/sanitize_kb_files.py release/v6.0/agents

# Fix EAP platform KB
python3 release/v6.0/scripts/sanitize_kb_files.py release/v6.0/platform/eap/kb
```

#### Step 4.2.5: Commit and Push

```bash
git add .
git commit -m "fix(kb): Sanitize non-ASCII characters in KB files"
git push origin deploy/mastercard
```

#### Step 4.2.6: Upload to SharePoint

After sanitizing locally:
1. Navigate to the SharePoint KB location for Mastercard
2. Upload the sanitized `.txt` files (NOT the `.bak` backup files)
3. Verify they appear in Copilot Studio Knowledge sources

---

## PART 5: VALIDATION TEST

### 5.1 Test Input

After completing all configuration, test ORC with:

```
help me create a media plan for Nike. They have $250,000 to acquire new customers. They are targeting runners in the US
```

### 5.2 Expected Behavior

| Criteria | Expected |
|----------|----------|
| Response length | Under 300 words |
| Format | Prose paragraphs, NO bullet points |
| Behavior | Asks clarifying questions (timeline, KPIs) |
| Routing | Does NOT auto-route to specialists |
| Ending | Question inviting user input |

### 5.3 Expected Response Pattern

```
Thanks for that context. I understand you're creating a media plan for 
Nike targeting runners in the US with a $250,000 budget focused on 
customer acquisition.

Before I connect with our specialists, a few quick questions to make 
sure we optimize your plan.

What's your campaign timeline - when does this need to launch and how 
long will it run?
```

### 5.4 Red Flags (Test FAILS)

- ❌ Multi-agent execution plan created immediately
- ❌ 4,000+ word response with bullet points
- ❌ "Based on general industry knowledge" statements
- ❌ Character encoding artifacts (â€", â€™)
- ❌ No clarifying questions asked
- ❌ Specialists invoked without user approval

---

## PART 6: TROUBLESHOOTING

### Issue: Setting not visible

**Solution:** May be under Advanced Settings or require admin permissions. Check with Mastercard IT.

### Issue: Instructions not saving

**Solution:** Check character count - must be under 8,000 characters.

### Issue: Script won't run

**Solution:**
```bash
python3 --version  # Verify Python 3 is installed
chmod +x release/v6.0/scripts/sanitize_kb_files.py  # Make executable
```

### Issue: KB changes not reflected

**Solution:**
1. Verify files uploaded to correct SharePoint location
2. Wait 5-10 minutes for indexing
3. In Copilot Studio, go to Knowledge → Refresh

### Issue: Agent still using general knowledge

**Solution:**
1. Double-check Settings → Knowledge → "Use general knowledge" is OFF
2. Republish the agent
3. Clear browser cache and test again

---

## PART 7: QUICK REFERENCE COMMANDS

```bash
# Navigate to repo
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Dry run all KB files
python3 release/v6.0/scripts/sanitize_kb_files.py release/v6.0/agents --dry-run

# Fix all KB files
python3 release/v6.0/scripts/sanitize_kb_files.py release/v6.0/agents

# Git commit and push
git add . && git commit -m "fix(kb): Sanitize KB files" && git push

# Check character count of instruction file
wc -c release/v6.0/agents/orc/instructions/ORC_Copilot_Instructions_v3.txt
```

---

## PART 8: DOCUMENT REFERENCES

| Document | Location | Purpose |
|----------|----------|---------|
| Agent Configuration Reference | `release/v6.0/docs/MPA_v6_Agent_Configuration_Reference.md` | Complete rationale |
| Deployment Checklist | `release/v6.0/COPILOT_STUDIO_DEPLOYMENT_CHECKLIST.md` | Full deployment steps |
| ORC Instructions | `release/v6.0/agents/orc/instructions/ORC_Copilot_Instructions_v3.txt` | ORC config |
| AUD Instructions | `release/v6.0/agents/aud/instructions/AUD_Copilot_Instructions_v2.txt` | AUD config |
| KB Sanitization Script | `release/v6.0/scripts/sanitize_kb_files.py` | Encoding fixes |

---

**Document Version:** 2.0  
**Status:** Ready for Execution
