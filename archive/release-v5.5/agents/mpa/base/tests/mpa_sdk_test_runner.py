#!/usr/bin/env python3
"""
MPA Copilot Studio SDK Test Runner
Version 1.0

Automated testing against Copilot Studio using the SDK API endpoint.
Designed for VS Code Claude execution.

Requirements:
    pip install anthropic requests python-dotenv msal aiohttp

Usage:
    python mpa_sdk_test_runner.py --scenario FULL-001
    python mpa_sdk_test_runner.py --all
    python mpa_sdk_test_runner.py --category "End-to-End Linear"
"""

import json
import os
import sys
import time
import asyncio
import aiohttp
import re
from datetime import datetime, timedelta

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)
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
    pass

try:
    from msal import ConfidentialClientApplication, PublicClientApplication
except ImportError:
    print("Warning: msal not installed. Run: pip install msal")
    ConfidentialClientApplication = None


# =============================================================================
# CONFIGURATION
# =============================================================================

@dataclass
class Config:
    # Anthropic API for scoring
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

    # Direct Line (preferred - no Azure AD permissions needed)
    DIRECTLINE_SECRET: str = os.getenv("DIRECTLINE_SECRET", "")
    DIRECTLINE_ENDPOINT: str = os.getenv("DIRECTLINE_ENDPOINT", "https://directline.botframework.com/v3/directline")

    # Copilot Studio SDK (fallback - requires Azure AD permissions)
    COPILOT_SDK_ENDPOINT: str = os.getenv("COPILOT_SDK_ENDPOINT",
        "https://c672b4709cc7e9d8a0e2ca83751f80.0c.environment.api.powerplatform.com/copilotstudio/dataverse-backed/authenticated/bots/copilots_header_a2740/conversations")
    API_VERSION: str = os.getenv("API_VERSION", "2022-03-01-preview")

    # Azure AD Authentication (only needed for SDK endpoint)
    AZURE_TENANT_ID: str = os.getenv("AZURE_TENANT_ID", "")
    AZURE_CLIENT_ID: str = os.getenv("AZURE_CLIENT_ID", "")
    AZURE_CLIENT_SECRET: str = os.getenv("AZURE_CLIENT_SECRET", "")

    # Or use device code flow for interactive auth
    USE_DEVICE_CODE: bool = os.getenv("USE_DEVICE_CODE", "true").lower() == "true"

    # Scoring
    SCORING_MODEL: str = os.getenv("SCORING_MODEL", "claude-sonnet-4-20250514")
    OUTPUT_DIR: str = os.getenv("OUTPUT_DIR", "./test_results")

    # Timeouts
    RESPONSE_TIMEOUT: int = int(os.getenv("RESPONSE_TIMEOUT", "60"))
    TURN_DELAY: float = float(os.getenv("TURN_DELAY", "1.5"))

    def get_connection_type(self) -> str:
        """Determine which connection method to use."""
        if self.DIRECTLINE_SECRET:
            return "directline"
        return "sdk"


config = Config()


# =============================================================================
# DATA CLASSES
# =============================================================================

@dataclass
class TurnResult:
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
# AZURE AD AUTHENTICATION
# =============================================================================

class AzureAuthenticator:
    """Handles Azure AD authentication for Copilot Studio SDK."""

    def __init__(self, config: Config):
        self.config = config
        self.token: Optional[str] = None
        self.token_expiry: Optional[datetime] = None
        self._app: Optional[PublicClientApplication] = None
        self._scopes = ["https://api.powerplatform.com/.default"]

    def _get_app(self) -> PublicClientApplication:
        """Get or create MSAL app with persistent cache."""
        if self._app is None:
            # Use file-based token cache for persistence
            cache_file = Path(__file__).parent / ".msal_token_cache.json"
            cache = None
            try:
                from msal import SerializableTokenCache
                cache = SerializableTokenCache()
                if cache_file.exists():
                    cache.deserialize(cache_file.read_text())
            except Exception:
                pass

            self._app = PublicClientApplication(
                client_id=self.config.AZURE_CLIENT_ID or "51f81489-12ee-4a9e-aaae-a2591f45987d",
                authority=f"https://login.microsoftonline.com/{self.config.AZURE_TENANT_ID or 'common'}",
                token_cache=cache
            )

            # Save cache on changes
            if cache:
                def save_cache():
                    if cache.has_state_changed:
                        cache_file.write_text(cache.serialize())
                import atexit
                atexit.register(save_cache)

        return self._app

    async def get_token(self) -> str:
        """Get a valid access token, refreshing if needed."""
        # Return cached token if still valid (with 5 min buffer)
        if self.token and self.token_expiry and datetime.now() < (self.token_expiry - timedelta(minutes=5)):
            return self.token

        # Use device code flow with custom app registration
        if self.config.USE_DEVICE_CODE:
            return await self._device_code_flow()
        else:
            return await self._client_credentials_flow()

    async def _device_code_flow(self) -> str:
        """Interactive device code authentication."""
        if not PublicClientApplication:
            raise ImportError("msal not installed")

        app = self._get_app()

        # Try to get token from cache first (silent refresh)
        accounts = app.get_accounts()
        if accounts:
            result = app.acquire_token_silent(self._scopes, account=accounts[0])
            if result and "access_token" in result:
                self.token = result["access_token"]
                # Parse expiry from token or default to 1 hour
                expires_in = result.get("expires_in", 3600)
                self.token_expiry = datetime.now() + timedelta(seconds=expires_in)
                print("  Using cached token (silent refresh)")
                return self.token

        # Device code flow for new authentication
        flow = app.initiate_device_flow(scopes=self._scopes)
        if "user_code" not in flow:
            raise Exception(f"Failed to create device flow: {flow.get('error_description', 'Unknown error')}")

        print("\n" + "=" * 60)
        print("AUTHENTICATION REQUIRED")
        print("=" * 60)
        print(flow["message"])
        print("=" * 60 + "\n")

        result = app.acquire_token_by_device_flow(flow)

        if "access_token" in result:
            self.token = result["access_token"]
            # Token typically valid for 1 hour
            expires_in = result.get("expires_in", 3600)
            self.token_expiry = datetime.now() + timedelta(seconds=expires_in)
            return self.token
        else:
            raise Exception(f"Authentication failed: {result.get('error_description', 'Unknown error')}")
    
    async def _client_credentials_flow(self) -> str:
        """Service principal authentication."""
        if not ConfidentialClientApplication:
            raise ImportError("msal not installed")
        
        app = ConfidentialClientApplication(
            client_id=self.config.AZURE_CLIENT_ID,
            client_credential=self.config.AZURE_CLIENT_SECRET,
            authority=f"https://login.microsoftonline.com/{self.config.AZURE_TENANT_ID}"
        )
        
        scopes = ["https://api.powerplatform.com/.default"]
        result = app.acquire_token_for_client(scopes=scopes)
        
        if "access_token" in result:
            self.token = result["access_token"]
            return self.token
        else:
            raise Exception(f"Authentication failed: {result.get('error_description', 'Unknown error')}")


# =============================================================================
# DIRECT LINE CLIENT
# =============================================================================

class DirectLineClient:
    """Client for Direct Line API - simpler auth, no Azure AD permissions needed."""

    def __init__(self, config: Config):
        self.config = config
        self.conversation_id: Optional[str] = None
        self.watermark: Optional[str] = None
        self.conversation_history: List[Dict] = []

    async def start_conversation(self) -> bool:
        """Start a new Direct Line conversation."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.config.DIRECTLINE_SECRET}",
                    "Content-Type": "application/json"
                }

                url = f"{self.config.DIRECTLINE_ENDPOINT}/conversations"

                async with session.post(url, headers=headers, json={}) as response:
                    if response.status in [200, 201]:
                        data = await response.json()
                        self.conversation_id = data.get("conversationId")
                        print(f"  Started Direct Line conversation: {self.conversation_id[:20]}...")
                        return True
                    else:
                        error_text = await response.text()
                        print(f"  Failed to start Direct Line conversation: {response.status} - {error_text[:200]}")
                        return False

        except Exception as e:
            print(f"  Error starting Direct Line conversation: {e}")
            return False

    async def send_message(self, message: str) -> Tuple[str, int]:
        """Send a message via Direct Line and get response."""
        start_time = time.time()

        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.config.DIRECTLINE_SECRET}",
                    "Content-Type": "application/json"
                }

                # Send message
                url = f"{self.config.DIRECTLINE_ENDPOINT}/conversations/{self.conversation_id}/activities"

                payload = {
                    "type": "message",
                    "text": message,
                    "from": {
                        "id": "test_user",
                        "name": "Test User"
                    }
                }

                async with session.post(url, headers=headers, json=payload) as response:
                    if response.status not in [200, 201]:
                        response_time_ms = int((time.time() - start_time) * 1000)
                        error_text = await response.text()
                        return f"[ERROR: {response.status}] {error_text[:100]}", response_time_ms

                # Poll for response
                bot_response = await self._poll_for_response(session, headers)
                response_time_ms = int((time.time() - start_time) * 1000)

                self.conversation_history.append({"role": "user", "content": message})
                self.conversation_history.append({"role": "assistant", "content": bot_response})

                return bot_response, response_time_ms

        except Exception as e:
            response_time_ms = int((time.time() - start_time) * 1000)
            return f"[ERROR: {str(e)}]", response_time_ms

    async def _poll_for_response(self, session: aiohttp.ClientSession, headers: Dict) -> str:
        """Poll Direct Line for bot response."""
        url = f"{self.config.DIRECTLINE_ENDPOINT}/conversations/{self.conversation_id}/activities"
        if self.watermark:
            url += f"?watermark={self.watermark}"

        timeout = self.config.RESPONSE_TIMEOUT
        start_time = time.time()

        while time.time() - start_time < timeout:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    self.watermark = data.get("watermark")

                    # Find bot messages
                    for activity in data.get("activities", []):
                        if activity.get("from", {}).get("role") == "bot" or \
                           activity.get("from", {}).get("id", "").lower() != "test_user":
                            if activity.get("type") == "message" and activity.get("text"):
                                return activity["text"]

            await asyncio.sleep(0.5)

        return "[ERROR: Timeout waiting for response]"


# =============================================================================
# MOCK COPILOT CLIENT (for local testing without live deployment)
# =============================================================================

class MockCopilotClient:
    """Mock client that simulates MPA responses using Claude API."""

    def __init__(self, config: Config, instructions_path: str, model: str = "claude-sonnet-4-20250514"):
        self.config = config
        self.model = model
        self.anthropic = Anthropic(api_key=config.ANTHROPIC_API_KEY)
        self.instructions = Path(instructions_path).read_text()
        self.conversation_history: List[Dict] = []

    async def start_conversation(self) -> bool:
        """Start a new mock conversation (just resets state)."""
        self.conversation_history = []
        print(f"  Started mock conversation (model: {self.model})")
        return True

    async def send_message(self, message: str) -> Tuple[str, int]:
        """Send a message and get simulated MPA response from Claude."""
        start_time = time.time()

        try:
            # Build messages for Claude
            messages = []
            for entry in self.conversation_history:
                messages.append(entry)
            messages.append({"role": "user", "content": message})

            # Call Claude API with MPA instructions as system prompt
            response = self.anthropic.messages.create(
                model=self.model,
                max_tokens=500,
                system=self.instructions,
                messages=messages
            )

            response_time_ms = int((time.time() - start_time) * 1000)
            bot_response = response.content[0].text

            # Update conversation history
            self.conversation_history.append({"role": "user", "content": message})
            self.conversation_history.append({"role": "assistant", "content": bot_response})

            return bot_response, response_time_ms

        except Exception as e:
            response_time_ms = int((time.time() - start_time) * 1000)
            return f"[ERROR: {str(e)}]", response_time_ms

    def get_conversation_history(self) -> List[Dict]:
        return self.conversation_history.copy()

    def reset(self):
        self.conversation_history = []


# =============================================================================
# COPILOT STUDIO SDK CLIENT
# =============================================================================

class CopilotSDKClient:
    """Client for Copilot Studio SDK API."""
    
    def __init__(self, config: Config, authenticator: AzureAuthenticator):
        self.config = config
        self.authenticator = authenticator
        self.conversation_id: Optional[str] = None
        self.conversation_history: List[Dict] = []
    
    async def start_conversation(self) -> bool:
        """Start a new conversation with the Copilot."""
        try:
            token = await self.authenticator.get_token()
            
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
                
                url = f"{self.config.COPILOT_SDK_ENDPOINT}?api-version={self.config.API_VERSION}"
                
                async with session.post(url, headers=headers, json={}) as response:
                    if response.status in [200, 201]:
                        data = await response.json()
                        self.conversation_id = data.get("conversationId") or data.get("id")
                        print(f"  Started conversation: {self.conversation_id[:20]}...")
                        return True
                    else:
                        error_text = await response.text()
                        print(f"  Failed to start conversation: {response.status} - {error_text[:200]}")
                        return False
                        
        except Exception as e:
            print(f"  Error starting conversation: {e}")
            return False
    
    async def send_message(self, message: str) -> Tuple[str, int]:
        """Send a message and get response."""
        start_time = time.time()

        try:
            token = await self.authenticator.get_token()

            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }

                # Copilot Studio SDK: POST message directly to conversation endpoint
                url = f"{self.config.COPILOT_SDK_ENDPOINT}/{self.conversation_id}?api-version={self.config.API_VERSION}"

                payload = {
                    "activity": {
                        "type": "message",
                        "text": message,
                        "from": {
                            "id": "test_user",
                            "name": "Test User"
                        }
                    }
                }

                async with session.post(url, headers=headers, json=payload) as response:
                    response_time_ms = int((time.time() - start_time) * 1000)

                    if response.status in [200, 201]:
                        data = await response.json()

                        # Extract bot response
                        bot_response = self._extract_bot_response(data)

                        self.conversation_history.append({"role": "user", "content": message})
                        self.conversation_history.append({"role": "assistant", "content": bot_response})

                        return bot_response, response_time_ms
                    else:
                        error_text = await response.text()
                        return f"[ERROR: {response.status}] {error_text[:100]}", response_time_ms

        except Exception as e:
            response_time_ms = int((time.time() - start_time) * 1000)
            return f"[ERROR: {str(e)}]", response_time_ms
    
    def _extract_bot_response(self, data: Dict) -> str:
        """Extract the bot's text response from API response."""
        # Handle different response formats
        if isinstance(data, dict):
            # Direct text response
            if "text" in data:
                return data["text"]
            
            # Activities array
            if "activities" in data:
                for activity in data["activities"]:
                    if activity.get("from", {}).get("role") == "bot":
                        return activity.get("text", "")
                    if activity.get("type") == "message" and "text" in activity:
                        return activity["text"]
            
            # Value field
            if "value" in data:
                return str(data["value"])
        
        return str(data)
    
    def get_conversation_history(self) -> List[Dict]:
        return self.conversation_history.copy()
    
    def reset(self):
        self.conversation_id = None
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
        return score, {"used": used, "undefined": undefined}
    
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
        ]
        
        has_source = any(re.search(p, response, re.I) for p in source_patterns)
        return (1.0 if has_source else 0.0), {"has_data": True, "has_source": has_source}
    
    def score_proactive_intelligence(self, user_input: str, response: str) -> Tuple[float, Dict]:
        """Check if agent calculates when data is available."""
        has_budget = bool(re.search(r'\$[\d,]+k?|\d+k?\s*(budget|spend)', user_input, re.I))
        has_target = bool(re.search(r'\d+[,\d]*\s*(customers?|users?|leads?|demos?)', user_input, re.I))
        
        if not (has_budget and has_target):
            return 1.0, {"status": "not_applicable", "has_calculable_data": False}
        
        has_calculation = bool(re.search(r'\$\d+|\d+\s*(cost|cac|cpa|cpl)', response, re.I))
        has_benchmark = bool(re.search(r'benchmark|typical|range|industry', response, re.I))
        has_assessment = bool(re.search(r'aggressive|conservative|realistic|ambitious', response, re.I))
        
        score = 0.0
        if has_calculation: score += 0.4
        if has_benchmark: score += 0.3
        if has_assessment: score += 0.3
        
        return score, {"has_calculation": has_calculation, "has_benchmark": has_benchmark, "has_assessment": has_assessment}
    
    def score_feasibility_framing(self, response: str) -> Tuple[float, Dict]:
        """Check if aggressive targets are properly flagged."""
        has_assessment = bool(re.search(r'aggressive|ambitious|challenging|conservative|typical|realistic', response, re.I))
        has_source = bool(re.search(r'based on|benchmark|typical.*range|industry', response, re.I))
        has_path = bool(re.search(r'to (hit|achieve|reach)|you.ll need|requires', response, re.I))
        
        score = 0.0
        if has_assessment: score += 0.4
        if has_source: score += 0.4
        if has_path: score += 0.2
        
        return score, {"has_assessment": has_assessment, "has_source": has_source, "has_path": has_path}


# =============================================================================
# TEST RUNNER
# =============================================================================

class TestRunner:
    """Runs test scenarios and collects results."""

    def __init__(self, config: Config, mock_mode: bool = False, mock_model: str = "claude-sonnet-4-20250514",
                 instructions_path: Optional[str] = None):
        self.config = config
        self.mock_mode = mock_mode

        if mock_mode:
            # Mock mode: use Claude to simulate MPA responses
            if not instructions_path:
                raise ValueError("instructions_path required for mock mode")
            if not config.ANTHROPIC_API_KEY:
                raise ValueError("ANTHROPIC_API_KEY required for mock mode")
            print(f"Using MOCK mode (model: {mock_model})")
            self.client = MockCopilotClient(config, instructions_path, mock_model)
            self.authenticator = None
        else:
            # Live mode: connect to Copilot Studio
            self.connection_type = config.get_connection_type()
            if self.connection_type == "directline":
                print(f"Using Direct Line connection")
                self.client = DirectLineClient(config)
                self.authenticator = None
            else:
                print(f"Using Copilot Studio SDK connection")
                self.authenticator = AzureAuthenticator(config)
                self.client = CopilotSDKClient(config, self.authenticator)

        self.anthropic = Anthropic(api_key=config.ANTHROPIC_API_KEY) if config.ANTHROPIC_API_KEY else None
        self.scorers = Scorers(self.anthropic, config.SCORING_MODEL) if self.anthropic else None
    
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
            if not await self.client.start_conversation():
                result.error = "Failed to start conversation"
                return result
            
            for turn_spec in scenario["turns"]:
                print(f"    Turn {turn_spec['turn']}: {turn_spec['user'][:50]}...")
                turn_result = await self._run_turn(turn_spec)
                result.turn_results.append(turn_result)
                result.completed_turns += 1
                
                # Show quick result
                avg_score = sum(turn_result.scores.values()) / len(turn_result.scores) if turn_result.scores else 0
                print(f"      Response: {turn_result.agent_response[:60]}...")
                print(f"      Scores: {avg_score:.2f} avg | {turn_result.response_time_ms}ms")
                
                await asyncio.sleep(self.config.TURN_DELAY)
            
            result.overall_scores = self._calculate_overall_scores(result.turn_results)
            result.passed = all(s >= 0.95 for s in result.overall_scores.values()) if result.overall_scores else False
            
        except Exception as e:
            result.error = str(e)
            import traceback
            traceback.print_exc()
        
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
        scorers_to_run = turn_spec.get("scorers", [])
        
        response, response_time_ms = await self.client.send_message(user_input)
        
        turn_result = TurnResult(
            turn_number=turn_spec["turn"],
            user_input=user_input,
            agent_response=response,
            response_time_ms=response_time_ms
        )
        
        if self.scorers:
            for scorer_name in scorers_to_run:
                score, details = self._run_scorer(scorer_name, user_input, response)
                turn_result.scores[scorer_name] = score
                turn_result.score_details[scorer_name] = details
        
        return turn_result
    
    def _run_scorer(self, scorer_name: str, user_input: str, response: str) -> Tuple[float, Dict]:
        """Run a specific scorer."""
        if scorer_name == "response_length":
            return self.scorers.score_response_length(response)
        elif scorer_name == "single_question":
            return self.scorers.score_single_question(response)
        elif scorer_name == "acronym_definition":
            return self.scorers.score_acronym_definition(response)
        elif scorer_name == "source_citation":
            return self.scorers.score_source_citation(response)
        elif scorer_name == "proactive_intelligence":
            return self.scorers.score_proactive_intelligence(user_input, response)
        elif scorer_name == "feasibility_framing":
            return self.scorers.score_feasibility_framing(response)
        else:
            return 0.5, {"status": "scorer_not_implemented"}
    
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
    def __init__(self, output_dir: str):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_report(self, results: List[ScenarioResult]) -> str:
        lines = [
            "# MPA Test Results",
            f"Generated: {datetime.now().isoformat()}",
            "",
            "## Summary",
            ""
        ]
        
        total = len(results)
        passed = sum(1 for r in results if r.passed)
        
        lines.extend([
            f"- **Scenarios:** {total}",
            f"- **Passed:** {passed}",
            f"- **Failed:** {total - passed}",
            ""
        ])
        
        # Aggregate scores
        all_scores: Dict[str, List[float]] = {}
        for result in results:
            for scorer, score in result.overall_scores.items():
                if scorer not in all_scores:
                    all_scores[scorer] = []
                all_scores[scorer].append(score)
        
        lines.extend(["## Scorer Performance", "", "| Scorer | Avg | Status |", "|--------|-----|--------|"])
        
        for scorer, scores in sorted(all_scores.items()):
            avg = sum(scores) / len(scores)
            status = "✅" if avg >= 0.95 else "❌"
            lines.append(f"| {scorer} | {avg:.2f} | {status} |")
        
        lines.append("")
        
        # Detailed results
        for result in results:
            status = "✅" if result.passed else "❌"
            lines.extend([
                f"## {result.scenario_id}: {result.scenario_name} {status}",
                f"Duration: {result.duration_seconds:.1f}s | Turns: {result.completed_turns}/{result.total_turns}",
                ""
            ])
            
            if result.error:
                lines.append(f"**Error:** {result.error}")
            
            for turn in result.turn_results:
                lines.extend([
                    f"### Turn {turn.turn_number}",
                    f"**User:** {turn.user_input}",
                    f"**Agent:** {turn.agent_response[:300]}{'...' if len(turn.agent_response) > 300 else ''}",
                    f"**Scores:** {turn.scores}",
                    ""
                ])
        
        report_content = "\n".join(lines)
        report_path = self.output_dir / f"mpa_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        report_path.write_text(report_content)
        
        return str(report_path)
    
    def save_json(self, results: List[ScenarioResult]) -> str:
        json_path = self.output_dir / f"mpa_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(json_path, 'w') as f:
            json.dump([asdict(r) for r in results], f, indent=2, default=str)
        return str(json_path)


# =============================================================================
# MAIN
# =============================================================================

async def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="MPA Copilot Studio SDK Test Runner")
    parser.add_argument("--scenario", help="Run specific scenario ID")
    parser.add_argument("--category", help="Run all scenarios in category")
    parser.add_argument("--all", action="store_true", help="Run all scenarios")
    parser.add_argument("--list", action="store_true", help="List available scenarios")
    parser.add_argument("--suite", default="mpa_comprehensive_test_suite.json", help="Test suite file")
    parser.add_argument("--mock", action="store_true", help="Run in mock mode using Claude to simulate MPA responses")
    parser.add_argument("--mock-model", default=os.getenv("MOCK_MODEL", "claude-sonnet-4-20250514"),
                        help="Model to use for mock MPA responses (default: claude-sonnet-4-20250514)")
    parser.add_argument("--instructions", default="../kb/MPA_Copilot_Instructions_v5_9.txt",
                        help="Path to MPA instructions file (relative to tests dir, used in mock mode)")
    
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

    # Resolve instructions path for mock mode
    instructions_path = None
    if args.mock:
        instructions_path = Path(__file__).parent / args.instructions
        if not instructions_path.exists():
            print(f"Instructions file not found: {instructions_path}")
            sys.exit(1)
        instructions_path = str(instructions_path)

    print(f"\n{'='*60}")
    print(f"MPA SDK Test Runner")
    print(f"{'='*60}")
    print(f"Mode: {'MOCK' if args.mock else 'LIVE'}")
    if args.mock:
        print(f"Mock Model: {args.mock_model}")
        print(f"Instructions: {args.instructions}")
    else:
        print(f"Endpoint: {config.COPILOT_SDK_ENDPOINT[:50]}...")
    print(f"Scenarios: {len(scenarios)}")
    print(f"{'='*60}\n")

    runner = TestRunner(config, mock_mode=args.mock, mock_model=args.mock_model,
                        instructions_path=instructions_path)
    results = []
    
    for scenario in scenarios:
        print(f"\n▶ {scenario['id']}: {scenario['name']}")
        print(f"  Category: {scenario['category']} | Expected turns: {len(scenario['turns'])}")
        
        result = await runner.run_scenario(scenario)
        results.append(result)
        
        status = "✅ PASS" if result.passed else "❌ FAIL"
        print(f"  {status} | {result.completed_turns}/{result.total_turns} turns | {result.duration_seconds:.1f}s")
        
        if result.overall_scores:
            print(f"  Scores: {', '.join(f'{k}={v:.2f}' for k,v in result.overall_scores.items())}")
    
    # Generate reports
    print(f"\n{'='*60}")
    report_gen = ReportGenerator(config.OUTPUT_DIR)
    
    report_path = report_gen.generate_report(results)
    print(f"Report: {report_path}")
    
    json_path = report_gen.save_json(results)
    print(f"JSON: {json_path}")
    
    passed = sum(1 for r in results if r.passed)
    print(f"\nSUMMARY: {passed}/{len(results)} scenarios passed")


if __name__ == "__main__":
    asyncio.run(main())
