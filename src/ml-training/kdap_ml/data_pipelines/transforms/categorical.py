"""
Categorical Transforms
Transformations for categorical data
"""

import logging
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd

from .base import Transform, ColumnTransform

logger = logging.getLogger(__name__)


class LabelEncoder(ColumnTransform):
    """
    Encode categorical values as integers.
    """

    def __init__(
        self,
        columns: Optional[List[str]] = None,
        handle_unknown: str = 'use_default',
        default_value: int = -1,
    ):
        super().__init__("label_encoder", columns, suffix="encoded")
        self.handle_unknown = handle_unknown
        self.default_value = default_value

    def fit(self, data: pd.DataFrame) -> 'LabelEncoder':
        """Learn encoding mappings."""
        cols = self._get_columns(data)
        self._fit_params = {'mappings': {}, 'inverse_mappings': {}}

        for col in cols:
            unique_values = data[col].dropna().unique()
            mapping = {v: i for i, v in enumerate(sorted(unique_values, key=str))}

            self._fit_params['mappings'][col] = mapping
            self._fit_params['inverse_mappings'][col] = {v: k for k, v in mapping.items()}

        self._fitted = True
        return self

    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply label encoding."""
        if not self._fitted:
            raise ValueError("Transform not fitted. Call fit() first.")

        result = data.copy()

        for col, mapping in self._fit_params['mappings'].items():
            if col not in result.columns:
                continue

            output_col = self._output_column_name(col)

            if self.handle_unknown == 'use_default':
                result[output_col] = result[col].map(mapping).fillna(self.default_value).astype(int)
            elif self.handle_unknown == 'error':
                unknown = set(result[col].dropna().unique()) - set(mapping.keys())
                if unknown:
                    raise ValueError(f"Unknown categories in {col}: {unknown}")
                result[output_col] = result[col].map(mapping)
            else:
                result[output_col] = result[col].map(mapping)

        return result

    def inverse_transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Reverse label encoding."""
        result = data.copy()

        for col, inverse_mapping in self._fit_params['inverse_mappings'].items():
            output_col = self._output_column_name(col)
            if output_col not in result.columns:
                continue

            result[col] = result[output_col].map(inverse_mapping)

        return result


class OneHotEncoder(ColumnTransform):
    """
    One-hot encode categorical variables.
    """

    def __init__(
        self,
        columns: Optional[List[str]] = None,
        drop_first: bool = False,
        handle_unknown: str = 'ignore',
        min_frequency: Optional[float] = None,
    ):
        super().__init__("onehot_encoder", columns)
        self.drop_first = drop_first
        self.handle_unknown = handle_unknown
        self.min_frequency = min_frequency

    def fit(self, data: pd.DataFrame) -> 'OneHotEncoder':
        """Learn categories for each column."""
        cols = self._get_columns(data)
        self._fit_params = {'categories': {}}

        for col in cols:
            categories = data[col].dropna().unique().tolist()

            # Filter by minimum frequency if specified
            if self.min_frequency:
                value_counts = data[col].value_counts(normalize=True)
                categories = [c for c in categories if value_counts.get(c, 0) >= self.min_frequency]

            categories = sorted(categories, key=str)

            if self.drop_first and len(categories) > 1:
                categories = categories[1:]

            self._fit_params['categories'][col] = categories

        self._fitted = True
        return self

    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply one-hot encoding."""
        if not self._fitted:
            raise ValueError("Transform not fitted. Call fit() first.")

        result = data.copy()

        for col, categories in self._fit_params['categories'].items():
            if col not in result.columns:
                continue

            for cat in categories:
                new_col = f"{col}_{cat}"
                result[new_col] = (result[col] == cat).astype(int)

            if self.drop_original:
                result = result.drop(columns=[col])

        return result

    def get_feature_names(self) -> List[str]:
        """Get names of output features."""
        names = []
        for col, categories in self._fit_params.get('categories', {}).items():
            for cat in categories:
                names.append(f"{col}_{cat}")
        return names


class TargetEncoder(ColumnTransform):
    """
    Encode categorical variables using target mean.

    Includes smoothing to prevent overfitting on rare categories.
    """

    def __init__(
        self,
        columns: Optional[List[str]] = None,
        target_column: str = 'target',
        smoothing: float = 1.0,
        min_samples: int = 1,
    ):
        super().__init__("target_encoder", columns, suffix="target_encoded")
        self.target_column = target_column
        self.smoothing = smoothing
        self.min_samples = min_samples

    def fit(self, data: pd.DataFrame) -> 'TargetEncoder':
        """Learn target encoding mappings."""
        if self.target_column not in data.columns:
            raise ValueError(f"Target column '{self.target_column}' not found")

        cols = self._get_columns(data)
        global_mean = data[self.target_column].mean()

        self._fit_params = {
            'mappings': {},
            'global_mean': float(global_mean),
        }

        for col in cols:
            if col == self.target_column:
                continue

            # Calculate mean target for each category
            agg = data.groupby(col)[self.target_column].agg(['mean', 'count'])

            # Apply smoothing: smoothed_mean = (count * mean + smoothing * global_mean) / (count + smoothing)
            smoothed = (
                agg['count'] * agg['mean'] + self.smoothing * global_mean
            ) / (agg['count'] + self.smoothing)

            # Filter by minimum samples
            smoothed = smoothed[agg['count'] >= self.min_samples]

            self._fit_params['mappings'][col] = smoothed.to_dict()

        self._fitted = True
        return self

    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply target encoding."""
        if not self._fitted:
            raise ValueError("Transform not fitted. Call fit() first.")

        result = data.copy()
        global_mean = self._fit_params['global_mean']

        for col, mapping in self._fit_params['mappings'].items():
            if col not in result.columns:
                continue

            output_col = self._output_column_name(col)
            result[output_col] = result[col].map(mapping).fillna(global_mean)

        return result


class FrequencyEncoder(ColumnTransform):
    """
    Encode categorical variables using frequency counts.
    """

    def __init__(
        self,
        columns: Optional[List[str]] = None,
        normalize: bool = True,
    ):
        super().__init__("frequency_encoder", columns, suffix="freq")
        self.normalize = normalize

    def fit(self, data: pd.DataFrame) -> 'FrequencyEncoder':
        """Learn frequency mappings."""
        cols = self._get_columns(data)
        self._fit_params = {'mappings': {}}

        for col in cols:
            counts = data[col].value_counts(normalize=self.normalize)
            self._fit_params['mappings'][col] = counts.to_dict()

        self._fitted = True
        return self

    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply frequency encoding."""
        if not self._fitted:
            raise ValueError("Transform not fitted. Call fit() first.")

        result = data.copy()

        for col, mapping in self._fit_params['mappings'].items():
            if col not in result.columns:
                continue

            output_col = self._output_column_name(col)
            default = 0 if self.normalize else 1
            result[output_col] = result[col].map(mapping).fillna(default)

        return result


class BinaryEncoder(ColumnTransform):
    """
    Binary encode categorical variables.

    More memory efficient than one-hot for high cardinality columns.
    """

    def __init__(
        self,
        columns: Optional[List[str]] = None,
    ):
        super().__init__("binary_encoder", columns)

    def fit(self, data: pd.DataFrame) -> 'BinaryEncoder':
        """Learn binary encoding mappings."""
        cols = self._get_columns(data)
        self._fit_params = {'mappings': {}, 'n_bits': {}}

        for col in cols:
            unique_values = data[col].dropna().unique()
            n_values = len(unique_values)
            n_bits = int(np.ceil(np.log2(max(n_values, 2))))

            mapping = {v: i for i, v in enumerate(sorted(unique_values, key=str))}

            self._fit_params['mappings'][col] = mapping
            self._fit_params['n_bits'][col] = n_bits

        self._fitted = True
        return self

    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply binary encoding."""
        if not self._fitted:
            raise ValueError("Transform not fitted. Call fit() first.")

        result = data.copy()

        for col, mapping in self._fit_params['mappings'].items():
            if col not in result.columns:
                continue

            n_bits = self._fit_params['n_bits'][col]
            encoded = result[col].map(mapping).fillna(0).astype(int)

            # Convert to binary representation
            for bit in range(n_bits):
                new_col = f"{col}_bit{bit}"
                result[new_col] = (encoded >> bit) & 1

            if self.drop_original:
                result = result.drop(columns=[col])

        return result

    def get_feature_names(self) -> List[str]:
        """Get names of output features."""
        names = []
        for col, n_bits in self._fit_params.get('n_bits', {}).items():
            for bit in range(n_bits):
                names.append(f"{col}_bit{bit}")
        return names
