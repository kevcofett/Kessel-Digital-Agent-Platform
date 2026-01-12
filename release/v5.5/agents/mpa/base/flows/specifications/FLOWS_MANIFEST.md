# Power Automate Flows Manifest
Generated: 2026-01-11 22:29:47
Environment: personal

## Flows to Deploy

| # | File | Flow Name | Connections |
|---|------|-----------|-------------|
| 1 | flow_01_MPA_InitializeSession.json | flow_01_MPA_InitializeSession | None |
| 2 | flow_02_MPA_CreatePlan.json | flow_02_MPA_CreatePlan | None |
| 3 | flow_03_MPA_SaveSection.json | flow_03_MPA_SaveSection | None |
| 4 | flow_04_MPA_ValidatePlan.json | flow_04_MPA_ValidatePlan | None |
| 5 | flow_05_MPA_GenerateDocument.json | flow_05_MPA_GenerateDocument | None |
| 6 | flow_06_MPA_SearchBenchmarks.json | flow_06_MPA_SearchBenchmarks | None |
| 7 | flow_07_MPA_SearchChannels.json | flow_07_MPA_SearchChannels | None |
| 8 | flow_08_MPA_ImportPerformance.json | flow_08_MPA_ImportPerformance | None |
| 9 | flow_09_MPA_CreatePostMortem.json | flow_09_MPA_CreatePostMortem | None |
| 10 | flow_10_MPA_PromoteLearning.json | flow_10_MPA_PromoteLearning | None |
| 11 | flow_11_MPA_ProcessMediaBrief.json | flow_11_MPA_ProcessMediaBrief | None |
| 12 | flow_12_MPA_CaptureFeedback.json | flow_12_MPA_CaptureFeedback | None |
| 13 | flow_13_MPA_TrackKBUsage.json | flow_13_MPA_TrackKBUsage | None |
## Manual Import Steps

1. Open Power Automate: https://make.powerautomate.com
2. Select correct environment
3. Go to My flows → Import
4. Upload flow definition JSON
5. Configure connection references
6. Save and enable flow

## Connection Types Required

- **Microsoft Dataverse**: For reading/writing to Dataverse tables
- **SharePoint**: For document library access
- **HTTP**: For external API calls (if used)

