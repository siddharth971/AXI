/**
 * Auto-generated Plugin for YouTube
 */
const responseHandler = require("../handlers/responses/auto_youtube");

module.exports = {
  name: "auto_youtube",
  description: "Autonomous handler for YouTube",
  intents: {
    "knowledge.dynamic.youtube": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
