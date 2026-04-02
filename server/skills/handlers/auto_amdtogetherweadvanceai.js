/**
 * Auto-generated Legacy Handler for AMD ׀ together we advance_AI
 */
const responses = require("./responses/auto_amdtogetherweadvanceai");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
