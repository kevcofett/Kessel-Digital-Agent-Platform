#!/usr/bin/env python3
"""
Build a Power Platform solution package for MPA v6.0 flows.
"""

import json
import os
import shutil
import zipfile
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).parent.parent

def create_solution_xml(flows: list) -> str:
    """Create solution.xml with flow components."""
    root_components = "\n".join([
        f'      <RootComponent type="29" id="{flow["id"]}" behavior="0" />'
        for flow in flows
    ])

    return f'''<?xml version="1.0" encoding="utf-8"?>
<ImportExportXml version="9.2.25114.191" SolutionPackageVersion="9.2" languagecode="1033" generatedBy="CrmLive" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" OrganizationVersion="9.2.25114.191" OrganizationSchemaType="Full" CRMServerServiceabilityVersion="9.2.25114.00191">
  <SolutionManifest>
    <UniqueName>MPAv60Flows</UniqueName>
    <LocalizedNames>
      <LocalizedName description="MPA v6.0 Flows" languagecode="1033" />
    </LocalizedNames>
    <Descriptions>
      <Description description="Media Planning Agent v6.0 Power Automate Flows" languagecode="1033" />
    </Descriptions>
    <Version>6.0.0</Version>
    <Managed>0</Managed>
    <Publisher>
      <UniqueName>mediaplanning</UniqueName>
      <LocalizedNames>
        <LocalizedName description="Media Planning Agent" languagecode="1033" />
      </LocalizedNames>
      <Descriptions />
      <EMailAddress xsi:nil="true"></EMailAddress>
      <SupportingWebsiteUrl xsi:nil="true"></SupportingWebsiteUrl>
      <CustomizationPrefix>mpa</CustomizationPrefix>
      <CustomizationOptionValuePrefix>10000</CustomizationOptionValuePrefix>
      <Addresses>
        <Address>
          <AddressNumber>1</AddressNumber>
          <AddressTypeCode>1</AddressTypeCode>
          <City xsi:nil="true"></City>
          <County xsi:nil="true"></County>
          <Country xsi:nil="true"></Country>
          <Fax xsi:nil="true"></Fax>
          <FreightTermsCode xsi:nil="true"></FreightTermsCode>
          <ImportSequenceNumber xsi:nil="true"></ImportSequenceNumber>
          <Latitude xsi:nil="true"></Latitude>
          <Line1 xsi:nil="true"></Line1>
          <Line2 xsi:nil="true"></Line2>
          <Line3 xsi:nil="true"></Line3>
          <Longitude xsi:nil="true"></Longitude>
          <Name xsi:nil="true"></Name>
          <PostalCode xsi:nil="true"></PostalCode>
          <PostOfficeBox xsi:nil="true"></PostOfficeBox>
          <PrimaryContactName xsi:nil="true"></PrimaryContactName>
          <ShippingMethodCode>1</ShippingMethodCode>
          <StateOrProvince xsi:nil="true"></StateOrProvince>
          <Telephone1 xsi:nil="true"></Telephone1>
          <Telephone2 xsi:nil="true"></Telephone2>
          <Telephone3 xsi:nil="true"></Telephone3>
          <TimeZoneRuleVersionNumber xsi:nil="true"></TimeZoneRuleVersionNumber>
          <UPSZone xsi:nil="true"></UPSZone>
          <UTCOffset xsi:nil="true"></UTCOffset>
          <UTCConversionTimeZoneCode xsi:nil="true"></UTCConversionTimeZoneCode>
        </Address>
        <Address>
          <AddressNumber>2</AddressNumber>
          <AddressTypeCode>1</AddressTypeCode>
          <City xsi:nil="true"></City>
          <County xsi:nil="true"></County>
          <Country xsi:nil="true"></Country>
          <Fax xsi:nil="true"></Fax>
          <FreightTermsCode xsi:nil="true"></FreightTermsCode>
          <ImportSequenceNumber xsi:nil="true"></ImportSequenceNumber>
          <Latitude xsi:nil="true"></Latitude>
          <Line1 xsi:nil="true"></Line1>
          <Line2 xsi:nil="true"></Line2>
          <Line3 xsi:nil="true"></Line3>
          <Longitude xsi:nil="true"></Longitude>
          <Name xsi:nil="true"></Name>
          <PostalCode xsi:nil="true"></PostalCode>
          <PostOfficeBox xsi:nil="true"></PostOfficeBox>
          <PrimaryContactName xsi:nil="true"></PrimaryContactName>
          <ShippingMethodCode>1</ShippingMethodCode>
          <StateOrProvince xsi:nil="true"></StateOrProvince>
          <Telephone1 xsi:nil="true"></Telephone1>
          <Telephone2 xsi:nil="true"></Telephone2>
          <Telephone3 xsi:nil="true"></Telephone3>
          <TimeZoneRuleVersionNumber xsi:nil="true"></TimeZoneRuleVersionNumber>
          <UPSZone xsi:nil="true"></UPSZone>
          <UTCOffset xsi:nil="true"></UTCOffset>
          <UTCConversionTimeZoneCode xsi:nil="true"></UTCConversionTimeZoneCode>
        </Address>
      </Addresses>
    </Publisher>
    <RootComponents>
{root_components}
    </RootComponents>
    <MissingDependencies />
  </SolutionManifest>
</ImportExportXml>'''

def create_content_types_xml() -> str:
    """Create [Content_Types].xml."""
    return '''<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/xml" />
  <Default Extension="json" ContentType="application/json" />
</Types>'''

def create_customizations_xml() -> str:
    """Create minimal customizations.xml."""
    return '''<?xml version="1.0" encoding="utf-8"?>
<ImportExportXml xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Entities />
  <Roles />
  <Workflows />
  <FieldSecurityProfiles />
  <Templates />
  <EntityMaps />
  <EntityRelationships />
  <OrganizationSettings />
  <optionsets />
  <Languages>
    <Language>1033</Language>
  </Languages>
</ImportExportXml>'''

def main():
    """Build the solution package."""
    print("=" * 60)
    print("Building MPA v6.0 Solution Package")
    print("=" * 60)

    # Load manifest
    manifest_path = BASE_DIR / "platform" / "flows" / "solution-ready" / "conversion-manifest-v2.json"
    with open(manifest_path) as f:
        manifest = json.load(f)

    flows = manifest['flows']
    print(f"Including {len(flows)} flows")

    # Create staging directory
    staging_dir = BASE_DIR / "platform" / "solution-staging"
    if staging_dir.exists():
        shutil.rmtree(staging_dir)
    staging_dir.mkdir(parents=True)

    # Create Workflows directory
    workflows_dir = staging_dir / "Workflows"
    workflows_dir.mkdir()

    # Copy flow files
    solution_flows = []
    for flow in flows:
        src_file = Path(flow['file'])
        # Use proper filename format
        filename = src_file.name
        dst_file = workflows_dir / filename
        shutil.copy(src_file, dst_file)
        solution_flows.append({
            "id": flow['id'].lower(),
            "name": flow['name']
        })
        print(f"  Added: {filename}")

    # Create solution.xml
    solution_xml = create_solution_xml(solution_flows)
    with open(staging_dir / "solution.xml", 'w') as f:
        f.write(solution_xml)
    print("  Created: solution.xml")

    # Create [Content_Types].xml
    content_types = create_content_types_xml()
    with open(staging_dir / "[Content_Types].xml", 'w') as f:
        f.write(content_types)
    print("  Created: [Content_Types].xml")

    # Create customizations.xml
    customizations = create_customizations_xml()
    with open(staging_dir / "customizations.xml", 'w') as f:
        f.write(customizations)
    print("  Created: customizations.xml")

    # Create ZIP file
    output_dir = BASE_DIR / "platform" / "solution-packages"
    output_dir.mkdir(parents=True, exist_ok=True)
    zip_path = output_dir / "MPAv60Flows.zip"

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(staging_dir):
            for file in files:
                file_path = Path(root) / file
                arcname = file_path.relative_to(staging_dir)
                zipf.write(file_path, arcname)

    print(f"\nSolution package created: {zip_path}")
    print(f"Size: {zip_path.stat().st_size} bytes")

    # Cleanup staging
    shutil.rmtree(staging_dir)

    return str(zip_path)

if __name__ == "__main__":
    main()
