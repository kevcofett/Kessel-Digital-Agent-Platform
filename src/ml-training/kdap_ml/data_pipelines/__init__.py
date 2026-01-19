"""
KDAP ML Data Pipelines
Unified data generation and ingestion infrastructure for ML training
"""

from .base import DataPipeline, PipelineConfig, PipelineResult, DataConnector
from .synthetic import (
    SyntheticDataGenerator,
    GeneratorConfig,
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
    IncrementalIngestionPipeline,
    BatchIngestionPipeline,
    DataverseConnector,
    AzureBlobConnector,
    AzureSQLConnector,
    FileIngestionConnector,
    APIConnector,
)
from .validation import (
    DataValidator,
    SchemaValidator,
    QualityValidator,
    StatisticalValidator,
    ValidationResult,
    ValidationSeverity,
    ValidationRule,
    RuleSet,
    DataProfiler,
    DataProfile,
)
from .transforms import (
    Transform,
    TransformPipeline,
    TransformResult,
    StandardScaler,
    MinMaxScaler,
    RobustScaler,
    LogTransform,
    LabelEncoder,
    OneHotEncoder,
    TargetEncoder,
    DatetimeFeatures,
    CyclicalEncoder,
    LagFeatures,
    RollingFeatures,
    TextCleaner,
    TextVectorizer,
)

__all__ = [
    # Base
    'DataPipeline',
    'PipelineConfig',
    'PipelineResult',
    'DataConnector',
    # Synthetic generators
    'SyntheticDataGenerator',
    'GeneratorConfig',
    'BudgetOptimizerDataGenerator',
    'PropensityDataGenerator',
    'ChurnDataGenerator',
    'AnomalyDataGenerator',
    'MediaMixDataGenerator',
    'LookalikeDataGenerator',
    'ResponseCurveDataGenerator',
    # Ingestion
    'DataIngestionPipeline',
    'IncrementalIngestionPipeline',
    'BatchIngestionPipeline',
    'DataverseConnector',
    'AzureBlobConnector',
    'AzureSQLConnector',
    'FileIngestionConnector',
    'APIConnector',
    # Validation
    'DataValidator',
    'SchemaValidator',
    'QualityValidator',
    'StatisticalValidator',
    'ValidationResult',
    'ValidationSeverity',
    'ValidationRule',
    'RuleSet',
    'DataProfiler',
    'DataProfile',
    # Transforms
    'Transform',
    'TransformPipeline',
    'TransformResult',
    'StandardScaler',
    'MinMaxScaler',
    'RobustScaler',
    'LogTransform',
    'LabelEncoder',
    'OneHotEncoder',
    'TargetEncoder',
    'DatetimeFeatures',
    'CyclicalEncoder',
    'LagFeatures',
    'RollingFeatures',
    'TextCleaner',
    'TextVectorizer',
]
