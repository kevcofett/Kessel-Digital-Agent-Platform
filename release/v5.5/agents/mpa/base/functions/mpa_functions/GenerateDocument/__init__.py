"""
Generate Document Azure Function

Generates formatted documents from media plan data.
Templates are stored in SharePoint, data comes from Dataverse.
"""

import azure.functions as func
import json
import logging
from typing import Dict, Any, List
from datetime import datetime

from ..shared.dataverse_client import DataverseClient
from ..shared.validators import validate_document_request

logger = logging.getLogger(__name__)


def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    Generate Document Azure Function

    Generates documents:
    - Brief: Executive summary of media plan
    - Plan: Full media plan document
    - Report: Performance report
    - Presentation: Slide deck content
    """
    logger.info('GenerateDocument function processing request.')

    try:
        req_body = req.get_json()

        # Validate request
        validation = validate_document_request(req_body)
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
        document_type = req_body.get("document_type")
        format_type = req_body.get("format", "json")
        include_sections = req_body.get("include_sections", [])

        # Get plan data from Dataverse
        client = DataverseClient()
        plan_data = get_plan_data(client, plan_id)

        if not plan_data:
            return func.HttpResponse(
                json.dumps({
                    "status": "error",
                    "error_code": "PLAN_NOT_FOUND",
                    "message": f"Plan not found: {plan_id}"
                }),
                status_code=404,
                mimetype="application/json"
            )

        # Generate document content based on type
        if document_type == "brief":
            content = generate_brief(plan_data, include_sections)
        elif document_type == "plan":
            content = generate_plan_document(plan_data, include_sections)
        elif document_type == "report":
            content = generate_report(plan_data, include_sections)
        elif document_type == "presentation":
            content = generate_presentation(plan_data, include_sections)
        else:
            content = generate_plan_document(plan_data, include_sections)

        result = {
            "status": "success",
            "document": {
                "type": document_type,
                "format": format_type,
                "planId": plan_id,
                "content": content,
                "wordCount": count_words(content),
                "sections": list(content.keys()) if isinstance(content, dict) else []
            },
            "metadata": {
                "generatedAt": datetime.utcnow().isoformat(),
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
        logger.error(f"GenerateDocument error: {str(e)}")
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "error_code": "INTERNAL_ERROR",
                "message": str(e)
            }),
            status_code=500,
            mimetype="application/json"
        )


def get_plan_data(client: DataverseClient, plan_id: str) -> Dict[str, Any]:
    """Retrieve plan data from Dataverse."""
    try:
        results = client.query_records(
            table_name="mpa_mediaplan",
            filter_query=f"mpa_mediaplanid eq '{plan_id}'",
            top=1
        )

        if results:
            plan = results[0]

            # Get related plan data
            plan_data_results = client.query_records(
                table_name="mpa_plandata",
                filter_query=f"_mpa_mediaplan_value eq '{plan_id}'"
            )

            plan["sections"] = {}
            for section in plan_data_results:
                section_name = section.get("mpa_section_name", "unknown")
                section_content = section.get("mpa_content", "{}")
                try:
                    plan["sections"][section_name] = json.loads(section_content)
                except json.JSONDecodeError:
                    plan["sections"][section_name] = section_content

            return plan

        return None
    except Exception as e:
        logger.error(f"Error fetching plan data: {e}")
        return None


def generate_brief(plan_data: Dict[str, Any], include_sections: List[str]) -> Dict[str, Any]:
    """Generate executive brief."""
    sections = plan_data.get("sections", {})

    brief = {
        "title": f"Media Plan Brief: {plan_data.get('mpa_name', 'Untitled')}",
        "executive_summary": {
            "objective": sections.get("strategy", {}).get("objective", ""),
            "budget": plan_data.get("mpa_total_budget", 0),
            "timeline": {
                "start": plan_data.get("mpa_start_date", ""),
                "end": plan_data.get("mpa_end_date", "")
            },
            "key_channels": sections.get("tactical", {}).get("channels", [])
        },
        "target_audience": sections.get("strategy", {}).get("audience", {}),
        "key_metrics": {
            "primary_kpi": sections.get("strategy", {}).get("primary_kpi", ""),
            "targets": sections.get("tactical", {}).get("targets", {})
        },
        "recommendations": sections.get("recommendations", [])
    }

    return brief


def generate_plan_document(plan_data: Dict[str, Any], include_sections: List[str]) -> Dict[str, Any]:
    """Generate full plan document."""
    sections = plan_data.get("sections", {})

    document = {
        "title": plan_data.get("mpa_name", "Media Plan"),
        "version": plan_data.get("mpa_version", "1.0"),
        "status": plan_data.get("mpa_status", "Draft"),
        "sections": {
            "1_executive_summary": {
                "heading": "Executive Summary",
                "content": generate_executive_summary(plan_data)
            },
            "2_objectives": {
                "heading": "Campaign Objectives",
                "content": sections.get("strategy", {}).get("objective", ""),
                "success_metrics": sections.get("strategy", {}).get("success_metrics", [])
            },
            "3_target_audience": {
                "heading": "Target Audience",
                "content": sections.get("strategy", {}).get("audience", {})
            },
            "4_channel_strategy": {
                "heading": "Channel Strategy",
                "channels": sections.get("tactical", {}).get("channels", []),
                "allocation": sections.get("tactical", {}).get("allocation", {})
            },
            "5_budget": {
                "heading": "Budget Overview",
                "total": plan_data.get("mpa_total_budget", 0),
                "breakdown": sections.get("tactical", {}).get("budget_breakdown", {})
            },
            "6_timeline": {
                "heading": "Campaign Timeline",
                "start": plan_data.get("mpa_start_date", ""),
                "end": plan_data.get("mpa_end_date", ""),
                "phases": sections.get("tactical", {}).get("phases", [])
            },
            "7_measurement": {
                "heading": "Measurement & Reporting",
                "kpis": sections.get("tactical", {}).get("targets", {}),
                "reporting_cadence": sections.get("execution", {}).get("reporting_cadence", "Weekly")
            }
        }
    }

    return document


def generate_report(plan_data: Dict[str, Any], include_sections: List[str]) -> Dict[str, Any]:
    """Generate performance report."""
    sections = plan_data.get("sections", {})
    performance = sections.get("performance", {})

    report = {
        "title": f"Performance Report: {plan_data.get('mpa_name', 'Campaign')}",
        "reporting_period": {
            "start": performance.get("period_start", ""),
            "end": performance.get("period_end", "")
        },
        "summary": {
            "total_spend": performance.get("total_spend", 0),
            "total_impressions": performance.get("total_impressions", 0),
            "total_clicks": performance.get("total_clicks", 0),
            "total_conversions": performance.get("total_conversions", 0)
        },
        "vs_targets": performance.get("vs_targets", {}),
        "by_channel": performance.get("by_channel", {}),
        "insights": performance.get("insights", []),
        "recommendations": performance.get("recommendations", [])
    }

    return report


def generate_presentation(plan_data: Dict[str, Any], include_sections: List[str]) -> Dict[str, Any]:
    """Generate presentation slide content."""
    sections = plan_data.get("sections", {})

    slides = {
        "title_slide": {
            "title": plan_data.get("mpa_name", "Media Plan"),
            "subtitle": f"Budget: ${plan_data.get('mpa_total_budget', 0):,.0f}",
            "date": datetime.utcnow().strftime("%B %Y")
        },
        "objective_slide": {
            "title": "Campaign Objective",
            "bullet_points": [
                sections.get("strategy", {}).get("objective", ""),
                f"Primary KPI: {sections.get('strategy', {}).get('primary_kpi', '')}",
                f"Target: {sections.get('tactical', {}).get('targets', {})}"
            ]
        },
        "audience_slide": {
            "title": "Target Audience",
            "content": sections.get("strategy", {}).get("audience", {})
        },
        "channel_mix_slide": {
            "title": "Channel Mix",
            "channels": sections.get("tactical", {}).get("channels", []),
            "allocation": sections.get("tactical", {}).get("allocation", {})
        },
        "budget_slide": {
            "title": "Budget Allocation",
            "total": plan_data.get("mpa_total_budget", 0),
            "breakdown": sections.get("tactical", {}).get("budget_breakdown", {})
        },
        "timeline_slide": {
            "title": "Campaign Timeline",
            "start": plan_data.get("mpa_start_date", ""),
            "end": plan_data.get("mpa_end_date", ""),
            "phases": sections.get("tactical", {}).get("phases", [])
        },
        "next_steps_slide": {
            "title": "Next Steps",
            "bullet_points": sections.get("recommendations", [])[:5]
        }
    }

    return slides


def generate_executive_summary(plan_data: Dict[str, Any]) -> str:
    """Generate executive summary text."""
    name = plan_data.get("mpa_name", "This campaign")
    budget = plan_data.get("mpa_total_budget", 0)
    sections = plan_data.get("sections", {})
    objective = sections.get("strategy", {}).get("objective", "drive results")
    channels = sections.get("tactical", {}).get("channels", [])

    channel_list = ", ".join(channels[:3]) if channels else "multiple channels"

    return (
        f"{name} is designed to {objective} with a total budget of ${budget:,.0f}. "
        f"The campaign will leverage {channel_list} to reach the target audience and "
        f"achieve the defined KPI targets."
    )


def count_words(content: Any) -> int:
    """Count words in content."""
    if isinstance(content, str):
        return len(content.split())
    elif isinstance(content, dict):
        return sum(count_words(v) for v in content.values())
    elif isinstance(content, list):
        return sum(count_words(item) for item in content)
    return 0
