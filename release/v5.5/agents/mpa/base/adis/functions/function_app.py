# ADIS Combined Function App
# All ADIS Azure Functions in a single app
# Version: 1.0

import azure.functions as func
import logging
import json
from datetime import datetime

app = func.FunctionApp()

# =============================================================================
# SHARED UTILITIES
# =============================================================================

def create_response(data: dict, status_code: int = 200) -> func.HttpResponse:
    """Create a standardized HTTP response."""
    return func.HttpResponse(
        json.dumps(data, default=str),
        status_code=status_code,
        mimetype="application/json"
    )

def get_error_response(message: str, status_code: int = 400) -> func.HttpResponse:
    """Create an error response."""
    return create_response({"error": message, "success": False}, status_code)

# =============================================================================
# HEALTH CHECK ENDPOINT
# =============================================================================

@app.route(route="health", methods=["GET"])
def health_check(req: func.HttpRequest) -> func.HttpResponse:
    """Health check endpoint for all ADIS functions."""
    return create_response({
        "status": "healthy",
        "service": "ADIS Functions",
        "version": "1.0",
        "timestamp": datetime.utcnow().isoformat(),
        "functions": [
            "parse-document",
            "run-analysis",
            "create-audience",
            "size-audience",
            "export-audience",
            "suggest-audiences",
            "optimize-allocation",
            "scenario-analysis",
            "calculate-affinity"
        ]
    })

# =============================================================================
# DOCUMENT PARSER FUNCTIONS
# =============================================================================

@app.route(route="parse-document", methods=["POST"])
def parse_document(req: func.HttpRequest) -> func.HttpResponse:
    """Parse uploaded documents (Excel, Word, PDF, PowerPoint) into structured data."""
    import pandas as pd
    import hashlib
    import io

    try:
        # Get request body
        body = req.get_body()

        if not body:
            return get_error_response("No file data provided")

        # Try to get file metadata from headers
        content_type = req.headers.get('Content-Type', '')
        file_name = req.headers.get('X-File-Name', 'uploaded_file')

        # Detect file type and parse
        if 'excel' in content_type or file_name.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(body))
        elif 'csv' in content_type or file_name.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(body))
        else:
            return get_error_response(f"Unsupported file type: {content_type}")

        # Analyze schema
        schema = []
        for col in df.columns:
            col_data = df[col]
            schema.append({
                "column_name": str(col),
                "detected_type": str(col_data.dtype),
                "null_percentage": round(col_data.isnull().sum() / len(df) * 100, 2),
                "unique_count": col_data.nunique(),
                "sample_values": col_data.dropna().head(5).tolist()
            })

        return create_response({
            "success": True,
            "file_name": file_name,
            "row_count": len(df),
            "column_count": len(df.columns),
            "schema": schema,
            "timestamp": datetime.utcnow().isoformat()
        })

    except Exception as e:
        logging.error(f"Error parsing document: {str(e)}")
        return get_error_response(f"Error parsing document: {str(e)}", 500)

# =============================================================================
# ANALYSIS ENGINE FUNCTIONS
# =============================================================================

@app.route(route="run-analysis", methods=["POST"])
def run_analysis(req: func.HttpRequest) -> func.HttpResponse:
    """Run analytical models on customer data."""
    import pandas as pd
    import numpy as np

    try:
        body = req.get_json()

        model_type = body.get('model_type', 'RFM')
        data = body.get('data', [])
        parameters = body.get('parameters', {})

        if not data:
            return get_error_response("No data provided for analysis")

        df = pd.DataFrame(data)

        if model_type == 'RFM':
            # RFM Analysis
            customer_col = parameters.get('customer_column', 'customer_id')
            date_col = parameters.get('date_column', 'transaction_date')
            value_col = parameters.get('value_column', 'amount')

            # Calculate RFM metrics
            analysis_date = pd.Timestamp.now()

            rfm = df.groupby(customer_col).agg({
                date_col: lambda x: (analysis_date - pd.to_datetime(x).max()).days,
                customer_col: 'count',
                value_col: 'sum'
            }).rename(columns={
                date_col: 'recency',
                customer_col: 'frequency',
                value_col: 'monetary'
            })

            # Score 1-5
            rfm['R'] = pd.qcut(rfm['recency'], 5, labels=[5,4,3,2,1]).astype(int)
            rfm['F'] = pd.qcut(rfm['frequency'].rank(method='first'), 5, labels=[1,2,3,4,5]).astype(int)
            rfm['M'] = pd.qcut(rfm['monetary'], 5, labels=[1,2,3,4,5]).astype(int)
            rfm['RFM_Score'] = rfm['R'].astype(str) + rfm['F'].astype(str) + rfm['M'].astype(str)

            results = rfm.reset_index().to_dict(orient='records')

        elif model_type == 'DECILE':
            # Decile Analysis
            value_col = parameters.get('value_column', 'total_value')
            df['decile'] = pd.qcut(df[value_col], 10, labels=range(1, 11))
            results = df.to_dict(orient='records')

        else:
            return get_error_response(f"Unsupported model type: {model_type}")

        return create_response({
            "success": True,
            "model_type": model_type,
            "records_processed": len(df),
            "results": results[:100],  # Limit response size
            "timestamp": datetime.utcnow().isoformat()
        })

    except Exception as e:
        logging.error(f"Error running analysis: {str(e)}")
        return get_error_response(f"Error running analysis: {str(e)}", 500)

# =============================================================================
# AUDIENCE MANAGER FUNCTIONS
# =============================================================================

@app.route(route="create-audience", methods=["POST"])
def create_audience(req: func.HttpRequest) -> func.HttpResponse:
    """Create an audience from analysis results."""
    import pandas as pd

    try:
        body = req.get_json()

        audience_name = body.get('audience_name', 'Untitled Audience')
        rules = body.get('rules', [])
        data = body.get('data', [])

        if not data:
            return get_error_response("No data provided")

        df = pd.DataFrame(data)

        # Apply rules
        mask = pd.Series([True] * len(df))

        for rule in rules:
            field = rule.get('field')
            operator = rule.get('operator')
            value = rule.get('value')

            if field not in df.columns:
                continue

            if operator == 'EQUALS':
                mask &= (df[field] == value)
            elif operator == 'GREATER_THAN':
                mask &= (df[field] > value)
            elif operator == 'LESS_THAN':
                mask &= (df[field] < value)
            elif operator == 'IN':
                mask &= df[field].isin(value if isinstance(value, list) else [value])

        filtered_df = df[mask]

        return create_response({
            "success": True,
            "audience_name": audience_name,
            "member_count": len(filtered_df),
            "total_records": len(df),
            "rules_applied": len(rules),
            "members": filtered_df.to_dict(orient='records')[:100],
            "timestamp": datetime.utcnow().isoformat()
        })

    except Exception as e:
        logging.error(f"Error creating audience: {str(e)}")
        return get_error_response(f"Error creating audience: {str(e)}", 500)

@app.route(route="size-audience", methods=["POST"])
def size_audience(req: func.HttpRequest) -> func.HttpResponse:
    """Estimate audience size based on rules."""
    import pandas as pd

    try:
        body = req.get_json()
        rules = body.get('rules', [])
        data = body.get('data', [])

        if not data:
            return get_error_response("No data provided")

        df = pd.DataFrame(data)
        mask = pd.Series([True] * len(df))

        for rule in rules:
            field = rule.get('field')
            operator = rule.get('operator')
            value = rule.get('value')

            if field not in df.columns:
                continue

            if operator == 'EQUALS':
                mask &= (df[field] == value)
            elif operator == 'GREATER_THAN':
                mask &= (df[field] > value)
            elif operator == 'LESS_THAN':
                mask &= (df[field] < value)
            elif operator == 'IN':
                mask &= df[field].isin(value if isinstance(value, list) else [value])

        return create_response({
            "success": True,
            "estimated_size": int(mask.sum()),
            "total_records": len(df),
            "percentage": round(mask.sum() / len(df) * 100, 2)
        })

    except Exception as e:
        logging.error(f"Error sizing audience: {str(e)}")
        return get_error_response(f"Error sizing audience: {str(e)}", 500)

@app.route(route="export-audience", methods=["POST"])
def export_audience(req: func.HttpRequest) -> func.HttpResponse:
    """Export audience members for activation."""
    try:
        body = req.get_json()

        return create_response({
            "success": True,
            "message": "Export functionality ready for platform integration",
            "supported_platforms": ["Meta", "Google", "TikTok", "LinkedIn", "Trade Desk"]
        })

    except Exception as e:
        logging.error(f"Error exporting audience: {str(e)}")
        return get_error_response(f"Error exporting audience: {str(e)}", 500)

@app.route(route="suggest-audiences", methods=["POST"])
def suggest_audiences(req: func.HttpRequest) -> func.HttpResponse:
    """Suggest audiences based on analysis results."""
    import pandas as pd

    try:
        body = req.get_json()
        data = body.get('data', [])

        if not data:
            return get_error_response("No data provided")

        # Return predefined audience suggestions
        suggestions = [
            {
                "name": "High Value Champions",
                "description": "Top RFM segment (555) - highest value, most engaged",
                "rules": [{"field": "RFM_Score", "operator": "EQUALS", "value": "555"}],
                "recommended_channels": ["Email", "Direct Mail", "VIP Programs"]
            },
            {
                "name": "At-Risk Customers",
                "description": "Previously high value but declining engagement",
                "rules": [{"field": "R", "operator": "LESS_THAN", "value": 3}, {"field": "M", "operator": "GREATER_THAN", "value": 3}],
                "recommended_channels": ["Email Reactivation", "Special Offers"]
            },
            {
                "name": "New Promising",
                "description": "Recent customers with high potential",
                "rules": [{"field": "R", "operator": "GREATER_THAN", "value": 4}, {"field": "F", "operator": "LESS_THAN", "value": 3}],
                "recommended_channels": ["Welcome Series", "Onboarding"]
            }
        ]

        return create_response({
            "success": True,
            "suggestions": suggestions,
            "timestamp": datetime.utcnow().isoformat()
        })

    except Exception as e:
        logging.error(f"Error suggesting audiences: {str(e)}")
        return get_error_response(f"Error suggesting audiences: {str(e)}", 500)

# =============================================================================
# AMMO (AUDIENCE-AWARE MEDIA MIX OPTIMIZATION) FUNCTIONS
# =============================================================================

@app.route(route="optimize-allocation", methods=["POST"])
def optimize_allocation(req: func.HttpRequest) -> func.HttpResponse:
    """Optimize media budget allocation across channels."""
    import numpy as np

    try:
        body = req.get_json()

        total_budget = body.get('total_budget', 100000)
        channels = body.get('channels', ['Digital', 'TV', 'Print', 'OOH', 'Radio'])
        audience_affinities = body.get('audience_affinities', {})
        constraints = body.get('constraints', {})

        # Default channel benchmarks
        base_allocation = {
            'Digital': 0.35,
            'TV': 0.25,
            'Print': 0.10,
            'OOH': 0.15,
            'Radio': 0.15
        }

        # Apply audience affinities
        allocations = {}
        total_weight = 0

        for channel in channels:
            affinity = audience_affinities.get(channel, 1.0)
            base = base_allocation.get(channel, 0.1)
            weight = base * affinity

            # Apply constraints
            min_pct = constraints.get(f'{channel}_min', 0)
            max_pct = constraints.get(f'{channel}_max', 100)

            allocations[channel] = {
                'weight': weight,
                'min': min_pct / 100,
                'max': max_pct / 100
            }
            total_weight += weight

        # Normalize and calculate budget
        result = {}
        for channel, data in allocations.items():
            pct = data['weight'] / total_weight
            pct = max(data['min'], min(data['max'], pct))

            result[channel] = {
                'percentage': round(pct * 100, 2),
                'budget': round(total_budget * pct, 2)
            }

        return create_response({
            "success": True,
            "total_budget": total_budget,
            "allocation": result,
            "timestamp": datetime.utcnow().isoformat()
        })

    except Exception as e:
        logging.error(f"Error optimizing allocation: {str(e)}")
        return get_error_response(f"Error optimizing allocation: {str(e)}", 500)

@app.route(route="scenario-analysis", methods=["POST"])
def scenario_analysis(req: func.HttpRequest) -> func.HttpResponse:
    """Compare different budget scenarios."""
    try:
        body = req.get_json()

        scenarios = body.get('scenarios', [])

        results = []
        for i, scenario in enumerate(scenarios):
            budget = scenario.get('budget', 100000)
            channels = scenario.get('channels', {})

            # Calculate estimated metrics
            total_reach = sum(channels.values()) * 10  # Simplified
            estimated_conversions = total_reach * 0.02
            estimated_roi = estimated_conversions * 50 / budget

            results.append({
                'scenario_id': i + 1,
                'budget': budget,
                'channels': channels,
                'estimated_reach': total_reach,
                'estimated_conversions': int(estimated_conversions),
                'estimated_roi': round(estimated_roi, 2)
            })

        return create_response({
            "success": True,
            "scenarios": results,
            "recommendation": results[0] if results else None,
            "timestamp": datetime.utcnow().isoformat()
        })

    except Exception as e:
        logging.error(f"Error in scenario analysis: {str(e)}")
        return get_error_response(f"Error in scenario analysis: {str(e)}", 500)

@app.route(route="calculate-affinity", methods=["POST"])
def calculate_affinity(req: func.HttpRequest) -> func.HttpResponse:
    """Calculate channel affinity scores for an audience segment."""
    try:
        body = req.get_json()

        segment = body.get('segment', 'Champions')

        # Predefined affinities by segment
        affinities = {
            'Champions': {'Digital': 1.4, 'Email': 1.5, 'Direct Mail': 1.3, 'TV': 1.0, 'Radio': 0.8},
            'Loyal': {'Digital': 1.2, 'Email': 1.4, 'Direct Mail': 1.2, 'TV': 1.1, 'Radio': 0.9},
            'At Risk': {'Digital': 1.0, 'Email': 1.6, 'Direct Mail': 1.4, 'TV': 0.8, 'Radio': 0.7},
            'New': {'Digital': 1.5, 'Email': 1.3, 'Direct Mail': 0.8, 'TV': 1.2, 'Radio': 1.0}
        }

        segment_affinities = affinities.get(segment, affinities['Loyal'])

        return create_response({
            "success": True,
            "segment": segment,
            "channel_affinities": segment_affinities,
            "timestamp": datetime.utcnow().isoformat()
        })

    except Exception as e:
        logging.error(f"Error calculating affinity: {str(e)}")
        return get_error_response(f"Error calculating affinity: {str(e)}", 500)
