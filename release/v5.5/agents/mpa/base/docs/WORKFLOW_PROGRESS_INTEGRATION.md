# Workflow Progress Card Integration Guide

## Overview

The workflow progress card provides visual feedback to users about their position in the 10-step media planning workflow. This document explains how to integrate the card into Copilot Studio topics and Power Automate flows.

## Card Location

- **Template**: `cards/workflow_progress.json`
- **KB Reference**: `kb/WORKFLOW_STEPS.txt`

## Data Binding

The card uses template expressions (`${variable}`) for dynamic content. Bind these variables before rendering:

### Required Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `current_step` | number | Current step number (1-10) | `3` |
| `step_name` | string | Current step display name | `"Channel Strategy"` |
| `completed_steps` | string | Comma-separated completed step names | `"Brief Intake, Audience"` |
| `current_step_name` | string | Current step with status | `"Channel Strategy (in progress)"` |
| `remaining_steps` | string | Count of remaining steps | `"7 steps remaining"` |

### Step Style Variables

Each step column needs a style variable for visual state:

| Variable | Type | Values |
|----------|------|--------|
| `step1_style` through `step10_style` | string | `"good"` (complete), `"emphasis"` (current), `"default"` (pending), `"attention"` (blocked) |

### Optional Gate Variables

| Variable | Type | Description |
|----------|------|-------------|
| `show_gate_info` | boolean | Show gate section |
| `gate_container_style` | string | Gate container style |
| `gate_color` | string | Gate status color |
| `gate_message` | string | Gate status message |

## Copilot Studio Integration

### Topic: Display Progress

Create a topic triggered by user queries about progress:

**Trigger Phrases:**
- "Where am I in the workflow?"
- "Show my progress"
- "What step am I on?"
- "How far along am I?"

**Actions:**

1. **Get Session Data** - Call Power Automate flow to retrieve session state
2. **Calculate Progress** - Determine completed, current, and remaining steps
3. **Prepare Card Data** - Build JSON object with all required variables
4. **Display Card** - Send Adaptive Card with bound data

### Topic: Step Transition

When transitioning between steps, display the progress card automatically:

1. Complete current step actions
2. Update session state with new step
3. Check if validation gate is required
4. Display progress card with updated state
5. Continue to next step logic

## Power Automate Integration

### Flow: Get Workflow Progress

**Trigger:** HTTP request from Copilot Studio

**Input:**
```json
{
  "session_id": "string"
}
```

**Steps:**

1. Query Dataverse for session record
2. Parse current_step and step_statuses from session context
3. Calculate completed, current, remaining
4. Generate style mappings for each step
5. Check for gate requirements
6. Return card data object

**Output:**
```json
{
  "current_step": 3,
  "step_name": "Channel Strategy",
  "completed_steps": "Brief Intake, Audience Definition",
  "current_step_name": "Channel Strategy",
  "remaining_steps": "7 steps remaining",
  "step1_style": "good",
  "step2_style": "good",
  "step3_style": "emphasis",
  "step4_style": "default",
  "step5_style": "default",
  "step6_style": "default",
  "step7_style": "default",
  "step8_style": "default",
  "step9_style": "default",
  "step10_style": "default",
  "show_gate_info": true,
  "gate_container_style": "emphasis",
  "gate_color": "Good",
  "gate_message": "Gate 1 passed - Brief complete"
}
```

### Flow: Update Step Progress

**Trigger:** Called when step completes

**Input:**
```json
{
  "session_id": "string",
  "step_number": 3,
  "step_status": "complete",
  "step_data": {}
}
```

**Steps:**

1. Update session record with step status
2. Check if next step has gate requirement
3. If gate required, run gate validation
4. Return updated progress data

## Style Mapping Logic

Use this logic to determine step styles:

```
For each step (1-10):
  If step_status == "complete": style = "good"
  Else if step == current_step: style = "emphasis"
  Else if step_status == "blocked": style = "attention"
  Else: style = "default"
```

## Gate Integration

Gates are automatically checked at these steps:
- Before Step 3: Gate 1 (Brief Completeness)
- Before Step 5: Gate 2 (Channel Selection)
- Before Step 7: Gate 3 (Budget Allocation)
- Before Step 9: Gate 4 (Performance Alignment)
- At Step 10: Gate 5 (Final Approval)

When approaching a gate:
1. Set `show_gate_info = true`
2. Run gate validation checks
3. Set `gate_color` based on pass/fail
4. Set `gate_message` with status details

## Card Actions

The card includes two action buttons:

### View Details
```json
{
  "action": "view_step_details",
  "step": "${current_step}"
}
```
Handle by showing detailed step information and requirements.

### Continue
```json
{
  "action": "continue_workflow"
}
```
Handle by proceeding to next step or running gate validation.

## Error Handling

If session data is unavailable:
1. Show error card with retry option
2. Log error to Application Insights
3. Offer to restart workflow

If step data is corrupted:
1. Attempt to recover from last known good state
2. If recovery fails, offer to restart from last gate
3. Log data integrity issue

## Testing

### Test Cases

1. **Initial State** - New session shows Step 1 active, all others pending
2. **Mid-Progress** - Steps 1-4 complete, Step 5 active, 5-10 pending
3. **Gate Pending** - Approaching gate with validation not yet run
4. **Gate Passed** - Gate validation passed, show success message
5. **Gate Failed** - Gate validation failed, show blocking issues
6. **Final Step** - All steps complete, final approval pending
7. **Complete** - All steps and gates complete

### Validation Checklist

- [ ] Card renders correctly in Copilot Studio
- [ ] All step styles display correctly
- [ ] Progress numbers calculate correctly
- [ ] Gate messages appear at correct steps
- [ ] Actions trigger correct flows
- [ ] Card updates after step completion

## Troubleshooting

### Card Not Rendering

1. Verify JSON is valid (use JSON validator)
2. Check all template variables are bound
3. Ensure Adaptive Cards extension is enabled

### Incorrect Progress

1. Check session state in Dataverse
2. Verify step_statuses array is correctly formatted
3. Confirm current_step value is 1-10

### Gate Not Triggering

1. Verify step number matches gate trigger step
2. Check gate validation flow is deployed
3. Review gate check logic for errors

## Related Documentation

- [WORKFLOW_STEPS.txt](../kb/WORKFLOW_STEPS.txt) - Step definitions
- [validation_gate_summary.json](../cards/validation_gate_summary.json) - Gate card
- [MPA Primary Instructions](../copilot/MPA_PRIMARY_INSTRUCTIONS_v5_1.txt) - Agent instructions
