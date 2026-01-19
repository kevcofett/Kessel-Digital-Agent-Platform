# VS Code Deployment Prompt: Advanced Features

## Overview

Deploy Azure ML Integration, Visual Decision Trees, Real-time Benchmarks, and SPO/DOC vertical supplements to SharePoint for both Aragorn AI (personal) and Mastercard (corporate) environments.

## New EAP Platform KB Files (4 files)

Location: `release/v6.0/platform/eap/kb/`

| File | Size | Description |
|------|------|-------------|
| EAP_KB_Azure_ML_Integration_v1.txt | ~15K chars | ML deployment patterns, endpoints, monitoring |
| EAP_KB_ML_Model_Specifications_v1.txt | ~13K chars | Model schemas, input/output specs |
| EAP_KB_Visual_Decision_Trees_v1.txt | ~15K chars | Interactive workflow visualization |
| EAP_KB_Realtime_Benchmarks_v1.txt | ~17K chars | Live benchmark API integration |

## SPO Vertical Supplements (4 files)

Location: `release/v6.0/verticals/agent_supplements/{vertical}/`

| File | Vertical | Size |
|------|----------|------|
| SPO_Financial_Services_v1.txt | Financial Services | ~10K chars |
| SPO_Healthcare_v1.txt | Healthcare | ~10K chars |
| SPO_B2B_v1.txt | B2B | ~11K chars |
| SPO_Retail_v1.txt | Retail | ~11K chars |

## DOC Vertical Supplements (4 files)

Location: `release/v6.0/verticals/agent_supplements/{vertical}/`

| File | Vertical | Size |
|------|----------|------|
| DOC_Financial_Services_v1.txt | Financial Services | ~10K chars |
| DOC_Healthcare_v1.txt | Healthcare | ~11K chars |
| DOC_B2B_v1.txt | B2B | ~12K chars |
| DOC_Retail_v1.txt | Retail | ~13K chars |

---

## Deployment Instructions

### Step 1: Aragorn AI Environment (Personal)

**EAP Platform KB:**
1. Navigate to SharePoint > Agent Knowledge Base
2. Create folder: `/Platform/EAP/`
3. Upload all 4 EAP KB files

**SPO Vertical Supplements:**
1. Navigate to `/Verticals/Agent_Supplements/`
2. Upload SPO files to their respective vertical folders

**DOC Vertical Supplements:**
1. Navigate to `/Verticals/Agent_Supplements/`
2. Upload DOC files to their respective vertical folders

**Copilot Studio Configuration:**
1. EAP KB files: Add to shared knowledge for all agents
2. SPO Agent: Add 4 SPO vertical files
3. DOC Agent: Add 4 DOC vertical files

### Step 2: Mastercard Environment (Corporate)

Follow same process as Aragorn AI with Mastercard SharePoint site.

---

## Agent-to-File Mapping

### Shared Platform Knowledge (All Agents)
- EAP_KB_Azure_ML_Integration_v1.txt
- EAP_KB_ML_Model_Specifications_v1.txt
- EAP_KB_Visual_Decision_Trees_v1.txt
- EAP_KB_Realtime_Benchmarks_v1.txt

### SPO (Supply Path Optimization) Agent
- SPO_Financial_Services_v1.txt
- SPO_Healthcare_v1.txt
- SPO_B2B_v1.txt
- SPO_Retail_v1.txt

### DOC (Document) Agent
- DOC_Financial_Services_v1.txt
- DOC_Healthcare_v1.txt
- DOC_B2B_v1.txt
- DOC_Retail_v1.txt

---

## Feature Capabilities Summary

### Azure ML Integration
- Real-time inference endpoint configuration
- Batch scoring pipeline setup
- Model registry and versioning
- Champion-challenger deployment patterns
- Data drift monitoring
- API specifications for all agent models

### Visual Decision Trees
- Interactive MPA workflow visualization
- Pathway decision trees (EXPRESS, STANDARD, GUIDED, AUDIT)
- CA workflow trees (Framework Selection, Change Management)
- Node interactions and navigation
- Responsive rendering across devices

### Real-time Benchmarks
- Platform-specific benchmark APIs (Google, Meta, LinkedIn)
- Vertical-specific benchmarks
- Dynamic threshold adjustment
- Competitive intelligence feeds
- Agent-aware benchmark integration

### SPO Verticals
- Financial Services: Compliance, brand safety, partner vetting
- Healthcare: HIPAA, MLR, healthcare networks
- B2B: ABM supply paths, enterprise deals
- Retail: Retail media networks, commerce supply

### DOC Verticals
- Financial Services: Regulatory documentation, disclosures
- Healthcare: MLR process, FDA compliance
- B2B: Sales enablement, ABM documentation
- Retail: Promotional documentation, seasonal planning

---

## Validation Checklist

### SharePoint Upload Validation
- [ ] All 4 EAP KB files uploaded to both environments
- [ ] All 4 SPO vertical files uploaded
- [ ] All 4 DOC vertical files uploaded
- [ ] Folder structure matches specification

### Copilot Studio Configuration Validation
- [ ] EAP KB files attached to shared knowledge
- [ ] SPO agent has 4 vertical supplements
- [ ] DOC agent has 4 vertical supplements

### Functional Testing

**Azure ML Integration Test:**
"What are the deployment options for the propensity scoring model?"

**Visual Decision Trees Test:**
"Show me the decision tree for the GUIDED pathway"

**Real-time Benchmarks Test:**
"What are current industry benchmarks for financial services display CTR?"

**SPO Vertical Test:**
"What are the brand safety requirements for healthcare programmatic?"

**DOC Vertical Test:**
"What template should I use for a B2B ABM campaign brief?"

---

## Complete Vertical Agent Coverage

After this deployment, vertical coverage is complete:

| Agent | Financial Services | Healthcare | B2B | Retail |
|-------|-------------------|------------|-----|--------|
| ANL | ✅ | ✅ | ✅ | ✅ |
| AUD | ✅ | ✅ | ✅ | ✅ |
| CHA | ✅ | ✅ | ✅ | ✅ |
| MKT | ✅ | ✅ | ✅ | ✅ |
| PRF | ✅ | ✅ | ✅ | ✅ |
| SPO | ✅ | ✅ | ✅ | ✅ |
| DOC | ✅ | ✅ | ✅ | ✅ |

**Total: 28 vertical supplement files across 7 agents and 4 verticals**

---

## Post-Deployment Notes

- These supplements enhance agent capabilities with vertical-specific knowledge
- Agents will automatically apply vertical context when user indicates their industry
- ML integration enables future real-time model serving capabilities
- Decision trees provide framework for visual workflow interfaces
- Benchmarks enable real-time performance contextualization
