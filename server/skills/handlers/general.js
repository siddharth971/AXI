/**
 * General Skills - Response Aggregator
 * -------------------------------------
 * Combines all response modules into a single export.
 * Each response type is in its own file for maintainability.
 */

const greeting = require("./responses/greeting");
const information = require("./responses/information");
const chat = require("./responses/chat");
const fallback = require("./responses/fallback");

module.exports = {
  // Greetings
  greeting: greeting.greeting,

  // Information
  tellTime: information.tellTime,
  tellJoke: information.tellJoke,
  weatherCheck: information.weatherCheck,
  newsUpdate: information.newsUpdate,
  musicControl: information.musicControl,

  // Chat
  aiChat: chat.aiChat,

  // Fallback
  fallback: fallback.fallback
};
