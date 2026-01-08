/**
 * Context Memory Manager
 * ----------------------
 * Manages conversation state, session memory, and contextual data.
 * Provides isolated context per session with TTL-based cleanup.
 */

"use strict";

const DEFAULT_CONTEXT_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_HISTORY_SIZE = 50;

class ContextMemory {
  constructor() {
    this._sessions = new Map();
    this._globalContext = {
      lastIntent: null,
      lastPlugin: null,
      lastResponse: null,
      timestamp: null
    };
  }

  /**
   * Get or create session context
   * @param {string} sessionId - Unique session identifier
   * @returns {Object} Session context
   */
  getSession(sessionId = "default") {
    if (!this._sessions.has(sessionId)) {
      this._sessions.set(sessionId, this._createSession(sessionId));
    }
    return this._sessions.get(sessionId);
  }

  /**
   * Create a new session context
   * @private
   */
  _createSession(sessionId) {
    return {
      id: sessionId,
      awaiting: null,
      awaitingData: null,
      history: [],
      variables: new Map(),
      createdAt: Date.now(),
      lastAccess: Date.now()
    };
  }

  /**
   * Set awaiting state for follow-up questions
   * @param {string} type - Type of response expected
   * @param {Object} data - Additional context data
   * @param {string} sessionId - Session identifier
   */
  setAwaiting(type, data = null, sessionId = "default") {
    const session = this.getSession(sessionId);
    session.awaiting = type;
    session.awaitingData = data;
    session.lastAccess = Date.now();
  }

  /**
   * Check if waiting for a response
   * @param {string} sessionId - Session identifier
   * @returns {Object|null} Awaiting state or null
   */
  getAwaiting(sessionId = "default") {
    const session = this.getSession(sessionId);
    if (!session.awaiting) return null;
    return {
      type: session.awaiting,
      data: session.awaitingData
    };
  }

  /**
   * Clear awaiting state
   * @param {string} sessionId - Session identifier
   */
  clearAwaiting(sessionId = "default") {
    const session = this.getSession(sessionId);
    session.awaiting = null;
    session.awaitingData = null;
  }

  /**
   * Add entry to conversation history
   * @param {Object} entry - History entry
   * @param {string} sessionId - Session identifier
   */
  addHistory(entry, sessionId = "default") {
    const session = this.getSession(sessionId);
    session.history.push({
      ...entry,
      timestamp: Date.now()
    });

    // Trim history if exceeded
    if (session.history.length > MAX_HISTORY_SIZE) {
      session.history = session.history.slice(-MAX_HISTORY_SIZE);
    }
    session.lastAccess = Date.now();
  }

  /**
   * Get conversation history
   * @param {number} limit - Number of entries to retrieve
   * @param {string} sessionId - Session identifier
   * @returns {Array} History entries
   */
  getHistory(limit = 10, sessionId = "default") {
    const session = this.getSession(sessionId);
    return session.history.slice(-limit);
  }

  /**
   * Set a session variable
   * @param {string} key - Variable key
   * @param {*} value - Variable value
   * @param {string} sessionId - Session identifier
   */
  setVariable(key, value, sessionId = "default") {
    const session = this.getSession(sessionId);
    session.variables.set(key, value);
    session.lastAccess = Date.now();
  }

  /**
   * Get a session variable
   * @param {string} key - Variable key
   * @param {string} sessionId - Session identifier
   * @returns {*} Variable value or undefined
   */
  getVariable(key, sessionId = "default") {
    const session = this.getSession(sessionId);
    return session.variables.get(key);
  }

  /**
   * Update global context after execution
   * @param {Object} data - Context update data
   */
  updateGlobalContext(data) {
    this._globalContext = {
      ...this._globalContext,
      ...data,
      timestamp: Date.now()
    };
  }

  /**
   * Get global context
   * @returns {Object} Global context
   */
  getGlobalContext() {
    return { ...this._globalContext };
  }

  /**
   * Clean up stale sessions
   * @param {number} ttl - Time-to-live in milliseconds
   */
  cleanup(ttl = DEFAULT_CONTEXT_TTL) {
    const now = Date.now();
    for (const [sessionId, session] of this._sessions) {
      if (now - session.lastAccess > ttl) {
        this._sessions.delete(sessionId);
      }
    }
  }

  /**
   * Destroy a specific session
   * @param {string} sessionId - Session identifier
   */
  destroySession(sessionId) {
    this._sessions.delete(sessionId);
  }

  /**
   * Get all active session IDs
   * @returns {Array<string>} Session IDs
   */
  getActiveSessions() {
    return Array.from(this._sessions.keys());
  }
}

// Singleton instance
const memory = new ContextMemory();

module.exports = {
  ContextMemory,
  memory,

  // Convenience exports for backward compatibility
  setAwaiting: (type, data, sessionId) => memory.setAwaiting(type, data, sessionId),
  getAwaiting: (sessionId) => memory.getAwaiting(sessionId),
  clearAwaiting: (sessionId) => memory.clearAwaiting(sessionId),
  addHistory: (entry, sessionId) => memory.addHistory(entry, sessionId),
  getHistory: (limit, sessionId) => memory.getHistory(limit, sessionId),
  setVariable: (key, value, sessionId) => memory.setVariable(key, value, sessionId),
  getVariable: (key, sessionId) => memory.getVariable(key, sessionId)
};
