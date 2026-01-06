# Adaptive Cards Integration Guide

## Overview

This guide describes how to integrate the MPA Adaptive Card templates with Copilot Studio and Power Automate.

**Version:** 5.2
**Last Updated:** December 30, 2025
**Status:** Requires Manual Integration

---

## Contents

1. [Available Templates](#available-templates)
2. [Template Structure](#template-structure)
3. [Copilot Studio Integration](#copilot-studio-integration)
4. [Power Automate Integration](#power-automate-integration)
5. [Data Binding](#data-binding)
6. [Action Handling](#action-handling)
7. [Styling Guidelines](#styling-guidelines)
8. [Testing](#testing)

---

## Available Templates

| Template | File | Purpose |
|----------|------|---------|
| Gap Detection Options | `cards/gap_detection_options.json` | 6-options framework for closing gaps |
| Budget Challenge | `cards/budget_challenge_options.json` | Budget constraint scenarios |
| Validation Gate Summary | `cards/validation_gate_summary.json` | Final plan approval |

---

## Template Structure

### Adaptive Card Version

All templates use Adaptive Cards v1.5, which is compatible with:
- Microsoft Teams
- Copilot Studio
- Power Virtual Agents
- Power Automate (desktop and cloud)

### Standard Sections

```json
{
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.5",
  "metadata": {
    "templateId": "mpa-template-name",
    "version": "5.2",
    "lastUpdated": "2025-12-30",
    "description": "Template purpose"
  },
  "body": [
    // Card content
  ],
  "$data": {
    // Default/sample data for testing
  }
}
```

---

## Copilot Studio Integration

### Step 1: Create a Topic

1. Open Copilot Studio
2. Navigate to your MPA agent
3. Create a new topic (e.g., "Gap Detection Response")
4. Set appropriate trigger phrases

### Step 2: Add Message Node with Adaptive Card

1. Add a "Message" node
2. Click the "+" icon and select "Adaptive Card"
3. Paste the JSON from the template file
4. Replace `${variable}` placeholders with Copilot variables

### Step 3: Configure Variables

Map Copilot variables to card placeholders:

| Card Placeholder | Copilot Variable | Source |
|-----------------|------------------|--------|
| `${gapPercentage}` | `Topic.GapPercentage` | Calculated |
| `${projectedValue}` | `Topic.ProjectedValue` | From API |
| `${targetValue}` | `Topic.TargetValue` | User input |
| `${sessionId}` | `System.ConversationId` | System |

### Step 4: Handle Actions

Create child topics to handle button clicks:

1. "Handle Increase Budget" topic
2. "Handle Improve CVR" topic
3. etc.

Each action submits data that routes to the appropriate handler.

---

## Power Automate Integration

### Using Adaptive Cards in Flows

1. Add "Post adaptive card and wait for response" action
2. Configure the Teams/channel destination
3. Paste the card JSON
4. Map flow variables to placeholders

### Example Flow Expression

```
{
  "gapPercentage": @{variables('calculatedGap')},
  "projectedValue": @{body('Calculate_Projections')?['value']},
  "targetValue": @{triggerBody()?['target']},
  "sessionId": @{workflow()?['run']?['name']}
}
```

### Handling Responses

The response includes:

```json
{
  "action": "select_option",
  "option": "increase_budget",
  "sessionId": "session-123"
}
```

Use a Switch action to route based on `option` value.

---

## Data Binding

### Template Syntax

Use `${propertyName}` for simple bindings:

```json
{
  "type": "TextBlock",
  "text": "Gap: ${gapPercentage}%"
}
```

### Conditional Display

Use `$when` for conditional elements:

```json
{
  "type": "Container",
  "$when": "${warningsCount > 0}",
  "items": [...]
}
```

### Formatting Numbers

For currency formatting, pre-format in the data source:

```json
{
  "totalBudget": "$150,000"  // Pre-formatted string
}
```

### Array Binding

For lists of items, use `$data` with array:

```json
{
  "type": "Container",
  "$data": "${channels}",
  "items": [
    {
      "type": "TextBlock",
      "text": "${name}: ${allocation}%"
    }
  ]
}
```

---

## Action Handling

### Submit Action Structure

All submit actions follow this pattern:

```json
{
  "type": "Action.Submit",
  "title": "Button Text",
  "data": {
    "action": "action_category",
    "option": "specific_option",
    "sessionId": "${sessionId}",
    "additionalData": "value"
  }
}
```

### Action Categories

| Category | Purpose |
|----------|---------|
| `select_option` | Gap detection option selection |
| `budget_decision` | Budget challenge responses |
| `validation_decision` | Plan approval actions |

### Routing Actions

In Copilot Studio, use a Condition node:

```
If System.Activity.Value.action = "select_option"
  Then: Go to "Handle Option Selection"
Else If System.Activity.Value.action = "budget_decision"
  Then: Go to "Handle Budget Decision"
```

---

## Styling Guidelines

### Container Styles

| Style | Use Case |
|-------|----------|
| `default` | Standard content |
| `emphasis` | Highlighted sections |
| `good` | Success/positive outcomes |
| `attention` | Errors/critical alerts |
| `warning` | Warnings/caution |

### Text Sizes

| Size | Use Case |
|------|----------|
| `Small` | Footnotes, subtle info |
| `Default` | Body text |
| `Medium` | Section headers |
| `Large` | Primary headers |
| `ExtraLarge` | Hero content |

### Color Usage

- Use semantic colors (`Attention`, `Warning`, `Good`) over explicit colors
- Reserve explicit colors for brand consistency when required

---

## Testing

### Adaptive Cards Designer

Test cards at: https://adaptivecards.io/designer/

1. Paste your JSON in the Card Payload Editor
2. Add sample data in the Sample Data Editor
3. Preview renders in different hosts

### Sample Data Testing

Each template includes `$data` with sample values:

```json
"$data": {
  "gapPercentage": "20",
  "projectedValue": "1,600 conversions",
  ...
}
```

### Validation Checklist

- [ ] Card renders correctly in Teams
- [ ] All placeholders resolve with data
- [ ] Conditional sections appear/hide correctly
- [ ] Submit actions include required data
- [ ] Card is accessible (screen reader friendly)
- [ ] Buttons are clearly labeled

---

## Common Issues

### "Expression not valid"

- Check for typos in `${variable}` names
- Ensure data types match (string vs number)
- Verify nested property paths

### Card Not Rendering

- Validate JSON syntax
- Check Adaptive Card version compatibility
- Verify host supports used features

### Actions Not Working

- Confirm action handler topic exists
- Verify `data` object structure matches handler expectations
- Check session ID is being passed correctly

---

## Related Files

| File | Purpose |
|------|---------|
| `cards/gap_detection_options.json` | Gap detection card |
| `cards/budget_challenge_options.json` | Budget challenge card |
| `cards/validation_gate_summary.json` | Validation gate card |

---

## References

- [Adaptive Cards Documentation](https://adaptivecards.io/)
- [Adaptive Cards Designer](https://adaptivecards.io/designer/)
- [Copilot Studio Adaptive Cards](https://learn.microsoft.com/microsoft-copilot-studio/authoring-send-message#use-adaptive-cards)
- [Power Automate Adaptive Cards](https://learn.microsoft.com/power-automate/overview-adaptive-cards)
