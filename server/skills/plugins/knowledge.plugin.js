const fs = require("fs");
const path = require("path");

const INTENTS_PATH = path.join(
  __dirname,
  "../../nlp/intents/autonomous_learned.json",
);
const CONTENT_PATH = path.join(
  __dirname,
  "../../nlp/knowledge/learned_content.json",
);

// Load data
let learnedIntents = [];
let learnedContent = {};

try {
  if (fs.existsSync(INTENTS_PATH)) {
    learnedIntents = JSON.parse(fs.readFileSync(INTENTS_PATH, "utf8"));
  }
  if (fs.existsSync(CONTENT_PATH)) {
    learnedContent = JSON.parse(fs.readFileSync(CONTENT_PATH, "utf8"));
  }
} catch (error) {
  console.error("[Knowledge Plugin] Failed to load knowledge data", error);
}

const intents = {};

// Register a generic handler for all learned intents
if (Array.isArray(learnedIntents)) {
  learnedIntents.forEach((item) => {
    // Dynamically register each intent found in the learned file
    intents[item.intent] = {
      confidence: 0.65, // Medium confidence for learned knowledge
      requiresConfirmation: false,
      handler: async (params, context) => {
        // Look up content using the intent name
        const knowledge = learnedContent[item.intent];

        if (!knowledge) {
          return "I have an entry for this topic, but the detailed content is currently missing.";
        }

        let response = `**${knowledge.brand}**\n\n${knowledge.description}\n\n`;

        if (knowledge.summary) {
          // Limit summary length
          const shortSummary = knowledge.summary
            .split("\n\n")
            .slice(0, 3)
            .join("\n\n");
          response += `${shortSummary}\n\n`;
        }

        if (knowledge.domain) {
          response += `You can visit them at: ${knowledge.domain}`;
        }

        return response;
      },
    };
  });
}

// Export the plugin
module.exports = {
  name: "knowledge_base",
  description: "Dynamic knowledge base generated from autonomous exploration",
  intents: intents,
};
