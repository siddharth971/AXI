/**
 * Auto-generated Legacy Handler for CIS Center for Internet Security
 */
const responses = require("./responses/auto_ciscenterforinternetsecurity");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
