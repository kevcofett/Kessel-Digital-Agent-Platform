/**
 * ADIS Scorers
 *
 * Scoring functions for Audience Data Intelligence System integration.
 * Tests trigger detection, analysis quality, and recommendation appropriateness.
 */
// ============================================================================
// Trigger Detection Scorers
// ============================================================================
/**
 * Scores whether agent detected customer data mention and offered ADIS
 */
export function scoreAdisTriggerDetection(response, userMessage) {
    const triggerKeywords = [
        "customer data",
        "transaction data",
        "purchase history",
        "customer file",
        "crm export",
        "customer list",
        "transaction file",
        "order data",
        "customer base",
        "existing customers",
    ];
    const hasTrigger = triggerKeywords.some((kw) => userMessage.toLowerCase().includes(kw));
    if (!hasTrigger) {
        return {
            scorer: "adis_trigger_detection",
            score: 1.0,
            metadata: { reason: "No trigger keywords in user message" },
            scope: "turn",
        };
    }
    // Check if response offers ADIS capabilities
    const offerPatterns = [
        /analyze.*customer/i,
        /segment.*customer/i,
        /rfm/i,
        /customer.*analysis/i,
        /upload.*file/i,
        /customer.*segmentation/i,
        /identify.*segment/i,
        /value.*segment/i,
        /lifetime.*value/i,
        /clv/i,
    ];
    const offeredAdis = offerPatterns.some((pattern) => pattern.test(response));
    return {
        scorer: "adis_trigger_detection",
        score: offeredAdis ? 1.0 : 0.0,
        metadata: {
            triggerPresent: true,
            adisOffered: offeredAdis,
            reason: offeredAdis
                ? "Agent correctly offered ADIS analysis"
                : "Agent failed to offer ADIS when customer data mentioned",
        },
        scope: "turn",
    };
}
/**
 * Scores whether agent detected RFM-specific request
 */
export function scoreRfmRecognition(response, userMessage) {
    const rfmKeywords = ["rfm", "recency", "frequency", "monetary", "best customers"];
    const hasRfmRequest = rfmKeywords.some((kw) => userMessage.toLowerCase().includes(kw));
    if (!hasRfmRequest) {
        return {
            scorer: "rfm_recognition",
            score: 1.0,
            metadata: { reason: "No RFM keywords in user message" },
            scope: "turn",
        };
    }
    const rfmAcknowledgment = [
        /rfm/i,
        /recency.*frequency.*monetary/i,
        /segment.*customer/i,
        /customer.*value.*analysis/i,
    ];
    const acknowledged = rfmAcknowledgment.some((pattern) => pattern.test(response));
    return {
        scorer: "rfm_recognition",
        score: acknowledged ? 1.0 : 0.0,
        metadata: {
            rfmRequested: true,
            acknowledged,
            reason: acknowledged
                ? "Agent correctly recognized RFM request"
                : "Agent failed to recognize RFM analysis request",
        },
        scope: "turn",
    };
}
/**
 * Scores whether agent detected CLV-specific request
 */
export function scoreClvRecognition(response, userMessage) {
    const clvKeywords = [
        "lifetime value",
        "ltv",
        "clv",
        "customer value",
        "cac",
        "acquisition cost",
    ];
    const hasClvRequest = clvKeywords.some((kw) => userMessage.toLowerCase().includes(kw));
    if (!hasClvRequest) {
        return {
            scorer: "clv_recognition",
            score: 1.0,
            metadata: { reason: "No CLV keywords in user message" },
            scope: "turn",
        };
    }
    const clvAcknowledgment = [
        /lifetime.*value/i,
        /clv/i,
        /ltv/i,
        /customer.*value.*calculat/i,
        /predict.*value/i,
    ];
    const acknowledged = clvAcknowledgment.some((pattern) => pattern.test(response));
    return {
        scorer: "clv_recognition",
        score: acknowledged ? 1.0 : 0.0,
        metadata: {
            clvRequested: true,
            acknowledged,
            reason: acknowledged
                ? "Agent correctly recognized CLV request"
                : "Agent failed to recognize CLV analysis request",
        },
        scope: "turn",
    };
}
// ============================================================================
// AMMO Scorers
// ============================================================================
/**
 * Scores whether agent offered AMMO optimization when audiences + budget present
 */
export function scoreAmmoTrigger(response, conversationContext) {
    const { hasAudiences, hasBudget } = conversationContext;
    if (!hasAudiences || !hasBudget) {
        return {
            scorer: "ammo_trigger",
            score: 1.0,
            metadata: { reason: "Prerequisites not met (need audiences + budget)" },
            scope: "turn",
        };
    }
    const ammoOfferPatterns = [
        /optimiz.*budget/i,
        /optimiz.*allocation/i,
        /ammo/i,
        /audience.*aware.*allocation/i,
        /segment.*specific.*allocation/i,
        /allocat.*across.*segment/i,
        /channel.*affinity/i,
    ];
    const offeredAmmo = ammoOfferPatterns.some((pattern) => pattern.test(response));
    return {
        scorer: "ammo_trigger",
        score: offeredAmmo ? 1.0 : 0.0,
        metadata: {
            audiencesPresent: hasAudiences,
            budgetPresent: hasBudget,
            ammoOffered: offeredAmmo,
            reason: offeredAmmo
                ? "Agent correctly offered AMMO optimization"
                : "Agent failed to offer AMMO when audiences and budget present",
        },
        scope: "turn",
    };
}
/**
 * Scores quality of allocation explanation
 */
export function scoreAllocationRationale(response) {
    let score = 0;
    const criteria = [];
    // Check for channel-level allocation
    if (/\d+%.*channel/i.test(response) || /channel.*\d+%/i.test(response)) {
        score += 0.25;
        criteria.push("channel_allocation_shown");
    }
    // Check for segment-level allocation
    if (/segment.*\d+%/i.test(response) ||
        /champions.*\d/i.test(response) ||
        /at.*risk.*\d/i.test(response)) {
        score += 0.25;
        criteria.push("segment_allocation_shown");
    }
    // Check for affinity reference
    if (/affinity/i.test(response) || /effectiveness.*multiplier/i.test(response)) {
        score += 0.25;
        criteria.push("affinity_referenced");
    }
    // Check for expected outcomes
    if (/expected.*conversion/i.test(response) ||
        /expected.*roi/i.test(response) ||
        /projected/i.test(response)) {
        score += 0.25;
        criteria.push("outcomes_projected");
    }
    return {
        scorer: "allocation_rationale",
        score,
        metadata: {
            criteriaMet: criteria,
            reason: `Allocation rationale quality: ${criteria.length}/4 criteria met`,
        },
        scope: "turn",
    };
}
// ============================================================================
// Segment Presentation Scorers
// ============================================================================
/**
 * Scores quality of RFM segment presentation
 */
export function scoreSegmentPresentation(response) {
    let score = 0;
    const segments = [];
    // Check for key segment names (simplified list)
    const keySegments = [
        { pattern: /champion/i, name: "champions" },
        { pattern: /loyal/i, name: "loyal" },
        { pattern: /at.?risk/i, name: "at_risk" },
        { pattern: /lost/i, name: "lost" },
        { pattern: /potential.*loyal/i, name: "potential_loyalists" },
        { pattern: /new.*customer/i, name: "new_customers" },
    ];
    for (const seg of keySegments) {
        if (seg.pattern.test(response)) {
            segments.push(seg.name);
        }
    }
    // Score based on segment coverage
    score = Math.min(segments.length / 4, 1.0); // Need at least 4 key segments
    // Bonus for showing counts/values
    if (/\d+\s*(customer|member)/i.test(response)) {
        score = Math.min(score + 0.1, 1.0);
    }
    if (/\$[\d,]+/i.test(response) || /value/i.test(response)) {
        score = Math.min(score + 0.1, 1.0);
    }
    return {
        scorer: "segment_presentation",
        score,
        metadata: {
            segmentsFound: segments,
            segmentCount: segments.length,
            reason: `Found ${segments.length} key segments in presentation`,
        },
        scope: "turn",
    };
}
/**
 * Scores channel affinity recommendations
 */
export function scoreChannelAffinityRecommendation(response) {
    let score = 0;
    const recommendations = [];
    // Check for segment-specific channel recommendations
    const patterns = [
        { pattern: /champion.*email/i, rec: "champions_email" },
        { pattern: /champion.*direct.*mail/i, rec: "champions_direct_mail" },
        { pattern: /at.?risk.*retarget/i, rec: "at_risk_retargeting" },
        { pattern: /at.?risk.*programmatic/i, rec: "at_risk_programmatic" },
        { pattern: /lost.*suppress/i, rec: "lost_suppression" },
    ];
    for (const p of patterns) {
        if (p.pattern.test(response)) {
            recommendations.push(p.rec);
            score += 0.2;
        }
    }
    // Check for affinity explanation
    if (/affinity/i.test(response) || /\d+\.?\d*x/i.test(response)) {
        score += 0.2;
        recommendations.push("affinity_explained");
    }
    return {
        scorer: "channel_affinity_recommendation",
        score: Math.min(score, 1.0),
        metadata: {
            recommendationsFound: recommendations,
            reason: `Found ${recommendations.length} channel affinity recommendations`,
        },
        scope: "turn",
    };
}
// ============================================================================
// Language Adaptation Scorers
// ============================================================================
/**
 * Scores jargon avoidance for basic users
 */
export function scoreJargonAvoidance(response, userSophistication) {
    if (userSophistication !== "basic") {
        return {
            scorer: "jargon_avoidance",
            score: 1.0,
            metadata: { reason: "Jargon check only applies to basic users" },
            scope: "turn",
        };
    }
    const jargonTerms = [
        "RFM",
        "CLV",
        "LTV",
        "CAC",
        "ROAS",
        "CPM",
        "CPA",
        "affinity index",
        "BG/NBD",
        "Pareto",
        "decile",
        "cohort",
        "probabilistic",
        "deterministic",
    ];
    const jargonFound = [];
    for (const term of jargonTerms) {
        if (response.toUpperCase().includes(term.toUpperCase())) {
            // Check if jargon is explained in same sentence
            const sentences = response.split(/[.!?]/);
            const sentenceWithTerm = sentences.find((s) => s.toUpperCase().includes(term.toUpperCase()));
            const isExplained = sentenceWithTerm &&
                (/means/i.test(sentenceWithTerm) ||
                    /which is/i.test(sentenceWithTerm) ||
                    /\(.*\)/i.test(sentenceWithTerm));
            if (!isExplained) {
                jargonFound.push(term);
            }
        }
    }
    const score = jargonFound.length === 0 ? 1.0 : Math.max(0, 1 - jargonFound.length * 0.2);
    return {
        scorer: "jargon_avoidance",
        score,
        metadata: {
            unexplainedJargon: jargonFound,
            reason: jargonFound.length === 0
                ? "No unexplained jargon found"
                : `Found ${jargonFound.length} unexplained jargon terms`,
        },
        scope: "turn",
    };
}
/**
 * Scores simplification of results for basic users
 */
export function scoreResultSimplification(response, userSophistication) {
    if (userSophistication !== "basic") {
        return {
            scorer: "result_simplification",
            score: 1.0,
            metadata: { reason: "Simplification check only applies to basic users" },
            scope: "turn",
        };
    }
    let score = 0;
    const simplifications = [];
    // Check for plain language segment names
    const plainLanguage = [
        /best.*customer/i,
        /top.*customer/i,
        /slipping.*away/i,
        /at.*risk/i,
        /haven't.*bought/i,
        /inactive/i,
    ];
    for (const pattern of plainLanguage) {
        if (pattern.test(response)) {
            simplifications.push(pattern.source);
            score += 0.15;
        }
    }
    // Check for actionable next steps
    if (/next.*step/i.test(response) || /you.*should/i.test(response)) {
        simplifications.push("actionable_steps");
        score += 0.2;
    }
    // Check for limiting overwhelming detail
    const allSegments = [
        "champions",
        "loyal",
        "potential",
        "new",
        "promising",
        "attention",
        "sleep",
        "risk",
        "lose",
        "hibernating",
        "lost",
    ];
    const segmentsMentioned = allSegments.filter((s) => response.toLowerCase().includes(s));
    if (segmentsMentioned.length <= 4) {
        simplifications.push("limited_segments");
        score += 0.2;
    }
    return {
        scorer: "result_simplification",
        score: Math.min(score, 1.0),
        metadata: {
            simplifications,
            reason: `Simplification quality: ${simplifications.length} positive indicators`,
        },
        scope: "turn",
    };
}
// ============================================================================
// Composite ADIS Scorer
// ============================================================================
/**
 * Composite scorer for overall ADIS integration quality
 */
export function scoreAdisIntegration(response, context) {
    const scores = [];
    // Always run trigger detection
    scores.push(scoreAdisTriggerDetection(response, context.userMessage));
    // Run AMMO trigger if context available
    if (context.hasAudiences !== undefined && context.hasBudget !== undefined) {
        scores.push(scoreAmmoTrigger(response, {
            hasAudiences: context.hasAudiences,
            hasBudget: context.hasBudget,
        }));
    }
    // Run segment presentation
    scores.push(scoreSegmentPresentation(response));
    // Run channel affinity
    scores.push(scoreChannelAffinityRecommendation(response));
    // Run language adaptation if sophistication known
    if (context.userSophistication) {
        scores.push(scoreJargonAvoidance(response, context.userSophistication));
        scores.push(scoreResultSimplification(response, context.userSophistication));
    }
    // Calculate weighted average
    const validScores = scores.filter((s) => s.score !== null);
    const avgScore = validScores.reduce((sum, s) => sum + (s.score || 0), 0) / validScores.length;
    return {
        scorer: "adis_integration_composite",
        score: avgScore,
        metadata: {
            componentScores: scores.map((s) => ({ name: s.scorer, score: s.score })),
            reason: `Composite ADIS score from ${validScores.length} components`,
        },
        scope: "conversation",
    };
}
// ============================================================================
// Exports
// ============================================================================
export const ADIS_SCORERS = {
    // Trigger detection
    scoreAdisTriggerDetection,
    scoreRfmRecognition,
    scoreClvRecognition,
    // AMMO
    scoreAmmoTrigger,
    scoreAllocationRationale,
    // Segments
    scoreSegmentPresentation,
    scoreChannelAffinityRecommendation,
    // Language
    scoreJargonAvoidance,
    scoreResultSimplification,
    // Composite
    scoreAdisIntegration,
};
export default ADIS_SCORERS;
//# sourceMappingURL=adis-scorers.js.map