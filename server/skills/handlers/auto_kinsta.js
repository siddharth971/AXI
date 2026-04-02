/**
 * Auto-generated Legacy Handler for Kinsta®
 */
const responses = require("./responses/auto_kinsta");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
