"""
Budget Optimizer Synthetic Data Generator
Generates realistic media budget allocation data
"""

import logging
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd

from .generator import SyntheticDataGenerator, GeneratorConfig

logger = logging.getLogger(__name__)


class BudgetOptimizerDataGenerator(SyntheticDataGenerator):
    """
    Generates synthetic data for budget optimization models.

    Simulates media spend across channels with realistic:
    - Diminishing returns curves
    - Seasonality patterns
    - Channel interaction effects
    - Industry-specific baselines
    """

    CHANNELS = ['search', 'social', 'display', 'video', 'email', 'affiliate']
    INDUSTRIES = ['retail', 'finance', 'technology', 'healthcare', 'travel', 'automotive']

    def __init__(
        self,
        config: Optional[GeneratorConfig] = None,
        channels: Optional[List[str]] = None,
        include_seasonality: bool = True,
        include_interactions: bool = True,
    ):
        super().__init__(config)
        self.channels = channels or self.CHANNELS
        self.include_seasonality = include_seasonality
        self.include_interactions = include_interactions
        self._channel_params = self._initialize_channel_params()

    def _initialize_channel_params(self) -> Dict[str, Dict[str, float]]:
        """Initialize channel-specific parameters for response curves."""
        params = {}
        for i, channel in enumerate(self.channels):
            # Each channel has different efficiency and saturation characteristics
            params[channel] = {
                'base_efficiency': 0.5 + self._rng.random() * 1.5,  # 0.5 to 2.0
                'saturation_point': 50000 + self._rng.random() * 150000,  # 50k to 200k
                'decay_rate': 0.00001 + self._rng.random() * 0.00004,  # Diminishing returns
                'min_spend': 1000 + self._rng.random() * 4000,  # 1k to 5k minimum
                'max_spend': 100000 + self._rng.random() * 400000,  # 100k to 500k max
            }
        return params

    def generate(self) -> pd.DataFrame:
        """Generate synthetic budget optimization data."""
        logger.info(f"Generating {self.config.n_samples} budget optimization samples")

        data = {
            'record_id': self._generate_ids('BUDGET'),
            'date': self._generate_dates(freq='D'),
            'industry': self._generate_categories(self.INDUSTRIES),
        }

        # Generate spend for each channel
        for channel in self.channels:
            params = self._channel_params[channel]
            spend = self._generate_channel_spend(params)
            data[f'{channel}_spend'] = spend
            self._register_feature(
                f'{channel}_spend', 'numeric',
                f'Daily spend on {channel} channel',
                min_value=params['min_spend'],
                max_value=params['max_spend'],
            )

        # Calculate total spend
        spend_cols = [f'{ch}_spend' for ch in self.channels]
        df = pd.DataFrame(data)
        df['total_spend'] = df[spend_cols].sum(axis=1)

        # Calculate spend ratios
        for channel in self.channels:
            df[f'{channel}_ratio'] = df[f'{channel}_spend'] / df['total_spend']

        # Generate response metrics with diminishing returns
        df['impressions'] = self._generate_impressions(df)
        df['clicks'] = self._generate_clicks(df)
        df['conversions'] = self._generate_conversions(df)
        df['revenue'] = self._generate_revenue(df)
        df['roas'] = df['revenue'] / df['total_spend']

        # Add seasonality effects
        if self.include_seasonality:
            df = self._apply_seasonality(df)

        # Add noise
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            if col not in ['record_id']:
                df[col] = self._add_noise(df[col].values, scale=self.config.noise_level * 0.5)
                df[col] = np.maximum(df[col], 0)  # Ensure non-negative

        # Register remaining features
        self._register_feature('total_spend', 'numeric', 'Total daily media spend')
        self._register_feature('impressions', 'numeric', 'Total impressions')
        self._register_feature('clicks', 'numeric', 'Total clicks')
        self._register_feature('conversions', 'numeric', 'Total conversions')
        self._register_feature('revenue', 'numeric', 'Total revenue attributed')
        self._register_feature('roas', 'numeric', 'Return on ad spend')

        logger.info(f"Generated {len(df)} records with {len(df.columns)} features")
        return df

    def _generate_channel_spend(self, params: Dict[str, float]) -> np.ndarray:
        """Generate spend values for a channel."""
        # Use lognormal distribution for realistic spend patterns
        log_mean = np.log(params['min_spend'] + params['max_spend']) / 2
        log_std = 0.8

        spend = self._rng.lognormal(log_mean, log_std, self.config.n_samples)
        spend = np.clip(spend, params['min_spend'], params['max_spend'])

        return spend

    def _generate_impressions(self, df: pd.DataFrame) -> np.ndarray:
        """Generate impressions based on spend with channel-specific CPMs."""
        impressions = np.zeros(len(df))

        cpm_by_channel = {
            'search': 15.0,
            'social': 8.0,
            'display': 3.0,
            'video': 20.0,
            'email': 0.5,
            'affiliate': 5.0,
        }

        for channel in self.channels:
            cpm = cpm_by_channel.get(channel, 5.0)
            channel_impressions = df[f'{channel}_spend'].values / cpm * 1000
            impressions += channel_impressions

        return impressions

    def _generate_clicks(self, df: pd.DataFrame) -> np.ndarray:
        """Generate clicks based on impressions and channel CTRs."""
        clicks = np.zeros(len(df))

        ctr_by_channel = {
            'search': 0.035,
            'social': 0.012,
            'display': 0.002,
            'video': 0.008,
            'email': 0.025,
            'affiliate': 0.015,
        }

        cpm_by_channel = {
            'search': 15.0,
            'social': 8.0,
            'display': 3.0,
            'video': 20.0,
            'email': 0.5,
            'affiliate': 5.0,
        }

        for channel in self.channels:
            cpm = cpm_by_channel.get(channel, 5.0)
            ctr = ctr_by_channel.get(channel, 0.01)
            channel_impressions = df[f'{channel}_spend'].values / cpm * 1000
            channel_clicks = channel_impressions * ctr
            clicks += channel_clicks

        return clicks

    def _generate_conversions(self, df: pd.DataFrame) -> np.ndarray:
        """Generate conversions with diminishing returns."""
        conversions = np.zeros(len(df))

        cvr_by_channel = {
            'search': 0.04,
            'social': 0.015,
            'display': 0.005,
            'video': 0.008,
            'email': 0.035,
            'affiliate': 0.025,
        }

        for channel in self.channels:
            params = self._channel_params[channel]
            cvr = cvr_by_channel.get(channel, 0.01)
            spend = df[f'{channel}_spend'].values

            # Apply diminishing returns (Hill function)
            saturation = params['saturation_point']
            efficiency = params['base_efficiency']

            effective_spend = spend * efficiency * (saturation / (saturation + spend))
            channel_conversions = effective_spend * cvr / 100

            # Channel interactions boost conversions
            if self.include_interactions:
                # Social + search synergy
                if channel == 'search' and 'social' in self.channels:
                    social_ratio = df['social_spend'] / df['total_spend']
                    channel_conversions *= (1 + 0.1 * social_ratio)

            conversions += channel_conversions

        return np.maximum(conversions, 0)

    def _generate_revenue(self, df: pd.DataFrame) -> np.ndarray:
        """Generate revenue based on conversions."""
        # Average order value varies by industry
        aov_by_industry = {
            'retail': 75,
            'finance': 500,
            'technology': 150,
            'healthcare': 200,
            'travel': 350,
            'automotive': 1000,
        }

        revenue = np.zeros(len(df))
        for industry in self.INDUSTRIES:
            mask = df['industry'] == industry
            aov = aov_by_industry.get(industry, 100)
            aov_with_variance = aov * (1 + self._rng.normal(0, 0.2, mask.sum()))
            revenue[mask] = df.loc[mask, 'conversions'].values * aov_with_variance

        return revenue

    def _apply_seasonality(self, df: pd.DataFrame) -> pd.DataFrame:
        """Apply seasonality effects to metrics."""
        df = df.copy()

        # Day of week effect
        day_of_week = df['date'].dt.dayofweek
        dow_multiplier = 1 + 0.15 * np.sin(2 * np.pi * day_of_week / 7)

        # Monthly seasonality
        month = df['date'].dt.month
        monthly_multiplier = 1 + 0.2 * np.sin(2 * np.pi * (month - 3) / 12)

        # Apply to conversions and revenue
        seasonality = dow_multiplier * monthly_multiplier
        df['conversions'] *= seasonality
        df['revenue'] *= seasonality
        df['roas'] = df['revenue'] / df['total_spend']

        return df

    def generate_optimization_scenarios(
        self,
        n_scenarios: int = 100,
        budget_range: tuple = (50000, 500000),
    ) -> pd.DataFrame:
        """Generate optimization scenarios with different budget allocations."""
        scenarios = []

        for i in range(n_scenarios):
            total_budget = self._rng.uniform(*budget_range)

            # Generate random allocation
            raw_weights = self._rng.random(len(self.channels))
            weights = raw_weights / raw_weights.sum()

            scenario = {
                'scenario_id': f'SCENARIO_{i:04d}',
                'total_budget': total_budget,
            }

            for j, channel in enumerate(self.channels):
                scenario[f'{channel}_allocation'] = weights[j]
                scenario[f'{channel}_spend'] = total_budget * weights[j]

            # Simulate expected outcome
            temp_config = GeneratorConfig(n_samples=1, random_seed=self.config.random_seed + i)
            temp_gen = BudgetOptimizerDataGenerator(
                config=temp_config,
                channels=self.channels,
            )

            # Create single-row df for prediction
            single_df = pd.DataFrame([{
                'industry': self._rng.choice(self.INDUSTRIES),
                'date': pd.Timestamp.now(),
                **{f'{ch}_spend': scenario[f'{ch}_spend'] for ch in self.channels},
            }])
            single_df['total_spend'] = total_budget

            # Calculate expected metrics
            scenario['expected_conversions'] = temp_gen._generate_conversions(single_df)[0]
            scenario['expected_revenue'] = scenario['expected_conversions'] * 150  # Avg AOV
            scenario['expected_roas'] = scenario['expected_revenue'] / total_budget

            scenarios.append(scenario)

        return pd.DataFrame(scenarios)
