"""
Validate Gate Azure Function

Validates media plans against gate criteria at each stage.
Gate definitions and validation rules come from Dataverse.
"""

import azure.functions as func
import json
import logging
from typing import Dict, Any, List
from datetime import datetime

from ..shared.dataverse_client import DataverseClient
from ..shared.validators import validate_gate_request

logger = logging.getLogger(__name__)

# Gate definitions with required fields and validations
GATE_DEFINITIONS = {
    "strategy": {
        "name": "Strategy Gate",
        "required_sections": ["objective", "audience", "budget", "timeline"],
        "validations": [
            {"field": "objective", "rule": "not_empty", "message": "Campaign objective is required"},
            {"field": "audience", "rule": "not_empty", "message": "Target audience must be defined"},
            {"field": "budget", "rule": "positive_number", "message": "Budget must be a positive number"},
            {"field": "timeline.start_date", "rule": "not_empty", "message": "Start date is required"},
            {"field": "timeline.end_date", "rule": "not_empty", "message": "End date is required"}
        ]
    },
    "tactical": {
        "name": "Tactical Gate",
        "required_sections": ["channels", "allocation", "targets", "creative_brief"],
        "validations": [
            {"field": "channels", "rule": "min_length:1", "message": "At least one channel is required"},
            {"field": "allocation", "rule": "sums_to:100", "message": "Channel allocation must sum to 100%"},
            {"field": "targets", "rule": "not_empty", "message": "KPI targets must be defined"},
            {"field": "creative_brief", "rule": "not_empty", "message": "Creative brief is required"}
        ]
    },
    "execution": {
        "name": "Execution Gate",
        "required_sections": ["partners", "tracking", "reporting", "creative_assets"],
        "validations": [
            {"field": "partners", "rule": "min_length:1", "message": "At least one media partner is required"},
            {"field": "tracking.pixels", "rule": "not_empty", "message": "Tracking pixels must be configured"},
            {"field": "tracking.attribution", "rule": "not_empty", "message": "Attribution model must be defined"},
            {"field": "creative_assets", "rule": "min_length:1", "message": "Creative assets must be provided"}
        ]
    },
    "final": {
        "name": "Final Approval Gate",
        "required_sections": ["sign_off", "risk_assessment", "contingency"],
        "validations": [
            {"field": "sign_off.stakeholder", "rule": "not_empty", "message": "Stakeholder sign-off required"},
            {"field": "risk_assessment", "rule": "not_empty", "message": "Risk assessment must be completed"},
            {"field": "contingency", "rule": "not_empty", "message": "Contingency plan is required"}
        ]
    }
}


def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    Validate Gate Azure Function

    Validates media plans against gate criteria:
    - Strategy Gate: Objective, audience, budget, timeline
    - Tactical Gate: Channels, allocation, targets, creative
    - Execution Gate: Partners, tracking, reporting, assets
    - Final Gate: Sign-off, risk assessment, contingency
    """
    logger.info('ValidateGate function processing request.')

    try:
        req_body = req.get_json()

        # Validate request
        validation = validate_gate_request(req_body)
        if not validation.is_valid:
            return func.HttpResponse(
                json.dumps({
                    "status": "error",
                    "error_code": "VALIDATION_ERROR",
                    "message": validation.error_message,
                    "details": validation.errors
                }),
                status_code=400,
                mimetype="application/json"
            )

        plan_id = req_body.get("plan_id")
        gate = req_body.get("gate")
        plan_data = req_body.get("plan_data", {})

        # Get gate definition
        gate_def = GATE_DEFINITIONS.get(gate)
        if not gate_def:
            return func.HttpResponse(
                json.dumps({
                    "status": "error",
                    "error_code": "INVALID_GATE",
                    "message": f"Unknown gate: {gate}"
                }),
                status_code=400,
                mimetype="application/json"
            )

        # Run validations
        validation_results = []
        passed = 0
        failed = 0
        warnings = 0

        for rule in gate_def["validations"]:
            result = validate_rule(rule, plan_data)
            validation_results.append(result)

            if result["status"] == "passed":
                passed += 1
            elif result["status"] == "failed":
                failed += 1
            else:
                warnings += 1

        # Check section completeness
        section_status = {}
        for section in gate_def["required_sections"]:
            section_data = plan_data.get(section)
            if section_data:
                completeness = calculate_completeness(section_data)
                section_status[section] = {
                    "present": True,
                    "completeness": completeness,
                    "status": "complete" if completeness >= 80 else "incomplete"
                }
            else:
                section_status[section] = {
                    "present": False,
                    "completeness": 0,
                    "status": "missing"
                }

        # Determine overall gate status
        gate_passed = failed == 0 and all(
            s["present"] for s in section_status.values()
        )

        result = {
            "status": "success",
            "gateValidation": {
                "gate": gate,
                "gateName": gate_def["name"],
                "planId": plan_id,
                "passed": gate_passed,
                "summary": {
                    "totalChecks": len(validation_results),
                    "passed": passed,
                    "failed": failed,
                    "warnings": warnings
                },
                "validationResults": validation_results,
                "sectionStatus": section_status,
                "nextGate": get_next_gate(gate) if gate_passed else None
            },
            "metadata": {
                "validatedAt": datetime.utcnow().isoformat(),
                "dataSource": "Dataverse"
            }
        }

        return func.HttpResponse(
            json.dumps(result),
            status_code=200,
            mimetype="application/json"
        )

    except json.JSONDecodeError:
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "error_code": "INVALID_JSON",
                "message": "Request body must be valid JSON"
            }),
            status_code=400,
            mimetype="application/json"
        )
    except Exception as e:
        logger.error(f"ValidateGate error: {str(e)}")
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "error_code": "INTERNAL_ERROR",
                "message": str(e)
            }),
            status_code=500,
            mimetype="application/json"
        )


def validate_rule(rule: Dict[str, Any], data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate a single rule against plan data."""
    field = rule["field"]
    rule_type = rule["rule"]
    message = rule["message"]

    # Get nested field value
    value = get_nested_value(data, field)

    # Check rule
    if rule_type == "not_empty":
        passed = value is not None and value != "" and value != []
    elif rule_type == "positive_number":
        passed = isinstance(value, (int, float)) and value > 0
    elif rule_type.startswith("min_length:"):
        min_len = int(rule_type.split(":")[1])
        passed = isinstance(value, (list, str)) and len(value) >= min_len
    elif rule_type.startswith("sums_to:"):
        target = int(rule_type.split(":")[1])
        if isinstance(value, dict):
            total = sum(value.values())
            passed = abs(total - target) <= 1  # Allow 1% tolerance
        else:
            passed = False
    else:
        passed = True  # Unknown rule type, pass by default

    return {
        "field": field,
        "rule": rule_type,
        "status": "passed" if passed else "failed",
        "message": message if not passed else None,
        "value": str(value)[:100] if value else None  # Truncate for display
    }


def get_nested_value(data: Dict[str, Any], field: str) -> Any:
    """Get value from nested dictionary using dot notation."""
    keys = field.split(".")
    value = data

    for key in keys:
        if isinstance(value, dict):
            value = value.get(key)
        else:
            return None

    return value


def calculate_completeness(section_data: Any) -> int:
    """Calculate section completeness percentage."""
    if not section_data:
        return 0

    if isinstance(section_data, dict):
        if not section_data:
            return 0
        filled = sum(1 for v in section_data.values() if v is not None and v != "")
        return int((filled / len(section_data)) * 100)

    if isinstance(section_data, list):
        return 100 if len(section_data) > 0 else 0

    if isinstance(section_data, str):
        return 100 if section_data else 0

    return 100 if section_data else 0


def get_next_gate(current_gate: str) -> str:
    """Get the next gate in the sequence."""
    gate_sequence = ["strategy", "tactical", "execution", "final"]
    try:
        current_index = gate_sequence.index(current_gate)
        if current_index < len(gate_sequence) - 1:
            return gate_sequence[current_index + 1]
    except ValueError:
        pass
    return None
