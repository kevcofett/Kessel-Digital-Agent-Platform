#!/usr/bin/env python3
"""
Post-process DOCX files to ensure all headings use Mastercard Orange (#FF5F00).

Pandoc's --reference-doc applies style-level colors, but Word may override them
with theme colors (rendering blue). This script explicitly sets every heading
run's font color to Mastercard Orange, bypassing theme color behavior.
"""

import os
import sys
from docx import Document
from docx.shared import RGBColor

MC_ORANGE = RGBColor(0xFF, 0x5F, 0x00)

HEADING_STYLES = {'Heading 1', 'Heading 2', 'Heading 3', 'Heading 4',
                  'Heading 5', 'Heading 6', 'Title', 'Subtitle'}


def fix_heading_colors(docx_path):
    """Set all heading runs to Mastercard Orange in a DOCX file."""
    doc = Document(docx_path)
    headings_fixed = 0

    # Fix style-level colors (belt)
    for style in doc.styles:
        if hasattr(style, 'font') and style.name in HEADING_STYLES:
            style.font.color.rgb = MC_ORANGE

    # Fix run-level colors on every heading paragraph (suspenders)
    for paragraph in doc.paragraphs:
        if paragraph.style.name in HEADING_STYLES:
            for run in paragraph.runs:
                run.font.color.rgb = MC_ORANGE
            headings_fixed += 1

    doc.save(docx_path)
    return headings_fixed


def main():
    if len(sys.argv) > 1:
        # Process specific files passed as arguments
        docx_files = sys.argv[1:]
    else:
        # Process all DOCX files in the default directory
        base_dir = os.path.dirname(os.path.dirname(__file__))
        docx_dir = os.path.join(base_dir, 'docx')
        docx_files = [
            os.path.join(docx_dir, f)
            for f in sorted(os.listdir(docx_dir))
            if f.endswith('.docx') and not f.startswith('~')
        ]

    print("Fixing heading colors to Mastercard Orange (#FF5F00)...")
    print(f"Processing {len(docx_files)} files\n")

    total_headings = 0
    for filepath in docx_files:
        filename = os.path.basename(filepath)
        try:
            count = fix_heading_colors(filepath)
            total_headings += count
            print(f"  {filename}: {count} headings fixed")
        except Exception as e:
            print(f"  {filename}: ERROR - {e}")

    print(f"\nComplete: {total_headings} headings fixed across {len(docx_files)} files")


if __name__ == '__main__':
    main()
