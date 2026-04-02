/**
 * Auto-generated Legacy Handler for Custom AI Software Solutions &amp; Development Company
 */
const responses = require("./responses/auto_customaisoftwaresolutionsampdevelopmentcompany");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
