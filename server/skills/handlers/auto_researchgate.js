/**
 * Auto-generated Legacy Handler for ResearchGate
 */
const responses = require("./responses/auto_researchgate");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
