# Script to create CA tables in Dataverse using Web API
# Requires: PowerShell 7+, Azure AD auth token

param(
    [string]$EnvironmentUrl = "https://aragornai.crm.dynamics.com"
)

# Function to get access token using Azure CLI
function Get-DataverseToken {
    $token = az account get-access-token --resource "$EnvironmentUrl" --query accessToken -o tsv
    return $token
}

# Table definitions following Dataverse naming conventions
$tables = @(
    @{
        SchemaName = "ca_framework"
        DisplayName = "Framework"
        PluralName = "Frameworks"
        Description = "Library of consulting frameworks and methodologies"
        PrimaryNameAttribute = "ca_newcolumn"
        OwnershipType = "None"  # Organization owned
        Columns = @(
            @{ SchemaName = "ca_frameworkcode"; DisplayName = "Framework Code"; Type = "String"; MaxLength = 50; Required = $true }
            @{ SchemaName = "ca_newcolumn"; DisplayName = "Framework Name"; Type = "String"; MaxLength = 100; Required = $true; IsPrimaryName = $true }
            @{ SchemaName = "ca_description"; DisplayName = "Description"; Type = "Memo"; Required = $true }
            @{ SchemaName = "ca_methodology"; DisplayName = "Methodology"; Type = "Memo"; Required = $true }
            @{ SchemaName = "ca_usagecount"; DisplayName = "Usage Count"; Type = "Integer"; Required = $false }
            @{ SchemaName = "ca_isactive"; DisplayName = "Is Active"; Type = "Boolean"; Required = $true }
        )
    },
    @{
        SchemaName = "ca_framework_usage"
        DisplayName = "Framework Usage"
        PluralName = "Framework Usages"
        Description = "Log of framework usage in sessions"
        PrimaryNameAttribute = "ca_newcolumn"
        OwnershipType = "UserOwned"
        Columns = @(
            @{ SchemaName = "ca_newcolumn"; DisplayName = "Name"; Type = "String"; MaxLength = 200; Required = $true; IsPrimaryName = $true }
            @{ SchemaName = "ca_contextsummary"; DisplayName = "Context Summary"; Type = "Memo"; Required = $false }
            @{ SchemaName = "ca_washelpful"; DisplayName = "Was Helpful"; Type = "Boolean"; Required = $false }
        )
    },
    @{
        SchemaName = "ca_analysis"
        DisplayName = "Analysis"
        PluralName = "Analyses"
        Description = "Consulting analyses and assessments"
        PrimaryNameAttribute = "ca_newcolumn"
        OwnershipType = "UserOwned"
        Columns = @(
            @{ SchemaName = "ca_newcolumn"; DisplayName = "Analysis Title"; Type = "String"; MaxLength = 500; Required = $true; IsPrimaryName = $true }
            @{ SchemaName = "ca_analysiscontent"; DisplayName = "Analysis Content"; Type = "Memo"; Required = $true }
            @{ SchemaName = "ca_version"; DisplayName = "Version"; Type = "Integer"; Required = $true }
        )
    },
    @{
        SchemaName = "ca_recommendation"
        DisplayName = "Recommendation"
        PluralName = "Recommendations"
        Description = "Strategic recommendations from consulting sessions"
        PrimaryNameAttribute = "ca_newcolumn"
        OwnershipType = "UserOwned"
        Columns = @(
            @{ SchemaName = "ca_newcolumn"; DisplayName = "Recommendation Title"; Type = "String"; MaxLength = 500; Required = $true; IsPrimaryName = $true }
            @{ SchemaName = "ca_recommendationcontent"; DisplayName = "Recommendation Content"; Type = "Memo"; Required = $true }
            @{ SchemaName = "ca_rationale"; DisplayName = "Rationale"; Type = "Memo"; Required = $false }
        )
    },
    @{
        SchemaName = "ca_benchmarks"
        DisplayName = "Benchmark"
        PluralName = "Benchmarks"
        Description = "Consulting benchmark data for industry comparisons"
        PrimaryNameAttribute = "ca_newcolumn"
        OwnershipType = "None"
        Columns = @(
            @{ SchemaName = "ca_benchmarkcode"; DisplayName = "Benchmark Code"; Type = "String"; MaxLength = 50; Required = $true }
            @{ SchemaName = "ca_newcolumn"; DisplayName = "Benchmark Name"; Type = "String"; MaxLength = 200; Required = $true; IsPrimaryName = $true }
            @{ SchemaName = "ca_metricname"; DisplayName = "Metric Name"; Type = "String"; MaxLength = 100; Required = $true }
            @{ SchemaName = "ca_isactive"; DisplayName = "Is Active"; Type = "Boolean"; Required = $true }
        )
    },
    @{
        SchemaName = "ca_deliverable"
        DisplayName = "Deliverable"
        PluralName = "Deliverables"
        Description = "Generated consulting deliverables"
        PrimaryNameAttribute = "ca_newcolumn"
        OwnershipType = "UserOwned"
        Columns = @(
            @{ SchemaName = "ca_newcolumn"; DisplayName = "Deliverable Name"; Type = "String"; MaxLength = 500; Required = $true; IsPrimaryName = $true }
            @{ SchemaName = "ca_content"; DisplayName = "Content"; Type = "Memo"; Required = $true }
            @{ SchemaName = "ca_version"; DisplayName = "Version"; Type = "Integer"; Required = $true }
        )
    },
    @{
        SchemaName = "ca_learning"
        DisplayName = "Learning"
        PluralName = "Learnings"
        Description = "Learning resources from consulting sessions"
        PrimaryNameAttribute = "ca_newcolumn"
        OwnershipType = "UserOwned"
        Columns = @(
            @{ SchemaName = "ca_newcolumn"; DisplayName = "Title"; Type = "String"; MaxLength = 500; Required = $true; IsPrimaryName = $true }
            @{ SchemaName = "ca_content"; DisplayName = "Content"; Type = "Memo"; Required = $true }
        )
    }
)

Write-Host "CA Tables to create:" -ForegroundColor Cyan
foreach ($table in $tables) {
    Write-Host "  - $($table.SchemaName) ($($table.DisplayName))" -ForegroundColor Yellow
}

Write-Host "`nNote: These tables need to be created manually in Power Apps maker portal"
Write-Host "URL: https://make.powerapps.com/environments/c672b470-9cc7-e9d8-a0e2-ca83751f800c/entities" -ForegroundColor Green
