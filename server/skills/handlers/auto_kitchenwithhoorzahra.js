/**
 * Auto-generated Legacy Handler for Kitchen with Hoor Zahra
 */
const responses = require("./responses/auto_kitchenwithhoorzahra");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
