/**
 * Memory Plugin
 * -------------
 * Allows AXI to remember and recall user facts.
 */

const memory = require("../../core/memory");

module.exports = {
  name: "memory",
  description: "Long-term memory for user facts",

  intents: {
    // Remember: "Remember (that) X is Y"
    "memory.remember": {
      confidence: 0.6,
      requiresConfirmation: true, // Confirm before saving
      handler: async (params, context) => {
        // We expect entities/slots for text processing.
        // Simple extraction for now based on text if slots missing.
        let text = params.text || "";

        // Basic pattern matching for: "Remember (that) [KEY] is [VALUE]"
        // This is a naive implementation; ideal would be NER
        const patterns = [
          /remember (that )?my (.+) is (.+)/i, // "Remember my name is Jarvis"
          /remember (that )?the (.+) is (.+)/i, // "Remember the wifi is 123"
          /remember (.+) is (.+)/i, // "Remember x is y"
        ];

        let key = params.key;
        let value = params.value;

        if (!key || !value) {
          for (const p of patterns) {
            const match = text.match(p);
            if (match) {
              // match indices depend on pattern groups.
              // P1: undefined or 'that ', P2: KEY, P3: VALUE
              // Let's assume the last two groups are key/value
              key = match[match.length - 2];
              value = match[match.length - 1];
              break;
            }
          }
        }

        if (key && value) {
          memory.remember(key, value);
          return `I've remembered that your ${key} is ${value}.`;
        }

        return "I didn't catch what you wanted me to remember. Try saying 'Remember that my name is Jarvis'.";
      },
    },

    // Recall: "What is X?"
    "memory.recall": {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        let query = params.query || params.key || "";

        if (!query && params.text) {
          // Extract query from "What is my [KEY]"
          const match = params.text.match(/what is (my|the) (.+)/i);
          if (match) {
            query = match[match.length - 1].replace("?", "").trim();
          }
        }

        if (query) {
          const fact = memory.recall(query);
          if (fact) {
            return `Your ${fact.key} is ${fact.value}.`;
          }
        }

        // Fallback if not found -> Could pass to Knowledge Lookup?
        return null; // Return null to let other fallback logic handle if not found
      },
    },

    // Forget
    "memory.forget": {
      confidence: 0.8,
      requiresConfirmation: true,
      handler: async (params, context) => {
        let key = params.key;
        if (!key && params.text) {
          const match = params.text.match(/forget (my|the) (.+)/i);
          if (match) key = match[match.length - 1];
        }

        if (key) {
          if (memory.forget(key)) {
            return `I've removed ${key} from my memory.`;
          }
          return `I don't have anything stored about ${key}.`;
        }
        return "What should I forget?";
      },
    },
  },
};
