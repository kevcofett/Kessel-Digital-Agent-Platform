"""
Datetime Transforms
Transformations for datetime data
"""

import logging
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd

from .base import Transform, ColumnTransform

logger = logging.getLogger(__name__)


class DatetimeFeatures(ColumnTransform):
    """
    Extract features from datetime columns.
    """

    AVAILABLE_FEATURES = [
        'year', 'month', 'day', 'hour', 'minute', 'second',
        'dayofweek', 'dayofyear', 'weekofyear', 'quarter',
        'is_weekend', 'is_month_start', 'is_month_end',
        'is_quarter_start', 'is_quarter_end', 'is_year_start', 'is_year_end',
    ]

    def __init__(
        self,
        columns: Optional[List[str]] = None,
        features: Optional[List[str]] = None,
        drop_original: bool = False,
    ):
        super().__init__("datetime_features", columns, drop_original=drop_original)
        self.features = features or ['year', 'month', 'day', 'dayofweek', 'hour']

    def fit(self, data: pd.DataFrame) -> 'DatetimeFeatures':
        """Validate datetime columns."""
        cols = self._get_columns(data)
        self._fit_params = {'columns': []}

        for col in cols:
            try:
                pd.to_datetime(data[col])
                self._fit_params['columns'].append(col)
            except Exception:
                logger.warning(f"Column {col} cannot be converted to datetime")

        self._fitted = True
        return self

    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Extract datetime features."""
        if not self._fitted:
            raise ValueError("Transform not fitted. Call fit() first.")

        result = data.copy()

        for col in self._fit_params['columns']:
            if col not in result.columns:
                continue

            dt = pd.to_datetime(result[col])

            for feature in self.features:
                new_col = f"{col}_{feature}"

                if feature == 'year':
                    result[new_col] = dt.dt.year
                elif feature == 'month':
                    result[new_col] = dt.dt.month
                elif feature == 'day':
                    result[new_col] = dt.dt.day
                elif feature == 'hour':
                    result[new_col] = dt.dt.hour
                elif feature == 'minute':
                    result[new_col] = dt.dt.minute
                elif feature == 'second':
                    result[new_col] = dt.dt.second
                elif feature == 'dayofweek':
                    result[new_col] = dt.dt.dayofweek
                elif feature == 'dayofyear':
                    result[new_col] = dt.dt.dayofyear
                elif feature == 'weekofyear':
                    result[new_col] = dt.dt.isocalendar().week.astype(int)
                elif feature == 'quarter':
                    result[new_col] = dt.dt.quarter
                elif feature == 'is_weekend':
                    result[new_col] = (dt.dt.dayofweek >= 5).astype(int)
                elif feature == 'is_month_start':
                    result[new_col] = dt.dt.is_month_start.astype(int)
                elif feature == 'is_month_end':
                    result[new_col] = dt.dt.is_month_end.astype(int)
                elif feature == 'is_quarter_start':
                    result[new_col] = dt.dt.is_quarter_start.astype(int)
                elif feature == 'is_quarter_end':
                    result[new_col] = dt.dt.is_quarter_end.astype(int)
                elif feature == 'is_year_start':
                    result[new_col] = dt.dt.is_year_start.astype(int)
                elif feature == 'is_year_end':
                    result[new_col] = dt.dt.is_year_end.astype(int)

            if self.drop_original:
                result = result.drop(columns=[col])

        return result


class CyclicalEncoder(ColumnTransform):
    """
    Encode cyclical features using sin/cos transformation.

    Useful for time-based features like hour of day, day of week, etc.
    """

    def __init__(
        self,
        columns: Optional[List[str]] = None,
        periods: Optional[Dict[str, int]] = None,
    ):
        super().__init__("cyclical_encoder", columns)
        # Default periods for common time features
        self.periods = periods or {
            'hour': 24,
            'dayofweek': 7,
            'month': 12,
            'day': 31,
            'minute': 60,
            'weekofyear': 52,
        }

    def fit(self, data: pd.DataFrame) -> 'CyclicalEncoder':
        """Determine periods for each column."""
        cols = self._get_columns(data)
        self._fit_params = {'column_periods': {}}

        for col in cols:
            # Try to infer period from column name
            period = None
            for key, p in self.periods.items():
                if key in col.lower():
                    period = p
                    break

            if period is None:
                # Infer from data range
                values = data[col].dropna()
                period = int(values.max() - values.min() + 1)

            self._fit_params['column_periods'][col] = period

        self._fitted = True
        return self

    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply cyclical encoding."""
        if not self._fitted:
            raise ValueError("Transform not fitted. Call fit() first.")

        result = data.copy()

        for col, period in self._fit_params['column_periods'].items():
            if col not in result.columns:
                continue

            values = result[col].values
            result[f"{col}_sin"] = np.sin(2 * np.pi * values / period)
            result[f"{col}_cos"] = np.cos(2 * np.pi * values / period)

            if self.drop_original:
                result = result.drop(columns=[col])

        return result


class LagFeatures(Transform):
    """
    Create lagged versions of features.
    """

    def __init__(
        self,
        columns: List[str],
        lags: List[int],
        group_by: Optional[List[str]] = None,
        fill_value: Optional[float] = None,
    ):
        super().__init__("lag_features", columns)
        self.lags = lags
        self.group_by = group_by
        self.fill_value = fill_value

    def fit(self, data: pd.DataFrame) -> 'LagFeatures':
        """Lag features are stateless."""
        self._fit_params = {'columns': self.columns}
        self._fitted = True
        return self

    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create lag features."""
        result = data.copy()

        for col in self.columns:
            if col not in result.columns:
                continue

            for lag in self.lags:
                new_col = f"{col}_lag{lag}"

                if self.group_by:
                    result[new_col] = result.groupby(self.group_by)[col].shift(lag)
                else:
                    result[new_col] = result[col].shift(lag)

                if self.fill_value is not None:
                    result[new_col] = result[new_col].fillna(self.fill_value)

        return result


class RollingFeatures(Transform):
    """
    Create rolling window aggregation features.
    """

    def __init__(
        self,
        columns: List[str],
        windows: List[int],
        functions: Optional[List[str]] = None,
        group_by: Optional[List[str]] = None,
        min_periods: int = 1,
    ):
        super().__init__("rolling_features", columns)
        self.windows = windows
        self.functions = functions or ['mean', 'std', 'min', 'max']
        self.group_by = group_by
        self.min_periods = min_periods

    def fit(self, data: pd.DataFrame) -> 'RollingFeatures':
        """Rolling features are stateless."""
        self._fit_params = {'columns': self.columns}
        self._fitted = True
        return self

    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create rolling features."""
        result = data.copy()

        for col in self.columns:
            if col not in result.columns:
                continue

            for window in self.windows:
                for func in self.functions:
                    new_col = f"{col}_roll{window}_{func}"

                    if self.group_by:
                        rolling = result.groupby(self.group_by)[col].rolling(
                            window=window,
                            min_periods=self.min_periods,
                        )
                    else:
                        rolling = result[col].rolling(
                            window=window,
                            min_periods=self.min_periods,
                        )

                    if func == 'mean':
                        result[new_col] = rolling.mean().reset_index(level=0, drop=True) if self.group_by else rolling.mean()
                    elif func == 'std':
                        result[new_col] = rolling.std().reset_index(level=0, drop=True) if self.group_by else rolling.std()
                    elif func == 'min':
                        result[new_col] = rolling.min().reset_index(level=0, drop=True) if self.group_by else rolling.min()
                    elif func == 'max':
                        result[new_col] = rolling.max().reset_index(level=0, drop=True) if self.group_by else rolling.max()
                    elif func == 'sum':
                        result[new_col] = rolling.sum().reset_index(level=0, drop=True) if self.group_by else rolling.sum()
                    elif func == 'count':
                        result[new_col] = rolling.count().reset_index(level=0, drop=True) if self.group_by else rolling.count()
                    elif func == 'median':
                        result[new_col] = rolling.median().reset_index(level=0, drop=True) if self.group_by else rolling.median()

        return result


class DiffFeatures(Transform):
    """
    Create difference features (change from previous values).
    """

    def __init__(
        self,
        columns: List[str],
        periods: List[int] = [1],
        pct_change: bool = False,
        group_by: Optional[List[str]] = None,
    ):
        super().__init__("diff_features", columns)
        self.periods = periods
        self.pct_change = pct_change
        self.group_by = group_by

    def fit(self, data: pd.DataFrame) -> 'DiffFeatures':
        """Diff features are stateless."""
        self._fit_params = {'columns': self.columns}
        self._fitted = True
        return self

    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create difference features."""
        result = data.copy()

        for col in self.columns:
            if col not in result.columns:
                continue

            for period in self.periods:
                if self.pct_change:
                    new_col = f"{col}_pct{period}"
                    if self.group_by:
                        result[new_col] = result.groupby(self.group_by)[col].pct_change(periods=period)
                    else:
                        result[new_col] = result[col].pct_change(periods=period)
                else:
                    new_col = f"{col}_diff{period}"
                    if self.group_by:
                        result[new_col] = result.groupby(self.group_by)[col].diff(periods=period)
                    else:
                        result[new_col] = result[col].diff(periods=period)

        return result
