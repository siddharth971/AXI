/**
 * Auto-generated Plugin for Bob Vila
 */
const responseHandler = require("../handlers/responses/auto_bobvila");

module.exports = {
  name: "auto_bobvila",
  description: "Autonomous handler for Bob Vila",
  intents: {
    "knowledge.dynamic.bobvila": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
