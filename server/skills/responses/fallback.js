/**
 * Fallback Response Handler
 * -------------------------
 * Provides graceful fallback responses for unrecognized intents,
 * low confidence results, and error scenarios.
 */

"use strict";

const FALLBACK_RESPONSES = {
  unknown: [
    "I'm not sure I understand that yet.",
    "Could you rephrase that, sir?",
    "I didn't quite catch that.",
    "I'm still learning, could you say that again?",
    "Hmm, I'm not sure what you mean. Can you try a different phrasing?"
  ],

  lowConfidence: [
    "I'm not entirely sure what you mean. Could you clarify?",
    "I think I understand, but could you be more specific?",
    "I'm having trouble understanding that request.",
    "Could you say that in a different way?"
  ],

  error: [
    "Something went wrong on my end. Please try again.",
    "I encountered an error processing that request.",
    "Apologies, I couldn't complete that action. Please try again.",
    "There was an issue. Could you try that again?"
  ],

  confirmation: {
    pending: "Are you sure you want to proceed with this action?",
    timeout: "I was waiting for your confirmation, but didn't receive a response.",
    cancelled: "Alright, I've cancelled that action."
  },

  pluginNotFound: [
    "I don't have a skill for that yet.",
    "That capability isn't available at the moment.",
    "I can't help with that right now, but I'm always learning."
  ]
};

/**
 * Pick a random response from an array
 * @param {Array<string>} responses - Array of possible responses
 * @returns {string} Randomly selected response
 */
function pickRandom(responses) {
  if (!Array.isArray(responses) || responses.length === 0) {
    return "I'm not sure how to respond to that.";
  }
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Get unknown intent fallback
 * @param {string} originalText - Original user input
 * @returns {string} Fallback response
 */
function unknown(originalText) {
  return pickRandom(FALLBACK_RESPONSES.unknown);
}

/**
 * Get low confidence fallback
 * @param {number} confidence - Confidence score
 * @returns {string} Fallback response
 */
function lowConfidence(confidence) {
  return pickRandom(FALLBACK_RESPONSES.lowConfidence);
}

/**
 * Get error fallback
 * @param {Error} error - Error object
 * @returns {string} Fallback response
 */
function error(error) {
  return pickRandom(FALLBACK_RESPONSES.error);
}

/**
 * Get confirmation pending response
 * @param {string} action - Action description
 * @returns {string} Confirmation prompt
 */
function confirmationPending(action) {
  if (action) {
    return `Are you sure you want to ${action}?`;
  }
  return FALLBACK_RESPONSES.confirmation.pending;
}

/**
 * Get confirmation timeout response
 * @returns {string} Timeout response
 */
function confirmationTimeout() {
  return FALLBACK_RESPONSES.confirmation.timeout;
}

/**
 * Get confirmation cancelled response
 * @returns {string} Cancelled response
 */
function confirmationCancelled() {
  return FALLBACK_RESPONSES.confirmation.cancelled;
}

/**
 * Get plugin not found response
 * @param {string} intent - Requested intent
 * @returns {string} Not found response
 */
function pluginNotFound(intent) {
  return pickRandom(FALLBACK_RESPONSES.pluginNotFound);
}

module.exports = {
  unknown,
  lowConfidence,
  error,
  confirmationPending,
  confirmationTimeout,
  confirmationCancelled,
  pluginNotFound,
  pickRandom,
  FALLBACK_RESPONSES
};
