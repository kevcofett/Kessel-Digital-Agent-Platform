# MPA Copilot Studio Topics

## Topic Configuration for Mastercard Deployment

### Topic 1: Start Planning Session
- **Display Name:** Start Media Planning
- **Trigger Phrases:**
  - start a new media plan
  - create media plan
  - new campaign plan
  - help me plan media
  - begin planning
  - start planning session
- **Action:** Call flow MPA_InitializeSession
- **Inputs:** pathway (choice: EXPRESS/GUIDED/STANDARD)

### Topic 2: Search Benchmarks
- **Display Name:** Search Industry Benchmarks
- **Trigger Phrases:**
  - what are typical CPMs
  - benchmark data for
  - industry benchmarks
  - what's a good CTR
  - average performance for
- **Action:** Call flow MPA_SearchBenchmarks
- **Inputs:** metric_type, channel, vertical (extracted from message)

### Topic 3: Provide Feedback
- **Display Name:** Provide Feedback
- **Trigger Phrases:**
  - that was helpful
  - that wasn't helpful
  - good answer
  - not what I needed
  - this is wrong
- **Action:** Call flow MPA_CaptureFeedback
- **Inputs:** feedback_type (auto-detected), feedback_text

### Topic 4: Generate Document
- **Display Name:** Generate Plan Document
- **Trigger Phrases:**
  - generate the document
  - create the media plan document
  - export the plan
  - download the plan
- **Action:** Call flow MPA_GenerateDocument
- **Inputs:** format (DOCX/PDF)

### Topic 5: Search Channels
- **Display Name:** Search Channel Information
- **Trigger Phrases:**
  - tell me about display advertising
  - what channels should I use
  - CTV options
  - paid social channels
- **Action:** Call flow MPA_SearchChannels
- **Inputs:** channel_query (extracted)

### Topic 6: Import Performance Data
- **Display Name:** Import Performance Data
- **Trigger Phrases:**
  - import data
  - upload performance
  - add campaign results
- **Action:** Call flow MPA_ImportPerformance

### Topic 7: Budget Allocation
- **Display Name:** Budget Allocation Help
- **Trigger Phrases:**
  - how should I allocate budget
  - budget split across channels
  - recommend budget allocation
  - optimize my budget
- **Action:** Trigger Knowledge Base search for budget allocation guidance
- **KB Files:** MPA_Step5_Budget_Allocation_v5_5.txt

### Topic 8: Geography Selection
- **Display Name:** Geography and DMA Planning
- **Trigger Phrases:**
  - which DMAs should I target
  - geography recommendations
  - regional targeting
  - local market selection
- **Action:** Trigger Knowledge Base search for geography guidance
- **KB Files:** MPA_Geography_DMA_Planning_v5_5.txt

### Topic 9: Audience Definition
- **Display Name:** Audience Targeting
- **Trigger Phrases:**
  - define my target audience
  - who should I target
  - audience segments
  - demographic targeting
- **Action:** Trigger Knowledge Base search for audience guidance
- **KB Files:** MPA_Step3_Audience_v5_5.txt

### Topic 10: Measurement Setup
- **Display Name:** Measurement and KPIs
- **Trigger Phrases:**
  - how do I measure success
  - what KPIs should I track
  - measurement framework
  - attribution setup
- **Action:** Trigger Knowledge Base search for measurement guidance
- **KB Files:** MPA_Step8_Measurement_v5_5.txt
