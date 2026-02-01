#!/usr/bin/env python3
"""
KDAP v7.0 Solution Package Generator
Creates Power Platform solution packages for import into Mastercard environments.

Generates:
1. Platform solution (shared tables, flows, connections)
2. Agent-specific solutions (10 agents)

Usage:
    python create_solution_packages.py [--export-from-env] [--output-dir DIR]
"""

import os
import sys
import json
import shutil
import zipfile
import argparse
import uuid
import re
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path

try:
    import requests
    from msal import PublicClientApplication
    MSAL_AVAILABLE = True
except ImportError:
    MSAL_AVAILABLE = False
    print("Warning: msal/requests not available. Export from environment disabled.")

# Configuration
TENANT_ID = "3933d83c-778f-4bf2-b5d7-1eea5844e9a3"
CLIENT_ID = "f1ccccf1-c2a0-4890-8d52-fdfcd6620ac8"
ENVIRONMENT_URL = "https://aragornai.crm.dynamics.com"
API_URL = "https://aragornai.api.crm.dynamics.com/api/data/v9.2"

SCRIPT_DIR = Path(__file__).parent
RELEASE_DIR = SCRIPT_DIR.parent
AGENTS_DIR = RELEASE_DIR / "agents"
BASE_DIR = RELEASE_DIR.parent.parent / "base"
SCHEMA_DIR = BASE_DIR / "dataverse" / "schema"

# Publisher configuration
PUBLISHER = {
    "uniquename": "kesseldigital",
    "friendlyname": "Kessel Digital",
    "description": "Kessel Digital Agent Platform Publisher",
    "prefix": "eap",
    "optionvalueprefix": 10000
}

# Solution version
SOLUTION_VERSION = "7.0.0.0"

# Agent definitions
AGENTS = {
    "anl": {
        "code": "ANL",
        "name": "Analytics Agent",
        "description": "Advanced analytics, budget optimization, forecasting, and Monte Carlo simulation",
        "capabilities": ["ANL_BUDGET_OPTIMIZE", "ANL_MONTECARLO", "ANL_ATTRIBUTION"],
        "flows": ["MPA v7CalculateAllocation", "MPA v7RunScenario", "MPA v7DetectAnomalies"]
    },
    "aud": {
        "code": "AUD",
        "name": "Audience Agent",
        "description": "Audience segmentation, propensity scoring, and targeting optimization",
        "capabilities": ["AUD_PROPENSITY_SCORE"],
        "flows": ["MPA v7SegmentAudience", "MPA v7CalculateLTV"]
    },
    "cha": {
        "code": "CHA",
        "name": "Channel Agent",
        "description": "Channel strategy, media mix modeling, and touchpoint optimization",
        "capabilities": ["CHA_MEDIA_MIX"],
        "flows": ["MPA v7LookupBenchmarks", "MPA v7AnalyzeCompetitive"]
    },
    "chg": {
        "code": "CHG",
        "name": "Change Management Agent",
        "description": "Change management, stakeholder mapping, and adoption planning",
        "capabilities": [],
        "flows": ["MPA v7MapStakeholders", "MPA v7PlanAdoption", "MPA v7AssessReadiness"]
    },
    "cst": {
        "code": "CST",
        "name": "Consulting Agent",
        "description": "Strategic consulting, initiative prioritization, and framework selection",
        "capabilities": ["CST_PRIORITIZE"],
        "flows": ["MPA v7PrioritizeInitiatives", "MPA v7SelectFramework", "MPA v7DevelopStrategy"]
    },
    "doc": {
        "code": "DOC",
        "name": "Document Agent",
        "description": "Document generation, brief creation, and content management",
        "capabilities": [],
        "flows": ["MPA v7GenerateDocument", "MPA v7CreateBrief"]
    },
    "mkt": {
        "code": "MKT",
        "name": "Marketing Agent",
        "description": "Marketing strategy, campaign planning, and market analysis",
        "capabilities": [],
        "flows": []
    },
    "orc": {
        "code": "ORC",
        "name": "Orchestrator Agent",
        "description": "Multi-agent coordination, workflow orchestration, and session management",
        "capabilities": [],
        "flows": ["MPA v7RouteToSpecialist", "MPA v7GetSessionState", "MPA v7UpdateProgress", "MPA_Workflow_Orchestrate"]
    },
    "prf": {
        "code": "PRF",
        "name": "Performance Agent",
        "description": "Performance analysis, anomaly detection, and attribution modeling",
        "capabilities": ["PRF_ANOMALY_DETECT"],
        "flows": ["MPA v7AnalyzePerformance", "MPA v7ExtractLearnings", "MPA v7ApplyAnalysis"]
    },
    "spo": {
        "code": "SPO",
        "name": "Sponsorship Agent",
        "description": "Sponsorship evaluation, partner assessment, and ROI analysis",
        "capabilities": [],
        "flows": ["MPA v7EvaluatePartner", "MPA v7CalculateProjection", "MPA v7CalculateNBI", "MPA v7AnalyzeFees"]
    }
}

# Platform tables (shared across all agents)
PLATFORM_TABLES = [
    "eap_capability_implementation",
    "eap_client",
    "eap_featureflag",
    "eap_proactive_trigger",
    "eap_session",
    "eap_telemetry",
    "eap_trigger_history",
    "eap_user",
    "eap_workflow_contribution",
    "eap_workflow_definition"
]

# Platform flows (shared infrastructure)
PLATFORM_FLOWS = [
    "MPA Initialize Session",
    "MPA_Memory_Initialize",
    "MPA_Memory_Store",
    "MPA_Proactive_Evaluate",
    "MPA_File_Process",
    "MPA_ML_Endpoint_Router",
    "MPA_Telemetry_Logger"
]


def get_token() -> Optional[str]:
    """Get access token using MSAL."""
    if not MSAL_AVAILABLE:
        return None

    app = PublicClientApplication(
        CLIENT_ID,
        authority=f"https://login.microsoftonline.com/{TENANT_ID}"
    )

    accounts = app.get_accounts()
    if accounts:
        result = app.acquire_token_silent(
            [f"{ENVIRONMENT_URL}/.default"],
            account=accounts[0]
        )
        if result and "access_token" in result:
            print("Using cached token")
            return result["access_token"]

    # Interactive login
    result = app.acquire_token_interactive(
        scopes=[f"{ENVIRONMENT_URL}/.default"]
    )
    if result and "access_token" in result:
        return result["access_token"]

    return None


def get_headers(token: str) -> Dict[str, str]:
    """Get request headers."""
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Accept": "application/json"
    }


def load_table_schema(table_name: str) -> Optional[Dict]:
    """Load table schema from JSON file."""
    schema_file = SCHEMA_DIR / f"{table_name}.json"
    if schema_file.exists():
        with open(schema_file, 'r') as f:
            return json.load(f)
    return None


def get_primary_name_attribute(schema: Dict) -> str:
    """Determine the primary name attribute for a table schema."""
    if not schema:
        return "name"

    columns = schema.get("columns", [])
    table_name = schema.get("table_name", "")

    # Priority order for primary name attribute:
    # 1. Column named "{table}_name" or "name"
    # 2. Column named "{table}_code" or "code"
    # 3. First nvarchar column that's not the primary key
    # 4. Default to "name"

    name_candidates = []
    code_candidates = []
    nvarchar_candidates = []

    for col in columns:
        col_name = col.get("name", "")
        col_type = col.get("type", "")
        is_pk = col.get("primary_key", False)

        if is_pk:
            continue

        if col_name in ["name", f"{table_name}_name", "agent_name", "capability_name",
                        "prompt_name", "session_code", "capability_code"]:
            name_candidates.append(col_name)
        elif col_name.endswith("_code") and col_type == "nvarchar":
            code_candidates.append(col_name)
        elif col_type == "nvarchar" and not is_pk:
            nvarchar_candidates.append(col_name)

    # Return best match
    if name_candidates:
        return name_candidates[0]
    if code_candidates:
        return code_candidates[0]
    if nvarchar_candidates:
        return nvarchar_candidates[0]

    return "name"


def map_datatype_to_crm(col: Dict) -> Dict:
    """Map JSON schema column type to CRM attribute metadata."""
    col_type = col.get("type", "nvarchar")
    col_name = col.get("name", "")
    max_length = col.get("max_length", 100)
    required = col.get("required", False)

    # Base attribute properties
    attr = {
        "LogicalName": col_name,
        "DisplayName": col.get("display_name", col_name),
        "RequiredLevel": "ApplicationRequired" if required else "None",
        "IsCustomizable": "1",
        "IsRenameable": "1"
    }

    if col_type == "uniqueidentifier":
        attr["Type"] = "Uniqueidentifier"
    elif col_type == "nvarchar":
        attr["Type"] = "String"
        attr["Format"] = "Text"
        attr["MaxLength"] = str(min(max_length, 4000))
        attr["ImeMode"] = "Auto"
    elif col_type == "int":
        attr["Type"] = "Integer"
        attr["Format"] = "None"
        attr["MinValue"] = "-2147483648"
        attr["MaxValue"] = "2147483647"
    elif col_type == "decimal":
        attr["Type"] = "Decimal"
        attr["Precision"] = str(col.get("precision", 10))
        attr["MinValue"] = "-100000000000"
        attr["MaxValue"] = "100000000000"
    elif col_type == "bit":
        attr["Type"] = "Boolean"
        attr["DefaultValue"] = "1" if col.get("default", True) else "0"
    elif col_type == "datetime":
        attr["Type"] = "DateTime"
        attr["Format"] = "DateAndTime"
        attr["ImeMode"] = "Disabled"
    elif col_type == "choice":
        attr["Type"] = "Picklist"
        choices = col.get("choices", [])
        attr["Options"] = choices
    elif col_type == "lookup":
        attr["Type"] = "Lookup"
        attr["LookupTable"] = col.get("lookup_table", "")
    else:
        attr["Type"] = "String"
        attr["Format"] = "Text"
        attr["MaxLength"] = "100"

    return attr


def generate_entity_xml(table_name: str, schema: Dict) -> str:
    """Generate full entity XML with attributes for a table."""
    if not schema:
        # Fallback for tables without schema
        return f'''
      <Entity>
        <Name LocalizedName="{table_name}" OriginalName="{table_name}">{table_name}</Name>
        <ObjectTypeCode>{table_name}</ObjectTypeCode>
        <EntityInfo>
          <entity Name="{table_name}">
            <LocalizedNames>
              <LocalizedName description="{table_name}" languagecode="1033" />
            </LocalizedNames>
            <PrimaryNameAttribute>name</PrimaryNameAttribute>
          </entity>
        </EntityInfo>
      </Entity>'''

    display_name = schema.get("display_name", table_name)
    description = schema.get("description", "")
    columns = schema.get("columns", [])
    primary_name = get_primary_name_attribute(schema)
    primary_id = f"{table_name}id"

    # Generate attributes XML
    attributes_xml = ""
    for col in columns:
        col_name = col.get("name", "")
        if col.get("primary_key", False):
            continue  # Skip primary key in attributes

        attr = map_datatype_to_crm(col)
        attr_type = attr.get("Type", "String")

        if attr_type == "String":
            attributes_xml += f'''
            <attribute PhysicalName="{col_name}">
              <Type>{attr_type}</Type>
              <Name>{col_name}</Name>
              <LogicalName>{col_name}</LogicalName>
              <RequiredLevel>{attr.get("RequiredLevel", "None")}</RequiredLevel>
              <DisplayMask>ValidForAdvancedFind|ValidForForm|ValidForGrid</DisplayMask>
              <ImeMode>{attr.get("ImeMode", "Auto")}</ImeMode>
              <IsCustomizable>{attr.get("IsCustomizable", "1")}</IsCustomizable>
              <IsRenameable>{attr.get("IsRenameable", "1")}</IsRenameable>
              <CanModifySearchSettings>1</CanModifySearchSettings>
              <CanModifyRequirementLevelSettings>1</CanModifyRequirementLevelSettings>
              <Format>{attr.get("Format", "Text")}</Format>
              <MaxLength>{attr.get("MaxLength", "100")}</MaxLength>
              <displaynames>
                <displayname description="{attr.get("DisplayName", col_name)}" languagecode="1033" />
              </displaynames>
            </attribute>'''
        elif attr_type == "Integer":
            attributes_xml += f'''
            <attribute PhysicalName="{col_name}">
              <Type>{attr_type}</Type>
              <Name>{col_name}</Name>
              <LogicalName>{col_name}</LogicalName>
              <RequiredLevel>{attr.get("RequiredLevel", "None")}</RequiredLevel>
              <DisplayMask>ValidForAdvancedFind|ValidForForm|ValidForGrid</DisplayMask>
              <IsCustomizable>{attr.get("IsCustomizable", "1")}</IsCustomizable>
              <IsRenameable>{attr.get("IsRenameable", "1")}</IsRenameable>
              <Format>{attr.get("Format", "None")}</Format>
              <MinValue>{attr.get("MinValue", "-2147483648")}</MinValue>
              <MaxValue>{attr.get("MaxValue", "2147483647")}</MaxValue>
              <displaynames>
                <displayname description="{attr.get("DisplayName", col_name)}" languagecode="1033" />
              </displaynames>
            </attribute>'''
        elif attr_type == "Decimal":
            attributes_xml += f'''
            <attribute PhysicalName="{col_name}">
              <Type>{attr_type}</Type>
              <Name>{col_name}</Name>
              <LogicalName>{col_name}</LogicalName>
              <RequiredLevel>{attr.get("RequiredLevel", "None")}</RequiredLevel>
              <DisplayMask>ValidForAdvancedFind|ValidForForm|ValidForGrid</DisplayMask>
              <IsCustomizable>{attr.get("IsCustomizable", "1")}</IsCustomizable>
              <IsRenameable>{attr.get("IsRenameable", "1")}</IsRenameable>
              <Precision>{attr.get("Precision", "2")}</Precision>
              <MinValue>{attr.get("MinValue", "-100000000000")}</MinValue>
              <MaxValue>{attr.get("MaxValue", "100000000000")}</MaxValue>
              <displaynames>
                <displayname description="{attr.get("DisplayName", col_name)}" languagecode="1033" />
              </displaynames>
            </attribute>'''
        elif attr_type == "Boolean":
            attributes_xml += f'''
            <attribute PhysicalName="{col_name}">
              <Type>{attr_type}</Type>
              <Name>{col_name}</Name>
              <LogicalName>{col_name}</LogicalName>
              <RequiredLevel>{attr.get("RequiredLevel", "None")}</RequiredLevel>
              <DisplayMask>ValidForAdvancedFind|ValidForForm|ValidForGrid</DisplayMask>
              <IsCustomizable>{attr.get("IsCustomizable", "1")}</IsCustomizable>
              <IsRenameable>{attr.get("IsRenameable", "1")}</IsRenameable>
              <DefaultValue>{attr.get("DefaultValue", "1")}</DefaultValue>
              <displaynames>
                <displayname description="{attr.get("DisplayName", col_name)}" languagecode="1033" />
              </displaynames>
              <optionset Name="{col_name}">
                <OptionSetType>Boolean</OptionSetType>
                <options>
                  <option value="0">
                    <labels>
                      <label description="No" languagecode="1033" />
                    </labels>
                  </option>
                  <option value="1">
                    <labels>
                      <label description="Yes" languagecode="1033" />
                    </labels>
                  </option>
                </options>
              </optionset>
            </attribute>'''
        elif attr_type == "DateTime":
            attributes_xml += f'''
            <attribute PhysicalName="{col_name}">
              <Type>{attr_type}</Type>
              <Name>{col_name}</Name>
              <LogicalName>{col_name}</LogicalName>
              <RequiredLevel>{attr.get("RequiredLevel", "None")}</RequiredLevel>
              <DisplayMask>ValidForAdvancedFind|ValidForForm|ValidForGrid</DisplayMask>
              <IsCustomizable>{attr.get("IsCustomizable", "1")}</IsCustomizable>
              <IsRenameable>{attr.get("IsRenameable", "1")}</IsRenameable>
              <Format>{attr.get("Format", "DateAndTime")}</Format>
              <ImeMode>{attr.get("ImeMode", "Disabled")}</ImeMode>
              <displaynames>
                <displayname description="{attr.get("DisplayName", col_name)}" languagecode="1033" />
              </displaynames>
            </attribute>'''
        elif attr_type == "Picklist":
            options_xml = ""
            for opt in attr.get("Options", []):
                opt_value = opt.get("value", 1)
                opt_label = opt.get("label", "")
                options_xml += f'''
                  <option value="{opt_value}">
                    <labels>
                      <label description="{opt_label}" languagecode="1033" />
                    </labels>
                  </option>'''

            attributes_xml += f'''
            <attribute PhysicalName="{col_name}">
              <Type>{attr_type}</Type>
              <Name>{col_name}</Name>
              <LogicalName>{col_name}</LogicalName>
              <RequiredLevel>{attr.get("RequiredLevel", "None")}</RequiredLevel>
              <DisplayMask>ValidForAdvancedFind|ValidForForm|ValidForGrid</DisplayMask>
              <IsCustomizable>{attr.get("IsCustomizable", "1")}</IsCustomizable>
              <IsRenameable>{attr.get("IsRenameable", "1")}</IsRenameable>
              <displaynames>
                <displayname description="{attr.get("DisplayName", col_name)}" languagecode="1033" />
              </displaynames>
              <optionset Name="{col_name}">
                <OptionSetType>Picklist</OptionSetType>
                <IntroducedVersion>1.0.0.0</IntroducedVersion>
                <IsCustomizable>1</IsCustomizable>
                <options>{options_xml}
                </options>
              </optionset>
            </attribute>'''
        elif attr_type == "Lookup":
            lookup_table = attr.get("LookupTable", table_name)
            attributes_xml += f'''
            <attribute PhysicalName="{col_name}">
              <Type>{attr_type}</Type>
              <Name>{col_name}</Name>
              <LogicalName>{col_name}</LogicalName>
              <RequiredLevel>{attr.get("RequiredLevel", "None")}</RequiredLevel>
              <DisplayMask>ValidForAdvancedFind|ValidForForm|ValidForGrid</DisplayMask>
              <IsCustomizable>{attr.get("IsCustomizable", "1")}</IsCustomizable>
              <IsRenameable>{attr.get("IsRenameable", "1")}</IsRenameable>
              <LookupStyle>single</LookupStyle>
              <displaynames>
                <displayname description="{attr.get("DisplayName", col_name)}" languagecode="1033" />
              </displaynames>
              <LookupTypes>
                <LookupType id="00000000-0000-0000-0000-000000000000">{lookup_table}</LookupType>
              </LookupTypes>
            </attribute>'''

    return f'''
      <Entity>
        <Name LocalizedName="{display_name}" OriginalName="{table_name}">{table_name}</Name>
        <ObjectTypeCode>{table_name}</ObjectTypeCode>
        <EntityInfo>
          <entity Name="{table_name}">
            <LocalizedNames>
              <LocalizedName description="{display_name}" languagecode="1033" />
            </LocalizedNames>
            <Descriptions>
              <Description description="{description}" languagecode="1033" />
            </Descriptions>
            <PrimaryIdAttribute>{primary_id}</PrimaryIdAttribute>
            <PrimaryNameAttribute>{primary_name}</PrimaryNameAttribute>
            <EntitySetName>{table_name}s</EntitySetName>
            <IsDuplicateCheckSupported>0</IsDuplicateCheckSupported>
            <IsBusinessProcessEnabled>0</IsBusinessProcessEnabled>
            <IsCustomEntity>1</IsCustomEntity>
            <IsAuditEnabled>0</IsAuditEnabled>
            <OwnershipTypeMask>UserOwned</OwnershipTypeMask>
            <IsActivity>0</IsActivity>
            <IsActivityParty>0</IsActivityParty>
            <IsAvailableOffline>1</IsAvailableOffline>
            <IsChildEntity>0</IsChildEntity>
            <IsConnectionsEnabled>0</IsConnectionsEnabled>
            <IsDocumentManagementEnabled>0</IsDocumentManagementEnabled>
            <IsEnabledForCharts>1</IsEnabledForCharts>
            <IsImportable>1</IsImportable>
            <IsIntersect>0</IsIntersect>
            <IsMailMergeEnabled>0</IsMailMergeEnabled>
            <IsManaged>0</IsManaged>
            <IsMapiGridEnabled>0</IsMapiGridEnabled>
            <IsReadingPaneEnabled>1</IsReadingPaneEnabled>
            <IsValidForAdvancedFind>1</IsValidForAdvancedFind>
            <IsValidForQueue>0</IsValidForQueue>
            <IsVisibleInMobile>1</IsVisibleInMobile>
            <IsVisibleInMobileClient>1</IsVisibleInMobileClient>
            <IsCustomizable>1</IsCustomizable>
            <IsRenameable>1</IsRenameable>
            <IsMappable>1</IsMappable>
            <CanCreateAttributes>1</CanCreateAttributes>
            <CanCreateForms>1</CanCreateForms>
            <CanCreateViews>1</CanCreateViews>
            <CanCreateCharts>1</CanCreateCharts>
            <CanBeRelatedEntityInRelationship>1</CanBeRelatedEntityInRelationship>
            <CanBePrimaryEntityInRelationship>1</CanBePrimaryEntityInRelationship>
            <CanModifyAdditionalSettings>1</CanModifyAdditionalSettings>
            <IntroducedVersion>1.0.0.0</IntroducedVersion>
            <attributes>{attributes_xml}
            </attributes>
          </entity>
        </EntityInfo>
      </Entity>'''


def generate_solution_xml(
    solution_name: str,
    display_name: str,
    description: str,
    version: str = SOLUTION_VERSION
) -> str:
    """Generate solution.xml content."""

    solution_id = str(uuid.uuid4())

    return f'''<?xml version="1.0" encoding="utf-8"?>
<ImportExportXml version="9.2.0.0" SolutionPackageVersion="9.2" languagecode="1033" generatedBy="KesselDigital" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <SolutionManifest>
    <UniqueName>{solution_name}</UniqueName>
    <LocalizedNames>
      <LocalizedName description="{display_name}" languagecode="1033" />
    </LocalizedNames>
    <Descriptions>
      <Description description="{description}" languagecode="1033" />
    </Descriptions>
    <Version>{version}</Version>
    <Managed>0</Managed>
    <Publisher>
      <UniqueName>{PUBLISHER["uniquename"]}</UniqueName>
      <LocalizedNames>
        <LocalizedName description="{PUBLISHER["friendlyname"]}" languagecode="1033" />
      </LocalizedNames>
      <Descriptions>
        <Description description="{PUBLISHER["description"]}" languagecode="1033" />
      </Descriptions>
      <EMailAddress xsi:nil="true" />
      <SupportingWebsiteUrl xsi:nil="true" />
      <CustomizationPrefix>{PUBLISHER["prefix"]}</CustomizationPrefix>
      <CustomizationOptionValuePrefix>{PUBLISHER["optionvalueprefix"]}</CustomizationOptionValuePrefix>
      <Addresses>
        <Address>
          <AddressNumber>1</AddressNumber>
          <AddressTypeCode>1</AddressTypeCode>
          <City xsi:nil="true" />
          <County xsi:nil="true" />
          <Country xsi:nil="true" />
          <Fax xsi:nil="true" />
          <FreightTermsCode xsi:nil="true" />
          <ImportSequenceNumber xsi:nil="true" />
          <Latitude xsi:nil="true" />
          <Line1 xsi:nil="true" />
          <Line2 xsi:nil="true" />
          <Line3 xsi:nil="true" />
          <Longitude xsi:nil="true" />
          <Name xsi:nil="true" />
          <PostalCode xsi:nil="true" />
          <PostOfficeBox xsi:nil="true" />
          <PrimaryContactName xsi:nil="true" />
          <ShippingMethodCode xsi:nil="true" />
          <StateOrProvince xsi:nil="true" />
          <Telephone1 xsi:nil="true" />
          <Telephone2 xsi:nil="true" />
          <Telephone3 xsi:nil="true" />
          <TimeZoneRuleVersionNumber xsi:nil="true" />
          <UPSZone xsi:nil="true" />
          <UTCOffset xsi:nil="true" />
          <UTCConversionTimeZoneCode xsi:nil="true" />
        </Address>
      </Addresses>
    </Publisher>
    <RootComponents />
    <MissingDependencies />
  </SolutionManifest>
</ImportExportXml>'''


def generate_customizations_xml(tables: List[str] = None, flows: List[str] = None) -> str:
    """Generate customizations.xml content with full entity metadata."""

    entities_xml = ""
    if tables:
        for table in tables:
            # Load schema from JSON file
            schema = load_table_schema(table)
            if schema:
                print(f"    Loaded schema for {table}")
                entities_xml += generate_entity_xml(table, schema)
            else:
                # Fallback for tables without schema
                print(f"    No schema found for {table}, using minimal definition")
                entities_xml += f'''
      <Entity>
        <Name LocalizedName="{table}" OriginalName="{table}">{table}</Name>
        <ObjectTypeCode>{table}</ObjectTypeCode>
        <EntityInfo>
          <entity Name="{table}">
            <LocalizedNames>
              <LocalizedName description="{table}" languagecode="1033" />
            </LocalizedNames>
            <PrimaryNameAttribute>name</PrimaryNameAttribute>
            <IsCustomEntity>1</IsCustomEntity>
            <IntroducedVersion>1.0.0.0</IntroducedVersion>
          </entity>
        </EntityInfo>
      </Entity>'''

    workflows_xml = ""
    if flows:
        for flow in flows:
            flow_id = str(uuid.uuid4())
            workflows_xml += f'''
      <Workflow WorkflowId="{{{flow_id}}}" Name="{flow}">
        <JsonFileName>/Workflows/{flow.replace(" ", "_")}.json</JsonFileName>
        <Type>1</Type>
        <Subprocess>0</Subprocess>
        <Category>5</Category>
        <Mode>0</Mode>
        <Scope>4</Scope>
        <OnDemand>1</OnDemand>
        <TriggerOnCreate>0</TriggerOnCreate>
        <TriggerOnDelete>0</TriggerOnDelete>
        <AsyncAutodelete>0</AsyncAutodelete>
        <SyncWorkflowLogOnFailure>0</SyncWorkflowLogOnFailure>
        <StateCode>0</StateCode>
        <StatusCode>1</StatusCode>
        <RunAs>1</RunAs>
        <IsTransacted>1</IsTransacted>
        <IntroducedVersion>1.0.0.0</IntroducedVersion>
        <IsCustomizable>1</IsCustomizable>
        <PrimaryEntity>none</PrimaryEntity>
        <LocalizedNames>
          <LocalizedName description="{flow}" languagecode="1033" />
        </LocalizedNames>
      </Workflow>'''

    return f'''<?xml version="1.0" encoding="utf-8"?>
<ImportExportXml version="9.2.0.0" SolutionPackageVersion="9.2" languagecode="1033" generatedBy="KesselDigital" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Entities>{entities_xml}
  </Entities>
  <Workflows>{workflows_xml}
  </Workflows>
</ImportExportXml>'''


def generate_content_types_xml() -> str:
    """Generate [Content_Types].xml for solution package."""
    return '''<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/octet-stream" />
  <Default Extension="json" ContentType="application/octet-stream" />
</Types>'''


def create_platform_solution(output_dir: Path) -> Path:
    """Create the platform solution package."""

    print("\n" + "=" * 60)
    print("Creating Platform Solution")
    print("=" * 60)

    solution_name = "EAPPlatform"
    solution_dir = output_dir / "platform"
    solution_dir.mkdir(parents=True, exist_ok=True)

    # Create solution.xml
    solution_xml = generate_solution_xml(
        solution_name=solution_name,
        display_name="Enterprise Agent Platform - Core",
        description="Core platform components including shared tables, flows, and connections for the KDAP multi-agent system"
    )
    (solution_dir / "solution.xml").write_text(solution_xml)
    print(f"  Created: solution.xml")

    # Create customizations.xml
    customizations_xml = generate_customizations_xml(
        tables=PLATFORM_TABLES,
        flows=PLATFORM_FLOWS
    )
    (solution_dir / "customizations.xml").write_text(customizations_xml)
    print(f"  Created: customizations.xml")

    # Create [Content_Types].xml
    (solution_dir / "[Content_Types].xml").write_text(generate_content_types_xml())
    print(f"  Created: [Content_Types].xml")

    # Create Workflows directory
    workflows_dir = solution_dir / "Workflows"
    workflows_dir.mkdir(exist_ok=True)

    # Create placeholder flow definitions
    for flow in PLATFORM_FLOWS:
        flow_file = workflows_dir / f"{flow.replace(' ', '_')}.json"
        flow_def = {
            "schemaVersion": "1.0.0.0",
            "properties": {
                "connectionReferences": {},
                "definition": {
                    "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
                    "contentVersion": "1.0.0.0",
                    "parameters": {},
                    "triggers": {},
                    "actions": {}
                }
            }
        }
        flow_file.write_text(json.dumps(flow_def, indent=2))
    print(f"  Created: {len(PLATFORM_FLOWS)} flow definitions")

    # Create solution.xml components reference
    components_json = {
        "tables": PLATFORM_TABLES,
        "flows": PLATFORM_FLOWS,
        "version": SOLUTION_VERSION,
        "created": datetime.now().isoformat()
    }
    (solution_dir / "components.json").write_text(json.dumps(components_json, indent=2))
    print(f"  Created: components.json")

    # Create ZIP package
    zip_path = output_dir / f"EAPPlatform_{SOLUTION_VERSION.replace('.', '_')}.zip"
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for file_path in solution_dir.rglob('*'):
            if file_path.is_file():
                arcname = file_path.relative_to(solution_dir)
                zf.write(file_path, arcname)

    print(f"  Package: {zip_path.name}")

    return zip_path


def create_agent_solution(agent_code: str, agent_config: Dict, output_dir: Path) -> Path:
    """Create an agent-specific solution package."""

    print(f"\n  Creating {agent_config['name']} Solution...")

    solution_name = f"EAP{agent_config['code']}Agent"
    solution_dir = output_dir / "agents" / agent_code
    solution_dir.mkdir(parents=True, exist_ok=True)

    # Create solution.xml
    solution_xml = generate_solution_xml(
        solution_name=solution_name,
        display_name=f"Enterprise Agent Platform - {agent_config['name']}",
        description=agent_config['description']
    )
    (solution_dir / "solution.xml").write_text(solution_xml)

    # Create customizations.xml (agent has no tables, only flows)
    customizations_xml = generate_customizations_xml(
        tables=[],
        flows=agent_config.get('flows', [])
    )
    (solution_dir / "customizations.xml").write_text(customizations_xml)

    # Create [Content_Types].xml
    (solution_dir / "[Content_Types].xml").write_text(generate_content_types_xml())

    # Create Workflows directory
    workflows_dir = solution_dir / "Workflows"
    workflows_dir.mkdir(exist_ok=True)

    # Create placeholder flow definitions
    for flow in agent_config.get('flows', []):
        flow_file = workflows_dir / f"{flow.replace(' ', '_')}.json"
        flow_def = {
            "schemaVersion": "1.0.0.0",
            "properties": {
                "connectionReferences": {},
                "definition": {
                    "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
                    "contentVersion": "1.0.0.0",
                    "parameters": {},
                    "triggers": {},
                    "actions": {}
                }
            }
        }
        flow_file.write_text(json.dumps(flow_def, indent=2))

    # Copy agent-specific content
    agent_src_dir = AGENTS_DIR / agent_code
    if agent_src_dir.exists():
        # Copy instructions
        instructions_dir = agent_src_dir / "instructions"
        if instructions_dir.exists():
            dest_instructions = solution_dir / "instructions"
            dest_instructions.mkdir(exist_ok=True)
            for f in instructions_dir.glob("*"):
                shutil.copy2(f, dest_instructions)

        # Copy KB files
        kb_dir = agent_src_dir / "kb"
        if kb_dir.exists():
            dest_kb = solution_dir / "kb"
            dest_kb.mkdir(exist_ok=True)
            for f in kb_dir.glob("*.txt"):
                shutil.copy2(f, dest_kb)

    # Create components reference
    components_json = {
        "agent_code": agent_config['code'],
        "agent_name": agent_config['name'],
        "description": agent_config['description'],
        "capabilities": agent_config.get('capabilities', []),
        "flows": agent_config.get('flows', []),
        "dependencies": ["EAPPlatform"],
        "version": SOLUTION_VERSION,
        "created": datetime.now().isoformat()
    }
    (solution_dir / "components.json").write_text(json.dumps(components_json, indent=2))

    # Create ZIP package
    zip_path = output_dir / "agents" / f"EAP{agent_config['code']}Agent_{SOLUTION_VERSION.replace('.', '_')}.zip"
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for file_path in solution_dir.rglob('*'):
            if file_path.is_file():
                arcname = file_path.relative_to(solution_dir)
                zf.write(file_path, arcname)

    print(f"    Package: {zip_path.name}")

    return zip_path


def create_deployment_guide(output_dir: Path, packages: List[Path]) -> Path:
    """Create deployment guide for the solution packages."""

    guide_content = f"""# KDAP v7.0 Solution Deployment Guide

**Version:** {SOLUTION_VERSION}
**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Overview

This package contains Power Platform solutions for deploying the Kessel Digital Agent Platform (KDAP) to Mastercard environments.

## Solution Packages

### Platform Solution (Deploy First)

| Package | Description |
|---------|-------------|
| EAPPlatform_{SOLUTION_VERSION.replace('.', '_')}.zip | Core platform tables, flows, and connections |

### Agent Solutions (Deploy After Platform)

| Package | Agent | Description |
|---------|-------|-------------|
"""

    for agent_code, config in AGENTS.items():
        guide_content += f"| EAP{config['code']}Agent_{SOLUTION_VERSION.replace('.', '_')}.zip | {config['name']} | {config['description'][:50]}... |\n"

    guide_content += f"""

## Deployment Order

**IMPORTANT:** Solutions must be deployed in this order:

1. **EAPPlatform** - Core platform (required by all agents)
2. **Agent solutions** - Can be deployed in any order after platform

## Prerequisites

Before importing solutions:

1. **Azure Resources**
   - Azure Functions deployed (7 ML endpoints)
   - Function keys configured
   - CORS enabled for Power Platform

2. **Power Platform**
   - Environment created (Production or Sandbox)
   - System Administrator role
   - Dataverse enabled

3. **Connections**
   - HTTP Premium connector license
   - Dataverse connector configured

## Import Steps

### Using Power Apps Admin Center

1. Navigate to https://admin.powerplatform.microsoft.com
2. Select target environment
3. Go to Solutions > Import
4. Upload solution ZIP file
5. Follow import wizard
6. Activate flows after import

### Using PAC CLI

```bash
# Authenticate
pac auth create --environment https://[env].crm.dynamics.com

# Import platform first
pac solution import --path EAPPlatform_{SOLUTION_VERSION.replace('.', '_')}.zip --activate-plugins

# Import agent solutions
pac solution import --path EAPANLAgent_{SOLUTION_VERSION.replace('.', '_')}.zip --activate-plugins
pac solution import --path EAPAUDAgent_{SOLUTION_VERSION.replace('.', '_')}.zip --activate-plugins
# ... repeat for other agents
```

## Post-Deployment Configuration

### 1. Configure Environment Variables

Set the following environment variables in each environment:

| Variable | Description | Example |
|----------|-------------|---------|
| eap_ml_base_url | Azure Functions base URL | https://kdap-ml-*.azurewebsites.net |
| eap_ml_function_key | Azure Functions key | (from Azure portal) |

### 2. Activate Flows

After import, manually activate all flows:
1. Go to Solutions > [Solution Name] > Cloud flows
2. Select each flow > Turn On

### 3. Configure Copilot Studio

1. Create/update Copilot topics to call the flows
2. Upload knowledge base files from each agent's /kb directory
3. Configure agent instructions from /instructions directory

## Verification

Run the validation script to verify deployment:

```bash
python validate_deployment.py --environment https://[env].crm.dynamics.com
```

## Troubleshooting

### Common Issues

1. **Missing dependencies**
   - Ensure EAPPlatform is imported first
   - Check all connectors are available

2. **Flow activation fails**
   - Verify connection references
   - Check connector licenses

3. **ML endpoint errors**
   - Verify Azure Functions are running
   - Check function key is correct

## Support

For deployment issues, contact:
- Kessel Digital: support@kesseldigital.com
- GitHub: https://github.com/Kessel-Digital/KDAP

"""

    guide_path = output_dir / "DEPLOYMENT_GUIDE.md"
    guide_path.write_text(guide_content)

    return guide_path


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Create KDAP solution packages")
    parser.add_argument("--output-dir", "-o", default=str(SCRIPT_DIR), help="Output directory")
    parser.add_argument("--export-from-env", "-e", action="store_true", help="Export actual definitions from environment")
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print("KDAP v7.0 Solution Package Generator")
    print("=" * 60)
    print(f"Output Directory: {output_dir}")
    print(f"Solution Version: {SOLUTION_VERSION}")
    print(f"Agents: {len(AGENTS)}")

    packages = []

    # Create platform solution
    platform_zip = create_platform_solution(output_dir)
    packages.append(platform_zip)

    # Create agent solutions
    print("\n" + "=" * 60)
    print("Creating Agent Solutions")
    print("=" * 60)

    for agent_code, agent_config in AGENTS.items():
        agent_zip = create_agent_solution(agent_code, agent_config, output_dir)
        packages.append(agent_zip)

    # Create deployment guide
    guide_path = create_deployment_guide(output_dir, packages)

    # Summary
    print("\n" + "=" * 60)
    print("PACKAGE SUMMARY")
    print("=" * 60)
    print(f"\nCreated {len(packages)} solution packages:")
    print(f"\n  Platform:")
    print(f"    - EAPPlatform_{SOLUTION_VERSION.replace('.', '_')}.zip")
    print(f"\n  Agents:")
    for agent_code, config in AGENTS.items():
        print(f"    - EAP{config['code']}Agent_{SOLUTION_VERSION.replace('.', '_')}.zip")

    print(f"\n  Documentation:")
    print(f"    - {guide_path.name}")

    print(f"\nOutput location: {output_dir}")
    print("\nDeploy using: pac solution import --path <solution.zip>")


if __name__ == "__main__":
    main()
