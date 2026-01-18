/**
 * Multi-Agent Architecture - Audit Logger
 *
 * Provides comprehensive audit logging for the multi-agent system.
 * Tracks routing decisions, agent invocations, and response metrics.
 */

import { v4 as uuidv4 } from 'uuid';
import { AgentCode, ConfidenceLevel, DataSource } from '../types/index.js';

/**
 * Audit log entry for routing decisions
 */
export interface RoutingAuditEntry {
  entry_id: string;
  timestamp: string;
  session_id: string;
  request_id: string;
  source_agent: AgentCode;
  target_agent: AgentCode;
  request_type: string;
  routing_confidence: ConfidenceLevel;
  routing_rationale?: string;
  user_intent_summary?: string;
  workflow_step: number;
  workflow_gate: number;
}

/**
 * Audit log entry for agent responses
 */
export interface ResponseAuditEntry {
  entry_id: string;
  timestamp: string;
  session_id: string;
  request_id: string;
  agent: AgentCode;
  status: 'success' | 'partial' | 'error';
  confidence: ConfidenceLevel;
  processing_time_ms: number;
  data_sources: DataSource[];
  error_code?: string;
  error_message?: string;
}

/**
 * Audit log entry for session events
 */
export interface SessionAuditEntry {
  entry_id: string;
  timestamp: string;
  session_id: string;
  event_type: 'created' | 'step_advanced' | 'gate_passed' | 'completed' | 'abandoned';
  workflow_step?: number;
  workflow_gate?: number;
  details?: Record<string, unknown>;
}

/**
 * Combined audit entry type
 */
export type AuditEntry = RoutingAuditEntry | ResponseAuditEntry | SessionAuditEntry;

/**
 * Audit storage interface for pluggable backends
 */
export interface AuditStorage {
  logRouting(entry: RoutingAuditEntry): Promise<void>;
  logResponse(entry: ResponseAuditEntry): Promise<void>;
  logSession(entry: SessionAuditEntry): Promise<void>;
  getRoutingLogs(sessionId: string): Promise<RoutingAuditEntry[]>;
  getResponseLogs(sessionId: string): Promise<ResponseAuditEntry[]>;
  getSessionLogs(sessionId: string): Promise<SessionAuditEntry[]>;
}

/**
 * In-memory audit storage for development/testing
 */
export class InMemoryAuditStorage implements AuditStorage {
  private routingLogs: RoutingAuditEntry[] = [];
  private responseLogs: ResponseAuditEntry[] = [];
  private sessionLogs: SessionAuditEntry[] = [];

  async logRouting(entry: RoutingAuditEntry): Promise<void> {
    this.routingLogs.push(entry);
  }

  async logResponse(entry: ResponseAuditEntry): Promise<void> {
    this.responseLogs.push(entry);
  }

  async logSession(entry: SessionAuditEntry): Promise<void> {
    this.sessionLogs.push(entry);
  }

  async getRoutingLogs(sessionId: string): Promise<RoutingAuditEntry[]> {
    return this.routingLogs.filter(log => log.session_id === sessionId);
  }

  async getResponseLogs(sessionId: string): Promise<ResponseAuditEntry[]> {
    return this.responseLogs.filter(log => log.session_id === sessionId);
  }

  async getSessionLogs(sessionId: string): Promise<SessionAuditEntry[]> {
    return this.sessionLogs.filter(log => log.session_id === sessionId);
  }

  getAllRoutingLogs(): RoutingAuditEntry[] {
    return [...this.routingLogs];
  }

  getAllResponseLogs(): ResponseAuditEntry[] {
    return [...this.responseLogs];
  }

  getAllSessionLogs(): SessionAuditEntry[] {
    return [...this.sessionLogs];
  }

  clear(): void {
    this.routingLogs = [];
    this.responseLogs = [];
    this.sessionLogs = [];
  }

  getStats(): {
    routingCount: number;
    responseCount: number;
    sessionCount: number;
  } {
    return {
      routingCount: this.routingLogs.length,
      responseCount: this.responseLogs.length,
      sessionCount: this.sessionLogs.length,
    };
  }
}

/**
 * Dataverse audit storage for production
 */
export class DataverseAuditStorage implements AuditStorage {
  private baseUrl: string;
  private accessToken: string;

  constructor(config: { baseUrl: string; accessToken: string }) {
    this.baseUrl = config.baseUrl;
    this.accessToken = config.accessToken;
  }

  async logRouting(entry: RoutingAuditEntry): Promise<void> {
    await this.postToDataverse('eap_routing_logs', {
      eap_entry_id: entry.entry_id,
      eap_session_id: entry.session_id,
      eap_request_id: entry.request_id,
      eap_source_agent: entry.source_agent,
      eap_target_agent: entry.target_agent,
      eap_request_type: entry.request_type,
      eap_routing_confidence: entry.routing_confidence,
      eap_routing_rationale: entry.routing_rationale,
      eap_user_intent: entry.user_intent_summary,
      eap_workflow_step: entry.workflow_step,
      eap_workflow_gate: entry.workflow_gate,
    });
  }

  async logResponse(entry: ResponseAuditEntry): Promise<void> {
    await this.postToDataverse('eap_response_logs', {
      eap_entry_id: entry.entry_id,
      eap_session_id: entry.session_id,
      eap_request_id: entry.request_id,
      eap_agent: entry.agent,
      eap_status: entry.status,
      eap_confidence: entry.confidence,
      eap_processing_time_ms: entry.processing_time_ms,
      eap_data_sources: JSON.stringify(entry.data_sources),
      eap_error_code: entry.error_code,
      eap_error_message: entry.error_message,
    });
  }

  async logSession(entry: SessionAuditEntry): Promise<void> {
    await this.postToDataverse('eap_session_logs', {
      eap_entry_id: entry.entry_id,
      eap_session_id: entry.session_id,
      eap_event_type: entry.event_type,
      eap_workflow_step: entry.workflow_step,
      eap_workflow_gate: entry.workflow_gate,
      eap_details: entry.details ? JSON.stringify(entry.details) : null,
    });
  }

  async getRoutingLogs(sessionId: string): Promise<RoutingAuditEntry[]> {
    const data = await this.queryDataverse(
      `eap_routing_logs?$filter=eap_session_id eq '${sessionId}'&$orderby=createdon asc`
    );
    return data.value.map(this.mapRoutingFromDataverse);
  }

  async getResponseLogs(sessionId: string): Promise<ResponseAuditEntry[]> {
    const data = await this.queryDataverse(
      `eap_response_logs?$filter=eap_session_id eq '${sessionId}'&$orderby=createdon asc`
    );
    return data.value.map(this.mapResponseFromDataverse);
  }

  async getSessionLogs(sessionId: string): Promise<SessionAuditEntry[]> {
    const data = await this.queryDataverse(
      `eap_session_logs?$filter=eap_session_id eq '${sessionId}'&$orderby=createdon asc`
    );
    return data.value.map(this.mapSessionFromDataverse);
  }

  private async postToDataverse(table: string, data: Record<string, unknown>): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/api/data/v9.2/${table}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to log to ${table}: ${response.statusText}`);
    }
  }

  private async queryDataverse(query: string): Promise<{ value: Record<string, unknown>[] }> {
    const response = await fetch(
      `${this.baseUrl}/api/data/v9.2/${query}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to query: ${response.statusText}`);
    }

    return response.json();
  }

  private mapRoutingFromDataverse(data: Record<string, unknown>): RoutingAuditEntry {
    return {
      entry_id: data.eap_entry_id as string,
      timestamp: data.createdon as string,
      session_id: data.eap_session_id as string,
      request_id: data.eap_request_id as string,
      source_agent: data.eap_source_agent as AgentCode,
      target_agent: data.eap_target_agent as AgentCode,
      request_type: data.eap_request_type as string,
      routing_confidence: data.eap_routing_confidence as ConfidenceLevel,
      routing_rationale: data.eap_routing_rationale as string | undefined,
      user_intent_summary: data.eap_user_intent as string | undefined,
      workflow_step: data.eap_workflow_step as number,
      workflow_gate: data.eap_workflow_gate as number,
    };
  }

  private mapResponseFromDataverse(data: Record<string, unknown>): ResponseAuditEntry {
    return {
      entry_id: data.eap_entry_id as string,
      timestamp: data.createdon as string,
      session_id: data.eap_session_id as string,
      request_id: data.eap_request_id as string,
      agent: data.eap_agent as AgentCode,
      status: data.eap_status as 'success' | 'partial' | 'error',
      confidence: data.eap_confidence as ConfidenceLevel,
      processing_time_ms: data.eap_processing_time_ms as number,
      data_sources: JSON.parse(data.eap_data_sources as string || '[]'),
      error_code: data.eap_error_code as string | undefined,
      error_message: data.eap_error_message as string | undefined,
    };
  }

  private mapSessionFromDataverse(data: Record<string, unknown>): SessionAuditEntry {
    return {
      entry_id: data.eap_entry_id as string,
      timestamp: data.createdon as string,
      session_id: data.eap_session_id as string,
      event_type: data.eap_event_type as SessionAuditEntry['event_type'],
      workflow_step: data.eap_workflow_step as number | undefined,
      workflow_gate: data.eap_workflow_gate as number | undefined,
      details: data.eap_details ? JSON.parse(data.eap_details as string) : undefined,
    };
  }
}

/**
 * Audit Logger - Main class for audit operations
 */
export class AuditLogger {
  private storage: AuditStorage;
  private verbose: boolean;

  constructor(storage: AuditStorage, options: { verbose?: boolean } = {}) {
    this.storage = storage;
    this.verbose = options.verbose || false;
  }

  /**
   * Log a routing decision
   */
  async logRouting(params: {
    sessionId: string;
    requestId: string;
    sourceAgent: AgentCode;
    targetAgent: AgentCode;
    requestType: string;
    confidence: ConfidenceLevel;
    rationale?: string;
    userIntent?: string;
    workflowStep: number;
    workflowGate: number;
  }): Promise<string> {
    const entryId = uuidv4();
    const entry: RoutingAuditEntry = {
      entry_id: entryId,
      timestamp: new Date().toISOString(),
      session_id: params.sessionId,
      request_id: params.requestId,
      source_agent: params.sourceAgent,
      target_agent: params.targetAgent,
      request_type: params.requestType,
      routing_confidence: params.confidence,
      routing_rationale: params.rationale,
      user_intent_summary: params.userIntent,
      workflow_step: params.workflowStep,
      workflow_gate: params.workflowGate,
    };

    await this.storage.logRouting(entry);

    if (this.verbose) {
      console.log(`[AUDIT:ROUTING] ${params.sourceAgent} -> ${params.targetAgent} (${params.requestType})`);
    }

    return entryId;
  }

  /**
   * Log an agent response
   */
  async logResponse(params: {
    sessionId: string;
    requestId: string;
    agent: AgentCode;
    status: 'success' | 'partial' | 'error';
    confidence: ConfidenceLevel;
    processingTimeMs: number;
    dataSources: DataSource[];
    errorCode?: string;
    errorMessage?: string;
  }): Promise<string> {
    const entryId = uuidv4();
    const entry: ResponseAuditEntry = {
      entry_id: entryId,
      timestamp: new Date().toISOString(),
      session_id: params.sessionId,
      request_id: params.requestId,
      agent: params.agent,
      status: params.status,
      confidence: params.confidence,
      processing_time_ms: params.processingTimeMs,
      data_sources: params.dataSources,
      error_code: params.errorCode,
      error_message: params.errorMessage,
    };

    await this.storage.logResponse(entry);

    if (this.verbose) {
      console.log(`[AUDIT:RESPONSE] ${params.agent} ${params.status} (${params.processingTimeMs}ms)`);
    }

    return entryId;
  }

  /**
   * Log a session event
   */
  async logSessionEvent(params: {
    sessionId: string;
    eventType: SessionAuditEntry['event_type'];
    workflowStep?: number;
    workflowGate?: number;
    details?: Record<string, unknown>;
  }): Promise<string> {
    const entryId = uuidv4();
    const entry: SessionAuditEntry = {
      entry_id: entryId,
      timestamp: new Date().toISOString(),
      session_id: params.sessionId,
      event_type: params.eventType,
      workflow_step: params.workflowStep,
      workflow_gate: params.workflowGate,
      details: params.details,
    };

    await this.storage.logSession(entry);

    if (this.verbose) {
      console.log(`[AUDIT:SESSION] ${params.sessionId} ${params.eventType}`);
    }

    return entryId;
  }

  /**
   * Get all audit logs for a session
   */
  async getSessionAuditTrail(sessionId: string): Promise<{
    routing: RoutingAuditEntry[];
    responses: ResponseAuditEntry[];
    sessions: SessionAuditEntry[];
  }> {
    const [routing, responses, sessions] = await Promise.all([
      this.storage.getRoutingLogs(sessionId),
      this.storage.getResponseLogs(sessionId),
      this.storage.getSessionLogs(sessionId),
    ]);

    return { routing, responses, sessions };
  }

  /**
   * Get routing metrics for a session
   */
  async getRoutingMetrics(sessionId: string): Promise<{
    totalRoutes: number;
    routesByAgent: Record<AgentCode, number>;
    averageConfidence: number;
    routesByConfidence: Record<ConfidenceLevel, number>;
  }> {
    const logs = await this.storage.getRoutingLogs(sessionId);

    const routesByAgent: Record<string, number> = {};
    const routesByConfidence: Record<string, number> = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    let confidenceSum = 0;

    for (const log of logs) {
      routesByAgent[log.target_agent] = (routesByAgent[log.target_agent] || 0) + 1;
      routesByConfidence[log.routing_confidence]++;
      confidenceSum += log.routing_confidence === 'HIGH' ? 1 : log.routing_confidence === 'MEDIUM' ? 0.5 : 0.25;
    }

    return {
      totalRoutes: logs.length,
      routesByAgent: routesByAgent as Record<AgentCode, number>,
      averageConfidence: logs.length > 0 ? confidenceSum / logs.length : 0,
      routesByConfidence: routesByConfidence as Record<ConfidenceLevel, number>,
    };
  }

  /**
   * Get response metrics for a session
   */
  async getResponseMetrics(sessionId: string): Promise<{
    totalResponses: number;
    successRate: number;
    averageProcessingTime: number;
    responsesByAgent: Record<AgentCode, { count: number; avgTime: number }>;
  }> {
    const logs = await this.storage.getResponseLogs(sessionId);

    const responsesByAgent: Record<string, { count: number; totalTime: number }> = {};
    let successCount = 0;
    let totalTime = 0;

    for (const log of logs) {
      if (log.status === 'success') successCount++;
      totalTime += log.processing_time_ms;

      if (!responsesByAgent[log.agent]) {
        responsesByAgent[log.agent] = { count: 0, totalTime: 0 };
      }
      responsesByAgent[log.agent].count++;
      responsesByAgent[log.agent].totalTime += log.processing_time_ms;
    }

    const formattedByAgent: Record<string, { count: number; avgTime: number }> = {};
    for (const [agent, data] of Object.entries(responsesByAgent)) {
      formattedByAgent[agent] = {
        count: data.count,
        avgTime: data.count > 0 ? data.totalTime / data.count : 0,
      };
    }

    return {
      totalResponses: logs.length,
      successRate: logs.length > 0 ? successCount / logs.length : 0,
      averageProcessingTime: logs.length > 0 ? totalTime / logs.length : 0,
      responsesByAgent: formattedByAgent as Record<AgentCode, { count: number; avgTime: number }>,
    };
  }

  /**
   * Set verbose mode
   */
  setVerbose(verbose: boolean): void {
    this.verbose = verbose;
  }
}

/**
 * Create an audit logger with in-memory storage (for dev/test)
 */
export function createInMemoryAuditLogger(options?: { verbose?: boolean }): AuditLogger {
  return new AuditLogger(new InMemoryAuditStorage(), options);
}

/**
 * Create an audit logger with Dataverse storage (for production)
 */
export function createDataverseAuditLogger(
  config: { baseUrl: string; accessToken: string },
  options?: { verbose?: boolean }
): AuditLogger {
  return new AuditLogger(new DataverseAuditStorage(config), options);
}
