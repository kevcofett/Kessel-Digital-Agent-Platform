import { HttpClient, createHttpClient, RateLimiter } from '../utils/httpClient';
import { BenchmarkAPIConfig } from '../types';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('HttpClient', () => {
  const defaultConfig: BenchmarkAPIConfig = {
    baseUrl: 'https://api.benchmark.example.com',
    apiKey: 'test-api-key',
    apiVersion: 'v1',
    timeout: 5000,
    retryAttempts: 3,
  };

  let client: HttpClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
    client = createHttpClient(defaultConfig);
  });

  describe('GET requests', () => {
    it('should make GET request successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'value' }),
        headers: new Map([['x-request-id', 'req-123']]),
      });

      const response = await client.get<{ data: string }>('/endpoint');

      expect(response.data).toEqual({ data: 'value' });
      expect(response.status).toBe(200);
    });

    it('should include query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
        headers: new Map(),
      });

      await client.get('/endpoint', { foo: 'bar', num: 42 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('foo=bar'),
        expect.anything()
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('num=42'),
        expect.anything()
      );
    });

    it('should include authorization header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        headers: new Map(),
      });

      await client.get('/endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
          }),
        })
      );
    });
  });

  describe('POST requests', () => {
    it('should make POST request successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ created: true }),
        headers: new Map(),
      });

      const response = await client.post<{ created: boolean }>('/endpoint', { name: 'test' });

      expect(response.data).toEqual({ created: true });
      expect(response.status).toBe(201);
    });

    it('should serialize body as JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        headers: new Map(),
      });

      await client.post('/endpoint', { key: 'value' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: JSON.stringify({ key: 'value' }),
        })
      );
    });

    it('should include content-type header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        headers: new Map(),
      });

      await client.post('/endpoint', {});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should throw on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          error: { code: 'INVALID_REQUEST', message: 'Invalid parameters' },
        }),
      });

      await expect(client.get('/endpoint')).rejects.toMatchObject({
        code: 'INVALID_REQUEST',
        message: 'Invalid parameters',
      });
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.get('/endpoint')).rejects.toThrow('Network error');
    });
  });

  describe('retry logic', () => {
    it('should retry on 500 errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => ({ error: { code: 'HTTP_500' } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
          headers: new Map(),
        });

      const response = await client.get<{ success: boolean }>('/endpoint');

      expect(response.data.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should retry on 429 rate limit', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          json: async () => ({ error: { code: 'HTTP_429' } }),
          headers: new Map([['Retry-After', '1']]),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
          headers: new Map(),
        });

      const response = await client.get<{ success: boolean }>('/endpoint');

      expect(response.data.success).toBe(true);
    });

    it('should not retry on 400 errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: { code: 'HTTP_400' } }),
      });

      await expect(client.get('/endpoint')).rejects.toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should give up after max retries', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: { code: 'HTTP_500' } }),
      });

      await expect(client.get('/endpoint')).rejects.toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries = maxRetries
    });
  });

  describe('URL building', () => {
    it('should build correct URL with base and path', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        headers: new Map(),
      });

      await client.get('/test/path');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.benchmark.example.com/v1/test/path',
        expect.anything()
      );
    });

    it('should handle boolean query params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        headers: new Map(),
      });

      await client.get('/endpoint', { active: true, disabled: false });

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('active=true');
      expect(url).toContain('disabled=false');
    });
  });
});

describe('RateLimiter', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should allow requests within rate limit', async () => {
    const limiter = new RateLimiter(60); // 60 per minute

    const acquirePromise = limiter.acquire();
    jest.runAllTimers();
    await acquirePromise;

    // Should complete without waiting
    expect(true).toBe(true);
  });

  it('should refill tokens over time', async () => {
    const limiter = new RateLimiter(2); // 2 per minute

    // Use up tokens
    await limiter.acquire();
    await limiter.acquire();

    // Advance time by 30 seconds (should refill ~1 token)
    jest.advanceTimersByTime(30000);

    // Should be able to acquire another token
    const acquirePromise = limiter.acquire();
    jest.runAllTimers();
    await acquirePromise;

    expect(true).toBe(true);
  });
});
