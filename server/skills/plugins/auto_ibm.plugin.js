/**
 * Auto-generated Plugin for IBM
 */
const responseHandler = require("../handlers/responses/auto_ibm");

module.exports = {
  name: "auto_ibm",
  description: "Autonomous handler for IBM",
  intents: {
    "knowledge.dynamic.ibm": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
