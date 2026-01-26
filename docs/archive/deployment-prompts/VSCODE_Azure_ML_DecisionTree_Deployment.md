# VS Code Deployment Prompt: Azure ML & Decision Tree UI

## Overview

Deploy Azure ML endpoint integration and Decision Tree UI components for the Kessel Digital Agent Platform.

---

## Part 1: Azure ML Integration

### Location
`src/azure-ml/`

### Files Created

| File | Purpose | Lines |
|------|---------|-------|
| `package.json` | Dependencies and scripts | 27 |
| `tsconfig.json` | TypeScript configuration | 21 |
| `client.ts` | Core AzureMLClient class | 175 |
| `endpoints.ts` | Model endpoint definitions | 158 |
| `index.ts` | Module exports and factory | 85 |
| `models/budget-optimization.ts` | ANL budget optimization service | 117 |
| `models/propensity-scoring.ts` | AUD propensity scoring service | 149 |
| `models/anomaly-detection.ts` | PRF anomaly detection service | 168 |
| `models/index.ts` | Model exports | 26 |
| `functions/budget-optimization.ts` | Azure Function trigger | 60 |
| `functions/propensity-scoring.ts` | Azure Function trigger | 65 |
| `functions/anomaly-detection.ts` | Azure Function trigger | 115 |

### Model Endpoints Defined

**ANL Agent:**
- `kdap-budget-optimizer` - Budget optimization
- `kdap-response-curve` - Response curve fitting
- `kdap-monte-carlo` - Monte Carlo simulation
- `kdap-forecasting` - Time series forecasting

**AUD Agent:**
- `kdap-propensity` - Propensity scoring
- `kdap-lookalike` - Lookalike modeling
- `kdap-churn-predictor` - Churn prediction
- `kdap-segmentation` - K-means segmentation

**PRF Agent:**
- `kdap-anomaly-detector` - Anomaly detection
- `kdap-attribution` - Shapley attribution

**CHA Agent:**
- `kdap-media-mix` - Media mix modeling
- `kdap-reach-freq` - Reach/frequency optimization

**CST Agent:**
- `kdap-prioritizer` - RICE prioritization

### Deployment Steps

1. **Azure ML Workspace Setup:**
```bash
# Create ML workspace (if not exists)
az ml workspace create -n kdap-ml-workspace -g kdap-resource-group

# Deploy managed online endpoints
az ml online-endpoint create -f endpoint-config.yaml
```

2. **Environment Variables:**
```bash
AZURE_SUBSCRIPTION_ID=<your-subscription-id>
AZURE_RESOURCE_GROUP=<your-resource-group>
AZURE_ML_WORKSPACE=kdap-ml-workspace
AZURE_REGION=eastus
KDAP_ENV=dev  # or prod
```

3. **Function App Deployment:**
```bash
cd src/azure-ml
npm install
npm run build
func azure functionapp publish kdap-ml-functions
```

---

## Part 2: Decision Tree UI

### Location
`src/decision-tree-ui/`

### Files Created

| File | Purpose | Lines |
|------|---------|-------|
| `package.json` | React dependencies | 43 |
| `src/types.ts` | TypeScript type definitions | 207 |
| `src/index.ts` | Module exports | 29 |
| `src/components/TreeNodes.tsx` | Custom React Flow nodes | 261 |
| `src/components/DecisionTree.tsx` | Main tree component | 272 |
| `src/components/DetailPanel.tsx` | Node detail side panel | 296 |
| `src/components/ProgressBar.tsx` | Progress indicator | 65 |
| `src/components/index.ts` | Component exports | 18 |
| `src/hooks/useTreeSession.ts` | Session state management | 244 |
| `src/hooks/useTreeNavigation.ts` | Keyboard navigation | 153 |
| `src/utils/treeBuilder.ts` | Tree creation helpers | 201 |
| `src/utils/validation.ts` | Tree validation | 168 |
| `src/utils/serialization.ts` | JSON serialization | 79 |
| `src/trees/mpa-workflows.ts` | MPA workflow trees | 337 |
| `src/trees/ca-workflows.ts` | CA workflow trees | 373 |

### Pre-Built Decision Trees

**MPA Workflows:**
- `EXPRESS` - Streamlined brief creation (11 nodes)
- `STANDARD` - Full workflow (13 nodes)
- `GUIDED` - Educational with tutorials (14 nodes)
- `AUDIT` - Review existing briefs (13 nodes)

**CA Workflows:**
- `FRAMEWORK_SELECTION` - Choose consulting frameworks (20 nodes)
- `CHANGE_MANAGEMENT` - Change planning workflow (20 nodes)
- `BUSINESS_CASE` - Business case development (10 nodes)

### React Integration

```tsx
import { DecisionTreeView, MPA_WORKFLOW_TREES, useTreeSession } from '@kdap/decision-tree-ui';

function MediaPlanningWorkflow() {
  const { session, navigate, makeDecision } = useTreeSession({
    tree: MPA_WORKFLOW_TREES.STANDARD,
    userId: 'user-123',
    persistKey: 'mpa-session',
  });

  return (
    <DecisionTreeView
      tree={MPA_WORKFLOW_TREES.STANDARD}
      session={session}
      onNavigate={navigate}
      onDecision={makeDecision}
      config={{
        showProgress: true,
        showMinimap: true,
        theme: 'light',
      }}
    />
  );
}
```

### Node Types

| Type | Shape | Purpose |
|------|-------|---------|
| `start` | Rounded pill | Entry point |
| `decision` | Diamond | User choice |
| `action` | Rectangle | Agent execution |
| `gate` | Hexagon | Validation |
| `merge` | Circle | Path convergence |
| `end` | Rounded pill | Completion |

### Features

- **Interactive Visualization** - React Flow-based canvas
- **Session Management** - Persist progress across sessions
- **Keyboard Navigation** - Arrow keys, Enter, Escape
- **Detail Panel** - Node information and options
- **Progress Tracking** - Visual completion percentage
- **Theme Support** - Light/dark modes
- **Minimap** - Overview navigation
- **Auto-Layout** - Automatic node positioning

---

## Validation Checklist

### Azure ML
- [ ] Azure subscription configured
- [ ] ML workspace created
- [ ] Managed identity configured
- [ ] Environment variables set
- [ ] Function app deployed
- [ ] Endpoints responding

### Decision Tree UI
- [ ] npm install completes
- [ ] TypeScript compiles without errors
- [ ] Storybook runs (optional)
- [ ] Trees render correctly
- [ ] Navigation works
- [ ] Session persists

---

## Integration with KDAP

### Copilot Studio Integration

The Decision Tree UI can be embedded in custom Copilot Studio cards or external web applications. The pre-built workflow trees match the agent capabilities:

- MPA workflows → ANL, AUD, CHA, PRF, DOC agents
- CA workflows → CST, CHG, ANL, DOC agents

### Azure ML Integration

Agents can call ML endpoints through Power Automate HTTP connectors or Azure Functions:

```
ANL Agent → /api/budgetOptimization
AUD Agent → /api/propensityScoring
PRF Agent → /api/anomalyDetection
```

---

## Next Steps

1. **Model Training** - Train and deploy actual ML models to endpoints
2. **UI Hosting** - Deploy Decision Tree UI to Azure Static Web Apps
3. **Copilot Integration** - Create Adaptive Cards for tree navigation
4. **Testing** - End-to-end workflow testing
