/**
 * Auto-generated Plugin for Wikipedia
 */
const responseHandler = require("../handlers/responses/auto_wikipedia");

module.exports = {
  name: "auto_wikipedia",
  description: "Autonomous handler for Wikipedia",
  intents: {
    "knowledge.dynamic.wikipedia": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
