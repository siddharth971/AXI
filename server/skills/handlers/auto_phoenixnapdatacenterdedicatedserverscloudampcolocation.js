/**
 * Auto-generated Legacy Handler for phoenixNAP: Data Center, Dedicated Servers, Cloud, &amp; Colocation
 */
const responses = require("./responses/auto_phoenixnapdatacenterdedicatedserverscloudampcolocation");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
