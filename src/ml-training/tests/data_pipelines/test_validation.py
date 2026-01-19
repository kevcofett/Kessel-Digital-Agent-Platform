"""
Tests for Data Validation Module
"""

import pytest
import numpy as np
import pandas as pd

from kdap_ml.data_pipelines.validation import (
    DataValidator,
    SchemaValidator,
    QualityValidator,
    StatisticalValidator,
    ValidationResult,
    ValidationSeverity,
    ValidationRule,
    RequiredRule,
    TypeRule,
    RangeRule,
    RegexRule,
    UniqueRule,
    NullRule,
    CustomRule,
    RuleSet,
    DataProfiler,
    DataProfile,
)


@pytest.fixture
def sample_data():
    """Create sample DataFrame for testing."""
    return pd.DataFrame({
        'id': range(100),
        'name': [f'user_{i}' for i in range(100)],
        'age': np.random.randint(18, 80, 100),
        'email': [f'user_{i}@example.com' for i in range(100)],
        'score': np.random.uniform(0, 100, 100),
        'category': np.random.choice(['A', 'B', 'C'], 100),
        'created_at': pd.date_range('2024-01-01', periods=100, freq='D'),
    })


@pytest.fixture
def data_with_issues():
    """Create sample DataFrame with quality issues."""
    df = pd.DataFrame({
        'id': list(range(95)) + [None, None, None, None, None],
        'name': ['user_' + str(i) for i in range(100)],
        'age': list(np.random.randint(18, 80, 95)) + [-5, 150, None, None, 25],
        'email': [f'user_{i}@example.com' for i in range(90)] + ['invalid', 'bad@', None] * 3 + ['good@test.com'],
        'score': list(np.random.uniform(0, 100, 98)) + [None, None],
        'category': np.random.choice(['A', 'B', 'C', 'INVALID'], 100),
    })
    return df


class TestSchemaValidator:
    """Test SchemaValidator."""

    def test_valid_schema(self, sample_data):
        """Test validation with matching schema."""
        schema = {
            'id': 'int64',
            'name': 'object',
            'age': 'int64',
            'score': 'float64',
        }

        validator = SchemaValidator(schema)
        results = validator.validate(sample_data)

        assert validator.is_valid(sample_data)

    def test_missing_columns(self, sample_data):
        """Test detection of missing columns."""
        schema = {
            'id': 'int64',
            'name': 'object',
            'missing_column': 'string',
        }

        validator = SchemaValidator(schema, required_columns=['missing_column'])
        results = validator.validate(sample_data)

        assert not validator.is_valid(sample_data)

        # Find the missing column result
        missing_result = [r for r in results if 'missing' in r.message.lower()]
        assert len(missing_result) > 0

    def test_type_mismatch(self, sample_data):
        """Test detection of type mismatches."""
        schema = {
            'id': 'string',  # Wrong type - id is int64
            'name': 'object',
        }

        validator = SchemaValidator(schema)
        results = validator.validate(sample_data)

        type_results = [r for r in results if r.rule_name == 'column_type' and r.column == 'id']
        assert len(type_results) > 0
        assert not type_results[0].is_valid

    def test_extra_columns_warning(self, sample_data):
        """Test warning for extra columns."""
        schema = {
            'id': 'int64',
        }

        validator = SchemaValidator(schema, allow_extra_columns=False)
        results = validator.validate(sample_data)

        extra_results = [r for r in results if 'unexpected' in r.message.lower()]
        assert len(extra_results) > 0


class TestQualityValidator:
    """Test QualityValidator."""

    def test_null_threshold(self, data_with_issues):
        """Test null rate threshold detection."""
        validator = QualityValidator(null_threshold=0.01)  # Very strict
        results = validator.validate(data_with_issues)

        null_results = [r for r in results if r.rule_name == 'null_check' and not r.is_valid]
        assert len(null_results) > 0

    def test_duplicate_detection(self):
        """Test duplicate row detection."""
        df = pd.DataFrame({
            'a': [1, 1, 2, 2, 3],
            'b': ['x', 'x', 'y', 'y', 'z'],
        })

        validator = QualityValidator(duplicate_threshold=0.0)
        results = validator.validate(df)

        dup_results = [r for r in results if r.rule_name == 'duplicate_check']
        assert len(dup_results) > 0
        assert not dup_results[0].is_valid

    def test_unique_column_check(self, sample_data):
        """Test unique column validation."""
        validator = QualityValidator(unique_columns=['id'])
        results = validator.validate(sample_data)

        unique_results = [r for r in results if r.rule_name == 'unique_check']
        assert len(unique_results) > 0
        assert unique_results[0].is_valid

    def test_value_range_check(self, data_with_issues):
        """Test value range validation."""
        validator = QualityValidator(value_ranges={'age': (0, 120)})
        results = validator.validate(data_with_issues)

        range_results = [r for r in results if r.rule_name == 'range_check']
        assert len(range_results) > 0
        # Should fail because of -5 and 150 values
        assert not range_results[0].is_valid

    def test_categorical_values(self, data_with_issues):
        """Test categorical value validation."""
        validator = QualityValidator(categorical_values={'category': ['A', 'B', 'C']})
        results = validator.validate(data_with_issues)

        cat_results = [r for r in results if r.rule_name == 'categorical_check']
        assert len(cat_results) > 0
        # Should fail because of 'INVALID' value
        assert not cat_results[0].is_valid


class TestStatisticalValidator:
    """Test StatisticalValidator."""

    def test_outlier_detection(self):
        """Test outlier detection."""
        # Create data with clear outliers
        df = pd.DataFrame({
            'value': list(np.random.normal(50, 5, 95)) + [200, -100, 300, 250, -150],
        })

        validator = StatisticalValidator(outlier_threshold=1.5)
        results = validator.validate(df)

        outlier_results = [r for r in results if r.rule_name == 'outlier_check']
        assert len(outlier_results) > 0

    def test_drift_detection(self):
        """Test distribution drift detection."""
        # Reference stats
        reference = {
            'value': {'mean': 50, 'std': 5},
        }

        # Data with significant drift
        df = pd.DataFrame({
            'value': np.random.normal(100, 5, 100),  # Mean shifted from 50 to 100
        })

        validator = StatisticalValidator(reference_stats=reference)
        results = validator.validate(df)

        drift_results = [r for r in results if r.rule_name == 'drift_check']
        assert len(drift_results) > 0
        assert not drift_results[0].is_valid

    def test_compute_reference_stats(self, sample_data):
        """Test reference statistics computation."""
        validator = StatisticalValidator()
        stats = validator.compute_reference_stats(sample_data)

        assert 'age' in stats
        assert 'mean' in stats['age']
        assert 'std' in stats['age']


class TestValidationRules:
    """Test individual validation rules."""

    def test_required_rule(self, sample_data):
        """Test RequiredRule."""
        rule = RequiredRule('id')
        result = rule.validate(sample_data)
        assert result.is_valid

        # Test missing column
        rule_missing = RequiredRule('nonexistent')
        result_missing = rule_missing.validate(sample_data)
        assert not result_missing.is_valid

    def test_type_rule(self, sample_data):
        """Test TypeRule."""
        rule = TypeRule('age', 'numeric')
        result = rule.validate(sample_data)
        assert result.is_valid

        rule_wrong = TypeRule('name', 'numeric')
        result_wrong = rule_wrong.validate(sample_data)
        assert not result_wrong.is_valid

    def test_range_rule(self, sample_data):
        """Test RangeRule."""
        rule = RangeRule('age', min_value=0, max_value=150)
        result = rule.validate(sample_data)
        assert result.is_valid

        rule_strict = RangeRule('age', min_value=25, max_value=60)
        result_strict = rule_strict.validate(sample_data)
        # May or may not be valid depending on random data
        assert result_strict.total_count > 0

    def test_regex_rule(self, sample_data):
        """Test RegexRule."""
        rule = RegexRule('email', r'^[\w\.-]+@[\w\.-]+\.\w+$')
        result = rule.validate(sample_data)
        assert result.is_valid

    def test_unique_rule(self, sample_data):
        """Test UniqueRule."""
        rule = UniqueRule('id')
        result = rule.validate(sample_data)
        assert result.is_valid

        rule_not_unique = UniqueRule('category')
        result_not_unique = rule_not_unique.validate(sample_data)
        assert not result_not_unique.is_valid

    def test_null_rule(self, sample_data):
        """Test NullRule."""
        rule = NullRule('id', allow_null=False)
        result = rule.validate(sample_data)
        assert result.is_valid

    def test_custom_rule(self, sample_data):
        """Test CustomRule."""
        # Custom rule: age must be less than 100
        rule = CustomRule(
            'age_under_100',
            lambda df: (df['age'] < 100).all(),
            message='Age must be under 100',
        )
        result = rule.validate(sample_data)
        assert result.is_valid


class TestRuleSet:
    """Test RuleSet."""

    def test_add_rules(self, sample_data):
        """Test adding rules to rule set."""
        ruleset = RuleSet('test_rules')
        ruleset.add_required('id')
        ruleset.add_type('age', 'numeric')
        ruleset.add_range('score', 0, 100)

        assert len(ruleset.rules) == 3

    def test_validate_all(self, sample_data):
        """Test validating all rules."""
        ruleset = (
            RuleSet('test_rules')
            .add_required('id')
            .add_type('age', 'numeric')
            .add_unique('id')
        )

        results = ruleset.validate(sample_data)
        assert len(results) == 3
        assert ruleset.is_valid(sample_data)

    def test_chain_rules(self, sample_data):
        """Test method chaining."""
        ruleset = (
            RuleSet('chained_rules')
            .add_required('id')
            .add_required('name')
            .add_type('score', 'numeric')
            .add_range('age', 0, 150)
        )

        assert len(ruleset.rules) == 4


class TestDataProfiler:
    """Test DataProfiler."""

    def test_basic_profiling(self, sample_data):
        """Test basic data profiling."""
        profiler = DataProfiler()
        profile = profiler.profile(sample_data, name='test_data')

        assert profile.name == 'test_data'
        assert profile.row_count == 100
        assert profile.column_count == 7

    def test_column_profiles(self, sample_data):
        """Test column-level profiling."""
        profiler = DataProfiler()
        profile = profiler.profile(sample_data)

        assert 'age' in profile.columns
        assert profile.columns['age'].dtype == 'int64'
        assert profile.columns['age'].null_count == 0

    def test_numeric_stats(self, sample_data):
        """Test numeric column statistics."""
        profiler = DataProfiler()
        profile = profiler.profile(sample_data)

        age_profile = profile.columns['age']
        assert age_profile.mean is not None
        assert age_profile.std is not None
        assert age_profile.min is not None
        assert age_profile.max is not None

    def test_categorical_stats(self, sample_data):
        """Test categorical column statistics."""
        profiler = DataProfiler()
        profile = profiler.profile(sample_data)

        cat_profile = profile.columns['category']
        assert cat_profile.top_values is not None
        assert len(cat_profile.top_values) > 0

    def test_correlations(self, sample_data):
        """Test correlation computation."""
        profiler = DataProfiler(include_correlations=True, correlation_threshold=0.0)
        profile = profiler.profile(sample_data)

        # May or may not have correlations depending on data
        assert hasattr(profile, 'correlations')

    def test_warnings_generation(self, data_with_issues):
        """Test warning generation."""
        profiler = DataProfiler()
        profile = profiler.profile(data_with_issues)

        # Should have warnings about null values
        assert len(profile.warnings) > 0

    def test_profile_to_dict(self, sample_data):
        """Test profile serialization."""
        profiler = DataProfiler()
        profile = profiler.profile(sample_data)

        profile_dict = profile.to_dict()
        assert 'name' in profile_dict
        assert 'columns' in profile_dict
        assert 'row_count' in profile_dict

    def test_profile_to_dataframe(self, sample_data):
        """Test profile to DataFrame conversion."""
        profiler = DataProfiler()
        profile = profiler.profile(sample_data)

        df = profile.to_dataframe()
        assert len(df) == 7  # Number of columns
        assert 'name' in df.columns
        assert 'dtype' in df.columns

    def test_compare_profiles(self, sample_data):
        """Test profile comparison."""
        profiler = DataProfiler()

        # Profile original data
        profile1 = profiler.profile(sample_data, name='original')

        # Create modified data with drift
        modified_data = sample_data.copy()
        modified_data['age'] = modified_data['age'] + 50  # Shift mean

        profile2 = profiler.profile(modified_data, name='modified')

        comparison = profiler.compare_profiles(profile1, profile2)

        assert 'row_count_change' in comparison
        assert 'drift_detected' in comparison


class TestValidationSeverity:
    """Test ValidationSeverity enum."""

    def test_severity_levels(self):
        """Test severity level values."""
        assert ValidationSeverity.ERROR.value == 'error'
        assert ValidationSeverity.WARNING.value == 'warning'
        assert ValidationSeverity.INFO.value == 'info'


class TestValidationResult:
    """Test ValidationResult dataclass."""

    def test_pass_rate_calculation(self):
        """Test pass rate calculation."""
        result = ValidationResult(
            is_valid=False,
            rule_name='test',
            failed_count=20,
            total_count=100,
        )

        assert result.pass_rate == 0.8

    def test_zero_total_count(self):
        """Test pass rate with zero total count."""
        result = ValidationResult(
            is_valid=True,
            rule_name='test',
            failed_count=0,
            total_count=0,
        )

        assert result.pass_rate == 1.0
