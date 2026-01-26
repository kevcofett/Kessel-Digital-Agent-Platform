#!/bin/bash
# Convert all MCMAP markdown files to DOCX with footer formatting
# Uses reference.docx template for consistent styling

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
MARKDOWN_DIR="$BASE_DIR/markdown"
DOCX_DIR="$BASE_DIR/docx"
TEMPLATE="$BASE_DIR/templates/reference.docx"

echo "MCMAP Documentation Converter"
echo "=============================="
echo "Markdown dir: $MARKDOWN_DIR"
echo "Output dir: $DOCX_DIR"
echo "Template: $TEMPLATE"
echo ""

# Check template exists
if [ ! -f "$TEMPLATE" ]; then
    echo "ERROR: Template not found at $TEMPLATE"
    exit 1
fi

# Create output directory if needed
mkdir -p "$DOCX_DIR"

# Convert each markdown file
count=0
for md_file in "$MARKDOWN_DIR"/*.md; do
    if [ -f "$md_file" ]; then
        filename=$(basename "$md_file" .md)
        docx_file="$DOCX_DIR/${filename}.docx"

        echo "Converting: $filename.md"

        pandoc "$md_file" \
            -o "$docx_file" \
            --reference-doc="$TEMPLATE" \
            --from markdown+raw_attribute \
            --to docx

        if [ $? -eq 0 ]; then
            count=$((count + 1))
        else
            echo "  ERROR: Failed to convert $filename"
        fi
    fi
done

echo ""
echo "Complete: $count files converted"
echo "Output: $DOCX_DIR"
echo ""

# Post-process: Fix heading colors to Mastercard Orange
echo "Post-processing: Fixing heading colors..."
python3 "$SCRIPT_DIR/fix_heading_colors.py"
