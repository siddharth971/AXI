/**
 * Auto-generated Legacy Handler for GeeksforGeeks
 */
const responses = require("./responses/auto_geeksforgeeks");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
