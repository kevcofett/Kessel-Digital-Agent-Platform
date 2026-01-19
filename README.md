# Kessel Digital Agent Platform (KDAP)

[![Version](https://img.shields.io/badge/version-6.0-blue.svg)](./release/v6.0/CHANGELOG.md)
[![Agents](https://img.shields.io/badge/agents-11-green.svg)](#agents)
[![Platform](https://img.shields.io/badge/platform-Microsoft%20Power%20Platform-purple.svg)](https://powerplatform.microsoft.com/)

An enterprise AI agent platform built on Microsoft Power Platform, featuring specialized agents for media planning, marketing strategy, and business consulting.

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/kevcofett/Kessel-Digital-Agent-Platform.git

# Choose your deployment branch
git checkout deploy/personal    # For Aragorn AI environment
git checkout deploy/mastercard  # For Mastercard environment

# Follow deployment guide
cat docs/DEPLOYMENT_GUIDE.md
```

---

## 📋 Platform Overview

KDAP consists of **11 specialized AI agents** organized into two solution domains:

### MPA (Media Planning Agent) Solution
| Agent | Code | Description |
|-------|------|-------------|
| Orchestrator | ORC | Routes requests to specialist agents |
| Analytics | ANL | Calculations, projections, statistical analysis |
| Audience | AUD | Segmentation, targeting, customer value modeling |
| Channel | CHA | Channel strategy, allocation, media mix |
| Performance | PRF | Campaign monitoring, optimization, reporting |
| Supply Path | SPO | Supply path optimization, ad tech strategy |
| Document | DOC | Media plan generation, presentation creation |
| Marketing | MKT | Campaign strategy, creative briefs, brand positioning |

### CA (Consulting Agent) Solution
| Agent | Code | Description |
|-------|------|-------------|
| Strategy | CST | Strategic frameworks, business analysis |
| Change Management | CHG | Transformation planning, stakeholder alignment |

---

## 📁 Repository Structure

```
Kessel-Digital-Agent-Platform/
├── base/                      # Shared base components
│   ├── agents/               # Agent KB files (source of truth)
│   ├── dataverse/            # Schema and seed data
│   └── platform/             # EAP core components
├── release/
│   ├── v6.0/                 # Current release
│   │   ├── agents/           # Agent-specific files
│   │   ├── verticals/        # Industry vertical overlays
│   │   └── docs/             # Release documentation
│   └── v5.5/                 # Previous release (archived)
├── src/
│   ├── adaptive-cards/       # Copilot UI card templates
│   ├── benchmarks/           # Real-time benchmark connectors
│   ├── decision-tree-ui/     # Visual workflow components
│   └── ml-training/          # ML model training pipelines
├── deploy/                   # Deployment scripts
├── docs/                     # Platform documentation
└── tests/                    # Test suites
```

---

## 🔧 Technology Stack

| Layer | Technology |
|-------|------------|
| AI Orchestration | Microsoft Copilot Studio |
| Data | Dataverse |
| Automation | Power Automate |
| Compute | Azure Functions |
| Knowledge | SharePoint |
| ML | Azure Machine Learning |

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Architecture](./PLATFORM_ARCHITECTURE.md) | System design and patterns |
| [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) | Step-by-step deployment |
| [Agent Reference](./docs/AGENT_REFERENCE.md) | Agent capabilities and KB inventory |
| [API Reference](./docs/API_REFERENCE.md) | Azure Functions and connectors |
| [ML Models](./docs/ML_MODELS.md) | Machine learning components |

---

## 🏭 Deployment Environments

| Environment | Branch | Description |
|-------------|--------|-------------|
| Personal | `deploy/personal` | Aragorn AI (Kessel Digital) |
| Corporate | `deploy/mastercard` | Mastercard deployment |
| Development | `main` | Source of truth |

---

## 🧪 Testing

```bash
# Run ML model tests
cd src/ml-training && pytest

# Run benchmark connector tests
cd src/benchmarks && npm test

# Run e2e tests (requires environment)
cd tests/e2e && pytest --env=personal
```

---

## 📊 Agent Capabilities

### ANL (Analytics Agent)
- ROAS, CAC, LTV calculations
- Marketing Mix Modeling (MMM)
- Incrementality testing
- Budget optimization
- Scenario modeling

### AUD (Audience Agent)
- Customer segmentation
- Propensity scoring
- Lookalike modeling
- Lifetime value prediction
- Churn prediction

### CHA (Channel Agent)
- Channel selection
- Media mix optimization
- Platform-specific playbooks
- Cross-channel attribution

### PRF (Performance Agent)
- Real-time monitoring
- Anomaly detection
- A/B test analysis
- Performance optimization

---

## 🏢 Vertical Support

KDAP includes industry-specific overlays:

| Vertical | Compliance | Key Features |
|----------|------------|--------------|
| Financial Services | Fair lending, GLBA | Risk-aware targeting, compliance guardrails |
| Healthcare | HIPAA, PHI protection | Privacy-first measurement, compliant audiences |
| B2B | Account-based | ABM integration, sales alignment |
| Retail | PCI awareness | Omnichannel attribution, seasonality |

---

## 📈 ML Models

| Model | Purpose | Training Data |
|-------|---------|---------------|
| Churn Predictor | Customer retention risk | Customer behavior signals |
| Media Mix Model | Channel contribution | Spend and outcome time series |
| Lookalike Model | Audience expansion | Seed audience profiles |
| Response Curve | Diminishing returns | Spend vs. outcome data |
| Budget Optimizer | Allocation optimization | Multi-channel scenarios |
| Propensity Model | Conversion likelihood | User features |
| Anomaly Detector | Performance alerts | Time series metrics |

---

## 🔐 Security

- Azure AD authentication
- Role-based access control
- Data isolation by session
- No PII in knowledge base
- Audit logging

---

## 📄 License

Proprietary - Kessel Digital © 2024-2026

---

## 🤝 Contributing

1. Create feature branch from `main`
2. Follow 6-Rule Compliance for Copilot docs
3. Run validation suite
4. Submit PR with test results

---

## 📞 Support

- **Technical Issues**: Create GitHub issue
- **Deployment Help**: See [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
- **Architecture Questions**: See [Platform Architecture](./PLATFORM_ARCHITECTURE.md)
