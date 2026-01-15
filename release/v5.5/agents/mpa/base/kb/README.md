# MPA Knowledge Base - Folder Structure

KB documents have been moved to deployment-specific folders for cherry-pick compatibility.

## Location of KB Documents

- **Mastercard deployment**: `../mastercard/kb/`
- **Personal deployment**: `../personal/kb/`

## Cherry-Pick Workflow

To copy updates between deployments, change the path:

```bash
# Copy from mastercard to personal
cp ../mastercard/kb/FILE.txt ../personal/kb/FILE.txt

# Copy from personal to mastercard
cp ../personal/kb/FILE.txt ../mastercard/kb/FILE.txt
```

## Shared Components (remain in base/)

- `tests/` - Test framework
- `copilot/` - Copilot Studio topics
- `flows/` - Power Automate flows
- `functions/` - Azure functions
- `docs/` - Documentation
- `schema/` - Schema definitions
