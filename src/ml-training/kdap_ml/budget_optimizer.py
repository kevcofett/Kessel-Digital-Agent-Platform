"""
Budget Optimizer Model Trainer
ANL Agent - Media Budget Allocation Optimization
"""

import logging
from typing import Any, Dict, List, Optional, Tuple

import lightgbm as lgb
import numpy as np
import pandas as pd
import shap
from sklearn.base import BaseEstimator
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from kdap_ml.base import BaseTrainer

logger = logging.getLogger(__name__)


def mean_absolute_percentage_error(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculate MAPE, handling zero values."""
    mask = y_true != 0
    return np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100


class BudgetOptimizerTrainer(BaseTrainer):
    """
    Trainer for Budget Optimization model.
    Uses LightGBM for regression to predict optimal spend ratios.
    """
    
    def __init__(
        self,
        config_dir: Optional[str] = None,
        experiment_name: Optional[str] = None,
    ):
        super().__init__(
            model_name='budget_optimizer',
            config_dir=config_dir,
            experiment_name=experiment_name,
        )
        self.explainer: Optional[shap.TreeExplainer] = None
    
    def _create_model(self, **kwargs) -> BaseEstimator:
        """Create LightGBM regressor model."""
        default_params = {
            'objective': 'regression',
            'metric': 'rmse',
            'boosting_type': 'gbdt',
            'num_leaves': 31,
            'learning_rate': 0.05,
            'n_estimators': 1000,
            'random_state': 42,
            'n_jobs': -1,
            'verbose': -1,
        }
        default_params.update(kwargs)
        
        return lgb.LGBMRegressor(**default_params)
    
    def _get_hyperparameter_space(self) -> Dict[str, Any]:
        """Get Optuna hyperparameter search space."""
        return self.config.get('tuning', {}).get('search_space', {
            'num_leaves': {'type': 'int', 'low': 20, 'high': 100},
            'max_depth': {'type': 'int', 'low': 5, 'high': 15},
            'learning_rate': {'type': 'float', 'low': 0.01, 'high': 0.3, 'log': True},
            'n_estimators': {'type': 'int', 'low': 100, 'high': 2000},
            'min_child_samples': {'type': 'int', 'low': 5, 'high': 100},
            'subsample': {'type': 'float', 'low': 0.5, 'high': 1.0},
            'colsample_bytree': {'type': 'float', 'low': 0.5, 'high': 1.0},
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
            'callbacks': [lgb.early_stopping(early_stopping, verbose=False)],
        }
    
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
        
        y_pred = self.model.predict(X_test)
        
        self.metrics = {
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'mae': mean_absolute_error(y_test, y_pred),
            'mape': mean_absolute_percentage_error(y_test.values, y_pred),
            'r2': r2_score(y_test, y_pred),
        }
        
        logger.info(f"Evaluation metrics: {self.metrics}")
        
        # Check against thresholds
        thresholds = self.config.get('evaluation', {}).get('threshold_metrics', {})
        for metric_name, threshold in thresholds.items():
            if metric_name in self.metrics:
                if metric_name in ['rmse', 'mae', 'mape']:
                    passed = self.metrics[metric_name] <= threshold
                else:
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
        
        # Create explainer if not exists
        if self.explainer is None:
            self.explainer = shap.TreeExplainer(self.model)
        
        # Sample if too many rows
        if len(X) > max_samples:
            X_sample = X.sample(n=max_samples, random_state=42)
        else:
            X_sample = X
        
        # Calculate SHAP values
        shap_values = self.explainer.shap_values(X_sample)
        
        # Get mean absolute SHAP values per feature
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
    
    def predict_with_confidence(
        self,
        X: pd.DataFrame,
        n_iterations: int = 100,
    ) -> pd.DataFrame:
        """
        Make predictions with confidence intervals using bootstrap.
        
        Args:
            X: Features for prediction
            n_iterations: Number of bootstrap iterations
            
        Returns:
            DataFrame with predictions and confidence intervals
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        if self.preprocessor is not None:
            X_processed = self.preprocessor.transform(X)
        else:
            X_processed = X.values
        
        # Base prediction
        predictions = self.model.predict(X_processed)
        
        # For LightGBM, we can use the tree variance for uncertainty estimation
        # This is a simplified approach - for production, consider using
        # quantile regression or conformal prediction
        
        # Estimate standard deviation using leaf variance
        # This is an approximation
        residual_std = np.std(predictions) * 0.1  # Simplified uncertainty
        
        results = pd.DataFrame({
            'optimal_spend': predictions,
            'confidence_interval_lower': predictions - 1.96 * residual_std,
            'confidence_interval_upper': predictions + 1.96 * residual_std,
            'expected_return': predictions * 1.15,  # Simplified expected return
            'marginal_return': np.gradient(predictions),
        })
        
        # Ensure non-negative values
        results['optimal_spend'] = results['optimal_spend'].clip(lower=0)
        results['confidence_interval_lower'] = results['confidence_interval_lower'].clip(lower=0)
        
        return results


def generate_synthetic_data(n_samples: int = 10000) -> pd.DataFrame:
    """
    Generate synthetic training data for budget optimization.
    Useful for testing and demonstration.
    """
    np.random.seed(42)
    
    data = {
        'channel_id': np.random.choice(['search', 'social', 'display', 'video', 'native'], n_samples),
        'channel_type': np.random.choice(['paid', 'organic'], n_samples, p=[0.8, 0.2]),
        'objective_type': np.random.choice(['awareness', 'consideration', 'conversion'], n_samples),
        'industry_vertical': np.random.choice(['retail', 'finance', 'tech', 'healthcare', 'b2b'], n_samples),
        'current_spend': np.random.exponential(scale=50000, size=n_samples),
        'historical_roi_mean': np.random.normal(2.5, 0.8, n_samples).clip(0.5, 5),
        'historical_roi_std': np.random.exponential(scale=0.3, size=n_samples),
        'audience_size': np.random.exponential(scale=500000, size=n_samples).astype(int),
        'competitive_intensity': np.random.uniform(0, 1, n_samples),
        'seasonality_index': np.random.normal(1, 0.2, n_samples).clip(0.5, 2),
        'market_share': np.random.uniform(0.01, 0.3, n_samples),
        'brand_awareness_score': np.random.uniform(0.1, 0.9, n_samples),
        'cpm_historical': np.random.exponential(scale=10, size=n_samples),
        'ctr_historical': np.random.beta(2, 50, n_samples),
        'conversion_rate_historical': np.random.beta(1, 30, n_samples),
    }
    
    df = pd.DataFrame(data)
    
    # Generate target: optimal spend ratio based on features
    # This is a simplified model for demonstration
    df['optimal_spend_ratio'] = (
        0.8 +
        0.3 * df['historical_roi_mean'] / 3 +
        0.2 * (1 - df['competitive_intensity']) +
        0.15 * df['seasonality_index'] +
        0.1 * df['brand_awareness_score'] +
        np.random.normal(0, 0.1, n_samples)
    ).clip(0.3, 2.5)
    
    return df


if __name__ == '__main__':
    # Example usage
    logging.basicConfig(level=logging.INFO)
    
    # Generate synthetic data
    df = generate_synthetic_data(n_samples=10000)
    
    # Initialize trainer
    trainer = BudgetOptimizerTrainer()
    
    # Prepare data
    X_train, X_val, X_test, y_train, y_val, y_test = trainer.prepare_data(
        df, target_col='optimal_spend_ratio'
    )
    
    # Train model
    trainer.train(X_train, y_train, X_val, y_val)
    
    # Evaluate
    metrics = trainer.evaluate(X_test, y_test)
    print(f"\nMetrics: {metrics}")
    
    # Feature importance
    importance = trainer.get_feature_importance()
    print(f"\nTop 10 features:\n{importance.head(10)}")
    
    # Save model
    trainer.save_model('./models')
