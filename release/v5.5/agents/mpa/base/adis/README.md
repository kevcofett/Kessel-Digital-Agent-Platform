# ADIS - Audience Data Intelligence System

Version 1.0 | January 2026

## Overview

ADIS enables customer data ingestion and ML-powered audience segmentation for the Media Planning Agent (MPA). The system transforms uploaded customer data into actionable audience segments that inform channel selection and budget allocation through the AMMO (Audience-Aware Media Mix Optimization) framework.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           COPILOT STUDIO                                     │
│                    (Conversation Interface)                                  │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         POWER AUTOMATE FLOWS                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ File Upload  │  │ Run Analysis │  │Create Audience│  │ Optimize     │    │
│  │    Flow      │  │    Flow      │  │    Flow      │  │ Budget Flow  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AZURE FUNCTIONS                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Document    │  │  Analysis    │  │   Audience   │  │    AMMO      │    │
│  │   Parser     │  │   Engine     │  │   Manager    │  │ Optimizer    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATAVERSE                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│  │Upload Jobs │ │Data Schemas│ │Customer    │ │Model Runs  │               │
│  │            │ │            │ │Records     │ │            │               │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘               │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│  │Model       │ │Audiences   │ │Audience    │ │Campaign    │               │
│  │Outputs     │ │            │ │Rules       │ │Audiences   │               │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
adis/
├── schema/                     # Dataverse table definitions
│   ├── ADIS_Schema_v1.json
│   ├── ADIS_Schema_v1_Part2.json
│   └── ADIS_Schema_v1_Part3.json
├── functions/                  # Azure Functions
│   ├── document-parser/
│   │   ├── function_app.py
│   │   └── requirements.txt
│   ├── analysis-engine/
│   │   ├── function_app.py
│   │   └── requirements.txt
│   ├── audience-manager/
│   │   ├── function_app.py
│   │   └── requirements.txt
│   └── ammo/
│       ├── function_app.py
│       └── requirements.txt
├── flows/                      # Power Automate definitions
│   ├── ADIS_FileUpload_Flow.json
│   ├── ADIS_RunAnalysis_Flow.json
│   ├── ADIS_CreateAudience_Flow.json
│   └── ADIS_OptimizeBudget_Flow.json
├── docs/                       # Knowledge Base documents
│   ├── ADIS_User_Guide_v1.txt
│   ├── ADIS_Model_Catalog_v1.txt
│   ├── ADIS_Schema_Reference_v1.txt
│   └── ADIS_Copilot_Integration_v1.txt
├── seed-data/                  # Reference data
│   ├── mpa_model_catalog_seed.csv
│   ├── mpa_channel_affinity_seed.csv
│   ├── mpa_channel_benchmark_seed.csv
│   └── mpa_rfm_segment_seed.csv
├── tests/                      # Test suite
│   └── test_adis.py
└── README.md
```

## Components

### Document Parser
Parses uploaded files (Excel, CSV, Word, PDF, PowerPoint) and infers column semantics.

**Supported File Types:**
- XLSX, XLS (Excel)
- CSV
- DOCX (Word with tables)
- PDF (with extractable tables)
- PPTX (PowerPoint with tables)

**Schema Detection:**
- CUSTOMER_ID, TRANSACTION_ID, EMAIL, PHONE
- DATE, CURRENCY, CATEGORY, NUMERIC, TEXT
- ENGAGEMENT_SCORE, LOYALTY_TIER, LOCATION

### Analysis Engine
Executes analytical models on customer data.

**Available Models:**
| Model | Category | Library | Min Records |
|-------|----------|---------|-------------|
| RFM | Segmentation | pandas | 100 |
| Decile | Customer Value | pandas | 50 |
| Cohort | Segmentation | pandas | 200 |
| Deterministic CLV | Customer Value | pandas | 100 |
| Probabilistic CLV | Customer Value | lifetimes | 500 |
| K-Means Clustering | Clustering | scikit-learn | 500 |

### Audience Manager
Creates and manages audience definitions from model outputs.

**Features:**
- Rule-based filtering with 12 operators
- Automatic channel recommendations
- Use case suggestions
- Platform export (CSV, Google Ads, Meta, TTD)

### AMMO Optimizer
Audience-Aware Media Mix Optimization for budget allocation.

**Capabilities:**
- Channel affinity scoring by segment
- Constrained budget optimization
- Scenario analysis
- Current vs optimized comparison

## Dataverse Tables

| Table | Purpose |
|-------|---------|
| mpa_upload_job | Track file processing |
| mpa_data_schema | Store detected column types |
| mpa_customer_record | Normalized customer data |
| mpa_model_run | Analysis execution tracking |
| mpa_model_output | Per-customer model results |
| mpa_audience | Audience definitions |
| mpa_audience_rule | Filtering rules |
| mpa_audience_member | Customer-audience mapping |
| mpa_campaign_audience | Campaign linkage |
| mpa_performance_linkage | Actual performance data |
| mpa_model_catalog | Available model reference |

## Environment Considerations

### Personal (Aragorn AI)
- Full model availability
- External API access
- Web search for benchmarks
- Standard Azure Functions

### Mastercard
- Pre-approved libraries only
- No external API access
- Pre-loaded benchmarks
- PII hashing required
- Managed tenant boundaries

## Deployment

### Prerequisites
- Azure Functions (Consumption or Premium)
- Dataverse environment
- Power Automate premium connectors
- Copilot Studio license

### Steps
1. Create Dataverse tables from schema definitions
2. Deploy Azure Functions
3. Import Power Automate flows
4. Update function URLs in flow parameters
5. Import seed data
6. Update Copilot knowledge base

## Testing

Run the test suite:
```bash
cd release/v5.5/agents/mpa/base/adis/tests
pytest test_adis.py -v
```

## Dependencies

**Document Parser:**
- azure-functions
- pandas
- openpyxl
- python-docx
- python-pptx
- PyMuPDF

**Analysis Engine:**
- azure-functions
- pandas
- numpy
- scikit-learn
- lifetimes
- scipy

**Audience Manager:**
- azure-functions
- pandas
- numpy

**AMMO:**
- azure-functions
- pandas
- numpy
- scipy

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-16 | Initial release |

## Related Documentation

- MPA_Copilot_Instructions_v5_7.txt
- Analytics_Engine_v5_1.txt
- KB_02_Audience_Targeting_Sophistication_v5_8.txt
