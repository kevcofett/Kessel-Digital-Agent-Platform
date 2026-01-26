# COPILOT DOCUMENT COMPLIANCE REQUIREMENTS

**MANDATORY FOR ALL COPILOT STUDIO DOCUMENTS**

Every Copilot instruction file and knowledge base file MUST comply with these requirements before deployment.

---

## THE 6-RULE COMPLIANCE FRAMEWORK

### RULE 1 - ALL-CAPS HEADERS
All section headers must be in ALL CAPS
- Correct: AUDIENCE STRATEGY
- Wrong: Audience Strategy

### RULE 2 - HYPHENS ONLY FOR LISTS
Use hyphens (-) for all list items, never bullets or numbers
- Correct: - Paid Search
- Wrong: * Paid Search
- Wrong: 1. Paid Search

### RULE 3 - ASCII CHARACTERS ONLY
Use only standard ASCII characters (codes 32-126)
- No emoji
- No curly quotes, use straight quotes
- No en-dash or em-dash, use hyphen
- No ellipsis character, use three periods

### RULE 4 - ZERO VISUAL DEPENDENCIES
Document must be readable as plain text
- No tables
- No markdown formatting (no bold, italic, code blocks)
- No indentation-dependent structures

### RULE 5 - MANDATORY LANGUAGE
Use definitive language throughout
- Correct: You will, You must, Always, Never
- Wrong: You should, Consider, Maybe, Perhaps

### RULE 6 - PROFESSIONAL TONE
Maintain consistent professional voice
- No casual language or slang
- No first-person perspective
- Direct, actionable instructions

---

## CHARACTER LIMITS

### CORE INSTRUCTION FILES
- Minimum: 7,500 characters
- Maximum: 7,999 characters
- Target: 7,500-7,999 characters exactly

### KNOWLEDGE BASE FILES
- Maximum: 36,000 characters per file
- If exceeds limit: Split into multiple files with clear naming (Part 1, Part 2)

### SHAREPOINT DOCUMENTS
- Maximum: 7MB file size
- Maximum: 20 pages
- Maximum: 15,000 words

---

## FILE NAMING CONVENTION

### INSTRUCTION FILES
Format: {AGENT}_Copilot_Instructions_v{VERSION}.txt
Examples:
- ORC_Copilot_Instructions_v1.txt
- ANL_Copilot_Instructions_v1.txt

### KNOWLEDGE BASE FILES
Format: {AGENT}_KB_{TOPIC}_v{VERSION}.txt
Examples:
- ORC_KB_Routing_Logic_v1.txt
- ANL_KB_Analytics_Engine_v1.txt
- CHA_KB_Channel_Registry_v1.txt

---

## PRE-DEPLOYMENT CHECKLIST

Before committing or deploying any Copilot document:

[ ] Headers are ALL CAPS
[ ] Lists use hyphens only
[ ] No special characters (run ASCII check)
[ ] No tables or markdown formatting
[ ] Language is definitive (no should/consider)
[ ] Professional tone throughout
[ ] Core instructions: 7,500-7,999 characters
[ ] KB files: Under 36,000 characters
[ ] File naming follows convention

---

## VALIDATION COMMAND

Run this to check character count:
```
wc -c filename.txt
```

For ASCII validation, check for characters outside range 32-126.

---

## COMMON VIOLATIONS TO AVOID

FORMATTING VIOLATIONS
- Using bullet points or asterisks
- Using numbered lists
- Using markdown bold or italic
- Using tables or columns
- Using code blocks with backticks

CHARACTER VIOLATIONS
- Smart quotes from Word or Google Docs
- Em-dashes copied from web content
- Trademark or copyright symbols
- Emoji or special Unicode characters

LANGUAGE VIOLATIONS
- Hedging words: should, might, could, perhaps
- Casual phrases: kind of, sort of, basically
- First person: I recommend, I suggest

STRUCTURAL VIOLATIONS
- Headers not in ALL CAPS
- Missing sections
- Inconsistent formatting between sections

---

## DOCUMENT STRUCTURE TEMPLATE

For core instruction files, follow this structure:

```
You are the {AGENT_NAME} Agent ({CODE}), {one-line role description}.

CORE PHILOSOPHY
{2-3 sentences on agent purpose and approach}

PRIMARY RESPONSIBILITIES
- {responsibility 1}
- {responsibility 2}
- {responsibility 3}

{DOMAIN-SPECIFIC SECTIONS}
{Content organized by topic area}

TOOLS
{List of available tools/flows}

RESPONSE PRINCIPLES
- {principle 1}
- {principle 2}
- {principle 3}

PROHIBITED BEHAVIORS
- {prohibition 1}
- {prohibition 2}

DATA PRIORITY
1. User-provided data (highest trust)
2. {source 2}
3. {source 3}
4. {source 4} (lowest trust)

CONFIDENCE COMMUNICATION
Always include:
- Confidence level (HIGH/MEDIUM/LOW)
- Key assumptions made
- Data sources used
```

---

**This document is the single source of truth for Copilot compliance. All instruction and KB files must pass validation against these rules.**
