/**
 * Auto-generated Legacy Handler for Easy Recipes TV
 */
const responses = require("./responses/auto_easyrecipestv");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
