#!/bin/bash
# Script to create CA tables in Dataverse using Web API

set -e

# Get access token
TOKEN=$(az account get-access-token --resource https://aragornai.crm.dynamics.com --query accessToken -o tsv)
BASE_URL="https://aragornai.crm.dynamics.com/api/data/v9.2"

# Publisher prefix
PREFIX="ca"

echo "Creating CA tables in Dataverse..."
echo "Environment: https://aragornai.crm.dynamics.com"
echo ""

# Function to create a table
create_table() {
    local schema_name=$1
    local display_name=$2
    local plural_name=$3
    local description=$4
    local ownership=$5  # UserOwned or None (OrganizationOwned)

    echo "Creating table: $schema_name ($display_name)..."

    # Build ownership type value
    if [ "$ownership" = "UserOwned" ]; then
        ownership_type="UserOwned"
    else
        ownership_type="OrganizationOwned"
    fi

    local payload=$(cat <<EOF
{
    "@odata.type": "Microsoft.Dynamics.CRM.EntityMetadata",
    "SchemaName": "${schema_name}",
    "DisplayName": {
        "@odata.type": "Microsoft.Dynamics.CRM.Label",
        "LocalizedLabels": [
            {
                "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                "Label": "${display_name}",
                "LanguageCode": 1033
            }
        ]
    },
    "DisplayCollectionName": {
        "@odata.type": "Microsoft.Dynamics.CRM.Label",
        "LocalizedLabels": [
            {
                "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                "Label": "${plural_name}",
                "LanguageCode": 1033
            }
        ]
    },
    "Description": {
        "@odata.type": "Microsoft.Dynamics.CRM.Label",
        "LocalizedLabels": [
            {
                "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                "Label": "${description}",
                "LanguageCode": 1033
            }
        ]
    },
    "OwnershipType": "${ownership_type}",
    "IsActivity": false,
    "HasNotes": false,
    "HasActivities": false,
    "PrimaryNameAttribute": "${schema_name}id",
    "Attributes": [
        {
            "@odata.type": "Microsoft.Dynamics.CRM.StringAttributeMetadata",
            "AttributeType": "String",
            "AttributeTypeName": {
                "Value": "StringType"
            },
            "SchemaName": "${PREFIX}_newcolumn",
            "MaxLength": 500,
            "FormatName": {
                "Value": "Text"
            },
            "RequiredLevel": {
                "Value": "ApplicationRequired",
                "CanBeChanged": true
            },
            "IsPrimaryName": true,
            "DisplayName": {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                "LocalizedLabels": [
                    {
                        "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                        "Label": "Name",
                        "LanguageCode": 1033
                    }
                ]
            },
            "Description": {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                "LocalizedLabels": [
                    {
                        "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                        "Label": "Primary name field",
                        "LanguageCode": 1033
                    }
                ]
            }
        }
    ]
}
EOF
)

    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/EntityDefinitions" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -H "OData-MaxVersion: 4.0" \
        -H "OData-Version: 4.0" \
        -H "Accept: application/json" \
        -H "MSCRM.SolutionUniqueName: ConsultingAgentBase" \
        -d "$payload")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "204" ] || [ "$http_code" = "201" ]; then
        echo "  ✓ Created successfully"
    else
        echo "  ✗ Failed (HTTP $http_code)"
        echo "  Response: $body"
    fi
}

# Create each table
create_table "ca_framework" "Framework" "Frameworks" "Library of consulting frameworks and methodologies" "OrganizationOwned"
create_table "ca_framework_usage" "Framework Usage" "Framework Usages" "Log of framework usage in sessions" "UserOwned"
create_table "ca_analysis" "Analysis" "Analyses" "Consulting analyses and assessments" "UserOwned"
create_table "ca_recommendation" "Recommendation" "Recommendations" "Strategic recommendations from consulting sessions" "UserOwned"
create_table "ca_benchmarks" "Benchmark" "Benchmarks" "Consulting benchmark data for industry comparisons" "OrganizationOwned"
create_table "ca_deliverable" "Deliverable" "Deliverables" "Generated consulting deliverables" "UserOwned"
create_table "ca_learning" "Learning" "Learnings" "Learning resources from consulting sessions" "UserOwned"

echo ""
echo "Done!"
