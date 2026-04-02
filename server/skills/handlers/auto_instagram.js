/**
 * Auto-generated Legacy Handler for Instagram
 */
const responses = require("./responses/auto_instagram");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
