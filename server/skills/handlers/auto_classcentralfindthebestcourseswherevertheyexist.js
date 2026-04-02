/**
 * Auto-generated Legacy Handler for Class Central • Find the best courses, wherever they exist.
 */
const responses = require("./responses/auto_classcentralfindthebestcourseswherevertheyexist");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
