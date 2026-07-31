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
    help: {
      confidence: 0.8,
      requiresConfirmation: false,
      handler: async () => {
        return `🤖 **AXI Assistant Capabilities**:\n` +
          `• ⚡ **System Telemetry**: 'check cpu usage', 'check ram status', 'system health'\n` +
          `• 🌐 **Web RAG**: 'search web for Next.js features', 'fetch news about SpaceX'\n` +
          `• 📄 **File RAG**: 'search code for decision', 'find md files'\n` +
          `• 🎙️ **Voice Profiles**: 'switch voice to JARVIS', 'set speech speed 1.2'\n` +
          `• ⚙️ **Custom Macros**: 'create macro coding mode: open vsc, set volume 50%'\n` +
          `• 🖥️ **Process Control**: 'show running processes', 'kill process chrome'\n` +
          `• 🔄 **Multi-Step Workflows**: 'prepare my workstation'`;
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
