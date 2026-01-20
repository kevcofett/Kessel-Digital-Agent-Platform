"""
Shapley Attribution Scoring Script
KDAP Azure ML Endpoint
Agent: PRF
Capability: PRF_ATTRIBUTION
"""

import json
import logging
import numpy as np
from itertools import combinations
from typing import Dict, List, Any, Set, FrozenSet

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init():
    """Initialize the model."""
    global model_config
    model_config = {
        "version": "1.0.0",
        "max_channels": 10,
        "sample_paths": 10000
    }
    logger.info(f"Attribution model initialized: {model_config}")


def calculate_shapley_values(
    conversion_paths: List[List[str]], 
    channels: Set[str]
) -> Dict[str, float]:
    """
    Calculate Shapley values for channel attribution.
    Uses path-based attribution with coalition values.
    """
    n = len(channels)
    channel_list = list(channels)
    shapley = {c: 0.0 for c in channels}
    
    if n == 0:
        return shapley
    
    # Count path conversions
    total_conversions = len(conversion_paths)
    if total_conversions == 0:
        return shapley
    
    # Calculate marginal contributions
    for channel in channels:
        marginal_sum = 0.0
        count = 0
        
        # For each subset not containing the channel
        other_channels = [c for c in channel_list if c != channel]
        
        for r in range(len(other_channels) + 1):
            for subset in combinations(other_channels, r):
                subset_set = set(subset)
                subset_with_channel = subset_set | {channel}
                
                # Count conversions with and without the channel
                conv_with = sum(
                    1 for path in conversion_paths 
                    if subset_with_channel.issubset(set(path))
                )
                conv_without = sum(
                    1 for path in conversion_paths 
                    if subset_set.issubset(set(path)) and channel not in path
                )
                
                marginal = (conv_with - conv_without) / total_conversions
                
                # Weight by coalition size
                s = len(subset_set)
                weight = (np.math.factorial(s) * np.math.factorial(n - s - 1)) / np.math.factorial(n)
                marginal_sum += weight * marginal
                count += 1
        
        shapley[channel] = marginal_sum
    
    # Normalize to sum to 1
    total = sum(shapley.values())
    if total > 0:
        shapley = {k: v / total for k, v in shapley.items()}
    
    return shapley


def run(raw_data: str) -> str:
    """
    Score function for Shapley attribution.
    
    Input Schema:
    {
        "conversion_paths": [["channel1", "channel2", ...]],
        "channel_costs": {"channel": cost}
    }
    
    Output Schema:
    {
        "shapley_values": {"channel": float},
        "incremental_revenue": {"channel": float},
        "marginal_roas": {"channel": float},
        "path_analysis": object
    }
    """
    try:
        data = json.loads(raw_data)
        
        conversion_paths = data.get("conversion_paths", [])
        channel_costs = data.get("channel_costs", {})
        revenue_per_conversion = data.get("revenue_per_conversion", 100)
        
        if not conversion_paths:
            return json.dumps({
                "error": "No conversion paths provided",
                "shapley_values": {},
                "incremental_revenue": {},
                "marginal_roas": {}
            })
        
        # Extract unique channels
        all_channels = set()
        for path in conversion_paths:
            all_channels.update(path)
        
        # Limit channels if too many
        if len(all_channels) > model_config["max_channels"]:
            logger.warning(f"Too many channels ({len(all_channels)}), limiting to {model_config['max_channels']}")
            # Keep most frequent channels
            channel_freq = {}
            for path in conversion_paths:
                for c in path:
                    channel_freq[c] = channel_freq.get(c, 0) + 1
            sorted_channels = sorted(channel_freq.items(), key=lambda x: -x[1])
            all_channels = set(c for c, _ in sorted_channels[:model_config["max_channels"]])
            # Filter paths
            conversion_paths = [
                [c for c in path if c in all_channels]
                for path in conversion_paths
            ]
        
        # Calculate Shapley values
        shapley_values = calculate_shapley_values(conversion_paths, all_channels)
        
        # Calculate incremental revenue
        total_conversions = len(conversion_paths)
        total_revenue = total_conversions * revenue_per_conversion
        
        incremental_revenue = {
            channel: round(shapley * total_revenue, 2)
            for channel, shapley in shapley_values.items()
        }
        
        # Calculate marginal ROAS
        marginal_roas = {}
        for channel, revenue in incremental_revenue.items():
            cost = channel_costs.get(channel, 0)
            if cost > 0:
                marginal_roas[channel] = round(revenue / cost, 4)
            else:
                marginal_roas[channel] = None
        
        # Path analysis
        path_lengths = [len(p) for p in conversion_paths]
        channel_positions = {c: [] for c in all_channels}
        for path in conversion_paths:
            for i, c in enumerate(path):
                if c in channel_positions:
                    channel_positions[c].append(i / max(len(path) - 1, 1))
        
        avg_position = {
            c: round(np.mean(positions), 2) if positions else None
            for c, positions in channel_positions.items()
        }
        
        path_analysis = {
            "total_conversions": total_conversions,
            "total_revenue": total_revenue,
            "avg_path_length": round(np.mean(path_lengths), 2),
            "unique_channels": len(all_channels),
            "channel_avg_position": avg_position
        }
        
        response = {
            "shapley_values": {k: round(v, 4) for k, v in shapley_values.items()},
            "incremental_revenue": incremental_revenue,
            "marginal_roas": marginal_roas,
            "path_analysis": path_analysis
        }
        
        logger.info(f"Attribution complete: {len(all_channels)} channels, {total_conversions} paths")
        return json.dumps(response)
        
    except Exception as e:
        logger.error(f"Scoring error: {str(e)}")
        return json.dumps({
            "error": str(e),
            "shapley_values": {},
            "incremental_revenue": {},
            "marginal_roas": {}
        })
