/**
 * Auto-generated Plugin for Open
 */
const responseHandler = require("../handlers/responses/auto_open");

module.exports = {
  name: "auto_open",
  description: "Autonomous handler for Open",
  intents: {
    "knowledge.dynamic.open": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
