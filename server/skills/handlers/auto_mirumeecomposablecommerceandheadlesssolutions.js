/**
 * Auto-generated Legacy Handler for Mirumee: Composable Commerce and Headless Solutions
 */
const responses = require("./responses/auto_mirumeecomposablecommerceandheadlesssolutions");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
