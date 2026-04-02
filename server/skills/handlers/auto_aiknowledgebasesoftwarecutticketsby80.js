/**
 * Auto-generated Legacy Handler for AI Knowledge Base Software Cut Tickets by 80%
 */
const responses = require("./responses/auto_aiknowledgebasesoftwarecutticketsby80");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
