"""
Media Mix Model Trainer
CHA Agent - Marketing Mix Modeling with Bayesian Regression
"""

import logging
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from scipy.optimize import minimize
from sklearn.base import BaseEstimator, RegressorMixin
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler

from kdap_ml.base import BaseTrainer

logger = logging.getLogger(__name__)


def geometric_adstock(x: np.ndarray, decay: float, max_lag: int = 8) -> np.ndarray:
    """Apply geometric adstock transformation."""
    adstocked = np.zeros_like(x, dtype=float)
    for i in range(len(x)):
        for lag in range(min(i + 1, max_lag)):
            adstocked[i] += x[i - lag] * (decay ** lag)
    return adstocked


def hill_saturation(x: np.ndarray, K: float, S: float, beta: float) -> np.ndarray:
    """Apply Hill saturation function."""
    return K * (x ** beta) / (S ** beta + x ** beta)


class BayesianMMM(BaseEstimator, RegressorMixin):
    """
    Bayesian Media Mix Model using variational inference.
    Simplified implementation without PyMC for portability.
    """
    
    def __init__(
        self,
        n_iterations: int = 1000,
        learning_rate: float = 0.01,
        regularization: float = 0.1,
        adstock_decay: Dict[str, float] = None,
        random_seed: int = 42,
    ):
        self.n_iterations = n_iterations
        self.learning_rate = learning_rate
        self.regularization = regularization
        self.adstock_decay = adstock_decay or {}
        self.random_seed = random_seed
        
        self.coefficients_: Optional[np.ndarray] = None
        self.intercept_: float = 0.0
        self.feature_names_: List[str] = []
        self.scaler_: Optional[StandardScaler] = None
        self.saturation_params_: Dict[str, Dict[str, float]] = {}
        self.contribution_: Dict[str, float] = {}
    
    def _apply_adstock(self, X: pd.DataFrame) -> pd.DataFrame:
        """Apply adstock transformation to media columns."""
        X_adstock = X.copy()
        for col in X.columns:
            if col in self.adstock_decay:
                X_adstock[col] = geometric_adstock(X[col].values, self.adstock_decay[col])
        return X_adstock
    
    def _apply_saturation(self, X: pd.DataFrame) -> pd.DataFrame:
        """Apply saturation transformation."""
        X_saturated = X.copy()
        for col in X.columns:
            if col in self.saturation_params_:
                params = self.saturation_params_[col]
                X_saturated[col] = hill_saturation(
                    X[col].values,
                    params['K'],
                    params['S'],
                    params['beta']
                )
        return X_saturated
    
    def _estimate_saturation_params(self, X: pd.DataFrame, y: np.ndarray) -> None:
        """Estimate saturation parameters for each media channel."""
        for col in X.columns:
            if col in self.adstock_decay:  # Media channel
                x = X[col].values
                
                # Simple heuristic for saturation parameters
                K = y.max() * 0.5  # Max contribution ~50% of max response
                S = np.median(x[x > 0]) if np.any(x > 0) else 1.0  # Half-saturation at median spend
                beta = 0.8  # Typical diminishing returns shape
                
                self.saturation_params_[col] = {'K': K, 'S': S, 'beta': beta}
    
    def fit(self, X: pd.DataFrame, y: np.ndarray) -> 'BayesianMMM':
        """Fit the Bayesian MMM model."""
        np.random.seed(self.random_seed)
        
        self.feature_names_ = list(X.columns)
        
        # Apply adstock transformation
        X_adstock = self._apply_adstock(X)
        
        # Estimate and apply saturation
        self._estimate_saturation_params(X_adstock, y)
        X_transformed = self._apply_saturation(X_adstock)
        
        # Scale features
        self.scaler_ = StandardScaler()
        X_scaled = self.scaler_.fit_transform(X_transformed)
        
        # Initialize coefficients with small positive values (media should have positive effect)
        n_features = X_scaled.shape[1]
        self.coefficients_ = np.abs(np.random.randn(n_features) * 0.1)
        self.intercept_ = np.mean(y)
        
        # Gradient descent with L2 regularization
        for iteration in range(self.n_iterations):
            y_pred = X_scaled @ self.coefficients_ + self.intercept_
            residuals = y - y_pred
            
            # Gradients
            grad_coef = -2 * X_scaled.T @ residuals / len(y) + 2 * self.regularization * self.coefficients_
            grad_intercept = -2 * np.mean(residuals)
            
            # Update with constraints (non-negative for media)
            self.coefficients_ -= self.learning_rate * grad_coef
            self.coefficients_ = np.maximum(self.coefficients_, 0)  # Non-negative constraint
            self.intercept_ -= self.learning_rate * grad_intercept
            
            if iteration % 100 == 0:
                mse = np.mean(residuals ** 2)
                logger.debug(f"Iteration {iteration}, MSE: {mse:.4f}")
        
        # Calculate channel contributions
        self._calculate_contributions(X_scaled, y)
        
        return self
    
    def _calculate_contributions(self, X_scaled: np.ndarray, y: np.ndarray) -> None:
        """Calculate contribution of each channel."""
        total_effect = X_scaled @ self.coefficients_
        total_response = y.sum() - self.intercept_ * len(y)
        
        for i, feature in enumerate(self.feature_names_):
            channel_effect = X_scaled[:, i] * self.coefficients_[i]
            self.contribution_[feature] = {
                'absolute': channel_effect.sum(),
                'percentage': (channel_effect.sum() / (total_response + 1e-10)) * 100,
                'coefficient': self.coefficients_[i],
            }
    
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Make predictions."""
        X_adstock = self._apply_adstock(X)
        X_transformed = self._apply_saturation(X_adstock)
        X_scaled = self.scaler_.transform(X_transformed)
        return X_scaled @ self.coefficients_ + self.intercept_
    
    def get_contributions(self) -> pd.DataFrame:
        """Get channel contributions."""
        return pd.DataFrame(self.contribution_).T


class MediaMixTrainer(BaseTrainer):
    """
    Trainer for Media Mix Model.
    Uses Bayesian regression with adstock and saturation transformations.
    """
    
    def __init__(
        self,
        config_dir: Optional[str] = None,
        experiment_name: Optional[str] = None,
    ):
        super().__init__(
            model_name='media_mix',
            config_dir=config_dir,
            experiment_name=experiment_name,
        )
        self.media_channels: List[str] = []
        self.control_variables: List[str] = []
    
    def _create_model(self, **kwargs) -> BaseEstimator:
        """Create Bayesian MMM model."""
        adstock_config = self.config.get('features', {}).get('lagged_effects', {}).get('adstock_decay_rates', {})
        
        default_params = {
            'n_iterations': 1000,
            'learning_rate': 0.01,
            'regularization': 0.1,
            'adstock_decay': adstock_config,
            'random_seed': 42,
        }
        default_params.update(kwargs)
        
        return BayesianMMM(**default_params)
    
    def _get_hyperparameter_space(self) -> Dict[str, Any]:
        """Get hyperparameter search space."""
        return {
            'n_iterations': {'type': 'int', 'low': 500, 'high': 2000},
            'learning_rate': {'type': 'float', 'low': 0.001, 'high': 0.1, 'log': True},
            'regularization': {'type': 'float', 'low': 0.01, 'high': 1.0, 'log': True},
        }
    
    def prepare_data(
        self,
        df: pd.DataFrame,
        target_col: Optional[str] = None,
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, pd.Series]:
        """Prepare MMM data with temporal split."""
        target_col = target_col or self.config.get('target', {}).get('name', 'revenue')
        
        # Get feature columns
        self.media_channels = [col for col in self.config.get('features', {}).get('media_channels', []) if col in df.columns]
        self.control_variables = [col for col in self.config.get('features', {}).get('control_variables', []) if col in df.columns]
        
        feature_cols = self.media_channels + self.control_variables
        self.feature_names = feature_cols
        
        # Log transform target if configured
        y = df[target_col].copy()
        if self.config.get('target', {}).get('transformation') == 'log':
            y = np.log1p(y)
        
        X = df[feature_cols].fillna(0)
        
        # Temporal split
        n = len(df)
        train_end = int(n * 0.7)
        val_end = int(n * 0.85)
        
        X_train = X.iloc[:train_end]
        X_val = X.iloc[train_end:val_end]
        X_test = X.iloc[val_end:]
        
        y_train = y.iloc[:train_end]
        y_val = y.iloc[train_end:val_end]
        y_test = y.iloc[val_end:]
        
        logger.info(f"Prepared data: train={len(X_train)}, val={len(X_val)}, test={len(X_test)}")
        logger.info(f"Media channels: {self.media_channels}")
        logger.info(f"Control variables: {self.control_variables}")
        
        return X_train, X_val, X_test, y_train, y_val, y_test
    
    def evaluate(
        self,
        X_test: pd.DataFrame,
        y_test: pd.Series,
    ) -> Dict[str, float]:
        """Evaluate model."""
        if self.model is None:
            raise ValueError("Model not trained.")
        
        y_pred = self.model.predict(X_test)
        
        self.metrics = {
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'mae': mean_absolute_error(y_test, y_pred),
            'mape': np.mean(np.abs((y_test - y_pred) / (y_test + 1e-10))) * 100,
            'r2': r2_score(y_test, y_pred),
        }
        
        logger.info(f"Evaluation metrics: {self.metrics}")
        return self.metrics
    
    def get_channel_contributions(self) -> pd.DataFrame:
        """Get contribution of each media channel."""
        if self.model is None:
            raise ValueError("Model not trained.")
        
        contributions = self.model.get_contributions()
        
        # Add ROI calculation
        # This would need actual spend data
        return contributions
    
    def optimize_budget(
        self,
        total_budget: float,
        constraints: Optional[Dict[str, Tuple[float, float]]] = None,
    ) -> pd.DataFrame:
        """
        Optimize budget allocation across channels.
        
        Args:
            total_budget: Total budget to allocate
            constraints: Dict of {channel: (min_spend, max_spend)}
            
        Returns:
            DataFrame with optimal allocation
        """
        if self.model is None:
            raise ValueError("Model not trained.")
        
        n_channels = len(self.media_channels)
        
        # Default constraints
        if constraints is None:
            constraints = {ch: (0, total_budget * 0.5) for ch in self.media_channels}
        
        # Objective: maximize predicted response
        def objective(allocation):
            X = pd.DataFrame([dict(zip(self.media_channels, allocation))], columns=self.media_channels)
            # Add zeros for control variables
            for ctrl in self.control_variables:
                X[ctrl] = 0
            X = X[self.feature_names]
            return -self.model.predict(X)[0]  # Negative for minimization
        
        # Budget constraint
        def budget_constraint(allocation):
            return total_budget - np.sum(allocation)
        
        # Bounds
        bounds = [constraints.get(ch, (0, total_budget)) for ch in self.media_channels]
        
        # Initial allocation (equal split)
        x0 = np.full(n_channels, total_budget / n_channels)
        
        # Optimize
        result = minimize(
            objective,
            x0,
            method='SLSQP',
            bounds=bounds,
            constraints={'type': 'eq', 'fun': budget_constraint},
        )
        
        # Build results
        optimal_allocation = pd.DataFrame({
            'channel': self.media_channels,
            'optimal_spend': result.x,
            'percentage': result.x / total_budget * 100,
        })
        
        # Calculate expected response
        X_optimal = pd.DataFrame([dict(zip(self.media_channels, result.x))], columns=self.media_channels)
        for ctrl in self.control_variables:
            X_optimal[ctrl] = 0
        X_optimal = X_optimal[self.feature_names]
        expected_response = self.model.predict(X_optimal)[0]
        
        optimal_allocation['expected_contribution'] = optimal_allocation['optimal_spend'] * self.model.coefficients_[:n_channels]
        
        logger.info(f"Optimal budget allocation found. Expected response: {expected_response:.2f}")
        
        return optimal_allocation


def generate_synthetic_data(n_weeks: int = 156) -> pd.DataFrame:
    """Generate synthetic MMM data (3 years weekly)."""
    np.random.seed(42)
    
    dates = pd.date_range(start='2021-01-01', periods=n_weeks, freq='W')
    
    # Media spend
    data = {
        'date': dates,
        'tv_spend': np.random.exponential(scale=50000, size=n_weeks),
        'radio_spend': np.random.exponential(scale=10000, size=n_weeks),
        'digital_display_spend': np.random.exponential(scale=30000, size=n_weeks),
        'paid_search_spend': np.random.exponential(scale=40000, size=n_weeks),
        'paid_social_spend': np.random.exponential(scale=35000, size=n_weeks),
        'video_spend': np.random.exponential(scale=25000, size=n_weeks),
    }
    
    df = pd.DataFrame(data)
    
    # Control variables
    df['price_index'] = np.random.normal(1, 0.05, n_weeks)
    df['promotion_indicator'] = np.random.binomial(1, 0.2, n_weeks)
    df['seasonality_index'] = 1 + 0.3 * np.sin(2 * np.pi * np.arange(n_weeks) / 52)
    
    # Generate revenue based on media spend with diminishing returns
    base_revenue = 1000000
    
    revenue = (
        base_revenue * df['seasonality_index'] +
        200 * np.sqrt(df['tv_spend']) +
        150 * np.sqrt(df['paid_search_spend']) +
        120 * np.sqrt(df['paid_social_spend']) +
        100 * np.sqrt(df['digital_display_spend']) +
        80 * np.sqrt(df['video_spend']) +
        50 * np.sqrt(df['radio_spend']) +
        50000 * df['promotion_indicator'] +
        np.random.normal(0, 50000, n_weeks)
    )
    
    df['revenue'] = revenue.clip(lower=0)
    
    return df


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    
    # Generate synthetic data
    df = generate_synthetic_data(n_weeks=156)
    
    # Initialize trainer
    trainer = MediaMixTrainer()
    
    # Prepare data
    X_train, X_val, X_test, y_train, y_val, y_test = trainer.prepare_data(df, target_col='revenue')
    
    # Train model
    trainer.train(X_train, y_train)
    
    # Evaluate
    metrics = trainer.evaluate(X_test, y_test)
    print(f"\nMetrics: {metrics}")
    
    # Get contributions
    contributions = trainer.get_channel_contributions()
    print(f"\nChannel contributions:\n{contributions}")
    
    # Optimize budget
    optimal = trainer.optimize_budget(total_budget=200000)
    print(f"\nOptimal allocation:\n{optimal}")
    
    # Save model
    trainer.save_model('./models')
