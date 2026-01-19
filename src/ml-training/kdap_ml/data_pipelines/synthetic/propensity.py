"""
Propensity Scoring Synthetic Data Generator
Generates realistic customer propensity data for purchase prediction
"""

import logging
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd

from .generator import SyntheticDataGenerator, GeneratorConfig

logger = logging.getLogger(__name__)


class PropensityDataGenerator(SyntheticDataGenerator):
    """
    Generates synthetic data for propensity scoring models.

    Simulates customer data with realistic:
    - RFM (Recency, Frequency, Monetary) features
    - Engagement metrics
    - Demographic segments
    - Purchase propensity signals
    """

    SEGMENTS = ['high_value', 'growth', 'at_risk', 'dormant', 'new']
    CHANNELS = ['email', 'web', 'mobile', 'store', 'call_center']
    PRODUCT_CATEGORIES = ['electronics', 'apparel', 'home', 'beauty', 'sports', 'grocery']

    def __init__(
        self,
        config: Optional[GeneratorConfig] = None,
        base_conversion_rate: float = 0.05,
        include_engagement: bool = True,
        include_campaign_data: bool = True,
    ):
        super().__init__(config)
        self.base_conversion_rate = base_conversion_rate
        self.include_engagement = include_engagement
        self.include_campaign_data = include_campaign_data

    def generate(self) -> pd.DataFrame:
        """Generate synthetic propensity scoring data."""
        logger.info(f"Generating {self.config.n_samples} propensity scoring samples")

        # Customer identifiers
        data = {
            'customer_id': self._generate_ids('CUST'),
            'snapshot_date': self._generate_dates(freq='D'),
        }

        # RFM Features
        data.update(self._generate_rfm_features())

        # Demographic features
        data.update(self._generate_demographic_features())

        # Engagement features
        if self.include_engagement:
            data.update(self._generate_engagement_features())

        # Campaign features
        if self.include_campaign_data:
            data.update(self._generate_campaign_features())

        # Create DataFrame
        df = pd.DataFrame(data)

        # Calculate derived features
        df['avg_order_value'] = df['monetary_value'] / np.maximum(df['frequency'], 1)
        df['customer_lifetime_days'] = (
            pd.Timestamp.now() - pd.to_datetime(df['first_purchase_date'])
        ).dt.days
        df['purchase_rate'] = df['frequency'] / np.maximum(df['customer_lifetime_days'], 1) * 30

        # Generate segment labels
        df['segment'] = self._assign_segments(df)

        # Generate propensity score (target)
        df['propensity_score'] = self._generate_propensity_scores(df)
        df['will_purchase'] = (self._rng.random(len(df)) < df['propensity_score']).astype(int)

        # Add noise
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            if col not in ['will_purchase'] and 'rate' not in col and 'score' not in col:
                df[col] = self._add_noise(df[col].values, scale=self.config.noise_level * 0.3)
                df[col] = np.maximum(df[col], 0)

        # Register features
        self._register_features()

        logger.info(f"Generated {len(df)} records with conversion rate: {df['will_purchase'].mean():.2%}")
        return df

    def _generate_rfm_features(self) -> Dict[str, np.ndarray]:
        """Generate Recency, Frequency, Monetary features."""
        n = self.config.n_samples

        # Recency (days since last purchase) - exponential distribution
        recency = self._rng.exponential(45, n)
        recency = np.clip(recency, 1, 365).astype(int)

        # Frequency (number of purchases in last year) - negative binomial
        frequency = self._rng.negative_binomial(3, 0.4, n)
        frequency = np.clip(frequency, 0, 50)

        # Monetary value (total spend in last year) - lognormal
        monetary = self._rng.lognormal(5, 1.2, n)
        monetary = np.clip(monetary, 0, 50000)

        # Correlated with frequency
        monetary = monetary * (1 + 0.1 * frequency)

        # First purchase date
        days_as_customer = self._rng.exponential(365, n)
        days_as_customer = np.clip(days_as_customer, recency, 1825)  # Max 5 years
        first_purchase_date = pd.Timestamp.now() - pd.to_timedelta(days_as_customer, unit='D')

        return {
            'recency_days': recency,
            'frequency': frequency,
            'monetary_value': np.round(monetary, 2),
            'first_purchase_date': first_purchase_date,
        }

    def _generate_demographic_features(self) -> Dict[str, np.ndarray]:
        """Generate demographic features."""
        n = self.config.n_samples

        # Age distribution
        age = self._rng.normal(42, 15, n)
        age = np.clip(age, 18, 85).astype(int)

        # Income bracket
        income_brackets = ['<30k', '30k-50k', '50k-75k', '75k-100k', '100k-150k', '>150k']
        income_weights = [0.15, 0.20, 0.25, 0.20, 0.12, 0.08]
        income_bracket = self._generate_categories(income_brackets, income_weights)

        # Location tier
        location_tiers = ['tier1_metro', 'tier2_city', 'tier3_town', 'rural']
        location_weights = [0.30, 0.35, 0.25, 0.10]
        location_tier = self._generate_categories(location_tiers, location_weights)

        return {
            'age': age,
            'income_bracket': income_bracket,
            'location_tier': location_tier,
        }

    def _generate_engagement_features(self) -> Dict[str, np.ndarray]:
        """Generate engagement features."""
        n = self.config.n_samples

        # Website visits (last 30 days)
        web_visits = self._rng.poisson(8, n)

        # App opens (last 30 days)
        app_opens = self._rng.poisson(12, n)

        # Email opens (last 30 days)
        emails_received = self._rng.poisson(6, n)
        email_open_rate = self._rng.beta(3, 7, n)
        emails_opened = (emails_received * email_open_rate).astype(int)

        # Email clicks
        email_click_rate = email_open_rate * self._rng.beta(2, 8, n)
        emails_clicked = (emails_received * email_click_rate).astype(int)

        # Time on site (minutes, last 30 days)
        time_on_site = self._rng.exponential(30, n) * (1 + 0.5 * web_visits / 10)
        time_on_site = np.clip(time_on_site, 0, 500)

        # Pages viewed
        pages_viewed = web_visits * self._rng.poisson(5, n)

        # Cart abandonment
        carts_created = self._rng.poisson(2, n)
        cart_abandonment_rate = self._rng.beta(6, 4, n)

        # Wishlist items
        wishlist_items = self._rng.poisson(3, n)

        return {
            'web_visits_30d': web_visits,
            'app_opens_30d': app_opens,
            'emails_opened_30d': emails_opened,
            'emails_clicked_30d': emails_clicked,
            'time_on_site_30d': np.round(time_on_site, 1),
            'pages_viewed_30d': pages_viewed,
            'carts_created_30d': carts_created,
            'cart_abandonment_rate': np.round(cart_abandonment_rate, 3),
            'wishlist_items': wishlist_items,
        }

    def _generate_campaign_features(self) -> Dict[str, np.ndarray]:
        """Generate campaign exposure features."""
        n = self.config.n_samples

        # Campaigns received (last 90 days)
        campaigns_received = self._rng.poisson(5, n)

        # Campaign responses
        response_rate = self._rng.beta(2, 8, n)
        campaigns_responded = (campaigns_received * response_rate).astype(int)

        # Last campaign type
        campaign_types = ['email', 'push', 'sms', 'retargeting', 'none']
        campaign_weights = [0.35, 0.20, 0.15, 0.20, 0.10]
        last_campaign_type = self._generate_categories(campaign_types, campaign_weights)

        # Days since last campaign
        days_since_campaign = self._rng.exponential(15, n)
        days_since_campaign = np.clip(days_since_campaign, 0, 90).astype(int)

        # Offer sensitivity
        offer_sensitivity = self._rng.beta(5, 5, n)

        # Preferred channel
        preferred_channel = self._generate_categories(self.CHANNELS, [0.30, 0.25, 0.25, 0.15, 0.05])

        return {
            'campaigns_received_90d': campaigns_received,
            'campaigns_responded_90d': campaigns_responded,
            'last_campaign_type': last_campaign_type,
            'days_since_campaign': days_since_campaign,
            'offer_sensitivity': np.round(offer_sensitivity, 3),
            'preferred_channel': preferred_channel,
        }

    def _assign_segments(self, df: pd.DataFrame) -> np.ndarray:
        """Assign customer segments based on RFM."""
        segments = []

        for _, row in df.iterrows():
            recency = row['recency_days']
            frequency = row['frequency']
            monetary = row['monetary_value']
            lifetime = row['customer_lifetime_days']

            if lifetime < 90:
                segment = 'new'
            elif recency > 180 and frequency < 2:
                segment = 'dormant'
            elif recency > 90 or (frequency < 3 and monetary < 200):
                segment = 'at_risk'
            elif monetary > 1000 and frequency > 5:
                segment = 'high_value'
            else:
                segment = 'growth'

            segments.append(segment)

        return np.array(segments)

    def _generate_propensity_scores(self, df: pd.DataFrame) -> np.ndarray:
        """Generate propensity scores based on features."""
        n = len(df)
        propensity = np.full(n, self.base_conversion_rate)

        # Recency effect (recent customers more likely to buy)
        recency_factor = np.exp(-df['recency_days'].values / 60)
        propensity *= (1 + recency_factor)

        # Frequency effect
        frequency_factor = np.log1p(df['frequency'].values) / 3
        propensity *= (1 + frequency_factor)

        # Monetary effect
        monetary_factor = np.log1p(df['monetary_value'].values / 500) / 3
        propensity *= (1 + monetary_factor)

        # Segment effects
        segment_multipliers = {
            'high_value': 2.5,
            'growth': 1.5,
            'new': 1.2,
            'at_risk': 0.6,
            'dormant': 0.3,
        }
        for segment, mult in segment_multipliers.items():
            mask = df['segment'] == segment
            propensity[mask] *= mult

        # Engagement effects (if present)
        if 'web_visits_30d' in df.columns:
            engagement_factor = np.log1p(df['web_visits_30d'].values) / 2
            propensity *= (1 + engagement_factor * 0.5)

        if 'wishlist_items' in df.columns:
            wishlist_factor = np.minimum(df['wishlist_items'].values / 5, 1)
            propensity *= (1 + wishlist_factor * 0.3)

        if 'cart_abandonment_rate' in df.columns:
            # Cart abandoners are actually showing intent
            cart_factor = df['cart_abandonment_rate'].values * df['carts_created_30d'].values / 5
            propensity *= (1 + cart_factor * 0.4)

        # Campaign effects (if present)
        if 'campaigns_responded_90d' in df.columns:
            response_factor = df['campaigns_responded_90d'].values / 3
            propensity *= (1 + response_factor * 0.3)

        if 'days_since_campaign' in df.columns:
            campaign_recency = np.exp(-df['days_since_campaign'].values / 14)
            propensity *= (1 + campaign_recency * 0.2)

        # Normalize to valid probability range
        propensity = np.clip(propensity, 0.001, 0.95)

        # Add some randomness
        noise = self._rng.normal(0, 0.05, n)
        propensity = np.clip(propensity + noise, 0.001, 0.95)

        return np.round(propensity, 4)

    def _register_features(self) -> None:
        """Register all feature metadata."""
        self._register_feature('customer_id', 'id', 'Unique customer identifier')
        self._register_feature('recency_days', 'numeric', 'Days since last purchase')
        self._register_feature('frequency', 'numeric', 'Number of purchases (last year)')
        self._register_feature('monetary_value', 'numeric', 'Total spend (last year)')
        self._register_feature('segment', 'categorical', 'Customer segment')
        self._register_feature('propensity_score', 'numeric', 'Predicted propensity (0-1)')
        self._register_feature('will_purchase', 'binary', 'Target: Made purchase')
