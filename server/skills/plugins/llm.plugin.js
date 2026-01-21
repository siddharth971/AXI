/**
 * LLM Plugin
 * -----------
 * Handles general conversation and unknown intents via LLM.
 */

const llmService = require("../../core/llm-service");

// Conversation history per session (in-memory)
const conversationHistory = new Map();

module.exports = {
  name: "llm",
  description: "Large Language Model integration for intelligent conversation",

  intents: {
    // General conversation/unknown intent handler
    llm_chat: {
      confidence: 0.3, // Low confidence - fallback handler
      requiresConfirmation: false,
      handler: async (params, context) => {
        const sessionId = context.sessionId || "default";
        const userMessage = params.text || params.query || "";

        if (!userMessage) {
          return "I didn't catch that. What would you like to know?";
        }

        // Get conversation history for context
        const history = conversationHistory.get(sessionId) || [];

        try {
          const result = await llmService.query(userMessage, history);

          if (result.success) {
            // Update conversation history (keep last 10 exchanges)
            history.push(
              { role: "user", content: userMessage },
              { role: "assistant", content: result.response },
            );
            if (history.length > 20) {
              history.splice(0, 2);
            }
            conversationHistory.set(sessionId, history);

            return result.response;
          } else {
            return result.response;
          }
        } catch (error) {
          console.error("[LLM Plugin] Error:", error.message);
          return "I'm having trouble thinking right now. Could you try again?";
        }
      },
    },

    // Explicit "ask" command
    ask_question: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const query = params.query || params.text || "";
        const result = await llmService.query(query);
        return result.response;
      },
    },

    // Clear conversation context
    clear_chat_context: {
      confidence: 0.8,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const sessionId = context.sessionId || "default";
        conversationHistory.delete(sessionId);
        return "Conversation context cleared. Starting fresh!";
      },
    },
  },
};
