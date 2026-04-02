/**
 * Auto-generated Legacy Handler for Sustainable Living Blog
 */
const responses = require("./responses/auto_sustainablelivingblog");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
