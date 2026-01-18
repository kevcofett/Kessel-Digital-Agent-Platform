"""
ANL Sensitivity Azure Function
Performs tornado diagram sensitivity analysis

Personal Environment Only - Not available in Mastercard (DLP blocked)
Fallback: AI Builder prompt ANL_SENSITIVITY_PROMPT
"""

import azure.functions as func
import json
import logging
from typing import List, Dict, Any


def calculate_impact(base_case: Dict[str, Any], variable: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate the impact of varying a single variable."""
    name = variable["name"]
    base_value = variable.get("base", base_case.get(name, 0))
    low_value = variable["low"]
    high_value = variable["high"]

    base_outcome = base_case.get("outcome", 0)

    sensitivity_factor = variable.get("sensitivity_factor", 1.0)

    low_change = (low_value - base_value) * sensitivity_factor
    high_change = (high_value - base_value) * sensitivity_factor

    low_outcome = base_outcome + low_change
    high_outcome = base_outcome + high_change

    return {
        "variable": name,
        "base_value": base_value,
        "low_value": low_value,
        "high_value": high_value,
        "low_outcome": round(low_outcome, 2),
        "high_outcome": round(high_outcome, 2),
        "impact_range": round(abs(high_outcome - low_outcome), 2),
        "low_delta": round(low_outcome - base_outcome, 2),
        "high_delta": round(high_outcome - base_outcome, 2)
    }


def generate_spider_data(base_case: Dict[str, Any], variables: List[Dict]) -> List[Dict]:
    """Generate spider diagram data showing outcome at different percentages of base."""
    percentages = [-20, -10, 0, 10, 20]
    spider_data = []

    for var in variables:
        name = var["name"]
        base_value = var.get("base", base_case.get(name, 0))
        sensitivity_factor = var.get("sensitivity_factor", 1.0)
        base_outcome = base_case.get("outcome", 0)

        points = []
        for pct in percentages:
            change = base_value * (pct / 100) * sensitivity_factor
            outcome = base_outcome + change
            points.append({
                "percent_change": pct,
                "outcome": round(outcome, 2)
            })

        spider_data.append({
            "variable": name,
            "data_points": points
        })

    return spider_data


def main(req: func.HttpRequest) -> func.HttpResponse:
    """HTTP trigger for sensitivity analysis."""
    logging.info("ANL Sensitivity function processing request")

    try:
        req_body = req.get_json()

        base_case = req_body.get("base_case", {})
        variables = req_body.get("variables", [])

        if not variables:
            return func.HttpResponse(
                json.dumps({"error": "variables array is required"}),
                status_code=400,
                mimetype="application/json"
            )

        tornado_data = []
        for var in variables:
            impact = calculate_impact(base_case, var)
            tornado_data.append(impact)

        tornado_data.sort(key=lambda x: x["impact_range"], reverse=True)

        for i, item in enumerate(tornado_data):
            item["rank"] = i + 1

        spider_data = generate_spider_data(base_case, variables)

        critical_variables = [item["variable"] for item in tornado_data[:3]]

        breakeven_points = []
        base_outcome = base_case.get("outcome", 0)
        for item in tornado_data:
            if item["low_outcome"] * item["high_outcome"] < 0:
                if item["high_outcome"] != item["low_outcome"]:
                    breakeven_pct = -item["low_delta"] / (item["high_delta"] - item["low_delta"])
                    breakeven_value = item["low_value"] + breakeven_pct * (item["high_value"] - item["low_value"])
                    breakeven_points.append({
                        "variable": item["variable"],
                        "breakeven_value": round(breakeven_value, 2)
                    })

        result = {
            "base_case_outcome": base_outcome,
            "tornado_data": tornado_data,
            "spider_data": spider_data,
            "critical_variables": critical_variables,
            "breakeven_points": breakeven_points,
            "scenarios": {
                "optimistic": round(base_outcome + sum(max(item["low_delta"], item["high_delta"]) for item in tornado_data[:3]), 2),
                "pessimistic": round(base_outcome + sum(min(item["low_delta"], item["high_delta"]) for item in tornado_data[:3]), 2),
                "base": base_outcome
            }
        }

        return func.HttpResponse(
            json.dumps(result),
            status_code=200,
            mimetype="application/json"
        )

    except ValueError as e:
        return func.HttpResponse(
            json.dumps({"error": f"Invalid input: {str(e)}"}),
            status_code=400,
            mimetype="application/json"
        )
    except Exception as e:
        logging.error(f"Error in sensitivity analysis: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": "Internal server error"}),
            status_code=500,
            mimetype="application/json"
        )
