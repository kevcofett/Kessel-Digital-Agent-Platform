"use strict";
/**
 * KB Document Impact Tracker
 *
 * Tracks and analyzes the impact of KB (Knowledge Base) documents on agent performance.
 * This helps identify:
 * 1. Which KB documents most improve agent quality
 * 2. Which KB documents are being properly utilized
 * 3. Gaps between what KB documents provide and what the agent needs
 * 4. Opportunities for KB document optimization
 *
 * Key use cases:
 * - A/B testing KB document versions
 * - Identifying underutilized KB documents
 * - Finding correlations between KB content and quality scores
 * - Guiding KB document improvements based on evaluation gaps
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MPA_KB_DOCUMENTS = void 0;
exports.filenameToDocId = filenameToDocId;
exports.trackKBUsage = trackKBUsage;
exports.calculateKBImpactMetrics = calculateKBImpactMetrics;
exports.generateKBOptimizationRecommendations = generateKBOptimizationRecommendations;
exports.generateKBImpactReport = generateKBImpactReport;
exports.saveKBImpactData = saveKBImpactData;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Catalog of MPA KB documents
 */
exports.MPA_KB_DOCUMENTS = [
    {
        id: "supporting-instructions",
        filename: "MPA_Supporting_Instructions_v5_5.txt",
        category: "supporting",
        step: [1, 2],
        version: "5.5",
        lastModified: "2026-01-10",
        contentSummary: "Core operational instructions for steps 1-2, data hierarchy, source transparency",
    },
    {
        id: "expert-lens-budget",
        filename: "MPA_Expert_Lens_Budget_Allocation_v5_5.txt",
        category: "expert_lens",
        step: [2, 5],
        version: "5.5",
        lastModified: "2026-01-10",
        contentSummary: "Budget allocation strategies, efficiency benchmarks, spend pacing",
    },
    {
        id: "expert-lens-audience",
        filename: "MPA_Expert_Lens_Audience_Strategy_v5_5.txt",
        category: "expert_lens",
        step: 3,
        version: "5.5",
        lastModified: "2026-01-10",
        contentSummary: "Audience definition, segmentation, targeting precision vs reach",
    },
    {
        id: "expert-lens-channel",
        filename: "MPA_Expert_Lens_Channel_Mix_v5_5.txt",
        category: "expert_lens",
        step: 7,
        version: "5.5",
        lastModified: "2026-01-10",
        contentSummary: "Channel selection, mix optimization, platform benchmarks",
    },
    {
        id: "expert-lens-measurement",
        filename: "MPA_Expert_Lens_Measurement_Attribution_v5_5.txt",
        category: "expert_lens",
        step: 8,
        version: "5.5",
        lastModified: "2026-01-10",
        contentSummary: "Measurement approaches, attribution models, ROAS limitations",
    },
    {
        id: "implications-audience",
        filename: "MPA_Implications_Audience_Targeting_v5_5.txt",
        category: "implications",
        step: 3,
        version: "5.5",
        lastModified: "2026-01-10",
        contentSummary: "Audience targeting implications, tradeoffs, downstream effects",
    },
    {
        id: "implications-budget",
        filename: "MPA_Implications_Budget_Decisions_v5_5.txt",
        category: "implications",
        step: 5,
        version: "5.5",
        lastModified: "2026-01-10",
        contentSummary: "Budget decision implications, constraints, opportunity costs",
    },
    {
        id: "implications-channel",
        filename: "MPA_Implications_Channel_Shifts_v5_5.txt",
        category: "implications",
        step: 7,
        version: "5.5",
        lastModified: "2026-01-10",
        contentSummary: "Channel shift implications, mix changes, creative requirements",
    },
    {
        id: "implications-measurement",
        filename: "MPA_Implications_Measurement_Choices_v5_5.txt",
        category: "implications",
        step: 8,
        version: "5.5",
        lastModified: "2026-01-10",
        contentSummary: "Measurement choice implications, tracking limitations, attribution gaps",
    },
    {
        id: "geography-dma",
        filename: "MPA_Geography_DMA_Planning_v5_5.txt",
        category: "geography",
        step: 4,
        version: "5.5",
        lastModified: "2026-01-10",
        contentSummary: "DMA planning, geographic targeting, regional strategies",
    },
    {
        id: "conversation-examples",
        filename: "MPA_Conversation_Examples_v5_5.txt",
        category: "conversation",
        step: 6,
        version: "5.5",
        lastModified: "2026-01-10",
        contentSummary: "Example conversations, response patterns, tone guidance",
    },
    {
        id: "calculation-display",
        filename: "MPA_Calculation_Display_v5_5.txt",
        category: "calculation",
        step: 2,
        version: "5.5",
        lastModified: "2026-01-10",
        contentSummary: "Calculation formatting, math display, efficiency computations",
    },
    {
        id: "adaptive-language",
        filename: "MPA_Adaptive_Language_v5_5.txt",
        category: "supporting",
        step: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        version: "5.5",
        lastModified: "2026-01-10",
        contentSummary: "Sophistication matching, language adaptation, acronym handling",
    },
    {
        id: "step-boundary",
        filename: "MPA_Step_Boundary_Guidance_v5_5.txt",
        category: "supporting",
        step: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        version: "5.5",
        lastModified: "2026-01-10",
        contentSummary: "Step boundary enforcement, question discipline, transition guidance",
    },
];
/**
 * Filename to Document ID mapping
 * Used to convert filenames from conversation engine to document IDs for tracking
 */
const FILENAME_TO_ID_MAP = {};
for (const doc of exports.MPA_KB_DOCUMENTS) {
    FILENAME_TO_ID_MAP[doc.filename] = doc.id;
}
/**
 * Convert a filename to its document ID
 */
function filenameToDocId(filename) {
    return FILENAME_TO_ID_MAP[filename] || filename;
}
/**
 * Patterns to detect KB document references in agent responses
 */
const KB_REFERENCE_PATTERNS = {
    "supporting-instructions": [
        /based on kb/i,
        /per (?:the |our )?knowledge base/i,
        /data hierarchy/i,
        /source transparency/i,
    ],
    "expert-lens-budget": [
        /budget.*(?:benchmark|typical|industry)/i,
        /efficiency.*(?:target|range|typical)/i,
        /(?:cac|cpl|cpa).*(?:benchmark|range)/i,
        /spend.*(?:pacing|allocation)/i,
    ],
    "expert-lens-audience": [
        /audience.*(?:segment|definition|profile)/i,
        /targeting.*(?:precision|breadth|reach)/i,
        /(?:demographic|behavioral|contextual).*signal/i,
    ],
    "expert-lens-channel": [
        /channel.*(?:benchmark|mix|selection)/i,
        /(?:platform|channel).*(?:typical|industry|benchmark)/i,
        /media mix.*(?:recommend|suggest|typical)/i,
    ],
    "expert-lens-measurement": [
        /attribution.*(?:model|approach|limitation)/i,
        /roas.*(?:limitation|challenge|issue)/i,
        /measurement.*(?:approach|methodology)/i,
        /incrementality/i,
    ],
    "geography-dma": [
        /dma.*(?:level|specific|target)/i,
        /(?:national|regional|local).*(?:strategy|approach)/i,
        /geographic.*(?:concentration|distribution)/i,
    ],
    "calculation-display": [
        /\$[\d,]+\s*[÷\/]\s*[\d,]+\s*=\s*\$?[\d,]+/i, // Math calculations
        /(?:implied|calculated).*(?:cac|efficiency|cost)/i,
    ],
    "adaptive-language": [
        /cost per customer/i,
        /customer value/i,
        /what a customer is worth/i,
        /what you spend in ads/i,
        /simple terms/i,
        /let me explain/i,
    ],
    "step-boundary": [
        /step \d/i,
        /moving to/i,
        /let us proceed/i,
        /before we discuss/i,
        /one question at a time/i,
    ],
};
/**
 * Track KB usage in a single turn
 * Note: injectedDocuments may contain filenames or document IDs
 * This function converts filenames to IDs for consistent tracking
 */
function trackKBUsage(agentResponse, injectedDocuments, step, turnNumber) {
    const records = [];
    for (const filenameOrId of injectedDocuments) {
        // Convert filename to document ID if necessary
        const docId = filenameToDocId(filenameOrId);
        const patterns = KB_REFERENCE_PATTERNS[docId] || [];
        const wasReferenced = patterns.some((p) => p.test(agentResponse));
        // Find specific content matches
        const contentMatches = [];
        for (const pattern of patterns) {
            const match = agentResponse.match(pattern);
            if (match) {
                contentMatches.push(match[0]);
            }
        }
        records.push({
            documentId: docId,
            step,
            wasInjected: true,
            wasReferenced,
            contentMatches,
            turnNumber,
        });
    }
    return records;
}
/**
 * Aggregate KB usage records into impact metrics
 */
function calculateKBImpactMetrics(usageRecords, qualityScores) {
    const metrics = {};
    // Initialize metrics for all documents
    for (const doc of exports.MPA_KB_DOCUMENTS) {
        metrics[doc.id] = {
            documentId: doc.id,
            documentName: doc.filename,
            timesInjected: 0,
            timesReferenced: 0,
            referenceRate: 0,
            avgMentorshipWhenInjected: 0,
            avgMentorshipWhenNotInjected: 0,
            mentorshipImpact: 0,
            avgCitationWhenInjected: 0,
            avgCitationWhenNotInjected: 0,
            citationImpact: 0,
            avgDataQualityWhenInjected: 0,
            avgDataQualityWhenNotInjected: 0,
            dataQualityImpact: 0,
            mostUsedSections: [],
            unusedSections: [],
            contentUtilizationRate: 0,
        };
    }
    // Aggregate usage records
    for (const record of usageRecords) {
        if (metrics[record.documentId]) {
            if (record.wasInjected) {
                metrics[record.documentId].timesInjected++;
            }
            if (record.wasReferenced) {
                metrics[record.documentId].timesReferenced++;
                metrics[record.documentId].mostUsedSections.push(...record.contentMatches);
            }
        }
    }
    // Calculate correlation with quality scores
    for (const docId of Object.keys(metrics)) {
        const m = metrics[docId];
        // Calculate reference rate
        m.referenceRate = m.timesInjected > 0 ? m.timesReferenced / m.timesInjected : 0;
        // Calculate quality score correlations
        const scoresWhenInjected = qualityScores.filter((s) => s.injectedDocuments.includes(docId));
        const scoresWhenNotInjected = qualityScores.filter((s) => !s.injectedDocuments.includes(docId));
        if (scoresWhenInjected.length > 0) {
            m.avgMentorshipWhenInjected =
                scoresWhenInjected.reduce((sum, s) => sum + s.mentorship, 0) /
                    scoresWhenInjected.length;
            m.avgCitationWhenInjected =
                scoresWhenInjected.reduce((sum, s) => sum + s.citation, 0) /
                    scoresWhenInjected.length;
            m.avgDataQualityWhenInjected =
                scoresWhenInjected.reduce((sum, s) => sum + s.dataQuality, 0) /
                    scoresWhenInjected.length;
        }
        if (scoresWhenNotInjected.length > 0) {
            m.avgMentorshipWhenNotInjected =
                scoresWhenNotInjected.reduce((sum, s) => sum + s.mentorship, 0) /
                    scoresWhenNotInjected.length;
            m.avgCitationWhenNotInjected =
                scoresWhenNotInjected.reduce((sum, s) => sum + s.citation, 0) /
                    scoresWhenNotInjected.length;
            m.avgDataQualityWhenNotInjected =
                scoresWhenNotInjected.reduce((sum, s) => sum + s.dataQuality, 0) /
                    scoresWhenNotInjected.length;
        }
        // Calculate impact deltas
        m.mentorshipImpact = m.avgMentorshipWhenInjected - m.avgMentorshipWhenNotInjected;
        m.citationImpact = m.avgCitationWhenInjected - m.avgCitationWhenNotInjected;
        m.dataQualityImpact = m.avgDataQualityWhenInjected - m.avgDataQualityWhenNotInjected;
        // Calculate content utilization (unique sections referenced)
        const uniqueSections = [...new Set(m.mostUsedSections)];
        m.mostUsedSections = uniqueSections.slice(0, 5);
        m.contentUtilizationRate = m.timesInjected > 0
            ? uniqueSections.length / (m.timesInjected * 3) // Assume 3 potential sections per injection
            : 0;
    }
    return Object.values(metrics);
}
/**
 * Generate optimization recommendations based on impact analysis
 */
function generateKBOptimizationRecommendations(impactMetrics) {
    const recommendations = [];
    for (const metric of impactMetrics) {
        // Low reference rate - document not being used
        if (metric.timesInjected > 5 && metric.referenceRate < 0.2) {
            recommendations.push({
                documentId: metric.documentId,
                recommendationType: "update",
                priority: "high",
                rationale: `Document "${metric.documentName}" is injected frequently but rarely referenced (${(metric.referenceRate * 100).toFixed(1)}% reference rate). Content may not be useful or discoverable.`,
                suggestedChanges: [
                    "Review document structure for clearer section headers",
                    "Add more specific benchmarks and data points",
                    "Ensure content directly answers common questions for this step",
                ],
                expectedImpact: "Increase reference rate and improve citation quality",
            });
        }
        // Positive quality impact - document is helping
        if (metric.mentorshipImpact > 0.1 || metric.citationImpact > 0.1) {
            recommendations.push({
                documentId: metric.documentId,
                recommendationType: "expand",
                priority: "medium",
                rationale: `Document "${metric.documentName}" shows positive impact on quality scores (+${(metric.mentorshipImpact * 100).toFixed(1)}% mentorship, +${(metric.citationImpact * 100).toFixed(1)}% citation). Consider expanding.`,
                suggestedChanges: [
                    "Add more examples in the most-used sections",
                    "Expand benchmark data coverage",
                    "Add additional industry verticals",
                ],
                expectedImpact: "Further improve quality scores when document is injected",
            });
        }
        // Negative quality impact - document may be confusing
        if (metric.mentorshipImpact < -0.1 || metric.dataQualityImpact < -0.1) {
            recommendations.push({
                documentId: metric.documentId,
                recommendationType: "update",
                priority: "high",
                rationale: `Document "${metric.documentName}" shows negative correlation with quality scores. May be confusing or outdated.`,
                suggestedChanges: [
                    "Review for conflicting guidance",
                    "Simplify complex sections",
                    "Update outdated benchmarks",
                    "Clarify ambiguous instructions",
                ],
                expectedImpact: "Remove negative quality impact",
            });
        }
        // Very low injection count - might be unnecessary
        if (metric.timesInjected < 2 && metric.referenceRate === 0) {
            recommendations.push({
                documentId: metric.documentId,
                recommendationType: "consolidate",
                priority: "low",
                rationale: `Document "${metric.documentName}" is rarely injected and never referenced. Consider consolidating into another document.`,
                suggestedChanges: [
                    "Merge content into a related document",
                    "Or ensure step triggers injection correctly",
                ],
                expectedImpact: "Reduce KB complexity, improve maintenance",
            });
        }
    }
    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    return recommendations;
}
/**
 * Generate a formatted report of KB impact analysis
 */
function generateKBImpactReport(impactMetrics, recommendations) {
    const lines = [];
    lines.push("# KB Document Impact Analysis Report");
    lines.push("");
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push("");
    // Summary statistics
    const totalInjections = impactMetrics.reduce((sum, m) => sum + m.timesInjected, 0);
    const totalReferences = impactMetrics.reduce((sum, m) => sum + m.timesReferenced, 0);
    const avgReferenceRate = totalInjections > 0 ? totalReferences / totalInjections : 0;
    lines.push("## Summary");
    lines.push("");
    lines.push(`- **Total KB Injections:** ${totalInjections}`);
    lines.push(`- **Total KB References:** ${totalReferences}`);
    lines.push(`- **Average Reference Rate:** ${(avgReferenceRate * 100).toFixed(1)}%`);
    lines.push("");
    // Document-level metrics
    lines.push("## Document Impact Metrics");
    lines.push("");
    lines.push("| Document | Injected | Referenced | Ref Rate | Mentorship Δ | Citation Δ |");
    lines.push("|----------|----------|------------|----------|--------------|------------|");
    for (const metric of impactMetrics.sort((a, b) => b.mentorshipImpact - a.mentorshipImpact)) {
        lines.push(`| ${metric.documentName.slice(0, 30)} | ${metric.timesInjected} | ${metric.timesReferenced} | ${(metric.referenceRate * 100).toFixed(0)}% | ${formatDelta(metric.mentorshipImpact)} | ${formatDelta(metric.citationImpact)} |`);
    }
    lines.push("");
    // Top performers
    const topPerformers = impactMetrics
        .filter((m) => m.mentorshipImpact > 0.05 || m.citationImpact > 0.05)
        .sort((a, b) => (b.mentorshipImpact + b.citationImpact) - (a.mentorshipImpact + a.citationImpact));
    if (topPerformers.length > 0) {
        lines.push("## Top Performing Documents");
        lines.push("");
        for (const m of topPerformers.slice(0, 3)) {
            lines.push(`- **${m.documentName}**: +${((m.mentorshipImpact + m.citationImpact) * 50).toFixed(1)}% average quality boost`);
        }
        lines.push("");
    }
    // Underperformers
    const underperformers = impactMetrics
        .filter((m) => m.timesInjected > 3 && m.referenceRate < 0.2);
    if (underperformers.length > 0) {
        lines.push("## Underutilized Documents");
        lines.push("");
        for (const m of underperformers) {
            lines.push(`- **${m.documentName}**: ${(m.referenceRate * 100).toFixed(0)}% reference rate (injected ${m.timesInjected} times)`);
        }
        lines.push("");
    }
    // Recommendations
    if (recommendations.length > 0) {
        lines.push("## Optimization Recommendations");
        lines.push("");
        for (const rec of recommendations) {
            const priorityEmoji = rec.priority === "high" ? "🔴" : rec.priority === "medium" ? "🟡" : "🟢";
            lines.push(`### ${priorityEmoji} ${rec.documentId} (${rec.recommendationType})`);
            lines.push("");
            lines.push(rec.rationale);
            lines.push("");
            if (rec.suggestedChanges && rec.suggestedChanges.length > 0) {
                lines.push("**Suggested changes:**");
                for (const change of rec.suggestedChanges) {
                    lines.push(`- ${change}`);
                }
                lines.push("");
            }
            if (rec.expectedImpact) {
                lines.push(`**Expected impact:** ${rec.expectedImpact}`);
                lines.push("");
            }
        }
    }
    return lines.join("\n");
}
/**
 * Format a delta value with sign and percentage
 */
function formatDelta(delta) {
    const pct = (delta * 100).toFixed(1);
    if (delta > 0)
        return `+${pct}%`;
    if (delta < 0)
        return `${pct}%`;
    return "0.0%";
}
/**
 * Save KB impact data for trend analysis
 */
function saveKBImpactData(impactMetrics, promptVersion, filePath) {
    const targetPath = filePath || path.join(__dirname, "kb-impact", `impact-${promptVersion}-${Date.now()}.json`);
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    const data = {
        promptVersion,
        timestamp: Date.now(),
        metrics: impactMetrics,
    };
    fs.writeFileSync(targetPath, JSON.stringify(data, null, 2));
    console.log(`KB impact data saved to ${targetPath}`);
}
exports.default = {
    MPA_KB_DOCUMENTS: exports.MPA_KB_DOCUMENTS,
    trackKBUsage,
    calculateKBImpactMetrics,
    generateKBOptimizationRecommendations,
    generateKBImpactReport,
    saveKBImpactData,
};
//# sourceMappingURL=kb-impact-tracker.js.map