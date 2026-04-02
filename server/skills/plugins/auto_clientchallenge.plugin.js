/**
 * Auto-generated Plugin for Client Challenge
 */
const responseHandler = require("../handlers/responses/auto_clientchallenge");

module.exports = {
  name: "auto_clientchallenge",
  description: "Autonomous handler for Client Challenge",
  intents: {
    "knowledge.dynamic.clientchallenge": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
