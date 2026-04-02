/**
 * Auto-generated Plugin for DEV Community
 */
const responseHandler = require("../handlers/responses/auto_devcommunity");

module.exports = {
  name: "auto_devcommunity",
  description: "Autonomous handler for DEV Community",
  intents: {
    "knowledge.dynamic.devcommunity": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
