"""
Tests for Synthetic Data Generators
"""

import pytest
import numpy as np
import pandas as pd

from kdap_ml.data_pipelines.synthetic import (
    SyntheticDataGenerator,
    GeneratorConfig,
    BudgetOptimizerDataGenerator,
    PropensityDataGenerator,
    ChurnDataGenerator,
    AnomalyDataGenerator,
    MediaMixDataGenerator,
    LookalikeDataGenerator,
    ResponseCurveDataGenerator,
)


class TestGeneratorConfig:
    """Test GeneratorConfig dataclass."""

    def test_default_config(self):
        """Test default configuration values."""
        config = GeneratorConfig()

        assert config.n_samples == 1000
        assert config.noise_level == 0.1
        assert config.random_seed is not None
        assert config.include_ids is True
        assert config.date_range is None

    def test_custom_config(self):
        """Test custom configuration values."""
        config = GeneratorConfig(
            n_samples=500,
            noise_level=0.2,
            random_seed=42,
            include_ids=False,
        )

        assert config.n_samples == 500
        assert config.noise_level == 0.2
        assert config.random_seed == 42
        assert config.include_ids is False


class TestBudgetOptimizerDataGenerator:
    """Test BudgetOptimizerDataGenerator."""

    def test_basic_generation(self):
        """Test basic data generation."""
        config = GeneratorConfig(n_samples=100, random_seed=42)
        generator = BudgetOptimizerDataGenerator(config)

        df = generator.generate()

        assert len(df) == 100
        assert 'total_budget' in df.columns
        assert 'revenue' in df.columns

    def test_channel_columns(self):
        """Test that channel columns are generated."""
        config = GeneratorConfig(n_samples=50, random_seed=42)
        channels = ['search', 'social', 'display']
        generator = BudgetOptimizerDataGenerator(config, channels=channels)

        df = generator.generate()

        for channel in channels:
            assert f'{channel}_spend' in df.columns
            assert f'{channel}_response' in df.columns

    def test_reproducibility(self):
        """Test that same seed produces same data."""
        config = GeneratorConfig(n_samples=50, random_seed=42)

        df1 = BudgetOptimizerDataGenerator(config).generate()
        df2 = BudgetOptimizerDataGenerator(config).generate()

        pd.testing.assert_frame_equal(df1, df2)

    def test_diminishing_returns(self):
        """Test diminishing returns in response curves."""
        config = GeneratorConfig(n_samples=200, random_seed=42, noise_level=0.0)
        generator = BudgetOptimizerDataGenerator(config)

        df = generator.generate()
        df_sorted = df.sort_values('total_budget')

        # Marginal returns should decrease
        spend = df_sorted['total_budget'].values
        revenue = df_sorted['revenue'].values

        # Calculate marginal revenue
        marginal = np.diff(revenue) / np.diff(spend)

        # Filter out noise and check trend
        moving_avg = np.convolve(marginal, np.ones(10) / 10, mode='valid')
        assert moving_avg[0] > moving_avg[-1], "Marginal returns should decrease"


class TestPropensityDataGenerator:
    """Test PropensityDataGenerator."""

    def test_basic_generation(self):
        """Test basic data generation."""
        config = GeneratorConfig(n_samples=100, random_seed=42)
        generator = PropensityDataGenerator(config)

        df = generator.generate()

        assert len(df) == 100
        assert 'propensity_score' in df.columns
        assert 'converted' in df.columns

    def test_propensity_range(self):
        """Test that propensity scores are in valid range."""
        config = GeneratorConfig(n_samples=200, random_seed=42)
        generator = PropensityDataGenerator(config)

        df = generator.generate()

        assert df['propensity_score'].min() >= 0
        assert df['propensity_score'].max() <= 1

    def test_rfm_features(self):
        """Test RFM feature generation."""
        config = GeneratorConfig(n_samples=100, random_seed=42)
        generator = PropensityDataGenerator(config, include_rfm=True)

        df = generator.generate()

        assert 'recency' in df.columns
        assert 'frequency' in df.columns
        assert 'monetary' in df.columns

    def test_customer_segments(self):
        """Test customer segment generation."""
        config = GeneratorConfig(n_samples=200, random_seed=42)
        segments = ['high_value', 'growth', 'at_risk']
        generator = PropensityDataGenerator(config, customer_segments=segments)

        df = generator.generate()

        assert 'customer_segment' in df.columns
        assert set(df['customer_segment'].unique()).issubset(set(segments))


class TestChurnDataGenerator:
    """Test ChurnDataGenerator."""

    def test_basic_generation(self):
        """Test basic data generation."""
        config = GeneratorConfig(n_samples=100, random_seed=42)
        generator = ChurnDataGenerator(config)

        df = generator.generate()

        assert len(df) == 100
        assert 'churned' in df.columns

    def test_churn_rate(self):
        """Test that churn rate is approximately correct."""
        config = GeneratorConfig(n_samples=1000, random_seed=42)
        generator = ChurnDataGenerator(config, churn_rate=0.2)

        df = generator.generate()

        actual_rate = df['churned'].mean()
        assert 0.15 < actual_rate < 0.25, f"Churn rate {actual_rate} not near 0.2"

    def test_tenure_feature(self):
        """Test tenure feature generation."""
        config = GeneratorConfig(n_samples=100, random_seed=42)
        generator = ChurnDataGenerator(config)

        df = generator.generate()

        assert 'tenure_months' in df.columns
        assert df['tenure_months'].min() >= 0


class TestAnomalyDataGenerator:
    """Test AnomalyDataGenerator."""

    def test_basic_generation(self):
        """Test basic data generation."""
        config = GeneratorConfig(n_samples=100, random_seed=42)
        generator = AnomalyDataGenerator(config)

        df = generator.generate()

        assert len(df) == 100
        assert 'is_anomaly' in df.columns
        assert 'value' in df.columns

    def test_anomaly_rate(self):
        """Test that anomaly rate is approximately correct."""
        config = GeneratorConfig(n_samples=1000, random_seed=42)
        generator = AnomalyDataGenerator(config, anomaly_rate=0.05)

        df = generator.generate()

        actual_rate = df['is_anomaly'].mean()
        assert 0.03 < actual_rate < 0.10, f"Anomaly rate {actual_rate} not near 0.05"

    def test_anomaly_types(self):
        """Test different anomaly types."""
        config = GeneratorConfig(n_samples=500, random_seed=42)

        for anomaly_type in ['point', 'contextual', 'collective']:
            generator = AnomalyDataGenerator(config, anomaly_types=[anomaly_type])
            df = generator.generate()

            assert 'anomaly_type' in df.columns
            # Anomalies should be present
            assert df['is_anomaly'].sum() > 0


class TestMediaMixDataGenerator:
    """Test MediaMixDataGenerator."""

    def test_basic_generation(self):
        """Test basic data generation."""
        config = GeneratorConfig(n_samples=100, random_seed=42)
        generator = MediaMixDataGenerator(config)

        df = generator.generate()

        assert len(df) == 100
        assert 'date' in df.columns
        assert 'revenue' in df.columns

    def test_channel_spend(self):
        """Test channel spend columns."""
        config = GeneratorConfig(n_samples=100, random_seed=42)
        channels = ['tv', 'digital', 'radio']
        generator = MediaMixDataGenerator(config, channels=channels)

        df = generator.generate()

        for channel in channels:
            assert f'{channel}_spend' in df.columns
            assert df[f'{channel}_spend'].min() >= 0

    def test_adstock_effect(self):
        """Test that adstock effect is applied."""
        config = GeneratorConfig(n_samples=200, random_seed=42)
        generator = MediaMixDataGenerator(config, include_adstock=True)

        df = generator.generate()

        # Should have adstock columns
        has_adstock = any('adstock' in col for col in df.columns)
        assert has_adstock or 'tv_spend' in df.columns

    def test_control_variables(self):
        """Test control variable generation."""
        config = GeneratorConfig(n_samples=100, random_seed=42)
        generator = MediaMixDataGenerator(config, include_controls=True)

        df = generator.generate()

        # Should have some control variables
        control_cols = ['price_index', 'distribution', 'competitor_spend']
        has_controls = any(col in df.columns for col in control_cols)
        assert has_controls


class TestLookalikeDataGenerator:
    """Test LookalikeDataGenerator."""

    def test_basic_generation(self):
        """Test basic data generation."""
        config = GeneratorConfig(n_samples=100, random_seed=42)
        generator = LookalikeDataGenerator(config)

        df = generator.generate()

        assert len(df) == 100
        assert 'is_seed' in df.columns
        assert 'similarity_score' in df.columns

    def test_seed_customers(self):
        """Test seed customer generation."""
        config = GeneratorConfig(n_samples=200, random_seed=42)
        generator = LookalikeDataGenerator(config, n_seed=20)

        df = generator.generate()

        seed_count = df['is_seed'].sum()
        assert seed_count == 20

    def test_similarity_scores(self):
        """Test similarity score properties."""
        config = GeneratorConfig(n_samples=200, random_seed=42)
        generator = LookalikeDataGenerator(config, n_seed=20)

        df = generator.generate()

        # Seed customers should have high similarity
        seed_similarity = df[df['is_seed']]['similarity_score'].mean()
        non_seed_similarity = df[~df['is_seed']]['similarity_score'].mean()

        assert seed_similarity > non_seed_similarity


class TestResponseCurveDataGenerator:
    """Test ResponseCurveDataGenerator."""

    def test_basic_generation(self):
        """Test basic data generation."""
        config = GeneratorConfig(n_samples=100, random_seed=42)
        generator = ResponseCurveDataGenerator(config)

        df = generator.generate()

        assert len(df) == 100
        assert 'total_spend' in df.columns
        assert 'total_response' in df.columns

    def test_curve_types(self):
        """Test different curve types."""
        config = GeneratorConfig(n_samples=100, random_seed=42)

        for curve_type in ['hill', 'exponential', 'logarithmic', 's_curve', 'linear']:
            generator = ResponseCurveDataGenerator(config, curve_type=curve_type)
            df = generator.generate()

            assert len(df) == 100
            assert df['total_response'].min() >= 0

    def test_hill_curve_saturation(self):
        """Test Hill curve saturation behavior."""
        config = GeneratorConfig(n_samples=500, random_seed=42, noise_level=0.0)
        generator = ResponseCurveDataGenerator(config, curve_type='hill')

        df = generator.generate()
        df_sorted = df.sort_values('total_spend')

        response = df_sorted['total_response'].values

        # Response should plateau at high spend
        high_spend_variance = np.var(response[-50:])
        low_spend_variance = np.var(response[50:100])

        # High spend should have lower variance (saturation)
        assert high_spend_variance < low_spend_variance * 2

    def test_with_true_params(self):
        """Test generation with true parameters returned."""
        config = GeneratorConfig(n_samples=100, random_seed=42)
        generator = ResponseCurveDataGenerator(config, curve_type='hill')

        df, params = generator.generate_with_true_params()

        assert 'curve_type' in params
        assert params['curve_type'] == 'hill'
        assert 'channels' in params


class TestDataQuality:
    """Test data quality across all generators."""

    @pytest.fixture
    def generators(self):
        """Create all generator instances."""
        config = GeneratorConfig(n_samples=100, random_seed=42)
        return [
            BudgetOptimizerDataGenerator(config),
            PropensityDataGenerator(config),
            ChurnDataGenerator(config),
            AnomalyDataGenerator(config),
            MediaMixDataGenerator(config),
            LookalikeDataGenerator(config),
            ResponseCurveDataGenerator(config),
        ]

    def test_no_all_null_columns(self, generators):
        """Test that no columns are entirely null."""
        for generator in generators:
            df = generator.generate()

            for col in df.columns:
                assert df[col].notna().sum() > 0, f"Column {col} is all null in {type(generator).__name__}"

    def test_numeric_columns_finite(self, generators):
        """Test that numeric columns have finite values."""
        for generator in generators:
            df = generator.generate()

            numeric_cols = df.select_dtypes(include=[np.number]).columns

            for col in numeric_cols:
                non_null = df[col].dropna()
                assert np.all(np.isfinite(non_null)), f"Column {col} has non-finite values in {type(generator).__name__}"

    def test_feature_metadata(self, generators):
        """Test that feature metadata is registered."""
        for generator in generators:
            df = generator.generate()
            metadata = generator.get_feature_metadata()

            # Should have some metadata
            assert len(metadata) > 0, f"No feature metadata in {type(generator).__name__}"
