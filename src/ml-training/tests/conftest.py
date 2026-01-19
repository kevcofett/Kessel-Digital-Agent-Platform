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


@pytest.fixture
def sample_churn_data():
    """Generate sample churn data."""
    np.random.seed(42)
    n_samples = 2000

    return pd.DataFrame({
        'tenure_months': np.random.randint(1, 72, n_samples),
        'monthly_charges': np.random.uniform(20, 100, n_samples),
        'total_charges': np.random.uniform(100, 5000, n_samples),
        'contract_type': np.random.choice(['month-to-month', 'one_year', 'two_year'], n_samples),
        'payment_method': np.random.choice(['credit_card', 'bank_transfer', 'electronic'], n_samples),
        'churned': np.random.choice([0, 1], n_samples, p=[0.73, 0.27]),
    })


@pytest.fixture
def sample_lookalike_data():
    """Generate sample lookalike audience data."""
    np.random.seed(42)
    n_samples = 5000

    return pd.DataFrame({
        'age': np.random.randint(18, 65, n_samples),
        'income': np.random.lognormal(11, 0.5, n_samples),
        'engagement_score': np.random.uniform(0, 100, n_samples),
        'purchase_frequency': np.random.poisson(5, n_samples),
        'is_seed': np.array([1] * 500 + [0] * (n_samples - 500)),
        'converted': np.random.choice([0, 1], n_samples, p=[0.9, 0.1]),
    })


@pytest.fixture
def sample_response_curve_data():
    """Generate sample response curve data."""
    np.random.seed(42)
    n_samples = 200

    spend = np.random.uniform(0, 100000, n_samples)
    # Hill function with noise
    k = 50000
    n = 2
    max_response = 1000
    conversions = max_response * (spend ** n) / (k ** n + spend ** n) + np.random.randn(n_samples) * 20

    return pd.DataFrame({
        'spend': spend,
        'conversions': np.maximum(conversions, 0),
    })
