"""
Update Copilot Studio topics via Dataverse API.

This script:
1. Authenticates via MSAL device code flow
2. Queries Dataverse for the Fallback topic botcomponent
3. Updates the topic content to remove/modify moderation settings
"""

import json
import os
import sys
from pathlib import Path

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True)

import requests
from dotenv import load_dotenv
from msal import PublicClientApplication, SerializableTokenCache

# Load environment
load_dotenv()


class DataverseTopicUpdater:
    """Updates Copilot Studio topics via Dataverse API."""

    def __init__(self):
        self.tenant_id = os.getenv("AZURE_TENANT_ID", "3933d83c-778f-4bf2-b5d7-1eea5844e9a3")
        self.client_id = os.getenv("AZURE_CLIENT_ID", "367bd1ab-e7b6-4923-81e2-59d33821c07a")

        # Extract environment from SDK endpoint
        sdk_endpoint = os.getenv("COPILOT_SDK_ENDPOINT", "")
        # Format: https://{env_id}.{region}.environment.api.powerplatform.com/...
        # Dataverse URL: https://{org}.crm.dynamics.com/api/data/v9.2

        # For now, construct Dataverse URL from environment
        # The org name is typically in the form org{hash}.crm{n}.dynamics.com
        self.dataverse_url = os.getenv("DATAVERSE_URL", "")

        self._app = None
        self._token = None
        self._cache_file = Path(__file__).parent / ".msal_token_cache.json"

    def _get_app(self) -> PublicClientApplication:
        """Get or create MSAL app with persistent cache."""
        if self._app is None:
            cache = SerializableTokenCache()
            if self._cache_file.exists():
                cache.deserialize(self._cache_file.read_text())

            self._app = PublicClientApplication(
                client_id=self.client_id,
                authority=f"https://login.microsoftonline.com/{self.tenant_id}",
                token_cache=cache
            )
        return self._app

    def _save_cache(self):
        """Save token cache to file."""
        app = self._get_app()
        if app.token_cache.has_state_changed:
            self._cache_file.write_text(app.token_cache.serialize())

    def get_token(self, scope: str) -> str:
        """Get access token for the specified scope."""
        app = self._get_app()
        scopes = [scope]

        # Try silent authentication first
        accounts = app.get_accounts()
        if accounts:
            result = app.acquire_token_silent(scopes, account=accounts[0])
            if result and "access_token" in result:
                self._save_cache()
                return result["access_token"]

        # Fall back to device code flow
        flow = app.initiate_device_flow(scopes=scopes)
        if "user_code" not in flow:
            raise Exception(f"Failed to create device flow: {flow.get('error_description', 'Unknown error')}")

        print(flow["message"])
        result = app.acquire_token_by_device_flow(flow)

        if "access_token" in result:
            self._save_cache()
            return result["access_token"]
        else:
            raise Exception(f"Authentication failed: {result.get('error_description', 'Unknown error')}")

    def discover_dataverse_url(self) -> str:
        """Discover Dataverse URL for the environment."""
        if self.dataverse_url:
            return self.dataverse_url

        # Use Business App Platform API to discover environments
        token = self.get_token("https://service.powerapps.com/.default")

        # Get environments using BAP API
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json"
        }

        resp = requests.get(
            "https://api.bap.microsoft.com/providers/Microsoft.BusinessAppPlatform/scopes/admin/environments?api-version=2020-10-01",
            headers=headers
        )

        if resp.status_code == 200:
            envs = resp.json().get("value", [])
            print(f"Found {len(envs)} environments:")
            for env in envs:
                name = env.get("properties", {}).get("displayName", "Unknown")
                env_id = env.get("name", "")
                linked_env = env.get("properties", {}).get("linkedEnvironmentMetadata", {})
                instance_url = linked_env.get("instanceUrl", "")
                print(f"  - {name} ({env_id})")
                if instance_url:
                    print(f"    Dataverse: {instance_url}")
                    # Prefer Aragorn AI environment for MPA testing
                    if "aragorn" in name.lower() or "aragorn" in instance_url.lower():
                        self.dataverse_url = instance_url.rstrip("/") + "/api/data/v9.2"
                        print(f"    >> Selected as target environment")
                    elif not self.dataverse_url:
                        self.dataverse_url = instance_url.rstrip("/") + "/api/data/v9.2"
        else:
            print(f"Failed to get environments: {resp.status_code} - {resp.text[:200]}")

        return self.dataverse_url

    def list_bots(self) -> list:
        """List all Copilot bots in the environment."""
        dataverse_url = self.discover_dataverse_url()
        if not dataverse_url:
            print("ERROR: Could not discover Dataverse URL")
            return []

        token = self.get_token(f"{dataverse_url.split('/api/')[0]}/.default")

        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0"
        }

        resp = requests.get(
            f"{dataverse_url}/bots?$select=name,botid,schemaname",
            headers=headers
        )

        if resp.status_code == 200:
            bots = resp.json().get("value", [])
            print(f"\nFound {len(bots)} Copilot bots:")
            for bot in bots:
                print(f"  - {bot.get('name')} (ID: {bot.get('botid')})")
            return bots
        else:
            print(f"Failed to list bots: {resp.status_code} - {resp.text[:500]}")
            return []

    def list_bot_topics(self, bot_id: str) -> list:
        """List all topics for a specific bot."""
        dataverse_url = self.discover_dataverse_url()
        if not dataverse_url:
            print("ERROR: Could not discover Dataverse URL")
            return []

        token = self.get_token(f"{dataverse_url.split('/api/')[0]}/.default")

        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0"
        }

        # Query botcomponents where parentbotid matches and componenttype is Topic (0 or 9)
        filter_query = f"_parentbotid_value eq {bot_id} and (componenttype eq 0 or componenttype eq 9)"

        resp = requests.get(
            f"{dataverse_url}/botcomponents?$filter={filter_query}&$select=name,botcomponentid,schemaname,componenttype,content",
            headers=headers
        )

        if resp.status_code == 200:
            topics = resp.json().get("value", [])
            print(f"\nFound {len(topics)} topics for bot {bot_id}:")
            for topic in topics:
                print(f"  - {topic.get('name')} (ID: {topic.get('botcomponentid')}, Type: {topic.get('componenttype')})")
            return topics
        else:
            print(f"Failed to list topics: {resp.status_code} - {resp.text[:500]}")
            return []

    def get_topic_content(self, topic_id: str) -> dict:
        """Get the full content of a topic."""
        dataverse_url = self.discover_dataverse_url()
        if not dataverse_url:
            return {}

        token = self.get_token(f"{dataverse_url.split('/api/')[0]}/.default")

        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0"
        }

        resp = requests.get(
            f"{dataverse_url}/botcomponents({topic_id})",
            headers=headers
        )

        if resp.status_code == 200:
            return resp.json()
        else:
            print(f"Failed to get topic: {resp.status_code} - {resp.text[:500]}")
            return {}

    def update_topic_content(self, topic_id: str, content: str) -> bool:
        """Update the content of a topic."""
        dataverse_url = self.discover_dataverse_url()
        if not dataverse_url:
            return False

        token = self.get_token(f"{dataverse_url.split('/api/')[0]}/.default")

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0"
        }

        payload = {
            "content": content
        }

        resp = requests.patch(
            f"{dataverse_url}/botcomponents({topic_id})",
            headers=headers,
            json=payload
        )

        if resp.status_code in (200, 204):
            print(f"Successfully updated topic {topic_id}")
            return True
        else:
            print(f"Failed to update topic: {resp.status_code} - {resp.text[:500]}")
            return False


def main():
    """Main entry point."""
    updater = DataverseTopicUpdater()

    print("=" * 60)
    print("Copilot Studio Topic Updater via Dataverse API")
    print("=" * 60)

    # Step 1: Discover Dataverse URL
    print("\n[Step 1] Discovering Dataverse URL...")
    dataverse_url = updater.discover_dataverse_url()

    if not dataverse_url:
        print("ERROR: Could not discover Dataverse URL")
        print("Please set DATAVERSE_URL in .env file")
        sys.exit(1)

    print(f"Using Dataverse URL: {dataverse_url}")

    # Step 2: List bots
    print("\n[Step 2] Listing Copilot bots...")
    bots = updater.list_bots()

    if not bots:
        print("No bots found or failed to list bots")
        sys.exit(1)

    # Step 3: For each bot, list topics
    for bot in bots:
        bot_id = bot.get("botid")
        bot_name = bot.get("name")

        print(f"\n[Step 3] Listing topics for bot: {bot_name}")
        topics = updater.list_bot_topics(bot_id)

        # Look for Fallback or Conversational boosting topic (where moderation is set)
        for topic in topics:
            topic_name = topic.get("name", "").lower()
            if "fallback" in topic_name or "conversational boosting" in topic_name or "generative" in topic_name:
                print(f"\n[Step 4] Found topic: {topic.get('name')}")
                topic_id = topic.get("botcomponentid")

                # Get full content
                full_topic = updater.get_topic_content(topic_id)
                if full_topic:
                    content = full_topic.get("content") or ""
                    print(f"Content length: {len(content)} chars")

                    # Check for moderationLevel
                    if "moderationLevel" in content:
                        print("Found moderationLevel in content - updating...")

                        # Parse and modify content
                        try:
                            content_json = json.loads(content)
                            # Remove moderationLevel from nodes
                            modified = False
                            if "nodes" in content_json:
                                for node in content_json["nodes"]:
                                    if "moderationLevel" in node:
                                        del node["moderationLevel"]
                                        modified = True
                                        print(f"  Removed moderationLevel from node: {node.get('id')}")

                            if modified:
                                new_content = json.dumps(content_json)
                                success = updater.update_topic_content(topic_id, new_content)
                                if success:
                                    print("Topic updated successfully!")
                                else:
                                    print("Failed to update topic")
                            else:
                                print("No moderationLevel found in nodes")
                        except json.JSONDecodeError as e:
                            print(f"Failed to parse content as JSON: {e}")
                            print("Content preview:", content[:500])
                    else:
                        print("No moderationLevel found in content - already clean")


if __name__ == "__main__":
    main()
