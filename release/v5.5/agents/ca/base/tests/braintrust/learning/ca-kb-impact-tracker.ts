/**
 * CA KB Impact Tracker
 *
 * CA-specific implementation of KB impact tracking.
 * Extends BaseKBImpactTracker with consulting domain knowledge.
 */

import { BaseKBImpactTracker, LocalKBImpactStorage } from '@kessel-digital/agent-core';
import type { KBImpactTrackerConfig } from '@kessel-digital/agent-core';
import * as path from 'path';

// ============================================================================
// CA-SPECIFIC TOPIC EXTRACTION
// ============================================================================

const CA_TOPIC_KEYWORDS: Record<string, string[]> = {
  'strategy': ['strategy', 'strategic', 'vision', 'roadmap', 'planning'],
  'operations': ['operations', 'operational', 'process', 'efficiency'],
  'technology': ['technology', 'tech', 'digital', 'system', 'platform'],
  'transformation': ['transformation', 'change', 'modernization'],
  'analytics': ['analytics', 'data', 'insight', 'intelligence'],
  'organization': ['organization', 'org', 'people', 'talent', 'culture'],
  'financial': ['financial', 'roi', 'npv', 'cost', 'revenue', 'margin'],
  'framework': ['framework', 'methodology', 'approach', 'model'],
};

const CA_VERTICAL_KEYWORDS: Record<string, string[]> = {
  'financial-services': ['bank', 'banking', 'insurance', 'fsi', 'financial'],
  'healthcare': ['healthcare', 'health', 'hospital', 'pharma', 'medical'],
  'retail': ['retail', 'consumer', 'ecommerce', 'store'],
  'manufacturing': ['manufacturing', 'industrial', 'factory', 'supply chain'],
  'technology': ['tech', 'software', 'saas', 'cloud'],
  'private-equity': ['private equity', 'pe', 'portfolio', 'buyout'],
};

// ============================================================================
// CA KB IMPACT TRACKER
// ============================================================================

export class CAKBImpactTracker extends BaseKBImpactTracker {
  constructor(config?: Partial<KBImpactTrackerConfig>) {
    const storagePath = path.join(process.cwd(), '.ca-kb-impact');
    const storage = new LocalKBImpactStorage(storagePath);

    super(
      {
        agentId: 'ca',
        minUsagesForImpact: 8,  // CA may have fewer interactions
        confidenceThreshold: 0.65,
        deprecationThreshold: -0.15,
        enhancementThreshold: 0.05,
        autoGenerateProposals: true,
        maxProposalQueueSize: 50,
        ...config,
      },
      storage
    );
  }

  /**
   * Extract CA-specific topics from a query
   */
  protected override extractTopics(query: string): string[] {
    const normalizedQuery = query.toLowerCase();
    const topics: string[] = [];

    // Extract domain topics
    for (const [topic, keywords] of Object.entries(CA_TOPIC_KEYWORDS)) {
      for (const keyword of keywords) {
        if (normalizedQuery.includes(keyword)) {
          topics.push(topic);
          break;
        }
      }
    }

    // Extract vertical references
    for (const [vertical, keywords] of Object.entries(CA_VERTICAL_KEYWORDS)) {
      for (const keyword of keywords) {
        if (normalizedQuery.includes(keyword)) {
          topics.push(`vertical-${vertical}`);
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
   * Extract document title with CA-specific logic
   */
  protected override extractDocumentTitle(documentId: string): string {
    let title = documentId
      .replace(/^(KB_|CA_|ca_)/i, '')
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

export function createCAKBImpactTracker(
  config?: Partial<KBImpactTrackerConfig>
): CAKBImpactTracker {
  return new CAKBImpactTracker(config);
}

export default CAKBImpactTracker;
