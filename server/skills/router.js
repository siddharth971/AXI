/**
 * Plugin Router
 * --------------
 * Central execution engine for the plugin-based skill system.
 * Routes NLP results to appropriate plugin handlers with:
 * - Confidence threshold enforcement
 * - Confirmation flow for destructive actions
 * - Safe error handling
 * - Context management
 * 
 * NO switch-case logic - fully dynamic dispatch via registry.
 */

"use strict";

const { registry } = require("./registry");
const { memory } = require("./context/memory");
const fallback = require("./responses/fallback");
const config = require("../config");
const { logger } = require("../utils");

// Confirmation timeout (30 seconds)
const CONFIRMATION_TIMEOUT = 30000;

// Pending confirmations: sessionId -> { intent, params, timestamp, actionDescription }
const pendingConfirmations = new Map();

/**
 * Main execution function
 * @param {Object} nlpResult - Result from NLP processing { intent, confidence, entities, params }
 * @param {string} originalText - Raw user input
 * @param {Object} context - Legacy context object (deprecated, using memory instead)
 * @param {string} sessionId - Session identifier
 * @returns {Promise<string>} Response text
 */
async function execute(nlpResult, originalText, context = null, sessionId = "default") {
  const { intent, confidence, entities, params } = nlpResult || {};

  // Ensure registry is initialized
  if (!registry.isInitialized()) {
    await registry.initialize();
  }

  try {
    // 1. Handle pending confirmations first
    const confirmationResult = await handlePendingConfirmation(originalText, sessionId);
    if (confirmationResult !== null) {
      return confirmationResult;
    }

    // 2. Handle contextual/follow-up responses
    const awaitingState = memory.getAwaiting(sessionId);
    if (awaitingState) {
      const contextResult = await handleContextResponse(awaitingState, originalText, entities, sessionId);
      if (contextResult !== null) {
        return contextResult;
      }
    }

    // 3. No intent or special context_response handling
    if (intent === "context_response") {
      return handleLegacyContextResponse(entities, sessionId);
    }

    // 4. Validate confidence threshold
    const globalThreshold = config.NLP_CONFIDENCE_THRESHOLD || 0.4;
    if (!intent || confidence < globalThreshold) {
      logger.debug(`Low confidence (${confidence}) for intent: ${intent}`);
      return fallback.unknown(originalText);
    }

    // 5. Lookup intent handler in registry
    const handler = registry.getIntentHandler(intent);
    if (!handler) {
      logger.warn(`No plugin found for intent: ${intent}`);
      return fallback.pluginNotFound(intent);
    }

    const { plugin, config: intentConfig } = handler;

    // 6. Check intent-specific confidence threshold
    if (confidence < intentConfig.confidence) {
      logger.debug(`Confidence ${confidence} below intent threshold ${intentConfig.confidence}`);
      return fallback.lowConfidence(confidence);
    }

    // 7. Handle confirmation requirement for destructive actions
    if (intentConfig.requiresConfirmation) {
      return requestConfirmation(intent, params || entities || {}, sessionId, intentConfig);
    }

    // 8. Execute the handler
    const response = await executeHandler(plugin, intentConfig, params || entities || {}, sessionId);

    // 9. Update context
    memory.updateGlobalContext({
      lastIntent: intent,
      lastPlugin: plugin.name,
      lastResponse: response
    });

    memory.addHistory({
      intent,
      plugin: plugin.name,
      input: originalText,
      response,
      confidence
    }, sessionId);

    return response;

  } catch (error) {
    logger.error(`Router execution error: ${error.message}`);
    return fallback.error(error);
  }
}

/**
 * Execute a plugin handler safely
 * @param {Object} plugin - Plugin module
 * @param {Object} intentConfig - Intent configuration
 * @param {Object} params - Execution parameters
 * @param {string} sessionId - Session identifier
 * @returns {Promise<string>} Response
 */
async function executeHandler(plugin, intentConfig, params, sessionId) {
  const executionContext = {
    sessionId,
    memory,
    timestamp: Date.now(),
    pluginName: plugin.name
  };

  try {
    logger.debug(`Executing ${plugin.name}.${intentConfig.intentName}`);
    const result = await intentConfig.handler(params, executionContext);

    // Ensure response is a string
    if (typeof result !== "string") {
      logger.warn(`Handler returned non-string: ${typeof result}`);
      return String(result || "Action completed.");
    }

    return result;
  } catch (error) {
    logger.error(`Handler error in ${plugin.name}.${intentConfig.intentName}: ${error.message}`);
    throw error;
  }
}

/**
 * Request confirmation for destructive actions
 * @param {string} intent - Intent requiring confirmation
 * @param {Object} params - Intent parameters
 * @param {string} sessionId - Session identifier
 * @param {Object} intentConfig - Intent configuration
 * @returns {string} Confirmation prompt
 */
function requestConfirmation(intent, params, sessionId, intentConfig) {
  const actionDescription = getActionDescription(intent, params);

  pendingConfirmations.set(sessionId, {
    intent,
    params,
    intentConfig,
    timestamp: Date.now(),
    actionDescription
  });

  memory.setAwaiting("confirmation", { intent, params }, sessionId);

  logger.debug(`Confirmation requested for ${intent}`);
  return fallback.confirmationPending(actionDescription);
}

/**
 * Handle pending confirmation response
 * @param {string} userResponse - User's response text
 * @param {string} sessionId - Session identifier
 * @returns {Promise<string|null>} Response or null if not a confirmation
 */
async function handlePendingConfirmation(userResponse, sessionId) {
  const pending = pendingConfirmations.get(sessionId);
  if (!pending) return null;

  const response = userResponse.toLowerCase().trim();

  // Check for timeout
  if (Date.now() - pending.timestamp > CONFIRMATION_TIMEOUT) {
    pendingConfirmations.delete(sessionId);
    memory.clearAwaiting(sessionId);
    return fallback.confirmationTimeout();
  }

  // Check for affirmative response
  const affirmatives = ["yes", "yeah", "yep", "sure", "ok", "okay", "confirm", "proceed", "do it", "go ahead"];
  const negatives = ["no", "nope", "cancel", "stop", "don't", "abort", "never mind"];

  if (affirmatives.some(word => response.includes(word))) {
    const { intent, params, intentConfig } = pending;
    const handler = registry.getIntentHandler(intent);

    if (!handler) {
      pendingConfirmations.delete(sessionId);
      memory.clearAwaiting(sessionId);
      return fallback.pluginNotFound(intent);
    }

    pendingConfirmations.delete(sessionId);
    memory.clearAwaiting(sessionId);

    return await executeHandler(handler.plugin, intentConfig, params, sessionId);
  }

  if (negatives.some(word => response.includes(word))) {
    pendingConfirmations.delete(sessionId);
    memory.clearAwaiting(sessionId);
    return fallback.confirmationCancelled();
  }

  // Still waiting for clear response
  return null;
}

/**
 * Get human-readable action description
 * @param {string} intent - Intent name
 * @param {Object} params - Intent parameters
 * @returns {string} Description
 */
function getActionDescription(intent, params) {
  const descriptions = {
    delete_file: `delete the file "${params.filename || params.path || "specified file"}"`,
    delete_folder: `delete the folder "${params.foldername || params.path || "specified folder"}"`,
    shutdown_system: "shut down the system",
    restart_system: "restart the system",
    clear_history: "clear all history",
    uninstall_package: `uninstall ${params.package || "the package"}`
  };

  return descriptions[intent] || `perform ${intent.replace(/_/g, " ")}`;
}

/**
 * Handle contextual/follow-up responses
 * @param {Object} awaitingState - Current awaiting state
 * @param {string} userInput - User's response
 * @param {Object} entities - Extracted entities
 * @param {string} sessionId - Session identifier
 * @returns {Promise<string|null>} Response or null
 */
async function handleContextResponse(awaitingState, userInput, entities, sessionId) {
  const { type, data } = awaitingState;

  // Don't handle confirmation here - it's handled separately
  if (type === "confirmation") {
    return null;
  }

  // Handle specific context types
  switch (type) {
    case "ask_website_name":
      memory.clearAwaiting(sessionId);
      const handler = registry.getIntentHandler("open_website");
      if (handler) {
        return await executeHandler(handler.plugin, handler.config, { url: userInput }, sessionId);
      }
      return fallback.pluginNotFound("open_website");

    default:
      // Unknown context type - clear it
      memory.clearAwaiting(sessionId);
      return null;
  }
}

/**
 * Handle legacy context response format (backward compatibility)
 * @param {Object} entities - Entities from NLP
 * @param {string} sessionId - Session identifier
 * @returns {string} Response
 */
function handleLegacyContextResponse(entities, sessionId) {
  if (!entities) {
    memory.clearAwaiting(sessionId);
    return "I'm sorry, I lost track of our conversation.";
  }

  const { type, value } = entities;
  memory.clearAwaiting(sessionId);

  switch (type) {
    case "ask_website_name":
      const handler = registry.getIntentHandler("open_website");
      if (handler) {
        return executeHandler(handler.plugin, handler.config, { url: value }, sessionId);
      }
      return fallback.pluginNotFound("open_website");

    default:
      return "I'm sorry, I lost track of our conversation.";
  }
}

/**
 * Get router status and diagnostics
 * @returns {Object} Status information
 */
function getStatus() {
  return {
    registryStats: registry.getStats(),
    pendingConfirmations: pendingConfirmations.size,
    activeSessions: memory.getActiveSessions().length
  };
}

/**
 * Clean up stale state
 */
function cleanup() {
  const now = Date.now();

  // Clean up expired confirmations
  for (const [sessionId, pending] of pendingConfirmations) {
    if (now - pending.timestamp > CONFIRMATION_TIMEOUT) {
      pendingConfirmations.delete(sessionId);
    }
  }

  // Clean up stale sessions
  memory.cleanup();
}

module.exports = {
  execute,
  getStatus,
  cleanup,

  // Expose for testing
  _pendingConfirmations: pendingConfirmations
};
