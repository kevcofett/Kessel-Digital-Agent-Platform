"""
KDAP ML Training Package
Kessel Digital Agent Platform - Machine Learning Models
"""

__version__ = "1.1.0"

from kdap_ml.config import load_config, get_model_config, ConfigManager
from kdap_ml.base import BaseTrainer
from kdap_ml.preprocessing import DataPreprocessor, create_train_test_split

# Core Models (v1.0)
from kdap_ml.budget_optimizer import BudgetOptimizerTrainer
from kdap_ml.propensity import PropensityTrainer
from kdap_ml.anomaly_detector import AnomalyDetectorTrainer

# Extended Models (v1.1)
from kdap_ml.churn_predictor import ChurnPredictorTrainer
from kdap_ml.media_mix import MediaMixTrainer
from kdap_ml.lookalike import LookalikeTrainer
from kdap_ml.response_curve import ResponseCurveTrainer

__all__ = [
    # Config
    "load_config",
    "get_model_config",
    "ConfigManager",
    # Base
    "BaseTrainer",
    "DataPreprocessor",
    "create_train_test_split",
    # Core Models
    "BudgetOptimizerTrainer",
    "PropensityTrainer",
    "AnomalyDetectorTrainer",
    # Extended Models
    "ChurnPredictorTrainer",
    "MediaMixTrainer",
    "LookalikeTrainer",
    "ResponseCurveTrainer",
]

# Model registry for CLI
MODEL_REGISTRY = {
    'budget': BudgetOptimizerTrainer,
    'propensity': PropensityTrainer,
    'anomaly': AnomalyDetectorTrainer,
    'churn': ChurnPredictorTrainer,
    'mmm': MediaMixTrainer,
    'lookalike': LookalikeTrainer,
    'response': ResponseCurveTrainer,
}
