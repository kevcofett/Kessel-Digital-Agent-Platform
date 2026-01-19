"""
Response Curve Synthetic Data Generator
Generates realistic spend-response data for curve fitting
"""

import logging
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

from .generator import SyntheticDataGenerator, GeneratorConfig

logger = logging.getLogger(__name__)


class ResponseCurveDataGenerator(SyntheticDataGenerator):
    """
    Generates synthetic data for response curve modeling.

    Simulates spend-response relationships with:
    - Various curve types (Hill, exponential, logarithmic)
    - Saturation effects
    - Noise and measurement error
    - Multiple channels with different response characteristics
    """

    CURVE_TYPES = ['hill', 'exponential', 'logarithmic', 'linear', 's_curve']

    def __init__(
        self,
        config: Optional[GeneratorConfig] = None,
        curve_type: str = 'hill',
        channels: Optional[List[str]] = None,
        include_time_effects: bool = True,
    ):
        super().__init__(config)
        self.curve_type = curve_type
        self.channels = channels or ['overall']
        self.include_time_effects = include_time_effects

        # Initialize curve parameters
        self._curve_params = self._initialize_curve_params()

    def _initialize_curve_params(self) -> Dict[str, Dict[str, float]]:
        """Initialize curve parameters for each channel."""
        params = {}

        for channel in self.channels:
            if self.curve_type == 'hill':
                params[channel] = {
                    'Vmax': self._rng.uniform(800, 1200),  # Maximum response
                    'K': self._rng.uniform(30000, 70000),   # Half-saturation constant
                    'n': self._rng.uniform(1.5, 3.0),       # Hill coefficient
                }
            elif self.curve_type == 'exponential':
                params[channel] = {
                    'a': self._rng.uniform(0.8, 1.2),       # Scale
                    'b': self._rng.uniform(0.00002, 0.00005),  # Decay rate
                    'c': self._rng.uniform(0.2, 0.4),       # Asymptote ratio
                }
            elif self.curve_type == 'logarithmic':
                params[channel] = {
                    'a': self._rng.uniform(80, 120),        # Scale
                    'b': self._rng.uniform(0.8, 1.2),       # Multiplier
                }
            elif self.curve_type == 's_curve':
                params[channel] = {
                    'L': self._rng.uniform(900, 1100),      # Maximum
                    'k': self._rng.uniform(0.00003, 0.00007),  # Steepness
                    'x0': self._rng.uniform(40000, 60000),  # Midpoint
                }
            else:  # linear
                params[channel] = {
                    'slope': self._rng.uniform(0.008, 0.015),
                    'intercept': self._rng.uniform(50, 150),
                }

        return params

    def generate(self) -> pd.DataFrame:
        """Generate synthetic response curve data."""
        logger.info(f"Generating {self.config.n_samples} response curve samples")

        # Generate dates if time effects included
        if self.include_time_effects:
            dates = self._generate_dates(freq='D')
            data = {
                'date': dates,
                'record_id': self._generate_ids('RC'),
            }
        else:
            data = {
                'record_id': self._generate_ids('RC'),
            }

        # Generate spend and response for each channel
        for channel in self.channels:
            spend = self._generate_spend(channel)
            response = self._calculate_response(spend, channel)

            data[f'{channel}_spend'] = spend
            data[f'{channel}_response'] = response

        # Create DataFrame
        df = pd.DataFrame(data)

        # Add time effects if enabled
        if self.include_time_effects:
            df = self._add_time_effects(df)

        # Calculate aggregate metrics
        if len(self.channels) > 1:
            spend_cols = [f'{ch}_spend' for ch in self.channels]
            response_cols = [f'{ch}_response' for ch in self.channels]

            df['total_spend'] = df[spend_cols].sum(axis=1)
            df['total_response'] = df[response_cols].sum(axis=1)
        else:
            df['total_spend'] = df[f'{self.channels[0]}_spend']
            df['total_response'] = df[f'{self.channels[0]}_response']

        # Calculate efficiency metrics
        df['marginal_response'] = self._calculate_marginal_response(df)
        df['response_per_spend'] = df['total_response'] / np.maximum(df['total_spend'], 1)

        # Add noise to response
        for channel in self.channels:
            col = f'{channel}_response'
            df[col] = self._add_noise(df[col].values, scale=self.config.noise_level)
            df[col] = np.maximum(df[col], 0)

        df['total_response'] = self._add_noise(df['total_response'].values, scale=self.config.noise_level)
        df['total_response'] = np.maximum(df['total_response'], 0)

        # Register features
        self._register_features()

        logger.info(f"Generated {len(df)} records with {self.curve_type} response curve")
        return df

    def _generate_spend(self, channel: str) -> np.ndarray:
        """Generate spend values covering the full response curve."""
        n = self.config.n_samples
        params = self._curve_params[channel]

        # Generate spend that covers the interesting part of the curve
        if self.curve_type == 'hill':
            # Focus around K (half-saturation)
            k = params['K']
            min_spend = k * 0.05
            max_spend = k * 4
        elif self.curve_type == 's_curve':
            # Focus around x0 (midpoint)
            x0 = params['x0']
            min_spend = x0 * 0.1
            max_spend = x0 * 3
        else:
            min_spend = 1000
            max_spend = 200000

        # Generate spend with varied distribution
        # Mix of uniform and log-uniform for good coverage
        n_uniform = n // 2
        n_log = n - n_uniform

        uniform_spend = self._rng.uniform(min_spend, max_spend, n_uniform)
        log_spend = np.exp(self._rng.uniform(np.log(min_spend), np.log(max_spend), n_log))

        spend = np.concatenate([uniform_spend, log_spend])
        self._rng.shuffle(spend)

        return spend

    def _calculate_response(self, spend: np.ndarray, channel: str) -> np.ndarray:
        """Calculate response based on curve type."""
        params = self._curve_params[channel]

        if self.curve_type == 'hill':
            return self._hill_function(spend, params['Vmax'], params['K'], params['n'])
        elif self.curve_type == 'exponential':
            return self._exponential_function(spend, params['a'], params['b'], params['c'])
        elif self.curve_type == 'logarithmic':
            return self._logarithmic_function(spend, params['a'], params['b'])
        elif self.curve_type == 's_curve':
            return self._s_curve_function(spend, params['L'], params['k'], params['x0'])
        else:  # linear
            return self._linear_function(spend, params['slope'], params['intercept'])

    def _hill_function(
        self,
        x: np.ndarray,
        Vmax: float,
        K: float,
        n: float,
    ) -> np.ndarray:
        """Hill function: Vmax * x^n / (K^n + x^n)"""
        return Vmax * np.power(x, n) / (np.power(K, n) + np.power(x, n))

    def _exponential_function(
        self,
        x: np.ndarray,
        a: float,
        b: float,
        c: float,
    ) -> np.ndarray:
        """Exponential saturation: a * (1 - c * exp(-b * x))"""
        max_response = 1000  # Scale factor
        return max_response * a * (1 - c * np.exp(-b * x))

    def _logarithmic_function(
        self,
        x: np.ndarray,
        a: float,
        b: float,
    ) -> np.ndarray:
        """Logarithmic: a * log(1 + b * x)"""
        return a * np.log1p(b * x)

    def _s_curve_function(
        self,
        x: np.ndarray,
        L: float,
        k: float,
        x0: float,
    ) -> np.ndarray:
        """Logistic S-curve: L / (1 + exp(-k * (x - x0)))"""
        return L / (1 + np.exp(-k * (x - x0)))

    def _linear_function(
        self,
        x: np.ndarray,
        slope: float,
        intercept: float,
    ) -> np.ndarray:
        """Linear: slope * x + intercept"""
        return slope * x + intercept

    def _add_time_effects(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add time-based effects to response."""
        if 'date' not in df.columns:
            return df

        dates = pd.to_datetime(df['date'])

        # Weekly seasonality
        day_of_week = dates.dt.dayofweek
        weekly_effect = 1 + 0.1 * np.sin(2 * np.pi * day_of_week / 7)

        # Monthly seasonality
        day_of_month = dates.dt.day
        monthly_effect = 1 + 0.05 * np.sin(2 * np.pi * day_of_month / 30)

        # Apply to responses
        for channel in self.channels:
            col = f'{channel}_response'
            df[col] = df[col] * weekly_effect * monthly_effect

        df['weekly_effect'] = weekly_effect
        df['monthly_effect'] = monthly_effect

        return df

    def _calculate_marginal_response(self, df: pd.DataFrame) -> np.ndarray:
        """Calculate marginal response (derivative approximation)."""
        spend = df['total_spend'].values
        response = df['total_response'].values

        # Sort by spend for derivative calculation
        sort_idx = np.argsort(spend)
        sorted_spend = spend[sort_idx]
        sorted_response = response[sort_idx]

        # Calculate numerical derivative
        marginal = np.zeros_like(spend)
        marginal[sort_idx[1:-1]] = (
            (sorted_response[2:] - sorted_response[:-2]) /
            (sorted_spend[2:] - sorted_spend[:-2] + 1e-10)
        )

        # Handle edges
        marginal[sort_idx[0]] = marginal[sort_idx[1]]
        marginal[sort_idx[-1]] = marginal[sort_idx[-2]]

        return np.maximum(marginal, 0)

    def generate_with_true_params(self) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Generate data and return true curve parameters."""
        df = self.generate()

        true_params = {
            'curve_type': self.curve_type,
            'channels': self._curve_params.copy(),
        }

        return df, true_params

    def generate_optimization_grid(
        self,
        channel: str,
        n_points: int = 100,
    ) -> pd.DataFrame:
        """Generate a grid of spend values for optimization analysis."""
        params = self._curve_params.get(channel, list(self._curve_params.values())[0])

        if self.curve_type == 'hill':
            max_spend = params['K'] * 5
        elif self.curve_type == 's_curve':
            max_spend = params['x0'] * 4
        else:
            max_spend = 200000

        spend_grid = np.linspace(0, max_spend, n_points)
        response_grid = self._calculate_response(spend_grid, channel)

        # Calculate marginal response
        marginal = np.zeros_like(spend_grid)
        marginal[1:] = np.diff(response_grid) / np.diff(spend_grid)
        marginal[0] = marginal[1]

        # Calculate ROI
        roi = response_grid / np.maximum(spend_grid, 1)

        # Find optimal points
        optimal_marginal_idx = np.argmax(marginal)
        optimal_roi_idx = np.argmax(roi)

        return pd.DataFrame({
            'spend': spend_grid,
            'response': response_grid,
            'marginal_response': marginal,
            'roi': roi,
            'is_optimal_marginal': np.arange(n_points) == optimal_marginal_idx,
            'is_optimal_roi': np.arange(n_points) == optimal_roi_idx,
        })

    def fit_and_validate(
        self,
        df: pd.DataFrame,
        channel: str = 'overall',
    ) -> Dict[str, Any]:
        """Fit curve to data and validate against true parameters."""
        from scipy.optimize import curve_fit

        spend_col = f'{channel}_spend' if f'{channel}_spend' in df.columns else 'total_spend'
        response_col = f'{channel}_response' if f'{channel}_response' in df.columns else 'total_response'

        x = df[spend_col].values
        y = df[response_col].values

        try:
            if self.curve_type == 'hill':
                popt, _ = curve_fit(
                    lambda x, Vmax, K, n: Vmax * np.power(x, n) / (np.power(K, n) + np.power(x, n)),
                    x, y,
                    p0=[1000, 50000, 2],
                    bounds=([0, 0, 0.5], [np.inf, np.inf, 5]),
                    maxfev=10000,
                )
                fitted_params = {'Vmax': popt[0], 'K': popt[1], 'n': popt[2]}
            else:
                fitted_params = {}

            # Calculate fit metrics
            y_pred = self._calculate_response(x, channel)
            ss_res = np.sum((y - y_pred) ** 2)
            ss_tot = np.sum((y - np.mean(y)) ** 2)
            r_squared = 1 - ss_res / ss_tot

            return {
                'fitted_params': fitted_params,
                'true_params': self._curve_params.get(channel, {}),
                'r_squared': r_squared,
                'rmse': np.sqrt(np.mean((y - y_pred) ** 2)),
            }

        except Exception as e:
            logger.warning(f"Curve fitting failed: {e}")
            return {'error': str(e)}

    def _register_features(self) -> None:
        """Register all feature metadata."""
        self._register_feature('record_id', 'id', 'Unique record identifier')
        self._register_feature('total_spend', 'numeric', 'Total spend')
        self._register_feature('total_response', 'numeric', 'Total response (target)')
        self._register_feature('marginal_response', 'numeric', 'Marginal response')
        self._register_feature('response_per_spend', 'numeric', 'Response efficiency')

        for channel in self.channels:
            self._register_feature(f'{channel}_spend', 'numeric', f'{channel.title()} spend')
            self._register_feature(f'{channel}_response', 'numeric', f'{channel.title()} response')
