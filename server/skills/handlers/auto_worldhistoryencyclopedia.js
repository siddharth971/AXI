/**
 * Auto-generated Legacy Handler for World History Encyclopedia
 */
const responses = require("./responses/auto_worldhistoryencyclopedia");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
