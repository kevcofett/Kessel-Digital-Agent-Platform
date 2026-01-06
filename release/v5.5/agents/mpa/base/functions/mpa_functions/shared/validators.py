"""
Request validators for Azure Functions.
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass


@dataclass
class ValidationResult:
    """Result of validation check."""
    is_valid: bool
    error_message: Optional[str] = None
    errors: Optional[List[str]] = None


def validate_session_request(req_body: Dict[str, Any]) -> ValidationResult:
    """Validate SessionManager request."""
    errors = []

    if "action" not in req_body:
        errors.append("action is required")
    elif req_body["action"] not in ["create", "get", "update", "end"]:
        errors.append("action must be one of: create, get, update, end")

    action = req_body.get("action")

    if action == "create":
        if "user_id" not in req_body:
            errors.append("user_id is required for create action")
    elif action in ["get", "update", "end"]:
        if "session_id" not in req_body:
            errors.append("session_id is required for this action")

    if errors:
        return ValidationResult(
            is_valid=False,
            error_message=f"Validation failed: {len(errors)} error(s)",
            errors=errors
        )

    return ValidationResult(is_valid=True)


def validate_projection_request(req_body: Dict[str, Any]) -> ValidationResult:
    """Validate RunProjections request."""
    errors = []

    # Required fields
    if "budget" not in req_body:
        errors.append("budget is required")
    elif not isinstance(req_body["budget"], (int, float)):
        errors.append("budget must be a number")
    elif req_body["budget"] <= 0:
        errors.append("budget must be greater than 0")

    if "channels" not in req_body:
        errors.append("channels is required")
    elif not isinstance(req_body["channels"], list):
        errors.append("channels must be an array")
    elif len(req_body["channels"]) == 0:
        errors.append("at least one channel is required")

    # Optional fields validation
    if "vertical" in req_body and not isinstance(req_body["vertical"], str):
        errors.append("vertical must be a string")

    if "objective" in req_body and not isinstance(req_body["objective"], str):
        errors.append("objective must be a string")

    if "allocation" in req_body:
        if not isinstance(req_body["allocation"], dict):
            errors.append("allocation must be an object")
        else:
            # Check allocation percentages sum to 100 (or close to it)
            total = sum(req_body["allocation"].values())
            if total > 0 and abs(total - 100) > 1:
                errors.append(f"allocation percentages sum to {total}, should be ~100")

    if errors:
        return ValidationResult(
            is_valid=False,
            error_message=f"Validation failed: {len(errors)} error(s)",
            errors=errors
        )

    return ValidationResult(is_valid=True)


def validate_budget_allocation_request(req_body: Dict[str, Any]) -> ValidationResult:
    """Validate CalculateBudgetAllocation request."""
    errors = []

    if "budget" not in req_body:
        errors.append("budget is required")
    elif req_body["budget"] <= 0:
        errors.append("budget must be greater than 0")

    if "channels" not in req_body:
        errors.append("channels is required")
    elif len(req_body["channels"]) == 0:
        errors.append("at least one channel is required")

    if "objective" not in req_body:
        errors.append("objective is required")

    if errors:
        return ValidationResult(
            is_valid=False,
            error_message=f"Validation failed: {len(errors)} error(s)",
            errors=errors
        )

    return ValidationResult(is_valid=True)


def validate_gap_request(req_body: Dict[str, Any]) -> ValidationResult:
    """Validate CalculateGap request."""
    errors = []

    if "targets" not in req_body:
        errors.append("targets is required")
    elif not isinstance(req_body["targets"], dict):
        errors.append("targets must be an object")

    if "projections" not in req_body:
        errors.append("projections is required")
    elif not isinstance(req_body["projections"], dict):
        errors.append("projections must be an object")

    if errors:
        return ValidationResult(
            is_valid=False,
            error_message=f"Validation failed: {len(errors)} error(s)",
            errors=errors
        )

    return ValidationResult(is_valid=True)


def validate_spo_request(req_body: Dict[str, Any]) -> ValidationResult:
    """Validate CalculateSPO request."""
    errors = []

    if "partners" not in req_body:
        errors.append("partners is required")
    elif not isinstance(req_body["partners"], list):
        errors.append("partners must be an array")
    elif len(req_body["partners"]) == 0:
        errors.append("at least one partner is required")

    if errors:
        return ValidationResult(
            is_valid=False,
            error_message=f"Validation failed: {len(errors)} error(s)",
            errors=errors
        )

    return ValidationResult(is_valid=True)


def validate_gate_request(req_body: Dict[str, Any]) -> ValidationResult:
    """Validate ValidateGate request."""
    errors = []

    if "plan_id" not in req_body:
        errors.append("plan_id is required")

    if "gate" not in req_body:
        errors.append("gate is required")
    elif req_body["gate"] not in ["strategy", "tactical", "execution", "final"]:
        errors.append("gate must be one of: strategy, tactical, execution, final")

    if errors:
        return ValidationResult(
            is_valid=False,
            error_message=f"Validation failed: {len(errors)} error(s)",
            errors=errors
        )

    return ValidationResult(is_valid=True)


def validate_document_request(req_body: Dict[str, Any]) -> ValidationResult:
    """Validate GenerateDocument request."""
    errors = []

    if "plan_id" not in req_body:
        errors.append("plan_id is required")

    if "document_type" not in req_body:
        errors.append("document_type is required")
    elif req_body["document_type"] not in ["brief", "plan", "report", "presentation"]:
        errors.append("document_type must be one of: brief, plan, report, presentation")

    if errors:
        return ValidationResult(
            is_valid=False,
            error_message=f"Validation failed: {len(errors)} error(s)",
            errors=errors
        )

    return ValidationResult(is_valid=True)


def validate_search_benchmarks_request(req_body: Dict[str, Any]) -> ValidationResult:
    """Validate SearchBenchmarks request."""
    errors = []

    # At least one filter must be provided
    has_filter = any([
        req_body.get("vertical"),
        req_body.get("channel"),
        req_body.get("metric_type")
    ])

    if not has_filter:
        errors.append("at least one filter (vertical, channel, or metric_type) is required")

    if errors:
        return ValidationResult(
            is_valid=False,
            error_message=f"Validation failed: {len(errors)} error(s)",
            errors=errors
        )

    return ValidationResult(is_valid=True)
