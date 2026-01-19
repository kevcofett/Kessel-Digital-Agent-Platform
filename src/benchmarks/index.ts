/**
 * KDAP Benchmark API Module
 * Real-time benchmark data connectors for industry data
 */

// Types
export * from './types';

// Connectors
export * from './connectors';

// Utils
export { HttpClient, createHttpClient, RateLimiter } from './utils/httpClient';
export {
  MemoryCache,
  generateCacheKey,
  getCache,
  resetCache,
  CacheConfig,
  CacheStats,
} from './utils/cache';

// Factory function for creating all connectors
import { BenchmarkAPIConfig } from './types';
import {
  MediaBenchmarkConnector,
  MediaBenchmarkConfig,
  createMediaBenchmarkConnector,
} from './connectors/mediaBenchmark';
import {
  FinancialBenchmarkConnector,
  FinancialBenchmarkConfig,
  createFinancialBenchmarkConnector,
} from './connectors/financialBenchmark';
import {
  CustomerBenchmarkConnector,
  CustomerBenchmarkConfig,
  createCustomerBenchmarkConnector,
} from './connectors/customerBenchmark';
import {
  OperationalBenchmarkConnector,
  OperationalBenchmarkConfig,
  createOperationalBenchmarkConnector,
} from './connectors/operationalBenchmark';
import { ConnectorOptions } from './connectors/baseConnector';

export interface BenchmarkClientConfig {
  media?: MediaBenchmarkConfig;
  financial?: FinancialBenchmarkConfig;
  customer?: CustomerBenchmarkConfig;
  operational?: OperationalBenchmarkConfig;
}

export interface BenchmarkClient {
  media?: MediaBenchmarkConnector;
  financial?: FinancialBenchmarkConnector;
  customer?: CustomerBenchmarkConnector;
  operational?: OperationalBenchmarkConnector;
  isHealthy(): Promise<{ [key: string]: boolean }>;
}

export function createBenchmarkClient(
  config: BenchmarkClientConfig,
  options?: ConnectorOptions
): BenchmarkClient {
  const client: BenchmarkClient = {
    isHealthy: async () => {
      const results: { [key: string]: boolean } = {};

      if (client.media) {
        results.media = await client.media.isHealthy();
      }
      if (client.financial) {
        results.financial = await client.financial.isHealthy();
      }
      if (client.customer) {
        results.customer = await client.customer.isHealthy();
      }
      if (client.operational) {
        results.operational = await client.operational.isHealthy();
      }

      return results;
    },
  };

  if (config.media) {
    client.media = createMediaBenchmarkConnector(config.media, options);
  }

  if (config.financial) {
    client.financial = createFinancialBenchmarkConnector(config.financial, options);
  }

  if (config.customer) {
    client.customer = createCustomerBenchmarkConnector(config.customer, options);
  }

  if (config.operational) {
    client.operational = createOperationalBenchmarkConnector(config.operational, options);
  }

  return client;
}
