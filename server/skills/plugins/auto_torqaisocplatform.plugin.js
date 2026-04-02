/**
 * Auto-generated Plugin for Torq® AI SOC Platform
 */
const responseHandler = require("../handlers/responses/auto_torqaisocplatform");

module.exports = {
  name: "auto_torqaisocplatform",
  description: "Autonomous handler for Torq® AI SOC Platform",
  intents: {
    "knowledge.dynamic.torqaisocplatform": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
