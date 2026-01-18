# VS CODE CLAUDE: PHASE 3 PARALLEL WORKSTREAM

**Date:** January 18, 2026
**Branch:** feature/multi-agent-architecture
**Objective:** Create vertical overlays and Dataverse integration files

---

## CONTEXT

Multi-agent v6.0 has 35 KB files across 7 agents. Now adding:
- Vertical-specific overlay files (industry guidance)
- Dataverse seed data updates for multi-agent support

---

## YOUR ASSIGNMENTS

While Claude.ai handles validation and 2-3 vertical overlays, you will:

1. Create 2-3 vertical overlay KB files
2. Create Dataverse seed data files for multi-agent
3. Create agent routing test scenarios

---

## TASK 1: VERTICAL OVERLAYS (Pick 2-3)

**Directory:** `release/v6.0/verticals/` (create if needed)

### Option A: Retail_Media_Vertical_Overlay_v1.txt (~10K chars)

```
DOCUMENT: Retail_Media_Vertical_Overlay_v1.txt
CATEGORY: Vertical Overlay
TOPICS: retail media networks, Amazon, Walmart, closed-loop measurement
VERSION: 1.0

RETAIL MEDIA VERTICAL OVERLAY v1

PURPOSE
Industry-specific guidance for retail media network campaigns.

RETAIL MEDIA LANDSCAPE
[Major networks: Amazon, Walmart, Target, Kroger, Instacart]
[On-site vs off-site inventory]
[Closed-loop measurement advantages]

AMAZON ADVERTISING
[Sponsored Products, Brands, Display]
[DSP capabilities]
[Attribution windows]
[Budget minimums and recommendations]

WALMART CONNECT
[Search and display options]
[Walmart+ audience targeting]
[Store attribution]

OTHER NETWORKS
[Target Roundel, Kroger 84.51, Instacart]
[Emerging networks]

MEASUREMENT APPROACH
[ROAS vs incremental ROAS]
[New-to-brand metrics]
[Share of voice]

BUDGET ALLOCATION
[Retail media % of total]
[By retailer prioritization]

CROSS-REFERENCES
[Link to CHA, SPO, ANL as relevant]

VERSION HISTORY
Version 1.0 - January 2026
```

### Option B: Automotive_Vertical_Overlay_v1.txt (~10K chars)

```
DOCUMENT: Automotive_Vertical_Overlay_v1.txt
CATEGORY: Vertical Overlay
TOPICS: automotive, OEM, dealer, conquest, loyalty
VERSION: 1.0

AUTOMOTIVE VERTICAL OVERLAY v1

PURPOSE
Industry-specific guidance for automotive campaigns.

AUTOMOTIVE MEDIA LANDSCAPE
[OEM vs dealer dynamics]
[Tier 1/2/3 structure]
[Co-op funding considerations]

AUDIENCE STRATEGIES
[In-market timing signals]
[Conquest vs loyalty]
[Service and parts lifecycle]

CHANNEL PRIORITIES
[Search (brand defense critical)]
[Video for awareness]
[Local/geo targeting]

DEALER COORDINATION
[Territory management]
[Inventory-based targeting]
[Lead distribution]

MEASUREMENT
[Showroom visits]
[Test drive attribution]
[Sales match back]

BUDGET ALLOCATION
[By funnel stage]
[Seasonal patterns]

VERSION HISTORY
Version 1.0 - January 2026
```

### Option C: Travel_Hospitality_Vertical_Overlay_v1.txt (~10K chars)

```
DOCUMENT: Travel_Hospitality_Vertical_Overlay_v1.txt
CATEGORY: Vertical Overlay
TOPICS: travel, hospitality, booking, OTA, loyalty
VERSION: 1.0

TRAVEL HOSPITALITY VERTICAL OVERLAY v1

PURPOSE
Industry-specific guidance for travel and hospitality campaigns.

TRAVEL MEDIA LANDSCAPE
[Direct vs OTA dynamics]
[Metasearch importance]
[Loyalty program integration]

BOOKING WINDOWS
[Advance purchase patterns]
[Last-minute opportunities]
[Seasonal considerations]

AUDIENCE STRATEGIES
[Travel intent signals]
[Destination targeting]
[Loyalty tier targeting]

CHANNEL PRIORITIES
[Search (brand bidding critical)]
[Meta/comparison shopping]
[Social inspiration phase]

MEASUREMENT
[Booking attribution]
[Revenue per booking]
[Ancillary revenue]

COMPETITIVE DYNAMICS
[OTA bid pressure]
[Rate parity considerations]

VERSION HISTORY
Version 1.0 - January 2026
```

---

## TASK 2: DATAVERSE SEED DATA

**Directory:** `release/v6.0/platform/dataverse/`

### File: agent_routing_rules.csv

Create seed data for agent routing logic:

```csv
rule_id,trigger_pattern,target_agent,priority,confidence_threshold,description
ROUTE001,calculate|projection|forecast|estimate,ANL,1,0.8,Route calculations to Analytics
ROUTE002,audience|segment|targeting|lookalike|ltv,AUD,1,0.8,Route audience questions to Audience
ROUTE003,channel|budget|allocation|mix|media,CHA,1,0.8,Route channel questions to Channel
ROUTE004,document|export|report|presentation|deliverable,DOC,1,0.8,Route document requests to Document
ROUTE005,performance|optimize|anomaly|trend|learning,PRF,1,0.8,Route performance to Performance
ROUTE006,supply|ssp|dsp|programmatic|nbi|fee,SPO,1,0.8,Route supply path to SPO
ROUTE007,plan|campaign|strategy|recommend,ORC,2,0.6,General planning stays with Orchestrator
ROUTE008,help|how|what|explain,ORC,3,0.5,General questions stay with Orchestrator
```

### File: agent_capabilities.csv

```csv
agent_code,capability_id,capability_name,description,requires_data
ANL,ANL001,Calculate Projections,Generate reach/frequency/conversion projections,budget_timeline
ANL,ANL002,Run Scenarios,Compare multiple budget scenarios,scenarios_defined
ANL,ANL003,Statistical Testing,Perform significance and power analysis,test_parameters
AUD,AUD001,Segment Audience,Create RFM or behavioral segments,customer_data
AUD,AUD002,Calculate LTV,Compute customer lifetime value,transaction_history
AUD,AUD003,Assess Lookalike,Evaluate seed audience quality,seed_audience
CHA,CHA001,Recommend Channels,Suggest optimal channel mix,objectives_budget
CHA,CHA002,Allocate Budget,Distribute budget across channels,total_budget
CHA,CHA003,Lookup Benchmarks,Retrieve channel performance benchmarks,channel_list
DOC,DOC001,Generate Plan,Create full media plan document,plan_complete
DOC,DOC002,Generate Summary,Create executive summary,plan_complete
DOC,DOC003,Export Budget,Export budget to Excel,allocation_complete
PRF,PRF001,Analyze Performance,Review campaign performance data,performance_data
PRF,PRF002,Detect Anomalies,Identify performance outliers,performance_data
PRF,PRF003,Extract Learnings,Document campaign insights,campaign_complete
SPO,SPO001,Calculate NBI,Compute Net Billable Investment,fee_structure
SPO,SPO002,Analyze Fees,Break down programmatic fees,fee_data
SPO,SPO003,Evaluate Partner,Score supply partners,partner_list
ORC,ORC001,Manage Session,Track workflow progress,session_active
ORC,ORC002,Route Request,Direct to specialist agent,request_received
ORC,ORC003,Gate Validation,Check workflow prerequisites,gate_id
```

---

## TASK 3: ROUTING TEST SCENARIOS

**File:** `release/v6.0/tests/routing-validation-scenarios.json`

Add 20 more test scenarios to validate routing:

```json
{
  "version": "1.0",
  "scenarios": [
    {
      "id": "RV001",
      "input": "What CPM should I expect for LinkedIn sponsored content?",
      "expected_agent": "CHA",
      "expected_kb": "CHA_KB_Channel_Registry",
      "priority": "P1"
    },
    {
      "id": "RV002",
      "input": "Calculate the LTV of our top customer segment",
      "expected_agent": "AUD",
      "expected_kb": "AUD_KB_LTV_Models",
      "priority": "P1"
    },
    // Add 18 more covering all agents and KB files
  ]
}
```

---

## EXECUTION ORDER

1. `git pull origin feature/multi-agent-architecture`
2. Create `release/v6.0/verticals/` directory
3. Create 2-3 vertical overlay files
4. Create Dataverse seed files
5. Create routing test scenarios
6. Commit each logically grouped change
7. Push to origin

---

## COMPLIANCE CHECKLIST

For vertical overlays:
- [ ] Plain text only
- [ ] ALL-CAPS section headers
- [ ] Hyphens for lists (no bullets)
- [ ] ASCII only
- [ ] Under 36,000 chars
- [ ] Cross-references included
- [ ] Version history at bottom

For CSV files:
- [ ] Proper headers
- [ ] Consistent formatting
- [ ] No special characters in values
- [ ] Descriptions are clear

---

## GIT COMMANDS

```bash
# After each task group
git add release/v6.0/verticals/
git commit -m "feat: Add vertical overlay files for [industries]"

git add release/v6.0/platform/dataverse/
git commit -m "feat: Add Dataverse seed data for multi-agent routing"

git add release/v6.0/tests/
git commit -m "test: Add routing validation scenarios"

git push origin feature/multi-agent-architecture
```

---

## WHEN COMPLETE

Notify user with:
- List of files created
- Character counts for overlays
- Row counts for CSVs
- Commit hashes

Claude.ai will have completed:
- Full validation suite
- Merge to deploy/mastercard
- 2-3 other vertical overlays (B2B, Ecommerce, CPG or Healthcare, Financial)
