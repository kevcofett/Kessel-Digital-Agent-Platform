# MASTERCARD CONSULTING & MARKETING AGENT PLATFORM (MCMAP)
# MASTERCARD DEPLOYMENT - DATA ARCHITECTURE & GOVERNANCE

**Document:** 05-MCMAP_Data_Architecture.md  
**Version:** 1.0  
**Date:** January 23, 2026  
**Classification:** Mastercard Internal  
**Status:** Production Ready  
**Audience:** Data Architects, Database Administrators, Governance Teams

---

## TABLE OF CONTENTS

1. [Data Architecture Overview](#1-data-architecture-overview)
2. [Dataverse Schema](#2-dataverse-schema)
3. [Table Specifications](#3-table-specifications)
4. [Data Relationships](#4-data-relationships)
5. [Data Flows](#5-data-flows)
6. [Data Governance](#6-data-governance)
7. [Data Quality](#7-data-quality)
8. [Seed Data Management](#8-seed-data-management)
9. [Backup & Recovery](#9-backup--recovery)

---


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

## 1. DATA ARCHITECTURE OVERVIEW

### 1.1 Data Architecture Diagram

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                      MCMAP DATA ARCHITECTURE                                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚                        DATAVERSE (Primary Store)                       â”‚ â”‚
â”‚  â”‚                                                                        â”‚ â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”‚ â”‚
â”‚  â”‚  â”‚     EAP PLATFORM TABLES     â”‚  â”‚     MPA DOMAIN TABLES       â”‚     â”‚ â”‚
â”‚  â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚     â”‚ â”‚
â”‚  â”‚  â”‚  â”‚ eap_agent             â”‚  â”‚  â”‚  â”‚ mpa_channel           â”‚  â”‚     â”‚ â”‚
â”‚  â”‚  â”‚  â”‚ eap_capability        â”‚  â”‚  â”‚  â”‚ mpa_kpi               â”‚  â”‚     â”‚ â”‚
â”‚  â”‚  â”‚  â”‚ eap_capability_impl   â”‚  â”‚  â”‚  â”‚ mpa_benchmark         â”‚  â”‚     â”‚ â”‚
â”‚  â”‚  â”‚  â”‚ eap_prompt            â”‚  â”‚  â”‚  â”‚ mpa_vertical          â”‚  â”‚     â”‚ â”‚
â”‚  â”‚  â”‚  â”‚ eap_test_case         â”‚  â”‚  â”‚  â”‚ mpa_partner           â”‚  â”‚     â”‚ â”‚
â”‚  â”‚  â”‚  â”‚ eap_telemetry         â”‚  â”‚  â”‚  â”‚ mpa_session           â”‚  â”‚     â”‚ â”‚
â”‚  â”‚  â”‚  â”‚ eap_environment_configâ”‚  â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚     â”‚ â”‚
â”‚  â”‚  â”‚  â”‚ eap_session           â”‚  â”‚  â”‚                             â”‚     â”‚ â”‚
â”‚  â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚  â”‚                             â”‚     â”‚ â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â”‚ â”‚
â”‚  â”‚                                                                        â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                     â”‚                                        â”‚
â”‚                                     â”‚                                        â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚                    SHAREPOINT (Knowledge Store)                      â”‚    â”‚
â”‚  â”‚                                                                      â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚    â”‚
â”‚  â”‚  â”‚                    KNOWLEDGE BASE LIBRARY                      â”‚ â”‚    â”‚
â”‚  â”‚  â”‚  - Agent Instructions (10 files)                               â”‚ â”‚    â”‚
â”‚  â”‚  â”‚  - Core KB Files (10 files)                                    â”‚ â”‚    â”‚
â”‚  â”‚  â”‚  - Deep Module KB Files (17+ files)                            â”‚ â”‚    â”‚
â”‚  â”‚  â”‚  - EAP Shared KB Files (6 files)                               â”‚ â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚    â”‚
â”‚  â”‚                                                                      â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 1.2 Data Store Summary

| Store | Technology | Purpose | Data Type |
|-------|------------|---------|-----------|
| **Dataverse** | Microsoft Dataverse | Primary structured data | Configuration, sessions, telemetry, reference data |
| **SharePoint** | SharePoint Online | Knowledge content | Unstructured KB documents |

### 1.3 Table Inventory

| Category | Table Count | Purpose |
|----------|-------------|---------|
| EAP Platform | 8 | Agent registry, capabilities, telemetry |
| EAP Security (ABAC) | 4 | User profiles, access rules, security config |
| MPA Domain | 6 | Channel, KPI, benchmark reference data |
| **TOTAL** | **18** | |

---


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

## 2. DATAVERSE SCHEMA

### 2.1 Schema Overview

```
DATAVERSE SCHEMA DIAGRAM

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                          â”‚
â”‚  â”‚   eap_agent      â”‚â—„â”€â”€â”€â”€â”€â”€â”€â”€â”‚  eap_capability  â”‚                          â”‚
â”‚  â”‚                  â”‚   1:N   â”‚                  â”‚                          â”‚
â”‚  â”‚  - agent_code PK â”‚         â”‚  - capability_id â”‚                          â”‚
â”‚  â”‚  - agent_name    â”‚         â”‚  - agent_code FK â”‚                          â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜         â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                          â”‚
â”‚                                        â”‚                                     â”‚
â”‚                                        â”‚ 1:N                                 â”‚
â”‚                                        â–¼                                     â”‚
â”‚                            â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                         â”‚
â”‚                            â”‚ eap_capability_impl  â”‚                         â”‚
â”‚                            â”‚                      â”‚                         â”‚
â”‚                            â”‚ - implementation_id  â”‚                         â”‚
â”‚                            â”‚ - capability_code FK â”‚                         â”‚
â”‚                            â”‚ - environment_code   â”‚                         â”‚
â”‚                            â”‚ - implementation_typeâ”‚                         â”‚
â”‚                            â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                         â”‚
â”‚                                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                          â”‚
â”‚  â”‚   eap_prompt     â”‚         â”‚  eap_test_case   â”‚                          â”‚
â”‚  â”‚                  â”‚         â”‚                  â”‚                          â”‚
â”‚  â”‚  - prompt_code   â”‚         â”‚  - test_id       â”‚                          â”‚
â”‚  â”‚  - agent_code FK â”‚         â”‚  - capability FK â”‚                          â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                          â”‚
â”‚                                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                          â”‚
â”‚  â”‚   eap_session    â”‚â—„â”€â”€â”€â”€â”€â”€â”€â”€â”‚  eap_telemetry   â”‚                          â”‚
â”‚  â”‚                  â”‚   1:N   â”‚                  â”‚                          â”‚
â”‚  â”‚  - session_id PK â”‚         â”‚  - telemetry_id  â”‚                          â”‚
â”‚  â”‚  - user_id       â”‚         â”‚  - session_id FK â”‚                          â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                          â”‚
â”‚                                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                                       â”‚
â”‚  â”‚eap_environment   â”‚                                                       â”‚
â”‚  â”‚    _config       â”‚                                                       â”‚
â”‚  â”‚                  â”‚                                                       â”‚
â”‚  â”‚ - environment_id â”‚                                                       â”‚
â”‚  â”‚ - environment_cd â”‚                                                       â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                                       â”‚
â”‚                                                                              â”‚
â”‚  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•    â”‚
â”‚                                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”‚
â”‚  â”‚  mpa_vertical    â”‚   â”‚   mpa_channel    â”‚   â”‚    mpa_kpi       â”‚        â”‚
â”‚  â”‚                  â”‚   â”‚                  â”‚   â”‚                  â”‚        â”‚
â”‚  â”‚  - vertical_id   â”‚   â”‚  - channel_id    â”‚   â”‚  - kpi_id        â”‚        â”‚
â”‚  â”‚  - vertical_code â”‚   â”‚  - channel_code  â”‚   â”‚  - kpi_code      â”‚        â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â”‚
â”‚           â”‚                      â”‚                      â”‚                   â”‚
â”‚           â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                   â”‚
â”‚                                  â”‚                                          â”‚
â”‚                                  â–¼                                          â”‚
â”‚                       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                              â”‚
â”‚                       â”‚   mpa_benchmark      â”‚                              â”‚
â”‚                       â”‚                      â”‚                              â”‚
â”‚                       â”‚ - benchmark_id       â”‚                              â”‚
â”‚                       â”‚ - vertical_code FK   â”‚                              â”‚
â”‚                       â”‚ - channel_code FK    â”‚                              â”‚
â”‚                       â”‚ - kpi_code FK        â”‚                              â”‚
â”‚                       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                              â”‚
â”‚                                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                          â”‚
â”‚  â”‚   mpa_partner    â”‚         â”‚   mpa_session    â”‚                          â”‚
â”‚  â”‚                  â”‚         â”‚                  â”‚                          â”‚
â”‚  â”‚  - partner_id    â”‚         â”‚  - session_id    â”‚                          â”‚
â”‚  â”‚  - partner_name  â”‚         â”‚  - step_data     â”‚                          â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                          â”‚
â”‚                                                                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.2 Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Table name | {prefix}_{entity} | eap_agent |
| Primary key | {entity}id | agentid |
| Foreign key | {related_entity}_code or _id | capability_code |
| Choice column | {column}_code | environment_code |
| Boolean column | is_{descriptor} | is_enabled |
| DateTime column | {action}_at | created_at |
| JSON column | {descriptor}_json | inputs_json |

---


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

## 3. TABLE SPECIFICATIONS

### 3.1 EAP Platform Tables

#### eap_agent

**Purpose:** Registry of all agents in the system

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| eap_agentid | GUID | Yes | Primary key |
| agent_code | Text(20) | Yes | Unique agent identifier (ORC, ANL, etc.) |
| agent_name | Text(100) | Yes | Display name |
| description | Multiline(4000) | No | Agent description |
| capability_tags | Text(500) | No | Comma-separated capability keywords |
| routing_priority | Number | No | Routing order (default: 100) |
| is_active | Boolean | Yes | Active status (default: true) |
| version | Text(20) | No | Version string (default: "1.0") |

**Seed Data Count:** 10 records (one per agent)

---

#### eap_capability

**Purpose:** Capability definitions with schemas

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| eap_capabilityid | GUID | Yes | Primary key |
| capability_code | Text(50) | Yes | Unique capability identifier |
| capability_name | Text(100) | Yes | Display name |
| agent_code | Text(20) | Yes | Owning agent code |
| description | Multiline(2000) | No | Capability description |
| input_schema | Multiline(8000) | No | JSON schema for inputs |
| output_schema | Multiline(8000) | No | JSON schema for outputs |
| is_active | Boolean | Yes | Active status (default: true) |

**Seed Data Count:** 36 records

---

#### eap_capability_implementation

**Purpose:** Environment-specific implementation mappings

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| eap_capability_implementationid | GUID | Yes | Primary key |
| capability_code | Text(50) | Yes | Capability reference |
| environment_code | Choice | Yes | MASTERCARD, PERSONAL |
| implementation_type | Choice | Yes | AI_BUILDER_PROMPT, DATAVERSE_LOGIC |
| prompt_code | Text(50) | No | AI Builder prompt reference |
| endpoint_url | Text(500) | No | Endpoint for HTTP/Function (not used in MC) |
| priority_order | Number | Yes | Execution priority (1=highest) |
| is_enabled | Boolean | Yes | Enabled status |
| fallback_implementation_id | GUID | No | Fallback implementation |
| timeout_ms | Number | No | Timeout in milliseconds |

**Seed Data Count:** ~50 records (capabilities Ã— environments)

---

#### eap_prompt

**Purpose:** AI Builder prompt registry

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| eap_promptid | GUID | Yes | Primary key |
| prompt_code | Text(50) | Yes | Unique prompt identifier |
| prompt_name | Text(100) | Yes | Display name |
| agent_code | Text(20) | Yes | Associated agent |
| model | Text(50) | No | AI model (default: gpt-4) |
| system_message | Multiline(8000) | Yes | System prompt |
| user_template | Multiline(4000) | Yes | User message template |
| output_format | Choice | No | json, text |
| max_tokens | Number | No | Token limit |
| temperature | Decimal | No | Temperature setting |

**Seed Data Count:** 26 records

---

#### eap_test_case

**Purpose:** Golden test scenarios for validation

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| eap_test_caseid | GUID | Yes | Primary key |
| scenario_id | Text(50) | Yes | Unique scenario identifier |
| scenario_name | Text(200) | Yes | Descriptive name |
| capability_code | Text(50) | Yes | Capability being tested |
| input_message | Multiline(4000) | Yes | Test input |
| expected_agent | Text(20) | No | Expected routing agent |
| expected_outputs | Multiline(8000) | No | Expected output assertions |
| expected_citations | Multiline(2000) | No | Expected citations |
| tolerance_band | Decimal | No | Acceptable variance |
| is_active | Boolean | Yes | Active status |
| last_run_date | DateTime | No | Last execution |
| last_run_result | Choice | No | PASS, FAIL, ERROR |

**Seed Data Count:** 50+ records

---

#### eap_telemetry

**Purpose:** Observability logging

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| eap_telemetryid | GUID | Yes | Primary key |
| session_id | GUID | No | Session reference |
| user_id | GUID | No | User reference |
| capability_code | Text(50) | No | Capability invoked |
| agent_code | Text(20) | No | Agent that invoked |
| implementation_type | Choice | No | Implementation used |
| inputs_summary | Multiline(2000) | No | Sanitized input summary |
| outputs_summary | Multiline(2000) | No | Sanitized output summary |
| latency_ms | Number | No | Execution duration |
| success | Boolean | No | Success status |
| error_code | Text(50) | No | Error code if failed |
| error_message | Multiline(2000) | No | Error description |
| correlation_id | GUID | No | Request correlation |
| timestamp | DateTime | Yes | Event timestamp |

**Retention:** 180 days (automatic purge)

---

#### eap_environment_config

**Purpose:** Environment configuration settings

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| eap_environment_configid | GUID | Yes | Primary key |
| environment_code | Choice | Yes | MASTERCARD, PERSONAL |
| environment_name | Text(100) | Yes | Display name |
| dataverse_url | Text(500) | No | Dataverse endpoint |
| sharepoint_url | Text(500) | No | SharePoint site |
| features_json | Multiline(4000) | No | Feature flags JSON |
| is_active | Boolean | Yes | Active environment |

**Seed Data Count:** 1 record (MASTERCARD)

---

#### eap_session

**Purpose:** User session management

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| eap_sessionid | GUID | Yes | Primary key |
| user_id | GUID | Yes | Azure AD user ID |
| session_start | DateTime | Yes | Session start time |
| session_end | DateTime | No | Session end time |
| context_json | Multiline(8000) | No | Session context |
| is_active | Boolean | Yes | Active status |

**Retention:** 90 days (automatic purge)

---

### 3.2 EAP Security Tables (ABAC)

#### eap_security_config

**Purpose:** Global security settings and toggles

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| eap_security_configid | GUID | Yes | Primary key |
| config_key | Text(100) | Yes | Configuration key |
| config_value | Text(500) | Yes | Configuration value |
| description | Text(500) | No | What this setting does |
| is_active | Boolean | Yes | Active flag (default: true) |

**Key Settings:** ABAC_ENABLED, CSUITE_PROTECTION_ENABLED, PROFILE_TRACKING_ENABLED, DEFAULT_ACCESS

**Seed Data Count:** 8 records

---

#### eap_user_profile

**Purpose:** Full user profile from Microsoft Directory

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| eap_user_profileid | GUID | Yes | Primary key |
| user_id | GUID | Yes | Azure AD user ID (unique) |
| display_name | Text(200) | Yes | Full name |
| email | Text(320) | Yes | Email address |
| job_title | Text(200) | No | Job title |
| employee_level | Text(50) | No | Level (CEO, EVP, SVP, VP, Director, etc.) |
| department | Text(200) | No | Department name |
| team | Text(200) | No | Team name |
| division | Text(200) | No | Business division |
| region | Text(100) | No | Geographic region |
| country | Text(100) | No | Country |
| office_location | Text(200) | No | Office location |
| cost_center | Text(50) | No | Cost center code |
| manager_id | GUID | No | Direct manager's Azure AD ID |
| manager_display_name | Text(200) | No | Manager's name |
| manager_chain_json | Multiline | No | JSON array of manager chain |
| security_groups_json | Multiline | No | JSON array of security group memberships |
| first_seen | DateTime | No | First platform access |
| last_updated | DateTime | No | Profile cache timestamp |

**Retention:** Indefinite (updated on session start when stale)

---

#### eap_access_rule

**Purpose:** Attribute-based access control rules

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| eap_access_ruleid | GUID | Yes | Primary key |
| rule_name | Text(200) | Yes | Descriptive name |
| rule_description | Text(1000) | No | Detailed description |
| rule_type | Choice | Yes | AGENT, CONTENT_SET, DOCUMENT, CAPABILITY, DATA_AREA |
| target_pattern | Text(500) | Yes | What this rule protects (supports wildcards) |
| conditions_json | Multiline | Yes | JSON conditions that must be met |
| condition_logic | Choice | Yes | ALL (AND) / ANY (OR) |
| denial_message | Text(1000) | No | Custom denial message |
| applies_when_abac_off | Boolean | Yes | Does this rule apply in Launch Mode? |
| priority | Number | Yes | Higher = evaluated first |
| is_active | Boolean | Yes | Active flag |

**Seed Data Count:** ~20 records

---

#### eap_access_request

**Purpose:** Track access requests

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| eap_access_requestid | GUID | Yes | Primary key |
| user_id | GUID | Yes | Requesting user |
| user_display_name | Text(200) | No | User's name |
| user_email | Text(320) | No | User's email |
| user_department | Text(200) | No | User's department |
| user_job_title | Text(200) | No | User's title |
| user_employee_level | Text(50) | No | User's level |
| user_division | Text(200) | No | User's division |
| user_region | Text(100) | No | User's region |
| requested_content | Text(500) | Yes | What they want access to |
| justification | Multiline | No | Why they need access |
| request_status | Choice | Yes | PENDING, APPROVED, DENIED |
| requested_at | DateTime | Yes | When submitted |
| resolved_at | DateTime | No | When resolved |
| resolved_by | Text(200) | No | Who resolved it |
| resolution_notes | Text(1000) | No | Notes from resolver |
| rule_triggered | Text(200) | No | Name of rule that denied access |

**Retention:** 1 year (for audit purposes)

---

### 3.3 MPA Domain Tables

#### mpa_channel

**Purpose:** Channel reference data

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| mpa_channelid | GUID | Yes | Primary key |
| channel_code | Text(50) | Yes | Unique channel code |
| channel_name | Text(100) | Yes | Display name |
| channel_category | Choice | No | DIGITAL, TRADITIONAL, EMERGING |
| parent_channel_code | Text(50) | No | Parent channel for hierarchy |
| is_active | Boolean | Yes | Active status |

**Seed Data Count:** 43 records

---

#### mpa_kpi

**Purpose:** KPI definitions

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| mpa_kpiid | GUID | Yes | Primary key |
| kpi_code | Text(50) | Yes | Unique KPI code |
| kpi_name | Text(100) | Yes | Display name |
| kpi_category | Choice | No | AWARENESS, CONSIDERATION, CONVERSION |
| unit | Text(20) | No | Unit of measure |
| is_active | Boolean | Yes | Active status |

**Seed Data Count:** 44 records

---

#### mpa_vertical

**Purpose:** Industry vertical classifications

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| mpa_verticalid | GUID | Yes | Primary key |
| vertical_code | Text(50) | Yes | Unique vertical code |
| vertical_name | Text(100) | Yes | Display name |
| is_active | Boolean | Yes | Active status |

**Seed Data Count:** 15 records

---

#### mpa_benchmark

**Purpose:** Industry benchmarks by vertical Ã— channel Ã— KPI

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| mpa_benchmarkid | GUID | Yes | Primary key |
| vertical_code | Text(50) | Yes | Vertical reference |
| channel_code | Text(50) | Yes | Channel reference |
| kpi_code | Text(50) | Yes | KPI reference |
| benchmark_value | Decimal | Yes | Benchmark value |
| benchmark_low | Decimal | No | Low range |
| benchmark_high | Decimal | No | High range |
| source | Text(200) | No | Data source |
| effective_date | Date | No | Effective from |
| is_active | Boolean | Yes | Active status |

**Seed Data Count:** 708+ records

---

#### mpa_partner

**Purpose:** Partner/vendor reference data

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| mpa_partnerid | GUID | Yes | Primary key |
| partner_code | Text(50) | Yes | Unique partner code |
| partner_name | Text(200) | Yes | Display name |
| partner_type | Choice | Yes | DSP, SSP, DMP, AGENCY |
| fee_percentage | Decimal | No | Standard fee % |
| capabilities_json | Multiline(4000) | No | Capabilities JSON |
| is_active | Boolean | Yes | Active status |

**Seed Data Count:** 50+ records

---

#### mpa_session

**Purpose:** MPA-specific session data

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| mpa_sessionid | GUID | Yes | Primary key |
| eap_session_id | GUID | Yes | EAP session reference |
| current_step | Number | No | Current workflow step |
| step_data_json | Multiline(16000) | No | Step completion data |
| campaign_context_json | Multiline(8000) | No | Campaign context |

---


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

## 4. DATA RELATIONSHIPS

### 4.1 Primary Relationships

| Parent Table | Child Table | Relationship | Cardinality |
|--------------|-------------|--------------|-------------|
| eap_agent | eap_capability | agent_code | 1:N |
| eap_capability | eap_capability_implementation | capability_code | 1:N |
| eap_agent | eap_prompt | agent_code | 1:N |
| eap_capability | eap_test_case | capability_code | 1:N |
| eap_session | eap_telemetry | session_id | 1:N |
| eap_session | mpa_session | eap_session_id | 1:1 |
| mpa_vertical | mpa_benchmark | vertical_code | 1:N |
| mpa_channel | mpa_benchmark | channel_code | 1:N |
| mpa_kpi | mpa_benchmark | kpi_code | 1:N |

### 4.2 Lookup Relationships

| Table | Lookup Column | Target Table | Purpose |
|-------|---------------|--------------|---------|
| eap_capability_implementation | fallback_implementation_id | eap_capability_implementation | Fallback chain |
| mpa_channel | parent_channel_code | mpa_channel | Channel hierarchy |

---


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

## 5. DATA FLOWS

### 5.1 Read Patterns

| Flow | Tables Read | Frequency | Access Pattern |
|------|-------------|-----------|----------------|
| Capability Dispatch | eap_environment_config, eap_capability_implementation | Per request | Indexed lookup |
| Agent Routing | eap_agent | Per request | Scan (small table) |
| Benchmark Lookup | mpa_benchmark, mpa_vertical, mpa_channel, mpa_kpi | Per analysis | Indexed lookup |
| Session Retrieve | eap_session, mpa_session | Per request | Indexed lookup |

### 5.2 Write Patterns

| Flow | Tables Written | Frequency | Access Pattern |
|------|----------------|-----------|----------------|
| Telemetry Logging | eap_telemetry | Per capability call | Append |
| Session Management | eap_session, mpa_session | Per conversation | Upsert |

### 5.3 Data Flow Diagram

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        MCMAP DATA FLOW                                        â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                              â”‚
â”‚  USER REQUEST                                                                â”‚
â”‚       â”‚                                                                      â”‚
â”‚       â–¼                                                                      â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                                        â”‚
â”‚  â”‚  COPILOT STUDIO â”‚                                                        â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                                        â”‚
â”‚           â”‚                                                                  â”‚
â”‚           â”‚ 1. Read agent routing                                           â”‚
â”‚           â–¼                                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”       â”‚
â”‚  â”‚                         DATAVERSE                                â”‚       â”‚
â”‚  â”‚                                                                  â”‚       â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚       â”‚
â”‚  â”‚  â”‚  eap_agent  â”‚  â”‚eap_capability_impl  â”‚  â”‚  mpa_benchmark  â”‚ â”‚       â”‚
â”‚  â”‚  â”‚    READ     â”‚  â”‚       READ          â”‚  â”‚      READ       â”‚ â”‚       â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚       â”‚
â”‚  â”‚                                                                  â”‚       â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                       â”‚       â”‚
â”‚  â”‚  â”‚ eap_session â”‚  â”‚   eap_telemetry     â”‚                       â”‚       â”‚
â”‚  â”‚  â”‚ READ/WRITE  â”‚  â”‚       WRITE         â”‚                       â”‚       â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                       â”‚       â”‚
â”‚  â”‚                                                                  â”‚       â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜       â”‚
â”‚           â”‚                                                                  â”‚
â”‚           â”‚ 2. Retrieve knowledge                                           â”‚
â”‚           â–¼                                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”       â”‚
â”‚  â”‚                        SHAREPOINT                                â”‚       â”‚
â”‚  â”‚                                                                  â”‚       â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚       â”‚
â”‚  â”‚  â”‚              KNOWLEDGE BASE (READ ONLY)                  â”‚   â”‚       â”‚
â”‚  â”‚  â”‚   - Agent instructions                                   â”‚   â”‚       â”‚
â”‚  â”‚  â”‚   - Core KB files                                        â”‚   â”‚       â”‚
â”‚  â”‚  â”‚   - Deep module files                                    â”‚   â”‚       â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚       â”‚
â”‚  â”‚                                                                  â”‚       â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜       â”‚
â”‚           â”‚                                                                  â”‚
â”‚           â”‚ 3. Execute capability                                           â”‚
â”‚           â–¼                                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                                        â”‚
â”‚  â”‚   AI BUILDER    â”‚                                                        â”‚
â”‚  â”‚   (PROCESSING)  â”‚                                                        â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                                        â”‚
â”‚           â”‚                                                                  â”‚
â”‚           â”‚ 4. Return response                                              â”‚
â”‚           â–¼                                                                  â”‚
â”‚       USER RESPONSE                                                          â”‚
â”‚                                                                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

## 6. DATA GOVERNANCE

### 6.1 Data Stewardship

| Data Domain | Steward Role | Responsibilities |
|-------------|--------------|------------------|
| EAP Platform | Platform Administrator | Agent registry, capabilities, prompts |
| MPA Reference | Domain Expert | Benchmarks, channels, KPIs |
| Session Data | System | Automatic management, retention |
| Telemetry | Operations | Monitoring, retention, privacy |
| Knowledge Base | Content Manager | KB content accuracy, updates |

### 6.2 Data Ownership

| Table Category | Owner | Update Authority |
|----------------|-------|------------------|
| Configuration (eap_agent, eap_capability) | Platform Team | Platform Admin |
| Reference (mpa_benchmark, mpa_channel) | Business | Domain Expert |
| Transactional (eap_session, eap_telemetry) | System | Automatic |
| Knowledge Base | Content Team | Content Manager |

### 6.3 Change Management

| Change Type | Approval Required | Process |
|-------------|-------------------|---------|
| Schema Change | Architecture Review | RFC â†’ Review â†’ Implement â†’ Test â†’ Deploy |
| Reference Data Update | Domain Expert | Request â†’ Validate â†’ Import â†’ Verify |
| Configuration Change | Platform Admin | Request â†’ Test â†’ Deploy â†’ Verify |
| KB Content Update | Content Manager | Draft â†’ Review â†’ Publish |

---


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

## 7. DATA QUALITY

### 7.1 Quality Rules

| Table | Rule | Validation |
|-------|------|------------|
| eap_agent | Unique agent_code | Database constraint |
| eap_capability | Valid agent_code reference | Business rule |
| eap_capability_implementation | One active per capability+environment | Business rule |
| mpa_benchmark | Valid vertical/channel/kpi references | Business rule |
| eap_telemetry | Required timestamp | Database constraint |

### 7.2 Data Validation

| Validation Type | Implementation | Timing |
|-----------------|----------------|--------|
| Schema Validation | Dataverse constraints | Write time |
| Reference Integrity | Business rules | Write time |
| Data Completeness | Power Automate checks | Import time |
| Consistency Checks | Scheduled validation | Daily |

### 7.3 Quality Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Reference Data Completeness | 100% | Required fields populated |
| Foreign Key Validity | 100% | Valid references |
| Duplicate Rate | 0% | Unique constraint violations |
| Stale Data | < 5% | Records not updated per retention |

---


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

## 8. SEED DATA MANAGEMENT

### 8.1 Seed Data Files

| File | Target Table | Records | Update Frequency |
|------|--------------|---------|------------------|
| eap_agent_seed.csv | eap_agent | 10 | Per release |
| eap_capability_seed.csv | eap_capability | 36 | Per release |
| eap_capability_impl_mastercard.csv | eap_capability_implementation | ~50 | Per release |
| mpa_channel_seed.csv | mpa_channel | 43 | Quarterly |
| mpa_kpi_seed.csv | mpa_kpi | 44 | Quarterly |
| mpa_vertical_seed.csv | mpa_vertical | 15 | Annually |
| mpa_benchmark_seed.csv | mpa_benchmark | 708+ | Quarterly |
| mpa_partner_seed.csv | mpa_partner | 50+ | Quarterly |

### 8.2 Import Process

```
SEED DATA IMPORT SEQUENCE

1. CLEAR EXISTING (if full refresh)
   - Disable relationships
   - Truncate target tables
   - Re-enable relationships

2. IMPORT ORDER (dependency-aware)
   Tier 1 (no dependencies):
   - eap_agent
   - eap_environment_config
   - mpa_vertical
   - mpa_channel
   - mpa_kpi
   - mpa_partner
   
   Tier 2 (depends on Tier 1):
   - eap_capability
   - eap_prompt
   - mpa_benchmark
   
   Tier 3 (depends on Tier 2):
   - eap_capability_implementation
   - eap_test_case

3. VALIDATION
   - Record counts match expected
   - Foreign key references valid
   - Unique constraints satisfied
```

---


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

## 9. BACKUP & RECOVERY

### 9.1 Backup Strategy

| Component | Backup Type | Frequency | Retention |
|-----------|-------------|-----------|-----------|
| Dataverse | Microsoft managed | Continuous | 28 days |
| SharePoint | Microsoft managed | Continuous | 93 days |
| Configuration Export | Solution export | Weekly | 90 days |
| Seed Data | File backup | Per release | Indefinite |

### 9.2 Recovery Procedures

| Scenario | Recovery Method | RTO |
|----------|-----------------|-----|
| Accidental deletion (single record) | Manual restore from backup | 1 hour |
| Table corruption | Point-in-time restore | 4 hours |
| Full environment failure | Microsoft support escalation | 24 hours |
| Configuration error | Solution re-import | 1 hour |

### 9.3 Disaster Recovery

| Metric | Target | Implementation |
|--------|--------|----------------|
| RPO (Recovery Point Objective) | 1 hour | Continuous backup |
| RTO (Recovery Time Objective) | 4 hours | Restore procedures |
| Geographic Redundancy | Enabled | Microsoft managed |

---

**Document Version:** 1.0  
**Classification:** Mastercard Internal  
**Last Updated:** January 23, 2026
