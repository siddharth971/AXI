/**
 * Auto-generated Legacy Handler for Welcome to The History Junkie
 */
const responses = require("./responses/auto_welcometothehistoryjunkie");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
