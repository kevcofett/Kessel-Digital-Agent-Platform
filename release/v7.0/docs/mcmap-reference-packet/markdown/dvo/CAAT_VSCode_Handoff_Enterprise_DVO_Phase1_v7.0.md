# Enterprise DVO Phase 1 - VS Code Implementation
## Azure AD Authentication + RBAC
## Date: 2026-01-31

---

## CONTEXT

Implementing enterprise security layer for DVO agent. This phase adds Azure AD/Entra ID authentication and Role-Based Access Control for Mastercard deployment.

**Working Directory:** `/Users/kevinbauer/Kessel-Digital/CAAT`
**Spec:** `/specs/CAAT_Enterprise_DVO_Spec.md`

---

## TASK 1: Create Enterprise Module Structure

```bash
mkdir -p src/enterprise/auth
mkdir -p src/enterprise/rbac
touch src/enterprise/__init__.py
touch src/enterprise/auth/__init__.py
touch src/enterprise/rbac/__init__.py
```

---

## TASK 2: Authentication Models

### File: `src/enterprise/auth/models.py`

```python
"""Enterprise authentication models."""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from datetime import datetime


@dataclass
class AuthenticatedUser:
    """Authenticated user context from Azure AD."""

    user_id: str
    """Azure AD Object ID (oid claim)"""

    email: Optional[str]
    """User email (preferred_username or email claim)"""

    name: str
    """Display name"""

    groups: List[str]
    """Azure AD group IDs user belongs to"""

    roles: List[str]
    """CAAT roles mapped from groups"""

    token_claims: Dict[str, Any]
    """Raw token claims for debugging"""

    auth_method: str
    """Authentication method: azure_ad, service_principal, managed_identity, api_key"""

    authenticated_at: datetime = field(default_factory=datetime.utcnow)
    """When authentication occurred"""

    def has_role(self, role: str) -> bool:
        """Check if user has specific role."""
        return role in self.roles

    def has_any_role(self, roles: List[str]) -> bool:
        """Check if user has any of the specified roles."""
        return any(r in self.roles for r in roles)

    def has_all_roles(self, roles: List[str]) -> bool:
        """Check if user has all specified roles."""
        return all(r in self.roles for r in roles)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            "user_id": self.user_id,
            "email": self.email,
            "name": self.name,
            "roles": self.roles,
            "auth_method": self.auth_method,
            "authenticated_at": self.authenticated_at.isoformat(),
        }

    def to_audit_dict(self) -> Dict[str, Any]:
        """Return sanitized dict for audit logging (no sensitive data)."""
        return {
            "user_id": self.user_id,
            "email": self.email,
            "name": self.name,
            "roles": self.roles,
            "auth_method": self.auth_method,
        }


@dataclass
class AzureADConfig:
    """Azure AD / Entra ID configuration."""

    tenant_id: str
    """Azure AD tenant ID"""

    client_id: str
    """Application (client) ID from app registration"""

    client_secret: Optional[str] = None
    """Client secret for confidential client flows"""

    authority: str = "https://login.microsoftonline.com"
    """Azure AD authority URL"""

    scopes: List[str] = field(default_factory=lambda: [
        "https://graph.microsoft.com/.default"
    ])
    """OAuth scopes to request"""

    # MFA settings
    require_mfa: bool = True
    """Require MFA for all users"""

    mfa_exempt_principals: List[str] = field(default_factory=list)
    """Service principal IDs exempt from MFA requirement"""

    # Group to role mappings
    group_role_mappings: Dict[str, str] = field(default_factory=dict)
    """Map Azure AD group IDs to CAAT roles"""

    # Session settings
    token_cache_enabled: bool = True
    session_timeout_minutes: int = 60

    @classmethod
    def from_env(cls) -> "AzureADConfig":
        """Create config from environment variables."""
        import os
        import json

        group_mappings = {}
        mappings_json = os.getenv("AZURE_AD_GROUP_MAPPINGS", "{}")
        try:
            group_mappings = json.loads(mappings_json)
        except json.JSONDecodeError:
            pass

        return cls(
            tenant_id=os.getenv("AZURE_TENANT_ID", ""),
            client_id=os.getenv("AZURE_CLIENT_ID", ""),
            client_secret=os.getenv("AZURE_CLIENT_SECRET"),
            require_mfa=os.getenv("AZURE_REQUIRE_MFA", "true").lower() == "true",
            group_role_mappings=group_mappings,
        )


class AuthenticationError(Exception):
    """Authentication failed."""

    def __init__(self, message: str, error_code: str = "auth_failed"):
        self.message = message
        self.error_code = error_code
        super().__init__(message)


class AuthorizationError(Exception):
    """Authorization failed."""

    def __init__(self, message: str, required_permission: str = None):
        self.message = message
        self.required_permission = required_permission
        super().__init__(message)
```

---

## TASK 3: Azure AD Authentication Provider

### File: `src/enterprise/auth/azure_ad.py`

```python
"""Azure AD / Entra ID authentication provider."""

import time
import logging
from typing import Dict, Any, Optional, List

import jwt
import httpx

from .models import AuthenticatedUser, AzureADConfig, AuthenticationError


logger = logging.getLogger(__name__)


class AzureADAuthProvider:
    """
    Azure AD authentication provider.

    Supports:
    - Bearer token validation (user auth)
    - Service principal authentication
    - Managed identity (for Azure-hosted services)
    - Fallback to API key (legacy/emergency)
    """

    def __init__(self, config: AzureADConfig):
        self.config = config
        self._jwks_cache: Optional[Dict] = None
        self._jwks_cache_time: float = 0
        self._jwks_cache_ttl: int = 3600  # 1 hour

    async def authenticate_token(
        self,
        access_token: str,
    ) -> AuthenticatedUser:
        """
        Authenticate user from Azure AD bearer token.

        Args:
            access_token: Bearer token from Authorization header

        Returns:
            AuthenticatedUser with roles and permissions

        Raises:
            AuthenticationError: If token is invalid
        """
        try:
            # Decode and validate token
            claims = await self._validate_token(access_token)

            # Extract user info from claims
            user_id = claims.get("oid")  # Object ID
            if not user_id:
                raise AuthenticationError("Token missing oid claim", "invalid_token")

            email = claims.get("preferred_username") or claims.get("email")
            name = claims.get("name", "Unknown User")
            groups = claims.get("groups", [])

            # Check if this is a service principal (no user context)
            is_service_principal = claims.get("idtyp") == "app"

            # Verify MFA if required (for users, not service principals)
            if self.config.require_mfa and not is_service_principal:
                if user_id not in self.config.mfa_exempt_principals:
                    amr = claims.get("amr", [])
                    if "mfa" not in amr:
                        raise AuthenticationError(
                            "MFA required but not satisfied",
                            "mfa_required"
                        )

            # Map groups to roles
            roles = self._map_groups_to_roles(groups)

            # Service principals get service_account role
            if is_service_principal:
                roles.append("service_account")
                auth_method = "service_principal"
            else:
                auth_method = "azure_ad"

            return AuthenticatedUser(
                user_id=user_id,
                email=email,
                name=name,
                groups=groups,
                roles=roles if roles else ["viewer"],  # Default role
                token_claims=claims,
                auth_method=auth_method,
            )

        except jwt.ExpiredSignatureError:
            raise AuthenticationError("Token expired", "token_expired")
        except jwt.InvalidTokenError as e:
            raise AuthenticationError(f"Invalid token: {e}", "invalid_token")
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            raise AuthenticationError(str(e), "auth_failed")

    async def _validate_token(self, token: str) -> Dict[str, Any]:
        """
        Validate Azure AD token.

        In production, this validates the signature against Azure AD public keys.
        """
        # First, decode without verification to get header
        try:
            unverified_header = jwt.get_unverified_header(token)
            unverified_claims = jwt.decode(
                token,
                options={"verify_signature": False}
            )
        except jwt.DecodeError as e:
            raise AuthenticationError(f"Cannot decode token: {e}", "invalid_token")

        # Verify issuer
        issuer = unverified_claims.get("iss", "")
        expected_issuers = [
            f"https://sts.windows.net/{self.config.tenant_id}/",
            f"https://login.microsoftonline.com/{self.config.tenant_id}/v2.0",
        ]
        if issuer not in expected_issuers:
            raise AuthenticationError(
                f"Invalid issuer: {issuer}",
                "invalid_issuer"
            )

        # Verify audience
        audience = unverified_claims.get("aud")
        if audience != self.config.client_id:
            # Also allow Graph API audience for certain tokens
            if audience != "https://graph.microsoft.com":
                raise AuthenticationError(
                    f"Invalid audience: {audience}",
                    "invalid_audience"
                )

        # Verify expiration
        exp = unverified_claims.get("exp", 0)
        if exp < time.time():
            raise AuthenticationError("Token expired", "token_expired")

        # Verify not before
        nbf = unverified_claims.get("nbf", 0)
        if nbf > time.time() + 300:  # 5 min clock skew allowance
            raise AuthenticationError("Token not yet valid", "token_not_valid")

        # In production: verify signature against JWKS
        # For now, return the claims after basic validation
        # TODO: Implement full signature verification with JWKS

        return unverified_claims

    async def _get_jwks(self) -> Dict:
        """Fetch Azure AD public keys for signature verification."""
        # Check cache
        if self._jwks_cache and (time.time() - self._jwks_cache_time) < self._jwks_cache_ttl:
            return self._jwks_cache

        # Fetch JWKS
        jwks_url = f"{self.config.authority}/{self.config.tenant_id}/discovery/v2.0/keys"

        async with httpx.AsyncClient() as client:
            response = await client.get(jwks_url)
            response.raise_for_status()
            self._jwks_cache = response.json()
            self._jwks_cache_time = time.time()

        return self._jwks_cache

    def _map_groups_to_roles(self, groups: List[str]) -> List[str]:
        """Map Azure AD group IDs to CAAT roles."""
        roles = []
        for group_id in groups:
            if group_id in self.config.group_role_mappings:
                role = self.config.group_role_mappings[group_id]
                if role not in roles:
                    roles.append(role)
        return roles

    async def authenticate_api_key(
        self,
        api_key: str,
        api_key_store: "APIKeyStore",
    ) -> AuthenticatedUser:
        """
        Fallback authentication via API key.

        Args:
            api_key: API key from X-API-Key header
            api_key_store: Store to validate API keys

        Returns:
            AuthenticatedUser for the API key owner
        """
        key_info = await api_key_store.validate(api_key)
        if not key_info:
            raise AuthenticationError("Invalid API key", "invalid_api_key")

        return AuthenticatedUser(
            user_id=key_info["client_id"],
            email=key_info.get("email"),
            name=key_info.get("name", "API Key User"),
            groups=[],
            roles=key_info.get("roles", ["viewer"]),
            token_claims={},
            auth_method="api_key",
        )


class APIKeyStore:
    """Simple API key validation store."""

    def __init__(self):
        self._keys: Dict[str, Dict] = {}

    def register_key(
        self,
        api_key: str,
        client_id: str,
        name: str,
        roles: List[str],
        email: Optional[str] = None,
    ):
        """Register an API key."""
        import hashlib
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        self._keys[key_hash] = {
            "client_id": client_id,
            "name": name,
            "roles": roles,
            "email": email,
        }

    async def validate(self, api_key: str) -> Optional[Dict]:
        """Validate an API key and return info if valid."""
        import hashlib
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        return self._keys.get(key_hash)
```

---

## TASK 4: RBAC Models

### File: `src/enterprise/rbac/models.py`

```python
"""RBAC models and definitions."""

from enum import Enum
from dataclasses import dataclass, field
from typing import List, Optional


class DVORole(Enum):
    """DVO role hierarchy (least to most privileged)."""

    VIEWER = "viewer"
    """Can view status and deployments, cannot make changes"""

    DEVELOPER = "developer"
    """Can deploy to development environments"""

    OPERATOR = "operator"
    """Can deploy to development and staging"""

    RELEASE_MANAGER = "release_manager"
    """Can deploy to all environments including production (with approval)"""

    ADMIN = "admin"
    """Full access including policy and user management"""

    SERVICE_ACCOUNT = "service_account"
    """Automated deployments from CI/CD (limited to non-production by default)"""


class DVOPermission(Enum):
    """Granular permissions for DVO operations."""

    # View permissions
    VIEW_STATUS = "view_status"
    VIEW_DEPLOYMENTS = "view_deployments"
    VIEW_AUDIT_LOG = "view_audit_log"
    VIEW_POLICIES = "view_policies"

    # Validation permissions
    VALIDATE_AGENTS = "validate_agents"

    # Deployment permissions (by environment)
    DEPLOY_DEVELOPMENT = "deploy_development"
    DEPLOY_STAGING = "deploy_staging"
    DEPLOY_PRODUCTION = "deploy_production"

    # Rollback permissions (by environment)
    ROLLBACK_DEVELOPMENT = "rollback_development"
    ROLLBACK_STAGING = "rollback_staging"
    ROLLBACK_PRODUCTION = "rollback_production"

    # Sync permissions
    SYNC_KB_FILES = "sync_kb_files"

    # Administrative permissions
    MANAGE_POLICIES = "manage_policies"
    MANAGE_CAPABILITIES = "manage_capabilities"
    MANAGE_USERS = "manage_users"
    BYPASS_APPROVAL = "bypass_approval"


# Role to Permission mappings
ROLE_PERMISSIONS = {
    DVORole.VIEWER: [
        DVOPermission.VIEW_STATUS,
        DVOPermission.VIEW_DEPLOYMENTS,
    ],

    DVORole.DEVELOPER: [
        DVOPermission.VIEW_STATUS,
        DVOPermission.VIEW_DEPLOYMENTS,
        DVOPermission.VALIDATE_AGENTS,
        DVOPermission.DEPLOY_DEVELOPMENT,
        DVOPermission.ROLLBACK_DEVELOPMENT,
    ],

    DVORole.OPERATOR: [
        DVOPermission.VIEW_STATUS,
        DVOPermission.VIEW_DEPLOYMENTS,
        DVOPermission.VIEW_AUDIT_LOG,
        DVOPermission.VALIDATE_AGENTS,
        DVOPermission.DEPLOY_DEVELOPMENT,
        DVOPermission.DEPLOY_STAGING,
        DVOPermission.ROLLBACK_DEVELOPMENT,
        DVOPermission.ROLLBACK_STAGING,
        DVOPermission.SYNC_KB_FILES,
    ],

    DVORole.RELEASE_MANAGER: [
        DVOPermission.VIEW_STATUS,
        DVOPermission.VIEW_DEPLOYMENTS,
        DVOPermission.VIEW_AUDIT_LOG,
        DVOPermission.VIEW_POLICIES,
        DVOPermission.VALIDATE_AGENTS,
        DVOPermission.DEPLOY_DEVELOPMENT,
        DVOPermission.DEPLOY_STAGING,
        DVOPermission.DEPLOY_PRODUCTION,
        DVOPermission.ROLLBACK_DEVELOPMENT,
        DVOPermission.ROLLBACK_STAGING,
        DVOPermission.ROLLBACK_PRODUCTION,
        DVOPermission.SYNC_KB_FILES,
    ],

    DVORole.ADMIN: [
        p for p in DVOPermission  # All permissions
    ],

    DVORole.SERVICE_ACCOUNT: [
        DVOPermission.VIEW_STATUS,
        DVOPermission.VALIDATE_AGENTS,
        DVOPermission.DEPLOY_DEVELOPMENT,
        DVOPermission.DEPLOY_STAGING,
        DVOPermission.SYNC_KB_FILES,
        # Note: No DEPLOY_PRODUCTION - requires human approval
    ],
}


@dataclass
class PermissionResult:
    """Result of a permission check."""

    allowed: bool
    """Whether permission is granted"""

    reason: str
    """Explanation for the decision"""

    granted_by_role: Optional[str] = None
    """Which role granted the permission (if allowed)"""

    requires_approval: bool = False
    """Whether permission can be obtained through approval"""

    approval_roles: List[str] = field(default_factory=list)
    """Roles that can approve if requires_approval is True"""
```

---

## TASK 5: RBAC Manager

### File: `src/enterprise/rbac/manager.py`

```python
"""RBAC Manager implementation."""

from typing import Dict, List, Optional, Any

from src.enterprise.auth.models import AuthenticatedUser
from .models import (
    DVORole,
    DVOPermission,
    ROLE_PERMISSIONS,
    PermissionResult,
)


class RBACManager:
    """
    Role-Based Access Control manager.

    Evaluates permissions based on user roles with support for:
    - Role hierarchy
    - Environment-specific overrides
    - Approval workflows for elevated permissions
    """

    def __init__(
        self,
        role_permissions: Dict[DVORole, List[DVOPermission]] = None,
        environment_overrides: Dict[str, Dict[str, bool]] = None,
    ):
        """
        Initialize RBAC manager.

        Args:
            role_permissions: Custom role->permission mappings (uses defaults if None)
            environment_overrides: Environment-specific permission overrides
                Example: {"production": {"deploy_production": False}}
        """
        self.role_permissions = role_permissions or ROLE_PERMISSIONS
        self.environment_overrides = environment_overrides or {}

    def check_permission(
        self,
        user: AuthenticatedUser,
        permission: DVOPermission,
        environment: Optional[str] = None,
    ) -> PermissionResult:
        """
        Check if user has a specific permission.

        Args:
            user: Authenticated user
            permission: Permission to check
            environment: Optional environment context for overrides

        Returns:
            PermissionResult with decision and reason
        """
        # Check environment-specific overrides first
        if environment and environment in self.environment_overrides:
            env_overrides = self.environment_overrides[environment]
            if permission.value in env_overrides:
                if not env_overrides[permission.value]:
                    return PermissionResult(
                        allowed=False,
                        reason=f"Permission '{permission.value}' is disabled for {environment} environment",
                        requires_approval=False,
                    )

        # Check each role the user has
        for role_name in user.roles:
            try:
                role = DVORole(role_name)
                role_perms = self.role_permissions.get(role, [])

                if permission in role_perms:
                    return PermissionResult(
                        allowed=True,
                        reason=f"Granted by role: {role.value}",
                        granted_by_role=role.value,
                    )
            except ValueError:
                # Unknown role, skip
                continue

        # Check if this permission can be obtained via approval
        if self._can_request_approval(permission):
            return PermissionResult(
                allowed=False,
                reason=f"Permission '{permission.value}' requires approval",
                requires_approval=True,
                approval_roles=self._get_approval_roles(permission),
            )

        return PermissionResult(
            allowed=False,
            reason=f"No role grants permission: {permission.value}",
            requires_approval=False,
        )

    def check_permissions(
        self,
        user: AuthenticatedUser,
        permissions: List[DVOPermission],
        environment: Optional[str] = None,
        require_all: bool = True,
    ) -> PermissionResult:
        """
        Check multiple permissions.

        Args:
            user: Authenticated user
            permissions: List of permissions to check
            environment: Optional environment context
            require_all: If True, all permissions must be granted

        Returns:
            PermissionResult for the combined check
        """
        results = [
            self.check_permission(user, p, environment)
            for p in permissions
        ]

        if require_all:
            denied = [r for r in results if not r.allowed]
            if denied:
                return PermissionResult(
                    allowed=False,
                    reason=f"Missing permissions: {', '.join(d.reason for d in denied)}",
                    requires_approval=any(d.requires_approval for d in denied),
                )
            return PermissionResult(
                allowed=True,
                reason="All permissions granted",
            )
        else:
            granted = [r for r in results if r.allowed]
            if granted:
                return PermissionResult(
                    allowed=True,
                    reason=granted[0].reason,
                    granted_by_role=granted[0].granted_by_role,
                )
            return PermissionResult(
                allowed=False,
                reason="No required permissions granted",
                requires_approval=any(r.requires_approval for r in results),
            )

    def get_user_permissions(
        self,
        user: AuthenticatedUser,
        environment: Optional[str] = None,
    ) -> List[DVOPermission]:
        """
        Get all permissions for a user.

        Args:
            user: Authenticated user
            environment: Optional environment for filtering

        Returns:
            List of granted permissions
        """
        permissions = set()

        for role_name in user.roles:
            try:
                role = DVORole(role_name)
                role_perms = self.role_permissions.get(role, [])
                permissions.update(role_perms)
            except ValueError:
                continue

        # Apply environment overrides
        if environment and environment in self.environment_overrides:
            env_overrides = self.environment_overrides[environment]
            permissions = {
                p for p in permissions
                if env_overrides.get(p.value, True)
            }

        return list(permissions)

    def get_user_roles(self, user: AuthenticatedUser) -> List[DVORole]:
        """Get DVORole enums for user's roles."""
        roles = []
        for role_name in user.roles:
            try:
                roles.append(DVORole(role_name))
            except ValueError:
                continue
        return roles

    def _can_request_approval(self, permission: DVOPermission) -> bool:
        """Check if permission can be obtained through approval."""
        approval_eligible = [
            DVOPermission.DEPLOY_PRODUCTION,
            DVOPermission.ROLLBACK_PRODUCTION,
            DVOPermission.MANAGE_POLICIES,
        ]
        return permission in approval_eligible

    def _get_approval_roles(self, permission: DVOPermission) -> List[str]:
        """Get roles that can approve a permission request."""
        # Map permissions to roles that can approve
        approval_map = {
            DVOPermission.DEPLOY_PRODUCTION: ["release_manager", "admin"],
            DVOPermission.ROLLBACK_PRODUCTION: ["release_manager", "admin"],
            DVOPermission.MANAGE_POLICIES: ["admin"],
        }
        return approval_map.get(permission, ["admin"])

    def get_permission_for_action(
        self,
        action: str,
        environment: str,
    ) -> Optional[DVOPermission]:
        """
        Map an action and environment to required permission.

        Args:
            action: Action being performed (deploy, rollback, validate, etc.)
            environment: Target environment

        Returns:
            Required permission or None
        """
        permission_map = {
            ("deploy", "development"): DVOPermission.DEPLOY_DEVELOPMENT,
            ("deploy", "staging"): DVOPermission.DEPLOY_STAGING,
            ("deploy", "production"): DVOPermission.DEPLOY_PRODUCTION,
            ("rollback", "development"): DVOPermission.ROLLBACK_DEVELOPMENT,
            ("rollback", "staging"): DVOPermission.ROLLBACK_STAGING,
            ("rollback", "production"): DVOPermission.ROLLBACK_PRODUCTION,
            ("validate", None): DVOPermission.VALIDATE_AGENTS,
            ("status", None): DVOPermission.VIEW_STATUS,
            ("sync", None): DVOPermission.SYNC_KB_FILES,
        }

        # Try with environment
        key = (action.lower(), environment.lower() if environment else None)
        if key in permission_map:
            return permission_map[key]

        # Try without environment
        key = (action.lower(), None)
        return permission_map.get(key)
```

---

## TASK 6: FastAPI Auth Middleware

### File: `src/enterprise/auth/middleware.py`

```python
"""FastAPI authentication middleware."""

from typing import Optional, Callable
from functools import wraps

from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader

from .models import AuthenticatedUser, AzureADConfig, AuthenticationError
from .azure_ad import AzureADAuthProvider, APIKeyStore
from src.enterprise.rbac.manager import RBACManager
from src.enterprise.rbac.models import DVOPermission


# Security schemes
bearer_scheme = HTTPBearer(auto_error=False)
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


# Global instances (initialized on startup)
_auth_provider: Optional[AzureADAuthProvider] = None
_api_key_store: Optional[APIKeyStore] = None
_rbac_manager: Optional[RBACManager] = None


def init_auth(
    azure_config: AzureADConfig,
    rbac_manager: RBACManager,
    api_key_store: Optional[APIKeyStore] = None,
):
    """Initialize authentication components."""
    global _auth_provider, _api_key_store, _rbac_manager
    _auth_provider = AzureADAuthProvider(azure_config)
    _api_key_store = api_key_store or APIKeyStore()
    _rbac_manager = rbac_manager


async def get_current_user(
    request: Request,
    bearer: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    api_key: Optional[str] = Depends(api_key_header),
) -> AuthenticatedUser:
    """
    Get authenticated user from request.

    Tries in order:
    1. Azure AD Bearer token
    2. API Key
    3. Raises 401

    Returns:
        AuthenticatedUser

    Raises:
        HTTPException: 401 if not authenticated
    """
    if _auth_provider is None:
        raise HTTPException(
            status_code=500,
            detail="Authentication not configured"
        )

    # Try Bearer token first
    if bearer and bearer.credentials:
        try:
            user = await _auth_provider.authenticate_token(bearer.credentials)
            request.state.user = user
            return user
        except AuthenticationError as e:
            if e.error_code == "mfa_required":
                raise HTTPException(
                    status_code=403,
                    detail="MFA required",
                    headers={"X-MFA-Required": "true"},
                )
            # Fall through to try API key
            pass

    # Try API key
    if api_key and _api_key_store:
        try:
            user = await _auth_provider.authenticate_api_key(api_key, _api_key_store)
            request.state.user = user
            return user
        except AuthenticationError:
            pass

    # No valid authentication
    raise HTTPException(
        status_code=401,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_optional_user(
    request: Request,
    bearer: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    api_key: Optional[str] = Depends(api_key_header),
) -> Optional[AuthenticatedUser]:
    """Get user if authenticated, None otherwise."""
    try:
        return await get_current_user(request, bearer, api_key)
    except HTTPException:
        return None


def require_permission(permission: DVOPermission, environment: str = None):
    """
    Decorator/dependency to require a specific permission.

    Usage:
        @router.post("/deploy")
        async def deploy(
            user: AuthenticatedUser = Depends(require_permission(DVOPermission.DEPLOY_STAGING))
        ):
            ...
    """
    async def permission_checker(
        user: AuthenticatedUser = Depends(get_current_user),
    ) -> AuthenticatedUser:
        if _rbac_manager is None:
            raise HTTPException(status_code=500, detail="RBAC not configured")

        result = _rbac_manager.check_permission(user, permission, environment)

        if not result.allowed:
            if result.requires_approval:
                raise HTTPException(
                    status_code=403,
                    detail={
                        "error": "approval_required",
                        "message": result.reason,
                        "approval_roles": result.approval_roles,
                    }
                )
            raise HTTPException(
                status_code=403,
                detail=result.reason,
            )

        return user

    return permission_checker


def require_any_role(*roles: str):
    """
    Dependency to require any of the specified roles.

    Usage:
        @router.get("/admin")
        async def admin_endpoint(
            user: AuthenticatedUser = Depends(require_any_role("admin", "release_manager"))
        ):
            ...
    """
    async def role_checker(
        user: AuthenticatedUser = Depends(get_current_user),
    ) -> AuthenticatedUser:
        if not user.has_any_role(list(roles)):
            raise HTTPException(
                status_code=403,
                detail=f"Requires one of roles: {', '.join(roles)}",
            )
        return user

    return role_checker


def require_all_roles(*roles: str):
    """Dependency to require all specified roles."""
    async def role_checker(
        user: AuthenticatedUser = Depends(get_current_user),
    ) -> AuthenticatedUser:
        if not user.has_all_roles(list(roles)):
            raise HTTPException(
                status_code=403,
                detail=f"Requires all roles: {', '.join(roles)}",
            )
        return user

    return role_checker
```

---

## TASK 7: Update Exports

### File: `src/enterprise/__init__.py`

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
]
```

### File: `src/enterprise/auth/__init__.py`

```python
"""Authentication module."""

from .models import AuthenticatedUser, AzureADConfig, AuthenticationError, AuthorizationError
from .azure_ad import AzureADAuthProvider, APIKeyStore
from .middleware import (
    init_auth,
    get_current_user,
    get_optional_user,
    require_permission,
    require_any_role,
    require_all_roles,
)

__all__ = [
    "AuthenticatedUser",
    "AzureADConfig",
    "AuthenticationError",
    "AuthorizationError",
    "AzureADAuthProvider",
    "APIKeyStore",
    "init_auth",
    "get_current_user",
    "get_optional_user",
    "require_permission",
    "require_any_role",
    "require_all_roles",
]
```

### File: `src/enterprise/rbac/__init__.py`

```python
"""RBAC module."""

from .models import DVORole, DVOPermission, PermissionResult, ROLE_PERMISSIONS
from .manager import RBACManager

__all__ = [
    "DVORole",
    "DVOPermission",
    "PermissionResult",
    "ROLE_PERMISSIONS",
    "RBACManager",
]
```

---

## TASK 8: Update DevOps Routes with Auth

### File: `src/api/routes/devops.py` (UPDATE)

Add authentication to existing routes:

```python
"""DevOps agent routes with enterprise authentication."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import get_db
from src.enterprise import (
    get_current_user,
    require_permission,
    AuthenticatedUser,
    DVOPermission,
)
from src.agents.dvo import DVOAgent, ValidateAgentTool, EnvironmentStatusTool

router = APIRouter(prefix="/devops")


@router.get("/status")
async def environment_status(
    environment: str = None,
    platform: str = None,
    user: AuthenticatedUser = Depends(require_permission(DVOPermission.VIEW_STATUS)),
):
    """Get environment status. Requires VIEW_STATUS permission."""
    tool = EnvironmentStatusTool()
    return await tool.execute(environment, platform)


@router.post("/validate/{agent_code}")
async def validate_agent(
    agent_code: str,
    user: AuthenticatedUser = Depends(require_permission(DVOPermission.VALIDATE_AGENTS)),
):
    """Validate agent files. Requires VALIDATE_AGENTS permission."""
    tool = ValidateAgentTool()
    result = await tool.execute(agent_code)
    return result.to_dict()


@router.post("/deploy/staging")
async def deploy_to_staging(
    agent_codes: list[str],
    target_platform: str = "langchain",
    user: AuthenticatedUser = Depends(require_permission(DVOPermission.DEPLOY_STAGING)),
):
    """Deploy to staging. Requires DEPLOY_STAGING permission."""
    from src.agents.dvo.tools.deploy import DeployAgentTool

    tool = DeployAgentTool()
    result = await tool.execute(
        agent_codes=agent_codes,
        target_platform=target_platform,
        environment="staging",
    )
    return result.to_dict()


@router.post("/deploy/production")
async def deploy_to_production(
    agent_codes: list[str],
    target_platform: str = "langchain",
    user: AuthenticatedUser = Depends(require_permission(DVOPermission.DEPLOY_PRODUCTION, "production")),
):
    """Deploy to production. Requires DEPLOY_PRODUCTION permission and approval."""
    from src.agents.dvo.tools.deploy import DeployAgentTool

    tool = DeployAgentTool()
    result = await tool.execute(
        agent_codes=agent_codes,
        target_platform=target_platform,
        environment="production",
    )
    return result.to_dict()


@router.get("/permissions")
async def get_my_permissions(
    user: AuthenticatedUser = Depends(get_current_user),
):
    """Get current user's permissions."""
    from src.enterprise import RBACManager

    rbac = RBACManager()
    permissions = rbac.get_user_permissions(user)

    return {
        "user": user.to_dict(),
        "permissions": [p.value for p in permissions],
        "roles": user.roles,
    }
```

---

## TASK 9: Initialize Auth on Startup

### Update `src/api/app.py`

Add to the `lifespan` function:

```python
from src.enterprise import init_auth, AzureADConfig, RBACManager, APIKeyStore

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler."""
    # Startup
    await init_db()

    # Initialize enterprise auth
    azure_config = AzureADConfig.from_env()
    rbac_manager = RBACManager()
    api_key_store = APIKeyStore()

    # Register any default API keys (for development/testing)
    import os
    if os.getenv("DEV_API_KEY"):
        api_key_store.register_key(
            api_key=os.getenv("DEV_API_KEY"),
            client_id="dev-client",
            name="Development API Key",
            roles=["developer"],
        )

    init_auth(azure_config, rbac_manager, api_key_store)

    yield

    # Shutdown
    await close_db()
```

---

## TASK 10: Environment Variables

### Update `.env.example`

```env
# Azure AD Configuration
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_REQUIRE_MFA=true

# Group to Role Mappings (JSON)
# Format: {"group-id": "role-name", ...}
AZURE_AD_GROUP_MAPPINGS={"abc123": "admin", "def456": "release_manager", "ghi789": "operator"}

# Development API Key (for local testing without Azure AD)
DEV_API_KEY=dev-key-for-testing-only
```

---

## VALIDATION

```bash
cd /Users/kevinbauer/Kessel-Digital/CAAT

# Test imports
python -c "
from src.enterprise import (
    AzureADConfig,
    AzureADAuthProvider,
    RBACManager,
    DVORole,
    DVOPermission,
    AuthenticatedUser,
)
print('✓ Enterprise imports OK')
"

# Test RBAC
python -c "
from src.enterprise import RBACManager, DVOPermission, AuthenticatedUser

rbac = RBACManager()
user = AuthenticatedUser(
    user_id='test',
    email='test@example.com',
    name='Test User',
    groups=[],
    roles=['operator'],
    token_claims={},
    auth_method='test',
)

result = rbac.check_permission(user, DVOPermission.DEPLOY_STAGING)
print(f'✓ RBAC check: {result.allowed} - {result.reason}')

result = rbac.check_permission(user, DVOPermission.DEPLOY_PRODUCTION)
print(f'✓ Production check: {result.allowed} - {result.reason}')
"

# Run tests
pytest tests/enterprise/ -v
```

---

## FILES CREATED

```
src/enterprise/
├── __init__.py
├── auth/
│   ├── __init__.py
│   ├── models.py           # AuthenticatedUser, AzureADConfig
│   ├── azure_ad.py         # AzureADAuthProvider
│   └── middleware.py       # FastAPI dependencies
└── rbac/
    ├── __init__.py
    ├── models.py           # DVORole, DVOPermission, ROLE_PERMISSIONS
    └── manager.py          # RBACManager
```
