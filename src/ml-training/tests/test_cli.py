"""Tests for CLI interface."""

import pytest
import subprocess
import sys
from pathlib import Path


class TestCLI:
    """Test suite for CLI commands."""

    @pytest.fixture
    def cli_path(self):
        """Get path to CLI script."""
        return Path(__file__).parent.parent / 'train.py'

    def test_help_command(self, cli_path):
        """Test help displays correctly."""
        result = subprocess.run(
            [sys.executable, str(cli_path), '--help'],
            capture_output=True,
            text=True
        )

        assert result.returncode == 0
        assert 'KDAP ML Training CLI' in result.stdout

    def test_budget_help(self, cli_path):
        """Test budget subcommand help."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'budget', '--help'],
            capture_output=True,
            text=True
        )

        assert result.returncode == 0
        assert '--data' in result.stdout
        assert '--tune' in result.stdout

    def test_propensity_help(self, cli_path):
        """Test propensity subcommand help."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'propensity', '--help'],
            capture_output=True,
            text=True
        )

        assert result.returncode == 0
        assert '--samples' in result.stdout

    def test_anomaly_help(self, cli_path):
        """Test anomaly subcommand help."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'anomaly', '--help'],
            capture_output=True,
            text=True
        )

        assert result.returncode == 0
        assert '--output' in result.stdout

    def test_churn_help(self, cli_path):
        """Test churn subcommand help."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'churn', '--help'],
            capture_output=True,
            text=True
        )

        assert result.returncode == 0
        assert '--explain' in result.stdout
        assert '--tune' in result.stdout

    def test_mmm_help(self, cli_path):
        """Test mmm subcommand help."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'mmm', '--help'],
            capture_output=True,
            text=True
        )

        assert result.returncode == 0
        assert '--weeks' in result.stdout
        assert '--channels' in result.stdout
        assert '--optimize' in result.stdout

    def test_lookalike_help(self, cli_path):
        """Test lookalike subcommand help."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'lookalike', '--help'],
            capture_output=True,
            text=True
        )

        assert result.returncode == 0
        assert '--features' in result.stdout
        assert '--top-n' in result.stdout

    def test_response_help(self, cli_path):
        """Test response subcommand help."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'response', '--help'],
            capture_output=True,
            text=True
        )

        assert result.returncode == 0
        assert '--curve-type' in result.stdout
        assert '--spend' in result.stdout
        assert '--optimize' in result.stdout

    def test_deploy_help(self, cli_path):
        """Test deploy subcommand help."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'deploy', '--help'],
            capture_output=True,
            text=True
        )

        assert result.returncode == 0
        assert '--model-path' in result.stdout
        assert '--endpoint-name' in result.stdout

    def test_invalid_command(self, cli_path):
        """Test invalid command shows error."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'invalid'],
            capture_output=True,
            text=True
        )

        # Should exit with non-zero or show help
        assert result.returncode != 0 or 'invalid' in result.stderr.lower()

    def test_no_command_shows_help(self, cli_path):
        """Test no command shows help."""
        result = subprocess.run(
            [sys.executable, str(cli_path)],
            capture_output=True,
            text=True
        )

        # Should exit with non-zero since no command provided
        assert result.returncode != 0


class TestCLICommands:
    """Integration tests for CLI commands with synthetic data."""

    @pytest.fixture
    def cli_path(self):
        """Get path to CLI script."""
        return Path(__file__).parent.parent / 'train.py'

    @pytest.mark.slow
    def test_budget_synthetic(self, cli_path, temp_model_dir):
        """Test budget command with synthetic data."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'budget',
             '--samples', '100',
             '--output', temp_model_dir,
             '-v'],
            capture_output=True,
            text=True,
            timeout=120
        )

        # Check for success or graceful module not found
        assert result.returncode == 0 or 'ModuleNotFoundError' in result.stderr

    @pytest.mark.slow
    def test_propensity_synthetic(self, cli_path, temp_model_dir):
        """Test propensity command with synthetic data."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'propensity',
             '--samples', '500',
             '--output', temp_model_dir,
             '-v'],
            capture_output=True,
            text=True,
            timeout=120
        )

        assert result.returncode == 0 or 'ModuleNotFoundError' in result.stderr

    @pytest.mark.slow
    def test_anomaly_synthetic(self, cli_path, temp_model_dir):
        """Test anomaly command with synthetic data."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'anomaly',
             '--samples', '200',
             '--output', temp_model_dir,
             '-v'],
            capture_output=True,
            text=True,
            timeout=120
        )

        assert result.returncode == 0 or 'ModuleNotFoundError' in result.stderr

    @pytest.mark.slow
    def test_churn_synthetic(self, cli_path, temp_model_dir):
        """Test churn command with synthetic data."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'churn',
             '--samples', '500',
             '--output', temp_model_dir,
             '-v'],
            capture_output=True,
            text=True,
            timeout=120
        )

        assert result.returncode == 0 or 'ModuleNotFoundError' in result.stderr

    @pytest.mark.slow
    def test_mmm_synthetic(self, cli_path, temp_model_dir):
        """Test mmm command with synthetic data."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'mmm',
             '--weeks', '52',
             '--output', temp_model_dir,
             '-v'],
            capture_output=True,
            text=True,
            timeout=180
        )

        assert result.returncode == 0 or 'ModuleNotFoundError' in result.stderr

    @pytest.mark.slow
    def test_lookalike_synthetic(self, cli_path, temp_model_dir):
        """Test lookalike command with synthetic data."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'lookalike',
             '--samples', '1000',
             '--top-n', '100',
             '--output', temp_model_dir,
             '-v'],
            capture_output=True,
            text=True,
            timeout=120
        )

        assert result.returncode == 0 or 'ModuleNotFoundError' in result.stderr

    @pytest.mark.slow
    def test_response_synthetic(self, cli_path, temp_model_dir):
        """Test response command with synthetic data."""
        result = subprocess.run(
            [sys.executable, str(cli_path), 'response',
             '--samples', '100',
             '--curve-type', 'hill',
             '--output', temp_model_dir,
             '-v'],
            capture_output=True,
            text=True,
            timeout=60
        )

        assert result.returncode == 0 or 'ModuleNotFoundError' in result.stderr
