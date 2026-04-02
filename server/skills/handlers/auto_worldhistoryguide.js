/**
 * Auto-generated Legacy Handler for World History Guide
 */
const responses = require("./responses/auto_worldhistoryguide");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
