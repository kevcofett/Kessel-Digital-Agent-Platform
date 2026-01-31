# Enterprise DVO Phase 2 - VS Code Implementation
## Capability Manager + Graceful Degradation
## Date: 2026-01-31

---

## CONTEXT

Phase 1 (Azure AD + RBAC) is complete. This phase adds the Capability Manager for feature flags with graceful degradation when features are blocked.

**Working Directory:** `/Users/kevinbauer/Kessel-Digital/CAAT`
**Spec:** `/specs/CAAT_Enterprise_DVO_Spec.md`

---

## TASK 1: Create Capabilities Module

```bash
mkdir -p src/enterprise/capabilities
touch src/enterprise/capabilities/__init__.py
```

---

## TASK 2: Capability Models

### File: `src/enterprise/capabilities/models.py`

```python
"""Capability management models."""

from enum import Enum
from dataclasses import dataclass, field
from typing import List, Optional, Any, Dict


class DVOCapability(Enum):
    """DVO capabilities that can be toggled per environment."""

    # Deployment platform capabilities
    DEPLOY_LANGCHAIN = "deploy_langchain"
    DEPLOY_FASTAPI = "deploy_fastapi"
    DEPLOY_COPILOT = "deploy_copilot"

    # Environment capabilities
    DEPLOY_TO_PRODUCTION = "deploy_to_production"
    DEPLOY_TO_STAGING = "deploy_to_staging"
    DEPLOY_TO_DEVELOPMENT = "deploy_to_development"

    # Feature capabilities
    AUTO_ROLLBACK = "auto_rollback"
    KB_SYNC = "kb_sync"
    HEALTH_CHECK = "health_check"
    INTEGRATION_TESTS = "integration_tests"

    # Advanced deployment capabilities
    PARALLEL_DEPLOY = "parallel_deploy"
    BLUE_GREEN_DEPLOY = "blue_green_deploy"
    CANARY_DEPLOY = "canary_deploy"


class FallbackBehavior(Enum):
    """How to handle when a capability is unavailable."""

    ERROR = "error"
    """Fail with error message - operation cannot proceed"""

    SKIP = "skip"
    """Skip this step and continue - operation proceeds without this feature"""

    DEGRADE = "degrade"
    """Use degraded/fallback implementation - operation proceeds with reduced functionality"""

    MANUAL = "manual"
    """Require manual intervention - provide instructions for manual completion"""


@dataclass
class CapabilityConfig:
    """Configuration for a single capability."""

    capability: DVOCapability
    """The capability being configured"""

    enabled: bool = True
    """Whether the capability is enabled"""

    fallback_behavior: FallbackBehavior = FallbackBehavior.ERROR
    """What to do when capability is unavailable"""

    fallback_message: str = ""
    """Message to display when fallback is triggered"""

    required_permissions: List[str] = field(default_factory=list)
    """Permissions required to use this capability"""

    required_approval: bool = False
    """Whether using this capability requires approval"""

    audit_when_used: bool = True
    """Whether to log usage of this capability"""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "capability": self.capability.value,
            "enabled": self.enabled,
            "fallback_behavior": self.fallback_behavior.value,
            "fallback_message": self.fallback_message,
            "required_permissions": self.required_permissions,
            "required_approval": self.required_approval,
        }


@dataclass
class CapabilityResult:
    """Result of a capability check."""

    available: bool
    """Whether the capability is available"""

    fallback_behavior: FallbackBehavior
    """The fallback behavior if not available"""

    message: str
    """Explanation message"""

    requires_approval: bool = False
    """Whether approval is needed to use this capability"""

    requires_manual_action: bool = False
    """Whether manual action is required"""

    degraded_features: List[str] = field(default_factory=list)
    """List of features that will be degraded"""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "available": self.available,
            "fallback_behavior": self.fallback_behavior.value,
            "message": self.message,
            "requires_approval": self.requires_approval,
            "requires_manual_action": self.requires_manual_action,
            "degraded_features": self.degraded_features,
        }


@dataclass
class OperationResult:
    """Result of an operation with fallback handling."""

    success: bool
    """Whether the operation succeeded"""

    result: Any = None
    """The result data if successful"""

    error: Optional[str] = None
    """Error message if failed"""

    degraded: bool = False
    """Whether the operation ran in degraded mode"""

    blocked: bool = False
    """Whether the operation was blocked entirely"""

    skipped_operations: List[str] = field(default_factory=list)
    """Operations that were skipped"""

    requires_manual_action: bool = False
    """Whether manual action is still required"""

    manual_instructions: Optional[str] = None
    """Instructions for manual completion"""

    message: Optional[str] = None
    """Additional message"""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "degraded": self.degraded,
            "blocked": self.blocked,
            "skipped_operations": self.skipped_operations,
            "requires_manual_action": self.requires_manual_action,
            "manual_instructions": self.manual_instructions,
            "message": self.message,
            "error": self.error,
        }
```

---

## TASK 3: Capability Manager

### File: `src/enterprise/capabilities/manager.py`

```python
"""Capability Manager implementation."""

import os
import json
import logging
from typing import Dict, List, Optional, Any

from src.enterprise.auth.models import AuthenticatedUser
from src.enterprise.rbac.manager import RBACManager
from src.enterprise.rbac.models import DVOPermission
from .models import (
    DVOCapability,
    FallbackBehavior,
    CapabilityConfig,
    CapabilityResult,
)


logger = logging.getLogger(__name__)


# Default capability configurations
DEFAULT_CAPABILITIES: Dict[DVOCapability, CapabilityConfig] = {
    DVOCapability.DEPLOY_LANGCHAIN: CapabilityConfig(
        capability=DVOCapability.DEPLOY_LANGCHAIN,
        enabled=True,
        fallback_behavior=FallbackBehavior.ERROR,
        fallback_message="LangChain deployment is not available in this environment",
    ),
    DVOCapability.DEPLOY_FASTAPI: CapabilityConfig(
        capability=DVOCapability.DEPLOY_FASTAPI,
        enabled=True,
        fallback_behavior=FallbackBehavior.ERROR,
        fallback_message="FastAPI deployment is not available in this environment",
    ),
    DVOCapability.DEPLOY_COPILOT: CapabilityConfig(
        capability=DVOCapability.DEPLOY_COPILOT,
        enabled=True,
        fallback_behavior=FallbackBehavior.MANUAL,
        fallback_message="Copilot Studio deployment requires manual action via Power Platform admin center. Please contact your administrator.",
    ),
    DVOCapability.DEPLOY_TO_PRODUCTION: CapabilityConfig(
        capability=DVOCapability.DEPLOY_TO_PRODUCTION,
        enabled=True,
        fallback_behavior=FallbackBehavior.ERROR,
        fallback_message="Production deployment is disabled in this environment",
        required_permissions=[DVOPermission.DEPLOY_PRODUCTION.value],
        required_approval=True,
    ),
    DVOCapability.DEPLOY_TO_STAGING: CapabilityConfig(
        capability=DVOCapability.DEPLOY_TO_STAGING,
        enabled=True,
        fallback_behavior=FallbackBehavior.ERROR,
        fallback_message="Staging deployment is disabled in this environment",
        required_permissions=[DVOPermission.DEPLOY_STAGING.value],
    ),
    DVOCapability.DEPLOY_TO_DEVELOPMENT: CapabilityConfig(
        capability=DVOCapability.DEPLOY_TO_DEVELOPMENT,
        enabled=True,
        fallback_behavior=FallbackBehavior.ERROR,
        fallback_message="Development deployment is disabled",
        required_permissions=[DVOPermission.DEPLOY_DEVELOPMENT.value],
    ),
    DVOCapability.AUTO_ROLLBACK: CapabilityConfig(
        capability=DVOCapability.AUTO_ROLLBACK,
        enabled=True,
        fallback_behavior=FallbackBehavior.SKIP,
        fallback_message="Auto-rollback is disabled; manual rollback available if deployment fails",
    ),
    DVOCapability.KB_SYNC: CapabilityConfig(
        capability=DVOCapability.KB_SYNC,
        enabled=True,
        fallback_behavior=FallbackBehavior.DEGRADE,
        fallback_message="KB sync unavailable; deployment will proceed without KB file updates",
    ),
    DVOCapability.HEALTH_CHECK: CapabilityConfig(
        capability=DVOCapability.HEALTH_CHECK,
        enabled=True,
        fallback_behavior=FallbackBehavior.SKIP,
        fallback_message="Health check disabled; manual verification recommended after deployment",
    ),
    DVOCapability.INTEGRATION_TESTS: CapabilityConfig(
        capability=DVOCapability.INTEGRATION_TESTS,
        enabled=True,
        fallback_behavior=FallbackBehavior.SKIP,
        fallback_message="Integration tests skipped; manual testing recommended",
    ),
    DVOCapability.PARALLEL_DEPLOY: CapabilityConfig(
        capability=DVOCapability.PARALLEL_DEPLOY,
        enabled=False,
        fallback_behavior=FallbackBehavior.DEGRADE,
        fallback_message="Parallel deployment disabled; agents will be deployed sequentially",
    ),
    DVOCapability.BLUE_GREEN_DEPLOY: CapabilityConfig(
        capability=DVOCapability.BLUE_GREEN_DEPLOY,
        enabled=False,
        fallback_behavior=FallbackBehavior.DEGRADE,
        fallback_message="Blue-green deployment not available; using standard deployment",
    ),
    DVOCapability.CANARY_DEPLOY: CapabilityConfig(
        capability=DVOCapability.CANARY_DEPLOY,
        enabled=False,
        fallback_behavior=FallbackBehavior.DEGRADE,
        fallback_message="Canary deployment not available; using standard deployment",
    ),
}


class CapabilityManager:
    """
    Manages feature flags with graceful degradation.

    Allows enterprise environments to disable/enable capabilities
    while providing meaningful fallback behavior when features
    are unavailable.
    """

    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize capability manager.

        Args:
            config_path: Optional path to capability config JSON file
        """
        self._capabilities: Dict[DVOCapability, CapabilityConfig] = {}
        self._load_defaults()

        if config_path:
            self.load_config_file(config_path)
        else:
            # Try loading from environment
            self._load_from_env()

    def _load_defaults(self):
        """Load default capability configurations."""
        for cap, config in DEFAULT_CAPABILITIES.items():
            self._capabilities[cap] = CapabilityConfig(
                capability=config.capability,
                enabled=config.enabled,
                fallback_behavior=config.fallback_behavior,
                fallback_message=config.fallback_message,
                required_permissions=config.required_permissions.copy(),
                required_approval=config.required_approval,
                audit_when_used=config.audit_when_used,
            )

    def _load_from_env(self):
        """Load capability overrides from environment variables."""
        # Format: CAAT_CAP_<CAPABILITY_NAME>=enabled|disabled
        # Example: CAAT_CAP_DEPLOY_COPILOT=disabled
        for cap in DVOCapability:
            env_key = f"CAAT_CAP_{cap.value.upper()}"
            env_value = os.getenv(env_key)

            if env_value:
                enabled = env_value.lower() not in ("disabled", "false", "0", "no")
                if cap in self._capabilities:
                    self._capabilities[cap].enabled = enabled
                    logger.info(f"Capability {cap.value} set to {'enabled' if enabled else 'disabled'} from env")

        # Load full config from JSON env var
        config_json = os.getenv("CAAT_CAPABILITIES_CONFIG")
        if config_json:
            try:
                config = json.loads(config_json)
                self.load_config_dict(config)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse CAAT_CAPABILITIES_CONFIG: {e}")

    def load_config_file(self, path: str):
        """Load capability configuration from JSON file."""
        try:
            with open(path) as f:
                config = json.load(f)
            self.load_config_dict(config)
            logger.info(f"Loaded capability config from {path}")
        except Exception as e:
            logger.error(f"Failed to load capability config from {path}: {e}")

    def load_config_dict(self, config: Dict[str, Any]):
        """
        Load capability configuration from dictionary.

        Expected format:
        {
            "deploy_langchain": {
                "enabled": true,
                "fallback_behavior": "error",
                "fallback_message": "..."
            },
            ...
        }
        """
        for cap_name, settings in config.items():
            try:
                capability = DVOCapability(cap_name)
                if capability in self._capabilities:
                    cap_config = self._capabilities[capability]

                    if "enabled" in settings:
                        cap_config.enabled = settings["enabled"]

                    if "fallback_behavior" in settings:
                        cap_config.fallback_behavior = FallbackBehavior(settings["fallback_behavior"])

                    if "fallback_message" in settings:
                        cap_config.fallback_message = settings["fallback_message"]

                    if "required_approval" in settings:
                        cap_config.required_approval = settings["required_approval"]

            except ValueError:
                logger.warning(f"Unknown capability in config: {cap_name}")

    def check_capability(
        self,
        capability: DVOCapability,
        user: Optional[AuthenticatedUser] = None,
        rbac: Optional[RBACManager] = None,
    ) -> CapabilityResult:
        """
        Check if a capability is available.

        Args:
            capability: Capability to check
            user: Optional user for permission checks
            rbac: Optional RBAC manager for permission checks

        Returns:
            CapabilityResult with availability and fallback info
        """
        config = self._capabilities.get(capability)

        if not config:
            return CapabilityResult(
                available=False,
                fallback_behavior=FallbackBehavior.ERROR,
                message=f"Unknown capability: {capability.value}",
            )

        # Check if capability is enabled
        if not config.enabled:
            return CapabilityResult(
                available=False,
                fallback_behavior=config.fallback_behavior,
                message=config.fallback_message,
                requires_manual_action=(config.fallback_behavior == FallbackBehavior.MANUAL),
            )

        # Check required permissions if user and rbac provided
        if user and rbac and config.required_permissions:
            for perm_name in config.required_permissions:
                try:
                    perm = DVOPermission(perm_name)
                    result = rbac.check_permission(user, perm)
                    if not result.allowed:
                        return CapabilityResult(
                            available=False,
                            fallback_behavior=FallbackBehavior.ERROR,
                            message=f"Permission denied: {perm_name}",
                            requires_approval=result.requires_approval,
                        )
                except ValueError:
                    logger.warning(f"Unknown permission in capability config: {perm_name}")

        return CapabilityResult(
            available=True,
            fallback_behavior=FallbackBehavior.ERROR,  # Not used when available
            message="Capability available",
            requires_approval=config.required_approval,
        )

    def get_capability_config(self, capability: DVOCapability) -> Optional[CapabilityConfig]:
        """Get configuration for a capability."""
        return self._capabilities.get(capability)

    def set_capability_enabled(self, capability: DVOCapability, enabled: bool):
        """Enable or disable a capability at runtime."""
        if capability in self._capabilities:
            self._capabilities[capability].enabled = enabled
            logger.info(f"Capability {capability.value} set to {'enabled' if enabled else 'disabled'}")

    def get_all_capabilities(
        self,
        user: Optional[AuthenticatedUser] = None,
        rbac: Optional[RBACManager] = None,
    ) -> Dict[str, CapabilityResult]:
        """
        Get status of all capabilities.

        Args:
            user: Optional user for permission checks
            rbac: Optional RBAC manager

        Returns:
            Dictionary of capability name -> CapabilityResult
        """
        return {
            cap.value: self.check_capability(cap, user, rbac)
            for cap in DVOCapability
        }

    def get_enabled_capabilities(self) -> List[DVOCapability]:
        """Get list of all enabled capabilities."""
        return [
            cap for cap, config in self._capabilities.items()
            if config.enabled
        ]

    def get_disabled_capabilities(self) -> List[DVOCapability]:
        """Get list of all disabled capabilities."""
        return [
            cap for cap, config in self._capabilities.items()
            if not config.enabled
        ]

    def export_config(self) -> Dict[str, Any]:
        """Export current configuration as dictionary."""
        return {
            cap.value: config.to_dict()
            for cap, config in self._capabilities.items()
        }
```

---

## TASK 4: Graceful Degradation Handler

### File: `src/enterprise/capabilities/degradation.py`

```python
"""Graceful degradation handler."""

import logging
from typing import Callable, Optional, Any, Dict, Awaitable

from src.enterprise.auth.models import AuthenticatedUser
from .models import (
    DVOCapability,
    FallbackBehavior,
    CapabilityResult,
    OperationResult,
)
from .manager import CapabilityManager


logger = logging.getLogger(__name__)


class GracefulDegradationHandler:
    """
    Handles graceful degradation when capabilities are unavailable.

    Provides meaningful user feedback and executes fallback
    operations when primary operations cannot proceed.
    """

    def __init__(
        self,
        capability_manager: CapabilityManager,
        audit_callback: Optional[Callable] = None,
    ):
        """
        Initialize handler.

        Args:
            capability_manager: Capability manager instance
            audit_callback: Optional callback for audit logging
                Signature: async def callback(user, operation, status, context)
        """
        self.capability_manager = capability_manager
        self.audit_callback = audit_callback

    async def execute_with_fallback(
        self,
        capability: DVOCapability,
        operation: Callable[[], Awaitable[Any]],
        user: AuthenticatedUser,
        context: Dict[str, Any],
        fallback_operation: Optional[Callable[[], Awaitable[Any]]] = None,
    ) -> OperationResult:
        """
        Execute operation with fallback handling.

        Args:
            capability: Required capability for the operation
            operation: Primary async operation to execute
            user: User performing the operation
            context: Context dict for audit logging
            fallback_operation: Optional fallback if capability unavailable

        Returns:
            OperationResult with outcome and any degradation info
        """
        # Check capability
        cap_result = self.capability_manager.check_capability(capability, user)

        if cap_result.available:
            # Execute primary operation
            try:
                result = await operation()
                await self._audit(user, capability.value, "success", context)
                return OperationResult(
                    success=True,
                    result=result,
                    degraded=False,
                )
            except Exception as e:
                logger.error(f"Operation {capability.value} failed: {e}")
                await self._audit(user, capability.value, "error", {**context, "error": str(e)})
                return OperationResult(
                    success=False,
                    error=str(e),
                    degraded=False,
                )

        # Handle based on fallback behavior
        return await self._handle_fallback(
            cap_result,
            capability,
            user,
            context,
            fallback_operation,
        )

    async def _handle_fallback(
        self,
        cap_result: CapabilityResult,
        capability: DVOCapability,
        user: AuthenticatedUser,
        context: Dict[str, Any],
        fallback_operation: Optional[Callable[[], Awaitable[Any]]],
    ) -> OperationResult:
        """Handle fallback based on behavior type."""

        behavior = cap_result.fallback_behavior

        if behavior == FallbackBehavior.ERROR:
            await self._audit(user, capability.value, "blocked", context)
            return OperationResult(
                success=False,
                error=cap_result.message,
                blocked=True,
            )

        elif behavior == FallbackBehavior.SKIP:
            await self._audit(user, capability.value, "skipped", context)
            return OperationResult(
                success=True,
                result=None,
                degraded=True,
                skipped_operations=[capability.value],
                message=cap_result.message,
            )

        elif behavior == FallbackBehavior.DEGRADE:
            if fallback_operation:
                try:
                    result = await fallback_operation()
                    await self._audit(user, f"{capability.value}_degraded", "success", context)
                    return OperationResult(
                        success=True,
                        result=result,
                        degraded=True,
                        message=cap_result.message,
                    )
                except Exception as e:
                    logger.error(f"Fallback operation failed: {e}")
                    await self._audit(user, f"{capability.value}_degraded", "error", {**context, "error": str(e)})
                    return OperationResult(
                        success=False,
                        error=str(e),
                        degraded=True,
                    )
            else:
                # No fallback provided, just note the degradation
                await self._audit(user, capability.value, "degraded", context)
                return OperationResult(
                    success=True,
                    result=None,
                    degraded=True,
                    message=cap_result.message,
                )

        elif behavior == FallbackBehavior.MANUAL:
            await self._audit(user, capability.value, "manual_required", context)
            return OperationResult(
                success=False,
                requires_manual_action=True,
                manual_instructions=cap_result.message,
            )

        # Unknown behavior
        return OperationResult(
            success=False,
            error=f"Unknown fallback behavior: {behavior}",
        )

    async def check_and_report(
        self,
        capabilities: list[DVOCapability],
        user: AuthenticatedUser,
    ) -> Dict[str, CapabilityResult]:
        """
        Check multiple capabilities and return a report.

        Args:
            capabilities: List of capabilities to check
            user: User context

        Returns:
            Dictionary of capability -> result
        """
        results = {}
        for cap in capabilities:
            results[cap.value] = self.capability_manager.check_capability(cap, user)
        return results

    def format_degradation_report(
        self,
        results: Dict[str, CapabilityResult],
    ) -> str:
        """
        Format capability results as human-readable report.

        Args:
            results: Dictionary of capability check results

        Returns:
            Formatted string report
        """
        lines = ["**Capability Status**\n"]

        available = []
        unavailable = []

        for cap_name, result in results.items():
            if result.available:
                available.append(cap_name)
            else:
                unavailable.append((cap_name, result))

        if available:
            lines.append("✅ **Available:**")
            for cap in available:
                lines.append(f"  - {cap}")
            lines.append("")

        if unavailable:
            lines.append("⚠️ **Unavailable/Degraded:**")
            for cap_name, result in unavailable:
                behavior = result.fallback_behavior.value
                lines.append(f"  - {cap_name} [{behavior}]: {result.message}")

        return "\n".join(lines)

    async def _audit(
        self,
        user: AuthenticatedUser,
        operation: str,
        status: str,
        context: Dict[str, Any],
    ):
        """Log audit event if callback configured."""
        if self.audit_callback:
            try:
                await self.audit_callback(user, operation, status, context)
            except Exception as e:
                logger.error(f"Audit callback failed: {e}")
```

---

## TASK 5: Update Exports

### File: `src/enterprise/capabilities/__init__.py`

```python
"""Capability management module."""

from .models import (
    DVOCapability,
    FallbackBehavior,
    CapabilityConfig,
    CapabilityResult,
    OperationResult,
)
from .manager import CapabilityManager, DEFAULT_CAPABILITIES
from .degradation import GracefulDegradationHandler

__all__ = [
    # Models
    "DVOCapability",
    "FallbackBehavior",
    "CapabilityConfig",
    "CapabilityResult",
    "OperationResult",
    # Manager
    "CapabilityManager",
    "DEFAULT_CAPABILITIES",
    # Handler
    "GracefulDegradationHandler",
]
```

### Update `src/enterprise/__init__.py`

Add capabilities exports:

```python
"""Enterprise security module for CAAT."""

from .auth.models import AuthenticatedUser, AzureADConfig, AuthenticationError, AuthorizationError
from .auth.azure_ad import AzureADAuthProvider, APIKeyStore
from .auth.middleware import (
    init_auth,
    get_current_user,
    get_optional_user,
    require_permission,
    require_any_role,
    require_all_roles,
)
from .rbac.models import DVORole, DVOPermission, PermissionResult, ROLE_PERMISSIONS
from .rbac.manager import RBACManager
from .capabilities.models import (
    DVOCapability,
    FallbackBehavior,
    CapabilityConfig,
    CapabilityResult,
    OperationResult,
)
from .capabilities.manager import CapabilityManager
from .capabilities.degradation import GracefulDegradationHandler

__all__ = [
    # Auth models
    "AuthenticatedUser",
    "AzureADConfig",
    "AuthenticationError",
    "AuthorizationError",
    # Auth providers
    "AzureADAuthProvider",
    "APIKeyStore",
    # Middleware
    "init_auth",
    "get_current_user",
    "get_optional_user",
    "require_permission",
    "require_any_role",
    "require_all_roles",
    # RBAC
    "DVORole",
    "DVOPermission",
    "PermissionResult",
    "ROLE_PERMISSIONS",
    "RBACManager",
    # Capabilities
    "DVOCapability",
    "FallbackBehavior",
    "CapabilityConfig",
    "CapabilityResult",
    "OperationResult",
    "CapabilityManager",
    "GracefulDegradationHandler",
]
```

---

## TASK 6: Add Capabilities API Route

### File: `src/api/routes/capabilities.py`

```python
"""Capability management routes."""

from fastapi import APIRouter, Depends

from src.enterprise import (
    get_current_user,
    require_any_role,
    AuthenticatedUser,
    CapabilityManager,
    DVOCapability,
    RBACManager,
)


router = APIRouter(prefix="/capabilities")

# Global capability manager instance
_capability_manager: CapabilityManager = None
_rbac_manager: RBACManager = None


def init_capabilities(cap_manager: CapabilityManager, rbac: RBACManager):
    """Initialize capability management."""
    global _capability_manager, _rbac_manager
    _capability_manager = cap_manager
    _rbac_manager = rbac


def get_capability_manager() -> CapabilityManager:
    """Get capability manager instance."""
    if _capability_manager is None:
        return CapabilityManager()  # Default if not initialized
    return _capability_manager


@router.get("")
async def list_capabilities(
    user: AuthenticatedUser = Depends(get_current_user),
):
    """
    List all capabilities and their status for current user.

    Returns capability availability based on:
    - Whether capability is enabled in environment
    - User's permissions
    """
    cap_manager = get_capability_manager()
    results = cap_manager.get_all_capabilities(user, _rbac_manager)

    return {
        "user": user.to_dict(),
        "capabilities": {
            name: result.to_dict()
            for name, result in results.items()
        }
    }


@router.get("/{capability_name}")
async def check_capability(
    capability_name: str,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """Check a specific capability."""
    try:
        capability = DVOCapability(capability_name)
    except ValueError:
        return {
            "error": True,
            "message": f"Unknown capability: {capability_name}",
            "valid_capabilities": [c.value for c in DVOCapability],
        }

    cap_manager = get_capability_manager()
    result = cap_manager.check_capability(capability, user, _rbac_manager)

    return {
        "capability": capability_name,
        **result.to_dict(),
    }


@router.post("/{capability_name}/enable")
async def enable_capability(
    capability_name: str,
    user: AuthenticatedUser = Depends(require_any_role("admin")),
):
    """Enable a capability. Requires admin role."""
    try:
        capability = DVOCapability(capability_name)
    except ValueError:
        return {"error": True, "message": f"Unknown capability: {capability_name}"}

    cap_manager = get_capability_manager()
    cap_manager.set_capability_enabled(capability, True)

    return {
        "capability": capability_name,
        "enabled": True,
        "message": f"Capability {capability_name} enabled",
    }


@router.post("/{capability_name}/disable")
async def disable_capability(
    capability_name: str,
    user: AuthenticatedUser = Depends(require_any_role("admin")),
):
    """Disable a capability. Requires admin role."""
    try:
        capability = DVOCapability(capability_name)
    except ValueError:
        return {"error": True, "message": f"Unknown capability: {capability_name}"}

    cap_manager = get_capability_manager()
    cap_manager.set_capability_enabled(capability, False)

    return {
        "capability": capability_name,
        "enabled": False,
        "message": f"Capability {capability_name} disabled",
    }


@router.get("/config/export")
async def export_config(
    user: AuthenticatedUser = Depends(require_any_role("admin")),
):
    """Export current capability configuration. Requires admin role."""
    cap_manager = get_capability_manager()
    return cap_manager.export_config()
```

---

## TASK 7: Register Capabilities Route

### Update `src/api/app.py`

Add to router registration:

```python
from .routes import capabilities

# In create_app(), add:
app.include_router(capabilities.router, prefix="/v1", tags=["Capabilities"])
```

Add to lifespan initialization:

```python
from src.enterprise.capabilities.manager import CapabilityManager
from src.api.routes.capabilities import init_capabilities

# In lifespan(), after init_auth():
capability_manager = CapabilityManager()
init_capabilities(capability_manager, rbac_manager)
logger.info("Capability management initialized")
```

---

## TASK 8: Environment Variables

### Update `.env.example`

```env
# Capability Configuration
# Individual capability overrides (enabled/disabled)
CAAT_CAP_DEPLOY_COPILOT=disabled
CAAT_CAP_PARALLEL_DEPLOY=disabled
CAAT_CAP_BLUE_GREEN_DEPLOY=disabled
CAAT_CAP_CANARY_DEPLOY=disabled

# Full capability config (JSON) - overrides individual settings
# CAAT_CAPABILITIES_CONFIG={"deploy_copilot": {"enabled": false, "fallback_behavior": "manual"}}
```

---

## VALIDATION

```bash
cd /Users/kevinbauer/Kessel-Digital/CAAT

# Test imports
python -c "
from src.enterprise.capabilities import (
    DVOCapability,
    FallbackBehavior,
    CapabilityManager,
    GracefulDegradationHandler,
)
print('✓ Capability imports OK')
"

# Test capability manager
python -c "
from src.enterprise.capabilities import CapabilityManager, DVOCapability

cm = CapabilityManager()
result = cm.check_capability(DVOCapability.DEPLOY_LANGCHAIN)
print(f'✓ LangChain deploy: available={result.available}')

result = cm.check_capability(DVOCapability.CANARY_DEPLOY)
print(f'✓ Canary deploy: available={result.available}, fallback={result.fallback_behavior.value}')
"

# Run tests
pytest tests/enterprise/capabilities/ -v
```

---

## FILES CREATED

```
src/enterprise/capabilities/
├── __init__.py
├── models.py           # DVOCapability, FallbackBehavior, CapabilityResult
├── manager.py          # CapabilityManager
└── degradation.py      # GracefulDegradationHandler

src/api/routes/capabilities.py
```
