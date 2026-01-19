"""
Base Synthetic Data Generator
"""

import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


@dataclass
class GeneratorConfig:
    """Configuration for synthetic data generation."""
    n_samples: int = 10000
    random_seed: int = 42
    noise_level: float = 0.1
    missing_rate: float = 0.0
    outlier_rate: float = 0.0
    date_range: Tuple[str, str] = ('2022-01-01', '2024-01-01')
    parameters: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        if self.noise_level < 0 or self.noise_level > 1:
            raise ValueError("noise_level must be between 0 and 1")
        if self.missing_rate < 0 or self.missing_rate > 1:
            raise ValueError("missing_rate must be between 0 and 1")
        if self.outlier_rate < 0 or self.outlier_rate > 1:
            raise ValueError("outlier_rate must be between 0 and 1")


@dataclass
class GenerationResult:
    """Result of synthetic data generation."""
    data: pd.DataFrame
    config: GeneratorConfig
    generated_at: datetime
    feature_info: Dict[str, Dict[str, Any]]
    statistics: Dict[str, Any]

    def summary(self) -> str:
        """Generate summary of generated data."""
        lines = [
            f"Generated Data Summary",
            f"=" * 40,
            f"Rows: {len(self.data):,}",
            f"Columns: {len(self.data.columns)}",
            f"Generated at: {self.generated_at.isoformat()}",
            f"Random seed: {self.config.random_seed}",
            "",
            "Feature Types:",
        ]
        for col, info in self.feature_info.items():
            lines.append(f"  - {col}: {info.get('type', 'unknown')}")
        return "\n".join(lines)


class SyntheticDataGenerator(ABC):
    """Abstract base class for synthetic data generators."""

    def __init__(self, config: Optional[GeneratorConfig] = None):
        self.config = config or GeneratorConfig()
        self._rng = np.random.RandomState(self.config.random_seed)
        self._feature_info: Dict[str, Dict[str, Any]] = {}

    def set_seed(self, seed: int) -> None:
        """Set random seed for reproducibility."""
        self.config.random_seed = seed
        self._rng = np.random.RandomState(seed)

    @abstractmethod
    def generate(self) -> pd.DataFrame:
        """Generate synthetic data. Must be implemented by subclasses."""
        pass

    def generate_with_result(self) -> GenerationResult:
        """Generate data and return full result with metadata."""
        data = self.generate()
        statistics = self._compute_statistics(data)

        return GenerationResult(
            data=data,
            config=self.config,
            generated_at=datetime.now(),
            feature_info=self._feature_info,
            statistics=statistics,
        )

    def _compute_statistics(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Compute basic statistics for generated data."""
        stats = {
            'row_count': len(data),
            'column_count': len(data.columns),
            'memory_mb': data.memory_usage(deep=True).sum() / 1024 / 1024,
            'dtypes': data.dtypes.astype(str).to_dict(),
        }

        # Numeric column statistics
        numeric_cols = data.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) > 0:
            stats['numeric_stats'] = {
                col: {
                    'mean': data[col].mean(),
                    'std': data[col].std(),
                    'min': data[col].min(),
                    'max': data[col].max(),
                    'null_count': data[col].isnull().sum(),
                }
                for col in numeric_cols
            }

        return stats

    def _add_noise(self, values: np.ndarray, scale: Optional[float] = None) -> np.ndarray:
        """Add Gaussian noise to values."""
        scale = scale or self.config.noise_level
        if scale == 0:
            return values
        noise = self._rng.normal(0, scale * np.std(values), len(values))
        return values + noise

    def _add_missing(self, data: pd.DataFrame, columns: Optional[List[str]] = None) -> pd.DataFrame:
        """Add missing values to specified columns."""
        if self.config.missing_rate == 0:
            return data

        data = data.copy()
        columns = columns or list(data.columns)

        for col in columns:
            mask = self._rng.random(len(data)) < self.config.missing_rate
            data.loc[mask, col] = np.nan

        return data

    def _add_outliers(
        self,
        values: np.ndarray,
        multiplier: float = 3.0,
    ) -> np.ndarray:
        """Add outliers to numeric values."""
        if self.config.outlier_rate == 0:
            return values

        values = values.copy()
        n_outliers = int(len(values) * self.config.outlier_rate)
        outlier_idx = self._rng.choice(len(values), n_outliers, replace=False)

        std = np.std(values)
        mean = np.mean(values)

        # Generate outliers above and below the mean
        for idx in outlier_idx:
            direction = self._rng.choice([-1, 1])
            values[idx] = mean + direction * multiplier * std * (1 + self._rng.random())

        return values

    def _generate_ids(self, prefix: str = "ID") -> np.ndarray:
        """Generate unique IDs."""
        return np.array([f"{prefix}_{i:08d}" for i in range(self.config.n_samples)])

    def _generate_dates(
        self,
        start: Optional[str] = None,
        end: Optional[str] = None,
        freq: str = 'D',
    ) -> pd.DatetimeIndex:
        """Generate date range."""
        start = start or self.config.date_range[0]
        end = end or self.config.date_range[1]
        dates = pd.date_range(start=start, end=end, freq=freq)

        if len(dates) >= self.config.n_samples:
            return dates[:self.config.n_samples]
        else:
            # Repeat dates if not enough
            repeats = (self.config.n_samples // len(dates)) + 1
            dates = pd.DatetimeIndex(list(dates) * repeats)[:self.config.n_samples]
            return dates

    def _generate_categories(
        self,
        categories: List[str],
        weights: Optional[List[float]] = None,
    ) -> np.ndarray:
        """Generate categorical values with optional weights."""
        if weights is None:
            weights = [1.0 / len(categories)] * len(categories)
        weights = np.array(weights) / np.sum(weights)
        return self._rng.choice(categories, size=self.config.n_samples, p=weights)

    def _generate_numeric(
        self,
        distribution: str = 'normal',
        **params,
    ) -> np.ndarray:
        """Generate numeric values from specified distribution."""
        n = self.config.n_samples

        if distribution == 'normal':
            mean = params.get('mean', 0)
            std = params.get('std', 1)
            values = self._rng.normal(mean, std, n)

        elif distribution == 'uniform':
            low = params.get('low', 0)
            high = params.get('high', 1)
            values = self._rng.uniform(low, high, n)

        elif distribution == 'exponential':
            scale = params.get('scale', 1)
            values = self._rng.exponential(scale, n)

        elif distribution == 'lognormal':
            mean = params.get('mean', 0)
            sigma = params.get('sigma', 1)
            values = self._rng.lognormal(mean, sigma, n)

        elif distribution == 'poisson':
            lam = params.get('lam', 1)
            values = self._rng.poisson(lam, n).astype(float)

        elif distribution == 'beta':
            a = params.get('a', 2)
            b = params.get('b', 5)
            values = self._rng.beta(a, b, n)

        else:
            raise ValueError(f"Unknown distribution: {distribution}")

        return values

    def _register_feature(
        self,
        name: str,
        dtype: str,
        description: str = "",
        **metadata,
    ) -> None:
        """Register feature metadata."""
        self._feature_info[name] = {
            'type': dtype,
            'description': description,
            **metadata,
        }
