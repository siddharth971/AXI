/**
 * Auto-generated Legacy Handler for HistoryWorld
 */
const responses = require("./responses/auto_historyworld");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
