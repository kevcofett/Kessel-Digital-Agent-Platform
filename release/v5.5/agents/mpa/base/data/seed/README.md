# MPA Seed Data

This directory contains seed data for the Media Planning Agent Dataverse tables.

## Files

| File | Rows | Description |
|------|------|-------------|
| mpa_vertical_seed.csv | 12 | Industry vertical definitions |
| mpa_kpi_seed.csv | 43 | KPI definitions with formulas |
| mpa_channel_seed.csv | 43 | Channel definitions with CPM/CPC ranges |
| mpa_benchmark_seed.csv | 710 | Industry benchmarks by vertical/channel/KPI |

## Import Order

Import tables in this order to respect foreign key relationships:

1. mpa_vertical_seed.csv → mpa_vertical table
2. mpa_kpi_seed.csv → mpa_kpidefinitions table  
3. mpa_channel_seed.csv → mpa_channel table
4. mpa_benchmark_seed.csv → mpa_benchmark table

## Import Script

Use the provided PowerShell script to import seed data:

```powershell
./scripts/import-seed-data.ps1 -EnvironmentUrl "https://org.crm.dynamics.com" -SeedDataPath "./seed"
```

## Data Sources

- Vertical: Standard industry classifications
- KPI: Industry-standard metric definitions with formulas
- Channel: 2024 Q4 industry benchmarks from multiple sources
- Benchmark: Composite from eMarketer, IAB, platform reports

## Benchmark Data Coverage

The benchmark seed data includes metrics for:
- 12 verticals (GENERAL, RETAIL, ECOMMERCE, AUTOMOTIVE, FINANCE, HEALTHCARE, TRAVEL, TECHNOLOGY, CPG, EDUCATION, REAL_ESTATE, PROFESSIONAL_SERVICES)
- 14 channels (PAID_SEARCH, PAID_SOCIAL, PROGRAMMATIC_DISPLAY, CTV_OTT, NATIVE, AUDIO, DOOH, RETAIL_MEDIA, AFFILIATE, EMAIL, VIDEO_OLV, SHOPPING)
- 6 core KPIs per channel (CPM, CPC, CTR, CVR, CPA, ROAS) plus channel-specific metrics

## Notes

- All benchmark data reflects Q4 2024 industry averages
- Confidence levels indicate data reliability (High/Medium/Low)
- ROAS marked as Low confidence - prefer incrementality metrics
- Vertical-specific benchmarks apply multipliers to GENERAL baseline
