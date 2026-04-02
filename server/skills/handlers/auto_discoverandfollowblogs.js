/**
 * Auto-generated Legacy Handler for Discover and Follow Blogs
 */
const responses = require("./responses/auto_discoverandfollowblogs");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
