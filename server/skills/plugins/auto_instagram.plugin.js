/**
 * Auto-generated Plugin for Instagram
 */
const responseHandler = require("../handlers/responses/auto_instagram");

module.exports = {
  name: "auto_instagram",
  description: "Autonomous handler for Instagram",
  intents: {
    "knowledge.dynamic.instagram": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
