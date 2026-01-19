"""
Data Profiling
Automatic data profiling and statistics generation
"""

import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional, Union

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


@dataclass
class ColumnProfile:
    """Profile for a single column."""
    name: str
    dtype: str
    count: int
    null_count: int
    null_rate: float
    unique_count: int
    unique_rate: float

    # Numeric stats (optional)
    mean: Optional[float] = None
    std: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None
    median: Optional[float] = None
    q1: Optional[float] = None
    q3: Optional[float] = None
    skewness: Optional[float] = None
    kurtosis: Optional[float] = None

    # Categorical stats (optional)
    top_values: Optional[List[Dict[str, Any]]] = None
    mode: Optional[Any] = None
    mode_count: Optional[int] = None

    # String stats (optional)
    min_length: Optional[int] = None
    max_length: Optional[int] = None
    avg_length: Optional[float] = None

    # Datetime stats (optional)
    min_date: Optional[str] = None
    max_date: Optional[str] = None
    date_range_days: Optional[int] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        result = {
            'name': self.name,
            'dtype': self.dtype,
            'count': self.count,
            'null_count': self.null_count,
            'null_rate': self.null_rate,
            'unique_count': self.unique_count,
            'unique_rate': self.unique_rate,
        }

        # Add non-None optional fields
        optional_fields = [
            'mean', 'std', 'min', 'max', 'median', 'q1', 'q3',
            'skewness', 'kurtosis', 'top_values', 'mode', 'mode_count',
            'min_length', 'max_length', 'avg_length',
            'min_date', 'max_date', 'date_range_days',
        ]

        for f in optional_fields:
            value = getattr(self, f)
            if value is not None:
                result[f] = value

        return result


@dataclass
class DataProfile:
    """Complete profile for a dataset."""
    name: str
    created_at: str
    row_count: int
    column_count: int
    memory_usage_mb: float
    duplicate_rows: int
    duplicate_rate: float
    columns: Dict[str, ColumnProfile] = field(default_factory=dict)
    correlations: Optional[Dict[str, Dict[str, float]]] = None
    warnings: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'name': self.name,
            'created_at': self.created_at,
            'row_count': self.row_count,
            'column_count': self.column_count,
            'memory_usage_mb': self.memory_usage_mb,
            'duplicate_rows': self.duplicate_rows,
            'duplicate_rate': self.duplicate_rate,
            'columns': {k: v.to_dict() for k, v in self.columns.items()},
            'correlations': self.correlations,
            'warnings': self.warnings,
        }

    def to_dataframe(self) -> pd.DataFrame:
        """Convert column profiles to DataFrame."""
        records = [col.to_dict() for col in self.columns.values()]
        return pd.DataFrame(records)

    def get_high_null_columns(self, threshold: float = 0.1) -> List[str]:
        """Get columns with null rate above threshold."""
        return [
            name for name, col in self.columns.items()
            if col.null_rate > threshold
        ]

    def get_low_cardinality_columns(self, threshold: int = 10) -> List[str]:
        """Get columns with low cardinality."""
        return [
            name for name, col in self.columns.items()
            if col.unique_count <= threshold
        ]

    def get_high_cardinality_columns(self, threshold: float = 0.9) -> List[str]:
        """Get columns with high cardinality rate."""
        return [
            name for name, col in self.columns.items()
            if col.unique_rate > threshold
        ]


class DataProfiler:
    """
    Automatic data profiler.

    Generates comprehensive statistics and insights about a dataset.
    """

    def __init__(
        self,
        include_correlations: bool = True,
        correlation_threshold: float = 0.5,
        sample_size: Optional[int] = None,
        top_n_values: int = 10,
    ):
        self.include_correlations = include_correlations
        self.correlation_threshold = correlation_threshold
        self.sample_size = sample_size
        self.top_n_values = top_n_values

    def profile(
        self,
        data: pd.DataFrame,
        name: str = "dataset",
    ) -> DataProfile:
        """Generate complete data profile."""
        logger.info(f"Profiling dataset: {name} ({len(data)} rows, {len(data.columns)} columns)")

        # Sample if needed
        if self.sample_size and len(data) > self.sample_size:
            data = data.sample(n=self.sample_size, random_state=42)
            logger.info(f"Sampled {self.sample_size} rows for profiling")

        # Basic stats
        row_count = len(data)
        column_count = len(data.columns)
        memory_mb = data.memory_usage(deep=True).sum() / (1024 * 1024)
        duplicate_rows = data.duplicated().sum()
        duplicate_rate = duplicate_rows / row_count if row_count > 0 else 0

        # Profile each column
        columns = {}
        for col in data.columns:
            columns[col] = self._profile_column(data[col])

        # Compute correlations
        correlations = None
        if self.include_correlations:
            correlations = self._compute_correlations(data)

        # Generate warnings
        warnings = self._generate_warnings(data, columns)

        profile = DataProfile(
            name=name,
            created_at=datetime.utcnow().isoformat(),
            row_count=row_count,
            column_count=column_count,
            memory_usage_mb=round(memory_mb, 2),
            duplicate_rows=duplicate_rows,
            duplicate_rate=round(duplicate_rate, 4),
            columns=columns,
            correlations=correlations,
            warnings=warnings,
        )

        logger.info(f"Profile complete: {len(warnings)} warnings generated")
        return profile

    def _profile_column(self, series: pd.Series) -> ColumnProfile:
        """Profile a single column."""
        name = series.name
        dtype = str(series.dtype)
        count = len(series)
        null_count = series.isna().sum()
        null_rate = null_count / count if count > 0 else 0
        non_null = series.dropna()
        unique_count = non_null.nunique()
        unique_rate = unique_count / len(non_null) if len(non_null) > 0 else 0

        profile = ColumnProfile(
            name=name,
            dtype=dtype,
            count=count,
            null_count=null_count,
            null_rate=round(null_rate, 4),
            unique_count=unique_count,
            unique_rate=round(unique_rate, 4),
        )

        # Numeric profiling
        if pd.api.types.is_numeric_dtype(series):
            self._profile_numeric(non_null, profile)

        # Datetime profiling
        elif pd.api.types.is_datetime64_any_dtype(series):
            self._profile_datetime(non_null, profile)

        # String/categorical profiling
        elif series.dtype == 'object' or pd.api.types.is_categorical_dtype(series):
            self._profile_categorical(non_null, profile)

        return profile

    def _profile_numeric(self, series: pd.Series, profile: ColumnProfile) -> None:
        """Add numeric statistics to profile."""
        if len(series) == 0:
            return

        profile.mean = round(float(series.mean()), 4)
        profile.std = round(float(series.std()), 4)
        profile.min = round(float(series.min()), 4)
        profile.max = round(float(series.max()), 4)
        profile.median = round(float(series.median()), 4)
        profile.q1 = round(float(series.quantile(0.25)), 4)
        profile.q3 = round(float(series.quantile(0.75)), 4)

        if len(series) > 2:
            profile.skewness = round(float(series.skew()), 4)
            profile.kurtosis = round(float(series.kurtosis()), 4)

        # Top values for low cardinality
        if profile.unique_count <= self.top_n_values:
            value_counts = series.value_counts().head(self.top_n_values)
            profile.top_values = [
                {'value': float(v), 'count': int(c), 'percent': round(c / len(series) * 100, 2)}
                for v, c in value_counts.items()
            ]

    def _profile_datetime(self, series: pd.Series, profile: ColumnProfile) -> None:
        """Add datetime statistics to profile."""
        if len(series) == 0:
            return

        profile.min_date = str(series.min())
        profile.max_date = str(series.max())

        date_range = series.max() - series.min()
        profile.date_range_days = date_range.days if hasattr(date_range, 'days') else None

    def _profile_categorical(self, series: pd.Series, profile: ColumnProfile) -> None:
        """Add categorical/string statistics to profile."""
        if len(series) == 0:
            return

        # Top values
        value_counts = series.value_counts().head(self.top_n_values)
        profile.top_values = [
            {'value': str(v), 'count': int(c), 'percent': round(c / len(series) * 100, 2)}
            for v, c in value_counts.items()
        ]

        # Mode
        if len(value_counts) > 0:
            profile.mode = str(value_counts.index[0])
            profile.mode_count = int(value_counts.iloc[0])

        # String length stats
        try:
            lengths = series.astype(str).str.len()
            profile.min_length = int(lengths.min())
            profile.max_length = int(lengths.max())
            profile.avg_length = round(float(lengths.mean()), 2)
        except Exception:
            pass

    def _compute_correlations(self, data: pd.DataFrame) -> Optional[Dict[str, Dict[str, float]]]:
        """Compute correlation matrix for numeric columns."""
        numeric_data = data.select_dtypes(include=[np.number])

        if numeric_data.shape[1] < 2:
            return None

        try:
            corr_matrix = numeric_data.corr()

            # Filter to significant correlations only
            correlations = {}
            for col1 in corr_matrix.columns:
                col_corrs = {}
                for col2 in corr_matrix.columns:
                    if col1 != col2:
                        corr = corr_matrix.loc[col1, col2]
                        if abs(corr) >= self.correlation_threshold:
                            col_corrs[col2] = round(corr, 4)

                if col_corrs:
                    correlations[col1] = col_corrs

            return correlations if correlations else None

        except Exception as e:
            logger.warning(f"Failed to compute correlations: {e}")
            return None

    def _generate_warnings(
        self,
        data: pd.DataFrame,
        columns: Dict[str, ColumnProfile],
    ) -> List[str]:
        """Generate warnings about data quality issues."""
        warnings = []

        # High null rate warnings
        for name, col in columns.items():
            if col.null_rate > 0.5:
                warnings.append(f"Column '{name}' has >50% null values ({col.null_rate:.1%})")
            elif col.null_rate > 0.1:
                warnings.append(f"Column '{name}' has >10% null values ({col.null_rate:.1%})")

        # Low variance warnings
        for name, col in columns.items():
            if col.unique_count == 1:
                warnings.append(f"Column '{name}' has constant value (single unique)")
            elif col.unique_rate < 0.01 and col.count > 100:
                warnings.append(f"Column '{name}' has very low cardinality ({col.unique_count} unique)")

        # High cardinality potential ID warnings
        for name, col in columns.items():
            if col.unique_rate > 0.95 and col.dtype == 'object':
                warnings.append(f"Column '{name}' may be an ID column (>95% unique)")

        # Duplicate row warning
        dup_rate = data.duplicated().mean()
        if dup_rate > 0.1:
            warnings.append(f"Dataset has >10% duplicate rows ({dup_rate:.1%})")

        # Memory usage warning
        memory_mb = data.memory_usage(deep=True).sum() / (1024 * 1024)
        if memory_mb > 1000:
            warnings.append(f"Dataset uses significant memory ({memory_mb:.1f} MB)")

        return warnings

    def compare_profiles(
        self,
        profile1: DataProfile,
        profile2: DataProfile,
    ) -> Dict[str, Any]:
        """Compare two data profiles for drift detection."""
        comparison = {
            'row_count_change': profile2.row_count - profile1.row_count,
            'column_changes': [],
            'new_columns': [],
            'removed_columns': [],
            'drift_detected': [],
        }

        # Column changes
        cols1 = set(profile1.columns.keys())
        cols2 = set(profile2.columns.keys())

        comparison['new_columns'] = list(cols2 - cols1)
        comparison['removed_columns'] = list(cols1 - cols2)

        # Compare common columns
        common_cols = cols1 & cols2
        for col in common_cols:
            p1 = profile1.columns[col]
            p2 = profile2.columns[col]

            changes = {}

            # Type change
            if p1.dtype != p2.dtype:
                changes['dtype'] = {'from': p1.dtype, 'to': p2.dtype}

            # Null rate change
            null_diff = abs(p2.null_rate - p1.null_rate)
            if null_diff > 0.1:
                changes['null_rate'] = {'from': p1.null_rate, 'to': p2.null_rate}

            # Mean drift (for numeric)
            if p1.mean is not None and p2.mean is not None and p1.std:
                z_score = abs(p2.mean - p1.mean) / p1.std
                if z_score > 2:
                    changes['mean_drift'] = {
                        'from': p1.mean,
                        'to': p2.mean,
                        'z_score': round(z_score, 2),
                    }
                    comparison['drift_detected'].append(col)

            # Unique count change
            unique_diff = abs(p2.unique_count - p1.unique_count) / max(p1.unique_count, 1)
            if unique_diff > 0.5:
                changes['unique_count'] = {'from': p1.unique_count, 'to': p2.unique_count}

            if changes:
                comparison['column_changes'].append({
                    'column': col,
                    'changes': changes,
                })

        return comparison
