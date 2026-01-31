# CAAT Enterprise DVO Specification
## Mastercard-Ready Security & Compliance Layer
## Date: 2026-01-31

---

## OVERVIEW

This specification extends the base DVO agent with enterprise controls required for deployment in Mastercard managed environments:

- **Azure AD/Entra ID Integration** - MC directory authentication
- **Capability Manager** - Feature flags with graceful degradation
- **Policy Enforcer** - Environment-specific rules and approval gates
- **RBAC** - Role-based access control
- **Audit Logger** - Compliance trail exportable to SIEM

---

## ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ENTERPRISE DVO LAYER                             │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     AUTHENTICATION LAYER                            │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │ │
│  │  │  Azure AD /     │  │  Service        │  │  API Key        │    │ │
│  │  │  Entra ID       │  │  Principal      │  │  (Fallback)     │    │ │
│  │  │                 │  │                 │  │                 │    │ │
│  │  │  • User auth    │  │  • System auth  │  │  • Legacy       │    │ │
│  │  │  • MFA          │  │  • Managed ID   │  │  • Rate limited │    │ │
│  │  │  • Groups       │  │  • Cert-based   │  │                 │    │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│                                    ▼                                     │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     AUTHORIZATION LAYER                             │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │ │
│  │  │  RBAC           │  │  Capability     │  │  Policy         │    │ │
│  │  │  Manager        │  │  Manager        │  │  Enforcer       │    │ │
│  │  │                 │  │                 │  │                 │    │ │
│  │  │  • Roles        │  │  • Features     │  │  • Env rules    │    │ │
│  │  │  • Permissions  │  │  • Flags        │  │  • Approvals    │    │ │
│  │  │  • Scopes       │  │  • Fallbacks    │  │  • Restrictions │    │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│                                    ▼                                     │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                        DVO AGENT CORE                               │ │
│  │         (Base implementation from Phase 1)                          │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│                                    ▼                                     │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                        AUDIT LAYER                                  │ │
│  │  • All actions logged with user, timestamp, outcome, context       │ │
│  │  • Immutable audit trail                                           │ │
│  │  • SIEM export (Splunk, Azure Sentinel)                           │ │
│  │  • Retention policy compliance                                     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. AZURE AD / ENTRA ID INTEGRATION

### 1.1 Authentication Configuration

```python
@dataclass
class AzureADConfig:
    """Azure AD / Entra ID configuration."""

    # Tenant configuration
    tenant_id: str                    # MC tenant ID
    client_id: str                    # App registration client ID
    client_secret: Optional[str]      # For service principal auth

    # Authentication settings
    authority: str = "https://login.microsoftonline.com"
    scopes: List[str] = field(default_factory=lambda: [
        "https://graph.microsoft.com/.default"
    ])

    # MFA requirements
    require_mfa: bool = True
    mfa_exempt_service_principals: List[str] = field(default_factory=list)

    # Group mappings (Azure AD Group ID -> CAAT Role)
    group_role_mappings: Dict[str, str] = field(default_factory=dict)

    # Session settings
    token_cache_enabled: bool = True
    session_timeout_minutes: int = 60
    refresh_token_enabled: bool = True
```

### 1.2 Authentication Provider

```python
from azure.identity import (
    DefaultAzureCredential,
    ClientSecretCredential,
    ManagedIdentityCredential,
    InteractiveBrowserCredential,
)
from msal import ConfidentialClientApplication
import jwt


class AzureADAuthProvider:
    """
    Azure AD authentication provider.

    Supports multiple authentication flows:
    - Interactive browser (user auth with MFA)
    - Service principal (system auth)
    - Managed identity (Azure-hosted services)
    - Fallback to API key (legacy/emergency)
    """

    def __init__(self, config: AzureADConfig):
        self.config = config
        self._msal_app = self._create_msal_app()
        self._token_cache = {}

    def _create_msal_app(self) -> ConfidentialClientApplication:
        """Create MSAL application for token acquisition."""
        return ConfidentialClientApplication(
            client_id=self.config.client_id,
            client_credential=self.config.client_secret,
            authority=f"{self.config.authority}/{self.config.tenant_id}",
        )

    async def authenticate_user(
        self,
        access_token: str
    ) -> "AuthenticatedUser":
        """
        Authenticate user from Azure AD token.

        Args:
            access_token: Bearer token from Azure AD

        Returns:
            AuthenticatedUser with roles and permissions
        """
        # Validate token
        claims = await self._validate_token(access_token)

        # Extract user info
        user_id = claims.get("oid")  # Object ID
        email = claims.get("preferred_username") or claims.get("email")
        name = claims.get("name")
        groups = claims.get("groups", [])

        # Map groups to roles
        roles = self._map_groups_to_roles(groups)

        # Check MFA claim if required
        if self.config.require_mfa:
            amr = claims.get("amr", [])
            if "mfa" not in amr and user_id not in self.config.mfa_exempt_service_principals:
                raise AuthenticationError("MFA required but not satisfied")

        return AuthenticatedUser(
            user_id=user_id,
            email=email,
            name=name,
            groups=groups,
            roles=roles,
            token_claims=claims,
            auth_method="azure_ad",
        )

    async def authenticate_service_principal(
        self,
        client_id: str,
        client_secret: str,
    ) -> "AuthenticatedUser":
        """Authenticate service principal for system-to-system auth."""
        credential = ClientSecretCredential(
            tenant_id=self.config.tenant_id,
            client_id=client_id,
            client_secret=client_secret,
        )

        token = await credential.get_token(*self.config.scopes)
        claims = jwt.decode(token.token, options={"verify_signature": False})

        return AuthenticatedUser(
            user_id=claims.get("oid"),
            email=None,
            name=claims.get("app_displayname", "Service Principal"),
            groups=[],
            roles=["service_account"],
            token_claims=claims,
            auth_method="service_principal",
        )

    async def authenticate_managed_identity(self) -> "AuthenticatedUser":
        """Authenticate using Azure Managed Identity (for Azure-hosted services)."""
        credential = ManagedIdentityCredential()
        token = await credential.get_token(*self.config.scopes)
        claims = jwt.decode(token.token, options={"verify_signature": False})

        return AuthenticatedUser(
            user_id=claims.get("oid"),
            email=None,
            name="Managed Identity",
            groups=[],
            roles=["managed_identity"],
            token_claims=claims,
            auth_method="managed_identity",
        )

    def _map_groups_to_roles(self, groups: List[str]) -> List[str]:
        """Map Azure AD groups to CAAT roles."""
        roles = []
        for group_id in groups:
            if group_id in self.config.group_role_mappings:
                roles.append(self.config.group_role_mappings[group_id])
        return roles or ["viewer"]  # Default role

    async def _validate_token(self, token: str) -> Dict[str, Any]:
        """Validate Azure AD token and return claims."""
        # In production: validate signature against Azure AD keys
        # For now: decode and basic validation
        try:
            claims = jwt.decode(
                token,
                options={"verify_signature": False},  # Production: verify!
                audience=self.config.client_id,
            )

            # Verify issuer
            expected_issuer = f"https://sts.windows.net/{self.config.tenant_id}/"
            if claims.get("iss") != expected_issuer:
                raise AuthenticationError("Invalid token issuer")

            # Verify expiration
            import time
            if claims.get("exp", 0) < time.time():
                raise AuthenticationError("Token expired")

            return claims

        except jwt.DecodeError as e:
            raise AuthenticationError(f"Invalid token: {e}")


@dataclass
class AuthenticatedUser:
    """Authenticated user context."""
    user_id: str
    email: Optional[str]
    name: str
    groups: List[str]
    roles: List[str]
    token_claims: Dict[str, Any]
    auth_method: str  # azure_ad, service_principal, managed_identity, api_key

    def has_role(self, role: str) -> bool:
        return role in self.roles

    def has_any_role(self, roles: List[str]) -> bool:
        return any(r in self.roles for r in roles)

    def to_audit_dict(self) -> Dict[str, Any]:
        """Return sanitized dict for audit logging."""
        return {
            "user_id": self.user_id,
            "email": self.email,
            "name": self.name,
            "roles": self.roles,
            "auth_method": self.auth_method,
        }
```

---

## 2. ROLE-BASED ACCESS CONTROL (RBAC)

### 2.1 Role Definitions

```python
class DVORole(Enum):
    """DVO role hierarchy."""

    VIEWER = "viewer"
    """Can view status, cannot make changes"""

    DEVELOPER = "developer"
    """Can deploy to development/staging"""

    OPERATOR = "operator"
    """Can deploy to staging, validate production"""

    RELEASE_MANAGER = "release_manager"
    """Can deploy to production with approval"""

    ADMIN = "admin"
    """Full access including policy management"""

    SERVICE_ACCOUNT = "service_account"
    """Automated deployments (CI/CD)"""


class DVOPermission(Enum):
    """Granular permissions for DVO operations."""

    # View permissions
    VIEW_STATUS = "view_status"
    VIEW_DEPLOYMENTS = "view_deployments"
    VIEW_AUDIT_LOG = "view_audit_log"

    # Validation permissions
    VALIDATE_AGENTS = "validate_agents"

    # Deployment permissions
    DEPLOY_DEVELOPMENT = "deploy_development"
    DEPLOY_STAGING = "deploy_staging"
    DEPLOY_PRODUCTION = "deploy_production"

    # Rollback permissions
    ROLLBACK_STAGING = "rollback_staging"
    ROLLBACK_PRODUCTION = "rollback_production"

    # Admin permissions
    MANAGE_POLICIES = "manage_policies"
    MANAGE_CAPABILITIES = "manage_capabilities"
    MANAGE_USERS = "manage_users"
    BYPASS_APPROVAL = "bypass_approval"


# Role -> Permission mappings
ROLE_PERMISSIONS: Dict[DVORole, List[DVOPermission]] = {
    DVORole.VIEWER: [
        DVOPermission.VIEW_STATUS,
        DVOPermission.VIEW_DEPLOYMENTS,
    ],
    DVORole.DEVELOPER: [
        DVOPermission.VIEW_STATUS,
        DVOPermission.VIEW_DEPLOYMENTS,
        DVOPermission.VALIDATE_AGENTS,
        DVOPermission.DEPLOY_DEVELOPMENT,
    ],
    DVORole.OPERATOR: [
        DVOPermission.VIEW_STATUS,
        DVOPermission.VIEW_DEPLOYMENTS,
        DVOPermission.VIEW_AUDIT_LOG,
        DVOPermission.VALIDATE_AGENTS,
        DVOPermission.DEPLOY_DEVELOPMENT,
        DVOPermission.DEPLOY_STAGING,
        DVOPermission.ROLLBACK_STAGING,
    ],
    DVORole.RELEASE_MANAGER: [
        DVOPermission.VIEW_STATUS,
        DVOPermission.VIEW_DEPLOYMENTS,
        DVOPermission.VIEW_AUDIT_LOG,
        DVOPermission.VALIDATE_AGENTS,
        DVOPermission.DEPLOY_DEVELOPMENT,
        DVOPermission.DEPLOY_STAGING,
        DVOPermission.DEPLOY_PRODUCTION,
        DVOPermission.ROLLBACK_STAGING,
        DVOPermission.ROLLBACK_PRODUCTION,
    ],
    DVORole.ADMIN: [
        p for p in DVOPermission  # All permissions
    ],
    DVORole.SERVICE_ACCOUNT: [
        DVOPermission.VIEW_STATUS,
        DVOPermission.VALIDATE_AGENTS,
        DVOPermission.DEPLOY_DEVELOPMENT,
        DVOPermission.DEPLOY_STAGING,
        # Production requires human approval
    ],
}
```

### 2.2 RBAC Manager

```python
class RBACManager:
    """
    Role-Based Access Control manager.

    Enforces permissions based on user roles and
    environment-specific overrides.
    """

    def __init__(
        self,
        role_permissions: Dict[DVORole, List[DVOPermission]] = None,
        environment_overrides: Dict[str, Dict[str, bool]] = None,
    ):
        self.role_permissions = role_permissions or ROLE_PERMISSIONS
        self.environment_overrides = environment_overrides or {}

    def check_permission(
        self,
        user: AuthenticatedUser,
        permission: DVOPermission,
        environment: Optional[str] = None,
    ) -> "PermissionResult":
        """
        Check if user has permission.

        Args:
            user: Authenticated user
            permission: Required permission
            environment: Optional environment context

        Returns:
            PermissionResult with allowed status and reason
        """
        # Check environment-specific overrides first
        if environment and environment in self.environment_overrides:
            override = self.environment_overrides[environment].get(permission.value)
            if override is False:
                return PermissionResult(
                    allowed=False,
                    reason=f"Permission {permission.value} disabled for {environment}",
                    requires_approval=False,
                )

        # Check user roles
        for role_name in user.roles:
            try:
                role = DVORole(role_name)
                if permission in self.role_permissions.get(role, []):
                    return PermissionResult(
                        allowed=True,
                        reason=f"Granted by role: {role.value}",
                        requires_approval=False,
                    )
            except ValueError:
                continue  # Unknown role, skip

        # Check if approval workflow can grant access
        if self._can_request_approval(permission):
            return PermissionResult(
                allowed=False,
                reason=f"Permission {permission.value} requires approval",
                requires_approval=True,
            )

        return PermissionResult(
            allowed=False,
            reason=f"No role grants permission: {permission.value}",
            requires_approval=False,
        )

    def _can_request_approval(self, permission: DVOPermission) -> bool:
        """Check if permission can be granted via approval."""
        approval_eligible = [
            DVOPermission.DEPLOY_PRODUCTION,
            DVOPermission.ROLLBACK_PRODUCTION,
        ]
        return permission in approval_eligible

    def get_user_permissions(
        self,
        user: AuthenticatedUser,
    ) -> List[DVOPermission]:
        """Get all permissions for a user."""
        permissions = set()
        for role_name in user.roles:
            try:
                role = DVORole(role_name)
                permissions.update(self.role_permissions.get(role, []))
            except ValueError:
                continue
        return list(permissions)


@dataclass
class PermissionResult:
    """Result of permission check."""
    allowed: bool
    reason: str
    requires_approval: bool = False
    approval_id: Optional[str] = None
```

---

## 3. CAPABILITY MANAGER

### 3.1 Feature Flags with Graceful Degradation

```python
class DVOCapability(Enum):
    """DVO capabilities that can be toggled."""

    # Deployment capabilities
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

    # Advanced capabilities
    PARALLEL_DEPLOY = "parallel_deploy"
    BLUE_GREEN_DEPLOY = "blue_green_deploy"
    CANARY_DEPLOY = "canary_deploy"


@dataclass
class CapabilityConfig:
    """Configuration for a capability."""
    capability: DVOCapability
    enabled: bool
    fallback_behavior: str  # "error", "skip", "degrade", "manual"
    fallback_message: str
    required_permissions: List[DVOPermission] = field(default_factory=list)
    required_approval: bool = False
    audit_when_used: bool = True


class CapabilityManager:
    """
    Manages feature flags with graceful degradation.

    Allows enterprise environments to disable capabilities
    while providing meaningful fallback behavior.
    """

    def __init__(self):
        self._capabilities: Dict[DVOCapability, CapabilityConfig] = {}
        self._load_default_config()

    def _load_default_config(self):
        """Load default capability configuration."""
        defaults = [
            CapabilityConfig(
                capability=DVOCapability.DEPLOY_LANGCHAIN,
                enabled=True,
                fallback_behavior="error",
                fallback_message="LangChain deployment is not available in this environment",
            ),
            CapabilityConfig(
                capability=DVOCapability.DEPLOY_FASTAPI,
                enabled=True,
                fallback_behavior="error",
                fallback_message="FastAPI deployment is not available in this environment",
            ),
            CapabilityConfig(
                capability=DVOCapability.DEPLOY_COPILOT,
                enabled=True,
                fallback_behavior="manual",
                fallback_message="Copilot Studio deployment requires manual action. Please contact your administrator.",
            ),
            CapabilityConfig(
                capability=DVOCapability.DEPLOY_TO_PRODUCTION,
                enabled=True,
                fallback_behavior="error",
                fallback_message="Production deployment is disabled in this environment",
                required_permissions=[DVOPermission.DEPLOY_PRODUCTION],
                required_approval=True,
            ),
            CapabilityConfig(
                capability=DVOCapability.AUTO_ROLLBACK,
                enabled=True,
                fallback_behavior="skip",
                fallback_message="Auto-rollback disabled; manual rollback available if needed",
            ),
            CapabilityConfig(
                capability=DVOCapability.KB_SYNC,
                enabled=True,
                fallback_behavior="degrade",
                fallback_message="KB sync unavailable; deployment will proceed without KB update",
            ),
            CapabilityConfig(
                capability=DVOCapability.INTEGRATION_TESTS,
                enabled=True,
                fallback_behavior="skip",
                fallback_message="Integration tests skipped; manual verification recommended",
            ),
        ]
        for config in defaults:
            self._capabilities[config.capability] = config

    def load_environment_config(self, config_dict: Dict[str, Any]):
        """Load environment-specific capability configuration."""
        for cap_name, settings in config_dict.items():
            try:
                capability = DVOCapability(cap_name)
                if capability in self._capabilities:
                    self._capabilities[capability].enabled = settings.get(
                        "enabled",
                        self._capabilities[capability].enabled
                    )
                    if "fallback_behavior" in settings:
                        self._capabilities[capability].fallback_behavior = settings["fallback_behavior"]
            except ValueError:
                continue  # Unknown capability

    def check_capability(
        self,
        capability: DVOCapability,
        user: Optional[AuthenticatedUser] = None,
        rbac: Optional[RBACManager] = None,
    ) -> "CapabilityResult":
        """
        Check if capability is available.

        Args:
            capability: Capability to check
            user: User context for permission check
            rbac: RBAC manager for permission check

        Returns:
            CapabilityResult with availability and fallback
        """
        config = self._capabilities.get(capability)

        if not config:
            return CapabilityResult(
                available=False,
                fallback_behavior="error",
                message=f"Unknown capability: {capability.value}",
            )

        # Check if enabled
        if not config.enabled:
            return CapabilityResult(
                available=False,
                fallback_behavior=config.fallback_behavior,
                message=config.fallback_message,
                requires_manual_action=(config.fallback_behavior == "manual"),
            )

        # Check permissions if user provided
        if user and rbac and config.required_permissions:
            for perm in config.required_permissions:
                result = rbac.check_permission(user, perm)
                if not result.allowed:
                    return CapabilityResult(
                        available=False,
                        fallback_behavior="error",
                        message=f"Permission denied: {perm.value}",
                        requires_approval=result.requires_approval,
                    )

        return CapabilityResult(
            available=True,
            fallback_behavior="none",
            message="Capability available",
            requires_approval=config.required_approval,
        )

    def get_available_capabilities(
        self,
        user: Optional[AuthenticatedUser] = None,
        rbac: Optional[RBACManager] = None,
    ) -> Dict[str, "CapabilityResult"]:
        """Get all capabilities with their availability status."""
        return {
            cap.value: self.check_capability(cap, user, rbac)
            for cap in DVOCapability
        }


@dataclass
class CapabilityResult:
    """Result of capability check."""
    available: bool
    fallback_behavior: str  # "none", "error", "skip", "degrade", "manual"
    message: str
    requires_approval: bool = False
    requires_manual_action: bool = False
    degraded_features: List[str] = field(default_factory=list)
```

### 3.2 Graceful Degradation Handler

```python
class GracefulDegradationHandler:
    """
    Handles graceful degradation when capabilities are unavailable.

    Provides meaningful user feedback and alternative actions
    when features are blocked.
    """

    def __init__(
        self,
        capability_manager: CapabilityManager,
        audit_logger: "AuditLogger",
    ):
        self.capability_manager = capability_manager
        self.audit_logger = audit_logger

    async def execute_with_fallback(
        self,
        capability: DVOCapability,
        operation: Callable,
        user: AuthenticatedUser,
        context: Dict[str, Any],
        fallback_operation: Optional[Callable] = None,
    ) -> "OperationResult":
        """
        Execute operation with fallback handling.

        Args:
            capability: Required capability
            operation: Primary operation to execute
            user: User context
            context: Operation context
            fallback_operation: Optional fallback if capability unavailable

        Returns:
            OperationResult with outcome
        """
        # Check capability
        cap_result = self.capability_manager.check_capability(capability, user)

        if cap_result.available:
            # Execute primary operation
            try:
                result = await operation()
                await self.audit_logger.log_operation(
                    user=user,
                    operation=capability.value,
                    status="success",
                    context=context,
                )
                return OperationResult(
                    success=True,
                    result=result,
                    degraded=False,
                )
            except Exception as e:
                await self.audit_logger.log_operation(
                    user=user,
                    operation=capability.value,
                    status="error",
                    context={**context, "error": str(e)},
                )
                raise

        # Handle fallback based on behavior
        behavior = cap_result.fallback_behavior

        if behavior == "error":
            await self.audit_logger.log_operation(
                user=user,
                operation=capability.value,
                status="blocked",
                context={**context, "reason": cap_result.message},
            )
            return OperationResult(
                success=False,
                error=cap_result.message,
                degraded=False,
                blocked=True,
            )

        elif behavior == "skip":
            await self.audit_logger.log_operation(
                user=user,
                operation=capability.value,
                status="skipped",
                context={**context, "reason": cap_result.message},
            )
            return OperationResult(
                success=True,
                result=None,
                degraded=True,
                skipped_operations=[capability.value],
                message=cap_result.message,
            )

        elif behavior == "degrade":
            # Execute fallback if available
            if fallback_operation:
                result = await fallback_operation()
                await self.audit_logger.log_operation(
                    user=user,
                    operation=f"{capability.value}_degraded",
                    status="degraded",
                    context=context,
                )
                return OperationResult(
                    success=True,
                    result=result,
                    degraded=True,
                    message=cap_result.message,
                )
            else:
                return OperationResult(
                    success=True,
                    result=None,
                    degraded=True,
                    message=cap_result.message,
                )

        elif behavior == "manual":
            await self.audit_logger.log_operation(
                user=user,
                operation=capability.value,
                status="manual_required",
                context=context,
            )
            return OperationResult(
                success=False,
                requires_manual_action=True,
                manual_instructions=cap_result.message,
                degraded=False,
            )

        return OperationResult(
            success=False,
            error="Unknown fallback behavior",
            degraded=False,
        )


@dataclass
class OperationResult:
    """Result of an operation with fallback handling."""
    success: bool
    result: Any = None
    error: Optional[str] = None
    degraded: bool = False
    blocked: bool = False
    skipped_operations: List[str] = field(default_factory=list)
    requires_manual_action: bool = False
    manual_instructions: Optional[str] = None
    message: Optional[str] = None
```

---

## 4. POLICY ENFORCER

### 4.1 Policy Definitions

```python
@dataclass
class DeploymentPolicy:
    """Policy for deployment operations."""

    policy_id: str
    name: str
    description: str

    # Scope
    environments: List[str]  # ["production", "staging"] or ["*"]
    platforms: List[str]     # ["langchain", "fastapi"] or ["*"]
    agents: List[str]        # ["GHA", "ORC"] or ["*"]

    # Rules
    require_approval: bool = False
    approval_roles: List[str] = field(default_factory=list)
    min_approvers: int = 1

    require_validation: bool = True
    require_tests: bool = True
    require_health_check: bool = True

    # Restrictions
    blocked_actions: List[str] = field(default_factory=list)
    allowed_time_windows: List[Dict[str, str]] = field(default_factory=list)
    blackout_periods: List[Dict[str, str]] = field(default_factory=list)

    # Notifications
    notify_on_deploy: List[str] = field(default_factory=list)  # Email addresses
    notify_on_failure: List[str] = field(default_factory=list)

    # Active
    enabled: bool = True


class PolicyEnforcer:
    """
    Enforces deployment policies.

    Evaluates policies based on deployment context and
    returns enforcement decisions.
    """

    def __init__(self):
        self._policies: List[DeploymentPolicy] = []
        self._approval_store: Dict[str, "ApprovalRecord"] = {}

    def load_policies(self, policies: List[DeploymentPolicy]):
        """Load policies from configuration."""
        self._policies = [p for p in policies if p.enabled]

    def evaluate(
        self,
        environment: str,
        platform: str,
        agents: List[str],
        action: str,
        user: AuthenticatedUser,
    ) -> "PolicyEvaluation":
        """
        Evaluate policies for a deployment.

        Args:
            environment: Target environment
            platform: Target platform
            agents: Agents being deployed
            action: Action being performed
            user: User performing action

        Returns:
            PolicyEvaluation with decision
        """
        applicable_policies = self._get_applicable_policies(
            environment, platform, agents
        )

        violations = []
        requirements = []
        approvals_needed = []

        for policy in applicable_policies:
            # Check blocked actions
            if action in policy.blocked_actions:
                violations.append(PolicyViolation(
                    policy_id=policy.policy_id,
                    policy_name=policy.name,
                    violation_type="blocked_action",
                    message=f"Action '{action}' is blocked by policy '{policy.name}'",
                    severity="error",
                ))

            # Check time windows
            if policy.allowed_time_windows:
                if not self._is_within_time_window(policy.allowed_time_windows):
                    violations.append(PolicyViolation(
                        policy_id=policy.policy_id,
                        policy_name=policy.name,
                        violation_type="time_window",
                        message=f"Deployment outside allowed time window",
                        severity="error",
                    ))

            # Check blackout periods
            if policy.blackout_periods:
                if self._is_within_blackout(policy.blackout_periods):
                    violations.append(PolicyViolation(
                        policy_id=policy.policy_id,
                        policy_name=policy.name,
                        violation_type="blackout_period",
                        message=f"Deployment blocked during blackout period",
                        severity="error",
                    ))

            # Check approval requirements
            if policy.require_approval:
                approval = self._check_approval(
                    policy, environment, platform, agents, user
                )
                if not approval.approved:
                    approvals_needed.append(ApprovalRequirement(
                        policy_id=policy.policy_id,
                        policy_name=policy.name,
                        required_roles=policy.approval_roles,
                        min_approvers=policy.min_approvers,
                        current_approvers=approval.current_approvers,
                    ))

            # Collect requirements
            if policy.require_validation:
                requirements.append("validation")
            if policy.require_tests:
                requirements.append("tests")
            if policy.require_health_check:
                requirements.append("health_check")

        # Determine overall decision
        if violations:
            decision = "deny"
        elif approvals_needed:
            decision = "pending_approval"
        else:
            decision = "allow"

        return PolicyEvaluation(
            decision=decision,
            violations=violations,
            requirements=list(set(requirements)),
            approvals_needed=approvals_needed,
            applicable_policies=[p.policy_id for p in applicable_policies],
            notifications=self._collect_notifications(applicable_policies),
        )

    def _get_applicable_policies(
        self,
        environment: str,
        platform: str,
        agents: List[str],
    ) -> List[DeploymentPolicy]:
        """Get policies that apply to this deployment."""
        applicable = []
        for policy in self._policies:
            env_match = "*" in policy.environments or environment in policy.environments
            plat_match = "*" in policy.platforms or platform in policy.platforms
            agent_match = "*" in policy.agents or any(a in policy.agents for a in agents)

            if env_match and plat_match and agent_match:
                applicable.append(policy)
        return applicable

    def _is_within_time_window(self, windows: List[Dict[str, str]]) -> bool:
        """Check if current time is within allowed windows."""
        from datetime import datetime
        now = datetime.utcnow()
        # Implementation: check if now falls within any window
        return True  # Simplified

    def _is_within_blackout(self, blackouts: List[Dict[str, str]]) -> bool:
        """Check if current time is within a blackout period."""
        return False  # Simplified

    def _check_approval(
        self,
        policy: DeploymentPolicy,
        environment: str,
        platform: str,
        agents: List[str],
        user: AuthenticatedUser,
    ) -> "ApprovalStatus":
        """Check approval status for deployment."""
        approval_key = f"{environment}:{platform}:{','.join(sorted(agents))}"

        if approval_key in self._approval_store:
            record = self._approval_store[approval_key]
            if len(record.approvers) >= policy.min_approvers:
                return ApprovalStatus(approved=True, current_approvers=record.approvers)

        return ApprovalStatus(approved=False, current_approvers=[])

    def _collect_notifications(
        self,
        policies: List[DeploymentPolicy],
    ) -> List[str]:
        """Collect notification recipients from policies."""
        recipients = set()
        for policy in policies:
            recipients.update(policy.notify_on_deploy)
        return list(recipients)

    async def request_approval(
        self,
        environment: str,
        platform: str,
        agents: List[str],
        requester: AuthenticatedUser,
        justification: str,
    ) -> "ApprovalRequest":
        """Create approval request for deployment."""
        request_id = str(uuid.uuid4())[:8]
        approval_key = f"{environment}:{platform}:{','.join(sorted(agents))}"

        # Store request
        self._approval_store[approval_key] = ApprovalRecord(
            request_id=request_id,
            requester=requester.user_id,
            environment=environment,
            platform=platform,
            agents=agents,
            justification=justification,
            approvers=[],
            created_at=datetime.utcnow(),
        )

        return ApprovalRequest(
            request_id=request_id,
            status="pending",
            message="Approval request created",
        )

    async def approve(
        self,
        request_id: str,
        approver: AuthenticatedUser,
    ) -> "ApprovalResult":
        """Approve a deployment request."""
        for key, record in self._approval_store.items():
            if record.request_id == request_id:
                if approver.user_id not in record.approvers:
                    record.approvers.append(approver.user_id)
                return ApprovalResult(
                    success=True,
                    current_approvers=record.approvers,
                )

        return ApprovalResult(success=False, error="Request not found")


@dataclass
class PolicyViolation:
    """A policy violation."""
    policy_id: str
    policy_name: str
    violation_type: str
    message: str
    severity: str  # "error", "warning"


@dataclass
class ApprovalRequirement:
    """Approval requirement from policy."""
    policy_id: str
    policy_name: str
    required_roles: List[str]
    min_approvers: int
    current_approvers: List[str]


@dataclass
class PolicyEvaluation:
    """Result of policy evaluation."""
    decision: str  # "allow", "deny", "pending_approval"
    violations: List[PolicyViolation]
    requirements: List[str]
    approvals_needed: List[ApprovalRequirement]
    applicable_policies: List[str]
    notifications: List[str]


@dataclass
class ApprovalRecord:
    """Record of approval request."""
    request_id: str
    requester: str
    environment: str
    platform: str
    agents: List[str]
    justification: str
    approvers: List[str]
    created_at: datetime


@dataclass
class ApprovalStatus:
    approved: bool
    current_approvers: List[str]


@dataclass
class ApprovalRequest:
    request_id: str
    status: str
    message: str


@dataclass
class ApprovalResult:
    success: bool
    current_approvers: List[str] = field(default_factory=list)
    error: Optional[str] = None
```

---

## 5. AUDIT LOGGER

### 5.1 Audit Log Implementation

```python
from enum import Enum
from datetime import datetime
import json
import hashlib


class AuditEventType(Enum):
    """Types of audit events."""

    # Authentication
    AUTH_SUCCESS = "auth_success"
    AUTH_FAILURE = "auth_failure"
    AUTH_MFA_REQUIRED = "auth_mfa_required"

    # Authorization
    PERMISSION_GRANTED = "permission_granted"
    PERMISSION_DENIED = "permission_denied"
    APPROVAL_REQUESTED = "approval_requested"
    APPROVAL_GRANTED = "approval_granted"
    APPROVAL_DENIED = "approval_denied"

    # Operations
    VALIDATION_STARTED = "validation_started"
    VALIDATION_COMPLETED = "validation_completed"
    DEPLOYMENT_STARTED = "deployment_started"
    DEPLOYMENT_COMPLETED = "deployment_completed"
    DEPLOYMENT_FAILED = "deployment_failed"
    ROLLBACK_STARTED = "rollback_started"
    ROLLBACK_COMPLETED = "rollback_completed"

    # Policy
    POLICY_EVALUATED = "policy_evaluated"
    POLICY_VIOLATION = "policy_violation"

    # System
    CAPABILITY_CHECKED = "capability_checked"
    CAPABILITY_DEGRADED = "capability_degraded"
    CAPABILITY_BLOCKED = "capability_blocked"


@dataclass
class AuditLogEntry:
    """Immutable audit log entry."""

    event_id: str
    timestamp: datetime
    event_type: AuditEventType

    # Actor
    user_id: str
    user_email: Optional[str]
    user_roles: List[str]
    auth_method: str

    # Action
    operation: str
    resource: str
    resource_type: str

    # Context
    environment: Optional[str]
    platform: Optional[str]
    agents: List[str]

    # Outcome
    status: str  # "success", "failure", "blocked", "degraded"
    error_message: Optional[str]

    # Additional data
    request_id: Optional[str]
    session_id: Optional[str]
    ip_address: Optional[str]
    user_agent: Optional[str]

    # Policy context
    policies_evaluated: List[str]
    policy_violations: List[str]

    # Metadata
    metadata: Dict[str, Any]

    # Integrity
    previous_hash: Optional[str]
    entry_hash: str = field(init=False)

    def __post_init__(self):
        """Compute entry hash for integrity verification."""
        self.entry_hash = self._compute_hash()

    def _compute_hash(self) -> str:
        """Compute SHA-256 hash of entry for integrity."""
        content = json.dumps({
            "event_id": self.event_id,
            "timestamp": self.timestamp.isoformat(),
            "event_type": self.event_type.value,
            "user_id": self.user_id,
            "operation": self.operation,
            "status": self.status,
            "previous_hash": self.previous_hash,
        }, sort_keys=True)
        return hashlib.sha256(content.encode()).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for storage/export."""
        return {
            "event_id": self.event_id,
            "timestamp": self.timestamp.isoformat(),
            "event_type": self.event_type.value,
            "user_id": self.user_id,
            "user_email": self.user_email,
            "user_roles": self.user_roles,
            "auth_method": self.auth_method,
            "operation": self.operation,
            "resource": self.resource,
            "resource_type": self.resource_type,
            "environment": self.environment,
            "platform": self.platform,
            "agents": self.agents,
            "status": self.status,
            "error_message": self.error_message,
            "request_id": self.request_id,
            "session_id": self.session_id,
            "ip_address": self.ip_address,
            "policies_evaluated": self.policies_evaluated,
            "policy_violations": self.policy_violations,
            "metadata": self.metadata,
            "entry_hash": self.entry_hash,
            "previous_hash": self.previous_hash,
        }

    def to_siem_format(self) -> Dict[str, Any]:
        """Convert to SIEM-compatible format (CEF-like)."""
        return {
            "cef_version": "0",
            "device_vendor": "KesselDigital",
            "device_product": "CAAT-DVO",
            "device_version": "1.0",
            "signature_id": self.event_type.value,
            "name": self.operation,
            "severity": self._get_severity(),
            "extension": {
                "src": self.ip_address,
                "suser": self.user_email or self.user_id,
                "outcome": self.status,
                "reason": self.error_message,
                "cs1": self.environment,
                "cs1Label": "Environment",
                "cs2": self.platform,
                "cs2Label": "Platform",
            }
        }

    def _get_severity(self) -> int:
        """Get severity level for SIEM."""
        if "failure" in self.status or "denied" in self.status:
            return 7
        elif "blocked" in self.status or "violation" in self.event_type.value:
            return 5
        elif "degraded" in self.status:
            return 3
        return 1


class AuditLogger:
    """
    Immutable audit logger with SIEM export capability.

    Features:
    - Chained hashing for tamper detection
    - Multiple export formats (JSON, CEF, Splunk)
    - Retention policy support
    - Real-time streaming to SIEM
    """

    def __init__(
        self,
        storage_backend: "AuditStorageBackend",
        siem_exporter: Optional["SIEMExporter"] = None,
        retention_days: int = 365,
    ):
        self.storage = storage_backend
        self.siem_exporter = siem_exporter
        self.retention_days = retention_days
        self._last_hash: Optional[str] = None

    async def log(
        self,
        event_type: AuditEventType,
        user: AuthenticatedUser,
        operation: str,
        resource: str,
        resource_type: str,
        status: str,
        environment: Optional[str] = None,
        platform: Optional[str] = None,
        agents: List[str] = None,
        error_message: Optional[str] = None,
        request_context: Optional[Dict[str, Any]] = None,
        policy_context: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> AuditLogEntry:
        """
        Log an audit event.

        Args:
            event_type: Type of event
            user: Authenticated user
            operation: Operation being performed
            resource: Resource being acted upon
            resource_type: Type of resource
            status: Outcome status
            environment: Target environment
            platform: Target platform
            agents: Agents involved
            error_message: Error message if failed
            request_context: Request context (IP, session, etc.)
            policy_context: Policy evaluation context
            metadata: Additional metadata

        Returns:
            Created audit log entry
        """
        request_context = request_context or {}
        policy_context = policy_context or {}

        entry = AuditLogEntry(
            event_id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            event_type=event_type,
            user_id=user.user_id,
            user_email=user.email,
            user_roles=user.roles,
            auth_method=user.auth_method,
            operation=operation,
            resource=resource,
            resource_type=resource_type,
            environment=environment,
            platform=platform,
            agents=agents or [],
            status=status,
            error_message=error_message,
            request_id=request_context.get("request_id"),
            session_id=request_context.get("session_id"),
            ip_address=request_context.get("ip_address"),
            user_agent=request_context.get("user_agent"),
            policies_evaluated=policy_context.get("policies_evaluated", []),
            policy_violations=policy_context.get("policy_violations", []),
            metadata=metadata or {},
            previous_hash=self._last_hash,
        )

        # Store entry
        await self.storage.store(entry)

        # Update chain
        self._last_hash = entry.entry_hash

        # Export to SIEM if configured
        if self.siem_exporter:
            await self.siem_exporter.export(entry)

        return entry

    async def log_operation(
        self,
        user: AuthenticatedUser,
        operation: str,
        status: str,
        context: Dict[str, Any],
    ):
        """Convenience method for logging operations."""
        await self.log(
            event_type=AuditEventType.DEPLOYMENT_COMPLETED if status == "success"
                else AuditEventType.DEPLOYMENT_FAILED,
            user=user,
            operation=operation,
            resource=context.get("resource", operation),
            resource_type="deployment",
            status=status,
            environment=context.get("environment"),
            platform=context.get("platform"),
            agents=context.get("agents", []),
            error_message=context.get("error"),
            metadata=context,
        )

    async def query(
        self,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        user_id: Optional[str] = None,
        event_types: Optional[List[AuditEventType]] = None,
        environment: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 100,
    ) -> List[AuditLogEntry]:
        """Query audit log entries."""
        return await self.storage.query(
            start_time=start_time,
            end_time=end_time,
            user_id=user_id,
            event_types=event_types,
            environment=environment,
            status=status,
            limit=limit,
        )

    async def verify_integrity(
        self,
        entries: List[AuditLogEntry],
    ) -> "IntegrityVerificationResult":
        """Verify integrity of audit log chain."""
        if not entries:
            return IntegrityVerificationResult(valid=True, entries_checked=0)

        invalid_entries = []
        for i, entry in enumerate(entries):
            # Verify hash
            expected_hash = entry._compute_hash()
            if entry.entry_hash != expected_hash:
                invalid_entries.append((entry.event_id, "hash_mismatch"))

            # Verify chain
            if i > 0:
                if entry.previous_hash != entries[i-1].entry_hash:
                    invalid_entries.append((entry.event_id, "chain_broken"))

        return IntegrityVerificationResult(
            valid=len(invalid_entries) == 0,
            entries_checked=len(entries),
            invalid_entries=invalid_entries,
        )


@dataclass
class IntegrityVerificationResult:
    """Result of audit log integrity verification."""
    valid: bool
    entries_checked: int
    invalid_entries: List[tuple] = field(default_factory=list)


class SIEMExporter:
    """Export audit logs to SIEM systems."""

    def __init__(
        self,
        siem_type: str,  # "splunk", "azure_sentinel", "generic"
        endpoint: str,
        api_key: str,
    ):
        self.siem_type = siem_type
        self.endpoint = endpoint
        self.api_key = api_key

    async def export(self, entry: AuditLogEntry):
        """Export entry to SIEM."""
        if self.siem_type == "splunk":
            await self._export_splunk(entry)
        elif self.siem_type == "azure_sentinel":
            await self._export_azure_sentinel(entry)
        else:
            await self._export_generic(entry)

    async def _export_splunk(self, entry: AuditLogEntry):
        """Export to Splunk HEC."""
        import httpx
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{self.endpoint}/services/collector/event",
                headers={"Authorization": f"Splunk {self.api_key}"},
                json={"event": entry.to_dict()},
            )

    async def _export_azure_sentinel(self, entry: AuditLogEntry):
        """Export to Azure Sentinel."""
        # Implementation for Azure Log Analytics
        pass

    async def _export_generic(self, entry: AuditLogEntry):
        """Export to generic webhook."""
        import httpx
        async with httpx.AsyncClient() as client:
            await client.post(
                self.endpoint,
                headers={"X-API-Key": self.api_key},
                json=entry.to_siem_format(),
            )
```

---

## 6. ENTERPRISE DVO AGENT

### 6.1 Integration Layer

```python
class EnterpriseDVOAgent(DVOAgent):
    """
    Enterprise DVO Agent with security controls.

    Extends base DVO with:
    - Azure AD authentication
    - RBAC enforcement
    - Capability management
    - Policy enforcement
    - Audit logging
    """

    def __init__(
        self,
        config: Dict[str, Any],
        model_provider: BaseModelProvider,
        azure_ad_config: AzureADConfig,
        policies: List[DeploymentPolicy],
        capability_config: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(config, model_provider)

        # Enterprise components
        self.auth_provider = AzureADAuthProvider(azure_ad_config)
        self.rbac = RBACManager()
        self.capability_manager = CapabilityManager()
        self.policy_enforcer = PolicyEnforcer()
        self.audit_logger = AuditLogger(
            storage_backend=self._create_storage_backend(),
            siem_exporter=self._create_siem_exporter(),
        )
        self.degradation_handler = GracefulDegradationHandler(
            self.capability_manager,
            self.audit_logger,
        )

        # Load configurations
        self.policy_enforcer.load_policies(policies)
        if capability_config:
            self.capability_manager.load_environment_config(capability_config)

    async def process(
        self,
        input_text: str,
        context: AgentContext,
        access_token: Optional[str] = None,
    ) -> AgentResponse:
        """
        Process with enterprise security controls.

        Args:
            input_text: User input
            context: Agent context
            access_token: Azure AD access token

        Returns:
            Agent response
        """
        # Authenticate
        try:
            if access_token:
                user = await self.auth_provider.authenticate_user(access_token)
            else:
                # Fallback to context-based auth (e.g., API key)
                user = self._get_user_from_context(context)
        except Exception as e:
            await self.audit_logger.log(
                event_type=AuditEventType.AUTH_FAILURE,
                user=AuthenticatedUser(
                    user_id="unknown",
                    email=None,
                    name="Unknown",
                    groups=[],
                    roles=[],
                    token_claims={},
                    auth_method="failed",
                ),
                operation="authenticate",
                resource="dvo_agent",
                resource_type="agent",
                status="failure",
                error_message=str(e),
            )
            return AgentResponse(
                content="Authentication failed. Please provide valid credentials.",
                agent_type=self.agent_type,
                confidence=0.0,
                state=ConversationState.ERROR,
            )

        # Log authentication success
        await self.audit_logger.log(
            event_type=AuditEventType.AUTH_SUCCESS,
            user=user,
            operation="authenticate",
            resource="dvo_agent",
            resource_type="agent",
            status="success",
        )

        # Store user in context for downstream use
        context.metadata["authenticated_user"] = user

        # Parse intent to determine required permissions
        intent = self._parse_intent(input_text)
        required_permission = self._get_required_permission(intent, input_text)

        # Check RBAC
        if required_permission:
            perm_result = self.rbac.check_permission(
                user,
                required_permission,
                self._extract_environment(input_text),
            )

            if not perm_result.allowed:
                await self.audit_logger.log(
                    event_type=AuditEventType.PERMISSION_DENIED,
                    user=user,
                    operation=intent,
                    resource=required_permission.value,
                    resource_type="permission",
                    status="denied",
                    error_message=perm_result.reason,
                )

                if perm_result.requires_approval:
                    return await self._handle_approval_required(
                        user, intent, input_text, context
                    )

                return AgentResponse(
                    content=f"Permission denied: {perm_result.reason}",
                    agent_type=self.agent_type,
                    confidence=0.0,
                    state=ConversationState.ERROR,
                )

        # Check capabilities
        required_capability = self._get_required_capability(intent, input_text)
        if required_capability:
            cap_result = self.capability_manager.check_capability(
                required_capability, user, self.rbac
            )

            if not cap_result.available:
                await self.audit_logger.log(
                    event_type=AuditEventType.CAPABILITY_BLOCKED,
                    user=user,
                    operation=intent,
                    resource=required_capability.value,
                    resource_type="capability",
                    status="blocked",
                    error_message=cap_result.message,
                )

                # Handle based on fallback behavior
                return await self._handle_capability_unavailable(
                    cap_result, user, input_text, context
                )

        # Evaluate policies for deploy operations
        if intent == "deploy":
            policy_eval = self.policy_enforcer.evaluate(
                environment=self._extract_environment(input_text),
                platform=self._extract_platform(input_text),
                agents=self._extract_agent_codes(input_text),
                action="deploy",
                user=user,
            )

            await self.audit_logger.log(
                event_type=AuditEventType.POLICY_EVALUATED,
                user=user,
                operation="deploy",
                resource="deployment",
                resource_type="policy",
                status=policy_eval.decision,
                policy_context={
                    "policies_evaluated": policy_eval.applicable_policies,
                    "policy_violations": [v.message for v in policy_eval.violations],
                },
            )

            if policy_eval.decision == "deny":
                return AgentResponse(
                    content=self._format_policy_violations(policy_eval.violations),
                    agent_type=self.agent_type,
                    confidence=0.0,
                    state=ConversationState.ERROR,
                )

            if policy_eval.decision == "pending_approval":
                return await self._handle_approval_workflow(
                    policy_eval, user, input_text, context
                )

        # Execute with base implementation
        response = await super().process(input_text, context)

        # Log operation completion
        await self.audit_logger.log(
            event_type=AuditEventType.DEPLOYMENT_COMPLETED
                if response.state != ConversationState.ERROR
                else AuditEventType.DEPLOYMENT_FAILED,
            user=user,
            operation=intent,
            resource=input_text[:50],
            resource_type="dvo_operation",
            status="success" if response.state != ConversationState.ERROR else "failure",
            environment=self._extract_environment(input_text),
            platform=self._extract_platform(input_text),
            agents=self._extract_agent_codes(input_text),
        )

        return response

    def _get_required_permission(
        self,
        intent: str,
        input_text: str,
    ) -> Optional[DVOPermission]:
        """Map intent to required permission."""
        env = self._extract_environment(input_text)

        permission_map = {
            ("validate", None): DVOPermission.VALIDATE_AGENTS,
            ("status", None): DVOPermission.VIEW_STATUS,
            ("deploy", "staging"): DVOPermission.DEPLOY_STAGING,
            ("deploy", "production"): DVOPermission.DEPLOY_PRODUCTION,
            ("rollback", "staging"): DVOPermission.ROLLBACK_STAGING,
            ("rollback", "production"): DVOPermission.ROLLBACK_PRODUCTION,
        }

        return permission_map.get((intent, env)) or permission_map.get((intent, None))

    def _get_required_capability(
        self,
        intent: str,
        input_text: str,
    ) -> Optional[DVOCapability]:
        """Map intent to required capability."""
        platform = self._extract_platform(input_text)
        env = self._extract_environment(input_text)

        if intent == "deploy":
            if platform == "langchain":
                return DVOCapability.DEPLOY_LANGCHAIN
            elif platform == "fastapi":
                return DVOCapability.DEPLOY_FASTAPI
            elif platform == "copilot_studio":
                return DVOCapability.DEPLOY_COPILOT

        if env == "production":
            return DVOCapability.DEPLOY_TO_PRODUCTION

        return None

    async def _handle_capability_unavailable(
        self,
        cap_result: CapabilityResult,
        user: AuthenticatedUser,
        input_text: str,
        context: AgentContext,
    ) -> AgentResponse:
        """Handle unavailable capability with graceful degradation."""

        if cap_result.fallback_behavior == "error":
            return AgentResponse(
                content=f"⛔ {cap_result.message}",
                agent_type=self.agent_type,
                confidence=0.0,
                state=ConversationState.ERROR,
            )

        elif cap_result.fallback_behavior == "skip":
            return AgentResponse(
                content=f"⚠️ {cap_result.message}\n\nProceeding without this step.",
                agent_type=self.agent_type,
                confidence=0.7,
                state=ConversationState.ACTIVE,
                metadata={"degraded": True, "skipped": cap_result.message},
            )

        elif cap_result.fallback_behavior == "manual":
            return AgentResponse(
                content=f"📋 Manual action required:\n\n{cap_result.message}",
                agent_type=self.agent_type,
                confidence=0.5,
                state=ConversationState.WAITING_INPUT,
                metadata={"requires_manual_action": True},
            )

        elif cap_result.fallback_behavior == "degrade":
            return AgentResponse(
                content=f"⚠️ Operating in degraded mode:\n\n{cap_result.message}",
                agent_type=self.agent_type,
                confidence=0.6,
                state=ConversationState.ACTIVE,
                metadata={"degraded": True},
            )

        return AgentResponse(
            content="Unknown fallback behavior",
            agent_type=self.agent_type,
            confidence=0.0,
            state=ConversationState.ERROR,
        )

    async def _handle_approval_workflow(
        self,
        policy_eval: PolicyEvaluation,
        user: AuthenticatedUser,
        input_text: str,
        context: AgentContext,
    ) -> AgentResponse:
        """Handle approval workflow for policy-required approvals."""

        # Create approval request
        request = await self.policy_enforcer.request_approval(
            environment=self._extract_environment(input_text),
            platform=self._extract_platform(input_text),
            agents=self._extract_agent_codes(input_text),
            requester=user,
            justification=f"Deployment request: {input_text[:100]}",
        )

        approval_info = policy_eval.approvals_needed[0]

        content = f"""**Approval Required**

Your deployment request requires approval before proceeding.

**Request ID:** {request.request_id}
**Policy:** {approval_info.policy_name}
**Required approvers:** {approval_info.min_approvers}
**Approval roles:** {', '.join(approval_info.required_roles)}

The following approvers have been notified:
{', '.join(policy_eval.notifications) or 'No notifications configured'}

Once approved, reply with: "Proceed with deployment {request.request_id}"
"""

        return AgentResponse(
            content=content,
            agent_type=self.agent_type,
            confidence=0.9,
            state=ConversationState.WAITING_INPUT,
            metadata={
                "pending_approval": request.request_id,
                "approval_required": True,
            },
        )

    def _format_policy_violations(
        self,
        violations: List[PolicyViolation],
    ) -> str:
        """Format policy violations for user display."""
        lines = ["**Deployment Blocked by Policy**\n"]
        for v in violations:
            lines.append(f"❌ **{v.policy_name}**: {v.message}")
        lines.append("\nContact your administrator if you believe this is in error.")
        return "\n".join(lines)

    def _create_storage_backend(self) -> "AuditStorageBackend":
        """Create audit storage backend."""
        # Implementation would return appropriate backend
        # (PostgreSQL, Azure Table Storage, etc.)
        return InMemoryAuditStorage()

    def _create_siem_exporter(self) -> Optional[SIEMExporter]:
        """Create SIEM exporter if configured."""
        siem_endpoint = os.getenv("SIEM_ENDPOINT")
        siem_key = os.getenv("SIEM_API_KEY")
        siem_type = os.getenv("SIEM_TYPE", "generic")

        if siem_endpoint and siem_key:
            return SIEMExporter(siem_type, siem_endpoint, siem_key)
        return None
```

---

## 7. CONFIGURATION

### 7.1 Environment Configuration File

```yaml
# config/enterprise-dvo.yaml

azure_ad:
  tenant_id: "${AZURE_TENANT_ID}"
  client_id: "${AZURE_CLIENT_ID}"
  client_secret: "${AZURE_CLIENT_SECRET}"
  require_mfa: true
  group_role_mappings:
    "abc123-group-id": "admin"
    "def456-group-id": "release_manager"
    "ghi789-group-id": "operator"
    "jkl012-group-id": "developer"

capabilities:
  deploy_langchain:
    enabled: true
    fallback_behavior: "error"
  deploy_fastapi:
    enabled: true
    fallback_behavior: "error"
  deploy_copilot:
    enabled: false  # Disabled in this environment
    fallback_behavior: "manual"
    fallback_message: "Copilot Studio deployment requires manual action via Power Platform admin center"
  deploy_to_production:
    enabled: true
    fallback_behavior: "error"
    required_approval: true
  auto_rollback:
    enabled: true
    fallback_behavior: "skip"
  kb_sync:
    enabled: true
    fallback_behavior: "degrade"

policies:
  - policy_id: "prod-deploy-policy"
    name: "Production Deployment Policy"
    description: "Controls production deployments"
    environments: ["production"]
    platforms: ["*"]
    agents: ["*"]
    require_approval: true
    approval_roles: ["release_manager", "admin"]
    min_approvers: 2
    require_validation: true
    require_tests: true
    require_health_check: true
    blocked_actions: []
    allowed_time_windows:
      - start: "06:00"
        end: "18:00"
        timezone: "America/New_York"
        days: ["monday", "tuesday", "wednesday", "thursday"]
    blackout_periods:
      - start: "2026-12-20"
        end: "2026-01-02"
        reason: "Holiday freeze"
    notify_on_deploy:
      - "release-team@mastercard.com"
    notify_on_failure:
      - "release-team@mastercard.com"
      - "oncall@mastercard.com"

  - policy_id: "staging-deploy-policy"
    name: "Staging Deployment Policy"
    environments: ["staging"]
    platforms: ["*"]
    agents: ["*"]
    require_approval: false
    require_validation: true
    require_tests: true

audit:
  retention_days: 365
  siem_export:
    enabled: true
    type: "azure_sentinel"
    endpoint: "${SIEM_ENDPOINT}"
    api_key: "${SIEM_API_KEY}"
```

---

## 8. IMPLEMENTATION PHASES

### Phase 1: Core Security (Week 1)
- [ ] Azure AD authentication provider
- [ ] RBAC manager with role definitions
- [ ] Basic audit logging

### Phase 2: Capability Management (Week 2)
- [ ] Capability manager with feature flags
- [ ] Graceful degradation handler
- [ ] Environment-specific configuration

### Phase 3: Policy Enforcement (Week 3)
- [ ] Policy enforcer with rules engine
- [ ] Approval workflow
- [ ] Time window/blackout support

### Phase 4: Audit & Compliance (Week 4)
- [ ] Full audit logging with chain integrity
- [ ] SIEM export (Splunk, Azure Sentinel)
- [ ] Audit query and reporting

### Phase 5: Integration (Week 5)
- [ ] Enterprise DVO agent integration
- [ ] API middleware for auth/authz
- [ ] End-to-end testing

---

## 9. FILES TO CREATE

```
src/enterprise/
├── __init__.py
├── auth/
│   ├── __init__.py
│   ├── azure_ad.py          # Azure AD provider
│   ├── models.py            # AuthenticatedUser, etc.
│   └── middleware.py        # FastAPI auth middleware
├── rbac/
│   ├── __init__.py
│   ├── roles.py             # Role/Permission definitions
│   └── manager.py           # RBACManager
├── capabilities/
│   ├── __init__.py
│   ├── manager.py           # CapabilityManager
│   └── degradation.py       # GracefulDegradationHandler
├── policy/
│   ├── __init__.py
│   ├── models.py            # Policy dataclasses
│   ├── enforcer.py          # PolicyEnforcer
│   └── approval.py          # Approval workflow
├── audit/
│   ├── __init__.py
│   ├── models.py            # AuditLogEntry
│   ├── logger.py            # AuditLogger
│   ├── storage.py           # Storage backends
│   └── siem.py              # SIEM exporters
└── agent.py                 # EnterpriseDVOAgent
```
