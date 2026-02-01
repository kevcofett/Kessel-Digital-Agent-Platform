# MCMAP Documentation Assistant (DOCS Agent)

## Overview

The DOCS agent is a lightweight chatbot that helps Mastercard employees discover and navigate the MCMAP platform architecture documentation. It provides persona-based responses tailored to C-Suite executives, Senior Leadership, and Operations staff.

## Features

- **Persona-Based Responses**: Select A (C-Suite), B (Leadership), or C (Operations) for tailored depth
- **Numbered Navigation**: Topics 1-11 for quick access to major areas
- **Terminology Lookup**: Ask "what does X mean" for glossary definitions
- **Document Citations**: Responses reference specific documents and sections
- **ORC Integration**: Seamlessly routes from/to planning workflows

## Persona Descriptions

| Persona | Code | Focus |
|---------|------|-------|
| C-Suite | A | Strategic value, ROI, competitive positioning, revenue opportunity |
| Senior Leadership | B | Capabilities, architecture, integration, roadmap |
| Operations | C | Workflows, how-to, troubleshooting, support contacts |

## Knowledge Base

| File | Description |
|------|-------------|
| 00-MCMAP_Glossary.md | 100+ terms and acronyms |
| 00-MCMAP_Index.md | Document navigation guide |
| 01-MCMAP_Executive_Summary.md | Strategic value, platform overview |
| 02-MCMAP_System_Architecture.md | Technical architecture |
| 03-MCMAP_Security_Compliance.md | DLP, security controls |
| 04-MCMAP_Agent_Capabilities.md | 10 agents, 36 capabilities |
| 05-MCMAP_Data_Architecture.md | Dataverse schema |
| 06-MCMAP_AIBuilder_Integration.md | AI Builder prompts |
| 07-MCMAP_Operational_Runbook.md | Support procedures |
| 08-MCMAP_Quality_Assurance.md | Testing framework |
| 09-MCMAP_Future_Use_Cases.md | Strategic opportunities ($6.7-12B TAM) |
| 10-MCMAP_Contact_Reference.md | Support contacts |

## Deployment Steps

1. **Upload Instructions**
   - File: instructions/DOCS_Instructions_v5.txt
   - Target: Copilot Studio agent instructions
   - Verify: Character count < 8,000

2. **Configure KB Sources**
   - Upload all files from kb/ folder to SharePoint
   - Link SharePoint folder as Copilot knowledge source
   - Enable generative answers

3. **Add ORC Routing**
   - Add DOCS triggers to ORC agent
   - Triggers: "documentation", "architecture", "glossary", "define", "what does X mean"
   - Configure handoff protocol

4. **Test Scenarios**
   - Test persona selection (A/B/C)
   - Test numbered navigation (1-11)
   - Test terminology lookups
   - Test ORC handoff and return

## Usage Examples

**Starting a session:**

User: Hi
DOCS: Welcome to MCMAP Documentation! Select your role: A (C-Suite), B (Leadership), C (Operations)...

**Persona selection:**

User: A
DOCS: [Provides C-Suite focused overview with revenue metrics and strategic positioning]

**Topic navigation:**

User: 10
DOCS: [Provides Future Use Cases summary appropriate to selected persona]

**Terminology lookup:**

User: What does CAL mean?
DOCS: CAL = Capability Abstraction Layer. It is the architecture pattern that separates capability definitions from implementations, enabling platform portability...

## Contact

Kevin Bauer (kevin.bauer@mastercard.com) - All inquiries

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v5 | Jan 24, 2026 | Added persona-based responses, Future Use Cases |
| v4 | Jan 24, 2026 | Added glossary, ORC integration |
| v1-v3 | Jan 2026 | Initial development |
