#!/usr/bin/env python3
"""
Create Dataverse Configuration Migration Tool (CMT) compatible data import package
from custom seed XML files.
"""
import xml.etree.ElementTree as ET
import os
import zipfile
import uuid
from datetime import datetime

SOLUTION_DIR = "Consulting_and_Marketing_Agent_Platform_V7.0"
DATA_DIR = os.path.join(SOLUTION_DIR, "data")
OUTPUT_DIR = "data_import_package"

SEED_FILES = [
    "eap_agents_seed_v7.0.xml",
    "eap_config_seed_v7.0.xml",
    "eap_user_roles_seed_v7.0.xml",
    "ca_frameworks_seed_v7.0.xml"
]

def parse_seed_file(filepath):
    """Parse custom seed XML and extract entity/record data."""
    tree = ET.parse(filepath)
    root = tree.getroot()

    entities = []
    for entity_elem in root.findall('.//entity'):
        entity_name = entity_elem.get('name')
        display_name = entity_elem.get('displayname', entity_name)

        records = []
        for record_elem in entity_elem.findall('.//record'):
            record_id = record_elem.get('id')
            fields = {}
            for field_elem in record_elem.findall('field'):
                field_name = field_elem.get('name')
                field_value = field_elem.get('value')
                field_label = field_elem.get('label')
                fields[field_name] = {
                    'value': field_value,
                    'label': field_label
                }
            records.append({'id': record_id, 'fields': fields})

        entities.append({
            'name': entity_name,
            'displayname': display_name,
            'records': records
        })

    return entities

def create_schema_xml(all_entities):
    """Create data_schema.xml for CMT."""
    root = ET.Element('entities')

    for entity in all_entities:
        entity_elem = ET.SubElement(root, 'entity')
        entity_elem.set('name', entity['name'])
        entity_elem.set('displayname', entity['displayname'])
        entity_elem.set('primaryidfield', f"{entity['name']}id")
        entity_elem.set('primarynamefield', f"{entity['name']}_name" if entity['name'] != 'eap_config' else 'eap_key')
        entity_elem.set('disableplugins', 'true')

        # Get all unique field names from records
        all_fields = set()
        for record in entity['records']:
            all_fields.update(record['fields'].keys())

        fields_elem = ET.SubElement(entity_elem, 'fields')
        for field_name in sorted(all_fields):
            field_elem = ET.SubElement(fields_elem, 'field')
            field_elem.set('name', field_name)
            field_elem.set('displayname', field_name.replace('_', ' ').title())
            field_elem.set('type', 'string')
            field_elem.set('customfield', 'true')

    return ET.tostring(root, encoding='unicode', xml_declaration=True)

def create_data_xml(all_entities):
    """Create data.xml in CMT format."""
    root = ET.Element('entities')

    for entity in all_entities:
        entity_elem = ET.SubElement(root, 'entity')
        entity_elem.set('name', entity['name'])
        entity_elem.set('displayname', entity['displayname'])

        records_elem = ET.SubElement(entity_elem, 'records')
        for record in entity['records']:
            record_elem = ET.SubElement(records_elem, 'record')
            record_elem.set('id', str(uuid.uuid4()))

            for field_name, field_data in record['fields'].items():
                field_elem = ET.SubElement(record_elem, 'field')
                field_elem.set('name', field_name)
                field_elem.set('value', field_data['value'] or '')
                if field_data.get('label'):
                    field_elem.set('lookupentityname', field_data['label'])

    return ET.tostring(root, encoding='unicode', xml_declaration=True)

def create_content_types():
    """Create [Content_Types].xml for the package."""
    return '''<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/xml" />
</Types>'''

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("Parsing seed data files...")
    all_entities = []
    for seed_file in SEED_FILES:
        filepath = os.path.join(DATA_DIR, seed_file)
        if os.path.exists(filepath):
            print(f"  Processing {seed_file}")
            entities = parse_seed_file(filepath)
            all_entities.extend(entities)
            print(f"    Found {len(entities)} entities with {sum(len(e['records']) for e in entities)} records")

    print(f"\nTotal: {len(all_entities)} entities")

    # Create schema and data XMLs
    print("\nGenerating CMT package files...")
    schema_xml = create_schema_xml(all_entities)
    data_xml = create_data_xml(all_entities)
    content_types = create_content_types()

    # Write files
    with open(os.path.join(OUTPUT_DIR, 'data_schema.xml'), 'w') as f:
        f.write(schema_xml)
    with open(os.path.join(OUTPUT_DIR, 'data.xml'), 'w') as f:
        f.write(data_xml)
    with open(os.path.join(OUTPUT_DIR, '[Content_Types].xml'), 'w') as f:
        f.write(content_types)

    # Create ZIP package
    zip_path = "KDAP_V7.0_Data_Import.zip"
    print(f"\nCreating {zip_path}...")
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for filename in ['data_schema.xml', 'data.xml', '[Content_Types].xml']:
            zf.write(os.path.join(OUTPUT_DIR, filename), filename)

    print(f"\n✓ Data import package created: {zip_path}")
    print("\nImport instructions:")
    print("  1. Open Configuration Migration Tool (CMT)")
    print("  2. Select 'Import data'")
    print("  3. Connect to target Dataverse environment")
    print("  4. Select the generated ZIP file")
    print("  5. Review and import")

if __name__ == '__main__':
    main()
