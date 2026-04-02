/**
 * Auto-generated Legacy Handler for National University I Earn Your Degree Online
 */
const responses = require("./responses/auto_nationaluniversityiearnyourdegreeonline");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
