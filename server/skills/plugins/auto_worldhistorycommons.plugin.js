/**
 * Auto-generated Plugin for World History Commons
 */
const responseHandler = require("../handlers/responses/auto_worldhistorycommons");

module.exports = {
  name: "auto_worldhistorycommons",
  description: "Autonomous handler for World History Commons",
  intents: {
    "knowledge.dynamic.worldhistorycommons": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
