/**
 * Auto-generated Legacy Handler for Flavor365
 */
const responses = require("./responses/auto_flavor365");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
