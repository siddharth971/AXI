/**
 * Auto-generated Legacy Handler for MENU TIGER
 */
const responses = require("./responses/auto_menutiger");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
