#!/usr/bin/env python
"""
KDAP ML Training CLI
Command-line interface for training and deploying KDAP models
"""

import argparse
import logging
import sys
from pathlib import Path

import pandas as pd


def setup_logging(verbose: bool = False):
    """Setup logging configuration."""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    )


def train_budget_optimizer(args):
    """Train budget optimizer model."""
    from kdap_ml.budget_optimizer import BudgetOptimizerTrainer, generate_synthetic_data
    
    trainer = BudgetOptimizerTrainer()
    
    # Load data
    if args.data:
        df = trainer.load_data(args.data)
    else:
        logging.info("Generating synthetic data...")
        df = generate_synthetic_data(n_samples=args.samples or 10000)
    
    # Prepare data
    X_train, X_val, X_test, y_train, y_val, y_test = trainer.prepare_data(
        df, target_col=args.target or 'optimal_spend_ratio'
    )
    
    # Tune hyperparameters if requested
    if args.tune:
        trainer.tune_hyperparameters(X_train, y_train, X_val, y_val, n_trials=args.trials or 50)
    
    # Train
    trainer.train(X_train, y_train, X_val, y_val)
    
    # Evaluate
    metrics = trainer.evaluate(X_test, y_test)
    print(f"\nFinal metrics: {metrics}")
    
    # Save
    model_path = trainer.save_model(args.output)
    print(f"\nModel saved to: {model_path}")
    
    # Log to MLflow
    if args.mlflow:
        run_id = trainer.log_to_mlflow()
        print(f"MLflow run ID: {run_id}")
    
    return trainer


def train_propensity(args):
    """Train propensity model."""
    from kdap_ml.propensity import PropensityTrainer, generate_synthetic_data
    
    trainer = PropensityTrainer()
    
    if args.data:
        df = trainer.load_data(args.data)
    else:
        logging.info("Generating synthetic data...")
        df = generate_synthetic_data(n_samples=args.samples or 50000)
        df = df.drop(columns=['customer_id'])
    
    X_train, X_val, X_test, y_train, y_val, y_test = trainer.prepare_data(
        df, target_col=args.target or 'converted'
    )
    
    if args.tune:
        trainer.tune_hyperparameters(X_train, y_train, X_val, y_val, n_trials=args.trials or 50)
    
    trainer.train(X_train, y_train, X_val, y_val)
    trainer.calibrate_probabilities(X_val, y_val)
    trainer.find_optimal_threshold(X_val, y_val)
    
    metrics = trainer.evaluate(X_test, y_test)
    print(f"\nFinal metrics: {metrics}")
    
    model_path = trainer.save_model(args.output)
    print(f"\nModel saved to: {model_path}")
    
    if args.mlflow:
        run_id = trainer.log_to_mlflow()
        print(f"MLflow run ID: {run_id}")
    
    return trainer


def train_anomaly_detector(args):
    """Train anomaly detector model."""
    from kdap_ml.anomaly_detector import AnomalyDetectorTrainer, generate_synthetic_data
    
    trainer = AnomalyDetectorTrainer()
    
    if args.data:
        df = trainer.load_data(args.data)
    else:
        logging.info("Generating synthetic data...")
        df = generate_synthetic_data(n_samples=args.samples or 1000)
    
    df_features = trainer.extract_time_series_features(df, 'metric_value', 'timestamp')
    
    X_train, X_val, X_test, y_train, y_val, y_test = trainer.prepare_data(
        df_features, target_col=args.target or 'is_anomaly'
    )
    
    trainer.train(X_train)
    
    metrics = trainer.evaluate(X_test, y_test)
    print(f"\nFinal metrics: {metrics}")
    
    model_path = trainer.save_model(args.output)
    print(f"\nModel saved to: {model_path}")
    
    if args.mlflow:
        run_id = trainer.log_to_mlflow()
        print(f"MLflow run ID: {run_id}")
    
    return trainer


def deploy_model(args):
    """Deploy model to Azure ML."""
    from deployment.azure_ml_deploy import AzureMLDeployer
    
    deployer = AzureMLDeployer()
    
    result = deployer.deploy_model(
        model_path=args.model_path,
        model_name=args.model_name,
        endpoint_name=args.endpoint_name,
        deployment_name=args.deployment_name,
        scoring_script=args.scoring_script,
        instance_type=args.instance_type or "Standard_DS2_v2",
        instance_count=args.instance_count or 1,
    )
    
    print(f"\nDeployment result: {result}")


def main():
    parser = argparse.ArgumentParser(
        description='KDAP ML Training CLI',
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument('-v', '--verbose', action='store_true', help='Verbose output')
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Budget optimizer
    budget_parser = subparsers.add_parser('budget', help='Train budget optimizer')
    budget_parser.add_argument('--data', type=str, help='Path to training data')
    budget_parser.add_argument('--target', type=str, help='Target column name')
    budget_parser.add_argument('--samples', type=int, help='Number of synthetic samples')
    budget_parser.add_argument('--output', type=str, default='./models', help='Output directory')
    budget_parser.add_argument('--tune', action='store_true', help='Tune hyperparameters')
    budget_parser.add_argument('--trials', type=int, help='Number of tuning trials')
    budget_parser.add_argument('--mlflow', action='store_true', help='Log to MLflow')
    
    # Propensity
    propensity_parser = subparsers.add_parser('propensity', help='Train propensity model')
    propensity_parser.add_argument('--data', type=str, help='Path to training data')
    propensity_parser.add_argument('--target', type=str, help='Target column name')
    propensity_parser.add_argument('--samples', type=int, help='Number of synthetic samples')
    propensity_parser.add_argument('--output', type=str, default='./models', help='Output directory')
    propensity_parser.add_argument('--tune', action='store_true', help='Tune hyperparameters')
    propensity_parser.add_argument('--trials', type=int, help='Number of tuning trials')
    propensity_parser.add_argument('--mlflow', action='store_true', help='Log to MLflow')
    
    # Anomaly detector
    anomaly_parser = subparsers.add_parser('anomaly', help='Train anomaly detector')
    anomaly_parser.add_argument('--data', type=str, help='Path to training data')
    anomaly_parser.add_argument('--target', type=str, help='Target column name')
    anomaly_parser.add_argument('--samples', type=int, help='Number of synthetic samples')
    anomaly_parser.add_argument('--output', type=str, default='./models', help='Output directory')
    anomaly_parser.add_argument('--mlflow', action='store_true', help='Log to MLflow')
    
    # Deploy
    deploy_parser = subparsers.add_parser('deploy', help='Deploy model to Azure ML')
    deploy_parser.add_argument('--model-path', type=str, required=True, help='Path to model file')
    deploy_parser.add_argument('--model-name', type=str, required=True, help='Model name')
    deploy_parser.add_argument('--endpoint-name', type=str, required=True, help='Endpoint name')
    deploy_parser.add_argument('--deployment-name', type=str, required=True, help='Deployment name')
    deploy_parser.add_argument('--scoring-script', type=str, required=True, help='Scoring script')
    deploy_parser.add_argument('--instance-type', type=str, help='VM instance type')
    deploy_parser.add_argument('--instance-count', type=int, help='Number of instances')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    setup_logging(args.verbose)
    
    if args.command == 'budget':
        train_budget_optimizer(args)
    elif args.command == 'propensity':
        train_propensity(args)
    elif args.command == 'anomaly':
        train_anomaly_detector(args)
    elif args.command == 'deploy':
        deploy_model(args)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == '__main__':
    main()
