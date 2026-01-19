#!/bin/bash
# validate_kb_file.sh - KB File Validation Script for MPA v6.0
# Version: 1.0
# Date: 2026-01-18

FILE=$1

if [ -z "$FILE" ]; then
    echo "Usage: ./validate_kb_file.sh <file_path>"
    exit 1
fi

echo "=========================================="
echo "Validating: $FILE"
echo "=========================================="

ERRORS=0

# Check file exists
if [ ! -f "$FILE" ]; then
    echo "FAIL: File does not exist"
    exit 1
fi

# Check character count
CHARS=$(wc -c < "$FILE")
echo "Character count: $CHARS"
if [ $CHARS -gt 36000 ]; then
    echo "FAIL: Character count exceeds 36,000 limit"
    ((ERRORS++))
fi

# Check for unicode characters
if LC_ALL=C grep -P '[^\x00-\x7F]' "$FILE" > /dev/null 2>&1; then
    echo "FAIL: Unicode characters detected"
    LC_ALL=C grep -n -P '[^\x00-\x7F]' "$FILE" | head -5
    ((ERRORS++))
fi

# Check for bullet points (asterisks at line start)
if grep -E '^\s*[\*•]' "$FILE" > /dev/null; then
    echo "FAIL: Bullet points detected (use hyphens)"
    grep -n -E '^\s*[\*•]' "$FILE" | head -5
    ((ERRORS++))
fi

# Check for markdown tables
if grep -E '^\|.*\|$' "$FILE" > /dev/null; then
    echo "FAIL: Markdown table formatting detected"
    ((ERRORS++))
fi

# Check for VERSION in header
if ! head -10 "$FILE" | grep -q "VERSION:"; then
    echo "FAIL: Missing VERSION in document header"
    ((ERRORS++))
fi

# Check for STATUS in header
if ! head -10 "$FILE" | grep -q "STATUS:"; then
    echo "FAIL: Missing STATUS in document header"
    ((ERRORS++))
fi

# Check for COMPLIANCE in header
if ! head -10 "$FILE" | grep -q "COMPLIANCE:"; then
    echo "FAIL: Missing COMPLIANCE in document header"
    ((ERRORS++))
fi

# Check for END OF DOCUMENT
if ! tail -10 "$FILE" | grep -q "END OF DOCUMENT"; then
    echo "FAIL: Missing END OF DOCUMENT marker"
    ((ERRORS++))
fi

# Check for smart quotes
if grep -E '[""]' "$FILE" > /dev/null; then
    echo "FAIL: Smart quotes detected (use straight quotes)"
    grep -n -E '[""]' "$FILE" | head -5
    ((ERRORS++))
fi

# Check for em-dashes
if grep -E '—' "$FILE" > /dev/null; then
    echo "FAIL: Em-dashes detected (use double hyphens)"
    ((ERRORS++))
fi

echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo "PASS: All validation checks passed"
    echo "Character count: $CHARS"
    exit 0
else
    echo "FAIL: $ERRORS validation errors found"
    exit 1
fi
