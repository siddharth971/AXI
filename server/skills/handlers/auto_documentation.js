/**
 * Auto-generated Legacy Handler for documentation
 */
const responses = require("./responses/auto_documentation");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
