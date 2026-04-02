/**
 * Auto-generated Legacy Handler for Open
 */
const responses = require("./responses/auto_open");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
