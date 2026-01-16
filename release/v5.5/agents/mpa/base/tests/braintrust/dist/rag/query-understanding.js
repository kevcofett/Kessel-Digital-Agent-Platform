/**
 * Query Understanding Module
 *
 * Implements the Query Understanding Layer from MPA v6.0 Improvement Plan:
 * - Intent Classification: Map queries to media planning workflow steps
 * - Entity Extraction: Extract domain entities for precise retrieval
 * - Query Expansion: Expand queries with domain synonyms
 *
 * @module query-understanding
 * @version 6.0
 */
import { getDocumentTypesForIntent, getStepsForIntent, } from './kb-metadata-parser.js';
import { SYNONYM_MAPPINGS } from './types.js';
// ============================================================================
// CONSTANTS
// ============================================================================
/**
 * Media planning domain synonyms for query expansion
 * Extended from types.ts SYNONYM_MAPPINGS
 */
export const MEDIA_PLANNING_SYNONYMS = {
    ...SYNONYM_MAPPINGS,
    // Channel synonyms
    'ctv': ['connected tv', 'ott', 'streaming tv', 'addressable tv'],
    'programmatic': ['programmatic display', 'display advertising', 'banner ads', 'dsp'],
    'social': ['paid social', 'social media', 'facebook', 'instagram', 'tiktok', 'meta'],
    'search': ['paid search', 'sem', 'ppc', 'google ads', 'bing ads'],
    'retail media': ['rmn', 'retail media network', 'shopper marketing', 'amazon dsp'],
    'ooh': ['out of home', 'outdoor', 'billboards', 'dooh', 'digital out of home'],
    'native': ['native advertising', 'sponsored content', 'content marketing'],
    'audio': ['podcast', 'streaming audio', 'spotify', 'radio'],
    // Objective synonyms
    'awareness': ['upper funnel', 'brand awareness', 'reach', 'top of funnel', 'tofu'],
    'consideration': ['mid funnel', 'engagement', 'mofu', 'interest'],
    'conversion': ['lower funnel', 'performance', 'acquisition', 'bottom of funnel', 'bofu'],
    // Metric synonyms (extended)
    'efficiency': ['cost efficiency', 'media efficiency', 'spend efficiency'],
    'roi': ['return on investment', 'return', 'profit'],
    'mroi': ['marketing roi', 'marketing return'],
    'incremental': ['incrementality', 'incremental lift', 'true lift', 'causal impact'],
    // Budget terms
    'budget': ['spend', 'investment', 'media spend', 'ad spend', 'dollars'],
    'allocation': ['budget allocation', 'media mix', 'channel mix', 'spend distribution'],
};
/**
 * Intent classification patterns
 */
const INTENT_PATTERNS = {
    BENCHMARK_LOOKUP: [
        /what('s| is)?\s+(a\s+)?good\s+\w+/i,
        /typical\s+\w+/i,
        /average\s+\w+/i,
        /benchmark/i,
        /industry\s+standard/i,
        /what\s+should\s+\w+\s+be/i,
        /normal\s+range/i,
    ],
    CHANNEL_SELECTION: [
        /should\s+(i|we)\s+use/i,
        /which\s+channel/i,
        /best\s+channel/i,
        /channel\s+recommendation/i,
        /media\s+mix/i,
        /programmatic\s+(or|vs)/i,
        /ctv\s+(or|vs)/i,
        /compare\s+channel/i,
    ],
    BUDGET_PLANNING: [
        /how\s+(to\s+)?allocate/i,
        /budget\s+(allocation|split|distribution)/i,
        /\$\s*\d+/i,
        /\d+k\s+(budget|spend)/i,
        /\d+\s*(million|m)\s+(budget|spend)/i,
        /spend\s+\d+/i,
        /investment\s+of/i,
    ],
    AUDIENCE_TARGETING: [
        /how\s+(do\s+i|to)\s+reach/i,
        /target(ing)?\s+(audience|customer|consumer)/i,
        /audience\s+(definition|segment|strategy)/i,
        /who\s+(should|are)\s+(we|my)/i,
        /demographic/i,
        /persona/i,
        /gen\s*z|millennial|boomer/i,
    ],
    MEASUREMENT_GUIDANCE: [
        /what\s+kpi/i,
        /how\s+(to\s+)?measure/i,
        /measurement\s+(strategy|framework|plan)/i,
        /attribution/i,
        /tracking/i,
        /analytics/i,
        /success\s+metric/i,
    ],
    WORKFLOW_HELP: [
        /what('s| is)?\s+step/i,
        /how\s+does\s+(the\s+)?process/i,
        /workflow/i,
        /where\s+do\s+(i|we)\s+start/i,
        /next\s+step/i,
        /getting\s+started/i,
    ],
    ECONOMICS_VALIDATION: [
        /is\s+\$?\d+.*realistic/i,
        /can\s+(i|we)\s+achieve/i,
        /feasib(le|ility)/i,
        /unit\s+economics/i,
        /profit\s+margin/i,
        /breakeven/i,
        /ltv.*cac/i,
        /cac.*ltv/i,
    ],
    RISK_ASSESSMENT: [
        /risk/i,
        /what\s+could\s+go\s+wrong/i,
        /concern/i,
        /challenge/i,
        /mitigation/i,
        /contingency/i,
        /downside/i,
    ],
    GENERAL_GUIDANCE: [], // Fallback
};
/**
 * Entity extraction patterns
 */
const ENTITY_PATTERNS = {
    verticals: [
        /\b(retail|ecommerce|e-commerce|saas|b2b|b2c|financial|fintech|healthcare|technology|cpg|automotive|travel|hospitality|entertainment|education|insurance|manufacturing|pharma|telecom)\b/gi,
    ],
    channels: [
        /\b(ctv|ott|programmatic|display|social|search|native|audio|podcast|ooh|retail media|video|youtube|facebook|instagram|tiktok|google|meta|amazon|linkedin)\b/gi,
    ],
    kpis: [
        /\b(cac|cpa|cpm|ctr|cvr|roas|ltv|aov|roi|mroi|iroas|cpc|vtr|viewability|reach|frequency|impressions|clicks|conversions)\b/gi,
    ],
    objectives: [
        /\b(awareness|consideration|conversion|acquisition|retention|engagement|brand|performance|leads?|sales?|revenue|traffic|installs?)\b/gi,
    ],
    regions: [
        /\b(us|usa|united states|north america|latam|latin america|emea|europe|apac|asia|global|domestic|international)\b/gi,
    ],
    dmas: [
        /\b(new york|los angeles|chicago|houston|phoenix|philadelphia|san antonio|san diego|dallas|san jose|austin|jacksonville|fort worth|columbus|charlotte|indianapolis|seattle|denver|washington|boston|nashville|baltimore|oklahoma|las vegas|portland|milwaukee|albuquerque|tucson|fresno|sacramento|mesa|kansas city|atlanta|miami|oakland|minneapolis|tulsa|cleveland|wichita|arlington|new orleans|bakersfield|tampa|aurora|anaheim|santa ana|st\. louis|riverside|corpus christi|pittsburgh|stockton|cincinnati|anchorage|henderson|greensboro|plano|lincoln|orlando|irvine|newark|durham|chula vista|toledo|fort wayne|st\. petersburg|laredo|jersey city|norfolk|lubbock|madison|winston-salem|lexington|hialeah|garland|glendale|reno|baton rouge|akron|spokane|des moines|richmond|birmingham|rochester|modesto|fayetteville|tacoma|oxnard|fontana|moreno valley|shreveport|aurora|yonkers|worcester|salt lake city|little rock|montgomery|grand rapids|amarillo|tallahassee|huntington beach|sioux falls|peoria|knoxville|glendale|vancouver|providence|akron|brownsville|mobile|newport news|tempe|shreveport|chattanooga|fort lauderdale|elk grove)\b/gi,
    ],
    budgetRange: [
        /\$\s*([\d,]+(?:\.\d+)?)\s*(?:k|m|million|thousand)?\s*(?:to|-)\s*\$?\s*([\d,]+(?:\.\d+)?)\s*(?:k|m|million|thousand)?/gi,
        /\$\s*([\d,]+(?:\.\d+)?)\s*(k|m|million|thousand)?(?:\s+budget)?/gi,
        /([\d,]+(?:\.\d+)?)\s*(k|m|million|thousand)\s+(?:budget|spend|investment)/gi,
    ],
    timeframe: [
        /\b(q[1-4]\s*20\d{2}|20\d{2}|this\s+quarter|next\s+quarter|this\s+year|next\s+year|this\s+month|next\s+month|\d+\s*(?:week|month|quarter|year)s?)\b/gi,
    ],
};
// ============================================================================
// MAIN QUERY UNDERSTANDING CLASS
// ============================================================================
export class QueryUnderstanding {
    /**
     * Fully analyze a user query
     */
    analyzeQuery(query) {
        const normalizedQuery = this.normalizeQuery(query);
        const entities = this.extractEntities(query);
        const { primaryIntent, secondaryIntents, confidence } = this.classifyIntent(query, entities);
        const expandedTerms = this.expandQuery(query).expanded;
        // Determine relevant workflow steps based on intent
        const relevantSteps = this.getRelevantSteps(primaryIntent, secondaryIntents, entities);
        // Determine relevant document types
        const relevantDocumentTypes = this.getRelevantDocumentTypes(primaryIntent, secondaryIntents);
        // Determine relevant topics
        const relevantTopics = this.getRelevantTopics(primaryIntent, entities);
        return {
            originalQuery: query,
            normalizedQuery,
            primaryIntent,
            secondaryIntents,
            confidence,
            entities,
            expandedTerms,
            relevantSteps,
            relevantDocumentTypes,
            relevantTopics,
        };
    }
    /**
     * Classify query intent
     */
    classifyIntent(query, entities) {
        const queryLower = query.toLowerCase();
        const scores = {
            BENCHMARK_LOOKUP: 0,
            CHANNEL_SELECTION: 0,
            BUDGET_PLANNING: 0,
            AUDIENCE_TARGETING: 0,
            MEASUREMENT_GUIDANCE: 0,
            WORKFLOW_HELP: 0,
            ECONOMICS_VALIDATION: 0,
            RISK_ASSESSMENT: 0,
            GENERAL_GUIDANCE: 0.1, // Small baseline for fallback
        };
        // Score based on pattern matches
        for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
            for (const pattern of patterns) {
                if (pattern.test(queryLower)) {
                    scores[intent] += 1;
                }
            }
        }
        // Boost scores based on extracted entities
        if (entities) {
            if (entities.kpis.length > 0) {
                scores.BENCHMARK_LOOKUP += 0.5;
                scores.MEASUREMENT_GUIDANCE += 0.3;
            }
            if (entities.channels.length > 0) {
                scores.CHANNEL_SELECTION += 0.5;
            }
            if (entities.budgetRange) {
                scores.BUDGET_PLANNING += 0.7;
                scores.ECONOMICS_VALIDATION += 0.3;
            }
            if (entities.objectives.length > 0) {
                if (entities.objectives.some(o => ['awareness', 'consideration', 'conversion'].includes(o.toLowerCase()))) {
                    scores.CHANNEL_SELECTION += 0.3;
                }
            }
            if (entities.verticals.length > 0) {
                scores.BENCHMARK_LOOKUP += 0.2;
            }
        }
        // Find primary and secondary intents
        const sortedIntents = Object.entries(scores)
            .sort(([, a], [, b]) => b - a)
            .map(([intent]) => intent);
        const primaryIntent = sortedIntents[0];
        const primaryScore = scores[primaryIntent];
        // Secondary intents are those with significant scores
        const secondaryIntents = sortedIntents
            .slice(1)
            .filter(intent => scores[intent] >= 0.5 && scores[intent] >= primaryScore * 0.5);
        // Calculate confidence based on score differentiation
        const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
        const confidence = totalScore > 0 ? Math.min(1, primaryScore / totalScore + 0.3) : 0.5;
        return {
            primaryIntent,
            secondaryIntents,
            confidence: Math.round(confidence * 100) / 100,
        };
    }
    /**
     * Extract domain entities from query
     */
    extractEntities(query) {
        const entities = {
            verticals: [],
            channels: [],
            kpis: [],
            budgetRange: null,
            objectives: [],
            timeframe: null,
            regions: [],
            dmas: [],
        };
        // Extract each entity type
        for (const [entityType, patterns] of Object.entries(ENTITY_PATTERNS)) {
            if (entityType === 'budgetRange') {
                entities.budgetRange = this.extractBudgetRange(query);
            }
            else if (entityType === 'timeframe') {
                const matches = this.extractMatches(query, patterns);
                entities.timeframe = matches[0] || null;
            }
            else {
                const matches = this.extractMatches(query, patterns);
                entities[entityType] = [...new Set(matches.map(m => m.toLowerCase()))];
            }
        }
        return entities;
    }
    /**
     * Expand query with synonyms
     */
    expandQuery(query) {
        const queryLower = query.toLowerCase();
        const expanded = [query];
        const synonymsUsed = {};
        for (const [term, synonyms] of Object.entries(MEDIA_PLANNING_SYNONYMS)) {
            // Check if query contains the term or any synonym
            const termPattern = new RegExp(`\\b${this.escapeRegex(term)}\\b`, 'i');
            if (termPattern.test(queryLower)) {
                // Term found, add query variations with synonyms
                for (const synonym of synonyms.slice(0, 3)) { // Limit to top 3 synonyms
                    const expandedQuery = query.replace(termPattern, synonym);
                    if (expandedQuery !== query) {
                        expanded.push(expandedQuery);
                        if (!synonymsUsed[term])
                            synonymsUsed[term] = [];
                        synonymsUsed[term].push(synonym);
                    }
                }
            }
            else {
                // Check if any synonym is in the query
                for (const synonym of synonyms) {
                    const synonymPattern = new RegExp(`\\b${this.escapeRegex(synonym)}\\b`, 'i');
                    if (synonymPattern.test(queryLower)) {
                        // Synonym found, add query variation with canonical term
                        const expandedQuery = query.replace(synonymPattern, term);
                        if (expandedQuery !== query) {
                            expanded.push(expandedQuery);
                            if (!synonymsUsed[synonym])
                                synonymsUsed[synonym] = [];
                            synonymsUsed[synonym].push(term);
                        }
                        break;
                    }
                }
            }
        }
        return {
            original: query,
            expanded: [...new Set(expanded)],
            synonymsUsed,
        };
    }
    /**
     * Normalize query for consistent processing
     */
    normalizeQuery(query) {
        return query
            .toLowerCase()
            .replace(/[^\w\s$%]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }
    // ============================================================================
    // PRIVATE HELPER METHODS
    // ============================================================================
    /**
     * Extract all matches from patterns
     */
    extractMatches(text, patterns) {
        const matches = [];
        for (const pattern of patterns) {
            // Create a new RegExp to avoid lastIndex issues
            const regex = new RegExp(pattern.source, pattern.flags);
            let match;
            while ((match = regex.exec(text)) !== null) {
                matches.push(match[0]);
            }
        }
        return matches;
    }
    /**
     * Extract budget range from query
     */
    extractBudgetRange(query) {
        // Pattern for range: "$500K to $1M" or "$500,000 - $1,000,000"
        const rangePattern = /\$\s*([\d,]+(?:\.\d+)?)\s*(k|m|million|thousand)?\s*(?:to|-)\s*\$?\s*([\d,]+(?:\.\d+)?)\s*(k|m|million|thousand)?/i;
        const rangeMatch = query.match(rangePattern);
        if (rangeMatch) {
            const min = this.parseBudgetValue(rangeMatch[1], rangeMatch[2]);
            const max = this.parseBudgetValue(rangeMatch[3], rangeMatch[4]);
            return { min, max };
        }
        // Pattern for single value: "$500K budget"
        const singlePattern = /\$\s*([\d,]+(?:\.\d+)?)\s*(k|m|million|thousand)?/i;
        const singleMatch = query.match(singlePattern);
        if (singleMatch) {
            const value = this.parseBudgetValue(singleMatch[1], singleMatch[2]);
            return { min: value, max: value };
        }
        // Pattern for text format: "500K budget"
        const textPattern = /([\d,]+(?:\.\d+)?)\s*(k|m|million|thousand)\s+(?:budget|spend|investment)/i;
        const textMatch = query.match(textPattern);
        if (textMatch) {
            const value = this.parseBudgetValue(textMatch[1], textMatch[2]);
            return { min: value, max: value };
        }
        return null;
    }
    /**
     * Parse budget value with multiplier
     */
    parseBudgetValue(value, multiplier) {
        const numValue = parseFloat(value.replace(/,/g, ''));
        if (!multiplier)
            return numValue;
        const mult = multiplier.toLowerCase();
        if (mult === 'k' || mult === 'thousand')
            return numValue * 1000;
        if (mult === 'm' || mult === 'million')
            return numValue * 1000000;
        return numValue;
    }
    /**
     * Get relevant workflow steps based on intent and entities
     */
    getRelevantSteps(primaryIntent, secondaryIntents, entities) {
        const steps = new Set();
        // Add steps from primary intent
        for (const step of getStepsForIntent(primaryIntent)) {
            steps.add(step);
        }
        // Add steps from secondary intents
        for (const intent of secondaryIntents) {
            for (const step of getStepsForIntent(intent)) {
                steps.add(step);
            }
        }
        // Add steps based on entities
        if (entities.objectives.length > 0)
            steps.add(1); // Step 1: Outcomes
        if (entities.budgetRange) {
            steps.add(2); // Step 2: Economics
            steps.add(5); // Step 5: Budget
        }
        if (entities.dmas.length > 0 || entities.regions.length > 0)
            steps.add(4); // Step 4: Geography
        if (entities.channels.length > 0)
            steps.add(7); // Step 7: Channels
        if (entities.kpis.length > 0)
            steps.add(8); // Step 8: Measurement
        return Array.from(steps).sort((a, b) => a - b);
    }
    /**
     * Get relevant document types based on intents
     */
    getRelevantDocumentTypes(primaryIntent, secondaryIntents) {
        const types = new Set();
        // Add types from primary intent
        for (const type of getDocumentTypesForIntent(primaryIntent)) {
            types.add(type);
        }
        // Add types from secondary intents
        for (const intent of secondaryIntents) {
            for (const type of getDocumentTypesForIntent(intent)) {
                types.add(type);
            }
        }
        return Array.from(types);
    }
    /**
     * Get relevant topics based on intent and entities
     */
    getRelevantTopics(primaryIntent, entities) {
        const topics = new Set();
        // Map intents to topics
        const intentToTopics = {
            BENCHMARK_LOOKUP: ['benchmark', 'efficiency'],
            CHANNEL_SELECTION: ['channel'],
            BUDGET_PLANNING: ['budget'],
            AUDIENCE_TARGETING: ['audience'],
            MEASUREMENT_GUIDANCE: ['measurement'],
            ECONOMICS_VALIDATION: ['efficiency', 'benchmark'],
        };
        const intentTopics = intentToTopics[primaryIntent];
        if (intentTopics) {
            for (const topic of intentTopics) {
                topics.add(topic);
            }
        }
        // Add topics based on entities
        if (entities.kpis.length > 0) {
            topics.add('efficiency');
            topics.add('benchmark');
        }
        if (entities.channels.length > 0)
            topics.add('channel');
        if (entities.budgetRange)
            topics.add('budget');
        // Always include general if no specific topics
        if (topics.size === 0) {
            topics.add('general');
        }
        return Array.from(topics);
    }
    /**
     * Escape special regex characters
     */
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
/**
 * Quick intent classification without full analysis
 */
export function quickClassifyIntent(query) {
    const understanding = new QueryUnderstanding();
    const { primaryIntent } = understanding.classifyIntent(query);
    return primaryIntent;
}
/**
 * Quick entity extraction
 */
export function quickExtractEntities(query) {
    const understanding = new QueryUnderstanding();
    return understanding.extractEntities(query);
}
/**
 * Quick query expansion
 */
export function quickExpandQuery(query) {
    const understanding = new QueryUnderstanding();
    return understanding.expandQuery(query).expanded;
}
export default QueryUnderstanding;
//# sourceMappingURL=query-understanding.js.map