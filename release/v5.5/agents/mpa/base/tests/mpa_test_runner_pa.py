#!/usr/bin/env python3
"""
MPA Copilot Instruction Optimization Framework - Power Automate Test Runner
Version 2.0

This script automates testing of MPA Copilot via Power Automate HTTP endpoints.
Works within Microsoft authentication boundary.

Requirements:
    pip install anthropic requests python-dotenv

Usage:
    1. Set up Power Automate flows (see MPA_Test_Harness_PowerAutomate.md)
    2. Copy .env.example to .env and fill in your endpoints/keys
    3. Run: python mpa_test_runner_pa.py
    4. View results in mpa_test_results.md
"""

import json
import os
import sys
import time
import uuid
from datetime import datetime
from typing import Optional, List, Dict
import requests

try:
    from anthropic import Anthropic
except ImportError:
    print("Error: anthropic package not installed. Run: pip install anthropic")
    sys.exit(1)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Warning: python-dotenv not installed. Using environment variables directly.")


# =============================================================================
# CONFIGURATION
# =============================================================================

class Config:
    """Configuration loaded from environment variables."""
    
    # Anthropic API for evaluation
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
    
    # Power Automate Flow URLs
    PA_SUBMIT_URL = os.getenv("PA_SUBMIT_URL", "")  # Flow 1: Submit tests
    PA_RESULTS_URL = os.getenv("PA_RESULTS_URL", "")  # Flow 3: Get results
    
    # Power Automate API Key (must match what's configured in flows)
    PA_API_KEY = os.getenv("PA_API_KEY", "")
    
    # Evaluation model
    EVAL_MODEL = os.getenv("EVAL_MODEL", "claude-sonnet-4-20250514")
    
    # Output settings
    OUTPUT_FILE = os.getenv("OUTPUT_FILE", "mpa_test_results.md")
    
    # Polling settings
    POLL_INTERVAL_SECONDS = int(os.getenv("POLL_INTERVAL_SECONDS", "10"))
    MAX_WAIT_SECONDS = int(os.getenv("MAX_WAIT_SECONDS", "300"))  # 5 minutes
    
    @classmethod
    def validate(cls):
        """Check required configuration is present."""
        errors = []
        if not cls.ANTHROPIC_API_KEY:
            errors.append("ANTHROPIC_API_KEY not set")
        if not cls.PA_SUBMIT_URL:
            errors.append("PA_SUBMIT_URL not set")
        if not cls.PA_RESULTS_URL:
            errors.append("PA_RESULTS_URL not set")
        if not cls.PA_API_KEY:
            errors.append("PA_API_KEY not set")
        return errors


# =============================================================================
# TEST CASES
# =============================================================================

TEST_CASES = [
    {
        "id": "A1",
        "name": "Basic Opening",
        "category": "Opening Sequence",
        "prompt": "Help me create a media plan",
        "behaviors": ["B01", "B02", "B03"],
        "pass_criteria": [
            "Warm greeting present",
            "All 10 focus areas mentioned (Outcomes, Economics, Audience, Geography, Budget, Value Proposition, Channels, Measurement, Testing, Risks)",
            "Ends with exactly one question about business outcome",
            "No technical jargon or system identifiers requested",
            "Response under 150 words"
        ],
        "red_flags": [
            "Asks for GUID, client_id, user_id, or any system identifier",
            "Multiple questions asked",
            "Discusses channels, timing, or budget before outcomes",
            "Overwhelming detail about each focus area",
            "Cold or robotic tone"
        ],
        "priority": "P1"
    },
    {
        "id": "A2",
        "name": "Direct Start",
        "category": "Opening Sequence",
        "prompt": "I need a media plan for a fintech app launch",
        "behaviors": ["B01", "B02", "B03", "B09"],
        "pass_criteria": [
            "Warm greeting present",
            "Acknowledges fintech app context",
            "Asks about business outcome or objective",
            "Single focused question",
            "Does not jump to channels or tactics"
        ],
        "red_flags": [
            "Jumps directly to channel recommendations",
            "Asks multiple questions",
            "Uses undefined technical jargon",
            "Ignores the fintech context provided"
        ],
        "priority": "P1"
    },
    {
        "id": "B2",
        "name": "Objective With Budget - Math Trigger",
        "category": "Step 1 Progression",
        "prompt": "We have 250K to acquire 5000 new app users",
        "behaviors": ["B13", "B14", "B17", "B19"],
        "pass_criteria": [
            "Calculates implied CAC ($50 = 250K/5000)",
            "Provides benchmark range for comparison",
            "Cites source for benchmark (web search, KB, or states estimate)",
            "Labels target as aggressive, typical, or conservative",
            "Asks single follow-up question or provides analysis"
        ],
        "red_flags": [
            "No calculation performed despite having budget and volume",
            "Benchmark provided without source citation",
            "Claims KB data without actually retrieving it",
            "Asks multiple questions instead of analyzing",
            "Does not assess feasibility"
        ],
        "priority": "P1"
    },
    {
        "id": "B3",
        "name": "Aggressive Target",
        "category": "Step 1 Progression",
        "prompt": "We need 10,000 customers for a 200K budget",
        "behaviors": ["B14", "B17", "B27"],
        "pass_criteria": [
            "Calculates $20 CAC (200K/10000)",
            "Explicitly flags target as aggressive or ambitious",
            "Provides benchmark comparison with source",
            "Notes need for tight targeting or efficient channel selection",
            "Frames path forward positively despite challenge"
        ],
        "red_flags": [
            "Accepts target without any challenge or validation",
            "No benchmark comparison",
            "Uses soft language that obscures the challenge",
            "Does not mention implications for targeting"
        ],
        "priority": "P1"
    },
    {
        "id": "C1",
        "name": "Premature Channel Question",
        "category": "Step Boundary Enforcement",
        "prompt": "What channels should we use?",
        "behaviors": ["B09", "B10", "B12"],
        "pass_criteria": [
            "Redirects to complete outcomes/economics first",
            "Explains why the order matters",
            "Does NOT provide channel recommendations",
            "Maintains warm, helpful tone while redirecting",
            "Offers to note the question for later"
        ],
        "red_flags": [
            "Provides channel recommendations",
            "Discusses media mix or channel strategy",
            "Dismissive or condescending redirect",
            "No explanation of why order matters"
        ],
        "priority": "P1"
    },
    {
        "id": "D2",
        "name": "Challenge Needed",
        "category": "Proactive Intelligence",
        "prompt": "Our target CAC is 10 dollars for a B2B SaaS product",
        "behaviors": ["B14", "B15", "B17", "B19"],
        "pass_criteria": [
            "Flags $10 CAC as very aggressive for B2B SaaS",
            "Provides typical B2B SaaS CAC benchmark with source",
            "Asks what evidence or data supports this target",
            "Constructive tone - challenges without discouraging"
        ],
        "red_flags": [
            "Accepts $10 CAC without question for B2B SaaS",
            "No benchmark comparison",
            "Benchmark without source",
            "Moves forward without validating the assumption"
        ],
        "priority": "P1"
    },
    {
        "id": "D3",
        "name": "Unrealistic Math Check",
        "category": "Proactive Intelligence",
        "prompt": "We want 50,000 customers from a 100K budget",
        "behaviors": ["B13", "B15", "B17"],
        "pass_criteria": [
            "Calculates $2 CAC (100K/50000)",
            "Strongly flags as unrealistic or extremely aggressive",
            "Provides context on typical CAC ranges",
            "Reframes the conversation constructively"
        ],
        "red_flags": [
            "Proceeds without commenting on the math",
            "Accepts the $2 CAC as plausible",
            "Calculates incorrectly",
            "Does not challenge the unrealistic target"
        ],
        "priority": "P1"
    },
    {
        "id": "E1",
        "name": "Benchmark Request",
        "category": "Source Transparency",
        "prompt": "What's a typical CAC for fintech apps?",
        "behaviors": ["B14", "B19", "B20"],
        "pass_criteria": [
            "Provides a CAC range",
            "Explicitly states source (web search, KB, or 'my estimate')",
            "If no citable data found, says so explicitly",
            "Provides context on what factors affect the range"
        ],
        "red_flags": [
            "Number without any source attribution",
            "Claims KB data without having retrieved it",
            "Presents estimate as fact",
            "Vague sourcing like 'industry data shows'"
        ],
        "priority": "P1"
    },
    {
        "id": "F1",
        "name": "Novice User - Terminology",
        "category": "Tone and Teaching",
        "prompt": "I'm new to media planning, what's CAC?",
        "behaviors": ["B07", "B22", "B23", "B24"],
        "pass_criteria": [
            "Defines CAC clearly (Customer Acquisition Cost)",
            "Explains why CAC matters for media planning",
            "Warm, encouraging tone",
            "No condescension or implication user should know this",
            "Invites follow-up questions"
        ],
        "red_flags": [
            "Assumes user should already know",
            "Uses more undefined jargon in the explanation",
            "Impatient or condescending tone",
            "Overly technical explanation"
        ],
        "priority": "P1"
    },
    {
        "id": "F2",
        "name": "ROAS Pushback",
        "category": "Tone and Teaching",
        "prompt": "I disagree, I think ROAS is the right primary metric for our campaign",
        "behaviors": ["B23", "B29", "B30"],
        "pass_criteria": [
            "Acknowledges their perspective respectfully",
            "Explains ROAS limitations (platform inflation, attribution issues)",
            "Recommends incrementality-validated alternatives",
            "Respects their decision if they still want ROAS",
            "Constructive, not dismissive"
        ],
        "red_flags": [
            "Dismissive of their view",
            "Backs down immediately without explanation",
            "Condescending tone",
            "Does not explain why ROAS is problematic"
        ],
        "priority": "P1"
    },
    {
        "id": "G1",
        "name": "Brand Campaign Rigor",
        "category": "Adaptive Rigor",
        "prompt": "This is an awareness campaign focused on brand building, not direct response",
        "behaviors": ["B26", "B28"],
        "pass_criteria": [
            "Acknowledges brand focus changes requirements",
            "Adjusts expectations (5-10 audience signals may suffice)",
            "Does not demand performance-level granularity",
            "Still ensures quality but appropriate to campaign type"
        ],
        "red_flags": [
            "Demands 30+ audience signals regardless",
            "Same rigor level as performance campaign",
            "Ignores the brand context",
            "Pushes for unnecessary detail"
        ],
        "priority": "P2"
    },
    {
        "id": "G2",
        "name": "Performance Campaign Rigor",
        "category": "Adaptive Rigor",
        "prompt": "This is a direct response campaign with aggressive efficiency targets we need to hit",
        "behaviors": ["B26", "B27"],
        "pass_criteria": [
            "Notes need for more granular audience definition",
            "Pushes for tighter targeting given aggressive goals",
            "Emphasizes importance of detail for performance",
            "Connects rigor to feasibility of hitting targets"
        ],
        "red_flags": [
            "Accepts minimal audience definition",
            "Same approach as brand campaign",
            "Does not connect detail level to target feasibility"
        ],
        "priority": "P2"
    }
]


# =============================================================================
# EVALUATION PROMPT
# =============================================================================

EVALUATION_SYSTEM_PROMPT = """You are an expert evaluator for a Media Planning AI Assistant (MPA Copilot). 
Your job is to evaluate the Copilot's response against specific behavioral criteria.

You must evaluate objectively and provide structured output in JSON format.
Be strict but fair - the goal is to identify where the instruction set needs improvement."""

def build_evaluation_prompt(test_case: dict, copilot_response: str) -> str:
    """Build the evaluation prompt for Claude."""
    return f"""Evaluate this MPA Copilot response against the defined criteria.

TEST CASE: {test_case['id']} - {test_case['name']}
CATEGORY: {test_case['category']}
PRIORITY: {test_case['priority']}

USER PROMPT:
{test_case['prompt']}

COPILOT RESPONSE:
{copilot_response}

PASS CRITERIA (response should meet ALL of these):
{chr(10).join(f"- {c}" for c in test_case['pass_criteria'])}

RED FLAGS (response should have NONE of these):
{chr(10).join(f"- {r}" for r in test_case['red_flags'])}

BEHAVIORS BEING TESTED: {', '.join(test_case['behaviors'])}

Evaluate the response and provide your assessment as a JSON object with this exact structure:
{{
    "overall_pass": true/false,
    "score": 1-5 (5=excellent, 4=good, 3=adequate, 2=poor, 1=failing),
    "criteria_results": [
        {{"criterion": "criterion text", "met": true/false, "notes": "brief explanation"}}
    ],
    "red_flags_found": [
        {{"flag": "flag text", "found": true/false, "evidence": "quote from response if found"}}
    ],
    "dimension_scores": {{
        "focus": 1-5,
        "intelligence": 1-5,
        "accuracy": 1-5,
        "tone": 1-5,
        "teaching": 1-5
    }},
    "failed_behaviors": ["B01", "B02"],
    "instruction_sections_to_review": ["SECTION NAME 1", "SECTION NAME 2"],
    "specific_issues": "Detailed description of what went wrong",
    "suggested_fix": "Specific suggestion for instruction improvement"
}}

Respond ONLY with the JSON object, no other text."""


# =============================================================================
# POWER AUTOMATE CLIENT
# =============================================================================

class PowerAutomateClient:
    """Client for interacting with Copilot via Power Automate flows."""
    
    def __init__(self, submit_url: str, results_url: str, api_key: str):
        self.submit_url = submit_url
        self.results_url = results_url
        self.api_key = api_key
        self.headers = {
            "Content-Type": "application/json",
            "X-API-Key": api_key
        }
    
    def submit_tests(self, tests: List[Dict], run_id: str) -> bool:
        """Submit a batch of tests for execution."""
        payload = {
            "run_id": run_id,
            "tests": [
                {
                    "test_id": t["id"],
                    "name": t["name"],
                    "category": t["category"],
                    "prompt": t["prompt"],
                    "priority": t["priority"]
                }
                for t in tests
            ]
        }
        
        try:
            response = requests.post(
                self.submit_url,
                headers=self.headers,
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            result = response.json()
            return result.get("success", False)
        except Exception as e:
            print(f"Error submitting tests: {e}")
            return False
    
    def get_results(self, run_id: str) -> Optional[Dict]:
        """Get results for a test run."""
        try:
            response = requests.get(
                f"{self.results_url}?run_id={run_id}",
                headers=self.headers,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error getting results: {e}")
            return None
    
    def wait_for_results(
        self, 
        run_id: str, 
        expected_count: int,
        poll_interval: int = 10,
        max_wait: int = 300
    ) -> Optional[Dict]:
        """Poll for results until all tests complete or timeout."""
        start_time = time.time()
        
        while time.time() - start_time < max_wait:
            results = self.get_results(run_id)
            
            if results:
                completed = len([r for r in results.get("results", []) if r.get("response")])
                print(f"  Progress: {completed}/{expected_count} tests complete")
                
                if completed >= expected_count:
                    return results
            
            time.sleep(poll_interval)
        
        print(f"  Timeout after {max_wait} seconds")
        return self.get_results(run_id)  # Return whatever we have


# =============================================================================
# MOCK CLIENT FOR TESTING WITHOUT POWER AUTOMATE
# =============================================================================

class MockPowerAutomateClient:
    """Mock client for testing the evaluation pipeline without Power Automate."""
    
    def __init__(self):
        self.mock_responses = {
            "Help me create a media plan": """Hi! I'm excited to build a media plan with you. We'll cover ten focus areas together: Outcomes, Economics, Audience, Geography, Budget, Value Proposition, Channels, Measurement, Testing, and Risks. This structure ensures nothing gets missed and each step builds on the last. What business outcome are you trying to achieve with this campaign?""",
            
            "I need a media plan for a fintech app launch": """Great! A fintech app launch is an exciting project. We'll work through this systematically to ensure you get the best possible results. What's the primary business outcome you're looking to achieve - are you focused on user acquisition, activation, or something else?""",
            
            "We have 250K to acquire 5000 new app users": """With a $250K budget targeting 5,000 users, you're looking at a $50 cost per acquisition. Based on my web search, fintech app installs typically run $60-100, so your $50 target is on the aggressive side. To hit this, we'll need tight audience targeting and efficient channel selection. What action defines a 'successful' user beyond just the install?""",
            
            "We need 10,000 customers for a 200K budget": """That's a $20 CAC target ($200K / 10,000). I have to be direct - this is very aggressive. Based on web research, typical customer acquisition costs in most categories run $50-150+. A $20 CAC would require extremely tight targeting and highly efficient channels. What's driving this efficiency target - is there flexibility, or is this a hard constraint?""",
            
            "What channels should we use?": """Good question, but let's make sure we set you up for success first. Channel selection depends heavily on your target audience and objectives, which we haven't fully defined yet. Once we nail down who you're trying to reach and what success looks like, the right channels will become much clearer. What business outcome are we optimizing for?""",
            
            "Our target CAC is 10 dollars for a B2B SaaS product": """A $10 CAC for B2B SaaS is extremely aggressive. Based on web research, B2B SaaS typically sees CACs of $200-500+ depending on contract value. At $10, you'd need viral growth or a very unique acquisition channel. What's informing this target - do you have historical data showing this is achievable, or is this aspirational?""",
            
            "We want 50,000 customers from a 100K budget": """Let me do the math here: $100K for 50,000 customers is a $2 CAC. I need to flag this as extremely unrealistic for virtually any paid acquisition channel. Even the most efficient campaigns rarely achieve sub-$10 CAC. Are we talking about paid acquisition, or do you have organic/viral growth assumptions built in? Let's recalibrate expectations so we can build a plan that actually delivers.""",
            
            "What's a typical CAC for fintech apps?": """Based on my web search, fintech app CACs typically range from $50-150 for basic installs, but can run $200-500+ when optimizing for activated, transacting users. The range depends heavily on: target audience specificity, geographic market, and how you define a 'successful' acquisition. I searched industry reports but exact figures vary significantly by fintech vertical. What type of fintech product are we planning for?""",
            
            "I'm new to media planning, what's CAC?": """Great question! CAC stands for Customer Acquisition Cost - it's simply how much you spend in marketing to acquire one new customer. You calculate it by dividing your total marketing spend by the number of customers acquired. For example, if you spend $10,000 and get 100 new customers, your CAC is $100. It's one of the most important metrics in media planning because it tells you if your marketing is efficient and sustainable. What other terms would be helpful to clarify?""",
            
            "I disagree, I think ROAS is the right primary metric for our campaign": """I hear you, and ROAS (Return on Ad Spend) is definitely popular and intuitive. Here's my concern: ad platforms tend to over-credit themselves due to attribution limitations, which inflates ROAS numbers. A campaign might show 5x ROAS in-platform but only deliver 2x incrementally. That said, you know your business best. If you prefer ROAS, I'd suggest complementing it with incrementality tests to validate the numbers. Would you like to proceed with ROAS as primary, or explore alternatives like blended CAC?""",
            
            "This is an awareness campaign focused on brand building, not direct response": """That's helpful context and changes our approach. For brand awareness, we're optimizing for reach and frequency rather than immediate conversions, so we can be more flexible on audience granularity. We'll still want clear audience definition, but 5-10 key demographic and behavioral signals should be sufficient rather than the 20-40 you'd need for performance campaigns. What's the primary audience you're trying to build awareness with?""",
            
            "This is a direct response campaign with aggressive efficiency targets we need to hit": """Understood - aggressive efficiency targets mean we need to be precise. For direct response, tight audience definition is critical. We'll want 20-40 demographic, behavioral, and contextual signals to ensure we're reaching high-intent users and minimizing waste. Every dollar needs to work hard. Let's make sure we define success metrics clearly first. What's your target efficiency metric - CAC, ROAS, or something else?"""
        }
        self.submitted_tests = []
    
    def submit_tests(self, tests: List[Dict], run_id: str) -> bool:
        self.submitted_tests = tests
        self.run_id = run_id
        return True
    
    def get_results(self, run_id: str) -> Optional[Dict]:
        results = []
        for test in self.submitted_tests:
            response = self.mock_responses.get(
                test["prompt"], 
                "I'm not sure how to respond to that."
            )
            results.append({
                "test_id": test["id"],
                "name": test["name"],
                "prompt": test["prompt"],
                "response": response,
                "response_time_ms": 2500,
                "executed_on": datetime.now().isoformat(),
                "error": None
            })
        
        return {
            "run_id": run_id,
            "total_tests": len(results),
            "results": results
        }
    
    def wait_for_results(self, run_id: str, expected_count: int, **kwargs) -> Optional[Dict]:
        time.sleep(1)  # Simulate brief delay
        return self.get_results(run_id)



# =============================================================================
# EVALUATOR
# =============================================================================

class ResponseEvaluator:
    """Evaluates Copilot responses using Claude."""
    
    def __init__(self, api_key: str, model: str = "claude-sonnet-4-20250514"):
        self.client = Anthropic(api_key=api_key)
        self.model = model
    
    def evaluate(self, test_case: dict, copilot_response: str) -> dict:
        """Evaluate a single response."""
        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                system=EVALUATION_SYSTEM_PROMPT,
                messages=[
                    {"role": "user", "content": build_evaluation_prompt(test_case, copilot_response)}
                ]
            )
            
            response_text = message.content[0].text
            
            try:
                if "```json" in response_text:
                    response_text = response_text.split("```json")[1].split("```")[0]
                elif "```" in response_text:
                    response_text = response_text.split("```")[1].split("```")[0]
                
                return json.loads(response_text.strip())
            except json.JSONDecodeError as e:
                return {
                    "error": f"Failed to parse evaluation JSON: {e}",
                    "raw_response": response_text,
                    "overall_pass": False,
                    "score": 0
                }
                
        except Exception as e:
            return {
                "error": f"Evaluation failed: {e}",
                "overall_pass": False,
                "score": 0
            }


# =============================================================================
# REPORT GENERATOR
# =============================================================================

class ReportGenerator:
    """Generates markdown report from test results."""
    
    def __init__(self):
        self.results = []
        self.timestamp = datetime.now().isoformat()
    
    def add_result(self, test_case: dict, copilot_response: str, evaluation: dict):
        """Add a test result."""
        self.results.append({
            "test_case": test_case,
            "response": copilot_response,
            "evaluation": evaluation
        })
    
    def generate(self) -> str:
        """Generate the markdown report."""
        lines = [
            "# MPA Copilot Test Results",
            f"Generated: {self.timestamp}",
            "",
            "## Summary",
            ""
        ]
        
        total = len(self.results)
        passed = sum(1 for r in self.results if r["evaluation"].get("overall_pass", False))
        failed = total - passed
        avg_score = sum(r["evaluation"].get("score", 0) for r in self.results) / total if total > 0 else 0
        
        lines.extend([
            f"- **Total Tests:** {total}",
            f"- **Passed:** {passed}",
            f"- **Failed:** {failed}",
            f"- **Pass Rate:** {passed/total*100:.1f}%" if total > 0 else "- **Pass Rate:** N/A",
            f"- **Average Score:** {avg_score:.2f}/5",
            ""
        ])
        
        failed_behaviors = set()
        sections_to_review = set()
        
        for r in self.results:
            if not r["evaluation"].get("overall_pass", False):
                failed_behaviors.update(r["evaluation"].get("failed_behaviors", []))
                sections_to_review.update(r["evaluation"].get("instruction_sections_to_review", []))
        
        if failed_behaviors:
            lines.extend([
                "## Failed Behaviors",
                "",
                "| Behavior | Count |",
                "|----------|-------|"
            ])
            behavior_counts = {}
            for r in self.results:
                for b in r["evaluation"].get("failed_behaviors", []):
                    behavior_counts[b] = behavior_counts.get(b, 0) + 1
            for b, count in sorted(behavior_counts.items(), key=lambda x: -x[1]):
                lines.append(f"| {b} | {count} |")
            lines.append("")
        
        if sections_to_review:
            lines.extend([
                "## Instruction Sections to Review",
                ""
            ])
            for section in sorted(sections_to_review):
                lines.append(f"- {section}")
            lines.append("")
        
        lines.extend([
            "## Detailed Results",
            ""
        ])
        
        for r in self.results:
            tc = r["test_case"]
            ev = r["evaluation"]
            status = "PASS" if ev.get("overall_pass", False) else "FAIL"
            score = ev.get("score", 0)
            
            lines.extend([
                f"### {tc['id']}: {tc['name']} [{status}] (Score: {score}/5)",
                "",
                f"**Category:** {tc['category']}",
                f"**Priority:** {tc['priority']}",
                "",
                "**User Prompt:**",
                f"> {tc['prompt']}",
                "",
                "**Copilot Response:**",
                f"> {r['response'][:500]}{'...' if len(r['response']) > 500 else ''}",
                ""
            ])
            
            dims = ev.get("dimension_scores", {})
            if dims:
                lines.extend([
                    "**Dimension Scores:**",
                    f"- Focus: {dims.get('focus', 'N/A')}/5",
                    f"- Intelligence: {dims.get('intelligence', 'N/A')}/5",
                    f"- Accuracy: {dims.get('accuracy', 'N/A')}/5",
                    f"- Tone: {dims.get('tone', 'N/A')}/5",
                    f"- Teaching: {dims.get('teaching', 'N/A')}/5",
                    ""
                ])
            
            if ev.get("specific_issues"):
                lines.extend([
                    "**Issues Found:**",
                    f"{ev['specific_issues']}",
                    ""
                ])
            
            if ev.get("suggested_fix"):
                lines.extend([
                    "**Suggested Fix:**",
                    f"{ev['suggested_fix']}",
                    ""
                ])
            
            red_flags_found = [rf for rf in ev.get("red_flags_found", []) if rf.get("found")]
            if red_flags_found:
                lines.extend([
                    "**Red Flags Found:**"
                ])
                for rf in red_flags_found:
                    lines.append(f"- {rf['flag']}: {rf.get('evidence', 'N/A')}")
                lines.append("")
            
            lines.append("---")
            lines.append("")
        
        return "\n".join(lines)


# =============================================================================
# MAIN RUNNER
# =============================================================================

def run_tests(use_mock: bool = False, test_ids: Optional[list] = None):
    """Run the test suite."""
    
    # Validate config
    errors = Config.validate()
    if errors and not use_mock:
        print("Configuration errors:")
        for e in errors:
            print(f"  - {e}")
        print("\nSet up your .env file or use --mock for testing without Power Automate.")
        sys.exit(1)
    
    # Initialize clients
    if use_mock:
        print("Using mock client for testing...")
        pa_client = MockPowerAutomateClient()
    else:
        print("Connecting via Power Automate...")
        pa_client = PowerAutomateClient(
            Config.PA_SUBMIT_URL,
            Config.PA_RESULTS_URL,
            Config.PA_API_KEY
        )
    
    evaluator = ResponseEvaluator(Config.ANTHROPIC_API_KEY, Config.EVAL_MODEL)
    report = ReportGenerator()
    
    # Filter test cases if specific IDs provided
    tests_to_run = TEST_CASES
    if test_ids:
        tests_to_run = [tc for tc in TEST_CASES if tc["id"] in test_ids]
    
    # Generate run ID
    run_id = f"run-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:6]}"
    
    print(f"\nRun ID: {run_id}")
    print(f"Tests to run: {len(tests_to_run)}")
    print("=" * 60)
    
    # Submit all tests
    print("\nSubmitting tests to Power Automate...")
    if not pa_client.submit_tests(tests_to_run, run_id):
        print("ERROR: Failed to submit tests")
        sys.exit(1)
    print(f"  Submitted {len(tests_to_run)} tests")
    
    # Wait for results
    print("\nWaiting for Copilot responses...")
    results = pa_client.wait_for_results(
        run_id,
        len(tests_to_run),
        poll_interval=Config.POLL_INTERVAL_SECONDS,
        max_wait=Config.MAX_WAIT_SECONDS
    )
    
    if not results or not results.get("results"):
        print("ERROR: No results received")
        sys.exit(1)
    
    print(f"\nReceived {len(results['results'])} results")
    
    # Build lookup for test cases
    test_case_map = {tc["id"]: tc for tc in tests_to_run}
    
    # Evaluate each result
    print("\nEvaluating responses with Claude...")
    print("=" * 60)
    
    for i, result in enumerate(results["results"], 1):
        test_id = result["test_id"]
        test_case = test_case_map.get(test_id)
        
        if not test_case:
            print(f"  [{i}] {test_id}: SKIP - test case not found")
            continue
        
        response = result.get("response", "[NO RESPONSE]")
        
        if result.get("error"):
            print(f"  [{i}] {test_id}: ERROR - {result['error']}")
            evaluation = {
                "overall_pass": False,
                "score": 0,
                "error": result["error"]
            }
        else:
            print(f"  [{i}] {test_id}: Evaluating...")
            evaluation = evaluator.evaluate(test_case, response)
            status = "PASS" if evaluation.get("overall_pass", False) else "FAIL"
            score = evaluation.get("score", 0)
            print(f"       Result: {status} (Score: {score}/5)")
        
        report.add_result(test_case, response, evaluation)
    
    # Generate report
    print("\n" + "=" * 60)
    print("Generating report...")
    
    report_content = report.generate()
    
    with open(Config.OUTPUT_FILE, "w") as f:
        f.write(report_content)
    
    print(f"Report saved to: {Config.OUTPUT_FILE}")
    
    # Print summary
    total = len(report.results)
    passed = sum(1 for r in report.results if r["evaluation"].get("overall_pass", False))
    print(f"\nSUMMARY: {passed}/{total} tests passed ({passed/total*100:.1f}%)")


# =============================================================================
# CLI
# =============================================================================

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(
        description="MPA Copilot Instruction Optimization - Power Automate Test Runner"
    )
    parser.add_argument(
        "--mock", 
        action="store_true", 
        help="Use mock responses instead of Power Automate"
    )
    parser.add_argument(
        "--tests", 
        nargs="+", 
        help="Run specific test IDs (e.g., A1 B2 C1)"
    )
    parser.add_argument(
        "--list", 
        action="store_true", 
        help="List all available test cases"
    )
    
    args = parser.parse_args()
    
    if args.list:
        print("Available Test Cases:")
        print("-" * 60)
        for tc in TEST_CASES:
            print(f"  {tc['id']:4} | {tc['priority']} | {tc['category']:25} | {tc['name']}")
        sys.exit(0)
    
    run_tests(use_mock=args.mock, test_ids=args.tests)
