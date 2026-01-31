#!/usr/bin/env python3
"""
MPA v6.0 Agent Creator - Creates proper YAML templates for PAC CLI
"""

import json
import subprocess
import os
import shutil
from pathlib import Path
from typing import Dict, List

# Configuration
SOLUTION_NAME = "MediaPlanningAgentv52"
KB_SITE = "https://kesseldigitalcom.sharepoint.com/sites/AragornAI2/MediaPlanningKB"
TEMPLATE_DIR = Path("/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v6.0/platform/agent-templates")
BASE_TEMPLATE_JSON = Path("/Users/kevinbauer/kickStartTemplate-1.0.0.json")

AGENTS = [
    {
        "code": "ANL",
        "schemaName": "mpa_analytics_agent",
        "displayName": "MPA v6 Analytics Agent",
        "description": "Handles budget projections, scenario analysis, marginal returns, statistical calculations, and financial modeling for media planning.",
        "instructions": """You are the Analytics Agent (ANL) for the Media Planning Agent platform. You specialize in quantitative analysis, budget optimization, statistical methods, and performance forecasting.

CAPABILITIES

You execute these capabilities by calling Power Automate flows:

1. CALCULATE_PROJECTION - Forecast campaign performance
   Flow: MPA v6 CalculateProjection

2. RUN_SCENARIO - Compare budget allocation scenarios
   Flow: MPA v6 RunScenario

ANALYTICAL PRINCIPLES

Always communicate uncertainty with confidence intervals. Show your work with clear methodology. Acknowledge limitations and assumptions. Be direct but thorough.""",
        "kbFolders": ["EAP", "ANL"]
    },
    {
        "code": "AUD",
        "schemaName": "mpa_audience_agent",
        "displayName": "MPA v6 Audience Agent",
        "description": "Handles audience segmentation, targeting strategy, LTV modeling, propensity scoring, and customer journey orchestration.",
        "instructions": """You are the Audience Agent (AUD) for the Media Planning Agent platform. You specialize in audience intelligence, segmentation, targeting strategy, and customer journey orchestration.

CAPABILITIES

1. SEGMENT_AUDIENCE - Build and prioritize audience segments
   Flow: MPA v6 SegmentAudience

2. CALCULATE_LTV - Model customer lifetime value
   Flow: MPA v6 CalculateLTV

Lead with LTV, not just conversion probability. Prioritize owned data sources. Ask clarifying questions about business objectives.""",
        "kbFolders": ["EAP", "AUD"]
    },
    {
        "code": "CHA",
        "schemaName": "mpa_channel_agent",
        "displayName": "MPA v6 Channel Agent",
        "description": "Handles channel selection, media mix optimization, budget allocation, and emerging channel evaluation.",
        "instructions": """You are the Channel Agent (CHA) for the Media Planning Agent platform. You specialize in channel strategy, media mix optimization, and emerging channel evaluation.

CAPABILITIES

1. CALCULATE_ALLOCATION - Optimize budget allocation across channels
   Flow: MPA v6 CalculateAllocation

2. LOOKUP_BENCHMARKS - Retrieve channel performance benchmarks
   Flow: MPA v6 LookupBenchmarks

Start with objectives, not channels. Recommend hero, supporting, and test tiers. Provide specific allocation rationale.""",
        "kbFolders": ["EAP", "CHA"]
    },
    {
        "code": "SPO",
        "schemaName": "mpa_supply_path_agent",
        "displayName": "MPA v6 Supply Path Agent",
        "description": "Handles programmatic optimization, fee analysis, partner evaluation, and supply path transparency.",
        "instructions": """You are the Supply Path Optimization Agent (SPO). You specialize in programmatic advertising efficiency, fee transparency, and partner evaluation.

CAPABILITIES

1. CALCULATE_NBI - Calculate net bidder impact
   Flow: MPA v6 CalculateNBI

2. ANALYZE_FEES - Decompose programmatic fee waterfall
   Flow: MPA v6 AnalyzeFees

3. EVALUATE_PARTNER - Score and assess partners
   Flow: MPA v6 EvaluatePartner

Be direct about inefficiencies. Quantify savings opportunities in dollars.""",
        "kbFolders": ["EAP", "SPO"]
    },
    {
        "code": "DOC",
        "schemaName": "mpa_document_agent",
        "displayName": "MPA v6 Document Agent",
        "description": "Generates media planning documents, briefs, reports, and presentation materials.",
        "instructions": """You are the Document Agent (DOC). You specialize in generating professional media planning documents.

CAPABILITIES

1. GENERATE_DOCUMENT - Create comprehensive media planning documents
   Flow: MPA v6 GenerateDocument

Document types: MEDIA_BRIEF, EXECUTIVE_SUMMARY, CHANNEL_PLAN, BUDGET_RATIONALE, PERFORMANCE_REPORT, OPTIMIZATION_REPORT.

Confirm requirements before generating. Use professional, clear language.""",
        "kbFolders": ["EAP", "DOC"]
    },
    {
        "code": "PRF",
        "schemaName": "mpa_performance_agent",
        "displayName": "MPA v6 Performance Agent",
        "description": "Monitors campaign performance, detects anomalies, analyzes attribution, and recommends optimizations.",
        "instructions": """You are the Performance Agent (PRF). You specialize in campaign performance monitoring, attribution analysis, and optimization recommendations.

CAPABILITIES

1. ANALYZE_PERFORMANCE - Comprehensive performance analysis
   Flow: MPA v6 AnalyzePerformance

2. EXTRACT_LEARNINGS - Identify actionable insights
   Flow: MPA v6 ExtractLearnings

3. DETECT_ANOMALIES - Identify unexpected performance changes
   Flow: MPA v6 DetectAnomalies

Lead with most important findings. Quantify impact of recommendations.""",
        "kbFolders": ["EAP", "PRF"]
    },
    {
        "code": "CHG",
        "schemaName": "mpa_change_agent",
        "displayName": "MPA v6 Change Agent",
        "description": "Assesses organizational change readiness, maps stakeholders, and plans adoption strategies.",
        "instructions": """You are the Change Management Agent (CHG). You help organizations navigate change, assess readiness, manage stakeholders, and plan successful adoption.

CAPABILITIES

1. ASSESS_READINESS - Evaluate organizational readiness
   Flow: MPA v6 AssessReadiness

2. MAP_STAKEHOLDERS - Identify and analyze stakeholders
   Flow: MPA v6 MapStakeholders

3. PLAN_ADOPTION - Create adoption and rollout plan
   Flow: MPA v6 PlanAdoption

Apply Kotter 8-Step and ADKAR frameworks. Anticipate resistance and plan mitigation.""",
        "kbFolders": ["EAP", "CHG"]
    },
    {
        "code": "CST",
        "schemaName": "mpa_strategy_agent",
        "displayName": "MPA v6 Strategy Agent",
        "description": "Guides strategic consulting engagements, recommends frameworks, and prioritizes initiatives.",
        "instructions": """You are the Consulting Strategy Agent (CST). You guide users through strategic consulting engagements and help prioritize initiatives.

CAPABILITIES

1. SELECT_FRAMEWORK - Recommend appropriate frameworks
   Flow: MPA v6 SelectFramework

2. APPLY_ANALYSIS - Apply strategic framework
   Flow: MPA v6 ApplyAnalysis

3. PRIORITIZE_INITIATIVES - Score and rank initiatives
   Flow: MPA v6 PrioritizeInitiatives

Frameworks: SWOT, Porter Five Forces, RICE, MoSCoW. Ask clarifying questions before recommending.""",
        "kbFolders": ["EAP", "CST"]
    },
    {
        "code": "MKT",
        "schemaName": "mpa_marketing_agent",
        "displayName": "MPA v6 Marketing Agent",
        "description": "Creates marketing briefs, analyzes competitive landscape, and develops marketing strategies.",
        "instructions": """You are the Marketing Agent (MKT). You specialize in marketing strategy, competitive analysis, and brief development.

CAPABILITIES

1. CREATE_BRIEF - Generate marketing briefs
   Flow: MPA v6 CreateBrief

2. ANALYZE_COMPETITIVE - Analyze competitive landscape
   Flow: MPA v6 AnalyzeCompetitive

3. DEVELOP_STRATEGY - Create marketing strategy
   Flow: MPA v6 DevelopStrategy

Ground recommendations in business objectives. Consider competitive context. Balance brand and performance.""",
        "kbFolders": ["EAP", "MKT"]
    }
]

def create_yaml_template(agent: Dict) -> str:
    """Create a YAML template for the agent."""
    # Escape special characters in instructions for YAML
    instructions = agent["instructions"].replace('"', '\\"')

    yaml_template = f"""kind: BotDefinition
entity:
  accessControlPolicy: ChatbotReaders
  authenticationMode: None
  authenticationTrigger: AsNeeded
  configuration:
    settings:
      GenerativeActionsEnabled: true

  template: kickStartTemplate-1.0.0

components:
  - kind: DialogComponent
    displayName: Greeting
    schemaName: template-content.topic.Greeting
    dialog:
      beginDialog:
        kind: OnRecognizedIntent
        id: main
        intent:
          displayName: Greeting
          triggerQueries:
            - Hello
            - Hi
            - Hey
            - Help me
        actions:
          - kind: SendActivity
            id: greeting_msg
            activity: |
              I'm the {agent['displayName']}. {agent['description'][:100]}

              What would you like help with?

  - kind: DialogComponent
    displayName: Fallback
    schemaName: template-content.topic.Fallback
    dialog:
      beginDialog:
        kind: OnUnknownIntent
        id: main
        actions:
          - kind: SearchAndSummarizeContent
            id: search_kb
            userMessage: =System.Activity.Text
          - kind: SendActivity
            id: fallback_msg
            activity: |
              I can help with {agent['code']} capabilities. Let me know what you'd like to work on.
"""
    return yaml_template

def create_json_template(agent: Dict) -> Dict:
    """Create a JSON template for the agent."""
    template = {
        "version": "1.0.0",
        "metadata": {
            "templateName": "kickStartTemplate",
            "templateVersion": "1.0.0",
            "source": "CopilotStudio",
            "quality": "PrivatePreview"
        },
        "content": {
            "displayName": agent["displayName"],
            "description": agent["description"],
            "instructions": agent["instructions"],
            "conversationStarters": []
        },
        "customizations": {
            "schema": {
                "type": "object"
            }
        },
        "spec": {
            "connectors": [],
            "knowledgeSources": {
                "sharepointSites": [
                    {
                        "name": "MediaPlanningKB",
                        "description": f"Knowledge source for {agent['code']}",
                        "site": KB_SITE
                    }
                ]
            }
        }
    }
    return template

def run_pac_command(args: List[str]) -> tuple:
    """Run a PAC CLI command."""
    result = subprocess.run(
        ["pac"] + args,
        capture_output=True,
        text=True
    )
    return result.returncode, result.stdout, result.stderr

def main():
    """Main execution."""
    print("=" * 60)
    print("MPA v6.0 Agent Creator (YAML Templates)")
    print("=" * 60)

    # Create output directory
    TEMPLATE_DIR.mkdir(parents=True, exist_ok=True)

    created = []
    failed = []

    for agent in AGENTS:
        print(f"\n{'='*60}")
        print(f"Creating: {agent['displayName']} ({agent['code']})")
        print("=" * 60)

        # Create JSON template file
        json_template = create_json_template(agent)
        json_path = TEMPLATE_DIR / f"{agent['schemaName']}-kickStartTemplate-1.0.0.json"
        with open(json_path, 'w') as f:
            json.dump(json_template, f, indent=2)
        print(f"  JSON template: {json_path.name}")

        # Create YAML template file
        yaml_template = create_yaml_template(agent)
        yaml_path = TEMPLATE_DIR / f"{agent['schemaName']}.yaml"
        with open(yaml_path, 'w') as f:
            f.write(yaml_template)
        print(f"  YAML template: {yaml_path.name}")

        # Create agent using PAC CLI
        print(f"  Running pac copilot create...")
        code, out, err = run_pac_command([
            "copilot", "create",
            "--schemaName", agent["schemaName"],
            "--displayName", agent["displayName"],
            "--templateFileName", str(yaml_path),
            "--solution", SOLUTION_NAME
        ])

        if code == 0:
            print(f"    SUCCESS")
            created.append(agent)
        else:
            # Show only first 200 chars of error
            error_msg = (err or out)[:300]
            print(f"    FAILED: {error_msg}")
            failed.append({"agent": agent, "error": error_msg})

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Created: {len(created)}")
    print(f"Failed: {len(failed)}")

    if created:
        print("\nSuccessfully created:")
        for a in created:
            print(f"  - {a['displayName']} ({a['code']})")

    if failed:
        print("\nFailed:")
        for f in failed:
            print(f"  - {f['agent']['displayName']}")

    # Write results
    results = {
        "created": [{"code": a["code"], "name": a["displayName"], "schemaName": a["schemaName"]} for a in created],
        "failed": [{"code": f["agent"]["code"], "name": f["agent"]["displayName"], "error": f["error"]} for f in failed]
    }

    results_path = TEMPLATE_DIR / "creation-results.json"
    with open(results_path, 'w') as f:
        json.dump(results, f, indent=2)

    print(f"\nResults saved: {results_path}")
    return created, failed

if __name__ == "__main__":
    main()
