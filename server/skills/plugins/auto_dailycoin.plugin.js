/**
 * Auto-generated Plugin for DailyCoin
 */
const responseHandler = require("../handlers/responses/auto_dailycoin");

module.exports = {
  name: "auto_dailycoin",
  description: "Autonomous handler for DailyCoin",
  intents: {
    "knowledge.dynamic.dailycoin": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
