/**
 * Auto-generated Plugin for High
 */
const responseHandler = require("../handlers/responses/auto_high");

module.exports = {
  name: "auto_high",
  description: "Autonomous handler for High",
  intents: {
    "knowledge.dynamic.high": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
