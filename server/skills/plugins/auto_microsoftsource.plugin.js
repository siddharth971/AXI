/**
 * Auto-generated Plugin for Microsoft Source
 */
const responseHandler = require("../handlers/responses/auto_microsoftsource");

module.exports = {
  name: "auto_microsoftsource",
  description: "Autonomous handler for Microsoft Source",
  intents: {
    "knowledge.dynamic.microsoftsource": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
