/**
 * Auto-generated Legacy Handler for Unicorn Platform 🦄  AI Website Builder for Busy Founders
 */
const responses = require("./responses/auto_unicornplatformaiwebsitebuilderforbusyfounders");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
