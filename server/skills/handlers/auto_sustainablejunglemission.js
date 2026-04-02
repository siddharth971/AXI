/**
 * Auto-generated Legacy Handler for Sustainable Jungle: Mission
 */
const responses = require("./responses/auto_sustainablejunglemission");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
