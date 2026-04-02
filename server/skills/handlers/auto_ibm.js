/**
 * Auto-generated Legacy Handler for IBM
 */
const responses = require("./responses/auto_ibm");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
