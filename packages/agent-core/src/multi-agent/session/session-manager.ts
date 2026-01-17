/**
 * Multi-Agent Architecture - Session Manager
 *
 * Provides shared session management for the multi-agent system.
 * Handles session state persistence, retrieval, and updates across agents.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  SessionContext,
  SessionType,
  PlanState,
  getGateForStep,
} from '../types/index.js';

/**
 * Session storage interface for pluggable backends
 */
export interface SessionStorage {
  get(sessionId: string): Promise<SessionContext | null>;
  set(sessionId: string, context: SessionContext): Promise<void>;
  update(sessionId: string, updates: Partial<SessionContext>): Promise<SessionContext>;
  delete(sessionId: string): Promise<void>;
  exists(sessionId: string): Promise<boolean>;
}

/**
 * In-memory session storage for development/testing
 */
export class InMemorySessionStorage implements SessionStorage {
  private sessions: Map<string, SessionContext> = new Map();

  async get(sessionId: string): Promise<SessionContext | null> {
    return this.sessions.get(sessionId) || null;
  }

  async set(sessionId: string, context: SessionContext): Promise<void> {
    this.sessions.set(sessionId, context);
  }

  async update(sessionId: string, updates: Partial<SessionContext>): Promise<SessionContext> {
    const existing = this.sessions.get(sessionId);
    if (!existing) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    const updated: SessionContext = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.sessions.set(sessionId, updated);
    return updated;
  }

  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async exists(sessionId: string): Promise<boolean> {
    return this.sessions.has(sessionId);
  }

  clear(): void {
    this.sessions.clear();
  }

  size(): number {
    return this.sessions.size;
  }
}

/**
 * Dataverse session storage for production
 */
export class DataverseSessionStorage implements SessionStorage {
  private baseUrl: string;
  private accessToken: string;

  constructor(config: { baseUrl: string; accessToken: string }) {
    this.baseUrl = config.baseUrl;
    this.accessToken = config.accessToken;
  }

  async get(sessionId: string): Promise<SessionContext | null> {
    const response = await fetch(
      `${this.baseUrl}/api/data/v9.2/eap_sessions(${sessionId})`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to get session: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapDataverseToContext(data);
  }

  async set(sessionId: string, context: SessionContext): Promise<void> {
    const body = this.mapContextToDataverse(context);

    const response = await fetch(
      `${this.baseUrl}/api/data/v9.2/eap_sessions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`);
    }
  }

  async update(sessionId: string, updates: Partial<SessionContext>): Promise<SessionContext> {
    const existing = await this.get(sessionId);
    if (!existing) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const updated: SessionContext = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const body = this.mapContextToDataverse(updated);

    const response = await fetch(
      `${this.baseUrl}/api/data/v9.2/eap_sessions(${sessionId})`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update session: ${response.statusText}`);
    }

    return updated;
  }

  async delete(sessionId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/api/data/v9.2/eap_sessions(${sessionId})`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete session: ${response.statusText}`);
    }
  }

  async exists(sessionId: string): Promise<boolean> {
    const session = await this.get(sessionId);
    return session !== null;
  }

  private mapDataverseToContext(data: Record<string, unknown>): SessionContext {
    return {
      session_id: data.eap_sessionid as string,
      workflow_step: data.eap_workflow_step as number,
      workflow_gate: data.eap_workflow_gate as number,
      session_type: data.eap_session_type as SessionType,
      plan_state: JSON.parse(data.eap_plan_state as string || '{}'),
      created_at: data.createdon as string,
      updated_at: data.modifiedon as string,
      conversation_history_summary: data.eap_conversation_summary as string | undefined,
    };
  }

  private mapContextToDataverse(context: SessionContext): Record<string, unknown> {
    return {
      eap_sessionid: context.session_id,
      eap_workflow_step: context.workflow_step,
      eap_workflow_gate: context.workflow_gate,
      eap_session_type: context.session_type,
      eap_plan_state: JSON.stringify(context.plan_state),
      eap_conversation_summary: context.conversation_history_summary,
    };
  }
}

/**
 * Session Manager - Main class for session operations
 */
export class SessionManager {
  private storage: SessionStorage;

  constructor(storage: SessionStorage) {
    this.storage = storage;
  }

  /**
   * Create a new session
   */
  async createSession(options: {
    sessionType?: SessionType;
    initialPlanState?: Partial<PlanState>;
  } = {}): Promise<SessionContext> {
    const now = new Date().toISOString();
    const sessionId = uuidv4();

    const context: SessionContext = {
      session_id: sessionId,
      workflow_step: 1,
      workflow_gate: 0,
      session_type: options.sessionType || 'Planning',
      plan_state: (options.initialPlanState || {}) as PlanState,
      created_at: now,
      updated_at: now,
    };

    await this.storage.set(sessionId, context);
    return context;
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<SessionContext | null> {
    return this.storage.get(sessionId);
  }

  /**
   * Get session or throw if not found
   */
  async getSessionOrThrow(sessionId: string): Promise<SessionContext> {
    const session = await this.storage.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    return session;
  }

  /**
   * Update session plan state
   */
  async updatePlanState(
    sessionId: string,
    planStateUpdates: Partial<PlanState>
  ): Promise<SessionContext> {
    const session = await this.getSessionOrThrow(sessionId);

    const updatedPlanState: PlanState = {
      ...session.plan_state,
      ...planStateUpdates,
    };

    return this.storage.update(sessionId, {
      plan_state: updatedPlanState,
    });
  }

  /**
   * Advance to next workflow step
   */
  async advanceStep(sessionId: string): Promise<SessionContext> {
    const session = await this.getSessionOrThrow(sessionId);

    const nextStep = Math.min(session.workflow_step + 1, 10);
    const nextGate = getGateForStep(nextStep);

    return this.storage.update(sessionId, {
      workflow_step: nextStep,
      workflow_gate: nextGate,
    });
  }

  /**
   * Set workflow step explicitly
   */
  async setStep(sessionId: string, step: number): Promise<SessionContext> {
    if (step < 1 || step > 10) {
      throw new Error(`Invalid step: ${step}. Must be between 1 and 10.`);
    }

    const gate = getGateForStep(step);

    return this.storage.update(sessionId, {
      workflow_step: step,
      workflow_gate: gate,
    });
  }

  /**
   * Update conversation summary
   */
  async updateConversationSummary(
    sessionId: string,
    summary: string
  ): Promise<SessionContext> {
    return this.storage.update(sessionId, {
      conversation_history_summary: summary,
    });
  }

  /**
   * Change session type
   */
  async changeSessionType(
    sessionId: string,
    sessionType: SessionType
  ): Promise<SessionContext> {
    return this.storage.update(sessionId, {
      session_type: sessionType,
    });
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.storage.delete(sessionId);
  }

  /**
   * Check if session exists
   */
  async sessionExists(sessionId: string): Promise<boolean> {
    return this.storage.exists(sessionId);
  }

  /**
   * Get session summary for logging/debugging
   */
  async getSessionSummary(sessionId: string): Promise<{
    sessionId: string;
    step: number;
    gate: number;
    type: SessionType;
    planStateKeys: string[];
  } | null> {
    const session = await this.storage.get(sessionId);
    if (!session) {
      return null;
    }

    return {
      sessionId: session.session_id,
      step: session.workflow_step,
      gate: session.workflow_gate,
      type: session.session_type,
      planStateKeys: Object.keys(session.plan_state).filter(
        key => session.plan_state[key as keyof PlanState] !== undefined
      ),
    };
  }
}

/**
 * Create a session manager with in-memory storage (for dev/test)
 */
export function createInMemorySessionManager(): SessionManager {
  return new SessionManager(new InMemorySessionStorage());
}

/**
 * Create a session manager with Dataverse storage (for production)
 */
export function createDataverseSessionManager(config: {
  baseUrl: string;
  accessToken: string;
}): SessionManager {
  return new SessionManager(new DataverseSessionStorage(config));
}
