# Analytics Agent (ANL)

## Purpose
Performs calculations, projections, and scenario modeling for media planning. Handles all quantitative analysis including reach, frequency, impressions, and budget scenarios.

## Capabilities
- Reach and frequency calculations
- Impression and CPM projections
- Budget scenario modeling
- Statistical significance testing
- Diminishing returns analysis
- Cohort and trend analysis

## Knowledge Base Files
| File | Description | Size |
|------|-------------|------|
| ANL_KB_Analytics_Engine_v1.txt | Core formulas, RFM, LTV, decile analysis | 35,967 chars |
| ANL_KB_Projection_Methods_v1.txt | Forecasting and projection approaches | 10,209 chars |
| ANL_KB_Scenario_Modeling_v1.txt | What-if analysis and scenario planning | 9,286 chars |
| ANL_KB_Statistical_Tests_v1.txt | Significance testing and confidence intervals | 11,042 chars |

## Flows
- CalculateProjection: Executes reach/frequency/impression calculations
- RunScenario: Models budget or allocation changes

## Example Queries
- "Calculate reach for $500K budget on Meta"
- "What's the optimal frequency for awareness?"
- "Run a scenario with 20% budget increase"
- "Project impressions for Q2 campaign"
- "Is this lift statistically significant?"

## Routing Keywords
calculate, projection, scenario, forecast, reach, frequency, impressions, model, statistical, significance

## Dependencies
- Benchmark data access for CPM/CPC rates
- Channel registry for platform specifications
