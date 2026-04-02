/**
 * Auto-generated Legacy Handler for All About Circuits
 */
const responses = require("./responses/auto_allaboutcircuits");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
