"""
Base Model Trainer Class for KDAP ML Training
"""

import json
import logging
import os
from abc import ABC, abstractmethod
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import joblib
import mlflow
import mlflow.sklearn
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator
from sklearn.model_selection import cross_val_score

from kdap_ml.config import get_model_config, load_config
from kdap_ml.preprocessing import DataPreprocessor, create_train_test_split

logger = logging.getLogger(__name__)


class BaseTrainer(ABC):
    """
    Abstract base class for all KDAP model trainers.
    Provides common training, evaluation, and deployment functionality.
    """
    
    def __init__(
        self,
        model_name: str,
        config_dir: Optional[str] = None,
        experiment_name: Optional[str] = None,
    ):
        self.model_name = model_name
        self.config = get_model_config(model_name, config_dir)
        self.global_config = load_config()
        
        self.model: Optional[BaseEstimator] = None
        self.preprocessor: Optional[DataPreprocessor] = None
        self.feature_names: List[str] = []
        self.metrics: Dict[str, float] = {}
        self.best_params: Dict[str, Any] = {}
        
        # MLflow setup
        self.experiment_name = experiment_name or self.global_config.get(
            'experiment', {}
        ).get('name', 'kdap-model-training')
        
        self._setup_mlflow()
        self._setup_logging()
    
    def _setup_mlflow(self) -> None:
        """Configure MLflow tracking."""
        tracking_uri = self.global_config.get('experiment', {}).get('tracking_uri')
        if tracking_uri:
            mlflow.set_tracking_uri(tracking_uri)
        
        mlflow.set_experiment(self.experiment_name)
        mlflow.sklearn.autolog(log_models=False)
    
    def _setup_logging(self) -> None:
        """Configure logging."""
        log_config = self.global_config.get('logging', {})
        log_level = getattr(logging, log_config.get('level', 'INFO'))
        log_format = log_config.get(
            'format',
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        logging.basicConfig(level=log_level, format=log_format)
    
    @abstractmethod
    def _create_model(self, **kwargs) -> BaseEstimator:
        """Create model instance. Must be implemented by subclasses."""
        pass
    
    @abstractmethod
    def _get_hyperparameter_space(self) -> Dict[str, Any]:
        """Get hyperparameter search space. Must be implemented by subclasses."""
        pass
    
    def load_data(
        self,
        data_path: Optional[str] = None,
        df: Optional[pd.DataFrame] = None,
    ) -> pd.DataFrame:
        """
        Load training data from file or DataFrame.
        
        Args:
            data_path: Path to data file (CSV, parquet, etc.)
            df: Pre-loaded DataFrame
            
        Returns:
            Loaded DataFrame
        """
        if df is not None:
            logger.info(f"Using provided DataFrame with {len(df)} rows")
            return df
        
        if data_path is None:
            raise ValueError("Either data_path or df must be provided")
        
        path = Path(data_path)
        if path.suffix == '.csv':
            df = pd.read_csv(path)
        elif path.suffix == '.parquet':
            df = pd.read_parquet(path)
        elif path.suffix == '.json':
            df = pd.read_json(path)
        else:
            raise ValueError(f"Unsupported file format: {path.suffix}")
        
        logger.info(f"Loaded data from {data_path}: {len(df)} rows, {len(df.columns)} columns")
        return df
    
    def prepare_data(
        self,
        df: pd.DataFrame,
        target_col: Optional[str] = None,
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, pd.Series]:
        """
        Prepare data for training including preprocessing and splitting.
        
        Args:
            df: Input DataFrame
            target_col: Name of target column
            
        Returns:
            X_train, X_val, X_test, y_train, y_val, y_test
        """
        target_col = target_col or self.config.get('target', {}).get('name')
        if target_col is None:
            raise ValueError("Target column not specified")
        
        training_config = self.config.get('training', {})
        test_size = training_config.get('test_size', 0.2)
        val_size = training_config.get('validation_size', 0.15)
        stratify = training_config.get('stratify', False)
        
        # Split data
        X_train, X_val, X_test, y_train, y_val, y_test = create_train_test_split(
            df=df,
            target_col=target_col,
            test_size=test_size,
            validation_size=val_size,
            stratify=stratify,
            random_state=self.global_config.get('training', {}).get('random_seed', 42),
        )
        
        # Setup and fit preprocessor
        self.preprocessor = DataPreprocessor(self.config)
        X_train_processed = self.preprocessor.fit_transform(X_train, y_train)
        X_val_processed = self.preprocessor.transform(X_val)
        X_test_processed = self.preprocessor.transform(X_test)
        
        self.feature_names = self.preprocessor.get_feature_names()
        
        # Convert back to DataFrames
        X_train_df = pd.DataFrame(X_train_processed, columns=self.feature_names)
        X_val_df = pd.DataFrame(X_val_processed, columns=self.feature_names)
        X_test_df = pd.DataFrame(X_test_processed, columns=self.feature_names)
        
        return X_train_df, X_val_df, X_test_df, y_train.reset_index(drop=True), y_val.reset_index(drop=True), y_test.reset_index(drop=True)
    
    def train(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        X_val: Optional[pd.DataFrame] = None,
        y_val: Optional[pd.Series] = None,
        **kwargs,
    ) -> BaseEstimator:
        """
        Train the model.
        
        Args:
            X_train: Training features
            y_train: Training target
            X_val: Validation features (optional, for early stopping)
            y_val: Validation target
            **kwargs: Additional arguments for model training
            
        Returns:
            Trained model
        """
        logger.info(f"Training {self.model_name} model...")
        
        hyperparams = self.config.get('hyperparameters', {}).get(
            self.config.get('model', {}).get('algorithm', 'default'), {}
        )
        hyperparams.update(kwargs)
        
        self.model = self._create_model(**hyperparams)
        
        # Handle early stopping if validation data provided
        fit_params = {}
        if X_val is not None and y_val is not None:
            fit_params = self._get_fit_params(X_val, y_val)
        
        self.model.fit(X_train, y_train, **fit_params)
        
        logger.info("Model training complete")
        return self.model
    
    def _get_fit_params(
        self,
        X_val: pd.DataFrame,
        y_val: pd.Series,
    ) -> Dict[str, Any]:
        """Get fit parameters for early stopping (model-specific)."""
        return {}
    
    def tune_hyperparameters(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        X_val: Optional[pd.DataFrame] = None,
        y_val: Optional[pd.Series] = None,
        n_trials: int = 100,
        timeout: int = 3600,
    ) -> Dict[str, Any]:
        """
        Tune hyperparameters using Optuna.
        
        Args:
            X_train: Training features
            y_train: Training target
            X_val: Validation features
            y_val: Validation target
            n_trials: Number of Optuna trials
            timeout: Timeout in seconds
            
        Returns:
            Best hyperparameters
        """
        import optuna
        from optuna.integration import OptunaSearchCV
        
        logger.info(f"Starting hyperparameter tuning for {self.model_name}...")
        
        tuning_config = self.config.get('tuning', {})
        search_space = self._get_hyperparameter_space()
        metric = tuning_config.get('metric', 'accuracy')
        direction = tuning_config.get('direction', 'maximize')
        
        def objective(trial):
            params = {}
            for param_name, param_config in search_space.items():
                param_type = param_config.get('type', 'float')
                
                if param_type == 'int':
                    params[param_name] = trial.suggest_int(
                        param_name,
                        param_config['low'],
                        param_config['high'],
                    )
                elif param_type == 'float':
                    params[param_name] = trial.suggest_float(
                        param_name,
                        param_config['low'],
                        param_config['high'],
                        log=param_config.get('log', False),
                    )
                elif param_type == 'categorical':
                    params[param_name] = trial.suggest_categorical(
                        param_name,
                        param_config['choices'],
                    )
            
            model = self._create_model(**params)
            
            # Cross-validation score
            cv_folds = self.config.get('training', {}).get('cv_folds', 5)
            scores = cross_val_score(model, X_train, y_train, cv=cv_folds, scoring=metric)
            
            return scores.mean()
        
        study = optuna.create_study(direction=direction)
        study.optimize(objective, n_trials=n_trials, timeout=timeout)
        
        self.best_params = study.best_params
        logger.info(f"Best hyperparameters: {self.best_params}")
        
        return self.best_params
    
    @abstractmethod
    def evaluate(
        self,
        X_test: pd.DataFrame,
        y_test: pd.Series,
    ) -> Dict[str, float]:
        """Evaluate model. Must be implemented by subclasses."""
        pass
    
    def save_model(
        self,
        output_dir: str,
        model_name: Optional[str] = None,
    ) -> str:
        """
        Save trained model and artifacts.
        
        Args:
            output_dir: Directory to save model
            model_name: Optional custom model name
            
        Returns:
            Path to saved model
        """
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        model_name = model_name or self.model_name
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Save model
        model_path = output_path / f"{model_name}_{timestamp}.joblib"
        joblib.dump(self.model, model_path)
        
        # Save preprocessor
        preprocessor_path = output_path / f"{model_name}_{timestamp}_preprocessor.joblib"
        joblib.dump(self.preprocessor, preprocessor_path)
        
        # Save metadata
        metadata = {
            'model_name': model_name,
            'timestamp': timestamp,
            'feature_names': self.feature_names,
            'metrics': self.metrics,
            'best_params': self.best_params,
            'config': self.config,
        }
        metadata_path = output_path / f"{model_name}_{timestamp}_metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2, default=str)
        
        logger.info(f"Model saved to {model_path}")
        
        return str(model_path)
    
    def load_model(self, model_path: str) -> None:
        """Load a saved model."""
        self.model = joblib.load(model_path)
        
        # Load preprocessor if exists
        preprocessor_path = model_path.replace('.joblib', '_preprocessor.joblib')
        if Path(preprocessor_path).exists():
            self.preprocessor = joblib.load(preprocessor_path)
        
        # Load metadata if exists
        metadata_path = model_path.replace('.joblib', '_metadata.json')
        if Path(metadata_path).exists():
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
                self.feature_names = metadata.get('feature_names', [])
                self.metrics = metadata.get('metrics', {})
                self.best_params = metadata.get('best_params', {})
        
        logger.info(f"Model loaded from {model_path}")
    
    def log_to_mlflow(self, run_name: Optional[str] = None) -> str:
        """
        Log model and metrics to MLflow.
        
        Returns:
            MLflow run ID
        """
        run_name = run_name or f"{self.model_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        with mlflow.start_run(run_name=run_name) as run:
            # Log parameters
            mlflow.log_params(self.best_params or self.config.get('hyperparameters', {}))
            
            # Log metrics
            for metric_name, metric_value in self.metrics.items():
                mlflow.log_metric(metric_name, metric_value)
            
            # Log model
            mlflow.sklearn.log_model(self.model, "model")
            
            # Log config
            mlflow.log_dict(self.config, "config.yaml")
            
            logger.info(f"Logged to MLflow run: {run.info.run_id}")
            
            return run.info.run_id
    
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Make predictions using trained model."""
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        if self.preprocessor is not None:
            X = self.preprocessor.transform(X)
        
        return self.model.predict(X)
    
    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """Make probability predictions (for classifiers)."""
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        if not hasattr(self.model, 'predict_proba'):
            raise ValueError("Model does not support probability predictions")
        
        if self.preprocessor is not None:
            X = self.preprocessor.transform(X)
        
        return self.model.predict_proba(X)
