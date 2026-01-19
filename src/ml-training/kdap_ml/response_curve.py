"""
Response Curve Model Trainer
ANL Agent - Diminishing Returns and Saturation Modeling
"""

import logging
from typing import Any, Callable, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from scipy.optimize import curve_fit, minimize
from sklearn.base import BaseEstimator, RegressorMixin
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from kdap_ml.base import BaseTrainer

logger = logging.getLogger(__name__)


# Curve Functions
def hill_function(x: np.ndarray, K: float, S: float, n: float) -> np.ndarray:
    """Hill saturation function: K * x^n / (S^n + x^n)"""
    return K * np.power(x, n) / (np.power(S, n) + np.power(x, n) + 1e-10)


def adbudg_function(x: np.ndarray, a: float, b: float, c: float, d: float) -> np.ndarray:
    """ADBUDG function: a + (b - a) * x^c / (d + x^c)"""
    return a + (b - a) * np.power(x, c) / (d + np.power(x, c) + 1e-10)


def logarithmic_function(x: np.ndarray, a: float, b: float) -> np.ndarray:
    """Logarithmic function: a * log(1 + b*x)"""
    return a * np.log1p(b * x)


def power_function(x: np.ndarray, a: float, b: float) -> np.ndarray:
    """Power function: a * x^b"""
    return a * np.power(x + 1e-10, b)


def logistic_function(x: np.ndarray, L: float, k: float, x0: float) -> np.ndarray:
    """Logistic function: L / (1 + exp(-k*(x - x0)))"""
    return L / (1 + np.exp(-k * (x - x0)))


CURVE_FUNCTIONS = {
    'hill': {
        'func': hill_function,
        'params': ['K', 'S', 'n'],
        'bounds': ([0, 0, 0.1], [np.inf, np.inf, 10]),
        'p0_func': lambda x, y: [y.max(), np.median(x[x > 0]) if np.any(x > 0) else 1, 1],
    },
    'adbudg': {
        'func': adbudg_function,
        'params': ['a', 'b', 'c', 'd'],
        'bounds': ([0, 0, 0.1, 0], [np.inf, np.inf, 5, np.inf]),
        'p0_func': lambda x, y: [y.min(), y.max(), 1, np.median(x[x > 0]) if np.any(x > 0) else 1],
    },
    'logarithmic': {
        'func': logarithmic_function,
        'params': ['a', 'b'],
        'bounds': ([0, 0], [np.inf, np.inf]),
        'p0_func': lambda x, y: [y.max() / np.log(x.max() + 1), 1],
    },
    'power': {
        'func': power_function,
        'params': ['a', 'b'],
        'bounds': ([0, 0], [np.inf, 1]),
        'p0_func': lambda x, y: [y.max() / np.power(x.max(), 0.5), 0.5],
    },
    'logistic': {
        'func': logistic_function,
        'params': ['L', 'k', 'x0'],
        'bounds': ([0, 0, -np.inf], [np.inf, np.inf, np.inf]),
        'p0_func': lambda x, y: [y.max(), 1 / x.std() if x.std() > 0 else 1, x.mean()],
    },
}


class ResponseCurveModel(BaseEstimator, RegressorMixin):
    """
    Response Curve Model for diminishing returns analysis.
    """
    
    def __init__(
        self,
        curve_type: str = 'hill',
        auto_select: bool = True,
        max_iterations: int = 10000,
        random_seed: int = 42,
    ):
        self.curve_type = curve_type
        self.auto_select = auto_select
        self.max_iterations = max_iterations
        self.random_seed = random_seed
        
        self.best_curve_type_: Optional[str] = None
        self.parameters_: Optional[Dict[str, float]] = None
        self.parameter_errors_: Optional[Dict[str, float]] = None
        self.fit_metrics_: Optional[Dict[str, float]] = None
        self.confidence_intervals_: Optional[Dict[str, Tuple[float, float]]] = None
    
    def _fit_curve(
        self,
        x: np.ndarray,
        y: np.ndarray,
        curve_type: str,
    ) -> Tuple[Optional[np.ndarray], Optional[np.ndarray], Dict[str, float]]:
        """Fit a single curve type."""
        curve_config = CURVE_FUNCTIONS[curve_type]
        func = curve_config['func']
        bounds = curve_config['bounds']
        p0 = curve_config['p0_func'](x, y)
        
        try:
            popt, pcov = curve_fit(
                func, x, y,
                p0=p0,
                bounds=bounds,
                maxfev=self.max_iterations,
            )
            
            # Calculate fit metrics
            y_pred = func(x, *popt)
            residuals = y - y_pred
            ss_res = np.sum(residuals ** 2)
            ss_tot = np.sum((y - y.mean()) ** 2)
            
            n = len(y)
            k = len(popt)
            
            metrics = {
                'r2': 1 - ss_res / (ss_tot + 1e-10),
                'adjusted_r2': 1 - (1 - (1 - ss_res / (ss_tot + 1e-10))) * (n - 1) / (n - k - 1),
                'rmse': np.sqrt(ss_res / n),
                'mape': np.mean(np.abs(residuals / (y + 1e-10))) * 100,
                'aic': n * np.log(ss_res / n) + 2 * k,
                'bic': n * np.log(ss_res / n) + k * np.log(n),
            }
            
            return popt, pcov, metrics
            
        except Exception as e:
            logger.debug(f"Failed to fit {curve_type}: {e}")
            return None, None, {}
    
    def fit(self, X: np.ndarray, y: np.ndarray) -> 'ResponseCurveModel':
        """
        Fit the response curve model.
        
        Args:
            X: Spend values (1D array or 2D with single column)
            y: Response values
        """
        np.random.seed(self.random_seed)
        
        # Ensure 1D
        x = np.array(X).ravel()
        y = np.array(y).ravel()
        
        # Remove invalid values
        valid_mask = (x >= 0) & (~np.isnan(x)) & (~np.isnan(y))
        x = x[valid_mask]
        y = y[valid_mask]
        
        if self.auto_select:
            # Try all curve types and select best
            best_aic = np.inf
            best_result = None
            
            for curve_type in CURVE_FUNCTIONS.keys():
                popt, pcov, metrics = self._fit_curve(x, y, curve_type)
                
                if popt is not None and metrics.get('aic', np.inf) < best_aic:
                    best_aic = metrics['aic']
                    best_result = (curve_type, popt, pcov, metrics)
            
            if best_result is None:
                raise ValueError("Failed to fit any curve type")
            
            self.best_curve_type_, popt, pcov, self.fit_metrics_ = best_result
            
        else:
            popt, pcov, self.fit_metrics_ = self._fit_curve(x, y, self.curve_type)
            
            if popt is None:
                raise ValueError(f"Failed to fit {self.curve_type} curve")
            
            self.best_curve_type_ = self.curve_type
        
        # Store parameters
        param_names = CURVE_FUNCTIONS[self.best_curve_type_]['params']
        self.parameters_ = dict(zip(param_names, popt))
        
        # Calculate standard errors
        if pcov is not None:
            perr = np.sqrt(np.diag(pcov))
            self.parameter_errors_ = dict(zip(param_names, perr))
            
            # 95% confidence intervals
            self.confidence_intervals_ = {
                name: (popt[i] - 1.96 * perr[i], popt[i] + 1.96 * perr[i])
                for i, name in enumerate(param_names)
            }
        
        logger.info(f"Best curve type: {self.best_curve_type_}")
        logger.info(f"Parameters: {self.parameters_}")
        logger.info(f"Fit metrics: {self.fit_metrics_}")
        
        return self
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predict response for given spend values."""
        if self.parameters_ is None:
            raise ValueError("Model not fitted")
        
        x = np.array(X).ravel()
        func = CURVE_FUNCTIONS[self.best_curve_type_]['func']
        params = list(self.parameters_.values())
        
        return func(x, *params)
    
    def get_marginal_return(self, X: np.ndarray, delta: float = 1.0) -> np.ndarray:
        """Calculate marginal return at given spend levels."""
        x = np.array(X).ravel()
        y = self.predict(x)
        y_delta = self.predict(x + delta)
        return (y_delta - y) / delta
    
    def get_saturation_point(self, marginal_threshold: float = 0.1) -> float:
        """Find spend level where marginal return drops below threshold."""
        if self.parameters_ is None:
            raise ValueError("Model not fitted")
        
        # Binary search for saturation point
        x_low, x_high = 0, 1e9
        
        for _ in range(100):
            x_mid = (x_low + x_high) / 2
            mr = self.get_marginal_return(np.array([x_mid]))[0]
            
            if mr > marginal_threshold:
                x_low = x_mid
            else:
                x_high = x_mid
            
            if x_high - x_low < 1:
                break
        
        return x_mid
    
    def get_optimal_spend(self, target_mroi: float = 1.0) -> float:
        """Find optimal spend where marginal ROI equals target."""
        if self.parameters_ is None:
            raise ValueError("Model not fitted")
        
        def objective(x):
            mr = self.get_marginal_return(np.array([x[0]]))[0]
            return (mr - target_mroi) ** 2
        
        result = minimize(objective, x0=[1000], bounds=[(0, 1e9)])
        return result.x[0]


class ResponseCurveTrainer(BaseTrainer):
    """
    Trainer for Response Curve Model.
    """
    
    def __init__(
        self,
        config_dir: Optional[str] = None,
        experiment_name: Optional[str] = None,
    ):
        super().__init__(
            model_name='response_curve',
            config_dir=config_dir,
            experiment_name=experiment_name,
        )
        self.channel_models: Dict[str, ResponseCurveModel] = {}
    
    def _create_model(self, **kwargs) -> BaseEstimator:
        """Create response curve model."""
        curve_type = kwargs.pop('curve_type', 'hill')
        auto_select = kwargs.pop('auto_select', True)
        
        return ResponseCurveModel(
            curve_type=curve_type,
            auto_select=auto_select,
            **kwargs
        )
    
    def _get_hyperparameter_space(self) -> Dict[str, Any]:
        """Get hyperparameter search space."""
        return {
            'curve_type': {'type': 'categorical', 'choices': list(CURVE_FUNCTIONS.keys())},
        }
    
    def fit_channel(
        self,
        spend: np.ndarray,
        response: np.ndarray,
        channel_name: str,
        auto_select: bool = True,
    ) -> ResponseCurveModel:
        """
        Fit response curve for a single channel.
        
        Args:
            spend: Spend values
            response: Response values
            channel_name: Name of the channel
            auto_select: Automatically select best curve type
            
        Returns:
            Fitted ResponseCurveModel
        """
        model = ResponseCurveModel(auto_select=auto_select)
        model.fit(spend, response)
        
        self.channel_models[channel_name] = model
        
        return model
    
    def fit_all_channels(
        self,
        df: pd.DataFrame,
        spend_cols: List[str],
        response_col: str,
        auto_select: bool = True,
    ) -> Dict[str, ResponseCurveModel]:
        """
        Fit response curves for all channels.
        
        Args:
            df: DataFrame with spend and response data
            spend_cols: List of spend column names
            response_col: Response column name
            auto_select: Automatically select best curve type
            
        Returns:
            Dict of channel name to fitted model
        """
        response = df[response_col].values
        
        for col in spend_cols:
            spend = df[col].values
            
            # Filter to non-zero spend
            mask = spend > 0
            if mask.sum() < 10:
                logger.warning(f"Insufficient data for {col}, skipping")
                continue
            
            try:
                self.fit_channel(spend[mask], response[mask], col, auto_select)
                logger.info(f"Fitted curve for {col}: {self.channel_models[col].best_curve_type_}")
            except Exception as e:
                logger.error(f"Failed to fit curve for {col}: {e}")
        
        return self.channel_models
    
    def evaluate(
        self,
        X_test: pd.DataFrame,
        y_test: pd.Series,
    ) -> Dict[str, float]:
        """Evaluate model (for single-channel case)."""
        if self.model is None:
            raise ValueError("Model not trained")
        
        y_pred = self.model.predict(X_test.values.ravel())
        
        self.metrics = {
            'r2': r2_score(y_test, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'mae': mean_absolute_error(y_test, y_pred),
            'mape': np.mean(np.abs((y_test - y_pred) / (y_test + 1e-10))) * 100,
        }
        
        logger.info(f"Evaluation metrics: {self.metrics}")
        return self.metrics
    
    def get_channel_analysis(self, channel_name: str) -> Dict[str, Any]:
        """Get detailed analysis for a channel."""
        if channel_name not in self.channel_models:
            raise ValueError(f"No model for channel: {channel_name}")
        
        model = self.channel_models[channel_name]
        
        return {
            'channel': channel_name,
            'curve_type': model.best_curve_type_,
            'parameters': model.parameters_,
            'parameter_errors': model.parameter_errors_,
            'confidence_intervals': model.confidence_intervals_,
            'fit_metrics': model.fit_metrics_,
            'saturation_point': model.get_saturation_point(),
            'optimal_spend_mroi_1': model.get_optimal_spend(target_mroi=1.0),
        }
    
    def generate_curve_data(
        self,
        channel_name: str,
        max_spend: float,
        n_points: int = 100,
    ) -> pd.DataFrame:
        """Generate curve data for visualization."""
        if channel_name not in self.channel_models:
            raise ValueError(f"No model for channel: {channel_name}")
        
        model = self.channel_models[channel_name]
        
        spend_range = np.linspace(0, max_spend, n_points)
        response = model.predict(spend_range)
        marginal_return = model.get_marginal_return(spend_range)
        
        return pd.DataFrame({
            'spend': spend_range,
            'response': response,
            'marginal_return': marginal_return,
            'cumulative_return': np.cumsum(response) / np.arange(1, n_points + 1),
        })
    
    def compare_channels(self, budget: float) -> pd.DataFrame:
        """Compare all channels at a given budget level."""
        results = []
        
        for channel, model in self.channel_models.items():
            response = model.predict(np.array([budget]))[0]
            marginal_return = model.get_marginal_return(np.array([budget]))[0]
            saturation = model.get_saturation_point()
            
            results.append({
                'channel': channel,
                'curve_type': model.best_curve_type_,
                'predicted_response': response,
                'marginal_return': marginal_return,
                'saturation_point': saturation,
                'at_saturation': budget >= saturation * 0.9,
                'efficiency_rating': 'High' if marginal_return > 0.5 else 'Medium' if marginal_return > 0.1 else 'Low',
            })
        
        return pd.DataFrame(results).sort_values('marginal_return', ascending=False)


def generate_synthetic_data(n_observations: int = 200) -> pd.DataFrame:
    """Generate synthetic spend-response data."""
    np.random.seed(42)
    
    data = {
        'date': pd.date_range(start='2022-01-01', periods=n_observations, freq='D'),
    }
    
    # Generate spend data
    channels = ['search_spend', 'social_spend', 'display_spend', 'video_spend']
    
    for channel in channels:
        data[channel] = np.random.exponential(scale=10000, size=n_observations)
    
    df = pd.DataFrame(data)
    
    # Generate response with diminishing returns
    base = 50000
    df['revenue'] = (
        base +
        500 * np.sqrt(df['search_spend']) +  # Quick saturation
        300 * np.log1p(df['social_spend'] / 100) +  # Logarithmic
        200 * np.power(df['display_spend'], 0.4) +  # Power
        150 * df['video_spend'] / (5000 + df['video_spend']) * 50000 +  # Hill-like
        np.random.normal(0, 5000, n_observations)
    )
    
    return df


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    
    # Generate synthetic data
    df = generate_synthetic_data(n_observations=200)
    
    # Initialize trainer
    trainer = ResponseCurveTrainer()
    
    # Fit all channels
    spend_cols = ['search_spend', 'social_spend', 'display_spend', 'video_spend']
    trainer.fit_all_channels(df, spend_cols, 'revenue')
    
    # Analyze each channel
    for channel in spend_cols:
        if channel in trainer.channel_models:
            analysis = trainer.get_channel_analysis(channel)
            print(f"\n{channel}:")
            print(f"  Curve type: {analysis['curve_type']}")
            print(f"  R²: {analysis['fit_metrics'].get('r2', 0):.4f}")
            print(f"  Saturation point: ${analysis['saturation_point']:,.0f}")
            print(f"  Optimal spend (MROI=1): ${analysis['optimal_spend_mroi_1']:,.0f}")
    
    # Compare channels at $20,000 budget
    comparison = trainer.compare_channels(budget=20000)
    print(f"\nChannel comparison at $20,000:\n{comparison}")
    
    # Generate curve data for visualization
    curve_data = trainer.generate_curve_data('search_spend', max_spend=50000)
    print(f"\nCurve data sample:\n{curve_data.head()}")
