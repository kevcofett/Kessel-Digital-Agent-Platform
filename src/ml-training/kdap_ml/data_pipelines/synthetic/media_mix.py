"""
Media Mix Modeling Synthetic Data Generator
Generates realistic marketing mix data for MMM analysis
"""

import logging
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd

from .generator import SyntheticDataGenerator, GeneratorConfig

logger = logging.getLogger(__name__)


class MediaMixDataGenerator(SyntheticDataGenerator):
    """
    Generates synthetic data for Media Mix Modeling.

    Simulates realistic patterns:
    - Channel spend with adstock/carryover effects
    - Diminishing returns (saturation curves)
    - Baseline sales (organic demand)
    - Seasonality effects
    - External factors (promotions, holidays, economic)
    """

    DEFAULT_CHANNELS = ['tv', 'radio', 'print', 'digital_display', 'social', 'search', 'email']

    def __init__(
        self,
        config: Optional[GeneratorConfig] = None,
        channels: Optional[List[str]] = None,
        frequency: str = 'W',
        include_adstock: bool = True,
        include_saturation: bool = True,
        include_seasonality: bool = True,
        include_external: bool = True,
    ):
        super().__init__(config)
        self.channels = channels or self.DEFAULT_CHANNELS
        self.frequency = frequency
        self.include_adstock = include_adstock
        self.include_saturation = include_saturation
        self.include_seasonality = include_seasonality
        self.include_external = include_external

        # Initialize channel parameters
        self._channel_params = self._initialize_channel_params()

    def _initialize_channel_params(self) -> Dict[str, Dict[str, float]]:
        """Initialize channel-specific parameters."""
        params = {}

        default_params = {
            'tv': {
                'adstock_rate': 0.7,
                'saturation_k': 100000,
                'beta': 0.15,
                'avg_spend': 50000,
                'spend_std': 15000,
            },
            'radio': {
                'adstock_rate': 0.5,
                'saturation_k': 30000,
                'beta': 0.08,
                'avg_spend': 15000,
                'spend_std': 5000,
            },
            'print': {
                'adstock_rate': 0.6,
                'saturation_k': 25000,
                'beta': 0.05,
                'avg_spend': 10000,
                'spend_std': 3000,
            },
            'digital_display': {
                'adstock_rate': 0.3,
                'saturation_k': 50000,
                'beta': 0.12,
                'avg_spend': 30000,
                'spend_std': 10000,
            },
            'social': {
                'adstock_rate': 0.4,
                'saturation_k': 40000,
                'beta': 0.10,
                'avg_spend': 25000,
                'spend_std': 8000,
            },
            'search': {
                'adstock_rate': 0.2,
                'saturation_k': 60000,
                'beta': 0.18,
                'avg_spend': 35000,
                'spend_std': 12000,
            },
            'email': {
                'adstock_rate': 0.15,
                'saturation_k': 10000,
                'beta': 0.06,
                'avg_spend': 5000,
                'spend_std': 1500,
            },
        }

        for channel in self.channels:
            if channel in default_params:
                params[channel] = default_params[channel]
            else:
                # Generate random parameters for custom channels
                params[channel] = {
                    'adstock_rate': self._rng.uniform(0.2, 0.7),
                    'saturation_k': self._rng.uniform(20000, 80000),
                    'beta': self._rng.uniform(0.05, 0.15),
                    'avg_spend': self._rng.uniform(10000, 40000),
                    'spend_std': self._rng.uniform(3000, 12000),
                }

        return params

    def generate(self) -> pd.DataFrame:
        """Generate synthetic MMM data."""
        logger.info(f"Generating {self.config.n_samples} MMM samples")

        # Generate date range
        dates = pd.date_range(
            start=self.config.date_range[0],
            periods=self.config.n_samples,
            freq=self.frequency,
        )

        data = {
            'date': dates,
            'week_number': np.arange(1, self.config.n_samples + 1),
        }

        # Generate channel spend
        for channel in self.channels:
            spend = self._generate_channel_spend(channel)
            data[f'{channel}_spend'] = spend

        # Create DataFrame
        df = pd.DataFrame(data)

        # Calculate total spend
        spend_cols = [f'{ch}_spend' for ch in self.channels]
        df['total_media_spend'] = df[spend_cols].sum(axis=1)

        # Generate control variables
        df = self._add_control_variables(df)

        # Generate baseline sales (intercept)
        baseline = self._generate_baseline(df)

        # Calculate media contribution with effects
        media_contribution = np.zeros(len(df))
        for channel in self.channels:
            spend = df[f'{channel}_spend'].values
            params = self._channel_params[channel]

            # Apply adstock (carryover effect)
            if self.include_adstock:
                spend = self._apply_adstock(spend, params['adstock_rate'])

            # Apply saturation (diminishing returns)
            if self.include_saturation:
                spend = self._apply_saturation(spend, params['saturation_k'])

            # Calculate contribution
            contribution = params['beta'] * spend
            df[f'{channel}_contribution'] = contribution
            media_contribution += contribution

        # Calculate total sales
        df['sales'] = baseline + media_contribution

        # Add seasonality to sales
        if self.include_seasonality:
            df['sales'] = self._add_sales_seasonality(df['sales'].values, dates)

        # Add external factor effects
        if self.include_external:
            external_effect = self._calculate_external_effects(df)
            df['sales'] += external_effect

        # Add noise
        df['sales'] = self._add_noise(df['sales'].values, scale=self.config.noise_level)
        df['sales'] = np.maximum(df['sales'], 0)

        # Calculate derived metrics
        df['roas'] = df['sales'] / np.maximum(df['total_media_spend'], 1)
        df['media_contribution_pct'] = media_contribution / np.maximum(df['sales'], 1)

        # Register features
        self._register_features()

        logger.info(f"Generated {len(df)} records with {len(self.channels)} channels")
        return df

    def _generate_channel_spend(self, channel: str) -> np.ndarray:
        """Generate spend pattern for a channel."""
        params = self._channel_params[channel]
        n = self.config.n_samples

        # Base spend with seasonal patterns
        base_spend = self._rng.normal(
            params['avg_spend'],
            params['spend_std'],
            n
        )

        # Add autocorrelation (budget planning tends to be sticky)
        spend = np.zeros(n)
        spend[0] = base_spend[0]
        for i in range(1, n):
            spend[i] = 0.6 * spend[i - 1] + 0.4 * base_spend[i]

        # Add seasonal spending patterns
        weeks = np.arange(n)

        # Q4 increase (holiday season)
        q4_boost = 0.3 * np.maximum(0, np.sin(2 * np.pi * (weeks - 39) / 52))
        spend *= (1 + q4_boost)

        # Summer slowdown
        summer_effect = -0.15 * np.maximum(0, np.sin(2 * np.pi * (weeks - 26) / 52))
        spend *= (1 + summer_effect)

        return np.maximum(spend, params['avg_spend'] * 0.1)

    def _apply_adstock(self, spend: np.ndarray, decay_rate: float) -> np.ndarray:
        """Apply adstock transformation (carryover effect)."""
        adstocked = np.zeros_like(spend)
        adstocked[0] = spend[0]

        for i in range(1, len(spend)):
            adstocked[i] = spend[i] + decay_rate * adstocked[i - 1]

        return adstocked

    def _apply_saturation(self, spend: np.ndarray, k: float) -> np.ndarray:
        """Apply saturation transformation (Hill function)."""
        return spend / (spend + k) * k * 2

    def _generate_baseline(self, df: pd.DataFrame) -> np.ndarray:
        """Generate baseline sales (non-media driven)."""
        n = len(df)

        # Base level with trend
        base = 500000 + np.arange(n) * 500  # Slight growth trend

        # Weekly variation
        weekly_variation = self._rng.normal(0, 20000, n)

        return base + weekly_variation

    def _add_control_variables(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add control variables (non-media factors)."""
        n = len(df)

        # Price index (relative pricing)
        df['price_index'] = 100 + self._rng.normal(0, 5, n)

        # Distribution (% stores carrying product)
        df['distribution'] = np.clip(
            85 + self._rng.normal(0, 3, n) + np.arange(n) * 0.05,
            70, 100
        )

        # Competitor spend (index)
        df['competitor_spend_index'] = np.clip(
            100 + self._rng.normal(0, 15, n),
            50, 200
        )

        # Economic indicator
        df['economic_index'] = 100 + 5 * np.sin(2 * np.pi * np.arange(n) / 104)  # 2-year cycle
        df['economic_index'] += self._rng.normal(0, 2, n)

        return df

    def _add_sales_seasonality(self, sales: np.ndarray, dates: pd.DatetimeIndex) -> np.ndarray:
        """Add seasonality to sales."""
        week_of_year = dates.isocalendar().week.values

        # Annual seasonality
        annual = 0.15 * np.sin(2 * np.pi * (week_of_year - 13) / 52)

        # Holiday spikes
        holiday_weeks = [47, 48, 49, 50, 51, 52, 1, 14]  # Thanksgiving through New Year, Easter
        holiday_effect = np.zeros(len(sales))
        for hw in holiday_weeks:
            holiday_effect[week_of_year == hw] = 0.20

        return sales * (1 + annual + holiday_effect)

    def _calculate_external_effects(self, df: pd.DataFrame) -> np.ndarray:
        """Calculate effects of external/control variables."""
        n = len(df)
        effect = np.zeros(n)

        # Price sensitivity
        price_effect = -5000 * (df['price_index'].values - 100) / 100
        effect += price_effect

        # Distribution effect
        dist_effect = 3000 * (df['distribution'].values - 85) / 15
        effect += dist_effect

        # Competitor effect (negative)
        comp_effect = -2000 * (df['competitor_spend_index'].values - 100) / 100
        effect += comp_effect

        # Economic effect
        econ_effect = 10000 * (df['economic_index'].values - 100) / 10
        effect += econ_effect

        return effect

    def generate_with_true_effects(self) -> tuple:
        """Generate data and return true effect parameters for validation."""
        df = self.generate()

        true_effects = {
            'channels': {},
            'baseline_intercept': 500000,
            'trend_slope': 500,
        }

        for channel in self.channels:
            params = self._channel_params[channel]
            true_effects['channels'][channel] = {
                'beta': params['beta'],
                'adstock_rate': params['adstock_rate'],
                'saturation_k': params['saturation_k'],
            }

        return df, true_effects

    def generate_scenario_data(
        self,
        base_df: pd.DataFrame,
        budget_scenarios: List[Dict[str, float]],
    ) -> pd.DataFrame:
        """Generate scenario data for budget optimization."""
        scenarios = []

        for i, scenario in enumerate(budget_scenarios):
            scenario_df = base_df.copy()
            scenario_df['scenario_id'] = i

            # Apply budget changes
            for channel, multiplier in scenario.items():
                if f'{channel}_spend' in scenario_df.columns:
                    scenario_df[f'{channel}_spend'] *= multiplier

            # Recalculate contributions
            for channel in self.channels:
                if f'{channel}_spend' in scenario_df.columns:
                    spend = scenario_df[f'{channel}_spend'].values
                    params = self._channel_params[channel]

                    if self.include_adstock:
                        spend = self._apply_adstock(spend, params['adstock_rate'])
                    if self.include_saturation:
                        spend = self._apply_saturation(spend, params['saturation_k'])

                    scenario_df[f'{channel}_contribution'] = params['beta'] * spend

            # Recalculate total spend and sales
            spend_cols = [f'{ch}_spend' for ch in self.channels if f'{ch}_spend' in scenario_df.columns]
            scenario_df['total_media_spend'] = scenario_df[spend_cols].sum(axis=1)

            contrib_cols = [f'{ch}_contribution' for ch in self.channels if f'{ch}_contribution' in scenario_df.columns]
            scenario_df['projected_sales'] = (
                scenario_df['sales'] - scenario_df[contrib_cols].sum(axis=1) +
                scenario_df[[c for c in contrib_cols]].sum(axis=1)
            )

            scenarios.append(scenario_df)

        return pd.concat(scenarios, ignore_index=True)

    def _register_features(self) -> None:
        """Register all feature metadata."""
        self._register_feature('date', 'datetime', 'Week start date')
        self._register_feature('sales', 'numeric', 'Total sales (target)')
        self._register_feature('total_media_spend', 'numeric', 'Total media spend')
        self._register_feature('roas', 'numeric', 'Return on ad spend')
        for channel in self.channels:
            self._register_feature(f'{channel}_spend', 'numeric', f'{channel.title()} spend')
            self._register_feature(f'{channel}_contribution', 'numeric', f'{channel.title()} contribution to sales')
