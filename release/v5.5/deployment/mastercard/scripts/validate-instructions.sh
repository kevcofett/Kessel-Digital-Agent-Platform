#!/bin/bash
# Validate Copilot Studio Instructions
# Checks character count and content compliance

MAX_CHARS=8000

echo "=== Copilot Studio Instructions Validation ==="
echo ""

validate_file() {
    local file=$1
    local name=$2

    if [ ! -f "$file" ]; then
        echo "❌ $name: FILE NOT FOUND"
        return 1
    fi

    local chars=$(wc -c < "$file")
    local lines=$(wc -l < "$file")

    if [ $chars -gt $MAX_CHARS ]; then
        echo "❌ $name: $chars characters (EXCEEDS $MAX_CHARS limit)"
        return 1
    else
        echo "✅ $name: $chars characters, $lines lines"
    fi

    # Check for markdown (should not exist)
    if grep -qE '^#{1,6} |^\*\*|^- |^\* |^```' "$file"; then
        echo "   ⚠️  WARNING: Possible markdown formatting detected"
    fi

    # Check for non-ASCII
    if grep -qP '[^\x00-\x7F]' "$file" 2>/dev/null; then
        echo "   ⚠️  WARNING: Non-ASCII characters detected"
    fi

    return 0
}

AGENTS_DIR="/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents"

echo "Validating MPA Instructions..."
validate_file "$AGENTS_DIR/mpa/mastercard/instructions/MPA_Copilot_Instructions_PRODUCTION.txt" "MPA"

echo ""
echo "Validating CA Instructions..."
validate_file "$AGENTS_DIR/ca/mastercard/instructions/CA_Copilot_Instructions_PRODUCTION.txt" "CA"

echo ""
echo "Validating EAP Instructions..."
validate_file "$AGENTS_DIR/eap/mastercard/instructions/EAP_Copilot_Instructions_PRODUCTION.txt" "EAP"

echo ""
echo "=== Validation Complete ==="
