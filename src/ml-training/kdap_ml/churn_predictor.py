"""
Churn Predictor Model Trainer
AUD Agent - Customer Churn Prediction with CatBoost
"""

import logging
from typing import Any, Dict, List, Optional, Tuple

import catboost as cb
import numpy as np
import pandas as pd
import shap
from sklearn.base import BaseEstimator
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    classification_report,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
)

from kdap_ml.base import BaseTrainer

logger = logging.getLogger(__name__)


class ChurnPredictorTrainer(BaseTrainer):
    """
    Trainer for Customer Churn Prediction model.
    Uses CatBoost for binary classification with native categorical handling.
    """
    
    def __init__(
        self,
        config_dir: Optional[str] = None,
        experiment_name: Optional[str] = None,
    ):
        super().__init__(
            model_name='churn_predictor',
            config_dir=config_dir,
            experiment_name=experiment_name,
        )
        self.explainer: Optional[shap.TreeExplainer] = None
        self.optimal_threshold: float = 0.5
        self.categorical_features: List[str] = []
    
    def _create_model(self, **kwargs) -> BaseEstimator:
        """Create CatBoost classifier model."""
        default_params = {
            'iterations': 1000,
            'depth': 6,
            'learning_rate': 0.05,
            'l2_leaf_reg': 3,
            'auto_class_weights': 'Balanced',
            'eval_metric': 'AUC',
            'random_seed': 42,
            'verbose': 100,
            'early_stopping_rounds': 50,
        }
        default_params.update(kwargs)
        
        return cb.CatBoostClassifier(**default_params)
    
    def _get_hyperparameter_space(self) -> Dict[str, Any]:
        """Get Optuna hyperparameter search space."""
        return self.config.get('tuning', {}).get('search_space', {
            'depth': {'type': 'int', 'low': 4, 'high': 10},
            'learning_rate': {'type': 'float', 'low': 0.01, 'high': 0.3, 'log': True},
            'iterations': {'type': 'int', 'low': 100, 'high': 2000},
            'l2_leaf_reg': {'type': 'float', 'low': 1, 'high': 10},
            'border_count': {'type': 'int', 'low': 32, 'high': 255},
            'bagging_temperature': {'type': 'float', 'low': 0, 'high': 1},
        })
    
    def _get_fit_params(
        self,
        X_val: pd.DataFrame,
        y_val: pd.Series,
    ) -> Dict[str, Any]:
        """Get fit parameters for early stopping."""
        return {
            'eval_set': (X_val, y_val),
            'cat_features': self.categorical_features,
            'verbose': 100,
        }
    
    def prepare_data(
        self,
        df: pd.DataFrame,
        target_col: Optional[str] = None,
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, pd.Series]:
        """Prepare data with categorical feature handling."""
        from kdap_ml.preprocessing import create_train_test_split
        
        target_col = target_col or self.config.get('target', {}).get('name', 'churned')
        
        # Identify categorical columns
        cat_cols = self.config.get('features', {}).get('categorical', [])
        self.categorical_features = [col for col in cat_cols if col in df.columns]
        
        # Get numerical columns
        num_cols = self.config.get('features', {}).get('numerical', [])
        self.feature_names = [col for col in num_cols + cat_cols if col in df.columns]
        
        # Split data
        training_config = self.config.get('training', {})
        X_train, X_val, X_test, y_train, y_val, y_test = create_train_test_split(
            df=df[[target_col] + self.feature_names],
            target_col=target_col,
            test_size=training_config.get('test_size', 0.2),
            validation_size=training_config.get('validation_size', 0.15),
            stratify=True,
            random_state=42,
        )
        
        # CatBoost handles preprocessing internally for categorical features
        # Just fill NaN for categoricals
        for col in self.categorical_features:
            if col in X_train.columns:
                X_train[col] = X_train[col].fillna('missing').astype(str)
                X_val[col] = X_val[col].fillna('missing').astype(str)
                X_test[col] = X_test[col].fillna('missing').astype(str)
        
        logger.info(f"Prepared data: {len(X_train)} train, {len(X_val)} val, {len(X_test)} test")
        logger.info(f"Categorical features: {self.categorical_features}")
        
        return X_train, X_val, X_test, y_train, y_val, y_test
    
    def train(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        X_val: Optional[pd.DataFrame] = None,
        y_val: Optional[pd.Series] = None,
        **kwargs,
    ) -> BaseEstimator:
        """Train the CatBoost model."""
        logger.info("Training Churn Predictor model...")
        
        hyperparams = self.config.get('hyperparameters', {}).get('catboost', {})
        hyperparams.update(kwargs)
        
        self.model = self._create_model(**hyperparams)
        
        # Get categorical feature indices
        cat_indices = [X_train.columns.get_loc(col) for col in self.categorical_features if col in X_train.columns]
        
        fit_params = {
            'cat_features': cat_indices,
            'verbose': hyperparams.get('verbose', 100),
        }
        
        if X_val is not None and y_val is not None:
            fit_params['eval_set'] = (X_val, y_val)
            fit_params['early_stopping_rounds'] = hyperparams.get('early_stopping_rounds', 50)
        
        self.model.fit(X_train, y_train, **fit_params)
        
        logger.info("Churn Predictor training complete")
        return self.model
    
    def find_optimal_threshold(
        self,
        X: pd.DataFrame,
        y: pd.Series,
        method: str = 'f1_optimal',
    ) -> float:
        """Find optimal classification threshold."""
        y_proba = self.model.predict_proba(X)[:, 1]
        
        if method == 'f1_optimal':
            precision, recall, thresholds = precision_recall_curve(y, y_proba)
            f1_scores = 2 * (precision * recall) / (precision + recall + 1e-10)
            best_idx = np.argmax(f1_scores[:-1])
            self.optimal_threshold = thresholds[best_idx]
        elif method == 'recall_target':
            target_recall = self.config.get('evaluation', {}).get('threshold_metrics', {}).get('recall', 0.75)
            precision, recall, thresholds = precision_recall_curve(y, y_proba)
            valid_idx = np.where(recall[:-1] >= target_recall)[0]
            if len(valid_idx) > 0:
                self.optimal_threshold = thresholds[valid_idx[-1]]
            else:
                self.optimal_threshold = 0.5
        else:
            self.optimal_threshold = 0.5
        
        logger.info(f"Optimal threshold: {self.optimal_threshold:.4f}")
        return self.optimal_threshold
    
    def evaluate(
        self,
        X_test: pd.DataFrame,
        y_test: pd.Series,
    ) -> Dict[str, float]:
        """Evaluate model on test data."""
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        y_proba = self.model.predict_proba(X_test)[:, 1]
        y_pred = (y_proba >= self.optimal_threshold).astype(int)
        
        self.metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, zero_division=0),
            'recall': recall_score(y_test, y_pred, zero_division=0),
            'f1': f1_score(y_test, y_pred, zero_division=0),
            'auc_roc': roc_auc_score(y_test, y_proba),
            'auc_pr': average_precision_score(y_test, y_proba),
            'optimal_threshold': self.optimal_threshold,
        }
        
        logger.info(f"Evaluation metrics: {self.metrics}")
        logger.info(f"\nClassification Report:\n{classification_report(y_test, y_pred)}")
        
        return self.metrics
    
    def get_feature_importance(self) -> pd.DataFrame:
        """Get feature importance from CatBoost model."""
        if self.model is None:
            raise ValueError("Model not trained.")
        
        importance = pd.DataFrame({
            'feature': self.model.feature_names_,
            'importance': self.model.feature_importances_,
        }).sort_values('importance', ascending=False)
        
        return importance
    
    def predict_churn_risk(
        self,
        X: pd.DataFrame,
        include_factors: bool = True,
    ) -> pd.DataFrame:
        """
        Predict churn risk with tier assignment.
        
        Args:
            X: Customer features
            include_factors: Include top risk factors in output
            
        Returns:
            DataFrame with churn predictions and risk tiers
        """
        if self.model is None:
            raise ValueError("Model not trained.")
        
        # Fill categorical NaN
        X_copy = X.copy()
        for col in self.categorical_features:
            if col in X_copy.columns:
                X_copy[col] = X_copy[col].fillna('missing').astype(str)
        
        y_proba = self.model.predict_proba(X_copy)[:, 1]
        
        # Assign risk tiers
        risk_tiers = self.config.get('risk_tiers', {})
        
        def assign_tier(prob):
            if prob >= risk_tiers.get('high_risk', {}).get('threshold', 0.7):
                return 'High Risk'
            elif prob >= risk_tiers.get('medium_risk', {}).get('threshold', 0.4):
                return 'Medium Risk'
            elif prob >= risk_tiers.get('low_risk', {}).get('threshold', 0.2):
                return 'Low Risk'
            else:
                return 'Minimal Risk'
        
        def get_action(tier):
            tier_key = tier.lower().replace(' ', '_')
            return risk_tiers.get(tier_key, {}).get('action', 'monitor')
        
        results = pd.DataFrame({
            'churn_probability': y_proba,
            'risk_tier': [assign_tier(p) for p in y_proba],
            'recommended_action': [get_action(assign_tier(p)) for p in y_proba],
            'confidence': np.where(y_proba > 0.5, y_proba, 1 - y_proba),
        })
        
        # Add top risk factors if requested
        if include_factors:
            if self.explainer is None:
                self.explainer = shap.TreeExplainer(self.model)
            
            shap_values = self.explainer.shap_values(X_copy)
            if isinstance(shap_values, list):
                shap_values = shap_values[1]
            
            top_factors = []
            for i in range(len(X_copy)):
                feature_impacts = list(zip(self.model.feature_names_, shap_values[i]))
                # Sort by absolute impact, keep sign for direction
                feature_impacts.sort(key=lambda x: abs(x[1]), reverse=True)
                top_3 = [
                    {'factor': f, 'impact': 'increases' if imp > 0 else 'decreases', 'strength': abs(imp)}
                    for f, imp in feature_impacts[:3]
                ]
                top_factors.append(top_3)
            
            results['top_risk_factors'] = top_factors
        
        return results


def generate_synthetic_data(n_samples: int = 50000, churn_rate: float = 0.15) -> pd.DataFrame:
    """Generate synthetic customer data for churn prediction."""
    np.random.seed(42)
    
    data = {
        'customer_id': [f'CUST_{i:06d}' for i in range(n_samples)],
        'days_since_last_purchase': np.random.exponential(scale=30, size=n_samples).astype(int),
        'days_since_last_login': np.random.exponential(scale=14, size=n_samples).astype(int),
        'purchase_frequency_30d': np.random.poisson(lam=2, size=n_samples),
        'purchase_frequency_90d': np.random.poisson(lam=5, size=n_samples),
        'total_spend_lifetime': np.random.exponential(scale=500, size=n_samples),
        'total_spend_90d': np.random.exponential(scale=150, size=n_samples),
        'avg_order_value': np.random.exponential(scale=75, size=n_samples),
        'order_count_lifetime': np.random.poisson(lam=8, size=n_samples),
        'support_tickets_count': np.random.poisson(lam=1, size=n_samples),
        'support_tickets_resolved': np.random.poisson(lam=1, size=n_samples),
        'nps_score': np.random.normal(7, 2, n_samples).clip(0, 10),
        'email_open_rate_30d': np.random.beta(2, 5, n_samples),
        'email_click_rate_30d': np.random.beta(1, 10, n_samples),
        'app_sessions_30d': np.random.poisson(lam=10, size=n_samples),
        'page_views_30d': np.random.poisson(lam=30, size=n_samples),
        'tenure_months': np.random.exponential(scale=18, size=n_samples).astype(int),
        'customer_segment': np.random.choice(['new', 'active', 'loyal', 'at_risk'], n_samples, p=[0.25, 0.35, 0.25, 0.15]),
        'acquisition_channel': np.random.choice(['organic', 'paid', 'referral', 'social'], n_samples),
        'subscription_tier': np.random.choice(['free', 'basic', 'premium', 'enterprise'], n_samples, p=[0.4, 0.3, 0.2, 0.1]),
    }
    
    df = pd.DataFrame(data)
    
    # Generate churn based on features
    churn_prob = (
        0.05 +
        0.2 * (df['days_since_last_purchase'] / 100).clip(0, 1) +
        0.15 * (df['days_since_last_login'] / 50).clip(0, 1) +
        0.1 * (1 - df['purchase_frequency_30d'] / 5).clip(0, 1) +
        0.1 * (1 - df['nps_score'] / 10) +
        0.1 * (df['support_tickets_count'] / 5).clip(0, 1) +
        0.1 * (df['customer_segment'] == 'at_risk').astype(float) +
        np.random.normal(0, 0.05, n_samples)
    ).clip(0.01, 0.99)
    
    df['churned'] = (np.random.random(n_samples) < churn_prob).astype(int)
    
    # Adjust to target churn rate
    actual_rate = df['churned'].mean()
    if actual_rate > churn_rate:
        flip_count = int((actual_rate - churn_rate) * n_samples)
        churned_idx = df[df['churned'] == 1].index
        flip_idx = np.random.choice(churned_idx, flip_count, replace=False)
        df.loc[flip_idx, 'churned'] = 0
    
    return df


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    
    # Generate synthetic data
    df = generate_synthetic_data(n_samples=50000)
    df = df.drop(columns=['customer_id'])
    
    # Initialize trainer
    trainer = ChurnPredictorTrainer()
    
    # Prepare data
    X_train, X_val, X_test, y_train, y_val, y_test = trainer.prepare_data(df, target_col='churned')
    
    # Train model
    trainer.train(X_train, y_train, X_val, y_val)
    
    # Find optimal threshold
    trainer.find_optimal_threshold(X_val, y_val)
    
    # Evaluate
    metrics = trainer.evaluate(X_test, y_test)
    print(f"\nMetrics: {metrics}")
    
    # Feature importance
    importance = trainer.get_feature_importance()
    print(f"\nTop 10 features:\n{importance.head(10)}")
    
    # Predict churn risk
    risk_predictions = trainer.predict_churn_risk(X_test.head(10))
    print(f"\nSample predictions:\n{risk_predictions[['churn_probability', 'risk_tier', 'recommended_action']]}")
    
    # Save model
    trainer.save_model('./models')
