# MULTI-AGENT ARCHITECTURE IMPLEMENTATION - VS CODE KICKOFF

**Date:** January 2026  
**Branch:** `feature/multi-agent-architecture`

---

## CONTEXT

I'm implementing the technical infrastructure for a multi-agent MPA transformation. Claude.ai is handling Copilot instructions and KB files in parallel.

## Repository

```
/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
```

**Branch:** `feature/multi-agent-architecture`

## Your Reference Documents

Read these first:

1. `docs/multi-agent/MULTI_AGENT_WORKPLAN.md` - Complete 12-week implementation plan
2. `docs/multi-agent/VSCODE_MULTI_AGENT_IMPLEMENTATION_PROMPT.md` - Your detailed tasks with code samples

---

## IMMEDIATE TASKS (Phase 1)

### 1. Create Remaining Folder Structure

Ensure all agent folders have proper subdirectories:

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Verify/create all subdirectories
for agent in orc anl aud cha spo doc prf; do
  mkdir -p release/v6.0/agents/$agent/{instructions,kb,flows,tests}
done

# Create platform folders
mkdir -p release/v6.0/platform/eap/{dataverse,seed}
```

### 2. Initialize packages/agent-core

Set up TypeScript project:

```bash
cd packages/agent-core
npm init -y
npm install typescript zod --save
npm install @types/node --save-dev
npx tsc --init
```

Create type definitions per `VSCODE_MULTI_AGENT_IMPLEMENTATION_PROMPT.md`:
- `src/types/agent-codes.ts`
- `src/types/agent-request.ts`
- `src/types/agent-response.ts`
- `src/types/session-context.ts`

### 3. Create Dataverse Schemas

- `release/v6.0/platform/eap/dataverse/eap_agent.json` (agent registry table)
- `release/v6.0/platform/eap/seed/feature_flags_multi_agent.csv`

### 4. Create Contract Schema

- `release/v6.0/contracts/INTER_AGENT_CONTRACT_v1.json`

---

## DIVISION OF LABOR

### What Claude.ai is Building (Don't Duplicate)

- All `*_Copilot_Instructions_v1.txt` files
- All `*_KB_*.txt` knowledge base files
- Test scenario designs
- Architecture documentation

### What You Are Building (Your Responsibility)

- TypeScript packages and types
- Power Automate flow definitions
- Dataverse table schemas and seed data
- Azure Function code
- Braintrust evaluation harness
- Deployment scripts
- Git operations

---

## GIT WORKFLOW

```bash
# You're on: feature/multi-agent-architecture

# Commit convention
git commit -m "feat(agent-core): implement type definitions"
git commit -m "feat(eap): add agent registry schema"

# Push your work
git push origin feature/multi-agent-architecture
```

---

## GET STARTED

1. Read `VSCODE_MULTI_AGENT_IMPLEMENTATION_PROMPT.md` for complete specifications
2. Start with Task 1 (folder structure verification)
3. Proceed through Phase 1 tasks sequentially
4. Commit and push after each major task

---

**Prepared for VS Code Claude | January 2026**
