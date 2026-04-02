/**
 * Auto-generated Legacy Handler for Hire Vetted Software Developers [Full
 */
const responses = require("./responses/auto_hirevettedsoftwaredevelopersfull");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
