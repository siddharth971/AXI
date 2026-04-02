/**
 * Auto-generated Legacy Handler for MIT Sloan Management Review
 */
const responses = require("./responses/auto_mitsloanmanagementreview");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
