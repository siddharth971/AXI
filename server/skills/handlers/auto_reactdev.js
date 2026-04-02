/**
 * Auto-generated Legacy Handler for react.dev
 */
const responses = require("./responses/auto_reactdev");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
