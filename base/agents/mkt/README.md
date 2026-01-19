# MKT - Marketing Strategy Agent

## Overview

The Marketing Strategy Agent (MKT) provides expertise in campaign strategy development, creative brief creation, brand positioning, go-to-market planning, and competitive analysis. MKT transforms marketing objectives into actionable strategic plans that drive measurable business outcomes.

## Capabilities

| Capability | Description |
|------------|-------------|
| Campaign Strategy | Comprehensive campaign planning aligned with business objectives |
| Creative Briefs | Structured briefs that guide content and messaging development |
| Brand Positioning | Frameworks for differentiation and market perception |
| GTM Planning | Go-to-market strategies for launches and market entry |
| Competitive Analysis | Landscape assessment and competitive response planning |

## Knowledge Base Files

| File | Size | Content |
|------|------|---------|
| MKT_KB_Campaign_Strategy_v1.txt | 10,419 chars | Campaign planning frameworks, objective setting, measurement |
| MKT_KB_Creative_Briefs_v1.txt | 10,627 chars | Brief structure, insight development, proposition crafting |
| MKT_KB_Brand_Positioning_v1.txt | 10,370 chars | Positioning frameworks, statement development, research |
| MKT_KB_GTM_Planning_v1.txt | 9,493 chars | Go-to-market methodology, pricing, channel strategy |
| MKT_KB_Competitive_Analysis_v1.txt | 10,183 chars | Porter's forces, SWOT, perceptual mapping, win/loss |

**Total KB:** 51,092 characters

## Instructions

- File: `MKT_Copilot_Instructions_v1.txt`
- Size: 5,567 characters (within 8,000 limit)
- Compliance: 6-Rule compliant (ALL-CAPS headers, hyphens-only, ASCII)

## Routing Triggers

Route to MKT when user asks about:
- Campaign strategy development
- Creative brief creation
- Brand positioning frameworks
- Go-to-market planning
- Competitive analysis
- Messaging architecture
- Launch strategy
- Marketing planning

**Keywords:** campaign strategy, creative brief, brand positioning, go-to-market, GTM, competitive analysis, messaging, launch strategy, marketing plan, value proposition

## Agent Coordination

| When MKT Needs | Route To |
|----------------|----------|
| Detailed audience segmentation | AUD |
| Channel allocation and tactics | CHA |
| Financial modeling (NPV, IRR) | ANL |
| Performance benchmarks | PRF |
| Document generation | DOC |
| Strategic frameworks | CST |

## Test Scenarios

See `tests/MKT_Test_Scenarios.json` for:
- 8 primary test cases
- 3 edge case scenarios
- Cross-agent routing tests

## Deployment

### SharePoint KB Upload
Upload all 5 KB files to SharePoint knowledge base folder.

### Copilot Studio Setup
1. Create new agent "MKT - Marketing Strategy"
2. Copy instructions from `MKT_Copilot_Instructions_v1.txt`
3. Add all 5 KB files as knowledge sources
4. Add EAP shared KB files
5. Save and Publish

### Dataverse Registration
Add these capabilities to `eap_capability` table:

| capability_code | capability_name | agent_code |
|-----------------|-----------------|------------|
| MKT_CAMPAIGN_STRATEGY | Campaign Strategy | MKT |
| MKT_CREATIVE_BRIEF | Creative Brief | MKT |
| MKT_POSITIONING | Brand Positioning | MKT |
| MKT_GTM_PLANNING | GTM Planning | MKT |
| MKT_COMPETITIVE | Competitive Analysis | MKT |

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-18 | Initial release with 5 KB files |
