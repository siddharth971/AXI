/**
 * Auto-generated Legacy Handler for Wikipedia
 */
const responses = require("./responses/auto_wikipedia");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
