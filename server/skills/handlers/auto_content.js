/**
 * Auto-generated Legacy Handler for Content
 */
const responses = require("./responses/auto_content");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
