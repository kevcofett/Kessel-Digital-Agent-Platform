CONSULTING AND MARKETING AGENT PLATFORM V7.0
=============================================

MCMAP - Mastercard Media and Analytics Platform
Enterprise AI Agent Platform for Data and Services

VERSION: 7.0.0.0
DATE: January 31, 2026
CLASSIFICATION: Mastercard Internal


CONTENTS
--------

1. AGENTS (13 Active)
   - ORC  Orchestrator - Intent routing, session management
   - ANL  Analytics - Projections, calculations, modeling
   - AUD  Audience - Segmentation, LTV, targeting
   - CHA  Channel - Channel selection, mix optimization
   - SPO  SupplyPath - Programmatic optimization, fees
   - DOC  Document - Document generation, export
   - PRF  Performance - Attribution, anomaly detection
   - CST  ConsultingStrategy - Strategic frameworks
   - CHG  ChangeManagement - Adoption planning
   - MKT  MarketingStrategy - GTM planning, positioning
   - GHA  GrowthHacking - AARRR funnel, viral mechanics
   - DOCS DocumentationAssistant - Platform documentation
   - DVO  DevOps - Deployment orchestration

2. PLATFORM
   - Dataverse table schemas
   - Platform workflows
   - Seed data files
   - Configuration files

3. DATABRICKS (Preparation)
   - Integration specification
   - Configuration reference
   - Delta Lake schemas
   - Setup guide

4. CONTRACTS
   - Inter-agent contract schema
   - Handoff patterns


DEPLOYMENT INSTRUCTIONS
-----------------------

1. Import solution.xml into Power Platform environment
2. Deploy Dataverse tables from platform/entities/
3. Import AI Builder prompts using deploy_ai_builder_prompts.md
4. Upload KB files to SharePoint for each agent
5. Configure Copilot instructions from agents/*/instructions/
6. Enable workflows from platform/Workflows/
7. Run validation tests


NEW IN V7.0
-----------

- GHA GrowthHacking agent with 13 KB files and 10 AI Builder prompts
- DVO DevOps agent with enterprise security controls
- DOCS DocumentationAssistant agent
- Databricks integration preparation artifacts
- Updated agent-registry.json with all 22 agents (13 active, 8 external pending, 1 infra pending)
- Enhanced inter-agent contract with DATABRICKS data sources


CONTACT
-------

Kevin Bauer
Platform Owner and Architect
Mastercard Data and Services


CONFIDENTIAL - MASTERCARD INTERNAL USE ONLY
