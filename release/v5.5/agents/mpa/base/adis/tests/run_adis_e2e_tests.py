#!/usr/bin/env python3
"""
ADIS E2E Test Runner

Runs the ADIS integration tests against MPA v6.4 in Copilot Studio.
Uses the Copilot Studio SDK API for automated testing.
"""

import asyncio
import json
import os
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

try:
    from dotenv import load_dotenv
    # Load from the tests directory .env
    env_path = Path(__file__).parent.parent.parent / "tests" / ".env"
    load_dotenv(env_path)
except ImportError:
    pass

try:
    import aiohttp
except ImportError:
    print("Error: aiohttp not installed. Run: pip install aiohttp")
    sys.exit(1)

try:
    from msal import PublicClientApplication, SerializableTokenCache
except ImportError:
    print("Error: msal not installed. Run: pip install msal")
    sys.exit(1)


# Configuration
COPILOT_SDK_ENDPOINT = os.getenv("COPILOT_SDK_ENDPOINT",
    "https://c672b4709cc7e9d8a0e2ca83751f80.0c.environment.api.powerplatform.com/copilotstudio/dataverse-backed/authenticated/bots/copilots_header_a2740/conversations")
API_VERSION = os.getenv("API_VERSION", "2022-03-01-preview")
RESPONSE_TIMEOUT = int(os.getenv("RESPONSE_TIMEOUT", "60"))


# ADIS Test Cases - Part 1: Trigger Detection
ADIS_TRIGGER_TESTS = [
    {
        "id": "1.1",
        "name": "Direct Upload Request",
        "input": "I have customer transaction data I want to analyze",
        "expected_contains": [
            "data analysis",
            "customer",
            "upload",
        ],
        "expected_any": [
            "ADIS", "segmentation", "RFM", "Excel", "CSV", "file"
        ]
    },
    {
        "id": "1.2",
        "name": "RFM Keyword Trigger",
        "input": "Can you help me with RFM analysis of my customer base?",
        "expected_contains": [
            "RFM",
        ],
        "expected_any": [
            "Recency", "Frequency", "Monetary", "segment", "analysis", "data", "upload"
        ]
    },
    {
        "id": "1.3",
        "name": "CLV Keyword Trigger",
        "input": "I need to calculate customer lifetime value for my segments",
        "expected_contains": [],
        "expected_any": [
            "CLV", "lifetime value", "LTV", "customer value", "transaction", "history"
        ]
    },
    {
        "id": "1.4",
        "name": "Best Customers Trigger",
        "input": "How do I identify my best customers for targeting?",
        "expected_contains": [],
        "expected_any": [
            "segment", "value", "RFM", "analysis", "customer data", "targeting", "high-value"
        ]
    },
    {
        "id": "1.5",
        "name": "Segmentation Trigger",
        "input": "I want to segment my customers for a targeted campaign",
        "expected_contains": [],
        "expected_any": [
            "segment", "audience", "targeting", "data", "ADIS", "analysis", "customer"
        ]
    },
]


class AzureAuthenticator:
    """Handles Azure AD device code authentication."""

    def __init__(self):
        self.token: Optional[str] = None
        self.token_expiry: Optional[datetime] = None
        self._app: Optional[PublicClientApplication] = None
        self._scopes = ["https://api.powerplatform.com/.default"]
        self._cache_file = Path(__file__).parent / ".msal_token_cache.json"

    def _get_app(self) -> PublicClientApplication:
        if self._app is None:
            cache = SerializableTokenCache()
            if self._cache_file.exists():
                try:
                    cache.deserialize(self._cache_file.read_text())
                except Exception:
                    pass

            self._app = PublicClientApplication(
                client_id="51f81489-12ee-4a9e-aaae-a2591f45987d",
                authority="https://login.microsoftonline.com/common",
                token_cache=cache
            )

            # Save cache on changes
            def save_cache():
                if cache.has_state_changed:
                    self._cache_file.write_text(cache.serialize())
            import atexit
            atexit.register(save_cache)

        return self._app

    async def get_token(self) -> str:
        if self.token and self.token_expiry and datetime.now() < (self.token_expiry - timedelta(minutes=5)):
            return self.token

        app = self._get_app()

        # Try silent refresh first
        accounts = app.get_accounts()
        if accounts:
            result = app.acquire_token_silent(self._scopes, account=accounts[0])
            if result and "access_token" in result:
                self.token = result["access_token"]
                self.token_expiry = datetime.now() + timedelta(seconds=result.get("expires_in", 3600))
                print("  Using cached token")
                return self.token

        # Device code flow
        flow = app.initiate_device_flow(scopes=self._scopes)
        if "user_code" not in flow:
            raise Exception(f"Failed to create device flow: {flow.get('error_description')}")

        print("\n" + "=" * 60)
        print("AUTHENTICATION REQUIRED")
        print("=" * 60)
        print(flow["message"])
        print("=" * 60 + "\n")

        result = app.acquire_token_by_device_flow(flow)

        if "access_token" in result:
            self.token = result["access_token"]
            self.token_expiry = datetime.now() + timedelta(seconds=result.get("expires_in", 3600))
            print("Authentication successful!\n")
            return self.token
        else:
            raise Exception(f"Authentication failed: {result.get('error_description')}")


class CopilotClient:
    """Client for Copilot Studio SDK API."""

    def __init__(self, authenticator: AzureAuthenticator):
        self.authenticator = authenticator
        self.conversation_id: Optional[str] = None

    async def start_conversation(self) -> bool:
        try:
            token = await self.authenticator.get_token()

            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }

                url = f"{COPILOT_SDK_ENDPOINT}?api-version={API_VERSION}"

                async with session.post(url, headers=headers, json={}) as response:
                    if response.status in [200, 201]:
                        data = await response.json()
                        self.conversation_id = data.get("conversationId") or data.get("id")
                        print(f"  Started conversation: {self.conversation_id[:20]}...")
                        return True
                    else:
                        error_text = await response.text()
                        print(f"  Failed to start conversation: {response.status}")
                        print(f"  {error_text[:200]}")
                        return False

        except Exception as e:
            print(f"  Error starting conversation: {e}")
            return False

    async def send_message(self, message: str) -> Tuple[str, int]:
        start_time = time.time()

        try:
            token = await self.authenticator.get_token()

            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }

                url = f"{COPILOT_SDK_ENDPOINT}/{self.conversation_id}?api-version={API_VERSION}"

                payload = {
                    "activity": {
                        "type": "message",
                        "text": message,
                        "from": {"id": "test_user", "name": "Test User"}
                    }
                }

                async with session.post(url, headers=headers, json=payload) as response:
                    response_time_ms = int((time.time() - start_time) * 1000)

                    if response.status in [200, 201]:
                        data = await response.json()
                        bot_response = self._extract_response(data)
                        return bot_response, response_time_ms
                    else:
                        error_text = await response.text()
                        return f"[ERROR: {response.status}] {error_text[:100]}", response_time_ms

        except Exception as e:
            response_time_ms = int((time.time() - start_time) * 1000)
            return f"[ERROR: {str(e)}]", response_time_ms

    def _extract_response(self, data: Dict) -> str:
        if isinstance(data, dict):
            if "text" in data:
                return data["text"]
            if "activities" in data:
                for activity in data["activities"]:
                    if activity.get("type") == "message" and "text" in activity:
                        return activity["text"]
            if "value" in data:
                return str(data["value"])
        return str(data)

    def reset(self):
        self.conversation_id = None


def check_response(response: str, test: Dict) -> Tuple[bool, List[str], List[str]]:
    """Check if response meets expected criteria."""
    response_lower = response.lower()
    passed = []
    failed = []

    # Check required terms
    for term in test.get("expected_contains", []):
        if term.lower() in response_lower:
            passed.append(f"Contains '{term}'")
        else:
            failed.append(f"Missing required '{term}'")

    # Check any-of terms
    any_terms = test.get("expected_any", [])
    if any_terms:
        found_any = [t for t in any_terms if t.lower() in response_lower]
        if found_any:
            passed.append(f"Contains one of: {', '.join(found_any)}")
        else:
            failed.append(f"Missing any of: {', '.join(any_terms)}")

    overall_pass = len(failed) == 0
    return overall_pass, passed, failed


async def run_tests():
    """Run all ADIS trigger detection tests."""
    print("\n" + "=" * 70)
    print("ADIS E2E Test Runner - Part 1: Trigger Detection Tests")
    print("=" * 70)
    print(f"Endpoint: {COPILOT_SDK_ENDPOINT[:60]}...")
    print(f"Tests: {len(ADIS_TRIGGER_TESTS)}")
    print("=" * 70 + "\n")

    authenticator = AzureAuthenticator()
    client = CopilotClient(authenticator)

    results = []
    passed_count = 0

    for test in ADIS_TRIGGER_TESTS:
        print(f"\n--- Test {test['id']}: {test['name']} ---")
        print(f"Input: {test['input']}")

        # Start fresh conversation for each test
        if not await client.start_conversation():
            results.append({
                "id": test["id"],
                "name": test["name"],
                "passed": False,
                "error": "Failed to start conversation"
            })
            continue

        # Send test message
        response, response_time = await client.send_message(test["input"])

        print(f"Response ({response_time}ms): {response[:200]}{'...' if len(response) > 200 else ''}")

        # Check response
        passed, passed_checks, failed_checks = check_response(response, test)

        if passed:
            print(f"✓ PASS")
            passed_count += 1
        else:
            print(f"✗ FAIL")

        for check in passed_checks:
            print(f"  ✓ {check}")
        for check in failed_checks:
            print(f"  ✗ {check}")

        results.append({
            "id": test["id"],
            "name": test["name"],
            "input": test["input"],
            "response": response,
            "response_time_ms": response_time,
            "passed": passed,
            "passed_checks": passed_checks,
            "failed_checks": failed_checks
        })

        client.reset()
        await asyncio.sleep(1)  # Brief delay between tests

    # Summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY - Part 1: Trigger Detection")
    print("=" * 70)
    print(f"Total: {len(results)}")
    print(f"Passed: {passed_count}")
    print(f"Failed: {len(results) - passed_count}")
    print(f"Pass Rate: {passed_count / len(results) * 100:.1f}%")
    print("=" * 70)

    # Save results
    output_dir = Path(__file__).parent / "results"
    output_dir.mkdir(exist_ok=True)

    output_file = output_dir / f"adis_trigger_tests_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, 'w') as f:
        json.dump({
            "test_date": datetime.now().isoformat(),
            "part": "1 - Trigger Detection",
            "total": len(results),
            "passed": passed_count,
            "failed": len(results) - passed_count,
            "results": results
        }, f, indent=2)

    print(f"\nResults saved to: {output_file}")

    return results, passed_count


if __name__ == "__main__":
    results, passed = asyncio.run(run_tests())
    sys.exit(0 if passed == len(results) else 1)
