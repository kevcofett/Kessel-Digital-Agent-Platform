"""
Churn Prediction Synthetic Data Generator
Generates realistic customer churn data
"""

import logging
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd

from .generator import SyntheticDataGenerator, GeneratorConfig

logger = logging.getLogger(__name__)


class ChurnDataGenerator(SyntheticDataGenerator):
    """
    Generates synthetic data for churn prediction models.

    Simulates customer data with realistic:
    - Tenure distributions
    - Usage patterns
    - Payment behaviors
    - Churn drivers and correlations
    """

    CONTRACT_TYPES = ['month-to-month', 'one_year', 'two_year']
    PAYMENT_METHODS = ['electronic_check', 'mailed_check', 'bank_transfer', 'credit_card']
    INTERNET_SERVICES = ['DSL', 'Fiber optic', 'No']
    PHONE_SERVICES = ['Yes', 'No']

    def __init__(
        self,
        config: Optional[GeneratorConfig] = None,
        target_churn_rate: float = 0.15,
        include_behavioral: bool = True,
        include_support_data: bool = True,
    ):
        super().__init__(config)
        self.target_churn_rate = target_churn_rate
        self.include_behavioral = include_behavioral
        self.include_support_data = include_support_data

    def generate(self) -> pd.DataFrame:
        """Generate synthetic churn prediction data."""
        logger.info(f"Generating {self.config.n_samples} churn prediction samples")

        # Customer identifiers
        data = {
            'customer_id': self._generate_ids('CUST'),
        }

        # Demographic features
        data['gender'] = self._generate_categories(['Male', 'Female'], [0.5, 0.5])
        data['senior_citizen'] = self._rng.binomial(1, 0.16, self.config.n_samples)
        data['partner'] = self._generate_categories(['Yes', 'No'], [0.48, 0.52])
        data['dependents'] = self._generate_categories(['Yes', 'No'], [0.30, 0.70])

        # Tenure (months)
        data['tenure'] = self._generate_tenure()

        # Service features
        data['phone_service'] = self._generate_categories(
            self.PHONE_SERVICES, [0.9, 0.1]
        )
        data['multiple_lines'] = self._generate_multiple_lines(data['phone_service'])
        data['internet_service'] = self._generate_categories(
            self.INTERNET_SERVICES, [0.34, 0.44, 0.22]
        )

        # Internet add-ons (conditional on having internet)
        has_internet = np.array(data['internet_service']) != 'No'
        data['online_security'] = self._generate_conditional_feature(has_internet, 0.35)
        data['online_backup'] = self._generate_conditional_feature(has_internet, 0.40)
        data['device_protection'] = self._generate_conditional_feature(has_internet, 0.38)
        data['tech_support'] = self._generate_conditional_feature(has_internet, 0.32)
        data['streaming_tv'] = self._generate_conditional_feature(has_internet, 0.45)
        data['streaming_movies'] = self._generate_conditional_feature(has_internet, 0.45)

        # Contract and billing
        data['contract'] = self._generate_contract_types(data['tenure'])
        data['paperless_billing'] = self._generate_categories(['Yes', 'No'], [0.59, 0.41])
        data['payment_method'] = self._generate_categories(
            self.PAYMENT_METHODS, [0.34, 0.22, 0.22, 0.22]
        )

        # Charges
        data['monthly_charges'] = self._generate_monthly_charges(data)
        data['total_charges'] = data['monthly_charges'] * data['tenure']

        # Behavioral features
        if self.include_behavioral:
            data.update(self._generate_behavioral_features(data))

        # Support data
        if self.include_support_data:
            data.update(self._generate_support_features(data))

        # Create DataFrame
        df = pd.DataFrame(data)

        # Generate churn labels based on risk factors
        df['churn'] = self._generate_churn_labels(df)

        # Add noise to numeric columns
        numeric_cols = ['monthly_charges', 'total_charges']
        if self.include_behavioral:
            numeric_cols.extend(['login_frequency', 'usage_minutes', 'data_usage_gb'])
        if self.include_support_data:
            numeric_cols.extend(['support_tickets', 'avg_resolution_days'])

        for col in numeric_cols:
            if col in df.columns:
                df[col] = self._add_noise(df[col].values, scale=self.config.noise_level * 0.3)
                df[col] = np.maximum(df[col], 0)

        # Register features
        self._register_features()

        logger.info(f"Generated {len(df)} records with churn rate: {df['churn'].mean():.2%}")
        return df

    def _generate_tenure(self) -> np.ndarray:
        """Generate realistic tenure distribution."""
        # Mixture of new and established customers
        tenure = np.zeros(self.config.n_samples)

        # 40% new customers (0-12 months)
        n_new = int(0.4 * self.config.n_samples)
        tenure[:n_new] = self._rng.exponential(6, n_new)

        # 35% mid-tenure (12-36 months)
        n_mid = int(0.35 * self.config.n_samples)
        tenure[n_new:n_new + n_mid] = 12 + self._rng.exponential(12, n_mid)

        # 25% long-term (36+ months)
        n_long = self.config.n_samples - n_new - n_mid
        tenure[n_new + n_mid:] = 36 + self._rng.exponential(24, n_long)

        # Shuffle and clip
        self._rng.shuffle(tenure)
        return np.clip(tenure, 1, 72).astype(int)

    def _generate_multiple_lines(self, phone_service: np.ndarray) -> np.ndarray:
        """Generate multiple lines feature."""
        result = np.array(['No phone service'] * len(phone_service))
        has_phone = phone_service == 'Yes'
        n_with_phone = has_phone.sum()
        result[has_phone] = self._rng.choice(
            ['Yes', 'No'],
            size=n_with_phone,
            p=[0.42, 0.58]
        )
        return result

    def _generate_conditional_feature(
        self,
        condition: np.ndarray,
        yes_probability: float,
    ) -> np.ndarray:
        """Generate feature conditional on another feature."""
        result = np.array(['No internet service'] * len(condition))
        n_with_condition = condition.sum()
        result[condition] = self._rng.choice(
            ['Yes', 'No'],
            size=n_with_condition,
            p=[yes_probability, 1 - yes_probability]
        )
        return result

    def _generate_contract_types(self, tenure: np.ndarray) -> np.ndarray:
        """Generate contract types correlated with tenure."""
        contracts = []
        for t in tenure:
            if t <= 6:
                # New customers mostly month-to-month
                contract = self._rng.choice(
                    self.CONTRACT_TYPES,
                    p=[0.75, 0.20, 0.05]
                )
            elif t <= 24:
                # Mid-tenure more balanced
                contract = self._rng.choice(
                    self.CONTRACT_TYPES,
                    p=[0.45, 0.40, 0.15]
                )
            else:
                # Long-term customers have longer contracts
                contract = self._rng.choice(
                    self.CONTRACT_TYPES,
                    p=[0.25, 0.35, 0.40]
                )
            contracts.append(contract)
        return np.array(contracts)

    def _generate_monthly_charges(self, data: Dict[str, Any]) -> np.ndarray:
        """Generate monthly charges based on services."""
        base_charge = 20  # Base fee
        charges = np.full(self.config.n_samples, base_charge, dtype=float)

        # Phone service adds $15-25
        phone_mask = np.array(data['phone_service']) == 'Yes'
        charges[phone_mask] += self._rng.uniform(15, 25, phone_mask.sum())

        # Multiple lines adds $5-10
        multi_mask = np.array(data['multiple_lines']) == 'Yes'
        charges[multi_mask] += self._rng.uniform(5, 10, multi_mask.sum())

        # Internet service pricing
        dsl_mask = np.array(data['internet_service']) == 'DSL'
        fiber_mask = np.array(data['internet_service']) == 'Fiber optic'
        charges[dsl_mask] += self._rng.uniform(25, 35, dsl_mask.sum())
        charges[fiber_mask] += self._rng.uniform(45, 70, fiber_mask.sum())

        # Add-on services ($5-15 each)
        addons = ['online_security', 'online_backup', 'device_protection',
                  'tech_support', 'streaming_tv', 'streaming_movies']
        for addon in addons:
            addon_mask = np.array(data[addon]) == 'Yes'
            charges[addon_mask] += self._rng.uniform(5, 15, addon_mask.sum())

        return charges

    def _generate_behavioral_features(self, data: Dict[str, Any]) -> Dict[str, np.ndarray]:
        """Generate behavioral features."""
        tenure = np.array(data['tenure'])
        has_internet = np.array(data['internet_service']) != 'No'

        # Login frequency (times per month)
        login_base = 15 + self._rng.exponential(10, self.config.n_samples)
        login_base[~has_internet] = 0
        login_frequency = np.clip(login_base, 0, 60).astype(int)

        # Usage minutes
        usage_base = 500 + self._rng.exponential(300, self.config.n_samples)
        usage_minutes = np.clip(usage_base, 0, 3000)

        # Data usage (GB) - only for internet customers
        data_base = 50 + self._rng.exponential(100, self.config.n_samples)
        data_base[~has_internet] = 0
        data_usage_gb = np.clip(data_base, 0, 500)

        # Days since last activity
        days_inactive = self._rng.exponential(5, self.config.n_samples)
        days_since_last_login = np.clip(days_inactive, 0, 90).astype(int)

        return {
            'login_frequency': login_frequency,
            'usage_minutes': usage_minutes,
            'data_usage_gb': data_usage_gb,
            'days_since_last_login': days_since_last_login,
        }

    def _generate_support_features(self, data: Dict[str, Any]) -> Dict[str, np.ndarray]:
        """Generate customer support features."""
        tenure = np.array(data['tenure'])

        # Support tickets (more likely for longer tenure)
        ticket_rate = 0.3 + 0.02 * np.minimum(tenure, 24)
        support_tickets = self._rng.poisson(ticket_rate * tenure / 12)

        # Average resolution time
        avg_resolution = 2 + self._rng.exponential(3, self.config.n_samples)
        avg_resolution_days = np.clip(avg_resolution, 0.5, 30)

        # Customer satisfaction score (1-5)
        csat_base = 3.5 + self._rng.normal(0, 0.8, self.config.n_samples)
        csat_score = np.clip(csat_base, 1, 5)

        return {
            'support_tickets': support_tickets,
            'avg_resolution_days': avg_resolution_days,
            'csat_score': np.round(csat_score, 1),
        }

    def _generate_churn_labels(self, df: pd.DataFrame) -> np.ndarray:
        """Generate churn labels based on risk factors."""
        n = len(df)
        churn_probability = np.full(n, self.target_churn_rate)

        # Contract type effect (strongest predictor)
        month_to_month = df['contract'] == 'month-to-month'
        one_year = df['contract'] == 'one_year'
        churn_probability[month_to_month] *= 3.0
        churn_probability[one_year] *= 1.2

        # Tenure effect (new customers churn more)
        low_tenure = df['tenure'] <= 6
        mid_tenure = (df['tenure'] > 6) & (df['tenure'] <= 24)
        churn_probability[low_tenure] *= 1.8
        churn_probability[mid_tenure] *= 1.2

        # Payment method effect
        electronic_check = df['payment_method'] == 'electronic_check'
        churn_probability[electronic_check] *= 1.5

        # Monthly charges effect (higher = more churn)
        high_charges = df['monthly_charges'] > df['monthly_charges'].median()
        churn_probability[high_charges] *= 1.3

        # Service add-ons reduce churn
        for addon in ['online_security', 'online_backup', 'tech_support']:
            if addon in df.columns:
                has_addon = df[addon] == 'Yes'
                churn_probability[has_addon] *= 0.7

        # Behavioral signals (if present)
        if 'days_since_last_login' in df.columns:
            inactive = df['days_since_last_login'] > 30
            churn_probability[inactive] *= 2.0

        if 'login_frequency' in df.columns:
            low_engagement = df['login_frequency'] < 5
            churn_probability[low_engagement] *= 1.5

        # Support issues increase churn
        if 'support_tickets' in df.columns:
            many_tickets = df['support_tickets'] > 3
            churn_probability[many_tickets] *= 1.4

        if 'csat_score' in df.columns:
            low_csat = df['csat_score'] < 3
            churn_probability[low_csat] *= 1.6

        # Normalize probabilities
        churn_probability = np.clip(churn_probability, 0, 0.95)

        # Adjust to hit target churn rate
        current_rate = churn_probability.mean()
        adjustment = self.target_churn_rate / current_rate
        churn_probability *= adjustment
        churn_probability = np.clip(churn_probability, 0, 0.95)

        # Generate binary labels
        return (self._rng.random(n) < churn_probability).astype(int)

    def _register_features(self) -> None:
        """Register all feature metadata."""
        self._register_feature('customer_id', 'id', 'Unique customer identifier')
        self._register_feature('gender', 'categorical', 'Customer gender')
        self._register_feature('senior_citizen', 'binary', 'Is senior citizen (65+)')
        self._register_feature('tenure', 'numeric', 'Months as customer')
        self._register_feature('contract', 'categorical', 'Contract type')
        self._register_feature('monthly_charges', 'numeric', 'Monthly bill amount')
        self._register_feature('total_charges', 'numeric', 'Total amount paid')
        self._register_feature('churn', 'binary', 'Target: Did customer churn')
