/**
 * AXI Decision Engine
 * ---------------------
 * Central decision-making module that merges signals from all NLP layers
 * and determines the appropriate action to take.
 * 
 * Responsibilities:
 * 1. Merge signals from Rules, Semantic, and Classifier layers
 * 2. Detect multi-intent commands
 * 3. Make confidence-aware decisions (execute/confirm/clarify)
 * 4. Resolve conflicts between layers
 * 
 * Priority Order: Rules > Semantic > Classifier
 */

"use strict";

const { logger } = require("../utils");

// Confidence thresholds for decision making
const THRESHOLDS = {
  EXECUTE: 0.80,      // High confidence → execute immediately
  CONFIRM: 0.55,      // Medium confidence → ask for confirmation
  CLARIFY: 0.35,      // Low confidence → ask for clarification
  REJECT: 0.35        // Below this → unknown intent
};

// Decision types
const DECISIONS = {
  EXECUTE: "execute",
  CONFIRM: "confirm",
  CLARIFY: "clarify",
  UNKNOWN: "unknown"
};

// Multi-intent conjunctions
const CONJUNCTIONS = ["and", "then", "also", "after that", "and then", "plus"];

// Action verbs that indicate separate intents
const ACTION_VERBS = [
  "open", "close", "play", "pause", "stop", "start",
  "mute", "unmute", "search", "find", "create", "delete",
  "show", "tell", "what", "turn", "increase", "decrease",
  "list", "run", "execute", "launch", "check"
];

/**
 * Decision Engine Module
 */
const DecisionEngine = {
  THRESHOLDS,
  DECISIONS,

  /**
   * Make a decision based on all available signals
   * 
   * @param {Object} signals - Signals from all layers
   * @param {Object} signals.rules - Result from rules layer (or null)
   * @param {Object} signals.semantic - Result from semantic layer (or null)
   * @param {Object} signals.classifier - Result from Brain.js classifier
   * @param {Object} context - Current context (optional)
   * @returns {Object} Decision result
   */
  decide(signals, context = {}) {
    const { rules, semantic, classifier } = signals;

    // Priority 1: Rules always win (exact matches, critical commands)
    if (rules && rules.confidence === 1) {
      return {
        decision: DECISIONS.EXECUTE,
        intent: rules.intent,
        confidence: 1,
        source: "rules",
        entities: rules.entities || {},
        reason: "Exact rule match"
      };
    }

    // Priority 2: High-confidence semantic match
    if (semantic && semantic.confidence >= THRESHOLDS.EXECUTE) {
      return {
        decision: DECISIONS.EXECUTE,
        intent: semantic.intent,
        confidence: semantic.confidence,
        source: "semantic",
        entities: semantic.entities || {},
        matchedExample: semantic.matchedExample,
        reason: "High semantic similarity"
      };
    }

    // Priority 3: High-confidence classifier
    if (classifier && classifier.confidence >= THRESHOLDS.EXECUTE) {
      return {
        decision: DECISIONS.EXECUTE,
        intent: classifier.intent,
        confidence: classifier.confidence,
        source: "classifier",
        entities: classifier.entities || {},
        reason: "High classifier confidence"
      };
    }

    // Priority 4: Medium confidence - prefer semantic over classifier
    const bestCandidate = this.selectBestCandidate(semantic, classifier);
    
    if (bestCandidate && bestCandidate.confidence >= THRESHOLDS.CONFIRM) {
      return {
        decision: DECISIONS.CONFIRM,
        intent: bestCandidate.intent,
        confidence: bestCandidate.confidence,
        source: bestCandidate.source,
        entities: bestCandidate.entities || {},
        reason: "Medium confidence - confirmation recommended",
        confirmationPrompt: this.generateConfirmation(bestCandidate.intent)
      };
    }

    // Priority 5: Low confidence - ask for clarification
    if (bestCandidate && bestCandidate.confidence >= THRESHOLDS.CLARIFY) {
      return {
        decision: DECISIONS.CLARIFY,
        intent: bestCandidate.intent,
        confidence: bestCandidate.confidence,
        source: bestCandidate.source,
        reason: "Low confidence - clarification needed",
        clarificationPrompt: this.generateClarification(bestCandidate.intent, context)
      };
    }

    // Default: Unknown intent
    return {
      decision: DECISIONS.UNKNOWN,
      intent: "unknown",
      confidence: bestCandidate ? bestCandidate.confidence : 0,
      source: "none",
      reason: "Could not determine intent",
      clarificationPrompt: "I'm not sure what you'd like me to do. Could you rephrase that?"
    };
  },

  /**
   * Select the best candidate between semantic and classifier
   */
  selectBestCandidate(semantic, classifier) {
    if (!semantic && !classifier) return null;
    if (!semantic) return { ...classifier, source: "classifier" };
    if (!classifier) return { ...semantic, source: "semantic" };

    // Prefer semantic if confidence is close (within 0.1)
    if (semantic.confidence >= classifier.confidence - 0.1) {
      return { ...semantic, source: "semantic" };
    }
    return { ...classifier, source: "classifier" };
  },

  /**
   * Detect if input contains multiple intents
   * 
   * @param {string} text - User input
   * @returns {Object} Multi-intent detection result
   */
  detectMultiIntent(text) {
    if (!text || typeof text !== "string") {
      return { isMulti: false, segments: [text] };
    }

    const lowerText = text.toLowerCase();
    
    // Check for conjunctions
    let hasConjunction = false;
    let splitIndex = -1;
    let usedConjunction = "";

    for (const conj of CONJUNCTIONS) {
      const idx = lowerText.indexOf(` ${conj} `);
      if (idx > 0) {
        hasConjunction = true;
        splitIndex = idx;
        usedConjunction = conj;
        break;
      }
    }

    if (!hasConjunction) {
      return { isMulti: false, segments: [text] };
    }

    // Split into segments
    const segments = [];
    const parts = text.split(new RegExp(`\\s+${usedConjunction}\\s+`, "i"));
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.length > 0) {
        // Check if segment starts with an action verb or is continuable
        segments.push(trimmed);
      }
    }

    // Validate that we have actual multi-intent (both segments should be actionable)
    if (segments.length >= 2) {
      const firstHasAction = this.hasActionVerb(segments[0]);
      const secondHasAction = this.hasActionVerb(segments[1]);

      if (firstHasAction && secondHasAction) {
        return {
          isMulti: true,
          segments,
          conjunction: usedConjunction
        };
      }
    }

    return { isMulti: false, segments: [text] };
  },

  /**
   * Check if text contains an action verb
   */
  hasActionVerb(text) {
    const lower = text.toLowerCase();
    return ACTION_VERBS.some(verb => 
      lower.startsWith(verb) || lower.includes(` ${verb} `)
    );
  },

  /**
   * Process multi-intent command - returns array of decisions
   * 
   * @param {string} text - User input
   * @param {Function} interpretFn - Function to interpret each segment
   * @returns {Promise<Object>} Multi-intent result
   */
  async processMultiIntent(text, interpretFn) {
    const detection = this.detectMultiIntent(text);

    if (!detection.isMulti) {
      return {
        isMulti: false,
        results: [await interpretFn(text)]
      };
    }

    logger.info(`Multi-intent detected: ${detection.segments.length} segments`);

    const results = [];
    for (const segment of detection.segments) {
      const result = await interpretFn(segment);
      results.push({
        segment,
        ...result
      });
    }

    return {
      isMulti: true,
      conjunction: detection.conjunction,
      segments: detection.segments,
      results
    };
  },

  /**
   * Generate confirmation prompt for medium-confidence decisions
   */
  generateConfirmation(intent) {
    const confirmations = {
      open_youtube: "Did you want me to open YouTube?",
      play: "Should I start playing music?",
      pause: "Would you like me to pause?",
      volume_up: "Increase the volume?",
      volume_down: "Decrease the volume?",
      mute: "Should I mute the sound?",
      search_youtube: "Search YouTube for that?",
      default: `I think you want: "${intent}". Is that correct?`
    };

    return confirmations[intent] || confirmations.default;
  },

  /**
   * Generate clarification prompt for low-confidence decisions
   */
  generateClarification(intent, context = {}) {
    // If we have a guess, offer it
    if (intent && intent !== "unknown") {
      return `I'm not quite sure - did you mean "${intent}" or something else?`;
    }

    // Generic clarification
    return "I didn't quite catch that. Could you say it differently?";
  },

  /**
   * Resolve conflicts between multiple signals
   * 
   * @param {Object[]} candidates - Array of candidate results
   * @returns {Object} Best candidate
   */
  resolveConflicts(candidates) {
    if (!candidates || candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];

    // Sort by priority: rules > semantic > classifier
    // Then by confidence
    const priorityOrder = { rules: 0, semantic: 1, classifier: 2 };

    candidates.sort((a, b) => {
      // First by source priority
      const priorityDiff = (priorityOrder[a.source] || 3) - (priorityOrder[b.source] || 3);
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by confidence
      return b.confidence - a.confidence;
    });

    return candidates[0];
  },

  /**
   * Check if a decision is safe to execute without confirmation
   * Some intents are "destructive" and should always confirm
   */
  isSafeToExecute(intent, confidence) {
    const destructiveIntents = [
      "delete_file", "delete_folder",
      "shutdown_system", "restart_system",
      "git_push", "git_commit"
    ];

    // Destructive intents need higher confidence
    if (destructiveIntents.includes(intent)) {
      return confidence >= 0.95;
    }

    return confidence >= THRESHOLDS.EXECUTE;
  },

  /**
   * Get decision explanation for debugging/logging
   */
  explainDecision(decision) {
    return {
      action: decision.decision,
      intent: decision.intent,
      confidence: `${(decision.confidence * 100).toFixed(1)}%`,
      source: decision.source,
      reason: decision.reason
    };
  }
};

module.exports = DecisionEngine;
