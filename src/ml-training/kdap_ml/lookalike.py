"""
Lookalike Model Trainer
AUD Agent - Lookalike Audience Modeling with Ensemble Similarity
"""

import logging
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, ClassifierMixin
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler

from kdap_ml.base import BaseTrainer
from kdap_ml.preprocessing import DataPreprocessor

logger = logging.getLogger(__name__)


class LookalikeModel(BaseEstimator, ClassifierMixin):
    """
    Ensemble Lookalike Model combining KNN, Random Forest, and Gradient Boosting.
    """
    
    def __init__(
        self,
        n_neighbors: int = 50,
        n_estimators_rf: int = 100,
        n_estimators_gb: int = 500,
        weights: Dict[str, float] = None,
        random_seed: int = 42,
    ):
        self.n_neighbors = n_neighbors
        self.n_estimators_rf = n_estimators_rf
        self.n_estimators_gb = n_estimators_gb
        self.weights = weights or {'knn': 0.25, 'rf': 0.25, 'gb': 0.50}
        self.random_seed = random_seed
        
        self.knn_: Optional[NearestNeighbors] = None
        self.rf_: Optional[RandomForestClassifier] = None
        self.gb_: Optional[GradientBoostingClassifier] = None
        self.scaler_: Optional[StandardScaler] = None
        self.seed_features_: Optional[np.ndarray] = None
        self.feature_names_: List[str] = []
        self.calibrator_: Optional[CalibratedClassifierCV] = None
    
    def fit(
        self,
        X: pd.DataFrame,
        y: np.ndarray,
    ) -> 'LookalikeModel':
        """
        Fit the ensemble lookalike model.
        
        Args:
            X: Features for all customers
            y: Binary labels (1 = seed audience, 0 = non-seed)
        """
        self.feature_names_ = list(X.columns)
        
        # Scale features
        self.scaler_ = StandardScaler()
        X_scaled = self.scaler_.fit_transform(X)
        
        # Store seed customer features for KNN
        seed_mask = y == 1
        self.seed_features_ = X_scaled[seed_mask]
        
        # Fit KNN on seed customers
        self.knn_ = NearestNeighbors(
            n_neighbors=min(self.n_neighbors, len(self.seed_features_)),
            metric='cosine',
            algorithm='brute',
        )
        self.knn_.fit(self.seed_features_)
        
        # Fit Random Forest
        self.rf_ = RandomForestClassifier(
            n_estimators=self.n_estimators_rf,
            max_depth=10,
            random_state=self.random_seed,
            n_jobs=-1,
        )
        self.rf_.fit(X_scaled, y)
        
        # Fit Gradient Boosting
        self.gb_ = GradientBoostingClassifier(
            n_estimators=self.n_estimators_gb,
            max_depth=6,
            learning_rate=0.05,
            random_state=self.random_seed,
        )
        self.gb_.fit(X_scaled, y)
        
        # Calibrate the ensemble
        self._calibrate_ensemble(X_scaled, y)
        
        logger.info(f"Lookalike model fitted on {seed_mask.sum()} seed customers")
        return self
    
    def _calibrate_ensemble(self, X: np.ndarray, y: np.ndarray) -> None:
        """Calibrate ensemble probabilities using isotonic regression."""
        # Create a wrapper for ensemble prediction
        class EnsembleWrapper(BaseEstimator, ClassifierMixin):
            def __init__(self, parent):
                self.parent = parent
                self.classes_ = np.array([0, 1])
            
            def fit(self, X, y):
                return self
            
            def predict_proba(self, X):
                return self.parent._raw_predict_proba(X)
        
        wrapper = EnsembleWrapper(self)
        self.calibrator_ = CalibratedClassifierCV(wrapper, method='isotonic', cv='prefit')
        self.calibrator_.fit(X, y)
    
    def _raw_predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Get raw ensemble probabilities before calibration."""
        # KNN similarity scores
        distances, _ = self.knn_.kneighbors(X)
        knn_scores = 1 - np.mean(distances, axis=1)  # Convert distance to similarity
        knn_scores = (knn_scores - knn_scores.min()) / (knn_scores.max() - knn_scores.min() + 1e-10)
        
        # RF probabilities
        rf_proba = self.rf_.predict_proba(X)[:, 1]
        
        # GB probabilities
        gb_proba = self.gb_.predict_proba(X)[:, 1]
        
        # Weighted ensemble
        ensemble_proba = (
            self.weights['knn'] * knn_scores +
            self.weights['rf'] * rf_proba +
            self.weights['gb'] * gb_proba
        )
        
        return np.column_stack([1 - ensemble_proba, ensemble_proba])
    
    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """Get calibrated probabilities."""
        X_scaled = self.scaler_.transform(X)
        
        if self.calibrator_ is not None:
            return self.calibrator_.predict_proba(X_scaled)
        else:
            return self._raw_predict_proba(X_scaled)
    
    def predict(self, X: pd.DataFrame, threshold: float = 0.5) -> np.ndarray:
        """Predict lookalike membership."""
        proba = self.predict_proba(X)[:, 1]
        return (proba >= threshold).astype(int)
    
    def get_feature_importance(self) -> pd.DataFrame:
        """Get aggregated feature importance."""
        rf_importance = self.rf_.feature_importances_
        gb_importance = self.gb_.feature_importances_
        
        # Weighted average
        combined = (
            self.weights['rf'] * rf_importance +
            self.weights['gb'] * gb_importance
        ) / (self.weights['rf'] + self.weights['gb'])
        
        return pd.DataFrame({
            'feature': self.feature_names_,
            'importance': combined,
            'rf_importance': rf_importance,
            'gb_importance': gb_importance,
        }).sort_values('importance', ascending=False)


class LookalikeTrainer(BaseTrainer):
    """
    Trainer for Lookalike Audience Model.
    """
    
    def __init__(
        self,
        config_dir: Optional[str] = None,
        experiment_name: Optional[str] = None,
    ):
        super().__init__(
            model_name='lookalike',
            config_dir=config_dir,
            experiment_name=experiment_name,
        )
        self.expansion_tiers: Dict[str, Dict] = {}
    
    def _create_model(self, **kwargs) -> BaseEstimator:
        """Create lookalike model."""
        weights = self.config.get('ensemble', {}).get('weights', {})
        weight_dict = {
            'knn': weights.get('knn', 0.25),
            'rf': weights.get('random_forest', 0.25),
            'gb': weights.get('gradient_boosting', 0.50),
        }
        
        default_params = {
            'n_neighbors': self.config.get('algorithms', {}).get('knn', {}).get('n_neighbors', 50),
            'n_estimators_rf': self.config.get('algorithms', {}).get('random_forest_similarity', {}).get('n_estimators', 100),
            'n_estimators_gb': self.config.get('algorithms', {}).get('gradient_boosting', {}).get('n_estimators', 500),
            'weights': weight_dict,
            'random_seed': 42,
        }
        default_params.update(kwargs)
        
        return LookalikeModel(**default_params)
    
    def _get_hyperparameter_space(self) -> Dict[str, Any]:
        """Get hyperparameter search space."""
        return {
            'n_neighbors': {'type': 'int', 'low': 20, 'high': 100},
            'n_estimators_rf': {'type': 'int', 'low': 50, 'high': 200},
            'n_estimators_gb': {'type': 'int', 'low': 200, 'high': 1000},
        }
    
    def prepare_seed_data(
        self,
        df: pd.DataFrame,
        seed_ids: List[str],
        id_col: str = 'customer_id',
        negative_ratio: int = 3,
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, pd.Series]:
        """
        Prepare training data from seed audience.
        
        Args:
            df: Full customer dataset
            seed_ids: List of customer IDs in seed audience
            id_col: Column name for customer ID
            negative_ratio: Ratio of negative to positive samples
            
        Returns:
            Train/val/test splits
        """
        # Mark seed customers
        df = df.copy()
        df['is_seed'] = df[id_col].isin(seed_ids).astype(int)
        
        seed_count = df['is_seed'].sum()
        logger.info(f"Seed audience size: {seed_count}")
        
        # Sample negatives
        positive_df = df[df['is_seed'] == 1]
        negative_pool = df[df['is_seed'] == 0]
        
        n_negatives = min(len(negative_pool), seed_count * negative_ratio)
        negative_df = negative_pool.sample(n=n_negatives, random_state=42)
        
        # Combine
        training_df = pd.concat([positive_df, negative_df]).sample(frac=1, random_state=42)
        
        # Get features
        feature_cols = self._get_feature_columns(df)
        self.feature_names = feature_cols
        
        # Split
        from sklearn.model_selection import train_test_split
        
        X = training_df[feature_cols]
        y = training_df['is_seed']
        
        X_temp, X_test, y_temp, y_test = train_test_split(
            X, y, test_size=0.2, stratify=y, random_state=42
        )
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp, test_size=0.15, stratify=y_temp, random_state=42
        )
        
        logger.info(f"Data split: train={len(X_train)}, val={len(X_val)}, test={len(X_test)}")
        
        # Store full dataset for scoring
        self._full_df = df
        self._id_col = id_col
        self._feature_cols = feature_cols
        
        return X_train, X_val, X_test, y_train, y_val, y_test
    
    def _get_feature_columns(self, df: pd.DataFrame) -> List[str]:
        """Get feature columns from config."""
        config_features = self.config.get('features', {})
        
        all_features = []
        for category in ['demographic', 'behavioral', 'engagement', 'transactional', 'derived']:
            all_features.extend(config_features.get(category, []))
        
        return [col for col in all_features if col in df.columns]
    
    def evaluate(
        self,
        X_test: pd.DataFrame,
        y_test: pd.Series,
    ) -> Dict[str, float]:
        """Evaluate lookalike model."""
        if self.model is None:
            raise ValueError("Model not trained.")
        
        y_proba = self.model.predict_proba(X_test)[:, 1]
        y_pred = self.model.predict(X_test)
        
        self.metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, zero_division=0),
            'recall': recall_score(y_test, y_pred, zero_division=0),
            'f1': f1_score(y_test, y_pred, zero_division=0),
            'auc_roc': roc_auc_score(y_test, y_proba),
            'auc_pr': average_precision_score(y_test, y_proba),
        }
        
        # Calculate lift at k
        for k in [100, 500, 1000, 5000]:
            if len(y_test) >= k:
                sorted_idx = np.argsort(y_proba)[::-1][:k]
                lift = y_test.iloc[sorted_idx].mean() / y_test.mean()
                self.metrics[f'lift_at_{k}'] = lift
        
        logger.info(f"Evaluation metrics: {self.metrics}")
        return self.metrics
    
    def find_lookalikes(
        self,
        df: Optional[pd.DataFrame] = None,
        max_expansion: int = 10,
    ) -> pd.DataFrame:
        """
        Find lookalike customers with tier assignments.
        
        Args:
            df: Customer data to score (or use stored full dataset)
            max_expansion: Maximum expansion factor (lookalikes / seed)
            
        Returns:
            DataFrame with similarity scores and tiers
        """
        if self.model is None:
            raise ValueError("Model not trained.")
        
        if df is None:
            df = self._full_df
        
        X = df[self._feature_cols]
        customer_ids = df[self._id_col]
        
        # Get similarity scores
        similarity_scores = self.model.predict_proba(X)[:, 1]
        
        # Build results
        results = pd.DataFrame({
            'customer_id': customer_ids.values,
            'similarity_score': similarity_scores,
        })
        
        # Assign tiers based on percentiles
        expansion_tiers = self.config.get('expansion_tiers', {})
        
        def assign_tier(score, percentile):
            for tier_name, tier_config in expansion_tiers.items():
                if percentile >= tier_config.get('percentile', 0):
                    return tier_name.replace('_', ' ').title()
            return 'Not Qualified'
        
        percentiles = results['similarity_score'].rank(pct=True) * 100
        results['percentile_rank'] = percentiles
        results['expansion_tier'] = [assign_tier(s, p) for s, p in zip(similarity_scores, percentiles)]
        
        # Calculate match probability based on tier
        def get_match_probability(tier):
            tier_key = tier.lower().replace(' ', '_')
            return expansion_tiers.get(tier_key, {}).get('expected_match_rate', 0.0)
        
        results['match_probability'] = results['expansion_tier'].apply(get_match_probability)
        
        # Sort by similarity
        results = results.sort_values('similarity_score', ascending=False)
        
        # Limit expansion
        seed_count = (df[self._id_col].isin(self._full_df[self._full_df['is_seed'] == 1][self._id_col])).sum()
        max_lookalikes = seed_count * max_expansion
        
        qualified = results[results['expansion_tier'] != 'Not Qualified'].head(max_lookalikes)
        
        logger.info(f"Found {len(qualified)} lookalikes (expansion factor: {len(qualified)/seed_count:.1f}x)")
        
        return qualified
    
    def get_feature_importance(self) -> pd.DataFrame:
        """Get feature importance from model."""
        if self.model is None:
            raise ValueError("Model not trained.")
        return self.model.get_feature_importance()


def generate_synthetic_data(n_customers: int = 100000, seed_rate: float = 0.01) -> Tuple[pd.DataFrame, List[str]]:
    """Generate synthetic customer data with seed audience."""
    np.random.seed(42)
    
    customer_ids = [f'CUST_{i:06d}' for i in range(n_customers)]
    
    data = {
        'customer_id': customer_ids,
        # Demographics
        'age_bucket': np.random.choice(['18-24', '25-34', '35-44', '45-54', '55+'], n_customers),
        'income_bucket': np.random.choice(['low', 'medium', 'high', 'very_high'], n_customers, p=[0.3, 0.4, 0.2, 0.1]),
        # Behavioral
        'purchase_frequency': np.random.poisson(lam=5, size=n_customers),
        'avg_order_value': np.random.exponential(scale=100, size=n_customers),
        'recency_score': np.random.uniform(0, 100, n_customers),
        'frequency_score': np.random.uniform(0, 100, n_customers),
        'monetary_score': np.random.uniform(0, 100, n_customers),
        # Engagement
        'email_engagement_score': np.random.beta(2, 5, n_customers) * 100,
        'web_engagement_score': np.random.beta(2, 5, n_customers) * 100,
        'app_engagement_score': np.random.beta(1, 3, n_customers) * 100,
        # Derived
        'clv_predicted': np.random.exponential(scale=500, size=n_customers),
        'propensity_score': np.random.beta(2, 8, n_customers),
        'loyalty_index': np.random.uniform(0, 100, n_customers),
    }
    
    df = pd.DataFrame(data)
    
    # Create seed audience (high-value customers)
    seed_score = (
        df['clv_predicted'] / df['clv_predicted'].max() * 0.3 +
        df['loyalty_index'] / 100 * 0.2 +
        df['purchase_frequency'] / df['purchase_frequency'].max() * 0.2 +
        df['email_engagement_score'] / 100 * 0.15 +
        df['propensity_score'] * 0.15
    )
    
    seed_threshold = np.percentile(seed_score, 100 - seed_rate * 100)
    seed_mask = seed_score >= seed_threshold
    seed_ids = df.loc[seed_mask, 'customer_id'].tolist()
    
    return df, seed_ids


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    
    # Generate synthetic data
    df, seed_ids = generate_synthetic_data(n_customers=100000, seed_rate=0.01)
    print(f"Total customers: {len(df)}, Seed size: {len(seed_ids)}")
    
    # Initialize trainer
    trainer = LookalikeTrainer()
    
    # Prepare data
    X_train, X_val, X_test, y_train, y_val, y_test = trainer.prepare_seed_data(
        df, seed_ids, id_col='customer_id', negative_ratio=3
    )
    
    # Train model
    trainer.train(X_train, y_train)
    
    # Evaluate
    metrics = trainer.evaluate(X_test, y_test)
    print(f"\nMetrics: {metrics}")
    
    # Feature importance
    importance = trainer.get_feature_importance()
    print(f"\nTop 10 features:\n{importance.head(10)}")
    
    # Find lookalikes
    lookalikes = trainer.find_lookalikes(max_expansion=10)
    print(f"\nLookalike distribution by tier:")
    print(lookalikes['expansion_tier'].value_counts())
    
    # Save model
    trainer.save_model('./models')
