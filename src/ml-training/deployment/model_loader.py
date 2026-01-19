"""
KDAP ML Model Loader
Handles loading, caching, and managing ML models for inference
"""

import os
import logging
import asyncio
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass, field
import json
import pickle

import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)


class ModelNotFoundError(Exception):
    """Raised when a requested model is not found."""
    pass


class ModelLoadError(Exception):
    """Raised when a model fails to load."""
    pass


@dataclass
class LoadedModel:
    """Container for a loaded model with metadata."""
    name: str
    model: Any
    model_type: str
    version: str
    loaded_at: datetime
    config: Dict[str, Any] = field(default_factory=dict)
    feature_names: List[str] = field(default_factory=list)
    preprocessing: Optional[Any] = None


class ModelRegistry:
    """
    Registry for managing KDAP ML models.
    Handles loading, caching, and inference routing.
    """
    
    # Model type to class mapping
    MODEL_TYPES = {
        'budget_optimizer': 'kdap_ml.budget_optimizer.BudgetOptimizerTrainer',
        'propensity': 'kdap_ml.propensity.PropensityTrainer',
        'anomaly_detector': 'kdap_ml.anomaly_detector.AnomalyDetectorTrainer',
        'churn_predictor': 'kdap_ml.churn_predictor.ChurnPredictorTrainer',
        'media_mix': 'kdap_ml.media_mix.MediaMixTrainer',
        'lookalike': 'kdap_ml.lookalike.LookalikeTrainer',
        'response_curve': 'kdap_ml.response_curve.ResponseCurveTrainer',
    }
    
    def __init__(self, model_path: str):
        """
        Initialize the model registry.
        
        Args:
            model_path: Base path where models are stored
        """
        self.model_path = Path(model_path)
        self.models: Dict[str, LoadedModel] = {}
        self._lock = asyncio.Lock()
    
    async def load_all_models(self) -> None:
        """Load all available models from the model path."""
        if not self.model_path.exists():
            logger.warning(f"Model path does not exist: {self.model_path}")
            return
        
        # Find all model directories
        model_dirs = [d for d in self.model_path.iterdir() if d.is_dir()]
        
        for model_dir in model_dirs:
            try:
                await self.load_model(model_dir.name)
            except Exception as e:
                logger.error(f"Failed to load model {model_dir.name}: {e}")
    
    async def load_model(self, model_name: str) -> LoadedModel:
        """
        Load a specific model by name.
        
        Args:
            model_name: Name of the model to load
            
        Returns:
            LoadedModel instance
        """
        async with self._lock:
            model_dir = self.model_path / model_name
            
            if not model_dir.exists():
                raise ModelNotFoundError(f"Model directory not found: {model_dir}")
            
            # Load model config
            config_path = model_dir / "config.json"
            if config_path.exists():
                with open(config_path, 'r') as f:
                    config = json.load(f)
            else:
                config = {}
            
            # Determine model type
            model_type = config.get('model_type', self._infer_model_type(model_name))
            
            # Load the model file
            model_file = model_dir / "model.pkl"
            if not model_file.exists():
                # Try alternative formats
                model_file = model_dir / "model.joblib"
                if not model_file.exists():
                    raise ModelLoadError(f"No model file found in {model_dir}")
            
            # Load model
            logger.info(f"Loading model: {model_name}")
            
            if model_file.suffix == '.pkl':
                with open(model_file, 'rb') as f:
                    model = pickle.load(f)
            else:
                import joblib
                model = joblib.load(model_file)
            
            # Load preprocessing if available
            preprocessing = None
            preprocess_file = model_dir / "preprocessing.pkl"
            if preprocess_file.exists():
                with open(preprocess_file, 'rb') as f:
                    preprocessing = pickle.load(f)
            
            # Load feature names
            feature_names = config.get('feature_names', [])
            features_file = model_dir / "features.json"
            if features_file.exists():
                with open(features_file, 'r') as f:
                    feature_names = json.load(f)
            
            loaded_model = LoadedModel(
                name=model_name,
                model=model,
                model_type=model_type,
                version=config.get('version', '1.0.0'),
                loaded_at=datetime.utcnow(),
                config=config,
                feature_names=feature_names,
                preprocessing=preprocessing
            )
            
            self.models[model_name] = loaded_model
            logger.info(f"Successfully loaded model: {model_name} (type: {model_type})")
            
            return loaded_model
    
    async def unload_model(self, model_name: str) -> None:
        """Unload a specific model."""
        async with self._lock:
            if model_name in self.models:
                del self.models[model_name]
                logger.info(f"Unloaded model: {model_name}")
    
    async def unload_all_models(self) -> None:
        """Unload all models."""
        async with self._lock:
            self.models.clear()
            logger.info("Unloaded all models")
    
    async def reload_model(self, model_name: str) -> LoadedModel:
        """Reload a specific model."""
        await self.unload_model(model_name)
        return await self.load_model(model_name)
    
    def _infer_model_type(self, model_name: str) -> str:
        """Infer model type from name."""
        name_lower = model_name.lower()
        
        if 'budget' in name_lower:
            return 'budget_optimizer'
        elif 'propensity' in name_lower:
            return 'propensity'
        elif 'anomaly' in name_lower:
            return 'anomaly_detector'
        elif 'churn' in name_lower:
            return 'churn_predictor'
        elif 'mmm' in name_lower or 'media_mix' in name_lower:
            return 'media_mix'
        elif 'lookalike' in name_lower:
            return 'lookalike'
        elif 'response' in name_lower or 'curve' in name_lower:
            return 'response_curve'
        else:
            return 'unknown'
    
    async def predict(
        self,
        model_name: str,
        features: Dict[str, Any],
        return_probabilities: bool = False,
        explain: bool = False
    ) -> Dict[str, Any]:
        """
        Make predictions using a loaded model.
        
        Args:
            model_name: Name of the model to use
            features: Input features as dictionary
            return_probabilities: Whether to return probability scores
            explain: Whether to include feature explanations
            
        Returns:
            Dictionary with predictions and optional metadata
        """
        if model_name not in self.models:
            raise ModelNotFoundError(f"Model not loaded: {model_name}")
        
        loaded_model = self.models[model_name]
        model = loaded_model.model
        
        # Convert features to DataFrame
        if isinstance(features, dict):
            df = pd.DataFrame([features])
        else:
            df = pd.DataFrame(features)
        
        # Apply preprocessing if available
        if loaded_model.preprocessing is not None:
            df = loaded_model.preprocessing.transform(df)
        
        # Make predictions
        predictions = model.predict(df).tolist()
        
        result = {
            'predictions': predictions,
            'metadata': {
                'model_name': model_name,
                'model_type': loaded_model.model_type,
                'version': loaded_model.version,
            }
        }
        
        # Add probabilities if requested and available
        if return_probabilities and hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(df)
            if probabilities.ndim == 2:
                result['probabilities'] = probabilities[:, 1].tolist()
            else:
                result['probabilities'] = probabilities.tolist()
        
        # Add explanations if requested
        if explain:
            explanations = await self._explain_predictions(loaded_model, df)
            result['explanations'] = explanations
        
        return result
    
    async def _explain_predictions(
        self,
        loaded_model: LoadedModel,
        df: pd.DataFrame
    ) -> List[Dict[str, float]]:
        """Generate feature importance explanations."""
        model = loaded_model.model
        feature_names = loaded_model.feature_names or list(df.columns)
        
        explanations = []
        
        # Try SHAP explanations
        try:
            import shap
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(df)
            
            for i in range(len(df)):
                if isinstance(shap_values, list):
                    values = shap_values[1][i]  # For binary classification
                else:
                    values = shap_values[i]
                
                explanation = dict(zip(feature_names, values.tolist()))
                explanations.append(explanation)
                
        except Exception as e:
            logger.warning(f"SHAP explanation failed: {e}, falling back to feature importance")
            
            # Fallback to feature importance
            if hasattr(model, 'feature_importances_'):
                importance = dict(zip(feature_names, model.feature_importances_.tolist()))
                explanations = [importance] * len(df)
            else:
                explanations = [{}] * len(df)
        
        return explanations
    
    # =========================================================================
    # Model-specific inference methods
    # =========================================================================
    
    async def run_budget_optimization(
        self,
        total_budget: float,
        channels: List[str],
        historical_performance: Optional[Dict[str, float]] = None,
        constraints: Optional[Dict[str, Dict[str, float]]] = None
    ) -> Dict[str, Any]:
        """Run budget optimization model."""
        model_name = self._find_model_by_type('budget_optimizer')
        if not model_name:
            raise ModelNotFoundError("No budget optimizer model loaded")
        
        loaded_model = self.models[model_name]
        model = loaded_model.model
        
        # Build optimization input
        result = model.optimize(
            total_budget=total_budget,
            channels=channels,
            historical_performance=historical_performance or {},
            constraints=constraints or {}
        )
        
        return {
            'optimal_allocation': result.get('allocation', {}),
            'expected_roi': result.get('expected_roi', 0),
            'recommendations': result.get('recommendations', []),
            'model_version': loaded_model.version
        }
    
    async def score_propensity(
        self,
        customers: List[Dict[str, Any]],
        threshold: Optional[float] = None
    ) -> Dict[str, Any]:
        """Score customer propensity."""
        model_name = self._find_model_by_type('propensity')
        if not model_name:
            raise ModelNotFoundError("No propensity model loaded")
        
        loaded_model = self.models[model_name]
        model = loaded_model.model
        
        df = pd.DataFrame(customers)
        
        # Apply preprocessing
        if loaded_model.preprocessing:
            df = loaded_model.preprocessing.transform(df)
        
        # Get probabilities
        probabilities = model.predict_proba(df)[:, 1]
        
        # Apply threshold
        effective_threshold = threshold or loaded_model.config.get('optimal_threshold', 0.5)
        predictions = (probabilities >= effective_threshold).astype(int)
        
        return {
            'scores': probabilities.tolist(),
            'predictions': predictions.tolist(),
            'threshold': effective_threshold,
            'high_propensity_count': int(predictions.sum()),
            'model_version': loaded_model.version
        }
    
    async def detect_anomalies(
        self,
        metrics: List[Dict[str, Any]],
        sensitivity: float = 0.95
    ) -> Dict[str, Any]:
        """Detect anomalies in metrics."""
        model_name = self._find_model_by_type('anomaly_detector')
        if not model_name:
            raise ModelNotFoundError("No anomaly detector model loaded")
        
        loaded_model = self.models[model_name]
        model = loaded_model.model
        
        df = pd.DataFrame(metrics)
        
        # Get anomaly scores
        scores = model.decision_function(df)
        threshold = np.percentile(scores, (1 - sensitivity) * 100)
        anomalies = scores < threshold
        
        return {
            'anomaly_scores': scores.tolist(),
            'is_anomaly': anomalies.tolist(),
            'anomaly_count': int(anomalies.sum()),
            'threshold': float(threshold),
            'model_version': loaded_model.version
        }
    
    async def predict_churn(
        self,
        customers: List[Dict[str, Any]],
        return_risk_factors: bool = False
    ) -> Dict[str, Any]:
        """Predict customer churn."""
        model_name = self._find_model_by_type('churn_predictor')
        if not model_name:
            raise ModelNotFoundError("No churn predictor model loaded")
        
        loaded_model = self.models[model_name]
        model = loaded_model.model
        
        df = pd.DataFrame(customers)
        
        if loaded_model.preprocessing:
            df = loaded_model.preprocessing.transform(df)
        
        probabilities = model.predict_proba(df)[:, 1]
        predictions = model.predict(df)
        
        result = {
            'churn_probability': probabilities.tolist(),
            'will_churn': predictions.tolist(),
            'at_risk_count': int(predictions.sum()),
            'model_version': loaded_model.version
        }
        
        if return_risk_factors:
            explanations = await self._explain_predictions(loaded_model, df)
            result['risk_factors'] = explanations
        
        return result
    
    async def analyze_media_mix(
        self,
        time_series_data: List[Dict[str, Any]],
        optimize_budget: Optional[float] = None
    ) -> Dict[str, Any]:
        """Analyze media mix and attribution."""
        model_name = self._find_model_by_type('media_mix')
        if not model_name:
            raise ModelNotFoundError("No media mix model loaded")
        
        loaded_model = self.models[model_name]
        model = loaded_model.model
        
        df = pd.DataFrame(time_series_data)
        
        # Get channel contributions
        contributions = model.get_contributions(df)
        
        result = {
            'channel_contributions': contributions,
            'model_version': loaded_model.version
        }
        
        if optimize_budget:
            allocation = model.optimize_budget(optimize_budget)
            result['optimal_allocation'] = allocation
        
        return result
    
    async def score_lookalike(
        self,
        seed_audience: List[Dict[str, Any]],
        candidate_pool: List[Dict[str, Any]],
        top_n: int = 1000
    ) -> Dict[str, Any]:
        """Score lookalike audience."""
        model_name = self._find_model_by_type('lookalike')
        if not model_name:
            raise ModelNotFoundError("No lookalike model loaded")
        
        loaded_model = self.models[model_name]
        model = loaded_model.model
        
        seed_df = pd.DataFrame(seed_audience)
        candidate_df = pd.DataFrame(candidate_pool)
        
        # Score candidates
        scores = model.score(candidate_df, seed_df)
        
        # Get top N
        top_indices = np.argsort(scores)[-top_n:][::-1]
        
        return {
            'top_candidates': top_indices.tolist(),
            'scores': scores[top_indices].tolist(),
            'total_scored': len(candidate_pool),
            'model_version': loaded_model.version
        }
    
    async def analyze_response_curve(
        self,
        channel: str,
        spend_data: List[Dict[str, float]],
        curve_type: str = "hill"
    ) -> Dict[str, Any]:
        """Analyze response curve for a channel."""
        model_name = self._find_model_by_type('response_curve')
        if not model_name:
            raise ModelNotFoundError("No response curve model loaded")
        
        loaded_model = self.models[model_name]
        model = loaded_model.model
        
        df = pd.DataFrame(spend_data)
        
        # Fit curve
        params = model.fit_curve(df['spend'], df['response'], curve_type)
        
        # Generate curve points
        spend_range = np.linspace(0, df['spend'].max() * 1.5, 100)
        predicted_response = model.predict_response(spend_range)
        
        # Find optimal spend
        optimal_spend = model.find_optimal_spend()
        
        return {
            'channel': channel,
            'curve_type': curve_type,
            'parameters': params,
            'curve_points': {
                'spend': spend_range.tolist(),
                'response': predicted_response.tolist()
            },
            'optimal_spend': float(optimal_spend),
            'r_squared': float(model.r_squared),
            'model_version': loaded_model.version
        }
    
    def _find_model_by_type(self, model_type: str) -> Optional[str]:
        """Find a loaded model by type."""
        for name, model in self.models.items():
            if model.model_type == model_type:
                return name
        return None
