# ADIS Audience Manager Azure Function
# Version: 1.0
# Purpose: Manage audience definitions, rules, sizing, and export

import azure.functions as func
import logging
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
import hashlib
import pandas as pd
import numpy as np

app = func.FunctionApp()

# =============================================================================
# CONFIGURATION
# =============================================================================

# Channel affinity defaults by segment type
CHANNEL_AFFINITY = {
    'Champions': {
        'recommended': ['Email', 'Loyalty Program', 'Premium Display', 'Direct Mail'],
        'avoid': ['Mass Broadcast'],
        'rationale': 'High-value customers respond best to personalized, premium channels'
    },
    'Loyal Customers': {
        'recommended': ['Email', 'Social Media', 'CTV', 'Programmatic Display'],
        'avoid': [],
        'rationale': 'Engaged customers respond across digital channels'
    },
    'Potential Loyalists': {
        'recommended': ['Email', 'Social Media', 'Retargeting', 'Paid Search'],
        'avoid': [],
        'rationale': 'Nurture with consistent multi-channel presence'
    },
    'New Customers': {
        'recommended': ['Welcome Email', 'Onboarding Sequences', 'Social Media'],
        'avoid': ['Aggressive Upsell'],
        'rationale': 'Focus on education and relationship building'
    },
    'At Risk': {
        'recommended': ['Win-back Email', 'Special Offers', 'Retargeting'],
        'avoid': ['Generic Broadcast'],
        'rationale': 'Personalized reactivation campaigns'
    },
    "Can't Lose Them": {
        'recommended': ['High-Touch Outreach', 'VIP Offers', 'Direct Mail', 'Phone'],
        'avoid': ['Generic Communication'],
        'rationale': 'Premium treatment to prevent high-value churn'
    },
    'Hibernating': {
        'recommended': ['Reactivation Email', 'Discount Offers', 'Paid Social'],
        'avoid': ['High Frequency'],
        'rationale': 'Low-cost reactivation attempts'
    },
    'Lost': {
        'recommended': ['Suppression List', 'Occasional Win-back'],
        'avoid': ['Active Campaigns'],
        'rationale': 'Minimize spend, occasional low-cost win-back'
    }
}

# Use case templates
USE_CASE_TEMPLATES = {
    'RETENTION': {
        'name': 'Retention Campaign',
        'description': 'Reduce churn among at-risk customers',
        'target_segments': ['At Risk', "Can't Lose Them", 'Hibernating'],
        'recommended_channels': ['Email', 'Retargeting', 'Direct Mail'],
        'kpis': ['Retention Rate', 'CLV Preservation', 'Reactivation Rate']
    },
    'ACQUISITION': {
        'name': 'Customer Acquisition',
        'description': 'Find new customers similar to best existing customers',
        'target_segments': ['Lookalike of Champions'],
        'recommended_channels': ['Paid Social', 'Paid Search', 'Programmatic Display'],
        'kpis': ['CAC', 'New Customer Volume', 'First Purchase Rate']
    },
    'UPSELL': {
        'name': 'Upsell/Cross-sell',
        'description': 'Increase value from existing customers',
        'target_segments': ['Loyal Customers', 'Potential Loyalists'],
        'recommended_channels': ['Email', 'On-site Personalization', 'Retargeting'],
        'kpis': ['AOV Lift', 'Items Per Order', 'Category Penetration']
    },
    'LOYALTY_PROGRAM': {
        'name': 'Loyalty Program Promotion',
        'description': 'Drive engagement with loyalty program',
        'target_segments': ['New Customers', 'Potential Loyalists', 'Loyal Customers'],
        'recommended_channels': ['Email', 'In-App', 'SMS'],
        'kpis': ['Enrollment Rate', 'Point Redemption', 'Member Retention']
    },
    'SEASONAL': {
        'name': 'Seasonal Campaign',
        'description': 'Maximize seasonal sales opportunity',
        'target_segments': ['Champions', 'Loyal Customers', 'Potential Loyalists'],
        'recommended_channels': ['Email', 'Paid Social', 'CTV', 'Display'],
        'kpis': ['Revenue Lift', 'Conversion Rate', 'ROAS']
    },
    'REACTIVATION': {
        'name': 'Customer Reactivation',
        'description': 'Bring back lapsed customers',
        'target_segments': ['Hibernating', 'Lost', 'At Risk'],
        'recommended_channels': ['Email', 'Direct Mail', 'Retargeting'],
        'kpis': ['Reactivation Rate', 'Time to Reactivate', 'Reactivation CLV']
    }
}


# =============================================================================
# MAIN ENDPOINTS
# =============================================================================

@app.route(route="create-audience", methods=["POST"])
async def create_audience(req: func.HttpRequest) -> func.HttpResponse:
    """
    Create a new audience from model outputs with optional rules.
    """
    logging.info('ADIS Audience Manager: Creating audience')
    
    try:
        body = req.get_json()
        
        audience_name = body.get('audience_name', f'Audience_{datetime.utcnow().strftime("%Y%m%d%H%M%S")}')
        description = body.get('description', '')
        source_type = body.get('source_type', 'MODEL_OUTPUT')  # MODEL_OUTPUT, CUSTOM_RULES, IMPORT
        
        # Source data
        model_outputs = body.get('model_outputs', [])  # From analysis engine
        rules = body.get('rules', [])  # Custom filtering rules
        
        # Apply rules to filter outputs
        filtered_members = apply_audience_rules(model_outputs, rules)
        
        # Calculate audience metrics
        metrics = calculate_audience_metrics(filtered_members)
        
        # Determine recommended channels and use cases
        segment_names = [m.get('segment_name', '') for m in filtered_members]
        dominant_segment = max(set(segment_names), key=segment_names.count) if segment_names else 'Unknown'
        
        channel_recommendation = CHANNEL_AFFINITY.get(dominant_segment, {
            'recommended': ['Email', 'Programmatic Display'],
            'avoid': [],
            'rationale': 'Default recommendation for mixed audience'
        })
        
        # Suggest use cases based on segment composition
        suggested_use_cases = suggest_use_cases(filtered_members)
        
        # Generate audience ID
        audience_id = hashlib.md5(f'{audience_name}_{datetime.utcnow().isoformat()}'.encode()).hexdigest()
        
        response = {
            'audience_id': audience_id,
            'audience_name': audience_name,
            'description': description,
            'status': 'DRAFT',
            'created_date': datetime.utcnow().isoformat(),
            'member_count': len(filtered_members),
            'total_value': metrics['total_value'],
            'avg_ltv': metrics['avg_ltv'],
            'audience_type': determine_audience_type(filtered_members),
            'dominant_segment': dominant_segment,
            'segment_composition': metrics['segment_composition'],
            'recommended_channels': channel_recommendation,
            'suggested_use_cases': suggested_use_cases,
            'rules_applied': rules,
            'members': filtered_members[:1000]  # Return first 1000 for preview
        }
        
        return func.HttpResponse(
            json.dumps(response, default=str),
            status_code=200,
            mimetype='application/json'
        )
        
    except Exception as e:
        logging.error(f'Create audience error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': str(e)}),
            status_code=500,
            mimetype='application/json'
        )


@app.route(route="size-audience", methods=["POST"])
async def size_audience(req: func.HttpRequest) -> func.HttpResponse:
    """
    Calculate audience size and value without creating.
    Used for preview before committing.
    """
    logging.info('ADIS Audience Manager: Sizing audience')
    
    try:
        body = req.get_json()
        
        model_outputs = body.get('model_outputs', [])
        rules = body.get('rules', [])
        
        # Apply rules
        filtered = apply_audience_rules(model_outputs, rules)
        metrics = calculate_audience_metrics(filtered)
        
        # Calculate reach by channel (estimates)
        channel_reach = estimate_channel_reach(len(filtered), metrics)
        
        return func.HttpResponse(
            json.dumps({
                'estimated_size': len(filtered),
                'total_value': metrics['total_value'],
                'avg_ltv': metrics['avg_ltv'],
                'segment_composition': metrics['segment_composition'],
                'value_concentration': metrics['value_concentration'],
                'channel_reach_estimates': channel_reach,
                'rules_applied': len(rules)
            }, default=str),
            status_code=200,
            mimetype='application/json'
        )
        
    except Exception as e:
        logging.error(f'Size audience error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': str(e)}),
            status_code=500,
            mimetype='application/json'
        )


@app.route(route="export-audience", methods=["POST"])
async def export_audience(req: func.HttpRequest) -> func.HttpResponse:
    """
    Export audience for platform activation.
    Generates platform-specific formats.
    """
    logging.info('ADIS Audience Manager: Exporting audience')
    
    try:
        body = req.get_json()
        
        audience_id = body.get('audience_id')
        members = body.get('members', [])
        export_format = body.get('format', 'CSV')  # CSV, GOOGLE_ADS, META, TTD
        include_pii = body.get('include_pii', False)
        hash_method = body.get('hash_method', 'SHA256')  # SHA256, MD5, NONE
        
        if not members:
            return func.HttpResponse(
                json.dumps({'error': 'No members to export'}),
                status_code=400,
                mimetype='application/json'
            )
        
        # Generate export based on format
        if export_format == 'CSV':
            export_data = generate_csv_export(members, include_pii, hash_method)
        elif export_format == 'GOOGLE_ADS':
            export_data = generate_google_ads_export(members, hash_method)
        elif export_format == 'META':
            export_data = generate_meta_export(members, hash_method)
        elif export_format == 'TTD':
            export_data = generate_ttd_export(members, hash_method)
        else:
            export_data = generate_csv_export(members, include_pii, hash_method)
        
        return func.HttpResponse(
            json.dumps({
                'audience_id': audience_id,
                'export_format': export_format,
                'member_count': len(members),
                'export_timestamp': datetime.utcnow().isoformat(),
                'data': export_data[:100],  # Preview first 100
                'full_data_base64': None  # Would contain base64 encoded full file
            }, default=str),
            status_code=200,
            mimetype='application/json'
        )
        
    except Exception as e:
        logging.error(f'Export audience error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': str(e)}),
            status_code=500,
            mimetype='application/json'
        )


@app.route(route="suggest-audiences", methods=["POST"])
async def suggest_audiences(req: func.HttpRequest) -> func.HttpResponse:
    """
    Analyze model outputs and suggest optimal audiences for various use cases.
    """
    logging.info('ADIS Audience Manager: Suggesting audiences')
    
    try:
        body = req.get_json()
        
        model_outputs = body.get('model_outputs', [])
        user_objective = body.get('objective', '')  # Optional user-provided objective
        budget = body.get('budget', None)
        
        suggestions = []
        
        # Always suggest based on standard use cases
        for use_case_key, template in USE_CASE_TEMPLATES.items():
            # Find matching segments in data
            matching_members = [
                m for m in model_outputs 
                if any(seg in m.get('segment_name', '') for seg in template['target_segments'])
            ]
            
            if matching_members:
                metrics = calculate_audience_metrics(matching_members)
                
                # Calculate expected performance
                expected_performance = estimate_use_case_performance(
                    use_case_key, 
                    len(matching_members), 
                    metrics
                )
                
                suggestions.append({
                    'use_case': use_case_key,
                    'name': template['name'],
                    'description': template['description'],
                    'audience_size': len(matching_members),
                    'total_value': metrics['total_value'],
                    'avg_ltv': metrics['avg_ltv'],
                    'target_segments': template['target_segments'],
                    'recommended_channels': template['recommended_channels'],
                    'kpis': template['kpis'],
                    'expected_performance': expected_performance,
                    'priority_score': calculate_priority_score(use_case_key, metrics, budget)
                })
        
        # Sort by priority score
        suggestions.sort(key=lambda x: x['priority_score'], reverse=True)
        
        # If user provided objective, highlight most relevant
        if user_objective:
            suggestions = rerank_by_objective(suggestions, user_objective)
        
        return func.HttpResponse(
            json.dumps({
                'suggestions': suggestions,
                'total_customers': len(set(m.get('customer_key') for m in model_outputs)),
                'analysis_timestamp': datetime.utcnow().isoformat()
            }, default=str),
            status_code=200,
            mimetype='application/json'
        )
        
    except Exception as e:
        logging.error(f'Suggest audiences error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': str(e)}),
            status_code=500,
            mimetype='application/json'
        )


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def apply_audience_rules(outputs: List[Dict], rules: List[Dict]) -> List[Dict]:
    """Apply filtering rules to model outputs."""
    if not rules:
        return outputs
    
    df = pd.DataFrame(outputs)
    
    for rule in rules:
        field = rule.get('field_name')
        operator = rule.get('operator')
        value = rule.get('value')
        
        if field not in df.columns:
            continue
        
        if operator == 'EQUALS':
            df = df[df[field] == value]
        elif operator == 'NOT_EQUALS':
            df = df[df[field] != value]
        elif operator == 'GREATER_THAN':
            df = df[df[field] > float(value)]
        elif operator == 'GREATER_THAN_OR_EQUAL':
            df = df[df[field] >= float(value)]
        elif operator == 'LESS_THAN':
            df = df[df[field] < float(value)]
        elif operator == 'LESS_THAN_OR_EQUAL':
            df = df[df[field] <= float(value)]
        elif operator == 'IN':
            values = value if isinstance(value, list) else [value]
            df = df[df[field].isin(values)]
        elif operator == 'NOT_IN':
            values = value if isinstance(value, list) else [value]
            df = df[~df[field].isin(values)]
        elif operator == 'BETWEEN':
            if isinstance(value, list) and len(value) == 2:
                df = df[(df[field] >= float(value[0])) & (df[field] <= float(value[1]))]
        elif operator == 'CONTAINS':
            df = df[df[field].astype(str).str.contains(str(value), case=False, na=False)]
    
    return df.to_dict(orient='records')


def calculate_audience_metrics(members: List[Dict]) -> Dict[str, Any]:
    """Calculate summary metrics for an audience."""
    if not members:
        return {
            'total_value': 0,
            'avg_ltv': 0,
            'segment_composition': {},
            'value_concentration': {}
        }
    
    df = pd.DataFrame(members)
    
    # Total and average value
    value_col = None
    for col in ['predicted_ltv', 'monetary', 'total_value']:
        if col in df.columns:
            value_col = col
            break
    
    total_value = float(df[value_col].sum()) if value_col else 0
    avg_ltv = float(df[value_col].mean()) if value_col else 0
    
    # Segment composition
    segment_composition = {}
    if 'segment_name' in df.columns:
        segment_counts = df['segment_name'].value_counts()
        for seg, count in segment_counts.items():
            segment_composition[seg] = {
                'count': int(count),
                'percentage': round(count / len(df) * 100, 2)
            }
            if value_col:
                seg_value = float(df[df['segment_name'] == seg][value_col].sum())
                segment_composition[seg]['value'] = seg_value
                segment_composition[seg]['value_percentage'] = round(seg_value / total_value * 100, 2) if total_value > 0 else 0
    
    # Value concentration (top 20% of customers)
    value_concentration = {}
    if value_col and len(df) >= 5:
        top_20_pct = int(len(df) * 0.2)
        top_customers = df.nlargest(top_20_pct, value_col)
        value_concentration['top_20_pct_customers'] = {
            'customer_count': top_20_pct,
            'value': float(top_customers[value_col].sum()),
            'value_percentage': round(top_customers[value_col].sum() / total_value * 100, 2) if total_value > 0 else 0
        }
    
    return {
        'total_value': total_value,
        'avg_ltv': avg_ltv,
        'segment_composition': segment_composition,
        'value_concentration': value_concentration
    }


def determine_audience_type(members: List[Dict]) -> str:
    """Determine audience type based on member characteristics."""
    if not members:
        return 'Custom Rule'
    
    first = members[0]
    
    if 'rfm_combined' in first:
        return 'RFM Segment'
    elif 'cluster_id' in first:
        return 'Behavioral Cluster'
    elif 'propensity_score' in first:
        return 'Propensity Based'
    elif 'decile' in first:
        return 'Value Tier'
    else:
        return 'Custom Rule'


def suggest_use_cases(members: List[Dict]) -> List[Dict]:
    """Suggest marketing use cases based on audience composition."""
    suggestions = []
    
    if not members:
        return suggestions
    
    df = pd.DataFrame(members)
    
    # Check for specific segment patterns
    if 'segment_name' in df.columns:
        segments = df['segment_name'].unique()
        
        # At-risk segments → Retention
        at_risk_segments = ['At Risk', "Can't Lose Them", 'Hibernating']
        if any(seg in segments for seg in at_risk_segments):
            suggestions.append({
                'use_case': 'RETENTION',
                'rationale': 'Audience contains at-risk segments that need retention focus',
                'priority': 'HIGH'
            })
        
        # High-value segments → Upsell
        high_value_segments = ['Champions', 'Loyal Customers']
        if any(seg in segments for seg in high_value_segments):
            suggestions.append({
                'use_case': 'UPSELL',
                'rationale': 'High-value customers present opportunity for increased wallet share',
                'priority': 'MEDIUM'
            })
        
        # New customers → Onboarding
        if 'New Customers' in segments:
            suggestions.append({
                'use_case': 'LOYALTY_PROGRAM',
                'rationale': 'New customers should be enrolled in loyalty program',
                'priority': 'MEDIUM'
            })
    
    # Check for propensity scores
    if 'propensity_score' in df.columns:
        high_propensity = df[df['propensity_score'] > 0.7]
        if len(high_propensity) > 0:
            suggestions.append({
                'use_case': 'SEASONAL',
                'rationale': f'{len(high_propensity)} customers with high purchase propensity',
                'priority': 'HIGH'
            })
    
    return suggestions


def estimate_channel_reach(audience_size: int, metrics: Dict) -> Dict[str, Any]:
    """Estimate reach across different channels."""
    # These are rough estimates based on typical match rates
    return {
        'email': {
            'estimated_reach': int(audience_size * 0.95),  # 95% email deliverability
            'match_rate': 0.95
        },
        'paid_social': {
            'estimated_reach': int(audience_size * 0.65),  # 65% social match rate
            'match_rate': 0.65
        },
        'programmatic': {
            'estimated_reach': int(audience_size * 0.50),  # 50% programmatic match
            'match_rate': 0.50
        },
        'google_ads': {
            'estimated_reach': int(audience_size * 0.55),  # 55% Google match rate
            'match_rate': 0.55
        },
        'direct_mail': {
            'estimated_reach': int(audience_size * 0.80),  # 80% address match
            'match_rate': 0.80
        }
    }


def estimate_use_case_performance(use_case: str, size: int, metrics: Dict) -> Dict[str, Any]:
    """Estimate expected performance for a use case."""
    # Default benchmarks by use case
    benchmarks = {
        'RETENTION': {'response_rate': 0.08, 'revenue_lift': 0.15},
        'ACQUISITION': {'response_rate': 0.02, 'cac_improvement': 0.25},
        'UPSELL': {'response_rate': 0.12, 'aov_lift': 0.20},
        'LOYALTY_PROGRAM': {'response_rate': 0.15, 'enrollment_rate': 0.25},
        'SEASONAL': {'response_rate': 0.10, 'revenue_lift': 0.30},
        'REACTIVATION': {'response_rate': 0.05, 'reactivation_rate': 0.08}
    }
    
    benchmark = benchmarks.get(use_case, {'response_rate': 0.05})
    
    return {
        'expected_responses': int(size * benchmark.get('response_rate', 0.05)),
        'expected_response_rate': benchmark.get('response_rate', 0.05),
        'expected_revenue_impact': metrics['total_value'] * benchmark.get('revenue_lift', 0.10),
        'confidence': 'MEDIUM'
    }


def calculate_priority_score(use_case: str, metrics: Dict, budget: Optional[float]) -> float:
    """Calculate priority score for ranking use cases."""
    base_score = 50
    
    # Boost for high value audiences
    if metrics['total_value'] > 100000:
        base_score += 20
    elif metrics['total_value'] > 50000:
        base_score += 10
    
    # Use case specific adjustments
    use_case_weights = {
        'RETENTION': 1.2,  # Retention is usually high priority
        'ACQUISITION': 1.0,
        'UPSELL': 1.1,
        'REACTIVATION': 0.9,
        'SEASONAL': 1.0,
        'LOYALTY_PROGRAM': 0.95
    }
    
    return base_score * use_case_weights.get(use_case, 1.0)


def rerank_by_objective(suggestions: List[Dict], objective: str) -> List[Dict]:
    """Rerank suggestions based on user-provided objective."""
    objective_lower = objective.lower()
    
    # Map keywords to use cases
    keyword_mapping = {
        'retain': 'RETENTION',
        'churn': 'RETENTION',
        'keep': 'RETENTION',
        'new customer': 'ACQUISITION',
        'acquire': 'ACQUISITION',
        'grow': 'ACQUISITION',
        'upsell': 'UPSELL',
        'cross-sell': 'UPSELL',
        'increase aov': 'UPSELL',
        'loyalty': 'LOYALTY_PROGRAM',
        'member': 'LOYALTY_PROGRAM',
        'seasonal': 'SEASONAL',
        'holiday': 'SEASONAL',
        'reactivate': 'REACTIVATION',
        'win back': 'REACTIVATION',
        'lapsed': 'REACTIVATION'
    }
    
    # Find matching use case
    matched_use_case = None
    for keyword, use_case in keyword_mapping.items():
        if keyword in objective_lower:
            matched_use_case = use_case
            break
    
    if matched_use_case:
        # Move matched use case to top
        for i, suggestion in enumerate(suggestions):
            if suggestion['use_case'] == matched_use_case:
                suggestions.insert(0, suggestions.pop(i))
                suggestions[0]['matched_objective'] = True
                break
    
    return suggestions


# =============================================================================
# EXPORT GENERATORS
# =============================================================================

def generate_csv_export(members: List[Dict], include_pii: bool, hash_method: str) -> List[Dict]:
    """Generate CSV format export."""
    export_data = []
    
    for member in members:
        row = {
            'customer_key': member.get('customer_key', ''),
            'segment': member.get('segment_name', ''),
            'segment_code': member.get('segment_code', ''),
        }
        
        if include_pii:
            row['email'] = member.get('email', '')
            row['phone'] = member.get('phone', '')
        
        # Add scores
        for score_field in ['predicted_ltv', 'propensity_score', 'decile', 'percentile']:
            if score_field in member:
                row[score_field] = member[score_field]
        
        export_data.append(row)
    
    return export_data


def generate_google_ads_export(members: List[Dict], hash_method: str) -> List[Dict]:
    """Generate Google Ads Customer Match format."""
    export_data = []
    
    for member in members:
        row = {}
        
        # Hash email if present
        if 'email' in member and member['email']:
            email = member['email'].lower().strip()
            if hash_method == 'SHA256':
                row['Email'] = hashlib.sha256(email.encode()).hexdigest()
            else:
                row['Email'] = email
        
        # Hash phone if present
        if 'phone' in member and member['phone']:
            phone = ''.join(filter(str.isdigit, str(member['phone'])))
            if hash_method == 'SHA256':
                row['Phone'] = hashlib.sha256(phone.encode()).hexdigest()
            else:
                row['Phone'] = phone
        
        if row:
            export_data.append(row)
    
    return export_data


def generate_meta_export(members: List[Dict], hash_method: str) -> List[Dict]:
    """Generate Meta (Facebook) Custom Audience format."""
    export_data = []
    
    for member in members:
        row = {}
        
        if 'email' in member and member['email']:
            email = member['email'].lower().strip()
            if hash_method == 'SHA256':
                row['email'] = hashlib.sha256(email.encode()).hexdigest()
            else:
                row['email'] = email
        
        if 'phone' in member and member['phone']:
            phone = ''.join(filter(str.isdigit, str(member['phone'])))
            if hash_method == 'SHA256':
                row['phone'] = hashlib.sha256(phone.encode()).hexdigest()
            else:
                row['phone'] = phone
        
        if row:
            export_data.append(row)
    
    return export_data


def generate_ttd_export(members: List[Dict], hash_method: str) -> List[Dict]:
    """Generate The Trade Desk format."""
    export_data = []
    
    for member in members:
        row = {
            'TDID': member.get('customer_key', '')  # Would need actual TDID mapping
        }
        
        if 'email' in member and member['email']:
            email = member['email'].lower().strip()
            if hash_method == 'SHA256':
                row['HashedEmail'] = hashlib.sha256(email.encode()).hexdigest()
            else:
                row['Email'] = email
        
        export_data.append(row)
    
    return export_data


# =============================================================================
# HEALTH CHECK
# =============================================================================

@app.route(route="health", methods=["GET"])
def health_check(req: func.HttpRequest) -> func.HttpResponse:
    """Health check endpoint."""
    return func.HttpResponse(
        json.dumps({
            'status': 'healthy',
            'service': 'ADIS Audience Manager',
            'version': '1.0',
            'timestamp': datetime.utcnow().isoformat(),
            'capabilities': ['create', 'size', 'export', 'suggest'],
            'export_formats': ['CSV', 'GOOGLE_ADS', 'META', 'TTD']
        }),
        status_code=200,
        mimetype='application/json'
    )
