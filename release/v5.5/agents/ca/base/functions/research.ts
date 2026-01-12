import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

interface ResearchRequest {
  topic: string;
  industry: string;
  competitors?: string[];
}

interface WebResult {
  title: string;
  url: string;
  snippet: string;
}

interface KBResult {
  title: string;
  content: string;
  source: string;
}

interface Citation {
  id: string;
  source: string;
  date: string;
}

interface ResearchResult {
  webResults: WebResult[];
  kbResults: KBResult[];
  citations: Citation[];
}

async function executeBingSearch(topic: string, industry: string, competitors?: string[]): Promise<WebResult[]> {
  const searchQuery = `${topic} ${industry} ${competitors?.join(' ') || ''}`;

  const subscriptionKey = process.env.BING_SEARCH_API_KEY;
  if (!subscriptionKey) {
    console.log('Bing Search API key not configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(searchQuery)}&count=10`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': subscriptionKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Bing search failed: ${response.status}`);
    }

    const data = await response.json();
    return (data.webPages?.value || []).map((result: any) => ({
      title: result.name,
      url: result.url,
      snippet: result.snippet
    }));
  } catch (error) {
    console.error('Bing search error:', error);
    return [];
  }
}

async function querySharePointKB(topic: string, industry: string): Promise<KBResult[]> {
  // SharePoint Graph API query would go here
  // For now, return empty array - implementation depends on Graph client setup
  console.log(`Querying SharePoint KB for: ${topic} in ${industry}`);
  return [];
}

function formatCitations(webResults: WebResult[], kbResults: KBResult[]): Citation[] {
  const citations: Citation[] = [];
  let id = 1;

  for (const result of webResults) {
    citations.push({
      id: `web-${id++}`,
      source: result.title,
      date: new Date().toISOString().split('T')[0]
    });
  }

  for (const result of kbResults) {
    citations.push({
      id: `kb-${id++}`,
      source: result.source,
      date: new Date().toISOString().split('T')[0]
    });
  }

  return citations;
}

export async function research(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Research function invoked');

  try {
    const body = await request.json() as ResearchRequest;

    if (!body.topic || !body.industry) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required fields: topic and industry' }
      };
    }

    const webResults = await executeBingSearch(body.topic, body.industry, body.competitors);
    const kbResults = await querySharePointKB(body.topic, body.industry);
    const citations = formatCitations(webResults, kbResults);

    const result: ResearchResult = {
      webResults,
      kbResults,
      citations
    };

    return {
      status: 200,
      jsonBody: result
    };
  } catch (error) {
    context.error('Research function error:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' }
    };
  }
}

app.http('research', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: research
});
