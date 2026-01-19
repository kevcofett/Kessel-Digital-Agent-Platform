"""
Lookalike Audience Synthetic Data Generator
Generates realistic customer data for lookalike modeling
"""

import logging
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

from .generator import SyntheticDataGenerator, GeneratorConfig

logger = logging.getLogger(__name__)


class LookalikeDataGenerator(SyntheticDataGenerator):
    """
    Generates synthetic data for lookalike audience modeling.

    Simulates customer data with:
    - Behavioral features that define high-value customers
    - Demographic features
    - Engagement patterns
    - Clear separation between seed and prospect audiences
    """

    DEMOGRAPHIC_FEATURES = ['age', 'income_bracket', 'location_tier', 'household_size']
    BEHAVIORAL_FEATURES = ['purchase_frequency', 'avg_order_value', 'category_breadth',
                           'days_since_last_purchase', 'return_rate']
    ENGAGEMENT_FEATURES = ['email_engagement', 'app_engagement', 'web_engagement',
                           'social_engagement', 'loyalty_program_member']

    def __init__(
        self,
        config: Optional[GeneratorConfig] = None,
        seed_rate: float = 0.02,
        n_latent_factors: int = 5,
        include_behavioral: bool = True,
        include_engagement: bool = True,
    ):
        super().__init__(config)
        self.seed_rate = seed_rate
        self.n_latent_factors = n_latent_factors
        self.include_behavioral = include_behavioral
        self.include_engagement = include_engagement

        # Generate latent factor weights for seed profile
        self._seed_profile = self._generate_seed_profile()

    def _generate_seed_profile(self) -> Dict[str, float]:
        """Generate the ideal seed customer profile."""
        profile = {}

        # Demographic preferences
        profile['age_center'] = 35 + self._rng.normal(0, 5)
        profile['income_preference'] = self._rng.uniform(0.6, 0.9)  # Prefer higher income
        profile['urban_preference'] = self._rng.uniform(0.5, 0.8)

        # Behavioral preferences
        profile['purchase_frequency_threshold'] = self._rng.uniform(6, 12)  # Per year
        profile['aov_threshold'] = self._rng.uniform(100, 200)
        profile['engagement_threshold'] = self._rng.uniform(0.5, 0.8)

        return profile

    def generate(self) -> pd.DataFrame:
        """Generate synthetic lookalike modeling data."""
        logger.info(f"Generating {self.config.n_samples} lookalike modeling samples")

        # Generate customer IDs
        data = {
            'customer_id': self._generate_ids('CUST'),
        }

        # Generate latent factors that drive customer behavior
        latent_factors = self._generate_latent_factors()

        # Generate demographic features
        data.update(self._generate_demographic_features(latent_factors))

        # Generate behavioral features
        if self.include_behavioral:
            data.update(self._generate_behavioral_features(latent_factors))

        # Generate engagement features
        if self.include_engagement:
            data.update(self._generate_engagement_features(latent_factors))

        # Create DataFrame
        df = pd.DataFrame(data)

        # Calculate similarity to seed profile
        df['similarity_score'] = self._calculate_similarity(df)

        # Assign seed audience based on similarity
        df['is_seed'] = self._assign_seed_audience(df)

        # Generate actual value labels (for validation)
        df['customer_value'] = self._calculate_customer_value(df)
        df['value_segment'] = pd.cut(
            df['customer_value'],
            bins=[0, 25, 50, 75, 100],
            labels=['low', 'medium', 'high', 'top']
        )

        # Add noise to numeric columns
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            if col not in ['is_seed', 'similarity_score', 'customer_value']:
                df[col] = self._add_noise(df[col].values, scale=self.config.noise_level * 0.3)

        # Register features
        self._register_features()

        seed_count = df['is_seed'].sum()
        logger.info(f"Generated {len(df)} customers with {seed_count} in seed audience ({seed_count/len(df):.1%})")
        return df

    def _generate_latent_factors(self) -> np.ndarray:
        """Generate latent factors that drive customer behavior."""
        # Each customer has a set of latent factors
        factors = self._rng.normal(0, 1, (self.config.n_samples, self.n_latent_factors))

        # Create some correlation structure
        correlation_matrix = self._rng.uniform(-0.3, 0.3, (self.n_latent_factors, self.n_latent_factors))
        np.fill_diagonal(correlation_matrix, 1)
        correlation_matrix = (correlation_matrix + correlation_matrix.T) / 2

        # Ensure positive semi-definite
        eigenvalues, eigenvectors = np.linalg.eig(correlation_matrix)
        eigenvalues = np.maximum(eigenvalues, 0.01)
        correlation_matrix = eigenvectors @ np.diag(eigenvalues) @ eigenvectors.T

        L = np.linalg.cholesky(correlation_matrix)
        factors = factors @ L.T

        return factors

    def _generate_demographic_features(self, latent_factors: np.ndarray) -> Dict[str, np.ndarray]:
        """Generate demographic features influenced by latent factors."""
        n = self.config.n_samples

        # Age (influenced by factor 0)
        age_base = 35 + 15 * latent_factors[:, 0]
        age = np.clip(age_base, 18, 80).astype(int)

        # Income bracket (influenced by factor 1)
        income_score = latent_factors[:, 1] if self.n_latent_factors > 1 else self._rng.normal(0, 1, n)
        income_brackets = ['<30k', '30k-50k', '50k-75k', '75k-100k', '100k-150k', '>150k']
        income_thresholds = [-1.5, -0.5, 0, 0.5, 1.0]
        income_indices = np.digitize(income_score, income_thresholds)
        income_bracket = np.array([income_brackets[i] for i in income_indices])

        # Location tier (influenced by factor 2)
        location_score = latent_factors[:, 2] if self.n_latent_factors > 2 else self._rng.normal(0, 1, n)
        location_tiers = ['tier1_metro', 'tier2_city', 'tier3_town', 'rural']
        location_thresholds = [-0.5, 0.3, 1.0]
        location_indices = np.digitize(location_score, location_thresholds)
        location_tier = np.array([location_tiers[min(i, 3)] for i in location_indices])

        # Household size
        household_base = 2.5 + 0.5 * latent_factors[:, 0] + self._rng.exponential(0.8, n)
        household_size = np.clip(household_base, 1, 7).astype(int)

        return {
            'age': age,
            'income_bracket': income_bracket,
            'location_tier': location_tier,
            'household_size': household_size,
        }

    def _generate_behavioral_features(self, latent_factors: np.ndarray) -> Dict[str, np.ndarray]:
        """Generate behavioral features."""
        n = self.config.n_samples

        # Value factor (combination of latent factors)
        value_factor = (
            0.4 * latent_factors[:, 0] +
            0.3 * latent_factors[:, 1] +
            0.3 * (latent_factors[:, 2] if self.n_latent_factors > 2 else 0)
        )

        # Purchase frequency (purchases per year)
        purchase_freq = np.exp(1.5 + 0.5 * value_factor + self._rng.normal(0, 0.3, n))
        purchase_frequency = np.clip(purchase_freq, 0, 52)

        # Average order value
        aov_base = np.exp(4.0 + 0.4 * value_factor + self._rng.normal(0, 0.4, n))
        avg_order_value = np.clip(aov_base, 10, 1000)

        # Category breadth (number of categories purchased)
        breadth_prob = 1 / (1 + np.exp(-value_factor))
        category_breadth = self._rng.binomial(10, breadth_prob)

        # Days since last purchase (lower is better)
        recency_factor = -0.3 * value_factor + self._rng.exponential(1, n)
        days_since_last = np.exp(3 + recency_factor)
        days_since_last_purchase = np.clip(days_since_last, 1, 365).astype(int)

        # Return rate (lower is better for most businesses)
        return_rate = np.clip(0.1 - 0.03 * value_factor + self._rng.normal(0, 0.05, n), 0, 0.5)

        return {
            'purchase_frequency': np.round(purchase_frequency, 1),
            'avg_order_value': np.round(avg_order_value, 2),
            'category_breadth': category_breadth,
            'days_since_last_purchase': days_since_last_purchase,
            'return_rate': np.round(return_rate, 3),
        }

    def _generate_engagement_features(self, latent_factors: np.ndarray) -> Dict[str, np.ndarray]:
        """Generate engagement features."""
        n = self.config.n_samples

        # Engagement factor
        engagement_factor = (
            0.5 * latent_factors[:, 0] +
            0.5 * (latent_factors[:, 3] if self.n_latent_factors > 3 else self._rng.normal(0, 1, n))
        )

        # Email engagement (0-1 scale)
        email_base = 1 / (1 + np.exp(-engagement_factor - 0.5))
        email_engagement = np.clip(email_base + self._rng.normal(0, 0.1, n), 0, 1)

        # App engagement
        app_base = 1 / (1 + np.exp(-engagement_factor))
        app_engagement = np.clip(app_base + self._rng.normal(0, 0.15, n), 0, 1)

        # Web engagement
        web_base = 1 / (1 + np.exp(-engagement_factor + 0.3))
        web_engagement = np.clip(web_base + self._rng.normal(0, 0.1, n), 0, 1)

        # Social engagement
        social_base = 1 / (1 + np.exp(-engagement_factor - 0.2))
        social_engagement = np.clip(social_base + self._rng.normal(0, 0.15, n), 0, 1)

        # Loyalty program membership
        loyalty_prob = 1 / (1 + np.exp(-engagement_factor - 0.5))
        loyalty_program_member = (self._rng.random(n) < loyalty_prob).astype(int)

        return {
            'email_engagement': np.round(email_engagement, 3),
            'app_engagement': np.round(app_engagement, 3),
            'web_engagement': np.round(web_engagement, 3),
            'social_engagement': np.round(social_engagement, 3),
            'loyalty_program_member': loyalty_program_member,
        }

    def _calculate_similarity(self, df: pd.DataFrame) -> np.ndarray:
        """Calculate similarity score to seed profile."""
        n = len(df)
        scores = np.zeros(n)

        profile = self._seed_profile

        # Age similarity (Gaussian kernel)
        age_diff = np.abs(df['age'].values - profile['age_center'])
        age_score = np.exp(-age_diff ** 2 / (2 * 100))
        scores += 0.1 * age_score

        # Income similarity
        income_order = ['<30k', '30k-50k', '50k-75k', '75k-100k', '100k-150k', '>150k']
        income_numeric = df['income_bracket'].map(lambda x: income_order.index(x) / 5)
        income_score = income_numeric * profile['income_preference']
        scores += 0.15 * income_score

        # Location similarity
        location_map = {'tier1_metro': 1.0, 'tier2_city': 0.7, 'tier3_town': 0.4, 'rural': 0.2}
        location_numeric = df['location_tier'].map(location_map)
        location_score = location_numeric * profile['urban_preference']
        scores += 0.1 * location_score

        # Behavioral similarity (if present)
        if self.include_behavioral:
            freq_score = np.minimum(df['purchase_frequency'].values / profile['purchase_frequency_threshold'], 1)
            aov_score = np.minimum(df['avg_order_value'].values / profile['aov_threshold'], 1)
            recency_score = np.exp(-df['days_since_last_purchase'].values / 90)

            scores += 0.2 * freq_score
            scores += 0.15 * aov_score
            scores += 0.1 * recency_score

        # Engagement similarity (if present)
        if self.include_engagement:
            engagement_cols = ['email_engagement', 'app_engagement', 'web_engagement']
            avg_engagement = df[engagement_cols].mean(axis=1)
            engagement_score = avg_engagement / profile['engagement_threshold']
            engagement_score = np.minimum(engagement_score, 1)

            scores += 0.15 * engagement_score
            scores += 0.05 * df['loyalty_program_member'].values

        # Normalize to 0-1
        scores = (scores - scores.min()) / (scores.max() - scores.min() + 1e-10)

        return np.round(scores, 4)

    def _assign_seed_audience(self, df: pd.DataFrame) -> np.ndarray:
        """Assign seed audience based on similarity and target rate."""
        n = len(df)
        n_seed = int(n * self.seed_rate)

        # Select top N by similarity score
        seed_indices = df['similarity_score'].nlargest(n_seed).index
        is_seed = np.zeros(n, dtype=int)
        is_seed[seed_indices] = 1

        return is_seed

    def _calculate_customer_value(self, df: pd.DataFrame) -> np.ndarray:
        """Calculate customer lifetime value score (0-100)."""
        scores = np.zeros(len(df))

        if self.include_behavioral:
            # Value based on RFM-like scoring
            freq_score = np.clip(df['purchase_frequency'].values / 20, 0, 1) * 30
            aov_score = np.clip(df['avg_order_value'].values / 300, 0, 1) * 30
            recency_score = np.exp(-df['days_since_last_purchase'].values / 180) * 20
            breadth_score = df['category_breadth'].values / 10 * 10
            return_penalty = df['return_rate'].values * 10

            scores = freq_score + aov_score + recency_score + breadth_score - return_penalty
        else:
            # Simplified scoring based on demographics and similarity
            scores = df['similarity_score'].values * 100

        return np.clip(scores, 0, 100).round(2)

    def generate_with_seed_ids(self) -> Tuple[pd.DataFrame, List[str]]:
        """Generate data and return list of seed customer IDs."""
        df = self.generate()
        seed_ids = df[df['is_seed'] == 1]['customer_id'].tolist()
        return df, seed_ids

    def _register_features(self) -> None:
        """Register all feature metadata."""
        self._register_feature('customer_id', 'id', 'Unique customer identifier')
        self._register_feature('is_seed', 'binary', 'Is part of seed audience')
        self._register_feature('similarity_score', 'numeric', 'Similarity to seed profile (0-1)')
        self._register_feature('customer_value', 'numeric', 'Customer value score (0-100)')
        self._register_feature('value_segment', 'categorical', 'Value segment')

        for feat in self.DEMOGRAPHIC_FEATURES:
            dtype = 'numeric' if feat in ['age', 'household_size'] else 'categorical'
            self._register_feature(feat, dtype, f'Customer {feat.replace("_", " ")}')
