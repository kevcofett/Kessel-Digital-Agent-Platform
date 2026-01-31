#!/usr/bin/env python3
"""
MPA v6.0 ORC Routing Topics - Adds routing topics to the main Media Planning Agent
"""

import subprocess
from pathlib import Path

# Configuration
ORC_BOT_ID = "9b94e258-bde9-f011-8543-000d3a3320e6"
SOLUTION_NAME = "MediaPlanningAgentv52"
OUTPUT_DIR = Path("/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v6.0/platform/agent-templates")

# Specialist agent routing configuration
ROUTING_TOPICS = [
    {
        "code": "ANL",
        "schemaName": "RouteToANL",
        "displayName": "Route to Analytics Agent",
        "description": "Routes analytics requests to the Analytics Agent",
        "triggerQueries": [
            "analyze budget",
            "budget projection",
            "calculate projection",
            "run scenario",
            "scenario analysis",
            "marginal returns",
            "statistical analysis",
            "financial modeling",
            "forecast performance",
            "compare scenarios"
        ],
        "targetAgent": "mpa_v6_analytics_agent",
        "targetAgentName": "MPA v6 Analytics Agent"
    },
    {
        "code": "AUD",
        "schemaName": "RouteToAUD",
        "displayName": "Route to Audience Agent",
        "description": "Routes audience requests to the Audience Agent",
        "triggerQueries": [
            "segment audience",
            "audience segmentation",
            "targeting strategy",
            "calculate LTV",
            "lifetime value",
            "propensity scoring",
            "customer journey",
            "audience intelligence",
            "build segments",
            "prioritize audiences"
        ],
        "targetAgent": "mpa_v6_audience_agent",
        "targetAgentName": "MPA v6 Audience Agent"
    },
    {
        "code": "CHA",
        "schemaName": "RouteToCHA",
        "displayName": "Route to Channel Agent",
        "description": "Routes channel requests to the Channel Agent",
        "triggerQueries": [
            "channel selection",
            "media mix",
            "budget allocation",
            "emerging channels",
            "calculate allocation",
            "lookup benchmarks",
            "channel strategy",
            "media mix optimization",
            "channel recommendations",
            "optimize channels"
        ],
        "targetAgent": "mpa_v6_channel_agent",
        "targetAgentName": "MPA v6 Channel Agent"
    },
    {
        "code": "SPO",
        "schemaName": "RouteToSPO",
        "displayName": "Route to Supply Path Agent",
        "description": "Routes supply path requests to the Supply Path Agent",
        "triggerQueries": [
            "supply path",
            "programmatic optimization",
            "fee analysis",
            "partner evaluation",
            "calculate NBI",
            "net bidder impact",
            "analyze fees",
            "evaluate partner",
            "supply transparency",
            "DSP evaluation"
        ],
        "targetAgent": "mpa_v6_supply_path_agent",
        "targetAgentName": "MPA v6 Supply Path Agent"
    },
    {
        "code": "DOC",
        "schemaName": "RouteToDOC",
        "displayName": "Route to Document Agent",
        "description": "Routes document requests to the Document Agent",
        "triggerQueries": [
            "generate document",
            "create brief",
            "media brief",
            "executive summary",
            "channel plan document",
            "budget rationale",
            "performance report",
            "optimization report",
            "export document",
            "create presentation"
        ],
        "targetAgent": "mpa_v6_document_agent",
        "targetAgentName": "MPA v6 Document Agent"
    },
    {
        "code": "PRF",
        "schemaName": "RouteToPRF",
        "displayName": "Route to Performance Agent",
        "description": "Routes performance requests to the Performance Agent",
        "triggerQueries": [
            "analyze performance",
            "campaign performance",
            "detect anomalies",
            "extract learnings",
            "attribution analysis",
            "optimization recommendations",
            "performance monitoring",
            "identify insights",
            "performance trends",
            "campaign analysis"
        ],
        "targetAgent": "mpa_v6_performance_agent",
        "targetAgentName": "MPA v6 Performance Agent"
    },
    {
        "code": "CHG",
        "schemaName": "RouteToCHG",
        "displayName": "Route to Change Agent",
        "description": "Routes change management requests to the Change Agent",
        "triggerQueries": [
            "assess readiness",
            "organizational readiness",
            "map stakeholders",
            "stakeholder analysis",
            "plan adoption",
            "rollout plan",
            "change management",
            "adoption strategy",
            "resistance mitigation",
            "change assessment"
        ],
        "targetAgent": "mpa_v6_change_agent",
        "targetAgentName": "MPA v6 Change Agent"
    },
    {
        "code": "CST",
        "schemaName": "RouteToCST",
        "displayName": "Route to Strategy Agent",
        "description": "Routes strategy requests to the Strategy Agent",
        "triggerQueries": [
            "select framework",
            "strategic framework",
            "apply analysis",
            "SWOT analysis",
            "Porter Five Forces",
            "prioritize initiatives",
            "RICE scoring",
            "MoSCoW prioritization",
            "strategic consulting",
            "initiative ranking"
        ],
        "targetAgent": "mpa_v6_strategy_agent",
        "targetAgentName": "MPA v6 Strategy Agent"
    },
    {
        "code": "MKT",
        "schemaName": "RouteToMKT",
        "displayName": "Route to Marketing Agent",
        "description": "Routes marketing requests to the Marketing Agent",
        "triggerQueries": [
            "create marketing brief",
            "marketing brief",
            "competitive analysis",
            "analyze competitive",
            "develop strategy",
            "marketing strategy",
            "competitive landscape",
            "brand strategy",
            "marketing recommendations",
            "market positioning"
        ],
        "targetAgent": "mpa_v6_marketing_agent",
        "targetAgentName": "MPA v6 Marketing Agent"
    }
]


def generate_routing_topic_yaml(topic: dict) -> str:
    """Generate YAML for a routing topic."""
    triggers_yaml = "\n".join([f"            - {q}" for q in topic["triggerQueries"]])

    return f"""  - kind: DialogComponent
    managedProperties:
      isCustomizable: false

    displayName: {topic["displayName"]}
    parentBotId: {ORC_BOT_ID}
    description: {topic["description"]}
    shareContext: {{}}
    state: Active
    status: Active
    publisherUniqueName: DefaultPublisheraragornai
    schemaName: template-content.topic.{topic["schemaName"]}
    dialog:
      beginDialog:
        kind: OnRecognizedIntent
        id: main
        intent:
          displayName: {topic["displayName"]}
          includeInOnSelectIntent: true
          triggerQueries:
{triggers_yaml}

        actions:
          - kind: SendActivity
            id: sendMessage_route_{topic["code"]}
            activity: |
              I'll connect you with the {topic["targetAgentName"]} for this request.

              Transferring to specialist agent...

          - kind: TransferConversation
            id: transfer_{topic["code"]}
            targetBotId: {topic["targetAgent"]}
"""


def read_existing_template() -> str:
    """Read the existing ORC template."""
    with open("/tmp/orc-template.yaml", "r") as f:
        return f.read()


def main():
    """Main execution."""
    print("=" * 60)
    print("MPA v6.0 ORC Routing Topics")
    print("=" * 60)

    # Read existing template
    print("\nReading existing ORC template...")
    existing_template = read_existing_template()

    # Generate routing topics YAML
    print("\nGenerating routing topics...")
    routing_yaml = ""
    for topic in ROUTING_TOPICS:
        print(f"  - {topic['displayName']}")
        routing_yaml += generate_routing_topic_yaml(topic) + "\n"

    # Insert routing topics before the last component
    # Find the position to insert (before 'components:' ends)
    # We'll append the routing topics to the components section

    # Create the updated template by appending routing topics
    updated_template = existing_template.rstrip() + "\n\n" + routing_yaml

    # Write the updated template
    output_path = OUTPUT_DIR / "orc-routing-update.yaml"
    with open(output_path, "w") as f:
        f.write(updated_template)
    print(f"\nUpdated template written to: {output_path}")

    # Also create a standalone routing topics file for manual addition
    routing_only_path = OUTPUT_DIR / "orc-routing-topics-only.yaml"
    with open(routing_only_path, "w") as f:
        f.write("# ORC Routing Topics - Add these to the Media Planning Agent\n")
        f.write("# Copy and paste into Copilot Studio or use pac copilot commands\n\n")
        f.write(routing_yaml)
    print(f"Routing topics only: {routing_only_path}")

    print("\n" + "=" * 60)
    print("ROUTING TOPICS GENERATED")
    print("=" * 60)
    print(f"\nGenerated {len(ROUTING_TOPICS)} routing topics:")
    for topic in ROUTING_TOPICS:
        print(f"  - {topic['schemaName']} -> {topic['targetAgentName']}")

    print("\n" + "=" * 60)
    print("NEXT STEPS")
    print("=" * 60)
    print("""
Note: The PAC CLI does not support adding topics to existing agents directly.
To add routing topics, you have two options:

OPTION 1: Use Copilot Studio UI
  1. Open Copilot Studio
  2. Select the Media Planning Agent
  3. Create new topics manually with the trigger phrases
  4. Add TransferConversation action to route to specialist agents

OPTION 2: Use pac solution export/import
  1. Export the solution containing the agent
  2. Modify the YAML files directly
  3. Import the updated solution

The generated files can be used as reference for the topic configuration.
""")

    return output_path, routing_only_path


if __name__ == "__main__":
    main()
