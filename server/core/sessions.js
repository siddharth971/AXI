/**
 * AXI Conversation Sessions Manager
 * ----------------------------------
 * Manages multiple conversation sessions with titles

 */

class SessionsManager {
  constructor() {
    this.sessions = new Map(); // sessionId -> session data
    this.currentSessionId = null;
  }

  /**
   * Create a new session
   */
  createSession(title = null) {
    const sessionId = Date.now().toString();
    const session = {
      id: sessionId,
      title: title || 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };

    this.sessions.set(sessionId, session);
    this.currentSessionId = sessionId;

    return session;
  }

  /**
   * Get a session by ID
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  /**
   * Get current active session
   */
  getCurrentSession() {
    if (!this.currentSessionId || !this.sessions.has(this.currentSessionId)) {
      return this.createSession();
    }
    return this.sessions.get(this.currentSessionId);
  }

  /**
   * Set current session
   */
  setCurrentSession(sessionId) {
    if (this.sessions.has(sessionId)) {
      this.currentSessionId = sessionId;
      return true;
    }
    return false;
  }

  /**
   * Add message to a session
   */
  addMessage(sessionId, userInput, aiResponse) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.messages.push({
      userInput,
      aiResponse,
      timestamp: new Date().toISOString()
    });

    session.updatedAt = new Date().toISOString();

    // Auto-generate title from first message if still "New Conversation"
    if (session.title === 'New Conversation' && session.messages.length === 1) {
      session.title = this.generateTitle(userInput);
    }

    return true;
  }

  /**
   * Generate a title from user input
   */
  generateTitle(input) {
    // Take first 40 characters or first sentence
    const maxLength = 40;
    let title = input.trim();

    // Get first sentence
    const sentenceEnd = title.search(/[.!?]/);
    if (sentenceEnd !== -1) {
      title = title.substring(0, sentenceEnd);
    }

    // Truncate if too long
    if (title.length > maxLength) {
      title = title.substring(0, maxLength) + '...';
    }

    return title || 'New Conversation';
  }

  /**
   * Get all sessions (latest first)
   */
  getAllSessions() {
    const sessions = Array.from(this.sessions.values());
    return sessions.sort((a, b) =>
      new Date(b.updatedAt) - new Date(a.updatedAt)
    );
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId) {
    const deleted = this.sessions.delete(sessionId);

    // If we deleted the current session, reset to latest or create new
    if (deleted && this.currentSessionId === sessionId) {
      const allSessions = this.getAllSessions();
      if (allSessions.length > 0) {
        this.currentSessionId = allSessions[0].id;
      } else {
        this.currentSessionId = null;
      }
    }

    return deleted;
  }

  /**
   * Update session title
   */
  updateTitle(sessionId, title) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.title = title;
    session.updatedAt = new Date().toISOString();
    return true;
  }

  /**
   * Clear all sessions
   */
  clearAll() {
    this.sessions.clear();
    this.currentSessionId = null;
  }
}

// Singleton instance
module.exports = new SessionsManager();
