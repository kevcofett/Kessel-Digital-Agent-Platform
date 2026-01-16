/**
 * EAP KB Impact Tracker
 *
 * EAP-specific implementation of KB impact tracking.
 * Extends BaseKBImpactTracker with AI/ML platform domain knowledge.
 */

import { BaseKBImpactTracker, LocalKBImpactStorage } from '@kessel-digital/agent-core';
import type { KBImpactTrackerConfig } from '@kessel-digital/agent-core';
import * as path from 'path';

// ============================================================================
// EAP-SPECIFIC TOPIC EXTRACTION
// ============================================================================

const EAP_TOPIC_KEYWORDS: Record<string, string[]> = {
  'architecture': ['architecture', 'design', 'infrastructure', 'system'],
  'integration': ['integration', 'api', 'webhook', 'connect'],
  'security': ['security', 'auth', 'encryption', 'compliance'],
  'data': ['data', 'database', 'storage', 'vector', 'embedding'],
  'ml-ops': ['mlops', 'deployment', 'training', 'fine-tuning'],
  'governance': ['governance', 'policy', 'compliance', 'audit'],
  'rag': ['rag', 'retrieval', 'knowledge base', 'grounded'],
  'llm': ['llm', 'language model', 'gpt', 'claude', 'gemini'],
};

const EAP_PLATFORM_KEYWORDS: Record<string, string[]> = {
  'azure': ['azure', 'microsoft', 'azure openai'],
  'aws': ['aws', 'amazon', 'bedrock', 'sagemaker'],
  'gcp': ['gcp', 'google', 'vertex'],
  'openai': ['openai', 'chatgpt', 'gpt-4'],
  'anthropic': ['anthropic', 'claude'],
};

// ============================================================================
// EAP KB IMPACT TRACKER
// ============================================================================

export class EAPKBImpactTracker extends BaseKBImpactTracker {
  constructor(config?: Partial<KBImpactTrackerConfig>) {
    const storagePath = path.join(process.cwd(), '.eap-kb-impact');
    const storage = new LocalKBImpactStorage(storagePath);

    super(
      {
        agentId: 'eap',
        minUsagesForImpact: 5,  // EAP is newer, fewer interactions expected
        confidenceThreshold: 0.6,
        deprecationThreshold: -0.2,
        enhancementThreshold: 0.05,
        autoGenerateProposals: true,
        maxProposalQueueSize: 30,
        ...config,
      },
      storage
    );
  }

  /**
   * Extract EAP-specific topics from a query
   */
  protected override extractTopics(query: string): string[] {
    const normalizedQuery = query.toLowerCase();
    const topics: string[] = [];

    // Extract domain topics
    for (const [topic, keywords] of Object.entries(EAP_TOPIC_KEYWORDS)) {
      for (const keyword of keywords) {
        if (normalizedQuery.includes(keyword)) {
          topics.push(topic);
          break;
        }
      }
    }

    // Extract platform references
    for (const [platform, keywords] of Object.entries(EAP_PLATFORM_KEYWORDS)) {
      for (const keyword of keywords) {
        if (normalizedQuery.includes(keyword)) {
          topics.push(`platform-${platform}`);
          break;
        }
      }
    }

    // Fall back to base implementation if no domain topics found
    if (topics.length === 0) {
      return super.extractTopics(query);
    }

    return [...new Set(topics)];
  }

  /**
   * Extract document title with EAP-specific logic
   */
  protected override extractDocumentTitle(documentId: string): string {
    let title = documentId
      .replace(/^(KB_|EAP_|eap_)/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\.\w+$/, '')
      .trim();

    title = title.replace(/\b\w/g, c => c.toUpperCase());

    return title;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createEAPKBImpactTracker(
  config?: Partial<KBImpactTrackerConfig>
): EAPKBImpactTracker {
  return new EAPKBImpactTracker(config);
}

export default EAPKBImpactTracker;
