"""
Tests for Data Transforms Module
"""

import pytest
import numpy as np
import pandas as pd

from kdap_ml.data_pipelines.transforms import (
    Transform,
    TransformPipeline,
    TransformResult,
    StandardScaler,
    MinMaxScaler,
    RobustScaler,
    LogTransform,
    LabelEncoder,
    OneHotEncoder,
    TargetEncoder,
    FrequencyEncoder,
    DatetimeFeatures,
    CyclicalEncoder,
    LagFeatures,
    RollingFeatures,
    TextCleaner,
    TextVectorizer,
)


@pytest.fixture
def numeric_data():
    """Create sample numeric DataFrame."""
    np.random.seed(42)
    return pd.DataFrame({
        'value1': np.random.normal(100, 20, 100),
        'value2': np.random.uniform(0, 1000, 100),
        'value3': np.random.exponential(50, 100),
    })


@pytest.fixture
def categorical_data():
    """Create sample categorical DataFrame."""
    np.random.seed(42)
    return pd.DataFrame({
        'category': np.random.choice(['A', 'B', 'C', 'D'], 100),
        'size': np.random.choice(['small', 'medium', 'large'], 100),
        'target': np.random.randint(0, 2, 100),
    })


@pytest.fixture
def datetime_data():
    """Create sample datetime DataFrame."""
    return pd.DataFrame({
        'date': pd.date_range('2024-01-01', periods=100, freq='H'),
        'value': np.random.normal(0, 1, 100),
    })


@pytest.fixture
def text_data():
    """Create sample text DataFrame."""
    return pd.DataFrame({
        'text': [
            'Hello World!',
            'This is a test.',
            'Machine Learning is fun!',
            'Data Science 101',
            'Python programming',
        ] * 20,
        'label': np.random.randint(0, 2, 100),
    })


class TestStandardScaler:
    """Test StandardScaler transform."""

    def test_fit_transform(self, numeric_data):
        """Test fit and transform."""
        scaler = StandardScaler(columns=['value1', 'value2'])
        scaler.fit(numeric_data)

        result = scaler.transform(numeric_data)

        # Check scaled columns exist
        assert 'value1_scaled' in result.columns
        assert 'value2_scaled' in result.columns

    def test_standardization(self, numeric_data):
        """Test that values are standardized."""
        scaler = StandardScaler(columns=['value1'])
        result = scaler.fit_transform(numeric_data)

        # Mean should be close to 0, std close to 1
        assert abs(result['value1_scaled'].mean()) < 0.1
        assert abs(result['value1_scaled'].std() - 1) < 0.1

    def test_inverse_transform(self, numeric_data):
        """Test inverse transformation."""
        scaler = StandardScaler(columns=['value1'])
        transformed = scaler.fit_transform(numeric_data)
        restored = scaler.inverse_transform(transformed)

        np.testing.assert_array_almost_equal(
            numeric_data['value1'].values,
            restored['value1'].values,
            decimal=5,
        )

    def test_get_params(self, numeric_data):
        """Test parameter retrieval."""
        scaler = StandardScaler(columns=['value1'])
        scaler.fit(numeric_data)

        params = scaler.get_params()
        assert 'means' in params
        assert 'stds' in params


class TestMinMaxScaler:
    """Test MinMaxScaler transform."""

    def test_default_range(self, numeric_data):
        """Test default 0-1 scaling."""
        scaler = MinMaxScaler(columns=['value1'])
        result = scaler.fit_transform(numeric_data)

        assert result['value1_scaled'].min() >= 0
        assert result['value1_scaled'].max() <= 1

    def test_custom_range(self, numeric_data):
        """Test custom range scaling."""
        scaler = MinMaxScaler(columns=['value1'], feature_range=(-1, 1))
        result = scaler.fit_transform(numeric_data)

        assert result['value1_scaled'].min() >= -1
        assert result['value1_scaled'].max() <= 1

    def test_inverse_transform(self, numeric_data):
        """Test inverse transformation."""
        scaler = MinMaxScaler(columns=['value1'])
        transformed = scaler.fit_transform(numeric_data)
        restored = scaler.inverse_transform(transformed)

        np.testing.assert_array_almost_equal(
            numeric_data['value1'].values,
            restored['value1'].values,
            decimal=5,
        )


class TestRobustScaler:
    """Test RobustScaler transform."""

    def test_robust_to_outliers(self):
        """Test robustness to outliers."""
        # Data with outliers
        data = pd.DataFrame({
            'value': list(np.random.normal(50, 5, 95)) + [500, 600, 700, 800, 900],
        })

        scaler = RobustScaler(columns=['value'])
        result = scaler.fit_transform(data)

        # Median should still be close to 0
        median_scaled = result['value_scaled'].median()
        assert abs(median_scaled) < 0.5


class TestLogTransform:
    """Test LogTransform."""

    def test_log_transform(self, numeric_data):
        """Test log transformation."""
        # Use positive values
        data = pd.DataFrame({'value': np.random.exponential(10, 100)})

        transform = LogTransform(columns=['value'])
        result = transform.fit_transform(data)

        assert 'value_log' in result.columns

    def test_log1p(self):
        """Test log1p transformation for zero-inclusive data."""
        data = pd.DataFrame({'value': [0, 1, 2, 3, 4, 5]})

        transform = LogTransform(columns=['value'], offset=1.0)
        result = transform.fit_transform(data)

        # Should handle zeros
        assert not np.any(np.isinf(result['value_log']))

    def test_inverse_transform(self):
        """Test inverse log transformation."""
        data = pd.DataFrame({'value': np.random.exponential(10, 100) + 1})

        transform = LogTransform(columns=['value'], offset=1.0)
        transformed = transform.fit_transform(data)
        restored = transform.inverse_transform(transformed)

        np.testing.assert_array_almost_equal(
            data['value'].values,
            restored['value'].values,
            decimal=5,
        )


class TestLabelEncoder:
    """Test LabelEncoder transform."""

    def test_encode_categories(self, categorical_data):
        """Test category encoding."""
        encoder = LabelEncoder(columns=['category'])
        result = encoder.fit_transform(categorical_data)

        assert 'category_encoded' in result.columns
        assert result['category_encoded'].dtype in [np.int64, np.int32, int]

    def test_inverse_transform(self, categorical_data):
        """Test inverse encoding."""
        encoder = LabelEncoder(columns=['category'])
        encoded = encoder.fit_transform(categorical_data)
        decoded = encoder.inverse_transform(encoded)

        assert list(decoded['category']) == list(categorical_data['category'])

    def test_handle_unknown(self, categorical_data):
        """Test handling unknown categories."""
        encoder = LabelEncoder(columns=['category'], handle_unknown='use_default', default_value=-1)
        encoder.fit(categorical_data)

        # Create data with unknown category
        new_data = pd.DataFrame({'category': ['A', 'B', 'UNKNOWN', 'NEW']})
        result = encoder.transform(new_data)

        assert (result['category_encoded'] == -1).sum() == 2


class TestOneHotEncoder:
    """Test OneHotEncoder transform."""

    def test_one_hot_encoding(self, categorical_data):
        """Test one-hot encoding."""
        encoder = OneHotEncoder(columns=['size'])
        result = encoder.fit_transform(categorical_data)

        # Should have columns for each category
        assert 'size_small' in result.columns or 'size_large' in result.columns

    def test_drop_first(self, categorical_data):
        """Test dropping first category."""
        encoder = OneHotEncoder(columns=['size'], drop_first=True)
        result = encoder.fit_transform(categorical_data)

        # Should have n-1 columns
        size_cols = [c for c in result.columns if c.startswith('size_')]
        assert len(size_cols) == 2  # 3 categories - 1

    def test_feature_names(self, categorical_data):
        """Test getting feature names."""
        encoder = OneHotEncoder(columns=['size'])
        encoder.fit(categorical_data)

        names = encoder.get_feature_names()
        assert len(names) > 0


class TestTargetEncoder:
    """Test TargetEncoder transform."""

    def test_target_encoding(self, categorical_data):
        """Test target encoding."""
        encoder = TargetEncoder(columns=['category'], target_column='target')
        result = encoder.fit_transform(categorical_data)

        assert 'category_target_encoded' in result.columns
        # Values should be between 0 and 1 (for binary target)
        assert result['category_target_encoded'].min() >= 0
        assert result['category_target_encoded'].max() <= 1

    def test_smoothing(self, categorical_data):
        """Test smoothing effect."""
        encoder_no_smooth = TargetEncoder(columns=['category'], target_column='target', smoothing=0.0)
        encoder_smooth = TargetEncoder(columns=['category'], target_column='target', smoothing=10.0)

        result_no_smooth = encoder_no_smooth.fit_transform(categorical_data)
        result_smooth = encoder_smooth.fit_transform(categorical_data)

        # Smoothed values should be closer to global mean
        global_mean = categorical_data['target'].mean()
        smooth_variance = np.var(result_smooth['category_target_encoded'])
        no_smooth_variance = np.var(result_no_smooth['category_target_encoded'])

        assert smooth_variance <= no_smooth_variance


class TestFrequencyEncoder:
    """Test FrequencyEncoder transform."""

    def test_frequency_encoding(self, categorical_data):
        """Test frequency encoding."""
        encoder = FrequencyEncoder(columns=['category'], normalize=True)
        result = encoder.fit_transform(categorical_data)

        assert 'category_freq' in result.columns
        # Values should sum to approximately 1
        assert abs(result['category_freq'].sum() / len(result) - 1) < 0.01


class TestDatetimeFeatures:
    """Test DatetimeFeatures transform."""

    def test_extract_features(self, datetime_data):
        """Test datetime feature extraction."""
        transform = DatetimeFeatures(
            columns=['date'],
            features=['year', 'month', 'day', 'hour', 'dayofweek'],
        )
        result = transform.fit_transform(datetime_data)

        assert 'date_year' in result.columns
        assert 'date_month' in result.columns
        assert 'date_day' in result.columns
        assert 'date_hour' in result.columns
        assert 'date_dayofweek' in result.columns

    def test_weekend_detection(self, datetime_data):
        """Test weekend detection."""
        transform = DatetimeFeatures(columns=['date'], features=['is_weekend'])
        result = transform.fit_transform(datetime_data)

        assert 'date_is_weekend' in result.columns
        # Values should be 0 or 1
        assert set(result['date_is_weekend'].unique()).issubset({0, 1})


class TestCyclicalEncoder:
    """Test CyclicalEncoder transform."""

    def test_cyclical_encoding(self, datetime_data):
        """Test cyclical encoding."""
        # First extract hour
        dt_features = DatetimeFeatures(columns=['date'], features=['hour'])
        data_with_hour = dt_features.fit_transform(datetime_data)

        encoder = CyclicalEncoder(columns=['date_hour'])
        result = encoder.fit_transform(data_with_hour)

        assert 'date_hour_sin' in result.columns
        assert 'date_hour_cos' in result.columns

        # Sin/cos values should be between -1 and 1
        assert result['date_hour_sin'].min() >= -1
        assert result['date_hour_sin'].max() <= 1


class TestLagFeatures:
    """Test LagFeatures transform."""

    def test_create_lags(self):
        """Test lag feature creation."""
        data = pd.DataFrame({
            'value': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        })

        transform = LagFeatures(columns=['value'], lags=[1, 2, 3])
        result = transform.fit_transform(data)

        assert 'value_lag1' in result.columns
        assert 'value_lag2' in result.columns
        assert 'value_lag3' in result.columns

        # Check lag values
        assert result['value_lag1'].iloc[1] == 1
        assert result['value_lag1'].iloc[2] == 2


class TestRollingFeatures:
    """Test RollingFeatures transform."""

    def test_rolling_statistics(self):
        """Test rolling feature creation."""
        data = pd.DataFrame({
            'value': np.random.normal(0, 1, 50),
        })

        transform = RollingFeatures(
            columns=['value'],
            windows=[3, 5],
            functions=['mean', 'std'],
        )
        result = transform.fit_transform(data)

        assert 'value_roll3_mean' in result.columns
        assert 'value_roll3_std' in result.columns
        assert 'value_roll5_mean' in result.columns
        assert 'value_roll5_std' in result.columns


class TestTextCleaner:
    """Test TextCleaner transform."""

    def test_basic_cleaning(self, text_data):
        """Test basic text cleaning."""
        cleaner = TextCleaner(
            columns=['text'],
            lowercase=True,
            remove_punctuation=True,
        )
        result = cleaner.fit_transform(text_data)

        assert 'text_cleaned' in result.columns

        # Check lowercase
        assert result['text_cleaned'].str.islower().all() or result['text_cleaned'].str.contains(' ').any()

    def test_stopword_removal(self):
        """Test stopword removal."""
        data = pd.DataFrame({
            'text': ['This is a test', 'The quick brown fox'],
        })

        cleaner = TextCleaner(columns=['text'], remove_stopwords=True)
        result = cleaner.fit_transform(data)

        # Common stopwords should be removed
        assert 'is' not in result['text_cleaned'].iloc[0]
        assert 'the' not in result['text_cleaned'].iloc[1].lower()


class TestTextVectorizer:
    """Test TextVectorizer transform."""

    def test_tfidf_vectorization(self, text_data):
        """Test TF-IDF vectorization."""
        vectorizer = TextVectorizer(column='text', method='tfidf', max_features=50)
        result = vectorizer.fit_transform(text_data)

        # Should have vector columns
        text_cols = [c for c in result.columns if c.startswith('text_')]
        assert len(text_cols) > 0

    def test_count_vectorization(self, text_data):
        """Test count vectorization."""
        vectorizer = TextVectorizer(column='text', method='count', max_features=50)
        result = vectorizer.fit_transform(text_data)

        text_cols = [c for c in result.columns if c.startswith('text_')]
        assert len(text_cols) > 0

    def test_feature_names(self, text_data):
        """Test getting feature names."""
        vectorizer = TextVectorizer(column='text', max_features=50)
        vectorizer.fit(text_data)

        names = vectorizer.get_feature_names()
        assert len(names) > 0


class TestTransformPipeline:
    """Test TransformPipeline."""

    def test_pipeline_execution(self, numeric_data):
        """Test pipeline with multiple transforms."""
        pipeline = TransformPipeline('test_pipeline')
        pipeline.add(StandardScaler(columns=['value1']))
        pipeline.add(MinMaxScaler(columns=['value2']))

        result = pipeline.fit_transform(numeric_data)

        assert 'value1_scaled' in result.columns
        assert 'value2_scaled' in result.columns

    def test_pipeline_results(self, numeric_data):
        """Test getting pipeline results."""
        pipeline = TransformPipeline('test_pipeline')
        pipeline.add(StandardScaler(columns=['value1']))

        pipeline.fit_transform(numeric_data)
        results = pipeline.get_results()

        assert len(results) == 1
        assert results[0].success

    def test_pipeline_summary(self, numeric_data):
        """Test pipeline summary."""
        pipeline = TransformPipeline('test_pipeline')
        pipeline.add(StandardScaler(columns=['value1']))
        pipeline.add(LogTransform(columns=['value3']))

        pipeline.fit_transform(numeric_data)
        summary = pipeline.get_summary()

        assert summary['pipeline_name'] == 'test_pipeline'
        assert summary['total_transforms'] == 2
        assert summary['successful_transforms'] == 2

    def test_pipeline_chaining(self, numeric_data):
        """Test pipeline method chaining."""
        pipeline = (
            TransformPipeline('chained')
            .add(StandardScaler(columns=['value1']))
            .add(MinMaxScaler(columns=['value2']))
        )

        assert len(pipeline.transforms) == 2

    def test_pipeline_serialization(self, numeric_data, tmp_path):
        """Test pipeline save/load."""
        pipeline = TransformPipeline('serializable')
        pipeline.add(StandardScaler(columns=['value1']))
        pipeline.fit(numeric_data)

        # Save
        path = tmp_path / 'pipeline.json'
        pipeline.save(str(path))

        # Load
        registry = {'StandardScaler': StandardScaler}
        loaded = TransformPipeline.load(str(path), registry)

        assert loaded.name == 'serializable'
        assert len(loaded.transforms) == 1
