# AMMO - Audience-Aware Media Mix Optimization Framework
# Version: 1.0
# Purpose: Connect ADIS audience segments to media planning with budget optimization

import azure.functions as func
import logging
import json
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
import numpy as np
import pandas as pd
from dataclasses import dataclass, asdict, field
from scipy.optimize import minimize

app = func.FunctionApp()

# =============================================================================
# CONFIGURATION
# =============================================================================

# Channel effectiveness by audience segment (index values, 1.0 = baseline)
# These are informed by industry research and Analytics_Engine_v5_1.txt
CHANNEL_AUDIENCE_AFFINITY = {
    'Champions': {
        'Email': 1.4,
        'Paid Search': 0.9,
        'Paid Social': 1.2,
        'Programmatic Display': 1.1,
        'CTV': 1.3,
        'Linear TV': 0.8,
        'Direct Mail': 1.5,
        'OOH': 0.7
    },
    'Loyal Customers': {
        'Email': 1.3,
        'Paid Search': 1.0,
        'Paid Social': 1.2,
        'Programmatic Display': 1.1,
        'CTV': 1.2,
        'Linear TV': 0.9,
        'Direct Mail': 1.2,
        'OOH': 0.8
    },
    'Potential Loyalists': {
        'Email': 1.2,
        'Paid Search': 1.1,
        'Paid Social': 1.3,
        'Programmatic Display': 1.2,
        'CTV': 1.1,
        'Linear TV': 1.0,
        'Direct Mail': 1.0,
        'OOH': 0.9
    },
    'New Customers': {
        'Email': 1.1,
        'Paid Search': 1.3,
        'Paid Social': 1.4,
        'Programmatic Display': 1.2,
        'CTV': 1.0,
        'Linear TV': 1.1,
        'Direct Mail': 0.8,
        'OOH': 1.0
    },
    'At Risk': {
        'Email': 1.5,
        'Paid Search': 0.8,
        'Paid Social': 1.1,
        'Programmatic Display': 1.3,
        'CTV': 0.9,
        'Linear TV': 0.7,
        'Direct Mail': 1.4,
        'OOH': 0.6
    },
    "Can't Lose Them": {
        'Email': 1.6,
        'Paid Search': 0.7,
        'Paid Social': 1.0,
        'Programmatic Display': 1.2,
        'CTV': 1.1,
        'Linear TV': 0.8,
        'Direct Mail': 1.6,
        'OOH': 0.7
    },
    'Hibernating': {
        'Email': 1.2,
        'Paid Search': 0.6,
        'Paid Social': 1.0,
        'Programmatic Display': 1.1,
        'CTV': 0.8,
        'Linear TV': 0.7,
        'Direct Mail': 1.1,
        'OOH': 0.6
    },
    'Lost': {
        'Email': 0.8,
        'Paid Search': 0.5,
        'Paid Social': 0.7,
        'Programmatic Display': 0.8,
        'CTV': 0.6,
        'Linear TV': 0.5,
        'Direct Mail': 0.7,
        'OOH': 0.5
    },
    'Default': {
        'Email': 1.0,
        'Paid Search': 1.0,
        'Paid Social': 1.0,
        'Programmatic Display': 1.0,
        'CTV': 1.0,
        'Linear TV': 1.0,
        'Direct Mail': 1.0,
        'OOH': 1.0
    }
}

# Channel baseline CPMs and response rates
CHANNEL_BENCHMARKS = {
    'Email': {'cpm': 0.50, 'base_response_rate': 0.02, 'decay_rate': 0.1},
    'Paid Search': {'cpm': 25.00, 'base_response_rate': 0.035, 'decay_rate': 0.05},
    'Paid Social': {'cpm': 12.00, 'base_response_rate': 0.012, 'decay_rate': 0.4},
    'Programmatic Display': {'cpm': 3.50, 'base_response_rate': 0.001, 'decay_rate': 0.2},
    'CTV': {'cpm': 35.00, 'base_response_rate': 0.008, 'decay_rate': 0.6},
    'Linear TV': {'cpm': 15.00, 'base_response_rate': 0.005, 'decay_rate': 0.7},
    'Direct Mail': {'cpm': 500.00, 'base_response_rate': 0.025, 'decay_rate': 0.3},
    'OOH': {'cpm': 5.00, 'base_response_rate': 0.002, 'decay_rate': 0.4}
}


# =============================================================================
# DATA CLASSES
# =============================================================================

@dataclass
class AudienceSegment:
    segment_name: str
    member_count: int
    total_value: float
    avg_ltv: float
    channel_affinity: Dict[str, float] = field(default_factory=dict)


@dataclass
class ChannelAllocation:
    channel: str
    budget: float
    impressions: int
    expected_conversions: float
    expected_revenue: float
    expected_roi: float
    audience_allocations: Dict[str, float] = field(default_factory=dict)


@dataclass
class OptimizationResult:
    status: str
    total_budget: float
    expected_revenue: float
    expected_roi: float
    allocations: List[ChannelAllocation]
    vs_current: Optional[Dict[str, Any]] = None


# =============================================================================
# MAIN ENDPOINTS
# =============================================================================

@app.route(route="optimize-allocation", methods=["POST"])
async def optimize_allocation(req: func.HttpRequest) -> func.HttpResponse:
    """
    Optimize budget allocation across channels and audiences.
    Uses audience affinity scores to improve allocation efficiency.
    """
    logging.info('AMMO: Running budget optimization')
    
    try:
        body = req.get_json()
        
        # Inputs
        total_budget = body.get('total_budget', 100000)
        audiences = body.get('audiences', [])  # List of AudienceSegment dicts
        channels = body.get('channels', list(CHANNEL_BENCHMARKS.keys()))
        current_allocation = body.get('current_allocation', None)  # Optional comparison
        constraints = body.get('constraints', {})  # Min/max by channel
        objective = body.get('objective', 'ROI')  # ROI, REVENUE, CONVERSIONS
        
        if not audiences:
            return func.HttpResponse(
                json.dumps({'error': 'No audiences provided'}),
                status_code=400,
                mimetype='application/json'
            )
        
        # Convert audiences to AudienceSegment objects
        audience_segments = []
        for aud in audiences:
            segment = AudienceSegment(
                segment_name=aud.get('segment_name', 'Default'),
                member_count=aud.get('member_count', 1000),
                total_value=aud.get('total_value', 0),
                avg_ltv=aud.get('avg_ltv', 0),
                channel_affinity=CHANNEL_AUDIENCE_AFFINITY.get(
                    aud.get('segment_name', 'Default'),
                    CHANNEL_AUDIENCE_AFFINITY['Default']
                )
            )
            audience_segments.append(segment)
        
        # Run optimization
        result = run_budget_optimization(
            total_budget=total_budget,
            audiences=audience_segments,
            channels=channels,
            constraints=constraints,
            objective=objective
        )
        
        # Compare to current if provided
        if current_allocation:
            result['comparison'] = compare_to_current(result, current_allocation, audience_segments)
        
        return func.HttpResponse(
            json.dumps(result, default=str),
            status_code=200,
            mimetype='application/json'
        )
        
    except Exception as e:
        logging.error(f'AMMO optimization error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': str(e)}),
            status_code=500,
            mimetype='application/json'
        )


@app.route(route="scenario-analysis", methods=["POST"])
async def scenario_analysis(req: func.HttpRequest) -> func.HttpResponse:
    """
    Run multiple budget scenarios and compare outcomes.
    """
    logging.info('AMMO: Running scenario analysis')
    
    try:
        body = req.get_json()
        
        audiences = body.get('audiences', [])
        channels = body.get('channels', list(CHANNEL_BENCHMARKS.keys()))
        scenarios = body.get('scenarios', [])  # List of {name, budget, constraints}
        
        if not scenarios:
            # Generate default scenarios
            base_budget = body.get('base_budget', 100000)
            scenarios = [
                {'name': 'Conservative', 'budget': base_budget * 0.7},
                {'name': 'Moderate', 'budget': base_budget},
                {'name': 'Aggressive', 'budget': base_budget * 1.3}
            ]
        
        # Convert audiences
        audience_segments = []
        for aud in audiences:
            segment = AudienceSegment(
                segment_name=aud.get('segment_name', 'Default'),
                member_count=aud.get('member_count', 1000),
                total_value=aud.get('total_value', 0),
                avg_ltv=aud.get('avg_ltv', 0),
                channel_affinity=CHANNEL_AUDIENCE_AFFINITY.get(
                    aud.get('segment_name', 'Default'),
                    CHANNEL_AUDIENCE_AFFINITY['Default']
                )
            )
            audience_segments.append(segment)
        
        # Run each scenario
        results = []
        for scenario in scenarios:
            result = run_budget_optimization(
                total_budget=scenario['budget'],
                audiences=audience_segments,
                channels=channels,
                constraints=scenario.get('constraints', {}),
                objective=scenario.get('objective', 'ROI')
            )
            result['scenario_name'] = scenario['name']
            result['scenario_budget'] = scenario['budget']
            results.append(result)
        
        # Calculate deltas between scenarios
        scenario_comparison = compare_scenarios(results)
        
        return func.HttpResponse(
            json.dumps({
                'scenarios': results,
                'comparison': scenario_comparison,
                'recommendation': recommend_scenario(results)
            }, default=str),
            status_code=200,
            mimetype='application/json'
        )
        
    except Exception as e:
        logging.error(f'AMMO scenario analysis error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': str(e)}),
            status_code=500,
            mimetype='application/json'
        )


@app.route(route="calculate-affinity", methods=["POST"])
async def calculate_affinity(req: func.HttpRequest) -> func.HttpResponse:
    """
    Calculate channel affinity scores for custom audiences.
    Uses historical performance data if available.
    """
    logging.info('AMMO: Calculating channel affinity')
    
    try:
        body = req.get_json()
        
        audience_segments = body.get('segments', [])
        historical_performance = body.get('historical_performance', None)
        
        affinity_results = []
        
        for segment in audience_segments:
            segment_name = segment.get('segment_name', 'Default')
            
            # Start with base affinity from lookup
            base_affinity = CHANNEL_AUDIENCE_AFFINITY.get(
                segment_name,
                CHANNEL_AUDIENCE_AFFINITY['Default']
            ).copy()
            
            # Adjust based on historical if available
            if historical_performance:
                adjusted_affinity = adjust_affinity_from_history(
                    base_affinity,
                    segment_name,
                    historical_performance
                )
            else:
                adjusted_affinity = base_affinity
            
            affinity_results.append({
                'segment_name': segment_name,
                'member_count': segment.get('member_count', 0),
                'base_affinity': base_affinity,
                'adjusted_affinity': adjusted_affinity,
                'top_channels': sorted(
                    adjusted_affinity.items(),
                    key=lambda x: x[1],
                    reverse=True
                )[:3],
                'avoid_channels': sorted(
                    adjusted_affinity.items(),
                    key=lambda x: x[1]
                )[:2]
            })
        
        return func.HttpResponse(
            json.dumps({
                'affinity_scores': affinity_results,
                'methodology': 'Base affinity from segment type, adjusted by historical performance'
            }, default=str),
            status_code=200,
            mimetype='application/json'
        )
        
    except Exception as e:
        logging.error(f'AMMO affinity calculation error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': str(e)}),
            status_code=500,
            mimetype='application/json'
        )


# =============================================================================
# OPTIMIZATION ENGINE
# =============================================================================

def run_budget_optimization(
    total_budget: float,
    audiences: List[AudienceSegment],
    channels: List[str],
    constraints: Dict[str, Any],
    objective: str
) -> Dict[str, Any]:
    """
    Run budget optimization using scipy minimize.
    Optimizes allocation across channels and audience segments.
    """
    n_channels = len(channels)
    n_audiences = len(audiences)
    
    # Total audience members
    total_members = sum(aud.member_count for aud in audiences)
    
    # Build affinity matrix (audiences x channels)
    affinity_matrix = np.zeros((n_audiences, n_channels))
    for i, aud in enumerate(audiences):
        for j, channel in enumerate(channels):
            affinity_matrix[i, j] = aud.channel_affinity.get(channel, 1.0)
    
    # Weight by audience size and value
    audience_weights = np.array([
        aud.member_count / total_members * (1 + aud.avg_ltv / 1000)
        for aud in audiences
    ])
    
    # Weighted affinity
    weighted_affinity = (affinity_matrix.T * audience_weights).T
    channel_scores = weighted_affinity.sum(axis=0)
    
    # Normalize to get initial allocation percentages
    initial_allocation = channel_scores / channel_scores.sum()
    
    # Define objective function
    def objective_function(x):
        # x is allocation percentages by channel
        total_response = 0
        for i, channel in enumerate(channels):
            budget_share = x[i] * total_budget
            benchmark = CHANNEL_BENCHMARKS.get(channel, CHANNEL_BENCHMARKS['Programmatic Display'])
            
            # Calculate impressions
            impressions = (budget_share / benchmark['cpm']) * 1000
            
            # Apply diminishing returns (adstock decay)
            effective_impressions = impressions * (1 - benchmark['decay_rate'] * np.log1p(impressions / 10000))
            
            # Calculate weighted response
            weighted_response = 0
            for j, aud in enumerate(audiences):
                aud_reach = effective_impressions * (aud.member_count / total_members)
                aud_response = aud_reach * benchmark['base_response_rate'] * affinity_matrix[j, i]
                weighted_response += aud_response * aud.avg_ltv
            
            total_response += weighted_response
        
        # Maximize (so minimize negative)
        return -total_response
    
    # Constraints
    constraints_list = [
        {'type': 'eq', 'fun': lambda x: np.sum(x) - 1.0}  # Sum to 100%
    ]
    
    # Bounds
    bounds = []
    for channel in channels:
        channel_constraints = constraints.get(channel, {})
        min_pct = channel_constraints.get('min_pct', 0.0)
        max_pct = channel_constraints.get('max_pct', 1.0)
        bounds.append((min_pct, max_pct))
    
    # Optimize
    result = minimize(
        objective_function,
        initial_allocation,
        method='SLSQP',
        bounds=bounds,
        constraints=constraints_list,
        options={'maxiter': 1000}
    )
    
    # Build output
    allocations = []
    total_expected_conversions = 0
    total_expected_revenue = 0
    
    for i, channel in enumerate(channels):
        allocation_pct = result.x[i]
        budget = allocation_pct * total_budget
        benchmark = CHANNEL_BENCHMARKS.get(channel, CHANNEL_BENCHMARKS['Programmatic Display'])
        
        impressions = int((budget / benchmark['cpm']) * 1000)
        
        # Calculate expected conversions by audience
        audience_allocations = {}
        channel_conversions = 0
        channel_revenue = 0
        
        for j, aud in enumerate(audiences):
            aud_reach = impressions * (aud.member_count / total_members)
            aud_conversions = aud_reach * benchmark['base_response_rate'] * affinity_matrix[j, i]
            aud_revenue = aud_conversions * aud.avg_ltv
            
            audience_allocations[aud.segment_name] = {
                'reach': int(aud_reach),
                'conversions': float(aud_conversions),
                'revenue': float(aud_revenue)
            }
            
            channel_conversions += aud_conversions
            channel_revenue += aud_revenue
        
        total_expected_conversions += channel_conversions
        total_expected_revenue += channel_revenue
        
        allocations.append({
            'channel': channel,
            'allocation_pct': round(allocation_pct * 100, 2),
            'budget': round(budget, 2),
            'impressions': impressions,
            'expected_conversions': round(channel_conversions, 2),
            'expected_revenue': round(channel_revenue, 2),
            'expected_roi': round((channel_revenue - budget) / budget * 100, 2) if budget > 0 else 0,
            'audience_breakdown': audience_allocations
        })
    
    # Sort by budget
    allocations.sort(key=lambda x: x['budget'], reverse=True)
    
    return {
        'status': 'OPTIMIZED' if result.success else 'SUBOPTIMAL',
        'total_budget': total_budget,
        'total_expected_conversions': round(total_expected_conversions, 2),
        'total_expected_revenue': round(total_expected_revenue, 2),
        'total_expected_roi': round((total_expected_revenue - total_budget) / total_budget * 100, 2),
        'allocations': allocations,
        'optimization_details': {
            'iterations': result.nit,
            'objective_value': round(-result.fun, 2),
            'converged': result.success
        }
    }


def compare_to_current(
    optimized: Dict[str, Any],
    current: Dict[str, float],
    audiences: List[AudienceSegment]
) -> Dict[str, Any]:
    """Compare optimized allocation to current allocation."""
    total_budget = optimized['total_budget']
    
    # Calculate expected performance of current allocation
    current_revenue = 0
    current_conversions = 0
    total_members = sum(aud.member_count for aud in audiences)
    
    for channel, pct in current.items():
        budget = pct * total_budget
        benchmark = CHANNEL_BENCHMARKS.get(channel, CHANNEL_BENCHMARKS['Programmatic Display'])
        impressions = (budget / benchmark['cpm']) * 1000
        
        for aud in audiences:
            affinity = aud.channel_affinity.get(channel, 1.0)
            aud_reach = impressions * (aud.member_count / total_members)
            aud_conversions = aud_reach * benchmark['base_response_rate'] * affinity
            current_conversions += aud_conversions
            current_revenue += aud_conversions * aud.avg_ltv
    
    # Calculate lift
    revenue_lift = optimized['total_expected_revenue'] - current_revenue
    conversion_lift = optimized['total_expected_conversions'] - current_conversions
    
    return {
        'current_expected_revenue': round(current_revenue, 2),
        'current_expected_conversions': round(current_conversions, 2),
        'optimized_expected_revenue': optimized['total_expected_revenue'],
        'optimized_expected_conversions': optimized['total_expected_conversions'],
        'revenue_lift': round(revenue_lift, 2),
        'revenue_lift_pct': round(revenue_lift / current_revenue * 100, 2) if current_revenue > 0 else 0,
        'conversion_lift': round(conversion_lift, 2),
        'conversion_lift_pct': round(conversion_lift / current_conversions * 100, 2) if current_conversions > 0 else 0,
        'recommendation': 'Adopt optimized allocation' if revenue_lift > 0 else 'Keep current allocation'
    }


def compare_scenarios(results: List[Dict]) -> Dict[str, Any]:
    """Compare multiple budget scenarios."""
    if len(results) < 2:
        return {}
    
    comparison = {
        'budget_range': {
            'min': min(r['total_budget'] for r in results),
            'max': max(r['total_budget'] for r in results)
        },
        'roi_range': {
            'min': min(r['total_expected_roi'] for r in results),
            'max': max(r['total_expected_roi'] for r in results)
        },
        'revenue_range': {
            'min': min(r['total_expected_revenue'] for r in results),
            'max': max(r['total_expected_revenue'] for r in results)
        },
        'marginal_returns': []
    }
    
    # Calculate marginal returns between scenarios
    sorted_results = sorted(results, key=lambda x: x['total_budget'])
    for i in range(1, len(sorted_results)):
        prev = sorted_results[i-1]
        curr = sorted_results[i]
        
        budget_delta = curr['total_budget'] - prev['total_budget']
        revenue_delta = curr['total_expected_revenue'] - prev['total_expected_revenue']
        
        comparison['marginal_returns'].append({
            'from_scenario': prev.get('scenario_name', f'Scenario {i}'),
            'to_scenario': curr.get('scenario_name', f'Scenario {i+1}'),
            'additional_budget': round(budget_delta, 2),
            'additional_revenue': round(revenue_delta, 2),
            'marginal_roi': round(revenue_delta / budget_delta * 100, 2) if budget_delta > 0 else 0
        })
    
    return comparison


def recommend_scenario(results: List[Dict]) -> Dict[str, Any]:
    """Recommend best scenario based on ROI and marginal returns."""
    if not results:
        return {'recommendation': 'No scenarios to compare'}
    
    # Find highest ROI scenario
    best_roi = max(results, key=lambda x: x['total_expected_roi'])
    
    # Check for diminishing returns
    sorted_results = sorted(results, key=lambda x: x['total_budget'])
    
    recommendation = {
        'recommended_scenario': best_roi.get('scenario_name', 'Highest ROI'),
        'recommended_budget': best_roi['total_budget'],
        'expected_roi': best_roi['total_expected_roi'],
        'expected_revenue': best_roi['total_expected_revenue'],
        'rationale': f"Highest expected ROI of {best_roi['total_expected_roi']}%"
    }
    
    # Check if aggressive scenario has acceptable marginal returns
    if len(sorted_results) >= 2:
        aggressive = sorted_results[-1]
        moderate = sorted_results[-2]
        
        marginal_roi = (
            (aggressive['total_expected_revenue'] - moderate['total_expected_revenue']) /
            (aggressive['total_budget'] - moderate['total_budget']) * 100
        ) if aggressive['total_budget'] != moderate['total_budget'] else 0
        
        if marginal_roi > 50:  # Still attractive returns
            recommendation['alternative'] = {
                'scenario': aggressive.get('scenario_name', 'Aggressive'),
                'budget': aggressive['total_budget'],
                'rationale': f'Higher budget still yields {marginal_roi:.1f}% marginal ROI'
            }
    
    return recommendation


def adjust_affinity_from_history(
    base_affinity: Dict[str, float],
    segment_name: str,
    historical: Dict[str, Any]
) -> Dict[str, float]:
    """Adjust affinity scores based on historical performance data."""
    adjusted = base_affinity.copy()
    
    # Historical should contain per-channel actual vs expected ratios
    segment_history = historical.get(segment_name, {})
    
    for channel, base_score in adjusted.items():
        if channel in segment_history:
            actual_vs_expected = segment_history[channel].get('actual_vs_expected', 1.0)
            # Blend base with historical (70% historical, 30% base if history available)
            adjusted[channel] = base_score * 0.3 + (base_score * actual_vs_expected) * 0.7
    
    return adjusted


# =============================================================================
# HEALTH CHECK
# =============================================================================

@app.route(route="health", methods=["GET"])
def health_check(req: func.HttpRequest) -> func.HttpResponse:
    """Health check endpoint."""
    return func.HttpResponse(
        json.dumps({
            'status': 'healthy',
            'service': 'AMMO - Audience-Aware Media Mix Optimization',
            'version': '1.0',
            'timestamp': datetime.utcnow().isoformat(),
            'capabilities': [
                'Budget optimization across channels and audiences',
                'Scenario analysis with marginal return calculation',
                'Channel affinity scoring by audience segment',
                'Current vs optimized allocation comparison'
            ],
            'supported_channels': list(CHANNEL_BENCHMARKS.keys()),
            'supported_segments': list(CHANNEL_AUDIENCE_AFFINITY.keys())
        }),
        status_code=200,
        mimetype='application/json'
    )
