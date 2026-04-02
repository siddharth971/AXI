/**
 * Auto-generated Plugin for Live Science
 */
const responseHandler = require("../handlers/responses/auto_livescience");

module.exports = {
  name: "auto_livescience",
  description: "Autonomous handler for Live Science",
  intents: {
    "knowledge.dynamic.livescience": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
