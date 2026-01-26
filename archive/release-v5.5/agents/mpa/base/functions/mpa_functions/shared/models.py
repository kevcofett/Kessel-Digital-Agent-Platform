"""
Data models and type definitions for MPA Azure Functions.
"""

from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional
from enum import Enum


class ConfidenceLevel(str, Enum):
    """Confidence level for projections and data."""
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"
    VERY_LOW = "Very Low"


class KPICategory(str, Enum):
    """KPI categories."""
    COST = "Cost"
    PERFORMANCE = "Performance"
    ENGAGEMENT = "Engagement"
    CONVERSION = "Conversion"
    REVENUE = "Revenue"
    QUALITY = "Quality"
    REACH = "Reach"


class KPIDirection(str, Enum):
    """Whether higher or lower KPI values are better."""
    HIGHER_IS_BETTER = "Higher is Better"
    LOWER_IS_BETTER = "Lower is Better"
    TARGET_RANGE = "Target Range"


class ChannelCategory(str, Enum):
    """Channel categories."""
    SEARCH = "Search"
    SOCIAL = "Social"
    DISPLAY = "Display"
    VIDEO = "Video"
    AUDIO = "Audio"
    COMMERCE = "Commerce"
    OUT_OF_HOME = "Out of Home"
    AFFILIATE = "Affiliate"


class FunnelPosition(str, Enum):
    """Marketing funnel positions."""
    UPPER_FUNNEL = "Upper Funnel"
    MID_FUNNEL = "Mid Funnel"
    LOWER_FUNNEL = "Lower Funnel"
    FULL_FUNNEL = "Full Funnel"


@dataclass
class Benchmark:
    """Benchmark data model."""
    id: str
    vertical: str
    channel: Optional[str]
    metric_name: str
    metric_type: str
    low: float
    median: float
    high: float
    best_in_class: Optional[float]
    confidence: str
    data_source: str
    data_period: str
    last_validated: Optional[str] = None
    sub_vertical: Optional[str] = None
    trend_notes: Optional[str] = None


@dataclass
class KPIDefinition:
    """KPI definition data model."""
    id: str
    code: str
    name: str
    category: str
    formula: str
    formula_inputs: List[str] = field(default_factory=list)
    unit: Optional[str] = None
    format_pattern: Optional[str] = None
    direction: Optional[str] = None
    description: Optional[str] = None
    interpretation_guide: Optional[str] = None
    applicable_channels: List[str] = field(default_factory=list)
    applicable_objectives: List[str] = field(default_factory=list)
    related_kpis: List[str] = field(default_factory=list)
    sort_order: int = 100


@dataclass
class Channel:
    """Channel definition data model."""
    id: str
    name: str
    code: str
    category: str
    description: Optional[str] = None
    capabilities: Dict[str, Any] = field(default_factory=dict)
    targeting_options: List[str] = field(default_factory=list)
    ad_formats: List[str] = field(default_factory=list)
    buying_models: List[str] = field(default_factory=list)
    min_budget: float = 0
    objective_fit: Dict[str, int] = field(default_factory=dict)
    funnel_position: Optional[str] = None
    primary_kpis: List[str] = field(default_factory=list)
    sort_order: int = 100


@dataclass
class ChannelProjection:
    """Projection results for a single channel."""
    channel: str
    budget: float
    impressions: int
    clicks: int
    conversions: float
    cpm: float
    ctr: float
    cvr: float
    cpc: float
    cpa: float
    revenue: float
    roas: float
    benchmark_source: str
    benchmark_period: str
    confidence: str


@dataclass
class ProjectionSummary:
    """Summary of all channel projections."""
    total_budget: float
    total_impressions: int
    total_clicks: int
    total_conversions: float
    overall_ctr: float
    overall_cvr: float
    overall_cpc: float
    overall_cpa: float
    total_revenue: float
    overall_roas: float
    campaign_days: int


@dataclass
class ProjectionResult:
    """Complete projection result."""
    status: str
    summary: ProjectionSummary
    by_channel: Dict[str, ChannelProjection]
    confidence_level: str
    data_provenance: Dict[str, Any]
    metadata: Dict[str, Any]
    warnings: List[str] = field(default_factory=list)


@dataclass
class GapAnalysis:
    """Gap analysis between targets and projections."""
    metric: str
    target: float
    projected: float
    gap: float
    gap_percent: float
    status: str  # "on_track", "at_risk", "behind"


@dataclass
class ValidationResult:
    """Result of request validation."""
    is_valid: bool
    error_message: Optional[str] = None
    errors: Optional[List[str]] = None


@dataclass
class Session:
    """User session data."""
    session_id: str
    user_id: str
    client_id: Optional[str]
    plan_id: Optional[str]
    created_at: str
    updated_at: str
    context: Dict[str, Any] = field(default_factory=dict)
