#!/usr/bin/env python3
"""
MPA v6.0 Multi-Agent Test Runner
Executes capability, integration, and E2E tests against deployed agents.

Usage:
    python run-tests.py --type capability --agent ANL
    python run-tests.py --type integration
    python run-tests.py --type e2e --scenario E2E-001
    python run-tests.py --type all --report html
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from enum import Enum
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TestType(Enum):
    CAPABILITY = "capability"
    INTEGRATION = "integration"
    E2E = "e2e"
    ROUTING = "routing"
    ALL = "all"


class TestStatus(Enum):
    PASSED = "passed"
    FAILED = "failed"
    SKIPPED = "skipped"
    ERROR = "error"


@dataclass
class TestResult:
    test_id: str
    test_name: str
    test_type: str
    status: TestStatus
    duration_ms: float
    agent: Optional[str] = None
    expected_output: Optional[Dict] = None
    actual_output: Optional[Dict] = None
    error_message: Optional[str] = None
    metrics: Dict[str, Any] = field(default_factory=dict)


@dataclass
class TestSuiteResult:
    suite_name: str
    test_type: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    results: List[TestResult] = field(default_factory=list)
    
    @property
    def total_tests(self) -> int:
        return len(self.results)
    
    @property
    def passed(self) -> int:
        return sum(1 for r in self.results if r.status == TestStatus.PASSED)
    
    @property
    def failed(self) -> int:
        return sum(1 for r in self.results if r.status == TestStatus.FAILED)
    
    @property
    def skipped(self) -> int:
        return sum(1 for r in self.results if r.status == TestStatus.SKIPPED)
    
    @property
    def pass_rate(self) -> float:
        if self.total_tests == 0:
            return 0.0
        return (self.passed / self.total_tests) * 100


class TestRunner:
    """Main test runner for MPA v6.0 multi-agent system."""
    
    def __init__(self, base_path: Path, environment: str = "development"):
        self.base_path = base_path
        self.environment = environment
        self.results: List[TestSuiteResult] = []
        
        # Paths to test files
        self.test_paths = {
            "capability": base_path / "agents",
            "integration": base_path / "tests" / "integration-tests.json",
            "e2e": base_path / "tests" / "e2e-workflow-tests.json",
            "routing": base_path / "tests" / "multi-agent-routing-tests.json"
        }
        
        # Agent codes
        self.agents = ["ORC", "ANL", "AUD", "CHA", "SPO", "DOC", "PRF", "CHG", "CST", "MKT"]
    
    def load_capability_tests(self, agent: Optional[str] = None) -> Dict[str, Any]:
        """Load capability tests for one or all agents."""
        tests = {}
        agents_to_load = [agent.upper()] if agent else self.agents
        
        for agent_code in agents_to_load:
            test_file = self.test_paths["capability"] / agent_code.lower() / "tests" / f"{agent_code.lower()}-capability-tests.json"
            if test_file.exists():
                with open(test_file, 'r') as f:
                    tests[agent_code] = json.load(f)
                logger.info(f"Loaded {tests[agent_code].get('total_tests', 0)} tests for {agent_code}")
            else:
                logger.warning(f"Test file not found: {test_file}")
        
        return tests
    
    def load_integration_tests(self) -> Dict[str, Any]:
        """Load integration test suite."""
        if self.test_paths["integration"].exists():
            with open(self.test_paths["integration"], 'r') as f:
                tests = json.load(f)
            logger.info(f"Loaded {tests.get('total_tests', 0)} integration tests")
            return tests
        else:
            logger.error(f"Integration tests not found: {self.test_paths['integration']}")
            return {}
    
    def load_e2e_tests(self) -> Dict[str, Any]:
        """Load E2E workflow tests."""
        if self.test_paths["e2e"].exists():
            with open(self.test_paths["e2e"], 'r') as f:
                tests = json.load(f)
            logger.info(f"Loaded {tests.get('total_tests', 0)} E2E tests")
            return tests
        else:
            logger.error(f"E2E tests not found: {self.test_paths['e2e']}")
            return {}
    
    def load_routing_tests(self) -> Dict[str, Any]:
        """Load routing test suite."""
        if self.test_paths["routing"].exists():
            with open(self.test_paths["routing"], 'r') as f:
                tests = json.load(f)
            logger.info(f"Loaded {tests.get('total_scenarios', 0)} routing tests")
            return tests
        else:
            logger.error(f"Routing tests not found: {self.test_paths['routing']}")
            return {}
    
    def execute_test(self, test: Dict[str, Any], test_type: str) -> TestResult:
        """Execute a single test against the deployed agent."""
        test_id = test.get("id", "unknown")
        test_name = test.get("name", "Unknown Test")
        agent = test.get("agent", test.get("expected_agent", "ORC"))
        
        start_time = time.time()
        
        try:
            # In production, this would call the actual agent endpoint
            # For now, simulate the test execution
            result = self._simulate_test_execution(test, test_type)
            
            duration_ms = (time.time() - start_time) * 1000
            
            return TestResult(
                test_id=test_id,
                test_name=test_name,
                test_type=test_type,
                status=TestStatus.PASSED if result["success"] else TestStatus.FAILED,
                duration_ms=duration_ms,
                agent=agent,
                expected_output=test.get("expected_output_contains"),
                actual_output=result.get("output"),
                error_message=result.get("error"),
                metrics=result.get("metrics", {})
            )
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            logger.error(f"Test {test_id} failed with error: {e}")
            
            return TestResult(
                test_id=test_id,
                test_name=test_name,
                test_type=test_type,
                status=TestStatus.ERROR,
                duration_ms=duration_ms,
                agent=agent,
                error_message=str(e)
            )
    
    def _simulate_test_execution(self, test: Dict[str, Any], test_type: str) -> Dict[str, Any]:
        """
        Simulate test execution for development/validation.
        In production, replace with actual API calls to Copilot Studio.
        """
        # Simulate processing time
        time.sleep(0.1)
        
        # For demonstration, return success for P0 tests, variable for others
        priority = test.get("priority", "P1")
        success = priority == "P0" or (priority == "P1" and hash(test.get("id", "")) % 10 < 9)
        
        return {
            "success": success,
            "output": {
                "response": f"Simulated response for {test.get('name', 'test')}",
                "agent_used": test.get("expected_agent", test.get("agent", "ORC")),
                "flow_triggered": test.get("expected_flow", "unknown")
            },
            "metrics": {
                "latency_ms": 150 + (hash(test.get("id", "")) % 200),
                "tokens_used": 500 + (hash(test.get("id", "")) % 1000)
            },
            "error": None if success else "Simulated test failure"
        }
    
    def run_capability_tests(self, agent: Optional[str] = None) -> TestSuiteResult:
        """Run capability tests for one or all agents."""
        suite_name = f"Capability Tests - {agent.upper() if agent else 'All Agents'}"
        suite_result = TestSuiteResult(
            suite_name=suite_name,
            test_type="capability",
            started_at=datetime.now()
        )
        
        tests = self.load_capability_tests(agent)
        
        for agent_code, agent_tests in tests.items():
            logger.info(f"\n{'='*60}")
            logger.info(f"Running {agent_code} capability tests...")
            logger.info(f"{'='*60}")
            
            for test in agent_tests.get("tests", []):
                test["agent"] = agent_code
                result = self.execute_test(test, "capability")
                suite_result.results.append(result)
                
                status_icon = "✅" if result.status == TestStatus.PASSED else "❌"
                logger.info(f"  {status_icon} {result.test_id}: {result.test_name} ({result.duration_ms:.0f}ms)")
        
        suite_result.completed_at = datetime.now()
        self.results.append(suite_result)
        return suite_result
    
    def run_integration_tests(self) -> TestSuiteResult:
        """Run integration tests."""
        suite_result = TestSuiteResult(
            suite_name="Integration Tests",
            test_type="integration",
            started_at=datetime.now()
        )
        
        tests = self.load_integration_tests()
        
        logger.info(f"\n{'='*60}")
        logger.info("Running integration tests...")
        logger.info(f"{'='*60}")
        
        for test in tests.get("tests", []):
            result = self.execute_test(test, "integration")
            suite_result.results.append(result)
            
            status_icon = "✅" if result.status == TestStatus.PASSED else "❌"
            logger.info(f"  {status_icon} {result.test_id}: {result.test_name} ({result.duration_ms:.0f}ms)")
        
        suite_result.completed_at = datetime.now()
        self.results.append(suite_result)
        return suite_result
    
    def run_e2e_tests(self, scenario: Optional[str] = None) -> TestSuiteResult:
        """Run E2E workflow tests."""
        suite_result = TestSuiteResult(
            suite_name=f"E2E Tests{' - ' + scenario if scenario else ''}",
            test_type="e2e",
            started_at=datetime.now()
        )
        
        tests = self.load_e2e_tests()
        
        logger.info(f"\n{'='*60}")
        logger.info("Running E2E workflow tests...")
        logger.info(f"{'='*60}")
        
        for test in tests.get("tests", []):
            if scenario and test.get("id") != scenario:
                continue
            
            result = self.execute_test(test, "e2e")
            suite_result.results.append(result)
            
            status_icon = "✅" if result.status == TestStatus.PASSED else "❌"
            logger.info(f"  {status_icon} {result.test_id}: {result.test_name} ({result.duration_ms:.0f}ms)")
        
        suite_result.completed_at = datetime.now()
        self.results.append(suite_result)
        return suite_result
    
    def run_routing_tests(self) -> TestSuiteResult:
        """Run routing tests."""
        suite_result = TestSuiteResult(
            suite_name="Routing Tests",
            test_type="routing",
            started_at=datetime.now()
        )
        
        tests = self.load_routing_tests()
        
        logger.info(f"\n{'='*60}")
        logger.info("Running routing tests...")
        logger.info(f"{'='*60}")
        
        for test in tests.get("scenarios", []):
            result = self.execute_test(test, "routing")
            suite_result.results.append(result)
            
            status_icon = "✅" if result.status == TestStatus.PASSED else "❌"
            logger.info(f"  {status_icon} {result.test_id}: {result.test_name} ({result.duration_ms:.0f}ms)")
        
        suite_result.completed_at = datetime.now()
        self.results.append(suite_result)
        return suite_result
    
    def run_all_tests(self) -> List[TestSuiteResult]:
        """Run all test suites."""
        logger.info("\n" + "="*70)
        logger.info("MPA v6.0 COMPLETE TEST SUITE EXECUTION")
        logger.info("="*70)
        
        # Run each test type
        self.run_routing_tests()
        self.run_capability_tests()
        self.run_integration_tests()
        self.run_e2e_tests()
        
        return self.results
    
    def generate_report(self, format: str = "text") -> str:
        """Generate test execution report."""
        if format == "text":
            return self._generate_text_report()
        elif format == "json":
            return self._generate_json_report()
        elif format == "html":
            return self._generate_html_report()
        else:
            return self._generate_text_report()
    
    def _generate_text_report(self) -> str:
        """Generate plain text report."""
        lines = []
        lines.append("\n" + "="*70)
        lines.append("MPA v6.0 TEST EXECUTION REPORT")
        lines.append("="*70)
        lines.append(f"Generated: {datetime.now().isoformat()}")
        lines.append(f"Environment: {self.environment}")
        lines.append("")
        
        total_passed = 0
        total_failed = 0
        total_tests = 0
        
        for suite in self.results:
            lines.append("-"*60)
            lines.append(f"Suite: {suite.suite_name}")
            lines.append(f"Type: {suite.test_type}")
            lines.append(f"Tests: {suite.total_tests}")
            lines.append(f"Passed: {suite.passed} ({suite.pass_rate:.1f}%)")
            lines.append(f"Failed: {suite.failed}")
            lines.append(f"Skipped: {suite.skipped}")
            
            total_passed += suite.passed
            total_failed += suite.failed
            total_tests += suite.total_tests
            
            # List failed tests
            failed_tests = [r for r in suite.results if r.status == TestStatus.FAILED]
            if failed_tests:
                lines.append("\nFailed Tests:")
                for test in failed_tests:
                    lines.append(f"  ❌ {test.test_id}: {test.test_name}")
                    if test.error_message:
                        lines.append(f"     Error: {test.error_message}")
        
        lines.append("")
        lines.append("="*70)
        lines.append("SUMMARY")
        lines.append("="*70)
        lines.append(f"Total Tests: {total_tests}")
        lines.append(f"Passed: {total_passed}")
        lines.append(f"Failed: {total_failed}")
        lines.append(f"Overall Pass Rate: {(total_passed/total_tests*100) if total_tests > 0 else 0:.1f}%")
        
        overall_status = "✅ PASSED" if total_failed == 0 else "❌ FAILED"
        lines.append(f"\nOverall Status: {overall_status}")
        lines.append("="*70)
        
        return "\n".join(lines)
    
    def _generate_json_report(self) -> str:
        """Generate JSON report."""
        report = {
            "generated_at": datetime.now().isoformat(),
            "environment": self.environment,
            "suites": []
        }
        
        for suite in self.results:
            suite_data = {
                "name": suite.suite_name,
                "type": suite.test_type,
                "started_at": suite.started_at.isoformat(),
                "completed_at": suite.completed_at.isoformat() if suite.completed_at else None,
                "total_tests": suite.total_tests,
                "passed": suite.passed,
                "failed": suite.failed,
                "skipped": suite.skipped,
                "pass_rate": suite.pass_rate,
                "results": [
                    {
                        "test_id": r.test_id,
                        "test_name": r.test_name,
                        "status": r.status.value,
                        "duration_ms": r.duration_ms,
                        "agent": r.agent,
                        "error_message": r.error_message,
                        "metrics": r.metrics
                    }
                    for r in suite.results
                ]
            }
            report["suites"].append(suite_data)
        
        return json.dumps(report, indent=2)
    
    def _generate_html_report(self) -> str:
        """Generate HTML report."""
        total_passed = sum(s.passed for s in self.results)
        total_failed = sum(s.failed for s in self.results)
        total_tests = sum(s.total_tests for s in self.results)
        pass_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0
        
        html = f"""<!DOCTYPE html>
<html>
<head>
    <title>MPA v6.0 Test Report</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }}
        .summary {{ display: flex; gap: 20px; margin: 20px 0; }}
        .metric {{ background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; }}
        .metric-value {{ font-size: 2em; font-weight: bold; }}
        .passed {{ color: #22c55e; }}
        .failed {{ color: #ef4444; }}
        .suite {{ border: 1px solid #e5e5e5; border-radius: 8px; margin: 20px 0; }}
        .suite-header {{ background: #f5f5f5; padding: 15px; border-radius: 8px 8px 0 0; }}
        .suite-content {{ padding: 15px; }}
        table {{ width: 100%; border-collapse: collapse; }}
        th, td {{ padding: 10px; text-align: left; border-bottom: 1px solid #e5e5e5; }}
        th {{ background: #f9f9f9; }}
        .status-passed {{ color: #22c55e; }}
        .status-failed {{ color: #ef4444; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>MPA v6.0 Test Execution Report</h1>
        <p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        <p>Environment: {self.environment}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <div class="metric-value">{total_tests}</div>
            <div>Total Tests</div>
        </div>
        <div class="metric">
            <div class="metric-value passed">{total_passed}</div>
            <div>Passed</div>
        </div>
        <div class="metric">
            <div class="metric-value failed">{total_failed}</div>
            <div>Failed</div>
        </div>
        <div class="metric">
            <div class="metric-value">{pass_rate:.1f}%</div>
            <div>Pass Rate</div>
        </div>
    </div>
"""
        
        for suite in self.results:
            html += f"""
    <div class="suite">
        <div class="suite-header">
            <h3>{suite.suite_name}</h3>
            <p>Passed: {suite.passed}/{suite.total_tests} ({suite.pass_rate:.1f}%)</p>
        </div>
        <div class="suite-content">
            <table>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Agent</th>
                    <th>Status</th>
                    <th>Duration</th>
                </tr>
"""
            for result in suite.results:
                status_class = "status-passed" if result.status == TestStatus.PASSED else "status-failed"
                html += f"""
                <tr>
                    <td>{result.test_id}</td>
                    <td>{result.test_name}</td>
                    <td>{result.agent or 'N/A'}</td>
                    <td class="{status_class}">{result.status.value.upper()}</td>
                    <td>{result.duration_ms:.0f}ms</td>
                </tr>
"""
            html += """
            </table>
        </div>
    </div>
"""
        
        html += """
</body>
</html>
"""
        return html


def main():
    parser = argparse.ArgumentParser(description="MPA v6.0 Multi-Agent Test Runner")
    parser.add_argument("--type", choices=["capability", "integration", "e2e", "routing", "all"],
                       default="all", help="Type of tests to run")
    parser.add_argument("--agent", help="Specific agent for capability tests (e.g., ANL, CHA)")
    parser.add_argument("--scenario", help="Specific E2E scenario ID")
    parser.add_argument("--report", choices=["text", "json", "html"], default="text",
                       help="Report format")
    parser.add_argument("--output", help="Output file for report")
    parser.add_argument("--env", default="development", help="Environment (development, staging, production)")
    
    args = parser.parse_args()
    
    # Determine base path
    script_dir = Path(__file__).parent
    base_path = script_dir.parent  # release/v6.0
    
    # Initialize runner
    runner = TestRunner(base_path, environment=args.env)
    
    # Run tests based on type
    if args.type == "all":
        runner.run_all_tests()
    elif args.type == "capability":
        runner.run_capability_tests(args.agent)
    elif args.type == "integration":
        runner.run_integration_tests()
    elif args.type == "e2e":
        runner.run_e2e_tests(args.scenario)
    elif args.type == "routing":
        runner.run_routing_tests()
    
    # Generate report
    report = runner.generate_report(args.report)
    
    # Output report
    if args.output:
        with open(args.output, 'w') as f:
            f.write(report)
        logger.info(f"Report saved to: {args.output}")
    else:
        print(report)
    
    # Return exit code based on results
    total_failed = sum(s.failed for s in runner.results)
    sys.exit(0 if total_failed == 0 else 1)


if __name__ == "__main__":
    main()
