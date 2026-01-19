# VS CODE MPA v6.0 KB EXPANSION INSTRUCTIONS
## Batch File Creation Guide
### Date: January 18, 2026
### Version: 1.0

---

## CRITICAL: READ BEFORE STARTING

This document provides complete instructions for VS Code to create 71 KB files as part of the MPA v6.0 expansion. Claude.ai is simultaneously creating 25 complex architecture files.

**YOUR MISSION:** Create 71 pattern-based KB files following strict compliance requirements.

---

## SECTION 1: COMPLIANCE REQUIREMENTS (MANDATORY)

### 1.1 Six-Rule Framework

EVERY file MUST comply with ALL six rules:

```
RULE 1: ALL-CAPS HEADERS
CORRECT:   SECTION 1 - CORE CONCEPTS
INCORRECT: Section 1 - Core Concepts
INCORRECT: SECTION 1: Core Concepts

RULE 2: HYPHENS ONLY FOR LISTS
CORRECT:   - First item
           - Second item
INCORRECT: * First item
INCORRECT: • First item
INCORRECT: 1. First item (except numbered procedures)

RULE 3: ASCII CHARACTERS ONLY
CORRECT:   "quoted text"
INCORRECT: "smart quotes"
CORRECT:   --
INCORRECT: —
CORRECT:   ...
INCORRECT: …

RULE 4: ZERO VISUAL DEPENDENCIES
CORRECT:   Structured text descriptions
INCORRECT: | Column 1 | Column 2 |
INCORRECT: [image reference]
INCORRECT: **bold** or _italic_

RULE 5: MANDATORY DOCUMENT HEADER
EVERY file starts with:
[AGENT]_KB_[Topic]_v1.0.txt
VERSION: 1.0
STATUS: Production Ready
COMPLIANCE: 6-Rule Compliant
LAST UPDATED: 2026-01-18
CHARACTER COUNT: [actual count]

RULE 6: PROFESSIONAL TONE
CORRECT:   The system calculates marginal returns using...
INCORRECT: We calculate marginal returns using...
INCORRECT: I recommend calculating marginal returns...
INCORRECT: Let's calculate marginal returns! 😊
```

### 1.2 Microsoft Stack Compatibility

```
COPILOT STUDIO:
- Maximum 36,000 characters per file
- Plain text only, no markdown rendering
- UTF-8 encoding

AZURE/DATAVERSE/SHAREPOINT:
- No spaces in filenames (use underscores)
- Case-sensitive naming
- Target file size under 100KB
```

### 1.3 File Naming Convention

```
FORMAT: [AGENT]_KB_[Topic]_v1.0.txt

AGENT CODES:
ANL = Analyst Agent
AUD = Audience Agent
CHA = Channel Agent
CSO = Contact Stream Optimizer
DOC = Document Agent
NDS = Next Dollar Spend
ORC = Orchestrator Agent
PRF = Performance Agent
SPO = Spend Optimization Agent
SYS = System/Shared
UDM = Unstructured Data Mining

EXAMPLES:
UDM_KB_Text_Mining_Methods_v1.0.txt
ANL_KB_Bayesian_MMM_v1.0.txt
PRF_KB_Shapley_Attribution_v1.0.txt
```

---

## SECTION 2: DOCUMENT TEMPLATE

Use this exact template for every file:

```
[AGENT]_KB_[Topic]_v1.0.txt
VERSION: 1.0
STATUS: Production Ready
COMPLIANCE: 6-Rule Compliant
LAST UPDATED: 2026-01-18
CHARACTER COUNT: [UPDATE AFTER COMPLETION]

================================================================================
SECTION 1 - [FIRST SECTION TITLE IN ALL CAPS]
================================================================================

OVERVIEW

[Opening paragraph describing the topic and its importance]

[SUBSECTION TITLE IN ALL CAPS]

[Content with hyphens for any lists]
- First item
- Second item
- Third item

[Continue with detailed content...]

================================================================================
SECTION 2 - [SECOND SECTION TITLE]
================================================================================

[Section content...]

[SUBSECTION]

[Detailed content...]

================================================================================
SECTION 3 - [THIRD SECTION TITLE]
================================================================================

[Continue pattern...]

================================================================================
SECTION N - AGENT APPLICATION GUIDANCE
================================================================================

WHEN TO USE THIS KNOWLEDGE

[Guidance on when agent should reference this KB]

INTEGRATION WITH OTHER AGENTS

[How this KB interfaces with other agents]

RESPONSE FORMATTING

[How agent should format responses using this KB]

================================================================================
END OF DOCUMENT
================================================================================
```

---

## SECTION 3: DIRECTORY STRUCTURE

### 3.1 Create These New Directories

```bash
# Run these commands from repo root
mkdir -p release/v6.0/agents/cso/kb
mkdir -p release/v6.0/agents/cso/instructions
mkdir -p release/v6.0/agents/nds/kb
mkdir -p release/v6.0/agents/nds/instructions
mkdir -p release/v6.0/agents/udm/kb
mkdir -p release/v6.0/agents/udm/instructions
mkdir -p release/v6.0/system
```

### 3.2 File Placement

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

## SECTION 4: YOUR 71 FILES TO CREATE

### BATCH 1: UDM - Unstructured Data Mining (8 files)

Location: release/v6.0/agents/udm/kb/

#### 1. UDM_KB_Text_Mining_Methods_v1.0.txt
```
REQUIRED SECTIONS:
- TEXT PREPROCESSING PIPELINE
  - Tokenization strategies
  - Lemmatization vs stemming
  - Stop word handling
  - Named entity recognition
  
- EMBEDDING MODELS
  - Word2Vec, GloVe fundamentals
  - FastText for subword handling
  - BERT and transformer variants
  - Sentence transformers
  - Domain-specific fine-tuning approaches
  
- TOPIC MODELING
  - Latent Dirichlet Allocation (LDA)
  - Non-negative Matrix Factorization
  - BERTopic neural approach
  - Dynamic and hierarchical topics
  
- SENTIMENT AND EMOTION ANALYSIS
  - Lexicon-based methods
  - ML classifiers
  - Transformer-based sentiment
  - Aspect-based sentiment
  
- MARKETING APPLICATIONS
  - Review mining
  - Call center analysis
  - Social listening
  - Competitor monitoring
  - Creative copy optimization

TARGET: 10,000-15,000 characters
```

#### 2. UDM_KB_Creative_Analysis_v1.0.txt
```
REQUIRED SECTIONS:
- IMAGE ANALYSIS
  - CNN feature extraction (ResNet, VGG)
  - Object detection methods
  - Color and composition analysis
  - Brand element detection
  - Text-in-image OCR
  
- VIDEO ANALYSIS
  - Frame sampling strategies
  - Scene detection
  - Audio-visual features
  - Engagement correlation
  
- CREATIVE ATTRIBUTE EXTRACTION
  - Visual complexity scoring
  - Emotional classification
  - Brand prominence
  - CTA detection
  
- CREATIVE PERFORMANCE PREDICTION
  - Multi-modal models
  - Historical correlation
  - A/B test acceleration
  - Fatigue prediction
  
- IMPLEMENTATION GUIDANCE
  - Pre-trained model selection
  - Transfer learning
  - Batch vs real-time
  - Vector database storage

TARGET: 10,000-15,000 characters
```

#### 3. UDM_KB_Social_Web_Mining_v1.0.txt
```
REQUIRED SECTIONS:
- SOCIAL LISTENING
  - Platform API integration
  - Mention and hashtag tracking
  - Influencer identification
  - Viral content detection
  - Crisis signal detection
  
- WEB CONTENT MINING
  - Crawler architecture
  - Content extraction
  - Competitor monitoring
  - Price/promotion tracking
  
- GRAPH-BASED ANALYSIS
  - Social network analysis
  - Community detection
  - Influence propagation
  - Bot detection
  
- REAL-TIME STREAM PROCESSING
  - Event stream architecture
  - Windowed aggregations
  - Anomaly detection
  - Alert generation

TARGET: 10,000-15,000 characters
```

#### 4. UDM_KB_Log_Event_Analysis_v1.0.txt
```
REQUIRED SECTIONS:
- LOG PARSING
  - Structured vs unstructured
  - Pattern extraction
  - Session reconstruction
  - Error classification
  
- EVENT SEQUENCE ANALYSIS
  - Clickstream analysis
  - Funnel reconstruction
  - Path analysis
  - Sequence pattern mining
  
- ANOMALY DETECTION IN LOGS
  - Statistical methods
  - Isolation forest
  - LSTM autoencoders
  - Log2Vec embeddings
  
- USER BEHAVIOR MODELING
  - Session features
  - Engagement patterns
  - Intent signals
  - Conversion likelihood

TARGET: 10,000-12,000 characters
```

#### 5. UDM_KB_Feature_Engineering_Unstructured_v1.0.txt
```
REQUIRED SECTIONS:
- FEATURE EXTRACTION PATTERNS
  - Embedding aggregation
  - TF-IDF and BM25
  - Graph-based features
  - Temporal aggregation
  
- FEATURE STORE INTEGRATION
  - Computation pipelines
  - Online vs offline
  - Versioning
  - Freshness requirements
  
- DOWNSTREAM MODEL INTEGRATION
  - Features for propensity
  - Features for MMM
  - Features for attribution
  - Features for creative optimization
  
- QUALITY AND MONITORING
  - Drift detection
  - Coverage analysis
  - Importance tracking

TARGET: 10,000-12,000 characters
```

#### 6. UDM_KB_Anomaly_Pattern_Detection_v1.0.txt
```
REQUIRED SECTIONS:
- ANOMALY DETECTION METHODS
  - Statistical (control charts, CUSUM)
  - Distance-based (LOF, k-NN)
  - Density-based (DBSCAN)
  - Model-based (isolation forest, autoencoders)
  - Ensemble methods
  
- PATTERN MINING
  - Frequent pattern mining
  - Sequential pattern mining
  - Association rules
  - Contrast patterns
  
- TREND DETECTION
  - Change point detection
  - Trend decomposition
  - Regime change
  - Emerging topics
  
- ALERT PRIORITIZATION
  - Severity scoring
  - Business impact
  - Root cause suggestion

TARGET: 10,000-12,000 characters
```

#### 7. UDM_KB_NLP_Marketing_Applications_v1.0.txt
```
REQUIRED SECTIONS:
- CUSTOMER FEEDBACK ANALYSIS
  - Review summarization
  - Pain point extraction
  - Feature request mining
  - Competitive mentions
  
- CONVERSATIONAL ANALYTICS
  - Intent classification
  - Entity extraction
  - Dialogue act recognition
  - Satisfaction inference
  
- CONTENT GENERATION SIGNALS
  - Headline effectiveness
  - Copy optimization
  - Keyword extraction
  - Content gaps
  
- SEARCH AND DISCOVERY
  - Query understanding
  - Semantic search
  - Recommendations
  - Personalization

TARGET: 10,000-12,000 characters
```

#### 8. UDM_KB_Multimodal_Integration_v1.0.txt
```
REQUIRED SECTIONS:
- MULTIMODAL FUSION
  - Early fusion
  - Late fusion
  - Cross-modal attention
  - CLIP-style learning
  
- CREATIVE PERFORMANCE MODELING
  - Image + text + audio
  - Cross-modal consistency
  - Multimodal embeddings
  
- UNIFIED REPRESENTATION
  - Joint embedding spaces
  - Cross-modal retrieval
  - Multimodal clustering
  
- PRODUCTION CONSIDERATIONS
  - Computational requirements
  - Latency management
  - Model serving

TARGET: 10,000-12,000 characters
```

---

### BATCH 2: MMM Enhancement (5 files)

Location: release/v6.0/agents/anl/kb/

#### 9. ANL_KB_Bayesian_MMM_v1.0.txt
```
REQUIRED SECTIONS:
- BAYESIAN MMM FUNDAMENTALS
  - Prior specification
  - Likelihood specification
  - Posterior inference
  - Credible intervals
  
- MODEL SPECIFICATION
  - Adstock priors
  - Saturation priors
  - Hierarchical priors
  - Prior predictive checks
  
- INFERENCE METHODS
  - MCMC (Stan, PyMC)
  - Variational inference
  - Convergence diagnostics
  
- MODEL COMPARISON
  - WAIC, LOO-CV
  - Posterior predictive checks
  
- TOOLS AND PLATFORMS
  - Google LightweightMMM
  - Meta Robyn
  - PyMC-Marketing

TARGET: 12,000-15,000 characters
```

#### 10. ANL_KB_Campaign_Level_MMM_v1.0.txt
```
REQUIRED SECTIONS:
- GRANULARITY CHALLENGES
  - Data sparsity
  - Multicollinearity
  - Short durations
  - Confounding
  
- METHODOLOGICAL APPROACHES
  - Hierarchical models
  - Bayesian shrinkage
  - Regularization
  - Factor models
  
- CREATIVE AND MESSAGING EFFECTS
  - Creative quality variables
  - Message testing
  - Wear-out modeling
  
- TARGETING EFFECTS
  - Audience quality
  - Targeting precision
  - Reach vs frequency

TARGET: 10,000-12,000 characters
```

#### 11. ANL_KB_GeoLift_Augmented_MMM_v1.0.txt
```
REQUIRED SECTIONS:
- GEO-LIFT INTEGRATION
  - Experimental calibration
  - Prior updating
  - Lift-adjusted elasticities
  
- SYNTHETIC CONTROL CALIBRATION
  - Using geo-tests to validate
  - Discrepancy analysis
  - Correction factors
  
- EXPERIMENTAL DESIGN
  - Optimal geo selection
  - Power analysis
  - Rotation schedules
  
- UNIFIED FRAMEWORK
  - MMM + Incrementality fusion
  - Weighted averaging
  - Bayesian model averaging

TARGET: 10,000-12,000 characters
```

#### 12. ANL_KB_MMM_External_Factors_v1.0.txt
```
REQUIRED SECTIONS:
- SEASONALITY MODELING
  - Harmonic regression
  - Seasonal dummies
  - Holiday effects
  - Event effects
  
- PROMOTIONAL EFFECTS
  - Price elasticity
  - Promotion timing
  - Cannibalization
  - Carryover
  
- MACROECONOMIC FACTORS
  - GDP, unemployment
  - Consumer confidence
  - Category trends
  - Competitive spend
  
- DISTRIBUTION AND EXTERNAL
  - Store count
  - Out-of-stock
  - Weather
  - Major events

TARGET: 10,000-12,000 characters
```

#### 13. ANL_KB_MMM_Output_Utilization_v1.0.txt
```
REQUIRED SECTIONS:
- BUDGET PLANNING INTEGRATION
  - Annual planning inputs
  - Quarterly allocation
  - Scenario modeling
  
- OPTIMIZATION INTEGRATION
  - Response curves to NDS
  - Saturation warnings
  - Reallocation recommendations
  
- REPORTING AND COMMUNICATION
  - Executive summaries
  - Channel contribution
  - ROI decomposition
  - Confidence communication
  
- CONTINUOUS CALIBRATION
  - Refresh cadence
  - Rolling window
  - Drift monitoring

TARGET: 10,000-12,000 characters
```

---

### BATCH 3: MTA/Attribution (5 files)

Location: release/v6.0/agents/prf/kb/

#### 14. PRF_KB_Shapley_Attribution_v1.0.txt
```
REQUIRED SECTIONS:
- SHAPLEY VALUE FUNDAMENTALS
  - Game theory foundation
  - Marginal contribution
  - Fairness axioms
  
- CALCULATION METHODS
  - Exact computation
  - Sampling approximation
  - Kernel SHAP
  
- MARKETING APPLICATION
  - Channel as player
  - Path-based Shapley
  - Time-decay weighted
  
- IMPLEMENTATION
  - Computational scaling
  - Path length handling
  - Multi-device attribution
  
- VALIDATION
  - Incrementality comparison
  - Sensitivity analysis

TARGET: 10,000-12,000 characters
```

#### 15. PRF_KB_Sequence_Attribution_Models_v1.0.txt
```
REQUIRED SECTIONS:
- MARKOV CHAIN ATTRIBUTION
  - State transition matrices
  - Removal effect
  - Higher-order Markov
  - Absorbing chains
  
- LSTM SEQUENCE MODELS
  - Sequence representation
  - Architecture design
  - Attention mechanisms
  
- TRANSFORMER-BASED
  - Self-attention for paths
  - Positional encoding
  - Pre-training approaches
  
- FEATURE ENGINEERING
  - Path length features
  - Transition features
  - Time gap features

TARGET: 10,000-12,000 characters
```

#### 16. PRF_KB_Path_Based_Attribution_v1.0.txt
```
REQUIRED SECTIONS:
- PATH ANALYSIS
  - Path frequency
  - Conversion path clustering
  - Path length distribution
  - Channel order patterns
  
- FUNNEL ATTRIBUTION
  - Stage-based attribution
  - Funnel transitions
  - Assist vs closer
  - Multi-funnel handling
  
- POSITION-BASED MODELS
  - U-shaped (40-20-40)
  - W-shaped
  - Custom weighting
  - Time-decayed position

TARGET: 10,000-12,000 characters
```

#### 17. PRF_KB_Attribution_Validation_v1.0.txt
```
REQUIRED SECTIONS:
- INCREMENTALITY CALIBRATION
  - Holdout validation
  - Lift correlation
  - Calibration factors
  - Ongoing cadence
  
- CROSS-VALIDATION
  - Temporal holdouts
  - User-level holdouts
  - Out-of-sample performance
  
- SANITY CHECKS
  - Efficiency (sum to 100%)
  - Directional consistency
  - Benchmark comparison
  - Edge cases

TARGET: 10,000-12,000 characters
```

#### 18. PRF_KB_Attribution_MTA_MMM_Reconciliation_v1.0.txt
```
REQUIRED SECTIONS:
- GOVERNANCE FRAMEWORK
  - When to trust MMM
  - When to trust MTA
  - When to trust incrementality
  
- RECONCILIATION METHODS
  - Unified measurement
  - Calibration cascades
  - Weighted averaging
  - Bayesian model averaging
  
- CONFLICT RESOLUTION
  - Discrepancy analysis
  - Coverage gaps
  - Measurement artifacts
  - Decision rules
  
- PRACTICAL IMPLEMENTATION
  - Reporting dashboards
  - Decision support
  - Stakeholder communication

TARGET: 10,000-12,000 characters
```

---

### BATCH 4: Incrementality (5 files)

Location: release/v6.0/agents/prf/kb/

#### 19. PRF_KB_Geo_Test_Design_v1.0.txt
```
REQUIRED SECTIONS:
- GEO TEST FUNDAMENTALS
  - Treatment vs control
  - Matched market methodology
  - Synthetic control methodology
  - Power analysis
  
- SYNTHETIC CONTROL DETAILED
  - Donor pool construction
  - Pre-period matching
  - RMSPE minimization
  - Placebo tests
  - p-value calculation
  
- MATCHED MARKET DETAILED
  - Covariate matching
  - Propensity score matching
  - Caliper selection
  - Balance diagnostics
  
- PRACTICAL CONSIDERATIONS
  - Minimum geo size
  - Test duration
  - Contamination prevention
  - Spillover effects

TARGET: 12,000-15,000 characters
```

#### 20. PRF_KB_Audience_Split_Tests_v1.0.txt
```
REQUIRED SECTIONS:
- RANDOMIZATION
  - User-level
  - Cookie/device
  - Stratified
  - Cluster
  
- GHOST ADS / PSA TESTS
  - Ghost bid methodology
  - PSA control
  - Intent-to-treat analysis
  - Compliance handling
  
- PLATFORM LIFT STUDIES
  - Meta Conversion Lift
  - Google Brand Lift
  - TTD IncrementalityPlus
  - Methodology comparison
  
- SAMPLE SIZE AND DURATION
  - Power analysis
  - Effect size assumptions
  - Minimum detectable effect

TARGET: 10,000-12,000 characters
```

#### 21. PRF_KB_Always_On_Experiments_v1.0.txt
```
REQUIRED SECTIONS:
- CONTINUOUS EXPERIMENTATION
  - Rolling holdout design
  - Rotation schedules
  - Coverage optimization
  - Resource constraints
  
- MMM/MTA VALIDATION
  - Experimental validation
  - Calibration frequency
  - Discrepancy investigation
  - Model update triggers
  
- MULTI-ARM DESIGNS
  - Channel comparison
  - Multi-treatment
  - Factorial experiments
  - Adaptive designs
  
- OPERATIONAL INFRASTRUCTURE
  - Experiment tracking
  - Randomization services
  - Measurement pipelines

TARGET: 10,000-12,000 characters
```

#### 22. PRF_KB_Holdout_Design_v1.0.txt
```
REQUIRED SECTIONS:
- HOLDOUT SIZING
  - Statistical power
  - Business cost
  - Optimal percentage
  - Dynamic sizing
  
- STRATIFICATION
  - Audience segment
  - Geographic
  - Temporal
  - Value-based
  
- REPRESENTATIVENESS
  - Covariate balance
  - Distribution matching
  - Bias detection
  - Correction methods
  
- DURATION OPTIMIZATION
  - Minimum duration
  - Seasonality
  - Conversion lag
  - Early stopping

TARGET: 10,000-12,000 characters
```

#### 23. PRF_KB_Lift_Operationalization_v1.0.txt
```
REQUIRED SECTIONS:
- INTERPRETING RESULTS
  - Point estimates vs CI
  - Practical vs statistical significance
  - Effect heterogeneity
  - Temporal dynamics
  
- MMM PRIOR UPDATING
  - Bayesian prior updates
  - Elasticity calibration
  - Saturation adjustment
  
- PROPENSITY ADJUSTMENT
  - Lift-calibrated propensities
  - Incremental response rates
  - Value adjustment
  
- NDS INTEGRATION
  - Marginal return updates
  - Channel prioritization
  - Audience reallocation

TARGET: 10,000-12,000 characters
```

---

### BATCH 5: View/Click Tracking (4 files)

Location: release/v6.0/agents/prf/kb/

#### 24. PRF_KB_View_Click_Measurement_v1.0.txt
```
REQUIRED SECTIONS:
- MEASUREMENT DEFINITIONS
  - Click-through conversion (CTC)
  - View-through conversion (VTC)
  - Lookback windows
  - Platform definitions
  
- CLICK-THROUGH TRACKING
  - Tracking mechanisms
  - Redirect vs pixel
  - Click fraud filtering
  - Bot detection
  
- VIEW-THROUGH TRACKING
  - Impression tracking
  - Viewability requirements
  - View-through windows
  - Assisted vs attributed
  
- DEDUPLICATION RULES
  - CTC vs VTC priority
  - Cross-channel dedup
  - Time-based priority

TARGET: 10,000-12,000 characters
```

#### 25. PRF_KB_View_Through_Bias_Correction_v1.0.txt
```
REQUIRED SECTIONS:
- BIAS SOURCES
  - Selection bias
  - Viewability inflation
  - Fraud contamination
  - Natural baseline
  
- CORRECTION METHODS
  - Propensity score weighting
  - Inverse probability weighting
  - Doubly robust estimation
  
- PSA/GHOST AD CALIBRATION
  - Control group baseline
  - Lift-based adjustment
  - Incremental VTR
  
- QUALITY ADJUSTMENT
  - Viewability normalization
  - Attention-weighted
  - Fraud adjustment

TARGET: 10,000-12,000 characters
```

#### 26. PRF_KB_Multi_Impression_Sequence_v1.0.txt
```
REQUIRED SECTIONS:
- SEQUENCE EFFECTS
  - First impression effect
  - Last impression effect
  - Cumulative exposure
  - Frequency-response curves
  
- CROSS-CHANNEL SEQUENCES
  - Channel order effects
  - Synergy measurement
  - Optimal path identification
  
- CROSS-DEVICE SEQUENCES
  - Device order effects
  - Device handoff
  - Identity-based paths
  - Device role analysis
  
- MODELING APPROACHES
  - Survival models
  - Sequence models
  - Causal models
  - Mixed effects

TARGET: 10,000-12,000 characters
```

#### 27. PRF_KB_Signal_Integration_Framework_v1.0.txt
```
REQUIRED SECTIONS:
- SIGNAL FLOW TO ATTRIBUTION
  - Real-time processing
  - Window management
  - Deduplication logic
  - Fractional credit
  
- SIGNAL FLOW TO INCREMENTALITY
  - Experiment integration
  - Holdout tracking
  - Lift measurement
  - Calibration feedback
  
- SIGNAL FLOW TO MMM
  - Aggregation methodology
  - Adstock application
  - Quality weighting
  
- SIGNAL FLOW TO NDS/CSO
  - Real-time availability
  - Latency requirements
  - Confidence levels

TARGET: 10,000-12,000 characters
```

---

### BATCH 6: NDS Supporting (5 files)

Location: release/v6.0/agents/nds/kb/

#### 28. NDS_KB_Real_Time_Optimization_v1.0.txt
```
REQUIRED SECTIONS:
- REAL-TIME ARCHITECTURE
  - Streaming ingestion
  - Feature latency
  - Inference latency
  - Decision latency
  
- ONLINE LEARNING
  - Incremental updates
  - Thompson sampling
  - Contextual bandits
  - Regret bounds
  
- PACING AND THROTTLING
  - Budget pacing
  - Bid landscape adaptation
  - Constraint enforcement
  
- FEEDBACK LOOPS
  - Attribution lag
  - Conversion delay
  - Proxy metrics

TARGET: 10,000-12,000 characters
```

#### 29. NDS_KB_Simulation_WhatIf_v1.0.txt
```
REQUIRED SECTIONS:
- SCENARIO SIMULATION
  - Budget reallocation
  - Channel mix
  - Timing shifts
  - Audience focus
  
- MONTE CARLO SIMULATION
  - Input distributions
  - Correlation structure
  - Output analysis
  - Risk metrics
  
- COUNTERFACTUAL ANALYSIS
  - What would have happened
  - Causal inference
  - Synthetic control
  
- OPTIMIZATION UNDER UNCERTAINTY
  - Robust optimization
  - Stochastic programming
  - Chance constraints

TARGET: 10,000-12,000 characters
```

#### 30. NDS_KB_Audience_Level_Allocation_v1.0.txt
```
REQUIRED SECTIONS:
- AUDIENCE VALUATION
  - CLV-based valuation
  - Propensity-weighted
  - Incremental value
  - Margin-adjusted
  
- AUDIENCE-SPECIFIC RESPONSE
  - Heterogeneity modeling
  - Segment elasticities
  - Saturation curves
  
- ALLOCATION OPTIMIZATION
  - Multi-audience optimization
  - Fairness constraints
  - Coverage constraints
  - Portfolio approach

TARGET: 10,000-12,000 characters
```

#### 31. NDS_KB_Channel_Tactic_Allocation_v1.0.txt
```
REQUIRED SECTIONS:
- CHANNEL SELECTION
  - Channel fit by objective
  - Channel fit by audience
  - Cost efficiency
  - Incrementality
  
- TACTIC SELECTION
  - Tactic-level response
  - Placement optimization
  - Format optimization
  - Bid strategy selection
  
- CONSTRAINT HANDLING
  - Minimum spend
  - Maximum caps
  - Frequency limits
  - Quality floors

TARGET: 10,000-12,000 characters
```

#### 32. NDS_KB_Always_On_Optimization_v1.0.txt
```
REQUIRED SECTIONS:
- CONTINUOUS OPTIMIZATION
  - Frequency
  - Rebalancing triggers
  - Drift detection
  - Constraint monitoring
  
- LEARNING RATE MANAGEMENT
  - Adaptation vs stability
  - Regime change detection
  - Confidence-weighted updates
  
- PERFORMANCE MONITORING
  - Optimization lift
  - Attribution of value
  - Counterfactual benchmark
  
- GOVERNANCE
  - Human-in-the-loop
  - Override mechanisms
  - Alert thresholds

TARGET: 10,000-12,000 characters
```

---

### BATCH 7: CSO Supporting (3 files)

Location: release/v6.0/agents/cso/kb/

#### 33. CSO_KB_Channel_Creative_Mix_v1.0.txt
```
REQUIRED SECTIONS:
- CHANNEL MIX OPTIMIZATION
  - Channel preference by audience
  - Channel by stage
  - Cost efficiency
  - Cross-channel synergies
  
- CREATIVE MIX
  - Creative rotation
  - Personalized selection
  - Testing integration
  - Fatigue management
  
- AUDIENCE-STAGE MATRIX
  - Channel mix by audience x stage
  - Creative selection
  - Budget allocation
  - Performance tracking

TARGET: 10,000-12,000 characters
```

#### 34. CSO_KB_Constraint_Handling_v1.0.txt
```
REQUIRED SECTIONS:
- CHANNEL CONSTRAINTS
  - Daily/weekly caps
  - Inventory availability
  - Delivery guarantees
  - Exclusivity
  
- LEGAL/PRIVACY CONSTRAINTS
  - Consent requirements
  - Opt-out handling
  - Data limitations
  - Geographic restrictions
  
- CUSTOMER EXPERIENCE GUARDRAILS
  - Maximum frequency
  - Channel preferences
  - Do-not-contact
  - Complaint triggers
  
- CAPACITY CONSTRAINTS
  - Call center
  - Fulfillment
  - Budget
  - Resource

TARGET: 10,000-12,000 characters
```

#### 35. CSO_KB_Journey_Orchestration_v1.0.txt
```
REQUIRED SECTIONS:
- ORCHESTRATION ARCHITECTURE
  - Decision engine design
  - Real-time vs batch
  - Caching and performance
  - Failover handling
  
- MULTI-CHANNEL COORDINATION
  - Cross-channel dedup
  - Unified customer view
  - Channel handoff
  - Consistent messaging
  
- INTEGRATION POINTS
  - Campaign management
  - Marketing automation
  - CDP
  - Analytics
  
- MEASUREMENT
  - Journey-level metrics
  - Incrementality of orchestration
  - Continuous improvement

TARGET: 10,000-12,000 characters
```

---

### BATCH 8: ML Scientific (13 files)

Location: Various (see each file)

#### 36. AUD_KB_Churn_Prediction_ML_v1.0.txt (release/v6.0/agents/aud/kb/)
```
REQUIRED SECTIONS:
- CHURN DEFINITION
  - Binary churn
  - Contractual vs non-contractual
  - Partial churn
  - Timeframe definition
  
- SURVIVAL ANALYSIS
  - Cox Proportional Hazards
  - Parametric survival models
  - Survival neural networks
  - Competing risks
  
- ML FOR CHURN
  - Classification approaches
  - Sequence models
  - Feature engineering
  
- MODEL CALIBRATION
  - Survival calibration
  - Brier score
  - Time-dependent AUC
  
- INTERVENTION OPTIMIZATION
  - Optimal timing
  - Treatment effect
  - Cost-sensitive learning

TARGET: 12,000-15,000 characters
```

#### 37. AUD_KB_RFM_Advanced_Analytics_v1.0.txt (release/v6.0/agents/aud/kb/)
```
REQUIRED SECTIONS:
- CLASSIC RFM FRAMEWORK
  - Recency, Frequency, Monetary
  - Scoring methodologies
  - Segment definitions
  
- ML EXTENSIONS TO RFM
  - CLV-weighted RFM
  - BG/NBD model
  - Pareto/NBD model
  - Gamma-Gamma model
  
- ADVANCED SEGMENTATION
  - Cluster-based (K-means, GMM)
  - Self-organizing maps
  - Deep learning embeddings
  
- ACTIVATION STRATEGIES
  - Segment-specific messaging
  - Channel preference
  - Offer optimization

TARGET: 10,000-12,000 characters
```

#### 38. AUD_KB_Intent_Modeling_ML_v1.0.txt (release/v6.0/agents/aud/kb/)
```
REQUIRED SECTIONS:
- INTENT SIGNAL TAXONOMY
  - Explicit intent
  - Implicit intent
  - Third-party intent
  
- INTENT SCORING MODELS
  - Heuristic scoring
  - ML intent models
  - Feature engineering
  
- REAL-TIME INTENT
  - Streaming architecture
  - Real-time features
  - Low latency serving
  
- INTENT-BASED ACTIVATION
  - Bid adjustments
  - Audience segments
  - Sequential messaging

TARGET: 10,000-12,000 characters
```

#### 39. AUD_KB_Taxonomy_Management_v1.0.txt (release/v6.0/agents/aud/kb/)
```
REQUIRED SECTIONS:
- TAXONOMY FUNDAMENTALS
  - Hierarchical classification
  - Flat vs deep
  - Polyhierarchical
  - Faceted classification
  
- AUDIENCE TAXONOMY STANDARDS
  - IAB Content Taxonomy
  - IAB Audience Taxonomy
  - Custom development
  
- TAXONOMY OPERATIONS
  - Cross-walk mapping
  - Governance
  - Version control
  
- ML FOR TAXONOMY
  - Automatic classification
  - Taxonomy expansion
  - Synonym detection

TARGET: 10,000-12,000 characters
```

#### 40. AUD_KB_Data_Onboarding_Scientific_v1.0.txt (release/v6.0/agents/aud/kb/)
```
REQUIRED SECTIONS:
- ONBOARDING PIPELINE
  - Data ingestion
  - Identity key extraction
  - Matching execution
  - Match rate reporting
  
- MATCH RATE ANALYSIS
  - Expected rates
  - Diagnostics
  - Quality validation
  
- PLATFORM INTEGRATION
  - DSP activation
  - Social custom audiences
  - CTV targeting
  - Measurement onboarding
  
- REFRESH STRATEGIES
  - Full vs incremental
  - Frequency optimization
  - Decay analysis

TARGET: 10,000-12,000 characters
```

#### 41. AUD_KB_Privacy_Preserving_Matching_v1.0.txt (release/v6.0/agents/aud/kb/)
```
REQUIRED SECTIONS:
- PRIVACY TECHNOLOGIES
  - Secure multi-party computation
  - Differential privacy
  - Private set intersection
  
- CLEAN ROOM TECHNOLOGIES
  - AWS Clean Rooms
  - Snowflake Data Clean Room
  - Google Ads Data Hub
  - InfoSum, Habu
  
- CLEAN ROOM USE CASES
  - Audience overlap
  - Attribution modeling
  - Reach/frequency
  - Lookalike creation
  
- IMPLEMENTATION GUIDANCE
  - Selection criteria
  - Data preparation
  - Query limitations

TARGET: 10,000-12,000 characters
```

#### 42. AUD_KB_B2B_Identity_Resolution_v1.0.txt (release/v6.0/agents/aud/kb/)
```
REQUIRED SECTIONS:
- B2B IDENTITY CHALLENGE
  - Account vs contact vs user
  - Corporate hierarchies
  - Multiple locations
  - Firmographic matching
  
- ACCOUNT MATCHING
  - Company name matching
  - Firmographic matching
  - Hierarchy resolution
  
- CONTACT MATCHING
  - Business email
  - Title standardization
  - LinkedIn linkage
  
- B2B DATA PROVIDERS
  - Dun & Bradstreet
  - ZoomInfo
  - 6sense
  - Demandbase
  
- ACCOUNT-BASED TARGETING
  - IP-to-company
  - Intent data
  - Buying committee

TARGET: 10,000-12,000 characters
```

#### 43. ANL_KB_Deep_Learning_Marketing_v1.0.txt (release/v6.0/agents/anl/kb/)
```
REQUIRED SECTIONS:
- NEURAL NETWORK ARCHITECTURES
  - Feed-forward for tabular
  - Recurrent networks
  - Transformer models
  - Graph neural networks
  
- APPLICATIONS
  - Customer journey modeling
  - Creative optimization
  - Dynamic pricing
  - Recommendation systems
  
- PRACTICAL CONSIDERATIONS
  - Training data requirements
  - Computational resources
  - Interpretability trade-offs
  - Deployment infrastructure

TARGET: 12,000-15,000 characters
```

#### 44. ANL_KB_Optimization_Algorithms_v1.0.txt (release/v6.0/agents/anl/kb/)
```
REQUIRED SECTIONS:
- PROBLEM FORMULATION
  - Decision variables
  - Objective function
  - Constraints
  
- LINEAR PROGRAMMING
  - Simplex algorithm
  - Interior point methods
  - Sensitivity analysis
  
- NONLINEAR PROGRAMMING
  - Gradient descent
  - Newton methods
  - SQP
  
- MULTI-OBJECTIVE
  - Pareto frontier
  - Weighted sum
  - Goal programming
  
- MARKETING APPLICATIONS
  - Budget allocation
  - Media mix
  - Price optimization

TARGET: 12,000-15,000 characters
```

#### 45. ANL_KB_Simulation_Methods_v1.0.txt (release/v6.0/agents/anl/kb/)
```
REQUIRED SECTIONS:
- MONTE CARLO SIMULATION
  - Random number generation
  - Distribution sampling
  - Variance reduction
  - Convergence
  
- INPUT DISTRIBUTION SELECTION
  - Historical fitting
  - Expert elicitation
  - Correlation structure
  
- OUTPUT ANALYSIS
  - Confidence intervals
  - Percentile estimation
  - Sensitivity to inputs
  
- MARKETING APPLICATIONS
  - Budget scenarios
  - Risk quantification
  - Forecast ranges

TARGET: 10,000-12,000 characters
```

#### 46. ANL_KB_Financial_Modeling_Marketing_v1.0.txt (release/v6.0/agents/anl/kb/)
```
REQUIRED SECTIONS:
- MARKETING P&L
  - Revenue attribution
  - Variable cost allocation
  - Contribution margin
  - Marketing ROI
  
- CUSTOMER UNIT ECONOMICS
  - CAC calculation
  - LTV estimation
  - Payback period
  - LTV:CAC benchmarks
  
- INVESTMENT ANALYSIS
  - NPV
  - IRR
  - Payback period
  
- BREAK-EVEN ANALYSIS
  - Break-even ROAS
  - Volume break-even
  - Scenario analysis

TARGET: 12,000-15,000 characters
```

#### 47. ANL_KB_Experimental_Design_v1.0.txt (release/v6.0/agents/anl/kb/)
```
REQUIRED SECTIONS:
- FUNDAMENTALS
  - Randomization
  - Replication
  - Blocking
  - Factorial designs
  
- A/B TESTING
  - Sample size
  - Test duration
  - Multiple testing
  - Sequential testing
  
- MULTIVARIATE TESTING
  - Full factorial
  - Fractional factorial
  - Response surface
  
- QUASI-EXPERIMENTAL
  - DID
  - Regression discontinuity
  - Interrupted time series
  
- BANDIT ALGORITHMS
  - Multi-armed bandits
  - Thompson sampling
  - Contextual bandits

TARGET: 12,000-15,000 characters
```

#### 48. ANL_KB_Econometric_Modeling_v1.0.txt (release/v6.0/agents/anl/kb/)
```
REQUIRED SECTIONS:
- TIME SERIES ECONOMETRICS
  - Stationarity testing
  - Cointegration
  - Error correction models
  - VAR/VECM
  
- PANEL DATA METHODS
  - Fixed effects
  - Random effects
  - Hausman test
  - Dynamic panel
  
- INSTRUMENTAL VARIABLES
  - Endogeneity
  - Instrument selection
  - 2SLS
  
- CAUSAL INFERENCE
  - Propensity score
  - Regression discontinuity
  - DID
  - Synthetic control

TARGET: 12,000-15,000 characters
```

---

### BATCH 9: PRF Scientific (7 files)

Location: release/v6.0/agents/prf/kb/

#### 49. PRF_KB_Viewability_Deep_Dive_v1.0.txt
```
REQUIRED SECTIONS:
- VIEWABILITY STANDARDS
  - MRC display standard
  - MRC video standard
  - GroupM standard
  - Custom standards
  
- MEASUREMENT METHODOLOGY
  - Geometric measurement
  - Browser visibility
  - Cross-frame challenges
  
- CHANNEL-SPECIFIC VIEWABILITY
  - Display
  - Video
  - Mobile
  - CTV
  - Social
  
- PREDICTIVE VIEWABILITY
  - Pre-bid segments
  - Page-level prediction
  - Optimization strategies

TARGET: 12,000-15,000 characters
```

#### 50. PRF_KB_MFA_Detection_v1.0.txt
```
REQUIRED SECTIONS:
- MFA DEFINITION AND TAXONOMY
  - Arbitrage sites
  - Content farms
  - Clickbait sites
  - Auto-refresh sites
  
- IDENTIFICATION SIGNALS
  - Ad density
  - Templated content
  - Traffic patterns
  - Low engagement
  
- DETECTION ALGORITHMS
  - Ad density scoring
  - Content quality classifiers
  - Traffic source analysis
  
- BLOCKING STRATEGIES
  - Pre-bid exclusion
  - Custom block lists
  - Quality floors
  - PMP prioritization

TARGET: 10,000-12,000 characters
```

#### 51. PRF_KB_Attention_Measurement_Scientific_v1.0.txt
```
REQUIRED SECTIONS:
- ATTENTION SCIENCE
  - Active vs passive attention
  - Visual attention hierarchy
  - Cognitive load theory
  - Memory encoding
  
- ATTENTION METRICS
  - Attention seconds
  - Attention dwell time
  - Attentive reach
  - Attention CPM
  
- MEASUREMENT METHODOLOGIES
  - Eye tracking panels
  - Behavioral proxies
  - Predictive modeling
  
- PROVIDER METHODOLOGIES
  - Adelaide AU
  - Lumen
  - Amplified Intelligence
  - TVision
  
- BENCHMARKS AND OPTIMIZATION

TARGET: 12,000-15,000 characters
```

#### 52. PRF_KB_Multi_Touch_Attribution_Scientific_v1.0.txt
```
REQUIRED SECTIONS:
- MTA MODEL TAXONOMY
  - Rule-based models
  - Data-driven models
  
- SHAPLEY VALUE METHODOLOGY
  - Game theory
  - Calculation methods
  - Approximation
  
- MARKOV CHAIN ATTRIBUTION
  - State transitions
  - Removal effect
  - Higher-order models
  
- MACHINE LEARNING APPROACHES
  - RNN for sequences
  - Transformers
  - Feature engineering
  
- VALIDATION
  - Holdout validation
  - Incrementality calibration

TARGET: 12,000-15,000 characters
```

#### 53. PRF_KB_Anomaly_Detection_ML_v1.0.txt
```
REQUIRED SECTIONS:
- ANOMALY TYPES
  - Point anomalies
  - Contextual anomalies
  - Collective anomalies
  
- STATISTICAL METHODS
  - Z-score
  - IQR
  - Grubbs test
  
- MACHINE LEARNING METHODS
  - Isolation forest
  - One-class SVM
  - Autoencoders
  - Local outlier factor
  
- TIME SERIES ANOMALY
  - Prophet
  - Deep learning
  - Streaming detection
  
- ALERTING FRAMEWORK
  - Severity classification
  - Root cause suggestion

TARGET: 10,000-12,000 characters
```

#### 54. PRF_KB_Forecasting_ML_v1.0.txt
```
REQUIRED SECTIONS:
- FORECASTING PROBLEM TYPES
  - Point forecasting
  - Probabilistic forecasting
  - Hierarchical forecasting
  
- CLASSICAL TIME SERIES
  - ARIMA/SARIMA
  - Exponential smoothing
  - Theta method
  
- ML APPROACHES
  - Gradient boosting
  - Deep learning (DeepAR, N-BEATS, TFT)
  - Global models
  
- PROBABILISTIC FORECASTING
  - Quantile regression
  - Conformal prediction
  - Bayesian methods
  
- EVALUATION
  - MAE, MAPE, RMSE
  - Coverage probability
  - Pinball loss

TARGET: 12,000-15,000 characters
```

#### 55. PRF_KB_Model_Validation_Framework_v1.0.txt
```
REQUIRED SECTIONS:
- DATA SPLITTING
  - Train/validation/test
  - Temporal splits
  - Stratified splits
  - Cross-validation
  
- CLASSIFICATION METRICS
  - Confusion matrix
  - Accuracy, precision, recall, F1
  - ROC-AUC, PR-AUC
  - Log loss
  
- REGRESSION METRICS
  - MAE, MSE, RMSE
  - R-squared
  - Residual analysis
  
- CALIBRATION ASSESSMENT
  - Calibration curves
  - Brier score
  - Expected calibration error
  
- MODEL MONITORING
  - Performance drift
  - Feature drift
  - Alerting thresholds

TARGET: 10,000-12,000 characters
```

---

### BATCH 10: SPO Enhancement (4 files)

Location: release/v6.0/agents/spo/kb/

#### 56. SPO_KB_Margin_Analysis_v1.0.txt
```
REQUIRED SECTIONS:
- GROSS MARGIN CALCULATION
  - By channel
  - By product
  - After all fees
  
- MARGIN EROSION ANALYSIS
  - Fee identification
  - Leakage sources
  - Trend analysis
  
- BREAK-EVEN ROAS BY MARGIN
  - Tier calculation
  - Category differences
  
- CONTRIBUTION MARGIN OPTIMIZATION
  - Product-level
  - Promotional impact
  - Category benchmarks

TARGET: 10,000-12,000 characters
```

#### 57. SPO_KB_Working_Media_v1.0.txt
```
REQUIRED SECTIONS:
- WORKING MEDIA RATIO
  - Calculation methodology
  - Industry benchmarks (65-85%)
  
- FEE CATEGORIZATION
  - Tech tax analysis
  - Data cost allocation
  - Production costs
  
- VENDOR CONSOLIDATION
  - Consolidation strategies
  - Agency fee structures
  
- OPTIMIZATION STRATEGIES
  - Fee reduction tactics
  - Efficiency improvement

TARGET: 10,000-12,000 characters
```

#### 58. SPO_KB_Hidden_Fees_v1.0.txt
```
REQUIRED SECTIONS:
- COMMON HIDDEN FEE TYPES
  - Platform fees
  - Data fees
  - Verification costs
  - Ad serving fees
  
- FEE DISCLOSURE REQUIREMENTS
  - Regulatory requirements
  - Contractual clauses
  
- FEE AUDIT METHODOLOGY
  - Detection approach
  - Investigation steps
  - Documentation
  
- EXCHANGE TAKE RATE ANALYSIS
  - Rate calculation
  - Benchmarking
  - Negotiation strategies

TARGET: 10,000-12,000 characters
```

#### 59. SPO_KB_Verification_ROI_Analysis_v1.0.txt
```
REQUIRED SECTIONS:
- VERIFICATION COST STRUCTURE
  - CPM fees by vendor
  - Measurement vs blocking
  - Volume discounts
  
- ROI CALCULATION FRAMEWORK
  - Fraud avoidance value
  - Viewability improvement
  - Brand safety value
  
- VENDOR COMPARISON MATRIX
  - Detection accuracy
  - Coverage
  - Integration
  
- IMPLEMENTATION GUIDANCE
  - Single vs multi-vendor
  - DSP native vs third-party
  - Pre-bid vs post-bid

TARGET: 10,000-12,000 characters
```

---

### BATCH 11: Cross-Platform (4 files)

Location: Various (see each file)

#### 60. PRF_KB_Cross_Platform_Deduplication_v1.0.txt (release/v6.0/agents/prf/kb/)
```
REQUIRED SECTIONS:
- DEDUPLICATION CHALLENGE
  - Platform overlap rates
  - Device fragmentation
  - Walled garden opacity
  
- METHODOLOGIES
  - Identity-based
  - Statistical
  - Clean room
  - Algorithmic (EM, Bayesian)
  
- REACH CURVE CONSTRUCTION
  - Diminishing reach
  - Cross-platform aggregation
  - Frequency distribution
  
- OUTPUT METRICS
  - Deduplicated reach
  - Cross-platform frequency
  - Overlap matrices

TARGET: 10,000-12,000 characters
```

#### 61. PRF_KB_Advanced_Experiment_Designs_v1.0.txt (release/v6.0/agents/prf/kb/)
```
REQUIRED SECTIONS:
- REGRESSION DISCONTINUITY
  - Sharp vs fuzzy
  - Bandwidth selection
  - Placebo tests
  
- INTERRUPTED TIME SERIES
  - Pre-post comparison
  - Trend modeling
  - Autoregressive adjustments
  
- DIFFERENCE-IN-DIFFERENCES
  - Parallel trends
  - Staggered adoption
  - Synthetic DID
  
- INSTRUMENTAL VARIABLES
  - Instrument identification
  - Relevance and exclusion
  - 2SLS estimation

TARGET: 10,000-12,000 characters
```

#### 62. ANL_KB_Cross_Channel_Optimization_v1.0.txt (release/v6.0/agents/anl/kb/)
```
REQUIRED SECTIONS:
- OPTIMIZATION PROBLEM
  - Objective function
  - Constraints
  - Decision variables
  
- ALGORITHMS
  - Linear programming
  - Nonlinear programming
  - Convex optimization
  - Mixed-integer programming
  
- MULTI-OBJECTIVE
  - Pareto frontier
  - Weighted sum
  - Goal programming
  
- MARKETING APPLICATIONS
  - Budget allocation
  - Media mix
  - Audience selection

TARGET: 10,000-12,000 characters
```

#### 63. SPO_KB_Quality_Score_Framework_v1.0.txt (release/v6.0/agents/spo/kb/)
```
REQUIRED SECTIONS:
- QUALITY DIMENSIONS
  - Viewability (25%)
  - Fraud/IVT (25%)
  - Brand Safety (20%)
  - Attention (15%)
  - Ad Clutter (10%)
  - Page Load Speed (5%)
  
- COMPOSITE QUALITY SCORE
  - Calculation methodology
  - Normalization
  - Threshold definitions
  
- CHANNEL-SPECIFIC BENCHMARKS
  - Full benchmarks by channel
  - Seasonal variations
  
- QUALITY-BASED OPTIMIZATION
  - Bid adjustment
  - Minimum floors
  - Efficiency curves

TARGET: 10,000-12,000 characters
```

---

### BATCH 12: System Supporting (2 files)

Location: release/v6.0/system/

#### 64. SYS_KB_Missing_Model_Classes_v1.0.txt
```
REQUIRED SECTIONS:
- CREATIVE PERFORMANCE MODELING
  - Pre-flight scoring
  - Fatigue prediction
  - Refresh optimization
  - Audience-creative matching
  
- PRICING AND PROMOTION EFFECTS
  - Price elasticity
  - Promotion response
  - Cannibalization
  - Optimal timing
  
- SUPPLY-SIDE CONSTRAINTS
  - Inventory modeling
  - Delivery probability
  - Capacity planning
  
- CLV MODELING
  - Predictive CLV
  - CLV-based segmentation
  - Acquisition value
  
- CHURN AND RETENTION
  - Churn propensity
  - Intervention timing
  - Win-back optimization
  
- COMPETITIVE RESPONSE
  - Competitive monitoring
  - SOV modeling
  - Defensive strategy

TARGET: 12,000-15,000 characters
```

#### 65. SYS_KB_Implementation_Roadmap_v1.0.txt
```
REQUIRED SECTIONS:
- MATURITY MODEL
  - Level 1: Basic analytics
  - Level 2: Integrated measurement
  - Level 3: Unified optimization
  - Level 4: Autonomous decisioning
  
- IMPLEMENTATION PHASES
  - Phase 1: Foundation
  - Phase 2: Measurement
  - Phase 3: Optimization
  - Phase 4: Automation
  
- SUCCESS METRICS
  - Model accuracy
  - Decision quality
  - Business outcome impact
  - Operational efficiency
  
- RISK MITIGATION
  - Technical risks
  - Organizational risks
  - Data risks
  - Regulatory risks

TARGET: 10,000-12,000 characters
```

---

### BATCH 13: Data Requirements (6 files)

Location: Various (see each file)

#### 66. ANL_KB_MMM_Data_Requirements_v1.0.txt (release/v6.0/agents/anl/kb/)
```
REQUIRED SECTIONS:
- DATA SPECIFICATION
  - Outcome variables
  - Media variables
  - Control variables
  - Granularity requirements
  
- DATA QUALITY REQUIREMENTS
  - Completeness thresholds
  - Accuracy validation
  - Consistency checks
  - Historical depth
  
- DATA TRANSFORMATION
  - Log transformations
  - Adstock transformations
  - Normalization
  - Outlier handling
  
- DATA INFRASTRUCTURE
  - Data warehouse integration
  - Automated pipelines
  - Documentation
  - Governance

TARGET: 10,000-12,000 characters
```

#### 67. AUD_KB_Zero_Party_Data_v1.0.txt (release/v6.0/agents/aud/kb/)
```
REQUIRED SECTIONS:
- ZERO-PARTY DATA DEFINITION
  - Distinction from first-party
  - Data types
  - Collection mechanisms
  
- COLLECTION STRATEGIES
  - Surveys and quizzes
  - Preference centers
  - Progressive profiling
  - Value exchange
  
- ACTIVATION
  - Preference data usage
  - Personalization
  - Privacy-first approaches
  
- TRUST BUILDING
  - Transparency
  - Value delivery
  - Consent management

TARGET: 10,000-12,000 characters
```

#### 68. AUD_KB_Audience_Overlap_v1.0.txt (release/v6.0/agents/aud/kb/)
```
REQUIRED SECTIONS:
- OVERLAP ANALYSIS METHODOLOGIES
  - Platform-specific tools
  - Clean room analysis
  - Statistical estimation
  
- PLATFORM-SPECIFIC OVERLAP TOOLS
  - Meta audience overlap
  - Google audience overlap
  - TTD tools
  
- FREQUENCY MANAGEMENT
  - Cross-platform frequency
  - Unified reach estimation
  - Budget waste from overlap
  
- SUPPRESSION STRATEGIES
  - Sequential messaging
  - Suppression lists
  - Deduplication

TARGET: 10,000-12,000 characters
```

#### 69. SPO_KB_Bid_Landscape_v1.0.txt (release/v6.0/agents/spo/kb/)
```
REQUIRED SECTIONS:
- AUCTION DENSITY ANALYSIS
  - Bid volume analysis
  - Win rate optimization
  - Competitive analysis
  
- BID SHADING
  - Methodology
  - Effectiveness measurement
  - Savings calculation
  
- FLOOR PRICE DETECTION
  - Detection methods
  - Response strategies
  
- STRATEGIC BID ADJUSTMENTS
  - Daypart bidding
  - Seasonal patterns
  - Competitive response

TARGET: 10,000-12,000 characters
```

#### 70. SPO_KB_Header_Bidding_v1.0.txt (release/v6.0/agents/spo/kb/)
```
REQUIRED SECTIONS:
- HEADER BIDDING MECHANICS
  - How it works
  - Prebid.js
  - Timeout optimization
  
- SSP PRIORITIZATION
  - Strategies
  - Revenue optimization
  - Publisher leverage
  
- WRAPPER TECHNOLOGY
  - Server-side vs client-side
  - Comparison of wrappers
  
- REVENUE OPTIMIZATION
  - Best practices
  - Common pitfalls
  - Monitoring

TARGET: 10,000-12,000 characters
```

#### 71. SPO_KB_Cost_Benchmarks_v1.0.txt (release/v6.0/agents/spo/kb/)
```
REQUIRED SECTIONS:
- CPM BENCHMARKS BY VERTICAL (2025-2026)
  - Technology
  - Finance
  - Healthcare
  - Retail
  - CPG
  - Auto
  - Travel
  - B2B
  
- CPC BENCHMARKS BY INDUSTRY
  - Search
  - Social
  - Display
  
- SEASONAL COST INDICES
  - Q1, Q2, Q3, Q4 patterns
  - Holiday impacts
  
- GEOGRAPHIC VARIATIONS
  - US vs International
  - Regional differences
  
- QUALITY-ADJUSTED METRICS
  - Viewable CPM benchmarks
  - Attention-adjusted costs

TARGET: 12,000-15,000 characters
```

---

## SECTION 5: GIT WORKFLOW

### 5.1 Before Starting

```bash
# Clone/pull latest
cd /path/to/Kessel-Digital-Agent-Platform
git checkout feature/v6.0-kb-expansion
git pull origin feature/v6.0-kb-expansion

# Create directory structure
mkdir -p release/v6.0/agents/cso/kb
mkdir -p release/v6.0/agents/cso/instructions
mkdir -p release/v6.0/agents/nds/kb
mkdir -p release/v6.0/agents/nds/instructions
mkdir -p release/v6.0/agents/udm/kb
mkdir -p release/v6.0/agents/udm/instructions
mkdir -p release/v6.0/system
```

### 5.2 After Each File

```bash
# Validate file
./validate_kb_file.sh path/to/file.txt

# If validation passes, commit
git add path/to/file.txt
git commit -m "feat(agent): Add [filename] - [brief description]"
```

### 5.3 After Each Batch

```bash
# Push to remote
git push origin feature/v6.0-kb-expansion

# Tag the batch
git tag -a v6.0.0-kb-batch-[N] -m "Complete batch [N]: [description]"
git push origin v6.0.0-kb-batch-[N]
```

### 5.4 Final Merge

```bash
# After all batches complete
git checkout deploy/personal
git merge feature/v6.0-kb-expansion -m "Merge v6.0 KB expansion"
git push origin deploy/personal

git checkout deploy/mastercard
git merge feature/v6.0-kb-expansion -m "Merge v6.0 KB expansion"
git push origin deploy/mastercard
```

---

## SECTION 6: VALIDATION SCRIPT

Save this as `validate_kb_file.sh` in the repo root:

```bash
#!/bin/bash
# validate_kb_file.sh - KB File Validation Script

FILE=$1

if [ -z "$FILE" ]; then
    echo "Usage: ./validate_kb_file.sh <file_path>"
    exit 1
fi

echo "=========================================="
echo "Validating: $FILE"
echo "=========================================="

ERRORS=0

# Check file exists
if [ ! -f "$FILE" ]; then
    echo "FAIL: File does not exist"
    exit 1
fi

# Check character count
CHARS=$(wc -c < "$FILE")
echo "Character count: $CHARS"
if [ $CHARS -gt 36000 ]; then
    echo "FAIL: Character count exceeds 36,000 limit"
    ((ERRORS++))
fi

# Check for unicode characters
if LC_ALL=C grep -P '[^\x00-\x7F]' "$FILE" > /dev/null 2>&1; then
    echo "FAIL: Unicode characters detected"
    LC_ALL=C grep -n -P '[^\x00-\x7F]' "$FILE" | head -5
    ((ERRORS++))
fi

# Check for bullet points (asterisks at line start)
if grep -E '^\s*[\*•]' "$FILE" > /dev/null; then
    echo "FAIL: Bullet points detected (use hyphens)"
    grep -n -E '^\s*[\*•]' "$FILE" | head -5
    ((ERRORS++))
fi

# Check for markdown tables
if grep -E '^\|.*\|$' "$FILE" > /dev/null; then
    echo "FAIL: Markdown table formatting detected"
    ((ERRORS++))
fi

# Check for VERSION in header
if ! head -10 "$FILE" | grep -q "VERSION:"; then
    echo "FAIL: Missing VERSION in document header"
    ((ERRORS++))
fi

# Check for STATUS in header
if ! head -10 "$FILE" | grep -q "STATUS:"; then
    echo "FAIL: Missing STATUS in document header"
    ((ERRORS++))
fi

# Check for COMPLIANCE in header
if ! head -10 "$FILE" | grep -q "COMPLIANCE:"; then
    echo "FAIL: Missing COMPLIANCE in document header"
    ((ERRORS++))
fi

# Check for END OF DOCUMENT
if ! tail -10 "$FILE" | grep -q "END OF DOCUMENT"; then
    echo "FAIL: Missing END OF DOCUMENT marker"
    ((ERRORS++))
fi

# Check for smart quotes
if grep -E '[""]' "$FILE" > /dev/null; then
    echo "FAIL: Smart quotes detected (use straight quotes)"
    grep -n -E '[""]' "$FILE" | head -5
    ((ERRORS++))
fi

# Check for em-dashes
if grep -E '—' "$FILE" > /dev/null; then
    echo "FAIL: Em-dashes detected (use double hyphens)"
    ((ERRORS++))
fi

# Check for emoji
if grep -P '[\x{1F600}-\x{1F64F}]|[\x{1F300}-\x{1F5FF}]|[\x{1F680}-\x{1F6FF}]|[\x{2600}-\x{26FF}]' "$FILE" > /dev/null 2>&1; then
    echo "FAIL: Emoji detected"
    ((ERRORS++))
fi

echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo "PASS: All validation checks passed"
    echo "Character count: $CHARS"
    exit 0
else
    echo "FAIL: $ERRORS validation errors found"
    exit 1
fi
```

---

## SECTION 7: DAILY CHECKLIST

```
START OF DAY:
□ Pull latest from feature/v6.0-kb-expansion
□ Check for any Claude.ai updates
□ Review remaining files to create

DURING WORK:
□ Use document template exactly
□ Run validation after each file
□ Commit after each file passes validation
□ Push to remote every 5 commits

END OF DAY:
□ Push all commits
□ Tag completed batch
□ Update progress tracking
□ Document any issues
```

---

## SECTION 8: CONTACT POINTS

```
CLAUDE.AI IS HANDLING:
- Identity Foundation (3 files)
- NDS Agent Core (5 files)
- CSO Agent Core (5 files)
- System Architecture (5 files)
- Critical ML Files (7 files)

IF YOU ENCOUNTER:
- Architecture questions → Document and continue
- Compliance issues → Fix before commit
- Dependency on Claude files → Skip and return later
- Technical blockers → Document in issue tracker

COORDINATION:
- Both workstreams commit to same branch
- Check for merge conflicts after push
- Review each other's output when complete
```

---

*VS Code Instructions Version: 1.0*
*Created: January 18, 2026*
*Author: Claude.ai*
*Status: READY FOR EXECUTION*
