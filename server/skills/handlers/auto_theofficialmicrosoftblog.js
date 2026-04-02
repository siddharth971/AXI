/**
 * Auto-generated Legacy Handler for The Official Microsoft Blog
 */
const responses = require("./responses/auto_theofficialmicrosoftblog");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
