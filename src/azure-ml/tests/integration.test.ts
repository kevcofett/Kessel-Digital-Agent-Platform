import { AzureMLClient } from '../src/client';
import {
  BudgetOptimizerEndpoint,
  ChurnPredictorEndpoint,
  AnomalyDetectorEndpoint,
  PropensityScoreEndpoint,
} from '../src/endpoints';

// Integration tests - these test the full flow with mocked network
describe('Azure ML Integration Tests', () => {
  // Mock fetch for all integration tests
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  const testConfig = {
    subscriptionId: 'test-sub-123',
    resourceGroup: 'test-rg',
    workspaceName: 'test-workspace',
    region: 'eastus',
    apiKey: 'test-api-key',
  };

  let client: AzureMLClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
    client = new AzureMLClient(testConfig);
  });

  describe('Budget Optimization Flow', () => {
    it('should complete full budget optimization workflow', async () => {
      // Step 1: Check endpoint health
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'healthy', latency: 30 }),
      });

      // Step 2: Run optimization
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          predictions: [
            { channel: 'search', allocation: 0.40, expectedROI: 4.5 },
            { channel: 'social', allocation: 0.35, expectedROI: 3.8 },
            { channel: 'display', allocation: 0.25, expectedROI: 2.2 },
          ],
          modelVersion: '2.1.0',
          requestId: 'int-budget-1',
        }),
      });

      const endpoint = new BudgetOptimizerEndpoint(client);

      // Check health first
      const health = await endpoint.checkHealth();
      expect(health.status).toBe('healthy');

      // Run optimization
      const result = await endpoint.optimize({
        totalBudget: 50000,
        channels: ['search', 'social', 'display'],
        objective: 'maximize_roi',
      });

      expect(result.allocations).toHaveLength(3);
      expect(result.allocations[0].allocation).toBe(0.40);

      // Verify total allocation sums to 1
      const totalAllocation = result.allocations.reduce((sum, a) => sum + a.allocation, 0);
      expect(totalAllocation).toBeCloseTo(1.0, 2);
    });

    it('should handle optimization with constraints', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          predictions: [
            { channel: 'search', allocation: 0.50, expectedROI: 4.0 },
            { channel: 'social', allocation: 0.30, expectedROI: 3.5 },
            { channel: 'display', allocation: 0.20, expectedROI: 2.0 },
          ],
          warnings: ['Max constraint applied to search channel'],
          modelVersion: '2.1.0',
          requestId: 'int-budget-2',
        }),
      });

      const endpoint = new BudgetOptimizerEndpoint(client);

      const result = await endpoint.optimize({
        totalBudget: 100000,
        channels: ['search', 'social', 'display'],
        constraints: {
          maxPerChannel: 0.50,
          minPerChannel: 0.15,
        },
        objective: 'maximize_roi',
      });

      expect(result.allocations.every(a => a.allocation >= 0.15)).toBe(true);
      expect(result.allocations.every(a => a.allocation <= 0.50)).toBe(true);
    });
  });

  describe('Churn Prediction Flow', () => {
    it('should predict and explain churn for a customer', async () => {
      // Prediction with explanation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          predictions: [{
            churnProbability: 0.78,
            riskLevel: 'high',
            factors: ['contract_type', 'payment_method', 'tenure'],
          }],
          featureImportance: {
            contract_type: 0.45,
            payment_method: 0.30,
            tenure: 0.15,
            monthly_charges: 0.10,
          },
          modelVersion: '1.5.0',
          requestId: 'int-churn-1',
        }),
      });

      const endpoint = new ChurnPredictorEndpoint(client);

      const result = await endpoint.predictChurn({
        customerId: 'cust-integration-1',
        features: {
          tenure: 3,
          monthlyCharges: 95.50,
          totalCharges: 286.50,
          contractType: 'month-to-month',
          paymentMethod: 'electronic_check',
        },
        explainPrediction: true,
      });

      expect(result.churnProbability).toBeGreaterThan(0.7);
      expect(result.riskLevel).toBe('high');
      expect(result.featureImportance).toBeDefined();
      expect(result.featureImportance!.contract_type).toBeGreaterThan(0.3);
    });

    it('should batch predict churn for customer segment', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          predictions: [
            { customerId: 'cust-1', churnProbability: 0.12, riskLevel: 'low' },
            { customerId: 'cust-2', churnProbability: 0.45, riskLevel: 'medium' },
            { customerId: 'cust-3', churnProbability: 0.82, riskLevel: 'high' },
            { customerId: 'cust-4', churnProbability: 0.28, riskLevel: 'low' },
            { customerId: 'cust-5', churnProbability: 0.91, riskLevel: 'high' },
          ],
          modelVersion: '1.5.0',
          requestId: 'int-churn-batch-1',
        }),
      });

      const endpoint = new ChurnPredictorEndpoint(client);

      const results = await endpoint.batchPredictChurn([
        { customerId: 'cust-1', features: { tenure: 48, monthlyCharges: 50 } },
        { customerId: 'cust-2', features: { tenure: 12, monthlyCharges: 75 } },
        { customerId: 'cust-3', features: { tenure: 2, monthlyCharges: 100 } },
        { customerId: 'cust-4', features: { tenure: 24, monthlyCharges: 60 } },
        { customerId: 'cust-5', features: { tenure: 1, monthlyCharges: 110 } },
      ]);

      expect(results).toHaveLength(5);

      const highRiskCount = results.filter(r => r.riskLevel === 'high').length;
      expect(highRiskCount).toBe(2);
    });
  });

  describe('Anomaly Detection Flow', () => {
    it('should detect anomalies in spend data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          predictions: [
            { timestamp: '2024-01-01', isAnomaly: false, score: 0.1, value: 1000 },
            { timestamp: '2024-01-02', isAnomaly: false, score: 0.15, value: 1050 },
            { timestamp: '2024-01-03', isAnomaly: true, score: 0.92, value: 5000 },
            { timestamp: '2024-01-04', isAnomaly: false, score: 0.12, value: 980 },
            { timestamp: '2024-01-05', isAnomaly: false, score: 0.18, value: 1020 },
            { timestamp: '2024-01-06', isAnomaly: true, score: 0.88, value: 50 },
            { timestamp: '2024-01-07', isAnomaly: false, score: 0.14, value: 1010 },
          ],
          modelVersion: '3.0.0',
          requestId: 'int-anomaly-1',
        }),
      });

      const endpoint = new AnomalyDetectorEndpoint(client);

      const result = await endpoint.detectAnomalies({
        series: [
          { timestamp: '2024-01-01', value: 1000 },
          { timestamp: '2024-01-02', value: 1050 },
          { timestamp: '2024-01-03', value: 5000 }, // Spike
          { timestamp: '2024-01-04', value: 980 },
          { timestamp: '2024-01-05', value: 1020 },
          { timestamp: '2024-01-06', value: 50 },   // Drop
          { timestamp: '2024-01-07', value: 1010 },
        ],
        sensitivity: 0.85,
      });

      expect(result.anomalies).toHaveLength(2);
      expect(result.anomalies[0].value).toBe(5000); // Spike detected
      expect(result.anomalies[1].value).toBe(50);   // Drop detected
    });

    it('should perform real-time anomaly check', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          predictions: [{
            isAnomaly: true,
            score: 0.94,
            expectedValue: 1025,
            actualValue: 8500,
            deviationPercent: 729,
          }],
          modelVersion: '3.0.0',
          requestId: 'int-anomaly-rt-1',
        }),
      });

      const endpoint = new AnomalyDetectorEndpoint(client);

      const result = await endpoint.detectSinglePoint({
        timestamp: '2024-01-08T14:30:00Z',
        value: 8500,
        historicalContext: [1000, 1050, 980, 1020, 1010, 1030, 990],
      });

      expect(result.isAnomaly).toBe(true);
      expect(result.deviationPercent).toBeGreaterThan(500);
    });
  });

  describe('Propensity Scoring Flow', () => {
    it('should score and recommend products', async () => {
      // Score propensity
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          predictions: [
            { productId: 'premium-plan', propensityScore: 0.88, confidence: 0.92 },
            { productId: 'add-on-1', propensityScore: 0.72, confidence: 0.85 },
            { productId: 'add-on-2', propensityScore: 0.45, confidence: 0.78 },
            { productId: 'basic-plan', propensityScore: 0.15, confidence: 0.95 },
          ],
          modelVersion: '2.0.0',
          requestId: 'int-propensity-1',
        }),
      });

      const endpoint = new PropensityScoreEndpoint(client);

      const result = await endpoint.scorePropensity({
        customerId: 'cust-prop-1',
        products: ['premium-plan', 'add-on-1', 'add-on-2', 'basic-plan'],
        features: {
          accountAge: 365,
          recentPurchases: 5,
          averageOrderValue: 150,
          engagement_score: 0.8,
        },
      });

      expect(result.scores).toHaveLength(4);
      expect(result.scores[0].productId).toBe('premium-plan');

      // Filter high propensity products
      const highPropensity = result.scores.filter(s => s.propensityScore > 0.7);
      expect(highPropensity).toHaveLength(2);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const endpoint = new BudgetOptimizerEndpoint(client);

      await expect(
        endpoint.optimize({
          totalBudget: 10000,
          channels: ['search'],
          objective: 'maximize_roi',
        })
      ).rejects.toThrow('Network error');
    });

    it('should handle API errors with details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            code: 'InvalidInput',
            message: 'Budget must be greater than 0',
          },
        }),
      });

      const endpoint = new BudgetOptimizerEndpoint(client);

      await expect(
        endpoint.optimize({
          totalBudget: -1000,
          channels: ['search'],
          objective: 'maximize_roi',
        })
      ).rejects.toThrow();
    });

    it('should handle rate limiting', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          headers: new Map([['Retry-After', '30']]),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            predictions: [{ channel: 'search', allocation: 1.0 }],
            modelVersion: '2.1.0',
            requestId: 'retry-1',
          }),
        });

      const clientWithRetry = new AzureMLClient({ ...testConfig, maxRetries: 2 });
      const endpoint = new BudgetOptimizerEndpoint(clientWithRetry);

      const result = await endpoint.optimize({
        totalBudget: 10000,
        channels: ['search'],
        objective: 'maximize_roi',
      });

      expect(result.allocations).toBeDefined();
    });
  });

  describe('Multi-Endpoint Workflow', () => {
    it('should combine churn prediction with propensity scoring', async () => {
      // First: Predict churn
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          predictions: [{ churnProbability: 0.75, riskLevel: 'high' }],
          modelVersion: '1.5.0',
          requestId: 'workflow-churn-1',
        }),
      });

      // Second: Score retention offers for high-risk customers
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          predictions: [
            { productId: 'discount-offer', propensityScore: 0.85 },
            { productId: 'loyalty-bonus', propensityScore: 0.72 },
            { productId: 'upgrade-offer', propensityScore: 0.35 },
          ],
          modelVersion: '2.0.0',
          requestId: 'workflow-propensity-1',
        }),
      });

      const churnEndpoint = new ChurnPredictorEndpoint(client);
      const propensityEndpoint = new PropensityScoreEndpoint(client);

      // Step 1: Check churn risk
      const churnResult = await churnEndpoint.predictChurn({
        customerId: 'workflow-cust-1',
        features: { tenure: 3, monthlyCharges: 100 },
      });

      expect(churnResult.riskLevel).toBe('high');

      // Step 2: If high risk, score retention offers
      if (churnResult.riskLevel === 'high') {
        const propensityResult = await propensityEndpoint.scorePropensity({
          customerId: 'workflow-cust-1',
          products: ['discount-offer', 'loyalty-bonus', 'upgrade-offer'],
          features: { churnRisk: churnResult.churnProbability },
        });

        expect(propensityResult.scores[0].productId).toBe('discount-offer');
        expect(propensityResult.scores[0].propensityScore).toBeGreaterThan(0.8);
      }
    });
  });
});
