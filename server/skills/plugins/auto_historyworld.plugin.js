/**
 * Auto-generated Plugin for HistoryWorld
 */
const responseHandler = require("../handlers/responses/auto_historyworld");

module.exports = {
  name: "auto_historyworld",
  description: "Autonomous handler for HistoryWorld",
  intents: {
    "knowledge.dynamic.historyworld": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
