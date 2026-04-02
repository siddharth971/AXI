/**
 * Auto-generated Legacy Handler for Client Challenge
 */
const responses = require("./responses/auto_clientchallenge");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
