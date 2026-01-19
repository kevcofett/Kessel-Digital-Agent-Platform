"""
Transform Base Classes
Core infrastructure for data transformations
"""

import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional, Union

import pandas as pd

logger = logging.getLogger(__name__)


@dataclass
class TransformResult:
    """Result of a transform operation."""
    success: bool
    transform_name: str
    input_columns: List[str]
    output_columns: List[str]
    rows_affected: int
    duration_ms: float
    metadata: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None


class Transform(ABC):
    """Base class for data transforms."""

    def __init__(self, name: str, columns: Optional[List[str]] = None):
        self.name = name
        self.columns = columns
        self._fitted = False
        self._fit_params: Dict[str, Any] = {}

    @abstractmethod
    def fit(self, data: pd.DataFrame) -> 'Transform':
        """Fit transform parameters from data."""
        pass

    @abstractmethod
    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply transform to data."""
        pass

    def fit_transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Fit and transform in one step."""
        self.fit(data)
        return self.transform(data)

    def inverse_transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Inverse transform (if supported)."""
        raise NotImplementedError(f"{self.name} does not support inverse transform")

    def _get_columns(self, data: pd.DataFrame) -> List[str]:
        """Get columns to transform."""
        if self.columns:
            return [c for c in self.columns if c in data.columns]
        return list(data.columns)

    def get_params(self) -> Dict[str, Any]:
        """Get fitted parameters."""
        return self._fit_params.copy()

    def set_params(self, params: Dict[str, Any]) -> None:
        """Set parameters (for loading)."""
        self._fit_params = params
        self._fitted = True

    def to_dict(self) -> Dict[str, Any]:
        """Serialize transform to dictionary."""
        return {
            'name': self.name,
            'class': self.__class__.__name__,
            'columns': self.columns,
            'params': self._fit_params,
            'fitted': self._fitted,
        }

    @classmethod
    def from_dict(cls, config: Dict[str, Any]) -> 'Transform':
        """Deserialize transform from dictionary."""
        transform = cls(columns=config.get('columns'))
        transform._fit_params = config.get('params', {})
        transform._fitted = config.get('fitted', False)
        return transform


class TransformPipeline:
    """
    Pipeline of sequential transforms.

    Applies transforms in order, passing output of each to the next.
    """

    def __init__(self, name: str = "pipeline"):
        self.name = name
        self.transforms: List[Transform] = []
        self._results: List[TransformResult] = []

    def add(self, transform: Transform) -> 'TransformPipeline':
        """Add a transform to the pipeline."""
        self.transforms.append(transform)
        return self

    def fit(self, data: pd.DataFrame) -> 'TransformPipeline':
        """Fit all transforms."""
        current_data = data.copy()

        for transform in self.transforms:
            transform.fit(current_data)
            current_data = transform.transform(current_data)

        return self

    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply all transforms."""
        import time

        self._results = []
        current_data = data.copy()

        for transform in self.transforms:
            start_time = time.time()
            input_cols = list(current_data.columns)

            try:
                current_data = transform.transform(current_data)

                self._results.append(TransformResult(
                    success=True,
                    transform_name=transform.name,
                    input_columns=input_cols,
                    output_columns=list(current_data.columns),
                    rows_affected=len(current_data),
                    duration_ms=(time.time() - start_time) * 1000,
                ))

            except Exception as e:
                logger.error(f"Transform {transform.name} failed: {e}")
                self._results.append(TransformResult(
                    success=False,
                    transform_name=transform.name,
                    input_columns=input_cols,
                    output_columns=[],
                    rows_affected=0,
                    duration_ms=(time.time() - start_time) * 1000,
                    error=str(e),
                ))
                raise

        return current_data

    def fit_transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Fit and transform in one step."""
        self.fit(data)
        return self.transform(data)

    def inverse_transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply inverse transforms in reverse order."""
        current_data = data.copy()

        for transform in reversed(self.transforms):
            current_data = transform.inverse_transform(current_data)

        return current_data

    def get_results(self) -> List[TransformResult]:
        """Get results from last transform run."""
        return self._results

    def get_summary(self) -> Dict[str, Any]:
        """Get summary of pipeline execution."""
        total_time = sum(r.duration_ms for r in self._results)
        failed = [r for r in self._results if not r.success]

        return {
            'pipeline_name': self.name,
            'total_transforms': len(self.transforms),
            'successful_transforms': len(self._results) - len(failed),
            'failed_transforms': len(failed),
            'total_duration_ms': total_time,
            'transform_results': [
                {
                    'name': r.transform_name,
                    'success': r.success,
                    'duration_ms': r.duration_ms,
                    'error': r.error,
                }
                for r in self._results
            ],
        }

    def to_dict(self) -> Dict[str, Any]:
        """Serialize pipeline to dictionary."""
        return {
            'name': self.name,
            'transforms': [t.to_dict() for t in self.transforms],
        }

    def save(self, path: str) -> None:
        """Save pipeline to JSON file."""
        import json
        with open(path, 'w') as f:
            json.dump(self.to_dict(), f, indent=2, default=str)

    @classmethod
    def load(cls, path: str, transform_registry: Dict[str, type]) -> 'TransformPipeline':
        """Load pipeline from JSON file."""
        import json
        with open(path, 'r') as f:
            config = json.load(f)

        pipeline = cls(name=config.get('name', 'pipeline'))

        for t_config in config.get('transforms', []):
            t_class = transform_registry.get(t_config['class'])
            if t_class:
                transform = t_class.from_dict(t_config)
                pipeline.add(transform)

        return pipeline


class ColumnTransform(Transform):
    """Transform that operates on specific columns."""

    def __init__(
        self,
        name: str,
        columns: Optional[List[str]] = None,
        prefix: Optional[str] = None,
        suffix: Optional[str] = None,
        drop_original: bool = False,
    ):
        super().__init__(name, columns)
        self.prefix = prefix
        self.suffix = suffix
        self.drop_original = drop_original

    def _output_column_name(self, input_col: str) -> str:
        """Generate output column name."""
        name = input_col
        if self.prefix:
            name = f"{self.prefix}_{name}"
        if self.suffix:
            name = f"{name}_{self.suffix}"
        return name

    def _apply_to_dataframe(
        self,
        data: pd.DataFrame,
        transform_func,
    ) -> pd.DataFrame:
        """Apply transform function to selected columns."""
        result = data.copy()
        cols = self._get_columns(data)

        for col in cols:
            output_col = self._output_column_name(col)
            result[output_col] = transform_func(result[col])

            if self.drop_original and output_col != col:
                result = result.drop(columns=[col])

        return result


class GroupTransform(Transform):
    """Transform that operates within groups."""

    def __init__(
        self,
        name: str,
        columns: Optional[List[str]] = None,
        group_by: Optional[List[str]] = None,
    ):
        super().__init__(name, columns)
        self.group_by = group_by or []

    def _apply_grouped(
        self,
        data: pd.DataFrame,
        transform_func,
    ) -> pd.DataFrame:
        """Apply transform within groups."""
        if not self.group_by:
            return transform_func(data)

        result_dfs = []
        for _, group in data.groupby(self.group_by):
            transformed = transform_func(group)
            result_dfs.append(transformed)

        return pd.concat(result_dfs).sort_index()
