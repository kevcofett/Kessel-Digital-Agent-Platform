"""
Propensity Scoring Model Trainer
AUD Agent - Customer Conversion/Engagement Propensity
"""

import logging
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
import shap
import xgboost as xgb
from sklearn.base import BaseEstimator
from sklearn.calibration import CalibratedClassifierCV
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


class PropensityTrainer(BaseTrainer):
    """
    Trainer for Propensity Scoring model.
    Uses XGBoost for binary classification with probability calibration.
    """
    
    def __init__(
        self,
        config_dir: Optional[str] = None,
        experiment_name: Optional[str] = None,
    ):
        super().__init__(
            model_name='propensity',
            config_dir=config_dir,
            experiment_name=experiment_name,
        )
        self.calibrated_model: Optional[CalibratedClassifierCV] = None
        self.explainer: Optional[shap.TreeExplainer] = None
        self.optimal_threshold: float = 0.5
    
    def _create_model(self, **kwargs) -> BaseEstimator:
        """Create XGBoost classifier model."""
        default_params = {
            'objective': 'binary:logistic',
            'eval_metric': 'auc',
            'n_estimators': 1000,
            'max_depth': 6,
            'learning_rate': 0.05,
            'random_state': 42,
            'n_jobs': -1,
            'tree_method': 'hist',
        }
        default_params.update(kwargs)
        
        return xgb.XGBClassifier(**default_params)
    
    def _get_hyperparameter_space(self) -> Dict[str, Any]:
        """Get Optuna hyperparameter search space."""
        return self.config.get('tuning', {}).get('search_space', {
            'max_depth': {'type': 'int', 'low': 3, 'high': 12},
            'learning_rate': {'type': 'float', 'low': 0.01, 'high': 0.3, 'log': True},
            'n_estimators': {'type': 'int', 'low': 100, 'high': 2000},
            'min_child_weight': {'type': 'int', 'low': 1, 'high': 10},
            'subsample': {'type': 'float', 'low': 0.5, 'high': 1.0},
            'colsample_bytree': {'type': 'float', 'low': 0.5, 'high': 1.0},
            'gamma': {'type': 'float', 'low': 0.0, 'high': 5.0},
            'reg_alpha': {'type': 'float', 'low': 0.0001, 'high': 10.0, 'log': True},
            'reg_lambda': {'type': 'float', 'low': 0.0001, 'high': 10.0, 'log': True},
        })
    
    def _get_fit_params(
        self,
        X_val: pd.DataFrame,
        y_val: pd.Series,
    ) -> Dict[str, Any]:
        """Get fit parameters for early stopping."""
        early_stopping = self.config.get('training', {}).get('early_stopping_rounds', 50)
        return {
            'eval_set': [(X_val, y_val)],
            'verbose': False,
        }
    
    def calibrate_probabilities(
        self,
        X_cal: pd.DataFrame,
        y_cal: pd.Series,
        method: str = 'isotonic',
    ) -> None:
        """
        Calibrate model probabilities for better reliability.
        
        Args:
            X_cal: Calibration features (usually validation set)
            y_cal: Calibration target
            method: Calibration method ('isotonic' or 'sigmoid')
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        logger.info(f"Calibrating probabilities using {method} method...")
        
        self.calibrated_model = CalibratedClassifierCV(
            self.model,
            method=method,
            cv='prefit',
        )
        self.calibrated_model.fit(X_cal, y_cal)
        
        logger.info("Probability calibration complete")
    
    def find_optimal_threshold(
        self,
        X: pd.DataFrame,
        y: pd.Series,
        method: str = 'f1_optimal',
    ) -> float:
        """
        Find optimal classification threshold.
        
        Args:
            X: Features
            y: True labels
            method: Method for finding threshold
                - 'f1_optimal': Maximize F1 score
                - 'precision_recall_balance': Balance precision and recall
                - 'custom': Use value from config
                
        Returns:
            Optimal threshold
        """
        model = self.calibrated_model if self.calibrated_model else self.model
        y_proba = model.predict_proba(X)[:, 1]
        
        if method == 'custom':
            self.optimal_threshold = self.config.get('evaluation', {}).get('custom_threshold', 0.5)
        elif method in ['f1_optimal', 'precision_recall_balance']:
            precision, recall, thresholds = precision_recall_curve(y, y_proba)
            
            if method == 'f1_optimal':
                f1_scores = 2 * (precision * recall) / (precision + recall + 1e-10)
                best_idx = np.argmax(f1_scores)
            else:
                # Find where precision equals recall
                diff = np.abs(precision[:-1] - recall[:-1])
                best_idx = np.argmin(diff)
            
            self.optimal_threshold = thresholds[best_idx]
        else:
            self.optimal_threshold = 0.5
        
        logger.info(f"Optimal threshold: {self.optimal_threshold:.4f}")
        return self.optimal_threshold
    
    def evaluate(
        self,
        X_test: pd.DataFrame,
        y_test: pd.Series,
    ) -> Dict[str, float]:
        """
        Evaluate model on test data.
        
        Args:
            X_test: Test features
            y_test: Test target
            
        Returns:
            Dictionary of evaluation metrics
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        model = self.calibrated_model if self.calibrated_model else self.model
        
        y_proba = model.predict_proba(X_test)[:, 1]
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
        
        # Print classification report
        logger.info(f"\nClassification Report:\n{classification_report(y_test, y_pred)}")
        
        # Check against thresholds
        thresholds = self.config.get('evaluation', {}).get('threshold_metrics', {})
        for metric_name, threshold in thresholds.items():
            if metric_name in self.metrics:
                passed = self.metrics[metric_name] >= threshold
                status = "PASSED" if passed else "FAILED"
                logger.info(f"Threshold check {metric_name}: {self.metrics[metric_name]:.4f} vs {threshold} - {status}")
        
        return self.metrics
    
    def get_feature_importance(self) -> pd.DataFrame:
        """Get feature importance from trained model."""
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        importance = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.model.feature_importances_,
        }).sort_values('importance', ascending=False)
        
        return importance
    
    def explain_predictions(
        self,
        X: pd.DataFrame,
        max_samples: int = 100,
    ) -> Dict[str, Any]:
        """
        Generate SHAP explanations for predictions.
        
        Args:
            X: Features to explain
            max_samples: Maximum number of samples for SHAP
            
        Returns:
            Dictionary with SHAP values and explanations
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        if self.explainer is None:
            self.explainer = shap.TreeExplainer(self.model)
        
        if len(X) > max_samples:
            X_sample = X.sample(n=max_samples, random_state=42)
        else:
            X_sample = X
        
        shap_values = self.explainer.shap_values(X_sample)
        
        # For binary classification, take positive class SHAP values
        if isinstance(shap_values, list):
            shap_values = shap_values[1]
        
        mean_shap = np.abs(shap_values).mean(axis=0)
        feature_importance = pd.DataFrame({
            'feature': self.feature_names,
            'mean_shap': mean_shap,
        }).sort_values('mean_shap', ascending=False)
        
        return {
            'shap_values': shap_values,
            'expected_value': self.explainer.expected_value,
            'feature_importance': feature_importance,
        }
    
    def score_customers(
        self,
        X: pd.DataFrame,
        include_explanations: bool = False,
    ) -> pd.DataFrame:
        """
        Score customers with propensity scores and segments.
        
        Args:
            X: Customer features
            include_explanations: Whether to include top feature explanations
            
        Returns:
            DataFrame with scores and assignments
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        model = self.calibrated_model if self.calibrated_model else self.model
        
        if self.preprocessor is not None:
            X_processed = pd.DataFrame(
                self.preprocessor.transform(X),
                columns=self.feature_names
            )
        else:
            X_processed = X
        
        y_proba = model.predict_proba(X_processed)[:, 1]
        
        # Calculate percentile ranks
        percentile_ranks = pd.Series(y_proba).rank(pct=True) * 100
        
        # Assign segments
        def assign_segment(score):
            if score >= 0.8:
                return 'High Propensity'
            elif score >= 0.5:
                return 'Medium Propensity'
            elif score >= 0.2:
                return 'Low Propensity'
            else:
                return 'Very Low Propensity'
        
        results = pd.DataFrame({
            'propensity_score': y_proba,
            'confidence': np.where(y_proba > 0.5, y_proba, 1 - y_proba),
            'percentile_rank': percentile_ranks,
            'segment_assignment': [assign_segment(s) for s in y_proba],
        })
        
        # Add top feature explanations if requested
        if include_explanations:
            explanations = self.explain_predictions(X_processed)
            shap_values = explanations['shap_values']
            
            top_features = []
            for i in range(len(X_processed)):
                feature_impacts = list(zip(self.feature_names, shap_values[i]))
                feature_impacts.sort(key=lambda x: abs(x[1]), reverse=True)
                top_3 = feature_impacts[:3]
                top_features.append([
                    {'feature': f, 'importance': float(imp)}
                    for f, imp in top_3
                ])
            
            results['top_features'] = top_features
        
        return results


def generate_synthetic_data(n_samples: int = 50000) -> pd.DataFrame:
    """
    Generate synthetic customer data for propensity scoring.
    """
    np.random.seed(42)
    
    data = {
        'customer_id': [f'CUST_{i:06d}' for i in range(n_samples)],
        'recency_days': np.random.exponential(scale=30, size=n_samples).astype(int),
        'frequency_count': np.random.poisson(lam=5, size=n_samples),
        'monetary_value': np.random.exponential(scale=200, size=n_samples),
        'tenure_months': np.random.exponential(scale=24, size=n_samples).astype(int),
        'engagement_score': np.random.beta(2, 5, n_samples) * 100,
        'page_views_30d': np.random.poisson(lam=20, size=n_samples),
        'session_duration_avg': np.random.exponential(scale=5, size=n_samples),
        'email_open_rate': np.random.beta(2, 8, n_samples),
        'email_click_rate': np.random.beta(1, 20, n_samples),
        'purchase_count_lifetime': np.random.poisson(lam=3, size=n_samples),
        'avg_order_value': np.random.exponential(scale=75, size=n_samples),
        'days_since_last_purchase': np.random.exponential(scale=60, size=n_samples).astype(int),
        'support_tickets_count': np.random.poisson(lam=1, size=n_samples),
        'nps_score': np.random.normal(7, 2, n_samples).clip(0, 10),
        'customer_segment': np.random.choice(['new', 'active', 'loyal', 'at_risk', 'churned'], n_samples, p=[0.2, 0.3, 0.25, 0.15, 0.1]),
        'acquisition_channel': np.random.choice(['organic', 'paid_search', 'social', 'referral', 'email'], n_samples),
        'preferred_channel': np.random.choice(['web', 'mobile', 'app', 'email'], n_samples),
        'geo_region': np.random.choice(['northeast', 'southeast', 'midwest', 'southwest', 'west'], n_samples),
        'device_type': np.random.choice(['desktop', 'mobile', 'tablet'], n_samples, p=[0.4, 0.5, 0.1]),
    }
    
    df = pd.DataFrame(data)
    
    # Generate target based on features
    conversion_prob = (
        0.1 +
        0.15 * (1 - df['recency_days'] / df['recency_days'].max()) +
        0.1 * df['frequency_count'] / 10 +
        0.1 * df['engagement_score'] / 100 +
        0.1 * df['email_open_rate'] +
        0.05 * df['email_click_rate'] * 10 +
        0.1 * (df['customer_segment'] == 'loyal').astype(float) +
        np.random.normal(0, 0.05, n_samples)
    ).clip(0.01, 0.99)
    
    df['converted'] = (np.random.random(n_samples) < conversion_prob).astype(int)
    
    return df


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    
    # Generate synthetic data
    df = generate_synthetic_data(n_samples=50000)
    df = df.drop(columns=['customer_id'])
    
    # Initialize trainer
    trainer = PropensityTrainer()
    
    # Prepare data
    X_train, X_val, X_test, y_train, y_val, y_test = trainer.prepare_data(
        df, target_col='converted'
    )
    
    # Train model
    trainer.train(X_train, y_train, X_val, y_val)
    
    # Calibrate probabilities
    trainer.calibrate_probabilities(X_val, y_val)
    
    # Find optimal threshold
    trainer.find_optimal_threshold(X_val, y_val)
    
    # Evaluate
    metrics = trainer.evaluate(X_test, y_test)
    print(f"\nMetrics: {metrics}")
    
    # Feature importance
    importance = trainer.get_feature_importance()
    print(f"\nTop 10 features:\n{importance.head(10)}")
    
    # Score sample customers
    sample_scores = trainer.score_customers(X_test.head(10))
    print(f"\nSample scores:\n{sample_scores}")
    
    # Save model
    trainer.save_model('./models')
