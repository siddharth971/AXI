/**
 * Auto-generated Plugin for Site is offline
 */
const responseHandler = require("../handlers/responses/auto_siteisoffline");

module.exports = {
  name: "auto_siteisoffline",
  description: "Autonomous handler for Site is offline",
  intents: {
    "knowledge.dynamic.siteisoffline": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
