/**
 * Auto-generated Legacy Handler for Bob Vila
 */
const responses = require("./responses/auto_bobvila");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
