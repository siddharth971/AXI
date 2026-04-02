/**
 * Auto-generated Legacy Handler for MIT Open Learning brings Online Learning to MIT and the world
 */
const responses = require("./responses/auto_mitopenlearningbringsonlinelearningtomitandtheworld");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
