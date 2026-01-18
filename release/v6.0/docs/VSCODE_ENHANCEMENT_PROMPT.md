# VS CODE CLAUDE: MULTI-AGENT ENHANCEMENT - PARALLEL WORKSTREAM

**Date:** January 18, 2026
**Branch:** feature/multi-agent-architecture
**Objective:** Enhance multi-agent KB depth (VS Code portion)

---

## YOUR ASSIGNMENTS

While Claude.ai handles AUD and DOC enhancements, you will:

1. **Expand SPO Instructions** (+2,636 chars available)
2. **Expand PRF Instructions** (+1,564 chars available)
3. **Create 3 new KB files:**
   - ANL_KB_Incrementality_Methods_v1.txt
   - CHA_KB_Emerging_Channels_v1.txt
   - SPO_KB_Brand_Safety_v1.txt

---

## TASK 1: EXPAND SPO INSTRUCTIONS

**File:** `release/v6.0/agents/spo/instructions/SPO_Copilot_Instructions_v1.txt`
**Current:** 5,364 chars | **Target:** ~7,500 chars | **Headroom:** 2,636 chars

**Read the current file first**, then ADD these sections (do not replace existing content):

### NEW CONTENT TO ADD:

```
BRAND SAFETY INTEGRATION

Supply path optimization must consider brand safety as a core constraint, not an afterthought.

Safety Tier Classification:
- Tier 1 (Premium): News, sports, entertainment from known publishers
- Tier 2 (Standard): Verified inventory with brand safety tools active
- Tier 3 (Performance): Open exchange with post-bid verification only

Supply Path Safety Signals:
- Sellers.json transparency score
- Ads.txt authorization chain
- Historical block rate from verification vendors
- Made-for-advertising (MFA) site exposure

When evaluating supply paths, always surface safety trade-offs. A path with lower fees but higher MFA exposure may cost more in wasted impressions than the fee savings.

SUSTAINABILITY CONSIDERATIONS

Carbon-conscious supply path selection is increasingly important for enterprise clients.

Green Media Principles:
- Fewer hops in supply chain equals lower carbon footprint
- Direct publisher relationships outperform open exchange environmentally
- Server location and renewable energy usage matter
- Attention metrics correlate with lower waste

When clients express sustainability goals, factor these into supply path recommendations alongside efficiency metrics.

FRAUD PREVENTION

Invalid traffic (IVT) erodes working media more than fees in severe cases.

IVT Warning Signs in Supply Paths:
- Abnormally low CPMs with high volume
- Geographic concentration in unexpected regions  
- Time-of-day patterns inconsistent with human behavior
- High impression volumes with near-zero conversions

Always recommend pre-bid IVT filtering for programmatic buys. The CPM premium (typically 2-5%) pays for itself in quality.

SUPPLY PATH DIVERSITY

Over-concentration in single supply paths creates risk.

Diversity Guidelines:
- No single SSP should exceed 40% of programmatic spend
- Maintain at least 3 viable paths to priority publishers
- Test emerging supply sources with 5-10% of budget
- Document fallback paths for each primary source

When recommending supply paths, present a primary and secondary option for critical inventory sources.
```

**COMPLIANCE REQUIREMENTS:**
- Plain text only
- ALL-CAPS section headers
- Hyphens for lists (no bullets)
- Final file must be under 8,000 chars
- Verify char count after edit

---

## TASK 2: EXPAND PRF INSTRUCTIONS

**File:** `release/v6.0/agents/prf/instructions/PRF_Copilot_Instructions_v1.txt`
**Current:** 6,436 chars | **Target:** ~7,800 chars | **Headroom:** 1,564 chars

**Read the current file first**, then ADD these sections:

### NEW CONTENT TO ADD:

```
INCREMENTALITY INTEGRATION

Performance analysis must distinguish correlation from causation.

Incrementality Principles:
- Lift over baseline matters more than absolute performance
- Holdout groups are gold standard when available
- Geo-testing provides incrementality signals at scale
- Ghost bids and PSA tests work for digital channels

When analyzing performance, always ask: would these conversions have happened without the media? Surface incrementality data when available, flag when it is missing.

ATTRIBUTION MODEL AWARENESS

Different attribution models tell different stories. Your analysis must account for the model in use.

Model Implications:
- Last-click favors lower-funnel, undervalues awareness
- Linear distributes evenly, may over-credit touchpoints
- Time-decay balances recency with full path
- Data-driven requires sufficient conversion volume

When presenting performance, note which attribution model generated the data. Recommend model changes when current approach clearly misrepresents channel contribution.

CROSS-CHANNEL CANNIBALIZATION

Channels can steal credit from each other without generating incremental value.

Cannibalization Signals:
- Branded search spikes that mirror display flight timing
- Retargeting conversions with very short click-to-convert windows
- Social conversions from users already in email nurture
- Affiliate conversions on customers who would have purchased directly

Flag potential cannibalization when patterns emerge. Recommend holdout tests to quantify true incremental contribution.
```

**COMPLIANCE REQUIREMENTS:**
- Plain text only
- ALL-CAPS section headers
- Hyphens for lists (no bullets)
- Final file must be under 8,000 chars
- Verify char count after edit

---

## TASK 3: CREATE ANL_KB_Incrementality_Methods_v1.txt

**File:** `release/v6.0/agents/anl/kb/ANL_KB_Incrementality_Methods_v1.txt`
**Target:** ~12,000 chars

### CONTENT STRUCTURE:

```
DOCUMENT: ANL_KB_Incrementality_Methods_v1.txt
CATEGORY: Analytics Knowledge Base
TOPICS: incrementality, lift testing, holdout design, geo-experiments, causal inference
VERSION: 1.0
DATE: January 2026
STATUS: Production Ready
COMPLIANCE: 6-Rule Compliant
RELATED: ANL_KB_Analytics_Engine_v1, ANL_KB_Statistical_Tests_v1, PRF_KB_Attribution_Models_v1

ANL INCREMENTALITY METHODS v1

PURPOSE

This document provides methodology for measuring true incremental impact of media investments. Reference when users need to design lift tests, interpret incrementality results, or understand causal measurement approaches.

INCREMENTALITY FUNDAMENTALS

DEFINITION
[Define incremental lift, baseline, counterfactual]

WHY INCREMENTALITY MATTERS
[Correlation vs causation, attribution limitations]

MEASUREMENT APPROACHES

RANDOMIZED CONTROLLED TESTS (RCT)
[User-level holdouts, ghost bids, PSA tests]
[Sample size requirements, statistical power]
[Duration guidelines by channel]

GEO-EXPERIMENTS
[Market matching methodology]
[Synthetic control methods]
[Minimum market requirements]
[Seasonality considerations]

MATCHED MARKET TESTING
[Propensity score matching]
[Difference-in-differences]
[When to use vs RCT]

CONVERSION LIFT STUDIES
[Platform-provided solutions: Meta, Google, TikTok]
[Limitations and biases]
[Interpretation guidelines]

INCREMENTALITY BY CHANNEL

[Provide specific guidance for:]
- Paid Search (brand vs non-brand)
- Paid Social (prospecting vs retargeting)
- Display/Programmatic
- CTV/Video
- Retail Media

INTERPRETING RESULTS

[Confidence intervals, statistical significance]
[Incremental CPA/ROAS calculation]
[Decision frameworks based on results]

COMMON PITFALLS

[Contamination, sample size issues, duration problems]
[Over-attribution, under-attribution scenarios]

IMPLEMENTATION ROADMAP

[Phased approach to incrementality program]

CROSS-REFERENCES

For statistical testing: See ANL_KB_Statistical_Tests_v1
For performance analysis: See PRF_KB_Attribution_Models_v1

VERSION HISTORY

Version 1.0 - January 2026 - Initial creation
```

---

## TASK 4: CREATE CHA_KB_Emerging_Channels_v1.txt

**File:** `release/v6.0/agents/cha/kb/CHA_KB_Emerging_Channels_v1.txt`
**Target:** ~12,000 chars

### CONTENT STRUCTURE:

```
DOCUMENT: CHA_KB_Emerging_Channels_v1.txt
CATEGORY: Channel Knowledge Base
TOPICS: CTV, retail media, DOOH, audio streaming, gaming, influencer
VERSION: 1.0
DATE: January 2026
STATUS: Production Ready
COMPLIANCE: 6-Rule Compliant
RELATED: CHA_KB_Channel_Registry_v1, CHA_KB_Channel_Playbooks_v1

CHA EMERGING CHANNELS v1

PURPOSE

This document provides guidance on rapidly evolving media channels. Reference when users ask about CTV strategy, retail media networks, digital out-of-home, or other emerging platforms.

CONNECTED TV (CTV) ADVANCED

BUYING APPROACHES
[Direct, programmatic, platform-direct]
[Premium vs long-tail inventory]

TARGETING CAPABILITIES
[ACR data, first-party, contextual]
[Cross-device identity]

MEASUREMENT CHALLENGES
[Attribution windows, view-through]
[Incrementality testing approaches]

FREQUENCY MANAGEMENT
[Cross-platform deduplication]
[Household vs individual]

MINIMUM BUDGETS AND SCALE
[Platform minimums, reach thresholds]

RETAIL MEDIA NETWORKS

MAJOR NETWORKS
[Amazon, Walmart, Target, Kroger, Instacart]
[Capabilities comparison]

DATA ADVANTAGES
[Purchase data, closed-loop measurement]
[Clean room integration]

BUYING MODELS
[Self-serve, managed, programmatic]

WHEN TO USE
[Category considerations, funnel role]
[Budget allocation frameworks]

DIGITAL OUT-OF-HOME (DOOH)

PROGRAMMATIC DOOH
[DSP access, targeting options]
[Audience measurement]

FORMAT CONSIDERATIONS
[Billboards, transit, place-based]
[Creative requirements]

INTEGRATION WITH DIGITAL
[Retargeting from exposure]
[Mobile location data]

AUDIO STREAMING

PLATFORMS
[Spotify, Pandora, iHeart, podcasts]
[Targeting differences]

CREATIVE CONSIDERATIONS
[Length, format, host-read vs produced]

MEASUREMENT
[Listen-through, brand lift, attribution]

GAMING AND VIRTUAL

IN-GAME ADVERTISING
[Intrinsic vs interstitial]
[Platform options]

AUDIENCE CHARACTERISTICS
[Demographics, attention quality]

EMERGING CONSIDERATIONS
[VR/AR, metaverse readiness]

INFLUENCER AND CREATOR

PLATFORM EVOLUTION
[TikTok, YouTube, Instagram, emerging]
[Creator economy trends]

MEASUREMENT APPROACHES
[EMV, engagement, attribution]

INTEGRATION WITH PAID
[Allowlisting, amplification]

CHANNEL MATURITY ASSESSMENT

[Framework for evaluating channel readiness]
[Risk vs reward by maturity stage]

CROSS-REFERENCES

For channel benchmarks: See CHA_KB_Channel_Registry_v1
For allocation methods: See CHA_KB_Allocation_Methods_v1

VERSION HISTORY

Version 1.0 - January 2026 - Initial creation
```

---

## TASK 5: CREATE SPO_KB_Brand_Safety_v1.txt

**File:** `release/v6.0/agents/spo/kb/SPO_KB_Brand_Safety_v1.txt`
**Target:** ~12,000 chars

### CONTENT STRUCTURE:

```
DOCUMENT: SPO_KB_Brand_Safety_v1.txt
CATEGORY: Supply Path Knowledge Base
TOPICS: brand safety, brand suitability, verification, blocklists, MFA
VERSION: 1.0
DATE: January 2026
STATUS: Production Ready
COMPLIANCE: 6-Rule Compliant
RELATED: SPO_KB_Fee_Analysis_v1, SPO_KB_Partner_Evaluation_v1

SPO BRAND SAFETY v1

PURPOSE

This document provides guidance on brand safety within programmatic supply paths. Reference when users ask about safety configurations, verification vendors, or suitability strategies.

BRAND SAFETY FUNDAMENTALS

SAFETY VS SUITABILITY
[Definitions, spectrum of risk]
[Industry standards: GARM, TAG]

RISK CATEGORIES
[GARM framework categories]
[Custom category development]

VERIFICATION ECOSYSTEM

MAJOR VENDORS
[DoubleVerify, IAS, Oracle/MOAT]
[Capability comparison]
[Fee structures]

PRE-BID VS POST-BID
[Trade-offs, use cases]
[Cost implications]

IMPLEMENTATION APPROACHES
[DSP integration, tag-based]
[Reporting and optimization]

MADE-FOR-ADVERTISING (MFA) SITES

DEFINITION AND IDENTIFICATION
[Characteristics of MFA inventory]
[Detection approaches]

IMPACT ON CAMPAIGNS
[Attention metrics, waste]
[Hidden costs beyond CPM]

AVOIDANCE STRATEGIES
[Inclusion lists, quality floors]
[Verification tools]

INCLUSION VS EXCLUSION STRATEGIES

BLOCKLIST MANAGEMENT
[Standard categories, custom lists]
[Maintenance requirements]

INCLUSION LIST BENEFITS
[Quality control, transparency]
[Trade-offs with scale]

HYBRID APPROACHES
[Premium tier + verified open]
[Testing frameworks]

CONTEXTUAL SAFETY

KEYWORD BLOCKING
[Limitations, over-blocking risk]
[Semantic vs keyword]

CONTEXTUAL TARGETING
[Positive targeting for safety]
[AI-powered classification]

NEWS ADJACENCY
[Responsible news support]
[Nuanced blocking approaches]

SAFETY BY CHANNEL

DISPLAY/PROGRAMMATIC
[Specific considerations]

VIDEO/CTV
[Content-level controls]

SOCIAL
[Platform-specific tools]

RETAIL MEDIA
[Generally safer environment]

REPORTING AND GOVERNANCE

SAFETY METRICS
[Block rates, violation rates]
[Benchmarks by vertical]

ESCALATION PROCEDURES
[Incident response]
[Vendor communication]

BRAND SAFETY COSTS

FEE ANALYSIS
[Verification costs by approach]
[ROI of safety investment]

HIDDEN COSTS OF UNSAFE INVENTORY
[Brand damage, wasted spend]

CROSS-REFERENCES

For fee analysis: See SPO_KB_Fee_Analysis_v1
For partner evaluation: See SPO_KB_Partner_Evaluation_v1

VERSION HISTORY

Version 1.0 - January 2026 - Initial creation
```

---

## EXECUTION ORDER

1. Pull latest: `git pull origin feature/multi-agent-architecture`
2. Task 1: Expand SPO Instructions
3. Task 2: Expand PRF Instructions
4. Task 3: Create ANL_KB_Incrementality_Methods_v1.txt
5. Task 4: Create CHA_KB_Emerging_Channels_v1.txt
6. Task 5: Create SPO_KB_Brand_Safety_v1.txt
7. Commit each task separately
8. Push when complete

---

## COMPLIANCE CHECKLIST (Apply to ALL files)

Before committing each file:
- [ ] Plain text only (no markdown rendering)
- [ ] ALL-CAPS section headers
- [ ] Hyphens for lists (no bullets)
- [ ] ASCII only (no curly quotes, em-dashes, special chars)
- [ ] Instructions under 8,000 chars
- [ ] KB files under 36,000 chars
- [ ] Cross-references included
- [ ] Version history at bottom

---

## GIT COMMANDS

```bash
# After each task
git add [file]
git commit -m "feat(agent): Description"

# After all tasks
git push origin feature/multi-agent-architecture
```

---

## WHEN COMPLETE

Notify user. Claude.ai will have completed:
- AUD Instructions expansion
- DOC Instructions expansion
- AUD_KB_Privacy_Compliance_v1.txt
- PRF_KB_Attribution_Models_v1.txt

Combined output: 4 instruction expansions + 5 new KB files
