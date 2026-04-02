/**
 * Auto-generated Legacy Handler for SEO blog by full
 */
const responses = require("./responses/auto_seoblogbyfull");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
