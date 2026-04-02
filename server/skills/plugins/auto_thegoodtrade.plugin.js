/**
 * Auto-generated Plugin for The Good Trade
 */
const responseHandler = require("../handlers/responses/auto_thegoodtrade");

module.exports = {
  name: "auto_thegoodtrade",
  description: "Autonomous handler for The Good Trade",
  intents: {
    "knowledge.dynamic.thegoodtrade": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
