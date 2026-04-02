/**
 * Auto-generated Legacy Handler for Microsoft Source
 */
const responses = require("./responses/auto_microsoftsource");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
