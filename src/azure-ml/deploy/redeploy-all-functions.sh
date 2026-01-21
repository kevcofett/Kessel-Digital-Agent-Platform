#!/usr/bin/env bash
# Redeploy all ML endpoints with build support and fixed module imports

set -e

RESOURCE_GROUP="kdap-resource-group"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ENDPOINTS=(
    "budget-optimizer:score_budget_optimization"
    "propensity:score_propensity"
    "anomaly-detector:score_anomaly"
    "monte-carlo:score_monte_carlo"
    "media-mix:score_media_mix"
    "attribution:score_attribution"
    "prioritizer:score_prioritization"
)

deploy_endpoint() {
    local endpoint_name=$1
    local scoring_module=$2
    local function_app_name="kdap-ml-${endpoint_name}"

    echo "=========================================="
    echo "Deploying: $function_app_name"
    echo "=========================================="

    # Remove WEBSITE_RUN_FROM_PACKAGE if set
    az webapp config appsettings delete --name "$function_app_name" --resource-group "$RESOURCE_GROUP" --setting-names WEBSITE_RUN_FROM_PACKAGE 2>/dev/null || true

    local func_dir=$(mktemp -d)

    # Create function structure
    mkdir -p "$func_dir/score" "$func_dir/scoring"

    # function.json
    cat > "$func_dir/score/function.json" << 'EOF'
{
    "scriptFile": "__init__.py",
    "bindings": [
        {"authLevel": "function", "type": "httpTrigger", "direction": "in", "name": "req", "methods": ["post"]},
        {"type": "http", "direction": "out", "name": "$return"}
    ]
}
EOF

    # __init__.py with proper module import
    cat > "$func_dir/score/__init__.py" << INITEOF
import json
import azure.functions as func
import sys, os
wwwroot = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if wwwroot not in sys.path:
    sys.path.insert(0, wwwroot)
try:
    from scoring.${scoring_module} import init, run
    init()
    MODULE_LOADED = True
    LOAD_ERROR = None
except Exception as e:
    MODULE_LOADED = False
    LOAD_ERROR = str(e)

def main(req: func.HttpRequest) -> func.HttpResponse:
    if not MODULE_LOADED:
        return func.HttpResponse(json.dumps({"error": f"Module not loaded: {LOAD_ERROR}"}), status_code=500, mimetype="application/json")
    try:
        result = run(json.dumps(req.get_json()))
        return func.HttpResponse(result, mimetype="application/json")
    except Exception as e:
        return func.HttpResponse(json.dumps({"error": str(e)}), status_code=500, mimetype="application/json")
INITEOF

    # Copy scoring scripts
    cp "$SCRIPT_DIR/scoring/"*.py "$func_dir/scoring/"
    touch "$func_dir/scoring/__init__.py"

    # requirements.txt
    cat > "$func_dir/requirements.txt" << 'EOF'
azure-functions
numpy
scipy
pandas
scikit-learn
EOF

    # host.json
    cat > "$func_dir/host.json" << 'EOF'
{"version": "2.0", "extensionBundle": {"id": "Microsoft.Azure.Functions.ExtensionBundle", "version": "[3.*, 4.0.0)"}}
EOF

    # Deploy
    cd "$func_dir"
    zip -rq deploy.zip . -x "*.git*"

    az functionapp deployment source config-zip \
        --name "$function_app_name" \
        --resource-group "$RESOURCE_GROUP" \
        --src deploy.zip \
        --build-remote true

    rm -rf "$func_dir"
    echo "Deployed: $function_app_name"
    echo ""
}

echo "Starting deployment of all ML endpoints..."
echo ""

for entry in "${ENDPOINTS[@]}"; do
    endpoint_name="${entry%%:*}"
    scoring_module="${entry##*:}"
    deploy_endpoint "$endpoint_name" "$scoring_module"
done

echo "=========================================="
echo "All endpoints deployed!"
echo "=========================================="
echo ""
echo "Testing endpoints..."

for entry in "${ENDPOINTS[@]}"; do
    endpoint_name="${entry%%:*}"
    function_app_name="kdap-ml-${endpoint_name}"

    func_key=$(az functionapp keys list --name "$function_app_name" --resource-group "$RESOURCE_GROUP" --query "functionKeys.default" -o tsv 2>/dev/null || echo "")

    if [ -n "$func_key" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "https://${function_app_name}.azurewebsites.net/api/score?code=$func_key" \
            -H "Content-Type: application/json" \
            -d '{"test": true}' 2>&1)

        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | head -n-1)

        if [ "$http_code" = "200" ]; then
            echo "✓ $function_app_name: OK"
        else
            echo "✗ $function_app_name: HTTP $http_code"
        fi
    else
        echo "? $function_app_name: No function key"
    fi
done
