/**
 * Auto-generated Legacy Handler for OpenHistoricalMap
 */
const responses = require("./responses/auto_openhistoricalmap");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
