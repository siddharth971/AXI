/**
 * Auto-generated Legacy Handler for Welcome to nginx!
 */
const responses = require("./responses/auto_welcometonginx");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
