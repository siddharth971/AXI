/**
 * Auto-generated Legacy Handler for Electronic Product Design Services
 */
const responses = require("./responses/auto_electronicproductdesignservices");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
