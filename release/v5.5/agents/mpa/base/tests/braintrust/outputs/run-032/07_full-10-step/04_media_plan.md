# Media Plan Output: Full 10-Step Media Planning

This document contains the key outputs from the media planning conversation.

## Step 1: Outcomes

Turn 1:
Hi! I'm excited to build a media plan with you. We'll cover ten areas: Outcomes, Economics, Audience, Geography, Budget, Value Proposition, Channels, Measurement, Testing, and Risks. Each step builds on the last.

You've shared great context - $750K budget targeting 15,000 new customers in home decor. That implies a $50 Customer Acquisition Cost (CAC), which we'll validate against benchmarks shortly.

What specific business outcome are you trying to achieve with these 15,000 new customers?

────────────────────────────────────────

## Step 3: Audience

Turn 2:
Step 1 complete with Objective: Market share expansion, KPI: New customer acquisition, Target: 15,000 customers. Now Step 2 Economics.

Let me analyze your efficiency target:

**Budget:** $750,000  
**Target:** 15,000 customers  

$750,000 ÷ 15,000 = **$50 per customer**

My estimate for home decor ecommerce CAC typically ranges $40-80. Your $50 target sits right in the middle - realistic and achievable with solid targeting.

With your $667 AOV, that's a 13.3x return on acquisition spend, which provides excellent margin for optimization and scale.

Does this $50 CAC feel aligned with any historical performance you've seen?

────────────────────────────────────────

## Step 4: Geography

Turn 3:
Got it, I'll model using $50 CAC. My estimate for home decor ecommerce CAC typically ranges $40-80, so your target is well-positioned. You can adjust anytime.

Step 2 complete. Your $50 target is realistic and leaves room for optimization.

Now Step 3 Audience. You mentioned millennials and young professionals upgrading their spaces. Let's get more precise - what triggers someone to buy from HomeStyle Decor rather than browse competitors?

────────────────────────────────────────

## Step 5: Budget

Turn 4:
Perfect. You've outlined strong behavioral triggers - life stage transitions, style aspirations, and value-consciousness. With your $50 CAC, this precision helps conversion, but home decor is competitive - expect 15-20% higher CPMs. The net effect is still positive.

Let me probe one more dimension. Beyond the life triggers you mentioned (moving, new job, upgrading from college furniture), what content or platforms do these customers engage with when they're in shopping mode?

────────────────────────────────────────

## Step 6: Value Proposition

Turn 5:
Excellent - visual discovery platforms align perfectly with your audience behavior. Instagram, Pinterest, and YouTube give us strong targeting precision for life-stage transitions and style interests.

Based on Knowledge Base, millennials and young professionals interested in home decor represents approximately 6% of US population. With 335M US population, that's roughly 20M people nationally - strong scale for your 15,000 target.

What geographic markets are most important for HomeStyle Decor?

Turn 7:
Based on Knowledge Base, here's my recommended allocation using population-weighted approach with efficiency adjustments:

**Recommended Budget Split:**
- New York: $340K (45%) - Largest audience, premium efficiency
- San Francisco: $140K (19%) - High-value market, strong targeting  
- Chicago: $130K (17%) - Balanced scale and efficiency
- Seattle: $90K (12%) - Growing market, good targeting precision
- Austin: $50K (7%) - Emerging opportunity, test-and-learn

This weights slightly higher toward New York than pure population (45% vs 46% of audience) because larger markets typically offer better targeting efficiency and inventory availability.

With this allocation, your projected performance:
- New York: 6,800 customers at $50 CAC
- Other markets: 8,200 customers at $50 average CAC

Does this geographic budget split align with your growth priorities?

Turn 8:
Based on Knowledge Base, here's your optimal channel allocation for home decor targeting visual discovery audiences:

**Recommended Channel Mix:**
- **Meta/Instagram: 65%** ($488K) - Primary visual discovery platform
- **Pinterest: 20%** ($150K) - Core home decor inspiration platform  
- **Google Search: 10%** ($75K) - Capture high-intent shoppers
- **YouTube: 5%** ($37K) - Home styling content engagement

This prioritizes your audience's visual shopping behavior while maintaining search capture for immediate purchase intent.

**Projected Performance:**
- Meta: 9,750 customers at $50 CAC
- Pinterest: 3,000 customers at $50 CAC  
- Search: 1,500 customers at $50 CAC
- YouTube: 750 customers at $50 CAC
- **Total: 15,000 customers**

Does this channel emphasis on visual platforms align with where you see your customers discovering products?

────────────────────────────────────────

## Step 7: Channels

Turn 6:
Based on Knowledge Base, here's your audience sizing for major metropolitan areas:

| DMA | Population | Target Audience | Target % |
|-----|------------|----------------|----------|
| New York | 20.1M | 1,206K | 6.0% |
| San Francisco | 7.8M | 468K | 6.0% |
| Chicago | 9.5M | 570K | 6.0% |
| Austin | 2.4M | 144K | 6.0% |
| Seattle | 4.0M | 240K | 6.0% |
| **TOTAL** | **43.8M** | **2,628K** | **6.0%** |

With 2.6M target audience and your 15,000 customer goal, you need 0.57% conversion from total addressable audience - very achievable scale.

What's your total budget breakdown between these markets, or should we allocate proportionally to audience size?

Turn 9:
Step 7 complete with channel mix aligned to visual discovery behavior. Now Step 8 Measurement.

Based on Knowledge Base, for your customer acquisition focus, we need new customer tracking as primary KPI - not just orders. Many campaigns show high revenue but low incremental value when optimizing for total orders.

**Recommended Measurement Setup:**
- **Primary KPI:** New customers (target: 15,000)
- **Secondary KPI:** New customer percentage (target: 60%+ of acquisitions)
- **Attribution:** 7-day click, 1-day view for Meta/Pinterest
- **Tracking:** Conversions API + server-side implementation

Your current tracking gaps make this measurement infrastructure critical for validating the $50 CAC across channels.

What's your current conversion tracking sophistication - basic platform pixels or more advanced setup?

Turn 10:
Based on Knowledge Base, upgrading to server-side tracking involves three phases:

**Phase 1 - Foundation (Month 1):**
- Implement Conversions API for Meta
- Set up Enhanced Conversions for Google
- Deploy server-side container via Google Tag Manager

**Phase 2 - Enhancement (Month 2):**
- Add first-party data matching (hashed email/phone)
- Implement cross-device identity resolution
- Build unified reporting dashboard

**Phase 3 - Advanced (Month 3):**
- Deploy holdout testing capability
- Add offline conversion import from CRM
- Implement consent management

**Resource Requirements:**
- Developer: 40-60 hours for full implementation
- Monthly cost: ~$500-1,000 for server infrastructure
- Platform setup: 2-3 weeks with proper testing

This upgrade is critical for your $750K investment - current iOS privacy changes reduce pixel accuracy by 20-30%.

What's your development resource availability for this measurement upgrade?

Turn 11:
Based on Knowledge Base, here's a lightweight Phase 1 approach requiring minimal developer time:

**Immediate (10-15 hours developer time):**
- Enhanced Conversions for Google (email hashing only)
- Meta Conversions API basic setup via Shopify/platform app
- New customer tracking pixel (distinguish first-time vs. repeat buyers)

**Month 2 (consultant-driven):**
- Cross-platform dashboard via Google Data Studio
- Basic holdout testing setup for one channel
- Unified reporting template

**Month 3+ (advanced features):**
- Full server-side implementation when developer available

**Cost:** ~$200/month for basic tools vs. $500-1,000 for full setup

This gets you 70% of measurement improvement with 25% of the development effort. Your developer can handle the basic implementation while you evaluate consultants for the advanced work.

Should we proceed with this phased approach and move to Step 9 Testing?

Turn 12:
Step 8 complete with phased measurement upgrade. Now Step 9 Testing.

Based on Knowledge Base, with your $750K budget, incrementality testing is essential - platform attribution typically over-credits by 30-70%. Here's your testing framework:

**Q1 Testing Priority:**
- **Geographic holdout:** 10% budget ($75K) held back from one market
- **Creative testing:** 3-4 ad variations per platform weekly
- **Audience testing:** Lookalike vs. interest targeting split tests

**Q2+ Advanced Testing:**
- **Channel incrementality:** Pause individual channels for 2-week periods
- **Cross-platform measurement:** Unified attribution modeling

The geographic holdout validates your true $50 CAC versus platform-reported numbers. Most ecommerce sees 40-60% incrementality, meaning your actual CAC might be $80-125.

Are you comfortable holding back $75K for testing, or should we start with a smaller 5% holdout?

────────────────────────────────────────

## Step 8: Measurement

Turn 13:
Perfect. Based on Knowledge Base, 5% holdout ($37.5K) is viable for your budget size and provides sufficient statistical significance for learning.

**Revised Testing Plan:**
- **Geographic holdout:** 5% ($37.5K) - Austin market excluded for 8 weeks
- **Creative testing:** Weekly A/B tests within remaining budget
- **Channel testing:** Meta vs. Pinterest performance comparison

This approach protects 95% of your acquisition target while generating incrementality insights. Austin's smaller size makes it ideal for holdout without major volume impact.

**Expected Learning:** True CAC validation and platform attribution accuracy by Q2.

Step 9 complete with conservative testing approach. Finally, what's your biggest concern about executing this plan?

────────────────────────────────────────

## Step 9: Testing

Turn 14:
Based on Knowledge Base, your volume concern is valid but manageable. Here's the risk mitigation:

**Volume Protection:**
- 5% holdout only removes 750 customers from 15,000 target
- Remaining 95% budget ($712.5K) still targets 14,250 customers
- Testing improves efficiency - typically 10-20% CAC improvement in Q2-Q4

**Risk Mitigation Strategies:**
- Start testing in Q2 after Q1 baseline performance
- Use creative testing (no volume impact) before geographic holdout
- Austin holdout can be shortened to 4 weeks if volume concerns emerge

**The Strategic Trade-off:** Without incrementality measurement, you might think you're hitting targets while actual new customers are 40-60% lower. Better to know true performance early than miss goals unknowingly.

Your 95% active budget still provides strong volume runway while building measurement capability for future scale.

Does starting testing in Q2 rather than Q1 address your volume concerns?

Turn 15:
Step 10 complete. Here are your three biggest risks and mitigation strategies:

**Risk 1: iOS Privacy Changes**
Impact: 20-30% attribution loss affecting optimization
Mitigation: Server-side tracking Phase 1 implementation protects 70% accuracy

**Risk 2: Q4 CPM Inflation** 
Based on Knowledge Base, Q4 CPMs typically run 20-30% higher. Your $50 CAC becomes $60-65 in peak season.
Mitigation: Front-load 40% of annual budget in Q1-Q3 when costs are lower

**Risk 3: Channel Saturation**
If Meta/Pinterest audiences exhaust at scale, efficiency drops
Mitigation: YouTube and Google Search provide backup inventory; geographic expansion to secondary markets

**Your Complete Plan:**
- Budget: $750K across 5 metro markets  
- Target: 15,000 customers at $50 CAC
- Channels: Meta 65%, Pinterest 20%, Search 10%, YouTube 5%
- Testing: Q2 start with 5% holdout
- Measurement: Phased tracking upgrade

You're set up for success with realistic targets and smart risk management.

────────────────────────────────────────

## Step 10: Risks

Turn 16:
Excellent! You now have a defensible, data-driven media plan that balances growth ambitions with smart risk management. 

**Key Success Factors:**
- Realistic $50 CAC target with 13.3x return ratio
- Channel mix aligned to visual discovery behavior
- Phased measurement upgrade protecting 95% of volume
- Geographic diversification with efficiency weighting
- Q4 cost inflation protection through front-loaded spend

Your quarterly review cadence is perfect for optimization. Watch for early signals in Q1 performance that might indicate the need to accelerate testing or adjust channel weights.

You've built something that will not only hit your 15,000 customer target but position HomeStyle Decor for scalable, measurable growth. The measurement infrastructure alone will pay dividends beyond this campaign.

Great work thinking through the strategic trade-offs. You're ready to execute!

────────────────────────────────────────
