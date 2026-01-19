# VS Code Deployment Prompt: CLI Update, Testing Suite, and Benchmark API Connectors

## Overview

This document covers three related tasks for the KDAP ML infrastructure:

| Task | Description | Priority |
|------|-------------|----------|
| G | CLI Update - Add 4 new model commands | High |
| D | Testing Suite - Pytest for ML, Jest for UI | High |
| B | Real-Time Benchmark API Connectors | Medium |

**Repository:** `Kessel-Digital-Agent-Platform`
**Base Path:** `/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform`

---

## Task G: CLI Update for 7 Models

### Current State

The CLI at `src/ml-training/train.py` supports 3 models:
- `budget` - Budget Optimizer (LightGBM)
- `propensity` - Propensity Model (XGBoost)
- `anomaly` - Anomaly Detector (IsolationForest + LOF)

### Required Additions

Add 4 new model commands to match the complete model registry:

| Command | Trainer Class | Module | Algorithm |
|---------|---------------|--------|-----------|
| `churn` | `ChurnPredictorTrainer` | `kdap_ml.churn_predictor` | CatBoost |
| `mmm` | `MediaMixTrainer` | `kdap_ml.media_mix` | Bayesian MMM |
| `lookalike` | `LookalikeTrainer` | `kdap_ml.lookalike` | Ensemble |
| `response` | `ResponseCurveTrainer` | `kdap_ml.response_curve` | Nonlinear Regression |

### Implementation Details

#### 1. Add Churn Command

```python
def train_churn(args):
    """Train churn prediction model."""
    from kdap_ml.churn_predictor import ChurnPredictorTrainer, generate_synthetic_data
    
    trainer = ChurnPredictorTrainer()
    
    if args.data:
        df = trainer.load_data(args.data)
    else:
        logging.info("Generating synthetic data...")
        df = generate_synthetic_data(n_samples=args.samples or 50000)
    
    X_train, X_val, X_test, y_train, y_val, y_test = trainer.prepare_data(
        df, target_col=args.target or 'churned'
    )
    
    if args.tune:
        trainer.tune_hyperparameters(X_train, y_train, X_val, y_val, n_trials=args.trials or 50)
    
    trainer.train(X_train, y_train, X_val, y_val)
    
    metrics = trainer.evaluate(X_test, y_test)
    print(f"\nFinal metrics: {metrics}")
    
    # Generate SHAP explanations
    if args.explain:
        explanations = trainer.explain_predictions(X_test.head(10))
        print(f"\nSample explanations generated")
    
    model_path = trainer.save_model(args.output)
    print(f"\nModel saved to: {model_path}")
    
    if args.mlflow:
        run_id = trainer.log_to_mlflow()
        print(f"MLflow run ID: {run_id}")
    
    return trainer
```

#### 2. Add Media Mix Command

```python
def train_media_mix(args):
    """Train media mix model."""
    from kdap_ml.media_mix import MediaMixTrainer, generate_synthetic_data
    
    trainer = MediaMixTrainer()
    
    if args.data:
        df = trainer.load_data(args.data)
    else:
        logging.info("Generating synthetic data...")
        df = generate_synthetic_data(n_weeks=args.weeks or 156)
    
    trainer.fit(
        df,
        date_col='date',
        target_col=args.target or 'revenue',
        spend_cols=args.channels.split(',') if args.channels else None,
        control_cols=args.controls.split(',') if args.controls else None,
    )
    
    # Generate decomposition
    decomposition = trainer.decompose_contributions()
    print(f"\nChannel contributions: {decomposition}")
    
    # Optimize budget if requested
    if args.optimize:
        optimal = trainer.optimize_budget(
            total_budget=args.budget or 1000000,
            constraints=None
        )
        print(f"\nOptimal allocation: {optimal}")
    
    model_path = trainer.save_model(args.output)
    print(f"\nModel saved to: {model_path}")
    
    if args.mlflow:
        run_id = trainer.log_to_mlflow()
        print(f"MLflow run ID: {run_id}")
    
    return trainer
```

#### 3. Add Lookalike Command

```python
def train_lookalike(args):
    """Train lookalike audience model."""
    from kdap_ml.lookalike import LookalikeTrainer, generate_synthetic_data
    
    trainer = LookalikeTrainer()
    
    if args.data:
        df = trainer.load_data(args.data)
    else:
        logging.info("Generating synthetic data...")
        df = generate_synthetic_data(n_samples=args.samples or 100000)
    
    seed_df = df[df['is_seed'] == 1] if 'is_seed' in df.columns else df.head(1000)
    candidate_df = df[df['is_seed'] == 0] if 'is_seed' in df.columns else df.tail(99000)
    
    trainer.fit(seed_df, feature_cols=args.features.split(',') if args.features else None)
    
    # Score candidates
    scored = trainer.score_candidates(candidate_df, top_n=args.top_n or 10000)
    print(f"\nTop candidates scored: {len(scored)}")
    
    # Evaluate if ground truth available
    if 'converted' in candidate_df.columns:
        metrics = trainer.evaluate(candidate_df, 'converted')
        print(f"\nEvaluation metrics: {metrics}")
    
    model_path = trainer.save_model(args.output)
    print(f"\nModel saved to: {model_path}")
    
    if args.mlflow:
        run_id = trainer.log_to_mlflow()
        print(f"MLflow run ID: {run_id}")
    
    return trainer
```

#### 4. Add Response Curve Command

```python
def train_response_curve(args):
    """Train response curve model."""
    from kdap_ml.response_curve import ResponseCurveTrainer, generate_synthetic_data
    
    trainer = ResponseCurveTrainer()
    
    if args.data:
        df = trainer.load_data(args.data)
    else:
        logging.info("Generating synthetic data...")
        df = generate_synthetic_data(n_samples=args.samples or 500)
    
    trainer.fit(
        df,
        spend_col=args.spend or 'spend',
        response_col=args.response or 'conversions',
        curve_type=args.curve_type or 'hill',
    )
    
    # Print curve parameters
    print(f"\nCurve type: {trainer.curve_type}")
    print(f"Parameters: {trainer.params}")
    print(f"R-squared: {trainer.r_squared:.4f}")
    
    # Find optimal spend
    if args.optimize:
        optimal = trainer.find_optimal_spend(
            min_spend=args.min_spend or 0,
            max_spend=args.max_spend or 1000000,
        )
        print(f"\nOptimal spend point: ${optimal:,.2f}")
    
    model_path = trainer.save_model(args.output)
    print(f"\nModel saved to: {model_path}")
    
    if args.mlflow:
        run_id = trainer.log_to_mlflow()
        print(f"MLflow run ID: {run_id}")
    
    return trainer
```

#### 5. Add Subparsers

Add to the `main()` function after existing subparsers:

```python
# Churn predictor
churn_parser = subparsers.add_parser('churn', help='Train churn prediction model')
churn_parser.add_argument('--data', type=str, help='Path to training data')
churn_parser.add_argument('--target', type=str, help='Target column name')
churn_parser.add_argument('--samples', type=int, help='Number of synthetic samples')
churn_parser.add_argument('--output', type=str, default='./models', help='Output directory')
churn_parser.add_argument('--tune', action='store_true', help='Tune hyperparameters')
churn_parser.add_argument('--trials', type=int, help='Number of tuning trials')
churn_parser.add_argument('--explain', action='store_true', help='Generate SHAP explanations')
churn_parser.add_argument('--mlflow', action='store_true', help='Log to MLflow')

# Media mix model
mmm_parser = subparsers.add_parser('mmm', help='Train media mix model')
mmm_parser.add_argument('--data', type=str, help='Path to training data')
mmm_parser.add_argument('--target', type=str, help='Target column name')
mmm_parser.add_argument('--weeks', type=int, help='Number of weeks for synthetic data')
mmm_parser.add_argument('--channels', type=str, help='Comma-separated channel spend columns')
mmm_parser.add_argument('--controls', type=str, help='Comma-separated control columns')
mmm_parser.add_argument('--output', type=str, default='./models', help='Output directory')
mmm_parser.add_argument('--optimize', action='store_true', help='Run budget optimization')
mmm_parser.add_argument('--budget', type=float, help='Total budget to optimize')
mmm_parser.add_argument('--mlflow', action='store_true', help='Log to MLflow')

# Lookalike model
lookalike_parser = subparsers.add_parser('lookalike', help='Train lookalike audience model')
lookalike_parser.add_argument('--data', type=str, help='Path to training data')
lookalike_parser.add_argument('--features', type=str, help='Comma-separated feature columns')
lookalike_parser.add_argument('--samples', type=int, help='Number of synthetic samples')
lookalike_parser.add_argument('--top-n', type=int, help='Number of top candidates to return')
lookalike_parser.add_argument('--output', type=str, default='./models', help='Output directory')
lookalike_parser.add_argument('--mlflow', action='store_true', help='Log to MLflow')

# Response curve model
response_parser = subparsers.add_parser('response', help='Train response curve model')
response_parser.add_argument('--data', type=str, help='Path to training data')
response_parser.add_argument('--spend', type=str, help='Spend column name')
response_parser.add_argument('--response', type=str, help='Response column name')
response_parser.add_argument('--curve-type', type=str, choices=['hill', 'adbudg', 'log', 'power', 'logistic'], help='Curve type')
response_parser.add_argument('--samples', type=int, help='Number of synthetic samples')
response_parser.add_argument('--output', type=str, default='./models', help='Output directory')
response_parser.add_argument('--optimize', action='store_true', help='Find optimal spend point')
response_parser.add_argument('--min-spend', type=float, help='Minimum spend for optimization')
response_parser.add_argument('--max-spend', type=float, help='Maximum spend for optimization')
response_parser.add_argument('--mlflow', action='store_true', help='Log to MLflow')
```

#### 6. Update Command Dispatch

Update the command dispatch section:

```python
if args.command == 'budget':
    train_budget_optimizer(args)
elif args.command == 'propensity':
    train_propensity(args)
elif args.command == 'anomaly':
    train_anomaly_detector(args)
elif args.command == 'churn':
    train_churn(args)
elif args.command == 'mmm':
    train_media_mix(args)
elif args.command == 'lookalike':
    train_lookalike(args)
elif args.command == 'response':
    train_response_curve(args)
elif args.command == 'deploy':
    deploy_model(args)
else:
    parser.print_help()
    sys.exit(1)
```

### Testing Commands

After implementation, test each command:

```bash
cd src/ml-training

# Test churn
python train.py churn --samples 1000 --output ./test_models -v

# Test media mix
python train.py mmm --weeks 52 --optimize --budget 500000 -v

# Test lookalike
python train.py lookalike --samples 5000 --top-n 500 -v

# Test response curve
python train.py response --samples 200 --curve-type hill --optimize -v
```

---

## Task D: Testing Suite

### Directory Structure

Create the following test structure:

```
src/
├── ml-training/
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py
│       ├── test_budget_optimizer.py
│       ├── test_propensity.py
│       ├── test_anomaly_detector.py
│       ├── test_churn_predictor.py
│       ├── test_media_mix.py
│       ├── test_lookalike.py
│       ├── test_response_curve.py
│       ├── test_cli.py
│       └── test_integration.py
├── decision-tree-ui/
│   └── tests/
│       ├── components/
│       │   ├── DecisionTree.test.tsx
│       │   ├── TreeNodes.test.tsx
│       │   └── DetailPanel.test.tsx
│       ├── hooks/
│       │   ├── useTreeNavigation.test.ts
│       │   └── useTreeSession.test.ts
│       ├── utils/
│       │   ├── treeBuilder.test.ts
│       │   ├── validation.test.ts
│       │   └── serialization.test.ts
│       └── setup.ts
└── azure-ml/
    └── tests/
        ├── client.test.ts
        ├── endpoints.test.ts
        └── integration.test.ts
```

### Pytest Configuration

Create `src/ml-training/tests/conftest.py`:

```python
"""Pytest configuration and shared fixtures."""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path
import tempfile
import shutil


@pytest.fixture(scope="session")
def temp_model_dir():
    """Create a temporary directory for model outputs."""
    temp_dir = tempfile.mkdtemp()
    yield temp_dir
    shutil.rmtree(temp_dir)


@pytest.fixture
def sample_classification_data():
    """Generate sample classification data."""
    np.random.seed(42)
    n_samples = 1000
    
    return pd.DataFrame({
        'feature_1': np.random.randn(n_samples),
        'feature_2': np.random.randn(n_samples),
        'feature_3': np.random.randn(n_samples),
        'category': np.random.choice(['A', 'B', 'C'], n_samples),
        'target': np.random.choice([0, 1], n_samples, p=[0.7, 0.3]),
    })


@pytest.fixture
def sample_regression_data():
    """Generate sample regression data."""
    np.random.seed(42)
    n_samples = 500
    
    X = np.random.randn(n_samples, 3)
    y = 2 * X[:, 0] + 3 * X[:, 1] - X[:, 2] + np.random.randn(n_samples) * 0.1
    
    return pd.DataFrame({
        'feature_1': X[:, 0],
        'feature_2': X[:, 1],
        'feature_3': X[:, 2],
        'target': y,
    })


@pytest.fixture
def sample_time_series_data():
    """Generate sample time series data."""
    np.random.seed(42)
    n_weeks = 104
    
    dates = pd.date_range(start='2022-01-01', periods=n_weeks, freq='W')
    
    return pd.DataFrame({
        'date': dates,
        'revenue': np.random.lognormal(10, 0.5, n_weeks),
        'tv_spend': np.random.lognormal(8, 0.3, n_weeks),
        'digital_spend': np.random.lognormal(7, 0.4, n_weeks),
        'search_spend': np.random.lognormal(6, 0.3, n_weeks),
        'seasonality': np.sin(np.arange(n_weeks) * 2 * np.pi / 52),
    })


@pytest.fixture
def sample_anomaly_data():
    """Generate sample anomaly detection data."""
    np.random.seed(42)
    n_samples = 1000
    
    # Normal data
    normal = np.random.randn(n_samples - 50, 3)
    
    # Anomalies
    anomalies = np.random.randn(50, 3) * 3 + 5
    
    X = np.vstack([normal, anomalies])
    y = np.array([0] * (n_samples - 50) + [1] * 50)
    
    return pd.DataFrame({
        'feature_1': X[:, 0],
        'feature_2': X[:, 1],
        'feature_3': X[:, 2],
        'is_anomaly': y,
    })
```

### Sample Test File: test_budget_optimizer.py

```python
"""Tests for Budget Optimizer model."""

import pytest
import numpy as np
import pandas as pd
from kdap_ml.budget_optimizer import BudgetOptimizerTrainer, generate_synthetic_data


class TestBudgetOptimizerTrainer:
    """Test suite for BudgetOptimizerTrainer."""
    
    def test_initialization(self):
        """Test trainer initializes correctly."""
        trainer = BudgetOptimizerTrainer()
        assert trainer.model is None
        assert trainer.feature_names is None
    
    def test_synthetic_data_generation(self):
        """Test synthetic data generation."""
        df = generate_synthetic_data(n_samples=100)
        
        assert len(df) == 100
        assert 'optimal_spend_ratio' in df.columns
        assert df['optimal_spend_ratio'].between(0, 1).all()
    
    def test_data_preparation(self, sample_regression_data, temp_model_dir):
        """Test data preparation splits correctly."""
        trainer = BudgetOptimizerTrainer()
        
        X_train, X_val, X_test, y_train, y_val, y_test = trainer.prepare_data(
            sample_regression_data, target_col='target'
        )
        
        total = len(X_train) + len(X_val) + len(X_test)
        assert total == len(sample_regression_data)
        assert len(X_train) > len(X_val)
        assert len(X_train) > len(X_test)
    
    def test_training(self, sample_regression_data, temp_model_dir):
        """Test model training completes."""
        trainer = BudgetOptimizerTrainer()
        
        X_train, X_val, X_test, y_train, y_val, y_test = trainer.prepare_data(
            sample_regression_data, target_col='target'
        )
        
        trainer.train(X_train, y_train, X_val, y_val)
        
        assert trainer.model is not None
    
    def test_prediction(self, sample_regression_data, temp_model_dir):
        """Test model makes predictions."""
        trainer = BudgetOptimizerTrainer()
        
        X_train, X_val, X_test, y_train, y_val, y_test = trainer.prepare_data(
            sample_regression_data, target_col='target'
        )
        
        trainer.train(X_train, y_train, X_val, y_val)
        predictions = trainer.predict(X_test)
        
        assert len(predictions) == len(X_test)
        assert not np.isnan(predictions).any()
    
    def test_evaluation_metrics(self, sample_regression_data, temp_model_dir):
        """Test evaluation returns expected metrics."""
        trainer = BudgetOptimizerTrainer()
        
        X_train, X_val, X_test, y_train, y_val, y_test = trainer.prepare_data(
            sample_regression_data, target_col='target'
        )
        
        trainer.train(X_train, y_train, X_val, y_val)
        metrics = trainer.evaluate(X_test, y_test)
        
        assert 'rmse' in metrics
        assert 'mae' in metrics
        assert 'r2' in metrics
        assert metrics['r2'] > 0  # Should explain some variance
    
    def test_model_save_load(self, sample_regression_data, temp_model_dir):
        """Test model save and load."""
        trainer = BudgetOptimizerTrainer()
        
        X_train, X_val, X_test, y_train, y_val, y_test = trainer.prepare_data(
            sample_regression_data, target_col='target'
        )
        
        trainer.train(X_train, y_train, X_val, y_val)
        
        # Save
        model_path = trainer.save_model(temp_model_dir)
        assert model_path.exists()
        
        # Load
        new_trainer = BudgetOptimizerTrainer()
        new_trainer.load_model(model_path)
        
        # Compare predictions
        orig_preds = trainer.predict(X_test)
        new_preds = new_trainer.predict(X_test)
        
        np.testing.assert_array_almost_equal(orig_preds, new_preds)
    
    def test_feature_importance(self, sample_regression_data, temp_model_dir):
        """Test feature importance extraction."""
        trainer = BudgetOptimizerTrainer()
        
        X_train, X_val, X_test, y_train, y_val, y_test = trainer.prepare_data(
            sample_regression_data, target_col='target'
        )
        
        trainer.train(X_train, y_train, X_val, y_val)
        importance = trainer.get_feature_importance()
        
        assert len(importance) == X_train.shape[1]
        assert all(v >= 0 for v in importance.values())
```

### Sample Test File: test_cli.py

```python
"""Tests for CLI interface."""

import pytest
import subprocess
import sys
from pathlib import Path


class TestCLI:
    """Test suite for CLI commands."""
    
    @pytest.fixture
    def cli_path(self):
        """Get path to CLI script."""
        return Path(__file__).parent.parent / 'train.py'
    
    def test_help_command(self, cli_path):
        """Test help displays correctly."""
        result = subprocess.run(
            [sys.executable, str(cli_path), '--help'],
            capture_output=True,
            text=True
        )
        
        assert result.returncode == 0
        assert 'KDAP ML Training CLI' in result.stdout
    
    def test_budget_help(self, cli_path):
        """Test budget subcommand help."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'budget', '--help'],
            capture_output=True,
            text=True
        )
        
        assert result.returncode == 0
        assert '--data' in result.stdout
        assert '--tune' in result.stdout
    
    def test_budget_synthetic(self, cli_path, temp_model_dir):
        """Test budget command with synthetic data."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'budget',
             '--samples', '100',
             '--output', temp_model_dir,
             '-v'],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        assert result.returncode == 0
        assert 'Model saved to' in result.stdout
    
    def test_propensity_synthetic(self, cli_path, temp_model_dir):
        """Test propensity command with synthetic data."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'propensity',
             '--samples', '500',
             '--output', temp_model_dir,
             '-v'],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        assert result.returncode == 0
        assert 'Model saved to' in result.stdout
    
    def test_anomaly_synthetic(self, cli_path, temp_model_dir):
        """Test anomaly command with synthetic data."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'anomaly',
             '--samples', '200',
             '--output', temp_model_dir,
             '-v'],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        assert result.returncode == 0
        assert 'Model saved to' in result.stdout
    
    def test_churn_synthetic(self, cli_path, temp_model_dir):
        """Test churn command with synthetic data."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'churn',
             '--samples', '500',
             '--output', temp_model_dir,
             '-v'],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        assert result.returncode == 0
        assert 'Model saved to' in result.stdout
    
    def test_mmm_synthetic(self, cli_path, temp_model_dir):
        """Test mmm command with synthetic data."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'mmm',
             '--weeks', '52',
             '--output', temp_model_dir,
             '-v'],
            capture_output=True,
            text=True,
            timeout=180
        )
        
        assert result.returncode == 0
        assert 'Model saved to' in result.stdout
    
    def test_lookalike_synthetic(self, cli_path, temp_model_dir):
        """Test lookalike command with synthetic data."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'lookalike',
             '--samples', '1000',
             '--top-n', '100',
             '--output', temp_model_dir,
             '-v'],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        assert result.returncode == 0
        assert 'Model saved to' in result.stdout
    
    def test_response_synthetic(self, cli_path, temp_model_dir):
        """Test response command with synthetic data."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'response',
             '--samples', '100',
             '--curve-type', 'hill',
             '--output', temp_model_dir,
             '-v'],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        assert result.returncode == 0
        assert 'Model saved to' in result.stdout
    
    def test_invalid_command(self, cli_path):
        """Test invalid command shows help."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'invalid'],
            capture_output=True,
            text=True
        )
        
        assert result.returncode != 0
```

### Jest Configuration

Create `src/decision-tree-ui/jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

Create `src/decision-tree-ui/tests/setup.ts`:

```typescript
import '@testing-library/jest-dom';
```

### Sample Jest Test: treeBuilder.test.ts

```typescript
import { createTree, createNode, createEdge, createDecisionOption } from '../src/utils/treeBuilder';
import { DecisionTree, TreeNode, TreeEdge } from '../src/types';

describe('treeBuilder utilities', () => {
  describe('createNode', () => {
    it('should create a start node', () => {
      const node = createNode({
        id: 'start',
        type: 'start',
        label: 'Start Node',
      });

      expect(node.id).toBe('start');
      expect(node.type).toBe('start');
      expect(node.label).toBe('Start Node');
    });

    it('should create a decision node with options', () => {
      const node = createNode({
        id: 'decision-1',
        type: 'decision',
        label: 'Make Decision',
        options: [
          createDecisionOption('yes', 'Yes', 'target-yes'),
          createDecisionOption('no', 'No', 'target-no'),
        ],
      });

      expect(node.type).toBe('decision');
      expect(node.options).toHaveLength(2);
      expect(node.options[0].value).toBe('yes');
    });

    it('should create an action node with agent', () => {
      const node = createNode({
        id: 'action-1',
        type: 'action',
        label: 'Perform Action',
        agent: 'ANL',
        capability: 'budget-optimization',
      });

      expect(node.agent).toBe('ANL');
      expect(node.capability).toBe('budget-optimization');
    });
  });

  describe('createEdge', () => {
    it('should create a simple edge', () => {
      const edge = createEdge({
        source: 'node-a',
        target: 'node-b',
      });

      expect(edge.source).toBe('node-a');
      expect(edge.target).toBe('node-b');
      expect(edge.id).toBeDefined();
    });

    it('should create an edge with label', () => {
      const edge = createEdge({
        source: 'decision',
        target: 'action',
        label: 'Yes',
      });

      expect(edge.label).toBe('Yes');
    });
  });

  describe('createTree', () => {
    it('should create a valid tree structure', () => {
      const tree = createTree({
        id: 'test-tree',
        name: 'Test Tree',
        description: 'A test tree',
        version: '1.0.0',
        domain: 'TEST',
        startNodeId: 'start',
        nodes: [
          createNode({ id: 'start', type: 'start', label: 'Start' }),
          createNode({ id: 'end', type: 'end', label: 'End' }),
        ],
        edges: [
          createEdge({ source: 'start', target: 'end' }),
        ],
      });

      expect(tree.id).toBe('test-tree');
      expect(tree.nodes).toHaveLength(2);
      expect(tree.edges).toHaveLength(1);
    });

    it('should validate tree has start node', () => {
      expect(() => {
        createTree({
          id: 'invalid-tree',
          name: 'Invalid Tree',
          version: '1.0.0',
          domain: 'TEST',
          startNodeId: 'missing-start',
          nodes: [
            createNode({ id: 'end', type: 'end', label: 'End' }),
          ],
          edges: [],
        });
      }).toThrow();
    });
  });
});
```

### Running Tests

Add to `src/ml-training/pyproject.toml` or `setup.py`:

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = "test_*.py"
python_classes = "Test*"
python_functions = "test_*"
addopts = "-v --tb=short"
```

Run commands:

```bash
# ML tests
cd src/ml-training
pytest tests/ -v --cov=kdap_ml --cov-report=html

# Decision tree UI tests
cd src/decision-tree-ui
npm test -- --coverage

# Azure ML tests
cd src/azure-ml
npm test -- --coverage
```

---

## Task B: Real-Time Benchmark API Connectors

### Overview

Create API connectors for real-time industry benchmark data to enhance KDAP recommendations.

### Directory Structure

```
src/
└── benchmark-api/
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── index.ts
    │   ├── types.ts
    │   ├── client.ts
    │   ├── connectors/
    │   │   ├── index.ts
    │   │   ├── base.ts
    │   │   ├── nielsen.ts
    │   │   ├── comscore.ts
    │   │   ├── similarweb.ts
    │   │   ├── semrush.ts
    │   │   └── statista.ts
    │   ├── cache/
    │   │   ├── index.ts
    │   │   └── redis-cache.ts
    │   └── utils/
    │       ├── rate-limiter.ts
    │       └── retry.ts
    └── tests/
        ├── connectors.test.ts
        └── integration.test.ts
```

### Base Connector Interface

Create `src/benchmark-api/src/connectors/base.ts`:

```typescript
import { RateLimiter } from '../utils/rate-limiter';
import { withRetry, RetryConfig } from '../utils/retry';

export interface BenchmarkData {
  source: string;
  timestamp: Date;
  metrics: Record<string, number | string>;
  industry?: string;
  region?: string;
  period?: string;
  confidence?: number;
}

export interface BenchmarkQuery {
  industry: string;
  metrics: string[];
  region?: string;
  period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate?: Date;
  endDate?: Date;
}

export interface ConnectorConfig {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
  rateLimitPerMinute?: number;
  retryConfig?: RetryConfig;
}

export abstract class BaseBenchmarkConnector {
  protected config: ConnectorConfig;
  protected rateLimiter: RateLimiter;
  
  constructor(config: ConnectorConfig) {
    this.config = config;
    this.rateLimiter = new RateLimiter(config.rateLimitPerMinute || 60);
  }
  
  abstract get sourceName(): string;
  
  abstract fetchBenchmarks(query: BenchmarkQuery): Promise<BenchmarkData[]>;
  
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    await this.rateLimiter.acquire();
    
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    const response = await withRetry(
      () => fetch(url, { ...options, headers }),
      this.config.retryConfig
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
  
  protected mapToStandardFormat(
    rawData: unknown,
    query: BenchmarkQuery
  ): BenchmarkData[] {
    // Override in subclasses
    throw new Error('Not implemented');
  }
}
```

### Sample Connector Implementation

Create `src/benchmark-api/src/connectors/similarweb.ts`:

```typescript
import { BaseBenchmarkConnector, BenchmarkData, BenchmarkQuery, ConnectorConfig } from './base';

interface SimilarWebResponse {
  meta: {
    status: string;
    request_id: string;
  };
  data: {
    domain: string;
    visits: number;
    unique_visitors: number;
    pages_per_visit: number;
    avg_visit_duration: number;
    bounce_rate: number;
    traffic_sources: {
      direct: number;
      search: number;
      social: number;
      referrals: number;
      mail: number;
      display: number;
    };
  };
}

interface SimilarWebIndustryResponse {
  meta: {
    status: string;
  };
  industry: {
    name: string;
    benchmarks: {
      avg_visits: number;
      avg_pages_per_visit: number;
      avg_visit_duration: number;
      avg_bounce_rate: number;
      traffic_distribution: {
        direct: number;
        search: number;
        social: number;
        referrals: number;
        mail: number;
        display: number;
      };
    };
    top_players: string[];
  };
}

export class SimilarWebConnector extends BaseBenchmarkConnector {
  get sourceName(): string {
    return 'similarweb';
  }
  
  async fetchBenchmarks(query: BenchmarkQuery): Promise<BenchmarkData[]> {
    const endpoint = `/api/v1/industry/${encodeURIComponent(query.industry)}/benchmarks`;
    
    const params = new URLSearchParams({
      region: query.region || 'global',
      period: query.period || 'monthly',
    });
    
    if (query.startDate) {
      params.append('start_date', query.startDate.toISOString().split('T')[0]);
    }
    if (query.endDate) {
      params.append('end_date', query.endDate.toISOString().split('T')[0]);
    }
    
    const response = await this.request<SimilarWebIndustryResponse>(
      `${endpoint}?${params.toString()}`
    );
    
    return this.mapToStandardFormat(response, query);
  }
  
  protected mapToStandardFormat(
    rawData: SimilarWebIndustryResponse,
    query: BenchmarkQuery
  ): BenchmarkData[] {
    const { industry, meta } = rawData;
    
    const metrics: Record<string, number | string> = {};
    
    if (query.metrics.includes('visits') || query.metrics.includes('*')) {
      metrics.avg_visits = industry.benchmarks.avg_visits;
    }
    if (query.metrics.includes('engagement') || query.metrics.includes('*')) {
      metrics.pages_per_visit = industry.benchmarks.avg_pages_per_visit;
      metrics.visit_duration = industry.benchmarks.avg_visit_duration;
      metrics.bounce_rate = industry.benchmarks.avg_bounce_rate;
    }
    if (query.metrics.includes('traffic_sources') || query.metrics.includes('*')) {
      metrics.traffic_direct = industry.benchmarks.traffic_distribution.direct;
      metrics.traffic_search = industry.benchmarks.traffic_distribution.search;
      metrics.traffic_social = industry.benchmarks.traffic_distribution.social;
      metrics.traffic_referrals = industry.benchmarks.traffic_distribution.referrals;
      metrics.traffic_mail = industry.benchmarks.traffic_distribution.mail;
      metrics.traffic_display = industry.benchmarks.traffic_distribution.display;
    }
    
    return [{
      source: this.sourceName,
      timestamp: new Date(),
      metrics,
      industry: query.industry,
      region: query.region || 'global',
      period: query.period || 'monthly',
      confidence: 0.85,
    }];
  }
  
  async fetchDomainData(domain: string): Promise<BenchmarkData> {
    const endpoint = `/api/v1/website/${encodeURIComponent(domain)}/traffic`;
    
    const response = await this.request<SimilarWebResponse>(endpoint);
    
    return {
      source: this.sourceName,
      timestamp: new Date(),
      metrics: {
        visits: response.data.visits,
        unique_visitors: response.data.unique_visitors,
        pages_per_visit: response.data.pages_per_visit,
        visit_duration: response.data.avg_visit_duration,
        bounce_rate: response.data.bounce_rate,
        traffic_direct: response.data.traffic_sources.direct,
        traffic_search: response.data.traffic_sources.search,
        traffic_social: response.data.traffic_sources.social,
      },
      confidence: 0.9,
    };
  }
}
```

### Unified Client

Create `src/benchmark-api/src/client.ts`:

```typescript
import { BaseBenchmarkConnector, BenchmarkData, BenchmarkQuery } from './connectors/base';
import { SimilarWebConnector } from './connectors/similarweb';
import { SemrushConnector } from './connectors/semrush';
import { RedisCache } from './cache/redis-cache';

export interface BenchmarkClientConfig {
  connectors: {
    similarweb?: { apiKey: string };
    semrush?: { apiKey: string };
    nielsen?: { apiKey: string };
    comscore?: { apiKey: string };
    statista?: { apiKey: string };
  };
  cache?: {
    enabled: boolean;
    ttl?: number;
    redisUrl?: string;
  };
}

export class BenchmarkClient {
  private connectors: Map<string, BaseBenchmarkConnector> = new Map();
  private cache?: RedisCache;
  
  constructor(config: BenchmarkClientConfig) {
    // Initialize enabled connectors
    if (config.connectors.similarweb) {
      this.connectors.set('similarweb', new SimilarWebConnector({
        apiKey: config.connectors.similarweb.apiKey,
        baseUrl: 'https://api.similarweb.com',
        rateLimitPerMinute: 100,
      }));
    }
    
    if (config.connectors.semrush) {
      this.connectors.set('semrush', new SemrushConnector({
        apiKey: config.connectors.semrush.apiKey,
        baseUrl: 'https://api.semrush.com',
        rateLimitPerMinute: 60,
      }));
    }
    
    // Add other connectors...
    
    // Initialize cache
    if (config.cache?.enabled) {
      this.cache = new RedisCache({
        url: config.cache.redisUrl,
        defaultTtl: config.cache.ttl || 3600,
      });
    }
  }
  
  async fetchBenchmarks(
    query: BenchmarkQuery,
    sources?: string[]
  ): Promise<Map<string, BenchmarkData[]>> {
    const targetSources = sources || Array.from(this.connectors.keys());
    const results = new Map<string, BenchmarkData[]>();
    
    const cacheKey = this.getCacheKey(query, targetSources);
    
    // Check cache
    if (this.cache) {
      const cached = await this.cache.get<Map<string, BenchmarkData[]>>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    // Fetch from all sources in parallel
    const promises = targetSources.map(async (source) => {
      const connector = this.connectors.get(source);
      if (!connector) {
        console.warn(`Unknown connector: ${source}`);
        return { source, data: [] };
      }
      
      try {
        const data = await connector.fetchBenchmarks(query);
        return { source, data };
      } catch (error) {
        console.error(`Error fetching from ${source}:`, error);
        return { source, data: [], error };
      }
    });
    
    const responses = await Promise.all(promises);
    
    for (const { source, data } of responses) {
      results.set(source, data);
    }
    
    // Cache results
    if (this.cache) {
      await this.cache.set(cacheKey, results);
    }
    
    return results;
  }
  
  async getAggregatedBenchmarks(query: BenchmarkQuery): Promise<BenchmarkData> {
    const allResults = await this.fetchBenchmarks(query);
    
    // Aggregate metrics across sources
    const aggregatedMetrics: Record<string, { sum: number; count: number }> = {};
    
    for (const [source, dataList] of allResults) {
      for (const data of dataList) {
        for (const [key, value] of Object.entries(data.metrics)) {
          if (typeof value === 'number') {
            if (!aggregatedMetrics[key]) {
              aggregatedMetrics[key] = { sum: 0, count: 0 };
            }
            aggregatedMetrics[key].sum += value;
            aggregatedMetrics[key].count += 1;
          }
        }
      }
    }
    
    const metrics: Record<string, number | string> = {};
    for (const [key, { sum, count }] of Object.entries(aggregatedMetrics)) {
      metrics[key] = sum / count;
    }
    
    return {
      source: 'aggregated',
      timestamp: new Date(),
      metrics,
      industry: query.industry,
      region: query.region,
      period: query.period,
      confidence: 0.75,
    };
  }
  
  private getCacheKey(query: BenchmarkQuery, sources: string[]): string {
    return `benchmark:${query.industry}:${sources.sort().join(',')}:${query.period || 'monthly'}:${query.region || 'global'}`;
  }
  
  async close(): Promise<void> {
    if (this.cache) {
      await this.cache.close();
    }
  }
}
```

### Rate Limiter Utility

Create `src/benchmark-api/src/utils/rate-limiter.ts`:

```typescript
export class RateLimiter {
  private tokens: number;
  private maxTokens: number;
  private refillRate: number;
  private lastRefill: number;
  private queue: Array<() => void> = [];
  
  constructor(requestsPerMinute: number) {
    this.maxTokens = requestsPerMinute;
    this.tokens = requestsPerMinute;
    this.refillRate = requestsPerMinute / 60000; // per millisecond
    this.lastRefill = Date.now();
  }
  
  async acquire(): Promise<void> {
    this.refill();
    
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }
    
    // Wait for token
    return new Promise((resolve) => {
      this.queue.push(resolve);
      this.scheduleRefill();
    });
  }
  
  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const newTokens = elapsed * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
    this.lastRefill = now;
    
    // Process queue
    while (this.queue.length > 0 && this.tokens >= 1) {
      this.tokens -= 1;
      const resolve = this.queue.shift()!;
      resolve();
    }
  }
  
  private scheduleRefill(): void {
    const msUntilToken = (1 - this.tokens) / this.refillRate;
    setTimeout(() => this.refill(), msUntilToken);
  }
}
```

### Retry Utility

Create `src/benchmark-api/src/utils/retry.ts`:

```typescript
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBase?: number;
  retryableStatuses?: number[];
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  exponentialBase: 2,
  retryableStatuses: [429, 500, 502, 503, 504],
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Check if should retry
      const shouldRetry = attempt < cfg.maxRetries && isRetryable(error, cfg);
      
      if (!shouldRetry) {
        throw error;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        cfg.maxDelay,
        cfg.baseDelay * Math.pow(cfg.exponentialBase!, attempt) * (0.5 + Math.random() * 0.5)
      );
      
      console.warn(`Retry attempt ${attempt + 1}/${cfg.maxRetries} after ${delay}ms`);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

function isRetryable(error: unknown, config: RetryConfig): boolean {
  if (error instanceof Response) {
    return config.retryableStatuses?.includes(error.status) ?? false;
  }
  
  if (error instanceof Error) {
    // Network errors are retryable
    return error.message.includes('network') ||
           error.message.includes('timeout') ||
           error.message.includes('ECONNRESET');
  }
  
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### Integration with KDAP Agents

The benchmark client integrates with agents via environment variables:

```
KDAP_BENCHMARK_SIMILARWEB_KEY=your-api-key
KDAP_BENCHMARK_SEMRUSH_KEY=your-api-key
KDAP_BENCHMARK_CACHE_ENABLED=true
KDAP_BENCHMARK_CACHE_REDIS_URL=redis://localhost:6379
```

Example usage in agent code:

```typescript
import { BenchmarkClient } from '@kdap/benchmark-api';

const client = new BenchmarkClient({
  connectors: {
    similarweb: { apiKey: process.env.KDAP_BENCHMARK_SIMILARWEB_KEY! },
    semrush: { apiKey: process.env.KDAP_BENCHMARK_SEMRUSH_KEY! },
  },
  cache: {
    enabled: process.env.KDAP_BENCHMARK_CACHE_ENABLED === 'true',
    redisUrl: process.env.KDAP_BENCHMARK_CACHE_REDIS_URL,
    ttl: 3600,
  },
});

// Fetch retail industry benchmarks
const benchmarks = await client.getAggregatedBenchmarks({
  industry: 'retail-ecommerce',
  metrics: ['visits', 'engagement', 'traffic_sources'],
  region: 'us',
  period: 'monthly',
});
```

---

## Execution Order

1. **Task G (CLI)** - Complete first as other tests depend on it
2. **Task D (Testing)** - Set up test infrastructure and write tests
3. **Task B (Benchmarks)** - Build API connectors with tests

## Validation Checklist

### CLI (Task G)
- [ ] All 7 model commands work with synthetic data
- [ ] Help text displays correctly for each command
- [ ] Model files save to specified output directory
- [ ] MLflow logging works when enabled
- [ ] Error handling for missing data files

### Testing (Task D)
- [ ] Pytest runs all ML tests successfully
- [ ] Jest runs all UI tests successfully
- [ ] Coverage meets 80% threshold
- [ ] CI/CD integration configured

### Benchmarks (Task B)
- [ ] Rate limiting prevents API throttling
- [ ] Retry logic handles transient failures
- [ ] Cache reduces redundant API calls
- [ ] Aggregation produces sensible averages
- [ ] Error handling for unavailable sources

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/cli-testing-benchmarks

# After each task completion
git add .
git commit -m "feat(ml): add CLI commands for all 7 models"
git commit -m "test(ml): add pytest suite for ML training"
git commit -m "feat(benchmark): add real-time benchmark API connectors"

# Push and create PR
git push origin feature/cli-testing-benchmarks
```
