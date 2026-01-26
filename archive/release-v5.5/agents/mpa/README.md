# MPA Folder Structure

## Overview

This folder contains the Media Planning Agent (MPA) with an optimized structure for multi-environment deployment.

## Directory Structure

```
mpa/
├── base/                    # SHARED - Single source of truth
│   ├── instructions/        # Active Copilot instructions
│   │   └── MPA_Copilot_Instructions_v6_5.txt
│   ├── kb/                  # Knowledge base files (43 files)
│   ├── adis/                # Audience Data Intelligence System
│   ├── copilot/             # Copilot Studio topics and config
│   ├── flows/               # Power Automate flow definitions
│   ├── functions/           # Azure Functions
│   ├── schema/              # Dataverse schema definitions
│   ├── seed-data-v6/        # Reference data seed files
│   ├── tests/               # Test suite and evaluation
│   ├── cards/               # Adaptive card templates
│   ├── templates/           # Document templates
│   ├── docs/                # Technical documentation
│   └── rag/                 # RAG configuration
│
├── environments/            # ENVIRONMENT-SPECIFIC CONFIG ONLY
│   ├── personal/            # Aragorn AI (Kessel Digital)
│   │   ├── config.json      # Environment configuration
│   │   ├── COPILOT_TOPICS.md
│   │   ├── dataverse/       # Env-specific Dataverse config
│   │   ├── flows/           # Env-specific flow overrides
│   │   └── sharepoint/      # Env-specific SharePoint config
│   │
│   └── mastercard/          # Mastercard corporate
│       ├── config.json      # Environment configuration
│       ├── COPILOT_TOPICS.md
│       ├── dataverse/       # Env-specific Dataverse config
│       ├── flows/           # Env-specific flow overrides
│       └── sharepoint/      # Env-specific SharePoint config
│
├── extensions/              # Future: Corporate extensions
│
└── archive/                 # Historical versions
    ├── instructions/        # Old instruction versions
    └── kb/                  # Old KB versions
```

## Cherry-Pick Deployment

To deploy to a new environment:

1. Copy entire `base/` folder to target
2. Copy `environments/{env}/` folder to target
3. Update `config.json` with environment-specific values
4. Deploy

To switch between environments:
- Only `environments/{env}/config.json` values change
- All `base/` content is identical across environments

## Key Files

| File | Purpose |
|------|---------|
| `base/instructions/MPA_Copilot_Instructions_v6_5.txt` | Active Copilot instructions (7,965 chars) |
| `environments/{env}/config.json` | Environment-specific configuration |
| `base/kb/*.txt` | Knowledge base files for SharePoint |

## Version History

- **v6.5** (Current): v6.4 + restored AUDIENCE DIMENSION, ADAPTIVE RIGOR, SHARED ACCOUNTABILITY
- **v6.4**: ADIS integration, MANDATORY RESPONSE ELEMENTS, PROACTIVE INTELLIGENCE
- **v6.1-v6.3**: Iterative improvements
- **v5.x**: Archived in `archive/instructions/`
