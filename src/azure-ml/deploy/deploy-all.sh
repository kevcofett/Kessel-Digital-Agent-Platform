#!/bin/bash
# KDAP Azure ML Deployment Script
# Version: 1.0.0
# Date: January 19, 2026

set -e

# ============================================================
# CONFIGURATION
# ============================================================

SUBSCRIPTION_ID="${AZURE_SUBSCRIPTION_ID}"
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-kdap-resource-group}"
ML_WORKSPACE="${AZURE_ML_WORKSPACE:-kdap-ml-workspace}"
LOCATION="${AZURE_REGION:-eastus}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Endpoints to deploy
ENDPOINTS=(
    "kdap-budget-optimizer"
    "kdap-propensity"
    "kdap-anomaly-detector"
    "kdap-monte-carlo"
    "kdap-media-mix"
    "kdap-attribution"
    "kdap-prioritizer"
)

# ============================================================
# HELPER FUNCTIONS
# ============================================================

log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v az &> /dev/null; then
        log_error "Azure CLI not found. Please install: https://docs.microsoft.com/cli/azure/install-azure-cli"
        exit 1
    fi
    
    if ! az account show &> /dev/null; then
        log_error "Not logged into Azure. Please run: az login"
        exit 1
    fi
    
    if [ -z "$SUBSCRIPTION_ID" ]; then
        log_error "AZURE_SUBSCRIPTION_ID not set"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# ============================================================
# RESOURCE GROUP & WORKSPACE
# ============================================================

create_resource_group() {
    log_info "Creating resource group: $RESOURCE_GROUP"
    
    if az group show --name "$RESOURCE_GROUP" &> /dev/null; then
        log_info "Resource group already exists"
    else
        az group create --name "$RESOURCE_GROUP" --location "$LOCATION"
        log_success "Resource group created"
    fi
}

create_ml_workspace() {
    log_info "Creating ML workspace: $ML_WORKSPACE"
    
    if az ml workspace show --name "$ML_WORKSPACE" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        log_info "ML workspace already exists"
    else
        az ml workspace create \
            --name "$ML_WORKSPACE" \
            --resource-group "$RESOURCE_GROUP" \
            --location "$LOCATION"
        log_success "ML workspace created"
    fi
}

# ============================================================
# ENDPOINT DEPLOYMENT
# ============================================================

deploy_endpoint() {
    local endpoint_name=$1

    log_info "Deploying endpoint: $endpoint_name"

    # Check if endpoint exists
    if az ml online-endpoint show \
        --name "$endpoint_name" \
        --resource-group "$RESOURCE_GROUP" \
        --workspace-name "$ML_WORKSPACE" &> /dev/null; then
        log_info "Endpoint $endpoint_name already exists, skipping creation..."
    else
        log_info "Creating new endpoint: $endpoint_name"

        # Create endpoint YAML
        local endpoint_yaml="$SCRIPT_DIR/tmp-endpoint-${endpoint_name}.yaml"
        cat > "$endpoint_yaml" << EOF
\$schema: https://azuremlschemas.azureedge.net/latest/managedOnlineEndpoint.schema.json
name: $endpoint_name
auth_mode: key
EOF

        # Create endpoint using YAML file
        az ml online-endpoint create \
            --file "$endpoint_yaml" \
            --resource-group "$RESOURCE_GROUP" \
            --workspace-name "$ML_WORKSPACE"

        # Cleanup temp file
        rm -f "$endpoint_yaml"
    fi

    log_success "Endpoint $endpoint_name deployed"
}

deploy_model() {
    local endpoint_name=$1
    local deployment_name="blue"

    log_info "Deploying model to: $endpoint_name"

    # Map endpoint to scoring script and environment
    local scoring_script=""
    local env_file=""
    case $endpoint_name in
        "kdap-budget-optimizer")
            scoring_script="score_budget_optimization.py"
            env_file="budget-optimization-env.yaml"
            ;;
        "kdap-propensity")
            scoring_script="score_propensity.py"
            env_file="propensity-env.yaml"
            ;;
        "kdap-anomaly-detector")
            scoring_script="score_anomaly.py"
            env_file="anomaly-env.yaml"
            ;;
        "kdap-monte-carlo")
            scoring_script="score_monte_carlo.py"
            env_file="monte-carlo-env.yaml"
            ;;
        "kdap-media-mix")
            scoring_script="score_media_mix.py"
            env_file="media-mix-env.yaml"
            ;;
        "kdap-attribution")
            scoring_script="score_attribution.py"
            env_file="attribution-env.yaml"
            ;;
        "kdap-prioritizer")
            scoring_script="score_prioritization.py"
            env_file="prioritization-env.yaml"
            ;;
    esac

    # Create temporary deployment YAML
    local deploy_yaml="$SCRIPT_DIR/tmp-deployment-${endpoint_name}.yaml"
    cat > "$deploy_yaml" << EOF
\$schema: https://azuremlschemas.azureedge.net/latest/managedOnlineDeployment.schema.json
name: $deployment_name
endpoint_name: $endpoint_name
code_configuration:
  code: $SCRIPT_DIR/scoring
  scoring_script: $scoring_script
environment:
  conda_file: $SCRIPT_DIR/environments/$env_file
  image: mcr.microsoft.com/azureml/openmpi4.1.0-ubuntu22.04:latest
instance_type: Standard_DS2_v2
instance_count: 1
EOF

    # Deploy the model using YAML file
    az ml online-deployment create \
        --file "$deploy_yaml" \
        --resource-group "$RESOURCE_GROUP" \
        --workspace-name "$ML_WORKSPACE" \
        --all-traffic

    # Cleanup temp file
    rm -f "$deploy_yaml"

    log_success "Model deployed to $endpoint_name"
}

# ============================================================
# TESTING
# ============================================================

test_endpoint() {
    local endpoint_name=$1
    
    log_info "Testing endpoint: $endpoint_name"
    
    # Get scoring URI and key
    local scoring_uri=$(az ml online-endpoint show \
        --name "$endpoint_name" \
        --resource-group "$RESOURCE_GROUP" \
        --workspace-name "$ML_WORKSPACE" \
        --query "scoring_uri" -o tsv)
    
    local api_key=$(az ml online-endpoint get-credentials \
        --name "$endpoint_name" \
        --resource-group "$RESOURCE_GROUP" \
        --workspace-name "$ML_WORKSPACE" \
        --query "primaryKey" -o tsv)
    
    # Create test payload based on endpoint
    local test_payload=""
    case $endpoint_name in
        "kdap-budget-optimizer")
            test_payload='{"total_budget": 100000, "channels": [{"code": "SEARCH", "historical_roi": 2.5}, {"code": "SOCIAL", "historical_roi": 1.8}], "objective": "maximize_roi"}'
            ;;
        "kdap-propensity")
            test_payload='{"audience_features": [{"id": "user1", "recency_days": 7, "frequency": 5, "monetary_value": 150}], "target_action": "conversion"}'
            ;;
        "kdap-anomaly-detector")
            test_payload='{"metrics": [{"timestamp": "2026-01-01", "value": 100}, {"timestamp": "2026-01-02", "value": 105}, {"timestamp": "2026-01-03", "value": 500}], "sensitivity": 1.0}'
            ;;
        *)
            test_payload='{"test": true}'
            ;;
    esac
    
    # Call endpoint
    local response=$(curl -s -X POST "$scoring_uri" \
        -H "Authorization: Bearer $api_key" \
        -H "Content-Type: application/json" \
        -d "$test_payload")
    
    if echo "$response" | grep -q "error"; then
        log_error "Endpoint test failed: $response"
        return 1
    else
        log_success "Endpoint test passed: $endpoint_name"
        echo "$response" | head -c 200
        echo "..."
    fi
}

# ============================================================
# MAIN
# ============================================================

main() {
    log_info "Starting KDAP Azure ML Deployment"
    log_info "Subscription: $SUBSCRIPTION_ID"
    log_info "Resource Group: $RESOURCE_GROUP"
    log_info "ML Workspace: $ML_WORKSPACE"
    
    check_prerequisites
    
    # Set subscription
    az account set --subscription "$SUBSCRIPTION_ID"
    
    create_resource_group
    create_ml_workspace
    
    # Deploy each endpoint
    for endpoint in "${ENDPOINTS[@]}"; do
        deploy_endpoint "$endpoint"
        deploy_model "$endpoint"
    done
    
    log_info "Waiting 60 seconds for endpoints to warm up..."
    sleep 60
    
    # Test endpoints
    for endpoint in "${ENDPOINTS[@]}"; do
        test_endpoint "$endpoint" || true
    done
    
    log_success "KDAP Azure ML Deployment Complete!"
    log_info "Endpoints deployed: ${#ENDPOINTS[@]}"
}

# Run main
main "$@"
