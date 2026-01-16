import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

interface GenerateRequest {
  prompt: string;
  framework: string;
  depth: 'quick' | 'standard' | 'comprehensive';
  research?: {
    webResults: any[];
    kbResults: any[];
    citations: any[];
  };
}

interface Section {
  title: string;
  content: string;
  wordCount: number;
}

interface GenerateResult {
  content: string;
  wordCount: number;
  sections: Section[];
}

const WORD_TARGETS = {
  quick: { min: 1000, max: 2000 },
  standard: { min: 3000, max: 4000 },
  comprehensive: { min: 5000, max: 7000 }
};

function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

function extractSections(content: string): Section[] {
  const sections: Section[] = [];
  const sectionRegex = /^##?\s+(.+)$/gm;
  let match;
  let lastIndex = 0;
  let lastTitle = 'Introduction';

  while ((match = sectionRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const sectionContent = content.slice(lastIndex, match.index).trim();
      if (sectionContent) {
        sections.push({
          title: lastTitle,
          content: sectionContent,
          wordCount: countWords(sectionContent)
        });
      }
    }
    lastTitle = match[1];
    lastIndex = match.index + match[0].length;
  }

  // Add final section
  if (lastIndex < content.length) {
    const sectionContent = content.slice(lastIndex).trim();
    if (sectionContent) {
      sections.push({
        title: lastTitle,
        content: sectionContent,
        wordCount: countWords(sectionContent)
      });
    }
  }

  return sections;
}

async function generateWithOpenAI(request: GenerateRequest, target: { min: number; max: number }): Promise<string> {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4';

  if (!apiKey || !endpoint) {
    console.log('Azure OpenAI not configured, returning placeholder');
    return generatePlaceholderContent(request, target);
  }

  const systemPrompt = buildSystemPrompt(request.framework, request.depth, target);
  const userPrompt = buildUserPrompt(request.prompt, request.research);

  try {
    const response = await fetch(
      `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 8000,
          temperature: 0.7
        })
      }
    );

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI generation error:', error);
    return generatePlaceholderContent(request, target);
  }
}

function buildSystemPrompt(framework: string, depth: string, target: { min: number; max: number }): string {
  return `You are an expert strategic consultant. Generate consulting analysis using the ${framework} framework.
The analysis MUST be at least ${target.min} words and no more than ${target.max} words.
For ${depth} depth, structure the response with clear sections, headers, tables where appropriate, and specific recommendations.
Include citations in the format [Source Name, Date] when referencing research data.`;
}

function buildUserPrompt(prompt: string, research?: any): string {
  let userPrompt = prompt;
  if (research?.webResults?.length) {
    userPrompt += '\n\nResearch Data:\n';
    for (const result of research.webResults.slice(0, 5)) {
      userPrompt += `- ${result.title}: ${result.snippet}\n`;
    }
  }
  if (research?.kbResults?.length) {
    userPrompt += '\n\nKnowledge Base Data:\n';
    for (const result of research.kbResults.slice(0, 5)) {
      userPrompt += `- ${result.source}: ${result.content}\n`;
    }
  }
  return userPrompt;
}

function generatePlaceholderContent(request: GenerateRequest, target: { min: number; max: number }): string {
  return `# Consulting Analysis: ${request.prompt}

## Executive Summary

This analysis applies the ${request.framework} framework to address the consulting request. The following sections provide structured analysis with data-backed insights and actionable recommendations.

[Placeholder content - Azure OpenAI integration required for full generation]

Word count target: ${target.min}-${target.max} words
Depth level: ${request.depth}

Note: Configure AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT environment variables for full content generation.`;
}

export async function generate(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Generate function invoked');

  try {
    const body = await request.json() as GenerateRequest;

    if (!body.prompt || !body.framework || !body.depth) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required fields: prompt, framework, depth' }
      };
    }

    const target = WORD_TARGETS[body.depth];
    if (!target) {
      return {
        status: 400,
        jsonBody: { error: 'Invalid depth. Must be quick, standard, or comprehensive' }
      };
    }

    let content = '';
    let attempts = 0;
    const maxAttempts = 3;

    // Loop until word count is met or max attempts reached
    while (attempts < maxAttempts) {
      content = await generateWithOpenAI(body, target);
      const wordCount = countWords(content);

      if (wordCount >= target.min) {
        break;
      }

      context.log(`Attempt ${attempts + 1}: ${wordCount} words, target ${target.min}. Retrying...`);
      attempts++;
    }

    const wordCount = countWords(content);
    const sections = extractSections(content);

    const result: GenerateResult = {
      content,
      wordCount,
      sections
    };

    return {
      status: 200,
      jsonBody: result
    };
  } catch (error) {
    context.error('Generate function error:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' }
    };
  }
}

app.http('generate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: generate
});
