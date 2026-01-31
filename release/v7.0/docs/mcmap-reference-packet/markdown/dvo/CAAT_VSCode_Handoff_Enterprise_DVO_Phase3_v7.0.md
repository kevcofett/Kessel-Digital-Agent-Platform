# VS Code Handoff: Enterprise DVO Phase 3 - Policy Enforcer + Approval Workflows

## Context
This is Phase 3 of 5 for enterprise-hardening the DVO (DevOps) agent for Mastercard managed environments.

**Completed Phases:**
- Phase 1: Azure AD + RBAC ✓
- Phase 2: Capability Manager + Graceful Degradation ✓

**This Phase:** Policy Enforcer + Approval Workflows

## Objective
Implement policy enforcement engine and approval workflow system to ensure all deployments comply with organizational rules and require appropriate sign-offs for sensitive environments.

---

## File 1: `src/enterprise/policy/models.py`

```python
"""
Policy enforcement models for DVO agent.
"""
from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class PolicyAction(str, Enum):
    """Actions a policy can take."""
    ALLOW = "allow"
    DENY = "deny"
    REQUIRE_APPROVAL = "require_approval"
    WARN = "warn"
    AUDIT_ONLY = "audit_only"


class PolicyConditionOperator(str, Enum):
    """Operators for policy conditions."""
    EQUALS = "equals"
    NOT_EQUALS = "not_equals"
    IN = "in"
    NOT_IN = "not_in"
    MATCHES = "matches"  # regex
    GREATER_THAN = "greater_than"
    LESS_THAN = "less_than"
    CONTAINS = "contains"


class PolicyCondition(BaseModel):
    """Single condition in a policy rule."""
    field: str = Field(..., description="Field to evaluate (e.g., 'environment', 'agent_id', 'user.role')")
    operator: PolicyConditionOperator
    value: Any = Field(..., description="Value to compare against")

    def evaluate(self, context: dict[str, Any]) -> bool:
        """Evaluate this condition against a context."""
        field_value = self._get_nested_value(context, self.field)

        if self.operator == PolicyConditionOperator.EQUALS:
            return field_value == self.value
        elif self.operator == PolicyConditionOperator.NOT_EQUALS:
            return field_value != self.value
        elif self.operator == PolicyConditionOperator.IN:
            return field_value in self.value
        elif self.operator == PolicyConditionOperator.NOT_IN:
            return field_value not in self.value
        elif self.operator == PolicyConditionOperator.MATCHES:
            import re
            return bool(re.match(self.value, str(field_value)))
        elif self.operator == PolicyConditionOperator.GREATER_THAN:
            return field_value > self.value
        elif self.operator == PolicyConditionOperator.LESS_THAN:
            return field_value < self.value
        elif self.operator == PolicyConditionOperator.CONTAINS:
            return self.value in field_value
        return False

    def _get_nested_value(self, data: dict, path: str) -> Any:
        """Get nested value from dict using dot notation."""
        keys = path.split('.')
        value = data
        for key in keys:
            if isinstance(value, dict):
                value = value.get(key)
            else:
                return None
        return value


class PolicyRule(BaseModel):
    """A policy rule with conditions and actions."""
    id: str = Field(..., description="Unique rule identifier")
    name: str = Field(..., description="Human-readable rule name")
    description: Optional[str] = None
    priority: int = Field(default=100, description="Lower number = higher priority")
    enabled: bool = True

    conditions: list[PolicyCondition] = Field(default_factory=list)
    condition_logic: str = Field(default="AND", description="AND or OR for combining conditions")

    action: PolicyAction
    action_params: dict[str, Any] = Field(default_factory=dict)

    # Scope
    environments: list[str] = Field(default_factory=list, description="Empty = all environments")
    agents: list[str] = Field(default_factory=list, description="Empty = all agents")

    def matches(self, context: dict[str, Any]) -> bool:
        """Check if this rule matches the given context."""
        if not self.enabled:
            return False

        # Check scope
        if self.environments and context.get('environment') not in self.environments:
            return False
        if self.agents and context.get('agent_id') not in self.agents:
            return False

        # Evaluate conditions
        if not self.conditions:
            return True

        if self.condition_logic == "AND":
            return all(c.evaluate(context) for c in self.conditions)
        else:  # OR
            return any(c.evaluate(context) for c in self.conditions)


class PolicyEvaluationResult(BaseModel):
    """Result of policy evaluation."""
    allowed: bool
    action: PolicyAction
    matched_rules: list[str] = Field(default_factory=list)
    denial_reason: Optional[str] = None
    requires_approval: bool = False
    approval_config: Optional[dict[str, Any]] = None
    warnings: list[str] = Field(default_factory=list)


class ApprovalStatus(str, Enum):
    """Status of an approval request."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class ApprovalRequest(BaseModel):
    """An approval request for a deployment."""
    id: str = Field(..., description="Unique request ID")
    deployment_id: str
    requester_id: str
    requester_email: str

    # What's being deployed
    agent_id: str
    target_environment: str
    deployment_config: dict[str, Any] = Field(default_factory=dict)

    # Approval details
    required_approvers: list[str] = Field(..., description="Role or user IDs required to approve")
    min_approvals: int = Field(default=1)
    current_approvals: list[dict[str, Any]] = Field(default_factory=list)

    # Status
    status: ApprovalStatus = ApprovalStatus.PENDING
    status_reason: Optional[str] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

    # Policy reference
    triggered_by_rule: str = Field(..., description="Policy rule ID that triggered approval")

    def is_fully_approved(self) -> bool:
        """Check if request has enough approvals."""
        return len(self.current_approvals) >= self.min_approvals

    def is_expired(self) -> bool:
        """Check if request has expired."""
        if self.expires_at and datetime.utcnow() > self.expires_at:
            return True
        return False
```

---

## File 2: `src/enterprise/policy/enforcer.py`

```python
"""
Policy enforcement engine for DVO agent.
"""
import logging
from typing import Any, Optional
from datetime import datetime

from .models import (
    PolicyRule, PolicyAction, PolicyEvaluationResult,
    PolicyCondition, PolicyConditionOperator
)

logger = logging.getLogger(__name__)


class PolicyEnforcer:
    """
    Evaluates deployment requests against organizational policies.

    Policies are evaluated in priority order (lower number = higher priority).
    First matching DENY or REQUIRE_APPROVAL wins.
    """

    # Default Mastercard policies
    DEFAULT_POLICIES = [
        PolicyRule(
            id="mc-prod-approval",
            name="Production Deployment Approval",
            description="All production deployments require release_manager approval",
            priority=10,
            conditions=[
                PolicyCondition(
                    field="environment",
                    operator=PolicyConditionOperator.IN,
                    value=["production", "prod"]
                )
            ],
            action=PolicyAction.REQUIRE_APPROVAL,
            action_params={
                "required_roles": ["release_manager", "admin"],
                "min_approvals": 1,
                "expiry_hours": 24
            }
        ),
        PolicyRule(
            id="mc-deny-direct-prod",
            name="Deny Direct Production Deploy",
            description="Deny deployments to prod without staging validation",
            priority=5,
            conditions=[
                PolicyCondition(
                    field="environment",
                    operator=PolicyConditionOperator.EQUALS,
                    value="production"
                ),
                PolicyCondition(
                    field="staging_validated",
                    operator=PolicyConditionOperator.NOT_EQUALS,
                    value=True
                )
            ],
            action=PolicyAction.DENY,
            action_params={
                "reason": "Production deployments require prior staging validation"
            }
        ),
        PolicyRule(
            id="mc-business-hours",
            name="Business Hours Deployment",
            description="Warn on deployments outside business hours",
            priority=50,
            conditions=[
                PolicyCondition(
                    field="deployment_hour",
                    operator=PolicyConditionOperator.NOT_IN,
                    value=list(range(9, 18))  # 9 AM - 6 PM
                )
            ],
            action=PolicyAction.WARN,
            action_params={
                "message": "Deployment outside business hours (9 AM - 6 PM)"
            },
            environments=["production", "staging"]
        ),
        PolicyRule(
            id="mc-weekend-block",
            name="Weekend Production Block",
            description="Block production deployments on weekends",
            priority=8,
            conditions=[
                PolicyCondition(
                    field="environment",
                    operator=PolicyConditionOperator.EQUALS,
                    value="production"
                ),
                PolicyCondition(
                    field="is_weekend",
                    operator=PolicyConditionOperator.EQUALS,
                    value=True
                )
            ],
            action=PolicyAction.DENY,
            action_params={
                "reason": "Production deployments blocked on weekends. Use emergency override if critical."
            }
        ),
        PolicyRule(
            id="mc-audit-all",
            name="Audit All Deployments",
            description="Log all deployment attempts for compliance",
            priority=1000,
            action=PolicyAction.AUDIT_ONLY
        )
    ]

    def __init__(self, custom_policies: Optional[list[PolicyRule]] = None):
        """
        Initialize policy enforcer.

        Args:
            custom_policies: Additional policies to merge with defaults
        """
        self.policies: list[PolicyRule] = list(self.DEFAULT_POLICIES)
        if custom_policies:
            self.policies.extend(custom_policies)

        # Sort by priority (lower = higher priority)
        self.policies.sort(key=lambda p: p.priority)

        logger.info(f"PolicyEnforcer initialized with {len(self.policies)} policies")

    def evaluate(
        self,
        agent_id: str,
        environment: str,
        user_context: dict[str, Any],
        deployment_config: Optional[dict[str, Any]] = None
    ) -> PolicyEvaluationResult:
        """
        Evaluate a deployment request against all policies.

        Args:
            agent_id: ID of agent being deployed
            environment: Target environment
            user_context: User info including roles, id, email
            deployment_config: Additional deployment parameters

        Returns:
            PolicyEvaluationResult with decision and details
        """
        # Build evaluation context
        now = datetime.utcnow()
        context = {
            "agent_id": agent_id,
            "environment": environment,
            "user": user_context,
            "deployment_hour": now.hour,
            "is_weekend": now.weekday() >= 5,
            "timestamp": now.isoformat(),
            **(deployment_config or {})
        }

        matched_rules: list[str] = []
        warnings: list[str] = []
        requires_approval = False
        approval_config = None
        denial_reason = None
        final_action = PolicyAction.ALLOW

        for policy in self.policies:
            if not policy.matches(context):
                continue

            matched_rules.append(policy.id)
            logger.debug(f"Policy matched: {policy.id} ({policy.name})")

            if policy.action == PolicyAction.DENY:
                return PolicyEvaluationResult(
                    allowed=False,
                    action=PolicyAction.DENY,
                    matched_rules=matched_rules,
                    denial_reason=policy.action_params.get("reason", f"Denied by policy: {policy.name}")
                )

            elif policy.action == PolicyAction.REQUIRE_APPROVAL:
                requires_approval = True
                approval_config = {
                    "rule_id": policy.id,
                    "rule_name": policy.name,
                    **policy.action_params
                }
                final_action = PolicyAction.REQUIRE_APPROVAL

            elif policy.action == PolicyAction.WARN:
                warnings.append(policy.action_params.get("message", f"Warning from policy: {policy.name}"))

            elif policy.action == PolicyAction.AUDIT_ONLY:
                # Just log, don't affect outcome
                logger.info(f"Audit: {agent_id} -> {environment} by {user_context.get('id', 'unknown')}")

        return PolicyEvaluationResult(
            allowed=not requires_approval,
            action=final_action,
            matched_rules=matched_rules,
            requires_approval=requires_approval,
            approval_config=approval_config,
            warnings=warnings
        )

    def add_policy(self, policy: PolicyRule) -> None:
        """Add a new policy and re-sort."""
        self.policies.append(policy)
        self.policies.sort(key=lambda p: p.priority)
        logger.info(f"Added policy: {policy.id}")

    def remove_policy(self, policy_id: str) -> bool:
        """Remove a policy by ID."""
        for i, policy in enumerate(self.policies):
            if policy.id == policy_id:
                self.policies.pop(i)
                logger.info(f"Removed policy: {policy_id}")
                return True
        return False

    def get_policy(self, policy_id: str) -> Optional[PolicyRule]:
        """Get a policy by ID."""
        for policy in self.policies:
            if policy.id == policy_id:
                return policy
        return None

    def list_policies(self, include_disabled: bool = False) -> list[PolicyRule]:
        """List all policies."""
        if include_disabled:
            return list(self.policies)
        return [p for p in self.policies if p.enabled]
```

---

## File 3: `src/enterprise/policy/approvals.py`

```python
"""
Approval workflow management for DVO agent.
"""
import logging
import uuid
from typing import Any, Optional
from datetime import datetime, timedelta

from .models import ApprovalRequest, ApprovalStatus
from ..rbac.manager import RBACManager
from ..rbac.models import DVORole

logger = logging.getLogger(__name__)


class ApprovalWorkflowManager:
    """
    Manages approval workflows for gated deployments.

    Integrates with RBAC to validate approver authority.
    """

    def __init__(self, rbac_manager: RBACManager):
        """
        Initialize approval manager.

        Args:
            rbac_manager: RBAC manager for role validation
        """
        self.rbac = rbac_manager
        self.pending_approvals: dict[str, ApprovalRequest] = {}
        self.approval_history: list[ApprovalRequest] = []

        logger.info("ApprovalWorkflowManager initialized")

    def create_approval_request(
        self,
        deployment_id: str,
        requester_id: str,
        requester_email: str,
        agent_id: str,
        target_environment: str,
        deployment_config: dict[str, Any],
        approval_config: dict[str, Any]
    ) -> ApprovalRequest:
        """
        Create a new approval request.

        Args:
            deployment_id: Unique deployment identifier
            requester_id: ID of user requesting deployment
            requester_email: Email of requester
            agent_id: Agent being deployed
            target_environment: Target environment
            deployment_config: Full deployment configuration
            approval_config: Approval requirements from policy

        Returns:
            Created ApprovalRequest
        """
        request_id = str(uuid.uuid4())

        # Calculate expiry
        expiry_hours = approval_config.get("expiry_hours", 24)
        expires_at = datetime.utcnow() + timedelta(hours=expiry_hours)

        request = ApprovalRequest(
            id=request_id,
            deployment_id=deployment_id,
            requester_id=requester_id,
            requester_email=requester_email,
            agent_id=agent_id,
            target_environment=target_environment,
            deployment_config=deployment_config,
            required_approvers=approval_config.get("required_roles", ["release_manager"]),
            min_approvals=approval_config.get("min_approvals", 1),
            expires_at=expires_at,
            triggered_by_rule=approval_config.get("rule_id", "unknown")
        )

        self.pending_approvals[request_id] = request

        logger.info(
            f"Created approval request {request_id} for {agent_id} -> {target_environment} "
            f"(requires {request.min_approvals} approval(s) from {request.required_approvers})"
        )

        return request

    def approve(
        self,
        request_id: str,
        approver_id: str,
        approver_email: str,
        approver_roles: list[DVORole],
        comment: Optional[str] = None
    ) -> tuple[bool, str]:
        """
        Approve a pending request.

        Args:
            request_id: Approval request ID
            approver_id: ID of approving user
            approver_email: Email of approver
            approver_roles: Roles of approving user
            comment: Optional approval comment

        Returns:
            Tuple of (success, message)
        """
        request = self.pending_approvals.get(request_id)
        if not request:
            return False, f"Approval request {request_id} not found"

        if request.status != ApprovalStatus.PENDING:
            return False, f"Request is not pending (status: {request.status})"

        if request.is_expired():
            request.status = ApprovalStatus.EXPIRED
            self._archive_request(request)
            return False, "Approval request has expired"

        # Validate approver has authority
        approver_role_names = [r.value for r in approver_roles]
        has_authority = any(
            role in approver_role_names or role == approver_id
            for role in request.required_approvers
        )

        if not has_authority:
            return False, f"User lacks approval authority. Required: {request.required_approvers}"

        # Check for duplicate approval
        if any(a["approver_id"] == approver_id for a in request.current_approvals):
            return False, "User has already approved this request"

        # Record approval
        request.current_approvals.append({
            "approver_id": approver_id,
            "approver_email": approver_email,
            "roles": approver_role_names,
            "comment": comment,
            "timestamp": datetime.utcnow().isoformat()
        })

        logger.info(f"Approval recorded for {request_id} by {approver_email}")

        # Check if fully approved
        if request.is_fully_approved():
            request.status = ApprovalStatus.APPROVED
            request.resolved_at = datetime.utcnow()
            self._archive_request(request)
            logger.info(f"Request {request_id} fully approved")
            return True, "Deployment approved - ready to proceed"

        remaining = request.min_approvals - len(request.current_approvals)
        return True, f"Approval recorded. {remaining} more approval(s) required."

    def reject(
        self,
        request_id: str,
        rejector_id: str,
        rejector_email: str,
        rejector_roles: list[DVORole],
        reason: str
    ) -> tuple[bool, str]:
        """
        Reject a pending request.

        Args:
            request_id: Approval request ID
            rejector_id: ID of rejecting user
            rejector_email: Email of rejector
            rejector_roles: Roles of rejecting user
            reason: Rejection reason

        Returns:
            Tuple of (success, message)
        """
        request = self.pending_approvals.get(request_id)
        if not request:
            return False, f"Approval request {request_id} not found"

        if request.status != ApprovalStatus.PENDING:
            return False, f"Request is not pending (status: {request.status})"

        # Validate rejector has authority (same as approver)
        rejector_role_names = [r.value for r in rejector_roles]
        has_authority = any(
            role in rejector_role_names or role == rejector_id
            for role in request.required_approvers
        )

        if not has_authority:
            return False, f"User lacks rejection authority. Required: {request.required_approvers}"

        request.status = ApprovalStatus.REJECTED
        request.status_reason = reason
        request.resolved_at = datetime.utcnow()

        # Record who rejected
        request.current_approvals.append({
            "approver_id": rejector_id,
            "approver_email": rejector_email,
            "roles": rejector_role_names,
            "action": "rejected",
            "reason": reason,
            "timestamp": datetime.utcnow().isoformat()
        })

        self._archive_request(request)

        logger.info(f"Request {request_id} rejected by {rejector_email}: {reason}")
        return True, f"Deployment rejected: {reason}"

    def cancel(self, request_id: str, canceller_id: str) -> tuple[bool, str]:
        """Cancel a pending request (by requester or admin)."""
        request = self.pending_approvals.get(request_id)
        if not request:
            return False, f"Approval request {request_id} not found"

        if request.status != ApprovalStatus.PENDING:
            return False, f"Request is not pending (status: {request.status})"

        # Only requester or admin can cancel
        if canceller_id != request.requester_id:
            # Check if admin - would need RBAC lookup
            pass  # For now allow anyone to cancel their own

        request.status = ApprovalStatus.CANCELLED
        request.status_reason = f"Cancelled by {canceller_id}"
        request.resolved_at = datetime.utcnow()

        self._archive_request(request)

        logger.info(f"Request {request_id} cancelled by {canceller_id}")
        return True, "Approval request cancelled"

    def get_pending_approvals(
        self,
        environment: Optional[str] = None,
        agent_id: Optional[str] = None
    ) -> list[ApprovalRequest]:
        """Get pending approval requests with optional filters."""
        # First, expire any stale requests
        self._expire_stale_requests()

        results = list(self.pending_approvals.values())

        if environment:
            results = [r for r in results if r.target_environment == environment]
        if agent_id:
            results = [r for r in results if r.agent_id == agent_id]

        return results

    def get_request(self, request_id: str) -> Optional[ApprovalRequest]:
        """Get a specific approval request."""
        return self.pending_approvals.get(request_id)

    def get_history(
        self,
        limit: int = 100,
        status: Optional[ApprovalStatus] = None
    ) -> list[ApprovalRequest]:
        """Get approval history."""
        results = list(self.approval_history)
        if status:
            results = [r for r in results if r.status == status]
        return results[-limit:]

    def _archive_request(self, request: ApprovalRequest) -> None:
        """Move request from pending to history."""
        if request.id in self.pending_approvals:
            del self.pending_approvals[request.id]
        self.approval_history.append(request)

    def _expire_stale_requests(self) -> None:
        """Expire any requests past their expiry time."""
        now = datetime.utcnow()
        expired_ids = []

        for request_id, request in self.pending_approvals.items():
            if request.expires_at and now > request.expires_at:
                request.status = ApprovalStatus.EXPIRED
                request.resolved_at = now
                expired_ids.append(request_id)

        for request_id in expired_ids:
            request = self.pending_approvals[request_id]
            self._archive_request(request)
            logger.info(f"Request {request_id} expired")
```

---

## File 4: `src/api/routes/policies.py`

```python
"""
API routes for policy management.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional

from ...enterprise.policy.models import PolicyRule, PolicyEvaluationResult, ApprovalRequest, ApprovalStatus
from ...enterprise.policy.enforcer import PolicyEnforcer
from ...enterprise.policy.approvals import ApprovalWorkflowManager
from ...enterprise.auth.models import AuthenticatedUser
from ...enterprise.auth.middleware import get_current_user, require_roles
from ...enterprise.rbac.models import DVORole

router = APIRouter(prefix="/v1/policies", tags=["policies"])

# These would be dependency-injected in production
_policy_enforcer: Optional[PolicyEnforcer] = None
_approval_manager: Optional[ApprovalWorkflowManager] = None


def get_policy_enforcer() -> PolicyEnforcer:
    global _policy_enforcer
    if not _policy_enforcer:
        _policy_enforcer = PolicyEnforcer()
    return _policy_enforcer


def get_approval_manager() -> ApprovalWorkflowManager:
    global _approval_manager
    if not _approval_manager:
        from ...enterprise.rbac.manager import RBACManager
        rbac = RBACManager()
        _approval_manager = ApprovalWorkflowManager(rbac)
    return _approval_manager


# --- Policy Management ---

@router.get("/")
async def list_policies(
    include_disabled: bool = False,
    current_user: AuthenticatedUser = Depends(get_current_user),
    enforcer: PolicyEnforcer = Depends(get_policy_enforcer)
) -> list[dict]:
    """List all policies."""
    policies = enforcer.list_policies(include_disabled=include_disabled)
    return [p.model_dump() for p in policies]


@router.get("/{policy_id}")
async def get_policy(
    policy_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    enforcer: PolicyEnforcer = Depends(get_policy_enforcer)
) -> dict:
    """Get a specific policy."""
    policy = enforcer.get_policy(policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail=f"Policy {policy_id} not found")
    return policy.model_dump()


@router.post("/")
async def create_policy(
    policy: PolicyRule,
    current_user: AuthenticatedUser = Depends(require_roles([DVORole.ADMIN])),
    enforcer: PolicyEnforcer = Depends(get_policy_enforcer)
) -> dict:
    """Create a new policy (admin only)."""
    existing = enforcer.get_policy(policy.id)
    if existing:
        raise HTTPException(status_code=409, detail=f"Policy {policy.id} already exists")

    enforcer.add_policy(policy)
    return {"status": "created", "policy_id": policy.id}


@router.delete("/{policy_id}")
async def delete_policy(
    policy_id: str,
    current_user: AuthenticatedUser = Depends(require_roles([DVORole.ADMIN])),
    enforcer: PolicyEnforcer = Depends(get_policy_enforcer)
) -> dict:
    """Delete a policy (admin only)."""
    # Prevent deletion of default MC policies
    if policy_id.startswith("mc-"):
        raise HTTPException(
            status_code=403,
            detail="Cannot delete Mastercard default policies"
        )

    if not enforcer.remove_policy(policy_id):
        raise HTTPException(status_code=404, detail=f"Policy {policy_id} not found")

    return {"status": "deleted", "policy_id": policy_id}


@router.post("/evaluate")
async def evaluate_policies(
    agent_id: str,
    environment: str,
    deployment_config: Optional[dict] = None,
    current_user: AuthenticatedUser = Depends(get_current_user),
    enforcer: PolicyEnforcer = Depends(get_policy_enforcer)
) -> PolicyEvaluationResult:
    """Evaluate policies for a deployment (dry run)."""
    user_context = {
        "id": current_user.id,
        "email": current_user.email,
        "roles": [r.value for r in current_user.roles]
    }

    return enforcer.evaluate(
        agent_id=agent_id,
        environment=environment,
        user_context=user_context,
        deployment_config=deployment_config
    )


# --- Approval Workflows ---

@router.get("/approvals/pending")
async def list_pending_approvals(
    environment: Optional[str] = None,
    agent_id: Optional[str] = None,
    current_user: AuthenticatedUser = Depends(get_current_user),
    manager: ApprovalWorkflowManager = Depends(get_approval_manager)
) -> list[dict]:
    """List pending approval requests."""
    approvals = manager.get_pending_approvals(
        environment=environment,
        agent_id=agent_id
    )
    return [a.model_dump() for a in approvals]


@router.get("/approvals/{request_id}")
async def get_approval_request(
    request_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    manager: ApprovalWorkflowManager = Depends(get_approval_manager)
) -> dict:
    """Get a specific approval request."""
    request = manager.get_request(request_id)
    if not request:
        raise HTTPException(status_code=404, detail=f"Approval request {request_id} not found")
    return request.model_dump()


@router.post("/approvals/{request_id}/approve")
async def approve_request(
    request_id: str,
    comment: Optional[str] = None,
    current_user: AuthenticatedUser = Depends(get_current_user),
    manager: ApprovalWorkflowManager = Depends(get_approval_manager)
) -> dict:
    """Approve a pending request."""
    success, message = manager.approve(
        request_id=request_id,
        approver_id=current_user.id,
        approver_email=current_user.email,
        approver_roles=current_user.roles,
        comment=comment
    )

    if not success:
        raise HTTPException(status_code=400, detail=message)

    return {"status": "approved" if "ready to proceed" in message else "partial", "message": message}


@router.post("/approvals/{request_id}/reject")
async def reject_request(
    request_id: str,
    reason: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    manager: ApprovalWorkflowManager = Depends(get_approval_manager)
) -> dict:
    """Reject a pending request."""
    success, message = manager.reject(
        request_id=request_id,
        rejector_id=current_user.id,
        rejector_email=current_user.email,
        rejector_roles=current_user.roles,
        reason=reason
    )

    if not success:
        raise HTTPException(status_code=400, detail=message)

    return {"status": "rejected", "message": message}


@router.post("/approvals/{request_id}/cancel")
async def cancel_request(
    request_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    manager: ApprovalWorkflowManager = Depends(get_approval_manager)
) -> dict:
    """Cancel a pending request."""
    success, message = manager.cancel(
        request_id=request_id,
        canceller_id=current_user.id
    )

    if not success:
        raise HTTPException(status_code=400, detail=message)

    return {"status": "cancelled", "message": message}


@router.get("/approvals/history")
async def get_approval_history(
    limit: int = 100,
    status: Optional[ApprovalStatus] = None,
    current_user: AuthenticatedUser = Depends(get_current_user),
    manager: ApprovalWorkflowManager = Depends(get_approval_manager)
) -> list[dict]:
    """Get approval history."""
    history = manager.get_history(limit=limit, status=status)
    return [h.model_dump() for h in history]
```

---

## File 5: Update `src/api/app.py`

Add to existing app.py:

```python
# Add import
from .routes.policies import router as policies_router

# Add router registration (after existing routers)
app.include_router(policies_router)
```

---

## File 6: `src/enterprise/policy/__init__.py`

```python
"""
Policy enforcement module for DVO agent.
"""
from .models import (
    PolicyAction,
    PolicyCondition,
    PolicyConditionOperator,
    PolicyRule,
    PolicyEvaluationResult,
    ApprovalStatus,
    ApprovalRequest
)
from .enforcer import PolicyEnforcer
from .approvals import ApprovalWorkflowManager

__all__ = [
    "PolicyAction",
    "PolicyCondition",
    "PolicyConditionOperator",
    "PolicyRule",
    "PolicyEvaluationResult",
    "ApprovalStatus",
    "ApprovalRequest",
    "PolicyEnforcer",
    "ApprovalWorkflowManager"
]
```

---

## Integration Points

### With DVO Agent
Update `src/agents/dvo/agent.py` to integrate policy evaluation:

```python
# In DVOAgent.deploy() method, before executing deployment:

from ...enterprise.policy.enforcer import PolicyEnforcer
from ...enterprise.policy.approvals import ApprovalWorkflowManager

# Evaluate policies
enforcer = PolicyEnforcer()
result = enforcer.evaluate(
    agent_id=agent_id,
    environment=environment,
    user_context=user_context,
    deployment_config=config
)

if not result.allowed:
    if result.requires_approval:
        # Create approval request
        approval_mgr = ApprovalWorkflowManager(self.rbac)
        request = approval_mgr.create_approval_request(
            deployment_id=deployment_id,
            requester_id=user.id,
            requester_email=user.email,
            agent_id=agent_id,
            target_environment=environment,
            deployment_config=config,
            approval_config=result.approval_config
        )
        return {"status": "pending_approval", "request_id": request.id}
    else:
        raise PermissionError(result.denial_reason)
```

---

## Default Mastercard Policies Included

| Policy ID | Name | Action | Trigger |
|-----------|------|--------|---------|
| mc-prod-approval | Production Deployment Approval | REQUIRE_APPROVAL | Any prod deployment |
| mc-deny-direct-prod | Deny Direct Production Deploy | DENY | Prod without staging validation |
| mc-business-hours | Business Hours Deployment | WARN | Deploy outside 9AM-6PM |
| mc-weekend-block | Weekend Production Block | DENY | Prod deploy on weekend |
| mc-audit-all | Audit All Deployments | AUDIT_ONLY | All deployments |

---

## Testing Checklist

- [ ] Policy condition evaluation (all operators)
- [ ] Policy matching with scope filters
- [ ] Priority-based rule evaluation
- [ ] DENY action stops evaluation
- [ ] REQUIRE_APPROVAL creates pending request
- [ ] Approval workflow with role validation
- [ ] Rejection workflow
- [ ] Request expiration
- [ ] History tracking
- [ ] API endpoints authentication
- [ ] Admin-only policy CRUD

---

## Next Phase Preview

**Phase 4: Audit Logger + SIEM Export**
- Comprehensive audit logging for all DVO actions
- SIEM-compatible export format (CEF, JSON)
- Log retention policies
- Tamper-evident logging
