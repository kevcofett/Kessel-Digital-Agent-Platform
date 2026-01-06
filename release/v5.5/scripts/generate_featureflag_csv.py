#!/usr/bin/env python3
"""
Generate EAP Feature Flag Seed CSV from Template.

Transforms feature_flags.template.json into CSV format for Dataverse import.

Usage:
    python generate_featureflag_csv.py [--output OUTPUT_PATH]
"""

import argparse
import csv
import json
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from config.settings import Settings, FEATURE_FLAG_CATEGORIES


def get_agent_code(flag_code: str) -> str:
    """
    Extract agent code from flag prefix.

    Args:
        flag_code: Feature flag code (e.g., mpa_enable_web_search)

    Returns:
        Agent code (MPA, CA) or empty string for platform-wide flags
    """
    if flag_code.startswith("mpa_"):
        return "MPA"
    elif flag_code.startswith("ca_"):
        return "CA"
    # Platform-wide flags have no agent code
    return ""


def transform_flags(template: dict) -> list[dict]:
    """
    Transform feature flags template to CSV rows.

    Args:
        template: Parsed feature_flags.template.json

    Returns:
        List of row dicts ready for CSV writing
    """
    rows = []

    flags_section = template.get("flags", {})

    for category_key, flags in flags_section.items():
        for flag_code, flag_def in flags.items():
            # Get category choice value
            category_name = flag_def.get("category", "Platform")
            category_value = FEATURE_FLAG_CATEGORIES.get(category_name, 100000000)

            # Use personal defaults for initial deployment
            is_enabled = flag_def.get("defaultPersonal", False)
            default_value = flag_def.get("defaultPersonal", False)

            # Handle null fallback messages
            fallback = flag_def.get("fallbackMessage")
            if fallback is None:
                fallback = ""

            row = {
                "eap_flagcode": flag_code,
                "eap_flagname": flag_def.get("name", flag_code),
                "eap_description": flag_def.get("description", ""),
                "eap_category": category_value,
                "eap_isenabled": str(is_enabled).lower(),  # true/false for Dataverse
                "eap_defaultvalue": str(default_value).lower(),
                "eap_fallbackmessage": fallback,
                "eap_agentcode": get_agent_code(flag_code)
            }

            rows.append(row)

    return rows


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Generate EAP feature flag seed CSV from template"
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Output CSV file path (default: auto-generated in eap-core/base/data/seed/)"
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Print verbose output"
    )

    args = parser.parse_args()

    print("=" * 60)
    print("EAP Feature Flag CSV Generator")
    print("=" * 60)

    # Load settings to find template path
    try:
        settings = Settings()
        template_path = settings.feature_flags_template_path
    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)

    if not template_path.exists():
        print(f"Error: Template not found: {template_path}")
        sys.exit(1)

    print(f"\nTemplate: {template_path}")

    # Load template
    with open(template_path, "r") as f:
        template = json.load(f)

    # Transform to rows
    rows = transform_flags(template)

    print(f"Flags found: {len(rows)}")

    if args.verbose:
        print("\nFlags by category:")
        categories = {}
        for row in rows:
            cat = row["eap_category"]
            categories[cat] = categories.get(cat, 0) + 1
        for cat_val, count in sorted(categories.items()):
            # Reverse lookup category name
            cat_name = next(
                (k for k, v in FEATURE_FLAG_CATEGORIES.items() if v == cat_val),
                "Unknown"
            )
            print(f"  {cat_name}: {count}")

    # Determine output path
    if args.output:
        output_path = args.output
    else:
        # Default: release/v5.5/platform/eap-core/base/data/seed/eap_featureflag_seed.csv
        output_path = (
            template_path.parent.parent /
            "eap-core" / "base" / "data" / "seed" / "eap_featureflag_seed.csv"
        )

    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Write CSV
    fieldnames = [
        "eap_flagcode",
        "eap_flagname",
        "eap_description",
        "eap_category",
        "eap_isenabled",
        "eap_defaultvalue",
        "eap_fallbackmessage",
        "eap_agentcode"
    ]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nGenerated: {output_path}")
    print(f"Records: {len(rows)}")

    if args.verbose:
        print("\nSample rows:")
        for row in rows[:5]:
            print(f"  {row['eap_flagcode']}: enabled={row['eap_isenabled']}, agent={row['eap_agentcode'] or 'platform'}")

    print("\n[SUCCESS] Feature flag CSV generated")


if __name__ == "__main__":
    main()
