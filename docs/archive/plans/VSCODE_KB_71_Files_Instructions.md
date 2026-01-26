# VS CODE: MPA v6.0 KB EXPANSION - 71 FILES

## YOUR MISSION

Create 71 KB files for the MPA v6.0 expansion while Claude.ai simultaneously creates 25 complex architecture files. All files must be 100% compliant with the 6-Rule Framework and Microsoft Stack requirements.

## CRITICAL COMPLIANCE REQUIREMENTS

### Six-Rule Framework (MANDATORY - ALL FILES MUST PASS)

```
RULE 1: ALL-CAPS HEADERS
- Section headers MUST be ALL CAPS
- CORRECT:   SECTION 1 - CORE CONCEPTS
- WRONG:     Section 1 - Core Concepts

RULE 2: HYPHENS ONLY FOR LISTS
- Use hyphens (-) for ALL list items
- WRONG: * bullet, • bullet, 1. numbered
- CORRECT: - hyphen list item

RULE 3: ASCII CHARACTERS ONLY
- NO unicode: no smart quotes "" use straight ""
- NO em-dashes — use double hyphens --
- NO special symbols

RULE 4: ZERO VISUAL DEPENDENCIES
- NO tables (no | column | format |)
- NO images or diagrams
- NO markdown formatting (**bold**, _italic_)

RULE 5: MANDATORY DOCUMENT HEADER
Every file starts with:
[AGENT]_KB_[Topic]_v1.0.txt
VERSION: 1.0
STATUS: Production Ready
COMPLIANCE: 6-Rule Compliant
LAST UPDATED: 2026-01-18
CHARACTER COUNT: [actual count]

RULE 6: PROFESSIONAL TONE
- NO emoji
- NO first person (I, we, our)
- NO casual language
- Factual, instructional tone only
```

### Microsoft Stack Compatibility

```
COPILOT STUDIO: Max 36,000 characters per file
AZURE: No spaces in filenames, use underscores
DATAVERSE: UTF-8 encoding, compatible with multi-line text fields
SHAREPOINT: Target under 100KB per file
```

## REPOSITORY SETUP

```bash
# 1. Clone and checkout
cd /path/to/Kessel-Digital-Agent-Platform
git fetch origin
git checkout feature/v6.0-kb-expansion
git pull origin feature/v6.0-kb-expansion

# 2. Verify directory structure exists (Claude.ai already created these)
ls -la release/v6.0/agents/cso/kb
ls -la release/v6.0/agents/nds/kb
ls -la release/v6.0/agents/udm/kb
ls -la release/v6.0/system

# 3. Make validation script executable
chmod +x validate_kb_file.sh
```

## DOCUMENT TEMPLATE

Use this EXACT template for every file:

```
[AGENT]_KB_[Topic]_v1.0.txt
VERSION: 1.0
STATUS: Production Ready
COMPLIANCE: 6-Rule Compliant
LAST UPDATED: 2026-01-18
CHARACTER COUNT: [UPDATE AFTER COMPLETION]

================================================================================
SECTION 1 - [TITLE IN ALL CAPS]
================================================================================

OVERVIEW

[Opening paragraph describing the topic]

[SUBSECTION TITLE IN ALL CAPS]

[Content with hyphens for lists]
- First item
- Second item
- Third item

================================================================================
SECTION 2 - [NEXT SECTION TITLE]
================================================================================

[Continue content...]

================================================================================
SECTION N - AGENT APPLICATION GUIDANCE
================================================================================

WHEN TO USE THIS KNOWLEDGE

[Guidance on when agent should reference this KB]

INTEGRATION WITH OTHER AGENTS

[How this KB interfaces with other agents]

================================================================================
END OF DOCUMENT
================================================================================
```

## GIT WORKFLOW (AFTER EACH FILE)

```bash
# 1. Validate file
./validate_kb_file.sh path/to/file.txt

# 2. If validation passes, commit
git add path/to/file.txt
git commit -m "feat(agent): Add [filename]"

# 3. Push every 5 commits
git push origin feature/v6.0-kb-expansion
```

## YOUR 71 FILES ORGANIZED BY BATCH

### FILE LOCATIONS BY AGENT

```
UDM files → release/v6.0/agents/udm/kb/
NDS files → release/v6.0/agents/nds/kb/
CSO files → release/v6.0/agents/cso/kb/
ANL files → release/v6.0/agents/anl/kb/
AUD files → release/v6.0/agents/aud/kb/
PRF files → release/v6.0/agents/prf/kb/
SPO files → release/v6.0/agents/spo/kb/
SYS files → release/v6.0/system/
```

---

## BATCH 1: UDM - Unstructured Data Mining (8 files)
**Location: release/v6.0/agents/udm/kb/**

### File 1: UDM_KB_Text_Mining_Methods_v1.0.txt
**Target: 12,000-15,000 characters**

Required sections:
- TEXT PREPROCESSING PIPELINE: Tokenization, lemmatization, stop words, NER
- EMBEDDING MODELS: Word2Vec, FastText, BERT, sentence transformers, fine-tuning
- TOPIC MODELING: LDA, NMF, BERTopic, dynamic topics, hierarchical
- SENTIMENT AND EMOTION ANALYSIS: Lexicon-based, ML classifiers, aspect-based
- MARKETING APPLICATIONS: Review mining, call center, social listening, competitive monitoring
- AGENT APPLICATION GUIDANCE

### File 2: UDM_KB_Creative_Analysis_v1.0.txt
**Target: 12,000-15,000 characters**

Required sections:
- IMAGE ANALYSIS: CNN feature extraction, object detection, color analysis, OCR
- VIDEO ANALYSIS: Frame sampling, scene detection, audio-visual features
- CREATIVE ATTRIBUTE EXTRACTION: Complexity scoring, emotional classification, CTA detection
- CREATIVE PERFORMANCE PREDICTION: Multi-modal models, fatigue prediction
- IMPLEMENTATION GUIDANCE: Pre-trained models, transfer learning, vector databases
- AGENT APPLICATION GUIDANCE

### File 3: UDM_KB_Social_Web_Mining_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- SOCIAL LISTENING: Platform APIs, mention tracking, influencer identification, crisis detection
- WEB CONTENT MINING: Crawler architecture, competitor monitoring, price tracking
- GRAPH-BASED ANALYSIS: Social network analysis, community detection, bot detection
- REAL-TIME STREAM PROCESSING: Event streams, windowed aggregations, alerts
- AGENT APPLICATION GUIDANCE

### File 4: UDM_KB_Log_Event_Analysis_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- LOG PARSING: Structured vs unstructured, pattern extraction, session reconstruction
- EVENT SEQUENCE ANALYSIS: Clickstream, funnel reconstruction, sequence pattern mining
- ANOMALY DETECTION IN LOGS: Statistical methods, isolation forest, LSTM autoencoders
- USER BEHAVIOR MODELING: Session features, engagement patterns, intent signals
- AGENT APPLICATION GUIDANCE

### File 5: UDM_KB_Feature_Engineering_Unstructured_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- FEATURE EXTRACTION PATTERNS: Embedding aggregation, TF-IDF, graph features
- FEATURE STORE INTEGRATION: Pipelines, online vs offline, versioning
- DOWNSTREAM MODEL INTEGRATION: Features for propensity, MMM, attribution
- QUALITY AND MONITORING: Drift detection, coverage, importance tracking
- AGENT APPLICATION GUIDANCE

### File 6: UDM_KB_Anomaly_Pattern_Detection_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- ANOMALY DETECTION METHODS: Statistical, distance-based, density-based, model-based
- PATTERN MINING: Frequent patterns, sequential patterns, association rules
- TREND DETECTION: Change point detection, regime change, emerging topics
- ALERT PRIORITIZATION: Severity scoring, business impact, root cause
- AGENT APPLICATION GUIDANCE

### File 7: UDM_KB_NLP_Marketing_Applications_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- CUSTOMER FEEDBACK ANALYSIS: Review summarization, pain point extraction
- CONVERSATIONAL ANALYTICS: Intent classification, entity extraction, satisfaction
- CONTENT GENERATION SIGNALS: Headline effectiveness, keyword extraction
- SEARCH AND DISCOVERY: Query understanding, semantic search, recommendations
- AGENT APPLICATION GUIDANCE

### File 8: UDM_KB_Multimodal_Integration_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- MULTIMODAL FUSION: Early fusion, late fusion, cross-modal attention, CLIP
- CREATIVE PERFORMANCE MODELING: Image + text + audio, consistency scoring
- UNIFIED REPRESENTATION: Joint embeddings, cross-modal retrieval
- PRODUCTION CONSIDERATIONS: Computational requirements, latency, serving
- AGENT APPLICATION GUIDANCE

---

## BATCH 2: MMM Enhancement (5 files)
**Location: release/v6.0/agents/anl/kb/**

### File 9: ANL_KB_Bayesian_MMM_v1.0.txt
**Target: 12,000-15,000 characters**

Required sections:
- BAYESIAN MMM FUNDAMENTALS: Prior specification, likelihood, posterior, credible intervals
- MODEL SPECIFICATION: Adstock priors, saturation priors, hierarchical priors
- INFERENCE METHODS: MCMC (Stan, PyMC), variational inference, diagnostics
- MODEL COMPARISON: WAIC, LOO-CV, posterior predictive checks
- TOOLS AND PLATFORMS: Google LightweightMMM, Meta Robyn, PyMC-Marketing
- AGENT APPLICATION GUIDANCE

### File 10: ANL_KB_Campaign_Level_MMM_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- GRANULARITY CHALLENGES: Data sparsity, multicollinearity, short durations
- METHODOLOGICAL APPROACHES: Hierarchical models, Bayesian shrinkage, regularization
- CREATIVE AND MESSAGING EFFECTS: Creative quality variables, wear-out modeling
- TARGETING EFFECTS: Audience quality, targeting precision, reach vs frequency
- AGENT APPLICATION GUIDANCE

### File 11: ANL_KB_GeoLift_Augmented_MMM_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- GEO-LIFT INTEGRATION: Experimental calibration, prior updating, lift-adjusted elasticities
- SYNTHETIC CONTROL CALIBRATION: Validation methodology, discrepancy analysis
- EXPERIMENTAL DESIGN FOR CALIBRATION: Optimal geo selection, power analysis
- UNIFIED FRAMEWORK: MMM + Incrementality fusion, Bayesian model averaging
- AGENT APPLICATION GUIDANCE

### File 12: ANL_KB_MMM_External_Factors_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- SEASONALITY MODELING: Harmonic regression, seasonal dummies, holiday effects
- PROMOTIONAL EFFECTS: Price elasticity, promotion timing, cannibalization
- MACROECONOMIC FACTORS: GDP, consumer confidence, competitive spend
- DISTRIBUTION AND EXTERNAL: Store count, out-of-stock, weather, events
- AGENT APPLICATION GUIDANCE

### File 13: ANL_KB_MMM_Output_Utilization_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- BUDGET PLANNING INTEGRATION: Annual planning, quarterly allocation, scenarios
- OPTIMIZATION INTEGRATION: Response curves to NDS, saturation warnings
- REPORTING AND COMMUNICATION: Executive summaries, ROI decomposition
- CONTINUOUS CALIBRATION: Refresh cadence, drift monitoring, re-estimation
- AGENT APPLICATION GUIDANCE

---

## BATCH 3: MTA/Attribution (5 files)
**Location: release/v6.0/agents/prf/kb/**

### File 14: PRF_KB_Shapley_Attribution_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- SHAPLEY VALUE FUNDAMENTALS: Game theory, marginal contribution, fairness axioms
- CALCULATION METHODS: Exact computation, sampling approximation, Kernel SHAP
- MARKETING APPLICATION: Channel as player, path-based Shapley, time-decay
- IMPLEMENTATION: Computational scaling, path length handling, multi-device
- VALIDATION: Incrementality comparison, sensitivity analysis
- AGENT APPLICATION GUIDANCE

### File 15: PRF_KB_Sequence_Attribution_Models_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- MARKOV CHAIN ATTRIBUTION: Transition matrices, removal effect, higher-order
- LSTM SEQUENCE MODELS: Sequence representation, architecture, attention
- TRANSFORMER-BASED: Self-attention, positional encoding, pre-training
- FEATURE ENGINEERING: Path length, transition, time gap features
- AGENT APPLICATION GUIDANCE

### File 16: PRF_KB_Path_Based_Attribution_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- PATH ANALYSIS: Path frequency, clustering, length distribution, order patterns
- FUNNEL ATTRIBUTION: Stage-based, transitions, assist vs closer
- POSITION-BASED MODELS: U-shaped, W-shaped, custom weighting, time-decayed
- AGENT APPLICATION GUIDANCE

### File 17: PRF_KB_Attribution_Validation_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- INCREMENTALITY CALIBRATION: Holdout validation, lift correlation, calibration factors
- CROSS-VALIDATION: Temporal holdouts, user-level holdouts
- SANITY CHECKS: Efficiency, directional consistency, benchmarks, edge cases
- AGENT APPLICATION GUIDANCE

### File 18: PRF_KB_Attribution_MTA_MMM_Reconciliation_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- GOVERNANCE FRAMEWORK: When to trust MMM vs MTA vs incrementality
- RECONCILIATION METHODS: Unified measurement, calibration cascades, weighted averaging
- CONFLICT RESOLUTION: Discrepancy analysis, coverage gaps, decision rules
- PRACTICAL IMPLEMENTATION: Dashboards, decision support, stakeholder communication
- AGENT APPLICATION GUIDANCE

---

## BATCH 4: Incrementality (5 files)
**Location: release/v6.0/agents/prf/kb/**

### File 19: PRF_KB_Geo_Test_Design_v1.0.txt
**Target: 12,000-15,000 characters**

Required sections:
- GEO TEST FUNDAMENTALS: Treatment vs control, matched markets, power analysis
- SYNTHETIC CONTROL DETAILED: Donor pool, pre-period matching, RMSPE, placebo tests
- MATCHED MARKET DETAILED: Covariate matching, propensity scores, balance diagnostics
- PRACTICAL CONSIDERATIONS: Minimum size, duration, contamination, spillover
- AGENT APPLICATION GUIDANCE

### File 20: PRF_KB_Audience_Split_Tests_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- RANDOMIZATION: User-level, cookie/device, stratified, cluster
- GHOST ADS / PSA TESTS: Ghost bid methodology, intent-to-treat, compliance
- PLATFORM LIFT STUDIES: Meta, Google, TTD methodologies
- SAMPLE SIZE AND DURATION: Power analysis, effect size, minimum detectable effect
- AGENT APPLICATION GUIDANCE

### File 21: PRF_KB_Always_On_Experiments_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- CONTINUOUS EXPERIMENTATION: Rolling holdouts, rotation schedules, coverage
- MMM/MTA VALIDATION: Experimental validation, calibration frequency
- MULTI-ARM DESIGNS: Channel comparison, multi-treatment, factorial, adaptive
- OPERATIONAL INFRASTRUCTURE: Tracking, randomization, measurement pipelines
- AGENT APPLICATION GUIDANCE

### File 22: PRF_KB_Holdout_Design_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- HOLDOUT SIZING: Statistical power, business cost, optimal percentage
- STRATIFICATION: Audience, geographic, temporal, value-based
- REPRESENTATIVENESS: Covariate balance, distribution matching, bias detection
- DURATION OPTIMIZATION: Minimum duration, seasonality, conversion lag
- AGENT APPLICATION GUIDANCE

### File 23: PRF_KB_Lift_Operationalization_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- INTERPRETING RESULTS: Point estimates vs CI, practical significance, heterogeneity
- MMM PRIOR UPDATING: Bayesian updates, elasticity calibration, saturation adjustment
- PROPENSITY ADJUSTMENT: Lift-calibrated propensities, incremental response rates
- NDS INTEGRATION: Marginal return updates, channel prioritization, reallocation
- AGENT APPLICATION GUIDANCE

---

## BATCH 5: View/Click Tracking (4 files)
**Location: release/v6.0/agents/prf/kb/**

### File 24: PRF_KB_View_Click_Measurement_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- MEASUREMENT DEFINITIONS: CTC, VTC, lookback windows, platform definitions
- CLICK-THROUGH TRACKING: Mechanisms, redirect vs pixel, fraud filtering
- VIEW-THROUGH TRACKING: Impression tracking, viewability, assisted vs attributed
- DEDUPLICATION RULES: CTC vs VTC priority, cross-channel, time-based
- AGENT APPLICATION GUIDANCE

### File 25: PRF_KB_View_Through_Bias_Correction_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- BIAS SOURCES: Selection bias, viewability inflation, fraud, natural baseline
- CORRECTION METHODS: Propensity weighting, inverse probability, doubly robust
- PSA/GHOST AD CALIBRATION: Control group baseline, lift-based adjustment
- QUALITY ADJUSTMENT: Viewability normalization, attention-weighted, fraud adjustment
- AGENT APPLICATION GUIDANCE

### File 26: PRF_KB_Multi_Impression_Sequence_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- SEQUENCE EFFECTS: First impression, last impression, cumulative, frequency-response
- CROSS-CHANNEL SEQUENCES: Channel order, synergy measurement, optimal paths
- CROSS-DEVICE SEQUENCES: Device order, handoff tracking, identity-based paths
- MODELING APPROACHES: Survival models, sequence models, causal, mixed effects
- AGENT APPLICATION GUIDANCE

### File 27: PRF_KB_Signal_Integration_Framework_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- SIGNAL FLOW TO ATTRIBUTION: Real-time processing, window management, deduplication
- SIGNAL FLOW TO INCREMENTALITY: Experiment integration, holdout tracking
- SIGNAL FLOW TO MMM: Aggregation, adstock, quality weighting
- SIGNAL FLOW TO NDS/CSO: Real-time availability, latency, confidence
- AGENT APPLICATION GUIDANCE

---

## BATCH 6: NDS Supporting (5 files)
**Location: release/v6.0/agents/nds/kb/**

### File 28: NDS_KB_Real_Time_Optimization_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- REAL-TIME ARCHITECTURE: Streaming ingestion, feature latency, decision latency
- ONLINE LEARNING: Incremental updates, Thompson sampling, contextual bandits
- PACING AND THROTTLING: Budget pacing, bid landscape adaptation
- FEEDBACK LOOPS: Attribution lag, conversion delay, proxy metrics
- AGENT APPLICATION GUIDANCE

### File 29: NDS_KB_Simulation_WhatIf_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- SCENARIO SIMULATION: Budget reallocation, channel mix, timing, audience
- MONTE CARLO SIMULATION: Input distributions, correlation, risk metrics
- COUNTERFACTUAL ANALYSIS: Causal inference, synthetic control for planning
- OPTIMIZATION UNDER UNCERTAINTY: Robust optimization, stochastic programming
- AGENT APPLICATION GUIDANCE

### File 30: NDS_KB_Audience_Level_Allocation_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- AUDIENCE VALUATION: CLV-based, propensity-weighted, incremental, margin-adjusted
- AUDIENCE-SPECIFIC RESPONSE: Heterogeneity, segment elasticities, saturation
- ALLOCATION OPTIMIZATION: Multi-audience, fairness constraints, portfolio approach
- AGENT APPLICATION GUIDANCE

### File 31: NDS_KB_Channel_Tactic_Allocation_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- CHANNEL SELECTION: Channel fit by objective, audience, cost efficiency
- TACTIC SELECTION: Tactic-level response, placement, format, bid strategy
- CONSTRAINT HANDLING: Minimum spend, maximum caps, frequency limits, quality floors
- AGENT APPLICATION GUIDANCE

### File 32: NDS_KB_Always_On_Optimization_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- CONTINUOUS OPTIMIZATION: Frequency, rebalancing triggers, drift detection
- LEARNING RATE MANAGEMENT: Adaptation vs stability, regime change detection
- PERFORMANCE MONITORING: Optimization lift, attribution of value, benchmarking
- GOVERNANCE: Human-in-the-loop, override mechanisms, alert thresholds
- AGENT APPLICATION GUIDANCE

---

## BATCH 7: CSO Supporting (3 files)
**Location: release/v6.0/agents/cso/kb/**

### File 33: CSO_KB_Channel_Creative_Mix_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- CHANNEL MIX OPTIMIZATION: Preference by audience, effectiveness by stage, synergies
- CREATIVE MIX: Rotation strategies, personalized selection, fatigue management
- AUDIENCE-STAGE MATRIX: Channel and creative by audience x stage, budget allocation
- AGENT APPLICATION GUIDANCE

### File 34: CSO_KB_Constraint_Handling_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- CHANNEL CONSTRAINTS: Caps, inventory, delivery guarantees, exclusivity
- LEGAL/PRIVACY CONSTRAINTS: Consent, opt-out, data limitations, geographic
- CUSTOMER EXPERIENCE GUARDRAILS: Maximum frequency, preferences, do-not-contact
- CAPACITY CONSTRAINTS: Call center, fulfillment, budget, resources
- AGENT APPLICATION GUIDANCE

### File 35: CSO_KB_Journey_Orchestration_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- ORCHESTRATION ARCHITECTURE: Decision engine, real-time vs batch, failover
- MULTI-CHANNEL COORDINATION: Deduplication, unified view, handoff, consistency
- INTEGRATION POINTS: Campaign management, marketing automation, CDP, analytics
- MEASUREMENT: Journey-level metrics, incrementality of orchestration
- AGENT APPLICATION GUIDANCE

---

## BATCH 8: ML Scientific - AUD (7 files)
**Location: release/v6.0/agents/aud/kb/**

### File 36: AUD_KB_Churn_Prediction_ML_v1.0.txt
**Target: 12,000-15,000 characters**

Required sections:
- CHURN DEFINITION: Binary, contractual vs non-contractual, partial, timeframe
- SURVIVAL ANALYSIS: Cox Proportional Hazards, parametric models, DeepSurv, competing risks
- ML FOR CHURN: Classification (XGBoost, neural nets), sequence models, feature engineering
- MODEL CALIBRATION: Survival calibration, Brier score, time-dependent AUC
- INTERVENTION OPTIMIZATION: Optimal timing, treatment effect, cost-sensitive learning
- AGENT APPLICATION GUIDANCE

### File 37: AUD_KB_RFM_Advanced_Analytics_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- CLASSIC RFM FRAMEWORK: Recency, Frequency, Monetary definitions and scoring
- ML EXTENSIONS TO RFM: CLV-weighted, BG/NBD model, Pareto/NBD, Gamma-Gamma
- ADVANCED SEGMENTATION: K-means, GMM, self-organizing maps, embeddings
- ACTIVATION STRATEGIES: Segment-specific messaging, channel preference, offers
- AGENT APPLICATION GUIDANCE

### File 38: AUD_KB_Intent_Modeling_ML_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- INTENT SIGNAL TAXONOMY: Explicit, implicit, third-party (Bombora, 6sense)
- INTENT SCORING MODELS: Heuristic scoring, ML models, feature engineering
- REAL-TIME INTENT: Streaming architecture, low latency serving
- INTENT-BASED ACTIVATION: Bid adjustments, audience segments, sequential messaging
- AGENT APPLICATION GUIDANCE

### File 39: AUD_KB_Taxonomy_Management_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- TAXONOMY FUNDAMENTALS: Hierarchical, flat vs deep, polyhierarchical, faceted
- AUDIENCE TAXONOMY STANDARDS: IAB Content Taxonomy, IAB Audience Taxonomy
- TAXONOMY OPERATIONS: Cross-walk mapping, governance, version control
- ML FOR TAXONOMY: Automatic classification, expansion, synonym detection
- AGENT APPLICATION GUIDANCE

### File 40: AUD_KB_Data_Onboarding_Scientific_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- ONBOARDING PIPELINE: Data ingestion, identity key extraction, matching execution
- MATCH RATE ANALYSIS: Expected rates, diagnostics, quality validation
- PLATFORM INTEGRATION: DSP activation, social, CTV, measurement
- REFRESH STRATEGIES: Full vs incremental, frequency optimization, decay analysis
- AGENT APPLICATION GUIDANCE

### File 41: AUD_KB_Privacy_Preserving_Matching_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- PRIVACY TECHNOLOGIES: Secure MPC, differential privacy, private set intersection
- CLEAN ROOM TECHNOLOGIES: AWS, Snowflake, Google Ads Data Hub, InfoSum, Habu
- CLEAN ROOM USE CASES: Overlap, attribution, reach/frequency, lookalike
- IMPLEMENTATION GUIDANCE: Selection criteria, data preparation, query limitations
- AGENT APPLICATION GUIDANCE

### File 42: AUD_KB_B2B_Identity_Resolution_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- B2B IDENTITY CHALLENGE: Account vs contact, hierarchies, firmographic matching
- ACCOUNT MATCHING: Company name, firmographic, hierarchy resolution
- CONTACT MATCHING: Business email, title standardization, LinkedIn
- B2B DATA PROVIDERS: Dun & Bradstreet, ZoomInfo, 6sense, Demandbase
- ACCOUNT-BASED TARGETING: IP-to-company, intent data, buying committee
- AGENT APPLICATION GUIDANCE

---

## BATCH 9: ML Scientific - ANL (6 files)
**Location: release/v6.0/agents/anl/kb/**

### File 43: ANL_KB_Deep_Learning_Marketing_v1.0.txt
**Target: 12,000-15,000 characters**

Required sections:
- NEURAL NETWORK ARCHITECTURES: Feed-forward, RNN/LSTM, transformers, GNNs
- APPLICATIONS: Customer journey, creative optimization, pricing, recommendations
- PRACTICAL CONSIDERATIONS: Data requirements, compute, interpretability, deployment
- AGENT APPLICATION GUIDANCE

### File 44: ANL_KB_Optimization_Algorithms_v1.0.txt
**Target: 12,000-15,000 characters**

Required sections:
- PROBLEM FORMULATION: Decision variables, objective function, constraints
- LINEAR PROGRAMMING: Simplex, interior point, sensitivity analysis
- NONLINEAR PROGRAMMING: Gradient descent, Newton methods, SQP
- MULTI-OBJECTIVE: Pareto frontier, weighted sum, goal programming
- MARKETING APPLICATIONS: Budget allocation, media mix, price optimization
- AGENT APPLICATION GUIDANCE

### File 45: ANL_KB_Simulation_Methods_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- MONTE CARLO SIMULATION: Random number generation, sampling, variance reduction
- INPUT DISTRIBUTION SELECTION: Historical fitting, expert elicitation, correlation
- OUTPUT ANALYSIS: Confidence intervals, percentiles, sensitivity
- MARKETING APPLICATIONS: Budget scenarios, risk quantification, forecast ranges
- AGENT APPLICATION GUIDANCE

### File 46: ANL_KB_Financial_Modeling_Marketing_v1.0.txt
**Target: 12,000-15,000 characters**

Required sections:
- MARKETING P&L: Revenue attribution, variable costs, contribution margin, ROI
- CUSTOMER UNIT ECONOMICS: CAC, LTV, payback period, LTV:CAC benchmarks
- INVESTMENT ANALYSIS: NPV, IRR, payback period
- BREAK-EVEN ANALYSIS: Break-even ROAS, volume break-even, scenarios
- AGENT APPLICATION GUIDANCE

### File 47: ANL_KB_Experimental_Design_v1.0.txt
**Target: 12,000-15,000 characters**

Required sections:
- FUNDAMENTALS: Randomization, replication, blocking, factorial designs
- A/B TESTING: Sample size, duration, multiple testing, sequential testing
- MULTIVARIATE TESTING: Full factorial, fractional factorial, response surface
- QUASI-EXPERIMENTAL: DID, regression discontinuity, interrupted time series
- BANDIT ALGORITHMS: Multi-armed bandits, Thompson sampling, contextual bandits
- AGENT APPLICATION GUIDANCE

### File 48: ANL_KB_Econometric_Modeling_v1.0.txt
**Target: 12,000-15,000 characters**

Required sections:
- TIME SERIES ECONOMETRICS: Stationarity, cointegration, error correction, VAR
- PANEL DATA METHODS: Fixed effects, random effects, Hausman test, dynamic panel
- INSTRUMENTAL VARIABLES: Endogeneity, instrument selection, 2SLS
- CAUSAL INFERENCE: Propensity score, regression discontinuity, DID, synthetic control
- AGENT APPLICATION GUIDANCE

---

## BATCH 10: PRF Scientific (7 files)
**Location: release/v6.0/agents/prf/kb/**

### File 49: PRF_KB_Viewability_Deep_Dive_v1.0.txt
**Target: 12,000-15,000 characters**

Required sections:
- VIEWABILITY STANDARDS: MRC display, MRC video, GroupM, custom standards
- MEASUREMENT METHODOLOGY: Geometric, browser visibility, cross-frame challenges
- CHANNEL-SPECIFIC VIEWABILITY: Display, video, mobile, CTV, social with benchmarks
- PREDICTIVE VIEWABILITY: Pre-bid segments, page-level prediction, optimization
- AGENT APPLICATION GUIDANCE

### File 50: PRF_KB_MFA_Detection_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- MFA DEFINITION AND TAXONOMY: Arbitrage, content farms, clickbait, auto-refresh
- IDENTIFICATION SIGNALS: Ad density, templated content, traffic patterns, engagement
- DETECTION ALGORITHMS: Ad density scoring, content quality classifiers
- BLOCKING STRATEGIES: Pre-bid exclusion, block lists, quality floors, PMP
- AGENT APPLICATION GUIDANCE

### File 51: PRF_KB_Attention_Measurement_Scientific_v1.0.txt
**Target: 12,000-15,000 characters**

Required sections:
- ATTENTION SCIENCE: Active vs passive, visual hierarchy, cognitive load, memory
- ATTENTION METRICS: Attention seconds, dwell time, attentive reach, attention CPM
- MEASUREMENT METHODOLOGIES: Eye tracking panels, behavioral proxies, predictive modeling
- PROVIDER METHODOLOGIES: Adelaide AU, Lumen, Amplified Intelligence, TVision
- BENCHMARKS AND OPTIMIZATION: By format, attention-outcome correlation
- AGENT APPLICATION GUIDANCE

### File 52: PRF_KB_Multi_Touch_Attribution_Scientific_v1.0.txt
**Target: 12,000-15,000 characters**

Required sections:
- MTA MODEL TAXONOMY: Rule-based (last click, linear, position) and data-driven
- SHAPLEY VALUE METHODOLOGY: Game theory, calculation, approximation
- MARKOV CHAIN ATTRIBUTION: State transitions, removal effect, higher-order
- MACHINE LEARNING APPROACHES: RNN, transformers, feature engineering
- VALIDATION: Holdout validation, incrementality calibration
- AGENT APPLICATION GUIDANCE

### File 53: PRF_KB_Anomaly_Detection_ML_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- ANOMALY TYPES: Point, contextual, collective anomalies
- STATISTICAL METHODS: Z-score, IQR, Grubbs test
- MACHINE LEARNING METHODS: Isolation forest, one-class SVM, autoencoders, LOF
- TIME SERIES ANOMALY: Prophet, deep learning, streaming detection
- ALERTING FRAMEWORK: Severity classification, root cause suggestion
- AGENT APPLICATION GUIDANCE

### File 54: PRF_KB_Forecasting_ML_v1.0.txt
**Target: 12,000-15,000 characters**

Required sections:
- FORECASTING PROBLEM TYPES: Point, probabilistic, hierarchical
- CLASSICAL TIME SERIES: ARIMA, exponential smoothing, Theta
- ML APPROACHES: Gradient boosting, DeepAR, N-BEATS, Temporal Fusion Transformer
- PROBABILISTIC FORECASTING: Quantile regression, conformal prediction, Bayesian
- EVALUATION: MAE, MAPE, RMSE, coverage probability, pinball loss
- AGENT APPLICATION GUIDANCE

### File 55: PRF_KB_Model_Validation_Framework_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- DATA SPLITTING: Train/validation/test, temporal, stratified, cross-validation
- CLASSIFICATION METRICS: Confusion matrix, accuracy, precision, recall, F1, AUC
- REGRESSION METRICS: MAE, MSE, RMSE, R-squared, residual analysis
- CALIBRATION ASSESSMENT: Calibration curves, Brier score, expected calibration error
- MODEL MONITORING: Performance drift, feature drift, alerting thresholds
- AGENT APPLICATION GUIDANCE

---

## BATCH 11: SPO Enhancement (4 files)
**Location: release/v6.0/agents/spo/kb/**

### File 56: SPO_KB_Margin_Analysis_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- GROSS MARGIN CALCULATION: By channel, by product, after all fees
- MARGIN EROSION ANALYSIS: Fee identification, leakage sources, trends
- BREAK-EVEN ROAS BY MARGIN: Tier calculation, category differences
- CONTRIBUTION MARGIN OPTIMIZATION: Product-level, promotional impact
- AGENT APPLICATION GUIDANCE

### File 57: SPO_KB_Working_Media_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- WORKING MEDIA RATIO: Calculation methodology, benchmarks (65-85%)
- FEE CATEGORIZATION: Tech tax, data costs, production costs
- VENDOR CONSOLIDATION: Strategies, agency fee structures
- OPTIMIZATION STRATEGIES: Fee reduction tactics, efficiency improvement
- AGENT APPLICATION GUIDANCE

### File 58: SPO_KB_Hidden_Fees_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- COMMON HIDDEN FEE TYPES: Platform, data, verification, ad serving fees
- FEE DISCLOSURE REQUIREMENTS: Regulatory, contractual clauses
- FEE AUDIT METHODOLOGY: Detection, investigation, documentation
- EXCHANGE TAKE RATE ANALYSIS: Rate calculation, benchmarking, negotiation
- AGENT APPLICATION GUIDANCE

### File 59: SPO_KB_Verification_ROI_Analysis_v1.0.txt
**Target: 10,000-12,000 characters**

Required sections:
- VERIFICATION COST STRUCTURE: CPM fees by vendor, measurement vs blocking
- ROI CALCULATION FRAMEWORK: Fraud avoidance, viewability improvement, brand safety
- VENDOR COMPARISON MATRIX: Detection accuracy, coverage, integration
- IMPLEMENTATION GUIDANCE: Single vs multi-vendor, DSP native vs third-party
- AGENT APPLICATION GUIDANCE

---

## BATCH 12: Cross-Platform (4 files)
**Location: Various - see each file**

### File 60: PRF_KB_Cross_Platform_Deduplication_v1.0.txt
**Location: release/v6.0/agents/prf/kb/**
**Target: 10,000-12,000 characters**

Required sections:
- DEDUPLICATION CHALLENGE: Platform overlap, device fragmentation, walled gardens
- METHODOLOGIES: Identity-based, statistical, clean room, algorithmic
- REACH CURVE CONSTRUCTION: Diminishing reach, cross-platform aggregation
- OUTPUT METRICS: Deduplicated reach, cross-platform frequency, overlap matrices
- AGENT APPLICATION GUIDANCE

### File 61: PRF_KB_Advanced_Experiment_Designs_v1.0.txt
**Location: release/v6.0/agents/prf/kb/**
**Target: 10,000-12,000 characters**

Required sections:
- REGRESSION DISCONTINUITY: Sharp vs fuzzy, bandwidth selection, placebo tests
- INTERRUPTED TIME SERIES: Pre-post comparison, trend modeling
- DIFFERENCE-IN-DIFFERENCES: Parallel trends, staggered adoption, synthetic DID
- INSTRUMENTAL VARIABLES: Instrument identification, relevance, 2SLS
- AGENT APPLICATION GUIDANCE

### File 62: ANL_KB_Cross_Channel_Optimization_v1.0.txt
**Location: release/v6.0/agents/anl/kb/**
**Target: 10,000-12,000 characters**

Required sections:
- OPTIMIZATION PROBLEM: Objective function, constraints, decision variables
- ALGORITHMS: Linear, nonlinear, convex, mixed-integer programming
- MULTI-OBJECTIVE: Pareto frontier, weighted sum, goal programming
- MARKETING APPLICATIONS: Budget allocation, media mix, audience selection
- AGENT APPLICATION GUIDANCE

### File 63: SPO_KB_Quality_Score_Framework_v1.0.txt
**Location: release/v6.0/agents/spo/kb/**
**Target: 10,000-12,000 characters**

Required sections:
- QUALITY DIMENSIONS: Viewability (25%), Fraud (25%), Brand Safety (20%), Attention (15%), Ad Clutter (10%), Speed (5%)
- COMPOSITE QUALITY SCORE: Calculation, normalization, threshold definitions
- CHANNEL-SPECIFIC BENCHMARKS: By channel and format, seasonal variations
- QUALITY-BASED OPTIMIZATION: Bid adjustment, minimum floors, efficiency curves
- AGENT APPLICATION GUIDANCE

---

## BATCH 13: System & Data (8 files)
**Location: Various - see each file**

### File 64: SYS_KB_Missing_Model_Classes_v1.0.txt
**Location: release/v6.0/system/**
**Target: 12,000-15,000 characters**

Required sections:
- CREATIVE PERFORMANCE MODELING: Pre-flight scoring, fatigue, refresh, matching
- PRICING AND PROMOTION EFFECTS: Price elasticity, promotion response, cannibalization
- SUPPLY-SIDE CONSTRAINTS: Inventory modeling, delivery probability, capacity
- CLV MODELING: Predictive CLV, CLV-based segmentation, acquisition value
- CHURN AND RETENTION: Churn propensity, intervention timing, win-back
- COMPETITIVE RESPONSE: Monitoring, SOV modeling, defensive strategy
- AGENT APPLICATION GUIDANCE

### File 65: SYS_KB_Implementation_Roadmap_v1.0.txt
**Location: release/v6.0/system/**
**Target: 10,000-12,000 characters**

Required sections:
- MATURITY MODEL: Level 1 basic, Level 2 integrated, Level 3 unified, Level 4 autonomous
- IMPLEMENTATION PHASES: Foundation, Measurement, Optimization, Automation
- SUCCESS METRICS: Model accuracy, decision quality, business impact, efficiency
- RISK MITIGATION: Technical, organizational, data, regulatory risks
- AGENT APPLICATION GUIDANCE

### File 66: ANL_KB_MMM_Data_Requirements_v1.0.txt
**Location: release/v6.0/agents/anl/kb/**
**Target: 10,000-12,000 characters**

Required sections:
- DATA SPECIFICATION: Outcome variables, media variables, control variables, granularity
- DATA QUALITY REQUIREMENTS: Completeness, accuracy, consistency, historical depth
- DATA TRANSFORMATION: Log, adstock, normalization, outlier handling
- DATA INFRASTRUCTURE: Warehouse integration, pipelines, documentation, governance
- AGENT APPLICATION GUIDANCE

### File 67: AUD_KB_Zero_Party_Data_v1.0.txt
**Location: release/v6.0/agents/aud/kb/**
**Target: 10,000-12,000 characters**

Required sections:
- ZERO-PARTY DATA DEFINITION: Distinction from first-party, data types, collection
- COLLECTION STRATEGIES: Surveys, preference centers, progressive profiling, value exchange
- ACTIVATION: Preference data usage, personalization, privacy-first
- TRUST BUILDING: Transparency, value delivery, consent management
- AGENT APPLICATION GUIDANCE

### File 68: AUD_KB_Audience_Overlap_v1.0.txt
**Location: release/v6.0/agents/aud/kb/**
**Target: 10,000-12,000 characters**

Required sections:
- OVERLAP ANALYSIS METHODOLOGIES: Platform tools, clean room, statistical
- PLATFORM-SPECIFIC TOOLS: Meta, Google, TTD overlap tools
- FREQUENCY MANAGEMENT: Cross-platform frequency, unified reach, waste
- SUPPRESSION STRATEGIES: Sequential messaging, suppression lists, deduplication
- AGENT APPLICATION GUIDANCE

### File 69: SPO_KB_Bid_Landscape_v1.0.txt
**Location: release/v6.0/agents/spo/kb/**
**Target: 10,000-12,000 characters**

Required sections:
- AUCTION DENSITY ANALYSIS: Bid volume, win rate optimization, competitive analysis
- BID SHADING: Methodology, effectiveness measurement, savings calculation
- FLOOR PRICE DETECTION: Detection methods, response strategies
- STRATEGIC BID ADJUSTMENTS: Daypart, seasonal, competitive response
- AGENT APPLICATION GUIDANCE

### File 70: SPO_KB_Header_Bidding_v1.0.txt
**Location: release/v6.0/agents/spo/kb/**
**Target: 10,000-12,000 characters**

Required sections:
- HEADER BIDDING MECHANICS: How it works, Prebid.js, timeout optimization
- SSP PRIORITIZATION: Strategies, revenue optimization, publisher leverage
- WRAPPER TECHNOLOGY: Server-side vs client-side, comparison
- REVENUE OPTIMIZATION: Best practices, pitfalls, monitoring
- AGENT APPLICATION GUIDANCE

### File 71: SPO_KB_Cost_Benchmarks_v1.0.txt
**Location: release/v6.0/agents/spo/kb/**
**Target: 12,000-15,000 characters**

Required sections:
- CPM BENCHMARKS BY VERTICAL (2025-2026): Technology, Finance, Healthcare, Retail, CPG, Auto, Travel, B2B
- CPC BENCHMARKS BY INDUSTRY: Search, Social, Display
- SEASONAL COST INDICES: Q1-Q4 patterns, holiday impacts
- GEOGRAPHIC VARIATIONS: US vs International, regional differences
- QUALITY-ADJUSTED METRICS: Viewable CPM benchmarks, attention-adjusted costs
- AGENT APPLICATION GUIDANCE

---

## VALIDATION SCRIPT

Run after creating each file:

```bash
./validate_kb_file.sh path/to/file.txt
```

If it passes, commit:

```bash
git add path/to/file.txt
git commit -m "feat(agent): Add [filename]"
```

Push every 5 commits:

```bash
git push origin feature/v6.0-kb-expansion
```

---

## COMPLETION CHECKLIST

After all 71 files are complete:

```bash
# Final push
git push origin feature/v6.0-kb-expansion

# Tag completion
git tag -a v6.0.0-kb-vscode-complete -m "VS Code KB expansion complete: 71 files"
git push origin v6.0.0-kb-vscode-complete

# Verify all files
find release/v6.0 -name "*.txt" -newer validate_kb_file.sh | wc -l
# Should show 71+ files
```

---

## IMPORTANT NOTES

1. **Claude.ai is creating 25 files in parallel** - check for merge conflicts when pushing
2. **All files MUST pass validation** - no exceptions
3. **Character count MUST be under 36,000** - target 10,000-15,000 for most files
4. **Commit after EVERY file** - prevents loss on disruption
5. **Reference docs/plans/ for detailed specifications** if needed

**START WITH BATCH 1 (UDM files) AND PROCEED SEQUENTIALLY.**

---

*VS Code Instructions v1.0 - Ready for execution*
