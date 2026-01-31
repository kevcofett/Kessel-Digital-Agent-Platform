# VS Code Handoff: Enterprise DVO Phase 4 - Audit Logger + SIEM Export

## Context
This is Phase 4 of 5 for enterprise-hardening the DVO (DevOps) agent for Mastercard managed environments.

**Completed Phases:**
- Phase 1: Azure AD + RBAC ✓
- Phase 2: Capability Manager + Graceful Degradation ✓
- Phase 3: Policy Enforcer + Approval Workflows ✓

**This Phase:** Audit Logger + SIEM Export

## Objective
Implement comprehensive audit logging for all DVO operations with SIEM-compatible export formats for security monitoring and compliance reporting.

---

## File 1: `src/enterprise/audit/models.py`

```python
"""
Audit logging models for DVO agent.
"""
from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import uuid


class AuditEventType(str, Enum):
    """Types of auditable events."""
    # Authentication
    AUTH_LOGIN = "auth.login"
    AUTH_LOGOUT = "auth.logout"
    AUTH_FAILED = "auth.failed"
    AUTH_TOKEN_REFRESH = "auth.token_refresh"

    # Authorization
    AUTHZ_GRANTED = "authz.granted"
    AUTHZ_DENIED = "authz.denied"
    AUTHZ_ROLE_CHANGE = "authz.role_change"

    # Deployment Operations
    DEPLOY_INITIATED = "deploy.initiated"
    DEPLOY_VALIDATED = "deploy.validated"
    DEPLOY_STARTED = "deploy.started"
    DEPLOY_COMPLETED = "deploy.completed"
    DEPLOY_FAILED = "deploy.failed"
    DEPLOY_ROLLED_BACK = "deploy.rolled_back"

    # Approval Workflow
    APPROVAL_REQUESTED = "approval.requested"
    APPROVAL_GRANTED = "approval.granted"
    APPROVAL_DENIED = "approval.denied"
    APPROVAL_EXPIRED = "approval.expired"
    APPROVAL_CANCELLED = "approval.cancelled"

    # Policy Events
    POLICY_EVALUATED = "policy.evaluated"
    POLICY_CREATED = "policy.created"
    POLICY_MODIFIED = "policy.modified"
    POLICY_DELETED = "policy.deleted"

    # Capability Events
    CAPABILITY_ENABLED = "capability.enabled"
    CAPABILITY_DISABLED = "capability.disabled"
    CAPABILITY_DEGRADED = "capability.degraded"

    # Configuration
    CONFIG_CHANGED = "config.changed"
    CONFIG_ACCESSED = "config.accessed"

    # System Events
    SYSTEM_STARTUP = "system.startup"
    SYSTEM_SHUTDOWN = "system.shutdown"
    SYSTEM_ERROR = "system.error"


class AuditSeverity(str, Enum):
    """Severity levels for audit events."""
    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class AuditOutcome(str, Enum):
    """Outcome of audited action."""
    SUCCESS = "success"
    FAILURE = "failure"
    PENDING = "pending"
    UNKNOWN = "unknown"


class AuditEvent(BaseModel):
    """A single audit event."""
    # Identity
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    correlation_id: Optional[str] = Field(None, description="Links related events")

    # Timestamp
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Event classification
    event_type: AuditEventType
    severity: AuditSeverity = AuditSeverity.INFO
    outcome: AuditOutcome = AuditOutcome.SUCCESS

    # Actor (who)
    actor_id: Optional[str] = None
    actor_email: Optional[str] = None
    actor_roles: list[str] = Field(default_factory=list)
    actor_ip: Optional[str] = None
    actor_user_agent: Optional[str] = None

    # Action (what)
    action: str = Field(..., description="Human-readable action description")
    resource_type: Optional[str] = Field(None, description="Type of resource affected")
    resource_id: Optional[str] = Field(None, description="ID of resource affected")

    # Context (where/how)
    environment: Optional[str] = None
    component: str = Field(default="dvo-agent")

    # Details
    details: dict[str, Any] = Field(default_factory=dict)
    error_message: Optional[str] = None

    # Security
    data_classification: str = Field(default="internal", description="Data sensitivity level")

    def to_cef(self) -> str:
        """Convert to CEF (Common Event Format) for SIEM ingestion."""
        # CEF:Version|Device Vendor|Device Product|Device Version|Signature ID|Name|Severity|Extension
        severity_map = {
            AuditSeverity.DEBUG: 1,
            AuditSeverity.INFO: 3,
            AuditSeverity.WARNING: 5,
            AuditSeverity.ERROR: 7,
            AuditSeverity.CRITICAL: 10
        }

        extensions = [
            f"rt={int(self.timestamp.timestamp() * 1000)}",
            f"src={self.actor_ip or 'unknown'}",
            f"suser={self.actor_email or self.actor_id or 'unknown'}",
            f"outcome={self.outcome.value}",
            f"cs1={self.environment or 'unknown'}",
            f"cs1Label=Environment",
            f"cs2={self.resource_type or 'unknown'}",
            f"cs2Label=ResourceType",
            f"cs3={self.resource_id or 'unknown'}",
            f"cs3Label=ResourceId",
            f"msg={self.action}"
        ]

        return (
            f"CEF:0|KesselDigital|DVOAgent|1.0|{self.event_type.value}|"
            f"{self.action}|{severity_map.get(self.severity, 5)}|"
            f"{' '.join(extensions)}"
        )

    def to_json_siem(self) -> dict[str, Any]:
        """Convert to JSON format for SIEM ingestion."""
        return {
            "@timestamp": self.timestamp.isoformat() + "Z",
            "event": {
                "id": self.id,
                "kind": "event",
                "category": self.event_type.value.split(".")[0],
                "type": self.event_type.value,
                "outcome": self.outcome.value,
                "severity": self.severity.value
            },
            "user": {
                "id": self.actor_id,
                "email": self.actor_email,
                "roles": self.actor_roles
            },
            "source": {
                "ip": self.actor_ip,
                "user_agent": self.actor_user_agent
            },
            "message": self.action,
            "labels": {
                "environment": self.environment,
                "component": self.component,
                "resource_type": self.resource_type,
                "resource_id": self.resource_id,
                "correlation_id": self.correlation_id
            },
            "error": {
                "message": self.error_message
            } if self.error_message else None,
            "dvo": {
                "details": self.details,
                "data_classification": self.data_classification
            }
        }


class AuditQuery(BaseModel):
    """Query parameters for audit log search."""
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    event_types: list[AuditEventType] = Field(default_factory=list)
    severities: list[AuditSeverity] = Field(default_factory=list)
    outcomes: list[AuditOutcome] = Field(default_factory=list)
    actor_id: Optional[str] = None
    actor_email: Optional[str] = None
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    environment: Optional[str] = None
    correlation_id: Optional[str] = None
    search_text: Optional[str] = None
    limit: int = Field(default=100, le=1000)
    offset: int = Field(default=0, ge=0)


class AuditExportFormat(str, Enum):
    """Supported export formats."""
    JSON = "json"
    JSON_LINES = "jsonl"
    CEF = "cef"
    CSV = "csv"
```

---

## File 2: `src/enterprise/audit/logger.py`

```python
"""
Audit logger implementation for DVO agent.
"""
import logging
import json
import asyncio
from typing import Any, Optional, Callable
from datetime import datetime, timedelta
from pathlib import Path
from collections import deque
import hashlib

from .models import (
    AuditEvent, AuditEventType, AuditSeverity, AuditOutcome,
    AuditQuery, AuditExportFormat
)

logger = logging.getLogger(__name__)


class AuditLogger:
    """
    Comprehensive audit logging for DVO agent.

    Features:
    - In-memory buffer with configurable retention
    - File persistence with rotation
    - SIEM export (CEF, JSON)
    - Tamper-evident checksums
    - Async batch export
    """

    def __init__(
        self,
        buffer_size: int = 10000,
        persist_path: Optional[Path] = None,
        retention_days: int = 90,
        enable_checksums: bool = True
    ):
        """
        Initialize audit logger.

        Args:
            buffer_size: Max events to keep in memory
            persist_path: Path for file persistence (optional)
            retention_days: Days to retain logs
            enable_checksums: Enable tamper-evident checksums
        """
        self.buffer: deque[AuditEvent] = deque(maxlen=buffer_size)
        self.persist_path = persist_path
        self.retention_days = retention_days
        self.enable_checksums = enable_checksums

        # Checksum chain for tamper evidence
        self._last_checksum: Optional[str] = None

        # Export callbacks for real-time SIEM integration
        self._export_callbacks: list[Callable[[AuditEvent], None]] = []

        # Ensure persist directory exists
        if self.persist_path:
            self.persist_path.mkdir(parents=True, exist_ok=True)

        # Log startup
        self.log(
            event_type=AuditEventType.SYSTEM_STARTUP,
            action="Audit logger initialized",
            details={
                "buffer_size": buffer_size,
                "persist_path": str(persist_path) if persist_path else None,
                "retention_days": retention_days
            }
        )

        logger.info(f"AuditLogger initialized (buffer={buffer_size}, retention={retention_days}d)")

    def log(
        self,
        event_type: AuditEventType,
        action: str,
        actor_id: Optional[str] = None,
        actor_email: Optional[str] = None,
        actor_roles: Optional[list[str]] = None,
        actor_ip: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        environment: Optional[str] = None,
        outcome: AuditOutcome = AuditOutcome.SUCCESS,
        severity: Optional[AuditSeverity] = None,
        details: Optional[dict[str, Any]] = None,
        error_message: Optional[str] = None,
        correlation_id: Optional[str] = None
    ) -> AuditEvent:
        """
        Log an audit event.

        Args:
            event_type: Type of event
            action: Human-readable action description
            actor_*: Information about who performed the action
            resource_*: Information about what was affected
            environment: Target environment
            outcome: Success/failure/pending
            severity: Override auto-determined severity
            details: Additional event details
            error_message: Error message if outcome is failure
            correlation_id: ID to link related events

        Returns:
            Created AuditEvent
        """
        # Auto-determine severity if not provided
        if severity is None:
            severity = self._determine_severity(event_type, outcome)

        event = AuditEvent(
            event_type=event_type,
            action=action,
            actor_id=actor_id,
            actor_email=actor_email,
            actor_roles=actor_roles or [],
            actor_ip=actor_ip,
            resource_type=resource_type,
            resource_id=resource_id,
            environment=environment,
            outcome=outcome,
            severity=severity,
            details=details or {},
            error_message=error_message,
            correlation_id=correlation_id
        )

        # Add tamper-evident checksum
        if self.enable_checksums:
            event.details["_checksum"] = self._compute_checksum(event)

        # Store in buffer
        self.buffer.append(event)

        # Persist to file if configured
        if self.persist_path:
            self._persist_event(event)

        # Notify export callbacks
        for callback in self._export_callbacks:
            try:
                callback(event)
            except Exception as e:
                logger.error(f"Export callback failed: {e}")

        # Log to standard logger for immediate visibility
        log_level = {
            AuditSeverity.DEBUG: logging.DEBUG,
            AuditSeverity.INFO: logging.INFO,
            AuditSeverity.WARNING: logging.WARNING,
            AuditSeverity.ERROR: logging.ERROR,
            AuditSeverity.CRITICAL: logging.CRITICAL
        }.get(severity, logging.INFO)

        logger.log(
            log_level,
            f"AUDIT [{event_type.value}] {action} | actor={actor_email or actor_id} | outcome={outcome.value}"
        )

        return event

    def query(self, query: AuditQuery) -> list[AuditEvent]:
        """
        Query audit logs.

        Args:
            query: Query parameters

        Returns:
            Matching audit events
        """
        results = list(self.buffer)

        # Apply filters
        if query.start_time:
            results = [e for e in results if e.timestamp >= query.start_time]
        if query.end_time:
            results = [e for e in results if e.timestamp <= query.end_time]
        if query.event_types:
            results = [e for e in results if e.event_type in query.event_types]
        if query.severities:
            results = [e for e in results if e.severity in query.severities]
        if query.outcomes:
            results = [e for e in results if e.outcome in query.outcomes]
        if query.actor_id:
            results = [e for e in results if e.actor_id == query.actor_id]
        if query.actor_email:
            results = [e for e in results if e.actor_email == query.actor_email]
        if query.resource_type:
            results = [e for e in results if e.resource_type == query.resource_type]
        if query.resource_id:
            results = [e for e in results if e.resource_id == query.resource_id]
        if query.environment:
            results = [e for e in results if e.environment == query.environment]
        if query.correlation_id:
            results = [e for e in results if e.correlation_id == query.correlation_id]
        if query.search_text:
            search_lower = query.search_text.lower()
            results = [
                e for e in results
                if search_lower in e.action.lower()
                or search_lower in json.dumps(e.details).lower()
            ]

        # Sort by timestamp descending
        results.sort(key=lambda e: e.timestamp, reverse=True)

        # Apply pagination
        return results[query.offset:query.offset + query.limit]

    def export(
        self,
        format: AuditExportFormat,
        query: Optional[AuditQuery] = None
    ) -> str:
        """
        Export audit logs in specified format.

        Args:
            format: Export format
            query: Optional query to filter events

        Returns:
            Formatted export string
        """
        events = self.query(query) if query else list(self.buffer)

        if format == AuditExportFormat.JSON:
            return json.dumps([e.to_json_siem() for e in events], indent=2, default=str)

        elif format == AuditExportFormat.JSON_LINES:
            return "\n".join(json.dumps(e.to_json_siem(), default=str) for e in events)

        elif format == AuditExportFormat.CEF:
            return "\n".join(e.to_cef() for e in events)

        elif format == AuditExportFormat.CSV:
            headers = [
                "timestamp", "event_type", "severity", "outcome",
                "actor_id", "actor_email", "action",
                "resource_type", "resource_id", "environment", "error_message"
            ]
            lines = [",".join(headers)]
            for e in events:
                row = [
                    e.timestamp.isoformat(),
                    e.event_type.value,
                    e.severity.value,
                    e.outcome.value,
                    e.actor_id or "",
                    e.actor_email or "",
                    f'"{e.action}"',
                    e.resource_type or "",
                    e.resource_id or "",
                    e.environment or "",
                    f'"{e.error_message or ""}"'
                ]
                lines.append(",".join(row))
            return "\n".join(lines)

        raise ValueError(f"Unknown format: {format}")

    def register_export_callback(self, callback: Callable[[AuditEvent], None]) -> None:
        """Register a callback for real-time event export."""
        self._export_callbacks.append(callback)
        logger.info(f"Registered export callback: {callback.__name__}")

    def get_statistics(self) -> dict[str, Any]:
        """Get audit log statistics."""
        events = list(self.buffer)

        if not events:
            return {"total_events": 0}

        # Count by type
        type_counts = {}
        for e in events:
            type_counts[e.event_type.value] = type_counts.get(e.event_type.value, 0) + 1

        # Count by severity
        severity_counts = {}
        for e in events:
            severity_counts[e.severity.value] = severity_counts.get(e.severity.value, 0) + 1

        # Count by outcome
        outcome_counts = {}
        for e in events:
            outcome_counts[e.outcome.value] = outcome_counts.get(e.outcome.value, 0) + 1

        return {
            "total_events": len(events),
            "oldest_event": events[0].timestamp.isoformat() if events else None,
            "newest_event": events[-1].timestamp.isoformat() if events else None,
            "by_type": type_counts,
            "by_severity": severity_counts,
            "by_outcome": outcome_counts,
            "buffer_capacity": self.buffer.maxlen,
            "buffer_used_pct": len(events) / self.buffer.maxlen * 100 if self.buffer.maxlen else 0
        }

    def _determine_severity(self, event_type: AuditEventType, outcome: AuditOutcome) -> AuditSeverity:
        """Auto-determine severity based on event type and outcome."""
        # Critical events
        if event_type in [
            AuditEventType.SYSTEM_ERROR,
            AuditEventType.AUTH_FAILED,
            AuditEventType.AUTHZ_DENIED
        ]:
            return AuditSeverity.WARNING if outcome == AuditOutcome.SUCCESS else AuditSeverity.ERROR

        # Security events
        if event_type in [
            AuditEventType.AUTHZ_ROLE_CHANGE,
            AuditEventType.POLICY_MODIFIED,
            AuditEventType.POLICY_DELETED
        ]:
            return AuditSeverity.WARNING

        # Deployment failures
        if event_type == AuditEventType.DEPLOY_FAILED:
            return AuditSeverity.ERROR

        # Default based on outcome
        if outcome == AuditOutcome.FAILURE:
            return AuditSeverity.ERROR

        return AuditSeverity.INFO

    def _compute_checksum(self, event: AuditEvent) -> str:
        """Compute tamper-evident checksum for event."""
        # Include previous checksum for chain
        data = f"{self._last_checksum or 'GENESIS'}|{event.id}|{event.timestamp.isoformat()}|{event.event_type.value}|{event.action}"
        checksum = hashlib.sha256(data.encode()).hexdigest()[:16]
        self._last_checksum = checksum
        return checksum

    def _persist_event(self, event: AuditEvent) -> None:
        """Persist event to file."""
        if not self.persist_path:
            return

        # Daily log files
        date_str = event.timestamp.strftime("%Y-%m-%d")
        log_file = self.persist_path / f"audit-{date_str}.jsonl"

        with open(log_file, "a") as f:
            f.write(json.dumps(event.to_json_siem(), default=str) + "\n")

    async def cleanup_old_logs(self) -> int:
        """Remove logs older than retention period."""
        if not self.persist_path:
            return 0

        cutoff = datetime.utcnow() - timedelta(days=self.retention_days)
        removed = 0

        for log_file in self.persist_path.glob("audit-*.jsonl"):
            try:
                date_str = log_file.stem.replace("audit-", "")
                file_date = datetime.strptime(date_str, "%Y-%m-%d")
                if file_date < cutoff:
                    log_file.unlink()
                    removed += 1
                    logger.info(f"Removed old audit log: {log_file}")
            except (ValueError, OSError) as e:
                logger.warning(f"Error processing {log_file}: {e}")

        return removed


# Global audit logger instance
_audit_logger: Optional[AuditLogger] = None


def get_audit_logger() -> AuditLogger:
    """Get or create the global audit logger."""
    global _audit_logger
    if _audit_logger is None:
        _audit_logger = AuditLogger()
    return _audit_logger


def audit_log(
    event_type: AuditEventType,
    action: str,
    **kwargs
) -> AuditEvent:
    """Convenience function for logging audit events."""
    return get_audit_logger().log(event_type, action, **kwargs)
```

---

## File 3: `src/enterprise/audit/siem.py`

```python
"""
SIEM integration for audit log export.
"""
import logging
import asyncio
import aiohttp
from typing import Any, Optional
from datetime import datetime
from abc import ABC, abstractmethod

from .models import AuditEvent, AuditExportFormat

logger = logging.getLogger(__name__)


class SIEMExporter(ABC):
    """Base class for SIEM exporters."""

    @abstractmethod
    async def export(self, event: AuditEvent) -> bool:
        """Export a single event to SIEM."""
        pass

    @abstractmethod
    async def export_batch(self, events: list[AuditEvent]) -> int:
        """Export batch of events. Returns count of successfully exported."""
        pass


class SplunkExporter(SIEMExporter):
    """Export audit events to Splunk HEC (HTTP Event Collector)."""

    def __init__(
        self,
        hec_url: str,
        hec_token: str,
        index: str = "dvo_audit",
        source: str = "dvo-agent",
        sourcetype: str = "dvo:audit:json",
        verify_ssl: bool = True
    ):
        """
        Initialize Splunk exporter.

        Args:
            hec_url: Splunk HEC endpoint URL
            hec_token: HEC authentication token
            index: Target Splunk index
            source: Event source identifier
            sourcetype: Splunk sourcetype
            verify_ssl: Verify SSL certificates
        """
        self.hec_url = hec_url.rstrip("/")
        self.hec_token = hec_token
        self.index = index
        self.source = source
        self.sourcetype = sourcetype
        self.verify_ssl = verify_ssl

        logger.info(f"SplunkExporter initialized for {hec_url}")

    async def export(self, event: AuditEvent) -> bool:
        """Export single event to Splunk."""
        payload = {
            "time": event.timestamp.timestamp(),
            "host": "dvo-agent",
            "index": self.index,
            "source": self.source,
            "sourcetype": self.sourcetype,
            "event": event.to_json_siem()
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.hec_url}/services/collector/event",
                    json=payload,
                    headers={
                        "Authorization": f"Splunk {self.hec_token}",
                        "Content-Type": "application/json"
                    },
                    ssl=self.verify_ssl
                ) as response:
                    if response.status == 200:
                        return True
                    else:
                        text = await response.text()
                        logger.error(f"Splunk export failed: {response.status} - {text}")
                        return False
        except Exception as e:
            logger.error(f"Splunk export error: {e}")
            return False

    async def export_batch(self, events: list[AuditEvent]) -> int:
        """Export batch of events to Splunk."""
        if not events:
            return 0

        # Splunk HEC accepts newline-delimited JSON
        payload = "\n".join(
            str({
                "time": e.timestamp.timestamp(),
                "host": "dvo-agent",
                "index": self.index,
                "source": self.source,
                "sourcetype": self.sourcetype,
                "event": e.to_json_siem()
            }).replace("'", '"')
            for e in events
        )

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.hec_url}/services/collector/event",
                    data=payload,
                    headers={
                        "Authorization": f"Splunk {self.hec_token}",
                        "Content-Type": "application/json"
                    },
                    ssl=self.verify_ssl
                ) as response:
                    if response.status == 200:
                        return len(events)
                    else:
                        text = await response.text()
                        logger.error(f"Splunk batch export failed: {response.status} - {text}")
                        return 0
        except Exception as e:
            logger.error(f"Splunk batch export error: {e}")
            return 0


class AzureSentinelExporter(SIEMExporter):
    """Export audit events to Azure Sentinel via Log Analytics."""

    def __init__(
        self,
        workspace_id: str,
        shared_key: str,
        log_type: str = "DVOAudit",
        api_version: str = "2016-04-01"
    ):
        """
        Initialize Azure Sentinel exporter.

        Args:
            workspace_id: Log Analytics workspace ID
            shared_key: Primary or secondary key
            log_type: Custom log type name
            api_version: API version
        """
        self.workspace_id = workspace_id
        self.shared_key = shared_key
        self.log_type = log_type
        self.api_version = api_version

        logger.info(f"AzureSentinelExporter initialized for workspace {workspace_id}")

    def _build_signature(self, date: str, content_length: int) -> str:
        """Build authorization signature for Azure."""
        import hmac
        import base64
        import hashlib

        string_to_hash = f"POST\n{content_length}\napplication/json\nx-ms-date:{date}\n/api/logs"
        bytes_to_hash = string_to_hash.encode("utf-8")
        decoded_key = base64.b64decode(self.shared_key)
        encoded_hash = base64.b64encode(
            hmac.new(decoded_key, bytes_to_hash, digestmod=hashlib.sha256).digest()
        ).decode("utf-8")

        return f"SharedKey {self.workspace_id}:{encoded_hash}"

    async def export(self, event: AuditEvent) -> bool:
        """Export single event to Azure Sentinel."""
        return await self.export_batch([event]) == 1

    async def export_batch(self, events: list[AuditEvent]) -> int:
        """Export batch of events to Azure Sentinel."""
        if not events:
            return 0

        import json
        from email.utils import formatdate

        body = json.dumps([e.to_json_siem() for e in events])
        content_length = len(body)
        rfc1123date = formatdate(timeval=None, localtime=False, usegmt=True)

        signature = self._build_signature(rfc1123date, content_length)

        uri = f"https://{self.workspace_id}.ods.opinsights.azure.com/api/logs?api-version={self.api_version}"

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    uri,
                    data=body,
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": signature,
                        "Log-Type": self.log_type,
                        "x-ms-date": rfc1123date,
                        "time-generated-field": "@timestamp"
                    }
                ) as response:
                    if response.status in [200, 202]:
                        return len(events)
                    else:
                        text = await response.text()
                        logger.error(f"Azure Sentinel export failed: {response.status} - {text}")
                        return 0
        except Exception as e:
            logger.error(f"Azure Sentinel export error: {e}")
            return 0


class SyslogExporter(SIEMExporter):
    """Export audit events via Syslog (CEF format)."""

    def __init__(
        self,
        host: str,
        port: int = 514,
        protocol: str = "udp",  # udp, tcp, or tls
        facility: int = 1,  # user-level
        app_name: str = "dvo-agent"
    ):
        """
        Initialize Syslog exporter.

        Args:
            host: Syslog server hostname
            port: Syslog server port
            protocol: udp, tcp, or tls
            facility: Syslog facility code
            app_name: Application name for syslog
        """
        self.host = host
        self.port = port
        self.protocol = protocol
        self.facility = facility
        self.app_name = app_name

        logger.info(f"SyslogExporter initialized for {host}:{port} ({protocol})")

    async def export(self, event: AuditEvent) -> bool:
        """Export single event via Syslog."""
        import socket

        # Map severity to syslog priority
        severity_map = {
            "debug": 7,
            "info": 6,
            "warning": 4,
            "error": 3,
            "critical": 2
        }

        priority = self.facility * 8 + severity_map.get(event.severity.value, 6)
        timestamp = event.timestamp.strftime("%b %d %H:%M:%S")

        # Build syslog message with CEF payload
        message = f"<{priority}>{timestamp} {self.app_name}: {event.to_cef()}"

        try:
            if self.protocol == "udp":
                sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                sock.sendto(message.encode("utf-8"), (self.host, self.port))
                sock.close()
            else:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.connect((self.host, self.port))
                sock.sendall(message.encode("utf-8") + b"\n")
                sock.close()

            return True
        except Exception as e:
            logger.error(f"Syslog export error: {e}")
            return False

    async def export_batch(self, events: list[AuditEvent]) -> int:
        """Export batch via Syslog."""
        success = 0
        for event in events:
            if await self.export(event):
                success += 1
        return success


class SIEMManager:
    """Manages multiple SIEM exporters."""

    def __init__(self):
        self.exporters: dict[str, SIEMExporter] = {}
        self._background_tasks: list[asyncio.Task] = []

    def register_exporter(self, name: str, exporter: SIEMExporter) -> None:
        """Register a SIEM exporter."""
        self.exporters[name] = exporter
        logger.info(f"Registered SIEM exporter: {name}")

    def remove_exporter(self, name: str) -> bool:
        """Remove a SIEM exporter."""
        if name in self.exporters:
            del self.exporters[name]
            return True
        return False

    async def export_to_all(self, event: AuditEvent) -> dict[str, bool]:
        """Export event to all registered exporters."""
        results = {}
        for name, exporter in self.exporters.items():
            try:
                results[name] = await exporter.export(event)
            except Exception as e:
                logger.error(f"Export to {name} failed: {e}")
                results[name] = False
        return results

    def create_callback(self) -> callable:
        """Create a callback for AuditLogger registration."""
        def callback(event: AuditEvent):
            # Fire-and-forget async export
            asyncio.create_task(self.export_to_all(event))
        return callback
```

---

## File 4: `src/api/routes/audit.py`

```python
"""
API routes for audit log access.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from typing import Optional
from datetime import datetime

from ...enterprise.audit.models import (
    AuditQuery, AuditExportFormat, AuditEventType, AuditSeverity, AuditOutcome
)
from ...enterprise.audit.logger import get_audit_logger, AuditLogger
from ...enterprise.auth.models import AuthenticatedUser
from ...enterprise.auth.middleware import get_current_user, require_roles
from ...enterprise.rbac.models import DVORole

router = APIRouter(prefix="/v1/audit", tags=["audit"])


def get_logger() -> AuditLogger:
    return get_audit_logger()


@router.get("/events")
async def query_events(
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    event_types: Optional[str] = Query(None, description="Comma-separated event types"),
    severities: Optional[str] = Query(None, description="Comma-separated severities"),
    outcomes: Optional[str] = Query(None, description="Comma-separated outcomes"),
    actor_id: Optional[str] = None,
    actor_email: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    environment: Optional[str] = None,
    correlation_id: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(100, le=1000),
    offset: int = Query(0, ge=0),
    current_user: AuthenticatedUser = Depends(get_current_user),
    audit_logger: AuditLogger = Depends(get_logger)
) -> list[dict]:
    """Query audit events."""
    # Parse comma-separated filters
    parsed_event_types = []
    if event_types:
        for et in event_types.split(","):
            try:
                parsed_event_types.append(AuditEventType(et.strip()))
            except ValueError:
                pass

    parsed_severities = []
    if severities:
        for s in severities.split(","):
            try:
                parsed_severities.append(AuditSeverity(s.strip()))
            except ValueError:
                pass

    parsed_outcomes = []
    if outcomes:
        for o in outcomes.split(","):
            try:
                parsed_outcomes.append(AuditOutcome(o.strip()))
            except ValueError:
                pass

    query = AuditQuery(
        start_time=start_time,
        end_time=end_time,
        event_types=parsed_event_types,
        severities=parsed_severities,
        outcomes=parsed_outcomes,
        actor_id=actor_id,
        actor_email=actor_email,
        resource_type=resource_type,
        resource_id=resource_id,
        environment=environment,
        correlation_id=correlation_id,
        search_text=search,
        limit=limit,
        offset=offset
    )

    events = audit_logger.query(query)
    return [e.model_dump() for e in events]


@router.get("/events/{event_id}")
async def get_event(
    event_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    audit_logger: AuditLogger = Depends(get_logger)
) -> dict:
    """Get a specific audit event by ID."""
    for event in audit_logger.buffer:
        if event.id == event_id:
            return event.model_dump()
    raise HTTPException(status_code=404, detail=f"Event {event_id} not found")


@router.get("/export")
async def export_events(
    format: AuditExportFormat = AuditExportFormat.JSON,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    environment: Optional[str] = None,
    current_user: AuthenticatedUser = Depends(require_roles([DVORole.ADMIN, DVORole.RELEASE_MANAGER])),
    audit_logger: AuditLogger = Depends(get_logger)
) -> Response:
    """Export audit logs in specified format."""
    query = AuditQuery(
        start_time=start_time,
        end_time=end_time,
        environment=environment,
        limit=10000  # Max export size
    )

    content = audit_logger.export(format, query)

    # Set appropriate content type
    content_types = {
        AuditExportFormat.JSON: "application/json",
        AuditExportFormat.JSON_LINES: "application/x-ndjson",
        AuditExportFormat.CEF: "text/plain",
        AuditExportFormat.CSV: "text/csv"
    }

    filename = f"audit-export-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}.{format.value}"

    return Response(
        content=content,
        media_type=content_types.get(format, "text/plain"),
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.get("/statistics")
async def get_statistics(
    current_user: AuthenticatedUser = Depends(get_current_user),
    audit_logger: AuditLogger = Depends(get_logger)
) -> dict:
    """Get audit log statistics."""
    return audit_logger.get_statistics()


@router.get("/correlation/{correlation_id}")
async def get_correlated_events(
    correlation_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    audit_logger: AuditLogger = Depends(get_logger)
) -> list[dict]:
    """Get all events with the same correlation ID."""
    query = AuditQuery(correlation_id=correlation_id, limit=1000)
    events = audit_logger.query(query)
    return [e.model_dump() for e in events]
```

---

## File 5: Update `src/api/app.py`

Add to existing app.py:

```python
# Add import
from .routes.audit import router as audit_router

# Add router registration
app.include_router(audit_router)
```

---

## File 6: `src/enterprise/audit/__init__.py`

```python
"""
Audit logging module for DVO agent.
"""
from .models import (
    AuditEventType,
    AuditSeverity,
    AuditOutcome,
    AuditEvent,
    AuditQuery,
    AuditExportFormat
)
from .logger import AuditLogger, get_audit_logger, audit_log
from .siem import (
    SIEMExporter,
    SplunkExporter,
    AzureSentinelExporter,
    SyslogExporter,
    SIEMManager
)

__all__ = [
    "AuditEventType",
    "AuditSeverity",
    "AuditOutcome",
    "AuditEvent",
    "AuditQuery",
    "AuditExportFormat",
    "AuditLogger",
    "get_audit_logger",
    "audit_log",
    "SIEMExporter",
    "SplunkExporter",
    "AzureSentinelExporter",
    "SyslogExporter",
    "SIEMManager"
]
```

---

## Integration: Instrument DVO Agent

Add audit logging throughout the DVO agent:

```python
# Example: In DVOAgent.deploy()
from ...enterprise.audit.logger import audit_log
from ...enterprise.audit.models import AuditEventType, AuditOutcome

# On deployment start
correlation_id = str(uuid.uuid4())
audit_log(
    event_type=AuditEventType.DEPLOY_INITIATED,
    action=f"Deployment initiated for {agent_id} to {environment}",
    actor_id=user.id,
    actor_email=user.email,
    actor_roles=[r.value for r in user.roles],
    resource_type="agent",
    resource_id=agent_id,
    environment=environment,
    correlation_id=correlation_id,
    details={"config": deployment_config}
)

# On deployment success
audit_log(
    event_type=AuditEventType.DEPLOY_COMPLETED,
    action=f"Deployment completed for {agent_id} to {environment}",
    actor_id=user.id,
    actor_email=user.email,
    resource_type="agent",
    resource_id=agent_id,
    environment=environment,
    correlation_id=correlation_id,
    details={"duration_seconds": duration}
)

# On deployment failure
audit_log(
    event_type=AuditEventType.DEPLOY_FAILED,
    action=f"Deployment failed for {agent_id} to {environment}",
    actor_id=user.id,
    actor_email=user.email,
    resource_type="agent",
    resource_id=agent_id,
    environment=environment,
    outcome=AuditOutcome.FAILURE,
    error_message=str(error),
    correlation_id=correlation_id
)
```

---

## SIEM Configuration Examples

### Splunk
```python
from src.enterprise.audit.siem import SplunkExporter, SIEMManager
from src.enterprise.audit.logger import get_audit_logger

# Configure Splunk export
splunk = SplunkExporter(
    hec_url="https://splunk.mastercard.com:8088",
    hec_token="your-hec-token",
    index="security_dvo",
    verify_ssl=True
)

# Register with audit logger
siem_manager = SIEMManager()
siem_manager.register_exporter("splunk", splunk)
get_audit_logger().register_export_callback(siem_manager.create_callback())
```

### Azure Sentinel
```python
from src.enterprise.audit.siem import AzureSentinelExporter

sentinel = AzureSentinelExporter(
    workspace_id="your-workspace-id",
    shared_key="your-shared-key",
    log_type="DVOAudit"
)
siem_manager.register_exporter("sentinel", sentinel)
```

---

## Testing Checklist

- [ ] Audit event creation with all fields
- [ ] CEF format conversion
- [ ] JSON SIEM format conversion
- [ ] Query filtering (all parameters)
- [ ] Tamper-evident checksums
- [ ] File persistence with rotation
- [ ] SIEM export callbacks
- [ ] Splunk HEC integration
- [ ] Azure Sentinel integration
- [ ] Syslog export (UDP/TCP)
- [ ] API authentication
- [ ] Export format downloads
- [ ] Statistics endpoint
- [ ] Correlation ID tracking

---

## Next Phase Preview

**Phase 5: Integration Testing + Documentation**
- End-to-end integration tests
- Performance benchmarks
- API documentation (OpenAPI)
- Deployment runbook
- Mastercard security checklist
