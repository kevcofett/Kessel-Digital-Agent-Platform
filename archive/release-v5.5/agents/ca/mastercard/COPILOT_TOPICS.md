# CA Copilot Studio Topics

## Topic Configuration for Mastercard Deployment - Consulting Agent

### Topic 1: Start Consulting Session
- **Display Name:** Start Consulting Session
- **Trigger Phrases:**
  - start consulting session
  - I need consulting help
  - begin consultation
  - help me with strategy
  - new consulting request
- **Action:** Call flow CA_InitializeSession
- **Inputs:** pathway (choice: EXPRESS/GUIDED/STANDARD)

### Topic 2: Research Query
- **Display Name:** Research Information
- **Trigger Phrases:**
  - research this topic
  - find information about
  - what do we know about
  - industry research on
  - market research for
- **Action:** Trigger Knowledge Base search
- **KB Categories:** BEHAVIORAL, MARKET, COMPETITOR

### Topic 3: Provide Feedback
- **Display Name:** Provide Feedback
- **Trigger Phrases:**
  - that was helpful
  - that wasn't helpful
  - good answer
  - not what I needed
  - this is wrong
- **Action:** Call flow MPA_CaptureFeedback (shared)
- **Inputs:** feedback_type (auto-detected), feedback_text, agent_type=CA

### Topic 4: Competitor Analysis
- **Display Name:** Competitor Analysis
- **Trigger Phrases:**
  - analyze competitors
  - competitive landscape
  - who are the competitors
  - competitor research
- **Action:** Trigger Knowledge Base search for competitor analysis
- **KB Files:** CA_BEHAVIORAL_Competitor_Analysis_v5_5.txt

### Topic 5: Market Trends
- **Display Name:** Market Trends
- **Trigger Phrases:**
  - market trends
  - industry trends
  - what's trending in
  - market outlook
- **Action:** Trigger Knowledge Base search for market trends
- **KB Files:** CA_MARKET_Trends_Analysis_v5_5.txt

### Topic 6: Strategic Recommendations
- **Display Name:** Strategic Recommendations
- **Trigger Phrases:**
  - what do you recommend
  - strategic advice
  - best approach for
  - recommendation for
- **Action:** Aggregate KB search + LLM synthesis
- **KB Categories:** Multiple based on context

### Topic 7: Case Study Search
- **Display Name:** Find Case Studies
- **Trigger Phrases:**
  - show me case studies
  - examples of success
  - similar campaigns
  - reference projects
- **Action:** Trigger Knowledge Base search for case studies
- **KB Files:** CA_CASE_STUDY_*.txt

### Topic 8: Generate Report
- **Display Name:** Generate Consulting Report
- **Trigger Phrases:**
  - generate report
  - create summary document
  - export findings
  - download analysis
- **Action:** Call flow CA_GenerateReport
- **Inputs:** format (DOCX/PDF), sections (array)
