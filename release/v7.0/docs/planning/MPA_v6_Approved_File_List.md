# MPA v6.0 APPROVED FILE LIST (QUICK REFERENCE)

**Total: 37 KB files across 7 agents + EAP shared**

---

## AGENT: ORC (2 files)
```
release/v6.0/agents/orc/instructions/ORC_Copilot_Instructions_v1.txt
release/v6.0/agents/orc/kb/ORC_KB_Routing_Logic_v1.txt
```

## AGENT: ANL (6 files)
```
release/v6.0/agents/anl/instructions/ANL_Copilot_Instructions_v1.txt
release/v6.0/agents/anl/kb/ANL_KB_Analytics_Core_v1.txt         â† CORE
release/v6.0/agents/anl/kb/ANL_KB_MMM_Methods_v1.txt            â† DEEP
release/v6.0/agents/anl/kb/ANL_KB_Bayesian_Inference_v1.txt     â† DEEP
release/v6.0/agents/anl/kb/ANL_KB_Causal_Incrementality_v1.txt  â† DEEP (absorbs NDS spend logic)
release/v6.0/agents/anl/kb/ANL_KB_Budget_Optimization_v1.txt    â† DEEP (absorbs NDS marginal/response/risk)
```

## AGENT: AUD (6 files)
```
release/v6.0/agents/aud/instructions/AUD_Copilot_Instructions_v1.txt
release/v6.0/agents/aud/kb/AUD_KB_Audience_Core_v1.txt          â† CORE (includes 1P data strategy)
release/v6.0/agents/aud/kb/AUD_KB_Identity_Resolution_v1.txt    â† DEEP (absorbs identity graph, household)
release/v6.0/agents/aud/kb/AUD_KB_LTV_Modeling_v1.txt           â† DEEP (absorbs card portfolio)
release/v6.0/agents/aud/kb/AUD_KB_Propensity_ML_v1.txt          â† DEEP
release/v6.0/agents/aud/kb/AUD_KB_Journey_Orchestration_v1.txt  â† DEEP (absorbs ALL CSO content)
```

## AGENT: CHA (5 files)
```
release/v6.0/agents/cha/instructions/CHA_Copilot_Instructions_v1.txt
release/v6.0/agents/cha/kb/CHA_KB_Channel_Core_v1.txt           â† CORE
release/v6.0/agents/cha/kb/CHA_KB_Allocation_Methods_v1.txt     â† DEEP
release/v6.0/agents/cha/kb/CHA_KB_Emerging_Channels_v1.txt      â† DEEP (AI advertising + retail media)
release/v6.0/agents/cha/kb/CHA_KB_Brand_Performance_v1.txt      â† DEEP
```

## AGENT: SPO (4 files)
```
release/v6.0/agents/spo/instructions/SPO_Copilot_Instructions_v1.txt
release/v6.0/agents/spo/kb/SPO_KB_SPO_Core_v1.txt               â† CORE
release/v6.0/agents/spo/kb/SPO_KB_Fee_Analysis_v1.txt           â† DEEP
release/v6.0/agents/spo/kb/SPO_KB_Partner_Evaluation_v1.txt     â† DEEP
```

## AGENT: DOC (3 files)
```
release/v6.0/agents/doc/instructions/DOC_Copilot_Instructions_v1.txt
release/v6.0/agents/doc/kb/DOC_KB_Document_Core_v1.txt          â† CORE
release/v6.0/agents/doc/kb/DOC_KB_Export_Formats_v1.txt         â† DEEP
```

## AGENT: PRF (5 files)
```
release/v6.0/agents/prf/instructions/PRF_Copilot_Instructions_v1.txt
release/v6.0/agents/prf/kb/PRF_KB_Performance_Core_v1.txt       â† CORE
release/v6.0/agents/prf/kb/PRF_KB_Attribution_Methods_v1.txt    â† DEEP
release/v6.0/agents/prf/kb/PRF_KB_Incrementality_Testing_v1.txt â† DEEP
release/v6.0/agents/prf/kb/PRF_KB_Anomaly_Detection_v1.txt      â† DEEP
```

## EAP SHARED (6 files)
```
release/v6.0/platform/eap/kb/EAP_KB_Data_Provenance_v1.txt
release/v6.0/platform/eap/kb/EAP_KB_Confidence_Levels_v1.txt
release/v6.0/platform/eap/kb/EAP_KB_Error_Handling_v1.txt
release/v6.0/platform/eap/kb/EAP_KB_Formatting_Standards_v1.txt
release/v6.0/platform/eap/kb/EAP_KB_Strategic_Principles_v1.txt
release/v6.0/platform/eap/kb/EAP_KB_Communication_Contract_v1.txt
```

---

## DO NOT CREATE (Cancelled)

âŒ Any `UDM_*` files  
âŒ Any `NDS_*` files (content goes to ANL)  
âŒ Any `CSO_*` files (content goes to AUD)  
âŒ Any `SYS_*` files (content goes to EAP)  
âŒ Granular ML files like `ANL_KB_Deep_Learning_*`, `PRF_KB_Shapley_*`, etc.

---

## MERGE MAP (Already Created â†’ Target)

| Source File | â†’ | Target File |
|-------------|---|-------------|
| AUD_KB_Identity_Graph_Algorithms_v1.0.txt | â†’ | AUD_KB_Identity_Resolution_v1.txt |
| AUD_KB_Card_Portfolio_Resolution_v1.0.txt | â†’ | AUD_KB_LTV_Modeling_v1.txt |
| AUD_KB_Household_Resolution_v1.0.txt | â†’ | AUD_KB_Identity_Resolution_v1.txt |
| NDS_KB_Marginal_Return_Estimation_v1.0.txt | â†’ | ANL_KB_Budget_Optimization_v1.txt |
| NDS_KB_Spend_NoSpend_Logic_v1.0.txt | â†’ | ANL_KB_Causal_Incrementality_v1.txt |
| NDS_KB_Multi_Input_Integration_v1.0.txt | â†’ | ANL_KB_Analytics_Core_v1.txt |
| NDS_KB_Risk_Adjusted_Allocation_v1.0.txt | â†’ | ANL_KB_Budget_Optimization_v1.txt |
| NDS_KB_Budget_Response_Functions_v1.0.txt | â†’ | ANL_KB_Budget_Optimization_v1.txt |
| CSO_KB_Journey_State_Models_v1.0.txt | â†’ | AUD_KB_Journey_Orchestration_v1.txt |

---

## CREATION ORDER

1. **EAP Shared (6 files)** - All agents depend on these
2. **Core KB files (6 files)** - One per agent (except ORC)
3. **ANL Deep Modules (4 files)** - Merge NDS content
4. **AUD Deep Modules (4 files)** - Merge CSO content
5. **Remaining Deep Modules (11 files)** - CHA, SPO, DOC, PRF
