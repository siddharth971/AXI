/**
 * Auto-generated Legacy Handler for Telecom Trainer
 */
const responses = require("./responses/auto_telecomtrainer");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
