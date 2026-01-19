"""
Anomaly Detection Model Trainer
PRF Agent - Performance Metric Anomaly Detection
"""

import logging
from typing import Any, Dict, List, Optional, Tuple, Union

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.metrics import (
    classification_report,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.preprocessing import StandardScaler

from kdap_ml.base import BaseTrainer
from kdap_ml.preprocessing import TimeSeriesFeatureExtractor

logger = logging.getLogger(__name__)


class AnomalyDetectorTrainer(BaseTrainer):
    """
    Trainer for Anomaly Detection model.
    Uses ensemble of Isolation Forest and LOF for robust detection.
    """
    
    def __init__(
        self,
        config_dir: Optional[str] = None,
        experiment_name: Optional[str] = None,
    ):
        super().__init__(
            model_name='anomaly_detector',
            config_dir=config_dir,
            experiment_name=experiment_name,
        )
        self.isolation_forest: Optional[IsolationForest] = None
        self.lof: Optional[LocalOutlierFactor] = None
        self.scaler: Optional[StandardScaler] = None
        self.feature_extractor: Optional[TimeSeriesFeatureExtractor] = None
        self.baseline_stats: Dict[str, Dict[str, float]] = {}
    
    def _create_model(self, **kwargs) -> BaseEstimator:
        """Create Isolation Forest model."""
        default_params = {
            'n_estimators': 200,
            'max_samples': 'auto',
            'contamination': 'auto',
            'random_state': 42,
            'n_jobs': -1,
        }
        default_params.update(kwargs)
        
        return IsolationForest(**default_params)
    
    def _get_hyperparameter_space(self) -> Dict[str, Any]:
        """Get hyperparameter search space."""
        return {
            'n_estimators': {'type': 'int', 'low': 100, 'high': 500},
            'max_samples': {'type': 'float', 'low': 0.5, 'high': 1.0},
            'contamination': {'type': 'float', 'low': 0.01, 'high': 0.15},
        }
    
    def _create_lof_model(self, **kwargs) -> LocalOutlierFactor:
        """Create Local Outlier Factor model."""
        default_params = {
            'n_neighbors': 20,
            'algorithm': 'auto',
            'contamination': 'auto',
            'novelty': True,
            'n_jobs': -1,
        }
        default_params.update(kwargs)
        
        return LocalOutlierFactor(**default_params)
    
    def extract_time_series_features(
        self,
        df: pd.DataFrame,
        metric_col: str = 'metric_value',
        timestamp_col: Optional[str] = None,
    ) -> pd.DataFrame:
        """
        Extract time series features from metric data.
        
        Args:
            df: Input DataFrame with metric values
            metric_col: Name of metric value column
            timestamp_col: Name of timestamp column
            
        Returns:
            DataFrame with extracted features
        """
        df = df.copy()
        
        # Rename column if needed
        if metric_col != 'metric_value':
            df = df.rename(columns={metric_col: 'metric_value'})
        
        # Sort by timestamp if provided
        if timestamp_col and timestamp_col in df.columns:
            df = df.sort_values(timestamp_col)
        
        # Initialize feature extractor
        self.feature_extractor = TimeSeriesFeatureExtractor(
            lags=[1, 7, 14, 28],
            rolling_windows=[7, 28],
            ewm_spans=[7],
        )
        
        # Extract features
        df = self.feature_extractor.transform(df)
        
        # Add contextual features if available
        if timestamp_col and timestamp_col in df.columns:
            timestamps = pd.to_datetime(df[timestamp_col])
            df['day_of_week'] = timestamps.dt.dayofweek
            df['day_of_month'] = timestamps.dt.day
            df['month'] = timestamps.dt.month
            df['quarter'] = timestamps.dt.quarter
            df['is_weekend'] = (timestamps.dt.dayofweek >= 5).astype(int)
        
        # Calculate deviation from trend
        if 'rolling_mean_28d' in df.columns:
            df['deviation_from_trend'] = df['metric_value'] - df['rolling_mean_28d']
        
        # Calculate volatility
        if 'rolling_std_7d' in df.columns:
            df['volatility_7d'] = df['rolling_std_7d'] / (df['rolling_mean_7d'] + 1e-10)
        
        return df
    
    def compute_baseline_stats(
        self,
        df: pd.DataFrame,
        metric_col: str = 'metric_value',
    ) -> Dict[str, Dict[str, float]]:
        """
        Compute baseline statistics for anomaly scoring.
        
        Args:
            df: Training DataFrame
            metric_col: Name of metric column
            
        Returns:
            Dictionary of baseline statistics
        """
        self.baseline_stats = {
            'mean': float(df[metric_col].mean()),
            'std': float(df[metric_col].std()),
            'median': float(df[metric_col].median()),
            'q1': float(df[metric_col].quantile(0.25)),
            'q3': float(df[metric_col].quantile(0.75)),
            'iqr': float(df[metric_col].quantile(0.75) - df[metric_col].quantile(0.25)),
            'min': float(df[metric_col].min()),
            'max': float(df[metric_col].max()),
        }
        
        logger.info(f"Baseline statistics computed: {self.baseline_stats}")
        return self.baseline_stats
    
    def prepare_data(
        self,
        df: pd.DataFrame,
        target_col: Optional[str] = None,
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, pd.Series]:
        """
        Prepare data for anomaly detection training.
        Uses temporal split for time series data.
        """
        # Extract time series features if not already done
        if 'metric_value' in df.columns and 'rolling_mean_7d' not in df.columns:
            df = self.extract_time_series_features(df)
        
        # Compute baseline stats
        self.compute_baseline_stats(df)
        
        # Drop NaN rows (from lag/rolling features)
        df = df.dropna()
        
        # Define feature columns
        feature_cols = [col for col in df.columns if col not in [
            target_col, 'timestamp', 'date', 'metric_name', 'metric_value'
        ]]
        
        self.feature_names = feature_cols
        
        # Temporal split
        n = len(df)
        train_end = int(n * 0.7)
        val_end = int(n * 0.85)
        
        train_df = df.iloc[:train_end]
        val_df = df.iloc[train_end:val_end]
        test_df = df.iloc[val_end:]
        
        X_train = train_df[feature_cols]
        X_val = val_df[feature_cols]
        X_test = test_df[feature_cols]
        
        # Handle target (may not exist for unsupervised)
        if target_col and target_col in df.columns:
            y_train = train_df[target_col]
            y_val = val_df[target_col]
            y_test = test_df[target_col]
        else:
            # Create dummy target for unsupervised case
            y_train = pd.Series(np.zeros(len(X_train)))
            y_val = pd.Series(np.zeros(len(X_val)))
            y_test = pd.Series(np.zeros(len(X_test)))
        
        # Scale features
        self.scaler = StandardScaler()
        X_train_scaled = pd.DataFrame(
            self.scaler.fit_transform(X_train),
            columns=feature_cols,
            index=X_train.index
        )
        X_val_scaled = pd.DataFrame(
            self.scaler.transform(X_val),
            columns=feature_cols,
            index=X_val.index
        )
        X_test_scaled = pd.DataFrame(
            self.scaler.transform(X_test),
            columns=feature_cols,
            index=X_test.index
        )
        
        logger.info(f"Data prepared: train={len(X_train)}, val={len(X_val)}, test={len(X_test)}")
        
        return X_train_scaled, X_val_scaled, X_test_scaled, y_train, y_val, y_test
    
    def train(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series = None,
        X_val: pd.DataFrame = None,
        y_val: pd.Series = None,
        **kwargs,
    ) -> BaseEstimator:
        """
        Train anomaly detection ensemble.
        """
        logger.info("Training anomaly detection ensemble...")
        
        # Get parameters from config
        if_params = self.config.get('algorithms', {}).get('isolation_forest', {})
        lof_params = self.config.get('algorithms', {}).get('local_outlier_factor', {})
        
        if_params.update(kwargs)
        
        # Train Isolation Forest
        self.isolation_forest = self._create_model(**if_params)
        self.isolation_forest.fit(X_train)
        
        # Train LOF
        self.lof = self._create_lof_model(**lof_params)
        self.lof.fit(X_train)
        
        # Set main model reference
        self.model = self.isolation_forest
        
        logger.info("Anomaly detection ensemble training complete")
        return self.model
    
    def predict_anomalies(
        self,
        X: pd.DataFrame,
        sensitivity: str = 'medium',
    ) -> pd.DataFrame:
        """
        Detect anomalies with configurable sensitivity.
        
        Args:
            X: Features for prediction
            sensitivity: Detection sensitivity level
                ('low', 'medium', 'high', 'critical')
                
        Returns:
            DataFrame with anomaly predictions and scores
        """
        if self.isolation_forest is None:
            raise ValueError("Model not trained. Call train() first.")
        
        # Scale features
        if self.scaler is not None:
            X_scaled = pd.DataFrame(
                self.scaler.transform(X),
                columns=self.feature_names if self.feature_names else X.columns,
                index=X.index
            )
        else:
            X_scaled = X
        
        # Get sensitivity thresholds
        sensitivity_config = self.config.get('sensitivity', {}).get('levels', {})
        threshold = sensitivity_config.get(sensitivity, {}).get('threshold', 0.5)
        
        # Get Isolation Forest scores
        if_scores = -self.isolation_forest.score_samples(X_scaled)  # Negate to make higher = more anomalous
        if_scores = (if_scores - if_scores.min()) / (if_scores.max() - if_scores.min() + 1e-10)
        
        # Get LOF scores
        lof_scores = -self.lof.score_samples(X_scaled)
        lof_scores = (lof_scores - lof_scores.min()) / (lof_scores.max() - lof_scores.min() + 1e-10)
        
        # Ensemble scores (weighted average)
        ensemble_config = self.config.get('ensemble', {})
        weights = ensemble_config.get('weights', [0.6, 0.4])
        
        anomaly_scores = weights[0] * if_scores + weights[1] * lof_scores
        
        # Determine anomaly type based on original metric behavior
        def determine_anomaly_type(row_idx):
            if 'pct_change_1d' in X.columns:
                pct_change = X.iloc[row_idx]['pct_change_1d']
                if pd.notna(pct_change):
                    if pct_change > 0.2:
                        return 'spike'
                    elif pct_change < -0.2:
                        return 'dip'
            if 'deviation_from_trend' in X.columns:
                deviation = X.iloc[row_idx]['deviation_from_trend']
                if pd.notna(deviation):
                    if abs(deviation) > self.baseline_stats.get('std', 1) * 2:
                        return 'trend'
            return 'pattern'
        
        # Calculate expected values
        expected_values = X.get('rolling_mean_7d', pd.Series([self.baseline_stats.get('mean', 0)] * len(X)))
        
        results = pd.DataFrame({
            'is_anomaly': (anomaly_scores >= threshold).astype(int),
            'anomaly_score': anomaly_scores,
            'if_score': if_scores,
            'lof_score': lof_scores,
            'anomaly_type': [determine_anomaly_type(i) if anomaly_scores[i] >= threshold else None for i in range(len(X))],
            'expected_value': expected_values.values if hasattr(expected_values, 'values') else expected_values,
            'confidence': np.abs(anomaly_scores - 0.5) * 2,
        }, index=X.index)
        
        # Calculate deviation
        if 'metric_value' in X.columns:
            results['deviation'] = X['metric_value'] - results['expected_value']
        
        return results
    
    def evaluate(
        self,
        X_test: pd.DataFrame,
        y_test: pd.Series,
    ) -> Dict[str, float]:
        """
        Evaluate anomaly detection model.
        """
        predictions = self.predict_anomalies(X_test)
        y_pred = predictions['is_anomaly']
        y_scores = predictions['anomaly_score']
        
        # Handle case where y_test might be all zeros (unsupervised)
        if y_test.sum() == 0:
            logger.warning("No labeled anomalies in test set. Using unsupervised metrics.")
            self.metrics = {
                'detected_anomalies': int(y_pred.sum()),
                'anomaly_rate': float(y_pred.mean()),
                'mean_score': float(y_scores.mean()),
                'std_score': float(y_scores.std()),
            }
        else:
            self.metrics = {
                'precision': precision_score(y_test, y_pred, zero_division=0),
                'recall': recall_score(y_test, y_pred, zero_division=0),
                'f1': f1_score(y_test, y_pred, zero_division=0),
                'detected_anomalies': int(y_pred.sum()),
                'actual_anomalies': int(y_test.sum()),
            }
            
            if len(np.unique(y_test)) > 1:
                self.metrics['auc_roc'] = roc_auc_score(y_test, y_scores)
            
            logger.info(f"\nClassification Report:\n{classification_report(y_test, y_pred)}")
        
        logger.info(f"Evaluation metrics: {self.metrics}")
        return self.metrics
    
    def detect_realtime(
        self,
        current_value: float,
        historical_values: List[float],
        sensitivity: str = 'medium',
    ) -> Dict[str, Any]:
        """
        Real-time anomaly detection for streaming data.
        
        Args:
            current_value: Current metric value
            historical_values: List of recent historical values
            sensitivity: Detection sensitivity
            
        Returns:
            Dictionary with detection results
        """
        # Build feature dataframe
        values = historical_values + [current_value]
        df = pd.DataFrame({'metric_value': values})
        df = self.extract_time_series_features(df)
        
        # Get last row (current value)
        current_features = df.iloc[[-1]].dropna(axis=1)
        
        # Predict
        predictions = self.predict_anomalies(current_features, sensitivity=sensitivity)
        
        return {
            'is_anomaly': bool(predictions['is_anomaly'].iloc[0]),
            'score': float(predictions['anomaly_score'].iloc[0]),
            'type': predictions['anomaly_type'].iloc[0],
            'expected_value': float(predictions['expected_value'].iloc[0]),
            'deviation': float(current_value - predictions['expected_value'].iloc[0]),
        }


def generate_synthetic_data(n_samples: int = 1000, anomaly_rate: float = 0.05) -> pd.DataFrame:
    """
    Generate synthetic time series data with anomalies.
    """
    np.random.seed(42)
    
    # Generate dates
    dates = pd.date_range(start='2023-01-01', periods=n_samples, freq='D')
    
    # Generate base signal with trend and seasonality
    trend = np.linspace(100, 150, n_samples)
    seasonality = 10 * np.sin(2 * np.pi * np.arange(n_samples) / 365)
    weekly_pattern = 5 * np.sin(2 * np.pi * np.arange(n_samples) / 7)
    noise = np.random.normal(0, 3, n_samples)
    
    metric_value = trend + seasonality + weekly_pattern + noise
    
    # Inject anomalies
    n_anomalies = int(n_samples * anomaly_rate)
    anomaly_indices = np.random.choice(range(50, n_samples), n_anomalies, replace=False)
    
    is_anomaly = np.zeros(n_samples)
    for idx in anomaly_indices:
        anomaly_type = np.random.choice(['spike', 'dip', 'trend_break'])
        if anomaly_type == 'spike':
            metric_value[idx] += np.random.uniform(30, 50)
        elif anomaly_type == 'dip':
            metric_value[idx] -= np.random.uniform(30, 50)
        else:
            metric_value[idx:idx+5] += np.random.uniform(20, 30)
        is_anomaly[idx] = 1
    
    df = pd.DataFrame({
        'timestamp': dates,
        'metric_name': 'conversion_rate',
        'metric_value': metric_value,
        'is_anomaly': is_anomaly.astype(int),
    })
    
    return df


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    
    # Generate synthetic data
    df = generate_synthetic_data(n_samples=1000, anomaly_rate=0.05)
    
    # Initialize trainer
    trainer = AnomalyDetectorTrainer()
    
    # Extract features
    df_features = trainer.extract_time_series_features(df, 'metric_value', 'timestamp')
    
    # Prepare data
    X_train, X_val, X_test, y_train, y_val, y_test = trainer.prepare_data(
        df_features, target_col='is_anomaly'
    )
    
    # Train model
    trainer.train(X_train)
    
    # Evaluate
    metrics = trainer.evaluate(X_test, y_test)
    print(f"\nMetrics: {metrics}")
    
    # Test real-time detection
    historical = list(df['metric_value'].tail(30))
    result = trainer.detect_realtime(
        current_value=200,  # Obvious anomaly
        historical_values=historical,
        sensitivity='medium'
    )
    print(f"\nReal-time detection result: {result}")
    
    # Save model
    trainer.save_model('./models')
