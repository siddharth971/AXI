/**
 * AXI Skills Module
 * ------------------
 * Main entry point for the plugin-based skills system.
 * Initializes the registry and exports the router.
 */

"use strict";

const router = require("./router");
const { registry } = require("./registry");
const { memory } = require("./context/memory");

/**
 * Initialize the skills system
 * @returns {Promise<void>}
 */
async function initialize() {
  await registry.initialize();
}

/**
 * Execute a skill based on NLP result
 * @param {Object} nlpResult - NLP processing result
 * @param {string} originalText - Raw user input
 * @param {Object} context - Legacy context (deprecated)
 * @param {string} sessionId - Session identifier
 * @returns {Promise<string>} Response
 */
async function execute(nlpResult, originalText, context, sessionId) {
  return router.execute(nlpResult, originalText, context, sessionId);
}

/**
 * Get skills system status
 * @returns {Object}
 */
function getStatus() {
  return router.getStatus();
}

/**
 * Reload all plugins
 * @returns {Promise<void>}
 */
async function reload() {
  await registry.reload();
}

/**
 * Get all registered intents
 * @returns {Array<string>}
 */
function getIntents() {
  return registry.getAllIntents();
}

/**
 * Get all loaded plugins
 * @returns {Array<Object>}
 */
function getPlugins() {
  return registry.getAllPlugins();
}

module.exports = {
  initialize,
  execute,
  getStatus,
  reload,
  getIntents,
  getPlugins,

  // Expose for advanced usage
  registry,
  memory,
  router
};
