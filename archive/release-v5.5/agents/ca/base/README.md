# Consulting Agent (CA) - Base Components

## Overview

The Consulting Agent (CA) provides strategic consulting guidance and deliverable generation capabilities. This folder will contain the base components shared across all environments.

## Status

**Version:** 5.5 (Placeholder)
**Status:** Pending Implementation

## Planned Structure

```
/base/
├── /kb/               ← Knowledge base files (.txt)
│   ├── CA_Core_Instructions_v5_5.txt
│   ├── CA_Methodology_Framework_v5_5.txt
│   └── ... (additional KB files)
├── /copilot/          ← Copilot Studio instructions
│   └── CA_v55_Instructions.txt
├── /flows/            ← Power Automate flow definitions
│   ├── /definitions/
│   └── /specs/
├── /functions/        ← Azure Functions
│   └── /ca_functions/
├── /schema/           ← Dataverse table schemas
│   └── /tables/
├── /cards/            ← Adaptive Card templates
├── /templates/        ← Document templates
├── /data/             ← Seed data
│   └── /seed/
└── /docs/             ← CA-specific documentation
```

## Planned Capabilities

The CA agent will support:

- Strategic consulting frameworks
- Deliverable generation (reports, presentations)
- Research synthesis
- Recommendation development
- Stakeholder communication support

## Dependencies

The CA agent requires:

- EAP Core (session management, feature flags)
- SharePoint document library for KB
- Azure Functions for document generation
- Dataverse tables for data storage

## Implementation Timeline

To be determined based on MPA production deployment validation.

## Related Documentation

- [Platform Architecture](../../docs/PLATFORM_ARCHITECTURE.md)
- [Deployment Guide](../../docs/DEPLOYMENT_GUIDE.md)
- [MPA Base Components](../mpa/base/README.md) - Reference implementation
