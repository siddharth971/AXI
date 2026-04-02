/**
 * Auto-generated Legacy Handler for The Latest Technology Product Reviews, News, Tips, and Deals
 */
const responses = require("./responses/auto_thelatesttechnologyproductreviewsnewstipsanddeals");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
