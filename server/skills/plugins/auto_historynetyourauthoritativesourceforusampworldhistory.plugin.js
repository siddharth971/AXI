/**
 * Auto-generated Plugin for HistoryNet: Your Authoritative Source for U.S. &amp; World History
 */
const responseHandler = require("../handlers/responses/auto_historynetyourauthoritativesourceforusampworldhistory");

module.exports = {
  name: "auto_historynetyourauthoritativesourceforusampworldhistory",
  description: "Autonomous handler for HistoryNet: Your Authoritative Source for U.S. &amp; World History",
  intents: {
    "knowledge.dynamic.historynetyourauthoritativesourceforusampworldhistory": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
