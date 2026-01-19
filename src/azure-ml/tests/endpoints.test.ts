import {
  BudgetOptimizerEndpoint,
  ChurnPredictorEndpoint,
  AnomalyDetectorEndpoint,
  PropensityScoreEndpoint,
  MediaMixEndpoint,
  LookalikeEndpoint,
  ResponseCurveEndpoint,
} from '../src/endpoints';
import { AzureMLClient } from '../src/client';

// Mock the AzureMLClient
jest.mock('../src/client');
const MockedAzureMLClient = AzureMLClient as jest.MockedClass<typeof AzureMLClient>;

describe('ML Endpoints', () => {
  let mockClient: jest.Mocked<AzureMLClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      predict: jest.fn(),
      batchPredict: jest.fn(),
      getEndpoint: jest.fn(),
      checkHealth: jest.fn(),
    } as any;
  });

  describe('BudgetOptimizerEndpoint', () => {
    let endpoint: BudgetOptimizerEndpoint;

    beforeEach(() => {
      endpoint = new BudgetOptimizerEndpoint(mockClient);
    });

    it('should optimize budget allocation', async () => {
      mockClient.predict.mockResolvedValueOnce({
        predictions: [
          { channel: 'search', allocation: 0.35, expectedROI: 4.2 },
          { channel: 'display', allocation: 0.25, expectedROI: 2.8 },
          { channel: 'social', allocation: 0.40, expectedROI: 3.5 },
        ],
        modelVersion: '2.1.0',
        requestId: 'budget-req-1',
      });

      const result = await endpoint.optimize({
        totalBudget: 100000,
        channels: ['search', 'display', 'social'],
        constraints: { minPerChannel: 0.1, maxPerChannel: 0.5 },
        objective: 'maximize_roi',
      });

      expect(result.allocations).toHaveLength(3);
      expect(result.allocations[0].channel).toBe('search');
    });

    it('should validate budget is positive', async () => {
      await expect(
        endpoint.optimize({
          totalBudget: -1000,
          channels: ['search'],
          objective: 'maximize_roi',
        })
      ).rejects.toThrow('Budget must be positive');
    });

    it('should validate at least one channel', async () => {
      await expect(
        endpoint.optimize({
          totalBudget: 10000,
          channels: [],
          objective: 'maximize_roi',
        })
      ).rejects.toThrow('At least one channel required');
    });

    it('should handle constraint violations', async () => {
      mockClient.predict.mockResolvedValueOnce({
        predictions: [],
        warnings: ['Constraints could not be satisfied'],
        modelVersion: '2.1.0',
        requestId: 'budget-req-2',
      });

      const result = await endpoint.optimize({
        totalBudget: 1000,
        channels: ['search', 'display'],
        constraints: { minPerChannel: 0.8 },
        objective: 'maximize_roi',
      });

      expect(result.warnings).toContain('Constraints could not be satisfied');
    });
  });

  describe('ChurnPredictorEndpoint', () => {
    let endpoint: ChurnPredictorEndpoint;

    beforeEach(() => {
      endpoint = new ChurnPredictorEndpoint(mockClient);
    });

    it('should predict churn probability', async () => {
      mockClient.predict.mockResolvedValueOnce({
        predictions: [{ churnProbability: 0.72, riskLevel: 'high', factors: ['low_engagement', 'payment_issues'] }],
        modelVersion: '1.5.0',
        requestId: 'churn-req-1',
      });

      const result = await endpoint.predictChurn({
        customerId: 'cust-123',
        features: {
          tenure: 6,
          monthlyCharges: 89.99,
          totalCharges: 539.94,
          contractType: 'month-to-month',
        },
      });

      expect(result.churnProbability).toBe(0.72);
      expect(result.riskLevel).toBe('high');
    });

    it('should batch predict churn for multiple customers', async () => {
      mockClient.batchPredict.mockResolvedValueOnce({
        predictions: [
          { customerId: 'cust-1', churnProbability: 0.2, riskLevel: 'low' },
          { customerId: 'cust-2', churnProbability: 0.85, riskLevel: 'high' },
        ],
        modelVersion: '1.5.0',
        requestId: 'churn-batch-1',
      });

      const results = await endpoint.batchPredictChurn([
        { customerId: 'cust-1', features: { tenure: 24, monthlyCharges: 50 } },
        { customerId: 'cust-2', features: { tenure: 1, monthlyCharges: 100 } },
      ]);

      expect(results).toHaveLength(2);
      expect(results[1].riskLevel).toBe('high');
    });

    it('should return feature importance', async () => {
      mockClient.predict.mockResolvedValueOnce({
        predictions: [{ churnProbability: 0.65, riskLevel: 'medium' }],
        featureImportance: {
          tenure: 0.35,
          monthlyCharges: 0.25,
          contractType: 0.40,
        },
        modelVersion: '1.5.0',
        requestId: 'churn-req-2',
      });

      const result = await endpoint.predictChurn({
        customerId: 'cust-456',
        features: { tenure: 12, monthlyCharges: 75 },
        explainPrediction: true,
      });

      expect(result.featureImportance).toBeDefined();
      expect(result.featureImportance!.contractType).toBe(0.40);
    });
  });

  describe('AnomalyDetectorEndpoint', () => {
    let endpoint: AnomalyDetectorEndpoint;

    beforeEach(() => {
      endpoint = new AnomalyDetectorEndpoint(mockClient);
    });

    it('should detect anomalies in time series', async () => {
      mockClient.predict.mockResolvedValueOnce({
        predictions: [
          { timestamp: '2024-01-15T10:00:00Z', isAnomaly: false, score: 0.1 },
          { timestamp: '2024-01-15T11:00:00Z', isAnomaly: true, score: 0.95 },
          { timestamp: '2024-01-15T12:00:00Z', isAnomaly: false, score: 0.2 },
        ],
        modelVersion: '3.0.0',
        requestId: 'anomaly-req-1',
      });

      const result = await endpoint.detectAnomalies({
        series: [
          { timestamp: '2024-01-15T10:00:00Z', value: 100 },
          { timestamp: '2024-01-15T11:00:00Z', value: 500 },
          { timestamp: '2024-01-15T12:00:00Z', value: 105 },
        ],
        sensitivity: 0.9,
      });

      expect(result.anomalies).toHaveLength(1);
      expect(result.anomalies[0].timestamp).toBe('2024-01-15T11:00:00Z');
    });

    it('should support real-time single point detection', async () => {
      mockClient.predict.mockResolvedValueOnce({
        predictions: [{ isAnomaly: true, score: 0.88, expectedValue: 102, actualValue: 450 }],
        modelVersion: '3.0.0',
        requestId: 'anomaly-rt-1',
      });

      const result = await endpoint.detectSinglePoint({
        timestamp: '2024-01-15T14:00:00Z',
        value: 450,
        historicalContext: [100, 102, 98, 105, 101],
      });

      expect(result.isAnomaly).toBe(true);
      expect(result.expectedValue).toBe(102);
    });

    it('should validate minimum series length', async () => {
      await expect(
        endpoint.detectAnomalies({
          series: [{ timestamp: '2024-01-15T10:00:00Z', value: 100 }],
          sensitivity: 0.9,
        })
      ).rejects.toThrow('Series must have at least 3 data points');
    });
  });

  describe('PropensityScoreEndpoint', () => {
    let endpoint: PropensityScoreEndpoint;

    beforeEach(() => {
      endpoint = new PropensityScoreEndpoint(mockClient);
    });

    it('should score propensity to buy', async () => {
      mockClient.predict.mockResolvedValueOnce({
        predictions: [
          { productId: 'prod-1', propensityScore: 0.82, confidence: 0.91 },
          { productId: 'prod-2', propensityScore: 0.45, confidence: 0.78 },
        ],
        modelVersion: '2.0.0',
        requestId: 'propensity-req-1',
      });

      const result = await endpoint.scorePropensity({
        customerId: 'cust-789',
        products: ['prod-1', 'prod-2'],
        features: { recentPurchases: 3, accountAge: 365 },
      });

      expect(result.scores).toHaveLength(2);
      expect(result.scores[0].propensityScore).toBe(0.82);
    });

    it('should return top recommendations', async () => {
      mockClient.predict.mockResolvedValueOnce({
        predictions: [
          { productId: 'prod-3', propensityScore: 0.95 },
          { productId: 'prod-1', propensityScore: 0.82 },
          { productId: 'prod-2', propensityScore: 0.45 },
        ],
        modelVersion: '2.0.0',
        requestId: 'propensity-req-2',
      });

      const result = await endpoint.getTopRecommendations({
        customerId: 'cust-789',
        topN: 2,
      });

      expect(result.recommendations).toHaveLength(2);
      expect(result.recommendations[0].productId).toBe('prod-3');
    });
  });

  describe('MediaMixEndpoint', () => {
    let endpoint: MediaMixEndpoint;

    beforeEach(() => {
      endpoint = new MediaMixEndpoint(mockClient);
    });

    it('should analyze media mix effectiveness', async () => {
      mockClient.predict.mockResolvedValueOnce({
        predictions: {
          channelContributions: {
            tv: { contribution: 0.35, roi: 2.5 },
            digital: { contribution: 0.45, roi: 4.2 },
            print: { contribution: 0.20, roi: 1.8 },
          },
          totalAttributedRevenue: 1500000,
          modelFit: 0.92,
        },
        modelVersion: '1.8.0',
        requestId: 'mmm-req-1',
      });

      const result = await endpoint.analyzeMediaMix({
        spendData: {
          tv: [100000, 120000, 110000],
          digital: [50000, 60000, 55000],
          print: [30000, 25000, 28000],
        },
        revenueData: [400000, 450000, 420000],
        dateRange: { start: '2024-01-01', end: '2024-03-31' },
      });

      expect(result.channelContributions.digital.roi).toBe(4.2);
      expect(result.modelFit).toBeGreaterThan(0.9);
    });

    it('should optimize budget allocation based on media mix', async () => {
      mockClient.predict.mockResolvedValueOnce({
        predictions: {
          optimalAllocation: { tv: 0.30, digital: 0.55, print: 0.15 },
          projectedRevenue: 1750000,
          projectedROI: 3.5,
        },
        modelVersion: '1.8.0',
        requestId: 'mmm-opt-1',
      });

      const result = await endpoint.optimizeAllocation({
        totalBudget: 500000,
        channels: ['tv', 'digital', 'print'],
        objective: 'maximize_revenue',
      });

      expect(result.optimalAllocation.digital).toBe(0.55);
    });
  });

  describe('LookalikeEndpoint', () => {
    let endpoint: LookalikeEndpoint;

    beforeEach(() => {
      endpoint = new LookalikeEndpoint(mockClient);
    });

    it('should find lookalike audiences', async () => {
      mockClient.predict.mockResolvedValueOnce({
        predictions: {
          lookalikes: [
            { customerId: 'cust-a', similarityScore: 0.95 },
            { customerId: 'cust-b', similarityScore: 0.92 },
            { customerId: 'cust-c', similarityScore: 0.88 },
          ],
          modelVersion: '1.2.0',
        },
        requestId: 'lookalike-req-1',
      });

      const result = await endpoint.findLookalikes({
        seedAudience: ['seed-1', 'seed-2', 'seed-3'],
        targetPool: ['cust-a', 'cust-b', 'cust-c', 'cust-d'],
        topN: 3,
      });

      expect(result.lookalikes).toHaveLength(3);
      expect(result.lookalikes[0].similarityScore).toBeGreaterThan(0.9);
    });

    it('should validate minimum seed size', async () => {
      await expect(
        endpoint.findLookalikes({
          seedAudience: ['seed-1'],
          targetPool: ['cust-a', 'cust-b'],
          topN: 10,
        })
      ).rejects.toThrow('Seed audience must have at least 3 members');
    });
  });

  describe('ResponseCurveEndpoint', () => {
    let endpoint: ResponseCurveEndpoint;

    beforeEach(() => {
      endpoint = new ResponseCurveEndpoint(mockClient);
    });

    it('should fit response curve', async () => {
      mockClient.predict.mockResolvedValueOnce({
        predictions: {
          curveType: 'hill',
          parameters: { Vmax: 1000, K: 50, n: 2 },
          saturationPoint: 150,
          halfMaxSpend: 50,
          r2Score: 0.94,
        },
        modelVersion: '1.0.0',
        requestId: 'response-req-1',
      });

      const result = await endpoint.fitCurve({
        spendData: [10, 20, 30, 50, 75, 100, 150, 200],
        responseData: [100, 180, 250, 400, 550, 650, 750, 800],
        curveType: 'hill',
      });

      expect(result.curveType).toBe('hill');
      expect(result.r2Score).toBeGreaterThan(0.9);
    });

    it('should predict response at spend level', async () => {
      mockClient.predict.mockResolvedValueOnce({
        predictions: {
          predictedResponse: 625,
          confidenceInterval: { lower: 580, upper: 670 },
          marginalReturn: 4.5,
        },
        modelVersion: '1.0.0',
        requestId: 'response-pred-1',
      });

      const result = await endpoint.predictResponse({
        spendLevel: 100,
        curveParameters: { Vmax: 1000, K: 50, n: 2 },
      });

      expect(result.predictedResponse).toBe(625);
      expect(result.marginalReturn).toBe(4.5);
    });

    it('should find optimal spend level', async () => {
      mockClient.predict.mockResolvedValueOnce({
        predictions: {
          optimalSpend: 120,
          expectedResponse: 720,
          roi: 6.0,
        },
        modelVersion: '1.0.0',
        requestId: 'response-opt-1',
      });

      const result = await endpoint.findOptimalSpend({
        curveParameters: { Vmax: 1000, K: 50, n: 2 },
        targetROI: 5.0,
        maxBudget: 200,
      });

      expect(result.optimalSpend).toBe(120);
      expect(result.roi).toBeGreaterThanOrEqual(5.0);
    });
  });

  describe('endpoint health checks', () => {
    it('should check endpoint health', async () => {
      const endpoint = new BudgetOptimizerEndpoint(mockClient);

      mockClient.checkHealth.mockResolvedValueOnce({
        status: 'healthy',
        latency: 45,
        timestamp: new Date().toISOString(),
      });

      const health = await endpoint.checkHealth();

      expect(health.status).toBe('healthy');
      expect(health.latency).toBeLessThan(100);
    });
  });
});
