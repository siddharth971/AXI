/**
 * AXI Logger Utility
 * -------------------
 * Centralized logging with emoji prefixes for easy debugging.
 * Can be extended to write to files or external services.
 */

const config = require("../config");

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

let currentLevel = config.FEATURES.LOGGING_VERBOSE ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

function formatMessage(prefix, message, data) {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` ${JSON.stringify(data)}` : "";
  return `[${timestamp}] ${prefix} ${message}${dataStr}`;
}

module.exports = {
  setLevel(level) {
    currentLevel = LOG_LEVELS[level] || LOG_LEVELS.INFO;
  },

  debug(message, data = null) {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.log(formatMessage("🔍", message, data));
    }
  },

  info(message, data = null) {
    if (currentLevel <= LOG_LEVELS.INFO) {
      console.log(formatMessage("ℹ️", message, data));
    }
  },

  success(message, data = null) {
    console.log(formatMessage("✅", message, data));
  },

  warn(message, data = null) {
    if (currentLevel <= LOG_LEVELS.WARN) {
      console.warn(formatMessage("⚠️", message, data));
    }
  },

  error(message, data = null) {
    console.error(formatMessage("❌", message, data));
  },

  // Special loggers for AXI
  received(text) {
    console.log(`🎤 Received: ${text}`);
  },

  nlp(result) {
    console.log("🧠 NLP:", result);
  },

  reply(text) {
    console.log(`💬 Reply: ${text}`);
  },

  context(type) {
    console.log(`🔄 Context: ${type}`);
  }
};
