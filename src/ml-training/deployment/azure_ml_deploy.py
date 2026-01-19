"""
Azure ML Model Deployment
Deploy trained models to Azure ML managed endpoints
"""

import logging
import os
from pathlib import Path
from typing import Any, Dict, Optional

from azure.ai.ml import MLClient
from azure.ai.ml.entities import (
    Environment,
    ManagedOnlineDeployment,
    ManagedOnlineEndpoint,
    Model,
    CodeConfiguration,
)
from azure.identity import DefaultAzureCredential

from kdap_ml.config import load_config

logger = logging.getLogger(__name__)


class AzureMLDeployer:
    """
    Deploy models to Azure ML managed online endpoints.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or load_config()
        self.ml_client = self._create_ml_client()
    
    def _create_ml_client(self) -> MLClient:
        """Create Azure ML client."""
        azure_config = self.config.get('azure_ml', {})
        
        credential = DefaultAzureCredential()
        
        return MLClient(
            credential=credential,
            subscription_id=azure_config.get('subscription_id'),
            resource_group_name=azure_config.get('resource_group'),
            workspace_name=azure_config.get('workspace_name'),
        )
    
    def register_model(
        self,
        model_path: str,
        model_name: str,
        model_version: Optional[str] = None,
        description: Optional[str] = None,
        tags: Optional[Dict[str, str]] = None,
    ) -> Model:
        """
        Register a model in Azure ML workspace.
        
        Args:
            model_path: Local path to model file
            model_name: Name for the registered model
            model_version: Optional version string
            description: Model description
            tags: Model tags
            
        Returns:
            Registered model object
        """
        logger.info(f"Registering model: {model_name}")
        
        model = Model(
            path=model_path,
            name=model_name,
            version=model_version,
            description=description or f"KDAP {model_name} model",
            tags=tags or {},
        )
        
        registered_model = self.ml_client.models.create_or_update(model)
        
        logger.info(f"Model registered: {registered_model.name}:{registered_model.version}")
        return registered_model
    
    def create_environment(
        self,
        name: str,
        conda_file: Optional[str] = None,
        docker_image: Optional[str] = None,
    ) -> Environment:
        """
        Create or get Azure ML environment for deployment.
        
        Args:
            name: Environment name
            conda_file: Path to conda environment file
            docker_image: Base Docker image
            
        Returns:
            Environment object
        """
        logger.info(f"Creating environment: {name}")
        
        if conda_file:
            env = Environment(
                name=name,
                conda_file=conda_file,
                image=docker_image or "mcr.microsoft.com/azureml/openmpi4.1.0-ubuntu20.04",
            )
        else:
            # Use curated environment
            env = Environment(
                name=name,
                image="mcr.microsoft.com/azureml/sklearn-1.0-ubuntu20.04-py38-cpu:latest",
            )
        
        return self.ml_client.environments.create_or_update(env)
    
    def create_endpoint(
        self,
        endpoint_name: str,
        description: Optional[str] = None,
        auth_mode: str = "key",
    ) -> ManagedOnlineEndpoint:
        """
        Create a managed online endpoint.
        
        Args:
            endpoint_name: Name for the endpoint
            description: Endpoint description
            auth_mode: Authentication mode ('key' or 'aml_token')
            
        Returns:
            Created endpoint
        """
        logger.info(f"Creating endpoint: {endpoint_name}")
        
        endpoint = ManagedOnlineEndpoint(
            name=endpoint_name,
            description=description or f"KDAP {endpoint_name} endpoint",
            auth_mode=auth_mode,
            tags={"platform": "kdap"},
        )
        
        try:
            existing = self.ml_client.online_endpoints.get(endpoint_name)
            logger.info(f"Endpoint already exists: {endpoint_name}")
            return existing
        except Exception:
            created = self.ml_client.online_endpoints.begin_create_or_update(endpoint).result()
            logger.info(f"Endpoint created: {endpoint_name}")
            return created
    
    def create_deployment(
        self,
        endpoint_name: str,
        deployment_name: str,
        model_name: str,
        model_version: str,
        scoring_script: str,
        environment_name: str,
        instance_type: str = "Standard_DS2_v2",
        instance_count: int = 1,
    ) -> ManagedOnlineDeployment:
        """
        Create a deployment for an endpoint.
        
        Args:
            endpoint_name: Target endpoint name
            deployment_name: Name for this deployment
            model_name: Registered model name
            model_version: Model version
            scoring_script: Path to scoring script
            environment_name: Environment name
            instance_type: VM size
            instance_count: Number of instances
            
        Returns:
            Created deployment
        """
        logger.info(f"Creating deployment: {deployment_name} on {endpoint_name}")
        
        # Get model
        model = self.ml_client.models.get(model_name, model_version)
        
        # Get environment
        environment = self.ml_client.environments.get(environment_name, label="latest")
        
        deployment = ManagedOnlineDeployment(
            name=deployment_name,
            endpoint_name=endpoint_name,
            model=model,
            environment=environment,
            code_configuration=CodeConfiguration(
                code="./scoring",
                scoring_script=scoring_script,
            ),
            instance_type=instance_type,
            instance_count=instance_count,
        )
        
        created = self.ml_client.online_deployments.begin_create_or_update(deployment).result()
        
        # Set as default deployment
        endpoint = self.ml_client.online_endpoints.get(endpoint_name)
        endpoint.traffic = {deployment_name: 100}
        self.ml_client.online_endpoints.begin_create_or_update(endpoint).result()
        
        logger.info(f"Deployment created and set as default: {deployment_name}")
        return created
    
    def deploy_model(
        self,
        model_path: str,
        model_name: str,
        endpoint_name: str,
        deployment_name: str,
        scoring_script: str,
        instance_type: str = "Standard_DS2_v2",
        instance_count: int = 1,
    ) -> Dict[str, Any]:
        """
        Full deployment pipeline: register model, create endpoint, deploy.
        
        Args:
            model_path: Local path to model
            model_name: Model name
            endpoint_name: Endpoint name
            deployment_name: Deployment name
            scoring_script: Scoring script path
            instance_type: VM size
            instance_count: Number of instances
            
        Returns:
            Deployment information
        """
        logger.info(f"Starting full deployment for {model_name}")
        
        # Register model
        model = self.register_model(
            model_path=model_path,
            model_name=model_name,
            tags={"deployed": "true"},
        )
        
        # Create environment
        env_name = f"{model_name}-env"
        environment = self.create_environment(name=env_name)
        
        # Create endpoint
        endpoint = self.create_endpoint(endpoint_name=endpoint_name)
        
        # Create deployment
        deployment = self.create_deployment(
            endpoint_name=endpoint_name,
            deployment_name=deployment_name,
            model_name=model_name,
            model_version=model.version,
            scoring_script=scoring_script,
            environment_name=env_name,
            instance_type=instance_type,
            instance_count=instance_count,
        )
        
        # Get endpoint URL
        endpoint = self.ml_client.online_endpoints.get(endpoint_name)
        
        return {
            "model_name": model_name,
            "model_version": model.version,
            "endpoint_name": endpoint_name,
            "deployment_name": deployment_name,
            "scoring_uri": endpoint.scoring_uri,
            "status": "deployed",
        }
    
    def test_endpoint(
        self,
        endpoint_name: str,
        test_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Test an endpoint with sample data.
        
        Args:
            endpoint_name: Endpoint to test
            test_data: Test input data
            
        Returns:
            Endpoint response
        """
        import json
        
        response = self.ml_client.online_endpoints.invoke(
            endpoint_name=endpoint_name,
            request_file=None,
            deployment_name=None,
            input=json.dumps(test_data),
        )
        
        return json.loads(response)
    
    def delete_deployment(
        self,
        endpoint_name: str,
        deployment_name: str,
    ) -> None:
        """Delete a deployment."""
        logger.info(f"Deleting deployment: {deployment_name}")
        self.ml_client.online_deployments.begin_delete(
            endpoint_name=endpoint_name,
            name=deployment_name,
        ).result()
    
    def delete_endpoint(self, endpoint_name: str) -> None:
        """Delete an endpoint."""
        logger.info(f"Deleting endpoint: {endpoint_name}")
        self.ml_client.online_endpoints.begin_delete(name=endpoint_name).result()


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    
    # Example usage (requires Azure credentials)
    deployer = AzureMLDeployer()
    
    # Deploy budget optimizer
    result = deployer.deploy_model(
        model_path="./models/budget_optimizer.joblib",
        model_name="kdap-budget-optimizer",
        endpoint_name="kdap-budget-optimizer",
        deployment_name="budget-optimizer-v1",
        scoring_script="score_budget.py",
    )
    
    print(f"Deployment result: {result}")
