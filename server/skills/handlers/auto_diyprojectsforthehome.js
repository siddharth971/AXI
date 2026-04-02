/**
 * Auto-generated Legacy Handler for DIY Projects for the Home
 */
const responses = require("./responses/auto_diyprojectsforthehome");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
