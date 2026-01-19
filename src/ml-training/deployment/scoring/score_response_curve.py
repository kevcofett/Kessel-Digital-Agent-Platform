"""
Scoring Script for Response Curve Model
Azure ML Managed Online Endpoint
"""

import json
import logging
import os
from typing import Any, Dict, List

import joblib
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def init():
    """Initialize the model for scoring."""
    global channel_models, channels
    
    model_path = os.environ.get('AZUREML_MODEL_DIR', './model')
    
    # Load channel models (dict of channel -> model)
    models_path = os.path.join(model_path, 'channel_models.joblib')
    if os.path.exists(models_path):
        channel_models = joblib.load(models_path)
        channels = list(channel_models.keys())
    else:
        # Single model case
        model = joblib.load(os.path.join(model_path, 'model.joblib'))
        channel_models = {'default': model}
        channels = ['default']
    
    logger.info(f"Response Curve Model initialized with channels: {channels}")


def run(raw_data: str) -> str:
    """Score spend levels or get curve analysis."""
    try:
        data = json.loads(raw_data)
        
        action = data.get('action', 'predict')
        
        if action == 'predict':
            # Predict response for given spend
            channel = data.get('channel', 'default')
            spend_values = data.get('spend', data.get('data', []))
            
            if not isinstance(spend_values, list):
                spend_values = [spend_values]
            
            if channel not in channel_models:
                return json.dumps({'error': f'Unknown channel: {channel}. Available: {channels}'})
            
            model = channel_models[channel]
            spend_array = np.array(spend_values)
            
            predictions = model.predict(spend_array)
            marginal_returns = model.get_marginal_return(spend_array)
            
            results = []
            for i, (spend, pred, mr) in enumerate(zip(spend_values, predictions, marginal_returns)):
                results.append({
                    'spend': float(spend),
                    'predicted_response': float(pred),
                    'marginal_return': float(mr),
                    'efficiency': 'High' if mr > 0.5 else 'Medium' if mr > 0.1 else 'Low',
                })
            
            return json.dumps({
                'channel': channel,
                'predictions': results,
            })
        
        elif action == 'analyze':
            # Get curve analysis for channel
            channel = data.get('channel', 'default')
            
            if channel not in channel_models:
                return json.dumps({'error': f'Unknown channel: {channel}'})
            
            model = channel_models[channel]
            
            analysis = {
                'channel': channel,
                'curve_type': model.best_curve_type_,
                'parameters': model.parameters_,
                'fit_metrics': model.fit_metrics_,
                'saturation_point': float(model.get_saturation_point()),
                'optimal_spend_mroi_1': float(model.get_optimal_spend(1.0)),
            }
            
            return json.dumps({'analysis': analysis})
        
        elif action == 'curve_data':
            # Generate curve data for visualization
            channel = data.get('channel', 'default')
            max_spend = data.get('max_spend', 100000)
            n_points = data.get('n_points', 50)
            
            if channel not in channel_models:
                return json.dumps({'error': f'Unknown channel: {channel}'})
            
            model = channel_models[channel]
            
            spend_range = np.linspace(0, max_spend, n_points)
            response = model.predict(spend_range)
            marginal = model.get_marginal_return(spend_range)
            
            curve_data = [
                {
                    'spend': float(s),
                    'response': float(r),
                    'marginal_return': float(m),
                }
                for s, r, m in zip(spend_range, response, marginal)
            ]
            
            return json.dumps({
                'channel': channel,
                'curve_data': curve_data,
            })
        
        elif action == 'compare':
            # Compare all channels at given budget
            budget = data.get('budget', 10000)
            
            comparisons = []
            for channel, model in channel_models.items():
                try:
                    response = model.predict(np.array([budget]))[0]
                    mr = model.get_marginal_return(np.array([budget]))[0]
                    saturation = model.get_saturation_point()
                    
                    comparisons.append({
                        'channel': channel,
                        'predicted_response': float(response),
                        'marginal_return': float(mr),
                        'saturation_point': float(saturation),
                        'at_saturation': budget >= saturation * 0.9,
                    })
                except Exception as e:
                    logger.warning(f"Failed to analyze {channel}: {e}")
            
            # Sort by marginal return
            comparisons = sorted(comparisons, key=lambda x: x['marginal_return'], reverse=True)
            
            return json.dumps({
                'budget': budget,
                'comparisons': comparisons,
            })
        
        else:
            return json.dumps({'error': f'Unknown action: {action}'})
    
    except Exception as e:
        error_msg = f"Scoring error: {str(e)}"
        logger.error(error_msg)
        return json.dumps({"error": error_msg})


if __name__ == '__main__':
    # Mock model for testing
    class MockCurveModel:
        best_curve_type_ = 'hill'
        parameters_ = {'K': 100, 'S': 5000, 'n': 1.5}
        fit_metrics_ = {'r2': 0.95}
        
        def predict(self, x):
            K, S, n = 100, 5000, 1.5
            return K * np.power(x, n) / (np.power(S, n) + np.power(x, n) + 1e-10)
        
        def get_marginal_return(self, x, delta=1.0):
            y = self.predict(x)
            y_delta = self.predict(x + delta)
            return (y_delta - y) / delta
        
        def get_saturation_point(self):
            return 20000
        
        def get_optimal_spend(self, target):
            return 15000
    
    channel_models = {'search': MockCurveModel(), 'social': MockCurveModel()}
    channels = ['search', 'social']
    
    test_input = json.dumps({
        "action": "compare",
        "budget": 10000
    })
    
    result = run(test_input)
    print(f"Test result: {result}")
