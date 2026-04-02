/**
 * Auto-generated Plugin for Paligo
 */
const responseHandler = require("../handlers/responses/auto_paligo");

module.exports = {
  name: "auto_paligo",
  description: "Autonomous handler for Paligo",
  intents: {
    "knowledge.dynamic.paligo": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
