/**
 * AXI Conversation Context Manager
 * ----------------------------------
 * Manages conversation state and flow.
 * Enables multi-turn conversations and contextual responses.
 * 
 * Usage:
 *   context.setAwaiting("ask_website_name");
 *   context.get("awaiting"); // "ask_website_name"
 *   context.clearAwaiting();
 */

class ConversationContext {
  constructor() {
    this.state = {
      lastIntent: null,
      lastInput: null,
      awaiting: null,
      data: null,
      history: [] // Keep last N exchanges
    };

    this.MAX_HISTORY = 10;
  }

  set(key, value) {
    this.state[key] = value;
  }

  get(key) {
    return this.state[key];
  }

  setAwaiting(type, data = null) {
    this.state.awaiting = type;
    this.state.data = data;
  }

  clearAwaiting() {
    this.state.awaiting = null;
    this.state.data = null;
  }

  addToHistory(input, intent, reply) {
    this.state.history.push({
      timestamp: new Date().toISOString(),
      input,
      intent,
      reply
    });

    // Keep only last N
    if (this.state.history.length > this.MAX_HISTORY) {
      this.state.history.shift();
    }
  }

  getHistory() {
    return this.state.history;
  }

  getLastExchange() {
    return this.state.history[this.state.history.length - 1] || null;
  }

  reset() {
    this.state = {
      lastIntent: null,
      lastInput: null,
      awaiting: null,
      data: null,
      history: []
    };
  }
}

// Singleton instance
module.exports = new ConversationContext();
