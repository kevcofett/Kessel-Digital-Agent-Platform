#!/bin/bash
# KDAP Azure Container Instances Deployment Script
# Version: 1.0.0
# Date: January 20, 2026
#
# Deploys ML scoring endpoints as Azure Container Instances
# Alternative to managed online endpoints with simpler setup

set -e

# ============================================================
# CONFIGURATION
# ============================================================

SUBSCRIPTION_ID="${AZURE_SUBSCRIPTION_ID}"
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-kdap-resource-group}"
LOCATION="${AZURE_REGION:-eastus}"
ACR_NAME="${AZURE_ACR_NAME:-kdapacr$(date +%s | tail -c 5)}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Endpoints to deploy
declare -A ENDPOINTS=(
    ["kdap-budget-optimizer"]="score_budget_optimization.py"
    ["kdap-propensity"]="score_propensity.py"
    ["kdap-anomaly-detector"]="score_anomaly.py"
    ["kdap-monte-carlo"]="score_monte_carlo.py"
    ["kdap-media-mix"]="score_media_mix.py"
    ["kdap-attribution"]="score_attribution.py"
    ["kdap-prioritizer"]="score_prioritization.py"
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

    if ! command -v docker &> /dev/null; then
        log_error "Docker not found. Please install Docker"
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
# CONTAINER REGISTRY
# ============================================================

create_container_registry() {
    log_info "Creating Azure Container Registry: $ACR_NAME"

    if az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        log_info "ACR already exists"
    else
        az acr create \
            --name "$ACR_NAME" \
            --resource-group "$RESOURCE_GROUP" \
            --location "$LOCATION" \
            --sku Basic \
            --admin-enabled true
        log_success "ACR created"
    fi

    # Get login credentials
    ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query "loginServer" -o tsv)
    ACR_USERNAME=$(az acr credential show --name "$ACR_NAME" --query "username" -o tsv)
    ACR_PASSWORD=$(az acr credential show --name "$ACR_NAME" --query "passwords[0].value" -o tsv)

    # Login to ACR
    echo "$ACR_PASSWORD" | docker login "$ACR_LOGIN_SERVER" -u "$ACR_USERNAME" --password-stdin
    log_success "Logged into ACR: $ACR_LOGIN_SERVER"
}

# ============================================================
# DOCKER IMAGE BUILD
# ============================================================

build_scoring_image() {
    local endpoint_name=$1
    local scoring_script=$2

    log_info "Building Docker image for: $endpoint_name"

    local image_name="$ACR_LOGIN_SERVER/$endpoint_name:latest"
    local dockerfile="$SCRIPT_DIR/Dockerfile.scoring"

    # Create Dockerfile if not exists
    if [ ! -f "$dockerfile" ]; then
        cat > "$dockerfile" << 'DOCKERFILE'
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir \
    flask \
    gunicorn \
    numpy \
    scipy \
    pandas \
    scikit-learn

# Copy scoring script
COPY scoring/ /app/scoring/

# Create Flask wrapper
COPY <<'FLASK_APP' /app/app.py
import os
import sys
import json
from flask import Flask, request, jsonify

# Add scoring directory to path
sys.path.insert(0, '/app/scoring')

# Import the scoring module
scoring_script = os.environ.get('SCORING_SCRIPT', 'score_budget_optimization.py')
module_name = scoring_script.replace('.py', '')
scoring_module = __import__(module_name)

app = Flask(__name__)

# Initialize on startup
scoring_module.init()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"})

@app.route('/score', methods=['POST'])
def score():
    try:
        data = request.get_json()
        result = scoring_module.run(json.dumps(data))
        return jsonify(json.loads(result))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
FLASK_APP

EXPOSE 5000

CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
DOCKERFILE
    fi

    # Build image
    docker build \
        -t "$image_name" \
        -f "$dockerfile" \
        --build-arg SCORING_SCRIPT="$scoring_script" \
        "$SCRIPT_DIR"

    # Push to ACR
    docker push "$image_name"

    log_success "Image pushed: $image_name"
    echo "$image_name"
}

# ============================================================
# ACI DEPLOYMENT
# ============================================================

deploy_aci() {
    local endpoint_name=$1
    local image_name=$2

    log_info "Deploying ACI: $endpoint_name"

    # Delete if exists
    az container delete \
        --name "$endpoint_name" \
        --resource-group "$RESOURCE_GROUP" \
        --yes 2>/dev/null || true

    # Create ACI
    az container create \
        --name "$endpoint_name" \
        --resource-group "$RESOURCE_GROUP" \
        --image "$image_name" \
        --registry-login-server "$ACR_LOGIN_SERVER" \
        --registry-username "$ACR_USERNAME" \
        --registry-password "$ACR_PASSWORD" \
        --dns-name-label "$endpoint_name" \
        --ports 5000 \
        --cpu 1 \
        --memory 1.5 \
        --environment-variables SCORING_SCRIPT="${ENDPOINTS[$endpoint_name]}" \
        --restart-policy OnFailure

    # Get FQDN
    local fqdn=$(az container show \
        --name "$endpoint_name" \
        --resource-group "$RESOURCE_GROUP" \
        --query "ipAddress.fqdn" -o tsv)

    log_success "ACI deployed: http://$fqdn:5000"
    echo "http://$fqdn:5000"
}

# ============================================================
# TESTING
# ============================================================

test_endpoint() {
    local endpoint_name=$1
    local endpoint_url=$2

    log_info "Testing endpoint: $endpoint_name"

    # Wait for container to be ready
    sleep 10

    # Health check
    local health_response=$(curl -s "${endpoint_url}/health" 2>&1)

    if echo "$health_response" | grep -q "healthy"; then
        log_success "Health check passed: $endpoint_name"

        # Test scoring
        local test_payload='{"test": true}'
        local score_response=$(curl -s -X POST "${endpoint_url}/score" \
            -H "Content-Type: application/json" \
            -d "$test_payload" 2>&1)

        echo "Score response: $score_response"
    else
        log_error "Health check failed: $health_response"
        return 1
    fi
}

# ============================================================
# MAIN
# ============================================================

main() {
    log_info "Starting KDAP ACI Deployment"
    log_info "Subscription: $SUBSCRIPTION_ID"
    log_info "Resource Group: $RESOURCE_GROUP"

    check_prerequisites

    # Set subscription
    az account set --subscription "$SUBSCRIPTION_ID"

    # Create ACR
    create_container_registry

    # Track deployed endpoints
    declare -A DEPLOYED_URLS

    # Deploy each endpoint
    for endpoint_name in "${!ENDPOINTS[@]}"; do
        scoring_script="${ENDPOINTS[$endpoint_name]}"

        log_info "Processing: $endpoint_name -> $scoring_script"

        # Build and push image
        image_name=$(build_scoring_image "$endpoint_name" "$scoring_script")

        # Deploy to ACI
        endpoint_url=$(deploy_aci "$endpoint_name" "$image_name")
        DEPLOYED_URLS[$endpoint_name]=$endpoint_url
    done

    log_info "Waiting 30 seconds for containers to start..."
    sleep 30

    # Test endpoints
    for endpoint_name in "${!DEPLOYED_URLS[@]}"; do
        test_endpoint "$endpoint_name" "${DEPLOYED_URLS[$endpoint_name]}" || true
    done

    # Summary
    log_success "KDAP ACI Deployment Complete!"
    echo ""
    echo "Deployed Endpoints:"
    echo "==================="
    for endpoint_name in "${!DEPLOYED_URLS[@]}"; do
        echo "  $endpoint_name: ${DEPLOYED_URLS[$endpoint_name]}"
    done
}

# Run main
main "$@"
