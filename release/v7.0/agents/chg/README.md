# CHG Agent - Change Management Specialist

## Overview

The Change Management Agent (CHG) provides organizational change methodology, stakeholder analysis, and adoption planning within the Kessel Digital Agent Platform. CHG serves as the change management advisor, helping users assess readiness, map stakeholders, and plan successful adoption of transformational initiatives.

## Agent Identity

| Attribute | Value |
|-----------|-------|
| Agent Code | CHG |
| Agent Name | Change Management Agent |
| Domain | Organizational Change |
| Version | 1.0 |
| Created | January 2026 |

## Capabilities

### CHG_READINESS
**Assess Change Readiness**

Evaluates organizational readiness for change initiatives. Assesses leadership alignment, culture, capability, and capacity. Provides readiness scores with strengths, gaps, and recommendations.

**Input:**
- change_description: Description of the change initiative
- org_context: Organizational context (size, history, culture)

**Output:**
- readiness_score: 1-10 readiness assessment
- strengths: Factors supporting change
- gaps: Areas requiring attention
- recommendations: Preparation actions

### CHG_STAKEHOLDER
**Map Stakeholders**

Creates stakeholder maps using Power/Interest grid methodology. Assesses each stakeholder's power, interest, current position, and recommends engagement strategies.

**Input:**
- change_description: The change initiative
- stakeholder_list: List of stakeholders to analyze

**Output:**
- stakeholder_map: Array of stakeholder assessments with:
  - name: Stakeholder identifier
  - power: High/Medium/Low
  - interest: High/Medium/Low
  - position: Supporter/Neutral/Resistor
  - strategy: Recommended engagement approach

### CHG_ADOPTION
**Plan Adoption**

Creates comprehensive adoption and rollout plans. Includes phased approach, training strategy, communication plan, change network, and success metrics.

**Input:**
- change_description: The change initiative
- timeline: Available timeline for rollout
- constraints: Budget, resource, or other constraints

**Output:**
- phases: Array of rollout phases with activities and duration
- success_metrics: KPIs for measuring adoption
- training_approach: Training delivery strategy
- communication_plan: Stakeholder communication strategy

## Routing Rules

### Routes TO CHG (from ORC)
- Change management methodology queries
- Stakeholder analysis requests
- Adoption planning needs
- Resistance management questions
- Change readiness assessments
- Communication planning for change

### Routes FROM CHG
| Destination | Trigger |
|-------------|---------|
| CST | Framework selection queries |
| ANL | Financial impact calculations |
| DOC | Change communication documents, roadmaps |

## Knowledge Base Files

| File | Size | Description |
|------|------|-------------|
| CHG_KB_Change_Core_v1.txt | ~20K | Kotter, ADKAR, Lewin, Bridges, McKinsey 7-S |
| CHG_KB_Stakeholder_Methods_v1.txt | ~17K | Power/Interest grid, RACI, resistance management |
| CHG_KB_Adoption_Planning_v1.txt | ~18K | Rollout strategy, training, sustainment, metrics |

## Change Management Models

### Kotter's 8-Step Model
1. Create urgency
2. Form powerful coalition
3. Create vision for change
4. Communicate the vision
5. Remove obstacles
6. Create short-term wins
7. Build on the change
8. Anchor changes in culture

### ADKAR Model
- **A**wareness - Why change is needed
- **D**esire - Personal motivation to change
- **K**nowledge - How to change
- **A**bility - Skills and behaviors
- **R**einforcement - Sustaining change

### Lewin's Change Model
- Unfreeze - Preparing for change
- Change - Implementing change
- Refreeze - Embedding change

### Bridges Transition Model
- Ending - Letting go of old ways
- Neutral Zone - In-between state
- New Beginning - Embracing new way

### McKinsey 7-S
- Strategy, Structure, Systems
- Shared Values, Skills, Staff, Style

## Usage Examples

### Example 1: Change Readiness Assessment
```
User: "Assess our readiness to implement a new CRM system. We have 500 employees, previous IT projects had mixed success, leadership is supportive but middle management is skeptical."

CHG Response:
- Readiness Score: 6/10
- Strengths: Leadership support, defined scope
- Gaps: Middle management buy-in, change fatigue from past projects
- Recommendations: Build coalition with key managers, document lessons learned, create quick wins
```

### Example 2: Stakeholder Mapping
```
User: "Map stakeholders for our ERP implementation: CEO, CFO, IT Director, Department Heads, Front-line staff"

CHG Response:
| Stakeholder | Power | Interest | Position | Strategy |
|-------------|-------|----------|----------|----------|
| CEO | High | High | Supporter | Manage closely, leverage as sponsor |
| CFO | High | Medium | Neutral | Keep satisfied, address ROI concerns |
| IT Director | Medium | High | Supporter | Keep informed, empower as champion |
| Dept Heads | Medium | High | Mixed | Engage directly, address concerns |
| Front-line | Low | High | Neutral | Keep informed, provide training |
```

### Example 3: Adoption Planning
```
User: "Create an adoption plan for rolling out Microsoft Teams to replace Slack across 1,000 employees over 6 months"

CHG Response:
Phase 1 (Month 1-2): Pilot with IT and early adopters
Phase 2 (Month 3-4): Department-by-department rollout
Phase 3 (Month 5-6): Full deployment and Slack sunset

Training: Blended approach with e-learning + live sessions
Champions: 1 per 50 employees
Metrics: Login rates, channel adoption, support tickets
```

## Stakeholder Analysis Framework

### Power/Interest Grid Quadrants

| Quadrant | Power | Interest | Strategy |
|----------|-------|----------|----------|
| Key Players | High | High | Manage closely, involve in decisions |
| Keep Satisfied | High | Low | Keep informed, don't overwhelm |
| Keep Informed | Low | High | Regular updates, leverage as advocates |
| Monitor | Low | Low | Minimal effort, general communications |

### Resistance Types and Interventions

| Resistance Type | Root Cause | Intervention |
|-----------------|------------|--------------|
| Logical | Rational disagreement | Provide evidence, involve in solution |
| Psychological | Fear, loss of control | Create safety, build confidence |
| Sociological | Group norms, politics | Engage influencers, build coalitions |

## Integration Points

### Dataverse Tables
- ca_project: Project tracking with change status
- ca_deliverable: Change plans and communications

### AI Builder Prompts
- CHG_READINESS_PROMPT
- CHG_STAKEHOLDER_PROMPT
- CHG_ADOPTION_PROMPT

## Test Scenarios

See `tests/CHG_Test_Scenarios.json` for comprehensive test cases including:
- CRM implementation readiness assessment
- ERP stakeholder mapping
- Teams rollout adoption planning
- Cross-agent routing validation
- Kotter 8-step application

## Related Agents

| Agent | Relationship |
|-------|--------------|
| ORC | Routes change management queries to CHG |
| CST | Provides framework selection for change analysis |
| ANL | Calculates financial impact of change |
| DOC | Generates change communication documents |

## Best Practices

### When to Use CHG
- Implementing new systems or processes
- Organizational restructuring
- Digital transformation initiatives
- M&A integration
- Culture change programs

### Keys to Success
1. Assess readiness before launching change
2. Map ALL stakeholders, not just obvious ones
3. Address resistance proactively, not reactively
4. Plan for sustainment, not just implementation
5. Measure adoption with leading AND lagging indicators

---

**Version History**

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial release with 3 capabilities |
