/**
 * Auto-generated Legacy Handler for National Institute of Standards and Technology
 */
const responses = require("./responses/auto_nationalinstituteofstandardsandtechnology");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
