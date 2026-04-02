/**
 * Auto-generated Legacy Handler for Machine Learning Mastery
 */
const responses = require("./responses/auto_machinelearningmastery");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
