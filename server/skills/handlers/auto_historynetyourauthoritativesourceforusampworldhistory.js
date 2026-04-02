/**
 * Auto-generated Legacy Handler for HistoryNet: Your Authoritative Source for U.S. &amp; World History
 */
const responses = require("./responses/auto_historynetyourauthoritativesourceforusampworldhistory");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
