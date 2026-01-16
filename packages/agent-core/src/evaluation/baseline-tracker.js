/**
 * Baseline Tracker
 *
 * Tracks baseline scores for comparison across evaluation runs.
 * Enables regression detection and improvement tracking.
 */
const DEFAULT_CONFIG = {
    baselinesPath: 'evaluation/baselines',
    regressionThreshold: -0.05, // 5% drop = regression
    autoUpdate: false,
};
/**
 * Tracks and compares evaluation baselines
 */
export class BaselineTracker {
    storage;
    config;
    indexCache = null;
    constructor(storage, config) {
        this.storage = storage;
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    /**
     * Get baseline for a scenario
     */
    async getBaseline(scenarioId, model) {
        await this.loadIndex();
        if (!this.indexCache)
            return null;
        // Find matching baseline (latest for scenario/model combo)
        const candidates = this.indexCache.baselines
            .filter(b => b.scenarioId === scenarioId && (!model || b.model === model))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (candidates.length === 0)
            return null;
        try {
            const path = `${this.config.baselinesPath}/${candidates[0].id}.json`;
            return await this.storage.readJSON(path);
        }
        catch {
            return null;
        }
    }
    /**
     * Compare scores to baseline
     */
    async compare(scenarioId, currentScores, model) {
        const baseline = await this.getBaseline(scenarioId, model);
        if (!baseline)
            return null;
        const scoreDelta = currentScores.overall - baseline.scores.overall;
        const isRegression = scoreDelta < this.config.regressionThreshold;
        // Calculate per-scorer deltas
        const scorerDeltas = {};
        for (const scorer of currentScores.scorers) {
            const baselineScorer = baseline.scores.scorers.find(s => s.name === scorer.name);
            if (baselineScorer) {
                scorerDeltas[scorer.name] = scorer.score - baselineScorer.score;
            }
        }
        // Generate summary
        const summary = this.generateComparisonSummary(scoreDelta, isRegression, scorerDeltas);
        return {
            baselineId: baseline.id,
            scoreDelta,
            isRegression,
            scorerDeltas,
            summary,
        };
    }
    /**
     * Generate comparison summary text
     */
    generateComparisonSummary(scoreDelta, isRegression, scorerDeltas) {
        const parts = [];
        // Overall change
        const changePercent = Math.round(scoreDelta * 100);
        if (isRegression) {
            parts.push(`REGRESSION: Score dropped by ${Math.abs(changePercent)}%`);
        }
        else if (scoreDelta > 0.05) {
            parts.push(`IMPROVEMENT: Score increased by ${changePercent}%`);
        }
        else if (scoreDelta < -0.02) {
            parts.push(`Minor decrease of ${Math.abs(changePercent)}%`);
        }
        else {
            parts.push('Score stable (within 2%)');
        }
        // Notable scorer changes
        const improvements = [];
        const regressions = [];
        for (const [name, delta] of Object.entries(scorerDeltas)) {
            if (delta > 0.1) {
                improvements.push(`${name} +${Math.round(delta * 100)}%`);
            }
            else if (delta < -0.1) {
                regressions.push(`${name} ${Math.round(delta * 100)}%`);
            }
        }
        if (improvements.length > 0) {
            parts.push(`Improved: ${improvements.join(', ')}`);
        }
        if (regressions.length > 0) {
            parts.push(`Declined: ${regressions.join(', ')}`);
        }
        return parts.join('. ');
    }
    /**
     * Save a new baseline
     */
    async saveBaseline(scenarioId, scores, model, notes) {
        const baseline = {
            id: `baseline_${scenarioId}_${Date.now()}`,
            createdAt: new Date(),
            model,
            scenarioId,
            scores,
            notes,
        };
        // Save baseline file
        const path = `${this.config.baselinesPath}/${baseline.id}.json`;
        await this.storage.writeJSON(path, baseline);
        // Update index
        await this.loadIndex();
        if (!this.indexCache) {
            this.indexCache = { baselines: [], lastUpdated: new Date().toISOString() };
        }
        this.indexCache.baselines.push({
            id: baseline.id,
            scenarioId: baseline.scenarioId,
            model: baseline.model,
            score: baseline.scores.overall,
            createdAt: baseline.createdAt.toISOString(),
        });
        await this.saveIndex();
        return baseline;
    }
    /**
     * Update baseline if scores improved (when autoUpdate is enabled)
     */
    async maybeUpdateBaseline(scenarioId, currentScores, model) {
        if (!this.config.autoUpdate)
            return false;
        const existing = await this.getBaseline(scenarioId, model);
        if (!existing || currentScores.overall > existing.scores.overall + 0.02) {
            await this.saveBaseline(scenarioId, currentScores, model, 'Auto-updated baseline');
            return true;
        }
        return false;
    }
    /**
     * Get all baselines for a scenario
     */
    async getBaselineHistory(scenarioId) {
        await this.loadIndex();
        if (!this.indexCache)
            return [];
        const history = [];
        const candidates = this.indexCache.baselines
            .filter(b => b.scenarioId === scenarioId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        for (const entry of candidates) {
            try {
                const baseline = await this.storage.readJSON(`${this.config.baselinesPath}/${entry.id}.json`);
                history.push(baseline);
            }
            catch {
                // Skip missing files
            }
        }
        return history;
    }
    /**
     * Load the baseline index
     */
    async loadIndex() {
        if (this.indexCache)
            return;
        try {
            this.indexCache = await this.storage.readJSON(`${this.config.baselinesPath}/index.json`);
        }
        catch {
            this.indexCache = { baselines: [], lastUpdated: new Date().toISOString() };
        }
    }
    /**
     * Save the baseline index
     */
    async saveIndex() {
        if (this.indexCache) {
            this.indexCache.lastUpdated = new Date().toISOString();
            await this.storage.writeJSON(`${this.config.baselinesPath}/index.json`, this.indexCache);
        }
    }
    /**
     * Get statistics about baselines
     */
    async getStats() {
        await this.loadIndex();
        if (!this.indexCache || this.indexCache.baselines.length === 0) {
            return { totalBaselines: 0, scenarioCount: 0, averageScore: 0 };
        }
        const scenarios = new Set(this.indexCache.baselines.map(b => b.scenarioId));
        const totalScore = this.indexCache.baselines.reduce((sum, b) => sum + b.score, 0);
        return {
            totalBaselines: this.indexCache.baselines.length,
            scenarioCount: scenarios.size,
            averageScore: totalScore / this.indexCache.baselines.length,
        };
    }
}
export default BaselineTracker;
//# sourceMappingURL=baseline-tracker.js.map