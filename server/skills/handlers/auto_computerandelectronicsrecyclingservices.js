/**
 * Auto-generated Legacy Handler for Computer and Electronics Recycling Services
 */
const responses = require("./responses/auto_computerandelectronicsrecyclingservices");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
