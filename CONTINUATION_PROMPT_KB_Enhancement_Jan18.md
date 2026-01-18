# MPA v6.0 KB Enhancement Continuation Prompt
## Date: January 18, 2026
## Session: Claude.ai KB File Creation - Batch Continuation

---

## CONTEXT

Previous session completed:
1. ROAS formula corrections across all v6.0 agent KB files (correct formula: ROAS = (Revenue - Spend) / Spend)
2. Created 5 new KB files:
   - AUD_KB_Propensity_Models_v1.txt
   - AUD_KB_Cluster_Analysis_v1.txt
   - SPO_KB_Auction_Dynamics_v1.txt
   - ANL_KB_Causal_Inference_v1.txt
   - ANL_KB_Forecasting_Methods_v1.txt
3. Started Batch 1 - Platform Guides (2 of 4 complete):
   - CHA_KB_Google_Ads_Guide_v1.txt ✅
   - CHA_KB_Meta_Ads_Guide_v1.txt ✅
   - CHA_KB_Programmatic_DSP_Guide_v1.txt ✅
   - CHA_KB_LinkedIn_B2B_Guide_v1.txt ❌ (not started)

All changes committed and pushed to:
- feature/multi-agent-architecture
- deploy/mastercard
- deploy/personal

---

## REMAINING WORK - CLAUDE.AI

### Batch 1 - Platform Guides (1 remaining)
- [ ] CHA_KB_LinkedIn_B2B_Guide_v1.txt

### Batch 2 - Analytics Deep Dives (2 files)
- [ ] ANL_KB_MMM_Advanced_v1.txt
- [ ] CHA_KB_Automated_Bidding_v1.txt

### Batch 3 - Privacy & Measurement (4 files)
- [ ] PRF_KB_Privacy_Measurement_v1.txt
- [ ] PRF_KB_Clean_Room_Analytics_v1.txt
- [ ] PRF_KB_Creative_Testing_v1.txt
- [ ] PRF_KB_Attention_Metrics_v1.txt

### Batch 4 - Audience & Identity (2 files)
- [ ] AUD_KB_Identity_Resolution_v1.txt
- [ ] AUD_KB_Contextual_Targeting_v1.txt

### Batch 5 - New Verticals (4 files)
- [ ] Technology_SaaS_Vertical_Overlay_v1.txt
- [ ] Education_Vertical_Overlay_v1.txt
- [ ] Entertainment_Media_Vertical_Overlay_v1.txt
- [ ] NonProfit_Vertical_Overlay_v1.txt

### Batch 6 - Shared Resources & Sustainability (4 files)
- [ ] SHARED_Glossary_v1.txt
- [ ] SHARED_Formula_Reference_v1.txt
- [ ] SPO_KB_Carbon_Measurement_v1.txt
- [ ] ANL_KB_AI_Creative_Optimization_v1.txt

**Total Remaining: 17 KB files**

---

## VS CODE TASKS (After KB Files Complete)

1. Seed data CSV updates:
   - Fix mpa_kpi_seed.csv ROAS formula
   - Update mpa_benchmark_seed.csv with 2025-2026 benchmarks

2. KB Index file generation:
   - Create index files for each agent to improve RAG retrieval

3. Agent instruction optimization:
   - Review all 7 agent instruction files
   - Optimize to 7,500-7,999 characters
   - Verify 6-rule compliance

4. Validation:
   - Run validation suite on all new KB files
   - Run Braintrust evaluation
   - Test RAG retrieval with new KB files

---

## FILE LOCATIONS

Repository: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
Branch: feature/multi-agent-architecture

Agent KB paths:
- release/v6.0/agents/cha/kb/
- release/v6.0/agents/anl/kb/
- release/v6.0/agents/aud/kb/
- release/v6.0/agents/spo/kb/
- release/v6.0/agents/prf/kb/
- release/v6.0/agents/orc/kb/
- release/v6.0/agents/doc/kb/

Vertical overlays:
- release/v6.0/verticals/

Shared resources (new directory needed):
- release/v6.0/shared/

---

## KB FILE REQUIREMENTS

All KB files must be:
1. 6-Rule Compliant:
   - ALL-CAPS headers
   - Hyphens only (no bullets/numbers in prose)
   - ASCII characters only
   - Zero visual dependencies
   - Mandatory professional language
   - Professional tone

2. Under 36,000 characters

3. Include standard header:
```
[AGENT] KNOWLEDGE BASE - [TOPIC] v1
VERSION: 1.0
STATUS: Production Ready
COMPLIANCE: 6-Rule Compliant
```

4. Include standard footer:
```
================================================================================
END OF DOCUMENT
================================================================================
```

---

## CURRENT GIT STATE

Last commit: 512df821 "feat: Add enhanced KB files for AUD, SPO, and ANL agents"
Branch: feature/multi-agent-architecture (synced with origin)
Deploy branches: Both updated (deploy/mastercard, deploy/personal)

---

## INSTRUCTION TO CONTINUE

"Continue creating the remaining 17 KB files for the v6.0 multi-agent architecture. Start with CHA_KB_LinkedIn_B2B_Guide_v1.txt, then proceed through the batches in order. Commit after each batch. After all KB files are complete, create a VS Code continuation prompt for the seed data, index files, and validation tasks."
