import { AzureMLClient, AzureMLConfig, ModelEndpoint, PredictionRequest, PredictionResponse } from '../src/client';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('AzureMLClient', () => {
  const defaultConfig: AzureMLConfig = {
    subscriptionId: 'sub-123',
    resourceGroup: 'rg-ml',
    workspaceName: 'mlworkspace',
    region: 'eastus',
    apiKey: 'test-api-key-12345',
    apiVersion: '2023-10-01',
  };

  let client: AzureMLClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
    client = new AzureMLClient(defaultConfig);
  });

  describe('initialization', () => {
    it('should create client with valid config', () => {
      expect(client).toBeDefined();
      expect(client.getConfig().subscriptionId).toBe('sub-123');
    });

    it('should throw error for missing subscription id', () => {
      const invalidConfig = { ...defaultConfig, subscriptionId: '' };
      expect(() => new AzureMLClient(invalidConfig)).toThrow('subscriptionId is required');
    });

    it('should throw error for missing api key', () => {
      const invalidConfig = { ...defaultConfig, apiKey: '' };
      expect(() => new AzureMLClient(invalidConfig)).toThrow('apiKey is required');
    });

    it('should use default api version if not provided', () => {
      const configWithoutVersion = { ...defaultConfig, apiVersion: undefined };
      const clientWithDefault = new AzureMLClient(configWithoutVersion);
      expect(clientWithDefault.getConfig().apiVersion).toBe('2023-10-01');
    });

    it('should construct correct base URL', () => {
      expect(client.getBaseUrl()).toContain('eastus');
      expect(client.getBaseUrl()).toContain('mlworkspace');
    });
  });

  describe('listEndpoints', () => {
    it('should fetch all endpoints', async () => {
      const mockEndpoints: ModelEndpoint[] = [
        { name: 'budget-optimizer', deploymentName: 'blue', scoringUri: 'https://example.com/score', status: 'healthy' },
        { name: 'churn-predictor', deploymentName: 'green', scoringUri: 'https://example.com/churn', status: 'healthy' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ value: mockEndpoints }),
      });

      const endpoints = await client.listEndpoints();

      expect(endpoints).toHaveLength(2);
      expect(endpoints[0].name).toBe('budget-optimizer');
    });

    it('should handle empty endpoint list', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ value: [] }),
      });

      const endpoints = await client.listEndpoints();

      expect(endpoints).toHaveLength(0);
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(client.listEndpoints()).rejects.toThrow('Failed to list endpoints');
    });

    it('should include authorization header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ value: [] }),
      });

      await client.listEndpoints();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key-12345',
          }),
        })
      );
    });
  });

  describe('getEndpoint', () => {
    it('should fetch specific endpoint', async () => {
      const mockEndpoint: ModelEndpoint = {
        name: 'budget-optimizer',
        deploymentName: 'blue',
        scoringUri: 'https://example.com/score',
        status: 'healthy',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEndpoint,
      });

      const endpoint = await client.getEndpoint('budget-optimizer');

      expect(endpoint.name).toBe('budget-optimizer');
      expect(endpoint.status).toBe('healthy');
    });

    it('should handle endpoint not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(client.getEndpoint('nonexistent')).rejects.toThrow('Endpoint not found');
    });
  });

  describe('predict', () => {
    const mockRequest: PredictionRequest = {
      endpointName: 'budget-optimizer',
      data: {
        features: [100, 200, 300],
        context: { accountId: 'acc-123' },
      },
    };

    it('should make prediction request', async () => {
      const mockResponse: PredictionResponse = {
        predictions: [0.85, 0.12, 0.03],
        modelVersion: '1.2.0',
        requestId: 'req-456',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await client.predict(mockRequest);

      expect(response.predictions).toEqual([0.85, 0.12, 0.03]);
      expect(response.modelVersion).toBe('1.2.0');
    });

    it('should send correct request body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ predictions: [], modelVersion: '1.0.0', requestId: 'req-1' }),
      });

      await client.predict(mockRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockRequest.data),
        })
      );
    });

    it('should handle prediction timeout', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Request timeout'));

      await expect(client.predict(mockRequest)).rejects.toThrow('Request timeout');
    });

    it('should handle invalid response format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' }),
      });

      await expect(client.predict(mockRequest)).rejects.toThrow('Invalid response format');
    });
  });

  describe('batchPredict', () => {
    const mockBatchRequest = {
      endpointName: 'budget-optimizer',
      data: [
        { features: [100, 200] },
        { features: [150, 250] },
        { features: [200, 300] },
      ],
    };

    it('should make batch prediction request', async () => {
      const mockResponse = {
        predictions: [[0.8, 0.2], [0.6, 0.4], [0.9, 0.1]],
        modelVersion: '1.2.0',
        requestId: 'batch-123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await client.batchPredict(mockBatchRequest);

      expect(response.predictions).toHaveLength(3);
    });

    it('should handle partial batch failures', async () => {
      const mockResponse = {
        predictions: [[0.8, 0.2], null, [0.9, 0.1]],
        errors: [{ index: 1, message: 'Invalid input' }],
        modelVersion: '1.2.0',
        requestId: 'batch-456',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await client.batchPredict(mockBatchRequest);

      expect(response.errors).toHaveLength(1);
      expect(response.errors![0].index).toBe(1);
    });
  });

  describe('health check', () => {
    it('should return healthy status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'healthy', timestamp: new Date().toISOString() }),
      });

      const health = await client.checkHealth();

      expect(health.status).toBe('healthy');
    });

    it('should return unhealthy status on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

      const health = await client.checkHealth();

      expect(health.status).toBe('unhealthy');
      expect(health.error).toBe('Connection refused');
    });
  });

  describe('retry logic', () => {
    it('should retry on transient failures', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ value: [] }),
        });

      const clientWithRetry = new AzureMLClient({ ...defaultConfig, maxRetries: 3 });
      const endpoints = await clientWithRetry.listEndpoints();

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(endpoints).toHaveLength(0);
    });

    it('should not retry on 4xx errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      const clientWithRetry = new AzureMLClient({ ...defaultConfig, maxRetries: 3 });

      await expect(clientWithRetry.listEndpoints()).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should apply exponential backoff', async () => {
      const delays: number[] = [];
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = ((fn: Function, delay: number) => {
        delays.push(delay);
        fn();
        return 0;
      }) as any;

      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ value: [] }),
        });

      const clientWithRetry = new AzureMLClient({ ...defaultConfig, maxRetries: 3 });
      await clientWithRetry.listEndpoints();

      global.setTimeout = originalSetTimeout;

      expect(delays[1]).toBeGreaterThan(delays[0]);
    });
  });

  describe('request headers', () => {
    it('should include content-type header for POST requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ predictions: [], modelVersion: '1.0.0', requestId: 'req-1' }),
      });

      await client.predict({ endpointName: 'test', data: {} });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should include custom headers when provided', async () => {
      const clientWithHeaders = new AzureMLClient({
        ...defaultConfig,
        customHeaders: { 'X-Request-ID': 'custom-123' },
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ value: [] }),
      });

      await clientWithHeaders.listEndpoints();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Request-ID': 'custom-123',
          }),
        })
      );
    });
  });
});
