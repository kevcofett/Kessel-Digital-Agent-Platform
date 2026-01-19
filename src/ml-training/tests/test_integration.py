"""Integration tests for ML training pipeline."""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path


class TestDataFixtures:
    """Test that data fixtures are valid."""

    def test_classification_data_shape(self, sample_classification_data):
        """Test classification data has expected shape."""
        assert len(sample_classification_data) == 1000
        assert 'target' in sample_classification_data.columns
        assert sample_classification_data['target'].isin([0, 1]).all()

    def test_regression_data_shape(self, sample_regression_data):
        """Test regression data has expected shape."""
        assert len(sample_regression_data) == 500
        assert 'target' in sample_regression_data.columns
        assert sample_regression_data['target'].dtype == np.float64

    def test_time_series_data_shape(self, sample_time_series_data):
        """Test time series data has expected shape."""
        assert len(sample_time_series_data) == 104
        assert 'date' in sample_time_series_data.columns
        assert 'revenue' in sample_time_series_data.columns

    def test_anomaly_data_shape(self, sample_anomaly_data):
        """Test anomaly data has expected shape."""
        assert len(sample_anomaly_data) == 1000
        assert 'is_anomaly' in sample_anomaly_data.columns
        assert sample_anomaly_data['is_anomaly'].sum() == 50

    def test_churn_data_shape(self, sample_churn_data):
        """Test churn data has expected shape."""
        assert len(sample_churn_data) == 2000
        assert 'churned' in sample_churn_data.columns
        assert sample_churn_data['churned'].isin([0, 1]).all()

    def test_lookalike_data_shape(self, sample_lookalike_data):
        """Test lookalike data has expected shape."""
        assert len(sample_lookalike_data) == 5000
        assert 'is_seed' in sample_lookalike_data.columns
        assert sample_lookalike_data['is_seed'].sum() == 500

    def test_response_curve_data_shape(self, sample_response_curve_data):
        """Test response curve data has expected shape."""
        assert len(sample_response_curve_data) == 200
        assert 'spend' in sample_response_curve_data.columns
        assert 'conversions' in sample_response_curve_data.columns
        assert (sample_response_curve_data['spend'] >= 0).all()
        assert (sample_response_curve_data['conversions'] >= 0).all()


class TestDataQuality:
    """Test data quality checks."""

    def test_no_null_values_classification(self, sample_classification_data):
        """Test classification data has no nulls."""
        assert sample_classification_data.isnull().sum().sum() == 0

    def test_no_null_values_regression(self, sample_regression_data):
        """Test regression data has no nulls."""
        assert sample_regression_data.isnull().sum().sum() == 0

    def test_target_distribution_classification(self, sample_classification_data):
        """Test target has reasonable distribution."""
        positive_ratio = sample_classification_data['target'].mean()
        assert 0.1 < positive_ratio < 0.9

    def test_feature_ranges(self, sample_classification_data):
        """Test features have reasonable ranges."""
        for col in ['feature_1', 'feature_2', 'feature_3']:
            assert sample_classification_data[col].std() > 0.1
            assert abs(sample_classification_data[col].mean()) < 1


class TestPipelineIntegration:
    """Test end-to-end pipeline integration."""

    def test_temp_dir_creation(self, temp_model_dir):
        """Test temporary directory is created."""
        assert Path(temp_model_dir).exists()
        assert Path(temp_model_dir).is_dir()

    def test_data_can_be_saved(self, sample_classification_data, temp_model_dir):
        """Test data can be saved and loaded."""
        path = Path(temp_model_dir) / 'test_data.csv'
        sample_classification_data.to_csv(path, index=False)

        loaded = pd.read_csv(path)
        assert len(loaded) == len(sample_classification_data)
        assert list(loaded.columns) == list(sample_classification_data.columns)
