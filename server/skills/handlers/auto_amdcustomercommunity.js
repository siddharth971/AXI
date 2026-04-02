/**
 * Auto-generated Legacy Handler for AMD Customer Community
 */
const responses = require("./responses/auto_amdcustomercommunity");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
