# ADIS Integration End-to-End Test Script

## Overview

This test script validates ADIS integration in MPA v6.4 for Personal (Aragorn AI) environment. Execute these tests after:
- Copilot Studio instructions updated to v6.4
- KB sources added to Copilot Studio
- Power Automate flows deployed
- Azure Functions deployed

## Test Environment

- **Agent**: Media Planning Agent (MPA)
- **Version**: v6.4
- **Environment**: Personal (Aragorn AI)
- **Date**: _______________
- **Tester**: _______________

---

## Part 1: Trigger Detection Tests

### Test 1.1: Direct Upload Request

**User Input:**
```
I have customer transaction data I want to analyze
```

**Expected Response Contains:**
- [ ] Acknowledgment of data analysis capability
- [ ] Mention of ADIS or customer segmentation
- [ ] File format support (Excel, CSV, Word, PDF)
- [ ] File size limit (250MB)
- [ ] Invitation to upload

**Pass/Fail:** _____ **Notes:** _____________________

---

### Test 1.2: RFM Keyword Trigger

**User Input:**
```
Can you help me with RFM analysis of my customer base?
```

**Expected Response Contains:**
- [ ] Recognition of RFM analysis request
- [ ] Explanation of RFM (Recency, Frequency, Monetary)
- [ ] Offer to analyze customer data
- [ ] Request for data upload or file

**Pass/Fail:** _____ **Notes:** _____________________

---

### Test 1.3: CLV Keyword Trigger

**User Input:**
```
I need to calculate customer lifetime value for my segments
```

**Expected Response Contains:**
- [ ] Recognition of CLV request
- [ ] Mention of CLV calculation capability
- [ ] Data requirements (transaction history)
- [ ] Offer to run analysis

**Pass/Fail:** _____ **Notes:** _____________________

---

### Test 1.4: Best Customers Trigger

**User Input:**
```
How do I identify my best customers for targeting?
```

**Expected Response Contains:**
- [ ] Discussion of customer value segmentation
- [ ] Mention of RFM or value-based analysis
- [ ] Offer ADIS analysis if data available
- [ ] Ask about existing customer data

**Pass/Fail:** _____ **Notes:** _____________________

---

### Test 1.5: Segmentation Trigger

**User Input:**
```
I want to segment my customers for a targeted campaign
```

**Expected Response Contains:**
- [ ] Acknowledgment of segmentation goal
- [ ] Options for segmentation approaches
- [ ] Offer ADIS data-driven segmentation
- [ ] Ask about available customer data

**Pass/Fail:** _____ **Notes:** _____________________

---

## Part 2: Workflow Integration Tests

### Test 2.1: Step 3-4 Audience - ADIS Prompt

**Setup:** Complete Steps 1-2 first with this context:
```
User: I want to acquire 5000 new customers
User: My average order value is $75 and customers typically order 3 times per year
```

**Then at Step 3-4:**
```
User: For targeting, I want to focus on high-value customer segments
```

**Expected Response Contains:**
- [ ] Context callback to acquisition goal
- [ ] Question about customer transaction data
- [ ] Offer to segment with ADIS
- [ ] Mention of channel recommendations by segment

**Pass/Fail:** _____ **Notes:** _____________________

---

### Test 2.2: Step 5 Budget - AMMO Offer

**Setup:** Complete Steps 1-4 with audience defined. Then:

**User Input:**
```
My total budget is $500,000 for this campaign
```

**Expected Response Contains:**
- [ ] Context callback to established audience
- [ ] Budget acknowledgment with calculation
- [ ] Offer AMMO optimization (if ADIS audiences exist)
- [ ] Mention of channel affinity optimization

**Pass/Fail:** _____ **Notes:** _____________________

---

### Test 2.3: Step 7 Channels - Segment Affinity Reference

**Setup:** Complete Steps 1-6. If ADIS audiences were created, then:

**User Input:**
```
Which channels should I prioritize for this campaign?
```

**Expected Response Contains:**
- [ ] Reference to audience segments
- [ ] Channel recommendations with affinity reasoning
- [ ] Champions/high-value: email, direct mail emphasis
- [ ] At-risk segments: retargeting emphasis
- [ ] KB benchmark citation for channel performance

**Pass/Fail:** _____ **Notes:** _____________________

---

## Part 3: Knowledge Base Retrieval Tests

### Test 3.1: ADIS Model Information

**User Input:**
```
What types of customer analysis models are available?
```

**Expected Response Contains:**
- [ ] List of available models (RFM, Decile, Cohort, CLV, Clustering)
- [ ] Brief description of each
- [ ] Data requirements mention
- [ ] Reference to KB or ADIS documentation

**Pass/Fail:** _____ **Notes:** _____________________

---

### Test 3.2: RFM Segment Details

**User Input:**
```
What are the RFM segments and what do they mean?
```

**Expected Response Contains:**
- [ ] List of 11 RFM segments (Champions, Loyal, At Risk, etc.)
- [ ] Description of segment characteristics
- [ ] Recommended actions per segment
- [ ] Channel affinity hints

**Pass/Fail:** _____ **Notes:** _____________________

---

### Test 3.3: Channel Affinity Information

**User Input:**
```
Which channels work best for different customer segments?
```

**Expected Response Contains:**
- [ ] Segment-channel affinity explanation
- [ ] Champions: high email/direct mail affinity
- [ ] At Risk: retargeting/programmatic affinity
- [ ] Lost: suppression recommendation
- [ ] KB attribution

**Pass/Fail:** _____ **Notes:** _____________________

---

## Part 4: Error Handling Tests

### Test 4.1: Unsupported Analysis Request

**User Input:**
```
Can you run a propensity model on my customer data?
```

**Expected Response Contains:**
- [ ] Acknowledgment of propensity modeling
- [ ] Note about approval requirements (if Mastercard context)
- [ ] Alternative suggestions (RFM, CLV as proxies)
- [ ] Graceful handling without system error

**Pass/Fail:** _____ **Notes:** _____________________

---

### Test 4.2: Missing Data Handling

**User Input:**
```
Run RFM analysis
```
(Without providing any data)

**Expected Response Contains:**
- [ ] Recognition of analysis request
- [ ] Request for data upload
- [ ] File format guidance
- [ ] Minimum data requirements

**Pass/Fail:** _____ **Notes:** _____________________

---

## Part 5: Full Conversation Flow Test

### Test 5.1: Complete ADIS-Integrated Planning Session

Execute this complete conversation and verify each checkpoint:

**Turn 1:**
```
User: Hi, I need help planning a media campaign
```
- [ ] Warm greeting with 10-step overview
- [ ] First question about business outcome

**Turn 2:**
```
User: I want to increase repeat purchases from existing customers
```
- [ ] Objective locked: retention/repeat purchase
- [ ] Move toward KPI discussion

**Turn 3:**
```
User: My KPI is repeat purchase rate, targeting 25% improvement
```
- [ ] KPI locked with target
- [ ] Benchmark comparison
- [ ] Move to Step 2 economics

**Turn 4:**
```
User: Average order is $120, margin is 35%
```
- [ ] Economics captured
- [ ] Calculation shown
- [ ] Move toward audience

**Turn 5:**
```
User: I have 3 years of transaction data for 50,000 customers
```
- [ ] **ADIS trigger detected**
- [ ] Offer to analyze customer data
- [ ] Mention RFM segmentation for retention focus

**Turn 6:**
```
User: Yes, please analyze my customers. What do you need?
```
- [ ] File upload instructions
- [ ] Format requirements
- [ ] Column expectations (customer ID, date, amount)

**Turn 7:**
```
User: I've uploaded the file. [Simulate: file processed, RFM complete]
Agent should report segments found.
```
- [ ] Segment summary (Champions: X%, At Risk: Y%, etc.)
- [ ] Value distribution
- [ ] Audience creation offer

**Turn 8:**
```
User: Create audiences for Champions and At Risk segments
```
- [ ] Audiences created confirmation
- [ ] Member counts and values
- [ ] Channel recommendations per audience
- [ ] Move toward budget

**Turn 9:**
```
User: My budget is $300,000
```
- [ ] Budget acknowledged
- [ ] **AMMO optimization offer**
- [ ] Mention audience-aware allocation

**Turn 10:**
```
User: Yes, optimize the budget across my audiences
```
- [ ] AMMO results presented
- [ ] Allocation by channel and audience
- [ ] Expected performance metrics
- [ ] ROI projection

**Turn 11:**
```
User: Which channels should I prioritize?
```
- [ ] **Segment affinity reference**
- [ ] Champions: email, direct mail prioritized
- [ ] At Risk: retargeting, programmatic prioritized
- [ ] Allocation percentages from AMMO

**Overall Flow Pass/Fail:** _____ 

**Notes:** _____________________

---

## Test Results Summary

| Part | Tests | Passed | Failed |
|------|-------|--------|--------|
| 1. Trigger Detection | 5 | ___ | ___ |
| 2. Workflow Integration | 3 | ___ | ___ |
| 3. KB Retrieval | 3 | ___ | ___ |
| 4. Error Handling | 2 | ___ | ___ |
| 5. Full Flow | 1 | ___ | ___ |
| **Total** | **14** | ___ | ___ |

**Pass Rate:** _____ %

**Overall Assessment:** ☐ Ready for Production ☐ Needs Fixes

---

## Issues Found

| Test | Issue | Severity | Notes |
|------|-------|----------|-------|
| | | | |
| | | | |
| | | | |

---

## Sign-Off

- [ ] All critical tests passed
- [ ] ADIS triggers working correctly
- [ ] KB retrieval returning ADIS content
- [ ] AMMO integration functional
- [ ] Ready to replicate for Mastercard environment

**Approved By:** _______________ **Date:** _______________
