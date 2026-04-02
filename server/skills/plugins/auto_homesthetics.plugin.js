/**
 * Auto-generated Plugin for Homesthetics
 */
const responseHandler = require("../handlers/responses/auto_homesthetics");

module.exports = {
  name: "auto_homesthetics",
  description: "Autonomous handler for Homesthetics",
  intents: {
    "knowledge.dynamic.homesthetics": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
