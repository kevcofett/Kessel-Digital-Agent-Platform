# VS Code Deployment Prompt: Vertical Supplements

## Overview

Deploy 20 agent-specific vertical supplement KB files to SharePoint for both Aragorn AI (personal) and Mastercard (corporate) environments.

## Files to Deploy

### Financial Services (5 files)
Location: `release/v6.0/verticals/agent_supplements/financial_services/`

| File | Size | Agent |
|------|------|-------|
| ANL_Financial_Services_v1.txt | ~8K chars | Analytics |
| AUD_Financial_Services_v1.txt | ~8K chars | Audience |
| CHA_Financial_Services_v1.txt | ~10K chars | Channel |
| MKT_Financial_Services_v1.txt | ~8K chars | Marketing |
| PRF_Financial_Services_v1.txt | ~8K chars | Performance |

### Healthcare (5 files)
Location: `release/v6.0/verticals/agent_supplements/healthcare/`

| File | Size | Agent |
|------|------|-------|
| ANL_Healthcare_v1.txt | ~8K chars | Analytics |
| AUD_Healthcare_v1.txt | ~8K chars | Audience |
| CHA_Healthcare_v1.txt | ~10K chars | Channel |
| MKT_Healthcare_v1.txt | ~8K chars | Marketing |
| PRF_Healthcare_v1.txt | ~8K chars | Performance |

### B2B (5 files)
Location: `release/v6.0/verticals/agent_supplements/b2b/`

| File | Size | Agent |
|------|------|-------|
| ANL_B2B_v1.txt | ~8K chars | Analytics |
| AUD_B2B_v1.txt | ~8K chars | Audience |
| CHA_B2B_v1.txt | ~10K chars | Channel |
| MKT_B2B_v1.txt | ~8K chars | Marketing |
| PRF_B2B_v1.txt | ~8K chars | Performance |

### Retail (5 files)
Location: `release/v6.0/verticals/agent_supplements/retail/`

| File | Size | Agent |
|------|------|-------|
| ANL_Retail_v1.txt | ~8K chars | Analytics |
| AUD_Retail_v1.txt | ~8K chars | Audience |
| CHA_Retail_v1.txt | ~10K chars | Channel |
| MKT_Retail_v1.txt | ~8K chars | Marketing |
| PRF_Retail_v1.txt | ~8K chars | Performance |

---

## Deployment Instructions

### Step 1: Aragorn AI Environment (Personal)

SharePoint Site: Aragorn AI Copilot Studio site
Library: Agent Knowledge Base (or existing KB library)

**Create Folder Structure:**
```
/Verticals/Agent_Supplements/Financial_Services/
/Verticals/Agent_Supplements/Healthcare/
/Verticals/Agent_Supplements/B2B/
/Verticals/Agent_Supplements/Retail/
```

**Upload Files:**
Upload all 20 files to their respective vertical folders.

**Copilot Studio Configuration:**
1. Open each agent in Copilot Studio (ANL, AUD, CHA, MKT, PRF)
2. Navigate to Knowledge Sources
3. Add the relevant vertical supplement files as additional knowledge
4. For ANL agent: Add all 4 ANL_*_v1.txt files
5. For AUD agent: Add all 4 AUD_*_v1.txt files
6. For CHA agent: Add all 4 CHA_*_v1.txt files
7. For MKT agent: Add all 4 MKT_*_v1.txt files
8. For PRF agent: Add all 4 PRF_*_v1.txt files

### Step 2: Mastercard Environment (Corporate)

SharePoint Site: Mastercard Copilot Studio site
Library: MPA Knowledge Base

**Create Folder Structure:**
```
/Verticals/Agent_Supplements/Financial_Services/
/Verticals/Agent_Supplements/Healthcare/
/Verticals/Agent_Supplements/B2B/
/Verticals/Agent_Supplements/Retail/
```

**Upload Files:**
Upload all 20 files to their respective vertical folders.

**Copilot Studio Configuration:**
Same as Aragorn AI - add vertical supplements to each agent's knowledge sources.

---

## Agent-to-File Mapping

### ANL (Analytics) Agent
- ANL_Financial_Services_v1.txt
- ANL_Healthcare_v1.txt
- ANL_B2B_v1.txt
- ANL_Retail_v1.txt

### AUD (Audience) Agent
- AUD_Financial_Services_v1.txt
- AUD_Healthcare_v1.txt
- AUD_B2B_v1.txt
- AUD_Retail_v1.txt

### CHA (Channel) Agent
- CHA_Financial_Services_v1.txt
- CHA_Healthcare_v1.txt
- CHA_B2B_v1.txt
- CHA_Retail_v1.txt

### MKT (Marketing) Agent
- MKT_Financial_Services_v1.txt
- MKT_Healthcare_v1.txt
- MKT_B2B_v1.txt
- MKT_Retail_v1.txt

### PRF (Performance) Agent
- PRF_Financial_Services_v1.txt
- PRF_Healthcare_v1.txt
- PRF_B2B_v1.txt
- PRF_Retail_v1.txt

---

## Validation Checklist

### SharePoint Upload Validation
- [ ] All 20 files uploaded to Aragorn AI
- [ ] All 20 files uploaded to Mastercard
- [ ] Folder structure matches specification
- [ ] File names match exactly (case-sensitive)
- [ ] No upload errors or truncation

### Copilot Studio Configuration Validation
- [ ] ANL agent has 4 vertical supplements attached
- [ ] AUD agent has 4 vertical supplements attached
- [ ] CHA agent has 4 vertical supplements attached
- [ ] MKT agent has 4 vertical supplements attached
- [ ] PRF agent has 4 vertical supplements attached

### Functional Testing
Test each agent with vertical-specific queries:

**Financial Services Test:**
"What are the compliance requirements for credit card advertising on Google?"

**Healthcare Test:**
"What HIPAA considerations apply to programmatic healthcare advertising?"

**B2B Test:**
"What's the recommended LinkedIn targeting strategy for enterprise SaaS?"

**Retail Test:**
"How should I allocate budget for a holiday retail campaign?"

---

## Rollback Plan

If issues are encountered:

1. **Remove from Copilot Studio:** Detach vertical supplements from agent knowledge sources
2. **Keep Files in SharePoint:** Files can remain for future re-attachment
3. **Document Issues:** Note which files or configurations caused problems
4. **Report:** Create issue in GitHub repo with details

---

## Post-Deployment

After successful deployment:

1. Update CONTINUATION_PROMPT_Vertical_Supplements.md to mark complete
2. Commit deployment confirmation to repo
3. Test vertical routing in both environments
4. Document any environment-specific adjustments needed

---

## Notes

- These supplements are ADDITIVE to existing agent knowledge
- They do NOT replace core agent KB files
- Agents will use vertical context when user indicates their industry
- ORC agent routes to specialists; specialists use vertical supplements contextually
