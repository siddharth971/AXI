/**
 * AXI Context Store
 * -------------------
 * Short-term memory for conversational continuity.
 * Stores recent intents, entities, and enables pronoun resolution.
 * 
 * Features:
 * 1. Store last 5 interactions (intent + entities + timestamp)
 * 2. Pronoun resolution ("it", "that", "again", "next one")
 * 3. Follow-up detection ("louder" after "play" → volume_up)
 * 4. TTL-based cleanup (5 minute timeout)
 * 
 * Note: This is SESSION-based short-term memory, not persistent storage.
 */

"use strict";

const { logger } = require("../utils");

// Configuration
const CONFIG = {
  MAX_HISTORY: 5,           // Maximum interactions to remember
  TTL_MS: 5 * 60 * 1000,    // 5 minutes TTL for context
  CLEANUP_INTERVAL: 60000   // Cleanup every minute
};

// Pronoun mappings to entity types
const PRONOUN_MAPPINGS = {
  "it": ["app", "file", "folder", "website", "song", "video"],
  "that": ["app", "file", "folder", "website", "song", "video", "result"],
  "them": ["files", "items", "results"],
  "this": ["current", "active"],
  "there": ["location", "folder", "directory"]
};

// Follow-up patterns: [trigger_word] → [implied_intent if context matches]
const FOLLOWUP_PATTERNS = {
  // Volume adjustments after media
  "louder": { requires: ["play", "music", "video"], maps_to: "volume_up" },
  "quieter": { requires: ["play", "music", "video"], maps_to: "volume_down" },
  "softer": { requires: ["play", "music", "video"], maps_to: "volume_down" },
  
  // Media controls after play
  "stop": { requires: ["play"], maps_to: "pause" },
  "again": { requires: ["*"], maps_to: "repeat_last" },
  "next": { requires: ["play", "music", "video"], maps_to: "next" },
  "previous": { requires: ["play", "music", "video"], maps_to: "previous" },
  
  // Continuation
  "more": { requires: ["list_files", "search"], maps_to: "continue" },
  "yes": { requires: ["confirm"], maps_to: "confirm_yes" },
  "no": { requires: ["confirm"], maps_to: "confirm_no" }
};

// Context store (session-based)
const store = {
  history: [],               // Array of recent interactions
  lastIntent: null,          // Most recent intent
  lastEntities: {},          // Most recent entities
  lastInput: null,           // Most recent user input
  lastTimestamp: null,       // Timestamp of last interaction
  awaitingConfirmation: null, // Pending confirmation context
  sessionId: null            // Current session ID
};

/**
 * Context Store Module
 */
const ContextStore = {
  /**
   * Push a new interaction to the context history
   * 
   * @param {Object} interaction - The interaction to store
   * @param {string} interaction.intent - The detected intent
   * @param {Object} interaction.entities - Extracted entities
   * @param {string} interaction.input - Original user input
   * @param {string} interaction.response - System response
   */
  push(interaction) {
    const entry = {
      intent: interaction.intent,
      entities: interaction.entities || {},
      input: interaction.input,
      response: interaction.response,
      timestamp: Date.now()
    };

    // Add to history
    store.history.unshift(entry);

    // Keep only MAX_HISTORY items
    if (store.history.length > CONFIG.MAX_HISTORY) {
      store.history = store.history.slice(0, CONFIG.MAX_HISTORY);
    }

    // Update quick-access fields
    store.lastIntent = entry.intent;
    store.lastEntities = entry.entities;
    store.lastInput = entry.input;
    store.lastTimestamp = entry.timestamp;

    logger.debug && logger.debug(`Context updated: ${entry.intent}`);
  },

  /**
   * Get recent context entries
   * 
   * @param {number} n - Number of entries to retrieve
   * @returns {Array} Recent interactions
   */
  getRecent(n = 3) {
    return store.history.slice(0, Math.min(n, store.history.length));
  },

  /**
   * Get the last intent
   * @returns {string|null}
   */
  getLastIntent() {
    return store.lastIntent;
  },

  /**
   * Get the last entities
   * @returns {Object}
   */
  getLastEntities() {
    return store.lastEntities || {};
  },

  /**
   * Resolve pronouns in user input using context
   * 
   * @param {string} text - User input
   * @returns {Object} Resolution result { resolved: boolean, text: string, reference: string }
   */
  resolvePronoun(text) {
    if (!text || !store.lastEntities) {
      return { resolved: false, text, reference: null };
    }

    const lowerText = text.toLowerCase();
    
    // Check for pronoun patterns
    const pronounPatterns = [
      { pattern: /\bopen it\b/i, replacement: "open {entity}" },
      { pattern: /\bplay it\b/i, replacement: "play {entity}" },
      { pattern: /\bclose it\b/i, replacement: "close {entity}" },
      { pattern: /\bdelete it\b/i, replacement: "delete {entity}" },
      { pattern: /\bdo it again\b/i, replacement: "{lastInput}" },
      { pattern: /\bagain\b/i, replacement: "{lastInput}" },
      { pattern: /\bthat one\b/i, replacement: "{entity}" },
      { pattern: /\bthe same\b/i, replacement: "{entity}" }
    ];

    for (const { pattern, replacement } of pronounPatterns) {
      if (pattern.test(lowerText)) {
        // Find the most relevant entity from context
        const entity = this.findRelevantEntity();
        
        if (replacement === "{lastInput}" && store.lastInput) {
          return {
            resolved: true,
            text: store.lastInput,
            reference: "last_input",
            original: text
          };
        }
        
        if (entity) {
          const resolvedText = text.replace(pattern, replacement.replace("{entity}", entity));
          return {
            resolved: true,
            text: resolvedText,
            reference: entity,
            original: text
          };
        }
      }
    }

    return { resolved: false, text, reference: null };
  },

  /**
   * Find the most relevant entity from recent context
   * @returns {string|null}
   */
  findRelevantEntity() {
    const entities = store.lastEntities;
    
    // Priority order for entity resolution
    const priorityKeys = [
      "app", "appName", "website", "file", "folder",
      "song", "video", "query", "searchQuery", "name"
    ];

    for (const key of priorityKeys) {
      if (entities[key]) {
        return entities[key];
      }
    }

    // Check in recent history
    for (const entry of store.history) {
      for (const key of priorityKeys) {
        if (entry.entities && entry.entities[key]) {
          return entry.entities[key];
        }
      }
    }

    return null;
  },

  /**
   * Detect if input is a follow-up command (e.g., "louder" after "play music")
   * 
   * @param {string} text - User input
   * @returns {Object|null} Follow-up result { intent, confidence, reason }
   */
  detectFollowUp(text) {
    if (!text || !store.lastIntent) {
      return null;
    }

    const lowerText = text.toLowerCase().trim();
    
    // Check against follow-up patterns
    for (const [trigger, config] of Object.entries(FOLLOWUP_PATTERNS)) {
      if (lowerText.includes(trigger) || lowerText === trigger) {
        // Check if context matches requirements
        const contextMatches = config.requires.includes("*") ||
          config.requires.some(req => 
            store.lastIntent && store.lastIntent.includes(req)
          );

        if (contextMatches) {
          return {
            intent: config.maps_to,
            confidence: 0.85,
            reason: `Follow-up from "${store.lastIntent}"`,
            trigger
          };
        }
      }
    }

    return null;
  },

  /**
   * Set confirmation context (for confirm/deny follow-ups)
   * 
   * @param {Object} context - Confirmation context
   */
  setAwaitingConfirmation(context) {
    store.awaitingConfirmation = {
      ...context,
      timestamp: Date.now()
    };
  },

  /**
   * Get and clear confirmation context
   * @returns {Object|null}
   */
  getAndClearConfirmation() {
    const confirmation = store.awaitingConfirmation;
    store.awaitingConfirmation = null;
    return confirmation;
  },

  /**
   * Check if we're awaiting confirmation
   * @returns {boolean}
   */
  isAwaitingConfirmation() {
    if (!store.awaitingConfirmation) return false;
    
    // Check if confirmation has expired (30 seconds)
    const age = Date.now() - store.awaitingConfirmation.timestamp;
    if (age > 30000) {
      store.awaitingConfirmation = null;
      return false;
    }
    
    return true;
  },

  /**
   * Generate clarification options based on context
   * 
   * @param {string} ambiguousInput - The ambiguous user input
   * @returns {Object} Clarification result
   */
  generateClarification(ambiguousInput) {
    const options = [];

    // Add recent intents as options
    const recentIntents = [...new Set(store.history.map(h => h.intent))].slice(0, 3);
    for (const intent of recentIntents) {
      options.push({
        intent,
        label: this.intentToLabel(intent)
      });
    }

    // Add common actions
    if (options.length < 3) {
      const common = ["open_youtube", "play", "tell_time"];
      for (const c of common) {
        if (!options.find(o => o.intent === c)) {
          options.push({ intent: c, label: this.intentToLabel(c) });
        }
      }
    }

    return {
      message: "I'm not sure what you mean. Did you want to:",
      options: options.slice(0, 4),
      original: ambiguousInput
    };
  },

  /**
   * Convert intent name to human-readable label
   */
  intentToLabel(intent) {
    const labels = {
      open_youtube: "Open YouTube",
      open_website: "Open a website",
      play: "Play music",
      pause: "Pause playback",
      volume_up: "Increase volume",
      volume_down: "Decrease volume",
      search_youtube: "Search YouTube",
      tell_time: "Tell the time",
      list_files: "List files",
      create_folder: "Create a folder"
    };
    return labels[intent] || intent.replace(/_/g, " ");
  },

  /**
   * Cleanup old entries (called periodically)
   */
  cleanup() {
    const now = Date.now();
    const cutoff = now - CONFIG.TTL_MS;

    // Remove expired entries
    store.history = store.history.filter(entry => entry.timestamp > cutoff);

    // Clear last fields if expired
    if (store.lastTimestamp && store.lastTimestamp < cutoff) {
      store.lastIntent = null;
      store.lastEntities = {};
      store.lastInput = null;
      store.lastTimestamp = null;
    }

    // Clear expired confirmation
    if (store.awaitingConfirmation && store.awaitingConfirmation.timestamp < cutoff) {
      store.awaitingConfirmation = null;
    }
  },

  /**
   * Clear all context (new session)
   */
  clear() {
    store.history = [];
    store.lastIntent = null;
    store.lastEntities = {};
    store.lastInput = null;
    store.lastTimestamp = null;
    store.awaitingConfirmation = null;
  },

  /**
   * Get full context state (for debugging)
   */
  getState() {
    return {
      historyLength: store.history.length,
      lastIntent: store.lastIntent,
      lastEntities: store.lastEntities,
      lastInput: store.lastInput,
      awaitingConfirmation: !!store.awaitingConfirmation,
      age: store.lastTimestamp ? Date.now() - store.lastTimestamp : null
    };
  },

  /**
   * Check if context is fresh (recent interaction)
   * @returns {boolean}
   */
  isFresh() {
    if (!store.lastTimestamp) return false;
    return (Date.now() - store.lastTimestamp) < CONFIG.TTL_MS;
  }
};

// Start periodic cleanup (unref allows process to exit during tests)
const cleanupTimer = setInterval(() => ContextStore.cleanup(), CONFIG.CLEANUP_INTERVAL);
cleanupTimer.unref();

module.exports = ContextStore;
