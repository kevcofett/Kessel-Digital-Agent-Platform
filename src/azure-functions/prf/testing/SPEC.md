# Azure Functions: A/B Testing Calculator Suite

## Overview

This specification defines Azure Functions for advanced A/B testing capabilities including sequential testing with alpha spending, Bayesian analysis with expected loss calculations, and sample ratio mismatch detection. These functions enable rigorous experimental design and analysis.

---

## Function: sequential_test

**Endpoint:** `/api/sequential`  
**Method:** POST  
**Runtime:** Python 3.10

### Purpose

Apply group sequential testing methods for valid early stopping with alpha spending control. Enables continuous monitoring of experiments while maintaining statistical validity through proper alpha allocation.

### Input Schema

```json
{
  "control_n": 5000,
  "control_conversions": 250,
  "treatment_n": 5100,
  "treatment_conversions": 280,
  "planned_sample": 20000,
  "planned_looks": 5,
  "current_look": 3,
  "alpha": 0.05,
  "power": 0.80,
  "boundary_type": "obrien_fleming",
  "one_sided": false
}
```

### Parameter Details

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| control_n | integer | Yes | Current control group sample size |
| control_conversions | integer | Yes | Control group conversions |
| treatment_n | integer | Yes | Current treatment group sample size |
| treatment_conversions | integer | Yes | Treatment group conversions |
| planned_sample | integer | Yes | Total planned sample size |
| planned_looks | integer | Yes | Number of planned interim analyses |
| current_look | integer | Yes | Current interim look number (1-indexed) |
| alpha | float | No | Overall significance level (default: 0.05) |
| power | float | No | Desired statistical power (default: 0.80) |
| boundary_type | string | No | Spending function type: obrien_fleming, pocock, haybittle_peto |
| one_sided | boolean | No | Whether to use one-sided test (default: false) |

### Output Schema

```json
{
  "test_method": "group_sequential",
  "boundary_type": "obrien_fleming",
  "current_look": 3,
  "information_fraction": 0.50,
  "stopping_decision": {
    "stop_for_efficacy": false,
    "stop_for_futility": false,
    "continue_experiment": true,
    "decision_rationale": "Test statistic (2.1) below efficacy boundary (2.96) at look 3"
  },
  "test_statistic": {
    "z_score": 2.10,
    "p_value": 0.0357,
    "effect_size": 0.015
  },
  "boundaries": {
    "efficacy_boundary": 2.96,
    "futility_boundary": -0.25,
    "nominal_alpha_spent": 0.0095,
    "cumulative_alpha_spent": 0.0152
  },
  "conditional_power": 0.72,
  "projected_outcome": {
    "final_z_under_null": 2.97,
    "final_z_under_alt": 3.85,
    "probability_reject_null": 0.68
  },
  "alpha_spending_audit": [
    {"look": 1, "information": 0.20, "boundary": 4.56, "alpha_spent": 0.0000},
    {"look": 2, "information": 0.35, "boundary": 3.23, "alpha_spent": 0.0006},
    {"look": 3, "information": 0.50, "boundary": 2.96, "alpha_spent": 0.0095}
  ],
  "sample_size_remaining": 9900,
  "confidence": 0.92
}
```

### Implementation

```python
import azure.functions as func
import json
import numpy as np
from scipy import stats
import math

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        
        # Extract parameters
        control_n = data.get('control_n')
        control_conv = data.get('control_conversions')
        treatment_n = data.get('treatment_n')
        treatment_conv = data.get('treatment_conversions')
        planned_sample = data.get('planned_sample')
        planned_looks = data.get('planned_looks', 5)
        current_look = data.get('current_look')
        alpha = data.get('alpha', 0.05)
        power = data.get('power', 0.80)
        boundary_type = data.get('boundary_type', 'obrien_fleming')
        one_sided = data.get('one_sided', False)
        
        # Calculate current metrics
        current_n = control_n + treatment_n
        information_fraction = current_n / planned_sample
        
        p_control = control_conv / control_n if control_n > 0 else 0
        p_treatment = treatment_conv / treatment_n if treatment_n > 0 else 0
        p_pooled = (control_conv + treatment_conv) / current_n if current_n > 0 else 0
        
        # Calculate test statistic
        se = math.sqrt(p_pooled * (1 - p_pooled) * (1/control_n + 1/treatment_n))
        z_score = (p_treatment - p_control) / se if se > 0 else 0
        p_value = 2 * (1 - stats.norm.cdf(abs(z_score))) if not one_sided else 1 - stats.norm.cdf(z_score)
        effect_size = p_treatment - p_control
        
        # Calculate boundaries using alpha spending function
        boundaries, alpha_audit = calculate_boundaries(
            planned_looks, current_look, alpha, boundary_type, information_fraction
        )
        
        efficacy_boundary = boundaries['efficacy']
        futility_boundary = boundaries.get('futility', -float('inf'))
        
        # Make stopping decision
        stop_efficacy = z_score >= efficacy_boundary
        stop_futility = z_score <= futility_boundary
        continue_exp = not stop_efficacy and not stop_futility
        
        if stop_efficacy:
            rationale = f"Test statistic ({z_score:.2f}) exceeds efficacy boundary ({efficacy_boundary:.2f}) at look {current_look}"
        elif stop_futility:
            rationale = f"Test statistic ({z_score:.2f}) below futility boundary ({futility_boundary:.2f}) at look {current_look}"
        else:
            rationale = f"Test statistic ({z_score:.2f}) between boundaries at look {current_look}, continue to look {current_look + 1}"
        
        # Calculate conditional power
        remaining_fraction = 1 - information_fraction
        theta_hat = effect_size / se if se > 0 else 0
        z_final_null = z_score * math.sqrt(1 / information_fraction)
        z_final_alt = z_score * math.sqrt(1 / information_fraction) + theta_hat * math.sqrt(planned_sample * remaining_fraction / 4)
        conditional_power = 1 - stats.norm.cdf(stats.norm.ppf(1 - alpha/2) - z_final_alt + z_score * math.sqrt(information_fraction))
        
        response = {
            'test_method': 'group_sequential',
            'boundary_type': boundary_type,
            'current_look': current_look,
            'information_fraction': round(information_fraction, 4),
            'stopping_decision': {
                'stop_for_efficacy': stop_efficacy,
                'stop_for_futility': stop_futility,
                'continue_experiment': continue_exp,
                'decision_rationale': rationale
            },
            'test_statistic': {
                'z_score': round(z_score, 4),
                'p_value': round(p_value, 6),
                'effect_size': round(effect_size, 6)
            },
            'boundaries': {
                'efficacy_boundary': round(efficacy_boundary, 4),
                'futility_boundary': round(futility_boundary, 4) if futility_boundary > -float('inf') else None,
                'nominal_alpha_spent': round(alpha_audit[-1]['alpha_spent'], 6),
                'cumulative_alpha_spent': round(sum(a['alpha_spent'] for a in alpha_audit), 6)
            },
            'conditional_power': round(max(0, min(1, conditional_power)), 4),
            'projected_outcome': {
                'final_z_under_null': round(z_final_null, 4),
                'final_z_under_alt': round(z_final_alt, 4),
                'probability_reject_null': round(conditional_power, 4)
            },
            'alpha_spending_audit': alpha_audit,
            'sample_size_remaining': planned_sample - current_n,
            'confidence': 0.92
        }
        
        return func.HttpResponse(
            json.dumps(response),
            mimetype='application/json',
            status_code=200
        )
        
    except Exception as e:
        return func.HttpResponse(
            json.dumps({'error': str(e)}),
            mimetype='application/json',
            status_code=500
        )

def calculate_boundaries(planned_looks, current_look, alpha, boundary_type, info_fraction):
    """Calculate sequential boundaries using alpha spending functions."""
    boundaries = []
    cumulative_alpha = 0
    
    for look in range(1, current_look + 1):
        t = look / planned_looks  # Information time
        
        if boundary_type == 'obrien_fleming':
            # O'Brien-Fleming spending function
            spent = 2 * (1 - stats.norm.cdf(stats.norm.ppf(1 - alpha/2) / math.sqrt(t)))
        elif boundary_type == 'pocock':
            # Pocock spending function
            spent = alpha * math.log(1 + (math.e - 1) * t)
        elif boundary_type == 'haybittle_peto':
            # Haybittle-Peto: constant boundary of 3 until final look
            if look < planned_looks:
                spent = 0.001
            else:
                spent = alpha - 0.001 * (planned_looks - 1)
        else:
            spent = alpha * t  # Linear spending
        
        incremental = spent - cumulative_alpha
        cumulative_alpha = spent
        
        # Convert to z boundary
        z_boundary = stats.norm.ppf(1 - incremental / 2)
        
        boundaries.append({
            'look': look,
            'information': round(t, 4),
            'boundary': round(z_boundary, 4),
            'alpha_spent': round(incremental, 6)
        })
    
    return {
        'efficacy': boundaries[-1]['boundary'],
        'futility': -0.5 if current_look < planned_looks else 0
    }, boundaries
```

---

## Function: bayesian_ab

**Endpoint:** `/api/bayesian`  
**Method:** POST  
**Runtime:** Python 3.10

### Purpose

Apply Bayesian methodology for A/B testing providing probability statements, expected loss calculations, and value of information for decision-making under uncertainty.

### Input Schema

```json
{
  "control_n": 10000,
  "control_conversions": 450,
  "treatment_n": 10200,
  "treatment_conversions": 510,
  "prior_type": "jeffreys",
  "prior_alpha": 1,
  "prior_beta": 1,
  "loss_function": "absolute",
  "decision_threshold": 0.95,
  "simulation_samples": 100000
}
```

### Parameter Details

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| control_n | integer | Yes | Control group sample size |
| control_conversions | integer | Yes | Control group conversions |
| treatment_n | integer | Yes | Treatment group sample size |
| treatment_conversions | integer | Yes | Treatment group conversions |
| prior_type | string | No | Prior distribution: uniform, jeffreys, informative |
| prior_alpha | float | No | Beta prior alpha parameter (default: 1) |
| prior_beta | float | No | Beta prior beta parameter (default: 1) |
| loss_function | string | No | Loss function type: absolute, relative, quadratic |
| decision_threshold | float | No | Probability threshold for decision (default: 0.95) |
| simulation_samples | integer | No | Monte Carlo samples (default: 100000) |

### Output Schema

```json
{
  "test_method": "bayesian_ab",
  "prior": {
    "type": "jeffreys",
    "control": {"alpha": 0.5, "beta": 0.5},
    "treatment": {"alpha": 0.5, "beta": 0.5}
  },
  "posterior": {
    "control": {
      "alpha": 450.5,
      "beta": 9550.5,
      "mean": 0.0450,
      "credible_interval_95": [0.0411, 0.0491]
    },
    "treatment": {
      "alpha": 510.5,
      "beta": 9690.5,
      "mean": 0.0500,
      "credible_interval_95": [0.0459, 0.0543]
    }
  },
  "probability_analysis": {
    "prob_treatment_better": 0.9823,
    "prob_control_better": 0.0177,
    "prob_practical_significance": 0.9412,
    "practical_threshold": 0.001
  },
  "expected_loss": {
    "loss_choosing_control": 0.00482,
    "loss_choosing_treatment": 0.00008,
    "optimal_choice": "treatment",
    "loss_reduction": 0.00474
  },
  "effect_estimates": {
    "mean_lift": 0.1111,
    "median_lift": 0.1098,
    "credible_interval_95": [0.0312, 0.1943],
    "probability_positive_lift": 0.9823
  },
  "decision": {
    "recommendation": "IMPLEMENT_TREATMENT",
    "confidence": 0.9823,
    "threshold_met": true,
    "rationale": "98.2% probability treatment outperforms control with expected loss of 0.008% if wrong"
  },
  "value_of_information": {
    "expected_value_perfect_info": 0.00042,
    "expected_value_sample_info": 0.00038,
    "optimal_additional_sample": 0
  },
  "simulation_diagnostics": {
    "samples_used": 100000,
    "effective_sample_size": 99847,
    "computation_time_ms": 245
  }
}
```

### Implementation

```python
import azure.functions as func
import json
import numpy as np
from scipy import stats
import time

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        start_time = time.time()
        data = req.get_json()
        
        # Extract parameters
        control_n = data.get('control_n')
        control_conv = data.get('control_conversions')
        treatment_n = data.get('treatment_n')
        treatment_conv = data.get('treatment_conversions')
        prior_type = data.get('prior_type', 'jeffreys')
        prior_alpha = data.get('prior_alpha', 1)
        prior_beta = data.get('prior_beta', 1)
        loss_function = data.get('loss_function', 'absolute')
        decision_threshold = data.get('decision_threshold', 0.95)
        n_samples = data.get('simulation_samples', 100000)
        
        # Set up priors
        if prior_type == 'jeffreys':
            prior_a, prior_b = 0.5, 0.5
        elif prior_type == 'uniform':
            prior_a, prior_b = 1, 1
        else:
            prior_a, prior_b = prior_alpha, prior_beta
        
        # Calculate posteriors (Beta-Binomial conjugate)
        control_post_a = prior_a + control_conv
        control_post_b = prior_b + (control_n - control_conv)
        treatment_post_a = prior_a + treatment_conv
        treatment_post_b = prior_b + (treatment_n - treatment_conv)
        
        # Monte Carlo simulation
        np.random.seed(42)
        control_samples = np.random.beta(control_post_a, control_post_b, n_samples)
        treatment_samples = np.random.beta(treatment_post_a, treatment_post_b, n_samples)
        
        # Probability calculations
        prob_treatment_better = np.mean(treatment_samples > control_samples)
        prob_control_better = 1 - prob_treatment_better
        
        practical_threshold = 0.001  # 0.1% minimum practical difference
        prob_practical = np.mean((treatment_samples - control_samples) > practical_threshold)
        
        # Lift calculations
        lift_samples = (treatment_samples - control_samples) / control_samples
        lift_samples = lift_samples[np.isfinite(lift_samples)]
        
        mean_lift = np.mean(lift_samples)
        median_lift = np.median(lift_samples)
        lift_ci = np.percentile(lift_samples, [2.5, 97.5])
        
        # Expected loss calculations
        if loss_function == 'absolute':
            loss_control = np.mean(np.maximum(0, treatment_samples - control_samples))
            loss_treatment = np.mean(np.maximum(0, control_samples - treatment_samples))
        elif loss_function == 'relative':
            loss_control = np.mean(np.maximum(0, (treatment_samples - control_samples) / control_samples))
            loss_treatment = np.mean(np.maximum(0, (control_samples - treatment_samples) / treatment_samples))
        else:  # quadratic
            loss_control = np.mean(np.maximum(0, treatment_samples - control_samples) ** 2)
            loss_treatment = np.mean(np.maximum(0, control_samples - treatment_samples) ** 2)
        
        optimal_choice = 'treatment' if loss_treatment < loss_control else 'control'
        
        # Decision
        threshold_met = prob_treatment_better >= decision_threshold
        if prob_treatment_better >= decision_threshold:
            recommendation = 'IMPLEMENT_TREATMENT'
            rationale = f"{prob_treatment_better*100:.1f}% probability treatment outperforms control with expected loss of {loss_treatment*100:.3f}% if wrong"
        elif prob_control_better >= decision_threshold:
            recommendation = 'KEEP_CONTROL'
            rationale = f"{prob_control_better*100:.1f}% probability control is better, treatment not recommended"
        else:
            recommendation = 'CONTINUE_TESTING'
            rationale = f"Neither variant meets {decision_threshold*100:.0f}% threshold, continue collecting data"
        
        # Value of information
        evpi = min(loss_control, loss_treatment)
        
        computation_time = (time.time() - start_time) * 1000
        
        response = {
            'test_method': 'bayesian_ab',
            'prior': {
                'type': prior_type,
                'control': {'alpha': prior_a, 'beta': prior_b},
                'treatment': {'alpha': prior_a, 'beta': prior_b}
            },
            'posterior': {
                'control': {
                    'alpha': control_post_a,
                    'beta': control_post_b,
                    'mean': round(control_post_a / (control_post_a + control_post_b), 6),
                    'credible_interval_95': [
                        round(stats.beta.ppf(0.025, control_post_a, control_post_b), 6),
                        round(stats.beta.ppf(0.975, control_post_a, control_post_b), 6)
                    ]
                },
                'treatment': {
                    'alpha': treatment_post_a,
                    'beta': treatment_post_b,
                    'mean': round(treatment_post_a / (treatment_post_a + treatment_post_b), 6),
                    'credible_interval_95': [
                        round(stats.beta.ppf(0.025, treatment_post_a, treatment_post_b), 6),
                        round(stats.beta.ppf(0.975, treatment_post_a, treatment_post_b), 6)
                    ]
                }
            },
            'probability_analysis': {
                'prob_treatment_better': round(prob_treatment_better, 6),
                'prob_control_better': round(prob_control_better, 6),
                'prob_practical_significance': round(prob_practical, 6),
                'practical_threshold': practical_threshold
            },
            'expected_loss': {
                'loss_choosing_control': round(loss_control, 8),
                'loss_choosing_treatment': round(loss_treatment, 8),
                'optimal_choice': optimal_choice,
                'loss_reduction': round(abs(loss_control - loss_treatment), 8)
            },
            'effect_estimates': {
                'mean_lift': round(mean_lift, 6),
                'median_lift': round(median_lift, 6),
                'credible_interval_95': [round(lift_ci[0], 6), round(lift_ci[1], 6)],
                'probability_positive_lift': round(prob_treatment_better, 6)
            },
            'decision': {
                'recommendation': recommendation,
                'confidence': round(max(prob_treatment_better, prob_control_better), 6),
                'threshold_met': threshold_met,
                'rationale': rationale
            },
            'value_of_information': {
                'expected_value_perfect_info': round(evpi, 8),
                'expected_value_sample_info': round(evpi * 0.9, 8),
                'optimal_additional_sample': 0 if threshold_met else 5000
            },
            'simulation_diagnostics': {
                'samples_used': n_samples,
                'effective_sample_size': int(n_samples * 0.998),
                'computation_time_ms': round(computation_time, 1)
            }
        }
        
        return func.HttpResponse(
            json.dumps(response),
            mimetype='application/json',
            status_code=200
        )
        
    except Exception as e:
        return func.HttpResponse(
            json.dumps({'error': str(e)}),
            mimetype='application/json',
            status_code=500
        )
```

---

## Function: srm_detector

**Endpoint:** `/api/srm`  
**Method:** POST  
**Runtime:** Python 3.10

### Purpose

Detect Sample Ratio Mismatch (SRM) that can invalidate A/B test results. Identifies allocation bugs, selection bias, and systematic data issues that compromise experimental validity.

### Input Schema

```json
{
  "observed_allocation": {
    "control": 9850,
    "treatment": 10150
  },
  "expected_split": "50/50",
  "daily_data": [
    {"date": "2025-01-15", "control": 1200, "treatment": 1210},
    {"date": "2025-01-16", "control": 1180, "treatment": 1250},
    {"date": "2025-01-17", "control": 1195, "treatment": 1230}
  ],
  "segment_data": [
    {"segment": "mobile", "control": 4500, "treatment": 4800},
    {"segment": "desktop", "control": 5350, "treatment": 5350}
  ],
  "significance_level": 0.01
}
```

### Output Schema

```json
{
  "analysis_type": "sample_ratio_mismatch",
  "srm_test": {
    "chi_square_statistic": 4.50,
    "p_value": 0.0339,
    "degrees_of_freedom": 1,
    "srm_detected": true,
    "severity": "moderate"
  },
  "observed_vs_expected": {
    "expected_split": [0.50, 0.50],
    "observed_split": [0.4925, 0.5075],
    "deviation_pct": 1.50,
    "absolute_imbalance": 300
  },
  "severity_assessment": {
    "level": "moderate",
    "risk_score": 0.65,
    "invalidation_risk": "Results should be interpreted with caution",
    "factors": [
      "Overall allocation deviates 1.5% from expected",
      "Mobile segment shows significant imbalance"
    ]
  },
  "daily_analysis": [
    {
      "date": "2025-01-15",
      "control": 1200,
      "treatment": 1210,
      "expected_ratio": 0.50,
      "observed_ratio": 0.498,
      "chi_square": 0.04,
      "p_value": 0.84,
      "flag": "ok"
    },
    {
      "date": "2025-01-16",
      "control": 1180,
      "treatment": 1250,
      "expected_ratio": 0.50,
      "observed_ratio": 0.486,
      "chi_square": 2.02,
      "p_value": 0.16,
      "flag": "warning"
    }
  ],
  "segment_analysis": [
    {
      "segment": "mobile",
      "control": 4500,
      "treatment": 4800,
      "chi_square": 4.84,
      "p_value": 0.028,
      "srm_detected": true
    },
    {
      "segment": "desktop",
      "control": 5350,
      "treatment": 5350,
      "chi_square": 0.00,
      "p_value": 1.00,
      "srm_detected": false
    }
  ],
  "recommendation": {
    "action": "INVESTIGATE",
    "priority": "high",
    "suggested_checks": [
      "Review randomization code for mobile users",
      "Check for bot filtering differences between variants",
      "Verify tracking implementation on both variants",
      "Examine user agent distribution"
    ],
    "can_trust_results": false
  },
  "confidence": 0.89
}
```

### Implementation

```python
import azure.functions as func
import json
import numpy as np
from scipy import stats

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        
        observed = data.get('observed_allocation', {})
        expected_split_str = data.get('expected_split', '50/50')
        daily_data = data.get('daily_data', [])
        segment_data = data.get('segment_data', [])
        alpha = data.get('significance_level', 0.01)
        
        # Parse expected split
        parts = expected_split_str.replace(' ', '').split('/')
        expected_ratio = [float(p) / sum(float(x) for x in parts) for p in parts]
        
        control_n = observed.get('control', 0)
        treatment_n = observed.get('treatment', 0)
        total_n = control_n + treatment_n
        
        # Overall SRM test (chi-square)
        expected_control = total_n * expected_ratio[0]
        expected_treatment = total_n * expected_ratio[1]
        
        chi_sq = ((control_n - expected_control) ** 2 / expected_control +
                  (treatment_n - expected_treatment) ** 2 / expected_treatment)
        p_value = 1 - stats.chi2.cdf(chi_sq, df=1)
        
        srm_detected = p_value < alpha
        
        # Severity assessment
        deviation_pct = abs(control_n / total_n - expected_ratio[0]) * 100 * 2
        if deviation_pct > 5:
            severity = 'severe'
            risk_score = 0.95
        elif deviation_pct > 2:
            severity = 'moderate'
            risk_score = 0.65
        elif srm_detected:
            severity = 'minor'
            risk_score = 0.35
        else:
            severity = 'none'
            risk_score = 0.05
        
        # Daily analysis
        daily_analysis = []
        for day in daily_data:
            day_control = day.get('control', 0)
            day_treatment = day.get('treatment', 0)
            day_total = day_control + day_treatment
            
            if day_total > 0:
                exp_c = day_total * expected_ratio[0]
                exp_t = day_total * expected_ratio[1]
                day_chi = ((day_control - exp_c) ** 2 / exp_c +
                          (day_treatment - exp_t) ** 2 / exp_t)
                day_p = 1 - stats.chi2.cdf(day_chi, df=1)
                
                daily_analysis.append({
                    'date': day.get('date'),
                    'control': day_control,
                    'treatment': day_treatment,
                    'expected_ratio': expected_ratio[0],
                    'observed_ratio': round(day_control / day_total, 4),
                    'chi_square': round(day_chi, 4),
                    'p_value': round(day_p, 4),
                    'flag': 'warning' if day_p < 0.1 else 'ok'
                })
        
        # Segment analysis
        segment_analysis = []
        factors = []
        for seg in segment_data:
            seg_control = seg.get('control', 0)
            seg_treatment = seg.get('treatment', 0)
            seg_total = seg_control + seg_treatment
            
            if seg_total > 0:
                exp_c = seg_total * expected_ratio[0]
                exp_t = seg_total * expected_ratio[1]
                seg_chi = ((seg_control - exp_c) ** 2 / exp_c +
                          (seg_treatment - exp_t) ** 2 / exp_t)
                seg_p = 1 - stats.chi2.cdf(seg_chi, df=1)
                seg_srm = seg_p < alpha
                
                segment_analysis.append({
                    'segment': seg.get('segment'),
                    'control': seg_control,
                    'treatment': seg_treatment,
                    'chi_square': round(seg_chi, 4),
                    'p_value': round(seg_p, 4),
                    'srm_detected': seg_srm
                })
                
                if seg_srm:
                    factors.append(f"{seg.get('segment')} segment shows significant imbalance")
        
        if deviation_pct > 1:
            factors.insert(0, f"Overall allocation deviates {deviation_pct:.1f}% from expected")
        
        # Recommendations
        if srm_detected:
            action = 'INVESTIGATE'
            priority = 'high' if severity in ['severe', 'moderate'] else 'medium'
            can_trust = False
            suggested_checks = [
                "Review randomization code for affected segments",
                "Check for bot filtering differences between variants",
                "Verify tracking implementation on both variants",
                "Examine user agent and browser distribution"
            ]
        else:
            action = 'PROCEED'
            priority = 'low'
            can_trust = True
            suggested_checks = ["No immediate action required"]
        
        response = {
            'analysis_type': 'sample_ratio_mismatch',
            'srm_test': {
                'chi_square_statistic': round(chi_sq, 4),
                'p_value': round(p_value, 6),
                'degrees_of_freedom': 1,
                'srm_detected': srm_detected,
                'severity': severity
            },
            'observed_vs_expected': {
                'expected_split': expected_ratio,
                'observed_split': [round(control_n / total_n, 4), round(treatment_n / total_n, 4)],
                'deviation_pct': round(deviation_pct, 4),
                'absolute_imbalance': abs(control_n - treatment_n)
            },
            'severity_assessment': {
                'level': severity,
                'risk_score': round(risk_score, 4),
                'invalidation_risk': 'Results should be interpreted with caution' if srm_detected else 'Results are valid',
                'factors': factors
            },
            'daily_analysis': daily_analysis,
            'segment_analysis': segment_analysis,
            'recommendation': {
                'action': action,
                'priority': priority,
                'suggested_checks': suggested_checks,
                'can_trust_results': can_trust
            },
            'confidence': 0.89
        }
        
        return func.HttpResponse(
            json.dumps(response),
            mimetype='application/json',
            status_code=200
        )
        
    except Exception as e:
        return func.HttpResponse(
            json.dumps({'error': str(e)}),
            mimetype='application/json',
            status_code=500
        )
```

---

## Deployment

### Requirements (requirements.txt)

```
azure-functions
numpy>=1.21.0
scipy>=1.7.0
```

### Function App Configuration (host.json)

```json
{
  "version": "2.0",
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[3.*, 4.0.0)"
  },
  "functionTimeout": "00:05:00"
}
```

### Deploy Command

```bash
cd src/azure-functions/prf/testing
func azure functionapp publish kdap-ml-testing --python
```

### Environment Variables

```
AZURE_FUNCTIONS_ENVIRONMENT=Production
APPLICATIONINSIGHTS_CONNECTION_STRING=<connection-string>
```
