import json
import os
import re

input_dir = '/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/platform/eap/prompts/ai_builder'
output_dir = '/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/base/platform/eap/prompts/ai_builder_txt'

def convert_to_copilot_format(json_data):
    """Convert JSON prompt to Copilot-compliant text format"""
    
    lines = []
    
    # Header
    prompt_code = json_data.get('prompt_code', 'UNKNOWN')
    prompt_name = json_data.get('prompt_name', 'Unknown Prompt')
    agent_code = json_data.get('agent_code', 'UNK')
    
    lines.append(f"{prompt_code}")
    lines.append("=" * len(prompt_code))
    lines.append("")
    lines.append("PROMPT METADATA")
    lines.append("-" * 15)
    lines.append(f"- Name: {prompt_name}")
    lines.append(f"- Agent: {agent_code}")
    lines.append(f"- Version: {json_data.get('prompt_version', '1.0')}")
    lines.append(f"- Model: {json_data.get('model', 'gpt-4')}")
    lines.append(f"- Temperature: {json_data.get('temperature', 0.2)}")
    lines.append(f"- Max Tokens: {json_data.get('max_tokens', 2000)}")
    lines.append("")
    
    # System Message
    lines.append("SYSTEM MESSAGE")
    lines.append("-" * 14)
    lines.append("")
    
    system_msg = json_data.get('system_message', '')
    system_msg = convert_text_to_copilot(system_msg)
    lines.append(system_msg)
    lines.append("")
    
    # User Template
    lines.append("USER TEMPLATE")
    lines.append("-" * 13)
    lines.append("")
    
    user_template = json_data.get('user_template', '')
    user_template = convert_text_to_copilot(user_template)
    lines.append(user_template)
    lines.append("")
    
    # Output Schema (if exists)
    if 'output_schema' in json_data:
        lines.append("OUTPUT SCHEMA")
        lines.append("-" * 13)
        lines.append("")
        lines.append("Return valid JSON matching this structure:")
        lines.append("")
        schema = json_data['output_schema']
        schema_text = format_schema(schema, indent=0)
        lines.append(schema_text)
        lines.append("")
    
    # Input Parameters (extracted from user_template)
    params = re.findall(r'\{\{(\w+)\}\}', json_data.get('user_template', ''))
    if params:
        lines.append("INPUT PARAMETERS")
        lines.append("-" * 16)
        lines.append("")
        for param in sorted(set(params)):
            lines.append(f"- {param}: Text input")
        lines.append("")
    
    return '\n'.join(lines)

def convert_text_to_copilot(text):
    """Convert text to Copilot-compliant format"""
    
    # Replace bullet points with hyphens
    text = re.sub(r'^[\*\u2022]\s*', '- ', text, flags=re.MULTILINE)
    text = re.sub(r'^\d+\.\s+', '- ', text, flags=re.MULTILINE)
    
    # Convert markdown headers to ALL-CAPS (but not inside curly braces)
    def header_replace(match):
        content = match.group(2).strip().upper()
        return f"\n{content}\n"
    
    text = re.sub(r'^(#+)\s*(.+)$', header_replace, text, flags=re.MULTILINE)
    
    # Remove markdown bold/italic but NOT underscores inside {{}}
    # First protect the {{variable}} patterns
    protected = {}
    counter = [0]
    def protect_vars(match):
        key = f"PROTECTEDVAR{counter[0]}ENDVAR"
        counter[0] += 1
        protected[key] = match.group(0)
        return key
    
    text = re.sub(r'\{\{[^}]+\}\}', protect_vars, text)
    
    # Now remove markdown formatting
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    
    # Replace smart quotes with regular quotes
    text = text.replace('\u201c', '"').replace('\u201d', '"')
    text = text.replace('\u2018', "'").replace('\u2019', "'")
    
    # Replace en/em dashes with regular hyphens
    text = text.replace('\u2013', '-').replace('\u2014', '-')
    
    # Restore protected variables
    for key, val in protected.items():
        text = text.replace(key, val)
    
    return text

def format_schema(schema, indent=0):
    """Format JSON schema as readable text"""
    lines = []
    prefix = "  " * indent
    
    if isinstance(schema, dict):
        for key, value in schema.items():
            if isinstance(value, dict):
                lines.append(f"{prefix}- {key}:")
                lines.append(format_schema(value, indent + 1))
            elif isinstance(value, list):
                lines.append(f"{prefix}- {key}: array")
                if value and isinstance(value[0], dict):
                    lines.append(format_schema(value[0], indent + 1))
            elif isinstance(value, str):
                clean_val = value.replace('"', '').strip()
                lines.append(f"{prefix}- {key}: {clean_val}")
            else:
                lines.append(f"{prefix}- {key}: {value}")
    elif isinstance(schema, list):
        if schema and isinstance(schema[0], dict):
            lines.append(format_schema(schema[0], indent))
    
    return '\n'.join(lines)

# Process all JSON files
count = 0
errors = []

for filename in os.listdir(input_dir):
    if filename.endswith('.json'):
        input_path = os.path.join(input_dir, filename)
        output_filename = filename.replace('.json', '.txt')
        output_path = os.path.join(output_dir, output_filename)
        
        try:
            with open(input_path, 'r', encoding='utf-8') as f:
                json_data = json.load(f)
            
            txt_content = convert_to_copilot_format(json_data)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(txt_content)
            
            count += 1
            print(f"Converted: {filename}")
        except Exception as e:
            errors.append(f"{filename}: {str(e)}")
            print(f"Error: {filename} - {str(e)}")

print(f"\n=== COMPLETE ===")
print(f"Converted: {count} files")
print(f"Errors: {len(errors)}")
