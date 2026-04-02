/**
 * Auto-generated Legacy Handler for LinkedIn: Log In or Sign Up
 */
const responses = require("./responses/auto_linkedinloginorsignup");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
