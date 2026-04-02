/**
 * Auto-generated Plugin for Yahoo Finance
 */
const responseHandler = require("../handlers/responses/auto_yahoofinance");

module.exports = {
  name: "auto_yahoofinance",
  description: "Autonomous handler for Yahoo Finance",
  intents: {
    "knowledge.dynamic.yahoofinance": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
