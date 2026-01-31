# KDAP File Versioning Standard

## Version: 1.0
## Effective: January 2026
## Applies to: v6.0 and v7.0 releases

---

## Naming Convention

### Standard Format
```
[AGENT]_[DocumentType]_v[MAJOR].[MINOR].txt
```

### Examples
- `ORC_Copilot_Instructions_v1.txt` - Initial version
- `ORC_Copilot_Instructions_v1.1.txt` - Minor revision
- `ORC_Copilot_Instructions_v2.txt` - Major revision

---

## Version Numbering Rules

### Major Version (v1, v2, v3)
- Increment for significant structural changes
- New capabilities or major rewrites
- Breaking changes to functionality

### Minor Version (v1.1, v1.2)
- Increment for corrections, clarifications
- Bug fixes or small enhancements
- Non-breaking changes

---

## Prohibited Naming Patterns

The following suffixes are NOT allowed in production files:

| Prohibited | Correct Alternative |
|------------|---------------------|
| `_CORRECTED` | Increment minor version (v1.1) |
| `_REVISED` | Increment minor version (v1.1) |
| `_FINAL` | Remove suffix entirely |
| `_Final` | Remove suffix entirely |
| `_updated` | Increment version number |
| `_H1H2` | Archive as variant, keep main version |
| `_v2_CORRECTED` | Rename to `_v2` (correction replaces original) |

---

## Directory Structure

### Active Files
Each directory should contain ONLY the current production version:
```
agents/orc/instructions/
└── ORC_Copilot_Instructions_v3.txt    (current version only)
```

### Archive Structure
Previous versions must be moved to archive folders:
```
agents/orc/instructions/
├── ORC_Copilot_Instructions_v3.txt    (current)
└── archive/
    ├── ORC_Copilot_Instructions_v1.txt
    └── ORC_Copilot_Instructions_v2.txt
```

---

## File Type Conventions

### Instructions Files
```
[AGENT]_Copilot_Instructions_v[VERSION].txt
```

### Knowledge Base Files
```
[AGENT]_KB_[Topic]_v[VERSION].txt
```

### Architecture Documents
```
MPA_v[RELEASE]_[Topic].md
```
Note: No `_Final` suffix - the current file IS the final version.

### Reference Documents
```
[NUMBER]-MCMAP_[Topic].md
```

---

## Version History Tracking

Each file should contain a version history section:

```
VERSION HISTORY

Version 3 - January 2026
- Added GHA routing integration
- Updated specialist coordination

Version 2 - December 2025
- Added CA domain support

Version 1 - November 2025
- Initial release
```

---

## Migration Process

When updating to proper versioning:

1. Identify current production version (highest number or _CORRECTED)
2. Rename to clean version number (remove suffix)
3. Move older versions to archive/ subfolder
4. Update all references in documentation
5. Regenerate DOCX versions if applicable

---

## Archive Retention

- All previous versions retained in archive/
- Archive organized by version: `archive/` or `archive/v[X]/`
- Archived files preserve original names for traceability

---

## Enforcement

- Pre-commit hooks validate naming conventions
- Deployment checklists reference only standard-named files
- Code reviews reject non-standard naming
