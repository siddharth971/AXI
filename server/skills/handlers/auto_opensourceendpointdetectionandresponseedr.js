/**
 * Auto-generated Legacy Handler for Open Source Endpoint Detection and Response (EDR)
 */
const responses = require("./responses/auto_opensourceendpointdetectionandresponseedr");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
