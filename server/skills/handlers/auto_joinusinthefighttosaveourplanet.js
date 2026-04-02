/**
 * Auto-generated Legacy Handler for Join Us in the Fight to Save our Planet
 */
const responses = require("./responses/auto_joinusinthefighttosaveourplanet");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
