"""
KDAP ML Data Pipelines
Unified data generation and ingestion infrastructure for ML training
"""

from .base import DataPipeline, PipelineConfig, PipelineResult
from .synthetic import (
    SyntheticDataGenerator,
    BudgetOptimizerDataGenerator,
    PropensityDataGenerator,
    ChurnDataGenerator,
    AnomalyDataGenerator,
    MediaMixDataGenerator,
    LookalikeDataGenerator,
    ResponseCurveDataGenerator,
)
from .ingestion import (
    DataIngestionPipeline,
    DataverseConnector,
    AzureBlobConnector,
    AzureSQLConnector,
    FileIngestionConnector,
    APIConnector,
)
from .validation import DataValidator, ValidationResult, SchemaValidator
from .transforms import (
    DataTransformer,
    FeatureEncoder,
    TimeSeriesTransformer,
    AggregationTransformer,
)

__all__ = [
    # Base
    'DataPipeline',
    'PipelineConfig',
    'PipelineResult',
    # Synthetic generators
    'SyntheticDataGenerator',
    'BudgetOptimizerDataGenerator',
    'PropensityDataGenerator',
    'ChurnDataGenerator',
    'AnomalyDataGenerator',
    'MediaMixDataGenerator',
    'LookalikeDataGenerator',
    'ResponseCurveDataGenerator',
    # Ingestion
    'DataIngestionPipeline',
    'DataverseConnector',
    'AzureBlobConnector',
    'AzureSQLConnector',
    'FileIngestionConnector',
    'APIConnector',
    # Validation
    'DataValidator',
    'ValidationResult',
    'SchemaValidator',
    # Transforms
    'DataTransformer',
    'FeatureEncoder',
    'TimeSeriesTransformer',
    'AggregationTransformer',
]
