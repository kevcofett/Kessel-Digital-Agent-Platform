# VS Code Vertical Supplements Deployment Prompt

## Overview
This prompt guides deployment of the 20 vertical supplement KB files to SharePoint for use by KDAP agents.

## Files to Deploy

### Financial Services Vertical (5 files)
```
release/v6.0/verticals/agent_supplements/financial_services/
├── ANL_Financial_Services_v1.txt
├── AUD_Financial_Services_v1.txt
├── CHA_Financial_Services_v1.txt
├── MKT_Financial_Services_v1.txt
└── PRF_Financial_Services_v1.txt
```

### Healthcare Vertical (5 files)
```
release/v6.0/verticals/agent_supplements/healthcare/
├── ANL_Healthcare_v1.txt
├── AUD_Healthcare_v1.txt
├── CHA_Healthcare_v1.txt
├── MKT_Healthcare_v1.txt
└── PRF_Healthcare_v1.txt
```

### B2B Vertical (5 files)
```
release/v6.0/verticals/agent_supplements/b2b/
├── ANL_B2B_v1.txt
├── AUD_B2B_v1.txt
├── CHA_B2B_v1.txt
├── MKT_B2B_v1.txt
└── PRF_B2B_v1.txt
```

### Retail Vertical (5 files)
```
release/v6.0/verticals/agent_supplements/retail/
├── ANL_Retail_v1.txt
├── AUD_Retail_v1.txt
├── CHA_Retail_v1.txt
├── MKT_Retail_v1.txt
└── PRF_Retail_v1.txt
```

## Deployment Steps

### Step 1: Prepare SharePoint Structure
Create verticals folder structure in SharePoint KB library:
```
/kb/
└── verticals/
    ├── financial_services/
    ├── healthcare/
    ├── b2b/
    └── retail/
```

### Step 2: Upload Files by Vertical

#### Financial Services
```bash
# Navigate to financial_services directory
cd release/v6.0/verticals/agent_supplements/financial_services

# Files to upload (total ~5 files, ~11K chars each):
# - ANL_Financial_Services_v1.txt
# - AUD_Financial_Services_v1.txt
# - CHA_Financial_Services_v1.txt
# - MKT_Financial_Services_v1.txt
# - PRF_Financial_Services_v1.txt
```

#### Healthcare
```bash
# Navigate to healthcare directory
cd release/v6.0/verticals/agent_supplements/healthcare

# Files to upload (total ~5 files, ~10-12K chars each):
# - ANL_Healthcare_v1.txt
# - AUD_Healthcare_v1.txt
# - CHA_Healthcare_v1.txt
# - MKT_Healthcare_v1.txt
# - PRF_Healthcare_v1.txt
```

#### B2B
```bash
# Navigate to b2b directory
cd release/v6.0/verticals/agent_supplements/b2b

# Files to upload (total ~5 files, ~12K chars each):
# - ANL_B2B_v1.txt
# - AUD_B2B_v1.txt
# - CHA_B2B_v1.txt
# - MKT_B2B_v1.txt
# - PRF_B2B_v1.txt
```

#### Retail
```bash
# Navigate to retail directory
cd release/v6.0/verticals/agent_supplements/retail

# Files to upload (total ~5 files, ~11K chars each):
# - ANL_Retail_v1.txt
# - AUD_Retail_v1.txt
# - CHA_Retail_v1.txt
# - MKT_Retail_v1.txt
# - PRF_Retail_v1.txt
```

### Step 3: Configure Agent KB References

Each agent needs its vertical supplements added to its KB configuration:

#### ANL Agent
Add to ANL Copilot Studio knowledge:
- Financial Services: `/kb/verticals/financial_services/ANL_Financial_Services_v1.txt`
- Healthcare: `/kb/verticals/healthcare/ANL_Healthcare_v1.txt`
- B2B: `/kb/verticals/b2b/ANL_B2B_v1.txt`
- Retail: `/kb/verticals/retail/ANL_Retail_v1.txt`

#### AUD Agent
Add to AUD Copilot Studio knowledge:
- Financial Services: `/kb/verticals/financial_services/AUD_Financial_Services_v1.txt`
- Healthcare: `/kb/verticals/healthcare/AUD_Healthcare_v1.txt`
- B2B: `/kb/verticals/b2b/AUD_B2B_v1.txt`
- Retail: `/kb/verticals/retail/AUD_Retail_v1.txt`

#### CHA Agent
Add to CHA Copilot Studio knowledge:
- Financial Services: `/kb/verticals/financial_services/CHA_Financial_Services_v1.txt`
- Healthcare: `/kb/verticals/healthcare/CHA_Healthcare_v1.txt`
- B2B: `/kb/verticals/b2b/CHA_B2B_v1.txt`
- Retail: `/kb/verticals/retail/CHA_Retail_v1.txt`

#### MKT Agent
Add to MKT Copilot Studio knowledge:
- Financial Services: `/kb/verticals/financial_services/MKT_Financial_Services_v1.txt`
- Healthcare: `/kb/verticals/healthcare/MKT_Healthcare_v1.txt`
- B2B: `/kb/verticals/b2b/MKT_B2B_v1.txt`
- Retail: `/kb/verticals/retail/MKT_Retail_v1.txt`

#### PRF Agent
Add to PRF Copilot Studio knowledge:
- Financial Services: `/kb/verticals/financial_services/PRF_Financial_Services_v1.txt`
- Healthcare: `/kb/verticals/healthcare/PRF_Healthcare_v1.txt`
- B2B: `/kb/verticals/b2b/PRF_B2B_v1.txt`
- Retail: `/kb/verticals/retail/PRF_Retail_v1.txt`

### Step 4: Validation Checklist

For each environment (Aragorn AI / Mastercard):

#### File Validation
- [ ] All 20 files uploaded successfully
- [ ] No upload errors or size warnings
- [ ] Files accessible via SharePoint

#### Agent Configuration
- [ ] ANL agent has 4 vertical supplements referenced
- [ ] AUD agent has 4 vertical supplements referenced
- [ ] CHA agent has 4 vertical supplements referenced
- [ ] MKT agent has 4 vertical supplements referenced
- [ ] PRF agent has 4 vertical supplements referenced

#### Functional Testing
- [ ] Ask ANL about financial services analytics - verify vertical content used
- [ ] Ask AUD about healthcare audience segmentation - verify vertical content used
- [ ] Ask CHA about retail channel mix - verify vertical content used
- [ ] Ask MKT about B2B go-to-market - verify vertical content used
- [ ] Ask PRF about healthcare attribution - verify vertical content used

## File Summary

| Vertical | Agent | File | Lines | Size Est |
|----------|-------|------|-------|----------|
| Financial Services | ANL | ANL_Financial_Services_v1.txt | ~300 | ~10K |
| Financial Services | AUD | AUD_Financial_Services_v1.txt | ~350 | ~12K |
| Financial Services | CHA | CHA_Financial_Services_v1.txt | ~323 | ~11K |
| Financial Services | MKT | MKT_Financial_Services_v1.txt | ~458 | ~14K |
| Financial Services | PRF | PRF_Financial_Services_v1.txt | ~415 | ~13K |
| Healthcare | ANL | ANL_Healthcare_v1.txt | ~280 | ~9K |
| Healthcare | AUD | AUD_Healthcare_v1.txt | ~320 | ~11K |
| Healthcare | CHA | CHA_Healthcare_v1.txt | ~421 | ~13K |
| Healthcare | MKT | MKT_Healthcare_v1.txt | ~452 | ~14K |
| Healthcare | PRF | PRF_Healthcare_v1.txt | ~438 | ~14K |
| B2B | ANL | ANL_B2B_v1.txt | ~290 | ~10K |
| B2B | AUD | AUD_B2B_v1.txt | ~474 | ~15K |
| B2B | CHA | CHA_B2B_v1.txt | ~484 | ~15K |
| B2B | MKT | MKT_B2B_v1.txt | ~450 | ~14K |
| B2B | PRF | PRF_B2B_v1.txt | ~414 | ~13K |
| Retail | ANL | ANL_Retail_v1.txt | ~260 | ~9K |
| Retail | AUD | AUD_Retail_v1.txt | ~463 | ~14K |
| Retail | CHA | CHA_Retail_v1.txt | ~507 | ~16K |
| Retail | MKT | MKT_Retail_v1.txt | ~453 | ~14K |
| Retail | PRF | PRF_Retail_v1.txt | ~409 | ~13K |

**Total: 20 files, ~8,000 lines, ~255K characters**

## Usage Notes

### When Vertical Content is Triggered
Agents will reference vertical supplements when:
- User specifies industry context (e.g., "for a healthcare client")
- Campaign involves industry-specific compliance
- Benchmarks or KPIs are industry-specific
- Channel recommendations need vertical context

### Content Hierarchy
1. Core agent KB (always loaded)
2. Vertical supplement (loaded when industry context detected)
3. General overlay (loaded for cross-industry guidance)

### Cross-Referencing
Agents can reference multiple vertical supplements when client operates across industries (e.g., healthcare technology = Healthcare + B2B).

---

**Document Version:** 1.0  
**Created:** January 18, 2026  
**Status:** Ready for Deployment
