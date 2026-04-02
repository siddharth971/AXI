/**
 * Auto-generated Plugin for World History Guide
 */
const responseHandler = require("../handlers/responses/auto_worldhistoryguide");

module.exports = {
  name: "auto_worldhistoryguide",
  description: "Autonomous handler for World History Guide",
  intents: {
    "knowledge.dynamic.worldhistoryguide": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
