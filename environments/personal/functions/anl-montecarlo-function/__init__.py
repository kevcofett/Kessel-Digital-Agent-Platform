"""
ANL Monte Carlo Azure Function
Runs Monte Carlo simulation for uncertainty analysis

Personal Environment Only - Not available in Mastercard (DLP blocked)
Fallback: AI Builder prompt ANL_MONTECARLO_PROMPT

Dependencies: numpy (add to requirements.txt)
"""

import azure.functions as func
import json
import logging
from typing import List, Dict, Any
import random
import math


def generate_samples(distribution: str, params: Dict[str, float], n: int) -> List[float]:
    """Generate random samples based on distribution type."""
    samples = []

    if distribution == "normal":
        mean = params.get("mean", 0)
        std = params.get("std", 1)
        for _ in range(n):
            u1, u2 = random.random(), random.random()
            z = math.sqrt(-2 * math.log(u1)) * math.cos(2 * math.pi * u2)
            samples.append(mean + std * z)

    elif distribution == "triangular":
        low = params.get("low", 0)
        mode = params.get("mode", 0.5)
        high = params.get("high", 1)
        for _ in range(n):
            u = random.random()
            fc = (mode - low) / (high - low)
            if u < fc:
                samples.append(low + math.sqrt(u * (high - low) * (mode - low)))
            else:
                samples.append(high - math.sqrt((1 - u) * (high - low) * (high - mode)))

    elif distribution == "uniform":
        low = params.get("low", 0)
        high = params.get("high", 1)
        for _ in range(n):
            samples.append(low + random.random() * (high - low))

    else:
        for _ in range(n):
            samples.append(params.get("value", 0))

    return samples


def calculate_percentiles(values: List[float], percentiles: List[float]) -> Dict[str, float]:
    """Calculate percentile values from a list."""
    sorted_values = sorted(values)
    n = len(sorted_values)
    result = {}

    for p in percentiles:
        idx = int(p / 100 * (n - 1))
        result[f"p{int(p)}"] = round(sorted_values[idx], 2)

    return result


def run_simulation(variables: List[Dict], model: str, iterations: int) -> Dict[str, Any]:
    """Run Monte Carlo simulation."""
    results = []

    for _ in range(iterations):
        var_values = {}
        for var in variables:
            samples = generate_samples(var["distribution"], var.get("params", {}), 1)
            var_values[var["name"]] = samples[0]

        if model == "NPV":
            cash_flows = var_values.get("annual_cash_flow", 10000)
            discount_rate = var_values.get("discount_rate", 0.10)
            initial = var_values.get("initial_investment", 50000)
            years = int(var_values.get("years", 5))

            npv = -initial
            for t in range(1, years + 1):
                npv += cash_flows / ((1 + discount_rate) ** t)
            results.append(npv)

        elif model == "Revenue":
            price = var_values.get("price", 100)
            volume = var_values.get("volume", 1000)
            results.append(price * volume)

        else:
            total = sum(var_values.values())
            results.append(total)

    return results


def main(req: func.HttpRequest) -> func.HttpResponse:
    """HTTP trigger for Monte Carlo simulation."""
    logging.info("ANL Monte Carlo function processing request")

    try:
        req_body = req.get_json()

        variables = req_body.get("variables", [])
        model = req_body.get("model", "custom")
        iterations = int(req_body.get("iterations", 10000))
        confidence_levels = req_body.get("confidence_levels", [10, 50, 90])

        if not variables:
            return func.HttpResponse(
                json.dumps({"error": "variables array is required"}),
                status_code=400,
                mimetype="application/json"
            )

        iterations = min(iterations, 50000)

        results = run_simulation(variables, model, iterations)

        mean = sum(results) / len(results)
        variance = sum((x - mean) ** 2 for x in results) / len(results)
        std_dev = math.sqrt(variance)

        percentiles = calculate_percentiles(results, confidence_levels)

        positive_count = sum(1 for r in results if r > 0)
        probability_positive = positive_count / len(results)

        histogram_bins = 20
        min_val, max_val = min(results), max(results)
        bin_width = (max_val - min_val) / histogram_bins
        histogram = [0] * histogram_bins
        for r in results:
            bin_idx = min(int((r - min_val) / bin_width), histogram_bins - 1)
            histogram[bin_idx] += 1

        histogram_data = [
            {
                "bin_start": round(min_val + i * bin_width, 2),
                "bin_end": round(min_val + (i + 1) * bin_width, 2),
                "count": histogram[i],
                "frequency": round(histogram[i] / iterations, 4)
            }
            for i in range(histogram_bins)
        ]

        result = {
            "iterations": iterations,
            "mean": round(mean, 2),
            "std_dev": round(std_dev, 2),
            "min": round(min(results), 2),
            "max": round(max(results), 2),
            "percentiles": percentiles,
            "probability_positive": round(probability_positive, 4),
            "histogram_data": histogram_data
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
        logging.error(f"Error in Monte Carlo simulation: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": "Internal server error"}),
            status_code=500,
            mimetype="application/json"
        )
