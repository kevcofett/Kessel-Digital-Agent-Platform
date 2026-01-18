# MPA v6.0 KB Enhancement - FINAL Continuation Prompt
## Date: January 18, 2026
## Session: Claude.ai / VS Code Handoff

---

## COMPLETED WORK

### Session 1 - ROAS Corrections & Initial KB Files
- Corrected ROAS formula across all v6.0 agent KB files
- Formula: ROAS = (Revenue - Spend) / Spend
- Created 5 initial enhancement files (AUD, SPO, ANL)

### Session 2 - Batch 1-5 KB Files (16 new files)

**Platform Guides (CHA Agent) - 4 files:**
- CHA_KB_Google_Ads_Guide_v1.txt ✅
- CHA_KB_Meta_Ads_Guide_v1.txt ✅
- CHA_KB_Programmatic_DSP_Guide_v1.txt ✅
- CHA_KB_LinkedIn_B2B_Guide_v1.txt ✅

**Analytics Deep Dives (ANL Agent) - 1 file:**
- ANL_KB_MMM_Advanced_v1.txt ✅

**Privacy & Measurement (PRF Agent) - 4 files:**
- PRF_KB_Privacy_Measurement_v1.txt ✅
- PRF_KB_Clean_Room_Analytics_v1.txt ✅
- PRF_KB_Creative_Testing_v1.txt ✅
- PRF_KB_Attention_Metrics_v1.txt ✅

**Audience & Identity (AUD Agent) - 2 files:**
- AUD_KB_Identity_Resolution_v1.txt ✅
- AUD_KB_Contextual_Targeting_v1.txt ✅

**New Verticals - 4 files:**
- Technology_SaaS_Vertical_Overlay_v1.txt ✅
- Education_Vertical_Overlay_v1.txt ✅
- Entertainment_Media_Vertical_Overlay_v1.txt ✅
- NonProfit_Vertical_Overlay_v1.txt ✅

---

## CURRENT INVENTORY

| Agent | KB Files | Status |
|-------|----------|--------|
| ANL | 8 files | Complete |
| AUD | 10 files | Complete |
| CHA | 9 files | Complete |
| DOC | 5 files | Complete |
| ORC | 4 files | Complete |
| PRF | 9 files | Complete |
| SPO | 6 files | Complete |
| **Verticals** | **12 files** | **Complete** |

**Total: 58 KB files + 12 verticals = 70 documents**

---

## REMAINING WORK FOR VS CODE

### Batch 6 - Shared Resources (NEW - 4 files)

Create new directory: `release/v6.0/shared/`

| File | Content | Priority |
|------|---------|----------|
| SHARED_Glossary_v1.txt | Unified terminology across all agents | Medium |
| SHARED_Formula_Reference_v1.txt | Master formula sheet with correct ROAS | High |
| SPO_KB_Carbon_Measurement_v1.txt | Carbon footprint, Scope3, green PMPs | Low |
| CHA_KB_Automated_Bidding_v1.txt | Smart bidding deep dive, value-based bidding | Medium |

### Seed Data Updates

1. **mpa_kpi_seed.csv** - Fix ROAS formula definition
2. **mpa_benchmark_seed.csv** - Update to 2025-2026 benchmarks
3. Add ROAS calculation note explaining correct formula

### Agent Instruction Optimization

Review and optimize all 7 agent instruction files:
- Target: 7,500-7,999 characters exactly
- Verify 6-rule compliance
- Check routing logic
- Ensure consistent response patterns

Files to review:
- ANL_Copilot_Instructions_v1.txt
- AUD_Copilot_Instructions_v1.txt
- CHA_Copilot_Instructions_v1.txt
- DOC_Copilot_Instructions_v1.txt
- ORC_Copilot_Instructions_v1.txt
- PRF_Copilot_Instructions_v1.txt
- SPO_Copilot_Instructions_v1.txt

### Validation & Testing

1. Run validation suite on all new KB files
2. Check character counts (must be under 36,000)
3. Verify 6-rule compliance
4. Run Braintrust evaluation
5. Test RAG retrieval with new KB files

---

## GIT STATE

```
Latest commit: a8c44fc8 "feat: Add Batch 1-5 KB files for v6.0 multi-agent architecture"
Branch: feature/multi-agent-architecture (pushed to origin)
Deploy branches: Need merge after VS Code tasks complete
```

---

## VS CODE EXECUTION INSTRUCTIONS

```
1. Create shared resources directory and 4 remaining KB files
2. Update seed data CSVs with correct ROAS formula
3. Run character count validation on all agent instructions
4. Optimize any instructions outside 7,500-7,999 range
5. Run full validation suite
6. Commit all changes
7. Merge to deploy/mastercard and deploy/personal
8. Push all branches
```

---

## FILE LOCATIONS

Repository: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
Branch: feature/multi-agent-architecture

Key paths:
- Agent KB: release/v6.0/agents/{agent}/kb/
- Agent Instructions: release/v6.0/agents/{agent}/instructions/
- Verticals: release/v6.0/verticals/
- Shared (new): release/v6.0/shared/
- Seed data: /mnt/project/mpa_*.csv (project files)

---

## SUCCESS CRITERIA

- [ ] 4 remaining KB files created
- [ ] Seed data CSVs updated with correct ROAS
- [ ] All agent instructions optimized to target range
- [ ] 6-rule compliance verified across all documents
- [ ] Character limits verified (KB: <36K, Instructions: 7.5-8K)
- [ ] All changes committed and merged to deploy branches
- [ ] Braintrust evaluation passed
