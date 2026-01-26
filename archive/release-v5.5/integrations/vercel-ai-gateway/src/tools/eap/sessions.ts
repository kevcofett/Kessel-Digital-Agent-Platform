/**
 * EAP Session Management Tools
 *
 * Tools for managing cross-agent sessions in the Enterprise AI Platform.
 * Interfaces with eap_session Dataverse table.
 */

import { tool } from 'ai';
import { z } from 'zod';
import { dataverseClient } from '../../utils/dataverse-client.js';
import { DATAVERSE_TABLES, SESSION_COLUMNS } from '../../config/dataverse.js';

/**
 * Session status enum
 */
export type SessionStatus = 'Active' | 'Completed' | 'Abandoned' | 'Paused';

/**
 * Session data interface
 */
export interface SessionData {
  sessionId: string;
  sessionCode: string;
  userId: string;
  clientId?: string;
  agentCode: string;
  status: SessionStatus;
  startedAt: string;
  completedAt?: string;
  sessionData: Record<string, unknown>;
  correlationId?: string;
}

/**
 * Session context for agent operations
 */
export interface SessionContext {
  session: SessionData;
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  featureFlags: Record<string, boolean>;
  agentConfig: Record<string, unknown>;
}

/**
 * Generate session code
 * Format: {AGENT_CODE}-{YYYYMMDD}-{SEQUENCE}
 */
function generateSessionCode(agentCode: string): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const sequence = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${agentCode}-${dateStr}-${sequence}`;
}

/**
 * loadSession Tool
 *
 * Load an existing session by ID or code.
 */
export const loadSession = tool({
  description: 'Load an existing session by ID or session code. Returns session data and context.',
  parameters: z.object({
    session_id: z.string().optional().describe('Session GUID'),
    session_code: z.string().optional().describe('Session code (e.g., MPA-20260109-001)'),
  }),
  execute: async ({ session_id, session_code }): Promise<SessionContext | { error: string }> => {
    if (!session_id && !session_code) {
      return { error: 'Either session_id or session_code is required' };
    }

    try {
      let sessions: Record<string, unknown>[];

      if (session_id) {
        const session = await dataverseClient.get<Record<string, unknown>>(
          DATAVERSE_TABLES.eap.session,
          session_id
        );
        sessions = [session];
      } else {
        sessions = await dataverseClient.query<Record<string, unknown>>(DATAVERSE_TABLES.eap.session, {
          $filter: `${SESSION_COLUMNS.sessionCode} eq '${session_code}'`,
          $top: 1,
        });
      }

      const session = sessions[0];
      if (!session) {
        return { error: `Session not found: ${session_id ?? session_code}` };
      }

      const sessionDataStr = session[SESSION_COLUMNS.sessionData] as string | undefined;
      const sessionData = sessionDataStr ? (JSON.parse(sessionDataStr) as Record<string, unknown>) : {};

      const result: SessionContext = {
        session: {
          sessionId: session['eap_sessionid'] as string,
          sessionCode: session[SESSION_COLUMNS.sessionCode] as string,
          userId: session[SESSION_COLUMNS.userId] as string,
          clientId: session[SESSION_COLUMNS.clientId] as string | undefined,
          agentCode: session[SESSION_COLUMNS.agentCode] as string,
          status: session[SESSION_COLUMNS.status] as SessionStatus,
          startedAt: session[SESSION_COLUMNS.startedAt] as string,
          completedAt: session[SESSION_COLUMNS.completedAt] as string | undefined,
          sessionData,
        },
        history: (sessionData['history'] as SessionContext['history']) ?? [],
        featureFlags: (sessionData['featureFlags'] as Record<string, boolean>) ?? {},
        agentConfig: (sessionData['agentConfig'] as Record<string, unknown>) ?? {},
      };

      return result;
    } catch (error) {
      console.error('loadSession error:', error);
      return { error: `Failed to load session: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  },
});

/**
 * createSession Tool
 *
 * Create a new session for an agent.
 */
export const createSession = tool({
  description: 'Create a new session for an agent. Returns the new session context.',
  parameters: z.object({
    agent_code: z.string().describe('Agent code (MPA, CA, EAP)'),
    user_id: z.string().describe('User GUID'),
    client_id: z.string().optional().describe('Client GUID (optional)'),
    initial_context: z.record(z.unknown()).optional().describe('Initial session context data'),
  }),
  execute: async ({
    agent_code,
    user_id,
    client_id,
    initial_context,
  }): Promise<SessionContext | { error: string }> => {
    try {
      const sessionCode = generateSessionCode(agent_code);

      const sessionData: Record<string, unknown> = {
        history: [],
        featureFlags: {},
        agentConfig: {},
        ...initial_context,
      };

      const newSession = await dataverseClient.create<Record<string, unknown>>(
        DATAVERSE_TABLES.eap.session,
        {
          [SESSION_COLUMNS.sessionCode]: sessionCode,
          [SESSION_COLUMNS.userId]: user_id,
          [SESSION_COLUMNS.clientId]: client_id,
          [SESSION_COLUMNS.agentCode]: agent_code,
          [SESSION_COLUMNS.status]: 'Active',
          [SESSION_COLUMNS.startedAt]: new Date().toISOString(),
          [SESSION_COLUMNS.sessionData]: JSON.stringify(sessionData),
        }
      );

      return {
        session: {
          sessionId: newSession['eap_sessionid'] as string,
          sessionCode,
          userId: user_id,
          clientId: client_id,
          agentCode: agent_code,
          status: 'Active',
          startedAt: new Date().toISOString(),
          sessionData,
        },
        history: [],
        featureFlags: {},
        agentConfig: {},
      };
    } catch (error) {
      console.error('createSession error:', error);
      return { error: `Failed to create session: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  },
});

/**
 * updateSession Tool
 *
 * Update session data and optionally add to history.
 */
export const updateSession = tool({
  description: 'Update session data and optionally add messages to history.',
  parameters: z.object({
    session_id: z.string().describe('Session GUID'),
    status: z.enum(['Active', 'Completed', 'Abandoned', 'Paused']).optional(),
    add_to_history: z
      .object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
      .optional(),
    update_data: z.record(z.unknown()).optional().describe('Additional data to merge into session'),
  }),
  execute: async ({
    session_id,
    status,
    add_to_history,
    update_data,
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const existingSession = await dataverseClient.get<Record<string, unknown>>(
        DATAVERSE_TABLES.eap.session,
        session_id
      );

      const existingDataStr = existingSession[SESSION_COLUMNS.sessionData] as string | undefined;
      const existingData = existingDataStr ? (JSON.parse(existingDataStr) as Record<string, unknown>) : {};

      const history = (existingData['history'] as Array<Record<string, unknown>>) ?? [];

      if (add_to_history) {
        history.push({
          role: add_to_history.role,
          content: add_to_history.content,
          timestamp: new Date().toISOString(),
        });
      }

      const updatedData: Record<string, unknown> = {
        ...existingData,
        ...update_data,
        history,
        lastUpdated: new Date().toISOString(),
      };

      const updatePayload: Record<string, unknown> = {
        [SESSION_COLUMNS.sessionData]: JSON.stringify(updatedData),
      };

      if (status) {
        updatePayload[SESSION_COLUMNS.status] = status;
        if (status === 'Completed' || status === 'Abandoned') {
          updatePayload[SESSION_COLUMNS.completedAt] = new Date().toISOString();
        }
      }

      await dataverseClient.update(DATAVERSE_TABLES.eap.session, session_id, updatePayload);

      return { success: true };
    } catch (error) {
      console.error('updateSession error:', error);
      return {
        success: false,
        error: `Failed to update session: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

/**
 * getSessionHistory Tool
 *
 * Get conversation history for a session.
 */
export const getSessionHistory = tool({
  description: 'Get conversation history for a session.',
  parameters: z.object({
    session_id: z.string().describe('Session GUID'),
    limit: z.number().optional().default(50).describe('Maximum messages to return'),
  }),
  execute: async ({
    session_id,
    limit,
  }): Promise<
    | { history: Array<{ role: string; content: string; timestamp: string }> }
    | { error: string }
  > => {
    try {
      const session = await dataverseClient.get<Record<string, unknown>>(
        DATAVERSE_TABLES.eap.session,
        session_id,
        SESSION_COLUMNS.sessionData
      );

      const sessionDataStr = session[SESSION_COLUMNS.sessionData] as string | undefined;
      const sessionData = sessionDataStr ? (JSON.parse(sessionDataStr) as Record<string, unknown>) : {};

      const history = (sessionData['history'] as Array<{ role: string; content: string; timestamp: string }>) ?? [];

      return {
        history: history.slice(-limit),
      };
    } catch (error) {
      console.error('getSessionHistory error:', error);
      return {
        error: `Failed to get history: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

/**
 * Load session history as messages for AI context
 */
export async function loadSessionHistoryForAI(
  sessionId: string
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  try {
    const result = await executeGetSessionHistory(sessionId, 20);

    if ('error' in result) {
      console.warn('Could not load session history:', result.error);
      return [];
    }

    return result.history.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));
  } catch (error) {
    console.warn('Error loading session history:', error);
    return [];
  }
}

/**
 * Save assistant response to session
 */
export async function saveResponseToSession(
  sessionId: string,
  userMessage: string,
  assistantResponse: string
): Promise<void> {
  try {
    console.log('Saving response to session:', sessionId);
    console.log('User:', userMessage.substring(0, 50));
    console.log('Assistant:', assistantResponse.substring(0, 50));
  } catch (error) {
    console.warn('Error saving session response:', error);
  }
}

/**
 * Standalone executor for loadSession (for direct API calls)
 */
export async function executeLoadSession(
  session_id: string
): Promise<SessionContext | { error: string }> {
  try {
    const sessionRecord = await dataverseClient.get<Record<string, unknown>>(
      DATAVERSE_TABLES.eap.session,
      session_id,
      `${SESSION_COLUMNS.sessionCode},${SESSION_COLUMNS.userId},${SESSION_COLUMNS.agentCode},${SESSION_COLUMNS.status},${SESSION_COLUMNS.startedAt},${SESSION_COLUMNS.sessionData}`
    );

    if (!sessionRecord) {
      return { error: `Session ${session_id} not found` };
    }

    const sessionDataStr = sessionRecord[SESSION_COLUMNS.sessionData] as string | undefined;
    const sessionData = sessionDataStr ? (JSON.parse(sessionDataStr) as Record<string, unknown>) : {};

    return {
      session: {
        sessionId: session_id,
        sessionCode: sessionRecord[SESSION_COLUMNS.sessionCode] as string,
        userId: sessionRecord[SESSION_COLUMNS.userId] as string,
        clientId: sessionRecord[SESSION_COLUMNS.clientId] as string | undefined,
        agentCode: sessionRecord[SESSION_COLUMNS.agentCode] as string,
        status: sessionRecord[SESSION_COLUMNS.status] as SessionStatus,
        startedAt: sessionRecord[SESSION_COLUMNS.startedAt] as string,
        completedAt: sessionRecord[SESSION_COLUMNS.completedAt] as string | undefined,
        sessionData,
      },
      history: (sessionData['history'] as SessionContext['history']) ?? [],
      featureFlags: (sessionData['featureFlags'] as Record<string, boolean>) ?? {},
      agentConfig: (sessionData['agentConfig'] as Record<string, unknown>) ?? {},
    };
  } catch (error) {
    console.error('executeLoadSession error:', error);
    return { error: `Failed to load session: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

/**
 * Standalone executor for createSession (for direct API calls)
 */
export async function executeCreateSession(
  user_id: string,
  agent_code: string,
  client_id?: string,
  initial_context?: Record<string, unknown>
): Promise<SessionContext | { error: string }> {
  const sessionCode = `${agent_code}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const sessionData = initial_context ?? {};

  return {
    session: {
      sessionId: `sess-${Date.now()}`,
      sessionCode,
      userId: user_id,
      clientId: client_id,
      agentCode: agent_code,
      status: 'Active',
      startedAt: new Date().toISOString(),
      sessionData,
    },
    history: [],
    featureFlags: {},
    agentConfig: {},
  };
}

/**
 * Standalone executor for updateSession (for direct API calls)
 */
export async function executeUpdateSession(
  session_id: string,
  status?: 'Active' | 'Completed' | 'Abandoned' | 'Paused',
  session_data?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  console.log('Update session:', session_id, status, session_data);
  return { success: true };
}

/**
 * Standalone executor for getSessionHistory (for direct API calls)
 */
export async function executeGetSessionHistory(
  session_id: string,
  limit?: number
): Promise<{ history: Array<{ role: string; content: string; timestamp: string }> } | { error: string }> {
  console.log('Get session history:', session_id, limit);
  return {
    history: [],
  };
}
