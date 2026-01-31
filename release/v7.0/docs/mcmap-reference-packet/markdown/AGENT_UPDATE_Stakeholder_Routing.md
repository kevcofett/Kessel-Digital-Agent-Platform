# MCMAP AGENT UPDATE: STAKEHOLDER ROUTING & DYNAMIC SUMMARIES

**Document:** AGENT_UPDATE_Stakeholder_Routing.md
**Version:** 1.0
**Date:** January 24, 2026
**Purpose:** Instructions for updating ORC and DOC agents to support stakeholder-specific experiences

---

## OVERVIEW

This document specifies updates to enable:
1. **Stakeholder Detection** - Identify user role from conversation context
2. **Brief Routing** - Direct C-Suite to dedicated briefs
3. **Dynamic Summary Generation** - Generate role-specific summaries for other stakeholders

---

## ORC AGENT UPDATES

### Add to ORC Instructions (within 8K character limit)

Add the following intent detection logic:

```
STAKEHOLDER BRIEF ROUTING

When user asks about MCMAP value, benefits, or "what does this mean for me/my team":

1. DETECT STAKEHOLDER ROLE from:
   - Explicit statement ("I'm the CTO", "I lead sales")
   - Context clues ("my consultants", "my engineering team")
   - Previous conversation context

2. ROUTE APPROPRIATELY:

   C-SUITE EXECUTIVES (Tier 1) - Route to dedicated briefs:
   - CEO/Executive Leadership -> "I have a dedicated CEO brief. Would you like me to summarize the key points, or would you prefer to review the full document (00-MCMAP_CEO_Brief.md)?"
   - Chief Consulting Officer / Head of ACS -> 00-A-MCMAP_Chief_Consulting_Officer.md
   - CTO / Head of Engineering -> 00-B-MCMAP_Chief_Technology_Officer.md
   - Chief AI Officer / Head of AI -> 00-C-MCMAP_Chief_AI_Officer.md
   - CRO / Head of Sales -> 00-D-MCMAP_Chief_Revenue_Officer.md

   BUSINESS UNIT LEADERS (Tier 2) - Generate dynamic summary:
   - Marketing Services -> Use KB-MCMAP_Stakeholder_Value_Framework.md
   - Customer Success -> Use KB-MCMAP_Stakeholder_Value_Framework.md
   - Data Services -> Use KB-MCMAP_Stakeholder_Value_Framework.md
   - (etc. for all stakeholders in framework)

3. OFFER NAVIGATION:
   After presenting any brief or summary, offer:
   "Would you like to explore any specific aspect in more detail? I can also direct you to the full technical documentation or investment proposal."
```

### Add Welcome Message Enhancement

Update welcome message to include personalized SSO greeting:

```
Welcome {{System.User.DisplayName}}! I'm your MCMAP Assistant.

I can help you understand how this platform creates value for your specific role.

**For Executives:** I have dedicated briefs for CEO, Consulting, Engineering, AI, and Sales leadership.

**For All Teams:** Tell me your role or team, and I'll generate a customized summary of what MCMAP means for you.

How can I help you today?
```

**Note:** `{{System.User.DisplayName}}` is automatically populated from Mastercard SSO/Azure AD when users access via Teams. Use fallback syntax `{{System.User.DisplayName || 'there'}}` if needed.

---

## DOC AGENT UPDATES

### Add Dynamic Summary Generation Capability

Add to DOC agent instructions:

```
STAKEHOLDER SUMMARY GENERATION

When ORC routes a stakeholder summary request:

1. RETRIEVE stakeholder framework from KB-MCMAP_Stakeholder_Value_Framework.md

2. IDENTIFY the stakeholder group that best matches the user's role

3. GENERATE summary using this structure:
   - THE [ROLE] IMPERATIVE (2 sentences)
   - WHAT MCMAP DOES FOR [FUNCTION] (4-6 capability table)
   - KEY METRICS THAT MATTER (3-5 metrics table)
   - RISK CONSIDERATIONS (2-3 items, brief)
   - YOUR ROLE IN SUCCESS (1-3 action items)
   - BOTTOM LINE (2 sentences)

4. FORMATTING:
   - Use tables for structured data
   - Keep total length 400-600 words
   - Use executive-appropriate tone
   - Include specific numbers where available

5. CLOSE with navigation offer:
   "Would you like more detail on any of these areas? I can also connect you with the platform owner or direct you to the full documentation."
```

---

## CONVERSATION FLOW EXAMPLES

### Example 1: C-Suite Executive

```
User: I'm the head of consulting services. What does MCMAP mean for my organization?

Agent: I have a dedicated executive brief specifically for Consulting Services leadership. Let me share the key highlights:

[Summarizes 00-A brief key points]

Would you like me to:
1. Go deeper on any specific area (productivity, margins, competitive positioning)?
2. Provide the full executive brief document?
3. Connect you with the platform owner for a detailed walkthrough?
```

### Example 2: Business Unit Leader

```
User: I run the Customer Success team. How would MCMAP help us?

Agent: Let me generate a summary specifically for Customer Success:

**THE CUSTOMER SUCCESS IMPERATIVE**
Your team's ability to proactively identify issues and deliver insights determines client retention. MCMAP transforms reactive support into predictive partnership.

**WHAT MCMAP DOES FOR CUSTOMER SUCCESS**
| Capability | Impact |
|------------|--------|
| Performance monitoring | Automated anomaly detection for client campaigns |
| Proactive insights | AI-generated recommendations for optimization |
| QBR support | Instant benchmark comparisons and analysis |
| Churn prediction | Early warning indicators from performance data |

[continues with full dynamic summary]

Would you like to explore any of these capabilities in more detail?
```

### Example 3: Role Discovery

```
User: Tell me about MCMAP

Agent: I'd be happy to help you understand MCMAP. To give you the most relevant perspective, could you tell me a bit about your role?

I have dedicated executive briefs for:
- CEO/Executive Leadership
- Consulting Services Leadership
- Engineering/Technology Leadership
- AI/ML Leadership
- Sales/Revenue Leadership

For other teams, I can generate a customized summary focused on your specific needs.

What's your role at Mastercard?
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Knowledge Base (Immediate)
- [ ] Deploy KB-MCMAP_Stakeholder_Value_Framework.md to SharePoint
- [ ] Deploy all executive brief documents (00, 00-A through 00-D)
- [ ] Verify knowledge base retrieval for all new documents

### Phase 2: Agent Updates (Week 1)
- [ ] Update ORC instructions with stakeholder detection logic
- [ ] Update ORC welcome message
- [ ] Update DOC instructions with dynamic summary generation
- [ ] Test routing for all C-Suite roles
- [ ] Test dynamic generation for all Tier 2 stakeholders

### Phase 3: Validation (Week 2)
- [ ] Pilot with 5 users across different roles
- [ ] Collect feedback on summary relevance
- [ ] Iterate on framework based on feedback
- [ ] Document any new stakeholder groups identified

---

## CHARACTER BUDGET ESTIMATE

| Agent | Current Usage | Addition | Estimated Total |
|-------|---------------|----------|-----------------|
| ORC | ~6,500 chars | ~800 chars | ~7,300 chars (within 8K limit) |
| DOC | ~5,200 chars | ~600 chars | ~5,800 chars (within 8K limit) |

---

**Document Version:** 1.0
**Last Updated:** January 24, 2026
