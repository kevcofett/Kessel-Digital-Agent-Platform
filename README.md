# Kessel-Digital-Agent-Platform

Enterprise AI Agent Platform for Microsoft Power Platform and Copilot Studio.

## Overview

This repository contains the complete v5.5 release package for the Kessel Digital agent ecosystem, including:

- **EAP (Enterprise AI Platform)** - Shared infrastructure, session management, extensibility framework
- **MPA (Media Planning Agent)** - AI-powered media planning and campaign development
- **CA (Consulting Agent)** - Strategic consulting and advisory services (placeholder)

## Repository Structure

```
/release/v5.5/
├── /platform/                    # Shared infrastructure (EAP)
│   ├── /config/                  # Environment and feature flag templates
│   ├── /eap-core/
│   │   ├── /base/                # Shared across all environments
│   │   └── /extensions/          # Environment-specific additions
│   └── /security/
│       ├── /base/                # Core security patterns
│       └── /extensions/          # Environment-specific security
│
├── /agents/
│   ├── /mpa/
│   │   ├── /base/                # Core MPA (shared)
│   │   └── /extensions/          # Environment-specific MPA
│   ├── /ca/
│   │   ├── /base/                # Core CA (placeholder)
│   │   └── /extensions/          # Environment-specific CA
│   └── /agent-template/          # Template for new agents
│
└── /docs/                        # Platform-wide documentation
```

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Canonical v5.5 source of truth |
| `deploy/personal` | Kessel-Digital personal environment (Aragorn AI) |
| `deploy/corporate` | Corporate managed environment |

## Base vs Extensions Pattern

### /base/ Folders
- Shared across ALL environments
- Changes can be cherry-picked between branches
- Must maintain cross-environment compatibility

### /extensions/ Folders
- Environment-specific additions
- Stay in their respective branches
- Never merged back to main

See `PLATFORM_ARCHITECTURE.md` for detailed documentation.

## Quick Start

1. Clone this repository
2. Copy `release/v5.5/platform/config/environment.template.json` to `environment.json`
3. Fill in your environment-specific values
4. Follow `release/v5.5/docs/DEPLOYMENT_GUIDE.md`

## Version

- **Platform Version:** 5.5
- **Release Date:** January 2026
- **Status:** Production Ready

## License

Proprietary - Kessel Digital LLC
