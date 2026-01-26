# MASTERCARD DEPLOYMENT CHECKLIST
# Pre-Deployment Verification and Steps

## PRE-REQUISITES

### Azure Access
- [ ] Azure AD tenant access confirmed
- [ ] App registration created with required permissions
- [ ] Client ID and secret generated
- [ ] API permissions granted and admin consented

### Power Platform Access
- [ ] Power Platform environment identified
- [ ] System Administrator or Environment Maker role assigned
- [ ] Dataverse database provisioned
- [ ] Copilot Studio license available

### SharePoint Access
- [ ] SharePoint site created or identified
- [ ] Document library created (AgentKnowledgeBase)
- [ ] App registration has Sites.ReadWrite.All permission

### Network Requirements
- [ ] Firewall rules allow Azure endpoints
- [ ] VPN configured if required
- [ ] API endpoints accessible from deployment machine

## ENVIRONMENT VARIABLES

Verify all required environment variables are set:

```bash
# Azure AD
echo "AZURE_TENANT_ID: ${AZURE_TENANT_ID:-(NOT SET)}"
echo "AZURE_CLIENT_ID: ${AZURE_CLIENT_ID:-(NOT SET)}"
echo "AZURE_CLIENT_SECRET: ${AZURE_CLIENT_SECRET:-(NOT SET)}"

# Azure OpenAI
echo "AZURE_OPENAI_ENDPOINT: ${AZURE_OPENAI_ENDPOINT:-(NOT SET)}"
echo "AZURE_OPENAI_DEPLOYMENT: ${AZURE_OPENAI_DEPLOYMENT:-(NOT SET)}"

# Dataverse
echo "DATAVERSE_ENVIRONMENT_URL: ${DATAVERSE_ENVIRONMENT_URL:-(NOT SET)}"

# SharePoint
echo "SHAREPOINT_SITE_URL: ${SHAREPOINT_SITE_URL:-(NOT SET)}"

# Copilot Studio
echo "COPILOT_STUDIO_BOT_ID: ${COPILOT_STUDIO_BOT_ID:-(NOT SET)}"
echo "COPILOT_STUDIO_ENV_URL: ${COPILOT_STUDIO_ENV_URL:-(NOT SET)}"
```

## DEPLOYMENT ORDER

Deploy components in this order:

### Phase 1: Infrastructure
1. [ ] Run validate-environment.ps1 to verify access
2. [ ] Verify Azure OpenAI deployment exists
3. [ ] Verify Dataverse environment accessible

### Phase 2: Dataverse
4. [ ] Run deploy-dataverse.ps1 to import solution
5. [ ] Verify all tables created
6. [ ] Import seed data (verticals, KPIs, channels, benchmarks)
7. [ ] Verify reference data populated

### Phase 3: SharePoint
8. [ ] Run deploy-sharepoint.ps1 to upload KB files
9. [ ] Verify all KB documents uploaded
10. [ ] Verify folder structure correct
11. [ ] Test document access via API

### Phase 4: Power Automate
12. [ ] Run deploy-flows.ps1 to import flows
13. [ ] Update flow connections
14. [ ] Test each flow manually
15. [ ] Enable flows for production

### Phase 5: Copilot Studio
16. [ ] Run deploy-copilot-studio.ps1
17. [ ] Paste agent instructions
18. [ ] Configure KB connection
19. [ ] Connect Power Automate flows
20. [ ] Test agent in studio
21. [ ] Publish agent

### Phase 6: Validation
22. [ ] Run end-to-end test conversation
23. [ ] Verify KB retrieval working
24. [ ] Verify Dataverse logging
25. [ ] Test fallback scenarios
26. [ ] Document any issues

## POST-DEPLOYMENT

### Monitoring Setup
- [ ] Azure Application Insights configured
- [ ] Dataverse audit logging enabled
- [ ] Power Automate flow run history accessible
- [ ] Alert rules configured

### Documentation
- [ ] Deployment date and version recorded
- [ ] Environment URLs documented
- [ ] Admin contacts identified
- [ ] Rollback procedure confirmed

### Handoff
- [ ] Admin training completed
- [ ] User documentation provided
- [ ] Support escalation path defined
- [ ] Go-live communication sent

## ROLLBACK PROCEDURE

If deployment fails:

1. Disable Copilot Studio agent (unpublish)
2. Disable Power Automate flows
3. Note: Dataverse data and SharePoint files can remain
4. Restore previous agent version if available
5. Document failure reason
6. Schedule remediation

## SIGN-OFF

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Deployer | | | |
| Technical Lead | | | |
| Business Owner | | | |
