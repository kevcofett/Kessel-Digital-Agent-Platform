#!/usr/bin/env bash
# KDAP Azure Functions Deployment Script
# Version: 1.0.0
# Date: January 20, 2026
#
# Deploys ML scoring endpoints as Azure Functions
# Serverless, no Docker required

set -e

# ============================================================
# CONFIGURATION
# ============================================================

SUBSCRIPTION_ID="${AZURE_SUBSCRIPTION_ID}"
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-kdap-resource-group}"
LOCATION="${AZURE_REGION:-eastus}"
STORAGE_ACCOUNT="kdapfuncstorage$(date +%s | tail -c 5)"
FUNCTION_APP_PREFIX="kdap-ml"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Endpoints to deploy
ENDPOINTS=(
    "budget-optimizer:score_budget_optimization.py"
    "propensity:score_propensity.py"
    "anomaly-detector:score_anomaly.py"
    "monte-carlo:score_monte_carlo.py"
    "media-mix:score_media_mix.py"
    "attribution:score_attribution.py"
    "prioritizer:score_prioritization.py"
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
        log_error "Azure CLI not found"
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

    # Check for func CLI
    if ! command -v func &> /dev/null; then
        log_info "Azure Functions Core Tools not found, will deploy via CLI"
    fi

    log_success "Prerequisites check passed"
}

# ============================================================
# STORAGE ACCOUNT
# ============================================================

create_storage_account() {
    log_info "Creating storage account: $STORAGE_ACCOUNT"

    if az storage account show --name "$STORAGE_ACCOUNT" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        log_info "Storage account already exists"
    else
        az storage account create \
            --name "$STORAGE_ACCOUNT" \
            --resource-group "$RESOURCE_GROUP" \
            --location "$LOCATION" \
            --sku Standard_LRS \
            --kind StorageV2
        log_success "Storage account created"
    fi
}

# ============================================================
# FUNCTION APP DEPLOYMENT
# ============================================================

create_function_app() {
    local endpoint_name=$1
    local function_app_name="${FUNCTION_APP_PREFIX}-${endpoint_name}"

    log_info "Creating Function App: $function_app_name"

    # Check if exists
    if az functionapp show --name "$function_app_name" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        log_info "Function App already exists"
        return 0
    fi

    # Create Function App
    az functionapp create \
        --name "$function_app_name" \
        --resource-group "$RESOURCE_GROUP" \
        --storage-account "$STORAGE_ACCOUNT" \
        --consumption-plan-location "$LOCATION" \
        --runtime python \
        --runtime-version 3.10 \
        --functions-version 4 \
        --os-type Linux

    log_success "Function App created: $function_app_name"
}

deploy_function_code() {
    local endpoint_name=$1
    local scoring_script=$2
    local function_app_name="${FUNCTION_APP_PREFIX}-${endpoint_name}"

    log_info "Deploying code to: $function_app_name"

    # Create temporary function directory
    local func_dir=$(mktemp -d)

    # Create function.json
    mkdir -p "$func_dir/score"
    cat > "$func_dir/score/function.json" << 'EOF'
{
    "scriptFile": "__init__.py",
    "bindings": [
        {
            "authLevel": "function",
            "type": "httpTrigger",
            "direction": "in",
            "name": "req",
            "methods": ["post"]
        },
        {
            "type": "http",
            "direction": "out",
            "name": "$return"
        }
    ]
}
EOF

    # Create __init__.py that wraps the scoring script
    cat > "$func_dir/score/__init__.py" << EOF
import json
import logging
import traceback
import azure.functions as func

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import scoring module
import sys
import os

# Add the wwwroot directory to the path
wwwroot = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if wwwroot not in sys.path:
    sys.path.insert(0, wwwroot)

logger.info(f"Python path: {sys.path}")
logger.info(f"Working directory: {os.getcwd()}")
logger.info(f"wwwroot: {wwwroot}")

try:
    from scoring.${scoring_script%.py} import init, run
    logger.info("Scoring module imported successfully")
    # Initialize on cold start
    init()
    logger.info("Scoring module initialized")
    MODULE_LOADED = True
except Exception as e:
    logger.error(f"Failed to import scoring module: {e}")
    logger.error(traceback.format_exc())
    MODULE_LOADED = False
    LOAD_ERROR = str(e)

def main(req: func.HttpRequest) -> func.HttpResponse:
    logger.info('Score function processing request')

    if not MODULE_LOADED:
        return func.HttpResponse(
            json.dumps({"error": f"Module not loaded: {LOAD_ERROR}"}),
            status_code=500,
            mimetype="application/json"
        )

    try:
        req_body = req.get_json()
        logger.info(f"Request body: {req_body}")
        result = run(json.dumps(req_body))
        logger.info(f"Result: {result[:200] if len(result) > 200 else result}")
        return func.HttpResponse(result, mimetype="application/json")
    except ValueError as ve:
        logger.error(f"Invalid JSON in request: {ve}")
        return func.HttpResponse(
            json.dumps({"error": f"Invalid JSON: {str(ve)}"}),
            status_code=400,
            mimetype="application/json"
        )
    except Exception as e:
        logger.error(f"Scoring error: {e}")
        logger.error(traceback.format_exc())
        return func.HttpResponse(
            json.dumps({"error": str(e), "traceback": traceback.format_exc()}),
            status_code=500,
            mimetype="application/json"
        )
EOF

    # Copy scoring scripts and create package
    mkdir -p "$func_dir/scoring"
    cp "$SCRIPT_DIR/scoring/"*.py "$func_dir/scoring/"

    # Create __init__.py to make scoring a proper Python package
    touch "$func_dir/scoring/__init__.py"

    # Create requirements.txt
    cat > "$func_dir/requirements.txt" << 'EOF'
azure-functions
numpy
scipy
pandas
scikit-learn
EOF

    # Create host.json
    cat > "$func_dir/host.json" << 'EOF'
{
    "version": "2.0",
    "logging": {
        "applicationInsights": {
            "samplingSettings": {
                "isEnabled": true,
                "excludedTypes": "Request"
            }
        }
    },
    "extensionBundle": {
        "id": "Microsoft.Azure.Functions.ExtensionBundle",
        "version": "[3.*, 4.0.0)"
    }
}
EOF

    # Deploy via zip deploy
    cd "$func_dir"
    zip -r deploy.zip . -x "*.git*"

    az functionapp deployment source config-zip \
        --name "$function_app_name" \
        --resource-group "$RESOURCE_GROUP" \
        --src deploy.zip

    # Cleanup
    rm -rf "$func_dir"

    # Get function URL
    local func_url=$(az functionapp function show \
        --name "$function_app_name" \
        --resource-group "$RESOURCE_GROUP" \
        --function-name score \
        --query "invokeUrlTemplate" -o tsv 2>/dev/null || echo "")

    if [ -z "$func_url" ]; then
        func_url="https://${function_app_name}.azurewebsites.net/api/score"
    fi

    log_success "Deployed: $func_url"
    echo "$func_url"
}

# ============================================================
# TESTING
# ============================================================

test_function() {
    local endpoint_name=$1
    local function_app_name="${FUNCTION_APP_PREFIX}-${endpoint_name}"

    log_info "Testing: $function_app_name"

    # Get function key
    local func_key=$(az functionapp keys list \
        --name "$function_app_name" \
        --resource-group "$RESOURCE_GROUP" \
        --query "functionKeys.default" -o tsv 2>/dev/null || echo "")

    local func_url="https://${function_app_name}.azurewebsites.net/api/score"

    # Test request
    local test_payload='{"test": true}'
    local response=$(curl -s -X POST "$func_url" \
        -H "Content-Type: application/json" \
        -H "x-functions-key: $func_key" \
        -d "$test_payload" 2>&1)

    if echo "$response" | grep -q "error"; then
        log_error "Test failed: $response"
        return 1
    else
        log_success "Test passed"
        echo "$response" | head -c 200
    fi
}

# ============================================================
# MAIN
# ============================================================

main() {
    log_info "Starting KDAP Azure Functions Deployment"
    log_info "Subscription: $SUBSCRIPTION_ID"
    log_info "Resource Group: $RESOURCE_GROUP"

    check_prerequisites

    # Set subscription
    az account set --subscription "$SUBSCRIPTION_ID"

    # Create storage account
    create_storage_account

    # Track deployed endpoints (using temp file for portability)
    local urls_file=$(mktemp)

    # Deploy each endpoint
    for entry in "${ENDPOINTS[@]}"; do
        endpoint_name="${entry%%:*}"
        scoring_script="${entry##*:}"

        log_info "Processing: $endpoint_name -> $scoring_script"

        # Create function app
        create_function_app "$endpoint_name"

        # Deploy code
        func_url=$(deploy_function_code "$endpoint_name" "$scoring_script")
        echo "$endpoint_name|$func_url" >> "$urls_file"
    done

    log_info "Waiting 30 seconds for cold start..."
    sleep 30

    # Test endpoints
    for entry in "${ENDPOINTS[@]}"; do
        endpoint_name="${entry%%:*}"
        test_function "$endpoint_name" || true
    done

    # Summary
    log_success "KDAP Azure Functions Deployment Complete!"
    echo ""
    echo "Deployed Endpoints:"
    echo "==================="
    while IFS='|' read -r name url; do
        echo "  $name: $url"
    done < "$urls_file"

    # Cleanup
    rm -f "$urls_file"
}

# Run main
main "$@"
