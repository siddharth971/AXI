/**
 * Auto-generated Legacy Handler for Site is offline
 */
const responses = require("./responses/auto_siteisoffline");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
