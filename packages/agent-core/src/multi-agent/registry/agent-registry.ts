/**
 * Agent Registry
 *
 * Centralized registry for managing specialist agent configurations,
 * capabilities, and routing metadata. Supports both in-memory and
 * Dataverse-backed storage.
 *
 * @module agent-registry
 * @version 1.0.0
 */

import { AgentCode, AGENT_CODES, AGENT_METADATA } from '../types/agent-codes.js';

/**
 * Agent configuration in the registry
 */
export interface AgentRegistryEntry {
  agentCode: AgentCode;
  name: string;
  description: string;
  version: string;
  status: AgentStatus;
  capabilities: AgentCapability[];
  endpoints: AgentEndpoints;
  healthCheck: HealthCheckConfig;
  routingConfig: RoutingConfig;
  metadata: AgentMetadata;
}

export type AgentStatus = 'active' | 'inactive' | 'maintenance' | 'deprecated';

export interface AgentCapability {
  capabilityId: string;
  name: string;
  description: string;
  flowName: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  estimatedLatencyMs: number;
  requiredPlanState?: string[];
  updatedPlanState?: string[];
}

export interface AgentEndpoints {
  primary: string;
  fallback?: string;
  healthCheck: string;
}

export interface HealthCheckConfig {
  enabled: boolean;
  intervalMs: number;
  timeoutMs: number;
  unhealthyThreshold: number;
  healthyThreshold: number;
}

export interface RoutingConfig {
  priority: number;
  loadBalancing: 'round_robin' | 'least_connections' | 'weighted';
  weight?: number;
  maxConcurrentRequests: number;
  retryConfig: RetryConfig;
  circuitBreaker: CircuitBreakerConfig;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number;
  resetTimeoutMs: number;
  halfOpenRequests: number;
}

export interface AgentMetadata {
  createdAt: Date;
  updatedAt: Date;
  owner: string;
  tags: string[];
  documentation?: string;
}

/**
 * Agent registry storage interface
 */
export interface AgentRegistryStorage {
  getAgent(agentCode: AgentCode): Promise<AgentRegistryEntry | null>;
  getAllAgents(): Promise<AgentRegistryEntry[]>;
  getActiveAgents(): Promise<AgentRegistryEntry[]>;
  updateAgent(entry: AgentRegistryEntry): Promise<void>;
  updateAgentStatus(agentCode: AgentCode, status: AgentStatus): Promise<void>;
  getAgentsByCapability(capabilityId: string): Promise<AgentRegistryEntry[]>;
}

/**
 * In-memory agent registry storage
 */
export class InMemoryAgentRegistryStorage implements AgentRegistryStorage {
  private agents: Map<AgentCode, AgentRegistryEntry> = new Map();

  constructor(initialEntries?: AgentRegistryEntry[]) {
    if (initialEntries) {
      initialEntries.forEach(entry => this.agents.set(entry.agentCode, entry));
    }
  }

  async getAgent(agentCode: AgentCode): Promise<AgentRegistryEntry | null> {
    return this.agents.get(agentCode) || null;
  }

  async getAllAgents(): Promise<AgentRegistryEntry[]> {
    return Array.from(this.agents.values());
  }

  async getActiveAgents(): Promise<AgentRegistryEntry[]> {
    return Array.from(this.agents.values()).filter(a => a.status === 'active');
  }

  async updateAgent(entry: AgentRegistryEntry): Promise<void> {
    this.agents.set(entry.agentCode, {
      ...entry,
      metadata: {
        ...entry.metadata,
        updatedAt: new Date(),
      },
    });
  }

  async updateAgentStatus(agentCode: AgentCode, status: AgentStatus): Promise<void> {
    const agent = await this.getAgent(agentCode);
    if (agent) {
      agent.status = status;
      agent.metadata.updatedAt = new Date();
    }
  }

  async getAgentsByCapability(capabilityId: string): Promise<AgentRegistryEntry[]> {
    return Array.from(this.agents.values()).filter(
      agent => agent.capabilities.some(c => c.capabilityId === capabilityId)
    );
  }
}

/**
 * Dataverse-backed agent registry storage
 */
export class DataverseAgentRegistryStorage implements AgentRegistryStorage {
  constructor(private dataverseUrl: string) {}

  async getAgent(agentCode: AgentCode): Promise<AgentRegistryEntry | null> {
    try {
      const response = await fetch(
        `${this.dataverseUrl}/api/data/v9.2/eap_agents?$filter=eap_agent_code eq '${agentCode}'`
      );
      if (!response.ok) return null;
      const data = await response.json();
      if (data.value.length === 0) return null;
      return this.mapDataverseToEntry(data.value[0]);
    } catch {
      return null;
    }
  }

  async getAllAgents(): Promise<AgentRegistryEntry[]> {
    try {
      const response = await fetch(
        `${this.dataverseUrl}/api/data/v9.2/eap_agents`
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.value.map((item: unknown) => this.mapDataverseToEntry(item));
    } catch {
      return [];
    }
  }

  async getActiveAgents(): Promise<AgentRegistryEntry[]> {
    try {
      const response = await fetch(
        `${this.dataverseUrl}/api/data/v9.2/eap_agents?$filter=eap_status eq 'active'`
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.value.map((item: unknown) => this.mapDataverseToEntry(item));
    } catch {
      return [];
    }
  }

  async updateAgent(entry: AgentRegistryEntry): Promise<void> {
    const existing = await this.getAgent(entry.agentCode);
    const method = existing ? 'PATCH' : 'POST';
    const url = existing
      ? `${this.dataverseUrl}/api/data/v9.2/eap_agents(${existing.metadata.createdAt})`
      : `${this.dataverseUrl}/api/data/v9.2/eap_agents`;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.mapEntryToDataverse(entry)),
    });
  }

  async updateAgentStatus(agentCode: AgentCode, status: AgentStatus): Promise<void> {
    const agent = await this.getAgent(agentCode);
    if (agent) {
      await this.updateAgent({ ...agent, status });
    }
  }

  async getAgentsByCapability(capabilityId: string): Promise<AgentRegistryEntry[]> {
    // Dataverse doesn't support filtering on JSON arrays easily,
    // so we fetch all and filter in-memory
    const allAgents = await getAllAgents();
    return allAgents.filter(
      agent => agent.capabilities.some(c => c.capabilityId === capabilityId)
    );

    async function getAllAgents(): Promise<AgentRegistryEntry[]> {
      return [];
    }
  }

  private mapDataverseToEntry(data: Record<string, unknown>): AgentRegistryEntry {
    return {
      agentCode: data['eap_agent_code'] as AgentCode,
      name: data['eap_name'] as string,
      description: data['eap_description'] as string,
      version: data['eap_version'] as string,
      status: data['eap_status'] as AgentStatus,
      capabilities: JSON.parse(data['eap_capabilities'] as string || '[]'),
      endpoints: JSON.parse(data['eap_endpoints'] as string || '{}'),
      healthCheck: JSON.parse(data['eap_health_check'] as string || '{}'),
      routingConfig: JSON.parse(data['eap_routing_config'] as string || '{}'),
      metadata: {
        createdAt: new Date(data['createdon'] as string),
        updatedAt: new Date(data['modifiedon'] as string),
        owner: data['eap_owner'] as string,
        tags: JSON.parse(data['eap_tags'] as string || '[]'),
        documentation: data['eap_documentation'] as string,
      },
    };
  }

  private mapEntryToDataverse(entry: AgentRegistryEntry): Record<string, unknown> {
    return {
      eap_agent_code: entry.agentCode,
      eap_name: entry.name,
      eap_description: entry.description,
      eap_version: entry.version,
      eap_status: entry.status,
      eap_capabilities: JSON.stringify(entry.capabilities),
      eap_endpoints: JSON.stringify(entry.endpoints),
      eap_health_check: JSON.stringify(entry.healthCheck),
      eap_routing_config: JSON.stringify(entry.routingConfig),
      eap_owner: entry.metadata.owner,
      eap_tags: JSON.stringify(entry.metadata.tags),
      eap_documentation: entry.metadata.documentation,
    };
  }
}

/**
 * Agent Registry Manager
 * Provides high-level operations for agent registry management
 */
export class AgentRegistryManager {
  private storage: AgentRegistryStorage;
  private healthStatus: Map<AgentCode, AgentHealthStatus> = new Map();
  private healthCheckInterval?: ReturnType<typeof setInterval>;

  constructor(storage: AgentRegistryStorage) {
    this.storage = storage;
  }

  /**
   * Get agent by code
   */
  async getAgent(agentCode: AgentCode): Promise<AgentRegistryEntry | null> {
    return this.storage.getAgent(agentCode);
  }

  /**
   * Get all active agents
   */
  async getActiveAgents(): Promise<AgentRegistryEntry[]> {
    return this.storage.getActiveAgents();
  }

  /**
   * Find agents that can handle a specific capability
   */
  async findAgentsForCapability(capabilityId: string): Promise<AgentRegistryEntry[]> {
    const agents = await this.storage.getAgentsByCapability(capabilityId);
    return agents.filter(a => a.status === 'active');
  }

  /**
   * Get the best agent for a capability based on health and load
   */
  async getBestAgentForCapability(capabilityId: string): Promise<AgentRegistryEntry | null> {
    const candidates = await this.findAgentsForCapability(capabilityId);
    if (candidates.length === 0) return null;

    // Sort by priority, then by health status
    const sortedCandidates = candidates.sort((a, b) => {
      const healthA = this.healthStatus.get(a.agentCode);
      const healthB = this.healthStatus.get(b.agentCode);

      // Prefer healthy agents
      if (healthA?.isHealthy && !healthB?.isHealthy) return -1;
      if (!healthA?.isHealthy && healthB?.isHealthy) return 1;

      // Then by priority
      return a.routingConfig.priority - b.routingConfig.priority;
    });

    return sortedCandidates[0];
  }

  /**
   * Register a new agent
   */
  async registerAgent(entry: AgentRegistryEntry): Promise<void> {
    await this.storage.updateAgent(entry);
  }

  /**
   * Update agent status
   */
  async updateAgentStatus(agentCode: AgentCode, status: AgentStatus): Promise<void> {
    await this.storage.updateAgentStatus(agentCode, status);
  }

  /**
   * Start health checking for all agents
   */
  startHealthChecking(): void {
    if (this.healthCheckInterval) return;

    this.healthCheckInterval = setInterval(async () => {
      const agents = await this.storage.getActiveAgents();
      for (const agent of agents) {
        if (agent.healthCheck.enabled) {
          await this.checkAgentHealth(agent);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Stop health checking
   */
  stopHealthChecking(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
  }

  /**
   * Get current health status for an agent
   */
  getHealthStatus(agentCode: AgentCode): AgentHealthStatus | undefined {
    return this.healthStatus.get(agentCode);
  }

  /**
   * Get health status for all agents
   */
  getAllHealthStatus(): Map<AgentCode, AgentHealthStatus> {
    return new Map(this.healthStatus);
  }

  private async checkAgentHealth(agent: AgentRegistryEntry): Promise<void> {
    const startTime = Date.now();
    let isHealthy = false;
    let errorMessage: string | undefined;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        agent.healthCheck.timeoutMs
      );

      const response = await fetch(agent.endpoints.healthCheck, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      isHealthy = response.ok;
    } catch (error) {
      isHealthy = false;
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
    }

    const latencyMs = Date.now() - startTime;
    const previousStatus = this.healthStatus.get(agent.agentCode);

    // Update consecutive counts
    let consecutiveFailures = previousStatus?.consecutiveFailures || 0;
    let consecutiveSuccesses = previousStatus?.consecutiveSuccesses || 0;

    if (isHealthy) {
      consecutiveSuccesses++;
      consecutiveFailures = 0;
    } else {
      consecutiveFailures++;
      consecutiveSuccesses = 0;
    }

    // Determine health based on thresholds
    let healthyStatus = isHealthy;
    if (consecutiveFailures >= agent.healthCheck.unhealthyThreshold) {
      healthyStatus = false;
    }
    if (consecutiveSuccesses >= agent.healthCheck.healthyThreshold) {
      healthyStatus = true;
    }

    this.healthStatus.set(agent.agentCode, {
      agentCode: agent.agentCode,
      isHealthy: healthyStatus,
      lastCheckTime: new Date(),
      latencyMs,
      consecutiveFailures,
      consecutiveSuccesses,
      errorMessage,
    });
  }
}

export interface AgentHealthStatus {
  agentCode: AgentCode;
  isHealthy: boolean;
  lastCheckTime: Date;
  latencyMs: number;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  errorMessage?: string;
}

/**
 * Default agent registry entries for multi-agent architecture
 */
export const defaultAgentRegistryEntries: AgentRegistryEntry[] = [
  {
    agentCode: AGENT_CODES.ORC,
    name: AGENT_METADATA[AGENT_CODES.ORC].name,
    description: AGENT_METADATA[AGENT_CODES.ORC].description,
    version: '1.0.0',
    status: 'active',
    capabilities: [
      {
        capabilityId: 'route_to_specialist',
        name: 'Route to Specialist',
        description: 'Routes requests to appropriate specialist agents',
        flowName: 'RouteToSpecialist',
        estimatedLatencyMs: 500,
      },
      {
        capabilityId: 'get_session_state',
        name: 'Get Session State',
        description: 'Retrieves current session and plan state',
        flowName: 'GetSessionState',
        estimatedLatencyMs: 200,
      },
      {
        capabilityId: 'update_progress',
        name: 'Update Progress',
        description: 'Updates workflow progress and gate status',
        flowName: 'UpdateProgress',
        estimatedLatencyMs: 300,
      },
    ],
    endpoints: {
      primary: '${POWER_AUTOMATE_URL}/orc',
      healthCheck: '${POWER_AUTOMATE_URL}/orc/health',
    },
    healthCheck: {
      enabled: true,
      intervalMs: 30000,
      timeoutMs: 5000,
      unhealthyThreshold: 3,
      healthyThreshold: 2,
    },
    routingConfig: {
      priority: 0,
      loadBalancing: 'round_robin',
      maxConcurrentRequests: 100,
      retryConfig: {
        maxRetries: 3,
        initialDelayMs: 100,
        maxDelayMs: 5000,
        backoffMultiplier: 2,
      },
      circuitBreaker: {
        enabled: true,
        failureThreshold: 5,
        resetTimeoutMs: 30000,
        halfOpenRequests: 3,
      },
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: 'EAP Platform',
      tags: ['orchestrator', 'routing', 'core'],
    },
  },
  {
    agentCode: AGENT_CODES.ANL,
    name: AGENT_METADATA[AGENT_CODES.ANL].name,
    description: AGENT_METADATA[AGENT_CODES.ANL].description,
    version: '1.0.0',
    status: 'active',
    capabilities: [
      {
        capabilityId: 'calculate_projection',
        name: 'Calculate Projection',
        description: 'Calculates media performance projections',
        flowName: 'CalculateProjection',
        estimatedLatencyMs: 2000,
        requiredPlanState: ['budget'],
        updatedPlanState: ['projections'],
      },
      {
        capabilityId: 'run_scenario',
        name: 'Run Scenario',
        description: 'Compares multiple budget scenarios',
        flowName: 'RunScenario',
        estimatedLatencyMs: 3000,
        requiredPlanState: ['budget', 'scenarios'],
        updatedPlanState: ['scenario_analysis'],
      },
    ],
    endpoints: {
      primary: '${POWER_AUTOMATE_URL}/anl',
      healthCheck: '${POWER_AUTOMATE_URL}/anl/health',
    },
    healthCheck: {
      enabled: true,
      intervalMs: 30000,
      timeoutMs: 5000,
      unhealthyThreshold: 3,
      healthyThreshold: 2,
    },
    routingConfig: {
      priority: 1,
      loadBalancing: 'round_robin',
      maxConcurrentRequests: 50,
      retryConfig: {
        maxRetries: 2,
        initialDelayMs: 200,
        maxDelayMs: 3000,
        backoffMultiplier: 2,
      },
      circuitBreaker: {
        enabled: true,
        failureThreshold: 5,
        resetTimeoutMs: 30000,
        halfOpenRequests: 2,
      },
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: 'EAP Platform',
      tags: ['analytics', 'forecasting', 'specialist'],
    },
  },
  {
    agentCode: AGENT_CODES.AUD,
    name: AGENT_METADATA[AGENT_CODES.AUD].name,
    description: AGENT_METADATA[AGENT_CODES.AUD].description,
    version: '1.0.0',
    status: 'active',
    capabilities: [
      {
        capabilityId: 'segment_audience',
        name: 'Segment Audience',
        description: 'Segments audiences using various methodologies',
        flowName: 'SegmentAudience',
        estimatedLatencyMs: 2500,
        updatedPlanState: ['audience.primary_segments', 'audience.segmentation_method'],
      },
      {
        capabilityId: 'calculate_ltv',
        name: 'Calculate LTV',
        description: 'Calculates customer lifetime value',
        flowName: 'CalculateLTV',
        estimatedLatencyMs: 2000,
        updatedPlanState: ['audience.segment_ltv'],
      },
    ],
    endpoints: {
      primary: '${POWER_AUTOMATE_URL}/aud',
      healthCheck: '${POWER_AUTOMATE_URL}/aud/health',
    },
    healthCheck: {
      enabled: true,
      intervalMs: 30000,
      timeoutMs: 5000,
      unhealthyThreshold: 3,
      healthyThreshold: 2,
    },
    routingConfig: {
      priority: 1,
      loadBalancing: 'round_robin',
      maxConcurrentRequests: 50,
      retryConfig: {
        maxRetries: 2,
        initialDelayMs: 200,
        maxDelayMs: 3000,
        backoffMultiplier: 2,
      },
      circuitBreaker: {
        enabled: true,
        failureThreshold: 5,
        resetTimeoutMs: 30000,
        halfOpenRequests: 2,
      },
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: 'EAP Platform',
      tags: ['audience', 'segmentation', 'specialist'],
    },
  },
  {
    agentCode: AGENT_CODES.CHA,
    name: AGENT_METADATA[AGENT_CODES.CHA].name,
    description: AGENT_METADATA[AGENT_CODES.CHA].description,
    version: '1.0.0',
    status: 'active',
    capabilities: [
      {
        capabilityId: 'calculate_allocation',
        name: 'Calculate Allocation',
        description: 'Calculates optimal budget allocation across channels',
        flowName: 'CalculateAllocation',
        estimatedLatencyMs: 2000,
        requiredPlanState: ['budget', 'channels'],
        updatedPlanState: ['channels.allocations'],
      },
      {
        capabilityId: 'lookup_benchmarks',
        name: 'Lookup Benchmarks',
        description: 'Retrieves channel performance benchmarks',
        flowName: 'LookupBenchmarks',
        estimatedLatencyMs: 1000,
      },
    ],
    endpoints: {
      primary: '${POWER_AUTOMATE_URL}/cha',
      healthCheck: '${POWER_AUTOMATE_URL}/cha/health',
    },
    healthCheck: {
      enabled: true,
      intervalMs: 30000,
      timeoutMs: 5000,
      unhealthyThreshold: 3,
      healthyThreshold: 2,
    },
    routingConfig: {
      priority: 1,
      loadBalancing: 'round_robin',
      maxConcurrentRequests: 50,
      retryConfig: {
        maxRetries: 2,
        initialDelayMs: 200,
        maxDelayMs: 3000,
        backoffMultiplier: 2,
      },
      circuitBreaker: {
        enabled: true,
        failureThreshold: 5,
        resetTimeoutMs: 30000,
        halfOpenRequests: 2,
      },
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: 'EAP Platform',
      tags: ['channel', 'strategy', 'specialist'],
    },
  },
  {
    agentCode: AGENT_CODES.SPO,
    name: AGENT_METADATA[AGENT_CODES.SPO].name,
    description: AGENT_METADATA[AGENT_CODES.SPO].description,
    version: '1.0.0',
    status: 'active',
    capabilities: [
      {
        capabilityId: 'evaluate_partners',
        name: 'Evaluate Partners',
        description: 'Evaluates and ranks media partners',
        flowName: 'EvaluatePartners',
        estimatedLatencyMs: 2500,
        requiredPlanState: ['channels.allocations'],
        updatedPlanState: ['partners.selections'],
      },
      {
        capabilityId: 'optimize_supply_path',
        name: 'Optimize Supply Path',
        description: 'Optimizes programmatic supply paths',
        flowName: 'OptimizeSupplyPath',
        estimatedLatencyMs: 3000,
        updatedPlanState: ['partners.supply_paths'],
      },
    ],
    endpoints: {
      primary: '${POWER_AUTOMATE_URL}/spo',
      healthCheck: '${POWER_AUTOMATE_URL}/spo/health',
    },
    healthCheck: {
      enabled: true,
      intervalMs: 30000,
      timeoutMs: 5000,
      unhealthyThreshold: 3,
      healthyThreshold: 2,
    },
    routingConfig: {
      priority: 2,
      loadBalancing: 'round_robin',
      maxConcurrentRequests: 30,
      retryConfig: {
        maxRetries: 2,
        initialDelayMs: 200,
        maxDelayMs: 3000,
        backoffMultiplier: 2,
      },
      circuitBreaker: {
        enabled: true,
        failureThreshold: 5,
        resetTimeoutMs: 30000,
        halfOpenRequests: 2,
      },
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: 'EAP Platform',
      tags: ['supply', 'partners', 'specialist'],
    },
  },
  {
    agentCode: AGENT_CODES.DOC,
    name: AGENT_METADATA[AGENT_CODES.DOC].name,
    description: AGENT_METADATA[AGENT_CODES.DOC].description,
    version: '1.0.0',
    status: 'active',
    capabilities: [
      {
        capabilityId: 'generate_plan_document',
        name: 'Generate Plan Document',
        description: 'Generates media plan documents',
        flowName: 'GeneratePlanDocument',
        estimatedLatencyMs: 5000,
        requiredPlanState: ['audience', 'channels', 'budget'],
        updatedPlanState: ['documents.plan'],
      },
      {
        capabilityId: 'generate_summary',
        name: 'Generate Summary',
        description: 'Generates executive summaries',
        flowName: 'GenerateSummary',
        estimatedLatencyMs: 2000,
        requiredPlanState: ['audience', 'channels'],
        updatedPlanState: ['documents.summary'],
      },
    ],
    endpoints: {
      primary: '${POWER_AUTOMATE_URL}/doc',
      healthCheck: '${POWER_AUTOMATE_URL}/doc/health',
    },
    healthCheck: {
      enabled: true,
      intervalMs: 30000,
      timeoutMs: 5000,
      unhealthyThreshold: 3,
      healthyThreshold: 2,
    },
    routingConfig: {
      priority: 3,
      loadBalancing: 'round_robin',
      maxConcurrentRequests: 20,
      retryConfig: {
        maxRetries: 2,
        initialDelayMs: 500,
        maxDelayMs: 5000,
        backoffMultiplier: 2,
      },
      circuitBreaker: {
        enabled: true,
        failureThreshold: 3,
        resetTimeoutMs: 60000,
        halfOpenRequests: 1,
      },
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: 'EAP Platform',
      tags: ['document', 'generation', 'specialist'],
    },
  },
  {
    agentCode: AGENT_CODES.PRF,
    name: AGENT_METADATA[AGENT_CODES.PRF].name,
    description: AGENT_METADATA[AGENT_CODES.PRF].description,
    version: '1.0.0',
    status: 'active',
    capabilities: [
      {
        capabilityId: 'analyze_performance',
        name: 'Analyze Performance',
        description: 'Analyzes campaign performance data',
        flowName: 'AnalyzePerformance',
        estimatedLatencyMs: 3000,
        updatedPlanState: ['performance.analysis'],
      },
      {
        capabilityId: 'generate_insights',
        name: 'Generate Insights',
        description: 'Generates actionable performance insights',
        flowName: 'GenerateInsights',
        estimatedLatencyMs: 2500,
        requiredPlanState: ['performance.analysis'],
        updatedPlanState: ['performance.insights'],
      },
    ],
    endpoints: {
      primary: '${POWER_AUTOMATE_URL}/prf',
      healthCheck: '${POWER_AUTOMATE_URL}/prf/health',
    },
    healthCheck: {
      enabled: true,
      intervalMs: 30000,
      timeoutMs: 5000,
      unhealthyThreshold: 3,
      healthyThreshold: 2,
    },
    routingConfig: {
      priority: 2,
      loadBalancing: 'round_robin',
      maxConcurrentRequests: 30,
      retryConfig: {
        maxRetries: 2,
        initialDelayMs: 200,
        maxDelayMs: 3000,
        backoffMultiplier: 2,
      },
      circuitBreaker: {
        enabled: true,
        failureThreshold: 5,
        resetTimeoutMs: 30000,
        halfOpenRequests: 2,
      },
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: 'EAP Platform',
      tags: ['performance', 'insights', 'specialist'],
    },
  },
];

/**
 * Create a pre-configured agent registry manager
 */
export function createAgentRegistryManager(
  storage?: AgentRegistryStorage
): AgentRegistryManager {
  const registryStorage = storage || new InMemoryAgentRegistryStorage(defaultAgentRegistryEntries);
  return new AgentRegistryManager(registryStorage);
}
