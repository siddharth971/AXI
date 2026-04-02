/**
 * Auto-generated Legacy Handler for The Minimalist Vegan
 */
const responses = require("./responses/auto_theminimalistvegan");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
