#!/bin/bash
# sync-kb-to-personal.sh
# Syncs KB files from repo to personal testing directory
#
# Usage: ./scripts/sync-kb-to-personal.sh [target-dir]
#
# Default target: ~/Documents/MPA-Personal-KB

set -e

# Determine script directory and source
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="${SCRIPT_DIR}/../release/v5.5/agents"

# Target directory (default or provided)
TARGET_DIR="${1:-${HOME}/Documents/MPA-Personal-KB}"

echo "=========================================="
echo "KB Sync to Personal Environment"
echo "=========================================="
echo ""
echo "Source: $SOURCE_DIR"
echo "Target: $TARGET_DIR"
echo ""

# Verify source exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "ERROR: Source directory not found: $SOURCE_DIR"
    exit 1
fi

# Create target directories
echo "Creating target directories..."
mkdir -p "$TARGET_DIR/mpa"
mkdir -p "$TARGET_DIR/ca"
mkdir -p "$TARGET_DIR/eap"
echo ""

# Initialize counters
MPA_COUNT=0
CA_COUNT=0
EAP_COUNT=0
TOTAL_COUNT=0

# Sync MPA KB files
echo "--- Syncing MPA KB Files ---"
if [ -d "$SOURCE_DIR/mpa/base/kb" ]; then
    MPA_FILES=$(find "$SOURCE_DIR/mpa/base/kb" -name "*.txt" -type f 2>/dev/null | wc -l | tr -d ' ')
    if [ "$MPA_FILES" -gt 0 ]; then
        cp "$SOURCE_DIR/mpa/base/kb/"*.txt "$TARGET_DIR/mpa/" 2>/dev/null || true
        MPA_COUNT=$(ls -1 "$TARGET_DIR/mpa"/*.txt 2>/dev/null | wc -l | tr -d ' ')
        echo "MPA: $MPA_COUNT files synced"

        # List synced files
        for f in "$TARGET_DIR/mpa"/*.txt; do
            if [ -f "$f" ]; then
                size=$(wc -c < "$f" | tr -d ' ')
                echo "  - $(basename "$f") (${size} bytes)"
            fi
        done
    else
        echo "MPA: No .txt files found in source"
    fi
else
    echo "MPA: Source directory not found ($SOURCE_DIR/mpa/base/kb)"
fi
echo ""

# Sync CA KB files
echo "--- Syncing CA KB Files ---"
if [ -d "$SOURCE_DIR/ca/base/kb" ]; then
    CA_FILES=$(find "$SOURCE_DIR/ca/base/kb" -name "*.txt" -type f 2>/dev/null | wc -l | tr -d ' ')
    if [ "$CA_FILES" -gt 0 ]; then
        cp "$SOURCE_DIR/ca/base/kb/"*.txt "$TARGET_DIR/ca/" 2>/dev/null || true
        CA_COUNT=$(ls -1 "$TARGET_DIR/ca"/*.txt 2>/dev/null | wc -l | tr -d ' ')
        echo "CA: $CA_COUNT files synced"

        # List synced files
        for f in "$TARGET_DIR/ca"/*.txt; do
            if [ -f "$f" ]; then
                size=$(wc -c < "$f" | tr -d ' ')
                echo "  - $(basename "$f") (${size} bytes)"
            fi
        done
    else
        echo "CA: No .txt files found in source"
    fi
else
    echo "CA: Source directory not found ($SOURCE_DIR/ca/base/kb)"
fi
echo ""

# Sync EAP KB files
echo "--- Syncing EAP KB Files ---"
if [ -d "$SOURCE_DIR/eap/base/kb" ]; then
    EAP_FILES=$(find "$SOURCE_DIR/eap/base/kb" -name "*.txt" -type f 2>/dev/null | wc -l | tr -d ' ')
    if [ "$EAP_FILES" -gt 0 ]; then
        cp "$SOURCE_DIR/eap/base/kb/"*.txt "$TARGET_DIR/eap/" 2>/dev/null || true
        EAP_COUNT=$(ls -1 "$TARGET_DIR/eap"/*.txt 2>/dev/null | wc -l | tr -d ' ')
        echo "EAP: $EAP_COUNT files synced"

        # List synced files
        for f in "$TARGET_DIR/eap"/*.txt; do
            if [ -f "$f" ]; then
                size=$(wc -c < "$f" | tr -d ' ')
                echo "  - $(basename "$f") (${size} bytes)"
            fi
        done
    else
        echo "EAP: No .txt files found in source"
    fi
else
    echo "EAP: Source directory not found ($SOURCE_DIR/eap/base/kb)"
fi
echo ""

# Calculate total
TOTAL_COUNT=$((MPA_COUNT + CA_COUNT + EAP_COUNT))

# Summary
echo "=========================================="
echo "Sync Summary"
echo "=========================================="
echo "MPA files: $MPA_COUNT"
echo "CA files:  $CA_COUNT"
echo "EAP files: $EAP_COUNT"
echo "---"
echo "Total:     $TOTAL_COUNT files"
echo ""

# Verify file integrity
echo "--- Verifying File Integrity ---"
EMPTY_FILES=0
for dir in "$TARGET_DIR/mpa" "$TARGET_DIR/ca" "$TARGET_DIR/eap"; do
    if [ -d "$dir" ]; then
        for f in "$dir"/*.txt 2>/dev/null; do
            if [ -f "$f" ] && [ ! -s "$f" ]; then
                echo "WARNING: Empty file: $(basename "$f")"
                EMPTY_FILES=$((EMPTY_FILES + 1))
            fi
        done
    fi
done

if [ "$EMPTY_FILES" -eq 0 ]; then
    echo "All files have content"
else
    echo "WARNING: $EMPTY_FILES empty files detected"
fi
echo ""

# Create manifest file
MANIFEST="$TARGET_DIR/MANIFEST.txt"
echo "Creating manifest..."
{
    echo "KB Sync Manifest"
    echo "Generated: $(date)"
    echo "Source: $SOURCE_DIR"
    echo ""
    echo "Files:"
    echo "------"
    for agent in mpa ca eap; do
        if [ -d "$TARGET_DIR/$agent" ]; then
            for f in "$TARGET_DIR/$agent"/*.txt 2>/dev/null; do
                if [ -f "$f" ]; then
                    echo "$agent/$(basename "$f")"
                fi
            done
        fi
    done
} > "$MANIFEST"
echo "Manifest written to: $MANIFEST"
echo ""

if [ "$TOTAL_COUNT" -gt 0 ]; then
    echo "Sync complete!"
    exit 0
else
    echo "WARNING: No files were synced"
    exit 1
fi
