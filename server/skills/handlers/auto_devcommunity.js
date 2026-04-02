/**
 * Auto-generated Legacy Handler for DEV Community
 */
const responses = require("./responses/auto_devcommunity");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
