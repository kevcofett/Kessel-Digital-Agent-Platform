#!/usr/bin/env python3
"""
MPA v6.0 Agent Publisher - Publishes all specialist agents
"""

import subprocess
import time

# All agents to publish (schema names)
AGENTS = [
    "mpa_analytics_agent",
    "mpa_audience_agent",
    "mpa_channel_agent",
    "mpa_supply_path_agent",
    "mpa_document_agent",
    "mpa_performance_agent",
    "mpa_change_agent",
    "mpa_strategy_agent",
    "mpa_marketing_agent"
]


def run_pac_command(args):
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
    print("MPA v6.0 Agent Publisher")
    print("=" * 60)

    published = []
    failed = []

    for agent in AGENTS:
        print(f"\nPublishing: {agent}")
        code, out, err = run_pac_command([
            "copilot", "publish",
            "--bot", agent
        ])

        if code == 0:
            print(f"  SUCCESS: {agent}")
            published.append(agent)
        else:
            error_msg = (err or out)[:200]
            print(f"  FAILED: {error_msg}")
            failed.append({"agent": agent, "error": error_msg})

        # Small delay between publishes
        time.sleep(2)

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Published: {len(published)}")
    print(f"Failed: {len(failed)}")

    if published:
        print("\nSuccessfully published:")
        for a in published:
            print(f"  - {a}")

    if failed:
        print("\nFailed:")
        for f in failed:
            print(f"  - {f['agent']}: {f['error'][:100]}")

    return published, failed


if __name__ == "__main__":
    main()
