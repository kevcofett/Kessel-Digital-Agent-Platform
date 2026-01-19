/**
 * Benchmark Connectors Index
 * Export all benchmark connector classes and factory functions
 */

// Base connector
export { BaseConnector, ConnectorOptions } from './baseConnector';

// Media benchmark connector
export {
  MediaBenchmarkConnector,
  MediaBenchmarkConfig,
  createMediaBenchmarkConnector,
} from './mediaBenchmark';

// Financial benchmark connector
export {
  FinancialBenchmarkConnector,
  FinancialBenchmarkConfig,
  createFinancialBenchmarkConnector,
} from './financialBenchmark';

// Customer benchmark connector
export {
  CustomerBenchmarkConnector,
  CustomerBenchmarkConfig,
  createCustomerBenchmarkConnector,
} from './customerBenchmark';

// Operational benchmark connector
export {
  OperationalBenchmarkConnector,
  OperationalBenchmarkConfig,
  createOperationalBenchmarkConnector,
} from './operationalBenchmark';
