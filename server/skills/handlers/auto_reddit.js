/**
 * Auto-generated Legacy Handler for Reddit
 */
const responses = require("./responses/auto_reddit");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
