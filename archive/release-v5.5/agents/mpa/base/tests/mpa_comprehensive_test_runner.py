#!/usr/bin/env python3
"""
MPA Comprehensive Test Runner for VS Code Claude
Version 1.0

This script runs the comprehensive test suite against MPA Copilot and scores responses.
Designed to be executed by VS Code Claude for iterative testing before Braintrust.

Requirements:
    pip install anthropic requests python-dotenv aiohttp

Usage:
    python mpa_comprehensive_test_runner.py --scenario FULL-001
    python mpa_comprehensive_test_runner.py --all
    python mpa_comprehensive_test_runner.py --category "End-to-End Linear"
"""

import json
import os
import sys
import time
import asyncio
import aiohttp
import re
from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple
from dataclasses import dataclass, field, asdict
from pathlib import Path

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

@dataclass
class Config:
    """Configuration loaded from environment variables."""
    
    # Anthropic API for scoring
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    
    # Copilot Studio Direct Line (if available)
    DIRECTLINE_SECRET: str = os.getenv("DIRECTLINE_SECRET", "")
    DIRECTLINE_ENDPOINT: str = os.getenv("DIRECTLINE_ENDPOINT", "https://directline.botframework.com/v3/directline")
    
    # Power Automate endpoints (alternative)
    PA_CONVERSATION_URL: str = os.getenv("PA_CONVERSATION_URL", "")
    PA_API_KEY: str = os.getenv("PA_API_KEY", "")
    
    # Scoring model
    SCORING_MODEL: str = os.getenv("SCORING_MODEL", "claude-sonnet-4-20250514")
    
    # Output settings
    OUTPUT_DIR: str = os.getenv("OUTPUT_DIR", "./test_results")
    
    # Timeouts
    RESPONSE_TIMEOUT: int = int(os.getenv("RESPONSE_TIMEOUT", "60"))
    TURN_DELAY: float = float(os.getenv("TURN_DELAY", "2.0"))
    
    def validate(self) -> List[str]:
        """Check required configuration is present."""
        errors = []
        if not self.ANTHROPIC_API_KEY:
            errors.append("ANTHROPIC_API_KEY not set")
        if not self.DIRECTLINE_SECRET and not self.PA_CONVERSATION_URL:
            errors.append("Either DIRECTLINE_SECRET or PA_CONVERSATION_URL must be set")
        return errors


config = Config()


# =============================================================================
# DATA CLASSES
# =============================================================================

@dataclass
class TurnResult:
    """Result of a single conversation turn."""
    turn_number: int
    user_input: str
    agent_response: str
    response_time_ms: int
    scores: Dict[str, float] = field(default_factory=dict)
    score_details: Dict[str, Any] = field(default_factory=dict)
    passed_behaviors: List[str] = field(default_factory=list)
    failed_behaviors: List[str] = field(default_factory=list)
    issues: List[str] = field(default_factory=list)


@dataclass
class ScenarioResult:
    """Result of a complete test scenario."""
    scenario_id: str
    scenario_name: str
    category: str
    total_turns: int
    completed_turns: int
    turn_results: List[TurnResult] = field(default_factory=list)
    overall_scores: Dict[str, float] = field(default_factory=dict)
    passed: bool = False
    error: Optional[str] = None
    start_time: str = ""
    end_time: str = ""
    duration_seconds: float = 0.0


# =============================================================================
# COPILOT CLIENT
# =============================================================================

class CopilotClient:
    """Client for interacting with MPA Copilot."""
    
    def __init__(self, config: Config):
        self.config = config
        self.conversation_id: Optional[str] = None
        self.conversation_history: List[Dict] = []
        
    async def start_conversation(self) -> bool:
        """Start a new conversation session."""
        if self.config.DIRECTLINE_SECRET:
            return await self._start_directline_conversation()
        else:
            return await self._start_pa_conversation()
    
    async def _start_directline_conversation(self) -> bool:
        """Start conversation via Direct Line."""
        async with aiohttp.ClientSession() as session:
            headers = {
                "Authorization": f"Bearer {self.config.DIRECTLINE_SECRET}",
                "Content-Type": "application/json"
            }
            async with session.post(
                f"{self.config.DIRECTLINE_ENDPOINT}/conversations",
                headers=headers
            ) as response:
                if response.status == 201:
                    data = await response.json()
                    self.conversation_id = data.get("conversationId")
                    return True
                return False
    
    async def _start_pa_conversation(self) -> bool:
        """Start conversation via Power Automate."""
        async with aiohttp.ClientSession() as session:
            headers = {
                "Content-Type": "application/json",
                "X-API-Key": self.config.PA_API_KEY
            }
            payload = {"action": "start_conversation"}
            async with session.post(
                self.config.PA_CONVERSATION_URL,
                headers=headers,
                json=payload
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    self.conversation_id = data.get("conversation_id")
                    return True
                return False
    
    async def send_message(self, message: str) -> Tuple[str, int]:
        """Send a message and get response. Returns (response, response_time_ms)."""
        start_time = time.time()
        
        if self.config.DIRECTLINE_SECRET:
            response = await self._send_directline_message(message)
        else:
            response = await self._send_pa_message(message)
        
        response_time_ms = int((time.time() - start_time) * 1000)
        
        self.conversation_history.append({
            "role": "user",
            "content": message
        })
        self.conversation_history.append({
            "role": "assistant",
            "content": response
        })
        
        return response, response_time_ms
    
    async def _send_directline_message(self, message: str) -> str:
        """Send message via Direct Line."""
        async with aiohttp.ClientSession() as session:
            headers = {
                "Authorization": f"Bearer {self.config.DIRECTLINE_SECRET}",
                "Content-Type": "application/json"
            }
            
            # Send message
            payload = {
                "type": "message",
                "from": {"id": "test_user"},
                "text": message
            }
            async with session.post(
                f"{self.config.DIRECTLINE_ENDPOINT}/conversations/{self.conversation_id}/activities",
                headers=headers,
                json=payload
            ) as response:
                if response.status != 200:
                    return "[ERROR: Failed to send message]"
            
            # Poll for response
            watermark = None
            for _ in range(self.config.RESPONSE_TIMEOUT):
                url = f"{self.config.DIRECTLINE_ENDPOINT}/conversations/{self.conversation_id}/activities"
                if watermark:
                    url += f"?watermark={watermark}"
                    
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        watermark = data.get("watermark")
                        for activity in data.get("activities", []):
                            if activity.get("from", {}).get("id") != "test_user":
                                if activity.get("type") == "message":
                                    return activity.get("text", "[NO TEXT]")
                
                await asyncio.sleep(1)
            
            return "[ERROR: Response timeout]"
    
    async def _send_pa_message(self, message: str) -> str:
        """Send message via Power Automate."""
        async with aiohttp.ClientSession() as session:
            headers = {
                "Content-Type": "application/json",
                "X-API-Key": self.config.PA_API_KEY
            }
            payload = {
                "action": "send_message",
                "conversation_id": self.conversation_id,
                "message": message
            }
            
            async with session.post(
                self.config.PA_CONVERSATION_URL,
                headers=headers,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=self.config.RESPONSE_TIMEOUT)
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("response", "[NO RESPONSE]")
                return f"[ERROR: HTTP {response.status}]"
    
    def get_conversation_history(self) -> List[Dict]:
        """Get the full conversation history."""
        return self.conversation_history.copy()
    
    def reset(self):
        """Reset for a new conversation."""
        self.conversation_id = None
        self.conversation_history = []


# =============================================================================
# MOCK CLIENT FOR LOCAL TESTING
# =============================================================================

class MockCopilotClient:
    """Mock client for testing the framework without Copilot connection."""
    
    def __init__(self):
        self.conversation_history: List[Dict] = []
        self.turn_count = 0
        
    async def start_conversation(self) -> bool:
        self.turn_count = 0
        self.conversation_history = []
        return True
    
    async def send_message(self, message: str) -> Tuple[str, int]:
        self.turn_count += 1
        
        # Simulate response based on message content
        response = self._generate_mock_response(message)
        response_time_ms = 1500 + (self.turn_count * 100)
        
        self.conversation_history.append({"role": "user", "content": message})
        self.conversation_history.append({"role": "assistant", "content": response})
        
        return response, response_time_ms
    
    def _generate_mock_response(self, message: str) -> str:
        """Generate a mock response based on message patterns."""
        message_lower = message.lower()
        
        if self.turn_count == 1 or "help" in message_lower:
            return """Hi! I'm excited to build a media plan with you. We'll cover ten areas: Outcomes, Economics, Audience, Geography, Budget, Value Proposition, Channels, Measurement, Testing, and Risks.

What business outcome are you trying to achieve?"""
        
        if "budget" in message_lower and any(c.isdigit() for c in message):
            # Extract numbers
            numbers = re.findall(r'\d+[,\d]*', message)
            if len(numbers) >= 2:
                budget = int(numbers[0].replace(',', ''))
                target = int(numbers[1].replace(',', ''))
                cac = budget / target if target > 0 else 0
                return f"""${budget:,} divided by {target:,} equals ${cac:.0f} cost per customer.

Based on web search, typical acquisition costs in this space run $40-80. Your ${cac:.0f} target is {"aggressive" if cac < 40 else "typical" if cac < 80 else "conservative"}.

What defines success for a new customer - signup, first purchase, or retained at 30 days?"""
        
        if "channel" in message_lower:
            return """For your objectives and audience, I'd recommend a mix of:

Paid social (Meta, TikTok) for awareness and prospecting.
Paid search (Google) for intent capture.
Programmatic display for retargeting.

Based on KB benchmarks, this mix typically delivers efficient acquisition for similar campaigns.

How should we allocate budget across these channels?"""
        
        if "summarize" in message_lower or "summary" in message_lower:
            return """Here's your media plan summary:

Objective: Customer acquisition
Target: Based on our discussion
Budget: As specified
Channels: Paid social, paid search, programmatic
Measurement: Cost per acquisition with incrementality validation

All assumptions are marked. You can adjust any element as we refine."""
        
        return """I understand. Let me continue building your plan.

Based on what you've shared, I'll incorporate this into our strategy.

What would you like to focus on next?"""
    
    def get_conversation_history(self) -> List[Dict]:
        return self.conversation_history.copy()
    
    def reset(self):
        self.turn_count = 0
        self.conversation_history = []


# =============================================================================
# SCORERS
# =============================================================================

class Scorers:
    """Implementation of all scoring functions."""
    
    def __init__(self, anthropic_client: Anthropic, model: str):
        self.client = anthropic_client
        self.model = model
    
    def score_response_length(self, response: str) -> Tuple[float, Dict]:
        """Check if response is under 75 words."""
        word_count = len(response.strip().split())
        if word_count <= 75:
            return 1.0, {"word_count": word_count, "status": "optimal"}
        elif word_count <= 150:
            return 0.5, {"word_count": word_count, "status": "acceptable"}
        return 0.0, {"word_count": word_count, "status": "too_long"}
    
    def score_single_question(self, response: str) -> Tuple[float, Dict]:
        """Check if response contains only one question."""
        question_count = response.count('?')
        if question_count <= 1:
            return 1.0, {"question_count": question_count, "status": "pass"}
        return 0.0, {"question_count": question_count, "status": "multiple_questions"}
    
    def score_acronym_definition(self, response: str) -> Tuple[float, Dict]:
        """Check if acronyms are defined on first use."""
        acronyms = ["CAC", "ROAS", "LTV", "CPM", "CPA", "CPC", "CTR", "CVR", "AOV", "MQL", "SQL"]
        definitions = {
            "CAC": r"[Cc]ustomer [Aa]cquisition [Cc]ost",
            "ROAS": r"[Rr]eturn [Oo]n [Aa]d [Ss]pend",
            "LTV": r"[Ll]ifetime [Vv]alue",
            "CPM": r"[Cc]ost [Pp]er ([Tt]housand|[Mm]ille)",
            "CPA": r"[Cc]ost [Pp]er [Aa]cquisition",
            "CPC": r"[Cc]ost [Pp]er [Cc]lick",
            "CTR": r"[Cc]lick.?[Tt]hrough [Rr]ate",
            "CVR": r"[Cc]onversion [Rr]ate",
            "AOV": r"[Aa]verage [Oo]rder [Vv]alue",
            "MQL": r"[Mm]arketing [Qq]ualified [Ll]ead",
            "SQL": r"[Ss]ales [Qq]ualified [Ll]ead"
        }
        
        used = []
        undefined = []
        
        for acronym in acronyms:
            if re.search(rf'\b{acronym}\b', response):
                used.append(acronym)
                if acronym in definitions and not re.search(definitions[acronym], response):
                    undefined.append(acronym)
        
        if not used:
            return 1.0, {"used": [], "undefined": [], "status": "no_acronyms"}
        
        score = 1.0 - (len(undefined) / len(used)) if used else 1.0
        return score, {"used": used, "undefined": undefined, "status": "pass" if not undefined else "fail"}
    
    def score_source_citation(self, response: str) -> Tuple[float, Dict]:
        """Check if data claims have source attribution."""
        has_numbers = bool(re.search(r'\$[\d,]+|\d+%|\d+\s*(dollars|percent|customers|users)', response, re.I))
        
        if not has_numbers:
            return 1.0, {"has_data": False, "status": "no_data_claims"}
        
        source_patterns = [
            r'based on your input',
            r'based on (kb|knowledge base)',
            r'based on web search',
            r'based on.*research',
            r'my estimate',
            r'i searched',
            r'according to',
            r'from.*benchmarks',
            r'industry.*typical',
            r'market.*shows'
        ]
        
        has_source = any(re.search(p, response, re.I) for p in source_patterns)
        return (1.0 if has_source else 0.0), {
            "has_data": True, 
            "has_source": has_source, 
            "status": "cited" if has_source else "uncited"
        }
    
    def score_step_boundary(self, response: str, current_step: int = 1) -> Tuple[float, Dict]:
        """Check if response avoids forbidden topics for current step."""
        if current_step > 2:
            return 1.0, {"status": "not_applicable", "current_step": current_step}
        
        forbidden = [
            r'\b(pacing|flighting)\b',
            r'\b(channel mix|media mix)\b',
            r'\bfacebook ads|google ads|tiktok|instagram|linkedin\b',
            r'\b(programmatic|display|video|ctv|ott)\b'
        ]
        
        violations = [p for p in forbidden if re.search(p, response, re.I)]
        return (1.0 if not violations else 0.0), {
            "violations": len(violations),
            "current_step": current_step,
            "status": "pass" if not violations else "boundary_violation"
        }
    
    def score_proactive_intelligence(self, user_input: str, response: str) -> Tuple[float, Dict]:
        """Check if agent calculates and analyzes when data is available."""
        # Check if user provided calculable data
        has_budget = bool(re.search(r'\$[\d,]+k?|\d+k?\s*(budget|spend)', user_input, re.I))
        has_target = bool(re.search(r'\d+[,\d]*\s*(customers?|users?|leads?|demos?)', user_input, re.I))
        
        if not (has_budget and has_target):
            return 1.0, {"status": "not_applicable", "has_calculable_data": False}
        
        # Check if response shows calculation
        has_calculation = bool(re.search(r'\$\d+|\d+\s*(cost|cac|cpa|cpl)', response, re.I))
        has_benchmark = bool(re.search(r'benchmark|typical|range|industry', response, re.I))
        has_assessment = bool(re.search(r'aggressive|conservative|realistic|ambitious', response, re.I))
        
        score = 0.0
        if has_calculation:
            score += 0.4
        if has_benchmark:
            score += 0.3
        if has_assessment:
            score += 0.3
        
        return score, {
            "has_calculable_data": True,
            "has_calculation": has_calculation,
            "has_benchmark": has_benchmark,
            "has_assessment": has_assessment,
            "status": "pass" if score >= 0.8 else "needs_improvement"
        }
    
    def score_feasibility_framing(self, response: str) -> Tuple[float, Dict]:
        """Check if aggressive targets are properly flagged."""
        mentions_target = bool(re.search(r'\$\d+|target|goal|objective', response, re.I))
        
        if not mentions_target:
            return 1.0, {"status": "not_applicable"}
        
        has_assessment = bool(re.search(r'aggressive|ambitious|challenging|conservative|typical|realistic', response, re.I))
        has_source = bool(re.search(r'based on|benchmark|typical.*range|industry', response, re.I))
        has_path = bool(re.search(r'to (hit|achieve|reach)|you.ll need|requires', response, re.I))
        
        score = 0.0
        if has_assessment:
            score += 0.4
        if has_source:
            score += 0.4
        if has_path:
            score += 0.2
        
        return score, {
            "has_assessment": has_assessment,
            "has_source": has_source,
            "has_path_forward": has_path,
            "status": "pass" if score >= 0.8 else "needs_improvement"
        }
    
    def score_idk_protocol(self, user_input: str, response: str) -> Tuple[float, Dict]:
        """Check if agent handles uncertainty properly."""
        user_uncertain = bool(re.search(r"i don'?t know|not sure|no idea|uncertain|don'?t have", user_input, re.I))
        
        if not user_uncertain:
            return 1.0, {"status": "not_applicable"}
        
        models_assumption = bool(re.search(r"i'?ll (model|use|assume)|based on|using.*benchmark", response, re.I))
        cites_source = bool(re.search(r'based on (kb|benchmark|industry)', response, re.I))
        offers_refinement = bool(re.search(r'(you can|feel free to|adjust|refine) .*(anytime|later)', response, re.I))
        moves_on = bool(re.search(r'moving on|next|let.s', response, re.I))
        keeps_pushing = bool(re.search(r'what is|can you tell|do you have|please provide', response, re.I))
        
        score = 0.0
        if models_assumption:
            score += 0.3
        if cites_source:
            score += 0.3
        if offers_refinement:
            score += 0.2
        if moves_on:
            score += 0.2
        if keeps_pushing:
            score -= 0.5
        
        return max(0, min(1, score)), {
            "models_assumption": models_assumption,
            "cites_source": cites_source,
            "offers_refinement": offers_refinement,
            "moves_on": moves_on,
            "keeps_pushing": keeps_pushing,
            "status": "pass" if score >= 0.8 else "fail"
        }
    
    def score_self_referential_learning(self, conversation_history: List[Dict], response: str) -> Tuple[float, Dict]:
        """Check if agent correctly references earlier conversation."""
        # Extract key facts from conversation
        facts = []
        for turn in conversation_history:
            if turn["role"] == "user":
                # Look for budget mentions
                budget_match = re.search(r'\$?([\d,]+)\s*k?\s*(budget|spend)?', turn["content"], re.I)
                if budget_match:
                    facts.append(("budget", budget_match.group(1)))
                
                # Look for target mentions
                target_match = re.search(r'([\d,]+)\s*(customers?|users?|leads?)', turn["content"], re.I)
                if target_match:
                    facts.append(("target", target_match.group(1), target_match.group(2)))
        
        if not facts:
            return 1.0, {"status": "no_facts_to_verify", "facts_found": 0}
        
        # Check if response maintains consistency
        # This is a simplified check - full implementation would use LLM
        return 0.8, {
            "status": "partial_check",
            "facts_found": len(facts),
            "note": "Full verification requires LLM scoring"
        }
    
    async def score_with_llm(self, scorer_name: str, user_input: str, response: str, 
                             conversation_history: List[Dict], expected_behaviors: List[str]) -> Tuple[float, Dict]:
        """Use LLM for nuanced scoring."""
        
        history_text = "\n".join([
            f"{'User' if t['role'] == 'user' else 'Agent'}: {t['content'][:200]}..."
            for t in conversation_history[-6:]  # Last 3 turns
        ])
        
        prompt = f"""Evaluate this Media Planning Agent response for the "{scorer_name}" criterion.

CONVERSATION HISTORY (recent):
{history_text}

CURRENT USER INPUT:
{user_input}

AGENT RESPONSE:
{response}

EXPECTED BEHAVIORS:
{', '.join(expected_behaviors)}

SCORING CRITERIA FOR {scorer_name}:
- Score 1.0: Fully meets all expected behaviors
- Score 0.8: Meets most behaviors with minor issues
- Score 0.5: Partially meets behaviors
- Score 0.2: Significant gaps
- Score 0.0: Does not meet criteria

Respond with JSON only:
{{"score": <0.0-1.0>, "met_behaviors": [...], "missed_behaviors": [...], "issues": [...], "notes": "..."}}"""

        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}]
            )
            
            result_text = message.content[0].text
            # Clean JSON
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0]
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0]
            
            result = json.loads(result_text.strip())
            return result.get("score", 0.5), result
            
        except Exception as e:
            return 0.5, {"error": str(e), "status": "scoring_failed"}


# =============================================================================
# TEST RUNNER
# =============================================================================

class TestRunner:
    """Runs test scenarios and collects results."""
    
    def __init__(self, config: Config, use_mock: bool = False):
        self.config = config
        self.client = MockCopilotClient() if use_mock else CopilotClient(config)
        self.anthropic = Anthropic(api_key=config.ANTHROPIC_API_KEY) if config.ANTHROPIC_API_KEY else None
        self.scorers = Scorers(self.anthropic, config.SCORING_MODEL) if self.anthropic else None
        self.results: List[ScenarioResult] = []
    
    async def run_scenario(self, scenario: Dict) -> ScenarioResult:
        """Run a single test scenario."""
        result = ScenarioResult(
            scenario_id=scenario["id"],
            scenario_name=scenario["name"],
            category=scenario["category"],
            total_turns=len(scenario["turns"]),
            completed_turns=0,
            start_time=datetime.now().isoformat()
        )
        
        try:
            # Start conversation
            if not await self.client.start_conversation():
                result.error = "Failed to start conversation"
                return result
            
            # Run each turn
            for turn_spec in scenario["turns"]:
                turn_result = await self._run_turn(turn_spec)
                result.turn_results.append(turn_result)
                result.completed_turns += 1
                
                # Delay between turns
                await asyncio.sleep(self.config.TURN_DELAY)
            
            # Calculate overall scores
            result.overall_scores = self._calculate_overall_scores(result.turn_results)
            result.passed = all(s >= 0.95 for s in result.overall_scores.values())
            
        except Exception as e:
            result.error = str(e)
        
        finally:
            result.end_time = datetime.now().isoformat()
            result.duration_seconds = (
                datetime.fromisoformat(result.end_time) - 
                datetime.fromisoformat(result.start_time)
            ).total_seconds()
            self.client.reset()
        
        return result
    
    async def _run_turn(self, turn_spec: Dict) -> TurnResult:
        """Run a single conversation turn."""
        user_input = turn_spec["user"]
        expected_behaviors = turn_spec.get("expectedBehaviors", [])
        scorers_to_run = turn_spec.get("scorers", [])
        
        # Send message and get response
        response, response_time_ms = await self.client.send_message(user_input)
        
        turn_result = TurnResult(
            turn_number=turn_spec["turn"],
            user_input=user_input,
            agent_response=response,
            response_time_ms=response_time_ms
        )
        
        # Run scorers
        if self.scorers:
            conversation_history = self.client.get_conversation_history()
            
            for scorer_name in scorers_to_run:
                score, details = await self._run_scorer(
                    scorer_name, user_input, response, 
                    conversation_history, expected_behaviors
                )
                turn_result.scores[scorer_name] = score
                turn_result.score_details[scorer_name] = details
                
                if score >= 0.8:
                    turn_result.passed_behaviors.extend(
                        details.get("met_behaviors", [scorer_name])
                    )
                else:
                    turn_result.failed_behaviors.extend(
                        details.get("missed_behaviors", [scorer_name])
                    )
                    turn_result.issues.extend(details.get("issues", []))
        
        return turn_result
    
    async def _run_scorer(self, scorer_name: str, user_input: str, response: str,
                          conversation_history: List[Dict], expected_behaviors: List[str]) -> Tuple[float, Dict]:
        """Run a specific scorer."""
        
        # Code-based scorers
        if scorer_name == "response_length":
            return self.scorers.score_response_length(response)
        elif scorer_name == "single_question":
            return self.scorers.score_single_question(response)
        elif scorer_name == "acronym_definition":
            return self.scorers.score_acronym_definition(response)
        elif scorer_name == "source_citation":
            return self.scorers.score_source_citation(response)
        elif scorer_name == "step_boundary":
            return self.scorers.score_step_boundary(response)
        elif scorer_name == "proactive_intelligence":
            return self.scorers.score_proactive_intelligence(user_input, response)
        elif scorer_name == "feasibility_framing":
            return self.scorers.score_feasibility_framing(response)
        elif scorer_name == "idk_protocol":
            return self.scorers.score_idk_protocol(user_input, response)
        elif scorer_name == "self_referential_learning":
            return self.scorers.score_self_referential_learning(conversation_history, response)
        
        # LLM-based scorers
        else:
            return await self.scorers.score_with_llm(
                scorer_name, user_input, response, 
                conversation_history, expected_behaviors
            )
    
    def _calculate_overall_scores(self, turn_results: List[TurnResult]) -> Dict[str, float]:
        """Calculate overall scores across all turns."""
        all_scores: Dict[str, List[float]] = {}
        
        for turn in turn_results:
            for scorer_name, score in turn.scores.items():
                if scorer_name not in all_scores:
                    all_scores[scorer_name] = []
                all_scores[scorer_name].append(score)
        
        return {
            name: sum(scores) / len(scores) if scores else 0.0
            for name, scores in all_scores.items()
        }


# =============================================================================
# REPORT GENERATOR
# =============================================================================

class ReportGenerator:
    """Generates test reports."""
    
    def __init__(self, output_dir: str):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_report(self, results: List[ScenarioResult]) -> str:
        """Generate markdown report."""
        lines = [
            "# MPA Comprehensive Test Results",
            f"Generated: {datetime.now().isoformat()}",
            "",
            "## Executive Summary",
            ""
        ]
        
        total = len(results)
        passed = sum(1 for r in results if r.passed)
        
        lines.extend([
            f"- **Scenarios Run:** {total}",
            f"- **Passed:** {passed}",
            f"- **Failed:** {total - passed}",
            f"- **Pass Rate:** {passed/total*100:.1f}%" if total > 0 else "N/A",
            ""
        ])
        
        # Aggregate scores
        all_scores: Dict[str, List[float]] = {}
        for result in results:
            for scorer, score in result.overall_scores.items():
                if scorer not in all_scores:
                    all_scores[scorer] = []
                all_scores[scorer].append(score)
        
        lines.extend([
            "## Scorer Performance",
            "",
            "| Scorer | Average | Min | Max | Status |",
            "|--------|---------|-----|-----|--------|"
        ])
        
        for scorer, scores in sorted(all_scores.items()):
            avg = sum(scores) / len(scores)
            min_s = min(scores)
            max_s = max(scores)
            status = "✅ PASS" if avg >= 0.95 else "❌ FAIL"
            lines.append(f"| {scorer} | {avg:.2f} | {min_s:.2f} | {max_s:.2f} | {status} |")
        
        lines.append("")
        
        # Failed scenarios
        failed_scenarios = [r for r in results if not r.passed]
        if failed_scenarios:
            lines.extend([
                "## Failed Scenarios",
                ""
            ])
            for scenario in failed_scenarios:
                lines.extend([
                    f"### {scenario.scenario_id}: {scenario.scenario_name}",
                    f"- **Category:** {scenario.category}",
                    f"- **Turns Completed:** {scenario.completed_turns}/{scenario.total_turns}",
                    ""
                ])
                
                # Show failed turns
                for turn in scenario.turn_results:
                    if turn.failed_behaviors:
                        lines.extend([
                            f"#### Turn {turn.turn_number}",
                            f"**User:** {turn.user_input[:100]}...",
                            f"**Agent:** {turn.agent_response[:200]}...",
                            f"**Failed:** {', '.join(turn.failed_behaviors)}",
                            f"**Issues:** {'; '.join(turn.issues) if turn.issues else 'None'}",
                            ""
                        ])
        
        # Detailed results
        lines.extend([
            "## Detailed Results",
            ""
        ])
        
        for result in results:
            status = "✅ PASS" if result.passed else "❌ FAIL"
            lines.extend([
                f"### {result.scenario_id}: {result.scenario_name} {status}",
                f"- **Category:** {result.category}",
                f"- **Duration:** {result.duration_seconds:.1f}s",
                f"- **Turns:** {result.completed_turns}/{result.total_turns}",
                "",
                "**Scores:**",
                ""
            ])
            
            for scorer, score in sorted(result.overall_scores.items()):
                status_icon = "✅" if score >= 0.95 else "⚠️" if score >= 0.8 else "❌"
                lines.append(f"- {scorer}: {score:.2f} {status_icon}")
            
            lines.extend(["", "---", ""])
        
        report_content = "\n".join(lines)
        
        # Save report
        report_path = self.output_dir / f"mpa_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        report_path.write_text(report_content)
        
        return str(report_path)
    
    def save_json_results(self, results: List[ScenarioResult]) -> str:
        """Save results as JSON for further processing."""
        json_path = self.output_dir / f"mpa_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        # Convert to serializable format
        serializable = [asdict(r) for r in results]
        
        with open(json_path, 'w') as f:
            json.dump(serializable, f, indent=2, default=str)
        
        return str(json_path)


# =============================================================================
# MAIN
# =============================================================================

async def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="MPA Comprehensive Test Runner")
    parser.add_argument("--scenario", help="Run specific scenario ID (e.g., FULL-001)")
    parser.add_argument("--category", help="Run all scenarios in category")
    parser.add_argument("--all", action="store_true", help="Run all scenarios")
    parser.add_argument("--mock", action="store_true", help="Use mock client for testing")
    parser.add_argument("--list", action="store_true", help="List available scenarios")
    parser.add_argument("--suite", default="mpa_comprehensive_test_suite.json", help="Test suite file")
    
    args = parser.parse_args()
    
    # Load test suite
    suite_path = Path(__file__).parent / args.suite
    if not suite_path.exists():
        print(f"Test suite not found: {suite_path}")
        sys.exit(1)
    
    with open(suite_path) as f:
        suite = json.load(f)
    
    scenarios = suite.get("testScenarios", [])
    
    if args.list:
        print("Available Test Scenarios:")
        print("-" * 80)
        for s in scenarios:
            print(f"  {s['id']:12} | {s['category']:25} | {s['name']}")
        sys.exit(0)
    
    # Filter scenarios
    if args.scenario:
        scenarios = [s for s in scenarios if s["id"] == args.scenario]
    elif args.category:
        scenarios = [s for s in scenarios if s["category"] == args.category]
    elif not args.all:
        print("Specify --scenario, --category, or --all")
        sys.exit(1)
    
    if not scenarios:
        print("No matching scenarios found")
        sys.exit(1)
    
    # Validate config
    if not args.mock:
        errors = config.validate()
        if errors:
            print("Configuration errors:")
            for e in errors:
                print(f"  - {e}")
            print("\nUse --mock for local testing without Copilot connection")
            sys.exit(1)
    
    # Run tests
    print(f"\nRunning {len(scenarios)} scenario(s)...")
    print("=" * 80)
    
    runner = TestRunner(config, use_mock=args.mock)
    results = []
    
    for scenario in scenarios:
        print(f"\n▶ {scenario['id']}: {scenario['name']}")
        result = await runner.run_scenario(scenario)
        results.append(result)
        
        status = "✅ PASS" if result.passed else "❌ FAIL"
        print(f"  {status} - {result.completed_turns}/{result.total_turns} turns in {result.duration_seconds:.1f}s")
        
        if result.error:
            print(f"  ERROR: {result.error}")
    
    # Generate reports
    print("\n" + "=" * 80)
    report_gen = ReportGenerator(config.OUTPUT_DIR)
    
    report_path = report_gen.generate_report(results)
    print(f"Report saved: {report_path}")
    
    json_path = report_gen.save_json_results(results)
    print(f"JSON results: {json_path}")
    
    # Summary
    passed = sum(1 for r in results if r.passed)
    print(f"\nSUMMARY: {passed}/{len(results)} scenarios passed")


if __name__ == "__main__":
    asyncio.run(main())