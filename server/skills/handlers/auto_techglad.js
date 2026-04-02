/**
 * Auto-generated Legacy Handler for TechGlad
 */
const responses = require("./responses/auto_techglad");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
