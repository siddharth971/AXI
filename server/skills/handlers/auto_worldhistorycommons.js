/**
 * Auto-generated Legacy Handler for World History Commons
 */
const responses = require("./responses/auto_worldhistorycommons");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
