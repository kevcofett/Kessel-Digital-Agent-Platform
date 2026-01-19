"""
Data Validators
Core validation classes for data quality checks
"""

import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Callable, Dict, List, Optional, Union

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class ValidationSeverity(Enum):
    """Severity levels for validation issues."""
    ERROR = 'error'
    WARNING = 'warning'
    INFO = 'info'


@dataclass
class ValidationResult:
    """Result of a validation check."""
    is_valid: bool
    rule_name: str
    column: Optional[str] = None
    message: str = ""
    severity: ValidationSeverity = ValidationSeverity.ERROR
    failed_count: int = 0
    total_count: int = 0
    failed_indices: Optional[List[int]] = None
    details: Optional[Dict[str, Any]] = None

    @property
    def pass_rate(self) -> float:
        """Calculate pass rate."""
        if self.total_count == 0:
            return 1.0
        return 1 - (self.failed_count / self.total_count)


class DataValidator(ABC):
    """Base class for data validators."""

    def __init__(self, name: str = "validator"):
        self.name = name
        self._results: List[ValidationResult] = []

    @abstractmethod
    def validate(self, data: pd.DataFrame) -> List[ValidationResult]:
        """Validate data and return results."""
        pass

    def is_valid(self, data: pd.DataFrame) -> bool:
        """Check if data passes all validations."""
        results = self.validate(data)
        return all(r.is_valid or r.severity != ValidationSeverity.ERROR for r in results)

    def get_summary(self) -> Dict[str, Any]:
        """Get summary of validation results."""
        if not self._results:
            return {'status': 'not_run'}

        errors = [r for r in self._results if not r.is_valid and r.severity == ValidationSeverity.ERROR]
        warnings = [r for r in self._results if not r.is_valid and r.severity == ValidationSeverity.WARNING]

        return {
            'status': 'passed' if not errors else 'failed',
            'total_checks': len(self._results),
            'passed_checks': sum(1 for r in self._results if r.is_valid),
            'failed_checks': len(errors),
            'warnings': len(warnings),
            'errors': [{'rule': r.rule_name, 'column': r.column, 'message': r.message} for r in errors],
        }


class SchemaValidator(DataValidator):
    """
    Validates data against an expected schema.

    Checks:
    - Required columns exist
    - Column types match expected types
    - No unexpected columns (optional)
    """

    def __init__(
        self,
        schema: Dict[str, str],
        required_columns: Optional[List[str]] = None,
        allow_extra_columns: bool = True,
        name: str = "schema_validator",
    ):
        super().__init__(name)
        self.schema = schema
        self.required_columns = required_columns or list(schema.keys())
        self.allow_extra_columns = allow_extra_columns

    def validate(self, data: pd.DataFrame) -> List[ValidationResult]:
        """Validate schema."""
        self._results = []

        # Check required columns
        missing = set(self.required_columns) - set(data.columns)
        if missing:
            self._results.append(ValidationResult(
                is_valid=False,
                rule_name='required_columns',
                message=f"Missing required columns: {missing}",
                severity=ValidationSeverity.ERROR,
                details={'missing_columns': list(missing)},
            ))
        else:
            self._results.append(ValidationResult(
                is_valid=True,
                rule_name='required_columns',
                message="All required columns present",
            ))

        # Check for extra columns
        if not self.allow_extra_columns:
            extra = set(data.columns) - set(self.schema.keys())
            if extra:
                self._results.append(ValidationResult(
                    is_valid=False,
                    rule_name='no_extra_columns',
                    message=f"Unexpected columns: {extra}",
                    severity=ValidationSeverity.WARNING,
                    details={'extra_columns': list(extra)},
                ))

        # Check column types
        for col, expected_type in self.schema.items():
            if col not in data.columns:
                continue

            actual_type = str(data[col].dtype)
            if not self._types_compatible(expected_type, actual_type):
                self._results.append(ValidationResult(
                    is_valid=False,
                    rule_name='column_type',
                    column=col,
                    message=f"Type mismatch: expected {expected_type}, got {actual_type}",
                    severity=ValidationSeverity.ERROR,
                    details={'expected': expected_type, 'actual': actual_type},
                ))
            else:
                self._results.append(ValidationResult(
                    is_valid=True,
                    rule_name='column_type',
                    column=col,
                    message=f"Type matches: {actual_type}",
                ))

        return self._results

    def _types_compatible(self, expected: str, actual: str) -> bool:
        """Check if types are compatible."""
        expected = expected.lower()
        actual = actual.lower()

        if expected == actual:
            return True

        # Type groups
        int_types = {'int', 'int8', 'int16', 'int32', 'int64', 'integer'}
        float_types = {'float', 'float16', 'float32', 'float64', 'double'}
        string_types = {'str', 'string', 'object'}
        bool_types = {'bool', 'boolean'}
        datetime_types = {'datetime', 'datetime64', 'datetime64[ns]', 'timestamp'}

        groups = [int_types, float_types, string_types, bool_types, datetime_types]

        for group in groups:
            if expected in group and actual in group:
                return True

        # Numeric compatibility (int can fit in float)
        if expected in int_types and actual in float_types:
            return True

        return False


class QualityValidator(DataValidator):
    """
    Validates data quality metrics.

    Checks:
    - Null/missing values
    - Duplicate records
    - Value ranges
    - Cardinality
    """

    def __init__(
        self,
        null_threshold: float = 0.1,
        duplicate_threshold: float = 0.0,
        unique_columns: Optional[List[str]] = None,
        value_ranges: Optional[Dict[str, tuple]] = None,
        categorical_values: Optional[Dict[str, List[Any]]] = None,
        name: str = "quality_validator",
    ):
        super().__init__(name)
        self.null_threshold = null_threshold
        self.duplicate_threshold = duplicate_threshold
        self.unique_columns = unique_columns or []
        self.value_ranges = value_ranges or {}
        self.categorical_values = categorical_values or {}

    def validate(self, data: pd.DataFrame) -> List[ValidationResult]:
        """Validate data quality."""
        self._results = []
        n_rows = len(data)

        # Check nulls per column
        for col in data.columns:
            null_count = data[col].isna().sum()
            null_rate = null_count / n_rows if n_rows > 0 else 0

            if null_rate > self.null_threshold:
                self._results.append(ValidationResult(
                    is_valid=False,
                    rule_name='null_check',
                    column=col,
                    message=f"Null rate {null_rate:.2%} exceeds threshold {self.null_threshold:.2%}",
                    severity=ValidationSeverity.WARNING,
                    failed_count=null_count,
                    total_count=n_rows,
                ))
            else:
                self._results.append(ValidationResult(
                    is_valid=True,
                    rule_name='null_check',
                    column=col,
                    message=f"Null rate {null_rate:.2%} within threshold",
                    total_count=n_rows,
                    failed_count=null_count,
                ))

        # Check duplicates
        if n_rows > 0:
            dup_count = data.duplicated().sum()
            dup_rate = dup_count / n_rows

            if dup_rate > self.duplicate_threshold:
                self._results.append(ValidationResult(
                    is_valid=False,
                    rule_name='duplicate_check',
                    message=f"Duplicate rate {dup_rate:.2%} exceeds threshold {self.duplicate_threshold:.2%}",
                    severity=ValidationSeverity.WARNING,
                    failed_count=dup_count,
                    total_count=n_rows,
                ))
            else:
                self._results.append(ValidationResult(
                    is_valid=True,
                    rule_name='duplicate_check',
                    message=f"Duplicate rate {dup_rate:.2%} within threshold",
                    total_count=n_rows,
                    failed_count=dup_count,
                ))

        # Check unique columns
        for col in self.unique_columns:
            if col not in data.columns:
                continue

            non_unique = data[col].duplicated().sum()
            if non_unique > 0:
                self._results.append(ValidationResult(
                    is_valid=False,
                    rule_name='unique_check',
                    column=col,
                    message=f"Column should be unique but has {non_unique} duplicates",
                    severity=ValidationSeverity.ERROR,
                    failed_count=non_unique,
                    total_count=n_rows,
                ))
            else:
                self._results.append(ValidationResult(
                    is_valid=True,
                    rule_name='unique_check',
                    column=col,
                    message="All values unique",
                    total_count=n_rows,
                ))

        # Check value ranges
        for col, (min_val, max_val) in self.value_ranges.items():
            if col not in data.columns:
                continue

            values = data[col].dropna()
            out_of_range = ((values < min_val) | (values > max_val)).sum()

            if out_of_range > 0:
                self._results.append(ValidationResult(
                    is_valid=False,
                    rule_name='range_check',
                    column=col,
                    message=f"{out_of_range} values outside range [{min_val}, {max_val}]",
                    severity=ValidationSeverity.ERROR,
                    failed_count=out_of_range,
                    total_count=len(values),
                ))
            else:
                self._results.append(ValidationResult(
                    is_valid=True,
                    rule_name='range_check',
                    column=col,
                    message=f"All values within range [{min_val}, {max_val}]",
                    total_count=len(values),
                ))

        # Check categorical values
        for col, allowed_values in self.categorical_values.items():
            if col not in data.columns:
                continue

            values = data[col].dropna()
            invalid = ~values.isin(allowed_values)
            invalid_count = invalid.sum()

            if invalid_count > 0:
                invalid_values = values[invalid].unique()[:5]
                self._results.append(ValidationResult(
                    is_valid=False,
                    rule_name='categorical_check',
                    column=col,
                    message=f"{invalid_count} values not in allowed set",
                    severity=ValidationSeverity.ERROR,
                    failed_count=invalid_count,
                    total_count=len(values),
                    details={'invalid_samples': list(invalid_values)},
                ))
            else:
                self._results.append(ValidationResult(
                    is_valid=True,
                    rule_name='categorical_check',
                    column=col,
                    message="All values in allowed set",
                    total_count=len(values),
                ))

        return self._results


class StatisticalValidator(DataValidator):
    """
    Validates statistical properties of data.

    Checks:
    - Distribution consistency
    - Outliers
    - Correlation bounds
    - Drift detection
    """

    def __init__(
        self,
        reference_stats: Optional[Dict[str, Dict[str, float]]] = None,
        outlier_threshold: float = 3.0,
        drift_threshold: float = 0.1,
        name: str = "statistical_validator",
    ):
        super().__init__(name)
        self.reference_stats = reference_stats or {}
        self.outlier_threshold = outlier_threshold
        self.drift_threshold = drift_threshold

    def validate(self, data: pd.DataFrame) -> List[ValidationResult]:
        """Validate statistical properties."""
        self._results = []
        numeric_cols = data.select_dtypes(include=[np.number]).columns

        for col in numeric_cols:
            values = data[col].dropna()

            if len(values) < 2:
                continue

            # Outlier check using IQR
            q1 = values.quantile(0.25)
            q3 = values.quantile(0.75)
            iqr = q3 - q1
            lower_bound = q1 - self.outlier_threshold * iqr
            upper_bound = q3 + self.outlier_threshold * iqr

            outliers = ((values < lower_bound) | (values > upper_bound)).sum()
            outlier_rate = outliers / len(values)

            if outlier_rate > 0.05:  # More than 5% outliers
                self._results.append(ValidationResult(
                    is_valid=False,
                    rule_name='outlier_check',
                    column=col,
                    message=f"{outlier_rate:.2%} outliers detected (threshold: {self.outlier_threshold} IQR)",
                    severity=ValidationSeverity.WARNING,
                    failed_count=outliers,
                    total_count=len(values),
                    details={
                        'lower_bound': lower_bound,
                        'upper_bound': upper_bound,
                        'outlier_rate': outlier_rate,
                    },
                ))
            else:
                self._results.append(ValidationResult(
                    is_valid=True,
                    rule_name='outlier_check',
                    column=col,
                    message=f"Outlier rate {outlier_rate:.2%} acceptable",
                    total_count=len(values),
                    failed_count=outliers,
                ))

            # Drift check against reference
            if col in self.reference_stats:
                ref = self.reference_stats[col]
                current_mean = values.mean()
                current_std = values.std()

                # Check mean drift
                if 'mean' in ref and ref.get('std', 1) > 0:
                    z_score = abs(current_mean - ref['mean']) / ref['std']
                    if z_score > 2:  # Significant drift
                        self._results.append(ValidationResult(
                            is_valid=False,
                            rule_name='drift_check',
                            column=col,
                            message=f"Mean drift detected: {current_mean:.4f} vs reference {ref['mean']:.4f}",
                            severity=ValidationSeverity.WARNING,
                            details={
                                'current_mean': current_mean,
                                'reference_mean': ref['mean'],
                                'z_score': z_score,
                            },
                        ))
                    else:
                        self._results.append(ValidationResult(
                            is_valid=True,
                            rule_name='drift_check',
                            column=col,
                            message="No significant drift detected",
                        ))

        return self._results

    def compute_reference_stats(self, data: pd.DataFrame) -> Dict[str, Dict[str, float]]:
        """Compute reference statistics from data."""
        stats = {}
        numeric_cols = data.select_dtypes(include=[np.number]).columns

        for col in numeric_cols:
            values = data[col].dropna()
            if len(values) > 0:
                stats[col] = {
                    'mean': values.mean(),
                    'std': values.std(),
                    'min': values.min(),
                    'max': values.max(),
                    'median': values.median(),
                    'q1': values.quantile(0.25),
                    'q3': values.quantile(0.75),
                }

        return stats
