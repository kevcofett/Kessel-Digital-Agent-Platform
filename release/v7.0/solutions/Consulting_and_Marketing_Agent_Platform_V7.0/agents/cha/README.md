# Channel Agent (CHA)

## Purpose
Recommends optimal channel combinations and budget allocations. Provides expertise on platform capabilities, benchmarks, and media mix optimization.

## Capabilities
- Channel mix recommendations by objective
- Budget allocation across channels
- Vertical-specific playbooks (B2B, ecommerce, CPG, DTC)
- Benchmark lookup and application
- Funnel-based channel mapping
- ADIS segment channel affinity

## Knowledge Base Files
| File | Description | Size |
|------|-------------|------|
| CHA_KB_Channel_Registry_v7.0.txt | 43 channels with codes, CPM/CPC ranges | 13,142 chars |
| CHA_KB_Channel_Playbooks_v7.0.txt | Funnel mapping, synergy effects, vertical guides | 9,907 chars |
| CHA_KB_Allocation_Methods_v7.0.txt | Budget formulas, optimization, reallocation | 10,101 chars |

## Flows
- LookupBenchmarks: Retrieves vertical and channel-specific benchmarks
- CalculateAllocation: Distributes budget across recommended channels

## Example Queries
- "Recommend channel mix for ecommerce brand"
- "What's the minimum budget for CTV?"
- "Allocate $1M across awareness and conversion"
- "Which channels work best for B2B?"
- "What are typical CPMs for programmatic display?"

## Routing Keywords
channel, allocation, budget, mix, platform, cpm, cpc, benchmark, funnel, awareness, conversion

## Dependencies
- Benchmark data in Dataverse
- Vertical context from session
