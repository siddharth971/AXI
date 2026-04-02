/**
 * Auto-generated Plugin for Home
 */
const responseHandler = require("../handlers/responses/auto_home");

module.exports = {
  name: "auto_home",
  description: "Autonomous handler for Home",
  intents: {
    "knowledge.dynamic.home": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
