"""
Base classes for KDAP ML Data Pipelines
"""

import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union

import pandas as pd

logger = logging.getLogger(__name__)


class DataSourceType(Enum):
    """Types of data sources supported by pipelines."""
    SYNTHETIC = "synthetic"
    DATAVERSE = "dataverse"
    AZURE_BLOB = "azure_blob"
    AZURE_SQL = "azure_sql"
    FILE = "file"
    API = "api"


class PipelineStatus(Enum):
    """Pipeline execution status."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class PipelineConfig:
    """Configuration for data pipeline execution."""
    name: str
    source_type: DataSourceType
    target_model: str
    batch_size: int = 10000
    validate_data: bool = True
    apply_transforms: bool = True
    cache_results: bool = False
    retry_attempts: int = 3
    timeout_seconds: int = 3600
    parameters: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert config to dictionary."""
        return {
            'name': self.name,
            'source_type': self.source_type.value,
            'target_model': self.target_model,
            'batch_size': self.batch_size,
            'validate_data': self.validate_data,
            'apply_transforms': self.apply_transforms,
            'cache_results': self.cache_results,
            'retry_attempts': self.retry_attempts,
            'timeout_seconds': self.timeout_seconds,
            'parameters': self.parameters,
        }


@dataclass
class PipelineMetrics:
    """Metrics collected during pipeline execution."""
    rows_processed: int = 0
    rows_validated: int = 0
    rows_failed: int = 0
    rows_transformed: int = 0
    processing_time_seconds: float = 0.0
    validation_errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)


@dataclass
class PipelineResult:
    """Result of pipeline execution."""
    pipeline_id: str
    config: PipelineConfig
    status: PipelineStatus
    data: Optional[pd.DataFrame]
    metrics: PipelineMetrics
    started_at: datetime
    completed_at: Optional[datetime]
    error_message: Optional[str] = None

    @property
    def duration_seconds(self) -> float:
        """Calculate pipeline duration."""
        if self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        return 0.0

    @property
    def success(self) -> bool:
        """Check if pipeline completed successfully."""
        return self.status == PipelineStatus.COMPLETED and self.data is not None

    def to_dict(self) -> Dict[str, Any]:
        """Convert result to dictionary (excluding data)."""
        return {
            'pipeline_id': self.pipeline_id,
            'config': self.config.to_dict(),
            'status': self.status.value,
            'has_data': self.data is not None,
            'row_count': len(self.data) if self.data is not None else 0,
            'metrics': {
                'rows_processed': self.metrics.rows_processed,
                'rows_validated': self.metrics.rows_validated,
                'rows_failed': self.metrics.rows_failed,
                'rows_transformed': self.metrics.rows_transformed,
                'processing_time_seconds': self.metrics.processing_time_seconds,
                'validation_error_count': len(self.metrics.validation_errors),
                'warning_count': len(self.metrics.warnings),
            },
            'started_at': self.started_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'duration_seconds': self.duration_seconds,
            'error_message': self.error_message,
        }


class DataPipeline(ABC):
    """Abstract base class for all data pipelines."""

    def __init__(self, config: PipelineConfig):
        self.config = config
        self._pipeline_id = self._generate_pipeline_id()
        self._status = PipelineStatus.PENDING
        self._metrics = PipelineMetrics()
        self._started_at: Optional[datetime] = None
        self._completed_at: Optional[datetime] = None

    def _generate_pipeline_id(self) -> str:
        """Generate unique pipeline ID."""
        import uuid
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        return f"{self.config.name}_{timestamp}_{uuid.uuid4().hex[:8]}"

    @property
    def pipeline_id(self) -> str:
        return self._pipeline_id

    @property
    def status(self) -> PipelineStatus:
        return self._status

    @abstractmethod
    def extract(self) -> pd.DataFrame:
        """Extract data from source."""
        pass

    @abstractmethod
    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Transform extracted data."""
        pass

    @abstractmethod
    def validate(self, data: pd.DataFrame) -> bool:
        """Validate data before output."""
        pass

    def run(self) -> PipelineResult:
        """Execute the full ETL pipeline."""
        self._started_at = datetime.now()
        self._status = PipelineStatus.RUNNING
        data = None
        error_message = None

        try:
            logger.info(f"Starting pipeline: {self._pipeline_id}")

            # Extract
            logger.info("Extracting data...")
            data = self.extract()
            self._metrics.rows_processed = len(data)

            # Validate
            if self.config.validate_data:
                logger.info("Validating data...")
                if not self.validate(data):
                    raise ValueError("Data validation failed")
                self._metrics.rows_validated = len(data)

            # Transform
            if self.config.apply_transforms:
                logger.info("Transforming data...")
                data = self.transform(data)
                self._metrics.rows_transformed = len(data)

            self._status = PipelineStatus.COMPLETED
            logger.info(f"Pipeline completed successfully: {len(data)} rows")

        except Exception as e:
            self._status = PipelineStatus.FAILED
            error_message = str(e)
            logger.error(f"Pipeline failed: {error_message}")

        finally:
            self._completed_at = datetime.now()
            self._metrics.processing_time_seconds = (
                self._completed_at - self._started_at
            ).total_seconds()

        return PipelineResult(
            pipeline_id=self._pipeline_id,
            config=self.config,
            status=self._status,
            data=data,
            metrics=self._metrics,
            started_at=self._started_at,
            completed_at=self._completed_at,
            error_message=error_message,
        )

    def add_warning(self, message: str) -> None:
        """Add a warning to pipeline metrics."""
        self._metrics.warnings.append(message)
        logger.warning(f"Pipeline warning: {message}")

    def add_validation_error(self, message: str) -> None:
        """Add a validation error to pipeline metrics."""
        self._metrics.validation_errors.append(message)
        self._metrics.rows_failed += 1
        logger.error(f"Validation error: {message}")


class DataConnector(ABC):
    """Abstract base class for data source connectors."""

    def __init__(self, connection_config: Dict[str, Any]):
        self.connection_config = connection_config
        self._connected = False

    @abstractmethod
    def connect(self) -> bool:
        """Establish connection to data source."""
        pass

    @abstractmethod
    def disconnect(self) -> None:
        """Close connection to data source."""
        pass

    @abstractmethod
    def read(self, query: Optional[str] = None, **kwargs) -> pd.DataFrame:
        """Read data from source."""
        pass

    @abstractmethod
    def write(self, data: pd.DataFrame, **kwargs) -> bool:
        """Write data to destination."""
        pass

    @property
    def is_connected(self) -> bool:
        return self._connected

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.disconnect()
