/**
 * Auto-generated Legacy Handler for The Spruce: Make Your Best Home
 */
const responses = require("./responses/auto_thesprucemakeyourbesthome");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
