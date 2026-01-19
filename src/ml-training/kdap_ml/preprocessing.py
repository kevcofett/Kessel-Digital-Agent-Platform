"""
Data Preprocessing Utilities for KDAP ML Training
"""

import logging
from typing import Any, Dict, List, Optional, Tuple, Union

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import (
    LabelEncoder,
    OneHotEncoder,
    RobustScaler,
    StandardScaler,
    MinMaxScaler,
)
from category_encoders import TargetEncoder, WOEEncoder

logger = logging.getLogger(__name__)


class OutlierHandler(BaseEstimator, TransformerMixin):
    """Handle outliers using various methods."""
    
    def __init__(
        self,
        method: str = 'winsorize',
        limits: Tuple[float, float] = (0.01, 0.99),
    ):
        self.method = method
        self.limits = limits
        self.lower_bounds_: Dict[str, float] = {}
        self.upper_bounds_: Dict[str, float] = {}
    
    def fit(self, X: pd.DataFrame, y=None):
        for col in X.columns:
            self.lower_bounds_[col] = X[col].quantile(self.limits[0])
            self.upper_bounds_[col] = X[col].quantile(self.limits[1])
        return self
    
    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        X = X.copy()
        for col in X.columns:
            if self.method == 'winsorize':
                X[col] = X[col].clip(
                    lower=self.lower_bounds_[col],
                    upper=self.upper_bounds_[col]
                )
            elif self.method == 'clip':
                X[col] = X[col].clip(
                    lower=self.lower_bounds_[col],
                    upper=self.upper_bounds_[col]
                )
        return X


class CyclicalEncoder(BaseEstimator, TransformerMixin):
    """Encode cyclical features using sin/cos transformation."""
    
    def __init__(self, periods: Dict[str, int]):
        self.periods = periods
    
    def fit(self, X: pd.DataFrame, y=None):
        return self
    
    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        X = X.copy()
        new_cols = {}
        cols_to_drop = []
        
        for col, period in self.periods.items():
            if col in X.columns:
                new_cols[f'{col}_sin'] = np.sin(2 * np.pi * X[col] / period)
                new_cols[f'{col}_cos'] = np.cos(2 * np.pi * X[col] / period)
                cols_to_drop.append(col)
        
        X = X.drop(columns=cols_to_drop)
        for name, values in new_cols.items():
            X[name] = values
        
        return X


class TimeSeriesFeatureExtractor(BaseEstimator, TransformerMixin):
    """Extract time series features from metric values."""
    
    def __init__(
        self,
        lags: List[int] = [1, 7, 14, 28],
        rolling_windows: List[int] = [7, 28],
        ewm_spans: List[int] = [7],
    ):
        self.lags = lags
        self.rolling_windows = rolling_windows
        self.ewm_spans = ewm_spans
    
    def fit(self, X: pd.DataFrame, y=None):
        return self
    
    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        X = X.copy()
        
        if 'metric_value' not in X.columns:
            return X
        
        # Lag features
        for lag in self.lags:
            X[f'metric_value_lag_{lag}'] = X['metric_value'].shift(lag)
        
        # Rolling statistics
        for window in self.rolling_windows:
            X[f'rolling_mean_{window}d'] = X['metric_value'].rolling(window).mean()
            X[f'rolling_std_{window}d'] = X['metric_value'].rolling(window).std()
        
        # Exponential weighted moving average
        for span in self.ewm_spans:
            X[f'ewm_mean_{span}d'] = X['metric_value'].ewm(span=span).mean()
            X[f'ewm_std_{span}d'] = X['metric_value'].ewm(span=span).std()
        
        # Percentage changes
        X['pct_change_1d'] = X['metric_value'].pct_change(1)
        X['pct_change_7d'] = X['metric_value'].pct_change(7)
        X['pct_change_28d'] = X['metric_value'].pct_change(28)
        
        # Z-scores
        for window in self.rolling_windows:
            mean_col = f'rolling_mean_{window}d'
            std_col = f'rolling_std_{window}d'
            if mean_col in X.columns and std_col in X.columns:
                X[f'zscore_{window}d'] = (
                    (X['metric_value'] - X[mean_col]) / 
                    X[std_col].replace(0, np.nan)
                )
        
        return X


class DataPreprocessor:
    """
    Main data preprocessing class.
    Handles numerical, categorical, and time series features.
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.numerical_features: List[str] = config.get('features', {}).get('numerical', [])
        self.categorical_features: List[str] = config.get('features', {}).get('categorical', [])
        self.time_series_features: List[str] = config.get('features', {}).get('time_series', [])
        self.derived_features: List[str] = config.get('features', {}).get('derived', [])
        
        self.preprocessor: Optional[ColumnTransformer] = None
        self.target_encoder: Optional[LabelEncoder] = None
        self.feature_names_: List[str] = []
    
    def _build_numerical_pipeline(self) -> Pipeline:
        """Build preprocessing pipeline for numerical features."""
        preprocess_config = self.config.get('preprocessing', {}).get('numerical', {})
        
        steps = []
        
        # Imputation
        imputer_strategy = preprocess_config.get('imputer', 'median')
        steps.append(('imputer', SimpleImputer(strategy=imputer_strategy)))
        
        # Outlier handling
        outlier_method = preprocess_config.get('outlier_treatment', 'none')
        if outlier_method != 'none':
            limits = preprocess_config.get('winsorize_limits', (0.01, 0.99))
            steps.append(('outlier', OutlierHandler(method=outlier_method, limits=tuple(limits))))
        
        # Scaling
        scaler_type = preprocess_config.get('scaler', 'standard')
        if scaler_type == 'standard':
            steps.append(('scaler', StandardScaler()))
        elif scaler_type == 'robust':
            steps.append(('scaler', RobustScaler()))
        elif scaler_type == 'minmax':
            steps.append(('scaler', MinMaxScaler()))
        
        return Pipeline(steps)
    
    def _build_categorical_pipeline(self) -> Pipeline:
        """Build preprocessing pipeline for categorical features."""
        preprocess_config = self.config.get('preprocessing', {}).get('categorical', {})
        
        encoder_type = preprocess_config.get('encoder', 'onehot')
        
        steps = []
        
        # Imputation
        steps.append(('imputer', SimpleImputer(strategy='constant', fill_value='unknown')))
        
        # Encoding
        if encoder_type == 'onehot':
            steps.append(('encoder', OneHotEncoder(
                handle_unknown='ignore',
                sparse_output=False,
            )))
        elif encoder_type == 'target':
            steps.append(('encoder', TargetEncoder(
                handle_unknown='value',
                min_samples_leaf=preprocess_config.get('min_frequency', 0.01),
            )))
        elif encoder_type == 'woe':
            steps.append(('encoder', WOEEncoder(
                handle_unknown='value',
            )))
        
        return Pipeline(steps)
    
    def build_preprocessor(self) -> ColumnTransformer:
        """Build complete preprocessing pipeline."""
        transformers = []
        
        if self.numerical_features:
            transformers.append((
                'numerical',
                self._build_numerical_pipeline(),
                self.numerical_features
            ))
        
        if self.categorical_features:
            transformers.append((
                'categorical',
                self._build_categorical_pipeline(),
                self.categorical_features
            ))
        
        self.preprocessor = ColumnTransformer(
            transformers=transformers,
            remainder='passthrough',
            verbose_feature_names_out=False,
        )
        
        return self.preprocessor
    
    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> 'DataPreprocessor':
        """Fit the preprocessor on training data."""
        if self.preprocessor is None:
            self.build_preprocessor()
        
        self.preprocessor.fit(X, y)
        
        # Get feature names after transformation
        try:
            self.feature_names_ = list(self.preprocessor.get_feature_names_out())
        except AttributeError:
            self.feature_names_ = self.numerical_features + self.categorical_features
        
        logger.info(f"Preprocessor fitted with {len(self.feature_names_)} features")
        return self
    
    def transform(self, X: pd.DataFrame) -> np.ndarray:
        """Transform data using fitted preprocessor."""
        if self.preprocessor is None:
            raise ValueError("Preprocessor not fitted. Call fit() first.")
        
        return self.preprocessor.transform(X)
    
    def fit_transform(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> np.ndarray:
        """Fit and transform in one step."""
        self.fit(X, y)
        return self.transform(X)
    
    def get_feature_names(self) -> List[str]:
        """Get list of feature names after transformation."""
        return self.feature_names_


def create_train_test_split(
    df: pd.DataFrame,
    target_col: str,
    test_size: float = 0.2,
    validation_size: float = 0.15,
    stratify: bool = False,
    time_col: Optional[str] = None,
    random_state: int = 42,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, pd.Series]:
    """
    Create train/validation/test splits.
    
    Args:
        df: Input dataframe
        target_col: Name of target column
        test_size: Fraction for test set
        validation_size: Fraction for validation set (from training data)
        stratify: Whether to stratify splits
        time_col: Column for temporal splitting (if provided, uses time-based split)
        random_state: Random seed
        
    Returns:
        X_train, X_val, X_test, y_train, y_val, y_test
    """
    from sklearn.model_selection import train_test_split
    
    X = df.drop(columns=[target_col])
    y = df[target_col]
    
    if time_col and time_col in df.columns:
        # Time-based split
        df_sorted = df.sort_values(time_col)
        n = len(df_sorted)
        train_end = int(n * (1 - test_size - validation_size))
        val_end = int(n * (1 - test_size))
        
        X_train = df_sorted.iloc[:train_end].drop(columns=[target_col])
        y_train = df_sorted.iloc[:train_end][target_col]
        X_val = df_sorted.iloc[train_end:val_end].drop(columns=[target_col])
        y_val = df_sorted.iloc[train_end:val_end][target_col]
        X_test = df_sorted.iloc[val_end:].drop(columns=[target_col])
        y_test = df_sorted.iloc[val_end:][target_col]
    else:
        # Random split
        stratify_col = y if stratify else None
        
        X_temp, X_test, y_temp, y_test = train_test_split(
            X, y,
            test_size=test_size,
            stratify=stratify_col,
            random_state=random_state,
        )
        
        val_frac = validation_size / (1 - test_size)
        stratify_col = y_temp if stratify else None
        
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp,
            test_size=val_frac,
            stratify=stratify_col,
            random_state=random_state,
        )
    
    logger.info(f"Data split: train={len(X_train)}, val={len(X_val)}, test={len(X_test)}")
    
    return X_train, X_val, X_test, y_train, y_val, y_test
