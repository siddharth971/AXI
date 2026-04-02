/**
 * Auto-generated Plugin for LFX Insights
 */
const responseHandler = require("../handlers/responses/auto_lfxinsights");

module.exports = {
  name: "auto_lfxinsights",
  description: "Autonomous handler for LFX Insights",
  intents: {
    "knowledge.dynamic.lfxinsights": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
