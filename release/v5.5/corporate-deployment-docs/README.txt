CORPORATE DEPLOYMENT DOCUMENTATION
MPA V5.5
VERSION 1.0
DATE JANUARY 6 2026

============================================================
DOCUMENT INVENTORY
============================================================

This folder contains complete deployment documentation for MPA v5.5 in corporate environments. All documents follow 6-Rule Compliance Framework.

DOCUMENT LIST

00_MASTER_DEPLOYMENT_GUIDE.txt
- Primary deployment guide
- Step by step deployment phases
- Prerequisite checklist
- Verification checklist

01_DATAVERSE_TABLE_REFERENCE.txt
- 8 table specifications
- Column definitions
- Choice value mappings
- Lookup relationships

02_POWER_AUTOMATE_FLOW_REFERENCE.txt
- 11 flow specifications
- Action configurations
- Azure Function endpoints
- Error handling patterns

03_COPILOT_STUDIO_REFERENCE.txt
- Agent configuration steps
- Knowledge source setup
- Action connections
- Testing scenarios

04_ACCESS_CONTROL_REFERENCE.txt
- Hierarchy table schemas
- Security role definitions
- Row level security setup
- User assignment process

05_TESTING_REFERENCE.txt
- Infrastructure tests
- Data validation tests
- Flow tests
- Integration tests
- Security tests

06_TROUBLESHOOTING_REFERENCE.txt
- Dataverse issues
- Power Automate issues
- Copilot Studio issues
- SharePoint issues
- Azure Function issues

07_SEED_DATA_REFERENCE.txt
- Vertical seed data
- Channel seed data
- KPI seed data
- Benchmark seed data
- Import methods

08_SHAREPOINT_KB_REFERENCE.txt
- Library configuration
- 22 KB file specifications
- Upload process
- Indexing guidance

09_AZURE_FUNCTIONS_REFERENCE.txt
- 8 function specifications
- Request and response formats
- Deployment methods
- Monitoring setup

10_FEATURE_FLAGS_REFERENCE.txt
- 24 flag specifications
- Category definitions
- Environment configurations
- Administration guidance

============================================================
COMPLIANCE
============================================================

All documents follow 6-Rule Compliance Framework

Rule 1 - ALL-CAPS headers
Rule 2 - Simple lists with hyphens only
Rule 3 - ASCII characters only
Rule 4 - Zero visual dependencies
Rule 5 - Mandatory language (no exceptions)
Rule 6 - Plain text format

============================================================
USAGE
============================================================

DEPLOYMENT ORDER

Follow documents in this sequence

1 Review 00_MASTER_DEPLOYMENT_GUIDE.txt for overview
2 Create tables per 01_DATAVERSE_TABLE_REFERENCE.txt
3 Import seed data per 07_SEED_DATA_REFERENCE.txt
4 Configure SharePoint per 08_SHAREPOINT_KB_REFERENCE.txt
5 Deploy functions per 09_AZURE_FUNCTIONS_REFERENCE.txt
6 Build flows per 02_POWER_AUTOMATE_FLOW_REFERENCE.txt
7 Configure agent per 03_COPILOT_STUDIO_REFERENCE.txt
8 Set up security per 04_ACCESS_CONTROL_REFERENCE.txt
9 Configure flags per 10_FEATURE_FLAGS_REFERENCE.txt
10 Execute tests per 05_TESTING_REFERENCE.txt
11 Reference 06_TROUBLESHOOTING_REFERENCE.txt as needed

CORPORATE SPECIFIC STEPS

The following are required for corporate environments

- Disable external API flags (mpa_enable_web_search, mpa_enable_external_api)
- Enable security flags (sec_enable_audit_logging, sec_require_data_classification)
- Configure access hierarchy
- Deploy via Teams channel
- Enable audit logging

============================================================
VERSION HISTORY
============================================================

Version 1.0 - January 6 2026
- Initial documentation package
- Complete deployment coverage
- 6-Rule Compliance validated

============================================================
END OF DOCUMENT
============================================================
