# CLAUDE.AI CONTINUATION PROMPT - MPA v6.0 KB EXPANSION (25 FILES)

Copy and paste this entire prompt into a new Claude.ai conversation to execute the 25 complex architecture KB files.

---

## PROMPT START

I need you to create 25 complex architecture KB files for the MPA v6.0 expansion. VS Code is simultaneously creating 71 pattern-based files in parallel.

## CRITICAL REQUIREMENTS

### Six-Rule Framework (ALL FILES MUST PASS)
1. ALL-CAPS HEADERS - Section headers must be ALL CAPS
2. HYPHENS ONLY FOR LISTS - Use hyphens (-) for all list items, never bullets or numbers
3. ASCII CHARACTERS ONLY - No smart quotes (""), no em-dashes (—), no unicode
4. ZERO VISUAL DEPENDENCIES - No tables, no images, no markdown formatting
5. MANDATORY DOCUMENT HEADER - Every file starts with VERSION, STATUS, COMPLIANCE, LAST UPDATED, CHARACTER COUNT
6. PROFESSIONAL TONE - No emoji, no first person (I, we, our), no casual language

### Microsoft Stack Compatibility
- Copilot Studio: Max 36,000 characters per file (target 15,000-25,000)
- Azure: No spaces in filenames, use underscores
- Dataverse: UTF-8 encoding
- SharePoint: Target under 100KB per file

## REPOSITORY INFO

- Repository: Kessel-Digital-Agent-Platform
- Branch: feature/v6.0-kb-expansion
- Location: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

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

[Opening paragraph describing the topic and its strategic importance]

[SUBSECTION TITLE IN ALL CAPS]

[Detailed content with hyphens for lists]
- First item
- Second item
- Third item

================================================================================
SECTION 2 - [NEXT SECTION TITLE]
================================================================================

[Continue with detailed technical content...]

================================================================================
SECTION N - AGENT APPLICATION GUIDANCE
================================================================================

WHEN TO USE THIS KNOWLEDGE

[Specific triggers and scenarios]

INTEGRATION WITH OTHER AGENTS

[Cross-agent data flows and dependencies]

RESPONSE FORMATTING

[How agent should format responses using this KB]

================================================================================
END OF DOCUMENT
================================================================================
```

## WORKFLOW (CRITICAL - DO THIS AFTER EVERY FILE)

After creating each file:

1. Write file to local repo:
```bash
# Use Desktop Commander write_file to save to:
/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v6.0/agents/[agent]/kb/[filename]
```

2. Validate compliance:
```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
./validate_kb_file.sh release/v6.0/agents/[agent]/kb/[filename]
```

3. Commit and push:
```bash
git add release/v6.0/agents/[agent]/kb/[filename]
git commit -m "feat([agent]): Add [filename]"
git push origin feature/v6.0-kb-expansion
```

4. Report completion before moving to next file

## YOUR 25 FILES

### PHASE 1A: IDENTITY FOUNDATION (3 files)
Location: release/v6.0/agents/aud/kb/

**File 1: AUD_KB_Identity_Graph_Algorithms_v1.0.txt**
Target: 20,000-25,000 characters

Required sections:
- IDENTITY GRAPH FUNDAMENTALS
  - Graph data structures (adjacency matrix, adjacency list)
  - Edge weighting strategies
  - Temporal graph considerations
- DETERMINISTIC MATCHING ALGORITHMS
  - Exact string matching and hashing
  - Phonetic matching (Soundex, Metaphone)
  - Edit distance methods (Levenshtein, Jaro-Winkler)
  - Token-based matching (Jaccard, TF-IDF cosine)
- PROBABILISTIC MATCHING ALGORITHMS
  - Fellegi-Sunter model theory
  - Weight calculation (m-probability, u-probability)
  - Threshold optimization
- BLOCKING STRATEGIES
  - Standard blocking, Q-gram blocking
  - Sorted neighborhood method
  - Canopy clustering
- MACHINE LEARNING MATCHING
  - Siamese networks for similarity
  - Active learning for labeling
  - Deep learning approaches
- GRAPH ALGORITHMS FOR RESOLUTION
  - Connected components
  - Community detection
  - Transitive closure
- SCALING CONSIDERATIONS
  - Distributed processing (Spark)
  - Approximate algorithms
  - Incremental updates
- AGENT APPLICATION GUIDANCE

**File 2: AUD_KB_Card_Portfolio_Resolution_v1.0.txt**
Target: 15,000-20,000 characters

Required sections:
- CARD PORTFOLIO FUNDAMENTALS
  - Multi-PAN environments
  - Card lifecycle events
  - Tokenization landscape
- CARDHOLDER IDENTITY LINKAGE
  - PAN-level matching
  - Account-level resolution
  - Household card aggregation
- WALLET SHARE CALCULATION
  - Share of wallet methodology
  - Cross-issuer estimation
  - Competitive positioning
- MASTERCARD-SPECIFIC PATTERNS
  - Network transaction signals
  - Merchant category intelligence
  - Cross-border patterns
- PRIVACY AND COMPLIANCE
  - PCI-DSS requirements
  - Data minimization
  - Consent frameworks
- AGENT APPLICATION GUIDANCE

**File 3: AUD_KB_Household_Resolution_v1.0.txt**
Target: 15,000-20,000 characters

Required sections:
- HOUSEHOLD DEFINITION
  - Address-based households
  - Economic households
  - Marketing households
- ADDRESS STANDARDIZATION
  - CASS certification
  - USPS standards
  - International considerations
- DEVICE CLUSTERING
  - IP-based clustering
  - WiFi network signals
  - Cross-device graphs
- COMPOSITION INFERENCE
  - Demographic modeling
  - Life stage inference
  - Household size estimation
- PROVIDER INTEGRATION
  - Experian, Acxiom, LiveRamp
  - Data append workflows
  - Match rate optimization
- AGENT APPLICATION GUIDANCE

---

### PHASE 1B: NDS AGENT CORE (5 files)
Location: release/v6.0/agents/nds/kb/

**File 4: NDS_KB_Marginal_Return_Estimation_v1.0.txt**
Target: 20,000-25,000 characters

Required sections:
- MARGINAL RETURN FUNDAMENTALS
  - Marginal vs average ROAS
  - Diminishing returns theory
  - Saturation curves
- HILL FUNCTION MODELING
  - Hill equation parameters
  - Half-saturation point
  - Steepness coefficient
  - Asymptotic maximum
- S-CURVE AND RESPONSE FUNCTIONS
  - Logistic response
  - Gompertz function
  - Custom parametric forms
- NONPARAMETRIC APPROACHES
  - Isotonic regression
  - Gaussian process regression
  - Spline-based methods
- UNCERTAINTY QUANTIFICATION
  - Confidence intervals
  - Bayesian credible intervals
  - Bootstrap methods
- REAL-TIME ESTIMATION
  - Online updating
  - Streaming algorithms
  - Decay and recency weighting
- AGENT APPLICATION GUIDANCE

**File 5: NDS_KB_Spend_NoSpend_Logic_v1.0.txt**
Target: 15,000-20,000 characters

Required sections:
- DECISION FRAMEWORK OVERVIEW
  - Binary spend decision
  - Threshold-based logic
  - Multi-criteria evaluation
- SATURATION DETECTION
  - Marginal return thresholds
  - Diminishing returns signals
  - Channel-specific saturation
- QUALITY THRESHOLDS
  - Minimum quality floors
  - Brand safety requirements
  - Viewability minimums
  - Fraud tolerance
- OPPORTUNITY COST ANALYSIS
  - Alternative channel comparison
  - Time-shifted spending
  - Audience reallocation
- RISK ADJUSTMENT
  - Confidence-weighted decisions
  - Downside protection
  - Volatility consideration
- DECISION LOGGING AND AUDIT
  - Decision trail
  - Override tracking
  - Performance feedback
- AGENT APPLICATION GUIDANCE

**File 6: NDS_KB_Multi_Input_Integration_v1.0.txt**
Target: 20,000-25,000 characters

Required sections:
- INPUT SOURCE TAXONOMY
  - MMM outputs (elasticities, saturation)
  - MTA outputs (channel attribution)
  - Incrementality outputs (lift estimates)
  - Unstructured signals (sentiment, creative)
- SOURCE PRIORITIZATION FRAMEWORK
  - Hierarchy by decision type
  - Recency weighting
  - Confidence weighting
- SIGNAL FUSION METHODS
  - Weighted averaging
  - Bayesian model averaging
  - Ensemble approaches
  - Hierarchical models
- CONFLICT RESOLUTION
  - Discrepancy detection
  - Root cause analysis
  - Arbitration rules
  - Human escalation triggers
- TEMPORAL ALIGNMENT
  - Lag adjustment
  - Refresh cadence alignment
  - Event synchronization
- DATA QUALITY GATES
  - Completeness checks
  - Freshness requirements
  - Anomaly filtering
- AGENT APPLICATION GUIDANCE

**File 7: NDS_KB_Risk_Adjusted_Allocation_v1.0.txt**
Target: 15,000-20,000 characters

Required sections:
- PORTFOLIO THEORY FOR MARKETING
  - Markowitz framework adaptation
  - Efficient frontier
  - Risk-return tradeoff
- RISK METRICS
  - Variance and standard deviation
  - Value at Risk (VaR)
  - Conditional VaR (CVaR)
  - Maximum drawdown
- SHARPE AND SORTINO RATIOS
  - Risk-adjusted return calculation
  - Benchmark selection
  - Channel comparison
- DIVERSIFICATION STRATEGIES
  - Channel correlation analysis
  - Audience diversification
  - Temporal diversification
- HEDGING APPROACHES
  - Defensive allocation
  - Counter-cyclical spending
  - Brand vs performance balance
- CONSTRAINT OPTIMIZATION
  - Risk budget constraints
  - Maximum concentration limits
  - Minimum diversification
- AGENT APPLICATION GUIDANCE

**File 8: NDS_KB_Budget_Response_Functions_v1.0.txt**
Target: 15,000-20,000 characters

Required sections:
- RESPONSE FUNCTION TYPES
  - Linear response
  - Concave (diminishing returns)
  - S-curve (threshold effects)
  - Convex (increasing returns)
- CHANNEL-SPECIFIC CURVES
  - Search response characteristics
  - Social response characteristics
  - Display response characteristics
  - Video response characteristics
  - CTV response characteristics
- AUDIENCE-SPECIFIC RESPONSE
  - Prospecting vs retargeting
  - High-value vs mass audiences
  - Funnel stage effects
- CROSS-CHANNEL INTERACTIONS
  - Synergy effects
  - Cannibalization
  - Sequence dependencies
- TEMPORAL DYNAMICS
  - Adstock and carryover
  - Seasonality adjustments
  - Competitive response
- CURVE ESTIMATION METHODS
  - Historical regression
  - Experimental calibration
  - Bayesian updating
- AGENT APPLICATION GUIDANCE

---

### PHASE 1C: CSO AGENT CORE (5 files)
Location: release/v6.0/agents/cso/kb/

**File 9: CSO_KB_Journey_State_Models_v1.0.txt**
Target: 20,000-25,000 characters

Required sections:
- STATE REPRESENTATION
  - Discrete state definitions
  - Continuous state embeddings
  - Hybrid representations
- MARKOV MODELS
  - First-order Markov chains
  - Higher-order dependencies
  - Transition probability estimation
  - Absorbing states
- HIDDEN MARKOV MODELS
  - Latent state inference
  - Emission probabilities
  - Viterbi algorithm
  - Baum-Welch training
- SEQUENCE MODELS (LSTM/GRU)
  - Architecture design
  - Input representation
  - Output heads (classification, regression)
  - Training considerations
- TRANSFORMER MODELS
  - Self-attention for journeys
  - Positional encoding
  - Pre-training strategies
  - Fine-tuning for prediction
- STATE TRANSITION PREDICTION
  - Next state prediction
  - Time-to-transition
  - Multi-step forecasting
- AGENT APPLICATION GUIDANCE

**File 10: CSO_KB_Next_Best_Action_v1.0.txt**
Target: 20,000-25,000 characters

Required sections:
- NBA FRAMEWORK OVERVIEW
  - Action space definition
  - State representation
  - Reward specification
  - Policy objectives
- VALUE-BASED METHODS
  - Q-learning fundamentals
  - Deep Q-Networks (DQN)
  - Double DQN
  - Dueling architectures
- POLICY-BASED METHODS
  - Policy gradient theorem
  - REINFORCE algorithm
  - Proximal Policy Optimization (PPO)
  - Trust Region methods
- ACTOR-CRITIC METHODS
  - A2C and A3C
  - Soft Actor-Critic (SAC)
  - Advantage estimation
- CONTEXTUAL BANDITS
  - LinUCB algorithm
  - Thompson sampling
  - Neural bandits
  - Hybrid approaches
- CONSTRAINT HANDLING IN NBA
  - Action feasibility
  - Budget constraints
  - Frequency limits
  - Channel availability
- AGENT APPLICATION GUIDANCE

**File 11: CSO_KB_Sequence_Timing_Optimization_v1.0.txt**
Target: 15,000-20,000 characters

Required sections:
- MESSAGE SEQUENCING
  - Optimal message order
  - Content progression
  - Channel sequencing
  - Narrative arc design
- TIMING OPTIMIZATION
  - Send time optimization
  - Day-of-week effects
  - Time-of-day patterns
  - User-specific timing
- INTER-MESSAGE SPACING
  - Optimal gap duration
  - Urgency vs patience
  - Engagement decay
  - Re-engagement timing
- SURVIVAL MODELS FOR TIMING
  - Hazard functions
  - Cox proportional hazards
  - Accelerated failure time
  - Competing risks
- REAL-TIME VS BATCH
  - Trigger-based messaging
  - Scheduled campaigns
  - Hybrid approaches
  - Latency requirements
- AGENT APPLICATION GUIDANCE

**File 12: CSO_KB_Frequency_Fatigue_Management_v1.0.txt**
Target: 15,000-20,000 characters

Required sections:
- OPTIMAL FREQUENCY CURVES
  - Effective frequency research
  - Diminishing returns
  - Negative returns threshold
  - Channel-specific curves
- FATIGUE MODELING
  - Fatigue indicators
  - Cumulative exposure effects
  - Recovery dynamics
  - Individual variation
- CROSS-CHANNEL FREQUENCY
  - Unified frequency view
  - Channel substitution
  - Additive vs interactive effects
  - Platform-specific counting
- SUPPRESSION RULES
  - Hard caps
  - Soft caps with decay
  - Recency-based suppression
  - Event-triggered suppression
- COOLING-OFF PERIODS
  - Duration optimization
  - Segment-specific periods
  - Re-engagement triggers
  - Win-back timing
- MEASUREMENT AND MONITORING
  - Frequency distribution analysis
  - Fatigue detection signals
  - Real-time alerting
- AGENT APPLICATION GUIDANCE

**File 13: CSO_KB_Reinforcement_Learning_Marketing_v1.0.txt**
Target: 20,000-25,000 characters

Required sections:
- RL FORMULATION FOR MARKETING
  - MDP definition
  - State space design
  - Action space design
  - Reward engineering
- REWARD SHAPING
  - Immediate vs delayed rewards
  - Intermediate rewards
  - Negative rewards (costs)
  - Multi-objective rewards
- ALGORITHM SELECTION
  - Model-based vs model-free
  - On-policy vs off-policy
  - Batch RL considerations
  - Sample efficiency
- OFFLINE RL FOR MARKETING
  - Learning from logged data
  - Importance sampling
  - Conservative Q-learning
  - Behavioral cloning
- SAFE DEPLOYMENT
  - Exploration vs exploitation
  - Safety constraints
  - Gradual rollout
  - Fallback policies
- EVALUATION METHODS
  - Off-policy evaluation
  - A/B testing RL policies
  - Counterfactual estimation
- AGENT APPLICATION GUIDANCE

---

### PHASE 1D: SYSTEM ARCHITECTURE (5 files)
Location: release/v6.0/system/

**File 14: SYS_KB_Model_Orchestration_v1.0.txt**
Target: 15,000-20,000 characters

Required sections:
- ORCHESTRATION ARCHITECTURE
  - Centralized vs distributed
  - Shared services model
  - Embedded model pattern
  - Hybrid approaches
- DATA FLOW PATTERNS
  - Request-response
  - Event-driven
  - Pub-sub messaging
  - Batch pipelines
- MODEL VERSIONING
  - Version control strategies
  - A/B testing models
  - Canary deployments
  - Rollback procedures
- DEPENDENCY MANAGEMENT
  - Model dependencies
  - Data dependencies
  - Circular dependency prevention
  - Failure isolation
- EXECUTION SCHEDULING
  - Priority queuing
  - Resource allocation
  - Timeout handling
  - Retry logic
- AGENT APPLICATION GUIDANCE

**File 15: SYS_KB_Source_of_Truth_v1.0.txt**
Target: 15,000-20,000 characters

Required sections:
- SINGLE SOURCE PRINCIPLE
  - Authoritative data sources
  - Golden record concept
  - Master data management
- DECISION HORIZON VIEWS
  - Real-time operational view
  - Daily tactical view
  - Weekly strategic view
  - Quarterly planning view
- DATA GOVERNANCE
  - Ownership and stewardship
  - Quality standards
  - Access controls
  - Audit trails
- CONFLICT RESOLUTION
  - Source hierarchy
  - Temporal precedence
  - Confidence-based selection
  - Manual override
- SYNCHRONIZATION
  - Real-time sync
  - Batch reconciliation
  - Drift detection
  - Correction workflows
- AGENT APPLICATION GUIDANCE

**File 16: SYS_KB_Agent_Communication_v1.0.txt**
Target: 15,000-20,000 characters

Required sections:
- COMMUNICATION PATTERNS
  - Direct invocation
  - Message passing
  - Shared state
  - Event broadcasting
- MESSAGE CONTRACTS
  - Request format
  - Response format
  - Error handling
  - Versioning
- PROTOCOL DESIGN
  - Synchronous vs asynchronous
  - Streaming responses
  - Long-running operations
  - Idempotency
- ERROR HANDLING
  - Error classification
  - Retry strategies
  - Circuit breakers
  - Graceful degradation
- OBSERVABILITY
  - Distributed tracing
  - Logging standards
  - Metrics collection
  - Alerting
- AGENT APPLICATION GUIDANCE

**File 17: SYS_KB_Decision_Conflict_Resolution_v1.0.txt**
Target: 15,000-20,000 characters

Required sections:
- CONFLICT TYPES
  - Data conflicts
  - Recommendation conflicts
  - Priority conflicts
  - Resource conflicts
- DETECTION MECHANISMS
  - Automated detection
  - Threshold-based alerts
  - Pattern recognition
  - Human flagging
- RESOLUTION STRATEGIES
  - Rule-based resolution
  - Confidence-weighted voting
  - Hierarchical override
  - Consensus algorithms
- ESCALATION PATHS
  - Automated escalation
  - Human-in-the-loop
  - Time-based escalation
  - Severity-based routing
- GOVERNANCE PROCESS
  - Decision authority matrix
  - Approval workflows
  - Audit requirements
  - Post-decision review
- AGENT APPLICATION GUIDANCE

**File 18: SYS_KB_Continuous_Learning_v1.0.txt**
Target: 15,000-20,000 characters

Required sections:
- FEEDBACK LOOP ARCHITECTURE
  - Outcome capture
  - Attribution to decisions
  - Lag handling
  - Noise filtering
- MODEL RETRAINING
  - Trigger conditions
  - Training data selection
  - Validation requirements
  - Deployment gates
- DRIFT DETECTION
  - Data drift
  - Concept drift
  - Performance drift
  - Detection methods
- KNOWLEDGE ACCUMULATION
  - Learning from corrections
  - Edge case cataloging
  - Best practice extraction
  - Institutional memory
- EXPERIMENTATION INTEGRATION
  - A/B test learnings
  - Holdout insights
  - Causal learnings
  - Model calibration
- AGENT APPLICATION GUIDANCE

---

### PHASE 1E: CRITICAL ML FILES (7 files)
Locations vary - see each file

**File 19: ANL_KB_Causal_ML_Methods_v1.0.txt**
Location: release/v6.0/agents/anl/kb/
Target: 20,000-25,000 characters

Required sections:
- CATE ESTIMATION
  - Conditional Average Treatment Effect
  - Heterogeneous treatment effects
  - Subgroup analysis
- META-LEARNERS
  - S-Learner
  - T-Learner
  - X-Learner
  - R-Learner
  - DR-Learner
- CAUSAL FORESTS
  - Generalized random forests
  - Honest estimation
  - Variable importance
  - Confidence intervals
- DOUBLE MACHINE LEARNING
  - Orthogonalization
  - Cross-fitting
  - Nuisance parameter estimation
- UPLIFT MODELING
  - Response transformation
  - Class variable transformation
  - Two-model approach
  - Direct uplift methods
- MARKETING APPLICATIONS
  - Targeting optimization
  - Offer personalization
  - Budget allocation
- AGENT APPLICATION GUIDANCE

**File 20: ANL_KB_Bayesian_Methods_v1.0.txt**
Location: release/v6.0/agents/anl/kb/
Target: 20,000-25,000 characters

Required sections:
- BAYESIAN FUNDAMENTALS
  - Prior specification
  - Likelihood function
  - Posterior inference
  - Conjugate priors
- BAYESIAN A/B TESTING
  - Beta-Binomial model
  - Early stopping rules
  - Expected loss
  - Probability of best arm
- BAYESIAN MMM
  - Prior selection for media
  - Hierarchical priors
  - Posterior predictive checks
  - Model comparison
- MCMC METHODS
  - Metropolis-Hastings
  - Gibbs sampling
  - Hamiltonian Monte Carlo (HMC)
  - No-U-Turn Sampler (NUTS)
- TOOLS AND IMPLEMENTATION
  - Stan
  - PyMC
  - NumPyro
  - Comparison and selection
- AGENT APPLICATION GUIDANCE

**File 21: PRF_KB_Fraud_Detection_Methods_v1.0.txt**
Location: release/v6.0/agents/prf/kb/
Target: 20,000-25,000 characters

Required sections:
- FRAUD TAXONOMY
  - General Invalid Traffic (GIVT)
  - Sophisticated Invalid Traffic (SIVT)
  - Bot types and behaviors
  - Human fraud schemes
- STATISTICAL DETECTION
  - Benfords Law
  - Z-score anomalies
  - Distribution analysis
  - Time series patterns
- MACHINE LEARNING DETECTION
  - Isolation Forest
  - Random Forest classifiers
  - LSTM for sequences
  - Autoencoder anomalies
- CHANNEL-SPECIFIC PATTERNS
  - Display fraud signals
  - Video fraud signals
  - Mobile fraud signals
  - CTV fraud signals
  - Search fraud signals
- VENDOR INTEGRATION
  - IAS methodology
  - DoubleVerify methodology
  - MOAT methodology
  - Vendor comparison
- REMEDIATION WORKFLOWS
  - Detection to action
  - Refund processes
  - Blocking strategies
  - Vendor management
- AGENT APPLICATION GUIDANCE

**File 22: PRF_KB_Unified_Measurement_Framework_v1.0.txt**
Location: release/v6.0/agents/prf/kb/
Target: 20,000-25,000 characters

Required sections:
- FRAMEWORK OVERVIEW
  - Three pillars (MMM, MTA, Incrementality)
  - Complementary strengths
  - Coverage gaps
  - Integration philosophy
- TRIANGULATION METHODOLOGY
  - Cross-validation approach
  - Discrepancy investigation
  - Weighted synthesis
  - Confidence scoring
- MMM INTEGRATION
  - Elasticity extraction
  - Saturation curves
  - Adstock parameters
  - Confidence intervals
- MTA INTEGRATION
  - Channel attribution
  - Path analysis
  - Real-time signals
  - Granular insights
- INCREMENTALITY INTEGRATION
  - Lift calibration
  - Prior updating
  - Validation layer
  - Ground truth anchoring
- GOVERNANCE FRAMEWORK
  - When to trust which source
  - Decision rules by context
  - Override protocols
  - Stakeholder communication
- AGENT APPLICATION GUIDANCE

**File 23: PRF_KB_Incrementality_Testing_Advanced_v1.0.txt**
Location: release/v6.0/agents/prf/kb/
Target: 20,000-25,000 characters

Required sections:
- SYNTHETIC CONTROL DEEP DIVE
  - Donor pool construction
  - Pre-period matching
  - RMSPE minimization
  - Inference and p-values
  - Placebo tests
- MATCHED MARKETS DEEP DIVE
  - Covariate selection
  - Matching algorithms
  - Balance diagnostics
  - Sensitivity analysis
- POWER ANALYSIS
  - Effect size estimation
  - Sample size calculation
  - Duration optimization
  - Power curves
- BAYESIAN APPROACHES
  - Bayesian synthetic control
  - Bayesian structural time series
  - CausalImpact methodology
  - Prior specification
- CONTAMINATION AND SPILLOVER
  - Geographic spillover
  - Digital spillover
  - Contamination detection
  - Adjustment methods
- AGENT APPLICATION GUIDANCE

**File 24: AUD_KB_ML_Propensity_Models_v1.0.txt**
Location: release/v6.0/agents/aud/kb/
Target: 20,000-25,000 characters

Required sections:
- PROPENSITY MODELING FUNDAMENTALS
  - Binary classification setup
  - Target definition
  - Observation window
  - Prediction horizon
- ALGORITHM SELECTION
  - Logistic regression baseline
  - XGBoost and LightGBM
  - Neural networks
  - Ensemble methods
- FEATURE ENGINEERING
  - Behavioral features
  - Transactional features
  - Demographic features
  - Temporal features
  - Interaction features
- MODEL CALIBRATION
  - Platt scaling
  - Isotonic regression
  - Temperature scaling
  - Calibration curves
- THRESHOLD OPTIMIZATION
  - Cost-sensitive thresholds
  - Precision-recall tradeoff
  - Business objective alignment
  - Segment-specific thresholds
- DEPLOYMENT CONSIDERATIONS
  - Batch vs real-time
  - Score refresh frequency
  - Monitoring and alerting
  - Retraining triggers
- AGENT APPLICATION GUIDANCE

**File 25: AUD_KB_Entity_Resolution_v1.0.txt**
Location: release/v6.0/agents/aud/kb/
Target: 15,000-20,000 characters

Required sections:
- ENTITY RESOLUTION PIPELINE
  - Data preparation
  - Blocking/indexing
  - Pairwise comparison
  - Classification
  - Clustering
- BLOCKING STRATEGIES
  - Standard blocking
  - Sorted neighborhood
  - Q-gram indexing
  - LSH blocking
  - Canopy clustering
- COMPARISON AND CLASSIFICATION
  - Similarity functions
  - Rule-based classification
  - ML classification
  - Active learning
- CLUSTERING METHODS
  - Connected components
  - Correlation clustering
  - Hierarchical clustering
  - Probabilistic clustering
- ER PLATFORMS
  - Senzing
  - Tamr
  - Quantexa
  - Custom solutions
- QUALITY MEASUREMENT
  - Precision and recall
  - F-measure
  - Pair completeness
  - Reduction ratio
- AGENT APPLICATION GUIDANCE

---

## EXECUTION INSTRUCTIONS

1. START with File 1 (AUD_KB_Identity_Graph_Algorithms_v1.0.txt)
2. Create COMPLETE file with all required sections (15,000-25,000 chars)
3. Save to local repo using Desktop Commander
4. Run validation script
5. Commit and push to remote
6. Report completion
7. Proceed to next file
8. REPEAT until all 25 files complete

## PROGRESS TRACKING

After each file, report:
- File number and name
- Character count
- Validation status (PASS/FAIL)
- Commit hash
- Any issues encountered

## IMPORTANT NOTES

- VS Code is creating 71 files in parallel on same branch
- Pull before push if conflicts arise
- Never truncate content - complete files only
- Target 15,000-25,000 characters per file
- All files must pass 6-rule validation

## START NOW

Begin with File 1: AUD_KB_Identity_Graph_Algorithms_v1.0.txt

Create the complete file, save it, validate it, commit and push, then proceed to File 2.
