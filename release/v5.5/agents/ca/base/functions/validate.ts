import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

interface ValidateRequest {
  content: string;
  depth: 'quick' | 'standard' | 'comprehensive';
}

interface ValidationResult {
  valid: boolean;
  issues: string[];
  wordCount: number;
  hasTable: boolean;
  hasCitations: boolean;
  hasRecommendations: boolean;
}

const WORD_MINIMUMS = {
  quick: 1000,
  standard: 3000,
  comprehensive: 5000
};

function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

function hasComparisonTable(content: string): boolean {
  // Check for markdown table syntax
  const markdownTableRegex = /\|[^|]+\|[^|]+\|/;
  // Check for table-like structure with aligned columns
  const alignedTableRegex = /[\w\s]+\s{2,}[\w\s]+\s{2,}[\w\s]+/;
  return markdownTableRegex.test(content) || alignedTableRegex.test(content);
}

function hasCitations(content: string): boolean {
  // Check for common citation patterns
  const bracketCitation = /\[[^\]]+,\s*\d{4}\]/; // [Source, 2024]
  const sourceCitation = /\(Source:[^)]+\)/; // (Source: Name)
  const namedSource = /according to|based on|per|cited|source:/i;
  return bracketCitation.test(content) || sourceCitation.test(content) || namedSource.test(content);
}

function hasRecommendations(content: string): boolean {
  // Check for recommendation language with specificity
  const recommendKeywords = /recommend|should|action|next step|implementation|owner|timeline|by\s+(Q[1-4]|\d{4}|end of)/i;
  const actionItems = /\d+\.\s+\w+.*should|action item|recommended action/i;
  return recommendKeywords.test(content) || actionItems.test(content);
}

export async function validate(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Validate function invoked');

  try {
    const body = await request.json() as ValidateRequest;

    if (!body.content || !body.depth) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required fields: content and depth' }
      };
    }

    const issues: string[] = [];
    const wordCount = countWords(body.content);
    const hasTable = hasComparisonTable(body.content);
    const citations = hasCitations(body.content);
    const recommendations = hasRecommendations(body.content);

    // Check word count
    const minWords = WORD_MINIMUMS[body.depth];
    if (wordCount < minWords) {
      issues.push(`Word count ${wordCount} is below minimum of ${minWords} for ${body.depth} depth`);
    }

    // Check for comparison table (required for standard and comprehensive)
    if ((body.depth === 'standard' || body.depth === 'comprehensive') && !hasTable) {
      issues.push('Missing comparison table (required for standard and comprehensive depths)');
    }

    // Check for citations
    if (!citations) {
      issues.push('Missing citations with source names');
    }

    // Check for recommendations
    if (!recommendations) {
      issues.push('Missing specific recommendations (should include who, what, when)');
    }

    const result: ValidationResult = {
      valid: issues.length === 0,
      issues,
      wordCount,
      hasTable,
      hasCitations: citations,
      hasRecommendations: recommendations
    };

    return {
      status: 200,
      jsonBody: result
    };
  } catch (error) {
    context.error('Validate function error:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' }
    };
  }
}

app.http('validate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: validate
});
