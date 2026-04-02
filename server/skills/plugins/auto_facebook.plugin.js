/**
 * Auto-generated Plugin for Facebook
 */
const responseHandler = require("../handlers/responses/auto_facebook");

module.exports = {
  name: "auto_facebook",
  description: "Autonomous handler for Facebook",
  intents: {
    "knowledge.dynamic.facebook": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
