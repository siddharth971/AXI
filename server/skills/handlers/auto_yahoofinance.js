/**
 * Auto-generated Legacy Handler for Yahoo Finance
 */
const responses = require("./responses/auto_yahoofinance");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
