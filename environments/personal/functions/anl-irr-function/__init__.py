"""
ANL IRR Azure Function
Calculates Internal Rate of Return with MIRR and payback

Personal Environment Only - Not available in Mastercard (DLP blocked)
Fallback: AI Builder prompt ANL_IRR_PROMPT
"""

import azure.functions as func
import json
import logging
from typing import List, Dict, Any, Optional


def calculate_irr(cash_flows: List[float], initial_investment: float, max_iterations: int = 1000, tolerance: float = 1e-6) -> Optional[float]:
    """Calculate IRR using Newton-Raphson method."""
    all_flows = [-initial_investment] + cash_flows

    irr = 0.10

    for _ in range(max_iterations):
        npv = sum(cf / ((1 + irr) ** t) for t, cf in enumerate(all_flows))
        npv_derivative = sum(-t * cf / ((1 + irr) ** (t + 1)) for t, cf in enumerate(all_flows))

        if abs(npv_derivative) < tolerance:
            break

        new_irr = irr - npv / npv_derivative

        if abs(new_irr - irr) < tolerance:
            return new_irr

        irr = new_irr

    return irr if abs(sum(cf / ((1 + irr) ** t) for t, cf in enumerate(all_flows))) < 1 else None


def calculate_mirr(cash_flows: List[float], initial_investment: float, reinvestment_rate: float = 0.10, finance_rate: float = 0.10) -> float:
    """Calculate Modified IRR."""
    n = len(cash_flows)

    positive_flows = [cf if cf > 0 else 0 for cf in cash_flows]
    negative_flows = [cf if cf < 0 else 0 for cf in cash_flows]

    fv_positives = sum(cf * ((1 + reinvestment_rate) ** (n - t)) for t, cf in enumerate(positive_flows, start=1))

    pv_negatives = initial_investment + sum(cf / ((1 + finance_rate) ** t) for t, cf in enumerate(negative_flows, start=1))

    if pv_negatives == 0 or fv_positives <= 0:
        return 0.0

    mirr = (fv_positives / abs(pv_negatives)) ** (1 / n) - 1
    return mirr


def calculate_payback(cash_flows: List[float], initial_investment: float, discount_rate: Optional[float] = None) -> Dict[str, Any]:
    """Calculate simple and discounted payback periods."""
    cumulative = 0
    simple_payback = None

    for t, cf in enumerate(cash_flows, start=1):
        cumulative += cf
        if cumulative >= initial_investment and simple_payback is None:
            remaining = initial_investment - (cumulative - cf)
            simple_payback = (t - 1) + remaining / cf
            break

    discounted_payback = None
    if discount_rate:
        cumulative_pv = 0
        for t, cf in enumerate(cash_flows, start=1):
            pv = cf / ((1 + discount_rate) ** t)
            cumulative_pv += pv
            if cumulative_pv >= initial_investment and discounted_payback is None:
                remaining = initial_investment - (cumulative_pv - pv)
                discounted_payback = (t - 1) + remaining / pv
                break

    return {
        "simple_payback_years": round(simple_payback, 2) if simple_payback else None,
        "discounted_payback_years": round(discounted_payback, 2) if discounted_payback else None
    }


def main(req: func.HttpRequest) -> func.HttpResponse:
    """HTTP trigger for IRR calculation."""
    logging.info("ANL IRR function processing request")

    try:
        req_body = req.get_json()

        initial_investment = float(req_body.get("initial_investment", 0))
        cash_flows = [float(cf) for cf in req_body.get("cash_flows", [])]
        reinvestment_rate = float(req_body.get("reinvestment_rate", 0.10))
        hurdle_rate = req_body.get("hurdle_rate")

        if not cash_flows:
            return func.HttpResponse(
                json.dumps({"error": "cash_flows array is required"}),
                status_code=400,
                mimetype="application/json"
            )

        irr = calculate_irr(cash_flows, initial_investment)
        mirr = calculate_mirr(cash_flows, initial_investment, reinvestment_rate)
        payback = calculate_payback(cash_flows, initial_investment, 0.10)

        result = {
            "irr": round(irr * 100, 2) if irr else None,
            "irr_decimal": round(irr, 4) if irr else None,
            "mirr": round(mirr * 100, 2),
            "mirr_decimal": round(mirr, 4),
            "simple_payback_years": payback["simple_payback_years"],
            "discounted_payback_years": payback["discounted_payback_years"],
            "reinvestment_rate_used": reinvestment_rate
        }

        if hurdle_rate:
            result["hurdle_rate"] = hurdle_rate
            result["exceeds_hurdle"] = irr > hurdle_rate if irr else False
            result["recommendation"] = "Accept investment" if irr and irr > hurdle_rate else "Reject investment"

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
        logging.error(f"Error in IRR calculation: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": "Internal server error"}),
            status_code=500,
            mimetype="application/json"
        )
