# Consulting Agent (CA)

Strategic consulting AI agent providing framework-based analysis, industry benchmarks, and deliverable generation.

## Version

- **Agent Version:** 12.0
- **Platform Version:** 5.5
- **Last Updated:** January 2026

## Directory Structure

```
ca/
├── base/                          # Core agent components
│   ├── kb/                        # Knowledge base (36 files)
│   │   ├── FRAMEWORK_*.txt        # Consulting frameworks
│   │   ├── REFERENCE_*.txt        # Reference materials
│   │   ├── REGISTRY_*.txt         # Benchmark registries
│   │   ├── BEHAVIORAL_*.txt       # Behavioral guidelines
│   │   └── KB_INDEX.txt           # File index
│   ├── schema/
│   │   ├── tables/                # Dataverse tables (9)
│   │   └── flows/                 # Power Automate flows (8)
│   ├── copilot/                   # Microsoft Copilot config
│   └── functions/                 # Azure functions (3)
└── extensions/
    └── mastercard/                # Mastercard deployment
        └── instructions/          # RAG-optimized instructions
```

## Components

### Knowledge Base (36 files)

| Category | Count | Purpose |
|----------|-------|---------|
| Framework | 5 | Consulting framework definitions and comparison logic |
| Reference | 12 | Industry-specific reference data |
| Registry | 5 | Benchmarks and URL registries |
| Behavioral | 2 | Agent behavior and routing |
| Quality | 6 | Confidence levels and quality tiers |
| Other | 6 | Analysis formats and customization guides |

### Database Tables (9)

- `ca_consulting_sessions` - Session tracking
- `ca_analysis` - Analysis records
- `ca_recommendations` - Generated recommendations
- `ca_deliverables` - Formal deliverable documents
- `ca_benchmarks` - Industry benchmark data
- `ca_frameworks` - Framework definitions
- `ca_framework_applications` - Framework usage tracking
- `ca_client_engagements` - Client engagement history
- `ca_learning_resources` - Insights for KB improvement

### Power Automate Flows (8)

| Flow ID | Name | Purpose |
|---------|------|---------|
| flow_50 | consulting_initialize_session | Initialize session context |
| flow_51 | consulting_get_session | Retrieve session details |
| flow_52 | consulting_search_frameworks | Search framework library |
| flow_53 | consulting_create_analysis | Create analysis record |
| flow_54 | consulting_create_recommendation | Create recommendation |
| flow_55 | consulting_search_benchmarks | Query benchmark data |
| flow_56 | consulting_create_deliverable | Generate deliverable |
| flow_57 | consulting_promote_learning | Store insights for learning |

### Azure Functions (3)

- `generate.ts` - Document generation
- `research.ts` - KB and web research
- `validate.ts` - Input validation

## Deployment

### Mastercard Deployment

Uses RAG-optimized instructions located at:
`extensions/mastercard/instructions/CA_RAG_OPTIMIZED_INSTRUCTIONS.txt`

Key features:
- 32 consulting frameworks
- 7 industry verticals
- 4-step workflow (Greeting, Assessment, Framework Selection, Delivery)
- Session continuity with handoff documents

### Prerequisites

1. Enterprise AI Platform (EAP) core tables deployed
2. SharePoint site for KB file storage
3. Power Automate premium connectors
4. Azure Functions runtime

## KB File Format (6-Rule Compliance)

All KB files follow the 6-Rule format:
1. Plain text only (no markdown tables)
2. UTF-8 encoding
3. Section headers in CAPS
4. One concept per line
5. No code blocks
6. Under 50KB per file

## Migration Notes

Migrated from: `/Consulting_Agent/kb/` (V12)
Migration date: January 2026
Previous versions archived in source repository.
