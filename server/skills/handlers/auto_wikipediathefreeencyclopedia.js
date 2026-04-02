/**
 * Auto-generated Legacy Handler for Wikipedia, the free encyclopedia
 */
const responses = require("./responses/auto_wikipediathefreeencyclopedia");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
