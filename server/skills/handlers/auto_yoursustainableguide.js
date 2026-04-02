/**
 * Auto-generated Legacy Handler for Your Sustainable Guide
 */
const responses = require("./responses/auto_yoursustainableguide");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
