/**
 * Auto-generated Legacy Handler for Document360: Centralize Your Documentation for Better Self
 */
const responses = require("./responses/auto_document360centralizeyourdocumentationforbetterself");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
