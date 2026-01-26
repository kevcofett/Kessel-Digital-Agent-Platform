# MPA Regional Reference Data Architecture

## OVERVIEW

This document defines the multi-region data architecture for MPA reference data including:
- Geographic/DMA population data by country
- Platform taxonomy codes (global with regional variations)
- Census demographic data sources

## REGIONAL HIERARCHY

```
Region (Continent/Trade Bloc)
  └── Country
       └── Geographic Unit (DMA, CMA, ITVR, etc.)
            └── Demographic Data
```

## SUPPORTED REGIONS

### Tier 1: Full Support (Complete demographic data)
- US - United States (210 DMAs)
- CA - Canada (35 CMAs)
- UK - United Kingdom (15 ITV Regions)

### Tier 2: Core Support (Population + basic demographics)
- MX - Mexico (59 Metro Areas)
- AU - Australia (8 Greater Capital Cities)
- DE - Germany (16 Bundesländer)
- FR - France (18 Régions)

### Tier 3: Basic Support (Population only)
- BR - Brazil (27 Estados)
- CL - Chile (16 Regiones)
- ES - Spain (17 Comunidades)
- IT - Italy (20 Regioni)
- JP - Japan (47 Prefectures)

## GEOGRAPHIC UNIT TYPES BY COUNTRY

| Country | Unit Type | Unit Name | Count | Source |
|---------|-----------|-----------|-------|--------|
| US | DMA | Designated Market Area | 210 | Nielsen |
| CA | CMA | Census Metropolitan Area | 35 | Statistics Canada |
| UK | ITVR | ITV Region | 15 | Ofcom/ONS |
| UK | NUTS1 | NUTS Level 1 Region | 12 | ONS |
| MX | ZM | Zona Metropolitana | 59 | INEGI |
| AU | GCCSA | Greater Capital City | 8 | ABS |
| DE | LAND | Bundesland | 16 | Destatis |
| FR | REG | Région | 18 | INSEE |
| BR | UF | Unidade Federativa | 27 | IBGE |
| CL | REG | Región | 16 | INE Chile |
| ES | CCAA | Comunidad Autónoma | 17 | INE Spain |
| IT | REG | Regione | 20 | ISTAT |
| JP | PREF | Prefecture | 47 | Statistics Japan |

## DATA SOURCES BY COUNTRY

### US - United States
- Primary: US Census Bureau American Community Survey (ACS)
- Geographic: Nielsen DMA Definitions
- API: api.census.gov
- Tables: B01003 (Population), B03002 (Hispanic), B19001 (Income), B15003 (Education)
- Update: Annual (ACS 5-Year)

### CA - Canada
- Primary: Statistics Canada Census
- Geographic: Statistics Canada CMA Definitions
- API: statcan.gc.ca
- Tables: Population, Income, Education profiles
- Update: Every 5 years (Census), Annual (estimates)

### UK - United Kingdom
- Primary: Office for National Statistics (ONS)
- Geographic: Ofcom ITV Regions, NUTS Classification
- API: ons.gov.uk/datasets
- Tables: Population estimates, Census 2021
- Update: Annual (estimates), Decennial (Census)

### MX - Mexico
- Primary: INEGI (Instituto Nacional de Estadística)
- Geographic: CONAPO Zonas Metropolitanas
- API: inegi.org.mx/servicios/api_indicadores
- Update: Every 5 years (Census), Annual (surveys)

### AU - Australia
- Primary: Australian Bureau of Statistics (ABS)
- Geographic: GCCSA (Greater Capital City Statistical Areas)
- API: abs.gov.au/statistics
- Update: Every 5 years (Census), Annual (estimates)

### DE - Germany
- Primary: Statistisches Bundesamt (Destatis)
- Geographic: Bundesländer (Federal States)
- API: www-genesis.destatis.de
- Update: Annual

### FR - France
- Primary: INSEE (Institut National de la Statistique)
- Geographic: Régions administratives
- API: api.insee.fr
- Update: Annual

### CL - Chile
- Primary: INE Chile (Instituto Nacional de Estadísticas)
- Geographic: Regiones administrativas
- API: ine.cl
- Update: Every 10 years (Census), Annual (estimates)

## FILE NAMING CONVENTION

```
mpa_{data_type}_{country_code}_seed.csv

Examples:
- mpa_geography_us_seed.csv (US DMAs)
- mpa_geography_ca_seed.csv (Canada CMAs)
- mpa_geography_uk_seed.csv (UK ITV Regions)
- mpa_geography_cl_seed.csv (Chile Regiones)
```

## SCHEMA VERSIONING

All regional data files include:
- mpa_data_version: Schema version (e.g., "6.0")
- mpa_data_source: Official source name
- mpa_data_year: Data vintage year
- mpa_last_updated: Last file update date
