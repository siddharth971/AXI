/**
 * Auto-generated Legacy Handler for Home
 */
const responses = require("./responses/auto_home");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
