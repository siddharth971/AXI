/**
 * AXI Skill Router
 * -----------------
 * Maps intents to skill handlers.
 * Handles context-aware responses.
 * 
 * This is the central "switchboard" of AXI's brain.
 */

const config = require("../config");
const { logger } = require("../utils");

// Import all skill modules
const browserSkills = require("./handlers/browser");
const systemSkills = require("./handlers/system");
const generalSkills = require("./handlers/general");

/**
 * Main skill execution function
 * @param {Object} nlpResult - Result from NLP processing
 * @param {string} originalText - Raw user input
 * @param {Object} context - Conversation context manager
 * @returns {Promise<string>} - Response text
 */
async function execute(nlpResult, originalText, context) {
  const { intent, entities, confidence } = nlpResult;

  // 1. Handle Contextual Responses first
  if (intent === "context_response") {
    return handleContextResponse(entities, context);
  }

  // 2. Low confidence → fallback
  if (!intent || confidence < config.NLP_CONFIDENCE_THRESHOLD) {
    return generalSkills.fallback(originalText);
  }

  // 3. Route to appropriate skill handler
  switch (intent) {
    // --- Greetings & Chat ---
    case "greeting":
      return generalSkills.greeting();
    case "ai_chat":
      return generalSkills.aiChat(originalText);

    // --- Browser Skills ---
    case "open_youtube":
      return browserSkills.openYoutube();
    case "search_youtube":
      return browserSkills.searchYoutube(entities?.query || originalText);
    case "open_website":
      return browserSkills.openWebsite(entities);
    case "ask_which_website":
      context.setAwaiting("ask_website_name");
      return "Which website should I open, sir?";

    // --- System Skills ---
    case "take_screenshot":
      return await systemSkills.takeScreenshot();
    case "tell_time":
      return generalSkills.tellTime();

    // --- Information Skills ---
    case "weather_check":
      return generalSkills.weatherCheck();
    case "tell_joke":
      return generalSkills.tellJoke();
    case "news_update":
      return generalSkills.newsUpdate();
    case "music_control":
      return generalSkills.musicControl();

    // --- Default ---
    default:
      logger.warn(`Unknown intent: ${intent}`);
      return generalSkills.fallback(originalText);
  }
}

/**
 * Handle context-aware responses
 */
function handleContextResponse(entities, context) {
  const { type, value } = entities;

  switch (type) {
    case "ask_website_name":
      context.clearAwaiting();
      return browserSkills.openWebsite({ url: value });

    default:
      context.clearAwaiting();
      return "I'm sorry, I lost track of our conversation.";
  }
}

module.exports = { execute };
