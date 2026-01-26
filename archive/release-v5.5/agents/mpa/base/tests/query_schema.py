#!/usr/bin/env python3
"""Query Dataverse schema to find correct relationship names."""

import sys
try:
    import msal
    import requests
except ImportError:
    print("pip install msal requests")
    sys.exit(1)

CLIENT_ID = "51f81489-12ee-4a9e-aaae-a2591f45987d"
AUTHORITY = "https://login.microsoftonline.com/common"
ENV_URL = "https://aragornai.crm.dynamics.com"

# Authenticate
app = msal.PublicClientApplication(CLIENT_ID, authority=AUTHORITY)
accounts = app.get_accounts()
result = None
if accounts:
    result = app.acquire_token_silent([f"{ENV_URL}/.default"], account=accounts[0])

if not result or "access_token" not in result:
    print("Need to authenticate...")
    flow = app.initiate_device_flow(scopes=[f"{ENV_URL}/.default"])
    print(flow["message"])
    result = app.acquire_token_by_device_flow(flow)

token = result["access_token"]
print("Authenticated")

headers = {
    "Authorization": f"Bearer {token}",
    "OData-MaxVersion": "4.0",
    "OData-Version": "4.0",
    "Accept": "application/json",
}

# Query entity definition for cat_copilottests
print("\n=== cat_copilottests Entity Definition ===")
url = f"{ENV_URL}/api/data/v9.2/EntityDefinitions(LogicalName='cat_copilottest')?$expand=Attributes,ManyToOneRelationships"
response = requests.get(url, headers=headers)

if response.status_code == 200:
    data = response.json()

    print("\nMany-to-One Relationships (Lookups):")
    for rel in data.get("ManyToOneRelationships", []):
        if "testset" in rel.get("ReferencingAttribute", "").lower() or "testset" in rel.get("SchemaName", "").lower():
            print(f"  SchemaName: {rel.get('SchemaName')}")
            print(f"  ReferencingAttribute: {rel.get('ReferencingAttribute')}")
            print(f"  ReferencedEntity: {rel.get('ReferencedEntity')}")
            print(f"  ReferencingEntityNavigationPropertyName: {rel.get('ReferencingEntityNavigationPropertyName')}")
            print()

    print("\nAll Lookup Attributes:")
    for attr in data.get("Attributes", []):
        if attr.get("AttributeType") == "Lookup":
            print(f"  LogicalName: {attr.get('LogicalName')}")
            print(f"  SchemaName: {attr.get('SchemaName')}")
            print()
else:
    print(f"Error: {response.status_code}")
    print(response.text[:500])
