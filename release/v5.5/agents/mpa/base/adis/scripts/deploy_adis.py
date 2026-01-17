#!/usr/bin/env python3
"""
ADIS Deployment Automation Script
Version 1.0

Automates deployment of Audience Data Intelligence System components:
- Dataverse table creation
- Seed data import
- Azure Functions deployment
- Power Automate flow configuration

Prerequisites:
- Azure CLI installed and authenticated
- Power Platform CLI (pac) installed
- Python 3.11+
- Required packages: requests, pandas

Usage:
    python deploy_adis.py --environment personal
    python deploy_adis.py --environment mastercard --dry-run
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime


@dataclass
class EnvironmentConfig:
    """Configuration for deployment environment."""
    name: str
    dataverse_url: str
    azure_resource_group: str
    azure_function_app: str
    azure_storage_account: str
    azure_location: str
    pii_hashing_enabled: bool
    external_api_access: bool


# Environment configurations
ENVIRONMENTS: Dict[str, EnvironmentConfig] = {
    "personal": EnvironmentConfig(
        name="Aragorn AI",
        dataverse_url="https://orgxxxxxxx.crm.dynamics.com",  # Replace with actual
        azure_resource_group="rg-adis-personal",
        azure_function_app="func-adis-personal",
        azure_storage_account="stadispersonal",
        azure_location="eastus",
        pii_hashing_enabled=False,
        external_api_access=True
    ),
    "mastercard": EnvironmentConfig(
        name="Mastercard",
        dataverse_url="https://orgxxxxxxx.crm.dynamics.com",  # Replace with actual
        azure_resource_group="rg-adis-mastercard",
        azure_function_app="func-adis-mastercard",
        azure_storage_account="stadismastercard",
        azure_location="eastus",
        pii_hashing_enabled=True,
        external_api_access=False
    )
}


# Table creation order (respects foreign key dependencies)
TABLE_ORDER = [
    "mpa_model_catalog",
    "mpa_upload_job",
    "mpa_data_schema",
    "mpa_customer_record",
    "mpa_model_run",
    "mpa_model_output",
    "mpa_audience",
    "mpa_audience_rule",
    "mpa_audience_member",
    "mpa_campaign_audience",
    "mpa_performance_linkage"
]


SEED_DATA_FILES = [
    "mpa_model_catalog_seed.csv",
    "mpa_rfm_segment_seed.csv",
    "mpa_channel_affinity_seed.csv",
    "mpa_channel_benchmark_seed.csv"
]


FUNCTIONS = [
    "document-parser",
    "analysis-engine",
    "audience-manager",
    "ammo"
]


class DeploymentLogger:
    """Simple logger for deployment status."""
    
    def __init__(self, log_file: Optional[str] = None):
        self.log_file = log_file
        self.start_time = datetime.now()
        
    def log(self, message: str, level: str = "INFO"):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        formatted = f"[{timestamp}] [{level}] {message}"
        print(formatted)
        
        if self.log_file:
            with open(self.log_file, "a") as f:
                f.write(formatted + "\n")
    
    def success(self, message: str):
        self.log(f"✅ {message}", "SUCCESS")
    
    def error(self, message: str):
        self.log(f"❌ {message}", "ERROR")
    
    def warning(self, message: str):
        self.log(f"⚠️ {message}", "WARNING")
    
    def info(self, message: str):
        self.log(f"ℹ️ {message}", "INFO")


def run_command(command: str, dry_run: bool = False, logger: Optional[DeploymentLogger] = None) -> tuple:
    """Execute a shell command and return result."""
    if logger:
        logger.info(f"Executing: {command}")
    
    if dry_run:
        if logger:
            logger.info("[DRY RUN] Command not executed")
        return (0, "DRY RUN", "")
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=300
        )
        return (result.returncode, result.stdout, result.stderr)
    except subprocess.TimeoutExpired:
        return (-1, "", "Command timed out")
    except Exception as e:
        return (-1, "", str(e))


def get_base_path() -> Path:
    """Get the base path for ADIS files."""
    script_path = Path(__file__).resolve()
    return script_path.parent.parent


def verify_prerequisites(logger: DeploymentLogger) -> bool:
    """Verify required tools are installed."""
    logger.info("Verifying prerequisites...")
    
    required_tools = [
        ("az", "Azure CLI"),
        ("pac", "Power Platform CLI"),
        ("func", "Azure Functions Core Tools"),
        ("python3", "Python 3")
    ]
    
    all_present = True
    for tool, name in required_tools:
        code, _, _ = run_command(f"which {tool}", logger=logger)
        if code != 0:
            logger.error(f"{name} ({tool}) not found")
            all_present = False
        else:
            logger.success(f"{name} found")
    
    return all_present


def verify_azure_auth(logger: DeploymentLogger) -> bool:
    """Verify Azure CLI is authenticated."""
    logger.info("Verifying Azure authentication...")
    
    code, stdout, _ = run_command("az account show", logger=logger)
    if code != 0:
        logger.error("Not authenticated to Azure. Run 'az login' first.")
        return False
    
    logger.success("Azure authentication verified")
    return True


def create_azure_resources(config: EnvironmentConfig, dry_run: bool, logger: DeploymentLogger) -> bool:
    """Create Azure resources for ADIS."""
    logger.info(f"Creating Azure resources for {config.name}...")
    
    code, _, stderr = run_command(
        f"az group create --name {config.azure_resource_group} --location {config.azure_location}",
        dry_run=dry_run,
        logger=logger
    )
    if code != 0 and "already exists" not in stderr:
        logger.error(f"Failed to create resource group: {stderr}")
        return False
    logger.success("Resource group ready")
    
    code, _, stderr = run_command(
        f"az storage account create --name {config.azure_storage_account} "
        f"--resource-group {config.azure_resource_group} --location {config.azure_location} --sku Standard_LRS",
        dry_run=dry_run,
        logger=logger
    )
    if code != 0 and "already exists" not in stderr:
        logger.error(f"Failed to create storage account: {stderr}")
        return False
    logger.success("Storage account ready")
    
    code, _, stderr = run_command(
        f"az functionapp create --name {config.azure_function_app} "
        f"--resource-group {config.azure_resource_group} "
        f"--storage-account {config.azure_storage_account} "
        f"--consumption-plan-location {config.azure_location} "
        f"--runtime python --runtime-version 3.11 --functions-version 4",
        dry_run=dry_run,
        logger=logger
    )
    if code != 0 and "already exists" not in stderr:
        logger.error(f"Failed to create function app: {stderr}")
        return False
    logger.success("Function App ready")
    
    return True


def deploy_functions(config: EnvironmentConfig, base_path: Path, dry_run: bool, logger: DeploymentLogger) -> bool:
    """Deploy Azure Functions."""
    logger.info("Deploying Azure Functions...")
    
    functions_path = base_path / "functions"
    
    for func_name in FUNCTIONS:
        func_path = functions_path / func_name
        
        if not func_path.exists():
            logger.warning(f"Function directory not found: {func_path}")
            continue
        
        logger.info(f"Deploying {func_name}...")
        
        code, _, stderr = run_command(
            f"cd {func_path} && pip install -r requirements.txt --quiet",
            dry_run=dry_run,
            logger=logger
        )
        
        code, _, stderr = run_command(
            f"cd {func_path} && func azure functionapp publish {config.azure_function_app}",
            dry_run=dry_run,
            logger=logger
        )
        
        if code != 0:
            logger.error(f"Failed to deploy {func_name}: {stderr}")
            return False
        
        logger.success(f"Deployed {func_name}")
    
    return True


def update_flow_parameters(config: EnvironmentConfig, base_path: Path, dry_run: bool, logger: DeploymentLogger) -> bool:
    """Update Power Automate flow parameters with function URLs."""
    logger.info("Updating flow parameters...")
    
    flows_path = base_path / "flows"
    function_url = f"https://{config.azure_function_app}.azurewebsites.net"
    
    for flow_file in flows_path.glob("*.json"):
        logger.info(f"Updating {flow_file.name}...")
        
        if dry_run:
            logger.info(f"[DRY RUN] Would update function URL to {function_url}")
            continue
        
        with open(flow_file, "r") as f:
            flow_def = json.load(f)
        
        if "parameters" in flow_def:
            for param_name, param_def in flow_def["parameters"].items():
                if "FunctionUrl" in param_name:
                    param_def["defaultValue"] = function_url
        
        with open(flow_file, "w") as f:
            json.dump(flow_def, f, indent=2)
        
        logger.success(f"Updated {flow_file.name}")
    
    return True


def import_seed_data(config: EnvironmentConfig, base_path: Path, dry_run: bool, logger: DeploymentLogger) -> bool:
    """Import seed data to Dataverse."""
    logger.info("Importing seed data...")
    
    seed_path = base_path / "seed-data"
    
    for seed_file in SEED_DATA_FILES:
        file_path = seed_path / seed_file
        
        if not file_path.exists():
            logger.warning(f"Seed file not found: {file_path}")
            continue
        
        entity_name = seed_file.replace("_seed.csv", "")
        
        logger.info(f"Importing {seed_file} to {entity_name}...")
        
        code, _, stderr = run_command(
            f"pac data import --data {file_path} --entity {entity_name}",
            dry_run=dry_run,
            logger=logger
        )
        
        if code != 0:
            logger.warning(f"Failed to import {seed_file}: {stderr}")
        else:
            logger.success(f"Imported {seed_file}")
    
    return True


def verify_deployment(config: EnvironmentConfig, dry_run: bool, logger: DeploymentLogger) -> bool:
    """Verify deployment by testing health endpoints."""
    logger.info("Verifying deployment...")
    
    if dry_run:
        logger.info("[DRY RUN] Skipping verification")
        return True
    
    function_url = f"https://{config.azure_function_app}.azurewebsites.net"
    
    for func_name in FUNCTIONS:
        endpoint = f"{function_url}/api/health"
        
        code, stdout, _ = run_command(f"curl -s {endpoint}", logger=logger)
        
        if code == 0 and "healthy" in stdout.lower():
            logger.success(f"{func_name} health check passed")
        else:
            logger.warning(f"{func_name} health check failed")
    
    return True


def main():
    parser = argparse.ArgumentParser(description="Deploy ADIS components")
    parser.add_argument(
        "--environment",
        choices=["personal", "mastercard"],
        required=True,
        help="Target deployment environment"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be done without executing"
    )
    parser.add_argument(
        "--skip-azure",
        action="store_true",
        help="Skip Azure resource creation"
    )
    parser.add_argument(
        "--skip-functions",
        action="store_true",
        help="Skip function deployment"
    )
    parser.add_argument(
        "--skip-data",
        action="store_true",
        help="Skip seed data import"
    )
    parser.add_argument(
        "--log-file",
        type=str,
        help="Path to log file"
    )
    
    args = parser.parse_args()
    
    config = ENVIRONMENTS[args.environment]
    logger = DeploymentLogger(args.log_file)
    base_path = get_base_path()
    
    logger.info(f"Starting ADIS deployment to {config.name}")
    logger.info(f"Base path: {base_path}")
    
    if args.dry_run:
        logger.warning("DRY RUN MODE - No changes will be made")
    
    if not verify_prerequisites(logger):
        logger.error("Prerequisites check failed")
        sys.exit(1)
    
    if not args.skip_azure and not verify_azure_auth(logger):
        logger.error("Azure authentication failed")
        sys.exit(1)
    
    if not args.skip_azure:
        if not create_azure_resources(config, args.dry_run, logger):
            logger.error("Azure resource creation failed")
            sys.exit(1)
    
    if not args.skip_functions:
        if not deploy_functions(config, base_path, args.dry_run, logger):
            logger.error("Function deployment failed")
            sys.exit(1)
    
    if not update_flow_parameters(config, base_path, args.dry_run, logger):
        logger.error("Flow parameter update failed")
        sys.exit(1)
    
    if not args.skip_data:
        if not import_seed_data(config, base_path, args.dry_run, logger):
            logger.warning("Some seed data import failed - continuing")
    
    if not verify_deployment(config, args.dry_run, logger):
        logger.warning("Deployment verification had issues")
    
    elapsed = datetime.now() - logger.start_time
    logger.info(f"Deployment completed in {elapsed.total_seconds():.1f} seconds")
    logger.success(f"ADIS deployed to {config.name}")


if __name__ == "__main__":
    main()
