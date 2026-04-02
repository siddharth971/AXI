/**
 * Auto-generated Legacy Handler for Paligo
 */
const responses = require("./responses/auto_paligo");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
