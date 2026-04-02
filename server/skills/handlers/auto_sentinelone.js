/**
 * Auto-generated Legacy Handler for SentinelOne
 */
const responses = require("./responses/auto_sentinelone");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
