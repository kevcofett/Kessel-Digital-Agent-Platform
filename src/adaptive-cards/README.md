# KDAP Adaptive Cards

Interactive Adaptive Card templates for displaying decision tree workflows in Microsoft Copilot Studio and Power Virtual Agents.

## Templates

| Template | Purpose | File |
|----------|---------|------|
| `workflow-selector` | Choose workflow, resume sessions | `templates/workflow-selector.json` |
| `workflow-progress` | Show current step with progress bar | `templates/workflow-progress.json` |
| `decision-node` | Present decision options to user | `templates/decision-node.json` |
| `action-node` | Display agent action execution status | `templates/action-node.json` |
| `gate-approval` | Human review/approval gates | `templates/gate-approval.json` |
| `workflow-complete` | Summary, artifacts, and recommendations | `templates/workflow-complete.json` |

## Usage

### TypeScript

```typescript
import { 
  buildDecisionNodeData, 
  formatForCopilotStudio 
} from './card-builder';

const cardData = buildDecisionNodeData(session, tree, currentNode, baseUrl);
const card = formatForCopilotStudio('kdap-decision-node', cardData);
```

### Power Automate

1. Use the `Compose` action to generate card data
2. Use `Send an Adaptive Card` action in Copilot Studio
3. Handle user responses via topic triggers

## Data Binding

Cards use Adaptive Cards Templating syntax:

- `${variable}` - Simple value binding
- `${variable.property}` - Nested property
- `$when` - Conditional rendering
- `$data` - Array iteration

## Copilot Studio Integration

See `COPILOT_STUDIO_INTEGRATION.md` for complete setup guide including:

- Power Automate flow definitions
- Topic configuration
- Dataverse schema
- Error handling patterns

## Validation

Cards are validated against Adaptive Cards schema v1.5. Run validation:

```bash
npm install -g adaptivecards-tools
adaptivecards-tools validate templates/decision-node.json
```

## Supported Platforms

- Microsoft Copilot Studio
- Power Virtual Agents
- Microsoft Teams
- Outlook Actionable Messages
- Web Chat (Bot Framework)

## Version Compatibility

All templates use Adaptive Cards schema version 1.5 for maximum compatibility with Microsoft platforms.
