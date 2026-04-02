/**
 * Auto-generated Legacy Handler for Conscious Life and Style
 */
const responses = require("./responses/auto_consciouslifeandstyle");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
