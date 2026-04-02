/**
 * Auto-generated Legacy Handler for LFX Insights
 */
const responses = require("./responses/auto_lfxinsights");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
