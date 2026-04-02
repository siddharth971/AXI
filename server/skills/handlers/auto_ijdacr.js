/**
 * Auto-generated Legacy Handler for IJDACR
 */
const responses = require("./responses/auto_ijdacr");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
