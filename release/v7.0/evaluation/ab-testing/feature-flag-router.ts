/**
 * A/B Feature Flag Router
 *
 * Implements feature flag-based routing for A/B testing multi-agent
 * architecture against the monolithic MPA. Supports percentage-based
 * traffic splitting, user bucketing, and metric collection.
 *
 * @module feature-flag-router
 * @version 1.0.0
 */

import { AgentCode, AGENT_CODES } from '../../../packages/agent-core/src/multi-agent/types/agent-codes.js';

/**
 * Feature flag definition
 */
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetEnvironments: Environment[];
  userSegments?: string[];
  startDate?: Date;
  endDate?: Date;
  metadata?: Record<string, unknown>;
}

export type Environment = 'development' | 'staging' | 'production';

/**
 * Routing decision result
 */
export interface RoutingDecision {
  useMultiAgent: boolean;
  selectedVariant: 'control' | 'treatment';
  bucketId: string;
  featureFlagId: string;
  reason: string;
  timestamp: Date;
}

/**
 * User context for bucketing decisions
 */
export interface UserContext {
  userId?: string;
  sessionId: string;
  environment: Environment;
  userSegment?: string;
  attributes?: Record<string, unknown>;
}

/**
 * A/B test configuration
 */
export interface ABTestConfig {
  testId: string;
  name: string;
  description: string;
  controlGroup: VariantConfig;
  treatmentGroup: VariantConfig;
  trafficAllocation: TrafficAllocation;
  metrics: MetricDefinition[];
  minimumSampleSize: number;
  statisticalSignificanceThreshold: number;
  runDurationDays: number;
}

export interface VariantConfig {
  variantId: string;
  name: string;
  description: string;
  routingMode: 'monolithic' | 'multi_agent';
  configuration?: Record<string, unknown>;
}

export interface TrafficAllocation {
  controlPercentage: number;
  treatmentPercentage: number;
  holdoutPercentage?: number;
}

export interface MetricDefinition {
  metricId: string;
  name: string;
  type: 'latency' | 'accuracy' | 'satisfaction' | 'completion_rate' | 'error_rate';
  aggregation: 'mean' | 'median' | 'p95' | 'p99' | 'sum' | 'count';
  lowerIsBetter: boolean;
}

/**
 * Feature flag store interface
 */
export interface FeatureFlagStore {
  getFlag(flagId: string): Promise<FeatureFlag | null>;
  getAllFlags(): Promise<FeatureFlag[]>;
  updateFlag(flag: FeatureFlag): Promise<void>;
  evaluateFlag(flagId: string, context: UserContext): Promise<boolean>;
}

/**
 * In-memory feature flag store for development/testing
 */
export class InMemoryFeatureFlagStore implements FeatureFlagStore {
  private flags: Map<string, FeatureFlag> = new Map();

  constructor(initialFlags?: FeatureFlag[]) {
    if (initialFlags) {
      initialFlags.forEach(flag => this.flags.set(flag.id, flag));
    }
  }

  async getFlag(flagId: string): Promise<FeatureFlag | null> {
    return this.flags.get(flagId) || null;
  }

  async getAllFlags(): Promise<FeatureFlag[]> {
    return Array.from(this.flags.values());
  }

  async updateFlag(flag: FeatureFlag): Promise<void> {
    this.flags.set(flag.id, flag);
  }

  async evaluateFlag(flagId: string, context: UserContext): Promise<boolean> {
    const flag = await this.getFlag(flagId);
    if (!flag) return false;

    // Check if flag is enabled
    if (!flag.enabled) return false;

    // Check environment
    if (!flag.targetEnvironments.includes(context.environment)) return false;

    // Check date range
    const now = new Date();
    if (flag.startDate && now < flag.startDate) return false;
    if (flag.endDate && now > flag.endDate) return false;

    // Check user segment
    if (flag.userSegments && flag.userSegments.length > 0) {
      if (!context.userSegment || !flag.userSegments.includes(context.userSegment)) {
        return false;
      }
    }

    // Evaluate rollout percentage using deterministic bucketing
    const bucketValue = this.getBucketValue(context.sessionId, flagId);
    return bucketValue < flag.rolloutPercentage;
  }

  private getBucketValue(sessionId: string, flagId: string): number {
    // Deterministic hash for consistent bucketing
    const hashInput = `${sessionId}:${flagId}`;
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash % 100);
  }
}

/**
 * Dataverse-backed feature flag store for production
 */
export class DataverseFeatureFlagStore implements FeatureFlagStore {
  constructor(private dataverseUrl: string) {}

  async getFlag(flagId: string): Promise<FeatureFlag | null> {
    // In production, this would call Dataverse API
    // Placeholder implementation
    const response = await fetch(
      `${this.dataverseUrl}/api/data/v9.2/eap_featureflags(${flagId})`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return this.mapDataverseToFlag(data);
  }

  async getAllFlags(): Promise<FeatureFlag[]> {
    const response = await fetch(
      `${this.dataverseUrl}/api/data/v9.2/eap_featureflags`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.value.map((item: unknown) => this.mapDataverseToFlag(item));
  }

  async updateFlag(flag: FeatureFlag): Promise<void> {
    await fetch(
      `${this.dataverseUrl}/api/data/v9.2/eap_featureflags(${flag.id})`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.mapFlagToDataverse(flag)),
      }
    );
  }

  async evaluateFlag(flagId: string, context: UserContext): Promise<boolean> {
    const flag = await this.getFlag(flagId);
    if (!flag) return false;

    // Same evaluation logic as in-memory store
    if (!flag.enabled) return false;
    if (!flag.targetEnvironments.includes(context.environment)) return false;

    const now = new Date();
    if (flag.startDate && now < flag.startDate) return false;
    if (flag.endDate && now > flag.endDate) return false;

    if (flag.userSegments && flag.userSegments.length > 0) {
      if (!context.userSegment || !flag.userSegments.includes(context.userSegment)) {
        return false;
      }
    }

    const bucketValue = this.getBucketValue(context.sessionId, flagId);
    return bucketValue < flag.rolloutPercentage;
  }

  private getBucketValue(sessionId: string, flagId: string): number {
    const hashInput = `${sessionId}:${flagId}`;
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash % 100);
  }

  private mapDataverseToFlag(data: Record<string, unknown>): FeatureFlag {
    return {
      id: data['eap_featureflagid'] as string,
      name: data['eap_name'] as string,
      description: data['eap_description'] as string,
      enabled: data['eap_enabled'] as boolean,
      rolloutPercentage: data['eap_rollout_percentage'] as number,
      targetEnvironments: JSON.parse(data['eap_target_environments'] as string),
      userSegments: data['eap_user_segments']
        ? JSON.parse(data['eap_user_segments'] as string)
        : undefined,
      startDate: data['eap_start_date']
        ? new Date(data['eap_start_date'] as string)
        : undefined,
      endDate: data['eap_end_date']
        ? new Date(data['eap_end_date'] as string)
        : undefined,
      metadata: data['eap_metadata']
        ? JSON.parse(data['eap_metadata'] as string)
        : undefined,
    };
  }

  private mapFlagToDataverse(flag: FeatureFlag): Record<string, unknown> {
    return {
      eap_name: flag.name,
      eap_description: flag.description,
      eap_enabled: flag.enabled,
      eap_rollout_percentage: flag.rolloutPercentage,
      eap_target_environments: JSON.stringify(flag.targetEnvironments),
      eap_user_segments: flag.userSegments
        ? JSON.stringify(flag.userSegments)
        : null,
      eap_start_date: flag.startDate?.toISOString(),
      eap_end_date: flag.endDate?.toISOString(),
      eap_metadata: flag.metadata ? JSON.stringify(flag.metadata) : null,
    };
  }
}

/**
 * A/B Test Router
 * Handles routing decisions for A/B testing
 */
export class ABTestRouter {
  private flagStore: FeatureFlagStore;
  private activeTests: Map<string, ABTestConfig> = new Map();
  private routingDecisions: RoutingDecision[] = [];

  constructor(flagStore: FeatureFlagStore) {
    this.flagStore = flagStore;
  }

  /**
   * Register an A/B test configuration
   */
  registerTest(config: ABTestConfig): void {
    this.activeTests.set(config.testId, config);
  }

  /**
   * Make a routing decision for a user request
   */
  async makeRoutingDecision(
    testId: string,
    context: UserContext
  ): Promise<RoutingDecision> {
    const test = this.activeTests.get(testId);
    if (!test) {
      return this.createDecision(false, 'control', context.sessionId, testId, 'Test not found');
    }

    // Get the feature flag for this test
    const flag = await this.flagStore.getFlag(testId);
    if (!flag || !flag.enabled) {
      return this.createDecision(false, 'control', context.sessionId, testId, 'Feature flag disabled');
    }

    // Evaluate the flag
    const isInTreatment = await this.flagStore.evaluateFlag(testId, context);

    // Check for holdout group
    if (test.trafficAllocation.holdoutPercentage) {
      const holdoutBucket = this.getHoldoutBucket(context.sessionId, testId);
      if (holdoutBucket < test.trafficAllocation.holdoutPercentage) {
        return this.createDecision(false, 'control', context.sessionId, testId, 'User in holdout group');
      }
    }

    const decision = this.createDecision(
      isInTreatment,
      isInTreatment ? 'treatment' : 'control',
      context.sessionId,
      testId,
      isInTreatment ? 'Assigned to multi-agent treatment' : 'Assigned to control group'
    );

    // Store decision for analysis
    this.routingDecisions.push(decision);

    return decision;
  }

  /**
   * Get all routing decisions for analysis
   */
  getRoutingDecisions(): RoutingDecision[] {
    return [...this.routingDecisions];
  }

  /**
   * Get routing statistics for a test
   */
  getTestStatistics(testId: string): TestStatistics {
    const decisions = this.routingDecisions.filter(d => d.featureFlagId === testId);
    const controlCount = decisions.filter(d => d.selectedVariant === 'control').length;
    const treatmentCount = decisions.filter(d => d.selectedVariant === 'treatment').length;
    const total = decisions.length;

    return {
      testId,
      totalDecisions: total,
      controlCount,
      treatmentCount,
      controlPercentage: total > 0 ? (controlCount / total) * 100 : 0,
      treatmentPercentage: total > 0 ? (treatmentCount / total) * 100 : 0,
      uniqueSessions: new Set(decisions.map(d => d.bucketId)).size,
    };
  }

  private createDecision(
    useMultiAgent: boolean,
    variant: 'control' | 'treatment',
    bucketId: string,
    featureFlagId: string,
    reason: string
  ): RoutingDecision {
    return {
      useMultiAgent,
      selectedVariant: variant,
      bucketId,
      featureFlagId,
      reason,
      timestamp: new Date(),
    };
  }

  private getHoldoutBucket(sessionId: string, testId: string): number {
    const hashInput = `holdout:${sessionId}:${testId}`;
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash % 100);
  }
}

export interface TestStatistics {
  testId: string;
  totalDecisions: number;
  controlCount: number;
  treatmentCount: number;
  controlPercentage: number;
  treatmentPercentage: number;
  uniqueSessions: number;
}

/**
 * Metric collector for A/B test analysis
 */
export class ABTestMetricCollector {
  private metrics: Map<string, MetricDataPoint[]> = new Map();

  recordMetric(
    testId: string,
    variant: 'control' | 'treatment',
    metricId: string,
    value: number,
    sessionId: string
  ): void {
    const key = `${testId}:${variant}:${metricId}`;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    this.metrics.get(key)!.push({
      value,
      sessionId,
      timestamp: new Date(),
    });
  }

  getMetricSummary(
    testId: string,
    metricId: string
  ): MetricSummary {
    const controlKey = `${testId}:control:${metricId}`;
    const treatmentKey = `${testId}:treatment:${metricId}`;

    const controlData = this.metrics.get(controlKey) || [];
    const treatmentData = this.metrics.get(treatmentKey) || [];

    return {
      metricId,
      control: this.calculateStats(controlData),
      treatment: this.calculateStats(treatmentData),
      relativeDifference: this.calculateRelativeDifference(controlData, treatmentData),
      statisticalSignificance: this.calculateSignificance(controlData, treatmentData),
    };
  }

  private calculateStats(data: MetricDataPoint[]): MetricStats {
    if (data.length === 0) {
      return { count: 0, mean: 0, median: 0, p95: 0, p99: 0, stdDev: 0 };
    }

    const values = data.map(d => d.value).sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / count;

    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / count;
    const stdDev = Math.sqrt(avgSquaredDiff);

    return {
      count,
      mean,
      median: values[Math.floor(count / 2)],
      p95: values[Math.floor(count * 0.95)],
      p99: values[Math.floor(count * 0.99)],
      stdDev,
    };
  }

  private calculateRelativeDifference(
    controlData: MetricDataPoint[],
    treatmentData: MetricDataPoint[]
  ): number {
    const controlMean = this.calculateStats(controlData).mean;
    const treatmentMean = this.calculateStats(treatmentData).mean;

    if (controlMean === 0) return 0;
    return ((treatmentMean - controlMean) / controlMean) * 100;
  }

  private calculateSignificance(
    controlData: MetricDataPoint[],
    treatmentData: MetricDataPoint[]
  ): number {
    // Simplified t-test implementation
    const controlStats = this.calculateStats(controlData);
    const treatmentStats = this.calculateStats(treatmentData);

    if (controlStats.count < 2 || treatmentStats.count < 2) return 0;

    const pooledStdErr = Math.sqrt(
      (Math.pow(controlStats.stdDev, 2) / controlStats.count) +
      (Math.pow(treatmentStats.stdDev, 2) / treatmentStats.count)
    );

    if (pooledStdErr === 0) return 0;

    const tStatistic = Math.abs(
      (treatmentStats.mean - controlStats.mean) / pooledStdErr
    );

    // Approximate p-value from t-statistic (simplified)
    // In production, use proper statistical library
    const pValue = Math.exp(-0.717 * tStatistic - 0.416 * Math.pow(tStatistic, 2));
    return 1 - pValue;
  }
}

interface MetricDataPoint {
  value: number;
  sessionId: string;
  timestamp: Date;
}

interface MetricStats {
  count: number;
  mean: number;
  median: number;
  p95: number;
  p99: number;
  stdDev: number;
}

interface MetricSummary {
  metricId: string;
  control: MetricStats;
  treatment: MetricStats;
  relativeDifference: number;
  statisticalSignificance: number;
}

/**
 * Pre-defined A/B test configurations for multi-agent rollout
 */
export const multiAgentABTests: ABTestConfig[] = [
  {
    testId: 'multi_agent_routing_v1',
    name: 'Multi-Agent Routing v1',
    description: 'A/B test comparing monolithic MPA vs multi-agent architecture',
    controlGroup: {
      variantId: 'control_monolithic',
      name: 'Monolithic MPA',
      description: 'Original single-agent MPA implementation',
      routingMode: 'monolithic',
    },
    treatmentGroup: {
      variantId: 'treatment_multi_agent',
      name: 'Multi-Agent MPA',
      description: '7-agent multi-agent architecture',
      routingMode: 'multi_agent',
    },
    trafficAllocation: {
      controlPercentage: 50,
      treatmentPercentage: 50,
    },
    metrics: [
      {
        metricId: 'response_latency',
        name: 'Response Latency',
        type: 'latency',
        aggregation: 'p95',
        lowerIsBetter: true,
      },
      {
        metricId: 'routing_accuracy',
        name: 'Routing Accuracy',
        type: 'accuracy',
        aggregation: 'mean',
        lowerIsBetter: false,
      },
      {
        metricId: 'task_completion_rate',
        name: 'Task Completion Rate',
        type: 'completion_rate',
        aggregation: 'mean',
        lowerIsBetter: false,
      },
      {
        metricId: 'error_rate',
        name: 'Error Rate',
        type: 'error_rate',
        aggregation: 'mean',
        lowerIsBetter: true,
      },
    ],
    minimumSampleSize: 1000,
    statisticalSignificanceThreshold: 0.95,
    runDurationDays: 14,
  },
  {
    testId: 'gradual_rollout_5pct',
    name: 'Gradual Rollout - 5%',
    description: 'Initial 5% rollout of multi-agent architecture',
    controlGroup: {
      variantId: 'control_monolithic',
      name: 'Monolithic MPA',
      description: 'Original single-agent MPA implementation',
      routingMode: 'monolithic',
    },
    treatmentGroup: {
      variantId: 'treatment_multi_agent',
      name: 'Multi-Agent MPA',
      description: '7-agent multi-agent architecture',
      routingMode: 'multi_agent',
    },
    trafficAllocation: {
      controlPercentage: 95,
      treatmentPercentage: 5,
    },
    metrics: [
      {
        metricId: 'error_rate',
        name: 'Error Rate',
        type: 'error_rate',
        aggregation: 'mean',
        lowerIsBetter: true,
      },
    ],
    minimumSampleSize: 100,
    statisticalSignificanceThreshold: 0.90,
    runDurationDays: 7,
  },
];

/**
 * Pre-defined feature flags for multi-agent rollout
 */
export const multiAgentFeatureFlags: FeatureFlag[] = [
  {
    id: 'multi_agent_routing_v1',
    name: 'Multi-Agent Routing v1',
    description: 'Enable multi-agent routing for media planning requests',
    enabled: true,
    rolloutPercentage: 50,
    targetEnvironments: ['development', 'staging'],
  },
  {
    id: 'gradual_rollout_5pct',
    name: 'Gradual Rollout - 5%',
    description: 'Initial production rollout at 5%',
    enabled: false,
    rolloutPercentage: 5,
    targetEnvironments: ['production'],
  },
  {
    id: 'anl_agent_enabled',
    name: 'ANL Agent Enabled',
    description: 'Enable the Analytics & Forecasting specialist agent',
    enabled: true,
    rolloutPercentage: 100,
    targetEnvironments: ['development', 'staging', 'production'],
  },
  {
    id: 'aud_agent_enabled',
    name: 'AUD Agent Enabled',
    description: 'Enable the Audience Intelligence specialist agent',
    enabled: true,
    rolloutPercentage: 100,
    targetEnvironments: ['development', 'staging', 'production'],
  },
  {
    id: 'cha_agent_enabled',
    name: 'CHA Agent Enabled',
    description: 'Enable the Channel Strategy specialist agent',
    enabled: true,
    rolloutPercentage: 100,
    targetEnvironments: ['development', 'staging', 'production'],
  },
  {
    id: 'parallel_agent_calls',
    name: 'Parallel Agent Calls',
    description: 'Enable parallel execution of independent agent calls',
    enabled: true,
    rolloutPercentage: 100,
    targetEnvironments: ['development', 'staging'],
  },
];

/**
 * Create a pre-configured A/B test router for multi-agent testing
 */
export function createMultiAgentABTestRouter(): ABTestRouter {
  const flagStore = new InMemoryFeatureFlagStore(multiAgentFeatureFlags);
  const router = new ABTestRouter(flagStore);

  multiAgentABTests.forEach(test => router.registerTest(test));

  return router;
}
