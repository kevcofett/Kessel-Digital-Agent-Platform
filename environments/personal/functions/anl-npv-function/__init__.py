"""
ANL NPV Azure Function
Calculates Net Present Value with sensitivity analysis

Personal Environment Only - Not available in Mastercard (DLP blocked)
Fallback: AI Builder prompt ANL_NPV_PROMPT
"""

import azure.functions as func
import json
import logging
from typing import List, Dict, Any


def calculate_npv(cash_flows: List[float], discount_rate: float, initial_investment: float) -> float:
    """Calculate Net Present Value."""
    npv = -initial_investment
    for t, cf in enumerate(cash_flows, start=1):
        npv += cf / ((1 + discount_rate) ** t)
    return npv


def calculate_sensitivity(cash_flows: List[float], base_rate: float, initial_investment: float) -> Dict[str, float]:
    """Calculate NPV at different discount rates for sensitivity analysis."""
    rates = {
        "rate_minus_2": base_rate - 0.02,
        "rate_minus_1": base_rate - 0.01,
        "base_rate": base_rate,
        "rate_plus_1": base_rate + 0.01,
        "rate_plus_2": base_rate + 0.02
    }

    sensitivity = {}
    for label, rate in rates.items():
        if rate > 0:
            sensitivity[label] = {
                "rate": rate,
                "npv": round(calculate_npv(cash_flows, rate, initial_investment), 2)
            }

    return sensitivity


def main(req: func.HttpRequest) -> func.HttpResponse:
    """HTTP trigger for NPV calculation."""
    logging.info("ANL NPV function processing request")

    try:
        req_body = req.get_json()

        initial_investment = float(req_body.get("initial_investment", 0))
        cash_flows = [float(cf) for cf in req_body.get("cash_flows", [])]
        discount_rate = float(req_body.get("discount_rate", 0.10))

        if not cash_flows:
            return func.HttpResponse(
                json.dumps({"error": "cash_flows array is required"}),
                status_code=400,
                mimetype="application/json"
            )

        npv = calculate_npv(cash_flows, discount_rate, initial_investment)
        sensitivity = calculate_sensitivity(cash_flows, discount_rate, initial_investment)

        pv_breakdown = []
        for t, cf in enumerate(cash_flows, start=1):
            pv = cf / ((1 + discount_rate) ** t)
            pv_breakdown.append({
                "year": t,
                "cash_flow": cf,
                "present_value": round(pv, 2),
                "discount_factor": round(1 / ((1 + discount_rate) ** t), 4)
            })

        result = {
            "npv": round(npv, 2),
            "initial_investment": initial_investment,
            "discount_rate": discount_rate,
            "present_value_breakdown": pv_breakdown,
            "sensitivity_analysis": sensitivity,
            "interpretation": "positive" if npv > 0 else "negative",
            "recommendation": "Accept investment" if npv > 0 else "Reject investment"
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
        logging.error(f"Error in NPV calculation: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": "Internal server error"}),
            status_code=500,
            mimetype="application/json"
        )
