/**
 * Auto-generated Legacy Handler for Torq® AI SOC Platform
 */
const responses = require("./responses/auto_torqaisocplatform");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
