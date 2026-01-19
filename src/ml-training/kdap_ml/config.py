"""
Configuration Management for KDAP ML Training
"""

import os
import re
from pathlib import Path
from typing import Any, Dict, Optional

import yaml
from dotenv import load_dotenv


def _substitute_env_vars(config: Dict[str, Any]) -> Dict[str, Any]:
    """Recursively substitute environment variables in config."""
    result = {}
    for key, value in config.items():
        if isinstance(value, dict):
            result[key] = _substitute_env_vars(value)
        elif isinstance(value, str):
            # Match ${VAR_NAME} pattern
            pattern = r'\$\{([^}]+)\}'
            matches = re.findall(pattern, value)
            for var_name in matches:
                env_value = os.environ.get(var_name, '')
                value = value.replace(f'${{{var_name}}}', env_value)
            result[key] = value
        elif isinstance(value, list):
            result[key] = [
                _substitute_env_vars(item) if isinstance(item, dict) else item
                for item in value
            ]
        else:
            result[key] = value
    return result


def load_config(config_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Load main configuration file.
    
    Args:
        config_path: Path to config file. If None, uses default.
        
    Returns:
        Configuration dictionary with env vars substituted.
    """
    load_dotenv()
    
    if config_path is None:
        config_path = Path(__file__).parent.parent / "config" / "config.yaml"
    else:
        config_path = Path(config_path)
    
    if not config_path.exists():
        raise FileNotFoundError(f"Configuration file not found: {config_path}")
    
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    
    return _substitute_env_vars(config)


def get_model_config(model_name: str, config_dir: Optional[str] = None) -> Dict[str, Any]:
    """
    Load model-specific configuration.
    
    Args:
        model_name: Name of the model (e.g., 'budget_optimizer', 'propensity')
        config_dir: Directory containing config files. If None, uses default.
        
    Returns:
        Model configuration dictionary.
    """
    load_dotenv()
    
    if config_dir is None:
        config_dir = Path(__file__).parent.parent / "config"
    else:
        config_dir = Path(config_dir)
    
    config_path = config_dir / f"{model_name}.yaml"
    
    if not config_path.exists():
        raise FileNotFoundError(f"Model config not found: {config_path}")
    
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    
    return _substitute_env_vars(config)


def merge_configs(*configs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Deep merge multiple configuration dictionaries.
    Later configs override earlier ones.
    """
    result = {}
    for config in configs:
        for key, value in config.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = merge_configs(result[key], value)
            else:
                result[key] = value
    return result


class ConfigManager:
    """Centralized configuration management."""
    
    _instance = None
    _config: Dict[str, Any] = {}
    _model_configs: Dict[str, Dict[str, Any]] = {}
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def load(self, config_path: Optional[str] = None) -> None:
        """Load main configuration."""
        self._config = load_config(config_path)
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value by dot-notation key."""
        keys = key.split('.')
        value = self._config
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        return value
    
    def get_model_config(self, model_name: str) -> Dict[str, Any]:
        """Get model-specific configuration."""
        if model_name not in self._model_configs:
            self._model_configs[model_name] = get_model_config(model_name)
        return self._model_configs[model_name]
    
    @property
    def azure_ml(self) -> Dict[str, Any]:
        """Azure ML configuration."""
        return self._config.get('azure_ml', {})
    
    @property
    def training(self) -> Dict[str, Any]:
        """Training configuration."""
        return self._config.get('training', {})
    
    @property
    def evaluation(self) -> Dict[str, Any]:
        """Evaluation configuration."""
        return self._config.get('evaluation', {})


# Global config manager instance
config_manager = ConfigManager()
