/**
 * Auto-generated Legacy Handler for High
 */
const responses = require("./responses/auto_high");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
