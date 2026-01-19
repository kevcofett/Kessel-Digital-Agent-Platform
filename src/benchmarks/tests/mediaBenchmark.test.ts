import { MediaBenchmarkConnector, createMediaBenchmarkConnector } from '../connectors/mediaBenchmark';
import { MediaBenchmarkConfig, MediaBenchmarkRequest, MediaBenchmarkResponse } from '../types';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('MediaBenchmarkConnector', () => {
  const defaultConfig: MediaBenchmarkConfig = {
    baseUrl: 'https://api.benchmark.example.com',
    apiKey: 'test-api-key',
    provider: 'custom',
  };

  let connector: MediaBenchmarkConnector;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
    connector = createMediaBenchmarkConnector(defaultConfig, { enableCache: false });
  });

  describe('initialization', () => {
    it('should create connector with valid config', () => {
      expect(connector).toBeDefined();
      expect(connector.getName()).toBe('media-benchmark');
      expect(connector.getVersion()).toBe('1.0.0');
    });
  });

  describe('isHealthy', () => {
    it('should return true when API is healthy', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'healthy' }),
      });

      const healthy = await connector.isHealthy();
      expect(healthy).toBe(true);
    });

    it('should return false when API is unhealthy', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

      const healthy = await connector.isHealthy();
      expect(healthy).toBe(false);
    });
  });

  describe('fetch', () => {
    const validRequest: MediaBenchmarkRequest = {
      channels: ['search_paid', 'social_paid'],
      metrics: ['cpm', 'ctr', 'conversion_rate'],
      industry: 'technology',
      region: 'us',
    };

    const mockResponse: MediaBenchmarkResponse = {
      requestId: 'req-123',
      timestamp: '2024-01-15T10:00:00Z',
      benchmarks: [
        {
          channel: 'search_paid',
          metric: 'cpm',
          value: 2.50,
          benchmark: { min: 1.00, max: 5.00, median: 2.25 },
          percentileRank: 55,
          trend: 'stable',
        },
        {
          channel: 'search_paid',
          metric: 'ctr',
          value: 0.032,
          benchmark: { min: 0.01, max: 0.08, median: 0.035 },
          percentileRank: 48,
          trend: 'increasing',
        },
      ],
      metadata: {
        sampleSize: 1500,
        lastUpdated: '2024-01-14T00:00:00Z',
        dataSource: 'custom',
      },
    };

    it('should fetch media benchmarks successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Map(),
      });

      const result = await connector.fetch(validRequest);

      expect(result.benchmarks).toHaveLength(2);
      expect(result.benchmarks[0].channel).toBe('search_paid');
      expect(result.benchmarks[0].metric).toBe('cpm');
    });

    it('should validate channels', async () => {
      const invalidRequest = {
        channels: ['invalid_channel' as any],
        metrics: ['cpm'],
      };

      await expect(connector.fetch(invalidRequest)).rejects.toThrow('Invalid channel');
    });

    it('should require at least one channel', async () => {
      const invalidRequest = {
        channels: [],
        metrics: ['cpm'],
      };

      await expect(connector.fetch(invalidRequest)).rejects.toThrow('At least one channel');
    });

    it('should require at least one metric', async () => {
      const invalidRequest = {
        channels: ['search_paid'],
        metrics: [],
      };

      await expect(connector.fetch(invalidRequest)).rejects.toThrow('At least one metric');
    });
  });

  describe('convenience methods', () => {
    const mockBenchmarks = {
      requestId: 'req-456',
      timestamp: '2024-01-15T10:00:00Z',
      benchmarks: [
        { channel: 'search_paid', metric: 'cpc', value: 1.50, benchmark: { min: 0.5, max: 3.0, median: 1.25 }, percentileRank: 60, trend: 'stable' as const },
      ],
      metadata: { sampleSize: 1000, lastUpdated: '2024-01-14', dataSource: 'custom' },
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockBenchmarks,
        headers: new Map(),
      });
    });

    it('should get search benchmarks', async () => {
      const result = await connector.getSearchBenchmarks('technology', 'us');

      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should get social benchmarks', async () => {
      const result = await connector.getSocialBenchmarks('retail');

      expect(result).toBeDefined();
    });

    it('should get display benchmarks', async () => {
      const result = await connector.getDisplayBenchmarks('finance');

      expect(result).toBeDefined();
    });

    it('should get video benchmarks', async () => {
      const result = await connector.getVideoBenchmarks('entertainment');

      expect(result).toBeDefined();
    });
  });

  describe('compareToIndustry', () => {
    it('should compare company metrics to industry', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          requestId: 'comp-123',
          timestamp: '2024-01-15T10:00:00Z',
          benchmarks: [
            {
              channel: 'search_paid',
              metric: 'cpm',
              value: 0,
              benchmark: { min: 1.0, max: 5.0, median: 2.5, percentile25: 1.5, percentile75: 3.5 },
              percentileRank: 60,
              trend: 'stable',
            },
          ],
          metadata: { sampleSize: 1000, lastUpdated: '2024-01-14', dataSource: 'custom' },
        }),
        headers: new Map(),
      });

      const companyMetrics = [
        { channel: 'search_paid' as const, metric: 'cpm' as const, value: 4.0 },
      ];

      const result = await connector.compareToIndustry(companyMetrics, 'technology');

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('above');
    });
  });

  describe('batch fetch', () => {
    it('should fetch multiple requests in parallel', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          requestId: 'batch-123',
          timestamp: '2024-01-15T10:00:00Z',
          benchmarks: [],
          metadata: { sampleSize: 100, lastUpdated: '2024-01-14', dataSource: 'custom' },
        }),
        headers: new Map(),
      });

      const requests: MediaBenchmarkRequest[] = [
        { channels: ['search_paid'], metrics: ['cpm'] },
        { channels: ['social_paid'], metrics: ['ctr'] },
        { channels: ['display'], metrics: ['viewability'] },
      ];

      const results = await connector.batchFetch(requests);

      expect(results).toHaveLength(3);
    });
  });
});
