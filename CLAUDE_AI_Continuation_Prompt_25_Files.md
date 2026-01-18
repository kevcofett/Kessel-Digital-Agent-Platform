# CLAUDE.AI CONTINUATION PROMPT - MPA v6.0 KB EXPANSION (25 FILES)

## Copy and paste this ENTIRE prompt into a NEW Claude.ai conversation to begin/continue the 25-file creation.

---

## MISSION

Create 25 complex architecture KB files for the MPA v6.0 expansion. VS Code is simultaneously creating 71 pattern-based files in parallel.

**CRITICAL:** After creating EACH file:
1. Save to local repo immediately
2. Commit to git
3. Push to remote every 3-5 files
4. This prevents loss on disconnect or context exhaustion

## COMPLIANCE REQUIREMENTS (MANDATORY)

### Six-Rule Framework - ALL FILES MUST PASS

```
RULE 1: ALL-CAPS HEADERS
- CORRECT:   SECTION 1 - CORE CONCEPTS
- WRONG:     Section 1 - Core Concepts

RULE 2: HYPHENS ONLY FOR LISTS
- CORRECT:   - List item
- WRONG:     * bullet, • bullet, 1. numbered

RULE 3: ASCII CHARACTERS ONLY
- NO smart quotes "" use straight ""
- NO em-dashes — use double hyphens --

RULE 4: ZERO VISUAL DEPENDENCIES
- NO tables, NO images, NO markdown formatting

RULE 5: MANDATORY DOCUMENT HEADER
[AGENT]_KB_[Topic]_v1.0.txt
VERSION: 1.0
STATUS: Production Ready
COMPLIANCE: 6-Rule Compliant
LAST UPDATED: 2026-01-18
CHARACTER COUNT: [actual count]

RULE 6: PROFESSIONAL TONE
- NO emoji, NO first person, NO casual language
```

### Microsoft Stack Compatibility
- Copilot Studio: Max 36,000 characters per file (target 15,000-25,000)
- Azure/Dataverse/SharePoint: UTF-8, no spaces in filenames

## REPOSITORY INFO

```
REPO: Kessel-Digital-Agent-Platform
BRANCH: feature/v6.0-kb-expansion
PATH: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
```

## DOCUMENT TEMPLATE

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

[Detailed opening paragraph - this is complex architecture content, be thorough]

[SUBSECTION TITLE IN ALL CAPS]

[Deep technical content with hyphens for lists]
- First item with explanation
- Second item with explanation

================================================================================
SECTION 2 - [NEXT SECTION]
================================================================================

[Continue with detailed technical content...]

================================================================================
SECTION N - AGENT APPLICATION GUIDANCE
================================================================================

WHEN TO USE THIS KNOWLEDGE

[Specific guidance on when agent should reference this KB]

INTEGRATION WITH OTHER AGENTS

[How this KB interfaces with other agents - be specific]

================================================================================
END OF DOCUMENT
================================================================================
```

## WORKFLOW FOR EACH FILE

```bash
# 1. Create file content (15,000-25,000 characters of deep technical content)

# 2. Write to repo using Desktop Commander
write_file to: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v6.0/agents/[agent]/kb/[filename]

# 3. Validate
run: ./validate_kb_file.sh [filepath]

# 4. Git add and commit
run: git add [filepath] && git commit -m "feat([agent]): Add [filename]"

# 5. Push every 3-5 files
run: git push origin feature/v6.0-kb-expansion

# 6. Report completion before moving to next file
```

## YOUR 25 FILES TO CREATE

### PHASE 1A: IDENTITY FOUNDATION (3 files)
Location: release/v6.0/agents/aud/kb/

**File 1: AUD_KB_Identity_Graph_Algorithms_v1.0.txt**
Target: 20,000-25,000 characters
Required sections:
- IDENTITY GRAPH FUNDAMENTALS: Graph data structures, adjacency representations, edge weighting, temporal considerations
- DETERMINISTIC MATCHING ALGORITHMS: Hash-based, phonetic (Soundex, Metaphone), edit distance (Levenshtein, Jaro-Winkler), token-based (Jaccard, TF-IDF cosine)
- PROBABILISTIC MATCHING ALGORITHMS: Fellegi-Sunter model, m/u probabilities, weight calculation, threshold optimization
- BLOCKING STRATEGIES: Standard blocking, Q-gram, sorted neighborhood, canopy clustering, LSH
- GRAPH ALGORITHMS FOR RESOLUTION: Connected components, graph partitioning, community detection, transitive closure
- ML-BASED MATCHING: Siamese networks, random forests for pair classification, active learning
- SCALING CONSIDERATIONS: Distributed processing, approximate algorithms, incremental updates
- AGENT APPLICATION GUIDANCE

**File 2: AUD_KB_Card_Portfolio_Resolution_v1.0.txt**
Target: 18,000-22,000 characters
Required sections:
- CARD PORTFOLIO CHALLENGE: Multi-PAN households, tokenization complexity, issuer vs network view
- PAN LINKAGE METHODS: Deterministic (exact match on PII), probabilistic (behavioral patterns), hybrid approaches
- CARDHOLDER MATCHING: Name standardization, address matching, device fingerprinting
- HOUSEHOLD CARD AGGREGATION: Authorized user detection, family card identification, corporate vs personal
- WALLET SHARE CALCULATION: Share of wallet estimation, competitive card detection, primary card identification
- TOKENIZATION HANDLING: Token-to-PAN mapping, cross-merchant resolution, EMV considerations
- MASTERCARD-SPECIFIC PATTERNS: Network-level signals, issuer collaboration, cross-border considerations
- PRIVACY AND COMPLIANCE: PCI-DSS requirements, data minimization, consent frameworks
- AGENT APPLICATION GUIDANCE

**File 3: AUD_KB_Household_Resolution_v1.0.txt**
Target: 18,000-22,000 characters
Required sections:
- HOUSEHOLD DEFINITION: Marketing household vs census household, temporal stability, composition types
- ADDRESS STANDARDIZATION: CASS certification, USPS standards, international address handling, apartment/unit parsing
- DEVICE CLUSTERING FOR HOUSEHOLDS: IP-based clustering, WiFi signals, device graph providers
- COMPOSITION INFERENCE: Demographic inference, life stage detection, household size estimation
- MULTI-ADDRESS HANDLING: Vacation homes, college students, snowbirds, military
- PROVIDER LANDSCAPE: Experian, Acxiom, LiveRamp, Epsilon household files
- MATCH RATE OPTIMIZATION: Waterfall strategies, confidence scoring, refresh cadence
- AGENT APPLICATION GUIDANCE

### PHASE 1B: NDS AGENT CORE (5 files)
Location: release/v6.0/agents/nds/kb/

**File 4: NDS_KB_Marginal_Return_Estimation_v1.0.txt**
Target: 20,000-25,000 characters
Required sections:
- MARGINAL RETURN FUNDAMENTALS: Definition, relationship to ROI/ROAS, decision relevance
- HILL FUNCTION MODELING: Mathematical formulation, parameter estimation, asymptote interpretation
- S-CURVE AND SATURATION: Logistic curves, Gompertz functions, saturation point detection
- DIMINISHING RETURNS QUANTIFICATION: First derivative analysis, inflection points, optimal spend identification
- NONPARAMETRIC APPROACHES: Kernel regression, LOESS, Gaussian processes for response curves
- UNCERTAINTY QUANTIFICATION: Confidence intervals, Bayesian credible intervals, bootstrap methods
- REAL-TIME MARGINAL ESTIMATION: Online updating, streaming calculations, latency considerations
- CROSS-CHANNEL MARGINAL COMPARISON: Standardization, comparability, opportunity cost
- AGENT APPLICATION GUIDANCE

**File 5: NDS_KB_Spend_NoSpend_Logic_v1.0.txt**
Target: 18,000-22,000 characters
Required sections:
- DECISION FRAMEWORK OVERVIEW: Binary decision logic, threshold-based rules, continuous optimization
- SATURATION DETECTION: Leading indicators, trend analysis, efficiency degradation signals
- QUALITY THRESHOLD ENFORCEMENT: Minimum viewability, maximum fraud, brand safety floors
- MARGINAL RETURN THRESHOLDS: Break-even ROAS, margin-adjusted thresholds, opportunity cost comparison
- AUDIENCE EXHAUSTION SIGNALS: Frequency caps, diminishing reach, creative fatigue indicators
- COMPETITIVE CONTEXT: SOV considerations, auction dynamics, defensive spending
- RISK-ADJUSTED DECISION RULES: Confidence-weighted thresholds, uncertainty penalties
- OVERRIDE AND ESCALATION: Human-in-the-loop triggers, strategic override conditions
- AGENT APPLICATION GUIDANCE

**File 6: NDS_KB_Multi_Input_Integration_v1.0.txt**
Target: 20,000-25,000 characters
Required sections:
- INPUT SOURCE TAXONOMY: MMM outputs, MTA signals, incrementality results, unstructured signals
- SOURCE PRIORITIZATION LOGIC: Recency weighting, confidence scoring, coverage assessment
- WEIGHTED COMBINATION METHODS: Bayesian model averaging, ensemble approaches, meta-learning
- CONFLICT RESOLUTION: Disagreement detection, root cause analysis, arbitration rules
- TEMPORAL ALIGNMENT: Different measurement windows, lag adjustment, synchronization
- CONFIDENCE PROPAGATION: Uncertainty combination, error propagation, conservative estimation
- SIGNAL FRESHNESS MANAGEMENT: Decay functions, staleness penalties, refresh triggers
- FALLBACK HIERARCHIES: Missing data handling, default assumptions, graceful degradation
- AGENT APPLICATION GUIDANCE

**File 7: NDS_KB_Risk_Adjusted_Allocation_v1.0.txt**
Target: 18,000-22,000 characters
Required sections:
- PORTFOLIO THEORY FOR MARKETING: Modern portfolio theory adaptation, efficient frontier, risk-return tradeoff
- RISK METRICS FOR MEDIA: Volatility of returns, downside risk, maximum drawdown, VaR
- SHARPE AND SORTINO RATIOS: Calculation for marketing investments, benchmark selection
- DIVERSIFICATION STRATEGIES: Channel diversification, audience diversification, temporal spreading
- CORRELATION ANALYSIS: Cross-channel correlation, covariance estimation, regime dependence
- HEDGING STRATEGIES: Counter-cyclical allocation, defensive positioning, insurance spending
- CONSTRAINT INTEGRATION: Risk limits, concentration limits, correlation limits
- DYNAMIC RISK ADJUSTMENT: Market condition response, volatility targeting, rebalancing rules
- AGENT APPLICATION GUIDANCE

**File 8: NDS_KB_Budget_Response_Functions_v1.0.txt**
Target: 18,000-22,000 characters
Required sections:
- RESPONSE FUNCTION TAXONOMY: Linear, log-linear, S-curve, Hill, polynomial, piecewise
- CHANNEL-SPECIFIC RESPONSE CURVES: Search, social, display, video, CTV, audio patterns
- AUDIENCE-SPECIFIC RESPONSE: Heterogeneity by segment, CLV-weighted response, behavioral response
- CAMPAIGN-LEVEL RESPONSE: Creative effects, targeting effects, timing effects
- CROSS-CHANNEL INTERACTIONS: Synergy effects, cannibalization, halo effects
- TEMPORAL DYNAMICS: Adstock modeling, carryover effects, decay rates
- RESPONSE CURVE ESTIMATION: Regression approaches, Bayesian estimation, experimental calibration
- CURVE UPDATING AND MAINTENANCE: Refresh cadence, drift detection, re-estimation triggers
- AGENT APPLICATION GUIDANCE

### PHASE 1C: CSO AGENT CORE (5 files)
Location: release/v6.0/agents/cso/kb/

**File 9: CSO_KB_Journey_State_Models_v1.0.txt**
Target: 20,000-25,000 characters
Required sections:
- STATE REPRESENTATION: Discrete vs continuous states, feature engineering for state, embedding approaches
- MARKOV MODELS FOR JOURNEYS: First-order Markov, higher-order, variable-order Markov
- HIDDEN MARKOV MODELS: Latent state inference, Baum-Welch algorithm, Viterbi decoding
- LSTM FOR JOURNEY MODELING: Sequence encoding, attention mechanisms, bidirectional approaches
- TRANSFORMER-BASED MODELS: Self-attention for journeys, positional encoding, pre-training strategies
- STATE TRANSITION PROBABILITIES: Estimation methods, smoothing techniques, sparse data handling
- ABSORBING STATES: Conversion modeling, churn modeling, terminal state handling
- REAL-TIME STATE INFERENCE: Online inference, streaming updates, latency requirements
- AGENT APPLICATION GUIDANCE

**File 10: CSO_KB_Next_Best_Action_v1.0.txt**
Target: 20,000-25,000 characters
Required sections:
- NBA FRAMEWORK OVERVIEW: Definition, objectives, decision space, action taxonomy
- POLICY-BASED METHODS: Rule-based policies, decision trees, policy gradients
- VALUE-BASED METHODS: Q-learning, DQN, value function approximation
- ACTOR-CRITIC METHODS: A2C, PPO, SAC for marketing decisions
- CONTEXTUAL BANDITS: Thompson sampling, UCB, LinUCB, neural contextual bandits
- CONSTRAINT HANDLING IN NBA: Action feasibility, capacity constraints, policy constraints
- EXPLORATION VS EXPLOITATION: Epsilon-greedy, softmax, optimistic initialization
- EVALUATION AND VALIDATION: Off-policy evaluation, counterfactual estimation, A/B testing
- AGENT APPLICATION GUIDANCE

**File 11: CSO_KB_Sequence_Timing_Optimization_v1.0.txt**
Target: 18,000-22,000 characters
Required sections:
- MESSAGE SEQUENCING: Optimal message order, narrative arc, information progression
- SEND TIME OPTIMIZATION: Individual-level timing, timezone handling, daypart optimization
- TEMPORAL MODELING: Survival models for timing, hazard rate estimation, time-to-event
- INTER-MESSAGE SPACING: Optimal gaps, fatigue avoidance, urgency balancing
- SEQUENCE LENGTH OPTIMIZATION: Optimal journey length, diminishing returns, dropout modeling
- REAL-TIME VS BATCH DECISIONS: Latency tradeoffs, batch efficiency, hybrid approaches
- TRIGGER-BASED TIMING: Event-driven messaging, behavioral triggers, contextual triggers
- TESTING SEQUENCE STRATEGIES: Sequential A/B testing, multi-arm bandits for sequences
- AGENT APPLICATION GUIDANCE

**File 12: CSO_KB_Frequency_Fatigue_Management_v1.0.txt**
Target: 18,000-22,000 characters
Required sections:
- OPTIMAL FREQUENCY THEORY: Effective frequency, frequency-response curves, diminishing returns
- FATIGUE MODELING: Wear-out detection, creative fatigue, channel fatigue, message fatigue
- FREQUENCY CAPS: Global caps, channel caps, campaign caps, creative caps
- CROSS-CHANNEL FREQUENCY: Unified frequency management, channel substitution, holistic view
- COOLING-OFF PERIODS: Rest period optimization, recovery modeling, re-engagement timing
- SUPPRESSION RULES: Over-exposure suppression, recent converter suppression, complaint-based
- PERSONALIZED FREQUENCY: Individual tolerance estimation, preference learning, adaptive caps
- MEASUREMENT AND MONITORING: Fatigue indicators, alerting thresholds, dashboard metrics
- AGENT APPLICATION GUIDANCE

**File 13: CSO_KB_Reinforcement_Learning_Marketing_v1.0.txt**
Target: 20,000-25,000 characters
Required sections:
- RL PROBLEM FORMULATION: State space, action space, reward function, discount factor for marketing
- ALGORITHM SELECTION: Model-free vs model-based, on-policy vs off-policy, discrete vs continuous
- REWARD ENGINEERING: Short-term vs long-term rewards, auxiliary rewards, reward shaping
- SAFE RL FOR MARKETING: Constraint satisfaction, safety bounds, conservative policies
- OFFLINE RL: Learning from logged data, importance sampling, doubly robust estimation
- DEPLOYMENT CONSIDERATIONS: Exploration in production, gradual rollout, monitoring
- SAMPLE EFFICIENCY: Pre-training, transfer learning, meta-learning for marketing
- INTERPRETABILITY: Policy explanation, feature importance, counterfactual analysis
- AGENT APPLICATION GUIDANCE

### PHASE 1D: SYSTEM ARCHITECTURE (5 files)
Location: release/v6.0/system/

**File 14: SYS_KB_Model_Orchestration_v1.0.txt**
Target: 18,000-22,000 characters
Required sections:
- ORCHESTRATION PHILOSOPHY: Shared services vs embedded models, centralization tradeoffs
- DATA FLOW PATTERNS: Pub/sub, request/response, event sourcing, CQRS
- MODEL VERSIONING: Version control for models, A/B testing models, gradual rollout
- DEPENDENCY MANAGEMENT: Model dependencies, DAG execution, circular dependency prevention
- CACHING STRATEGIES: Prediction caching, feature caching, invalidation policies
- FAILOVER AND RESILIENCE: Fallback models, graceful degradation, circuit breakers
- LATENCY MANAGEMENT: SLA enforcement, timeout handling, async processing
- MONITORING AND OBSERVABILITY: Model performance tracking, drift detection, alerting
- AGENT APPLICATION GUIDANCE

**File 15: SYS_KB_Source_of_Truth_v1.0.txt**
Target: 18,000-22,000 characters
Required sections:
- SINGLE SOURCE PRINCIPLE: Definition, benefits, implementation challenges
- DECISION HORIZON VIEWS: Real-time view, tactical view, strategic view, data requirements per horizon
- AUTHORITATIVE SOURCES BY DOMAIN: Attribution SoT, audience SoT, performance SoT, spend SoT
- DATA GOVERNANCE: Ownership, stewardship, quality standards, access control
- CONSISTENCY MANAGEMENT: Eventual consistency, conflict resolution, reconciliation processes
- TEMPORAL CONSISTENCY: Point-in-time queries, slowly changing dimensions, snapshot management
- AUDIT AND LINEAGE: Data provenance, transformation tracking, reproducibility
- CROSS-SYSTEM INTEGRATION: Master data management, golden record creation, deduplication
- AGENT APPLICATION GUIDANCE

**File 16: SYS_KB_Agent_Communication_v1.0.txt**
Target: 18,000-22,000 characters
Required sections:
- COMMUNICATION PATTERNS: Request/response, event-driven, choreography vs orchestration
- MESSAGE CONTRACTS: Schema definition, versioning, backward compatibility
- INTER-AGENT PROTOCOLS: Handoff protocols, escalation protocols, collaboration protocols
- ERROR HANDLING: Retry policies, dead letter queues, compensation logic
- ASYNC VS SYNC: When to use each, timeout management, callback patterns
- STATE MANAGEMENT: Stateless vs stateful agents, session management, context passing
- SECURITY: Authentication between agents, authorization, encryption
- TESTING AND SIMULATION: Mock agents, integration testing, chaos engineering
- AGENT APPLICATION GUIDANCE

**File 17: SYS_KB_Decision_Conflict_Resolution_v1.0.txt**
Target: 18,000-22,000 characters
Required sections:
- CONFLICT TYPES: Data conflicts, recommendation conflicts, priority conflicts, resource conflicts
- DETECTION MECHANISMS: Automated conflict detection, threshold-based alerts, anomaly detection
- RESOLUTION STRATEGIES: Priority-based, confidence-based, voting, arbitration
- ESCALATION FRAMEWORK: When to escalate, escalation paths, human-in-the-loop triggers
- GOVERNANCE PROCESS: Decision authority matrix, approval workflows, audit trails
- TRADEOFF ANALYSIS: Multi-objective optimization, Pareto optimality, constraint relaxation
- DOCUMENTATION REQUIREMENTS: Decision logging, rationale capture, post-decision analysis
- CONTINUOUS IMPROVEMENT: Conflict pattern analysis, root cause elimination, process refinement
- AGENT APPLICATION GUIDANCE

**File 18: SYS_KB_Continuous_Learning_v1.0.txt**
Target: 18,000-22,000 characters
Required sections:
- FEEDBACK LOOP DESIGN: Outcome feedback, implicit feedback, explicit feedback, feedback latency
- MODEL RETRAINING TRIGGERS: Performance degradation, data drift, concept drift, scheduled refresh
- DRIFT DETECTION: Statistical tests, distribution comparison, feature drift vs label drift
- ONLINE LEARNING: Incremental updates, mini-batch updates, learning rate schedules
- KNOWLEDGE ACCUMULATION: Experience replay, knowledge distillation, curriculum learning
- A/B TESTING INTEGRATION: Experiment results to model updates, multi-armed bandit integration
- COLD START HANDLING: New channels, new audiences, new campaigns
- CATASTROPHIC FORGETTING PREVENTION: Elastic weight consolidation, progressive networks
- AGENT APPLICATION GUIDANCE

### PHASE 1E: CRITICAL ML FILES (7 files)
Locations vary - see each file

**File 19: ANL_KB_Causal_ML_Methods_v1.0.txt**
Location: release/v6.0/agents/anl/kb/
Target: 22,000-28,000 characters
Required sections:
- CAUSAL INFERENCE FOUNDATIONS: Potential outcomes, DAGs, identification assumptions
- CATE ESTIMATION: Conditional average treatment effects, heterogeneous effects
- META-LEARNERS: S-learner, T-learner, X-learner, R-learner, DR-learner
- CAUSAL FORESTS: Honest estimation, confidence intervals, variable importance
- DOUBLE MACHINE LEARNING: Orthogonalization, cross-fitting, high-dimensional controls
- UPLIFT MODELING: Treatment effect estimation for targeting, Qini curves, uplift trees
- INSTRUMENTAL VARIABLES WITH ML: Two-stage estimation, weak instruments, many instruments
- MARKETING APPLICATIONS: Incremental lift estimation, audience selection, budget allocation
- AGENT APPLICATION GUIDANCE

**File 20: ANL_KB_Bayesian_Methods_v1.0.txt**
Location: release/v6.0/agents/anl/kb/
Target: 22,000-28,000 characters
Required sections:
- BAYESIAN FOUNDATIONS: Bayes theorem, prior specification, posterior inference, predictive distributions
- BAYESIAN A/B TESTING: Beta-binomial model, credible intervals, decision rules, early stopping
- BAYESIAN MMM: Prior elicitation for marketing, hierarchical priors, regularization through priors
- MCMC METHODS: Metropolis-Hastings, Gibbs sampling, HMC, NUTS
- VARIATIONAL INFERENCE: ELBO, mean-field approximation, amortized inference
- TOOLS AND FRAMEWORKS: Stan, PyMC, NumPyro, TensorFlow Probability
- DIAGNOSTICS: Convergence assessment, effective sample size, R-hat, trace plots
- DECISION THEORY: Expected utility, loss functions, optimal decisions under uncertainty
- AGENT APPLICATION GUIDANCE

**File 21: PRF_KB_Fraud_Detection_Methods_v1.0.txt**
Location: release/v6.0/agents/prf/kb/
Target: 22,000-28,000 characters
Required sections:
- FRAUD TAXONOMY: GIVT vs SIVT, bot types, click fraud, impression fraud, conversion fraud
- STATISTICAL DETECTION: Benford's Law, Z-score analysis, chi-square tests, entropy analysis
- ML DETECTION ALGORITHMS: Isolation Forest, Random Forest, XGBoost, LSTM for sequences
- BEHAVIORAL ANALYSIS: Click patterns, mouse movements, session behavior, device fingerprinting
- IP AND GEOGRAPHIC ANALYSIS: Data center detection, VPN/proxy detection, impossible travel
- CHANNEL-SPECIFIC PATTERNS: Display fraud, video fraud, CTV fraud, mobile fraud, search fraud
- VENDOR INTEGRATION: IAS, DoubleVerify, MOAT, Pixalate methodologies
- REAL-TIME VS POST-BID: Pre-bid filtering, post-bid analysis, reconciliation
- AGENT APPLICATION GUIDANCE

**File 22: PRF_KB_Unified_Measurement_Framework_v1.0.txt**
Location: release/v6.0/agents/prf/kb/
Target: 22,000-28,000 characters
Required sections:
- TRIANGULATION METHODOLOGY: MMM + MTA + Incrementality integration, strengths/weaknesses of each
- COVERAGE MAPPING: What each method measures, blind spots, overlap areas
- CALIBRATION CASCADE: Using experiments to calibrate MMM, using MMM to contextualize MTA
- WEIGHTED COMBINATION: Confidence-weighted averaging, Bayesian model averaging
- DISCREPANCY INVESTIGATION: Root cause framework, measurement artifacts, true differences
- GOVERNANCE FRAMEWORK: When to use which source, decision authority, escalation
- REPORTING INTEGRATION: Unified dashboards, source attribution, confidence communication
- CONTINUOUS IMPROVEMENT: Method comparison, calibration updates, process refinement
- AGENT APPLICATION GUIDANCE

**File 23: PRF_KB_Incrementality_Testing_Advanced_v1.0.txt**
Location: release/v6.0/agents/prf/kb/
Target: 22,000-28,000 characters
Required sections:
- SYNTHETIC CONTROL DETAILED: Donor pool selection, pre-period optimization, RMSPE, placebo tests, inference
- MATCHED MARKET METHODS: Propensity score matching, covariate matching, genetic matching, CEM
- POWER ANALYSIS: Effect size assumptions, sample size calculation, duration optimization
- DIFFERENCE-IN-DIFFERENCES: Parallel trends, staggered adoption, synthetic DID
- REGRESSION DISCONTINUITY: Sharp vs fuzzy, bandwidth selection, local linear regression
- BAYESIAN APPROACHES: Bayesian structural time series, CausalImpact, prior specification
- CONTAMINATION AND SPILLOVER: Detection, prevention, adjustment methods
- RESULT INTERPRETATION: Confidence intervals, practical significance, heterogeneity analysis
- AGENT APPLICATION GUIDANCE

**File 24: AUD_KB_ML_Propensity_Models_v1.0.txt**
Location: release/v6.0/agents/aud/kb/
Target: 20,000-25,000 characters
Required sections:
- PROPENSITY MODEL TYPES: Response propensity, conversion propensity, churn propensity, upgrade propensity
- ALGORITHM SELECTION: Logistic regression, XGBoost, LightGBM, neural networks, ensemble methods
- FEATURE ENGINEERING: Behavioral features, transactional features, demographic features, temporal features
- CALIBRATION METHODS: Platt scaling, isotonic regression, temperature scaling, calibration curves
- CLASS IMBALANCE: Oversampling, undersampling, SMOTE, class weights, threshold optimization
- MODEL VALIDATION: Cross-validation strategies, temporal splits, stratification
- DEPLOYMENT CONSIDERATIONS: Scoring latency, batch vs real-time, model refresh
- BUSINESS APPLICATION: Targeting, bid adjustment, personalization, prioritization
- AGENT APPLICATION GUIDANCE

**File 25: AUD_KB_Entity_Resolution_v1.0.txt**
Location: release/v6.0/agents/aud/kb/
Target: 20,000-25,000 characters
Required sections:
- ENTITY RESOLUTION PIPELINE: Preprocessing, blocking, matching, clustering, canonicalization
- BLOCKING STRATEGIES: Standard, sorted neighborhood, canopy, LSH, learned blocking
- CLASSIFICATION APPROACHES: Rule-based, probabilistic, ML classifiers, active learning
- CLUSTERING FOR ER: Connected components, correlation clustering, hierarchical clustering
- ER PLATFORMS: Senzing, Tamr, Quantexa, custom implementations
- INCREMENTAL ER: New record integration, merge/split handling, temporal consistency
- EVALUATION METRICS: Precision, recall, F1 for pairs and clusters, B-cubed metrics
- SCALE AND PERFORMANCE: Distributed processing, approximate algorithms, indexing strategies
- AGENT APPLICATION GUIDANCE

## EXECUTION CHECKLIST

After EACH file:
- [ ] Content is 15,000-25,000 characters of deep technical content
- [ ] All headers are ALL CAPS
- [ ] All lists use hyphens only
- [ ] No unicode characters (smart quotes, em-dashes)
- [ ] No tables or markdown formatting
- [ ] Document header complete (VERSION, STATUS, COMPLIANCE, LAST UPDATED, CHARACTER COUNT)
- [ ] Professional tone throughout
- [ ] END OF DOCUMENT marker present
- [ ] File saved to correct path in repo
- [ ] Git add and commit completed
- [ ] Push to remote every 3-5 files

## PROGRESS TRACKING

Report after each file:
```
COMPLETED: [File X of 25] - [Filename]
- Character count: [XXXX]
- Validation: PASS/FAIL
- Committed: YES/NO
- Pushed: YES/NO (if applicable)

NEXT: [File X+1] - [Filename]
```

## START NOW

Begin with File 1: AUD_KB_Identity_Graph_Algorithms_v1.0.txt

Create the complete file with all required sections (target 20,000-25,000 characters of deep technical content on identity graph algorithms), save it to the repo, validate, commit, and report completion before proceeding to File 2.
