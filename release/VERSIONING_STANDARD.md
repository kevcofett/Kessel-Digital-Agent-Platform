# KDAP File Versioning Standard

## Version: 2.0
## Effective: January 2026
## Applies to: v6.0 and v7.0 releases

---

## CRITICAL RULE: Version Position

**Version numbers MUST be at the END of the filename, immediately before the file extension.**

### Correct Format
```
[FileName]_v[MAJOR].[MINOR][extension]
```

### Incorrect vs Correct Examples

| INCORRECT (version in middle) | CORRECT (version at end) |
|-------------------------------|--------------------------|
| `MPA_v6_Architecture.md` | `MPA_Architecture_v6.0.md` |
| `MPA_v6_Dataverse_Schema.md` | `MPA_Dataverse_Schema_v6.0.md` |
| `mpa_v6_analytics_agent-template.json` | `mpa_analytics_agent-template_v6.0.json` |

---

## File Type Conventions

### Agent Instructions
```
[AGENT]_Copilot_Instructions_v[MAJOR].[MINOR].txt
```
Examples:
- `ORC_Copilot_Instructions_v3.0.txt` - Initial v3
- `ORC_Copilot_Instructions_v3.1.txt` - Minor update to v3
- `AUD_Copilot_Instructions_v2.0.txt`

### Knowledge Base Files
```
[AGENT]_KB_[Topic]_v[MAJOR].[MINOR].txt
```
Examples:
- `GHA_KB_Frameworks_v1.0.txt`
- `ANL_KB_Scenarios_v1.1.txt`

### Architecture Documents
```
MPA_[Topic]_v[MAJOR].[MINOR].md
```
Examples:
- `MPA_Architecture_v6.0.md`
- `MPA_Dataverse_Schema_v6.0.md`
- `MPA_AI_Builder_Prompts_v6.1.md`

### Agent Templates
```
MPA_[Agent]_Agent_v[MAJOR].[MINOR].yaml
```
Examples:
- `MPA_Analytics_Agent_v6.0.yaml`
- `MPA_Audience_Agent_v6.0.yaml`

### Workflow Files
```
[WorkflowName]_v[MAJOR].[MINOR].json
```
Examples:
- `CalculateAllocation_v6.0.json`
- `RouteToSpecialist_v6.0.json`

### MCMAP Reference Documents
```
[NUMBER]-MCMAP_[Topic]_v[MAJOR].[MINOR].md
```
Examples:
- `01-MCMAP_Executive_Summary_v7.0.md`
- `04-MCMAP_Agent_Capabilities_v7.1.md`

---

## Version Numbering Rules

### Major Version (vX.0)
- Used for initial release in a version folder
- Significant structural changes
- Breaking changes to functionality
- New capabilities or major rewrites

### Minor Version (vX.1, vX.2, etc.)
- Single document corrections or clarifications
- Bug fixes or small enhancements
- Non-breaking changes
- Content updates within same architecture

### Version Matching Release Folder
- Files in `release/v6.0/` should use `_v6.0`, `_v6.1`, `_v6.2`
- Files in `release/v7.0/` should use `_v7.0`, `_v7.1`, `_v7.2`

---

## Prohibited Naming Patterns

| Prohibited | Correct Alternative |
|------------|---------------------|
| `_CORRECTED` | Increment minor version (v6.1) |
| `_REVISED` | Increment minor version (v6.1) |
| `_FINAL` | Remove suffix - current IS final |
| `_Final` | Remove suffix - current IS final |
| `_updated` | Increment version number |
| `_H1H2` | Archive as variant |
| `MPA_v6_[Topic].md` | `MPA_[Topic]_v6.0.md` |
| `[name]_v6_[rest]` | `[name]_[rest]_v6.0` |

---

## Directory Structure

### Active Files
Each directory contains ONLY the current production version:
```
agents/orc/instructions/
└── ORC_Copilot_Instructions_v3.0.txt    (current only)
```

### Archive Structure
Previous versions moved to archive folders:
```
agents/orc/instructions/
├── ORC_Copilot_Instructions_v3.0.txt    (current)
└── archive/
    ├── ORC_Copilot_Instructions_v1.0.txt
    └── ORC_Copilot_Instructions_v2.0.txt
```

---

## Migration Process

When updating to proper versioning:

1. Identify files with version in wrong position (e.g., `MPA_v6_*`)
2. Rename to correct format: `[name]_v[X].[Y].[ext]`
3. Move older versions to archive/ subfolder
4. Update all references in documentation
5. Commit with descriptive message

### Example Migration
```
BEFORE: MPA_v6_Architecture.md
AFTER:  MPA_Architecture_v6.0.md

BEFORE: mpa_v6_analytics_agent-template.json
AFTER:  mpa_analytics_agent-template_v6.0.json
```

---

## Version History Tracking

Each file should contain version history:

```
VERSION HISTORY

v6.1 - January 2026
- Added GHA routing integration
- Updated specialist coordination

v6.0 - December 2025
- Initial v6.0 release
```

---

## Archive Retention

- All previous versions retained in archive/
- Archive organized by major version: `archive/v6/`, `archive/v7/`
- Archived files preserve original names for traceability

---

## Enforcement

- Pre-commit hooks validate naming conventions
- Deployment checklists reference only standard-named files
- Code reviews reject non-standard naming
