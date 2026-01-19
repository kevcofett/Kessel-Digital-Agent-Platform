"""
Numeric Transforms
Transformations for numeric data
"""

import logging
from typing import Any, Dict, List, Optional, Union

import numpy as np
import pandas as pd

from .base import Transform, ColumnTransform

logger = logging.getLogger(__name__)


class StandardScaler(ColumnTransform):
    """
    Standardize features by removing mean and scaling to unit variance.

    z = (x - mean) / std
    """

    def __init__(
        self,
        columns: Optional[List[str]] = None,
        with_mean: bool = True,
        with_std: bool = True,
    ):
        super().__init__("standard_scaler", columns, suffix="scaled")
        self.with_mean = with_mean
        self.with_std = with_std

    def fit(self, data: pd.DataFrame) -> 'StandardScaler':
        """Compute mean and std for each column."""
        cols = self._get_columns(data)

        self._fit_params = {
            'means': {},
            'stds': {},
        }

        for col in cols:
            if pd.api.types.is_numeric_dtype(data[col]):
                if self.with_mean:
                    self._fit_params['means'][col] = float(data[col].mean())
                if self.with_std:
                    self._fit_params['stds'][col] = float(data[col].std())

        self._fitted = True
        return self

    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply standardization."""
        if not self._fitted:
            raise ValueError("Transform not fitted. Call fit() first.")

        result = data.copy()

        for col in self._fit_params['means'].keys():
            if col not in result.columns:
                continue

            values = result[col].values.astype(float)

            if self.with_mean:
                values = values - self._fit_params['means'][col]
            if self.with_std and self._fit_params['stds'].get(col, 1) > 0:
                values = values / self._fit_params['stds'][col]

            output_col = self._output_column_name(col)
            result[output_col] = values

        return result

    def inverse_transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Reverse standardization."""
        result = data.copy()

        for col in self._fit_params['means'].keys():
            output_col = self._output_column_name(col)
            if output_col not in result.columns:
                continue

            values = result[output_col].values.astype(float)

            if self.with_std and self._fit_params['stds'].get(col, 1) > 0:
                values = values * self._fit_params['stds'][col]
            if self.with_mean:
                values = values + self._fit_params['means'][col]

            result[col] = values

        return result


class MinMaxScaler(ColumnTransform):
    """
    Scale features to a given range (default [0, 1]).

    x_scaled = (x - min) / (max - min) * (feature_max - feature_min) + feature_min
    """

    def __init__(
        self,
        columns: Optional[List[str]] = None,
        feature_range: tuple = (0, 1),
    ):
        super().__init__("minmax_scaler", columns, suffix="scaled")
        self.feature_range = feature_range

    def fit(self, data: pd.DataFrame) -> 'MinMaxScaler':
        """Compute min and max for each column."""
        cols = self._get_columns(data)

        self._fit_params = {
            'mins': {},
            'maxs': {},
        }

        for col in cols:
            if pd.api.types.is_numeric_dtype(data[col]):
                self._fit_params['mins'][col] = float(data[col].min())
                self._fit_params['maxs'][col] = float(data[col].max())

        self._fitted = True
        return self

    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply min-max scaling."""
        if not self._fitted:
            raise ValueError("Transform not fitted. Call fit() first.")

        result = data.copy()
        feature_min, feature_max = self.feature_range

        for col in self._fit_params['mins'].keys():
            if col not in result.columns:
                continue

            col_min = self._fit_params['mins'][col]
            col_max = self._fit_params['maxs'][col]
            col_range = col_max - col_min

            if col_range == 0:
                scaled = np.zeros(len(result))
            else:
                scaled = (result[col] - col_min) / col_range
                scaled = scaled * (feature_max - feature_min) + feature_min

            output_col = self._output_column_name(col)
            result[output_col] = scaled

        return result

    def inverse_transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Reverse min-max scaling."""
        result = data.copy()
        feature_min, feature_max = self.feature_range
        feature_range = feature_max - feature_min

        for col in self._fit_params['mins'].keys():
            output_col = self._output_column_name(col)
            if output_col not in result.columns:
                continue

            col_min = self._fit_params['mins'][col]
            col_max = self._fit_params['maxs'][col]
            col_range = col_max - col_min

            values = (result[output_col] - feature_min) / feature_range
            values = values * col_range + col_min

            result[col] = values

        return result


class RobustScaler(ColumnTransform):
    """
    Scale features using statistics that are robust to outliers.

    Uses median and IQR instead of mean and std.
    """

    def __init__(
        self,
        columns: Optional[List[str]] = None,
        with_centering: bool = True,
        quantile_range: tuple = (25.0, 75.0),
    ):
        super().__init__("robust_scaler", columns, suffix="scaled")
        self.with_centering = with_centering
        self.quantile_range = quantile_range

    def fit(self, data: pd.DataFrame) -> 'RobustScaler':
        """Compute median and IQR for each column."""
        cols = self._get_columns(data)
        q_low, q_high = self.quantile_range

        self._fit_params = {
            'medians': {},
            'iqrs': {},
        }

        for col in cols:
            if pd.api.types.is_numeric_dtype(data[col]):
                if self.with_centering:
                    self._fit_params['medians'][col] = float(data[col].median())

                q1 = data[col].quantile(q_low / 100)
                q3 = data[col].quantile(q_high / 100)
                self._fit_params['iqrs'][col] = float(q3 - q1)

        self._fitted = True
        return self

    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply robust scaling."""
        if not self._fitted:
            raise ValueError("Transform not fitted. Call fit() first.")

        result = data.copy()

        for col in self._fit_params['iqrs'].keys():
            if col not in result.columns:
                continue

            values = result[col].values.astype(float)

            if self.with_centering:
                values = values - self._fit_params['medians'][col]

            iqr = self._fit_params['iqrs'][col]
            if iqr > 0:
                values = values / iqr

            output_col = self._output_column_name(col)
            result[output_col] = values

        return result


class LogTransform(ColumnTransform):
    """
    Apply logarithmic transformation.

    Supports log1p for handling zeros.
    """

    def __init__(
        self,
        columns: Optional[List[str]] = None,
        base: str = 'natural',
        offset: float = 1.0,
    ):
        super().__init__("log_transform", columns, suffix="log")
        self.base = base
        self.offset = offset

    def fit(self, data: pd.DataFrame) -> 'LogTransform':
        """Log transform is stateless, just validate columns."""
        self._fit_params = {'columns': self._get_columns(data)}
        self._fitted = True
        return self

    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply log transformation."""
        result = data.copy()

        for col in self._fit_params['columns']:
            if col not in result.columns:
                continue

            values = result[col].values.astype(float)

            if self.offset != 0:
                values = values + self.offset

            if self.base == 'natural':
                values = np.log(np.maximum(values, 1e-10))
            elif self.base == '10':
                values = np.log10(np.maximum(values, 1e-10))
            elif self.base == '2':
                values = np.log2(np.maximum(values, 1e-10))

            output_col = self._output_column_name(col)
            result[output_col] = values

        return result

    def inverse_transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Reverse log transformation."""
        result = data.copy()

        for col in self._fit_params['columns']:
            output_col = self._output_column_name(col)
            if output_col not in result.columns:
                continue

            values = result[output_col].values.astype(float)

            if self.base == 'natural':
                values = np.exp(values)
            elif self.base == '10':
                values = np.power(10, values)
            elif self.base == '2':
                values = np.power(2, values)

            if self.offset != 0:
                values = values - self.offset

            result[col] = values

        return result


class PowerTransform(ColumnTransform):
    """
    Apply power transformation (Box-Cox or Yeo-Johnson).
    """

    def __init__(
        self,
        columns: Optional[List[str]] = None,
        method: str = 'yeo-johnson',
        standardize: bool = True,
    ):
        super().__init__("power_transform", columns, suffix="power")
        self.method = method
        self.standardize = standardize

    def fit(self, data: pd.DataFrame) -> 'PowerTransform':
        """Fit power transform parameters."""
        from scipy import stats

        cols = self._get_columns(data)
        self._fit_params = {'lambdas': {}, 'means': {}, 'stds': {}}

        for col in cols:
            if not pd.api.types.is_numeric_dtype(data[col]):
                continue

            values = data[col].dropna().values

            if self.method == 'box-cox':
                if np.any(values <= 0):
                    logger.warning(f"Column {col} has non-positive values, skipping Box-Cox")
                    continue
                _, lmbda = stats.boxcox(values)
            else:
                _, lmbda = stats.yeojohnson(values)

            self._fit_params['lambdas'][col] = lmbda

            if self.standardize:
                transformed = self._apply_power(values, lmbda)
                self._fit_params['means'][col] = float(np.mean(transformed))
                self._fit_params['stds'][col] = float(np.std(transformed))

        self._fitted = True
        return self

    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply power transformation."""
        if not self._fitted:
            raise ValueError("Transform not fitted. Call fit() first.")

        result = data.copy()

        for col, lmbda in self._fit_params['lambdas'].items():
            if col not in result.columns:
                continue

            values = result[col].values.astype(float)
            transformed = self._apply_power(values, lmbda)

            if self.standardize:
                mean = self._fit_params['means'].get(col, 0)
                std = self._fit_params['stds'].get(col, 1)
                if std > 0:
                    transformed = (transformed - mean) / std

            output_col = self._output_column_name(col)
            result[output_col] = transformed

        return result

    def _apply_power(self, values: np.ndarray, lmbda: float) -> np.ndarray:
        """Apply power transformation with given lambda."""
        from scipy import stats

        if self.method == 'box-cox':
            return stats.boxcox(values, lmbda)
        else:
            return stats.yeojohnson(values, lmbda)


class Winsorizer(ColumnTransform):
    """
    Cap extreme values at specified percentiles.
    """

    def __init__(
        self,
        columns: Optional[List[str]] = None,
        lower_percentile: float = 0.01,
        upper_percentile: float = 0.99,
    ):
        super().__init__("winsorizer", columns, suffix="winsorized")
        self.lower_percentile = lower_percentile
        self.upper_percentile = upper_percentile

    def fit(self, data: pd.DataFrame) -> 'Winsorizer':
        """Compute percentile bounds."""
        cols = self._get_columns(data)
        self._fit_params = {'lower_bounds': {}, 'upper_bounds': {}}

        for col in cols:
            if pd.api.types.is_numeric_dtype(data[col]):
                self._fit_params['lower_bounds'][col] = float(
                    data[col].quantile(self.lower_percentile)
                )
                self._fit_params['upper_bounds'][col] = float(
                    data[col].quantile(self.upper_percentile)
                )

        self._fitted = True
        return self

    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply winsorization."""
        if not self._fitted:
            raise ValueError("Transform not fitted. Call fit() first.")

        result = data.copy()

        for col in self._fit_params['lower_bounds'].keys():
            if col not in result.columns:
                continue

            lower = self._fit_params['lower_bounds'][col]
            upper = self._fit_params['upper_bounds'][col]

            output_col = self._output_column_name(col)
            result[output_col] = result[col].clip(lower=lower, upper=upper)

        return result


class Binner(ColumnTransform):
    """
    Bin continuous variables into discrete buckets.
    """

    def __init__(
        self,
        columns: Optional[List[str]] = None,
        n_bins: int = 10,
        strategy: str = 'quantile',
        labels: Optional[List[str]] = None,
    ):
        super().__init__("binner", columns, suffix="binned")
        self.n_bins = n_bins
        self.strategy = strategy
        self.labels = labels

    def fit(self, data: pd.DataFrame) -> 'Binner':
        """Compute bin edges."""
        cols = self._get_columns(data)
        self._fit_params = {'bin_edges': {}}

        for col in cols:
            if not pd.api.types.is_numeric_dtype(data[col]):
                continue

            values = data[col].dropna()

            if self.strategy == 'quantile':
                percentiles = np.linspace(0, 100, self.n_bins + 1)
                edges = np.percentile(values, percentiles)
            elif self.strategy == 'uniform':
                edges = np.linspace(values.min(), values.max(), self.n_bins + 1)
            elif self.strategy == 'kmeans':
                from sklearn.cluster import KMeans
                kmeans = KMeans(n_clusters=self.n_bins, random_state=42, n_init=10)
                kmeans.fit(values.values.reshape(-1, 1))
                centers = np.sort(kmeans.cluster_centers_.flatten())
                edges = np.concatenate([
                    [values.min()],
                    (centers[:-1] + centers[1:]) / 2,
                    [values.max()]
                ])
            else:
                raise ValueError(f"Unknown binning strategy: {self.strategy}")

            # Ensure unique edges
            edges = np.unique(edges)
            self._fit_params['bin_edges'][col] = edges.tolist()

        self._fitted = True
        return self

    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply binning."""
        if not self._fitted:
            raise ValueError("Transform not fitted. Call fit() first.")

        result = data.copy()

        for col, edges in self._fit_params['bin_edges'].items():
            if col not in result.columns:
                continue

            n_bins = len(edges) - 1
            labels = self.labels if self.labels and len(self.labels) == n_bins else False

            output_col = self._output_column_name(col)
            result[output_col] = pd.cut(
                result[col],
                bins=edges,
                labels=labels,
                include_lowest=True,
            )

        return result
