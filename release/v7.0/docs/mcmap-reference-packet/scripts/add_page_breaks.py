#!/usr/bin/env python3
"""
Add page break markers to MCMAP documentation markdown files.
Inserts OpenXML page breaks before major sections for proper Word formatting.
"""

import os
import re

MARKDOWN_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'markdown')

# OpenXML page break for pandoc docx output
PAGE_BREAK = '''
```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

'''

# Configuration: which sections get page breaks in each document
# Key = filename pattern, Value = list of section titles (case-insensitive match)
PAGE_BREAK_CONFIG = {
    '00-MCMAP_Title_Page.md': [],  # No breaks - cover page

    '01-MCMAP_Index.md': [
        'QUESTION ROUTING',
        'PERSONA-BASED ENTRY POINTS',
        'TOPIC CROSS-REFERENCE',
        'KEYWORD INDEX',
        'COMMON QUESTIONS BY PERSONA',
    ],

    '02-MCMAP_Strategic_Platform_Vision.md': [
        'THE 11 AGENTS',
        'THREE TRANSFORMATIONAL CAPABILITIES',
        'EFFICIENCY GAINS',
        'REVENUE OPPORTUNITIES',
        'COMPETITIVE POSITIONING',
        'PLATFORM ARCHITECTURE',
        'RISK ANALYSIS',
        'THE PATH FORWARD',
    ],

    '03-MCMAP_System_Architecture.md': [
        '1. ARCHITECTURE OVERVIEW',
        '2. COMPONENT ARCHITECTURE',
        '3. DATA ARCHITECTURE',
        '4. INTEGRATION ARCHITECTURE',
        '5. ORCHESTRATION PATTERNS',
        '6. KNOWLEDGE BASE ARCHITECTURE',
        '7. SESSION MANAGEMENT',
        '8. CAPABILITY REGISTRY',
        '9. DEPLOYMENT TOPOLOGY',
        '10. SCALABILITY',
    ],

    '04-MCMAP_Security_Compliance.md': [
        '1. SECURITY OVERVIEW',
        '2. DATA LOSS PREVENTION',
        '3. AUTHENTICATION & AUTHORIZATION',
        '4. DATA PROTECTION',
        '5. NETWORK SECURITY',
        '6. AUDIT & MONITORING',
        '7. INCIDENT RESPONSE',
        '8. COMPLIANCE CERTIFICATIONS',
        '9. RISK ASSESSMENT',
        '10. SECURITY CONTROLS MATRIX',
        '11. DEVELOPMENT DATA PROVENANCE',
        '12. ATTRIBUTE-BASED ACCESS CONTROL',
        'APPENDIX A',
    ],

    '05-MCMAP_Agent_Capabilities.md': [
        '1. AGENT SYSTEM OVERVIEW',
        '2. ORC',
        '3. ANL',
        '4. AUD',
        '5. CHA',
        '6. SPO',
        '7. DOC',
        '8. PRF',
        '9. CST',
        '10. CHG',
        '11. CA',
        '12. CAPABILITY CROSS-REFERENCE',
        '13. USAGE EXAMPLES',
    ],

    '06-MCMAP_Data_Architecture.md': [
        '1. DATA ARCHITECTURE OVERVIEW',
        '2. DATAVERSE SCHEMA',
        '3. TABLE SPECIFICATIONS',
        '4. DATA RELATIONSHIPS',
        '5. DATA FLOWS',
        '6. DATA GOVERNANCE',
        '7. DATA QUALITY',
        '8. SEED DATA',
        '9. BACKUP & RECOVERY',
    ],

    '07-MCMAP_AIBuilder_Integration.md': [
        '1. AI BUILDER ARCHITECTURE',
        '2. PROMPT INVENTORY',
        '3. PROMPT DESIGN STANDARDS',
        '4. AGENT-SPECIFIC PROMPTS',
        '5. POWER AUTOMATE FLOWS',
        '6. CAPABILITY ABSTRACTION',
        '7. CONNECTOR CONFIGURATION',
        '8. INTEGRATION PATTERNS',
        '9. ERROR HANDLING',
        '10. PERFORMANCE',
    ],

    '08-MCMAP_Operational_Runbook.md': [
        '1. OPERATIONS OVERVIEW',
        '2. MONITORING & ALERTING',
        '3. INCIDENT MANAGEMENT',
        '4. SUPPORT PROCEDURES',
        '5. MAINTENANCE',
        '6. TROUBLESHOOTING',
        '7. ESCALATION',
        '8. SERVICE LEVEL',
        '9. CAPACITY',
        '10. DISASTER RECOVERY',
    ],

    '09-MCMAP_Quality_Assurance.md': [
        '1. QUALITY ASSURANCE FRAMEWORK',
        '2. TEST STRATEGY',
        '3. TEST CATEGORIES',
        '4. TEST CASE',
        '5. AUTOMATED TESTING',
        '6. MANUAL TESTING',
        '7. PERFORMANCE TESTING',
        '8. DEPLOYMENT VALIDATION',
        '9. QUALITY METRICS',
        '10. CONTINUOUS IMPROVEMENT',
    ],

    '10-MCMAP_Future_Use_Cases.md': [
        '1. EXECUTIVE SUMMARY',
        '2. MCMAP AS STRATEGIC FOUNDATION',
        '3. TOP 10 ADVISORS',
        '4. NETWORK & PAYMENTS',
        '5. ANALYTICS & RISK',
        '6. MARKETING, ADVERTISING',
        '7. DATA SERVICES',
        '8. INTERNAL EFFICIENCY',
        '9. IMPLEMENTATION ROADMAP',
        '10. STRATEGIC SUMMARY',
    ],

    '11-MCMAP_Contact_Reference.md': [
        'CONTACT ROUTING',
        'HOW TO ENGAGE',
        'ESCALATION PATH',
    ],

    'Appendix_A-MCMAP_Glossary.md': [
        'PLATFORM ACRONYMS',
        'TECHNOLOGY TERMS',
        'METRICS AND KPIs',
        'CONSULTING FRAMEWORKS',
        'BUILT-IN ANALYTICAL MODELS',
    ],
}


def should_add_break(line, break_patterns):
    """Check if this line is a header that should get a page break."""
    # Must be a level 2 header (## )
    if not line.startswith('## '):
        return False

    header_text = line[3:].strip()

    for pattern in break_patterns:
        # Case-insensitive partial match
        if pattern.upper() in header_text.upper():
            return True

    return False


def process_file(filepath, break_patterns):
    """Add page breaks to a markdown file before specified sections."""
    if not break_patterns:
        print(f"  Skipping {os.path.basename(filepath)} (no breaks configured)")
        return 0

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    new_lines = []
    breaks_added = 0

    for i, line in enumerate(lines):
        if should_add_break(line, break_patterns):
            # Don't add break if we're at the very beginning or after another break
            if new_lines and not new_lines[-1].strip().endswith('```'):
                new_lines.append('')  # Blank line before page break
                new_lines.append('```{=openxml}')
                new_lines.append('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')
                new_lines.append('```')
                new_lines.append('')  # Blank line after page break
                breaks_added += 1

        new_lines.append(line)

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))

    print(f"  {os.path.basename(filepath)}: Added {breaks_added} page breaks")
    return breaks_added


def main():
    print("Adding page breaks to MCMAP documentation...\n")

    total_breaks = 0
    files_processed = 0

    for filename, patterns in PAGE_BREAK_CONFIG.items():
        filepath = os.path.join(MARKDOWN_DIR, filename)
        if os.path.exists(filepath):
            total_breaks += process_file(filepath, patterns)
            files_processed += 1
        else:
            print(f"  WARNING: {filename} not found")

    print(f"\nComplete: {files_processed} files processed, {total_breaks} page breaks added")


if __name__ == '__main__':
    main()
