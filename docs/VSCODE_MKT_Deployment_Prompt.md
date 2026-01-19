# VS Code: MKT Agent Deployment

## Context
MKT (Marketing Strategy) Agent has been created and committed to main. Deploy to both Personal (Aragorn AI) and Mastercard environments.

## Repository
- Path: `/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform`
- Branch: `main`
- Latest Commit: `e869973e` - feat(mkt): Add Marketing Strategy Agent

---

## PHASE 1: SharePoint KB Upload

### 1.1 MKT KB Files to Upload

Upload these 5 files to SharePoint knowledge base:

```
base/agents/mkt/kb/MKT_KB_Campaign_Strategy_v1.txt      (10,419 chars)
base/agents/mkt/kb/MKT_KB_Creative_Briefs_v1.txt        (10,627 chars)
base/agents/mkt/kb/MKT_KB_Brand_Positioning_v1.txt      (10,370 chars)
base/agents/mkt/kb/MKT_KB_GTM_Planning_v1.txt           (9,493 chars)
base/agents/mkt/kb/MKT_KB_Competitive_Analysis_v1.txt   (10,183 chars)
```

### 1.2 Updated ORC Routing File

Replace existing ORC routing KB with updated version:

```
release/v6.0/agents/orc/kb/ORC_KB_Routing_Logic_v1.txt
```

This version includes MKT routing triggers and disambiguation rules.

### 1.3 Upload Process

**Personal Environment (Aragorn AI):**
1. Navigate to Aragorn AI SharePoint site
2. Go to Documents > Knowledge Base folder
3. Upload all 5 MKT KB files
4. Replace ORC_KB_Routing_Logic_v1.txt with updated version
5. Verify all files uploaded successfully

**Mastercard Environment:**
1. Navigate to Mastercard SharePoint site
2. Go to Documents > Knowledge Base folder
3. Upload all 5 MKT KB files
4. Replace ORC_KB_Routing_Logic_v1.txt with updated version
5. Verify all files uploaded successfully

---

## PHASE 2: Copilot Studio - Create MKT Agent

### 2.1 Personal Environment (Aragorn AI)

1. Open Copilot Studio > Aragorn AI environment
2. Click "Create" > "New Agent"
3. Name: "MKT - Marketing Strategy"
4. Description: "Marketing strategy specialist for campaign development, creative briefs, brand positioning, GTM planning, and competitive analysis"

**Set Instructions:**
- Copy content from: `base/agents/mkt/instructions/MKT_Copilot_Instructions_v1.txt`
- Paste into Instructions field
- Verify character count: 5,567 (within 8,000 limit)

**Add Knowledge Sources:**
- Add from SharePoint:
  - `MKT_KB_Campaign_Strategy_v1.txt`
  - `MKT_KB_Creative_Briefs_v1.txt`
  - `MKT_KB_Brand_Positioning_v1.txt`
  - `MKT_KB_GTM_Planning_v1.txt`
  - `MKT_KB_Competitive_Analysis_v1.txt`
- Also add EAP shared KB files:
  - `EAP_KB_Data_Provenance_v1.txt`
  - `EAP_KB_Confidence_Levels_v1.txt`
  - `EAP_KB_Error_Handling_v1.txt`
  - `EAP_KB_Formatting_Standards_v1.txt`
  - `EAP_KB_Strategic_Principles_v1.txt`
  - `EAP_KB_Communication_Contract_v1.txt`

5. Save and Publish

### 2.2 Mastercard Environment

Repeat same process for Mastercard environment:
1. Create "MKT - Marketing Strategy" agent
2. Copy instructions from same file
3. Add same KB files from Mastercard SharePoint
4. Save and Publish

---

## PHASE 3: Update ORC Agent

### 3.1 Personal Environment

1. Open ORC agent in Copilot Studio
2. Update Knowledge Sources:
   - Remove old `ORC_KB_Routing_Logic_v1.txt`
   - Add updated `ORC_KB_Routing_Logic_v1.txt` from SharePoint
3. Save and Publish

### 3.2 Mastercard Environment

Repeat for Mastercard:
1. Update ORC knowledge source
2. Save and Publish

---

## PHASE 4: Dataverse Updates

### 4.1 Register MKT Agent

Add to `eap_agent` table:

| Field | Value |
|-------|-------|
| agent_code | MKT |
| agent_name | Marketing Strategy Agent |
| domain | MPA |
| status | Active |
| description | Campaign strategy, creative briefs, brand positioning, GTM planning, competitive analysis |

### 4.2 Register MKT Capabilities

Add to `eap_capability` table:

| capability_code | capability_name | agent_code | description |
|-----------------|-----------------|------------|-------------|
| MKT_CAMPAIGN_STRATEGY | Campaign Strategy | MKT | Develop comprehensive campaign strategies |
| MKT_CREATIVE_BRIEF | Creative Brief | MKT | Create structured creative briefs |
| MKT_POSITIONING | Brand Positioning | MKT | Define brand positioning frameworks |
| MKT_GTM_PLANNING | GTM Planning | MKT | Build go-to-market plans |
| MKT_COMPETITIVE | Competitive Analysis | MKT | Conduct competitive landscape analysis |

---

## PHASE 5: Smoke Tests

### 5.1 MKT Agent Tests

Test these scenarios in both environments:

**Test 1: Campaign Strategy**
```
Input: "Help me develop a campaign strategy for launching our new loyalty program"
Expected: MKT engages, asks about objectives, applies campaign strategy framework
```

**Test 2: Creative Brief**
```
Input: "Create a creative brief for our Q2 brand awareness campaign"
Expected: MKT applies brief structure, asks for business context and audience insight
```

**Test 3: Brand Positioning**
```
Input: "How should we position our fintech app against established banking apps?"
Expected: MKT applies positioning framework, explores differentiation opportunities
```

**Test 4: GTM Planning**
```
Input: "Build a go-to-market plan for our new SaaS product launch"
Expected: MKT applies GTM methodology, covers market analysis and channel strategy
```

**Test 5: Competitive Analysis**
```
Input: "Analyze our competitive landscape in the meal delivery market"
Expected: MKT applies competitive frameworks, provides strategic recommendations
```

### 5.2 ORC Routing Tests

Test routing correctly sends to MKT:

**Test 1: MKT Routing**
```
Input: "I need help with campaign strategy"
Expected: Routes to MKT agent
```

**Test 2: MKT vs CHA Distinction**
```
Input: "Help me with channel allocation for my campaign"
Expected: Routes to CHA (not MKT) - channel tactics vs strategy
```

**Test 3: MKT vs CST Distinction**
```
Input: "Help me select a strategic framework for market analysis"
Expected: Routes to CST (not MKT) - consulting frameworks vs marketing strategy
```

**Test 4: Multi-Agent**
```
Input: "Develop a campaign strategy with detailed audience segmentation"
Expected: MKT handles strategy, routes to AUD for segmentation
```

---

## PHASE 6: Update Deploy Branches

After successful testing, update deploy branches:

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Update deploy/personal
git checkout deploy/personal
git merge main -m "deploy: Add MKT agent to personal environment"
git push origin deploy/personal

# Update deploy/mastercard
git checkout deploy/mastercard
git merge main -m "deploy: Add MKT agent to mastercard environment"
git push origin deploy/mastercard

# Return to main
git checkout main
```

---

## Validation Checklist

### Personal Environment
- [ ] 5 MKT KB files uploaded to SharePoint
- [ ] ORC routing KB updated in SharePoint
- [ ] MKT agent created in Copilot Studio
- [ ] MKT agent published
- [ ] ORC agent updated with new routing
- [ ] All 5 MKT smoke tests pass
- [ ] ORC routing tests pass
- [ ] MKT agent registered in Dataverse
- [ ] MKT capabilities registered in Dataverse
- [ ] deploy/personal branch updated

### Mastercard Environment
- [ ] 5 MKT KB files uploaded to SharePoint
- [ ] ORC routing KB updated in SharePoint
- [ ] MKT agent created in Copilot Studio
- [ ] MKT agent published
- [ ] ORC agent updated with new routing
- [ ] All 5 MKT smoke tests pass
- [ ] ORC routing tests pass
- [ ] MKT agent registered in Dataverse
- [ ] MKT capabilities registered in Dataverse
- [ ] deploy/mastercard branch updated

---

## Rollback Plan

If issues occur:

1. Unpublish MKT agent in Copilot Studio
2. Revert ORC routing KB to previous version
3. Remove MKT KB files from SharePoint
4. Delete MKT records from Dataverse

Previous stable state: v6.0.0 without MKT agent
