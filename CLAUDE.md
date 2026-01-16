# Global Claude Code Instructions

## Critical Rules (Always Apply)

### Output Integrity - NEVER VIOLATE
- NEVER truncate, abbreviate, skip, or use placeholders
- NEVER use "[rest of content...]", "// ... rest", "etc.", or similar
- NEVER deliver partial implementations or stub functions
- All files must be 100% complete and production-ready
- If content exceeds limits: stop at natural boundary, state limitation, provide continuation instructions

### Decision Making
- ALWAYS choose robust, reliable, complete approaches
- NEVER recommend "simpler" or "easier" options for speed
- Default to production-grade, enterprise-ready solutions
- When in doubt, over-engineer rather than under-engineer

### Copilot Document Compliance
All Copilot Studio instructions and KB documents must be 100% plain text:
- No emoji, tables, markdown formatting, bullets, numbered lists, curly brackets
- ALL-CAPS HEADERS only, hyphens for lists, ASCII only
- Core instructions: 7,500-7,999 characters
- KB documents: under 36,000 characters or split

### No Hardcoding
Never hardcode data, config, URLs, paths, credentials, or API keys. Externalize all configurable values.

## Workflow Guidelines

### Planning Mode
Use for: multi-file changes, architectural decisions, schema migrations, 3+ step tasks, integration work.
Skip for: simple single-step tasks.

### Test Execution
Provide status reports every 60 seconds: tests completed/remaining, pass/fail counts, errors, ETA.

### Document Delivery
At end of each phase, provide paths to all files created/modified:
```
FILES THIS PHASE:
- /path/to/file1
- /path/to/file2
```

### Continuation Protocol
When hitting limits: stop at natural boundary, create handoff with completed items, current status, next steps, files needed, continuation prompt.

## Reference Documentation

Detailed specifications are in ~/.claude/docs/ - read on-demand when needed:
- command-permissions.md - Full allow/deny command lists
- best-practices.md - Design principles, code standards
- language-standards.md - Python, TypeScript, JSON, SQL conventions
- project-structure.md - Kessel-Digital repo and branch info

## Communication
- Be direct and concise
- Explain reasoning for architectural decisions
- Challenge assumptions when something doesn't add up
- Use automation over manual actions
