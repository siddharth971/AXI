/**
 * Auto-generated Legacy Handler for Find the best blogs on the web
 */
const responses = require("./responses/auto_findthebestblogsontheweb");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
