/**
 * Auto-generated Legacy Handler for TechTarget
 */
const responses = require("./responses/auto_techtarget");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
