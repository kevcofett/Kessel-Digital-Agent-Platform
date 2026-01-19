"""
Validation Rules
Individual validation rules for data quality checks
"""

import logging
import re
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Callable, List, Optional, Pattern, Union

import numpy as np
import pandas as pd

from .validators import ValidationResult, ValidationSeverity

logger = logging.getLogger(__name__)


class ValidationRule(ABC):
    """Base class for validation rules."""

    def __init__(
        self,
        name: str,
        column: Optional[str] = None,
        severity: ValidationSeverity = ValidationSeverity.ERROR,
        message: Optional[str] = None,
    ):
        self.name = name
        self.column = column
        self.severity = severity
        self.custom_message = message

    @abstractmethod
    def validate(self, data: pd.DataFrame) -> ValidationResult:
        """Apply validation rule to data."""
        pass

    def _get_values(self, data: pd.DataFrame) -> pd.Series:
        """Get values to validate."""
        if self.column:
            return data[self.column]
        raise ValueError("Column must be specified for this rule")


class RequiredRule(ValidationRule):
    """Validates that a column exists and has values."""

    def __init__(
        self,
        column: str,
        allow_empty: bool = False,
        severity: ValidationSeverity = ValidationSeverity.ERROR,
    ):
        super().__init__(f"required_{column}", column, severity)
        self.allow_empty = allow_empty

    def validate(self, data: pd.DataFrame) -> ValidationResult:
        """Check that column exists and has values."""
        if self.column not in data.columns:
            return ValidationResult(
                is_valid=False,
                rule_name=self.name,
                column=self.column,
                message=self.custom_message or f"Required column '{self.column}' is missing",
                severity=self.severity,
            )

        values = self._get_values(data)

        if not self.allow_empty:
            empty_count = values.isna().sum()
            if values.dtype == 'object':
                empty_count += (values == '').sum()

            if empty_count > 0:
                return ValidationResult(
                    is_valid=False,
                    rule_name=self.name,
                    column=self.column,
                    message=self.custom_message or f"Column '{self.column}' has {empty_count} empty values",
                    severity=self.severity,
                    failed_count=empty_count,
                    total_count=len(values),
                )

        return ValidationResult(
            is_valid=True,
            rule_name=self.name,
            column=self.column,
            message=f"Column '{self.column}' is present and populated",
            total_count=len(data),
        )


class TypeRule(ValidationRule):
    """Validates that column values match expected type."""

    TYPE_MAPPING = {
        'int': (int, np.integer),
        'float': (float, np.floating),
        'numeric': (int, float, np.number),
        'str': (str,),
        'bool': (bool, np.bool_),
        'datetime': (pd.Timestamp, np.datetime64),
    }

    def __init__(
        self,
        column: str,
        expected_type: str,
        coerce: bool = False,
        severity: ValidationSeverity = ValidationSeverity.ERROR,
    ):
        super().__init__(f"type_{column}", column, severity)
        self.expected_type = expected_type.lower()
        self.coerce = coerce

    def validate(self, data: pd.DataFrame) -> ValidationResult:
        """Check that values match expected type."""
        if self.column not in data.columns:
            return ValidationResult(
                is_valid=False,
                rule_name=self.name,
                column=self.column,
                message=f"Column '{self.column}' not found",
                severity=self.severity,
            )

        values = self._get_values(data).dropna()

        if self.expected_type == 'numeric':
            try:
                pd.to_numeric(values, errors='raise')
                return ValidationResult(
                    is_valid=True,
                    rule_name=self.name,
                    column=self.column,
                    message=f"Column '{self.column}' is numeric",
                    total_count=len(values),
                )
            except (ValueError, TypeError):
                invalid_count = pd.to_numeric(values, errors='coerce').isna().sum()
                return ValidationResult(
                    is_valid=False,
                    rule_name=self.name,
                    column=self.column,
                    message=f"Column '{self.column}' has {invalid_count} non-numeric values",
                    severity=self.severity,
                    failed_count=invalid_count,
                    total_count=len(values),
                )

        elif self.expected_type == 'datetime':
            try:
                pd.to_datetime(values, errors='raise')
                return ValidationResult(
                    is_valid=True,
                    rule_name=self.name,
                    column=self.column,
                    message=f"Column '{self.column}' is datetime",
                    total_count=len(values),
                )
            except (ValueError, TypeError):
                return ValidationResult(
                    is_valid=False,
                    rule_name=self.name,
                    column=self.column,
                    message=f"Column '{self.column}' contains invalid datetime values",
                    severity=self.severity,
                    total_count=len(values),
                )

        else:
            expected_types = self.TYPE_MAPPING.get(self.expected_type, (str,))
            invalid_mask = ~values.apply(lambda x: isinstance(x, expected_types))
            invalid_count = invalid_mask.sum()

            if invalid_count > 0:
                return ValidationResult(
                    is_valid=False,
                    rule_name=self.name,
                    column=self.column,
                    message=f"Column '{self.column}' has {invalid_count} values not of type {self.expected_type}",
                    severity=self.severity,
                    failed_count=invalid_count,
                    total_count=len(values),
                )

        return ValidationResult(
            is_valid=True,
            rule_name=self.name,
            column=self.column,
            message=f"Column '{self.column}' matches type {self.expected_type}",
            total_count=len(values),
        )


class RangeRule(ValidationRule):
    """Validates that numeric values are within a range."""

    def __init__(
        self,
        column: str,
        min_value: Optional[float] = None,
        max_value: Optional[float] = None,
        inclusive: bool = True,
        severity: ValidationSeverity = ValidationSeverity.ERROR,
    ):
        super().__init__(f"range_{column}", column, severity)
        self.min_value = min_value
        self.max_value = max_value
        self.inclusive = inclusive

    def validate(self, data: pd.DataFrame) -> ValidationResult:
        """Check that values are within range."""
        if self.column not in data.columns:
            return ValidationResult(
                is_valid=False,
                rule_name=self.name,
                column=self.column,
                message=f"Column '{self.column}' not found",
                severity=self.severity,
            )

        values = self._get_values(data).dropna()

        if self.inclusive:
            below_min = (values < self.min_value).sum() if self.min_value is not None else 0
            above_max = (values > self.max_value).sum() if self.max_value is not None else 0
        else:
            below_min = (values <= self.min_value).sum() if self.min_value is not None else 0
            above_max = (values >= self.max_value).sum() if self.max_value is not None else 0

        failed_count = below_min + above_max

        if failed_count > 0:
            range_str = f"[{self.min_value}, {self.max_value}]" if self.inclusive else f"({self.min_value}, {self.max_value})"
            return ValidationResult(
                is_valid=False,
                rule_name=self.name,
                column=self.column,
                message=f"{failed_count} values outside range {range_str}",
                severity=self.severity,
                failed_count=failed_count,
                total_count=len(values),
                details={'below_min': int(below_min), 'above_max': int(above_max)},
            )

        return ValidationResult(
            is_valid=True,
            rule_name=self.name,
            column=self.column,
            message=f"All values within range",
            total_count=len(values),
        )


class RegexRule(ValidationRule):
    """Validates that string values match a regex pattern."""

    def __init__(
        self,
        column: str,
        pattern: Union[str, Pattern],
        match_type: str = 'search',
        severity: ValidationSeverity = ValidationSeverity.ERROR,
    ):
        super().__init__(f"regex_{column}", column, severity)
        self.pattern = re.compile(pattern) if isinstance(pattern, str) else pattern
        self.match_type = match_type

    def validate(self, data: pd.DataFrame) -> ValidationResult:
        """Check that values match pattern."""
        if self.column not in data.columns:
            return ValidationResult(
                is_valid=False,
                rule_name=self.name,
                column=self.column,
                message=f"Column '{self.column}' not found",
                severity=self.severity,
            )

        values = self._get_values(data).dropna().astype(str)

        if self.match_type == 'match':
            matches = values.str.match(self.pattern.pattern)
        elif self.match_type == 'fullmatch':
            matches = values.str.fullmatch(self.pattern.pattern)
        else:
            matches = values.str.contains(self.pattern.pattern, regex=True)

        failed_count = (~matches).sum()

        if failed_count > 0:
            failed_samples = values[~matches].head(5).tolist()
            return ValidationResult(
                is_valid=False,
                rule_name=self.name,
                column=self.column,
                message=f"{failed_count} values don't match pattern '{self.pattern.pattern}'",
                severity=self.severity,
                failed_count=failed_count,
                total_count=len(values),
                details={'failed_samples': failed_samples},
            )

        return ValidationResult(
            is_valid=True,
            rule_name=self.name,
            column=self.column,
            message=f"All values match pattern",
            total_count=len(values),
        )


class UniqueRule(ValidationRule):
    """Validates that column values are unique."""

    def __init__(
        self,
        column: str,
        case_sensitive: bool = True,
        severity: ValidationSeverity = ValidationSeverity.ERROR,
    ):
        super().__init__(f"unique_{column}", column, severity)
        self.case_sensitive = case_sensitive

    def validate(self, data: pd.DataFrame) -> ValidationResult:
        """Check that values are unique."""
        if self.column not in data.columns:
            return ValidationResult(
                is_valid=False,
                rule_name=self.name,
                column=self.column,
                message=f"Column '{self.column}' not found",
                severity=self.severity,
            )

        values = self._get_values(data)

        if not self.case_sensitive and values.dtype == 'object':
            values = values.str.lower()

        duplicates = values.duplicated()
        dup_count = duplicates.sum()

        if dup_count > 0:
            dup_values = values[duplicates].unique()[:5]
            return ValidationResult(
                is_valid=False,
                rule_name=self.name,
                column=self.column,
                message=f"{dup_count} duplicate values found",
                severity=self.severity,
                failed_count=dup_count,
                total_count=len(values),
                failed_indices=duplicates[duplicates].index.tolist()[:100],
                details={'duplicate_samples': list(dup_values)},
            )

        return ValidationResult(
            is_valid=True,
            rule_name=self.name,
            column=self.column,
            message="All values unique",
            total_count=len(values),
        )


class NullRule(ValidationRule):
    """Validates null/missing value constraints."""

    def __init__(
        self,
        column: str,
        max_null_ratio: float = 0.0,
        allow_null: bool = False,
        severity: ValidationSeverity = ValidationSeverity.ERROR,
    ):
        super().__init__(f"null_{column}", column, severity)
        self.max_null_ratio = max_null_ratio
        self.allow_null = allow_null

    def validate(self, data: pd.DataFrame) -> ValidationResult:
        """Check null constraints."""
        if self.column not in data.columns:
            return ValidationResult(
                is_valid=False,
                rule_name=self.name,
                column=self.column,
                message=f"Column '{self.column}' not found",
                severity=self.severity,
            )

        values = self._get_values(data)
        null_count = values.isna().sum()
        null_ratio = null_count / len(values) if len(values) > 0 else 0

        if not self.allow_null and null_count > 0:
            return ValidationResult(
                is_valid=False,
                rule_name=self.name,
                column=self.column,
                message=f"Column has {null_count} null values (nulls not allowed)",
                severity=self.severity,
                failed_count=null_count,
                total_count=len(values),
            )

        if null_ratio > self.max_null_ratio:
            return ValidationResult(
                is_valid=False,
                rule_name=self.name,
                column=self.column,
                message=f"Null ratio {null_ratio:.2%} exceeds maximum {self.max_null_ratio:.2%}",
                severity=self.severity,
                failed_count=null_count,
                total_count=len(values),
            )

        return ValidationResult(
            is_valid=True,
            rule_name=self.name,
            column=self.column,
            message=f"Null ratio {null_ratio:.2%} within limits",
            total_count=len(values),
            failed_count=null_count,
        )


class CustomRule(ValidationRule):
    """Custom validation rule using a user-defined function."""

    def __init__(
        self,
        name: str,
        validator_func: Callable[[pd.DataFrame], bool],
        column: Optional[str] = None,
        severity: ValidationSeverity = ValidationSeverity.ERROR,
        message: Optional[str] = None,
    ):
        super().__init__(name, column, severity, message)
        self.validator_func = validator_func

    def validate(self, data: pd.DataFrame) -> ValidationResult:
        """Apply custom validation function."""
        try:
            is_valid = self.validator_func(data)

            return ValidationResult(
                is_valid=is_valid,
                rule_name=self.name,
                column=self.column,
                message=self.custom_message or ("Validation passed" if is_valid else "Custom validation failed"),
                severity=self.severity if not is_valid else ValidationSeverity.INFO,
                total_count=len(data),
            )

        except Exception as e:
            return ValidationResult(
                is_valid=False,
                rule_name=self.name,
                column=self.column,
                message=f"Custom validation error: {str(e)}",
                severity=self.severity,
                details={'error': str(e)},
            )


class RuleSet:
    """Collection of validation rules."""

    def __init__(self, name: str = "ruleset"):
        self.name = name
        self.rules: List[ValidationRule] = []

    def add_rule(self, rule: ValidationRule) -> 'RuleSet':
        """Add a rule to the set."""
        self.rules.append(rule)
        return self

    def add_required(self, column: str, **kwargs) -> 'RuleSet':
        """Add a required column rule."""
        self.rules.append(RequiredRule(column, **kwargs))
        return self

    def add_type(self, column: str, expected_type: str, **kwargs) -> 'RuleSet':
        """Add a type validation rule."""
        self.rules.append(TypeRule(column, expected_type, **kwargs))
        return self

    def add_range(self, column: str, min_value: float = None, max_value: float = None, **kwargs) -> 'RuleSet':
        """Add a range validation rule."""
        self.rules.append(RangeRule(column, min_value, max_value, **kwargs))
        return self

    def add_regex(self, column: str, pattern: str, **kwargs) -> 'RuleSet':
        """Add a regex validation rule."""
        self.rules.append(RegexRule(column, pattern, **kwargs))
        return self

    def add_unique(self, column: str, **kwargs) -> 'RuleSet':
        """Add a unique constraint rule."""
        self.rules.append(UniqueRule(column, **kwargs))
        return self

    def add_null(self, column: str, **kwargs) -> 'RuleSet':
        """Add a null constraint rule."""
        self.rules.append(NullRule(column, **kwargs))
        return self

    def add_custom(self, name: str, func: Callable, **kwargs) -> 'RuleSet':
        """Add a custom validation rule."""
        self.rules.append(CustomRule(name, func, **kwargs))
        return self

    def validate(self, data: pd.DataFrame) -> List[ValidationResult]:
        """Validate data against all rules."""
        results = []
        for rule in self.rules:
            try:
                result = rule.validate(data)
                results.append(result)
            except Exception as e:
                logger.error(f"Rule {rule.name} failed: {e}")
                results.append(ValidationResult(
                    is_valid=False,
                    rule_name=rule.name,
                    column=rule.column,
                    message=f"Rule execution error: {str(e)}",
                    severity=ValidationSeverity.ERROR,
                ))
        return results

    def is_valid(self, data: pd.DataFrame) -> bool:
        """Check if data passes all rules."""
        results = self.validate(data)
        return all(r.is_valid or r.severity != ValidationSeverity.ERROR for r in results)
