/**
 * Auto-generated Legacy Handler for Greener Ideal
 */
const responses = require("./responses/auto_greenerideal");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
