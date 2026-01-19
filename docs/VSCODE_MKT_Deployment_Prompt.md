# VS Code: MKT Agent Deployment

## Context
MKT (Marketing Strategy) Agent has been created and committed to main. Deploy to both Personal (Aragorn AI) and Mastercard environments.

## Repository
- Path: `/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform`
- Branch: `main`
- Commit: `e869973e`

---

## PHASE 1: SharePoint KB Upload

### 1.1 Personal Environment (Aragorn AI)

Upload these 5 KB files to Aragorn AI SharePoint:

```
base/agents/mkt/kb/MKT_KB_Campaign_Strategy_v1.txt
base/agents/mkt/kb/MKT_KB_Creative_Briefs_v1.txt
base/agents/mkt/kb/MKT_KB_Brand_Positioning_v1.txt
base/agents/mkt/kb/MKT_KB_GTM_Planning_v1.txt
base/agents/mkt/kb/MKT_KB_Competitive_Analysis_v1.txt
```

Also upload updated ORC routing file:
```
release/v6.0/agents/orc/kb/ORC_KB_Routing_Logic_v1.txt
```

### 1.2 Mastercard Environment

Upload same 6 files to Mastercard SharePoint knowledge base.

---

## PHASE 2: Copilot Studio - Create MKT Agent

### 2.1 Personal Environment (Aragorn AI)

1. Open Copilot Studio > Aragorn AI environment
2. Create new Copilot agent:
   - Name: "MKT - Marketing Strategy"
   - Description: "Marketing strategy development, creative briefs, brand positioning, GTM planning, competitive analysis"

3. Set Instructions:
   - Copy content from: `base/agents/mkt/instructions/MKT_Copilot_Instructions_v1.txt`
   - Verify character count: 5,567 chars (within 8,000 limit)

4. Add Knowledge Sources from SharePoint:
   - `MKT_KB_Campaign_Strategy_v1.txt`
   - `MKT_KB_Creative_Briefs_v1.txt`
   - `MKT_KB_Brand_Positioning_v1.txt`
   - `MKT_KB_GTM_Planning_v1.txt`
   - `MKT_KB_Competitive_Analysis_v1.txt`
   - All 6 EAP shared KB files (EAP_KB_*.txt)

5. Save and Publish

### 2.2 Mastercard Environment

Repeat same steps for Mastercard Copilot Studio environment.

---

## PHASE 3: Update ORC Agent

### 3.1 Personal Environment

1. Select ORC agent in Copilot Studio
2. Update Knowledge Sources:
   - Replace `ORC_KB_Routing_Logic_v1.txt` with updated version
3. Save and Publish

### 3.2 Mastercard Environment

Repeat same ORC update for Mastercard.

---

## PHASE 4: Dataverse Registration

### 4.1 Register MKT Agent

Add to `eap_agent` table:

| agent_code | agent_name | domain | status |
|------------|------------|--------|--------|
| MKT | Marketing Strategy | MPA | Active |

### 4.2 Register MKT Capabilities

Add to `eap_capability` table:

| capability_code | capability_name | agent_code | description |
|-----------------|-----------------|------------|-------------|
| MKT_CAMPAIGN_STRATEGY | Campaign Strategy | MKT | Comprehensive campaign planning |
| MKT_CREATIVE_BRIEF | Creative Brief | MKT | Structured brief development |
| MKT_POSITIONING | Brand Positioning | MKT | Positioning framework application |
| MKT_GTM_PLANNING | GTM Planning | MKT | Go-to-market strategy |
| MKT_COMPETITIVE | Competitive Analysis | MKT | Competitive landscape assessment |

---

## PHASE 5: Smoke Tests

### 5.1 MKT Agent Tests

Test these scenarios:

**Campaign Strategy:**
```
Help me develop a campaign strategy for launching our new loyalty program
```
Expected: Clarifies objectives, asks about audience, references framework

**Creative Brief:**
```
Create a creative brief for our Q2 brand awareness campaign targeting millennials
```
Expected: Applies brief structure, asks for insight, guides to proposition

**Brand Positioning:**
```
How should we position our fintech app against established banking apps?
```
Expected: Uses positioning framework, explores differentiation

**GTM Planning:**
```
Build a go-to-market plan for our new SaaS product launch
```
Expected: Covers market analysis, channel strategy, launch execution

**Competitive Analysis:**
```
Analyze our competitive landscape in the meal delivery market
```
Expected: Applies competitive frameworks, provides recommendations

### 5.2 ORC Routing Tests

Test that ORC correctly routes to MKT:

```
I need help with campaign strategy development
```
Expected: Routes to MKT agent

```
Create a creative brief for our new product
```
Expected: Routes to MKT agent

```
Help me with brand positioning
```
Expected: Routes to MKT agent

### 5.3 Cross-Agent Routing Tests

```
Develop a campaign strategy with detailed audience segmentation
```
Expected: MKT handles strategy, routes to AUD for segmentation

```
Build a GTM plan with channel allocation recommendations
```
Expected: MKT handles GTM, routes to CHA for channels

---

## Validation Checklist

### Personal Environment
- [ ] 5 MKT KB files uploaded to SharePoint
- [ ] ORC routing file updated in SharePoint
- [ ] MKT agent created in Copilot Studio
- [ ] MKT agent published
- [ ] ORC agent updated with new routing
- [ ] MKT agent registered in Dataverse
- [ ] 5 MKT capabilities registered
- [ ] All smoke tests pass

### Mastercard Environment
- [ ] 5 MKT KB files uploaded to SharePoint
- [ ] ORC routing file updated in SharePoint
- [ ] MKT agent created in Copilot Studio
- [ ] MKT agent published
- [ ] ORC agent updated with new routing
- [ ] MKT agent registered in Dataverse
- [ ] 5 MKT capabilities registered
- [ ] All smoke tests pass

---

## Rollback Plan

If issues occur:
1. Unpublish MKT agent
2. Revert ORC to previous routing file
3. Remove MKT records from Dataverse
4. Remove MKT KB files from SharePoint

---

## Platform Status After Deployment

**11 Active Agents:**
- ORC, ANL, AUD, CHA, SPO, DOC, PRF, CST, CHG, MKT

**MKT Capabilities:**
- Campaign Strategy
- Creative Briefs
- Brand Positioning
- GTM Planning
- Competitive Analysis
