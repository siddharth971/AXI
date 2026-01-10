/**
 * AXI Semantic Matching Module
 * -----------------------------
 * Main entry point for semantic intent matching.
 * Uses sentence embeddings + cosine similarity for human-like understanding.
 * 
 * This runs in PARALLEL with Brain.js classifier:
 * Rules → Semantic → Brain.js → Unknown
 */

"use strict";

const embedder = require("./embedder");
const { findBestMatch, findTopMatches } = require("./similarity");
const { logger } = require("../../utils");

// Semantic matching thresholds
const THRESHOLDS = {
  HIGH_CONFIDENCE: 0.85,   // Very confident match
  MATCH: 0.75,             // Standard threshold for semantic match
  POSSIBLE: 0.60           // Potential match (for debugging)
};

// Module state
let isInitialized = false;
let initPromise = null;

/**
 * Initialize the semantic matching system
 * Loads USE model and intent vectors
 */
async function initialize() {
  if (isInitialized) return true;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      logger.info("Initializing semantic matching...");

      // Load intent vectors (synchronous, from file)
      const vectors = embedder.loadIntentVectors();

      if (!vectors) {
        logger.warn("Semantic matching disabled: no intent vectors found");
        return false;
      }

      // Pre-load USE model (async)
      await embedder.loadModel();

      isInitialized = true;
      logger.success("Semantic matching initialized");
      return true;
    } catch (error) {
      logger.error("Failed to initialize semantic matching:", error.message);
      return false;
    }
  })();

  return initPromise;
}

/**
 * Perform semantic intent matching on user input
 * 
 * @param {string} text - User input text
 * @returns {Promise<Object|null>} - Match result or null if no match
 */
async function semanticMatch(text) {
  // Skip if not initialized or empty input
  if (!text || text.trim().length === 0) return null;

  // Try to initialize if not already
  if (!isInitialized) {
    const ready = await initialize();
    if (!ready) return null;
  }

  try {
    // Generate embedding for input
    const inputEmbedding = await embedder.embed(text);

    // Get intent vectors
    const intentVectors = embedder.getIntentVectors();

    if (!intentVectors) return null;

    // Find best matching intent
    const match = findBestMatch(inputEmbedding, intentVectors, THRESHOLDS.MATCH);

    if (match) {
      return {
        intent: match.intent,
        confidence: match.confidence,
        matchedExample: match.matchedExample,
        source: "semantic",
        entities: {}
      };
    }

    return null;
  } catch (error) {
    logger.error("Semantic matching error:", error.message);
    return null;
  }
}

/**
 * Debug semantic matching - shows top matches
 * @param {string} text - Input text
 * @returns {Promise<Object>} - Debug info including top matches
 */
async function debug(text) {
  if (!isInitialized) {
    await initialize();
  }

  try {
    const inputEmbedding = await embedder.embed(text);
    const intentVectors = embedder.getIntentVectors();

    if (!intentVectors) {
      return { error: "No intent vectors loaded" };
    }

    const topMatches = findTopMatches(inputEmbedding, intentVectors, 5);

    return {
      input: text,
      topMatches,
      bestMatch: topMatches[0] || null,
      wouldMatch: topMatches[0]?.confidence >= THRESHOLDS.MATCH
    };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Check if semantic matching is available
 */
function isAvailable() {
  return isInitialized && embedder.isReady();
}

/**
 * Reload intent vectors after regeneration
 */
function reload() {
  embedder.reloadVectors();
  logger.info("Semantic vectors reloaded");
}

module.exports = {
  initialize,
  semanticMatch,
  debug,
  isAvailable,
  reload,
  THRESHOLDS
};
