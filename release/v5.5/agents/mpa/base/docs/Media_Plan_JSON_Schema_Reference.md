# Media Plan JSON Schema Reference

This document defines the exact JSON structure the Media Planning Agent must generate when calling the Power Automate flow to create a formatted Media Plan document.

## Complete JSON Structure

```json
{
  "metadata": {
    "clientName": "Uniteller",
    "campaignName": "Q1 2026 Customer Acquisition",
    "planDate": "2026-01-15",
    "creator": "Media Planning Agent v5.3"
  },
  "businessObjectives": {
    "objective": "Drive new customer acquisition in high-value DMA corridors",
    "budget": "$500,000",
    "revenueModel": "Transaction-based: $15 average transaction, 8 transactions/customer/year",
    "cacScenarios": "Target CAC $75 (aggressive), Acceptable CAC $150 (conservative)",
    "profitabilityMandate": "Achieve positive unit economics within 6-month payback period"
  },
  "audienceDefinition": {
    "demographics": "Adults 25-54, HHI $35K-$85K, US Hispanic population",
    "behavioralSignals": "International money transfer usage, mobile banking app users, remittance corridor activity",
    "contextualCategories": "Financial services, Hispanic media, family/lifestyle content",
    "brandSafety": "Standard brand safety exclusions, avoid political content, news adjacency controls"
  },
  "budgetAllocation": {
    "tier1": {
      "budget": "$200,000",
      "customers": "2,667"
    },
    "tier2": {
      "budget": "$175,000",
      "customers": "2,333"
    },
    "tier3": {
      "budget": "$125,000",
      "customers": "1,667"
    }
  },
  "channelMix": {
    "paidSocial": "40%",
    "programmaticDisplay": "25%",
    "paidSearch": "20%",
    "ctvOtt": "10%",
    "audio": "5%"
  },
  "dmaAllocation": {
    "tier1": {
      "dmas": [
        {
          "name": "Los Angeles",
          "corridors": "Mexico, Guatemala, El Salvador",
          "audienceVolume": "2,450,000"
        },
        {
          "name": "New York",
          "corridors": "Dominican Republic, Ecuador, Colombia",
          "audienceVolume": "1,850,000"
        },
        {
          "name": "Miami",
          "corridors": "Cuba, Colombia, Venezuela",
          "audienceVolume": "1,200,000"
        },
        {
          "name": "Houston",
          "corridors": "Mexico, Honduras, Guatemala",
          "audienceVolume": "980,000"
        }
      ],
      "subtotal": "6,480,000"
    },
    "tier2": {
      "dmas": [
        {
          "name": "Dallas-Ft. Worth",
          "corridors": "Mexico, El Salvador",
          "audienceVolume": "750,000"
        },
        {
          "name": "Chicago",
          "corridors": "Mexico, Guatemala, Puerto Rico",
          "audienceVolume": "680,000"
        },
        {
          "name": "Phoenix",
          "corridors": "Mexico",
          "audienceVolume": "520,000"
        },
        {
          "name": "San Antonio",
          "corridors": "Mexico",
          "audienceVolume": "410,000"
        }
      ],
      "subtotal": "2,360,000"
    },
    "tier3": {
      "dmas": [
        {
          "name": "San Diego",
          "corridors": "Mexico",
          "audienceVolume": "380,000"
        },
        {
          "name": "Denver",
          "corridors": "Mexico",
          "audienceVolume": "290,000"
        },
        {
          "name": "Las Vegas",
          "corridors": "Mexico, Philippines",
          "audienceVolume": "245,000"
        },
        {
          "name": "Orlando",
          "corridors": "Puerto Rico, Colombia",
          "audienceVolume": "220,000"
        }
      ],
      "subtotal": "1,135,000"
    }
  },
  "performanceTable": [
    {
      "dma": "Los Angeles",
      "corridors": "Mexico, Guatemala, El Salvador",
      "tier": "1",
      "budget": "$80,000",
      "customersCac75": "1,067",
      "customersCac150": "533",
      "remittanceVolume": "$1,280,000",
      "roas": "16.0x"
    }
  ],
  "flightSchedule": {
    "monday": {
      "timeBlock": "6AM-10PM",
      "weeklySpendPct": "12%",
      "dailySpendPct": "100%"
    },
    "tuesday": {
      "timeBlock": "6AM-10PM",
      "weeklySpendPct": "12%",
      "dailySpendPct": "100%"
    },
    "wednesday": {
      "timeBlock": "6AM-10PM",
      "weeklySpendPct": "12%",
      "dailySpendPct": "100%"
    },
    "thursday": {
      "timeBlock": "6AM-11PM",
      "weeklySpendPct": "18%",
      "dailySpendPct": "100%"
    },
    "friday": {
      "timeBlock": "6AM-11PM",
      "weeklySpendPct": "20%",
      "dailySpendPct": "100%"
    },
    "saturday": {
      "timeBlock": "8AM-10PM",
      "weeklySpendPct": "14%",
      "dailySpendPct": "100%"
    },
    "sunday": {
      "timeBlock": "8AM-8PM",
      "weeklySpendPct": "12%",
      "dailySpendPct": "100%"
    }
  },
  "audienceInsights": [
    {
      "name": "Primary Senders",
      "demographics": "Adults 25-44, employed, established households",
      "behavioral": "Regular remittance activity, mobile-first banking",
      "contextual": "Financial news, family content, sports"
    },
    {
      "name": "New to US",
      "demographics": "Adults 18-34, recent arrivals, urban areas",
      "behavioral": "First-time sender signals, banking app installs",
      "contextual": "Immigration resources, job listings, community content"
    },
    {
      "name": "Seasonal Senders",
      "demographics": "Adults 35-54, holiday-driven patterns",
      "behavioral": "Spike around holidays, infrequent but high-value",
      "contextual": "Holiday content, family events, travel"
    },
    {
      "name": "Business Senders",
      "demographics": "Adults 30-55, small business owners",
      "behavioral": "B2B transaction patterns, higher frequency",
      "contextual": "Business news, entrepreneurship, trade content"
    }
  ],
  "demographicDetails": {
    "ageRange": "25-54 primary, 18-65 secondary",
    "incomeRange": "$35,000-$85,000 household income",
    "geography": "Top 12 Hispanic DMAs by remittance corridor volume",
    "language": "Spanish-dominant and bilingual, English secondary",
    "householdComposition": "Multi-generational households, families with children",
    "educationLevel": "High school to some college",
    "employmentStatus": "Employed full-time, service and construction industries",
    "gender": "All genders, slight male skew for primary sender"
  },
  "behavioralSignals": [
    {
      "type": "Transaction History",
      "description": "Previous international money transfer activity"
    },
    {
      "type": "Mobile Banking",
      "description": "Active mobile banking app users"
    },
    {
      "type": "App Install",
      "description": "Competitor remittance app installers"
    },
    {
      "type": "Search Intent",
      "description": "Searched for money transfer, remittance, send money abroad"
    },
    {
      "type": "Location Signals",
      "description": "Visits to money transfer locations, ethnic grocery stores"
    },
    {
      "type": "Language Preference",
      "description": "Spanish-language content consumption"
    },
    {
      "type": "Cross-Border Activity",
      "description": "International calling, travel booking patterns"
    },
    {
      "type": "Life Events",
      "description": "Recent relocation, new job, family events"
    }
  ],
  "contextualCategories": [
    {
      "category": "Financial Services",
      "keywords": "banking, money transfer, remittance, fintech"
    },
    {
      "category": "Hispanic Media",
      "keywords": "Univision, Telemundo, Hispanic lifestyle"
    },
    {
      "category": "Family & Lifestyle",
      "keywords": "family, parenting, home, celebrations"
    },
    {
      "category": "Sports",
      "keywords": "soccer, Liga MX, World Cup, boxing"
    },
    {
      "category": "Entertainment",
      "keywords": "music, telenovelas, streaming, concerts"
    },
    {
      "category": "News & Current Events",
      "keywords": "local news, community events, immigration news"
    }
  ],
  "executiveSummary": "This media plan targets high-value remittance corridors across 12 priority DMAs, allocating $500,000 across a diversified channel mix led by paid social (40%) and programmatic display (25%). The tiered DMA strategy prioritizes Los Angeles, New York, Miami, and Houston markets with the highest corridor volumes, while maintaining presence in emerging markets. Flight scheduling emphasizes Thursday-Friday peak transaction periods with 38% of weekly spend concentrated on these days.",
  "strategicRationale": "The channel mix balances reach (programmatic, CTV) with intent capture (paid search) and engagement (paid social). DMA tiering ensures efficient budget allocation based on corridor volume and competitive intensity. Audience segmentation enables personalized messaging across sender lifecycle stages from new-to-US through established regular senders.",
  "optimizationNotes": "Monitor CAC by DMA weekly and reallocate budget from underperforming markets. Test creative variations by corridor to identify culturally relevant messaging. Evaluate CTV incrementality through geo-holdout testing in Tier 3 markets before scaling. Adjust day-parting based on actual transaction timing data from first 30 days."
}
```

## Field Mapping to Template Placeholders

| JSON Path | Template Tag |
|-----------|-------------|
| metadata.clientName | MP_CLIENT_NAME |
| metadata.campaignName | MP_CAMPAIGN_NAME |
| metadata.planDate | MP_PLAN_DATE |
| metadata.creator | MP_CREATOR |
| businessObjectives.objective | MP_OBJECTIVE |
| businessObjectives.budget | MP_BUDGET |
| businessObjectives.revenueModel | MP_REVENUE_MODEL |
| businessObjectives.cacScenarios | MP_CAC_SCENARIOS |
| businessObjectives.profitabilityMandate | MP_PROFITABILITY_MANDATE |
| audienceDefinition.demographics | MP_DEMOGRAPHICS |
| audienceDefinition.behavioralSignals | MP_BEHAVIORAL_SIGNALS |
| audienceDefinition.contextualCategories | MP_CONTEXTUAL_CATEGORIES |
| audienceDefinition.brandSafety | MP_BRAND_SAFETY |
| budgetAllocation.tier1.budget | MP_TIER1_BUDGET |
| budgetAllocation.tier1.customers | MP_TIER1_CUSTOMERS |
| budgetAllocation.tier2.budget | MP_TIER2_BUDGET |
| budgetAllocation.tier2.customers | MP_TIER2_CUSTOMERS |
| budgetAllocation.tier3.budget | MP_TIER3_BUDGET |
| budgetAllocation.tier3.customers | MP_TIER3_CUSTOMERS |
| channelMix.paidSocial | MP_CHANNEL_PAID_SOCIAL |
| channelMix.programmaticDisplay | MP_CHANNEL_PROGRAMMATIC_DISPLAY |
| channelMix.paidSearch | MP_CHANNEL_PAID_SEARCH |
| channelMix.ctvOtt | MP_CHANNEL_CTV_OTT |
| channelMix.audio | MP_CHANNEL_AUDIO |
| dmaAllocation.tier1.dmas[0].name | MP_T1_DMA1_NAME |
| dmaAllocation.tier1.dmas[0].corridors | MP_T1_DMA1_CORRIDORS |
| dmaAllocation.tier1.dmas[0].audienceVolume | MP_T1_DMA1_AUDIENCE |
| dmaAllocation.tier1.subtotal | MP_T1_SUBTOTAL |
| performanceTable[n].dma | MP_PERF_DMA{n}_NAME |
| performanceTable[n].corridors | MP_PERF_DMA{n}_CORRIDORS |
| performanceTable[n].tier | MP_PERF_DMA{n}_TIER |
| performanceTable[n].budget | MP_PERF_DMA{n}_BUDGET |
| performanceTable[n].customersCac75 | MP_PERF_DMA{n}_CUST_75 |
| performanceTable[n].customersCac150 | MP_PERF_DMA{n}_CUST_150 |
| performanceTable[n].remittanceVolume | MP_PERF_DMA{n}_VOLUME |
| performanceTable[n].roas | MP_PERF_DMA{n}_ROAS |
| flightSchedule.{day}.timeBlock | MP_FLIGHT_{DAY}_TIMEBLOCK |
| flightSchedule.{day}.weeklySpendPct | MP_FLIGHT_{DAY}_WEEKLY_PCT |
| flightSchedule.{day}.dailySpendPct | MP_FLIGHT_{DAY}_DAILY_PCT |
| audienceInsights[n].name | MP_AUDIENCE{n}_NAME |
| audienceInsights[n].demographics | MP_AUDIENCE{n}_DEMOGRAPHICS |
| audienceInsights[n].behavioral | MP_AUDIENCE{n}_BEHAVIORAL |
| audienceInsights[n].contextual | MP_AUDIENCE{n}_CONTEXTUAL |
| demographicDetails.ageRange | MP_DEMO_AGE_RANGE |
| demographicDetails.incomeRange | MP_DEMO_INCOME_RANGE |
| demographicDetails.geography | MP_DEMO_GEOGRAPHY |
| demographicDetails.language | MP_DEMO_LANGUAGE |
| demographicDetails.householdComposition | MP_DEMO_HOUSEHOLD |
| demographicDetails.educationLevel | MP_DEMO_EDUCATION |
| demographicDetails.employmentStatus | MP_DEMO_EMPLOYMENT |
| demographicDetails.gender | MP_DEMO_GENDER |
| behavioralSignals[n].type | MP_BEHAV{n}_TYPE |
| behavioralSignals[n].description | MP_BEHAV{n}_DESC |
| contextualCategories[n].category | MP_CONTEXT{n}_CATEGORY |
| contextualCategories[n].keywords | MP_CONTEXT{n}_KEYWORDS |
| executiveSummary | MP_EXECUTIVE_SUMMARY |
| strategicRationale | MP_STRATEGIC_RATIONALE |
| optimizationNotes | MP_OPTIMIZATION_NOTES |

## Validation Rules

Before calling the Power Automate flow, validate:

1. **Required fields present**: metadata.clientName, metadata.campaignName, businessObjectives.budget
2. **Budget allocation sums to 100%**: tier1 + tier2 + tier3 percentages
3. **Channel mix sums to 100%**: All channel percentages must total 100%
4. **DMA arrays have entries**: At least 1 DMA per tier
5. **Performance table matches DMA count**: Sum of tier DMAs equals performance table rows
6. **Date format**: ISO 8601 (YYYY-MM-DD)
7. **Percentage format**: Include % symbol or decimal

## Template File Location

```
Media_Planning_Agent/templates/Media_Plan_Template.docx
```

## Related Files

- Consulting Template: `Consulting_Agent/templates/Consulting_Deliverable_Template.docx`
- Consulting Schema: `Consulting_Agent/JSON_Schema_Reference.md`
