"""
Anomaly Detection Synthetic Data Generator
Generates realistic time series data with anomalies
"""

import logging
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

from .generator import SyntheticDataGenerator, GeneratorConfig

logger = logging.getLogger(__name__)


class AnomalyDataGenerator(SyntheticDataGenerator):
    """
    Generates synthetic time series data with anomalies.

    Simulates realistic patterns:
    - Trend components
    - Seasonality (daily, weekly, yearly)
    - Point anomalies
    - Contextual anomalies
    - Collective anomalies
    """

    ANOMALY_TYPES = ['point', 'contextual', 'collective', 'trend_shift']
    METRICS = ['spend', 'impressions', 'clicks', 'conversions', 'revenue']

    def __init__(
        self,
        config: Optional[GeneratorConfig] = None,
        anomaly_rate: float = 0.05,
        include_seasonality: bool = True,
        include_trend: bool = True,
        anomaly_types: Optional[List[str]] = None,
    ):
        super().__init__(config)
        self.anomaly_rate = anomaly_rate
        self.include_seasonality = include_seasonality
        self.include_trend = include_trend
        self.anomaly_types = anomaly_types or ['point', 'contextual']

    def generate(self) -> pd.DataFrame:
        """Generate synthetic anomaly detection data."""
        logger.info(f"Generating {self.config.n_samples} time series samples for anomaly detection")

        # Generate timestamps
        timestamps = pd.date_range(
            start=self.config.date_range[0],
            periods=self.config.n_samples,
            freq='H',  # Hourly data
        )

        data = {
            'timestamp': timestamps,
            'record_id': self._generate_ids('TS'),
        }

        # Generate base metric values
        for metric in self.METRICS:
            base_values = self._generate_base_series(metric, len(timestamps))

            # Add trend
            if self.include_trend:
                base_values = self._add_trend(base_values, timestamps)

            # Add seasonality
            if self.include_seasonality:
                base_values = self._add_seasonality(base_values, timestamps)

            # Add noise
            base_values = self._add_noise(base_values, scale=self.config.noise_level)

            data[metric] = np.maximum(base_values, 0)

        # Create DataFrame
        df = pd.DataFrame(data)

        # Add time features
        df['hour'] = df['timestamp'].dt.hour
        df['day_of_week'] = df['timestamp'].dt.dayofweek
        df['day_of_month'] = df['timestamp'].dt.day
        df['month'] = df['timestamp'].dt.month
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)

        # Calculate derived metrics
        df['ctr'] = df['clicks'] / np.maximum(df['impressions'], 1)
        df['conversion_rate'] = df['conversions'] / np.maximum(df['clicks'], 1)
        df['cpc'] = df['spend'] / np.maximum(df['clicks'], 1)
        df['roas'] = df['revenue'] / np.maximum(df['spend'], 1)

        # Inject anomalies and create labels
        df, anomaly_info = self._inject_anomalies(df)

        # Store anomaly metadata
        df['is_anomaly'] = anomaly_info['labels']
        df['anomaly_type'] = anomaly_info['types']
        df['anomaly_score'] = anomaly_info['scores']

        # Register features
        self._register_features()

        actual_rate = df['is_anomaly'].mean()
        logger.info(f"Generated {len(df)} records with {actual_rate:.2%} anomaly rate")
        return df

    def _generate_base_series(self, metric: str, n: int) -> np.ndarray:
        """Generate base time series for a metric."""
        metric_params = {
            'spend': {'mean': 5000, 'std': 1000},
            'impressions': {'mean': 100000, 'std': 20000},
            'clicks': {'mean': 3000, 'std': 600},
            'conversions': {'mean': 100, 'std': 30},
            'revenue': {'mean': 15000, 'std': 4000},
        }

        params = metric_params.get(metric, {'mean': 1000, 'std': 200})
        base = self._rng.normal(params['mean'], params['std'], n)

        return np.maximum(base, 0)

    def _add_trend(self, values: np.ndarray, timestamps: pd.DatetimeIndex) -> np.ndarray:
        """Add trend component to time series."""
        n = len(values)

        # Linear trend with slight growth
        trend_slope = 0.001 * values.mean()
        linear_trend = np.arange(n) * trend_slope

        # Add occasional level shifts
        n_shifts = self._rng.randint(0, 3)
        level_shifts = np.zeros(n)
        for _ in range(n_shifts):
            shift_point = self._rng.randint(n // 4, 3 * n // 4)
            shift_magnitude = self._rng.normal(0, 0.1) * values.mean()
            level_shifts[shift_point:] += shift_magnitude

        return values + linear_trend + level_shifts

    def _add_seasonality(self, values: np.ndarray, timestamps: pd.DatetimeIndex) -> np.ndarray:
        """Add seasonality components."""
        n = len(values)
        result = values.copy()

        # Hourly seasonality (business hours effect)
        hours = timestamps.hour.values
        hourly_pattern = 0.3 * np.sin(2 * np.pi * (hours - 10) / 24)  # Peak at 10am
        hourly_pattern[hours < 6] = -0.4  # Low overnight
        hourly_pattern[hours > 22] = -0.3
        result *= (1 + hourly_pattern)

        # Daily seasonality (weekday vs weekend)
        day_of_week = timestamps.dayofweek.values
        is_weekend = np.isin(day_of_week, [5, 6])
        result[is_weekend] *= 0.7  # 30% lower on weekends

        # Weekly pattern
        weekly_pattern = 0.1 * np.sin(2 * np.pi * day_of_week / 7)
        result *= (1 + weekly_pattern)

        # Monthly seasonality
        day_of_month = timestamps.day.values
        monthly_pattern = 0.15 * np.sin(2 * np.pi * day_of_month / 30)
        result *= (1 + monthly_pattern)

        return result

    def _inject_anomalies(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, np.ndarray]]:
        """Inject various types of anomalies."""
        n = len(df)
        df = df.copy()

        # Initialize anomaly tracking
        labels = np.zeros(n, dtype=int)
        types = np.array(['normal'] * n, dtype=object)
        scores = np.zeros(n)

        n_anomalies = int(n * self.anomaly_rate)
        anomaly_indices = self._rng.choice(n, n_anomalies, replace=False)

        for idx in anomaly_indices:
            anomaly_type = self._rng.choice(self.anomaly_types)

            if anomaly_type == 'point':
                df, severity = self._inject_point_anomaly(df, idx)
            elif anomaly_type == 'contextual':
                df, severity = self._inject_contextual_anomaly(df, idx)
            elif anomaly_type == 'collective':
                df, severity, affected_range = self._inject_collective_anomaly(df, idx)
                # Mark all affected points
                for i in affected_range:
                    if i < n:
                        labels[i] = 1
                        types[i] = 'collective'
                        scores[i] = max(scores[i], severity * 0.8)
                continue
            elif anomaly_type == 'trend_shift':
                df, severity = self._inject_trend_shift(df, idx)
            else:
                continue

            labels[idx] = 1
            types[idx] = anomaly_type
            scores[idx] = severity

        return df, {'labels': labels, 'types': types, 'scores': scores}

    def _inject_point_anomaly(
        self,
        df: pd.DataFrame,
        idx: int,
    ) -> Tuple[pd.DataFrame, float]:
        """Inject a point anomaly (spike or drop)."""
        # Choose a metric to affect
        metric = self._rng.choice(self.METRICS)
        original_value = df.loc[idx, metric]

        # Spike or drop
        direction = self._rng.choice([-1, 1])
        magnitude = self._rng.uniform(2, 5)  # 2x to 5x deviation

        if direction > 0:
            # Spike
            df.loc[idx, metric] = original_value * (1 + magnitude)
        else:
            # Drop
            df.loc[idx, metric] = original_value * max(0.1, 1 - magnitude * 0.3)

        severity = min(magnitude / 5, 1.0)
        return df, severity

    def _inject_contextual_anomaly(
        self,
        df: pd.DataFrame,
        idx: int,
    ) -> Tuple[pd.DataFrame, float]:
        """Inject a contextual anomaly (normal value in wrong context)."""
        # Swap value with a different time context
        hour = df.loc[idx, 'hour']

        # If business hours, use overnight pattern
        if 9 <= hour <= 17:
            # Use a much lower value typical of overnight
            for metric in self.METRICS:
                df.loc[idx, metric] *= 0.3
            severity = 0.7
        else:
            # Use business hours pattern for overnight
            for metric in self.METRICS:
                df.loc[idx, metric] *= 2.5
            severity = 0.6

        return df, severity

    def _inject_collective_anomaly(
        self,
        df: pd.DataFrame,
        start_idx: int,
    ) -> Tuple[pd.DataFrame, float, range]:
        """Inject a collective anomaly (sequence of unusual behavior)."""
        duration = self._rng.randint(3, 12)  # 3 to 12 hours
        end_idx = min(start_idx + duration, len(df))

        # Gradual drift or sustained shift
        pattern = self._rng.choice(['drift', 'shift', 'variance'])

        if pattern == 'drift':
            # Gradual increase or decrease
            drift_factor = np.linspace(1, 1.5 + self._rng.random(), end_idx - start_idx)
            for metric in self.METRICS:
                df.loc[start_idx:end_idx - 1, metric] *= drift_factor
            severity = 0.5

        elif pattern == 'shift':
            # Sudden level shift
            shift = self._rng.uniform(0.3, 0.6)
            direction = self._rng.choice([-1, 1])
            for metric in self.METRICS:
                df.loc[start_idx:end_idx - 1, metric] *= (1 + direction * shift)
            severity = 0.6

        else:  # variance
            # Increased variance
            for metric in self.METRICS:
                noise = self._rng.normal(0, 0.3, end_idx - start_idx)
                df.loc[start_idx:end_idx - 1, metric] *= (1 + noise)
            severity = 0.4

        return df, severity, range(start_idx, end_idx)

    def _inject_trend_shift(
        self,
        df: pd.DataFrame,
        idx: int,
    ) -> Tuple[pd.DataFrame, float]:
        """Inject a sudden trend change."""
        # Affects all data from this point forward
        remaining = len(df) - idx
        if remaining < 10:
            return df, 0

        # Change the trend slope
        new_slope = self._rng.choice([-1, 1]) * self._rng.uniform(0.01, 0.05)

        for metric in self.METRICS:
            base_value = df.loc[idx, metric]
            trend_adjustment = np.arange(remaining) * new_slope * base_value
            df.loc[idx:, metric] = df.loc[idx:, metric].values + trend_adjustment[:len(df.loc[idx:])]

        return df, 0.8

    def generate_multivariate(self, n_series: int = 5) -> pd.DataFrame:
        """Generate multivariate time series with correlated anomalies."""
        logger.info(f"Generating multivariate time series with {n_series} series")

        # Generate base timestamps
        timestamps = pd.date_range(
            start=self.config.date_range[0],
            periods=self.config.n_samples,
            freq='H',
        )

        # Generate correlated series
        correlation_matrix = self._generate_correlation_matrix(n_series)

        # Generate uncorrelated series first
        uncorrelated = self._rng.normal(0, 1, (self.config.n_samples, n_series))

        # Apply correlation via Cholesky decomposition
        L = np.linalg.cholesky(correlation_matrix)
        correlated = uncorrelated @ L.T

        # Transform to realistic values
        data = {'timestamp': timestamps}
        for i in range(n_series):
            series_name = f'metric_{i + 1}'
            base_mean = 1000 * (i + 1)
            base_std = base_mean * 0.2

            values = base_mean + correlated[:, i] * base_std

            if self.include_seasonality:
                values = self._add_seasonality(values, timestamps)

            data[series_name] = np.maximum(values, 0)

        df = pd.DataFrame(data)

        # Inject correlated anomalies
        df, anomaly_info = self._inject_anomalies(df)
        df['is_anomaly'] = anomaly_info['labels']
        df['anomaly_type'] = anomaly_info['types']

        return df

    def _generate_correlation_matrix(self, n: int) -> np.ndarray:
        """Generate a valid correlation matrix."""
        # Generate random matrix
        A = self._rng.uniform(-0.5, 0.5, (n, n))

        # Make it symmetric positive definite
        correlation = A @ A.T

        # Normalize to correlation matrix
        D = np.diag(1 / np.sqrt(np.diag(correlation)))
        correlation = D @ correlation @ D

        return correlation

    def _register_features(self) -> None:
        """Register all feature metadata."""
        self._register_feature('timestamp', 'datetime', 'Observation timestamp')
        self._register_feature('is_anomaly', 'binary', 'Target: Is anomalous')
        self._register_feature('anomaly_type', 'categorical', 'Type of anomaly')
        self._register_feature('anomaly_score', 'numeric', 'Anomaly severity (0-1)')
        for metric in self.METRICS:
            self._register_feature(metric, 'numeric', f'{metric.title()} value')
