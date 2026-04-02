/**
 * Auto-generated Legacy Handler for Whatfix
 */
const responses = require("./responses/auto_whatfix");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
