"""
KDAP ML Training Package
Kessel Digital Agent Platform - Machine Learning Models
"""

__version__ = "1.0.0"

from kdap_ml.config import load_config, get_model_config
from kdap_ml.base import BaseTrainer
from kdap_ml.preprocessing import DataPreprocessor
from kdap_ml.budget_optimizer import BudgetOptimizerTrainer
from kdap_ml.propensity import PropensityTrainer
from kdap_ml.anomaly_detector import AnomalyDetectorTrainer

__all__ = [
    "load_config",
    "get_model_config",
    "BaseTrainer",
    "DataPreprocessor",
    "BudgetOptimizerTrainer",
    "PropensityTrainer",
    "AnomalyDetectorTrainer",
]
