#!/bin/bash
# MPA v6 Architecture Documents Handoff Script
# Run this script after downloading files from Claude.ai

REPO_PATH="/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform"
DOWNLOADS_PATH="$HOME/Downloads"

# Create destination directories
mkdir -p "$REPO_PATH/release/v6.0/docs/architecture"
mkdir -p "$REPO_PATH/release/v6.0/docs/decisions"
mkdir -p "$REPO_PATH/release/v6.0/docs/operations"
mkdir -p "$REPO_PATH/release/v6.0/docs/planning"

echo "=== MPA v6 Architecture Files Copy Script ==="
echo ""

# Architecture files
echo "Copying architecture files..."
cp "$DOWNLOADS_PATH/MPA_v6_Architecture_Final.md" "$REPO_PATH/release/v6.0/docs/architecture/" 2>/dev/null && echo "✓ MPA_v6_Architecture_Final.md" || echo "✗ MPA_v6_Architecture_Final.md - not found in Downloads"
cp "$DOWNLOADS_PATH/MPA_v6_Dataverse_Schema.md" "$REPO_PATH/release/v6.0/docs/architecture/" 2>/dev/null && echo "✓ MPA_v6_Dataverse_Schema.md" || echo "✗ MPA_v6_Dataverse_Schema.md - not found"
cp "$DOWNLOADS_PATH/MPA_v6_AI_Builder_Prompts.md" "$REPO_PATH/release/v6.0/docs/architecture/" 2>/dev/null && echo "✓ MPA_v6_AI_Builder_Prompts.md" || echo "✗ MPA_v6_AI_Builder_Prompts.md - not found"
cp "$DOWNLOADS_PATH/MPA_v6_Azure_Functions.md" "$REPO_PATH/release/v6.0/docs/architecture/" 2>/dev/null && echo "✓ MPA_v6_Azure_Functions.md" || echo "✗ MPA_v6_Azure_Functions.md - not found"
cp "$DOWNLOADS_PATH/MPA_v6_CA_Framework_Expansion.md" "$REPO_PATH/release/v6.0/docs/architecture/" 2>/dev/null && echo "✓ MPA_v6_CA_Framework_Expansion.md" || echo "✗ MPA_v6_CA_Framework_Expansion.md - not found"
cp "$DOWNLOADS_PATH/MPA_v6_Integrated_Model_Expansion.md" "$REPO_PATH/release/v6.0/docs/architecture/" 2>/dev/null && echo "✓ MPA_v6_Integrated_Model_Expansion.md" || echo "✗ MPA_v6_Integrated_Model_Expansion.md - not found"

# Decisions files
echo ""
echo "Copying decisions files..."
cp "$DOWNLOADS_PATH/MPA_v6_Architecture_Decisions_Summary.md" "$REPO_PATH/release/v6.0/docs/decisions/" 2>/dev/null && echo "✓ MPA_v6_Architecture_Decisions_Summary.md" || echo "✗ MPA_v6_Architecture_Decisions_Summary.md - not found"
cp "$DOWNLOADS_PATH/MPA_v6_Architecture_Pivot_v2.md" "$REPO_PATH/release/v6.0/docs/decisions/" 2>/dev/null && echo "✓ MPA_v6_Architecture_Pivot_v2.md" || echo "✗ MPA_v6_Architecture_Pivot_v2.md - not found"
cp "$DOWNLOADS_PATH/MPA_v6_Model_Expansion_Evaluation.md" "$REPO_PATH/release/v6.0/docs/decisions/" 2>/dev/null && echo "✓ MPA_v6_Model_Expansion_Evaluation.md" || echo "✗ MPA_v6_Model_Expansion_Evaluation.md - not found"

# Operations files
echo ""
echo "Copying operations files..."
cp "$DOWNLOADS_PATH/VSCODE_Instructions.md" "$REPO_PATH/release/v6.0/docs/operations/" 2>/dev/null && echo "✓ VSCODE_Instructions.md" || echo "✗ VSCODE_Instructions.md - not found"
cp "$DOWNLOADS_PATH/DESKTOP_Instructions.md" "$REPO_PATH/release/v6.0/docs/operations/" 2>/dev/null && echo "✓ DESKTOP_Instructions.md" || echo "✗ DESKTOP_Instructions.md - not found"

# Planning files
echo ""
echo "Copying planning files..."
cp "$DOWNLOADS_PATH/MPA_v6_Unified_Build_Plan.md" "$REPO_PATH/release/v6.0/docs/planning/" 2>/dev/null && echo "✓ MPA_v6_Unified_Build_Plan.md" || echo "✗ MPA_v6_Unified_Build_Plan.md - not found"
cp "$DOWNLOADS_PATH/MPA_v6_Approved_File_List.md" "$REPO_PATH/release/v6.0/docs/planning/" 2>/dev/null && echo "✓ MPA_v6_Approved_File_List.md" || echo "✗ MPA_v6_Approved_File_List.md - not found"

# Git operations
echo ""
echo "=== Git Operations ==="
cd "$REPO_PATH"
git add release/v6.0/docs/
git status --short release/v6.0/docs/

echo ""
echo "Ready to commit. Run:"
echo "  cd $REPO_PATH"
echo "  git commit -m 'docs(mpa): Add MPA v6.0 architecture documentation suite'"
echo "  git push origin feature/v6.0-kb-expansion"
