/**
 * Conversational Plugin
 * ----------------------
 * Handles emotional, small-talk, and non-command conversational inputs.
 * Routes responses based on sentiment signals.
 */

"use strict";

const RESPONSES = {
  negative: [
    "That sounds tough. I'm here if you need anything — want me to play some music?",
    "Sorry to hear that. Let me know if there's something I can do.",
    "I hear you. Want me to do something to help — music, a reminder, or just talk?",
    "That doesn't sound great. I'm here. What do you need?",
  ],
  positive: [
    "Glad to hear it! What can I do for you today?",
    "That's great! What would you like me to help with?",
    "Good to hear! What's next?",
  ],
  neutral: [
    "I'm listening — what would you like me to do?",
    "Got it. How can I help?",
    "I'm here. What do you need?",
  ],
};

module.exports = {
  name: "conversational",
  description: "Handles emotional, small-talk, and non-command conversational inputs",
  intents: {
    conversational_emotional: {
      confidence: 0.0,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const sentiment = params.sentiment || "neutral";
        const pool = RESPONSES[sentiment] ?? RESPONSES.neutral;
        return pool[Math.floor(Math.random() * pool.length)];
      },
    },
  },
  
  // Direct execution helper for sentiment fallback
  execute: async function({ sentiment = "neutral" } = {}) {
    const pool = RESPONSES[sentiment] ?? RESPONSES.neutral;
    const text = pool[Math.floor(Math.random() * pool.length)];
    return text;
  }
};
