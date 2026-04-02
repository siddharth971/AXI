/**
 * Auto-generated Legacy Handler for World History Matters » A Portal to World History Sites from the Center for History and New Media
 */
const responses = require("./responses/auto_worldhistorymattersaportaltoworldhistorysitesfromthecenterforhistoryandnewmedia");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
