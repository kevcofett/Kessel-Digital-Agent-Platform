# MPA v6.0 DECISION SCIENCE BLUEPRINT
## Comprehensive Analytics & Decision Science Architecture
### Date: January 18, 2026

---

## EXECUTIVE SUMMARY

This blueprint defines a state-of-the-art decision science layer for the MPA multi-agent system, addressing 8 major capability areas plus supporting infrastructure. The system handles heterogeneous data (structured, unstructured, real-time, batch) and orchestrates models across planning, in-flight optimization, and continuous learning horizons.

**Total Proposed KB Files:** 78 new files (beyond current 72)
**New Agent/Service Proposals:** 3 new specialized agents
**Target State:** 150 KB documents with enterprise-grade decision science

---

## PART I: STRUCTURED BLUEPRINT

### A. Model Category Inventory

| Category | Current State | Target State | Gap |
|----------|--------------|--------------|-----|
| **1. Unstructured Data** | None | 8 KB files + UDM Agent | Critical gap |
| **2. Next Dollar Spend** | Basic allocation | 10 KB files + optimization engine | Major gap |
| **3. MMM/MMO** | 1 file (MMM_Advanced) | 6 KB files + calibration framework | Enhancement needed |
| **4. MTA/Attribution** | 1 file (Attribution_Models) | 5 KB files + unified framework | Enhancement needed |
| **5. Incrementality** | 1 file (Incrementality_Methods) | 6 KB files + always-on framework | Major gap |
| **6. CSO/Journey** | None | 8 KB files + CSO Agent | Critical gap |
| **7. View/Click Tracking** | Partial in multiple files | 4 KB files + unified tracking | Gap |
| **8. Identity/Resolution** | 1 file (Identity_Resolution) | 8 KB files (from prior plan) | Addressed |
| **Supporting Models** | Partial | 15+ KB files | Various gaps |

### B. Proposed New Agents/Services

#### 1. UDM Agent (Unstructured Data Mining)
```
PURPOSE: Continuously scan unstructured data sources for patterns, anomalies, and actionable signals

RESPONSIBILITIES:
- Text mining (call notes, support tickets, social, reviews)
- Creative asset analysis (image, video, copy)
- Web content and competitor monitoring
- Log and event stream analysis
- Anomaly and trend detection

INTERFACES:
- Feeds signals to AUD (audience insights)
- Feeds signals to CHA (channel performance)
- Feeds signals to PRF (anomaly alerts)
- Feeds signals to ANL (feature engineering)
```

#### 2. NDS Agent (Next Dollar Spend Optimizer)
```
PURPOSE: Real-time optimization of marginal spend allocation across channels, audiences, and tactics

RESPONSIBILITIES:
- Marginal return estimation
- Diminishing returns curve management
- Spend/no-spend decision logic
- Budget pacing optimization
- Risk-adjusted allocation

INTERFACES:
- Consumes MMM outputs (ANL)
- Consumes MTA signals (PRF)
- Consumes incrementality results (PRF)
- Consumes audience signals (AUD)
- Outputs to SPO for execution
```

#### 3. CSO Agent (Contact Stream Optimizer)
```
PURPOSE: Optimize multi-stage, multi-channel customer journeys and contact sequences

RESPONSIBILITIES:
- Next best action/touch determination
- Sequence and timing optimization
- Frequency and fatigue management
- Channel mix per audience per stage
- Suppression and cooling-off enforcement

INTERFACES:
- Consumes identity graph (AUD)
- Consumes propensity scores (AUD)
- Consumes channel constraints (CHA)
- Outputs journey orchestration commands
```

### C. System Architecture: Data & Signal Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA INGESTION LAYER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  Structured Data    │  Unstructured Data   │  Real-time Events  │  External │
│  - Transactions     │  - Text/Logs         │  - Impressions     │  - MMM    │
│  - CRM              │  - Creative          │  - Clicks          │  - Panels │
│  - Media Spend      │  - Social            │  - Conversions     │  - Census │
└─────────┬───────────┴──────────┬───────────┴─────────┬──────────┴─────┬─────┘
          │                      │                     │                │
          ▼                      ▼                     ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATA PROCESSING LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Identity Resolution  │  Feature Engineering  │  Data Quality  │  Validation │
│  (AUD + Shared)       │  (UDM + ANL)          │  (Shared)      │  (Shared)   │
└─────────┬─────────────┴──────────┬────────────┴────────┬───────┴──────┬─────┘
          │                        │                     │              │
          ▼                        ▼                     ▼              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MODEL LAYER (by horizon)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  STRATEGIC (Quarterly+)    │  TACTICAL (Weekly-Monthly) │  OPERATIONAL (Real-time) │
│  - MMM/MMO                 │  - MTA                      │  - Next Dollar Spend     │
│  - Long-term CLV           │  - Incrementality           │  - Bid Optimization      │
│  - Brand Equity            │  - Propensity Models        │  - CSO/Next Best Action  │
│  - Portfolio Optimization  │  - Churn/Retention          │  - Anomaly Detection     │
└─────────┬──────────────────┴──────────┬─────────────────┴──────────┬─────────┘
          │                             │                            │
          ▼                             ▼                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DECISION & ORCHESTRATION LAYER                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  ORC (Orchestrator)  │  NDS (Next Dollar)  │  CSO (Contact Stream)  │  DOC  │
│  - Query routing     │  - Allocation        │  - Journey execution   │  - Output │
│  - Context mgmt      │  - Pacing            │  - Suppression         │         │
│  - Conflict resolution│ - Risk mgmt         │  - Personalization     │         │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FEEDBACK & LEARNING LAYER                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  Experiment Results → Model Calibration → Prior Updates → Optimization Tuning │
│  Always-on holdouts │ A/B test integration │ Lift feedback │ Drift detection  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## PART II: DETAILED MODEL SPECIFICATIONS

---

## 1. UNSTRUCTURED DATA MODELING

### Purpose
Extract actionable signals from text, logs, creative assets, social content, and web data to enhance targeting, creative optimization, and anomaly detection.

### Proposed KB Files (8 files)

#### UDM_KB_Text_Mining_Methods_v1.txt
```
CONTENT DEPTH:

TEXT PREPROCESSING PIPELINE
- Tokenization strategies
- Lemmatization vs stemming
- Stop word handling (domain-specific)
- Named entity recognition (NER)
- Part-of-speech tagging

EMBEDDING MODELS
- Word2Vec, GloVe (legacy)
- FastText (subword handling)
- BERT and variants (contextual)
- Sentence transformers
- Domain-specific fine-tuning

TOPIC MODELING
- Latent Dirichlet Allocation (LDA)
- Non-negative Matrix Factorization (NMF)
- BERTopic (neural topic modeling)
- Dynamic topic models (temporal)
- Hierarchical topic structures

SENTIMENT AND EMOTION ANALYSIS
- Lexicon-based approaches
- ML classifiers (SVM, XGBoost)
- Transformer-based sentiment
- Aspect-based sentiment analysis
- Emotion detection (Plutchik's wheel)

MARKETING APPLICATIONS
- Review mining for product insights
- Call center transcript analysis
- Social listening signal extraction
- Competitor content monitoring
- Creative copy optimization signals
```

#### UDM_KB_Creative_Analysis_v1.txt
```
CONTENT DEPTH:

IMAGE ANALYSIS
- CNN feature extraction (ResNet, VGG)
- Object detection (YOLO, Faster R-CNN)
- Color palette extraction
- Composition analysis
- Brand element detection
- Text-in-image OCR

VIDEO ANALYSIS
- Frame sampling strategies
- Scene detection and segmentation
- Audio-visual feature extraction
- Engagement signal correlation
- Thumbnail optimization

CREATIVE ATTRIBUTE EXTRACTION
- Visual complexity scoring
- Emotional valence classification
- Brand prominence measurement
- Call-to-action detection
- Human presence/face detection

CREATIVE PERFORMANCE PREDICTION
- Multi-modal models (image + text)
- Historical performance correlation
- A/B test acceleration via prediction
- Creative fatigue prediction
- Audience-creative affinity scoring

IMPLEMENTATION
- Pre-trained model selection
- Transfer learning approaches
- Batch vs real-time processing
- Storage and retrieval (vector DBs)
```

#### UDM_KB_Social_Web_Mining_v1.txt
```
CONTENT DEPTH:

SOCIAL LISTENING
- Platform API integration
- Mention and hashtag tracking
- Influencer identification
- Viral content detection
- Crisis signal detection

WEB CONTENT MINING
- Crawler architecture
- Content extraction (readability)
- Competitor monitoring
- Price/promotion tracking
- SEO signal extraction

GRAPH-BASED ANALYSIS
- Social network analysis
- Community detection
- Influence propagation
- Information cascade modeling
- Bot/fake account detection

REAL-TIME STREAM PROCESSING
- Event stream architecture
- Windowed aggregations
- Anomaly detection in streams
- Trend emergence detection
- Alert generation
```

#### UDM_KB_Log_Event_Analysis_v1.txt
```
CONTENT DEPTH:

LOG PARSING
- Structured vs unstructured logs
- Pattern extraction
- Session reconstruction
- Error classification

EVENT SEQUENCE ANALYSIS
- Clickstream analysis
- Funnel reconstruction
- Path analysis
- Sequence pattern mining
- Process mining

ANOMALY DETECTION IN LOGS
- Statistical methods (Z-score, IQR)
- Isolation forest
- LSTM autoencoders for sequences
- Log2Vec embeddings

USER BEHAVIOR MODELING
- Session-based features
- Engagement pattern extraction
- Intent signal derivation
- Conversion likelihood features
```

#### UDM_KB_Feature_Engineering_Unstructured_v1.txt
```
CONTENT DEPTH:

FEATURE EXTRACTION PATTERNS
- Embedding aggregation (mean, max pooling)
- TF-IDF and BM25 features
- Graph-based features
- Temporal aggregation features

FEATURE STORE INTEGRATION
- Feature computation pipelines
- Online vs offline features
- Feature versioning
- Freshness requirements

DOWNSTREAM MODEL INTEGRATION
- Features for propensity models
- Features for MMM (unstructured drivers)
- Features for attribution
- Features for creative optimization

QUALITY AND MONITORING
- Feature drift detection
- Coverage analysis
- Importance tracking
- Staleness alerts
```

#### UDM_KB_Anomaly_Pattern_Detection_v1.txt
```
CONTENT DEPTH:

ANOMALY DETECTION METHODS
- Statistical (control charts, CUSUM)
- Distance-based (LOF, k-NN)
- Density-based (DBSCAN outliers)
- Model-based (isolation forest, autoencoders)
- Ensemble anomaly detection

PATTERN MINING
- Frequent pattern mining (Apriori, FP-Growth)
- Sequential pattern mining (GSP, PrefixSpan)
- Association rule mining
- Contrast pattern mining

TREND DETECTION
- Change point detection
- Trend decomposition
- Regime change detection
- Emerging topic detection

ALERT PRIORITIZATION
- Severity scoring
- Business impact estimation
- Root cause suggestion
- Alert fatigue management
```

#### UDM_KB_NLP_Marketing_Applications_v1.txt
```
CONTENT DEPTH:

CUSTOMER FEEDBACK ANALYSIS
- Review summarization
- Pain point extraction
- Feature request mining
- Competitive mention analysis

CONVERSATIONAL ANALYTICS
- Intent classification
- Entity extraction for marketing
- Dialogue act recognition
- Customer satisfaction inference

CONTENT GENERATION SIGNALS
- Headline effectiveness prediction
- Copy optimization features
- Keyword extraction
- Content gap identification

SEARCH AND DISCOVERY
- Query understanding
- Semantic search
- Content recommendation
- Personalization signals
```

#### UDM_KB_Multimodal_Integration_v1.txt
```
CONTENT DEPTH:

MULTIMODAL FUSION
- Early fusion (feature concatenation)
- Late fusion (decision aggregation)
- Cross-modal attention
- CLIP-style contrastive learning

CREATIVE PERFORMANCE MODELING
- Image + text + audio features
- Cross-modal consistency scoring
- Multimodal creative embeddings

UNIFIED REPRESENTATION
- Joint embedding spaces
- Cross-modal retrieval
- Multimodal clustering

PRODUCTION CONSIDERATIONS
- Computational requirements
- Latency management
- Model serving architecture
```

### Data Requirements
- Text data: Call transcripts, reviews, social posts, support tickets
- Creative assets: Images, videos, ad copy
- Logs: Clickstream, server logs, event streams
- External: Social APIs, web crawl data

### Interface with Other Agents
- **→ AUD**: Unstructured features for propensity models
- **→ ANL**: Drivers for MMM, features for forecasting
- **→ PRF**: Anomaly alerts, creative performance signals
- **→ CHA**: Channel-specific text/creative insights
- **→ CSO**: Intent signals for journey optimization

---

## 2. NEXT DOLLAR SPEND DECISION SCIENCE

### Purpose
Determine optimal marginal spend allocation across audiences, channels, and tactics with explicit risk quantification and "do not spend" logic.

### Proposed KB Files (10 files)

#### NDS_KB_Marginal_Return_Estimation_v1.txt
```
CONTENT DEPTH:

MARGINAL ROAS CALCULATION
- Instantaneous marginal return
- Average vs marginal distinction
- Derivative estimation methods
- Confidence intervals on marginals

DIMINISHING RETURNS MODELING

HILL FUNCTION (ADBUDG)
Response = Saturation × (Spend^α / (Half_Sat^α + Spend^α))
- Parameter estimation
- Confidence bounds
- Channel-specific calibration

S-CURVE MODELS
- Logistic response curves
- Gompertz curves
- Threshold effects
- Saturation point identification

NONPARAMETRIC APPROACHES
- Gaussian process regression
- Spline regression
- Local polynomial regression
- Monotonic constraints

DYNAMIC MARGINAL RETURNS
- Time-varying elasticities
- Competitive effects on margins
- Seasonal marginal variation
- Fatigue/wear-out effects

UNCERTAINTY QUANTIFICATION
- Bootstrap confidence intervals
- Bayesian credible intervals
- Ensemble disagreement
- Scenario ranges
```

#### NDS_KB_Budget_Response_Functions_v1.txt
```
CONTENT DEPTH:

RESPONSE FUNCTION ESTIMATION
- Channel-level response curves
- Campaign-level granularity
- Audience-specific responses
- Creative-specific responses

CROSS-CHANNEL INTERACTIONS
- Synergy modeling
- Cannibalization effects
- Sequence effects
- Halo effects

TEMPORAL DYNAMICS
- Carryover effects (adstock)
- Lag structures
- Cumulative response
- Pulsing vs continuous

AGGREGATION AND DECOMPOSITION
- Roll-up methodologies
- Consistent aggregation
- Hierarchical models
```

#### NDS_KB_Spend_NoSpend_Logic_v1.txt
```
CONTENT DEPTH:

DECISION FRAMEWORK

SPEND CONDITIONS
- Marginal ROAS > threshold
- Incremental lift > minimum
- Quality score > floor
- Audience saturation < limit

NO-SPEND CONDITIONS
- Saturation detected (marginal ROAS < 1)
- Low incrementality signal
- Quality degradation (fraud, viewability)
- Negative lift detected in experiments
- Budget better deployed elsewhere

OPPORTUNITY COST FRAMEWORK
- Cross-channel opportunity cost
- Time-shifting opportunity cost
- Audience reallocation value

RISK ADJUSTMENT
- Confidence-weighted decisions
- Exploration vs exploitation
- Regret minimization
- Risk-adjusted marginal returns

IMPLEMENTATION
- Decision rules engine
- Threshold calibration
- Override logic
- Audit trail
```

#### NDS_KB_Multi_Input_Integration_v1.txt
```
CONTENT DEPTH:

INPUT SOURCES

MMM OUTPUTS
- Long-term elasticities
- Channel contribution shares
- Saturation parameters
- Optimal budget ranges

MTA OUTPUTS
- Path-based attribution
- Touchpoint valuations
- Conversion probabilities
- Journey insights

INCREMENTALITY OUTPUTS
- Lift estimates by channel
- Calibration factors
- Confidence levels
- Test coverage gaps

UNSTRUCTURED SIGNALS
- Sentiment trends
- Creative fatigue indicators
- Competitive intensity
- Seasonal demand signals

INTEGRATION METHODOLOGY
- Weighted combination
- Bayesian updating
- Conflict resolution rules
- Confidence aggregation

SOURCE PRIORITIZATION
- Incrementality > MMM for calibration
- MTA for granular allocation
- MMM for strategic planning
- Unstructured for anomaly detection
```

#### NDS_KB_Real_Time_Optimization_v1.txt
```
CONTENT DEPTH:

REAL-TIME ARCHITECTURE
- Streaming data ingestion
- Feature computation latency
- Model inference latency
- Decision latency requirements

ONLINE LEARNING
- Incremental model updates
- Thompson sampling
- Contextual bandits
- Regret bounds

PACING AND THROTTLING
- Budget pacing algorithms
- Bid landscape adaptation
- Real-time constraint enforcement

FEEDBACK LOOPS
- Attribution lag handling
- Conversion delay modeling
- Proxy metric optimization
```

#### NDS_KB_Simulation_WhatIf_v1.txt
```
CONTENT DEPTH:

SCENARIO SIMULATION
- Budget reallocation scenarios
- Channel mix scenarios
- Timing shift scenarios
- Audience focus scenarios

MONTE CARLO SIMULATION
- Input distribution specification
- Correlation structure
- Output distribution analysis
- Risk metrics (VaR, CVaR)

COUNTERFACTUAL ANALYSIS
- What would have happened if...
- Causal inference for scenarios
- Synthetic control for planning

OPTIMIZATION UNDER UNCERTAINTY
- Robust optimization
- Stochastic programming
- Chance constraints
- Scenario trees
```

#### NDS_KB_Audience_Level_Allocation_v1.txt
```
CONTENT DEPTH:

AUDIENCE VALUATION
- CLV-based valuation
- Propensity-weighted value
- Incremental value by segment
- Margin-adjusted value

AUDIENCE-SPECIFIC RESPONSE
- Response heterogeneity modeling
- Segment-level elasticities
- Audience saturation curves

ALLOCATION OPTIMIZATION
- Multi-audience optimization
- Fairness constraints
- Coverage constraints
- Portfolio approach to audiences
```

#### NDS_KB_Channel_Tactic_Allocation_v1.txt
```
CONTENT DEPTH:

CHANNEL SELECTION
- Channel fit by objective
- Channel fit by audience
- Channel cost efficiency
- Channel incrementality

TACTIC SELECTION
- Tactic-level response curves
- Placement optimization
- Format optimization
- Bid strategy selection

CONSTRAINT HANDLING
- Minimum spend requirements
- Maximum spend caps
- Frequency limits
- Quality floors
```

#### NDS_KB_Risk_Adjusted_Allocation_v1.txt
```
CONTENT DEPTH:

RISK METRICS
- Volatility of returns
- Downside risk measures
- Tail risk (VaR, CVaR)
- Model uncertainty risk

RISK-ADJUSTED RETURNS
- Sharpe ratio analog for marketing
- Sortino ratio for downside
- Information ratio for active decisions

PORTFOLIO OPTIMIZATION
- Mean-variance optimization
- Black-Litterman for marketing
- Risk parity allocation
- Maximum diversification

HEDGING STRATEGIES
- Diversification across channels
- Temporal diversification
- Audience diversification
```

#### NDS_KB_Always_On_Optimization_v1.txt
```
CONTENT DEPTH:

CONTINUOUS OPTIMIZATION
- Optimization frequency
- Rebalancing triggers
- Drift detection
- Constraint monitoring

LEARNING RATE MANAGEMENT
- Adaptation vs stability trade-off
- Regime change detection
- Confidence-weighted updates

PERFORMANCE MONITORING
- Optimization lift measurement
- Attribution of optimizer value
- Counterfactual benchmarking

GOVERNANCE
- Human-in-the-loop controls
- Override mechanisms
- Alert thresholds
- Audit requirements
```

### Data Requirements
- MMM model outputs (elasticities, saturation curves)
- MTA attribution data
- Incrementality test results
- Real-time spend and performance data
- Audience and channel metadata

### Interface with Other Agents
- **← ANL**: MMM outputs, forecasts
- **← PRF**: MTA, incrementality, anomaly signals
- **← AUD**: Audience propensities, CLV
- **← UDM**: Unstructured signals
- **→ SPO**: Allocation recommendations
- **→ CHA**: Channel-specific guidance

---

## 3. MMM/MMO (Marketing/Media Mix Modeling & Optimization)

### Purpose
Strategic measurement of marketing effectiveness and budget optimization at aggregate level.

### Proposed KB Files (6 files - enhancing existing MMM_Advanced)

#### ANL_KB_Bayesian_MMM_v1.txt
```
CONTENT DEPTH:

BAYESIAN MMM FUNDAMENTALS
- Prior specification for elasticities
- Likelihood specification
- Posterior inference
- Credible intervals vs confidence

MODEL SPECIFICATION

ADSTOCK PRIORS
- Prior distributions for decay rates
- Channel-specific prior calibration
- Informative vs weakly informative
- Prior predictive checks

SATURATION PRIORS
- Hill function parameter priors
- Half-saturation point priors
- Shape parameter constraints

HIERARCHICAL PRIORS
- Partial pooling across markets
- Partial pooling across time
- Hierarchical structure benefits

INFERENCE METHODS
- MCMC (Stan, PyMC)
- Variational inference
- Approximate Bayesian computation
- Convergence diagnostics

MODEL COMPARISON
- WAIC, LOO-CV
- Posterior predictive checks
- Cross-validation strategies

TOOLS AND PLATFORMS
- Google LightweightMMM
- Meta Robyn
- PyMC-Marketing
- Custom implementations
```

#### ANL_KB_Campaign_Level_MMM_v1.txt
```
CONTENT DEPTH:

GRANULARITY CHALLENGES
- Data sparsity at campaign level
- Multicollinearity
- Short campaign durations
- Confounding factors

METHODOLOGICAL APPROACHES
- Hierarchical models (campaigns within channels)
- Bayesian shrinkage
- Regularization techniques
- Factor models for campaigns

CREATIVE AND MESSAGING EFFECTS
- Creative quality variables
- Message testing integration
- Wear-out modeling
- Refresh timing

TARGETING EFFECTS
- Audience quality variables
- Targeting precision metrics
- Reach vs frequency decomposition

TACTICAL INTEGRATION
- Bid strategy effects
- Placement effects
- Daypart effects
- Device effects
```

#### ANL_KB_GeoLift_Augmented_MMM_v1.txt
```
CONTENT DEPTH:

GEO-LIFT INTEGRATION
- Experimental calibration of MMM
- Prior updating from experiments
- Lift-adjusted elasticities
- Confidence improvement

SYNTHETIC CONTROL CALIBRATION
- Using geo-tests to validate MMM
- Discrepancy analysis
- Model correction factors
- Ongoing calibration cadence

EXPERIMENTAL DESIGN FOR CALIBRATION
- Optimal geo selection
- Power analysis for calibration
- Rotation schedules
- Coverage of media mix

UNIFIED FRAMEWORK
- MMM + Incrementality fusion
- Weighted averaging
- Bayesian model averaging
- Ensemble approaches
```

#### ANL_KB_MMM_External_Factors_v1.txt
```
CONTENT DEPTH:

SEASONALITY MODELING
- Harmonic regression (Fourier terms)
- Seasonal dummies
- Holiday effects
- Event effects (sports, awards, etc.)

PROMOTIONAL EFFECTS
- Price elasticity modeling
- Promotion timing effects
- Cannibalization of base sales
- Promotion carryover

MACROECONOMIC FACTORS
- GDP, unemployment effects
- Consumer confidence
- Category-level trends
- Competitive spend effects

DISTRIBUTION EFFECTS
- Store count / availability
- Out-of-stock impact
- New product launches
- Portfolio changes

WEATHER AND EXTERNAL EVENTS
- Weather as driver
- Major events (elections, disasters)
- Social/cultural moments
```

#### ANL_KB_MMM_Output_Utilization_v1.txt
```
CONTENT DEPTH:

BUDGET PLANNING INTEGRATION
- Annual planning inputs
- Quarterly budget allocation
- Scenario modeling for budgets

OPTIMIZATION INTEGRATION
- Feeding response curves to NDS
- Saturation warnings
- Reallocation recommendations

REPORTING AND COMMUNICATION
- Executive summary formats
- Channel contribution charts
- ROI decomposition
- Confidence communication

CONTINUOUS CALIBRATION
- Refresh cadence
- Rolling window MMM
- Drift monitoring
- Re-estimation triggers
```

#### ANL_KB_MMM_Data_Requirements_v1.txt
```
CONTENT DEPTH:

DATA SPECIFICATION
- Outcome variables (sales, conversions, revenue)
- Media variables (spend, GRPs, impressions)
- Control variables (price, distribution, seasonality)
- Granularity requirements (weekly, daily, geo)

DATA QUALITY REQUIREMENTS
- Completeness thresholds
- Accuracy validation
- Consistency checks
- Historical depth requirements

DATA TRANSFORMATION
- Log transformations
- Adstock transformations
- Normalization approaches
- Outlier handling

DATA INFRASTRUCTURE
- Data warehouse integration
- Automated data pipelines
- Data documentation
- Data governance
```

### Data Requirements
- 2-3 years of historical data
- Weekly or daily granularity
- Geographic variation preferred
- Media spend by channel
- Sales/conversion outcomes
- Control variables (price, distribution, seasonality)

### Methodological Options
| Method | Pros | Cons |
|--------|------|------|
| Bayesian MMM | Uncertainty quantification, prior integration | Computational cost |
| Ridge/Lasso MMM | Fast, handles multicollinearity | Point estimates only |
| Neural MMM | Flexible, nonlinear | Black box, overfitting risk |
| Hierarchical MMM | Borrows strength across units | Complexity |

### Interface with Other Agents
- **→ NDS**: Response curves, elasticities, saturation parameters
- **→ SPO**: Budget allocation recommendations
- **← PRF**: Incrementality results for calibration
- **← ANL**: Internal forecasting, scenario modeling

---

## 4. MTA & DATA-DRIVEN ATTRIBUTION

### Purpose
Granular, user-level attribution of conversions to touchpoints for tactical optimization.

### Proposed KB Files (5 files - enhancing existing Attribution_Models)

#### PRF_KB_Shapley_Attribution_v1.txt
```
CONTENT DEPTH:

SHAPLEY VALUE FUNDAMENTALS
- Cooperative game theory foundation
- Marginal contribution concept
- Fairness axioms (efficiency, symmetry, null player, additivity)

CALCULATION METHODS
- Exact computation (factorial complexity)
- Sampling-based approximation
- Permutation sampling
- Kernel SHAP for efficiency

MARKETING APPLICATION
- Channel as player
- Conversion as coalition value
- Path-based Shapley
- Time-decay weighted Shapley

IMPLEMENTATION CONSIDERATIONS
- Computational scaling
- Path length handling
- Conversion value vs count
- Multi-device attribution

VALIDATION
- Consistency with incrementality
- Sensitivity analysis
- Comparison with rule-based
```

#### PRF_KB_Sequence_Attribution_Models_v1.txt
```
CONTENT DEPTH:

MARKOV CHAIN ATTRIBUTION
- State transition matrices
- Removal effect calculation
- Higher-order Markov models
- Absorbing Markov chains

LSTM SEQUENCE MODELS
- Sequence representation
- Architecture design
- Attention mechanisms
- Conversion probability modeling

TRANSFORMER-BASED ATTRIBUTION
- Self-attention for paths
- Positional encoding for time
- BERT-style pre-training
- Fine-tuning for attribution

SEQUENCE FEATURE ENGINEERING
- Path length features
- Channel transition features
- Time gap features
- Recency features
```

#### PRF_KB_Path_Based_Attribution_v1.txt
```
CONTENT DEPTH:

PATH ANALYSIS
- Path frequency analysis
- Conversion path clustering
- Path length distribution
- Channel order patterns

FUNNEL ATTRIBUTION
- Stage-based attribution
- Funnel transition modeling
- Assist vs closer credit
- Multi-funnel handling

POSITION-BASED MODELS
- U-shaped (40-20-40)
- W-shaped (awareness-consideration-conversion)
- Custom position weighting
- Time-decayed position models
```

#### PRF_KB_Attribution_Validation_v1.txt
```
CONTENT DEPTH:

INCREMENTALITY CALIBRATION
- Holdout-based validation
- Lift correlation with attribution
- Calibration factors by channel
- Ongoing calibration cadence

CROSS-VALIDATION
- Temporal holdouts
- User-level holdouts
- Out-of-sample performance

SANITY CHECKS
- Sum to 100% (efficiency)
- Directional consistency
- Benchmark comparison
- Edge case handling
```

#### PRF_KB_Attribution_MTA_MMM_Reconciliation_v1.txt
```
CONTENT DEPTH:

GOVERNANCE FRAMEWORK

WHEN TO TRUST WHICH SOURCE
- MMM: Long-term strategic decisions, offline media
- MTA: Short-term tactical, digital optimization
- Incrementality: Ground truth for calibration, major decisions

RECONCILIATION METHODS
- Unified measurement frameworks
- Calibration cascades
- Weighted averaging by confidence
- Bayesian model averaging

CONFLICT RESOLUTION
- Source of discrepancy analysis
- Coverage gap identification
- Measurement artifact detection
- Decision rules for conflicts

PRACTICAL IMPLEMENTATION
- Reporting dashboards
- Decision support tools
- Stakeholder communication
- Documentation requirements
```

### Data Requirements
- User-level touchpoint data
- Conversion events with timestamps
- Cross-device identity linkage
- Impression and click logs
- Conversion values

### Interface with Other Agents
- **→ NDS**: Touchpoint valuations for optimization
- **→ ANL**: Calibration signals for MMM
- **← AUD**: Identity resolution for path construction
- **← PRF**: Incrementality for validation

---

## 5. INCREMENTALITY, EXPERIMENTS & HOLDOUTS

### Purpose
Causal measurement of marketing effectiveness through experimentation.

### Proposed KB Files (6 files - enhancing existing Incrementality_Methods)

#### PRF_KB_Geo_Test_Design_v1.txt
```
CONTENT DEPTH:

GEO TEST FUNDAMENTALS
- Treatment vs control geo selection
- Matched market methodology
- Synthetic control methodology
- Power analysis for geos

SYNTHETIC CONTROL DETAILED
- Donor pool construction
- Pre-period matching optimization
- RMSPE minimization
- Placebo tests for inference
- p-value calculation

MATCHED MARKET DETAILED
- Covariate matching criteria
- Propensity score matching for geos
- Caliper selection
- Balance diagnostics

PRACTICAL CONSIDERATIONS
- Minimum geo size
- Test duration requirements
- Contamination prevention
- Spillover effects
- National campaign handling
```

#### PRF_KB_Audience_Split_Tests_v1.txt
```
CONTENT DEPTH:

RANDOMIZATION
- User-level randomization
- Cookie/device randomization
- Stratified randomization
- Cluster randomization

GHOST ADS / PSA TESTS
- Ghost bid methodology
- PSA (Public Service Announcement) control
- Intent-to-treat analysis
- Compliance handling

PLATFORM LIFT STUDIES
- Meta Conversion Lift
- Google Brand Lift
- TTD IncrementalityPlus
- Methodology comparison

SAMPLE SIZE AND DURATION
- Power analysis
- Effect size assumptions
- Variance estimation
- Minimum detectable effect
```

#### PRF_KB_Always_On_Experiments_v1.txt
```
CONTENT DEPTH:

CONTINUOUS EXPERIMENTATION
- Rolling holdout design
- Rotation schedules
- Coverage optimization
- Resource constraints

MMM/MTA VALIDATION
- Experimental validation of model outputs
- Calibration frequency
- Discrepancy investigation
- Model update triggers

MULTI-ARM DESIGNS
- Channel comparison experiments
- Multi-treatment designs
- Factorial experiments
- Adaptive designs

OPERATIONAL INFRASTRUCTURE
- Experiment tracking systems
- Randomization services
- Measurement pipelines
- Result aggregation
```

#### PRF_KB_Holdout_Design_v1.txt
```
CONTENT DEPTH:

HOLDOUT SIZING
- Statistical power requirements
- Business cost of holdout
- Optimal holdout percentage
- Dynamic holdout sizing

STRATIFICATION
- Audience segment stratification
- Geographic stratification
- Temporal stratification
- Value-based stratification

REPRESENTATIVENESS
- Covariate balance checking
- Distribution matching
- Bias detection
- Correction methods

DURATION OPTIMIZATION
- Minimum test duration
- Seasonality considerations
- Conversion lag handling
- Early stopping rules
```

#### PRF_KB_Lift_Operationalization_v1.txt
```
CONTENT DEPTH:

INTERPRETING LIFT RESULTS
- Point estimates vs confidence intervals
- Practical vs statistical significance
- Effect heterogeneity
- Temporal dynamics

OPERATIONALIZING RESULTS

MMM PRIOR UPDATING
- Bayesian prior updates
- Elasticity calibration
- Saturation adjustment
- Confidence improvement

PROPENSITY MODEL ADJUSTMENT
- Lift-calibrated propensities
- Incremental response rates
- Value adjustment factors

NDS INTEGRATION
- Marginal return updates
- Channel prioritization
- Audience reallocation
- Budget shifts

DOCUMENTATION AND GOVERNANCE
- Result repository
- Decision audit trail
- Learning accumulation
- Knowledge management
```

#### PRF_KB_Advanced_Experiment_Designs_v1.txt
```
CONTENT DEPTH:

REGRESSION DISCONTINUITY
- Sharp vs fuzzy designs
- Bandwidth selection
- Placebo tests
- McCrary density test

INTERRUPTED TIME SERIES
- Pre-post comparison
- Trend modeling
- Autoregressive adjustments
- Multiple time series

DIFFERENCE-IN-DIFFERENCES
- Parallel trends assumption
- Pre-period validation
- Staggered adoption
- Synthetic DID

INSTRUMENTAL VARIABLES
- Instrument identification
- Relevance and exclusion
- Weak instruments
- 2SLS estimation
```

### Data Requirements
- Treatment assignment data
- Outcome measurements
- Pre-period baseline data
- Covariate data for matching/stratification
- Geographic boundaries

### Interface with Other Agents
- **→ ANL**: Calibration signals for MMM
- **→ PRF**: Attribution validation
- **→ NDS**: Lift results for optimization
- **← ORC**: Experiment coordination

---

## 6. CONTACT STREAM OPTIMIZATION (CSO)

### Purpose
Optimize multi-stage, multi-channel customer journeys and contact sequences.

### Proposed KB Files (8 files - NEW CAPABILITY)

#### CSO_KB_Journey_State_Models_v1.txt
```
CONTENT DEPTH:

STATE REPRESENTATION
- Customer state definition
- Feature engineering for state
- State space dimensionality
- State aggregation methods

MARKOV MODELS
- Discrete Markov chains
- Hidden Markov Models (HMM)
- Continuous-time Markov
- Semi-Markov models

SEQUENCE MODELS
- LSTM for journey modeling
- Transformer architectures
- Temporal convolutional networks
- Attention mechanisms

STATE TRANSITIONS
- Transition probability estimation
- Action-dependent transitions
- Time-dependent transitions
- Heterogeneous transitions
```

#### CSO_KB_Next_Best_Action_v1.txt
```
CONTENT DEPTH:

NBA FRAMEWORK
- Action space definition
- State-action value estimation
- Constraint satisfaction
- Action ranking

METHODOLOGICAL APPROACHES

POLICY-BASED
- Classification for NBA
- Propensity-weighted ranking
- Multi-armed bandits

VALUE-BASED
- Q-learning
- Deep Q-networks
- Value function approximation

ACTOR-CRITIC
- Policy gradient methods
- Advantage estimation
- A3C/PPO for marketing

CONTEXTUAL BANDITS
- Thompson sampling
- UCB algorithms
- LinUCB for personalization
- Neural contextual bandits

CONSTRAINTS AND BUSINESS RULES
- Eligibility constraints
- Capacity constraints
- Legal/compliance rules
- Customer preferences
```

#### CSO_KB_Sequence_Timing_Optimization_v1.txt
```
CONTENT DEPTH:

SEQUENCE OPTIMIZATION
- Optimal message ordering
- Channel sequencing
- Content sequencing
- Campaign stage progression

TIMING OPTIMIZATION
- Send time optimization
- Inter-message timing
- Time-of-day effects
- Day-of-week effects
- Seasonal timing

TEMPORAL MODELING
- Survival models for timing
- Hazard rate estimation
- Optimal stopping
- Time-to-event prediction

REAL-TIME VS BATCH
- Real-time decision triggers
- Batch optimization windows
- Hybrid approaches
```

#### CSO_KB_Frequency_Fatigue_Management_v1.txt
```
CONTENT DEPTH:

FREQUENCY OPTIMIZATION
- Optimal frequency curves
- Diminishing returns from frequency
- Negative frequency effects
- Channel-specific optimal frequency

FATIGUE MODELING
- Fatigue indicators
- Creative fatigue
- Channel fatigue
- Message fatigue
- Fatigue recovery rates

SUPPRESSION RULES
- Post-purchase suppression
- Conversion suppression
- Complaint-based suppression
- Preference-based suppression

COOLING-OFF PERIODS
- Optimal cooling-off duration
- Channel-specific cooling
- Event-based cooling
- Dynamic cooling adjustment
```

#### CSO_KB_Channel_Creative_Mix_v1.txt
```
CONTENT DEPTH:

CHANNEL MIX OPTIMIZATION
- Channel preference by audience
- Channel effectiveness by stage
- Channel cost efficiency
- Cross-channel synergies

CREATIVE MIX
- Creative rotation strategies
- Personalized creative selection
- Creative testing integration
- Creative fatigue management

AUDIENCE-STAGE MATRIX
- Channel mix by audience × stage
- Creative selection by audience × stage
- Budget allocation by cell
- Performance tracking by cell
```

#### CSO_KB_Constraint_Handling_v1.txt
```
CONTENT DEPTH:

CHANNEL CONSTRAINTS
- Daily/weekly caps
- Inventory availability
- Delivery guarantees
- Exclusivity agreements

LEGAL/PRIVACY CONSTRAINTS
- Consent requirements
- Opt-out handling
- Data usage limitations
- Geographic restrictions

CUSTOMER EXPERIENCE GUARDRAILS
- Maximum contact frequency
- Channel preferences
- Do-not-contact rules
- Complaint triggers

CAPACITY CONSTRAINTS
- Call center capacity
- Fulfillment capacity
- Budget constraints
- Resource constraints
```

#### CSO_KB_Reinforcement_Learning_Marketing_v1.txt
```
CONTENT DEPTH:

RL FORMULATION FOR MARKETING
- State: Customer attributes + history
- Action: Contact/channel/message decisions
- Reward: Conversion, engagement, CLV
- Discount factor: Time value of customer

ALGORITHM SELECTION
- Model-based vs model-free
- On-policy vs off-policy
- Batch RL for historical data
- Safe RL for deployment

PRACTICAL CONSIDERATIONS
- Reward shaping
- Exploration in production
- Offline evaluation
- Sim-to-real transfer

DEPLOYMENT
- Policy deployment
- A/B testing policies
- Gradual rollout
- Monitoring and safeguards
```

#### CSO_KB_Journey_Orchestration_v1.txt
```
CONTENT DEPTH:

ORCHESTRATION ARCHITECTURE
- Decision engine design
- Real-time vs batch decisions
- Caching and performance
- Failover handling

MULTI-CHANNEL COORDINATION
- Cross-channel deduplication
- Unified customer view
- Channel handoff logic
- Consistent messaging

INTEGRATION POINTS
- Campaign management platforms
- Marketing automation tools
- Customer data platforms
- Analytics platforms

MEASUREMENT AND OPTIMIZATION
- Journey-level metrics
- Incrementality of orchestration
- Continuous improvement
- A/B testing journeys
```

### Data Requirements
- Customer interaction history
- Channel engagement data
- Conversion and response data
- Customer preferences
- Identity graph
- Real-time signals

### Interface with Other Agents
- **← AUD**: Identity, propensities, segments
- **← NDS**: Budget constraints, channel ROI
- **← UDM**: Intent signals
- **→ CHA**: Channel execution commands
- **→ DOC**: Journey performance reports

---

## 7. VIEW-THROUGH, CLICK-THROUGH & FULL-JOURNEY TRACKING

### Purpose
Comprehensive measurement framework handling both click and view behaviors across devices and channels.

### Proposed KB Files (4 files)

#### PRF_KB_View_Click_Measurement_v1.txt
```
CONTENT DEPTH:

MEASUREMENT DEFINITIONS
- Click-through conversion (CTC)
- View-through conversion (VTC)
- Lookback windows by type
- Platform-specific definitions

CLICK-THROUGH TRACKING
- Click tracking mechanisms
- Redirect vs pixel tracking
- Click fraud filtering
- Bot click detection

VIEW-THROUGH TRACKING
- Impression tracking
- Viewability requirements
- View-through windows
- Assisted vs attributed views

DEDUPLICATION RULES
- CTC vs VTC priority
- Cross-channel deduplication
- Time-based priority
- Last-touch vs fractional
```

#### PRF_KB_View_Through_Bias_Correction_v1.txt
```
CONTENT DEPTH:

BIAS SOURCES
- Selection bias (who sees ads)
- Viewability inflation
- Fraud contamination
- Natural conversion baseline

CORRECTION METHODS

STATISTICAL ADJUSTMENT
- Propensity score weighting
- Inverse probability weighting
- Doubly robust estimation

PSA/GHOST AD CALIBRATION
- Control group baseline
- Lift-based adjustment
- Incremental view-through rate

VIEWABILITY ADJUSTMENT
- Viewability rate normalization
- Attention-weighted views
- Quality-adjusted impressions

FRAUD ADJUSTMENT
- IVT removal
- Post-bid filtering impact
- Quality impression rate
```

#### PRF_KB_Multi_Impression_Sequence_v1.txt
```
CONTENT DEPTH:

SEQUENCE EFFECTS
- First impression effect
- Last impression effect
- Cumulative exposure effect
- Frequency-response curves

CROSS-CHANNEL SEQUENCES
- Channel order effects
- Channel synergy measurement
- Optimal path identification
- Path-to-conversion analysis

CROSS-DEVICE SEQUENCES
- Device order effects
- Device handoff tracking
- Identity-based path construction
- Device role analysis

MODELING APPROACHES
- Survival models for time-to-conversion
- Sequence models for paths
- Causal models for incrementality
- Mixed effects for heterogeneity
```

#### PRF_KB_Signal_Integration_Framework_v1.txt
```
CONTENT DEPTH:

SIGNAL FLOW TO ATTRIBUTION
- Real-time signal processing
- Attribution window management
- Deduplication logic
- Fractional credit assignment

SIGNAL FLOW TO INCREMENTALITY
- Experiment integration
- Holdout tracking
- Lift measurement
- Calibration feedback

SIGNAL FLOW TO MMM
- Aggregation methodology
- Adstock application
- Quality weighting
- Outcome alignment

SIGNAL FLOW TO NDS/CSO
- Real-time signal availability
- Latency requirements
- Confidence levels
- Decision triggers
```

### Data Requirements
- Impression logs with viewability
- Click logs with timestamps
- Conversion events
- Cross-device identity
- Quality/fraud flags

### Interface with Other Agents
- **→ PRF**: Attribution, incrementality
- **→ ANL**: MMM data feed
- **→ NDS**: Real-time optimization signals
- **→ AUD**: Identity graph enrichment

---

## 8. SYSTEM-LEVEL ARCHITECTURE & GOVERNANCE

### Purpose
Define how all models are orchestrated across agents and maintain unified source of truth.

### Proposed KB Files (7 files)

#### SYS_KB_Model_Orchestration_v1.txt
```
CONTENT DEPTH:

SHARED SERVICES
- Identity resolution (shared)
- Feature store (shared)
- Experiment platform (shared)
- Model registry (shared)

AGENT-EMBEDDED MODELS
- Propensity models (AUD)
- Attribution models (PRF)
- Forecasting models (ANL)
- Creative scoring (UDM)

DATA FLOW PATTERNS
- Streaming vs batch
- Push vs pull
- Event-driven updates
- Scheduled refreshes

MODEL VERSIONING
- Model registry design
- Version control
- A/B testing models
- Rollback procedures
```

#### SYS_KB_Source_of_Truth_v1.txt
```
CONTENT DEPTH:

SINGLE SOURCE PRINCIPLE
- Authoritative data sources
- Derived data management
- Conflict resolution rules
- Audit trail requirements

DECISION HORIZON VIEWS
- Strategic view (MMM-driven)
- Tactical view (MTA-driven)
- Operational view (real-time)
- Reconciliation rules

DATA GOVERNANCE
- Data ownership
- Data quality SLAs
- Access control
- Privacy compliance
```

#### SYS_KB_Agent_Communication_v1.txt
```
CONTENT DEPTH:

COMMUNICATION PATTERNS
- Synchronous calls
- Asynchronous messaging
- Event broadcasting
- Query-response

MESSAGE CONTRACTS
- Input/output schemas
- Versioning strategy
- Backward compatibility
- Error handling

DEPENDENCY MANAGEMENT
- Agent dependencies
- Circular dependency prevention
- Graceful degradation
- Timeout handling
```

#### SYS_KB_Decision_Conflict_Resolution_v1.txt
```
CONTENT DEPTH:

CONFLICT TYPES
- Model disagreement
- Data inconsistency
- Constraint conflicts
- Priority conflicts

RESOLUTION STRATEGIES
- Confidence-weighted voting
- Hierarchical override
- Human escalation
- Default fallback

GOVERNANCE PROCESS
- Decision logging
- Conflict reporting
- Resolution audit
- Continuous improvement
```

#### SYS_KB_Continuous_Learning_v1.txt
```
CONTENT DEPTH:

FEEDBACK LOOPS
- Outcome feedback
- Model performance feedback
- Decision quality feedback
- User feedback

MODEL RETRAINING
- Trigger conditions
- Retraining pipelines
- Validation requirements
- Deployment gates

DRIFT DETECTION
- Data drift monitoring
- Concept drift detection
- Performance degradation
- Alert thresholds

KNOWLEDGE ACCUMULATION
- Experiment learnings
- Best practice capture
- Failure documentation
- Pattern library
```

#### SYS_KB_Missing_Model_Classes_v1.txt
```
CONTENT DEPTH:

ADDITIONAL MODELS TO CONSIDER

CREATIVE PERFORMANCE MODELING
- Pre-flight creative scoring
- Fatigue prediction
- Refresh optimization
- Audience-creative matching

PRICING AND PROMOTION EFFECTS
- Price elasticity modeling
- Promotion response curves
- Cannibalization effects
- Optimal promotion timing

SUPPLY-SIDE CONSTRAINTS
- Inventory modeling
- Delivery probability
- Capacity planning
- Fulfillment optimization

CLV MODELING
- Predictive CLV
- CLV-based segmentation
- Acquisition value optimization
- Retention value modeling

CHURN AND RETENTION
- Churn propensity
- Retention intervention timing
- Win-back optimization
- Reactivation scoring

COMPETITIVE RESPONSE
- Competitive monitoring
- Share of voice modeling
- Competitive reaction prediction
- Defensive strategy optimization
```

#### SYS_KB_Implementation_Roadmap_v1.txt
```
CONTENT DEPTH:

MATURITY MODEL
- Level 1: Basic analytics
- Level 2: Integrated measurement
- Level 3: Unified optimization
- Level 4: Autonomous decisioning

IMPLEMENTATION PHASES
- Phase 1: Foundation (data, identity)
- Phase 2: Measurement (MMM, MTA, incrementality)
- Phase 3: Optimization (NDS, CSO)
- Phase 4: Automation (always-on, continuous learning)

SUCCESS METRICS
- Model accuracy improvements
- Decision quality metrics
- Business outcome impact
- Operational efficiency

RISK MITIGATION
- Technical risks
- Organizational risks
- Data risks
- Regulatory risks
```

---

## PART III: IMPLEMENTATION SUMMARY

### Total KB Files by Category

| Category | KB Files | Agent Owner |
|----------|----------|-------------|
| 1. Unstructured Data | 8 | UDM (new) |
| 2. Next Dollar Spend | 10 | NDS (new) |
| 3. MMM/MMO | 6 | ANL |
| 4. MTA/Attribution | 5 | PRF |
| 5. Incrementality | 6 | PRF |
| 6. CSO/Journey | 8 | CSO (new) |
| 7. View/Click Tracking | 4 | PRF |
| 8. System Architecture | 7 | ORC/Shared |
| **Prior Plan Files** | **42** | Various |
| **TOTAL NEW FILES** | **96** | |

### Combined with Prior Plan

| Source | Files |
|--------|-------|
| Current KB inventory | 72 |
| Prior enhancement plan | 42 |
| This blueprint additions | 54 |
| **TOTAL TARGET** | **168** |

### New Agent Summary

| Agent | Purpose | Key Models |
|-------|---------|------------|
| **UDM** | Unstructured Data Mining | NLP, creative analysis, anomaly detection |
| **NDS** | Next Dollar Spend | Marginal returns, allocation, risk |
| **CSO** | Contact Stream Optimization | Journey models, NBA, RL |

### Implementation Priority

**Phase 1 (Weeks 1-2): Foundation**
- Identity resolution (AUD) - from prior plan
- Data quality and cleansing (shared)
- Feature store infrastructure

**Phase 2 (Weeks 2-4): Measurement**
- MMM enhancement (ANL)
- MTA enhancement (PRF)
- Incrementality framework (PRF)
- View/click tracking (PRF)

**Phase 3 (Weeks 4-6): Optimization**
- NDS implementation (new agent)
- CSO implementation (new agent)
- Multi-input integration

**Phase 4 (Weeks 6-8): Intelligence**
- UDM implementation (new agent)
- Unstructured data pipelines
- Creative and social analysis

**Phase 5 (Weeks 8-10): Integration**
- System orchestration
- Continuous learning
- Governance and monitoring

---

## APPENDIX: KEY INTERCONNECTIONS

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MODEL INTERCONNECTION MAP                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  IDENTITY ─────────┬─────────────────────────────────────────────┐  │
│     │              │                                             │  │
│     ▼              ▼                                             │  │
│  ATTRIBUTION ───► MMM ◄─── INCREMENTALITY                        │  │
│     │              │              │                              │  │
│     │              ▼              │                              │  │
│     └────────► NDS (NEXT $) ◄────┘                               │  │
│                    │                                             │  │
│     ┌──────────────┼──────────────┐                              │  │
│     ▼              ▼              ▼                              │  │
│   SPO           CSO            CHA                               │  │
│ (Execute)    (Journey)      (Channel)                            │  │
│                    │                                             │  │
│                    ▼                                             │  │
│              MEASUREMENT ───► FEEDBACK ───► MODEL UPDATE         │  │
│                                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

*Blueprint Version: 1.0*
*Date: January 18, 2026*
*Ready for implementation planning on confirmation.*
